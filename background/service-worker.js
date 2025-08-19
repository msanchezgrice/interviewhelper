// Background service worker for InterviewHelper AI
let activeTabId = null;
let isRecording = false;
let transcriptionWorker = null;
let currentTranscript = [];
let interviewStartTime = null;
let supabaseClient = null;
let currentInterviewId = null;
let transcriptUpdateIntervalId = null;
let offscreenCreated = false;

// Supabase configuration - inline to avoid import issues
const SUPABASE_URL = 'https://ftmcmonyfetjeimoxrbt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bWNtb255ZmV0amVpbW94cmJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODQ5MTMsImV4cCI6MjA2NzU2MDkxM30.UOEOIpUlG-r4pJ6Kb1xsL1s36RBoS9SAQA6pq2oYi4g';

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('InterviewHelper AI installed');
  
  // Note: Supabase client will be initialized when first needed
  console.log('Extension initialized successfully');
  
  chrome.storage.local.set({
    settings: {
      apiKey: '',
      aiModel: 'gpt-4o',
      autoTranscribe: true,
      showSuggestions: true,
      theme: 'light'
    }
  });
});

// Keep service worker active
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
});

// Handle alarms to keep service worker alive
chrome.alarms.onAlarm.addListener(() => {
  console.log('Keep-alive alarm triggered');
});

// Set up periodic alarm to keep service worker active
chrome.alarms.create('keep-alive', { periodInMinutes: 1 });

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getStatus':
      sendResponse({ 
        initialized: true, 
        isRecording: isRecording,
        isActive: isRecording,
        startTime: interviewStartTime,
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
    
    case 'transcriptFragment':
      if (request.text && typeof request.text === 'string' && request.text.trim()) {
        const entry = {
          id: Date.now(),
          text: request.text.trim(),
          timestamp: new Date(),
          speaker: 'User',
          isFinal: request.isFinal !== false
        };
        currentTranscript.push(entry);
        if (activeTabId) {
          chrome.tabs.sendMessage(activeTabId, {
            action: 'transcriptUpdate',
            transcript: currentTranscript
          });
        }
      }
      sendResponse({ success: true });
      break;
    
    case 'startNewInterview':
      // Start interview on current active tab if available; otherwise fallback to first normal tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        if (tab && tab.id) {
          startInterview(tab.id);
        } else {
          chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] }, (all) => {
            const first = all && all[0];
            if (first && first.id) {
              startInterview(first.id);
            }
          });
        }
      });
      sendResponse({ success: true });
      break;
    
    case 'startStandaloneInterview':
      // Start a standalone interview session on any tab
      const targetTabId = request.tabId;
      if (targetTabId) {
        startStandaloneInterview(targetTabId);
        sendResponse({ success: true });
      } else {
        // If no tab ID provided, use current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            startStandaloneInterview(tabs[0].id);
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'No active tab found' });
          }
        });
      }
      return true; // Keep message channel open for async response
    case 'performResearch':
      performResearchTask(request.payload).then((result) => {
        sendResponse(result);
      }).catch((e) => {
        sendResponse({ ok: false, error: e?.message || 'Research failed' });
      });
      return true;
    case 'listModels':
      listOpenAIModels().then((result) => {
        sendResponse(result);
      }).catch((e) => {
        sendResponse({ ok: false, error: e?.message || 'Unable to list models' });
      });
      return true;
    case 'classifyNote':
      classifyNoteFromText(request.text).then((note) => {
        sendResponse({ ok: true, note });
      }).catch((e) => {
        console.warn('classifyNote error', e);
        sendResponse({ ok: false });
      });
      return true;
    case 'generateSummary':
      generateMeetingSummary(request.payload).then((summary) => {
        sendResponse({ ok: true, summary });
      }).catch((e) => {
        console.error('generateSummary error', e);
        sendResponse({ ok: false, error: e?.message || 'Summary failed' });
      });
      return true;
    case 'offscreen:error':
      console.warn('Offscreen error reported:', request.error);
      if (activeTabId) {
        try { chrome.tabs.sendMessage(activeTabId, { action: 'startLocalRecording' }); } catch (_) {}
      }
      sendResponse?.({ ok: true });
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
  
  // Ensure UI is injected on any page (not just meeting sites)
  ensureContentInjected(tabId);
  
  // Initialize periodic transcript updates to UI
  initializeTranscription();
  
  // Start microphone capture via offscreen document
  startMicRecording();
  
  // Notify content script
  chrome.tabs.sendMessage(tabId, {
    action: 'interviewStarted',
    startTime: interviewStartTime
  });
}

