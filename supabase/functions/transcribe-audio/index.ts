import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.21.0"

// Declare Deno to avoid type errors
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-visitor-id, x-session-id, x-supabase-client-platform, x-supabase-client-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB max

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audioData, mimeType = 'audio/webm', language = 'pt-BR' } = await req.json()

    console.log('[transcribe-audio] Received request')
    console.log('[transcribe-audio] MIME type:', mimeType)
    console.log('[transcribe-audio] Language:', language)
    console.log('[transcribe-audio] Audio data length:', audioData?.length || 0)

    if (!audioData) {
      throw new Error('No audio data provided')
    }

    // Validate audio size (base64 is ~1.33x larger than binary)
    const estimatedSize = (audioData.length * 3) / 4;
    if (estimatedSize > MAX_AUDIO_SIZE) {
      throw new Error(`Audio file too large. Maximum size is ${MAX_AUDIO_SIZE / 1024 / 1024}MB`)
    }

    // Get API key from Supabase Secrets
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    console.log('[transcribe-audio] GEMINI_API_KEY:', apiKey ? '✅ Present' : '❌ MISSING')

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in Supabase Secrets')
    }

    const client = new GoogleGenerativeAI(apiKey)

    // Use Gemini 2.0 Flash which supports audio input
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" })

    const isPortuguese = language && language.startsWith('pt')

    const prompt = isPortuguese
      ? `Transcreva o áudio a seguir para texto.

Instruções:
1. Transcreva exatamente o que foi dito, sem adicionar interpretações
2. Use pontuação apropriada
3. Se houver pausas longas, indique com "..."
4. Se alguma parte estiver inaudível, indique com [inaudível]
5. Retorne APENAS a transcrição, sem comentários adicionais

Transcrição:`
      : `Transcribe the following audio to text.

Instructions:
1. Transcribe exactly what was said, without adding interpretations
2. Use appropriate punctuation
3. If there are long pauses, indicate with "..."
4. If any part is inaudible, indicate with [inaudible]
5. Return ONLY the transcription, without additional comments

Transcription:`

    console.log('[transcribe-audio] Calling Gemini API with audio...')

    // Prepare the audio part for Gemini
    const audioPart = {
      inlineData: {
        data: audioData,
        mimeType: mimeType,
      },
    }

    const response = await model.generateContent([prompt, audioPart])
    const transcribedText = response.response.text()

    if (!transcribedText) {
      throw new Error('Empty response from Gemini')
    }

    console.log('[transcribe-audio] ✅ Audio transcribed successfully')
    console.log('[transcribe-audio] Transcription length:', transcribedText.length)

    return new Response(JSON.stringify({
      transcribedText: transcribedText.trim(),
      language: language,
      audioSize: estimatedSize,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('[transcribe-audio] ❌ Error:', error.message)
    console.error('[transcribe-audio] Error stack:', error.stack)

    // Handle specific error cases
    let statusCode = 500
    let errorMessage = error.message

    if (error.message.includes('too large')) {
      statusCode = 413
    } else if (error.message.includes('No audio data')) {
      statusCode = 400
    } else if (error.message.includes('SAFETY')) {
      errorMessage = 'Audio content was flagged by safety filters'
      statusCode = 422
    }

    return new Response(JSON.stringify({
      error: errorMessage,
      errorType: error.name || 'TranscriptionError',
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
