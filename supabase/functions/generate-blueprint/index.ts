import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.21.0"

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
    const { problemText, dimensions, answers, complexity } = await req.json()

    console.log('[generate-blueprint] Received request:', {
      problemText: problemText?.substring(0, 50),
      complexity
    })

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured in Supabase Secrets')

    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" })

    const systemInstruction = `You are a Senior Enterprise Solutions Architect.
Create a detailed, viable "Technical Blueprint" to solve the described problem.

GUIDELINES:
1. Be specific with technology suggestions (e.g., use "Supabase + React + n8n" instead of "Database and Frontend").
2. The "timelineEstimate" must be realistic for an MVP.
3. The "estimatedInvestment" should be a range in BRL (Brazilian Real).
4. Return ONLY valid JSON, no markdown or extra text.
`

    const userPrompt = `${systemInstruction}

CLIENT CONTEXT:
- Problem: ${problemText}
- Estimated Complexity: ${complexity}
- Affected Dimensions: ${JSON.stringify(dimensions)}
- Technical Details (Q&A): ${JSON.stringify(answers)}

Return a JSON object with this exact structure:
{
  "title": "A compelling commercial and technical title for the solution",
  "executiveSummary": "High-level executive summary focused on business value",
  "problemStatement": "Refined technical problem statement",
  "objectives": ["objective1", "objective2", "objective3"],
  "technicalArchitecture": ["tech1", "tech2", "tech3"],
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "timelineEstimate": "e.g., '3-4 weeks'",
  "projectSize": "small|medium|large",
  "estimatedInvestment": "e.g., 'R$ 25.000 - R$ 35.000'",
  "successMetrics": ["kpi1", "kpi2", "kpi3"],
  "risksAndMitigations": ["Risk: X -> Mitigation: Y"],
  "nextSteps": ["step1", "step2", "step3"]
}`

    const blueprintSchema = {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "A compelling commercial and technical title for the solution." },
        executiveSummary: { type: "STRING", description: "High-level executive summary focused on business value." },
        problemStatement: { type: "STRING", description: "Refined technical problem statement." },
        objectives: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "List of 3-5 clear objectives."
        },
        technicalArchitecture: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "List of stack technologies and components."
        },
        keyFeatures: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "List of main MVP features."
        },
        timelineEstimate: { type: "STRING", description: "e.g., '3-4 weeks'" },
        projectSize: { type: "STRING", enum: ["small", "medium", "large"] },
        estimatedInvestment: { type: "STRING", description: "e.g., 'R$ 25.000 - R$ 35.000'" },
        successMetrics: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "KPIs to measure success."
        },
        risksAndMitigations: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Format: 'Risk: Explanation -> Mitigation: Action'"
        },
        nextSteps: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Immediate next steps to start the project."
        }
      },
      required: [
        "title", "executiveSummary", "problemStatement", "objectives",
        "technicalArchitecture", "keyFeatures", "timelineEstimate",
        "projectSize", "estimatedInvestment", "successMetrics",
        "risksAndMitigations", "nextSteps"
      ]
    }

    console.log('[generate-blueprint] Calling Gemini API...')

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: blueprintSchema,
      }
    })

    const jsonStr = response.response.text()

    if (!jsonStr) {
      throw new Error("Empty response from AI")
    }

    console.log('[generate-blueprint] ✅ Blueprint generated successfully')

    return new Response(jsonStr, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("[generate-blueprint] Error:", error)
    return new Response(JSON.stringify({
      error: error.message,
      errorType: error.name || 'Unknown'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
