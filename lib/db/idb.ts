import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { SRSState } from '../types';

interface KeogoSchema extends DBSchema {
  card_progress: {
    key: string; // `${userId}:${cardId}`
    value: {
      key: string;
      user_id: string;
      card_id: string;
      srs: SRSState;
      updated_at: string;
      synced: boolean;
    };
    indexes: { by_user: string; by_synced: number };
  };
  review_log: {
    key: string; // uuid
    value: {
      id: string;
      user_id: string;
      reviewed_at: string;
      cards_count: number;
      xp_earned: number;
      synced: boolean;
    };
    indexes: { by_user_date: [string, string] };
  };
  settings: {
    key: string;
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<KeogoSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<KeogoSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<KeogoSchema>('keogo', 1, {
      upgrade(db) {
        const cardStore = db.createObjectStore('card_progress', { keyPath: 'key' });
        cardStore.createIndex('by_user', 'user_id');
        cardStore.createIndex('by_synced', 'synced');

        const logStore = db.createObjectStore('review_log', { keyPath: 'id' });
        logStore.createIndex('by_user_date', ['user_id', 'reviewed_at']);

        db.createObjectStore('settings', { keyPath: 'key' as never });
      },
    });
  }
  return dbPromise;
}
