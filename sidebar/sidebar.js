// Sidebar functionality for InterviewHelper AI
let isInterviewActive = false;
let interviewStartTime = null;
let timerInterval = null;
let currentTranscript = [];
let currentSuggestions = [];
let currentNotes = [];
let lastSuggestionTimestamp = 0;

// DOM elements
const elements = {
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  startBtn: document.getElementById('startBtn'),
  stopBtn: document.getElementById('stopBtn'),
  timer: document.getElementById('timer'),
  transcriptContainer: document.getElementById('transcriptContainer'),
  suggestionsList: document.getElementById('suggestionsList'),
  notesArea: document.getElementById('notesArea'), // removed from UI; kept for backward compat
  notesList: document.getElementById('notesList'),
  settingsBtn: document.getElementById('settingsBtn'),
  minimizeBtn: document.getElementById('minimizeBtn'),
  settingsModal: document.getElementById('settingsModal'),
  settingsClose: document.getElementById('settingsClose'),
  summaryModal: document.getElementById('summaryModal'),
  summaryClose: document.getElementById('summaryClose'),
  // Prepare section elements
  prepName: document.getElementById('prepName'),
  prepLinkedin: document.getElementById('prepLinkedin'),
  prepGoal: document.getElementById('prepGoal'),
  prepResearchBtn: document.getElementById('prepResearchBtn'),
  prepEditBtn: document.getElementById('prepEditBtn'),
  prepStatus: document.getElementById('prepStatus'),
  prepResearchResults: document.getElementById('prepResearchResults'),
  // Settings elements
  apiKeyInput: document.getElementById('apiKeyInput'),
  modelSelect: document.getElementById('modelSelect'),
  promptInput: document.getElementById('promptInput'),
  // Auth elements
  signInBtn: document.getElementById('signInBtn'),
  signOutBtn: document.getElementById('signOutBtn'),
  userInfo: document.getElementById('userInfo'),
  userEmail: document.getElementById('userEmail'),
  userAvatar: document.getElementById('userAvatar')
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadSettings();
  checkAuthStatus();
  updateUI();
});

// Set up all event listeners
function setupEventListeners() {
  // Interview controls
  elements.startBtn.addEventListener('click', startInterview);
  elements.stopBtn.addEventListener('click', stopInterview);
  
  // Header controls
  elements.settingsBtn.addEventListener('click', toggleSettingsModal);
  elements.minimizeBtn.addEventListener('click', minimizeSidebar);
  if (elements.settingsClose) elements.settingsClose.addEventListener('click', toggleSettingsModal);
  if (elements.summaryClose) elements.summaryClose.addEventListener('click', toggleSummaryModal);
  
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
  if (elements.notesArea) {
    elements.notesArea.addEventListener('input', debounce(saveNotes, 1000));
  }
  
  // Listen for messages from content script
  window.addEventListener('message', handleMessages);

  // Prepare research
  if (elements.prepResearchBtn) {
    elements.prepResearchBtn.addEventListener('click', onClickResearch);
  }
  if (elements.prepEditBtn) {
    elements.prepEditBtn.addEventListener('click', onClickEditPrepare);
  }
  // Settings inputs
  if (elements.apiKeyInput) {
    elements.apiKeyInput.addEventListener('change', saveSettingsFromUI);
  }
  if (elements.modelSelect) {
    elements.modelSelect.addEventListener('change', saveSettingsFromUI);
  }
  if (elements.promptInput) {
    elements.promptInput.addEventListener('input', debounce(saveSettingsFromUI, 500));
  }
  
  // Auth buttons
  if (elements.signInBtn) {
    elements.signInBtn.addEventListener('click', handleSignIn);
  }
  if (elements.signOutBtn) {
    elements.signOutBtn.addEventListener('click', handleSignOut);
  }
}