// Start standalone interview recording (works on any tab)
function startStandaloneInterview(tabId) {
  activeTabId = tabId;
  isRecording = true;
  interviewStartTime = new Date();
  currentTranscript = [];
  
  // Store that this is a standalone session
  chrome.storage.local.set({ 
    currentSession: {
      type: 'standalone',
      tabId: tabId,
      startTime: interviewStartTime,
      isActive: true
    }
  });
  
  // Inject the UI into the current tab regardless of domain
  ensureContentInjected(tabId);
  
  // Initialize transcription
  initializeTranscription();
  
  // Start microphone capture via offscreen document
  startMicRecording();
  
  // Notify content script with standalone flag
  setTimeout(() => {
    chrome.tabs.sendMessage(tabId, {
      action: 'interviewStarted',
      startTime: interviewStartTime,
      isStandalone: true
    });
  }, 500); // Small delay to ensure content script is injected
}

// Stop interview recording
function stopInterview() {
  isRecording = false;
  
  if (transcriptionWorker) {
    transcriptionWorker.terminate();
    transcriptionWorker = null;
  }
  
  if (transcriptUpdateIntervalId) {
    clearInterval(transcriptUpdateIntervalId);
    transcriptUpdateIntervalId = null;
  }
  
  // Stop microphone capture
  stopMicRecording();
  
  // Save interview data (do not block; API work can continue afterwards)
  setTimeout(() => {
    try { saveInterviewData(); } catch (_) {}
  }, 0);
  
  // Clear session data
  chrome.storage.local.remove('currentSession');
  
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
  if (transcriptUpdateIntervalId) {
    clearInterval(transcriptUpdateIntervalId);
  }
  transcriptUpdateIntervalId = setInterval(() => {
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
    const stored = await chrome.storage.local.get(['settings', 'apiKey']);
    const apiKey = stored.apiKey;
    let aiModel = (stored.settings && stored.settings.aiModel) ? stored.settings.aiModel : 'gpt-4o';
    
    if (!apiKey) {
      return {
        type: 'error',
        content: 'Please set your API key in the extension settings'
      };
    }
    const systemMessage = {
      role: 'system',
      content: 'You are an expert user interview copilot. Generate ONE concise interview follow-up question. Return JSON only: {"type":"followup|probe|clarify","content":"..."}.'
    };
    const recent = Array.isArray(context?.recentTranscript) ? context.recentTranscript : [];
    const userMessage = {
      role: 'user',
      content: `Recent transcript entries: ${recent.map(e => (e.text || e).toString()).join(' | ')}\nCurrent text: ${context?.currentText || ''}\nRespond with JSON only.`
    };

    // Try Chat Completions first
    const chatResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [systemMessage, userMessage],
        temperature: 0.7
      })
    });

    let textOutput = '';
    if (chatResp.ok) {
      const data = await chatResp.json();
      textOutput = data.choices?.[0]?.message?.content?.trim() || '';
    } else {
      console.warn('Chat API failed for model', aiModel, 'status', chatResp.status);
      // Fallback: retry with gpt-4o
      const fallbackModel = 'gpt-4o';
      const chatResp2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model: fallbackModel, messages: [systemMessage, userMessage], temperature: 0.7 })
      });
      if (chatResp2.ok) {
        const data2 = await chatResp2.json();
        textOutput = data2.choices?.[0]?.message?.content?.trim() || '';
      } else {
        // Fallback to Responses API as last resort
        const resp2 = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: aiModel,
            input: `${systemMessage.content}\n\n${userMessage.content}`
          })
        });
        if (!resp2.ok) {
          const errText = await resp2.text();
          throw new Error(`OpenAI error: ${resp2.status} ${errText}`);
        }
        const data3 = await resp2.json();
        textOutput = (data3.output_text || data3.text || data3.content || '').toString().trim();
      }
    }

    let suggestionObj = null;
    try {
      const jsonStart = textOutput.indexOf('{');
      const jsonEnd = textOutput.lastIndexOf('}');
      const jsonStr = jsonStart >= 0 && jsonEnd >= jsonStart ? textOutput.slice(jsonStart, jsonEnd + 1) : textOutput;
      suggestionObj = JSON.parse(jsonStr);
    } catch (e) {
      suggestionObj = { type: 'followup', content: textOutput || 'Could you elaborate on that?' };
    }

    if (!suggestionObj || typeof suggestionObj.content !== 'string') {
      suggestionObj = { type: 'followup', content: 'Could you elaborate on that?' };
    }
    if (!suggestionObj.type) suggestionObj.type = 'followup';
    return suggestionObj;
  } catch (error) {
    console.error('Error generating suggestion:', error);
    return {
      type: 'error',
      content: 'Unable to generate suggestion'
    };
  }
}

