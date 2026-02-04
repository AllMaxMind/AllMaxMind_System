-- Migration: Create Email Jobs Queue Table
-- Story: SPRINT-1-P1 (Blueprint Persistence)
-- Date: 2026-02-03

CREATE TABLE IF NOT EXISTS email_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID NOT NULL REFERENCES blueprints(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  pdf_url TEXT,
  template VARCHAR(100) DEFAULT 'blueprint_delivery', -- Template name in Resend
  subject TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'sent' | 'failed' | 'retrying'
  retry_count INT DEFAULT 0,
  last_error TEXT,
  last_attempt_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT valid_email_status CHECK (status IN ('pending', 'sent', 'failed', 'retrying')),
  CONSTRAINT email_format CHECK (recipient_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT retry_limit CHECK (retry_count >= 0 AND retry_count <= 10)
);

-- Create indexes for queue processing
CREATE INDEX IF NOT EXISTS idx_email_jobs_status ON email_jobs(status);
CREATE INDEX IF NOT EXISTS idx_email_jobs_created_at ON email_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_jobs_blueprint_id ON email_jobs(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_email_jobs_retry_ready ON email_jobs(status, last_attempt_at, retry_count);
CREATE INDEX IF NOT EXISTS idx_email_jobs_pending_by_date ON email_jobs(status, created_at DESC)
  WHERE status IN ('pending', 'retrying');

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_jobs_updated_at_trigger
BEFORE UPDATE ON email_jobs
FOR EACH ROW
EXECUTE FUNCTION update_email_jobs_updated_at();

-- Enable RLS on email_jobs table
ALTER TABLE email_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own email job history
CREATE POLICY user_view_own_email_jobs ON email_jobs
  FOR SELECT
  USING (
    blueprint_id IN (
      SELECT id FROM blueprints WHERE user_id = auth.uid()
    ) OR
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );

-- RLS Policy: Service role (edge functions) can manage email_jobs
-- This will be used by the process-email-queue function
ALTER TABLE email_jobs FORCE ROW LEVEL SECURITY;

-- Create audit log for email deliveries
CREATE TABLE IF NOT EXISTS email_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_job_id UUID NOT NULL REFERENCES email_jobs(id) ON DELETE CASCADE,
  event VARCHAR(100), -- 'sent', 'failed', 'retrying', 'bounce', 'complaint'
  status_code INT,
  error_message TEXT,
  resend_message_id TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_job_id ON email_delivery_logs(email_job_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_event ON email_delivery_logs(event);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_created_at ON email_delivery_logs(created_at);

-- Enable RLS on email_delivery_logs
ALTER TABLE email_delivery_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_delivery_view ON email_delivery_logs
  FOR SELECT
  USING (
    email_job_id IN (
      SELECT id FROM email_jobs
      WHERE blueprint_id IN (SELECT id FROM blueprints WHERE user_id = auth.uid())
    ) OR
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON email_jobs TO authenticated;
GRANT SELECT, INSERT ON email_delivery_logs TO authenticated;

-- Function to get pending email jobs (for queue processor)
-- This allows the Edge Function to fetch jobs without explicit user context
CREATE OR REPLACE FUNCTION get_pending_email_jobs(limit_count INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  blueprint_id UUID,
  recipient_email VARCHAR,
  pdf_url TEXT,
  template VARCHAR,
  subject TEXT,
  status VARCHAR,
  retry_count INT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    email_jobs.id,
    email_jobs.blueprint_id,
    email_jobs.recipient_email,
    email_jobs.pdf_url,
    email_jobs.template,
    email_jobs.subject,
    email_jobs.status,
    email_jobs.retry_count,
    email_jobs.created_at
  FROM email_jobs
  WHERE status IN ('pending', 'retrying')
    AND retry_count < 3
  ORDER BY created_at ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_pending_email_jobs TO authenticated;