// Handle messages from content script
function handleMessages(event) {
  const message = (event && event.data) ? event.data : {};
  const type = message && message.type;
  // Support both { type, data: {...} } and flat { type, ...payload }
  const payload = (message && message.data) ? message.data : message;
  if (!type) return;
  
  switch (type) {
    case 'transcriptUpdate': {
      const transcript = payload && payload.transcript ? payload.transcript : [];
      // Avoid clearing UI when background has no transcript (e.g., local-only recognition)
      if (Array.isArray(transcript) && transcript.length > 0) {
        updateTranscript(transcript);
      }
      break;
    }
    case 'localTranscript': {
      const text = (payload && typeof payload.transcript === 'string') ? payload.transcript : '';
      const isFinal = !!(payload && payload.isFinal);
      if (text) addTranscriptEntry(text, isFinal);
      break;
    }
    case 'suggestion': {
      if (payload) addSuggestion(payload);
      break;
    }
    case 'visibility': {
      const visible = !!(payload && payload.visible);
      if (visible) loadInterviewState();
      break;
    }
    default:
      // ignore unrelated messages on the page bus
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
  
  // Check if we're in a standalone session or meeting
  chrome.storage.local.get(['currentSession'], (result) => {
    const isStandalone = result.currentSession && result.currentSession.type === 'standalone';
    
    if (isStandalone) {
      // For standalone sessions, use the new interview message
      chrome.runtime.sendMessage({ action: 'startNewInterview' });
    } else {
      // For meeting sessions, use regular interview start
      chrome.runtime.sendMessage({ action: 'startInterview' });
    }
  });
  
  // Start audio capture (post to page context)
  window.parent.postMessage({ type: 'startRecording' }, '*');
  
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
  
  // Stop audio capture (post to page context)
  window.parent.postMessage({ type: 'stopRecording' }, '*');
  
  // Save interview data
  saveInterviewData();

  // Kick off meeting summary generation
  startSummaryGeneration(true);
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
    // Ask background to classify notes from transcript
    classifyTranscriptNote(text);
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

function classifyTranscriptNote(text) {
  chrome.runtime.sendMessage({ action: 'classifyNote', text }, (response) => {
    if (response && response.ok && response.note) {
      currentNotes.unshift(response.note);
      // Keep only last 100 notes
      if (currentNotes.length > 100) currentNotes = currentNotes.slice(0, 100);
      renderNotes();
      saveNotes();
    }
  });
}

function addSuggestion(suggestion) {
  const now = Date.now();
  // Throttle to one every 4 seconds
  if (now - lastSuggestionTimestamp < 4000) return;
  lastSuggestionTimestamp = now;
  currentSuggestions.unshift({
    id: Date.now(),
    ...suggestion,
    timestamp: new Date()
  });
  
  // Keep only last 5 suggestions
  if (currentSuggestions.length > 5) {
    currentSuggestions = currentSuggestions.slice(0, 5);
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
  chrome.storage.local.set({ currentNotes: currentNotes });
}

function loadNotes() {
  chrome.storage.local.get(['currentNotes'], (result) => {
    const stored = result.currentNotes;
    currentNotes = Array.isArray(stored) ? stored : [];
    renderNotes();
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

function startSummaryGeneration(openModal) {
  const container = document.getElementById('summaryBody') || document.getElementById('summaryContent');
  if (container) {
    container.innerHTML = '<div class="empty-state">Analyzing transcript and notes…</div>';
  }
  if (openModal && elements.summaryModal) elements.summaryModal.style.display = 'block';
  const prepare = {
    name: elements.prepName ? elements.prepName.value.trim() : '',
    linkedin: elements.prepLinkedin ? elements.prepLinkedin.value.trim() : '',
    goal: elements.prepGoal ? elements.prepGoal.value.trim() : ''
  };
  chrome.runtime.sendMessage({ action: 'generateSummary', payload: {
    transcript: currentTranscript,
    notes: currentNotes,
    suggestions: currentSuggestions,
    prepare
  } }, (resp) => {
    if (!resp || !resp.ok) {
      if (container) container.innerHTML = '<div class="empty-state">Failed to generate summary</div>';
      return;
    }
    const s = resp.summary;
    const html = `
      <div class="transcript-entry"><div class="transcript-speaker">Interviewee</div><div>${s.interviewee || ''}</div></div>
      <div class="transcript-entry"><div class="transcript-speaker">Meeting Goal</div><div>${s.goal || ''}</div></div>
      <div class="transcript-entry"><div class="transcript-speaker">Highlights</div><div>${(s.highlights&&s.highlights.length? s.highlights.map(h=>`• ${h}`).join('<br/>') : '<em>Processing…</em>')}</div></div>
      <div class="transcript-entry"><div class="transcript-speaker">Noteworthy Comments</div><div>${(s.quotes&&s.quotes.length? s.quotes.map(q=>`“${q}”`).join('<br/>') : '<em>Processing…</em>')}</div></div>
      <div class="transcript-entry"><div class="transcript-speaker">Next Steps</div><div>${(s.nextSteps&&s.nextSteps.length? s.nextSteps.map(n=>`• ${n}`).join('<br/>') : '<em>Processing…</em>')}</div></div>
      <div class="transcript-entry"><div class="transcript-speaker">Potential Feature Needs</div><div>${(s.features&&s.features.length? s.features.map(f=>`• ${f}`).join('<br/>') : '<em>Processing…</em>')}</div></div>
      <div style="margin-top: 12px; text-align: right;"><a href="${window.location.hostname === 'localhost' ? 'http://localhost:3000/dashboard' : 'https://interviewhelper.vercel.app/dashboard'}" target="_blank">See Interview history →</a></div>
    `;
    if (container) container.innerHTML = html;
  });
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
  try {
    const d = (date instanceof Date) ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (_) {
    return '';
  }
}

function copySuggestionToClipboard(suggestionElement) {
  const text = suggestionElement.textContent.replace(/^[A-Z\s]+/, '').trim();
  
  navigator.clipboard.writeText(text).then(() => {
    suggestionElement.style.background = '#dcfce7';
    setTimeout(() => { suggestionElement.style.background = ''; }, 1000);
  }).catch(() => {
    // Fallback for pages that block Clipboard API via Permissions Policy
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.left = '-1000px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(textarea);
    suggestionElement.style.background = '#dcfce7';
    setTimeout(() => { suggestionElement.style.background = ''; }, 1000);
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
  // Deprecated
}

function toggleSettingsModal() {
  if (!elements.settingsModal) return;
  const visible = elements.settingsModal.style.display === 'block';
  elements.settingsModal.style.display = visible ? 'none' : 'block';
}

function toggleSummaryModal() {
  if (!elements.summaryModal) return;
  const visible = elements.summaryModal.style.display === 'block';
  elements.summaryModal.style.display = visible ? 'none' : 'block';
}

function minimizeSidebar() {
  // Try to let the content script know to hide the sidebar
  try { window.parent.postMessage({ type: 'minimize' }, '*'); } catch (_) {}
  // Also close the settings modal if open
  if (elements.settingsModal) elements.settingsModal.style.display = 'none';
}

function loadSettings() {
  chrome.storage.local.get(['settings', 'apiKey'], (result) => {
    const settings = result.settings || {};
    // Populate model list from background when API key is present; otherwise default list
    const setModels = (arr) => {
      if (!elements.modelSelect) return;
      elements.modelSelect.innerHTML = '';
      // Ensure our preferred models are present and ordered
      const preferred = ['gpt-5', 'gpt-4o'];
      let models = Array.isArray(arr) && arr.length > 0 ? arr : ['gpt-4o'];
      models = Array.from(new Set([...preferred, ...models]));
      models.forEach((modelName) => {
        const option = document.createElement('option');
        option.value = modelName;
        option.textContent = modelName;
        elements.modelSelect.appendChild(option);
      });
    };
    if (result.apiKey) {
      chrome.runtime.sendMessage({ action: 'listModels' }, (resp) => {
        if (resp && resp.ok) setModels(resp.models);
        else setModels();
        if (elements.modelSelect) elements.modelSelect.value = settings.aiModel || 'gpt-5';
      });
    } else {
      setModels();
    }
    if (elements.apiKeyInput) elements.apiKeyInput.value = result.apiKey || settings.apiKey || '';
    if (elements.promptInput) {
      const defaultPrompt = 'You are an expert interview copilot. Keep responses concise, actionable, and context-aware. Suggest follow-ups, probes, and clarifications. Avoid repeating user text. If unsure, ask a clarifying question. Output short, useful guidance.';
      elements.promptInput.placeholder = defaultPrompt;
      elements.promptInput.value = settings.prompt || '';
      if (!elements.promptInput.value) {
        // Initialize the prompt field with a sensible default so it’s visible to users
        elements.promptInput.value = defaultPrompt;
        chrome.storage.local.set({ settings: { ...settings, prompt: defaultPrompt } });
      }
    }
    if (settings.prepare) {
      if (elements.prepName) elements.prepName.value = settings.prepare.name || '';
      if (elements.prepLinkedin) elements.prepLinkedin.value = settings.prepare.linkedin || '';
      if (elements.prepGoal) elements.prepGoal.value = settings.prepare.goal || '';
    }
  });
}

function saveInterviewData() {
  const interviewData = {
    id: Date.now(),
    startTime: interviewStartTime,
    endTime: new Date(),
    transcript: currentTranscript,
    suggestions: currentSuggestions,
    notes: currentNotes,
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
      // Load persisted transcript and suggestions if available
      chrome.runtime.sendMessage({ action: 'getTranscript' }, (res2) => {
        if (res2 && Array.isArray(res2.transcript)) {
          updateTranscript(res2.transcript);
        }
      });
    }
  });
}

function renderNotes() {
  if (!elements.notesList) return;
  if (!currentNotes || currentNotes.length === 0) {
    elements.notesList.innerHTML = '<div class="empty-state">AI notes will appear here</div>';
    return;
  }
  const html = currentNotes.map((n) => {
    const ts = n.timestamp ? new Date(n.timestamp) : new Date();
    const dateStr = ts.toLocaleString();
    const tag = n.tag || n.category || 'note';
    return `
      <div class="transcript-entry">
        <div class="transcript-speaker">${tag} • ${dateStr}</div>
        <div>${n.text || n.content || ''}</div>
      </div>
    `;
  }).join('');
  elements.notesList.innerHTML = html;
}

// Settings helpers
function saveSettingsFromUI() {
  const apiKey = elements.apiKeyInput ? elements.apiKeyInput.value.trim() : '';
  const aiModel = elements.modelSelect ? elements.modelSelect.value : 'gpt-4o-mini';
  const prompt = elements.promptInput ? elements.promptInput.value : '';
  const prepare = {
    name: elements.prepName ? elements.prepName.value.trim() : '',
    linkedin: elements.prepLinkedin ? elements.prepLinkedin.value.trim() : '',
    goal: elements.prepGoal ? elements.prepGoal.value.trim() : ''
  };

  chrome.storage.local.set({
    apiKey,
    settings: {
      aiModel,
      prompt,
      prepare
    }
  });
}

function onClickResearch() {
  const name = elements.prepName ? elements.prepName.value.trim() : '';
  const linkedin = elements.prepLinkedin ? elements.prepLinkedin.value.trim() : '';
  const goal = elements.prepGoal ? elements.prepGoal.value.trim() : '';
  if (!name && !linkedin && !goal) return;
  if (elements.prepStatus) elements.prepStatus.textContent = 'Researching...';
  // Lock fields during research
  [elements.prepName, elements.prepLinkedin, elements.prepGoal].forEach(el => { if (el) el.disabled = true; });
  if (elements.prepResearchResults) elements.prepResearchResults.innerHTML = '';
  saveSettingsFromUI();

  chrome.runtime.sendMessage({ action: 'performResearch', payload: { name, linkedin, goal } }, (response) => {
    if (!response || !response.ok) {
      if (elements.prepStatus) elements.prepStatus.textContent = 'Research failed';
      [elements.prepName, elements.prepLinkedin, elements.prepGoal].forEach(el => { if (el) el.disabled = false; });
      return;
    }
    const notes = Array.isArray(response.notes) ? response.notes : [];
    const html = notes.map((n) => `
      <div class="transcript-entry">
        <div class="transcript-speaker">${(n && n.source) ? n.source : 'AI Research'}</div>
        <div>${(n && n.text) ? n.text : ''}</div>
      </div>
    `).join('');
    if (elements.prepResearchResults) elements.prepResearchResults.innerHTML = html || '<div class="empty-state">No findings</div>';
    if (elements.prepStatus) elements.prepStatus.textContent = 'Research complete';
    if (response.updatedPrompt && elements.promptInput) {
      elements.promptInput.value = response.updatedPrompt;
    }
    // Persist updated prompt in UI settings immediately
    saveSettingsFromUI();
    // Keep fields locked after success; show Edit button
    if (elements.prepEditBtn) elements.prepEditBtn.style.display = 'inline-block';
  });
}

function onClickEditPrepare() {
  [elements.prepName, elements.prepLinkedin, elements.prepGoal].forEach(el => { if (el) el.disabled = false; });
  if (elements.prepStatus) elements.prepStatus.textContent = 'Editing…';
}

// Auth functions
function checkAuthStatus() {
  chrome.storage.local.get(['userInfo'], (result) => {
    if (result.userInfo) {
      showSignedInState(result.userInfo);
    } else {
      showSignedOutState();
    }
  });
}

function handleSignIn() {
  // Open the website sign-in page in a new tab
  chrome.tabs.create({ url: 'https://ideafeedback.co/sign-in' });
  
  // Start checking for successful auth
  const checkInterval = setInterval(async () => {
    try {
      const response = await fetch('https://ideafeedback.co/api/extension/auth-check', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          // Save user info to storage
          chrome.storage.local.set({ userInfo: data.user }, () => {
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

function handleSignOut() {
  chrome.storage.local.remove(['userInfo'], () => {
    showSignedOutState();
  });
}

function showSignedInState(user) {
  if (elements.signInBtn) elements.signInBtn.style.display = 'none';
  if (elements.userInfo) elements.userInfo.style.display = 'block';
  if (elements.userEmail) elements.userEmail.textContent = user.email || '';
  if (elements.userAvatar && user.imageUrl) {
    elements.userAvatar.src = user.imageUrl;
    elements.userAvatar.style.display = 'block';
  }
}

function showSignedOutState() {
  if (elements.signInBtn) elements.signInBtn.style.display = 'block';
  if (elements.userInfo) elements.userInfo.style.display = 'none';
}
