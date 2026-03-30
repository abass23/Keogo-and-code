'use client';

import { useState, useRef, useCallback } from 'react';
import type { ScenarioId, SimulatorMessage } from '@/lib/simulatorTypes';
import { OPENING_LINES } from '@/lib/simulatorScenarios';
import { useAppStore } from '@/stores/app-store';

type Status = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

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

function stripForTTS(text: string): string {
  return text
    .replace(/\{([^|{}]+)\|[^}]+\}/g, '$1')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w['SpeechRecognition'] as never) ?? (w['webkitSpeechRecognition'] as never) ?? null;
}

export function useSimulator() {
  const user = useAppStore((s) => s.user);
  const [scenario, setScenario] = useState<ScenarioId | null>(null);
  const [messages, setMessages] = useState<SimulatorMessage[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cancelAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const playTTS = useCallback(async (text: string) => {
    cancelAudio();
    try {
      setStatus('speaking');
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: stripForTTS(text), voice: 'ja-JP-Neural2-B', speed: 0.9 }),
      });
      if (!response.ok) throw new Error('TTS error');
      const { audioContent } = await response.json();
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      audioRef.current = audio;
      audio.onended = () => { setStatus('idle'); audioRef.current = null; };
      audio.onerror = () => { setStatus('idle'); audioRef.current = null; };
      await audio.play();
    } catch (err) {
      console.error('[TTS] failed:', err);
      setStatus('idle');
    }
  }, [cancelAudio]);

  const startScenario = useCallback((id: ScenarioId) => {
    cancelAudio();
    const opening = OPENING_LINES[id];
    const firstMsg: SimulatorMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      text: opening,
      timestamp: Date.now(),
    };
    historyRef.current = [{ role: 'assistant', content: opening }];
    setScenario(id);
    setMessages([firstMsg]);
    setStatus('idle');
    setTranscript('');
    setErrorMsg(null);
    playTTS(opening);
  }, [cancelAudio, playTTS]);

  const resetScenario = useCallback(() => {
    recognitionRef.current?.stop();
    cancelAudio();
    historyRef.current = [];
    setScenario(null);
    setMessages([]);
    setStatus('idle');
    setTranscript('');
    setErrorMsg(null);
  }, [cancelAudio]);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition not supported. Please use Chrome.');
      return;
    }
    cancelAudio();
    setTranscript('');
    setErrorMsg(null);

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const result = Array.from(e.results).map((r) => r[0].transcript).join('');
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
  }, [cancelAudio]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !scenario) return;

    setStatus('processing');
    const userMsg: SimulatorMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Add streaming placeholder
    const aiMsgId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: aiMsgId, role: 'ai', text: '', timestamp: Date.now(), isStreaming: true }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: scenario,
          messages: [
            ...historyRef.current,
            { role: 'user', content: text.trim() },
          ],
          userLevel: user?.current_level ?? 'N4',
        }),
      });

      if (!response.ok) throw new Error('Edge Function error');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const { text: delta } = JSON.parse(data);
            fullText += delta;
            setMessages((prev) =>
              prev.map((m) => m.id === aiMsgId ? { ...m, text: fullText } : m),
            );
          } catch { /* skip malformed chunks */ }
        }
      }

      // Finalize
      historyRef.current = [
        ...historyRef.current,
        { role: 'user', content: text.trim() },
        { role: 'assistant', content: fullText },
      ];
      setMessages((prev) =>
        prev.map((m) => m.id === aiMsgId ? { ...m, text: fullText, isStreaming: false } : m),
      );
      setTranscript('');
      playTTS(fullText);
    } catch (err) {
      setErrorMsg(`AI error: ${String(err)}. Check Supabase Edge Function and ANTHROPIC_API_KEY secret.`);
      setStatus('error');
      setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
    }
  }, [scenario, user, playTTS]);

  const stopListening = useCallback(async () => {
    recognitionRef.current?.stop();
    const spoken = transcript.trim();
    if (!spoken) { setStatus('idle'); return; }
    await sendMessage(spoken);
  }, [transcript, sendMessage]);

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
    sendMessage,
    hasSpeechSupport: getSpeechRecognition() !== null,
  };
}
