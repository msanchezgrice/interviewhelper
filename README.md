# Interview Helper AI - Chrome Extension

A Cluely-style AI copilot for user researchers conducting interviews. This Chrome extension provides real-time conversation guidance, notes, and follow-ups during user interviews.

## Features

- 🎙️ **Real-time Transcription**: Automatically transcribes conversations during video calls
- 💡 **AI-Powered Suggestions**: Get intelligent follow-up questions and conversation prompts
- 📝 **Smart Note-Taking**: Capture important insights with contextual timestamps
- 🔒 **Privacy-First**: All data stored locally, API keys never leave your device
- 📊 **Interview Dashboard**: Review past interviews, insights, and export data
- 🎯 **Platform Support**: Works with Google Meet, Zoom, and Microsoft Teams

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The Interview Helper AI icon will appear in your Chrome toolbar

## Setup

1. Click the extension icon and go to Settings
2. Add your OpenAI API key (get one at https://platform.openai.com/api-keys)
3. Configure your preferences:
   - Choose AI model (GPT-4 Turbo recommended)
   - Enable/disable auto-recording
   - Set privacy preferences

## Usage

### Starting an Interview

1. **Option 1**: Navigate to Google Meet, Zoom, or Teams and click "Start Interview" in the sidebar
2. **Option 2**: Click the extension icon to open the dashboard, then click "New Interview"

### During the Interview

- The AI helper sidebar will appear with:
  - Real-time transcript
  - Suggested follow-up questions
  - Quick note-taking area
  - Key insights tracker

### After the Interview

- Access the dashboard to:
  - Review interview transcripts
  - Export data as JSON
  - View aggregated insights
  - Search across all interviews

## File Structure

```
/
├── manifest.json          # Extension configuration
├── background/
│   └── service-worker.js  # Background script
├── content/
│   ├── inject.js         # Content script for meeting pages
│   └── styles.css        # Injected UI styles
├── sidebar/
│   ├── sidebar.html      # AI helper sidebar
│   ├── sidebar.js        # Sidebar functionality
│   └── sidebar.css       # Sidebar styles
├── popup/
│   ├── popup.html        # Extension popup
│   └── popup.js          # Popup functionality
├── dashboard/
│   ├── dashboard.html    # Interview management dashboard
│   └── dashboard.js      # Dashboard functionality
└── settings/
    ├── settings.html     # Settings page
    └── settings.js       # Settings functionality
```

## Privacy & Security

- All interview data is stored locally in Chrome storage
- API keys are encrypted and never transmitted
- No data is sent to external servers except API calls to OpenAI
- You can clear all data at any time from the settings

## Development

### Prerequisites
- Chrome browser
- Basic knowledge of Chrome Extension APIs
- OpenAI API key for AI features

### Testing
1. Make changes to the source code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Future Enhancements
- [ ] Integration with more video conferencing platforms
- [ ] Support for multiple AI providers (Claude, Gemini)
- [ ] Advanced analytics and insights
- [ ] Team collaboration features
- [ ] Export to various formats (PDF, Markdown)

## Troubleshooting

**Extension not appearing on meeting pages?**
- Refresh the meeting page after installing
- Check that the extension has necessary permissions

**AI suggestions not working?**
- Verify your API key is correctly entered in settings
- Check your OpenAI account has available credits

**Transcript not capturing?**
- Ensure microphone permissions are granted
- Try restarting the interview session

## License

MIT License - feel free to modify and distribute as needed.

## Support

For issues, questions, or contributions, please open an issue in the repository.
