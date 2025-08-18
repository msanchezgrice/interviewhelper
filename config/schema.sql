-- Interview Helper AI Database Schema (Supabase)
-- New normalized schema for multi-tenant users via Clerk user_id

CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT,
    interviewee TEXT,
    goal TEXT,
    transcript JSONB NOT NULL DEFAULT '[]',
    suggestions JSONB NOT NULL DEFAULT '[]',
    notes JSONB NOT NULL DEFAULT '[]',
    summary JSONB NOT NULL DEFAULT '{}',
    duration_seconds INTEGER,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: separate notes table if we outgrow JSONB
-- CREATE TABLE IF NOT EXISTS notes (
--     id BIGSERIAL PRIMARY KEY,
--     user_id TEXT NOT NULL,
--     content TEXT NOT NULL,
--     timestamp TIMESTAMPTZ NOT NULL,
--     tag TEXT,
--     interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies: only allow users to access their own rows
DROP POLICY IF EXISTS interviews_select ON interviews;
DROP POLICY IF EXISTS interviews_insert ON interviews;
DROP POLICY IF EXISTS interviews_update ON interviews;
DROP POLICY IF EXISTS interviews_delete ON interviews;

CREATE POLICY interviews_select ON interviews FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY interviews_insert ON interviews FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY interviews_update ON interviews FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY interviews_delete ON interviews FOR DELETE
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS user_settings_select ON user_settings;
DROP POLICY IF EXISTS user_settings_upsert ON user_settings;

CREATE POLICY user_settings_select ON user_settings FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY user_settings_upsert ON user_settings FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY user_settings_update ON user_settings FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at);
CREATE INDEX IF NOT EXISTS idx_interviews_start_time ON interviews(start_time);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Default settings row creation will happen application-side per user
