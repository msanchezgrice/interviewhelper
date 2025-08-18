// Popup functionality for InterviewHelper AI
document.addEventListener('DOMContentLoaded', async () => {
  // Load extension status
  loadStatus();
  
  // Set up event listeners
  setupEventListeners();
  
  // Check current tab
  checkCurrentTab();
  
  // Check API key
  checkAPIKey();
});

// Set up event listeners
function setupEventListeners() {
  document.getElementById('startStandaloneSession').addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to service worker to start standalone interview
    chrome.runtime.sendMessage({ action: 'startStandaloneInterview', tabId: tab.id }, (response) => {
      if (response && response.success) {
        // Close popup after starting
        window.close();
      } else {
        console.error('Failed to start standalone interview');
      }
    });
  });
  
  document.getElementById('openDashboard').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
  });
  
  document.getElementById('openSettings').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('settings/settings.html') });
  });
  
  document.getElementById('helpLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/yourusername/interview-helper-ai/wiki' });
  });
}

// Load extension status
async function loadStatus() {
  // Get interview count
  chrome.storage.local.get(['interviews'], (result) => {
    const interviews = result.interviews || [];
    document.getElementById('interviewCount').textContent = interviews.length;
  });
  
  // Check if extension is properly initialized
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    if (chrome.runtime.lastError) {
      document.getElementById('extensionStatus').textContent = 'Error';
      document.getElementById('extensionStatus').classList.remove('status-active');
      document.getElementById('extensionStatus').style.color = '#ef4444';
    } else if (response && response.initialized) {
      document.getElementById('extensionStatus').textContent = 'Active';
    }
  });
}

// Check current tab
async function checkCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) return;
  
  // Check if there's an active standalone session
  chrome.storage.local.get(['currentSession'], (result) => {
    if (result.currentSession && result.currentSession.isActive) {
      document.getElementById('currentTab').textContent = 'Standalone session active';
      document.getElementById('currentTab').style.color = '#10b981';
      return;
    }
    
    // Otherwise check for meeting pages
    const supportedDomains = [
      'meet.google.com',
      'zoom.us',
      'teams.microsoft.com',
      'whereby.com'
    ];
    
    const url = new URL(tab.url);
    const isSupportedDomain = supportedDomains.some(domain => url.hostname.includes(domain));
    
    if (isSupportedDomain) {
      document.getElementById('currentTab').textContent = 'Ready for interview';
      document.getElementById('currentTab').style.color = '#10b981';
    } else {
      document.getElementById('currentTab').textContent = 'Ready for standalone session';
      document.getElementById('currentTab').style.color = '#667eea';
    }
  });
}

// Check API key configuration
async function checkAPIKey() {
  chrome.storage.local.get(['settings', 'apiKey'], (result) => {
    const apiKey = result.apiKey || (result.settings && result.settings.apiKey);
    if (!apiKey) {
      const apiWarning = document.getElementById('apiWarning');
      if (apiWarning) {
        apiWarning.style.display = 'block';
      }
    }
  });
}
