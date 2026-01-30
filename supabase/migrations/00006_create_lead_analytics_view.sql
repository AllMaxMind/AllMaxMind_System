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
