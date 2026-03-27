import type { ConversationMode } from './types';

export type ScenarioId = ConversationMode; // 'jikoshoukai' | 'interview' | 'daily' | 'technical'

export interface Scenario {
  id: ScenarioId;
  title_en: string;
  title_fr: string;
  subtitle_en: string;
  subtitle_fr: string;
  description_en: string;
  description_fr: string;
  aiRole_en: string;
  aiRole_fr: string;
  accentColor: 'cyan' | 'violet' | 'amber' | 'blue';
  icon: string;
  hint_en: string;
  hint_fr: string;
}

export interface SimulatorMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ChatRequest {
  mode: ScenarioId;
  messages: { role: 'user' | 'assistant'; content: string }[];
  userLevel?: string;
}
