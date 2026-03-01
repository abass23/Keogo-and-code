'use client';

import { useState, useRef, useCallback } from 'react';
import type { ScenarioId, SimulatorMessage, ChatResponse } from '@/lib/simulatorTypes';
import { OPENING_LINES } from '@/lib/simulatorScenarios';

type Status =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

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
  return (w['SpeechRecognition'] as new () => SpeechRecognitionInstance) ??
    (w['webkitSpeechRecognition'] as new () => SpeechRecognitionInstance) ??
    null;
}

export function useSimulator() {
  const [scenario, setScenario] = useState<ScenarioId | null>(null);
  const [messages, setMessages] = useState<SimulatorMessage[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  // ── Start a scenario ─────────────────────────────────────────────────────
  const startScenario = useCallback((id: ScenarioId) => {
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

    // Play opening TTS
    playTTS(opening.japanese);
  }, []);

  const resetScenario = useCallback(() => {
    recognitionRef.current?.stop();
    audioRef.current?.pause();
    historyRef.current = [];
    setScenario(null);
    setMessages([]);
    setStatus('idle');
    setTranscript('');
    setErrorMsg(null);
  }, []);

  // ── TTS playback ─────────────────────────────────────────────────────────
  const playTTS = useCallback(async (text: string) => {
    setStatus('speaking');
    try {
      const res = await fetch('/api/simulator/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('TTS failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setStatus('idle');
      await audio.play();
    } catch {
      setStatus('idle');
    }
  }, []);

  // ── Push-to-talk ─────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

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

    recognition.onend = () => {
      // handled by stopListening
    };

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

    // Add user message to UI immediately
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

      // Update conversation history for context
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
      setErrorMsg('Could not reach the AI. Check your API key in .env.local.');
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
