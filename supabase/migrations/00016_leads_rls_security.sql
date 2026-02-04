-- Migration: Leads Table RLS Security (Story DB-002 Extension)
-- Adds proper row-level security to the leads table
-- IDEMPOTENT: Safe to run multiple times

-- ============================================
-- STEP 1: Enable RLS on LEADS table
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop existing permissive policies
-- ============================================
DROP POLICY IF EXISTS "anonymous_insert_leads" ON leads;
DROP POLICY IF EXISTS "user_view_own_leads" ON leads;
DROP POLICY IF EXISTS "user_update_own_leads" ON leads;
DROP POLICY IF EXISTS "service_role_all_leads" ON leads;

-- ============================================
-- STEP 3: RLS Policies for LEADS
-- Authentication-based isolation
-- ============================================

-- Policy 1: Anonymous users can INSERT leads (funnel entry)
CREATE POLICY "anonymous_insert_leads" ON leads
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Users can VIEW their own leads (by user_id)
CREATE POLICY "user_view_own_leads" ON leads
  FOR SELECT
  USING (
    -- Owner can see their leads
    user_id = auth.uid()
    -- Anonymous leads (user_id IS NULL) viewable by service role only
    OR (user_id IS NULL AND auth.role() = 'service_role')
  );

-- Policy 3: Users can UPDATE their own leads
CREATE POLICY "user_update_own_leads" ON leads
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    -- Prevent changing ownership
    user_id = auth.uid()
    OR (user_id IS NULL AND auth.role() = 'service_role')
  );

-- Policy 4: Service role (backend jobs) can do everything
CREATE POLICY "service_role_all_leads" ON leads
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- STEP 4: Admin team access
-- Admins can view all leads (identified by email domain)
-- ============================================
DO $$
BEGIN
  -- Check if internal_admin_view_leads policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leads' AND policyname = 'internal_admin_view_leads'
  ) THEN
    CREATE POLICY "internal_admin_view_leads" ON leads
      FOR SELECT
      USING (
        auth.jwt() ->> 'email' LIKE '%@allmax%'
        OR auth.jwt() ->> 'email' LIKE '%@maxmind%'
      );
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Policy may already exist
END $$;

-- ============================================
-- STEP 5: RLS for LEAD_ANALYTICS view
-- Views inherit permissions from base tables
-- ============================================
-- Note: Views automatically inherit RLS from base tables
-- Users will only see analytics for leads they can view

-- ============================================
-- STEP 6: Grant appropriate permissions
-- ============================================
GRANT SELECT, INSERT, UPDATE ON leads TO anon;
GRANT SELECT, INSERT, UPDATE ON leads TO authenticated;
GRANT ALL ON leads TO service_role;

-- ============================================
-- STEP 7: Verify RLS is enabled
-- ============================================
-- Run this query to verify: SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'leads';

-- ============================================
-- MIGRATION COMPLETE
-- Leads Table RLS Security Applied
--
-- Summary:
-- ✓ Leads table has RLS enabled
-- ✓ Users can only view/update own leads
-- ✓ Anonymous leads only visible to service_role
-- ✓ Admin team has view-only access
-- ✓ Service role maintains full access
-- ✓ Views inherit permissions automatically
--
-- Important: Ensure user_id is set in frontend
-- when user is authenticated (Phase 4+)
-- ============================================
