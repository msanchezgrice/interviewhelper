// Settings functionality for InterviewHelper AI
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
  // Save button
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  
  // Cancel button
  document.getElementById('cancelBtn').addEventListener('click', () => {
    window.close();
  });
  
  // Clear data button
  document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
  
  // Show/hide API key
  const apiKeyInput = document.getElementById('apiKey');
  apiKeyInput.addEventListener('focus', () => {
    apiKeyInput.type = 'text';
  });
  
  apiKeyInput.addEventListener('blur', () => {
    if (apiKeyInput.value) {
      apiKeyInput.type = 'password';
    }
  });
}

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(['settings', 'apiKey'], (result) => {
    const settings = result.settings || {};
    
    // API Key (stored separately for security)
    if (result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }
    
    // AI Model
    document.getElementById('aiModel').value = settings.aiModel || 'gpt-4-turbo-preview';
    
    // Interview Preferences
    document.getElementById('autoStart').checked = settings.autoStart || false;
    document.getElementById('realtimeSuggestions').checked = settings.realtimeSuggestions !== false;
    document.getElementById('hideFromScreenShare').checked = settings.hideFromScreenShare !== false;
    
    // Privacy & Data
    document.getElementById('saveTranscripts').checked = settings.saveTranscripts !== false;
    document.getElementById('analytics').checked = settings.analytics || false;
  });
}

// Save settings to storage
function saveSettings() {
  const apiKey = document.getElementById('apiKey').value.trim();
  
  const settings = {
    aiModel: document.getElementById('aiModel').value,
    autoStart: document.getElementById('autoStart').checked,
    realtimeSuggestions: document.getElementById('realtimeSuggestions').checked,
    hideFromScreenShare: document.getElementById('hideFromScreenShare').checked,
    saveTranscripts: document.getElementById('saveTranscripts').checked,
    analytics: document.getElementById('analytics').checked
  };
  
  // Save settings
  chrome.storage.local.set({ settings }, () => {
    // Save API key separately
    if (apiKey) {
      chrome.storage.local.set({ apiKey }, () => {
        showSuccessMessage();
      });
    } else {
      showSuccessMessage();
    }
  });
}

// Show success message
function showSuccessMessage() {
  const successMessage = document.getElementById('successMessage');
  successMessage.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 3000);
  
  // Close window after 1 second
  setTimeout(() => {
    window.close();
  }, 1000);
}

// Clear all data
function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    chrome.storage.local.clear(() => {
      alert('All data has been cleared.');
      window.close();
    });
  }
}

// Validate API key format
function validateApiKey(key) {
  // Basic validation for OpenAI API key format
  return key.startsWith('sk-') && key.length > 20;
}

// Update UI based on settings
function updateUI() {
  const apiKey = document.getElementById('apiKey').value;
  const saveBtn = document.getElementById('saveBtn');
  
  // Enable/disable save button based on API key
  if (apiKey && !validateApiKey(apiKey)) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Invalid API Key';
  } else {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Settings';
  }
}

// Add input validation
document.getElementById('apiKey').addEventListener('input', updateUI);
