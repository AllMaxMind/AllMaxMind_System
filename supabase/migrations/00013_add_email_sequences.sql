-- Migration: Add Email Sequences for Story 5.4
-- Automated email sequences based on lead status

-- ============================================
-- STEP 1: Create email_logs table if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  template_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message_id TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- ============================================
-- STEP 2: Add lead_status column to leads
-- ============================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_status VARCHAR(50) DEFAULT 'morno';
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);

-- ============================================
-- STEP 3: Create email_sequences table
-- ============================================
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  lead_status VARCHAR(50) NOT NULL,
  current_email_number INTEGER DEFAULT 0,
  next_send_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT FALSE,
  is_paused BOOLEAN DEFAULT FALSE,
  unsubscribed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_sequences_lead_id ON email_sequences(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_next_send ON email_sequences(next_send_at)
  WHERE NOT is_completed AND NOT is_paused;

-- ============================================
-- STEP 4: Create email_queue table
-- ============================================
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES email_sequences(id) ON DELETE CASCADE,
  template_id VARCHAR(50) NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  context JSONB NOT NULL DEFAULT '{}',
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at) WHERE NOT sent;
CREATE INDEX IF NOT EXISTS idx_email_queue_lead_id ON email_queue(lead_id);

-- ============================================
-- STEP 5: Add sequence tracking columns to email_logs
-- ============================================
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS sequence_id UUID;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS lead_id UUID;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS bounced BOOLEAN DEFAULT FALSE;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS bounce_reason VARCHAR(255);

-- Add FK constraints separately (may fail if columns already exist with different constraints)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'email_logs_sequence_id_fkey'
  ) THEN
    ALTER TABLE email_logs
      ADD CONSTRAINT email_logs_sequence_id_fkey
      FOREIGN KEY (sequence_id) REFERENCES email_sequences(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore if constraint already exists or other error
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'email_logs_lead_id_fkey'
  ) THEN
    ALTER TABLE email_logs
      ADD CONSTRAINT email_logs_lead_id_fkey
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_logs_sequence ON email_logs(sequence_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON email_logs(lead_id);

-- ============================================
-- STEP 6: Create triggers and functions
-- ============================================

-- Updated timestamp trigger for email_sequences
CREATE OR REPLACE FUNCTION update_email_sequences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_sequences_updated_at ON email_sequences;
CREATE TRIGGER email_sequences_updated_at
  BEFORE UPDATE ON email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_sequences_updated_at();

-- Function to calculate lead status based on engagement score
CREATE OR REPLACE FUNCTION calculate_lead_status(score NUMERIC)
RETURNS VARCHAR(50) AS $$
BEGIN
  IF score >= 75 THEN
    RETURN 'quente';
  ELSIF score >= 50 THEN
    RETURN 'acompanhando';
  ELSE
    RETURN 'morno';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update lead_status when engagement_score changes
CREATE OR REPLACE FUNCTION update_lead_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.engagement_score IS NOT NULL THEN
    NEW.lead_status = calculate_lead_status(NEW.engagement_score);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_status_update ON leads;
CREATE TRIGGER leads_status_update
  BEFORE INSERT OR UPDATE OF engagement_score ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_status();

-- ============================================
-- STEP 7: Create analytics view
-- ============================================
CREATE OR REPLACE VIEW email_sequence_stats AS
SELECT
  lead_status,
  COUNT(*) as total_sequences,
  COUNT(CASE WHEN is_completed THEN 1 END) as completed_count,
  COUNT(CASE WHEN unsubscribed THEN 1 END) as unsubscribed_count,
  ROUND(AVG(current_email_number)::numeric, 1) as avg_emails_sent,
  ROUND((COUNT(CASE WHEN is_completed THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0))::numeric, 1) as completion_rate_pct
FROM email_sequences
GROUP BY lead_status;

-- ============================================
-- STEP 8: Grant permissions
-- ============================================
GRANT SELECT ON email_sequence_stats TO authenticated;
GRANT SELECT ON email_sequence_stats TO anon;
GRANT SELECT, INSERT, UPDATE ON email_sequences TO authenticated;
GRANT SELECT, INSERT, UPDATE ON email_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE ON email_logs TO authenticated;
GRANT ALL ON email_sequences TO service_role;
GRANT ALL ON email_queue TO service_role;
GRANT ALL ON email_logs TO service_role;
