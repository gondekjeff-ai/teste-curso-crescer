import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
  type: 'contact' | 'subscription';
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const isRateLimited = (ip: string, limit: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (record.count >= limit) {
    return true;
  }
  
  record.count++;
  return false;
};

const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

const sendEmail = async (emailData: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}) => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY not found");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await response.json();
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                    req.headers.get("x-real-ip") || 
                    "unknown";

    // Check rate limiting
    if (isRateLimited(clientIP)) {
      console.log('Rate limit exceeded');
      return new Response(
        JSON.stringify({ error: "Muitas tentativas. Tente novamente mais tarde." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, message, type }: ContactEmailRequest = await req.json();

    // Input validation
    if (!name || !email || (!message && type === 'contact')) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios não preenchidos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedMessage = message ? sanitizeInput(message) : '';

    let emailResponse;

    if (type === 'subscription') {
      // Handle newsletter subscription
      emailResponse = await sendEmail({
        from: "OptiStrat <noreply@resend.dev>",
        to: ["comercial@optistrat.com.br"],
        subject: "Nova Inscrição Newsletter",
        html: `
          <h2>Nova Inscrição Newsletter</h2>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          <p><strong>Nome:</strong> ${sanitizedName}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        `,
      });

      // Send confirmation email to subscriber
      await sendEmail({
        from: "OptiStrat <noreply@resend.dev>",
        to: [sanitizedEmail],
        subject: "Bem-vindo à Newsletter OptiStrat",
        html: `
          <h2>Obrigado por se inscrever!</h2>
          <p>Olá ${sanitizedName},</p>
          <p>Obrigado por se inscrever na nossa newsletter. Manteremos você atualizado com as últimas novidades da OptiStrat.</p>
          <p>Atenciosamente,<br>Equipe OptiStrat</p>
        `,
      });
    } else {
      // Handle contact form
      emailResponse = await sendEmail({
        from: "OptiStrat Contato <noreply@resend.dev>",
        to: ["comercial@optistrat.com.br"],
        subject: `Nova Mensagem de Contato de ${sanitizedName}`,
        html: `
          <h2>Nova Mensagem de Contato</h2>
          <p><strong>Nome:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        `,
      });

      // Send confirmation email to sender
      await sendEmail({
        from: "OptiStrat <noreply@resend.dev>",
        to: [sanitizedEmail],
        subject: "Recebemos sua mensagem",
        html: `
          <h2>Obrigado por entrar em contato!</h2>
          <p>Olá ${sanitizedName},</p>
          <p>Recebemos sua mensagem e entraremos em contato o mais breve possível.</p>
          <p>Atenciosamente,<br>Equipe OptiStrat</p>
        `,
      });
    }

    console.log("Email enviado com sucesso");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro na função send-contact-email");
    return new Response(
      JSON.stringify({ error: "Falha ao enviar email. Tente novamente mais tarde." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);