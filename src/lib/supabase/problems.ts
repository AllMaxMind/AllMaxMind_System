
import { supabase } from '../supabaseClient';

export interface ProblemData {
  raw_text: string;
  processed_text: string;
  domain: string;
  persona: string;
  intent_score: number;
  metadata: Record<string, any>;
}

export const saveProblemToSupabase = async (problem: ProblemData): Promise<string> => {
  const visitorId = localStorage.getItem('am_visitor_id');
  const sessionId = sessionStorage.getItem('am_session_id');

  console.log('[Supabase] Salvando problema (NO MOCKS)...');

  const { data: problemData, error: problemError } = await supabase
    .from('problems')
    .insert([{
      visitor_id: visitorId,
      session_id: sessionId,
      raw_text: problem.raw_text,
      processed_text: problem.processed_text,
      domain: problem.domain,
      persona: problem.persona,
      intent_score: problem.intent_score,
      metadata: problem.metadata,
      created_at: new Date().toISOString()
    }])
    .select('id')
    .single();

  if (problemError) {
    console.error('[Supabase Error] Falha CRÍTICA ao inserir problema:', problemError);
    throw new Error(`Erro de Banco de Dados: ${problemError.message}`);
  }

  if (!problemData) {
    throw new Error("Erro desconhecido: Nenhum ID retornado pelo Supabase.");
  }

  return problemData.id;
};
