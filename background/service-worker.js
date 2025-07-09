// Background service worker for InterviewHelper AI
import('./config/supabase.js').then(module => {
  self.SupabaseClient = module.SupabaseClient || module.default;
});

let activeTabId = null;
let isRecording = false;
let transcriptionWorker = null;
let currentTranscript = [];
let interviewStartTime = null;
let supabaseClient = null;
let currentInterviewId = null;

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('InterviewHelper AI installed');
  
  // Initialize Supabase client
  if (self.SupabaseClient) {
    supabaseClient = new self.SupabaseClient();
    await supabaseClient.initialize();
  }
  
  chrome.storage.local.set({
    settings: {
      apiKey: '',
      aiModel: 'gpt-4',
      autoTranscribe: true,
      showSuggestions: true,
      theme: 'light'
    }
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getStatus':
      sendResponse({ 
        initialized: true, 
        isRecording: isRecording,
        activeTabId: activeTabId,
        supabaseConnected: supabaseClient !== null
      });
      break;
    
    case 'startInterview':
      startInterview(sender.tab.id);
      sendResponse({ success: true });
      break;
    
    case 'stopInterview':
      stopInterview();
      sendResponse({ success: true });
      break;
    
    case 'getTranscript':
      sendResponse({ transcript: currentTranscript });
      break;
    
    case 'getSuggestion':
      generateSuggestion(request.context).then(suggestion => {
        sendResponse({ suggestion });
      });
      return true; // Keep message channel open for async response
    
    case 'saveNote':
      saveNote(request.note);
      sendResponse({ success: true });
      break;
    
    case 'updateSettings':
      chrome.storage.local.set({ settings: request.settings });
      sendResponse({ success: true });
      break;
    
    case 'startNewInterview':
      // Find or create a meeting tab
      chrome.tabs.query({}, (tabs) => {
        const meetingTab = tabs.find(tab => 
          tab.url?.includes('meet.google.com') || 
          tab.url?.includes('zoom.us') || 
          tab.url?.includes('teams.microsoft.com')
        );
        
        if (meetingTab) {
          chrome.tabs.update(meetingTab.id, { active: true });
          startInterview(meetingTab.id);
        } else {
          // Open Google Meet as default
          chrome.tabs.create({ url: 'https://meet.google.com' });
        }
      });
      sendResponse({ success: true });
      break;
  }
});

// Handle extension icon click - open dashboard
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('dashboard/dashboard.html')
  });
});

// Start interview recording
function startInterview(tabId) {
  activeTabId = tabId;
  isRecording = true;
  interviewStartTime = new Date();
  currentTranscript = [];
  
  // Initialize transcription
  initializeTranscription();
  
  // Notify content script
  chrome.tabs.sendMessage(tabId, {
    action: 'interviewStarted',
    startTime: interviewStartTime
  });
}

// Stop interview recording
function stopInterview() {
  isRecording = false;
  
  if (transcriptionWorker) {
    transcriptionWorker.terminate();
    transcriptionWorker = null;
  }
  
  // Save interview data
  saveInterviewData();
  
  // Notify content script
  if (activeTabId) {
    chrome.tabs.sendMessage(activeTabId, {
      action: 'interviewStopped'
    });
  }
  
  activeTabId = null;
}

// Initialize speech-to-text transcription
function initializeTranscription() {
  // For now, we'll simulate transcription with the Web Speech API
  // In production, you'd integrate with Whisper API or similar
  console.log('Transcription initialized');
  
  // Send periodic transcript updates to content script
  setInterval(() => {
    if (isRecording && activeTabId) {
      chrome.tabs.sendMessage(activeTabId, {
        action: 'transcriptUpdate',
        transcript: currentTranscript
      });
    }
  }, 1000);
}

// Generate AI suggestions
async function generateSuggestion(context) {
  try {
    const settings = await chrome.storage.local.get('settings');
    const apiKey = settings.settings?.apiKey;
    
    if (!apiKey) {
      return {
        type: 'error',
        content: 'Please set your API key in the extension settings'
      };
    }
    
    // Simulated AI response for demo
    // In production, call OpenAI/Claude API here
    const suggestions = [
      {
        type: 'followup',
        content: 'Can you elaborate on that experience?'
      },
      {
        type: 'probe',
        content: 'What was the most challenging part of that process?'
      },
      {
        type: 'clarify',
        content: 'When you say "difficult", what specifically made it challenging?'
      }
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  } catch (error) {
    console.error('Error generating suggestion:', error);
    return {
      type: 'error',
      content: 'Unable to generate suggestion'
    };
  }
}

// Save note with timestamp and context
function saveNote(note) {
  const timestamp = new Date();
  const noteData = {
    id: Date.now(),
    content: note.content,
    timestamp: timestamp,
    tags: note.tags || [],
    transcriptContext: getCurrentTranscriptContext()
  };
  
  chrome.storage.local.get(['notes'], (result) => {
    const notes = result.notes || [];
    notes.push(noteData);
    chrome.storage.local.set({ notes });
  });
}

// Get current transcript context (last 5 exchanges)
function getCurrentTranscriptContext() {
  return currentTranscript.slice(-10);
}

// Save complete interview data
async function saveInterviewData() {
  const interviewData = {
    startTime: interviewStartTime,
    endTime: new Date(),
    transcript: currentTranscript,
    duration: new Date() - interviewStartTime,
    notes: []
  };
  
  try {
    if (supabaseClient) {
      const result = await supabaseClient.saveInterview(interviewData);
      console.log('Interview saved to Supabase:', result);
      currentInterviewId = result[0]?.id;
    }
    
    // Also save to local storage as backup
    chrome.storage.local.get(['interviews'], (result) => {
      const interviews = result.interviews || [];
      interviews.push({
        id: currentInterviewId || Date.now(),
        ...interviewData
      });
      chrome.storage.local.set({ interviews });
    });
  } catch (error) {
    console.error('Error saving interview:', error);
    
    // Fallback to local storage only
    chrome.storage.local.get(['interviews'], (result) => {
      const interviews = result.interviews || [];
      interviews.push({
        id: Date.now(),
        ...interviewData
      });
      chrome.storage.local.set({ interviews });
    });
  }
}

// Handle tab updates (detect when user enters/leaves meeting)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const meetingUrls = [
      'meet.google.com',
      'zoom.us',
      'teams.microsoft.com'
    ];
    
    const isInMeeting = meetingUrls.some(url => tab.url?.includes(url));
    
    if (isInMeeting) {
      // Inject content script if needed
      chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
        if (!response) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content/inject.js']
          });
        }
      });
    }
  }
});
