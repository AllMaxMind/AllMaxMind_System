-- Migration: Secure Analytics Views (Story DB-002 Extension)
-- Implements RLS on analytics views and secures remaining tables
-- IDEMPOTENT: Safe to run multiple times

-- ============================================
-- STEP 1: DROP and RECREATE lead_analytics view with RLS
-- ============================================

-- First, drop dependent views
DROP VIEW IF EXISTS lead_summary CASCADE;
DROP VIEW IF EXISTS lead_analytics CASCADE;

-- ============================================
-- STEP 2: RECREATE lead_analytics view with user isolation
-- ============================================
CREATE OR REPLACE VIEW lead_analytics AS
SELECT
  l.id,
  l.user_id,
  l.lead_status,
  l.engagement_score,
  l.created_at,
  l.user_email,
  l.company_name,
  COUNT(*) OVER (PARTITION BY l.user_id) as total_leads,
  COUNT(CASE WHEN l.lead_status = 'quente' THEN 1 END)
    OVER (PARTITION BY l.user_id) as hot_leads_count,
  COUNT(CASE WHEN l.lead_status = 'acompanhando' THEN 1 END)
    OVER (PARTITION BY l.user_id) as warm_leads_count,
  COUNT(CASE WHEN l.lead_status = 'morno' THEN 1 END)
    OVER (PARTITION BY l.user_id) as cold_leads_count,
  AVG(l.engagement_score) OVER (PARTITION BY l.user_id) as avg_score
FROM leads l
WHERE
  -- User can see their own leads
  l.user_id = auth.uid()
  -- Service role can see all
  OR auth.role() = 'service_role'
  -- Admins can see all
  OR auth.jwt() ->> 'email' LIKE '%@allmax%'
  OR auth.jwt() ->> 'email' LIKE '%@maxmind%';

-- Grant access to the view
GRANT SELECT ON lead_analytics TO authenticated;
GRANT SELECT ON lead_analytics TO anon;
GRANT SELECT ON lead_analytics TO service_role;

-- ============================================
-- STEP 3: RECREATE lead_summary view with user isolation
-- ============================================
CREATE OR REPLACE VIEW lead_summary AS
SELECT
  l.user_id,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN l.lead_status = 'quente' THEN 1 END) as hot_leads_count,
  COUNT(CASE WHEN l.lead_status = 'acompanhando' THEN 1 END) as warm_leads_count,
  COUNT(CASE WHEN l.lead_status = 'morno' THEN 1 END) as cold_leads_count,
  AVG(l.engagement_score) as avg_engagement_score,
  MAX(l.created_at) as last_lead_date,
  MIN(l.created_at) as first_lead_date
FROM leads l
WHERE
  -- User can see summary of their leads
  l.user_id = auth.uid()
  -- Service role can see all
  OR auth.role() = 'service_role'
  -- Admins can see all
  OR auth.jwt() ->> 'email' LIKE '%@allmax%'
  OR auth.jwt() ->> 'email' LIKE '%@maxmind%'
GROUP BY l.user_id;

-- Grant access to the view
GRANT SELECT ON lead_summary TO authenticated;
GRANT SELECT ON lead_summary TO anon;
GRANT SELECT ON lead_summary TO service_role;

-- ============================================
-- STEP 4: Ensure PROBLEMS table RLS is secure
-- ============================================
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "allow_public_insert_problems" ON problems;
DROP POLICY IF EXISTS "allow_public_select_problems" ON problems;
DROP POLICY IF EXISTS "allow_public_update_problems" ON problems;
DROP POLICY IF EXISTS "session_view_own_problems" ON problems;
DROP POLICY IF EXISTS "session_insert_problems" ON problems;
DROP POLICY IF EXISTS "session_update_own_problems" ON problems;
DROP POLICY IF EXISTS "service_role_all_problems" ON problems;

-- New secure policies
CREATE POLICY "session_insert_problems" ON problems
  FOR INSERT
  WITH CHECK (true);  -- Allow anonymous inserts (funnel entry)

CREATE POLICY "session_view_own_problems" ON problems
  FOR SELECT
  USING (
    -- User can view their own problems
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.user_id = auth.uid()
      AND l.id = problems.id
    )
    -- Service role can view all
    OR auth.role() = 'service_role'
  );

CREATE POLICY "service_role_all_problems" ON problems
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- STEP 5: Ensure DIMENSIONS table is secure
-- ============================================
ALTER TABLE dimensions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_insert_dimensions" ON dimensions;
DROP POLICY IF EXISTS "allow_public_select_dimensions" ON dimensions;
DROP POLICY IF EXISTS "session_view_own_dimensions" ON dimensions;
DROP POLICY IF EXISTS "session_insert_dimensions" ON dimensions;
DROP POLICY IF EXISTS "service_role_all_dimensions" ON dimensions;

CREATE POLICY "session_insert_dimensions" ON dimensions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "session_view_own_dimensions" ON dimensions
  FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM problems p
      WHERE p.id = dimensions.problem_id
      AND p.session_id = COALESCE(current_setting('app.session_id', true), '')
    )
  );

CREATE POLICY "service_role_all_dimensions" ON dimensions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- STEP 6: Ensure QUESTIONS_ANSWERS table is secure
-- ============================================
ALTER TABLE questions_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_insert_answers" ON questions_answers;
DROP POLICY IF EXISTS "allow_public_select_answers" ON questions_answers;
DROP POLICY IF EXISTS "session_view_own_answers" ON questions_answers;
DROP POLICY IF EXISTS "session_insert_answers" ON questions_answers;
DROP POLICY IF EXISTS "service_role_all_answers" ON questions_answers;

CREATE POLICY "session_insert_answers" ON questions_answers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "session_view_own_answers" ON questions_answers
  FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM problems p
      WHERE p.id = questions_answers.problem_id
      AND p.session_id = COALESCE(current_setting('app.session_id', true), '')
    )
  );

CREATE POLICY "service_role_all_answers" ON questions_answers
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- STEP 7: Summary of RLS Coverage
-- ============================================
-- Tables WITH RLS:
-- ✓ problems - session/user isolated
-- ✓ dimensions - session/user isolated
-- ✓ questions_answers - session/user isolated
-- ✓ leads - user isolated
-- ✓ lead_interactions - user isolated
-- ✓ email_sequences - user isolated
-- ✓ email_queue - service role only
-- ✓ email_logs - user/email isolated
-- ✓ blueprints - problem isolated
-- ✓ problem_embeddings - problem isolated
-- ✓ visitors - service role or anon (tracking)
-- ✓ sessions - service role or anon (tracking)
--
-- Views WITH RLS (via WHERE clauses):
-- ✓ lead_analytics - user isolated
-- ✓ lead_summary - user isolated
-- ✓ email_sequence_stats - public (no sensitive data)

-- ============================================
-- MIGRATION COMPLETE
-- Full RLS Security Coverage Applied
-- ============================================
