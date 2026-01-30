/**
 * Environment Variables Diagnostic Tool
 * Use this to debug env var loading in browser console
 */

export function debugEnv() {
  console.group('🔍 ENVIRONMENT VARIABLES DIAGNOSIS');

  // Check import.meta.env
  console.log('import.meta.env:',  (import.meta as any).env);

  // Check specific VITE vars
  const viteSupabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
  const viteSupabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  const viteGeminiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

  console.log('VITE_SUPABASE_URL:', viteSupabaseUrl ? '✅ Loaded' : '❌ NOT LOADED');
  console.log('VITE_SUPABASE_ANON_KEY:', viteSupabaseKey ? '✅ Loaded' : '❌ NOT LOADED');
  console.log('VITE_GEMINI_API_KEY:', viteGeminiKey ? '✅ Loaded' : '❌ NOT LOADED');

  // Print actual values (be careful with keys in production)
  if (viteSupabaseUrl) {
    console.log('  → URL:', viteSupabaseUrl.substring(0, 30) + '...');
  }
  if (viteSupabaseKey) {
    console.log('  → Key:', viteSupabaseKey.substring(0, 30) + '...');
  }

  // Check .env.local file presence (from file system)
  console.log('\n.env.local Presence Check:');
  console.log('  → You should have a .env.local file in project root');
  console.log('  → Dev server was restarted:', new Date().getTime());

  console.groupEnd();
}

// Auto-run on page load
if (typeof window !== 'undefined') {
  (window as any).debugEnv = debugEnv;
  console.log('🔧 Diagnostic tool loaded. Call window.debugEnv() in console to check env vars.');
}
