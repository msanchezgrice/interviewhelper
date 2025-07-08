// Content script for InterviewHelper AI
let isInjected = false;
let sidebarFrame = null;
let floatingButton = null;
let isInterviewActive = false;

// Initialize the extension UI
function initializeUI() {
  if (isInjected) return;
  isInjected = true;
  
  // Create floating button
  createFloatingButton();
  
  // Create sidebar iframe
  createSidebar();
  
  // Listen for messages from background
  chrome.runtime.onMessage.addListener(handleBackgroundMessages);
  
  // Set up mutation observer to handle dynamic content
  observePageChanges();
}

// Create the floating action button
function createFloatingButton() {
  floatingButton = document.createElement('div');
  floatingButton.id = 'interviewhelper-floating-button';
  floatingButton.innerHTML = `
    <div class="ih-button-content">
      <svg class="ih-icon" viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span class="ih-button-text">Interview Helper</span>
    </div>
    <div class="ih-status-indicator"></div>
  `;
  
  // Make button draggable
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  
  floatingButton.addEventListener('mousedown', (e) => {
    if (e.target.closest('.ih-button-content')) {
      isDragging = true;
      dragOffset.x = e.clientX - floatingButton.offsetLeft;
      dragOffset.y = e.clientY - floatingButton.offsetTop;
      floatingButton.style.transition = 'none';
    }
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      floatingButton.style.left = `${e.clientX - dragOffset.x}px`;
      floatingButton.style.top = `${e.clientY - dragOffset.y}px`;
      floatingButton.style.right = 'auto';
      floatingButton.style.bottom = 'auto';
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    floatingButton.style.transition = '';
  });
  
  // Toggle sidebar on click
  floatingButton.addEventListener('click', (e) => {
    if (!isDragging && e.target.closest('.ih-button-content')) {
      toggleSidebar();
    }
  });
  
  document.body.appendChild(floatingButton);
}

// Create the sidebar iframe
function createSidebar() {
  // Create container
  const container = document.createElement('div');
  container.id = 'interviewhelper-sidebar-container';
  container.className = 'ih-sidebar-hidden';
  
  // Create iframe
  sidebarFrame = document.createElement('iframe');
  sidebarFrame.id = 'interviewhelper-sidebar';
  sidebarFrame.src = chrome.runtime.getURL('sidebar/sidebar.html');
  
  // Create resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'ih-resize-handle';
  
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = container.offsetWidth;
    document.body.style.cursor = 'ew-resize';
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isResizing) {
      const width = startWidth - (e.clientX - startX);
      container.style.width = `${Math.max(300, Math.min(600, width))}px`;
    }
  });
  
  document.addEventListener('mouseup', () => {
    isResizing = false;
    document.body.style.cursor = '';
  });
  
  container.appendChild(resizeHandle);
  container.appendChild(sidebarFrame);
  document.body.appendChild(container);
}

// Toggle sidebar visibility
function toggleSidebar() {
  const container = document.getElementById('interviewhelper-sidebar-container');
  if (container.classList.contains('ih-sidebar-hidden')) {
    container.classList.remove('ih-sidebar-hidden');
    container.classList.add('ih-sidebar-visible');
    
    // Notify sidebar that it's visible
    sidebarFrame.contentWindow.postMessage({ type: 'visibility', visible: true }, '*');
  } else {
    container.classList.remove('ih-sidebar-visible');
    container.classList.add('ih-sidebar-hidden');
  }
}

// Handle messages from background script
function handleBackgroundMessages(request, sender, sendResponse) {
  switch (request.action) {
    case 'ping':
      sendResponse({ alive: true });
      break;
      
    case 'interviewStarted':
      isInterviewActive = true;
      updateButtonStatus('active');
      break;
      
    case 'interviewStopped':
      isInterviewActive = false;
      updateButtonStatus('inactive');
      break;
      
    case 'transcriptUpdate':
      // Forward to sidebar
      if (sidebarFrame) {
        sidebarFrame.contentWindow.postMessage({
          type: 'transcriptUpdate',
          transcript: request.transcript
        }, '*');
      }
      break;
  }
}

// Update floating button status
function updateButtonStatus(status) {
  const indicator = floatingButton.querySelector('.ih-status-indicator');
  const icon = floatingButton.querySelector('.ih-icon');
  
  if (status === 'active') {
    indicator.classList.add('active');
    icon.innerHTML = '<path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17h-2v-2h2v2zm0-4h-2V7h2v8z"/>';
  } else {
    indicator.classList.remove('active');
    icon.innerHTML = '<path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>';
  }
}

// Observe page changes to detect meeting state
function observePageChanges() {
  const observer = new MutationObserver((mutations) => {
    // Google Meet specific checks
    if (window.location.hostname === 'meet.google.com') {
      const inCall = document.querySelector('[data-call-state="true"], [jsname="Qx7uuf"]');
      if (inCall && !isInterviewActive) {
        // Auto-show sidebar when joining a call
        const container = document.getElementById('interviewhelper-sidebar-container');
        if (container && container.classList.contains('ih-sidebar-hidden')) {
          setTimeout(() => toggleSidebar(), 1000);
        }
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-call-state']
  });
}

// Platform-specific audio capture setup
function setupAudioCapture() {
  // This will be implemented with platform-specific methods
  // For now, we'll use the Web Speech API as a fallback
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      
      // Send to sidebar
      if (sidebarFrame) {
        sidebarFrame.contentWindow.postMessage({
          type: 'localTranscript',
          transcript: transcript,
          isFinal: event.results[event.results.length - 1].isFinal
        }, '*');
      }
    };
    
    // Start/stop based on interview state
    window.addEventListener('message', (event) => {
      if (event.data.type === 'startRecording') {
        try {
          recognition.start();
        } catch (e) {
          console.log('Recognition already started');
        }
      } else if (event.data.type === 'stopRecording') {
        recognition.stop();
      }
    });
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUI);
} else {
  initializeUI();
}
