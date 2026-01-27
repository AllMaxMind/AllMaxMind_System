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
    const { problemText, dimensions, answers, complexity } = await req.json()

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('API Key not configured in Supabase Secrets')

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a Senior Enterprise Solutions Architect.
Create a detailed, viable "Technical Blueprint" to solve the described problem.

GUIDELINES:
1. Be specific with technology suggestions (e.g., use "Supabase + React + n8n" instead of "Database and Frontend").
2. The "timelineEstimate" must be realistic for an MVP.
3. The "estimatedInvestment" should be a range in BRL (Brazilian Real).
`

    const userPrompt = `CLIENT CONTEXT:
- Problem: ${problemText}
- Estimated Complexity: ${complexity}
- Affected Dimensions: ${JSON.stringify(dimensions)}
- Technical Details (Q&A): ${JSON.stringify(answers)}`

    const blueprintSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A compelling commercial and technical title for the solution." },
        executiveSummary: { type: Type.STRING, description: "High-level executive summary focused on business value." },
        problemStatement: { type: Type.STRING, description: "Refined technical problem statement." },
        objectives: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: "List of 3-5 clear objectives." 
        },
        technicalArchitecture: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: "List of stack technologies and components." 
        },
        keyFeatures: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: "List of main MVP features." 
        },
        timelineEstimate: { type: Type.STRING, description: "e.g., '3-4 weeks'" },
        projectSize: { type: Type.STRING, enum: ["small", "medium", "large"] },
        estimatedInvestment: { type: Type.STRING, description: "e.g., 'R$ 25.000 - R$ 35.000'" },
        successMetrics: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: "KPIs to measure success." 
        },
        risksAndMitigations: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: "Format: 'Risk: Explanation -> Mitigation: Action'" 
        },
        nextSteps: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: "Immediate next steps to start the project." 
        }
      },
      required: [
        "title", "executiveSummary", "problemStatement", "objectives", 
        "technicalArchitecture", "keyFeatures", "timelineEstimate", 
        "projectSize", "estimatedInvestment", "successMetrics", 
        "risksAndMitigations", "nextSteps"
      ]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: blueprintSchema,
        thinkingConfig: { thinkingBudget: 1024 } // Deep reasoning enabled
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
    console.error("Error in generate-blueprint:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})