// Fetch available OpenAI models and return a curated list
async function listOpenAIModels() {
  try {
    const stored = await chrome.storage.local.get(['apiKey']);
    const apiKey = stored.apiKey;
    if (!apiKey) return { ok: true, models: [] };
    const resp = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`OpenAI error: ${resp.status} ${t}`);
    }
    const data = await resp.json();
    const names = (data?.data || []).map((m) => m?.id).filter(Boolean);
    // Curate to show latest general-purpose chat models
    const preferredPrefixes = ['gpt-4o', 'o3', 'o4', 'gpt-4.1'];
    const filtered = names.filter((n) => preferredPrefixes.some((p) => n.startsWith(p)));
    const unique = Array.from(new Set(filtered));
    // Sort by heuristic: longer/newer first lexicographically
    unique.sort();
    return { ok: true, models: unique };
  } catch (error) {
    console.error('listOpenAIModels error', error);
    return { ok: false, error: error?.message || 'Unknown error' };
  }
}

// Perform lightweight research via OpenAI using the provided fields
async function performResearchTask(payload) {
  try {
    const stored = await chrome.storage.local.get(['settings', 'apiKey']);
    const apiKey = stored.apiKey || stored?.settings?.apiKey || '';
    let aiModel = (stored.settings && stored.settings.aiModel) ? stored.settings.aiModel : 'gpt-4o';
    const basePrompt = (stored.settings && stored.settings.prompt) ? stored.settings.prompt : '';
    
    console.log('performResearchTask - API Key exists:', !!apiKey);
    console.log('performResearchTask - Model:', aiModel);
    
    if (!apiKey) {
      console.error('No API key found in storage');
      return { ok: false, error: 'Missing OpenAI API key in Settings' };
    }
    const { name = '', linkedin = '', goal = '' } = payload || {};
    const researchInstructions = `You are a rigorous research assistant.
STRICT REQUIREMENTS:
- Do NOT fabricate or guess. If you cannot verify information from the provided LinkedIn URL or reputable public sources, return no notes (empty array).
- Prefer facts that are likely to be stable (role, company, skills). Avoid precise dates unless clearly stated.
- Limit output to at most 5 brief notes. Each note must include a concise fact and an indicative source label: "LinkedIn" or "Web".
- If nothing verifiable is found, return {"notes":[], "updatedPrompt":"${basePrompt}"}.
OUTPUT: Valid JSON only: {"notes":[{"source":"LinkedIn|Web","text":"..."}], "updatedPrompt":"..."}
CONTEXT:\nName: ${name}\nLinkedIn: ${linkedin}\nInterview goal: ${goal}\nExisting system prompt: ${basePrompt}`;

    let resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: 'Respond with valid JSON only. No prose.' },
          { role: 'user', content: researchInstructions }
        ],
        temperature: 0,
        top_p: 0,
        seed: 42,
        response_format: { type: 'json_object' }
      })
    });
    if (!resp.ok) {
      console.warn('Research Chat API failed for model', aiModel, 'status', resp.status);
      aiModel = 'gpt-4o';
      resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            { role: 'system', content: 'Respond with valid JSON only. No prose.' },
            { role: 'user', content: researchInstructions }
          ],
          temperature: 0,
          top_p: 0,
          seed: 42,
          response_format: { type: 'json_object' }
        })
      });
      if (!resp.ok && resp.status === 400) {
        // Retry without response_format for models that don't support it
        resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: aiModel,
            messages: [
              { role: 'system', content: 'Respond with valid JSON only. No prose.' },
              { role: 'user', content: researchInstructions }
            ],
            temperature: 0,
            top_p: 0,
            seed: 42
          })
        });
      }
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`OpenAI error: ${resp.status} ${t}`);
      }
    }
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '{}';
    let parsed;
    try {
      const s = content.indexOf('{');
      const e = content.lastIndexOf('}');
      parsed = JSON.parse(s >= 0 ? content.slice(s, e + 1) : content);
    } catch (_) {
      parsed = {};
    }
    const notes = Array.isArray(parsed.notes) ? parsed.notes : [];
    const updatedPrompt = typeof parsed.updatedPrompt === 'string' ? parsed.updatedPrompt : basePrompt;

    // Compose a deterministic prompt that always includes the verified goal and notes
    const cleanNotes = notes.filter(n => n && typeof n.text === 'string' && n.text.trim());
    const contextLines = [];
    if (goal && goal.trim()) contextLines.push(`Interview goal: ${goal.trim()}`);
    if (cleanNotes.length) {
      contextLines.push('Research notes:');
      cleanNotes.slice(0, 5).forEach(n => {
        const src = (typeof n.source === 'string' && n.source.trim()) ? n.source.trim() : 'Web';
        contextLines.push(`- (${src}) ${n.text.trim()}`);
      });
    }
    const composedPrompt = [updatedPrompt || basePrompt || '', contextLines.join('\n')].filter(Boolean).join('\n\n');

    // Persist updated prompt back into settings
    const newSettings = {
      ...(stored.settings || {}),
      prompt: composedPrompt,
      prepare: { name, linkedin, goal }
    };
    await chrome.storage.local.set({ settings: newSettings });

    return { ok: true, notes, updatedPrompt: composedPrompt };
  } catch (error) {
    console.error('performResearchTask error', error);
    return { ok: false, error: error?.message || 'Unknown error' };
  }
}

