'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale, UserProfile } from '@/lib/types';

interface AppState {
  locale: Locale;
  furiganaEnabled: boolean;
  user: UserProfile | null;
  setLocale: (locale: Locale) => void;
  toggleFurigana: () => void;
  setUser: (user: UserProfile | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'fr',
      furiganaEnabled: true,
      user: null,
      setLocale: (locale) => set({ locale }),
      toggleFurigana: () => set((s) => ({ furiganaEnabled: !s.furiganaEnabled })),
      setUser: (user) => set({ user }),
    }),
    { name: 'keogo-app' },
  ),
);
