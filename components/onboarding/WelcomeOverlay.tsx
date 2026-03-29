'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Target, Calendar } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';

const ONBOARDING_KEY = 'keogo-onboarding-done';

// Days until JLPT July 2026
function daysUntilJLPT(): number {
  const target = new Date('2026-07-05');
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

export default function WelcomeOverlay() {
  const [visible, setVisible] = useState(false);
  const { locale } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    try {
      const done = localStorage.getItem(ONBOARDING_KEY);
      if (!done) setVisible(true);
    } catch { /* ignore */ }
  }, []);

  function dismiss() {
    try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch { /* ignore */ }
    setVisible(false);
  }

  function startMini() {
    dismiss();
    router.push('/flashcards?level=N5');
  }

  if (!visible) return null;

  const days = daysUntilJLPT();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="font-jp text-2xl text-slate-100">ようこそ！</p>
          <h2 className="text-lg font-bold text-slate-100">
            {locale === 'fr' ? 'Bienvenue sur Keigo & Code' : 'Welcome to Keigo & Code'}
          </h2>
          <p className="text-sm text-slate-400">
            {locale === 'fr'
              ? 'Japonais pour ingénieurs embarqués — N5 → N3/N2.'
              : 'Japanese for embedded engineers — N5 → N3/N2.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
            <Target size={14} className="text-cyan-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">{locale === 'fr' ? 'Objectif' : 'Goal'}</p>
            <p className="text-xs font-semibold text-slate-200">N3/N2</p>
          </div>
          <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
            <Zap size={14} className="text-yellow-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">{locale === 'fr' ? 'Cartes/jour' : 'Daily goal'}</p>
            <p className="text-xs font-semibold text-slate-200">20 {locale === 'fr' ? 'cartes' : 'cards'}</p>
          </div>
          <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
            <Calendar size={14} className="text-violet-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">JLPT</p>
            <p className="text-xs font-semibold text-violet-400">{days}j</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={startMini}
          className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors flex items-center justify-center gap-2"
        >
          🎯 {locale === 'fr' ? 'Commencer 5 cartes N5' : 'Start 5-Card N5 Session'}
        </button>

        <button
          onClick={dismiss}
          className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          {locale === 'fr' ? 'Passer — explorer d\'abord' : 'Skip — explore first'}
        </button>
      </div>
    </div>
  );
}
