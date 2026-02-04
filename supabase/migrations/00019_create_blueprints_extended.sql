-- Migration: Create Extended Blueprints Table with RLS
-- Story: SPRINT-1-P1 (Blueprint Persistence)
-- Date: 2026-02-03

-- Create blueprints table with all required fields
CREATE TABLE IF NOT EXISTS blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  role VARCHAR(255),
  content JSONB NOT NULL, -- Full blueprint JSON
  language VARCHAR(10) DEFAULT 'en', -- 'en' | 'pt-BR'
  status VARCHAR(50) DEFAULT 'generated', -- 'generated' | 'sent' | 'opened'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_status CHECK (status IN ('generated', 'sent', 'opened')),
  CONSTRAINT valid_language CHECK (language IN ('en', 'pt-BR'))
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_session_id ON blueprints(session_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_status ON blueprints(status);
CREATE INDEX IF NOT EXISTS idx_blueprints_created_at ON blueprints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blueprints_email ON blueprints(email);

-- Enable RLS on blueprints table
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;

-- RLS Policy: User can view own blueprints
CREATE POLICY user_view_own_blueprints ON blueprints
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );

-- RLS Policy: User can insert own blueprints (initially null user_id for anon)
CREATE POLICY user_insert_blueprints ON blueprints
  FOR INSERT
  WITH CHECK (
    (user_id IS NULL AND session_id IS NOT NULL) OR
    (user_id = auth.uid())
  );

-- RLS Policy: User can update own blueprints
CREATE POLICY user_update_blueprints ON blueprints
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );

-- RLS Policy: Admin can view all blueprints
CREATE POLICY admin_view_all_blueprints ON blueprints
  FOR SELECT
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_blueprints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blueprints_updated_at_trigger
BEFORE UPDATE ON blueprints
FOR EACH ROW
EXECUTE FUNCTION update_blueprints_updated_at();

-- Create audit log for blueprint saves (for compliance)
CREATE TABLE IF NOT EXISTS blueprint_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID REFERENCES blueprints(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_audit_blueprint_id ON blueprint_audit_logs(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_audit_created_at ON blueprint_audit_logs(created_at);

-- Enable RLS on audit logs
ALTER TABLE blueprint_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS: User can view own audit logs, admin sees all
CREATE POLICY blueprint_audit_view ON blueprint_audit_logs
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );

-- Trigger to log blueprint changes
CREATE OR REPLACE FUNCTION audit_blueprint_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO blueprint_audit_logs (blueprint_id, action, user_id, session_id, changes)
    VALUES (NEW.id, 'created', auth.uid(), NEW.session_id, row_to_json(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO blueprint_audit_logs (blueprint_id, action, user_id, session_id, changes)
    VALUES (NEW.id, 'updated', auth.uid(), NEW.session_id, jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO blueprint_audit_logs (blueprint_id, action, user_id, session_id, changes)
    VALUES (OLD.id, 'deleted', auth.uid(), OLD.session_id, row_to_json(OLD));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_blueprints_trigger
AFTER INSERT OR UPDATE OR DELETE ON blueprints
FOR EACH ROW
EXECUTE FUNCTION audit_blueprint_changes();

-- Grant permissions to authenticated users
GRANT SELECT ON blueprints TO authenticated;
GRANT INSERT ON blueprints TO authenticated;
GRANT UPDATE ON blueprints TO authenticated;
GRANT SELECT ON blueprint_audit_logs TO authenticated;
