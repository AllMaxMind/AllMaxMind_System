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
