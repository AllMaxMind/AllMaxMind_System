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
