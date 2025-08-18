# Chrome Extension Deployment Guide

## Prerequisites
- Chrome Developer account (you already have this)
- Extension files ready in this repository

## Steps to Deploy to Chrome Web Store

### 1. Prepare the Extension
```bash
# Create a zip file of the extension
cd /path/to/interviewhelper
zip -r extension.zip manifest.json background/ content/ sidebar/ popup/ settings/ dashboard/ icons/ config/
```

### 2. Upload to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
2. Click "New Item" button
3. Upload the `extension.zip` file
4. Fill in the required information:
   - **Extension Name**: Idea Feedback AI
   - **Short Description**: AI-powered interview assistant for user research
   - **Category**: Productivity
   - **Language**: English

### 3. Add Store Listing Assets

Required assets:
- **Icon 128x128**: Already in `icons/icon128.png`
- **Screenshots**: Take 1280x800 or 640x400 screenshots showing:
  - The extension in action during a video call
  - The sidebar with AI suggestions
  - The dashboard with interview summaries

### 4. Configure Permissions Justification

Explain why each permission is needed:
- `tabs`: To inject the sidebar into video call tabs
- `storage`: To save interview transcripts and settings
- `activeTab`: To interact with the current tab
- `scripting`: To inject content scripts into pages

### 5. Set Privacy Policy

Create a simple privacy policy explaining:
- What data is collected (interview transcripts, user preferences)
- How it's stored (locally and in Supabase)
- That no data is sold to third parties

### 6. Pricing & Distribution

- Set as **Free**
- Available in **All regions**

### 7. Submit for Review

1. Click "Submit for Review"
2. Review typically takes 1-3 business days
3. You'll receive an email when approved

## Testing Before Deployment

### Load Unpacked Extension Locally:
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the repository folder containing `manifest.json`
5. Test all features:
   - Research functionality
   - Sidebar on video calls
   - Real-time transcription
   - Summary generation

## Important Notes

- **API Keys**: Never include API keys in the extension code
- **Content Security**: Ensure all external scripts are properly validated
- **Updates**: After initial deployment, updates are easier - just upload new zip

## Post-Deployment

Once approved, you'll get:
- A Chrome Web Store URL to share
- Extension ID for future updates
- Analytics dashboard to track installs

Update the landing page "Get Extension" button to point to your Chrome Web Store URL instead of GitHub.