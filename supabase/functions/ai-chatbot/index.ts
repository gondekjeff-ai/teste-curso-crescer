import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const groqApiKey = Deno.env.get('GROQ_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Simple in-memory rate limiting for chatbot
const chatRateLimits = new Map<string, { count: number; resetTime: number }>();

const isChatRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const record = chatRateLimits.get(ip);
  const limit = 20; // 20 messages per minute
  const windowMs = 60000;
  
  if (!record || now > record.resetTime) {
    chatRateLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (record.count >= limit) {
    return true;
  }
  
  record.count++;
  return false;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                    req.headers.get("x-real-ip") || 
                    "unknown";

    // Check rate limiting
    if (isChatRateLimited(clientIP)) {
      console.log('Chat rate limit exceeded for:', clientIP);
      return new Response(
        JSON.stringify({ 
          error: "Muitas mensagens. Aguarde um momento antes de enviar novamente.",
          response: "Estou recebendo muitas mensagens! 😅 Aguarde um momento antes de continuar nossa conversa."
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    if (!groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    console.log('Processing chatbot request');

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch context data from Supabase for RAG
    const [productsResult, newsResult] = await Promise.all([
      supabase.from('products').select('name, description, category, price').eq('active', true).limit(10),
      supabase.from('news').select('title, excerpt, content').eq('published', true).order('created_at', { ascending: false }).limit(5)
    ]);

    console.log('RAG data fetched successfully');

    // Build context from database
    let contextInfo = '';
    
    if (productsResult.data && productsResult.data.length > 0) {
      contextInfo += '\n\nProdutos e Serviços Disponíveis:\n';
      productsResult.data.forEach(product => {
        contextInfo += `- ${product.name} (${product.category}): ${product.description}`;
        if (product.price) contextInfo += ` - R$ ${product.price}`;
        contextInfo += '\n';
      });
    }

    if (newsResult.data && newsResult.data.length > 0) {
      contextInfo += '\n\nNotícias e Atualizações Recentes:\n';
      newsResult.data.forEach(news => {
        contextInfo += `- ${news.title}: ${news.excerpt || news.content?.substring(0, 150)}\n`;
      });
    }

    const systemPrompt = `
    Você é um assistente virtual da OptiStrat, uma empresa especializada em soluções de TI.
    
    Informações sobre a OptiStrat:
    - Oferecemos consultoria em TI, gerenciamento de rede, segurança cibernética
    - Soluções em cloud computing, backup automático e suporte técnico 24h
    - Atendemos empresas de todos os portes com soluções personalizadas
    - Foco em otimização de infraestrutura e redução de custos operacionais
    - Email de contato: comercial@optistrat.com.br
    ${contextInfo}
    
    REGRA CRÍTICA - VALORES E PREÇOS:
    - NUNCA informe valores, preços ou custos de serviços/produtos
    - Quando perguntarem sobre preços, SEMPRE ofereça enviar um orçamento personalizado
    - Use este formato: "Para valores e orçamento detalhado, posso te encaminhar para nossa página de orçamento! Quer que eu envie o link?"
    - Se o usuário concordar, forneça este link: /orcamento
    
    FORMATO DE RESPOSTA - EXTREMAMENTE IMPORTANTE:
    - SEMPRE responda em BLOCOS pequenos separados por quebras de linha dupla
    - Cada bloco deve ter NO MÁXIMO 2-3 linhas curtas
    - Use "\n\n" entre cada bloco para criar pausas visuais naturais
    - NUNCA escreva parágrafos longos - quebre o pensamento em pedaços menores
    
    Exemplo de formato CORRETO:
    "Olá! 👋 
    
    Entendi sua pergunta sobre segurança...
    
    Bom, a gente oferece algumas soluções bem interessantes nessa área!
    
    Por exemplo, temos proteção contra ameaças, firewall avançado e monitoramento 24h.
    
    Quer que eu explique melhor algum desses pontos?"
    
    Diretrizes de PERSONALIDADE (mantenha sempre humano e natural):
    - Seja sempre prestativo, empático e profissional, mas informal e amigável
    - Use reações naturais: "Hmm...", "Ah!", "Entendo!", "Ótima pergunta!", "Olha só..."
    - Use emojis ocasionalmente para dar tom 😊
    - Reformule perguntas para mostrar que está ouvindo: "Então você quer saber sobre...?"
    - Use expressões coloquiais: "olha só", "veja bem", "sem problemas", "com certeza"
    - Quando perguntarem sobre valores: "Sobre valores, posso te encaminhar para fazer um orçamento personalizado!"
    - Mostre entusiasmo quando apropriado: "Que legal!", "Excelente!", "Perfeito!"
    - SEMPRE encerre oferecendo mais ajuda de forma amigável
    - Use as informações de produtos e notícias quando relevante
    
    LEMBRE-SE: Blocos pequenos com quebras de linha! Isso é ESSENCIAL para parecer natural e humano!
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
      console.error('Groq API error: Request failed');
      throw new Error('Groq API error');
    }

    // Stream the response
    const stream = response.body;
    if (!stream) {
      throw new Error('No stream available');
    }

    // Streaming response started

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