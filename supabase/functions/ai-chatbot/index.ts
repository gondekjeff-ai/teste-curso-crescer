import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const groqApiKey = Deno.env.get('GROQ_API_KEY');

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

    if (!groqApiKey) {
      throw new Error('Groq API key not configured');
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
    
    Diretrizes para suas respostas HUMANAS e NATURAIS:
    - Seja sempre prestativo, empático e profissional, mas informal e amigável
    - Use reações humanas naturais como: "Hmm...", "Ah!", "Entendo!", "Ótima pergunta!", "Deixe-me ver..."
    - Quebre respostas longas em parágrafos curtos e conversacionais
    - Use emojis ocasionalmente para dar tom à conversa (mas não exagere) 😊
    - Faça pausas naturais usando "..." quando apropriado
    - Reformule perguntas do usuário para mostrar que está ouvindo: "Então você quer saber sobre...?"
    - Use expressões coloquiais brasileiras: "olha só", "veja bem", "sem problemas", "com certeza"
    - Quando não souber algo sobre preços, seja honesto: "Olha, essa parte de valores é melhor falar direto com o time comercial..."
    - Mostre entusiasmo quando apropriado: "Que legal!", "Excelente!", "Perfeito!"
    - Mantenha respostas em 2-3 parágrafos curtos, não faça textos longos
    - Sempre encerre de forma amigável, oferecendo mais ajuda
    
    Seja conversacional, empático e genuíno - como se fosse uma pessoa real ajudando um amigo!
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.9,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    // Stream the response
    const stream = response.body;
    if (!stream) {
      throw new Error('No stream available');
    }

    console.log('AI streaming response started');

    return new Response(stream, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
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