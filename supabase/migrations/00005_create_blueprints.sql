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
