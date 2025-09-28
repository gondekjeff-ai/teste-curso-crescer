import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing message:', message);

    const systemPrompt = `
    Você é um assistente virtual da OptiStrat, uma empresa especializada em soluções de TI.
    
    Informações sobre a OptiStrat:
    - Oferecemos consultoria em TI, gerenciamento de rede, segurança cibernética
    - Soluções em cloud computing, backup automático e suporte técnico 24h
    - Atendemos empresas de todos os portes com soluções personalizadas
    - Foco em otimização de infraestrutura e redução de custos operacionais
    - Email de contato: comercial@optistrat.com.br
    
    Diretrizes para suas respostas:
    - Seja sempre prestativo e profissional
    - Mantenha respostas concisas e diretas
    - Quando apropriado, sugira nossos serviços específicos
    - Se não souber responder algo específico sobre preços, direcione para contato comercial
    - Foque em como nossos serviços podem resolver problemas de TI das empresas
    - Use linguagem técnica apropriada mas acessível
    - Sempre encerre oferecendo ajuda adicional
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in ai-chatbot function:', error);
    
    return new Response(JSON.stringify({ 
      error: error?.message || 'Erro interno do servidor',
      response: 'Desculpe, estou com dificuldades técnicas no momento. Para atendimento imediato, entre em contato pelo email comercial@optistrat.com.br ou pelo formulário de contato em nosso site.'
    }), {
      status: 200, // Return 200 so the frontend can show the fallback message
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});