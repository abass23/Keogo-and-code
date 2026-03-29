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

function searchLocal(q: string): SearchResult[] {
  const lower = q.toLowerCase().trim();
  if (!lower) return [];

  // Score-based ranking: exact match > starts with > contains
  const scored: Array<{ score: number; item: VocabCard }> = [];

  for (const item of ALL_LOCAL) {
    const en = item.meaning_en.toLowerCase();
    const fr = item.meaning_fr.toLowerCase();
    const kj = item.kanji.toLowerCase();
    const hira = item.hiragana.toLowerCase();
    const rom = item.romaji.toLowerCase();

    let score = 0;
    if (en === lower || fr === lower || kj === lower || hira === lower || rom === lower) score = 100;
    else if (en.startsWith(lower) || fr.startsWith(lower)) score = 60;
    else if (kj.startsWith(lower) || hira.startsWith(lower) || rom.startsWith(lower)) score = 55;
    else if (en.includes(lower) || fr.includes(lower)) score = 30;
    else if (kj.includes(lower) || hira.includes(lower) || rom.includes(lower)) score = 25;

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
