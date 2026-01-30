-- Migration 00010: Add missing columns to leads table
-- Date: 2026-01-28

-- Add project_timeline_estimated column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'project_timeline_estimated'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN project_timeline_estimated integer;
    COMMENT ON COLUMN public.leads.project_timeline_estimated IS 'Estimated project timeline in days';
  END IF;
END $$;

-- Add project_size_estimated column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'project_size_estimated'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN project_size_estimated text;
    COMMENT ON COLUMN public.leads.project_size_estimated IS 'Estimated project size: small, medium, large';
  END IF;
END $$;
