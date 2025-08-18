// Offscreen document: capture microphone and stream interim text back to service worker
let mediaStream = null;
let mediaRecorder = null;
let audioChunks = [];
let recognition = null;
let usingSpeechApi = false;

async function startRecording() {
  try {
    // Prefer Web Speech API for low-latency interim text where available
    if ('webkitSpeechRecognition' in self || 'SpeechRecognition' in self) {
      const SpeechRecognition = self.SpeechRecognition || self.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        if (!result) return;
        const text = result[0]?.transcript || '';
        chrome.runtime.sendMessage({
          action: 'transcriptFragment',
          text,
          isFinal: result.isFinal
        });
      };
      recognition.onerror = (e) => {
        console.warn('SpeechRecognition error', e);
        try {
          chrome.runtime.sendMessage({ action: 'offscreen:error', error: e?.error || 'unknown' });
        } catch (_) {}
      };
      usingSpeechApi = true;
      try { recognition.start(); } catch (e) { console.warn('recognition already started'); }
      return;
    }

    // Fallback: capture raw audio and batch send (no STT here)
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' });
    audioChunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) audioChunks.push(e.data);
    };
    mediaRecorder.onstop = async () => {
      if (audioChunks.length > 0) {
        // Placeholder: in future, send to server/whisper; for now, just note that audio was captured
        chrome.runtime.sendMessage({ action: 'transcriptFragment', text: '[Audio captured]', isFinal: true });
      }
      audioChunks = [];
    };
    mediaRecorder.start(1000);
  } catch (e) {
    console.error('Offscreen startRecording error', e);
  }
}

function stopRecording() {
  try {
    if (usingSpeechApi && recognition) {
      recognition.stop();
      recognition = null;
      usingSpeechApi = false;
    }
    if (mediaRecorder) {
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      mediaRecorder = null;
    }
    if (mediaStream) {
      for (const track of mediaStream.getTracks()) track.stop();
      mediaStream = null;
    }
  } catch (e) {
    console.error('Offscreen stopRecording error', e);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'offscreen:startRecording') {
    startRecording();
    sendResponse?.({ ok: true });
    return true;
  }
  if (message.action === 'offscreen:stopRecording') {
    stopRecording();
    sendResponse?.({ ok: true });
    return true;
  }
});



