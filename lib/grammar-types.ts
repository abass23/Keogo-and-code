import type { SRSState } from './types';

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2';
export type GrammarDomain = 'core' | 'embedded' | 'automotive' | 'business' | 'daily';
export type ExerciseType =
  | 'fill_blank'
  | 'sentence_builder'
  | 'error_spotter'
  | 'mcq'
  | 'conjugation'
  | 'context_match'
  | 'transform';

export type GrammarCategory =
  | 'particles'
  | 'verb_form'
  | 'adjective_form'
  | 'tense_aspect'
  | 'obligation'
  | 'prohibition'
  | 'permission'
  | 'conditional'
  | 'passive'
  | 'causative'
  | 'potential'
  | 'desire'
  | 'conjunction'
  | 'comparison'
  | 'expression'
  | 'keigo'
  | 'question'
  | 'negation';

// Formation rule showing how to build the grammar pattern
export interface FormationRule {
  base: string;               // e.g., "Verb (ない-form)"
  rule: string;               // e.g., "drop ない → なければならない"
  examples: { input: string; output: string }[];
}

export interface CommonMistake {
  wrong: string;
  correct: string;
  explanation_en: string;
  explanation_fr: string;
}

// ── Exercise question payloads ────────────────────────────────

export interface FillBlankQuestion {
  sentence: string;           // "明日までにレポートを＿＿＿なりません。"
  blank_position: 'inline';
  hint_en: string;            // "must / have to"
  hint_fr: string;
}

export interface SentenceBuilderQuestion {
  target: string;             // full correct sentence
  tiles: string[];            // all tiles including distractors
}

export interface ErrorSpotterQuestion {
  sentence: string;           // sentence with one error
  error_segment: string;      // the wrong part (for tap-to-select highlight)
}

export interface MCQQuestion {
  sentence: string;           // sentence with blank at end or ＿
  options: MCQOption[];       // always 4
}

export interface MCQOption {
  text: string;
  is_correct: boolean;
  explanation_en: string;
  explanation_fr: string;
}

export interface ConjugationQuestion {
  base_form: string;          // e.g., "書く"
  base_type: string;          // "う-verb" | "る-verb" | "い-adj" | "な-adj" | "irregular"
  target_form: string;        // e.g., "て形"
}

export interface ContextMatchQuestion {
  situation_en: string;
  situation_fr: string;
  sentence: string;           // sentence to evaluate
  options: ContextOption[];   // always 3 levels
}

export interface ContextOption {
  text: string;
  level: 'casual' | 'polite' | 'keigo';
  is_correct: boolean;
  explanation_en: string;
  explanation_fr: string;
}

export interface TransformQuestion {
  original: string;           // original sentence
  instruction_en: string;     // "Rewrite using ～すぎて"
  instruction_fr: string;
  pattern_hint: string;       // the target pattern
}

export type GrammarQuestion =
  | FillBlankQuestion
  | SentenceBuilderQuestion
  | ErrorSpotterQuestion
  | MCQQuestion
  | ConjugationQuestion
  | ContextMatchQuestion
  | TransformQuestion;

// ── Exercise ──────────────────────────────────────────────────

export interface GrammarExercise {
  id: string;
  grammar_point_id: string;
  type: ExerciseType;
  question: GrammarQuestion;
  answers: string[];          // all accepted correct answers
  distractors?: string[];     // for MCQ / sentence_builder
  hints: string[];            // progressive hints (shown after wrong attempt)
  explanation: {
    correct: string;                        // shown after any correct answer
    wrong: Record<string, string>;          // common wrong answer → why
  };
  domain: GrammarDomain;
  difficulty: 1 | 2 | 3;
}

// ── Grammar Point ─────────────────────────────────────────────

export interface GrammarPoint {
  id: string;
  pattern: string;            // "～なければならない"
  meaning_en: string;         // "must / have to"
  meaning_fr: string;         // "devoir / il faut"
  jlpt_level: JlptLevel;
  category: GrammarCategory;
  formation: FormationRule[];
  explanation_en: string;
  explanation_fr: string;
  nuance?: string;
  related_points: string[];   // IDs of similar grammar
  common_mistakes: CommonMistake[];
  audio_url: string | null;
  sort_order: number;
  exercises?: GrammarExercise[];
}

// ── Grammar SRS ───────────────────────────────────────────────

export interface TypeAccuracyEntry {
  correct: number;
  total: number;
}

export interface TypeAccuracy {
  fill_blank: TypeAccuracyEntry;
  sentence_builder: TypeAccuracyEntry;
  error_spotter: TypeAccuracyEntry;
  mcq: TypeAccuracyEntry;
  conjugation: TypeAccuracyEntry;
  context_match: TypeAccuracyEntry;
  transform: TypeAccuracyEntry;
}

export interface GrammarSRSState extends SRSState {
  total_reviews: number;
  correct_count: number;
  is_learned: boolean;        // score >= 70% unlocks SRS queue
  is_ghost: boolean;          // persistently wrong → ghost status → shorter intervals
  type_accuracy: TypeAccuracy;
  weakest_type: ExerciseType | null;
}

export interface UserGrammarRecord {
  id: string;
  user_id: string;
  grammar_point_id: string;
  srs: GrammarSRSState;
}

// ── Session types ─────────────────────────────────────────────

export type SessionMode = 'learn' | 'review' | 'cram';

export interface GrammarSessionItem {
  grammarPoint: GrammarPoint;
  exercise: GrammarExercise;
  srs: GrammarSRSState;
  attemptCount: number;
  usedHint: boolean;
}

export interface ExerciseAttempt {
  exercise_id: string;
  grammar_point_id: string;
  answer: string;
  is_correct: boolean;
  attempt_number: number;     // 1, 2, or 3
  used_hint: boolean;
  xp_earned: number;
}

// ── Review submission ─────────────────────────────────────────

export interface GrammarReviewPayload {
  grammar_point_id: string;
  exercise_type: ExerciseType;
  is_correct: boolean;
  attempts: number;           // 1 = first try, 3 = revealed
  used_hint: boolean;
  is_cram: boolean;           // true → no SRS impact
}

// ── Stats ─────────────────────────────────────────────────────

export interface GrammarStats {
  learned_count: number;
  review_due: number;
  ghost_count: number;
  by_level: Record<JlptLevel, { learned: number; total: number }>;
  type_accuracy: TypeAccuracy;
  weakest_type: ExerciseType | null;
  weekly_report: WeeklyGrammarReport;
}

export interface WeeklyGrammarReport {
  new_learned: number;
  total_reviewed: number;
  accuracy_pct: number;
  struggled_patterns: string[];   // pattern strings
  mastered_patterns: string[];
}
