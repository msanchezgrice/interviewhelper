// Sidebar functionality for InterviewHelper AI
let isInterviewActive = false;
let interviewStartTime = null;
let timerInterval = null;
let currentTranscript = [];
let currentSuggestions = [];

// DOM elements
const elements = {
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  startBtn: document.getElementById('startBtn'),
  stopBtn: document.getElementById('stopBtn'),
  timer: document.getElementById('timer'),
  transcriptContainer: document.getElementById('transcriptContainer'),
  suggestionsList: document.getElementById('suggestionsList'),
  notesArea: document.getElementById('notesArea'),
  settingsBtn: document.getElementById('settingsBtn'),
  minimizeBtn: document.getElementById('minimizeBtn')
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadSettings();
  updateUI();
});

// Set up all event listeners
function setupEventListeners() {
  // Interview controls
  elements.startBtn.addEventListener('click', startInterview);
  elements.stopBtn.addEventListener('click', stopInterview);
  
  // Header controls
  elements.settingsBtn.addEventListener('click', openSettings);
  elements.minimizeBtn.addEventListener('click', minimizeSidebar);
  
  // Section collapse/expand
  document.querySelectorAll('.collapse-btn').forEach(btn => {
    btn.addEventListener('click', toggleSection);
  });
  
  // Quick actions for notes
  document.querySelectorAll('.quick-action').forEach(action => {
    action.addEventListener('click', (e) => {
      const noteType = e.target.dataset.note;
      addQuickNote(noteType);
    });
  });
  
  // Suggestion clicks
  elements.suggestionsList.addEventListener('click', (e) => {
    if (e.target.closest('.suggestion-item')) {
      copySuggestionToClipboard(e.target.closest('.suggestion-item'));
    }
  });
  
  // Auto-save notes
  elements.notesArea.addEventListener('input', debounce(saveNotes, 1000));
  
  // Listen for messages from content script
  window.addEventListener('message', handleMessages);
}

// Handle messages from content script
function handleMessages(event) {
  const { type, data } = event.data;
  
  switch (type) {
    case 'transcriptUpdate':
      updateTranscript(data.transcript);
      break;
    case 'localTranscript':
      addTranscriptEntry(data.transcript, data.isFinal);
      break;
    case 'suggestion':
      addSuggestion(data);
      break;
    case 'visibility':
      if (data.visible) {
        loadInterviewState();
      }
      break;
  }
}

// Interview controls
function startInterview() {
  isInterviewActive = true;
  interviewStartTime = new Date();
  
  // Update UI
  updateInterviewState(true);
  
  // Start timer
  startTimer();
  
  // Clear previous data
  clearTranscript();
  clearSuggestions();
  
  // Notify background script
  chrome.runtime.sendMessage({ action: 'startInterview' });
  
  // Start audio capture
  window.postMessage({ type: 'startRecording' }, '*');
  
  // Generate initial suggestions
  setTimeout(() => {
    generateInitialSuggestions();
  }, 2000);
}

function stopInterview() {
  isInterviewActive = false;
  
  // Update UI
  updateInterviewState(false);
  
  // Stop timer
  stopTimer();
  
  // Notify background script
  chrome.runtime.sendMessage({ action: 'stopInterview' });
  
  // Stop audio capture
  window.postMessage({ type: 'stopRecording' }, '*');
  
  // Save interview data
  saveInterviewData();
}

