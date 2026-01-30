-- Migration: Add user_id column to leads table for authentication
-- Story: SPRINT-3.2 - Implementar Autenticacao Funcional

-- Add user_id column to link leads to authenticated users
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);

-- Create index for faster lookups by user_email (for linking existing leads)
CREATE INDEX IF NOT EXISTS idx_leads_user_email ON leads(user_email);

-- Comment for documentation
COMMENT ON COLUMN leads.user_id IS 'References authenticated user who owns this lead. NULL for unauthenticated submissions.';

-- Update RLS policy to allow users to see their own leads
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_id IS NULL
  );

-- Policy for users to update their own leads
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
CREATE POLICY "Users can update their own leads" ON leads
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
