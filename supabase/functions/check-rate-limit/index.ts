const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiting (no DB dependency)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// SECURITY: limits are hardcoded server-side per endpoint. Any client-supplied
// maxAttempts/windowMinutes are ignored so callers cannot disable rate limiting.
const LIMITS: Record<string, { maxAttempts: number; windowMs: number }> = {
  login:    { maxAttempts: 5,  windowMs: 15 * 60_000 },
  signup:   { maxAttempts: 5,  windowMs: 60 * 60_000 },
  contact:  { maxAttempts: 5,  windowMs: 60_000 },
  order:    { maxAttempts: 5,  windowMs: 60_000 },
  chatbot:  { maxAttempts: 30, windowMs: 60_000 },
  mfa:      { maxAttempts: 5,  windowMs: 15 * 60_000 },
};
const DEFAULT_LIMIT = { maxAttempts: 10, windowMs: 60_000 };

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

    const body = await req.json().catch(() => ({}));
    const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
    if (!endpoint || endpoint.length > 64) {
      return new Response(
        JSON.stringify({ error: "Valid endpoint is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { maxAttempts, windowMs } = LIMITS[endpoint] ?? DEFAULT_LIMIT;

    const key = `${clientIP}:${endpoint}`;
    const now = Date.now();
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
      JSON.stringify({ allowed: false, remaining: 0, error: "rate_limit_error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
