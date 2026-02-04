import { supabase } from '../supabaseClient';

export interface ProblemData {
  raw_text: string;
}

interface ProblemAnalysisResponse {
  domain: string;
  persona: string;
  intentScore: number;
  emotionalTone: string;
  complexity: string;
  processedText: string;
  keywords: string[];
  embedding: number[];
}

export const analyzeProblemWithEdgeFunction = async (
  problemText: string,
  problemId: string
): Promise<ProblemAnalysisResponse> => {
  try {
    console.log('[Phase1] Calling analyze-problem Edge Function for NLP...');
    console.log('[Phase1] Using problemId:', problemId);

    const { data, error } = await supabase.functions.invoke('analyze-problem', {
      body: {
        problemText: problemText,
        problemId: problemId
      }
    });

    if (error) throw error;
    if (!data) throw new Error('No response from analyze-problem function');

    return data as ProblemAnalysisResponse;
  } catch (error) {
    console.error('[Phase1] Error calling analyze-problem Edge Function:', error);
    throw error;
  }
};

// Cria o problema no banco ANTES de chamar a Edge Function
export const createProblemRecord = async (
  problemText: string
): Promise<string> => {
  const visitorId = localStorage.getItem('am_visitor_id');
  const sessionId = sessionStorage.getItem('am_session_id');

  console.log('[Phase1] Creating problem record in Supabase...');

  const { data, error } = await supabase
    .from('problems')
    .insert([{
      visitor_id: visitorId,
      session_id: sessionId,
      raw_text: problemText,
      analysis_completed: false,
      created_at: new Date().toISOString()
    }])
    .select('id')
    .single();

  if (error) throw error;
  if (!data) throw new Error("Insert failed: No data returned from Supabase");

  console.log('[Phase1] ✅ Problem record created with ID:', data.id);
  return data.id;
};

// Função mantida para compatibilidade - agora apenas retorna o ID já existente
export const saveProblemToSupabase = async (
  problemId: string,
  analysis: ProblemAnalysisResponse
): Promise<string> => {
  try {
    console.log('[Phase1] Problem already saved and analyzed. ID:', problemId);

    // Embedding já foi salvo pela Edge Function, apenas retorna o ID
    return problemId;
  } catch (error) {
    console.error('[Phase1] Error in saveProblemToSupabase:', error);
    throw error;
  }
};

/**
 * Improve problem text using AI via Supabase Edge Function
 * This is the SECURE way to call Gemini - API key stays on server
 */
export interface ImproveTextResponse {
  improvedText: string;
  originalLength: number;
  improvedLength: number;
}

export const improveProblemTextWithAI = async (
  problemText: string,
  language: string = 'pt-BR'
): Promise<string> => {
  try {
    console.log('[Landing] Calling improve-problem-text Edge Function...');
    console.log('[Landing] Text length:', problemText.length);
    console.log('[Landing] Language:', language);

    const { data, error } = await supabase.functions.invoke('improve-problem-text', {
      body: {
        problemText,
        language
      }
    });

    if (error) {
      console.error('[Landing] Edge Function error:', error);
      throw error;
    }

    if (!data || !data.improvedText) {
      throw new Error('No improved text returned from Edge Function');
    }

    console.log('[Landing] ✅ Text improved successfully');
    console.log('[Landing] Original length:', data.originalLength);
    console.log('[Landing] Improved length:', data.improvedLength);

    return data.improvedText;
  } catch (error) {
    console.error('[Landing] Error improving problem text:', error);
    throw error;
  }
};

/**
 * Transcribe audio to text using AI via Supabase Edge Function
 * P2: Audio-to-Text feature
 */
export interface TranscribeAudioResponse {
  transcribedText: string;
  language: string;
  audioSize: number;
}

export const transcribeAudioWithAI = async (
  audioData: string,
  mimeType: string = 'audio/webm',
  language: string = 'pt-BR'
): Promise<string> => {
  try {
    console.log('[Landing] Calling transcribe-audio Edge Function...');
    console.log('[Landing] MIME type:', mimeType);
    console.log('[Landing] Language:', language);
    console.log('[Landing] Audio data length:', audioData.length);

    // Use direct fetch to avoid Supabase client auth state issues
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/transcribe-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        audioData,
        mimeType,
        language
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error('[Landing] Transcription Edge Function error:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.transcribedText) {
      throw new Error('No transcription returned from Edge Function');
    }

    console.log('[Landing] ✅ Audio transcribed successfully');
    console.log('[Landing] Transcription length:', data.transcribedText.length);

    return data.transcribedText;
  } catch (error) {
    console.error('[Landing] Error transcribing audio:', error);
    throw error;
  }
};