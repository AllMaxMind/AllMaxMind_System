import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.7.0"
import { createClient } from 'npm:@supabase/supabase-js@^2.39.0'

// Declare Deno to avoid type errors in environment without Deno types
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-visitor-id, x-supabase-client-platform, x-supabase-client-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { problemText, dimensions, intentScore, domain, language = 'en-US' } = await req.json()

    console.log(`[generate-questions] Language: ${language}`)
    console.log('Checking GEMINI_API_KEY for generate-questions...')
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    console.log('API Key:', apiKey ? '✅ Present' : '❌ MISSING')
    if (apiKey) {
      console.log('  Key preview:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5))
      console.log('  Key length:', apiKey.length)
    }
    if (!apiKey) {
      const error = 'GEMINI_API_KEY not configured in Supabase Secrets. Please add it via Supabase Dashboard → Project Settings → Secrets'
      console.error(error)
      throw new Error(error)
    }
    console.log('✅ GEMINI_API_KEY found')

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    // STEP 1: Fetch effective questions from data moat for RAG
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let effectiveQuestionsContext = ''
    if (domain) {
      try {
        const { data: effectiveQuestions } = await supabase
          .from('effective_questions')
          .select('question, category')
          .eq('domain', domain)
          .gte('effectiveness_score', 50) // Apenas perguntas efetivas
          .order('effectiveness_score', { ascending: false })
          .limit(10);

        if (effectiveQuestions && effectiveQuestions.length > 0) {
          effectiveQuestionsContext = `\nREFERENCE QUESTIONS FROM DATA MOAT (use as inspiration):\n${effectiveQuestions.map(q => `- [${q.category}] ${q.question}`).join('\n')}\n`
        }
      } catch (err) {
        console.warn('Could not fetch effective questions:', err)
        // Continue without data moat context
      }
    }

    // STEP 2: Adapt question count based on intent score
    // Low complexity (<30): 3-4 questions
    // Medium complexity (30-70): 5-7 questions
    // High complexity (>70): 8-9 questions
    let questionsCount = 5
    if (intentScore < 30) {
      questionsCount = 4
    } else if (intentScore > 70) {
      questionsCount = 8
    }

    // STEP 3: Generate prompt in appropriate language
    const isPortuguese = language && language.startsWith('pt');

    const userPrompt = isPortuguese
      ? `Você é um Consultor Técnico Sênior em Diagnóstico.
Seu objetivo é gerar ${questionsCount} perguntas estratégicas para aprofundar a compreensão do problema do cliente.

REGRAS:
1. Perguntas devem ser investigativas, buscando raízes ou restrições técnicas.
2. Varie categorias (Contexto, Processo, Dor, Técnico, Escala).
3. Seja direto e profissional.
4. NÃO repita perguntas da lista de referência abaixo.
5. Gere exatamente ${questionsCount} perguntas.
${effectiveQuestionsContext}

CONTEXTO:
- Problema Inicial: "${problemText}"
- Dimensões Afetadas: ${JSON.stringify(dimensions)}
- Intent Score: ${intentScore}

Retorne um objeto JSON com um array "questions".`
      : `You are a Senior Technical Diagnostic Consultant.
Your goal is to generate ${questionsCount} strategic questions to deepen the understanding of the client's problem.

RULES:
1. Questions must be investigative, seeking root causes or technical constraints.
2. Vary categories (Context, Process, Pain, Technical, Scale).
3. Be direct and professional.
4. Do NOT repeat questions from the reference list below.
5. Generate exactly ${questionsCount} questions.
${effectiveQuestionsContext}

CONTEXT:
- Initial Problem: "${problemText}"
- Affected Dimensions: ${JSON.stringify(dimensions)}
- Intent Score: ${intentScore}

Return a JSON object with a "questions" array.`

    const questionsSchema = {
      type: "OBJECT",
      properties: {
        questions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              text: { type: "STRING", description: "The question to ask the user." },
              category: {
                type: "STRING",
                enum: ["context", "process", "pain", "technical", "scale"],
                description: "Question category."
              },
              isCritical: { type: "BOOLEAN", description: "If this question is fundamental for scoping." },
              explanation: { type: "STRING", description: "Brief explanation of why we are asking this." },
              example: { type: "STRING", description: "An example answer to guide the user." }
            },
            required: ["text", "category", "isCritical", "explanation", "example"]
          }
        }
      }
    };

    // Use Gemini Flash for low latency
    console.log('[generate-questions] Calling Gemini API...')
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: questionsSchema,
      }
    });

    const jsonStr = response.response.text();

    if (!jsonStr) {
      throw new Error("Empty response from AI");
    }

    return new Response(jsonStr, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("❌ Error in generate-questions:", error)
    console.error("Error stack:", error.stack)
    console.error("Error type:", typeof error)

    return new Response(JSON.stringify({
      error: error.message,
      errorType: error.name || 'Unknown',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})