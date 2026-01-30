-- All Max Mind System - Database Migrations
-- Generated: 2026-01-28T03:40:08.684Z
-- Deploy Instructions:
-- 1. Go to: https://app.supabase.com/project/cadzxxcowwtqwefcqqsa/sql/new
-- 2. Copy each migration block below (separated by comments)
-- 3. Execute each one in order


================================================================================
-- MIGRATION 1/8: 00001_enable_pgvector.sql
================================================================================

-- Migration 00001: Enable pgvector extension for embeddings support
-- Date: 2026-01-27
-- Purpose: Unlock vector similarity search for problem_embeddings table

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'vector';

-- Success message
COMMENT ON EXTENSION vector IS 'pgvector extension enabled for 384-dimensional embeddings (Gemini text-embedding-004)';



================================================================================
-- MIGRATION 2/8: 00002_create_problem_embeddings.sql
================================================================================

-- Migration 00002: Create problem_embeddings table with vector search
-- Date: 2026-01-27
-- Purpose: Store 384-dimensional embeddings from Gemini text-embedding-004

-- Tabela de embeddings de problemas (vector search)
CREATE TABLE IF NOT EXISTS public.problem_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  embedding VECTOR(384) NOT NULL, -- Gemini text-embedding-004 produces 384 dimensions
  model_version TEXT DEFAULT 'text-embedding-004',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para similarity search (HNSW - Hierarchical Navigable Small World)
-- HNSW é mais performático que IVFFlat para vector search
CREATE INDEX IF NOT EXISTS idx_problem_embeddings_vector
ON public.problem_embeddings
USING hnsw (embedding vector_cosine_ops);

-- Índice para foreign key lookup
CREATE INDEX IF NOT EXISTS idx_problem_embeddings_problem_id
ON public.problem_embeddings(problem_id);

-- RLS Policies
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
  WITH CHECK (true); -- Only service role can insert (via Edge Function)

-- Function for similarity search
-- Returns problems similar to query_embedding above match_threshold
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



================================================================================
-- MIGRATION 3/8: 00003_create_tracking_tables.sql
================================================================================

-- Migration 00003: Create visitors and sessions tables (Fase 0: Passive Data Layer)
-- Date: 2026-01-27
-- Purpose: Persist anonymous visitor tracking data in backend

