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
    document.getElementById('currentTab').textContent = 'Not on meeting page';
  }
}

// Check API key configuration
async function checkAPIKey() {
  chrome.storage.local.get(['apiKey'], (result) => {
    if (!result.apiKey) {
      document.getElementById('apiWarning').style.display = 'block';
    }
  });
}
