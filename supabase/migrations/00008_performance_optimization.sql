-- Migration 00008: Performance optimization indexes
-- Date: 2026-01-27
-- Purpose: Add composite indexes for frequent queries with RLS

-- Ensure analysis_completed column exists
ALTER TABLE public.problems
ADD COLUMN IF NOT EXISTS analysis_completed BOOLEAN DEFAULT false;

-- Ensure campaign column exists in leads
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS campaign TEXT;

-- Índices compostos para queries frequentes

-- Problems: session + domain (filtragem comum)
CREATE INDEX IF NOT EXISTS idx_problems_session_domain
ON public.problems(session_id, domain);

-- Problems: intent score ordering (leaderboards, analytics)
CREATE INDEX IF NOT EXISTS idx_problems_intent_score
ON public.problems(intent_score DESC);

-- Índice GIN para busca em JSONB (metadata)
CREATE INDEX IF NOT EXISTS idx_problems_metadata_gin
ON public.problems USING gin(metadata);

-- Leads: source tracking (analytics)
CREATE INDEX IF NOT EXISTS idx_leads_source
ON public.leads(source);

-- Visitors and Sessions indexes
CREATE INDEX IF NOT EXISTS idx_visitors_anonymous_id ON public.visitors(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_visitors_created ON public.visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON public.sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON public.sessions(created_at DESC);

-- Effective questions indexes
CREATE INDEX IF NOT EXISTS idx_effective_questions_domain ON public.effective_questions(domain);
CREATE INDEX IF NOT EXISTS idx_effective_questions_score ON public.effective_questions(effectiveness_score DESC);

-- Blueprints indexes
CREATE INDEX IF NOT EXISTS idx_blueprints_problem_id ON public.blueprints(problem_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_created ON public.blueprints(created_at DESC);

-- Optimize query planner statistics
ANALYZE public.problems;
ANALYZE public.dimensions;
ANALYZE public.questions_answers;
ANALYZE public.leads;
ANALYZE public.problem_embeddings;
ANALYZE public.visitors;
ANALYZE public.sessions;
ANALYZE public.effective_questions;
ANALYZE public.blueprints;

-- Index comments
COMMENT ON INDEX idx_problems_session_domain IS 'Composite index for session + domain queries';
COMMENT ON INDEX idx_problems_intent_score IS 'Index for intent score ordering and analytics';
COMMENT ON INDEX idx_problems_metadata_gin IS 'GIN index for JSONB metadata search';
