export interface FlashCard {
  id: string;
  english: string;
  french?: string;
  japanese: string;
  romaji: string;
  category: string;
  track: 'tech' | 'life';
  subcategory?: string;
  example?: {
    japanese: string;
    romaji: string;
    english: string;
  };
  notes?: string;
}

export interface SRSState {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: string;
}

export type Grade = 'hard' | 'good' | 'easy';
export type Track = 'tech' | 'life';

export interface CardWithSRS extends FlashCard {
  srs: SRSState;
}

export interface TrackInfo {
  id: Track;
  label: string;
  shortLabel: string;
  description: string;
  subcategories: string[];
  accent: 'tech' | 'life';
}
