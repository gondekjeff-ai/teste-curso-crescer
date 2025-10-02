import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, services, implementation_deadline }: OrderEmailRequest = await req.json();

    console.log("Sending order email for:", email);

    const servicesHtml = services.map(s => `<li>${s}</li>`).join('');

    // Email para o comercial
    const commercialEmail = await resend.emails.send({
      from: "OptiStrat <onboarding@resend.dev>",
      to: ["comercial@optistrat.com.br"],
      subject: `Novo Orçamento - ${name}`,
      html: `
        <h2>Novo Pedido de Orçamento</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Serviços de Interesse:</strong></p>
        <ul>${servicesHtml}</ul>
        <p><strong>Prazo de Implantação:</strong> ${implementation_deadline}</p>
      `,
    });

    // Email de confirmação para o cliente
    const clientEmail = await resend.emails.send({
      from: "OptiStrat <onboarding@resend.dev>",
      to: [email],
      subject: "Recebemos seu pedido de orçamento!",
      html: `
        <h1>Obrigado pelo seu interesse, ${name}!</h1>
        <p>Recebemos seu pedido de orçamento e nossa equipe já está analisando.</p>
        <p>Em breve entraremos em contato com uma proposta personalizada.</p>
        <p><strong>Serviços solicitados:</strong></p>
        <ul>${servicesHtml}</ul>
        <p>Atenciosamente,<br>Equipe OptiStrat</p>
      `,
    });

    console.log("Emails sent successfully:", { commercialEmail, clientEmail });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
