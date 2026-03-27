'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BadgeId, UserBadge } from '@/lib/types';

const XP_PER_LEVEL = 500;

export function xpToLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpInCurrentLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export const LEVEL_TITLES = [
  'Intern 研修生',
  'Junior 初級',
  'Mid-level 中級',
  'Senior 上級',
  'Lead リード',
  'Principal 主任',
  'CTO 技術責任者',
] as const;

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}

interface GamificationState {
  totalXP: number;
  badges: UserBadge[];
  addXP: (amount: number) => void;
  unlockBadge: (badgeId: BadgeId) => void;
  hasBadge: (badgeId: BadgeId) => boolean;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      badges: [],
      addXP: (amount) => set((s) => ({ totalXP: s.totalXP + amount })),
      unlockBadge: (badgeId) => {
        if (get().hasBadge(badgeId)) return;
        set((s) => ({
          badges: [...s.badges, { badge_id: badgeId, unlocked_at: new Date().toISOString() }],
        }));
      },
      hasBadge: (badgeId) => get().badges.some((b) => b.badge_id === badgeId),
    }),
    { name: 'keogo-gamification' },
  ),
);
