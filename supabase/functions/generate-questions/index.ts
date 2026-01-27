import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI, Type, Schema } from "npm:@google/genai@^0.1.1"

// Declare Deno to avoid type errors in environment without Deno types
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-visitor-id',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { problemText, dimensions, intentScore } = await req.json()

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('API Key not configured in Supabase Secrets')

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a Senior Technical Diagnostic Consultant.
Your goal is to generate 5 strategic questions to deepen the understanding of the client's problem.

RULES:
1. Questions must be investigative, seeking root causes or technical constraints.
2. Vary categories (Context, Process, Pain, Technical, Scale).
3. Be direct and professional.
4. Generate exactly 5 questions.`

    const userPrompt = `CONTEXT:
- Initial Problem: "${problemText}"
- Affected Dimensions: ${JSON.stringify(dimensions)}
- Intent Score: ${intentScore}`

    const questionsSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING, description: "The question to ask the user." },
              category: { 
                type: Type.STRING, 
                enum: ["context", "process", "pain", "technical", "scale"],
                description: "Question category."
              },
              isCritical: { type: Type.BOOLEAN, description: "If this question is fundamental for scoping." },
              explanation: { type: Type.STRING, description: "Brief explanation of why we are asking this." },
              example: { type: Type.STRING, description: "An example answer to guide the user." }
            },
            required: ["text", "category", "isCritical", "explanation", "example"]
          }
        }
      }
    };

    // Use Gemini 3 Flash for low latency
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: questionsSchema
      }
    });

    const jsonStr = response.text;

    if (!jsonStr) {
      throw new Error("Empty response from AI");
    }

    return new Response(jsonStr, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("Error in generate-questions:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})