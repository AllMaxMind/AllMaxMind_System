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