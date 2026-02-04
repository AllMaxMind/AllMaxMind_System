-- Migration: Views Security Invoker (FINAL FIX)
-- Date: 2026-02-01
-- Purpose: Recreate views with SECURITY INVOKER to inherit RLS from base tables
--
-- IMPORTANT LESSON LEARNED:
-- ========================
-- Views in PostgreSQL/Supabase do NOT automatically inherit RLS policies!
-- By default, views use SECURITY DEFINER (runs as view owner, bypasses RLS)
--
-- To make views respect RLS, you MUST use:
--   CREATE VIEW ... WITH (security_invoker = true) AS ...
--
-- This makes the view execute with the permissions of the INVOKER (the user
-- running the query), not the DEFINER (the view owner).
--
-- Also: Use FORCE ROW LEVEL SECURITY on tables to ensure RLS applies even
-- to the table owner.

-- ============================================
-- STEP 1: DROP existing views
-- ============================================
DROP VIEW IF EXISTS lead_summary CASCADE;
DROP VIEW IF EXISTS lead_analytics CASCADE;
DROP VIEW IF EXISTS email_sequence_stats CASCADE;

-- ============================================
-- STEP 2: RECREATE lead_analytics with SECURITY INVOKER
-- ============================================
CREATE VIEW lead_analytics
WITH (security_invoker = true)
AS
SELECT
  DATE(created_at) AS date,
  COALESCE(lead_status, 'unknown') AS lead_status,
  COUNT(*) AS lead_count,
  ROUND(AVG(COALESCE(lead_score, 0))::numeric, 2) AS avg_score,
  COUNT(CASE WHEN project_size_estimated = 'small' THEN 1 END) AS small_projects,
  COUNT(CASE WHEN project_size_estimated = 'medium' THEN 1 END) AS medium_projects,
  COUNT(CASE WHEN project_size_estimated = 'large' THEN 1 END) AS large_projects,
  COUNT(CASE WHEN accept_marketing = true THEN 1 END) AS marketing_opt_ins
FROM leads
WHERE created_at IS NOT NULL
GROUP BY DATE(created_at), lead_status
ORDER BY date DESC, lead_status;

GRANT SELECT ON lead_analytics TO authenticated;
GRANT SELECT ON lead_analytics TO service_role;

-- ============================================
-- STEP 3: RECREATE lead_summary with SECURITY INVOKER
-- ============================================
CREATE VIEW lead_summary
WITH (security_invoker = true)
AS
SELECT
  lead_status,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN engagement_score >= 75 THEN 1 END) as hot_leads_count,
  COUNT(CASE WHEN engagement_score >= 50 AND engagement_score < 75 THEN 1 END) as warm_leads_count,
  COUNT(CASE WHEN engagement_score < 50 OR engagement_score IS NULL THEN 1 END) as cold_leads_count,
  ROUND(AVG(engagement_score)::numeric, 1) as avg_score,
  ROUND((COUNT(CASE WHEN phase5_completed_at IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0))::numeric, 1) as conversion_pct,
  COUNT(CASE WHEN phase5_completed_at IS NOT NULL THEN 1 END) as phase5_completed_count
FROM leads
GROUP BY lead_status;

GRANT SELECT ON lead_summary TO authenticated;
GRANT SELECT ON lead_summary TO service_role;

-- ============================================
-- STEP 4: RECREATE email_sequence_stats with SECURITY INVOKER
-- ============================================
CREATE VIEW email_sequence_stats
WITH (security_invoker = true)
AS
SELECT
  lead_status,
  COUNT(*) as total_sequences,
  COUNT(CASE WHEN is_completed THEN 1 END) as completed_count,
  COUNT(CASE WHEN unsubscribed THEN 1 END) as unsubscribed_count,
  ROUND(AVG(current_email_number)::numeric, 1) as avg_emails_sent,
  ROUND((COUNT(CASE WHEN is_completed THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0))::numeric, 1) as completion_rate_pct
FROM email_sequences
GROUP BY lead_status;

GRANT SELECT ON email_sequence_stats TO authenticated;
GRANT SELECT ON email_sequence_stats TO service_role;

-- ============================================
-- STEP 5: FORCE RLS on tracking tables
-- ============================================
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors FORCE ROW LEVEL SECURITY;

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;

-- ============================================
-- MIGRATION COMPLETE
-- All views now inherit RLS from base tables
-- ============================================
