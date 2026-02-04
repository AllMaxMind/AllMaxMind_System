import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.7.0"

// Declare Deno to avoid type errors
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
    const { problemText, language = 'pt-BR' } = await req.json()

    console.log('[improve-problem-text] Received request')
    console.log('[improve-problem-text] Text length:', problemText?.length)
    console.log('[improve-problem-text] Language:', language)

    if (!problemText || problemText.length < 15) {
      throw new Error('Problem text must be at least 15 characters')
    }

    // Get API key from Supabase Secrets (secure)
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    console.log('[improve-problem-text] GEMINI_API_KEY:', apiKey ? '✅ Present' : '❌ MISSING')

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in Supabase Secrets. Please add it via Supabase Dashboard → Project Settings → Secrets')
    }

    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" })

    const isPortuguese = language && language.startsWith('pt')

    const systemPrompt = isPortuguese
      ? `Você é um Analista de Negócios especializado em elicitação de requisitos.

Sua tarefa é transformar uma descrição fragmentada e informal de um problema em uma declaração clara, estruturada e abrangente.

Diretrizes:
1. Preservar a Intenção: Mantenha o significado e as preocupações originais do usuário
2. Adicionar Estrutura: Organize o texto em seções lógicas se necessário
3. Clarificar a Linguagem: Corrija gramática, melhore a clareza, mas mantenha a terminologia de negócios
4. Ser Conciso: Não adicione conteúdo desnecessário - aprimore o que está lá
5. Tom Profissional: Torne adequado para um documento de requisitos técnicos
6. Manter a Realidade: Não invente detalhes não implícitos no texto original

Formato de Saída:
Retorne APENAS o texto da declaração do problema melhorada, sem wrapper JSON, formatação markdown ou comentários adicionais.`
      : `You are an expert Business Analyst specialized in requirements elicitation.

Your task is to take a fragmented, informal problem description from a user and transform it into a clear, structured, and comprehensive problem statement.

Guidelines:
1. Preserve Intent: Maintain the user's original meaning and concerns
2. Add Structure: Organize the text into logical sections if needed
3. Clarify Language: Fix grammar, improve clarity, but keep the business terminology
4. Be Concise: Don't add unnecessary content - enhance what's there
5. Professional Tone: Make it suitable for a technical requirements document
6. Keep it Real: Don't invent details not implied by the original text

Output Format:
Return ONLY the improved problem statement text, without any JSON wrapper, markdown formatting, or additional commentary.`

    const userPrompt = isPortuguese
      ? `Por favor, melhore e estruture a seguinte descrição de problema:

---
${problemText}
---

Lembre-se: Retorne APENAS o texto melhorado, nada mais.`
      : `Please improve and structure the following problem description:

---
${problemText}
---

Remember: Return ONLY the improved text, nothing else.`

    console.log('[improve-problem-text] Calling Gemini API...')

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
    })

    const improvedText = response.response.text()

    if (!improvedText) {
      throw new Error('Empty response from Gemini')
    }

    console.log('[improve-problem-text] ✅ Text improved successfully')
    console.log('[improve-problem-text] Improved text length:', improvedText.length)

    return new Response(JSON.stringify({
      improvedText: improvedText.trim(),
      originalLength: problemText.length,
      improvedLength: improvedText.trim().length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('[improve-problem-text] ❌ Error:', error.message)
    console.error('[improve-problem-text] Error stack:', error.stack)

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
