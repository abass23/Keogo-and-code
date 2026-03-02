'use client';

import { useState, useRef, useCallback } from 'react';
import type { ScenarioId, SimulatorMessage, ChatResponse } from '@/lib/simulatorTypes';
import { OPENING_LINES } from '@/lib/simulatorScenarios';

type Status = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

// Minimal browser types for Web Speech API (not in TS lib by default)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (
    (w['SpeechRecognition'] as new () => SpeechRecognitionInstance) ??
    (w['webkitSpeechRecognition'] as new () => SpeechRecognitionInstance) ??
    null
  );
}

/** Pick the best available Japanese voice for the AI character. */
function pickJapaneseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null;
  const voices = window.speechSynthesis.getVoices();
  const japanese = voices.filter((v) => v.lang.startsWith('ja'));
  if (!japanese.length) return null;
  const preferred = ['kyoko', 'o-ren', 'haruka', 'google 日本語', 'google japanese'];
  return (
    japanese.find((v) => preferred.some((n) => v.name.toLowerCase().includes(n))) ??
    japanese[0]
  );
}

export function useSimulator() {
  const [scenario, setScenario] = useState<ScenarioId | null>(null);
  const [messages, setMessages] = useState<SimulatorMessage[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  // ── TTS via free browser SpeechSynthesis ─────────────────────────────────
  const playTTS = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ja-JP';
    utter.rate = 0.9;   // slightly slower → clearer for learners
    utter.pitch = 1.1;  // slightly higher → sounds more natural / feminine
    const voice = pickJapaneseVoice();
    if (voice) utter.voice = voice;

    utter.onstart = () => setStatus('speaking');
    utter.onend = () => setStatus('idle');
    utter.onerror = () => setStatus('idle');

    window.speechSynthesis.speak(utter);
  }, []);

  // ── Start a scenario ──────────────────────────────────────────────────────
  const startScenario = useCallback((id: ScenarioId) => {
    window.speechSynthesis?.cancel();
    const opening = OPENING_LINES[id];
    const firstMsg: SimulatorMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      text: opening.japanese,
      japanese: opening.japanese,
      romaji: opening.romaji,
      english: opening.english,
      timestamp: Date.now(),
    };

    historyRef.current = [{ role: 'assistant', content: opening.japanese }];
    setScenario(id);
    setMessages([firstMsg]);
    setStatus('idle');
    setTranscript('');
    setErrorMsg(null);

    playTTS(opening.japanese);
  }, [playTTS]);

  const resetScenario = useCallback(() => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    historyRef.current = [];
    setScenario(null);
    setMessages([]);
    setStatus('idle');
    setTranscript('');
    setErrorMsg(null);
  }, []);

  // ── Push-to-talk ──────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    window.speechSynthesis?.cancel();
    setTranscript('');
    setErrorMsg(null);

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const result = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join('');
      setTranscript(result);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setErrorMsg(`Speech error: ${e.error}`);
      setStatus('idle');
    };

    recognition.onend = () => { /* handled by stopListening */ };

    recognitionRef.current = recognition;
    recognition.start();
    setStatus('listening');
  }, []);

  const stopListening = useCallback(async () => {
    recognitionRef.current?.stop();

    const spoken = transcript.trim();
    if (!spoken || !scenario) {
      setStatus('idle');
      return;
    }

    setStatus('processing');

    const userMsg: SimulatorMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: spoken,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/simulator/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          history: historyRef.current,
          userMessage: spoken,
        }),
      });

      if (!res.ok) throw new Error('Chat API failed');

      const data: ChatResponse = await res.json();

      historyRef.current = [
        ...historyRef.current,
        { role: 'user', content: spoken },
        { role: 'assistant', content: data.reply },
      ];

      const aiMsg: SimulatorMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: data.reply,
        japanese: data.reply,
        romaji: data.reply_romaji,
        english: data.reply_english,
        grammarFeedback: data.grammar_feedback,
        correctedJapanese: data.corrected_japanese ?? undefined,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setTranscript('');
      playTTS(data.reply);
    } catch {
      setErrorMsg('Could not reach the AI. Check your GOOGLE_GENERATIVE_AI_API_KEY in .env.local.');
      setStatus('error');
    }
  }, [transcript, scenario, playTTS]);

  return {
    scenario,
    messages,
    status,
    transcript,
    errorMsg,
    startScenario,
    resetScenario,
    startListening,
    stopListening,
    hasSpeechSupport: getSpeechRecognition() !== null,
  };
}
