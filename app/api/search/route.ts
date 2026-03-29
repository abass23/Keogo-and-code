import { NextRequest, NextResponse } from 'next/server';
import type { VocabCard } from '@/lib/types';

// ── Load all local vocab sources at module level (server-side bundle) ──
import n5Vocab from '@/data/n5-vocabulary.json';
import n4Vocab from '@/data/n4-vocabulary.json';
import embeddedVocab from '@/data/embedded-vocabulary.json';
import automotiveVocab from '@/data/automotive-vocabulary.json';
import businessVocab from '@/data/business-vocabulary.json';
import keigoVocab from '@/data/keigo-vocabulary.json';
import lifeVocab from '@/data/life-vocabulary.json';
import techVocab from '@/data/tech-vocabulary.json';

const ALL_LOCAL: VocabCard[] = [
  ...(n5Vocab as VocabCard[]),
  ...(n4Vocab as VocabCard[]),
  ...(embeddedVocab as VocabCard[]),
  ...(automotiveVocab as VocabCard[]),
  ...(businessVocab as VocabCard[]),
  ...(keigoVocab as VocabCard[]),
  ...(lifeVocab as VocabCard[]),
  ...(techVocab as VocabCard[]),
];

export interface SearchResult {
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning_en: string;
  meaning_fr: string;
  jlpt_level: string;
  domain?: string;
  source: 'local' | 'jisho';
  example?: { jp: string; reading: string; en: string; fr?: string };
  audio_url?: string | null;
}

/** Split a meaning string into individual lowercase words, stripping punctuation */
function words(s: string): string[] {
  return s.toLowerCase().split(/[\s,\/\-\(\)\.·]+/).filter(Boolean);
}

/** True if the query matches at least one whole word in the string */
function wordMatch(s: string, q: string): boolean {
  return words(s).some((w) => w === q);
}

/** True if the query is a prefix of at least one whole word in the string */
function wordStartsWith(s: string, q: string): boolean {
  return words(s).some((w) => w.startsWith(q) && w !== q);
}

function searchLocal(q: string): SearchResult[] {
  const lower = q.toLowerCase().trim();
  if (!lower) return [];

  const scored: Array<{ score: number; item: VocabCard }> = [];

  for (const item of ALL_LOCAL) {
    const en  = item.meaning_en.toLowerCase();
    const fr  = item.meaning_fr.toLowerCase();
    const kj  = item.kanji.toLowerCase();
    const hira = item.hiragana.toLowerCase();
    const rom  = item.romaji.toLowerCase();

    let score = 0;

    // Tier 1 — exact full-field match (e.g. meaning_en === "water")
    if (en === lower || fr === lower || kj === lower || hira === lower || rom === lower) {
      score = 100;
    }
    // Tier 2 — whole-word match inside meaning (e.g. "eau" matches "eau" in "l'eau")
    else if (wordMatch(en, lower) || wordMatch(fr, lower)) {
      score = 80;
    }
    // Tier 3 — whole-word match on kanji/hiragana/romaji
    else if (wordMatch(rom, lower) || hira.startsWith(lower) || kj.startsWith(lower)) {
      score = 70;
    }
    // Tier 4 — prefix of a whole word in meaning (e.g. "wat" matches "water")
    else if (wordStartsWith(en, lower) || wordStartsWith(fr, lower)) {
      score = 50;
    }
    // Tier 5 — romaji prefix (e.g. "mizu" matches "mizuumi")
    else if (rom.startsWith(lower)) {
      score = 40;
    }
    // Tier 6 — substring of kanji/hiragana only (NOT meanings — avoids "eau" in "nouveau")
    else if (kj.includes(lower) || hira.includes(lower)) {
      score = 20;
    }
    // Tier 7 — substring inside romaji (last resort, low score)
    else if (rom.includes(lower) && lower.length >= 3) {
      score = 10;
    }

    if (score > 0) scored.push({ score, item });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ item }) => ({
      kanji: item.kanji,
      hiragana: item.hiragana,
      romaji: item.romaji,
      meaning_en: item.meaning_en,
      meaning_fr: item.meaning_fr,
      jlpt_level: item.jlpt_level,
      domain: item.domain,
      source: 'local' as const,
      example: item.example_sentences?.[0],
      audio_url: item.audio_url,
    }));
}

async function searchJisho(q: string): Promise<SearchResult[]> {
  try {
    const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(q)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json.data ?? []).slice(0, 8).map((entry: any) => {
      const jp = entry.japanese?.[0] ?? {};
      const sense = entry.senses?.[0] ?? {};
      const jlptRaw: string = entry.jlpt?.[0] ?? '';
      const jlpt = jlptRaw.replace('jlpt-', '').toUpperCase() || 'N3';
      const meanings: string[] = sense.english_definitions ?? [];

      return {
        kanji: jp.word ?? jp.reading ?? '',
        hiragana: jp.reading ?? jp.word ?? '',
        romaji: '',
        meaning_en: meanings.join(', '),
        meaning_fr: meanings.join(', '), // Jisho only provides EN — FR shown as EN
        jlpt_level: jlpt,
        source: 'jisho' as const,
      } satisfies SearchResult;
    }).filter((r: SearchResult) => r.kanji);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  // Run local search and Jisho in parallel — always
  const [local, jishoRaw] = await Promise.all([
    Promise.resolve(searchLocal(q)),
    searchJisho(q),
  ]);

  // Deduplicate: Jisho entries whose kanji already appear locally go to the back
  const localKanji = new Set(local.map((r) => r.kanji));
  const jishoNew = jishoRaw.filter((r) => !localKanji.has(r.kanji));
  const jishoDupe = jishoRaw.filter((r) => localKanji.has(r.kanji));

  // Order: local (highest relevance) → new Jisho hits → Jisho dupes (extra readings)
  const results = [...local, ...jishoNew, ...jishoDupe].slice(0, 15);
  return NextResponse.json({ results });
}
