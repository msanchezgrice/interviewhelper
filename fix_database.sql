-- Step 1: First check what tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Step 2: Drop existing tables if they exist (to start fresh)
-- Run this ONLY if you want to reset everything
DROP TABLE IF EXISTS public.feature_ideas CASCADE;
DROP TABLE IF EXISTS public.research_data CASCADE;
DROP TABLE IF EXISTS public.interview_segments CASCADE;
DROP TABLE IF EXISTS public.interviews CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 3: Now create the users table FIRST (it must exist before other tables reference it)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Step 4: Now create the interviews table (depends on users)
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  interviewee_name TEXT,
  interviewee_email TEXT,
  interviewee_company TEXT,
  interviewee_role TEXT,
  transcript TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  summary JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  source TEXT DEFAULT 'extension' CHECK (source IN ('extension', 'web', 'api')),
  extension_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for interviews
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON public.interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON public.interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON public.interviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_extension_session ON public.interviews(extension_session_id);

-- Step 5: Create interview_segments table
CREATE TABLE IF NOT EXISTS public.interview_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  speaker TEXT,
  text TEXT NOT NULL,
  timestamp_ms INTEGER,
  ai_notes JSONB DEFAULT '[]'::jsonb,
  sentiment TEXT,
  topics TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_segments_interview_id ON public.interview_segments(interview_id);
CREATE INDEX IF NOT EXISTS idx_segments_timestamp ON public.interview_segments(timestamp_ms);

-- Step 6: Create research_data table
CREATE TABLE IF NOT EXISTS public.research_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  subject_linkedin_url TEXT,
  subject_company TEXT,
  data JSONB NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_interview_id ON public.research_data(interview_id);
CREATE INDEX IF NOT EXISTS idx_research_user_id ON public.research_data(user_id);

-- Step 7: Create feature_ideas table
CREATE TABLE IF NOT EXISTS public.feature_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT,
  confidence_score DECIMAL(3,2),
  supporting_quotes JSONB DEFAULT '[]'::jsonb,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  is_implemented BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_ideas_interview_id ON public.feature_ideas(interview_id);
CREATE INDEX IF NOT EXISTS idx_feature_ideas_user_id ON public.feature_ideas(user_id);

-- Step 8: Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  openai_api_key TEXT,
  auto_start_recording BOOLEAN DEFAULT FALSE,
  realtime_suggestions BOOLEAN DEFAULT TRUE,
  save_transcripts BOOLEAN DEFAULT TRUE,
  ai_model TEXT DEFAULT 'gpt-4',
  suggestion_frequency TEXT DEFAULT 'moderate',
  analytics_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Step 9: Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interviews_updated_at ON public.interviews;
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feature_ideas_updated_at ON public.feature_ideas;
CREATE TRIGGER update_feature_ideas_updated_at BEFORE UPDATE ON public.feature_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 11: Create helper function for Clerk sync
CREATE OR REPLACE FUNCTION upsert_user_from_clerk(
  p_clerk_user_id TEXT,
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO public.users (clerk_user_id, email, name, avatar_url, last_login_at)
  VALUES (p_clerk_user_id, p_email, p_name, p_avatar_url, NOW())
  ON CONFLICT (clerk_user_id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    last_login_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_user_id;
  
  INSERT INTO public.user_settings (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Step 13: Create RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR ALL USING (auth.uid()::text = clerk_user_id);

DROP POLICY IF EXISTS "Users can view own interviews" ON public.interviews;
CREATE POLICY "Users can view own interviews" ON public.interviews
  FOR ALL USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_user_id = auth.uid()::text
  ));

DROP POLICY IF EXISTS "Users can view own interview segments" ON public.interview_segments;
CREATE POLICY "Users can view own interview segments" ON public.interview_segments
  FOR ALL USING (interview_id IN (
    SELECT id FROM public.interviews WHERE user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = auth.uid()::text
    )
  ));

DROP POLICY IF EXISTS "Users can view own research" ON public.research_data;
CREATE POLICY "Users can view own research" ON public.research_data
  FOR ALL USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_user_id = auth.uid()::text
  ));

DROP POLICY IF EXISTS "Users can view own feature ideas" ON public.feature_ideas;
CREATE POLICY "Users can view own feature ideas" ON public.feature_ideas
  FOR ALL USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_user_id = auth.uid()::text
  ));

DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR ALL USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_user_id = auth.uid()::text
  ));

-- Step 14: Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Step 15: Verify everything was created
SELECT 'Tables created:' as status;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;