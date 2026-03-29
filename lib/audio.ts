/**
 * Japanese TTS — Web Speech API (free, offline-capable)
 * Used as primary source when Google Cloud TTS is not available.
 */

let cachedVoice: SpeechSynthesisVoice | null | undefined = undefined; // undefined = not yet loaded

function getJapaneseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = speechSynthesis.getVoices();
  cachedVoice = voices.find((v) => v.lang.startsWith('ja')) ?? null;
  return cachedVoice;
}

export function speakJapanese(text: string, rate = 0.9): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = rate;
  const voice = getJapaneseVoice();
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    speechSynthesis.cancel();
  }
}

/** Pre-load voices list (call once on app boot) */
export function preloadVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const load = () => { cachedVoice = undefined; getJapaneseVoice(); };
  if (speechSynthesis.getVoices().length > 0) {
    load();
  } else {
    speechSynthesis.addEventListener('voiceschanged', load, { once: true });
  }
}
