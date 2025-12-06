import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  name: string;
  email: string;
  services: string[];
  implementation_deadline: string;
  honeypot?: string;
  timestamp?: number;
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

    const { name, email, services, implementation_deadline, honeypot, timestamp }: OrderEmailRequest = await req.json();

    // Bot detection: Honeypot check
    if (honeypot && honeypot.length > 0) {
      console.log('Bot detected via honeypot');
      return new Response(
        JSON.stringify({ error: "Requisição inválida" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Bot detection: Time-based check (submission should take at least 3 seconds)
    if (timestamp && (Date.now() - timestamp) < 3000) {
      console.log('Bot detected via timestamp check');
      return new Response(
        JSON.stringify({ error: "Por favor, reserve um momento para revisar antes de enviar." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Input validation
    if (!name || !email || !services || !implementation_deadline) {
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

    // Validate services array
    if (!Array.isArray(services) || services.length === 0) {
      return new Response(
        JSON.stringify({ error: "Selecione pelo menos um serviço" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedServices = services.map(s => sanitizeInput(s));
    const sanitizedDeadline = sanitizeInput(implementation_deadline);

    console.log("Processing order email request");

    const servicesHtml = sanitizedServices.map(s => `<li>${s}</li>`).join('');

    // Email para o comercial
    const commercialEmail = await sendEmail({
      from: "OptiStrat <onboarding@resend.dev>",
      to: ["comercial@optistrat.com.br"],
      subject: `Novo Orçamento - ${sanitizedName}`,
      html: `
        <h2>Novo Pedido de Orçamento</h2>
        <p><strong>Nome:</strong> ${sanitizedName}</p>
        <p><strong>Email:</strong> ${sanitizedEmail}</p>
        <p><strong>Serviços de Interesse:</strong></p>
        <ul>${servicesHtml}</ul>
        <p><strong>Prazo de Implantação:</strong> ${sanitizedDeadline}</p>
      `,
    });

    // Email de confirmação para o cliente
    const clientEmail = await sendEmail({
      from: "OptiStrat <onboarding@resend.dev>",
      to: [sanitizedEmail],
      subject: "Recebemos seu pedido de orçamento!",
      html: `
        <h1>Obrigado pelo seu interesse, ${sanitizedName}!</h1>
        <p>Recebemos seu pedido de orçamento e nossa equipe já está analisando.</p>
        <p>Em breve entraremos em contato com uma proposta personalizada.</p>
        <p><strong>Serviços solicitados:</strong></p>
        <ul>${servicesHtml}</ul>
        <p>Atenciosamente,<br>Equipe OptiStrat</p>
      `,
    });

    console.log("Emails sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function");
    return new Response(
      JSON.stringify({ error: "Falha ao enviar email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
