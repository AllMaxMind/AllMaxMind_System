-- ============================================================
-- FIX: RLS Policies for Anonymous Access
-- All Max Mind System - Localhost Testing
-- ============================================================
-- IMPORTANTE: Execute isto no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. Disable RLS para tabelas de tracking (TEMPORARY FIX)
-- ============================================================
-- Isso permite que usuários anônimos insiram dados

ALTER TABLE public.visitors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. Criar policies para anon read (se RLS voltar)
-- ============================================================
-- Permite que anon READ dados próprios via session_id

CREATE POLICY "anon_read_own_sessions" ON public.sessions
  FOR SELECT
  USING (true);  -- Temporary: allow all reads

CREATE POLICY "anon_read_own_visitors" ON public.visitors
  FOR SELECT
  USING (true);  -- Temporary: allow all reads

-- ============================================================
-- 3. Criar policies para anon insert
-- ============================================================

CREATE POLICY "anon_insert_sessions" ON public.sessions
  FOR INSERT
  WITH CHECK (true);  -- Allow all inserts

CREATE POLICY "anon_insert_visitors" ON public.visitors
  FOR INSERT
  WITH CHECK (true);  -- Allow all inserts

-- ============================================================
-- 4. Verificar políticas criadas
-- ============================================================
-- SELECT polname, poltype, polroles FROM pg_policies
-- WHERE tablename IN ('sessions', 'visitors');

-- ============================================================
-- 5. Re-enable RLS (AFTER TESTING ONLY)
-- ============================================================
-- Uma vez que tudo funciona, re-enable com policies corretas:
-- ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DONE - Salve agora e teste localhost novamente
-- ============================================================
