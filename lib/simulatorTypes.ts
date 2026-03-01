export type ScenarioId = 'tech-standup' | 'ryokan-checkin';

export interface Scenario {
  id: ScenarioId;
  track: 'tech' | 'life';
  title: string;
  subtitle: string;
  aiName: string;
  aiRole: string;
  aiAvatar: string;
  accentColor: 'cyan' | 'amber';
  description: string;
  hint: string;
}

export interface SimulatorMessage {
  id: string;
  role: 'ai' | 'user';
  /** Raw text that was recognised / sent */
  text: string;
  /** Japanese text of the AI reply */
  japanese?: string;
  romaji?: string;
  english?: string;
  grammarFeedback?: string;
  correctedJapanese?: string;
  audioUrl?: string;
  timestamp: number;
}

export interface ChatRequest {
  scenario: ScenarioId;
  history: { role: 'user' | 'assistant'; content: string }[];
  userMessage: string;
}

export interface ChatResponse {
  reply: string;
  reply_romaji: string;
  reply_english: string;
  grammar_feedback: string;
  corrected_japanese: string | null;
}
