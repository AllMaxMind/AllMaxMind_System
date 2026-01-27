
import { createClient } from '@supabase/supabase-js';

// Safely access environment variables
const getEnvVar = (key: string) => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {}
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('CONFIGURAÇÃO CRÍTICA AUSENTE: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontrados. O sistema não pode conectar ao banco de dados.');
}

// Função para pegar o visitor ID de forma segura para os headers
const getVisitorHeader = () => {
  if (typeof window === 'undefined') return {};
  const vid = localStorage.getItem('am_visitor_id');
  return vid ? { 'x-visitor-id': vid } : {};
};

// Cliente Real apenas - Sem Mocks
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: getVisitorHeader()
  }
});
