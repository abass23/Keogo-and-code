// Core vocab card — all Japanese text has kanji + hiragana + romaji
export interface VocabCard {
  id: string;
  kanji: string;        // kanji form (for katakana-only words, same as hiragana)
  hiragana: string;     // reading in hiragana/katakana
  romaji: string;
  meaning_en: string;
  meaning_fr: string;
  audio_url: string | null;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2';
  domain: 'core' | 'embedded' | 'automotive' | 'business';
  subdomain?: string;
  part_of_speech?: string;
  example_sentences?: JapaneseSentence[];
  tags?: string[];
}

export interface JapaneseSentence {
  jp: string;
  reading: string;
  en: string;
  fr?: string;
}

// SM-2 SRS state
export interface SRSState {
  interval: number;       // days until next review
  repetitions: number;    // consecutive correct answers
  easeFactor: number;     // SM-2 ease factor (min 1.3)
  nextReview: string;     // ISO date string
  lastReview?: string | null;
}

// Quality score for SM-2: 0=complete fail, 3=correct with difficulty, 5=perfect
export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export interface CardWithSRS extends VocabCard {
  srs: SRSState;
}

// Kanji entry
export interface KanjiEntry {
  id: string;
  character: string;
  onyomi: string[];
  kunyomi: string[];
  meaning_en: string;
  meaning_fr: string;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2';
  stroke_count: number;
  radicals: string[];
  mnemonic?: string;
  svg_data?: string;
}

// User profile
export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  native_language: 'fr' | 'en';
  current_level: 'N5' | 'N4' | 'N3' | 'N2';
  daily_goal: number;
  streak: number;
}

// Deck filter
export interface DeckFilter {
  jlpt_level?: ('N5' | 'N4' | 'N3' | 'N2')[];
  domain?: ('core' | 'embedded' | 'automotive' | 'business')[];
  subdomain?: string[];
}

// App locale
export type Locale = 'en' | 'fr';

// Conversation modes for AI simulator
export type ConversationMode = 'jikoshoukai' | 'interview' | 'daily' | 'technical';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  correction?: string;
  vocabulary?: VocabHint[];
}

export interface VocabHint {
  japanese: string;
  reading: string;
  meaning: string;
}

// Study session record
export interface StudySession {
  id?: string;
  user_id?: string;
  session_type: 'review' | 'learn' | 'listen' | 'converse';
  cards_reviewed: number;
  correct: number;
  duration_seconds: number;
  xp_earned: number;
  created_at?: string;
}

// Gamification
export type BadgeId =
  | 'first_review'
  | 'streak_7'
  | 'streak_30'
  | 'kanji_50'
  | 'kanji_100'
  | 'vocab_100'
  | 'vocab_500'
  | 'jikoshoukai_master'
  | 'rtos_complete'
  | 'interview_ready';

export interface Badge {
  id: BadgeId;
  label_en: string;
  label_fr: string;
  description_en: string;
  description_fr: string;
  xp_reward: number;
}

export interface UserBadge {
  badge_id: BadgeId;
  unlocked_at: string;
}
