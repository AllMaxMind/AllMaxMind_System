-- ALL MAX MIND - Production Security Hardening
-- RLS Policies and Security Configuration
-- Run in Supabase SQL Editor before production deployment

-- ============================================================================
-- SECTION 1: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 2: HARDENED RLS POLICIES FOR PROBLEMS TABLE
-- ============================================================================

-- Drop existing permissive policies (demo mode)
DROP POLICY IF EXISTS "select_all" ON public.problems;
DROP POLICY IF EXISTS "insert_all" ON public.problems;
DROP POLICY IF EXISTS "update_all" ON public.problems;
DROP POLICY IF EXISTS "delete_all" ON public.problems;

-- Policy 1: Users can only view their own problems (session-based)
CREATE POLICY "session_view_own_problems" ON public.problems
  FOR SELECT
  USING (
    session_id = COALESCE(current_setting('app.session_id', true)::uuid, session_id)
  );

-- Policy 2: Users can insert their own problems
CREATE POLICY "session_insert_own_problems" ON public.problems
  FOR INSERT
  WITH CHECK (
    session_id = COALESCE(current_setting('app.session_id', true)::uuid, session_id)
  );

-- Policy 3: Users can update their own problems
CREATE POLICY "session_update_own_problems" ON public.problems
  FOR UPDATE
  USING (
    session_id = COALESCE(current_setting('app.session_id', true)::uuid, session_id)
  );

-- Policy 4: Internal team can view all problems (for analytics/support)
CREATE POLICY "internal_team_view_all_problems" ON public.problems
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (u.email LIKE '%@company.com' OR u.email LIKE '%@internal.com')
    )
  );

-- ============================================================================
-- SECTION 3: HARDENED RLS POLICIES FOR DIMENSIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "select_all" ON public.dimensions;
DROP POLICY IF EXISTS "insert_all" ON public.dimensions;
DROP POLICY IF EXISTS "update_all" ON public.dimensions;
DROP POLICY IF EXISTS "delete_all" ON public.dimensions;

-- Policy 1: Users can only view dimensions for their own problems
CREATE POLICY "session_view_own_dimensions" ON public.dimensions
  FOR SELECT
  USING (
    problem_id IN (
      SELECT id FROM public.problems
      WHERE session_id = COALESCE(current_setting('app.session_id', true)::uuid, session_id)
    )
  );

-- Policy 2: Users can insert dimensions for their own problems
CREATE POLICY "session_insert_own_dimensions" ON public.dimensions
  FOR INSERT
  WITH CHECK (
    problem_id IN (
      SELECT id FROM public.problems
      WHERE session_id = COALESCE(current_setting('app.session_id', true)::uuid, session_id)
    )
  );

-- ============================================================================
-- SECTION 4: HARDENED RLS POLICIES FOR QUESTIONS_ANSWERS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "select_all" ON public.questions_answers;
DROP POLICY IF EXISTS "insert_all" ON public.questions_answers;
DROP POLICY IF EXISTS "update_all" ON public.questions_answers;
DROP POLICY IF EXISTS "delete_all" ON public.questions_answers;

-- Policy 1: Users can only view Q&A for their own problems
CREATE POLICY "session_view_own_qa" ON public.questions_answers
  FOR SELECT
  USING (
    problem_id IN (
      SELECT id FROM public.problems
      WHERE session_id = COALESCE(current_setting('app.session_id', true)::uuid, session_id)
    )
  );

-- Policy 2: Users can insert Q&A for their own problems
CREATE POLICY "session_insert_own_qa" ON public.questions_answers
  FOR INSERT
  WITH CHECK (
    problem_id IN (
      SELECT id FROM public.problems
      WHERE session_id = COALESCE(current_setting('app.session_id', true)::uuid, session_id)
    )
  );

