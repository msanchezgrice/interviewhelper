-- Supabase Database Schema for Idea Feedback
-- Complete setup including user management and Clerk integration

-- ============================================
-- 1. USERS TABLE (Synced with Clerk)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL, -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast lookups
CREATE INDEX idx_users_clerk_id ON public.users(clerk_user_id);
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================
-- 2. INTERVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Interview metadata
  title TEXT,
  interviewee_name TEXT,
  interviewee_email TEXT,
  interviewee_company TEXT,
  interviewee_role TEXT,
  
  -- Interview content
  transcript TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  summary JSONB DEFAULT '{}'::jsonb,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  
  -- Source
  source TEXT DEFAULT 'extension' CHECK (source IN ('extension', 'web', 'api')),
  extension_session_id TEXT, -- For linking with extension sessions
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_interviews_user_id ON public.interviews(user_id);
CREATE INDEX idx_interviews_status ON public.interviews(status);
CREATE INDEX idx_interviews_created_at ON public.interviews(created_at DESC);
CREATE INDEX idx_interviews_extension_session ON public.interviews(extension_session_id);

-- ============================================
-- 3. INTERVIEW SEGMENTS (For real-time updates)
-- ============================================
CREATE TABLE IF NOT EXISTS public.interview_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  
  -- Segment content
  speaker TEXT, -- 'interviewer' or 'interviewee'
  text TEXT NOT NULL,
  timestamp_ms INTEGER, -- Milliseconds from start
  
  -- AI processing
  ai_notes JSONB DEFAULT '[]'::jsonb,
  sentiment TEXT,
  topics TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_segments_interview_id ON public.interview_segments(interview_id);
CREATE INDEX idx_segments_timestamp ON public.interview_segments(timestamp_ms);

-- ============================================
-- 4. RESEARCH DATA (LinkedIn/Web research)
-- ============================================
CREATE TABLE IF NOT EXISTS public.research_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Research subject
  subject_name TEXT NOT NULL,
  subject_linkedin_url TEXT,
  subject_company TEXT,
  
  -- Research data
  data JSONB NOT NULL,
  source TEXT NOT NULL, -- 'linkedin', 'company_website', 'news', etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_research_interview_id ON public.research_data(interview_id);
CREATE INDEX idx_research_user_id ON public.research_data(user_id);

-- ============================================
-- 5. FEATURE IDEAS (AI-generated)
-- ============================================
CREATE TABLE IF NOT EXISTS public.feature_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT,
  
  -- AI metadata
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  supporting_quotes JSONB DEFAULT '[]'::jsonb,
  
  -- User feedback
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  is_implemented BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feature_ideas_interview_id ON public.feature_ideas(interview_id);
CREATE INDEX idx_feature_ideas_user_id ON public.feature_ideas(user_id);

-- ============================================
-- 6. USER SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- API Keys (encrypted)
  openai_api_key TEXT, -- Should be encrypted before storing
  
  -- Preferences
  auto_start_recording BOOLEAN DEFAULT FALSE,
  realtime_suggestions BOOLEAN DEFAULT TRUE,
  save_transcripts BOOLEAN DEFAULT TRUE,
  
  -- AI Settings
  ai_model TEXT DEFAULT 'gpt-4',
  suggestion_frequency TEXT DEFAULT 'moderate', -- 'low', 'moderate', 'high'
  
  -- Privacy
  analytics_enabled BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR ALL USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can view own interviews" ON public.interviews
  FOR ALL USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_user_id = auth.uid()::text
  ));

CREATE POLICY "Users can view own interview segments" ON public.interview_segments
  FOR ALL USING (interview_id IN (
    SELECT id FROM public.interviews WHERE user_id IN (
      SELECT id FROM public.users WHERE clerk_user_id = auth.uid()::text
    )
  ));

CREATE POLICY "Users can view own research" ON public.research_data
  FOR ALL USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_user_id = auth.uid()::text
  ));

CREATE POLICY "Users can view own feature ideas" ON public.feature_ideas
  FOR ALL USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_user_id = auth.uid()::text
  ));

CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR ALL USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_user_id = auth.uid()::text
  ));

-- ============================================
-- 8. FUNCTIONS AND TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_ideas_updated_at BEFORE UPDATE ON public.feature_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Function to create or update user from Clerk
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
  
  -- Create default settings if they don't exist
  INSERT INTO public.user_settings (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get interview statistics for a user
CREATE OR REPLACE FUNCTION get_user_interview_stats(p_user_id UUID)
RETURNS TABLE (
  total_interviews BIGINT,
  total_duration_seconds BIGINT,
  interviews_this_week BIGINT,
  interviews_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_interviews,
    COALESCE(SUM(duration_seconds), 0)::BIGINT as total_duration_seconds,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::BIGINT as interviews_this_week,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::BIGINT as interviews_this_month
  FROM public.interviews
  WHERE user_id = p_user_id
    AND status != 'archived';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment below to insert sample data

-- INSERT INTO public.users (clerk_user_id, email, name)
-- VALUES ('user_test123', 'test@example.com', 'Test User')
-- ON CONFLICT DO NOTHING;

-- ============================================
-- 11. GRANTS (Adjust based on your setup)
-- ============================================
-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- SETUP INSTRUCTIONS:
-- ============================================
-- 1. Copy this entire SQL script
-- 2. Go to your Supabase dashboard
-- 3. Navigate to SQL Editor
-- 4. Create a new query
-- 5. Paste this script and run it
-- 6. Update your .env file with:
--    - NEXT_PUBLIC_SUPABASE_URL=your_project_url
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
--    - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
-- 7. In your Clerk dashboard, set up a webhook to call your API
--    when users sign up to sync with Supabase