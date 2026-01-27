// ESTE ARQUIVO AGORA É APENAS UM TYPE DEFINITION OU UTILITÁRIO
// A LÓGICA DE CHAMADA DE API FOIMOVIDA PARA SUPABASE EDGE FUNCTIONS
// PARA GARANTIR A SEGURANÇA DAS CHAVES DE API.

export const isAIConfigured = (): boolean => {
  // No frontend, verificamos apenas se temos conexão com o Supabase
  // As chaves do Gemini vivem no servidor
  return !!process.env.VITE_SUPABASE_URL;
};

// Interface mantida para compatibilidade de tipos se necessário em outros lugares
export interface AIRequest {
  systemPrompt: string;
  userPrompt: string;
}
