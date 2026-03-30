/**
 * Storage facade: writes to IndexedDB first (offline-first),
 * then syncs to Supabase in the background.
 * Falls back to localStorage when IDB is not available.
 */
import { getDB } from './db/idb';
import type { SRSState } from './types';

const LEGACY_KEY = 'keigo-srs-progress';
const STREAK_KEY = 'keigo-streak';

// ─── Card progress ─────────────────────────────────────────────────────────

export async function saveCardProgress(
  userId: string,
  cardId: string,
  srs: SRSState,
): Promise<void> {
  const now = new Date().toISOString();

  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    const db = await getDB();
    await db.put('card_progress', {
      key: `${userId}:${cardId}`,
      user_id: userId,
      card_id: cardId,
      srs,
      updated_at: now,
      synced: false,
    });
  } else {
    const raw = localStorage.getItem(LEGACY_KEY);
    const progress = raw ? JSON.parse(raw) : {};
    progress[`${userId}:${cardId}`] = { srs, updated_at: now };
    localStorage.setItem(LEGACY_KEY, JSON.stringify(progress));
  }
}

export async function getCardProgress(
  userId: string,
  cardId: string,
): Promise<SRSState | null> {
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    const db = await getDB();
    const entry = await db.get('card_progress', `${userId}:${cardId}`);
    return entry?.srs ?? null;
  }

  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return null;
  const entry = JSON.parse(raw)[`${userId}:${cardId}`];
  return entry?.srs ?? null;
}

export async function getAllCardProgress(
  userId: string,
): Promise<Record<string, SRSState>> {
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    const db = await getDB();
    const tx = db.transaction('card_progress', 'readonly');
    const index = tx.store.index('by_user');
    const all = await index.getAll(userId);
    return Object.fromEntries(all.map((e) => [e.card_id, e.srs]));
  }

  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return {};
  const all = JSON.parse(raw) as Record<string, { srs: SRSState }>;
  const result: Record<string, SRSState> = {};
  for (const [key, val] of Object.entries(all)) {
    const cardId = key.startsWith(`${userId}:`) ? key.slice(userId.length + 1) : key;
    result[cardId] = val.srs;
  }
  return result;
}

// ─── Streak ────────────────────────────────────────────────────────────────

export function getStreakDays(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return 0;
    const { count, lastDate } = JSON.parse(raw);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86_400_000).toDateString();
    if (lastDate === today || lastDate === yesterday) return count;
    return 0;
  } catch {
    return 0;
  }
}

export function updateStreak(): void {
  if (typeof window === 'undefined') return;
  try {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86_400_000).toDateString();
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastDate: today }));
      return;
    }
    const { count, lastDate } = JSON.parse(raw);
    if (lastDate === today) return;
    const newCount = lastDate === yesterday ? count + 1 : 1;
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count: newCount, lastDate: today }));
  } catch {
    // ignore
  }
}
