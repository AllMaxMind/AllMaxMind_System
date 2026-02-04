-- Migration: Extend Blueprints Table with Additional Fields and RLS
-- Story: SPRINT-1-P1 (Blueprint Persistence)
-- Date: 2026-02-03
-- Note: Table blueprints was created in 00005, this migration EXTENDS it

-- ============================================
-- STEP 1: Add missing columns to existing blueprints table
-- ============================================

-- Add session_id if not exists (for anonymous session tracking)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'session_id') THEN
    ALTER TABLE blueprints ADD COLUMN session_id UUID;
  END IF;
END $$;

-- Add user_id for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'user_id') THEN
    ALTER TABLE blueprints ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add email field
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'email') THEN
    ALTER TABLE blueprints ADD COLUMN email VARCHAR(255);
  END IF;
END $$;

-- Add name field
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'name') THEN
    ALTER TABLE blueprints ADD COLUMN name VARCHAR(255);
  END IF;
END $$;

-- Add phone field
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'phone') THEN
    ALTER TABLE blueprints ADD COLUMN phone VARCHAR(20);
  END IF;
END $$;

-- Add company field
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'company') THEN
    ALTER TABLE blueprints ADD COLUMN company VARCHAR(255);
  END IF;
END $$;

-- Add role field (user's job role)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'role') THEN
    ALTER TABLE blueprints ADD COLUMN role VARCHAR(255);
  END IF;
END $$;

-- Add content JSONB field for full blueprint JSON
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'content') THEN
    ALTER TABLE blueprints ADD COLUMN content JSONB;
  END IF;
END $$;

-- Add language field
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'language') THEN
    ALTER TABLE blueprints ADD COLUMN language VARCHAR(10) DEFAULT 'en';
  END IF;
END $$;

-- Add status field
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'status') THEN
    ALTER TABLE blueprints ADD COLUMN status VARCHAR(50) DEFAULT 'generated';
  END IF;
END $$;

-- ============================================
-- STEP 2: Create indexes for new columns
-- ============================================
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_session_id ON blueprints(session_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_status ON blueprints(status);
CREATE INDEX IF NOT EXISTS idx_blueprints_email ON blueprints(email);

-- ============================================
-- STEP 3: Drop existing RLS policies and create new ones
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "session_view_own_blueprints" ON blueprints;
DROP POLICY IF EXISTS "service_role_insert_blueprints" ON blueprints;
DROP POLICY IF EXISTS "user_view_own_blueprints" ON blueprints;
DROP POLICY IF EXISTS "user_insert_blueprints" ON blueprints;
DROP POLICY IF EXISTS "user_update_blueprints" ON blueprints;
DROP POLICY IF EXISTS "admin_view_all_blueprints" ON blueprints;
DROP POLICY IF EXISTS "blueprints_select_policy" ON blueprints;
DROP POLICY IF EXISTS "blueprints_insert_policy" ON blueprints;
DROP POLICY IF EXISTS "blueprints_update_policy" ON blueprints;

-- RLS Policy: Anyone can view blueprints by session_id or user_id
CREATE POLICY "blueprints_select_policy" ON blueprints
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    user_id IS NULL OR
    session_id IS NOT NULL
  );

-- RLS Policy: Anyone can insert blueprints
CREATE POLICY "blueprints_insert_policy" ON blueprints
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Users can update their own blueprints
CREATE POLICY "blueprints_update_policy" ON blueprints
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- STEP 4: Trigger for updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_blueprints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blueprints_updated_at_trigger ON blueprints;
CREATE TRIGGER blueprints_updated_at_trigger
BEFORE UPDATE ON blueprints
FOR EACH ROW
EXECUTE FUNCTION update_blueprints_updated_at();

-- ============================================
-- STEP 5: Create audit log for blueprint saves
-- ============================================
CREATE TABLE IF NOT EXISTS blueprint_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID REFERENCES blueprints(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_audit_blueprint_id ON blueprint_audit_logs(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_audit_created_at ON blueprint_audit_logs(created_at);

-- Enable RLS on audit logs
ALTER TABLE blueprint_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS for audit logs - simplified policy
DROP POLICY IF EXISTS "blueprint_audit_view" ON blueprint_audit_logs;
DROP POLICY IF EXISTS "blueprint_audit_select_policy" ON blueprint_audit_logs;
CREATE POLICY "blueprint_audit_select_policy" ON blueprint_audit_logs
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- STEP 6: Grant permissions
-- ============================================
GRANT SELECT ON blueprints TO authenticated;
GRANT INSERT ON blueprints TO authenticated;
GRANT UPDATE ON blueprints TO authenticated;
GRANT SELECT ON blueprint_audit_logs TO authenticated;

-- Also grant to anon for public access during lead capture
GRANT SELECT, INSERT ON blueprints TO anon;
