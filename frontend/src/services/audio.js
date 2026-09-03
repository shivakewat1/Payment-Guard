// Web Audio synthesizer for pleasant fintech chimes and Hinglish voice playback

let audioCtx = null;
let isMuted = false;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundService = {
  setMuted(muted) {
    isMuted = muted;
  },

  isMuted() {
    return isMuted;
  },

  // Play pleasant fintech recovery chime (E5 -> G#5 -> B5 arpeggio)
  playSuccessChime() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [659.25, 830.61, 987.77]; // E5, G#5, B5

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  },

  // Play browser speech synthesis for Hinglish voice recovery script
  speakHinglish(text, onEnd) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) setTimeout(onEnd, 3000);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      // Try finding an Indian English / Hindi voice if available
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN') || v.name.includes('India'));
      if (indianVoice) {
        utterance.voice = indianVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      if (onEnd) onEnd();
    }
  },

  stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
};
