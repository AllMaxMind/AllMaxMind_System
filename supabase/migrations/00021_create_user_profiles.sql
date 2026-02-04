-- Migration: Create User Profiles Table
-- Story: SPRINT-1-P4 (Admin Access)
-- Purpose: Store user metadata including role for role-based access control

-- ============================================
-- STEP 1: Create user_profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- STEP 2: Create indexes for user_profiles
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- ============================================
-- STEP 3: Enable RLS on user_profiles
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: RLS Policies for user_profiles
-- ============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "user_view_own_profile" ON user_profiles;
CREATE POLICY "user_view_own_profile" ON user_profiles
  FOR SELECT
  USING (id = auth.uid());

-- Service role can view all profiles
DROP POLICY IF EXISTS "service_role_view_all_profiles" ON user_profiles;
CREATE POLICY "service_role_view_all_profiles" ON user_profiles
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Users can update their own profile (but not role)
DROP POLICY IF EXISTS "user_update_own_profile" ON user_profiles;
CREATE POLICY "user_update_own_profile" ON user_profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));

-- Service role can do anything
DROP POLICY IF EXISTS "service_role_all_on_profiles" ON user_profiles;
CREATE POLICY "service_role_all_on_profiles" ON user_profiles
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- STEP 5: Grant permissions
-- ============================================
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- ============================================
-- STEP 6: Create function to auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 7: Create trigger for new user signup
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 8: Create updated_at trigger
-- ============================================
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- User profiles table created with role-based access
-- ============================================
