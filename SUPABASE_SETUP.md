# Supabase Database Setup for Interview Helper AI

## 🎯 Manual Database Setup Required

Since the Supabase MCP is in read-only mode, you need to manually create the database tables. Here's how:

## 📊 Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Find your project: **ftmcmonyfetjeimoxrbt**
3. Click on your project to open it

## 🗄️ Step 2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"**

## 📝 Step 3: Create Database Tables

Copy and paste this SQL code into the SQL Editor:

```sql
-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id BIGSERIAL PRIMARY KEY,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    transcript JSONB DEFAULT '[]',
    duration_ms INTEGER,
    notes JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    tags JSONB DEFAULT '[]',
    transcript_context JSONB DEFAULT '[]',
    interview_id BIGINT REFERENCES interviews(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interviews_start_time ON interviews(start_time);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_interview_id ON notes(interview_id);
CREATE INDEX IF NOT EXISTS idx_notes_timestamp ON notes(timestamp);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO user_settings (settings) VALUES ('{"apiKey": "", "aiModel": "gpt-4", "autoTranscribe": true, "showSuggestions": true, "theme": "light"}')
ON CONFLICT (id) DO NOTHING;
```

## ▶️ Step 4: Execute the SQL

1. Click the **"Run"** button in the SQL Editor
2. You should see a success message
3. The tables will be created

## ✅ Step 5: Verify Tables Were Created

1. In the left sidebar, click **"Table Editor"**
2. You should now see three tables:
   - `interviews`
   - `notes` 
   - `user_settings`

## 🔐 Step 6: Check Row Level Security (Optional)

For production use, you may want to enable Row Level Security:

1. Go to **"Authentication"** → **"Policies"**
2. For each table, you can create policies to control access
3. For testing, you can disable RLS or allow all operations

## 🧪 Step 7: Test Database Connection

After creating the tables, test the extension:

1. **Reload the Chrome extension**
2. **Open extension popup** - should show "Active" status
3. **Try creating a note or starting an interview**
4. **Check Supabase Table Editor** to see if data appears

## 🔍 Troubleshooting

### If tables don't appear:
- Make sure you're in the correct project (ftmcmonyfetjeimoxrbt)
- Check for any SQL errors in the query results
- Try running each CREATE TABLE statement individually

### If extension can't connect:
- Verify the Supabase URL and anon key in the extension
- Check browser console for connection errors
- Ensure CORS is properly configured

### If data doesn't save:
- Check Row Level Security policies
- Verify the anon key has proper permissions
- Look for errors in browser console

## 📋 Expected Result

After setup, you should be able to:
- ✅ See tables in Supabase dashboard
- ✅ Extension connects without errors
- ✅ Notes and interview data save to database
- ✅ Data persists between sessions

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all tables were created successfully
3. Confirm the extension has the correct Supabase URL and key
4. Test with a simple note to verify database connectivity
