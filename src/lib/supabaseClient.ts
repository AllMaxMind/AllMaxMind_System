
import { createClient } from '@supabase/supabase-js';
import { getSessionId } from './auth/sessionManager';

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

// Log for debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontrados');
  console.error('[Supabase] VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗ MISSING');
  console.error('[Supabase] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗ MISSING');
}

// Get visitor ID and session ID for headers
const getCustomHeaders = () => {
  if (typeof window === 'undefined') return {};

  const headers: Record<string, string> = {};

  // Visitor ID for analytics
  const vid = localStorage.getItem('am_visitor_id');
  if (vid) {
    headers['x-visitor-id'] = vid;
  }

  // Session ID for anonymous blueprint tracking (P3)
  try {
    const sessionId = getSessionId();
    if (sessionId) {
      headers['x-session-id'] = sessionId;
    }
  } catch (e) {
    // Session manager not initialized yet
  }

  return headers;
};

// Criar cliente - Se env vars faltarem, Supabase vai falhar gracefully nas chamadas
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: getCustomHeaders()
    }
  }
);
