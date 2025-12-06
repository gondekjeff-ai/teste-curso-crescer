import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RateLimitRequest {
  endpoint: string;
  maxAttempts?: number;
  windowMinutes?: number;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get client IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                    req.headers.get("x-real-ip") || 
                    "unknown";

    const { endpoint, maxAttempts = 5, windowMinutes = 15 }: RateLimitRequest = await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Endpoint is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    // Check current rate limit status
    const { data: existingRecord, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip_address', clientIP)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart)
      .order('window_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching rate limit:', fetchError);
      // Allow request on error (fail open for availability)
      return new Response(
        JSON.stringify({ allowed: true, remaining: maxAttempts - 1 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (existingRecord) {
      // Check if rate limit exceeded
      if (existingRecord.request_count >= maxAttempts) {
        const resetTime = new Date(new Date(existingRecord.window_start).getTime() + windowMinutes * 60 * 1000);
        const remainingSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
        
        console.log(`Rate limit exceeded for ${clientIP} on ${endpoint}`);
        
        return new Response(
          JSON.stringify({ 
            allowed: false, 
            remaining: 0,
            resetInSeconds: remainingSeconds > 0 ? remainingSeconds : 0
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Increment count
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({ request_count: existingRecord.request_count + 1 })
        .eq('id', existingRecord.id);

      if (updateError) {
        console.error('Error updating rate limit:', updateError);
      }

      return new Response(
        JSON.stringify({ 
          allowed: true, 
          remaining: maxAttempts - existingRecord.request_count - 1 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('rate_limits')
        .insert({
          ip_address: clientIP,
          endpoint: endpoint,
          request_count: 1,
          window_start: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting rate limit:', insertError);
      }

      return new Response(
        JSON.stringify({ allowed: true, remaining: maxAttempts - 1 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error: any) {
    console.error('Rate limit check error:', error);
    // Fail open for availability
    return new Response(
      JSON.stringify({ allowed: true, remaining: 0 }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