// Timer functionality
function startTimer() {
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimer() {
  if (!interviewStartTime) return;
  
  const now = new Date();
  const elapsed = Math.floor((now - interviewStartTime) / 1000);
  
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  elements.timer.textContent = timeString;
}

// Transcript management
function updateTranscript(transcript) {
  currentTranscript = transcript;
  renderTranscript();
}

function addTranscriptEntry(text, isFinal) {
  if (!text.trim()) return;
  
  const entry = {
    id: Date.now(),
    text: text.trim(),
    timestamp: new Date(),
    speaker: 'User', // Could be enhanced with speaker detection
    isFinal: isFinal
  };
  
  // Update or add entry
  const existingIndex = currentTranscript.findIndex(t => !t.isFinal);
  if (existingIndex >= 0 && !isFinal) {
    currentTranscript[existingIndex] = entry;
  } else {
    currentTranscript.push(entry);
  }
  
  renderTranscript();
  
  // Generate AI suggestions based on new transcript
  if (isFinal && isInterviewActive) {
    requestAISuggestion(text);
  }
}

function renderTranscript() {
  if (currentTranscript.length === 0) {
    elements.transcriptContainer.innerHTML = '<div class="empty-state">Transcript will appear here when interview starts</div>';
    return;
  }
  
  const html = currentTranscript.map(entry => `
    <div class="transcript-entry ${!entry.isFinal ? 'interim' : ''}">
      <div class="transcript-speaker">${entry.speaker} - ${formatTime(entry.timestamp)}</div>
      <div>${entry.text}</div>
    </div>
  `).join('');
  
  elements.transcriptContainer.innerHTML = html;
  elements.transcriptContainer.scrollTop = elements.transcriptContainer.scrollHeight;
}

function clearTranscript() {
  currentTranscript = [];
  renderTranscript();
}

// AI Suggestions
function requestAISuggestion(context) {
  chrome.runtime.sendMessage({
    action: 'getSuggestion',
    context: {
      recentTranscript: currentTranscript.slice(-5),
      currentText: context
    }
  }, (response) => {
    if (response && response.suggestion) {
      addSuggestion(response.suggestion);
    }
  });
}

function addSuggestion(suggestion) {
  currentSuggestions.unshift({
    id: Date.now(),
    ...suggestion,
    timestamp: new Date()
  });
  
  // Keep only last 10 suggestions
  if (currentSuggestions.length > 10) {
    currentSuggestions = currentSuggestions.slice(0, 10);
  }
  
  renderSuggestions();
}

function renderSuggestions() {
  if (currentSuggestions.length === 0) {
    elements.suggestionsList.innerHTML = '<div class="empty-state">AI suggestions will appear here during the interview</div>';
    return;
  }
  
  const html = currentSuggestions.map(suggestion => `
    <div class="suggestion-item" data-suggestion-id="${suggestion.id}">
      <div class="suggestion-type">${suggestion.type}</div>
      <div>${suggestion.content}</div>
    </div>
  `).join('');
  
  elements.suggestionsList.innerHTML = html;
}

function clearSuggestions() {
  currentSuggestions = [];
  renderSuggestions();
}

function generateInitialSuggestions() {
  const initialSuggestions = [
    {
      type: 'welcome',
      content: 'Start with a warm greeting and brief introduction of the session goals.'
    },
    {
      type: 'icebreaker',
      content: 'Ask an open-ended question to help the participant feel comfortable.'
    },
    {
      type: 'context',
      content: 'Gather background information relevant to your research objectives.'
    }
  ];
  
  initialSuggestions.forEach(suggestion => addSuggestion(suggestion));
}

// Notes functionality
function addQuickNote(noteType) {
  const timestamp = formatTime(new Date());
  const noteText = `\n[${timestamp}] ${noteType}: `;
  
  elements.notesArea.value += noteText;
  elements.notesArea.focus();
  
  // Position cursor at end
  elements.notesArea.setSelectionRange(elements.notesArea.value.length, elements.notesArea.value.length);
  
  saveNotes();
}

function saveNotes() {
  chrome.storage.local.set({
    currentNotes: elements.notesArea.value
  });
}

function loadNotes() {
  chrome.storage.local.get(['currentNotes'], (result) => {
    if (result.currentNotes) {
      elements.notesArea.value = result.currentNotes;
    }
  });
}

// UI helpers
function updateInterviewState(active) {
  isInterviewActive = active;
  
  if (active) {
    elements.statusDot.classList.add('active');
    elements.statusText.textContent = 'Interview in progress';
    elements.startBtn.disabled = true;
    elements.stopBtn.disabled = false;
  } else {
    elements.statusDot.classList.remove('active');
    elements.statusText.textContent = 'Ready to start interview';
    elements.startBtn.disabled = false;
    elements.stopBtn.disabled = true;
  }
}

function updateUI() {
  updateInterviewState(isInterviewActive);
  loadNotes();
}

function toggleSection(e) {
  const button = e.target;
  const section = button.closest('.section');
  const isCollapsed = section.classList.contains('collapsed');
  
  if (isCollapsed) {
    section.classList.remove('collapsed');
    button.textContent = '▼';
  } else {
    section.classList.add('collapsed');
    button.textContent = '▶';
  }
  
  // Save collapsed state
  const sectionName = button.dataset.section;
  if (sectionName) {
    chrome.storage.local.set({
      [`section_${sectionName}_collapsed`]: !isCollapsed
    });
  }
}

// Utility functions
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function copySuggestionToClipboard(suggestionElement) {
  const text = suggestionElement.textContent.replace(/^[A-Z\s]+/, '').trim();
  
  navigator.clipboard.writeText(text).then(() => {
    // Visual feedback
    suggestionElement.style.background = '#dcfce7';
    setTimeout(() => {
      suggestionElement.style.background = '';
    }, 1000);
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function openSettings() {
  // For now, just show an alert - could be expanded to open settings modal
  alert('Settings panel coming soon! For now, you can configure the extension from the Chrome extensions page.');
}

function minimizeSidebar() {
  window.parent.postMessage({ type: 'minimize' }, '*');
}

function loadSettings() {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    // Apply any UI settings here
  });
}

function saveInterviewData() {
  const interviewData = {
    id: Date.now(),
    startTime: interviewStartTime,
    endTime: new Date(),
    transcript: currentTranscript,
    suggestions: currentSuggestions,
    notes: elements.notesArea.value,
    duration: interviewStartTime ? new Date() - interviewStartTime : 0
  };
  
  chrome.storage.local.get(['interviews'], (result) => {
    const interviews = result.interviews || [];
    interviews.push(interviewData);
    chrome.storage.local.set({ interviews });
  });
}

function loadInterviewState() {
  // Check if there's an active interview
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    if (response && response.isActive) {
      // Resume interview state
      isInterviewActive = true;
      interviewStartTime = new Date(response.startTime);
      updateInterviewState(true);
      startTimer();
    }
  });
}
