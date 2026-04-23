const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiting (no DB dependency)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                    req.headers.get("x-real-ip") || 
                    "unknown";

    const { endpoint, maxAttempts = 5, windowMinutes = 15 } = await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Endpoint is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const key = `${clientIP}:${endpoint}`;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return new Response(
        JSON.stringify({ allowed: true, remaining: maxAttempts - 1 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (record.count >= maxAttempts) {
      const remainingSeconds = Math.ceil((record.resetTime - now) / 1000);
      return new Response(
        JSON.stringify({ allowed: false, remaining: 0, resetInSeconds: Math.max(remainingSeconds, 0) }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    record.count++;
    return new Response(
      JSON.stringify({ allowed: true, remaining: maxAttempts - record.count }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('Rate limit check error:', error);
    return new Response(
      JSON.stringify({ allowed: true, remaining: 0 }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
