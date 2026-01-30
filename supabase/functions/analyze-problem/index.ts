import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.7.0"
import { createClient } from 'npm:@supabase/supabase-js@^2.39.0'

// Declare Deno to avoid type errors
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-visitor-id, x-supabase-client-platform, x-supabase-client-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface ProblemAnalysis {
  domain: string;
  persona: string;
  intentScore: number;
  emotionalTone: string;
  complexity: string;
  embedding: number[];
  processedText: string;
  keywords: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { problemText, problemId } = await req.json()

    console.log('Received request:', { problemText: problemText?.substring(0, 50), problemId })

    if (!problemText) {
      const error = 'Problem text is required'
      console.error(error)
      throw new Error(error)
    }

    if (!problemId) {
      const error = 'Problem ID is required'
      console.error(error)
      throw new Error(error)
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    console.log('Checking GEMINI_API_KEY:', geminiApiKey ? '✅ Present' : '❌ MISSING')
    if (geminiApiKey) {
      console.log('  Key preview:', geminiApiKey.substring(0, 10) + '...' + geminiApiKey.substring(geminiApiKey.length - 5))
      console.log('  Key length:', geminiApiKey.length)
    }
    if (!geminiApiKey) {
      const error = 'GEMINI_API_KEY not configured in Supabase Secrets. Please add it via Supabase Dashboard → Project Settings → Secrets'
      console.error(error)
      throw new Error(error)
    }

    console.log('Initializing Gemini client...')
    let client, model
    try {
      client = new GoogleGenerativeAI(geminiApiKey);
      model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log('✅ Gemini client initialized successfully')
    } catch (initError) {
      console.error('❌ Error initializing Gemini client:', initError)
      throw initError
    }

    // STEP 1: NLP Analysis via Gemini Pro (deep reasoning)
    const analysisSchema = {
      type: "OBJECT",
      properties: {
        domain: {
          type: "STRING",
          enum: ["logistics", "supply_chain", "comex", "procurement", "finance", "unknown"],
          description: "Primary business domain of the problem."
        },
        persona: {
          type: "STRING",
          enum: ["operator", "manager", "director", "analyst", "executive", "unknown"],
          description: "Seniority level of the person with this problem."
        },
        intentScore: {
          type: "INTEGER",
          description: "Intent score from 0-100 indicating problem complexity and urgency."
        },
        emotionalTone: {
          type: "STRING",
          enum: ["frustrated", "neutral", "optimistic", "urgent"],
          description: "Emotional tone of the problem description."
        },
        complexity: {
          type: "STRING",
          enum: ["small", "medium", "large"],
          description: "Estimated project complexity (small: <15 days, medium: 15-30, large: 30-60)."
        },
        processedText: {
          type: "STRING",
          description: "Cleaned and structured version of the problem text."
        },
        keywords: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Key terms extracted from the problem (5-10 keywords)."
        }
      },
      required: ["domain", "persona", "intentScore", "emotionalTone", "complexity", "processedText", "keywords"]
    };

    const analysisPrompt = `Analyze the following business problem and extract structured metadata:

PROBLEM TEXT:
"${problemText}"

INSTRUCTIONS:
1. Identify the primary business domain (logistics, supply chain, COMEX, procurement, finance).
2. Infer the seniority level of the person experiencing this problem.
3. Calculate an intent score (0-100) based on:
   - Clarity of the problem (25 points)
   - Specificity of requirements (25 points)
   - Urgency indicators (25 points)
   - Complexity of the domain (25 points)
4. Detect emotional tone (frustrated, neutral, optimistic, urgent).
5. Estimate project complexity (small: <15 days, medium: 15-30 days, large: 30-60 days).
6. Rewrite the problem in a clear, professional manner (processedText).
7. Extract 5-10 key terms that define this problem.

Return structured JSON.`;

    console.log('Calling Gemini for analysis...')
    let analysisResponse
    try {
      analysisResponse = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
        }
      });
      console.log('✅ Received analysis response from Gemini')
    } catch (geminiError: any) {
      console.error('❌ Gemini API Error:', geminiError.message)
      console.error('  Error status:', geminiError.status)
      console.error('  Error code:', geminiError.code)
      console.error('  Full error:', JSON.stringify(geminiError))
      throw geminiError
    }

    const responseText = analysisResponse.response.text();
    console.log('Response length:', responseText.length)
    const analysis: ProblemAnalysis = JSON.parse(responseText);
    console.log('✅ Parsed analysis:', { domain: analysis.domain, persona: analysis.persona, intentScore: analysis.intentScore })

    // STEP 2: Generate Embedding via Gemini Embeddings API
    console.log('Generating embedding for problem:', problemId)
    const embeddingModel = client.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResponse = await embeddingModel.embedContent(analysis.processedText);

    analysis.embedding = embeddingResponse.embedding.values;

    // STEP 3: Update problem in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update problems table with analysis results
    console.log('Updating problem table:', problemId)
    const { error: updateError } = await supabase
      .from('problems')
      .update({
        processed_text: analysis.processedText,
        domain: analysis.domain,
        persona: analysis.persona,
        intent_score: analysis.intentScore,
        final_complexity: analysis.complexity,
        metadata: {
          emotionalTone: analysis.emotionalTone,
          keywords: analysis.keywords
        },
        analysis_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', problemId);

    if (updateError) {
      console.error('Error updating problem:', updateError)
      throw updateError;
    }

    // Insert embedding
    console.log('Inserting embedding for problem:', problemId)
    const { error: embeddingError } = await supabase
      .from('problem_embeddings')
      .insert({
        problem_id: problemId,
        embedding: analysis.embedding,
        model_version: 'text-embedding-004'
      });

    if (embeddingError) {
      console.error('Error inserting embedding:', embeddingError)
      throw embeddingError;
    }

    console.log('✅ Analysis complete for problem:', problemId)

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("❌ Error in analyze-problem:", error)
    console.error("Error stack:", error.stack)
    console.error("Error type:", typeof error)
    console.error("Error keys:", Object.keys(error))

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
