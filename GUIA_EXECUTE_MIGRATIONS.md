# 🚀 Guia Executar Migrations (Passo a Passo)

**Data:** 2026-01-28
**Status:** ✅ Todas 8 migrations CORRIGIDAS e prontas

---

## 📋 Quick Setup

```
Arquivo: MIGRATIONS_CLEAN.sql (abra este arquivo)
Link: https://app.supabase.com/project/cadzxxcowwtqwefcqqsa/sql/new
Ordem: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
```

---

## 🔴 MIGRATION 1/8: Enable pgvector (FIZ OK? ✅)

**Status:** Já passou? Se SIM, pule para MIGRATION 2

**SQL para copiar:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;

SELECT extname, extversion
FROM pg_extension
WHERE extname = 'vector';

COMMENT ON EXTENSION vector IS 'pgvector extension enabled for 384-dimensional embeddings (Gemini text-embedding-004)';
```

**Steps:**
1. Copie o SQL acima
2. Paste no Supabase SQL Editor
3. Click "Run"
4. Esperado: Retorna `vector | 0.7.0` (ou versão similar)
5. ✅ DONE → Próxima!

---

## 🟠 MIGRATION 2/8: Create problem_embeddings (⭐ CORRIGIDA!)

**Status:** ❌ Erro anterior → ✅ CORRIGIDA

**Mudança Principal (linha 59):**
```diff
- WHERE session_id = COALESCE(current_setting('app.session_id', true)::uuid, session_id)
+ WHERE session_id::text = COALESCE(current_setting('app.session_id', true), session_id::text)
```

**SQL para copiar:**
```sql
CREATE TABLE IF NOT EXISTS public.problem_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  embedding VECTOR(384) NOT NULL,
  model_version TEXT DEFAULT 'text-embedding-004',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problem_embeddings_vector
ON public.problem_embeddings
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_problem_embeddings_problem_id
ON public.problem_embeddings(problem_id);

ALTER TABLE public.problem_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_view_own_embeddings" ON public.problem_embeddings
  FOR SELECT
  USING (
    problem_id IN (
      SELECT id FROM public.problems
      WHERE session_id::text = COALESCE(current_setting('app.session_id', true), session_id::text)
    )
  );

