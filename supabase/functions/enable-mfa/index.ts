import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticator } from "https://esm.sh/otplib@12.0.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnableMFARequest {
  userId: string;
  code: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for secure database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, code }: EnableMFARequest = await req.json();

    // Ensure user is enabling their own MFA
    if (user.id !== userId) {
      console.error('User ID mismatch:', user.id, userId);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate code format
    if (!code || !/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: 'Invalid code format', valid: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verifying MFA code for user:', userId);

    // Fetch the stored MFA secret using service role
    const { data: profile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('mfa_secret')
      .eq('user_id', userId)
      .single();

    if (fetchError || !profile?.mfa_secret) {
      console.error('Error fetching profile or no secret found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'MFA not set up', valid: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the TOTP code server-side
    const isValid = authenticator.verify({ token: code, secret: profile.mfa_secret });

    if (!isValid) {
      console.log('Invalid MFA code provided for user:', userId);
      return new Response(
        JSON.stringify({ valid: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enable MFA for the user
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        mfa_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error enabling MFA:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to enable MFA', valid: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('MFA enabled successfully for user:', userId);

    return new Response(
      JSON.stringify({ valid: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enable-mfa function:', error);
    return new Response(
      JSON.stringify({ error: error.message, valid: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