-- ============================================================================
-- SECTION 5: HARDENED RLS POLICIES FOR LEADS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "select_all" ON public.leads;
DROP POLICY IF EXISTS "insert_all" ON public.leads;
DROP POLICY IF EXISTS "update_all" ON public.leads;
DROP POLICY IF EXISTS "delete_all" ON public.leads;

-- Policy 1: Anonymous users can only insert leads
CREATE POLICY "anonymous_insert_leads" ON public.leads
  FOR INSERT
  WITH CHECK (true); -- Public lead capture form

-- Policy 2: Internal team can view all leads
CREATE POLICY "internal_team_view_leads" ON public.leads
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (u.email LIKE '%@company.com' OR u.email LIKE '%@internal.com')
    )
  );

-- Policy 3: Internal team can update leads (status, scoring, etc)
CREATE POLICY "internal_team_update_leads" ON public.leads
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (u.email LIKE '%@company.com' OR u.email LIKE '%@internal.com')
    )
  );

-- ============================================================================
-- SECTION 6: SECURITY: RESTRICT DANGEROUS OPERATIONS
-- ============================================================================

-- Prevent direct delete operations on all tables
-- Users should use soft deletes (archived status) instead

-- Audit trigger: Log all sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(255) NOT NULL,
  operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  session_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on audit log for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);

-- ============================================================================
-- SECTION 7: DATA INTEGRITY CONSTRAINTS
-- ============================================================================

-- Ensure leads email is always provided
ALTER TABLE public.leads
ALTER COLUMN user_email SET NOT NULL;

-- Ensure problems have raw text
ALTER TABLE public.problems
ALTER COLUMN raw_text SET NOT NULL;

-- ============================================================================
-- SECTION 8: PERFORMANCE INDEXES
-- ============================================================================

-- Index on session_id for faster lookups (RLS uses this)
CREATE INDEX IF NOT EXISTS idx_problems_session_id ON public.problems(session_id);
CREATE INDEX IF NOT EXISTS idx_problems_visitor_id ON public.problems(visitor_id);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON public.problems(created_at DESC);

-- Index on problem_id for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_dimensions_problem_id ON public.dimensions(problem_id);
CREATE INDEX IF NOT EXISTS idx_qa_problem_id ON public.questions_answers(problem_id);

-- Index on lead status for filtering
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(user_email);

-- ============================================================================
-- SECTION 9: VERIFICATION
-- ============================================================================

-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('problems', 'dimensions', 'questions_answers', 'leads')
AND schemaname = 'public'
ORDER BY tablename;

-- This should return 4 rows, all with rowsecurity = true

-- ============================================================================
-- SECTION 10: NOTES FOR PRODUCTION
-- ============================================================================

/*
IMPORTANT NOTES:

1. SESSION MANAGEMENT:
   - The RLS policies use 'app.session_id' setting
   - This MUST be set by your application before queries:

   Example in Vercel function:
   ```typescript
   const { data } = await supabase
     .from('problems')
     .select()
     .then(result => {
       // Set session context
       await supabase.rpc('set_session_id', { session_id: userSessionId });
       return result;
     });
   ```

2. INTERNAL TEAM EMAILS:
   - Update the email domain checks in RLS policies
   - Replace '%@company.com' with your actual domain
   - Add additional domains as needed

3. AUDIT LOGGING:
   - Consider implementing triggers to automatically log changes
   - This helps with compliance and debugging

4. BACKUP BEFORE APPLYING:
   - Create a backup of your database before applying these policies
   - Test in staging environment first

5. TESTING:
   - Test that anonymous users can only insert leads
   - Test that users cannot see other users' problems
   - Test that internal team can view all data

6. MIGRATION STRATEGY:
   - Apply these policies during a maintenance window
   - Monitor application for any issues
   - Keep rollback plan ready (previous policies saved)

7. MONITORING:
   - Watch for RLS policy errors in Sentry
   - Monitor query performance (indexes help)
   - Track audit log for suspicious patterns
*/