// Classify a single transcript fragment into an AI-generated note
async function classifyNoteFromText(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return null;
  }
  const stored = await chrome.storage.local.get(['settings', 'apiKey']);
  const apiKey = stored.apiKey || stored?.settings?.apiKey || '';
  let aiModel = (stored.settings && stored.settings.aiModel) ? stored.settings.aiModel : 'gpt-5';
  if (!apiKey) return null;
  const system = {
    role: 'system',
    content: 'You convert transcript snippets into brief interview notes. Do not invent. If the text is trivial, return a short paraphrase. Classify into one of: "Key insight", "Follow up", "Pain point", "Opportunity". Return JSON only: {"tag":"...","text":"..."}.'
  };
  const user = { role: 'user', content: text.slice(0, 800) };
  let resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: aiModel, messages: [system, user], temperature: 0, top_p: 0, seed: 42, response_format: { type: 'json_object' } })
  });
  if (!resp.ok) {
    console.warn('classifyNote Chat API failed', aiModel, resp.status);
    aiModel = 'gpt-4o';
    resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: aiModel, messages: [system, user], temperature: 0, top_p: 0, seed: 42, response_format: { type: 'json_object' } })
    });
    if (!resp.ok) return null;
  }
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content?.trim() || '{}';
  let parsed;
  try {
    const s = content.indexOf('{');
    const e = content.lastIndexOf('}');
    parsed = JSON.parse(s >= 0 ? content.slice(s, e + 1) : content);
  } catch (_) { parsed = {}; }
  const note = {
    id: Date.now(),
    tag: parsed.tag || 'Note',
    text: parsed.text || text.trim(),
    timestamp: new Date().toISOString()
  };
  return note;
}

