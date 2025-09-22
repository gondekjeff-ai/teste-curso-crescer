import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
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
        JSON.stringify({ error: "Missing required fields" }),
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
        JSON.stringify({ error: "Invalid email format" }),
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
      emailResponse = await resend.emails.send({
        from: "WRLDS Technologies <noreply@resend.dev>",
        to: ["hello@wrlds.com"], // Replace with your actual email
        subject: "New Newsletter Subscription",
        html: `
          <h2>New Newsletter Subscription</h2>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        `,
      });

      // Send confirmation email to subscriber
      await resend.emails.send({
        from: "WRLDS Technologies <noreply@resend.dev>",
        to: [sanitizedEmail],
        subject: "Welcome to WRLDS Newsletter",
        html: `
          <h2>Thank you for subscribing!</h2>
          <p>Hi ${sanitizedName},</p>
          <p>Thank you for subscribing to our newsletter. We'll keep you updated with the latest news from WRLDS Technologies.</p>
          <p>Best regards,<br>The WRLDS Team</p>
        `,
      });
    } else {
      // Handle contact form
      emailResponse = await resend.emails.send({
        from: "WRLDS Contact Form <noreply@resend.dev>",
        to: ["hello@wrlds.com"], // Replace with your actual email
        subject: `New Contact Form Message from ${sanitizedName}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          <p><strong>Message:</strong></p>
          <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        `,
      });

      // Send confirmation email to sender
      await resend.emails.send({
        from: "WRLDS Technologies <noreply@resend.dev>",
        to: [sanitizedEmail],
        subject: "We received your message",
        html: `
          <h2>Thank you for contacting us!</h2>
          <p>Hi ${sanitizedName},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <p>Best regards,<br>The WRLDS Team</p>
        `,
      });
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email. Please try again later." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);