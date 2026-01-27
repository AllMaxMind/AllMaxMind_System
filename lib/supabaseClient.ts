import { createClient } from '@supabase/supabase-js';

// Safely access environment variables to support both Vite (browser) and Node (scripts/server)
const getEnvVar = (key: string) => {
  try {
    // Vite / Modern Browsers
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
    // Node.js / Webpack
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    console.warn(`Error accessing env var ${key}`, e);
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Função para pegar o visitor ID de forma segura para os headers
const getVisitorHeader = () => {
  if (typeof window === 'undefined') return {};
  const vid = localStorage.getItem('am_visitor_id');
  return vid ? { 'x-visitor-id': vid } : {};
};

// Cliente Real
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: getVisitorHeader()
      }
    })
  : createMockClient();

// Fallback Mock para desenvolvimento sem chaves
function createMockClient() {
  console.warn('⚠️ Supabase não configurado ou chaves ausentes. Usando Mock Client.');
  const mockChain = () => ({
    select: () => mockChain(),
    insert: () => mockChain(),
    update: () => mockChain(),
    eq: () => mockChain(),
    single: () => mockChain(),
    limit: () => mockChain(),
    order: () => mockChain(),
    then: (resolve: any) => Promise.resolve({ 
      data: { id: `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}` }, 
      error: null 
    }).then(resolve),
    invoke: () => Promise.resolve({ data: { message: "Mock Success" }, error: null })
  });
  return { 
    from: () => mockChain(),
    functions: { invoke: () => Promise.resolve({ data: { message: "Mock Success" }, error: null }) },
    auth: { 
      signInWithOAuth: () => Promise.resolve({ error: null }),
      signInWithOtp: () => Promise.resolve({ error: null })
    }
  } as any;
}