// Generate meeting summary using transcript, notes, suggestions, and prepare
async function generateMeetingSummary(payload) {
  const stored = await chrome.storage.local.get(['settings', 'apiKey']);
  const apiKey = stored.apiKey || stored?.settings?.apiKey || '';
  let aiModel = (stored.settings && stored.settings.aiModel) ? stored.settings.aiModel : 'gpt-5';
  
  console.log('generateMeetingSummary - API Key exists:', !!apiKey);
  console.log('generateMeetingSummary - Model:', aiModel);
  
  if (!apiKey) {
    console.error('No API key found for meeting summary');
    throw new Error('Missing API key');
  }
  const { transcript = [], notes = [], suggestions = [], prepare = {} } = payload || {};
  const system = {
    role: 'system',
    content: 'You produce structured meeting summaries. Respond with valid JSON only.'
  };
  const user = {
    role: 'user',
    content: JSON.stringify({
      schema: {
        interviewee: 'string',
        goal: 'string',
        highlights: ['string'],
        quotes: ['string'],
        nextSteps: ['string'],
        features: ['string']
      },
      prepare,
      transcript,
      notes,
      suggestions
    }) + '\nReturn JSON exactly matching: {"interviewee":"","goal":"","highlights":[],"quotes":[],"nextSteps":[],"features":[]}. If any field is unknown, leave it empty or [].'
  };
  let resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: aiModel, messages: [system, user], temperature: 0, top_p: 0, seed: 42, response_format: { type: 'json_object' } })
  });
  if (!resp.ok) {
    aiModel = 'gpt-4o';
    resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: aiModel, messages: [system, user], temperature: 0, top_p: 0, seed: 42, response_format: { type: 'json_object' } })
    });
  }
  // If still 400 (some models may not support response_format yet), retry without response_format
  if (!resp.ok && resp.status === 400) {
    resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: aiModel, messages: [system, user], temperature: 0, top_p: 0, seed: 42 })
    });
  }
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`OpenAI error: ${resp.status} ${t}`);
  }
  const data = await resp.json();
  const c = data.choices?.[0]?.message?.content?.trim() || '{}';
  let parsed; 
  try { parsed = JSON.parse(c); } 
  catch { 
    try {
      const s = c.indexOf('{');
      const e = c.lastIndexOf('}');
      parsed = JSON.parse(s >= 0 ? c.slice(s, e + 1) : '{}');
    } catch { parsed = {}; }
  }
  return {
    interviewee: parsed.interviewee || (prepare?.name || ''),
    goal: parsed.goal || (prepare?.goal || ''),
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
    quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
    nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
    features: Array.isArray(parsed.features) ? parsed.features : []
  };
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
  const endTime = new Date();
  const durationSeconds = Math.floor((endTime - interviewStartTime) / 1000);
  
  // Format transcript for saving
  const transcriptText = currentTranscript
    .map(entry => `${entry.speaker}: ${entry.text}`)
    .join('\n\n');
  
  const interviewData = {
    title: `Interview - ${new Date(interviewStartTime).toLocaleDateString()}`,
    started_at: interviewStartTime,
    ended_at: endTime,
    transcript: transcriptText,
    duration_seconds: durationSeconds,
    status: 'completed',
    session_id: `ext_${Date.now()}`,
    segments: currentTranscript.map((entry, index) => ({
      speaker: entry.speaker || 'unknown',
      text: entry.text,
      timestamp_ms: index * 1000 // Approximate timestamps
    }))
  };
  
  try {
    // Try to save to the web app database via API
    const response = await fetch('https://ideafeedback.co/api/extension/save-interview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Request': 'true'
      },
      credentials: 'include',
      body: JSON.stringify(interviewData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Interview saved to database:', result);
      currentInterviewId = result.interview?.id;
    } else {
      console.warn('Failed to save to database, saving locally');
    }
  } catch (error) {
    console.error('Error saving interview to API:', error);
  }
  
  // Always save to local storage as backup
  chrome.storage.local.get(['interviews'], (result) => {
    const interviews = result.interviews || [];
    interviews.push({
      id: currentInterviewId || Date.now(),
      ...interviewData,
      startTime: interviewStartTime,
      endTime: endTime,
      transcript: currentTranscript,
      duration: durationSeconds * 1000
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
      ensureContentInjected(tabId);
    }
  }
});

// Ensure content script is injected into the target tab
function ensureContentInjected(tabId) {
  try {
    chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        // Insert styles first
        chrome.scripting.insertCSS({
          target: { tabId: tabId },
          files: ['content/styles.css']
        }, () => {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content/inject.js']
          });
        });
      }
    });
  } catch (e) {
    console.warn('ensureContentInjected error', e);
  }
}

// Offscreen microphone recording controls
async function startMicRecording() {
  try {
    // Prefer Offscreen API when available; otherwise fall back to in-page recording
    if (chrome.offscreen?.createDocument) {
      if (!offscreenCreated) {
        const hasDoc = await (chrome.offscreen?.hasDocument ? chrome.offscreen.hasDocument() : Promise.resolve(false));
        if (!hasDoc) {
          await chrome.offscreen.createDocument({
            url: 'background/offscreen.html',
            reasons: [chrome.offscreen?.Reason?.USER_MEDIA || 'USER_MEDIA'],
            justification: 'Record microphone audio to enable transcription outside meeting tabs.'
          });
        }
        offscreenCreated = true;
      }
      chrome.runtime.sendMessage({ action: 'offscreen:startRecording' });
    } else {
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { action: 'startLocalRecording' });
      }
    }
  } catch (e) {
    console.error('startMicRecording failed', e);
    // Fallback to local recording in the page if Offscreen path fails
    if (activeTabId) {
      try { chrome.tabs.sendMessage(activeTabId, { action: 'startLocalRecording' }); } catch (_) {}
    }
  }
}

async function stopMicRecording() {
  try {
    if (chrome.offscreen?.closeDocument) {
      chrome.runtime.sendMessage({ action: 'offscreen:stopRecording' });
      try {
        await chrome.offscreen.closeDocument();
        offscreenCreated = false;
      } catch (e) {
        // ignore if already closed
      }
    } else if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'stopLocalRecording' });
    }
  } catch (e) {
    console.error('stopMicRecording failed', e);
  }
}
