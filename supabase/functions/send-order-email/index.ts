const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OrderEmailRequest {
  name: string;
  email: string;
  services: string[];
  implementation_deadline: string;
  honeypot?: string;
  timestamp?: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const isRateLimited = (ip: string, limit = 5, windowMs = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (record.count >= limit) return true;
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

const sendEmail = async (emailData: { from: string; to: string[]; subject: string; html: string }) => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) throw new Error("RESEND_API_KEY not found");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  return await response.json();
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";

    if (isRateLimited(clientIP)) {
      return new Response(JSON.stringify({ error: "Muitas tentativas. Tente novamente mais tarde." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const { name, email, services, implementation_deadline, honeypot, timestamp }: OrderEmailRequest = await req.json();

    if (honeypot && honeypot.length > 0) {
      return new Response(JSON.stringify({ error: "Requisição inválida" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (timestamp && (Date.now() - timestamp) < 3000) {
      return new Response(JSON.stringify({ error: "Por favor, reserve um momento para revisar antes de enviar." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (!name || !email || !services || !implementation_deadline) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios não preenchidos" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Formato de email inválido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (!Array.isArray(services) || services.length === 0) {
      return new Response(JSON.stringify({ error: "Selecione pelo menos um serviço" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedServices = services.map(s => sanitizeInput(s));
    const sanitizedDeadline = sanitizeInput(implementation_deadline);

    const servicesHtml = sanitizedServices.map(s => `<li>${s}</li>`).join('');

    await sendEmail({
      from: "OptiStrat <noreply@resend.dev>",
      to: ["comercial@optistrat.com.br"],
      subject: `Novo Orçamento - ${sanitizedName}`,
      html: `<h2>Novo Pedido de Orçamento</h2><p><strong>Nome:</strong> ${sanitizedName}</p><p><strong>Email:</strong> ${sanitizedEmail}</p><p><strong>Serviços:</strong></p><ul>${servicesHtml}</ul><p><strong>Prazo:</strong> ${sanitizedDeadline}</p>`,
    });

    await sendEmail({
      from: "OptiStrat <noreply@resend.dev>",
      to: [sanitizedEmail],
      subject: "Recebemos seu pedido de orçamento!",
      html: `<h1>Obrigado, ${sanitizedName}!</h1><p>Recebemos seu pedido de orçamento e nossa equipe já está analisando.</p><p><strong>Serviços solicitados:</strong></p><ul>${servicesHtml}</ul><p>Atenciosamente,<br>Equipe OptiStrat</p>`,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function");
    return new Response(JSON.stringify({ error: "Falha ao enviar email" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
