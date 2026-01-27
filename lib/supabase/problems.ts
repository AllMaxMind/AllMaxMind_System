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
  try {
    const visitorId = localStorage.getItem('am_visitor_id');
    const sessionId = sessionStorage.getItem('am_session_id');

    // 1. Salvar problema principal
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

    if (problemError) throw problemError;
    if (!problemData) throw new Error("Insert failed: No data returned from Supabase");

    // 2. Gerar embedding (simplificado - na prática usar Supabase Vector ou API)
    const embedding = generateBasicEmbedding(problem.raw_text);
    
    // Tentativa de salvar embedding (pode falhar se tabela não existir ainda)
    const { error: embeddingError } = await supabase
      .from('problem_embeddings')
      .insert([{
        problem_id: problemData.id,
        embedding: embedding,
        created_at: new Date().toISOString()
      }]);

    if (embeddingError) {
      console.warn('[Phase1] Embedding save warning (tables might be missing):', embeddingError.message);
      // Não falhar se embedding falhar, pois o problema foi salvo
    }

    return problemData.id;
  } catch (error) {
    console.error('[Phase1] Error saving to Supabase:', error);
    
    // Fallback: salvar localmente se Supabase falhar ou estiver offline
    const fallbackId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const localData = {
      ...problem,
      id: fallbackId,
      saved_locally: true,
      timestamp: new Date().toISOString()
    };
    
    try {
        localStorage.setItem(`problem_${fallbackId}`, JSON.stringify(localData));
        // Also keep a list of local problems
        const list = JSON.parse(localStorage.getItem('am_local_problems') || '[]');
        list.push(fallbackId);
        localStorage.setItem('am_local_problems', JSON.stringify(list));
    } catch (e) {
        console.error('Local storage full or disabled', e);
    }
    
    return fallbackId;
  }
};

// Função auxiliar para embedding básico (simplificado)
// Em produção, isso seria substituído por uma chamada real à API de embeddings (Gemini/OpenAI)
const generateBasicEmbedding = (text: string): number[] => {
  const embedding = new Array(384).fill(0);
  const words = text.toLowerCase().split(/\s+/).slice(0, 50);
  
  // Simulação básica de embedding determinístico para testes
  words.forEach((word, index) => {
    if (index < embedding.length) {
      // Gera um valor baseado nos códigos de char para simular vetor
      let val = 0;
      for (let i = 0; i < word.length; i++) val += word.charCodeAt(i);
      embedding[index] = (val % 100) / 100; 
    }
  });
  
  return embedding;
};