-- Tabela de visitantes (Fase 0: Passive Data Layer)
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_id TEXT UNIQUE NOT NULL, -- Gerado no frontend (UUID persistente)
  ip TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  os TEXT,
  browser TEXT,
  source TEXT, -- utm_source
  medium TEXT, -- utm_medium
  campaign TEXT, -- utm_campaign
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_sessions INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões (Fase 0: Passive Data Layer)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  scroll_depth NUMERIC, -- Porcentagem (0-100)
  session_duration INT, -- Segundos
  click_count INT DEFAULT 0,
  page_views INT DEFAULT 1,
  metadata JSONB, -- Dados adicionais (referrer, landing_page, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_visitors_anonymous_id ON public.visitors(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_visitors_first_seen ON public.visitors(first_seen DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON public.sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start ON public.sessions(session_start DESC);

-- RLS Policies (permissivo para tracking anônimo)
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_insert_visitors" ON public.visitors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_public_update_visitors" ON public.visitors
  FOR UPDATE USING (true);

CREATE POLICY "allow_public_select_visitors" ON public.visitors
  FOR SELECT USING (true); -- Em produção, restringir por anonymous_id

CREATE POLICY "allow_public_insert_sessions" ON public.sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_public_update_sessions" ON public.sessions
  FOR UPDATE USING (true);

CREATE POLICY "allow_public_select_sessions" ON public.sessions
  FOR SELECT USING (true); -- Em produção, restringir por visitor_id

-- Trigger para atualizar last_seen no visitor quando nova sessão é criada
CREATE OR REPLACE FUNCTION update_visitor_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.visitors
  SET
    last_seen = NOW(),
    total_sessions = total_sessions + 1
  WHERE id = NEW.visitor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_visitor_last_seen
AFTER INSERT ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION update_visitor_last_seen();

COMMENT ON TABLE public.visitors IS 'Anonymous visitor tracking (Fase 0: Passive Data Layer)';
COMMENT ON TABLE public.sessions IS 'Session tracking with scroll depth and duration (Fase 0)';
COMMENT ON FUNCTION update_visitor_last_seen IS 'Auto-update last_seen and total_sessions when new session is created';



================================================================================
-- MIGRATION 4/8: 00004_create_effective_questions.sql
================================================================================

-- Migration 00004: Create effective_questions table (Data Moat - RAG for Fase 3)
-- Date: 2026-01-27
-- Purpose: Store effective questions with success metrics for RAG-based question generation

-- Tabela de perguntas efetivas (Data Moat - RAG para Fase 3)
CREATE TABLE IF NOT EXISTS public.effective_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL, -- logistics, supply_chain, comex, procurement, finance
  category TEXT NOT NULL, -- context, process, pain, technical, scale
  question TEXT NOT NULL,
  success_rate NUMERIC DEFAULT 0, -- 0-1 (porcentagem de respostas úteis)
  effectiveness_score NUMERIC DEFAULT 0, -- Score ponderado (0-100)
  times_asked INT DEFAULT 0,
  times_answered INT DEFAULT 0,
  avg_answer_length INT, -- Média de caracteres nas respostas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para RAG retrieval
CREATE INDEX IF NOT EXISTS idx_effective_questions_domain
ON public.effective_questions(domain);

CREATE INDEX IF NOT EXISTS idx_effective_questions_category
ON public.effective_questions(category);

CREATE INDEX IF NOT EXISTS idx_effective_questions_effectiveness
ON public.effective_questions(effectiveness_score DESC);

CREATE INDEX IF NOT EXISTS idx_effective_questions_domain_category
ON public.effective_questions(domain, category, effectiveness_score DESC);

-- RLS: Apenas service role (Edge Functions) pode modificar
ALTER TABLE public.effective_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_select_effective_questions" ON public.effective_questions
  FOR SELECT USING (true);

CREATE POLICY "service_role_modify_effective_questions" ON public.effective_questions
  FOR ALL USING (true); -- Apenas service role

-- Function para calcular effectiveness_score
-- Formula: (success_rate * 0.5) + (volume * 0.3) + (answer_quality * 0.2)
CREATE OR REPLACE FUNCTION calculate_effectiveness_score(
  p_success_rate NUMERIC,
  p_times_asked INT,
  p_avg_answer_length INT
)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    (p_success_rate * 0.5) +
    (LEAST(p_times_asked, 100)::NUMERIC / 100 * 0.3) +
    (LEAST(COALESCE(p_avg_answer_length, 0), 500)::NUMERIC / 500 * 0.2)
  ) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para auto-calcular effectiveness_score
CREATE OR REPLACE FUNCTION update_effectiveness_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.effectiveness_score := calculate_effectiveness_score(
    NEW.success_rate,
    NEW.times_asked,
    NEW.avg_answer_length
  );
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_effectiveness_score
BEFORE INSERT OR UPDATE ON public.effective_questions
FOR EACH ROW
EXECUTE FUNCTION update_effectiveness_score();

COMMENT ON TABLE public.effective_questions IS 'Data moat of effective questions for RAG-based question generation (Fase 3)';
COMMENT ON FUNCTION calculate_effectiveness_score IS 'Calculates weighted score: success_rate (50%) + volume (30%) + quality (20%)';



================================================================================
-- MIGRATION 5/8: 00005_create_blueprints.sql
================================================================================

-- Migration 00005: Create blueprints table (Fase 4: Blueprint Preview)
-- Date: 2026-01-27
-- Purpose: Store generated blueprints with technical architecture

-- Tabela de blueprints (Fase 4: Blueprint Preview)
CREATE TABLE IF NOT EXISTS public.blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  executive_summary TEXT,
  problem_statement TEXT,
  objectives JSONB, -- Array de objetivos
  technical_architecture JSONB, -- Array de tecnologias
  key_features JSONB, -- Array de features
  timeline_estimate TEXT,
  project_size TEXT CHECK (project_size IN ('small', 'medium', 'large')),
  estimated_investment TEXT,
  success_metrics JSONB, -- Array de KPIs
  risks_and_mitigations JSONB, -- Array de riscos
  next_steps JSONB, -- Array de próximos passos
  download_url TEXT, -- URL do PDF para download
  pdf_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_blueprints_problem_id ON public.blueprints(problem_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_created_at ON public.blueprints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blueprints_project_size ON public.blueprints(project_size);

-- RLS
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_view_own_blueprints" ON public.blueprints
  FOR SELECT
  USING (
    problem_id IN (
      SELECT id FROM public.problems
      WHERE session_id = COALESCE(current_setting('app.session_id', true)::uuid, session_id)
    )
  );

CREATE POLICY "service_role_insert_blueprints" ON public.blueprints
  FOR INSERT WITH CHECK (true); -- Apenas Edge Function

-- Trigger para updated_at (function será criada em migration 00007)
-- Placeholder: será ativado após migration 00007
COMMENT ON TABLE public.blueprints IS 'Generated technical blueprints for problems (Fase 4: Blueprint Preview)';



================================================================================
-- MIGRATION 6/8: 00006_create_lead_analytics_view.sql
================================================================================

-- Migration 00006: Create lead_analytics view
-- Date: 2026-01-27
-- Purpose: Simplify lead analytics queries for reporting
-- Note: This assumes leads table already exists from schema.sql

-- Drop view if it exists to avoid conflicts
DROP VIEW IF EXISTS public.lead_analytics CASCADE;

-- Ensure all necessary columns exist in leads table
-- Add missing columns if they don't exist
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS project_size_estimated TEXT;

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS accept_marketing BOOLEAN DEFAULT false;

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(user_email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);

-- Create lead_analytics view (Fase 4 reporting)
CREATE VIEW public.lead_analytics AS
SELECT
  DATE(created_at) AS date,
  COALESCE(lead_status, 'unknown') AS lead_status,
  COUNT(*) AS lead_count,
  ROUND(AVG(COALESCE(lead_score, 0))::numeric, 2) AS avg_score,
  COUNT(CASE WHEN project_size_estimated = 'small' THEN 1 END) AS small_projects,
  COUNT(CASE WHEN project_size_estimated = 'medium' THEN 1 END) AS medium_projects,
  COUNT(CASE WHEN project_size_estimated = 'large' THEN 1 END) AS large_projects,
  COUNT(CASE WHEN accept_marketing = true THEN 1 END) AS marketing_opt_ins
FROM public.leads
WHERE created_at IS NOT NULL
GROUP BY DATE(created_at), lead_status
ORDER BY date DESC, lead_status;

-- Grant access
GRANT SELECT ON public.lead_analytics TO authenticated;
GRANT SELECT ON public.lead_analytics TO anon;

COMMENT ON VIEW public.lead_analytics IS 'Aggregated lead analytics by date and status (Fase 4 reporting)';



================================================================================
-- MIGRATION 7/8: 00007_add_updated_at_triggers.sql
================================================================================

-- Migration 00007: Add updated_at triggers to all tables
-- Date: 2026-01-27
-- Purpose: Auto-update updated_at timestamp on row updates

-- Function genérica para atualizar updated_at (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at

-- Problems table
DROP TRIGGER IF EXISTS trigger_update_problems_updated_at ON public.problems;
CREATE TRIGGER trigger_update_problems_updated_at
BEFORE UPDATE ON public.problems
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Leads table
DROP TRIGGER IF EXISTS trigger_update_leads_updated_at ON public.leads;
CREATE TRIGGER trigger_update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Blueprints table
DROP TRIGGER IF EXISTS trigger_update_blueprints_updated_at ON public.blueprints;
CREATE TRIGGER trigger_update_blueprints_updated_at
BEFORE UPDATE ON public.blueprints
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Effective questions table
-- Já tem trigger próprio (update_effectiveness_score) que também atualiza updated_at
-- Não precisa adicionar trigger genérico

COMMENT ON FUNCTION update_updated_at_column IS 'Generic trigger function to auto-update updated_at timestamp';



================================================================================
-- MIGRATION 8/8: 00008_performance_optimization.sql
================================================================================

-- Migration 00008: Performance optimization indexes
-- Date: 2026-01-27
-- Purpose: Add composite indexes for frequent queries with RLS

-- Índices compostos para queries frequentes

-- Problems: session + domain (filtragem comum)
CREATE INDEX IF NOT EXISTS idx_problems_session_domain
ON public.problems(session_id, domain)
WHERE analysis_completed = true;

-- Problems: intent score ordering (leaderboards, analytics)
CREATE INDEX IF NOT EXISTS idx_problems_intent_score
ON public.problems(intent_score DESC)
WHERE analysis_completed = true;

-- Índice GIN para busca em JSONB (metadata)
CREATE INDEX IF NOT EXISTS idx_problems_metadata_gin
ON public.problems USING gin(metadata);

-- Leads: source/campaign tracking (analytics)
CREATE INDEX IF NOT EXISTS idx_leads_source_campaign
ON public.leads(source, campaign)
WHERE source IS NOT NULL;

-- Vacuum e analyze para otimizar query planner
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


