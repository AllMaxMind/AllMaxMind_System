-- email_logs table para auditoria de emails enviados
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('lead-confirmation', 'blueprint-delivery')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para queries por email
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- RLS: Apenas admin pode ler
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_email_logs"
  ON email_logs FOR SELECT
  USING (auth.role() = 'service_role');
