// Settings functionality for Idea Feedback
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
  checkAuthStatus();
});

// Check authentication status
async function checkAuthStatus() {
  chrome.storage.local.get(['clerkToken', 'userInfo'], (result) => {
    if (result.clerkToken && result.userInfo) {
      showSignedInState(result.userInfo);
    } else {
      showSignedOutState();
    }
  });
}

// Show signed in state
function showSignedInState(userInfo) {
  document.getElementById('signInSection').style.display = 'none';
  document.getElementById('signedInSection').style.display = 'block';
  
  // Update user info
  document.getElementById('userName').textContent = userInfo.name || 'User';
  document.getElementById('userEmail').textContent = userInfo.email || '';
  document.getElementById('userInitial').textContent = (userInfo.name || 'U')[0].toUpperCase();
}

// Show signed out state
function showSignedOutState() {
  document.getElementById('signInSection').style.display = 'block';
  document.getElementById('signedInSection').style.display = 'none';
}

// Set up event listeners
function setupEventListeners() {
  // Account buttons
  document.getElementById('signInBtn').addEventListener('click', handleSignIn);
  document.getElementById('signOutBtn').addEventListener('click', handleSignOut);
  document.getElementById('viewDashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://ideafeedback.co/dashboard' });
  });
  
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

// Handle sign in
function handleSignIn() {
  // Simply open the sign-in page - user will need to manually return to settings
  const signInUrl = `https://ideafeedback.co/sign-in`;
  chrome.tabs.create({ url: signInUrl });
  
  // Show a message to the user
  showSuccessMessage('Opening sign-in page. Please return to settings after signing in.');
  
  // Set up a periodic check for auth status
  const checkInterval = setInterval(async () => {
    try {
      const response = await fetch('https://ideafeedback.co/api/extension/auth-check', {
        credentials: 'include',
        headers: {
          'X-Extension-Request': 'true'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          // Store user info
          chrome.storage.local.set({
            userInfo: {
              email: data.user.email,
              name: data.user.name,
              id: data.user.id
            }
          }, () => {
            showSignedInState(data.user);
            clearInterval(checkInterval);
          });
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  }, 2000); // Check every 2 seconds
  
  // Stop checking after 2 minutes
  setTimeout(() => clearInterval(checkInterval), 120000);
}

// Handle sign out
function handleSignOut() {
  chrome.storage.local.remove(['clerkToken', 'userInfo'], () => {
    showSignedOutState();
    showSuccessMessage('Signed out successfully!');
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
    document.getElementById('aiModel').value = settings.aiModel || 'gpt-4o';
    
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
function showSuccessMessage(message = 'Settings saved successfully!') {
  const successMessage = document.getElementById('successMessage');
  successMessage.textContent = '✓ ' + message;
  successMessage.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 3000);
  
  // Close window after 1 second (only for save settings)
  if (message.includes('Settings saved')) {
    setTimeout(() => {
      window.close();
    }, 1000);
  }
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