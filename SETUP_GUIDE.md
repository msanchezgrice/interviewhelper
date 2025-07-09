# Interview Helper AI - Setup and Testing Guide

## 📋 Project Status

✅ **Completed:**
- Project successfully pushed to GitHub: https://github.com/msanchezgrice/interviewhelper.git
- Supabase database integration configured (Project ID: ftmcmonyfetjeimoxrbt)
- Chrome extension code structure complete
- Database schema defined (interviews, notes, user_settings tables)
- Supabase client integration added to service worker

## 🚀 Extension Installation

### 1. Load Extension in Chrome
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `Interviewerhelper` folder
6. The extension should appear in your extensions list

### 2. Verify Installation
- Extension icon should appear in Chrome toolbar
- Click the icon to open the popup
- Extension should be listed in `chrome://extensions/`

## 🗄️ Database Setup

### Supabase Configuration
- **Project URL:** https://ftmcmonyfetjeimoxrbt.supabase.co
- **Project ID:** ftmcmonyfetjeimoxrbt
- **Status:** Connected via MCP

### Required Tables
The following tables need to be created in Supabase:

```sql
-- Run this in Supabase SQL Editor or via migration
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

CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🧪 Testing Instructions

### 1. Basic Extension Test
1. Load the extension in Chrome
2. Click the extension icon - popup should open
3. Click outside the popup to close it
4. Right-click the extension icon and select "Options" (if available)

### 2. Meeting Platform Test
1. Open a new tab and go to https://meet.google.com
2. The extension should automatically inject its content script
3. Look for any Interview Helper UI elements
4. Check browser console for any extension-related messages

### 3. Dashboard Test
1. Click the extension icon in the toolbar
2. The dashboard should open in a new tab
3. Verify all sections load properly
4. Test navigation between different views

### 4. Settings Test
1. Open the extension settings
2. Try updating AI model, API key, etc.
3. Verify settings are saved to local storage
4. Check if settings persist after browser restart

### 5. Storage Test
1. Open Chrome DevTools (F12)
2. Go to Application tab > Storage > Local Storage
3. Look for extension-related data
4. Test saving/loading interview data

## 🔧 Development Commands

```bash
# Commit changes to Git
git add .
git commit -m "Your commit message"
git push

# View git status
git status

# View project structure
tree -I node_modules
```

## 🐛 Troubleshooting

### Common Issues:
1. **Extension won't load**: Check manifest.json for syntax errors
2. **Content script not injecting**: Verify permissions and host_permissions
3. **Database connection fails**: Check Supabase credentials and network
4. **Local storage issues**: Clear browser data and reload extension

### Debug Steps:
1. Check Chrome extension console: `chrome://extensions/` → Details → Inspect views
2. Check content script console: F12 on meeting page
3. Verify network requests in DevTools Network tab
4. Check Supabase logs for database connection issues

## 📁 File Structure

```
Interviewerhelper/
├── manifest.json              # Extension manifest
├── background/
│   └── service-worker.js     # Background service worker
├── content/
│   ├── inject.js            # Content script
│   └── styles.css           # Injected styles
├── popup/
│   ├── popup.html           # Extension popup
│   └── popup.js             # Popup logic
├── sidebar/
│   ├── sidebar.html         # Interview sidebar
│   ├── sidebar.js           # Sidebar logic
│   └── sidebar.css          # Sidebar styles
├── dashboard/
│   ├── dashboard.html       # Main dashboard
│   └── dashboard.js         # Dashboard logic
├── settings/
│   ├── settings.html        # Settings page
│   └── settings.js          # Settings logic
├── config/
│   ├── supabase.js          # Supabase client
│   └── schema.sql           # Database schema
└── test.html                # Testing page
```

## 📊 Features to Test

### Core Features:
- [ ] Extension loads successfully
- [ ] Popup opens and closes
- [ ] Dashboard is accessible
- [ ] Settings can be modified
- [ ] Content script injects on meeting sites
- [ ] Local storage works
- [ ] Supabase connection (when database is set up)

### Advanced Features:
- [ ] Interview recording simulation
- [ ] Note-taking functionality
- [ ] AI suggestion generation
- [ ] Transcript display
- [ ] Data persistence

## 🔗 Useful Links

- **GitHub Repository:** https://github.com/msanchezgrice/interviewhelper.git
- **Supabase Project:** https://ftmcmonyfetjeimoxrbt.supabase.co
- **Test Page:** file:///Users/miguel/Interviewerhelper/test.html
- **Chrome Extensions:** chrome://extensions/

## 📝 Next Steps

1. **Manual Testing**: Follow the testing instructions above
2. **Database Setup**: Create the database tables in Supabase
3. **Feature Testing**: Test all core functionality
4. **Bug Fixes**: Address any issues found during testing
5. **Documentation**: Update this guide based on test results
