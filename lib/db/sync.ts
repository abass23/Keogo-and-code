import { getDB } from './idb';
import { createClient } from '../supabase/client';

/**
 * Flush unsynced card progress from IDB to Supabase.
 * Call on: app load (if online), navigator.online event.
 */
export async function syncToSupabase(userId: string): Promise<void> {
  if (typeof window === 'undefined' || !navigator.onLine) return;

  const db = await getDB();
  const supabase = createClient();

  // Get all unsynced card progress for this user
  const tx = db.transaction('card_progress', 'readwrite');
  const index = tx.store.index('by_user');
  const allCards = await index.getAll(userId);
  const unsynced = allCards.filter((c) => !c.synced);

  if (unsynced.length === 0) return;

  const rows = unsynced.map((c) => ({
    user_id: c.user_id,
    vocabulary_id: c.card_id,
    card_type: 'vocab',
    interval: c.srs.interval,
    repetitions: c.srs.repetitions,
    ease_factor: c.srs.easeFactor,
    next_review: c.srs.nextReview,
    last_review: c.srs.lastReview ?? null,
    updated_at: c.updated_at,
  }));

  const { error } = await supabase
    .from('user_cards')
    .upsert(rows, { onConflict: 'user_id,vocabulary_id,card_type' });

  if (!error) {
    // Mark as synced in IDB
    for (const card of unsynced) {
      await db.put('card_progress', { ...card, synced: true });
    }
  }
}

/** Pull Supabase card progress and merge into IDB (last-write-wins by updated_at) */
export async function syncFromSupabase(userId: string): Promise<void> {
  if (typeof window === 'undefined' || !navigator.onLine) return;

  const db = await getDB();
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_cards')
    .select('vocabulary_id, interval, repetitions, ease_factor, next_review, last_review, updated_at')
    .eq('user_id', userId);

  if (error || !data) return;

  for (const row of data) {
    const key = `${userId}:${row.vocabulary_id}`;
    const existing = await db.get('card_progress', key);

    // Skip if local version is newer
    if (existing && existing.updated_at > row.updated_at) continue;

    await db.put('card_progress', {
      key,
      user_id: userId,
      card_id: row.vocabulary_id,
      srs: {
        interval: row.interval,
        repetitions: row.repetitions,
        easeFactor: row.ease_factor,
        nextReview: row.next_review,
        lastReview: row.last_review,
      },
      updated_at: row.updated_at,
      synced: true,
    });
  }
}

/** Register online/offline event listeners for automatic background sync */
export function registerSyncListeners(userId: string): () => void {
  const onOnline = () => syncToSupabase(userId);
  window.addEventListener('online', onOnline);
  return () => window.removeEventListener('online', onOnline);
}