CREATE POLICY "service_role_insert_embeddings" ON public.problem_embeddings
  FOR INSERT
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION match_problems(
  query_embedding VECTOR(384),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  problem_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.problem_id,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM public.problem_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON TABLE public.problem_embeddings IS 'Vector embeddings for similarity search (384d from Gemini text-embedding-004)';
COMMENT ON FUNCTION match_problems IS 'Find similar problems using cosine similarity (pgvector <=> operator)';
```

**Steps:**
1. Copie o SQL acima (CORRIGIDO)
2. Paste no Supabase SQL Editor
3. Click "Run"
4. ✅ DONE → Próxima!

---

## 🟡 MIGRATION 3/8: Create tracking tables

**SQL para copiar:**
```sql
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_id TEXT UNIQUE NOT NULL,
  ip TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  os TEXT,
  browser TEXT,
  browser_version TEXT,
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  language TEXT,
  timezone TEXT,
  screen_resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_sessions INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  visitor_id TEXT NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  scroll_depth NUMERIC,
  session_duration INT,
  click_count INT DEFAULT 0,
  page_views INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_anonymous_id ON public.visitors(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_visitors_first_seen ON public.visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON public.sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start ON public.sessions(session_start DESC);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_insert_visitors" ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_public_update_visitors" ON public.visitors FOR UPDATE USING (true);
CREATE POLICY "allow_public_insert_sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_public_update_sessions" ON public.sessions FOR UPDATE USING (true);
```

**Steps:**
1. Copie o SQL
2. Paste e Execute
3. ✅ DONE → Próxima!

---

## 🟢 MIGRATION 4/8: Create effective_questions (RAG Data Moat)

**SQL para copiar:**
```sql
CREATE TABLE IF NOT EXISTS public.effective_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  success_rate NUMERIC DEFAULT 0.5,
  effectiveness_score NUMERIC DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_effective_questions_domain ON public.effective_questions(domain);
CREATE INDEX IF NOT EXISTS idx_effective_questions_score ON public.effective_questions(effectiveness_score DESC);

ALTER TABLE public.effective_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_effective_questions" ON public.effective_questions FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION calculate_effectiveness_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.effectiveness_score = (
    (NEW.success_rate * 0.5) +
    ((COALESCE((SELECT COUNT(*) FROM public.questions_answers WHERE question_id = NEW.id), 0) / 100.0) * 0.3) +
    (0.2)
  ) * 100;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_effectiveness_score
BEFORE INSERT OR UPDATE ON public.effective_questions
FOR EACH ROW
EXECUTE FUNCTION calculate_effectiveness_score();

COMMENT ON TABLE public.effective_questions IS 'Data moat: Repository of effective questions used in RAG (Retrieval Augmented Generation)';
COMMENT ON FUNCTION calculate_effectiveness_score IS 'Auto-calculate effectiveness score based on success rate and usage';
```

**Steps:**
1. Copie e Execute
2. ✅ DONE → Próxima!

---

## 🔵 MIGRATION 5/8: Create blueprints

**SQL para copiar:**
```sql
CREATE TABLE IF NOT EXISTS public.blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  executive_summary TEXT,
  problem_statement TEXT,
  objectives JSONB,
  technical_architecture JSONB,
  key_features JSONB,
  timeline_estimate TEXT,
  project_size TEXT,
  estimated_investment TEXT,
  success_metrics JSONB,
  risks_and_mitigations JSONB,
  next_steps JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blueprints_problem_id ON public.blueprints(problem_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_created ON public.blueprints(created_at DESC);

ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_own_blueprints" ON public.blueprints
  FOR SELECT
  USING (
    problem_id IN (
      SELECT id FROM public.problems
      WHERE session_id = COALESCE(current_setting('app.session_id', true)::text, session_id)
    )
  );

COMMENT ON TABLE public.blueprints IS 'Technical blueprints generated from problem analysis (Fase 4)';
```

**Steps:**
1. Copie e Execute
2. ✅ DONE → Próxima!

---

## 🟣 MIGRATION 6/8: Create lead_analytics view

**SQL para copiar:**
```sql
CREATE OR REPLACE VIEW public.lead_analytics AS
SELECT
  DATE(created_at) AS date,
  lead_status,
  COUNT(*) AS lead_count,
  AVG(lead_score) AS avg_score,
  COUNT(CASE WHEN project_size_estimated = 'small' THEN 1 END) AS small_projects,
  COUNT(CASE WHEN project_size_estimated = 'medium' THEN 1 END) AS medium_projects,
  COUNT(CASE WHEN project_size_estimated = 'large' THEN 1 END) AS large_projects,
  COUNT(CASE WHEN accept_marketing = true THEN 1 END) AS marketing_opt_ins
FROM public.leads
GROUP BY DATE(created_at), lead_status
ORDER BY date DESC, lead_status;

GRANT SELECT ON public.lead_analytics TO authenticated;
GRANT SELECT ON public.lead_analytics TO anon;

COMMENT ON VIEW public.lead_analytics IS 'Aggregated lead analytics by date and status (Fase 4 reporting)';
```

**Steps:**
1. Copie e Execute
2. ✅ DONE → Próxima!

---

## 🎨 MIGRATION 7/8: Add updated_at triggers

**SQL para copiar:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_problems_updated_at ON public.problems;
CREATE TRIGGER trigger_update_problems_updated_at
BEFORE UPDATE ON public.problems
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_leads_updated_at ON public.leads;
CREATE TRIGGER trigger_update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_blueprints_updated_at ON public.blueprints;
CREATE TRIGGER trigger_update_blueprints_updated_at
BEFORE UPDATE ON public.blueprints
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON FUNCTION update_updated_at_column IS 'Generic trigger function to auto-update updated_at timestamp';
```

**Steps:**
1. Copie e Execute
2. ✅ DONE → Próxima!

---

## ⚡ MIGRATION 8/8: Performance optimization (ÚLTIMA!)

**SQL para copiar:**
```sql
CREATE INDEX IF NOT EXISTS idx_problems_session_domain
ON public.problems(session_id, domain)
WHERE analysis_completed = true;

CREATE INDEX IF NOT EXISTS idx_problems_intent_score
ON public.problems(intent_score DESC)
WHERE analysis_completed = true;

CREATE INDEX IF NOT EXISTS idx_problems_metadata_gin
ON public.problems USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_leads_source_campaign
ON public.leads(source, campaign)
WHERE source IS NOT NULL;

VACUUM ANALYZE public.problems;
VACUUM ANALYZE public.dimensions;
VACUUM ANALYZE public.questions_answers;
VACUUM ANALYZE public.leads;
VACUUM ANALYZE public.problem_embeddings;
VACUUM ANALYZE public.visitors;
VACUUM ANALYZE public.sessions;
VACUUM ANALYZE public.effective_questions;
VACUUM ANALYZE public.blueprints;

COMMENT ON INDEX idx_problems_session_domain IS 'Composite index for RLS-filtered queries (session + domain)';
COMMENT ON INDEX idx_problems_intent_score IS 'Partial index for high-intent problems (analytics)';
COMMENT ON INDEX idx_problems_metadata_gin IS 'GIN index for JSONB metadata search';
```

**Steps:**
1. Copie e Execute
2. ✅ DONE → TODAS AS 8 COMPLETAS! 🎉

---

## ✅ Checklist Final

- [ ] MIGRATION 1 ✅
- [ ] MIGRATION 2 ✅ (CORRIGIDA)
- [ ] MIGRATION 3 ✅
- [ ] MIGRATION 4 ✅
- [ ] MIGRATION 5 ✅
- [ ] MIGRATION 6 ✅
- [ ] MIGRATION 7 ✅
- [ ] MIGRATION 8 ✅

Se todas forem ✅, **próximo passo:**
```bash
npm run dev
# Abre localhost:5173
```

---

**Quer que eu inicie o dev server agora?** 🚀
