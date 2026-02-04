-- Migration: Add Phase 5 fields to leads table
-- Story: 5.1, 5.2, 5.3 - Phase 5 Hot Lead Conversion

-- Add Phase 5 engagement fields to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS feedback_score NUMERIC;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_range VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_timeline_estimated INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS prototype_commitment BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS scheduled_call TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_added BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_message_id VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_template_used VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phase5_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phase5_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS engagement_score NUMERIC DEFAULT 50;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS in_call BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN leads.feedback_score IS 'Phase 5 Step 1: User feedback score (20-100)';
COMMENT ON COLUMN leads.budget_range IS 'Phase 5 Step 2: Budget range (ate_30k, 30_60k, 60_120k, acima_120k)';
COMMENT ON COLUMN leads.project_timeline_estimated IS 'Phase 5 Step 3: Timeline in days';
COMMENT ON COLUMN leads.prototype_commitment IS 'Phase 5 Step 4: User committed to prototype';
COMMENT ON COLUMN leads.scheduled_call IS 'Phase 5 Step 4: Scheduled call datetime';
COMMENT ON COLUMN leads.whatsapp_phone IS 'Phase 5 Step 5: WhatsApp phone number';
COMMENT ON COLUMN leads.whatsapp_added IS 'Phase 5 Step 5: WhatsApp message sent successfully';
COMMENT ON COLUMN leads.engagement_score IS 'Calculated lead score (50-100)';

-- Create lead_interactions table for tracking (if not exists)
CREATE TABLE IF NOT EXISTS lead_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL,
  step_number INTEGER,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_engagement_score ON leads(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phase5_started ON leads(phase5_started_at);
CREATE INDEX IF NOT EXISTS idx_leads_scheduled_call ON leads(scheduled_call);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id ON lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_type ON lead_interactions(interaction_type);

-- Create view for lead summary analytics
CREATE OR REPLACE VIEW lead_summary AS
SELECT
  COUNT(*) as total_leads,
  COUNT(CASE WHEN lead_status = 'quente' THEN 1 END) as hot_leads_count,
  COUNT(CASE WHEN lead_status = 'acompanhando' THEN 1 END) as warm_leads_count,
  COUNT(CASE WHEN lead_status = 'morno' THEN 1 END) as cold_leads_count,
  ROUND(AVG(engagement_score)::numeric, 1) as avg_score,
  ROUND((COUNT(CASE WHEN lead_status = 'quente' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0))::numeric, 1) as conversion_pct,
  COUNT(CASE WHEN phase5_completed_at IS NOT NULL THEN 1 END) as phase5_completed_count,
  COUNT(CASE WHEN whatsapp_added = TRUE THEN 1 END) as whatsapp_connected_count
FROM leads
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Grant permissions
GRANT SELECT ON lead_summary TO authenticated;
GRANT SELECT ON lead_summary TO anon;
