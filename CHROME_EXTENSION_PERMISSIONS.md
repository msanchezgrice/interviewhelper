# Chrome Extension - Privacy Practices Tab Content

Copy and paste these justifications into the Chrome Web Store Developer Dashboard Privacy Practices tab:

## 1. Justification for activeTab
This permission is required to inject the interview assistant sidebar into the active tab when the user clicks the extension icon. The extension needs to interact with video conferencing websites (Google Meet, Zoom Web, etc.) to capture and display real-time interview assistance without requiring access to all tabs.

## 2. Justification for host permission use
The extension requires host permissions for video conferencing domains (meet.google.com, zoom.us) to inject the interview assistant interface and capture meeting transcripts. This allows the extension to provide real-time AI suggestions and note-taking capabilities during user interviews conducted on these platforms.

## 3. Justification for offscreen
The offscreen document is required to process audio streams in the background for real-time transcription during interviews. This enables continuous speech-to-text conversion without interrupting the user's video call experience, ensuring accurate capture of interview conversations.

## 4. Justification for remote code use
No remote code is executed. All extension functionality is bundled within the extension package. The extension only makes API calls to OpenAI for AI-powered suggestions and Supabase for data storage, but does not download or execute any remote code.

## 5. Justification for scripting
The scripting permission is essential to inject the interview assistant sidebar interface into video conferencing pages. This allows the extension to dynamically add UI elements for displaying transcripts, AI suggestions, and note-taking features without requiring the user to navigate away from their video call.

## 6. Justification for storage
Storage permission is required to save user preferences, interview transcripts, notes, and session data locally. This ensures users can access their interview history, maintain personalized settings, and continue interviews across browser sessions without data loss.

## 7. Justification for tabs
The tabs permission is needed to detect when users navigate to supported video conferencing platforms and to manage the extension's sidebar across different tabs. This ensures the interview assistant activates only on relevant pages and maintains proper state management.

## 8. Justification for webNavigation
WebNavigation permission is required to detect when users navigate to video conferencing URLs and automatically prepare the interview assistant interface. This provides a seamless experience by recognizing supported platforms and initializing the extension features without manual activation.

## 9. Single Purpose Description
This extension serves as an AI-powered interview assistant for user researchers and product managers. It provides real-time transcription, intelligent follow-up suggestions, automated note-taking, and meeting summaries during video interviews to help users conduct more effective user research and gather better insights.

## 10. Data Usage Certification Statement
✅ Check the box that says: "I certify that my data usage complies with the Chrome Web Store Developer Program Policies"

## Additional Store Listing Information

### Extension Name
Idea Feedback - AI Interview Assistant

### Short Description (132 characters max)
AI-powered interview assistant with real-time transcription, smart suggestions, and automated summaries for user research.

### Detailed Description
Idea Feedback transforms how you conduct user interviews with AI-powered assistance that helps you ask better questions and capture deeper insights.

**Key Features:**
✨ Real-time Transcription - Never miss important details with automatic speech-to-text
💡 AI Suggestions - Get intelligent follow-up questions and probing suggestions
📝 Smart Notes - Auto-categorized insights, pain points, and opportunities
📊 Meeting Summaries - One-click generation of comprehensive interview recaps
🚀 Feature Ideas - AI-generated MVP recommendations based on interview insights
🔍 Interviewee Research - Quick background research using public information

**Perfect for:**
• Product Managers conducting user interviews
• UX Researchers gathering customer insights  
• Startup Founders validating ideas
• Customer Success teams understanding user needs
• Anyone who wants to run better user interviews

**How it works:**
1. Click the extension during your video call
2. The sidebar appears with real-time transcript and AI suggestions
3. Take notes that are automatically categorized
4. Generate a comprehensive summary when done

**Privacy First:**
• Transcripts stored locally
• No data sold to third parties
• You control what gets saved
• Compliant with data protection standards

Transform your user interviews from good to great with Idea Feedback.

### Category
Productivity

### Language
English

### Screenshots Required (1280x800 or 640x400)
1. Screenshot showing the sidebar during a video call
2. Screenshot of AI suggestions in action
3. Screenshot of the meeting summary
4. Screenshot of the dashboard with saved interviews

### Promotional Images
- Small Promo Tile (440x280): Extension logo with tagline
- Large Promo Tile (920x680): Feature showcase image
- Marquee Promo Tile (1400x560): Hero image with key features

### Support Email
support@ideafeedback.co

### Website
https://ideafeedback.co

### Privacy Policy URL
https://ideafeedback.co/privacy

Note: You'll need to create a simple privacy policy page on your website before submission.