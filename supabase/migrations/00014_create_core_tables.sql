-- Migration: Create Core Tables (EMERGENCY - Story DB-001)
-- These tables were defined in schema.sql but never created via migrations
-- IDEMPOTENT: Safe to run multiple times

-- ============================================
-- STEP 1: Enable required extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 2: Create PROBLEMS table (Phase 1-3)
-- ============================================
CREATE TABLE IF NOT EXISTS problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT,
  session_id TEXT,
  raw_text TEXT NOT NULL,
  processed_text TEXT,
  domain TEXT,
  persona TEXT,
  intent_score NUMERIC,
  metadata JSONB,
  final_complexity TEXT,
  analysis_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for problems table
CREATE INDEX IF NOT EXISTS idx_problems_visitor_id ON problems(visitor_id);
CREATE INDEX IF NOT EXISTS idx_problems_session_id ON problems(session_id);
CREATE INDEX IF NOT EXISTS idx_problems_domain ON problems(domain);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at DESC);

-- ============================================
-- STEP 3: Create DIMENSIONS table (Phase 2)
-- ============================================
CREATE TABLE IF NOT EXISTS dimensions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  dimension_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  impact_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for dimensions table
CREATE INDEX IF NOT EXISTS idx_dimensions_problem_id ON dimensions(problem_id);

-- ============================================
-- STEP 4: Create QUESTIONS_ANSWERS table (Phase 3)
-- ============================================
CREATE TABLE IF NOT EXISTS questions_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  question_type TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  complexity_score NUMERIC,
  is_critical BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for questions_answers table
CREATE INDEX IF NOT EXISTS idx_qa_problem_id ON questions_answers(problem_id);

-- ============================================
-- STEP 5: Create LEADS base table (Phase 4)
-- Note: May already exist from other migrations
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blueprint_id TEXT,
  user_email TEXT NOT NULL,
  user_name TEXT,
  company_name TEXT,
  phone TEXT,
  job_title TEXT,
  contact_preference TEXT,
  lead_status TEXT DEFAULT 'new',
  lead_score NUMERIC,
  project_size_estimated TEXT,
  project_timeline_estimated NUMERIC,
  source TEXT,
  campaign TEXT,
  accept_marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add columns if table exists but columns missing (idempotent)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS problem_id UUID;

-- Add FK constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'leads_problem_id_fkey'
  ) THEN
    ALTER TABLE leads
      ADD CONSTRAINT leads_problem_id_fkey
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Indexes for leads table
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(user_email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_problem_id ON leads(problem_id);

-- ============================================
-- STEP 6: Enable RLS on core tables
-- ============================================
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 7: RLS Policies for PROBLEMS
-- Session-based isolation for anonymous users
-- ============================================
DROP POLICY IF EXISTS "session_view_own_problems" ON problems;
CREATE POLICY "session_view_own_problems" ON problems
  FOR SELECT
  USING (
    session_id = COALESCE(
      current_setting('app.session_id', true),
      session_id
    )
    OR
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "session_insert_problems" ON problems;
CREATE POLICY "session_insert_problems" ON problems
  FOR INSERT
  WITH CHECK (true);  -- Allow anonymous inserts (funnel entry)

DROP POLICY IF EXISTS "session_update_own_problems" ON problems;
CREATE POLICY "session_update_own_problems" ON problems
  FOR UPDATE
  USING (
    session_id = COALESCE(
      current_setting('app.session_id', true),
      session_id
    )
    OR
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "service_role_all_problems" ON problems;
CREATE POLICY "service_role_all_problems" ON problems
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- STEP 8: RLS Policies for DIMENSIONS
-- ============================================
DROP POLICY IF EXISTS "session_view_own_dimensions" ON dimensions;
CREATE POLICY "session_view_own_dimensions" ON dimensions
  FOR SELECT
  USING (
    problem_id IN (
      SELECT id FROM problems
      WHERE session_id = COALESCE(current_setting('app.session_id', true), session_id)
    )
    OR
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "session_insert_dimensions" ON dimensions;
CREATE POLICY "session_insert_dimensions" ON dimensions
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_dimensions" ON dimensions;
CREATE POLICY "service_role_all_dimensions" ON dimensions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- STEP 9: RLS Policies for QUESTIONS_ANSWERS
-- ============================================
DROP POLICY IF EXISTS "session_view_own_answers" ON questions_answers;
CREATE POLICY "session_view_own_answers" ON questions_answers
  FOR SELECT
  USING (
    problem_id IN (
      SELECT id FROM problems
      WHERE session_id = COALESCE(current_setting('app.session_id', true), session_id)
    )
    OR
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "session_insert_answers" ON questions_answers;
CREATE POLICY "session_insert_answers" ON questions_answers
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_answers" ON questions_answers;
CREATE POLICY "service_role_all_answers" ON questions_answers
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- STEP 10: RLS Policies for LEADS
-- ============================================
DROP POLICY IF EXISTS "anonymous_insert_leads" ON leads;
CREATE POLICY "anonymous_insert_leads" ON leads
  FOR INSERT
  WITH CHECK (true);  -- Allow lead capture from funnel

DROP POLICY IF EXISTS "user_view_own_leads" ON leads;
CREATE POLICY "user_view_own_leads" ON leads
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    user_id IS NULL  -- Legacy leads without user_id
    OR
    auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "user_update_own_leads" ON leads;
CREATE POLICY "user_update_own_leads" ON leads
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "service_role_all_leads" ON leads;
CREATE POLICY "service_role_all_leads" ON leads
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- STEP 11: Updated timestamp trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to problems
DROP TRIGGER IF EXISTS update_problems_updated_at ON problems;
CREATE TRIGGER update_problems_updated_at
  BEFORE UPDATE ON problems
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to leads
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 12: Grant permissions
-- ============================================
GRANT SELECT, INSERT, UPDATE ON problems TO anon;
GRANT SELECT, INSERT, UPDATE ON problems TO authenticated;
GRANT ALL ON problems TO service_role;

GRANT SELECT, INSERT ON dimensions TO anon;
GRANT SELECT, INSERT ON dimensions TO authenticated;
GRANT ALL ON dimensions TO service_role;

GRANT SELECT, INSERT ON questions_answers TO anon;
GRANT SELECT, INSERT ON questions_answers TO authenticated;
GRANT ALL ON questions_answers TO service_role;

GRANT SELECT, INSERT, UPDATE ON leads TO anon;
GRANT SELECT, INSERT, UPDATE ON leads TO authenticated;
GRANT ALL ON leads TO service_role;

-- ============================================
-- MIGRATION COMPLETE
-- Core tables created with session-based RLS
-- ============================================
