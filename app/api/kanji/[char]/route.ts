import { NextRequest, NextResponse } from 'next/server';
import n5KanjiData from '@/data/n5-kanji.json';
import n4KanjiData from '@/data/n4-kanji.json';

type LocalEntry = {
  character: string;
  onyomi: string[];
  kunyomi: string[];
  meaning_en: string;
  meaning_fr: string;
  jlpt_level: string;
  stroke_count: number;
};

const allLocalKanji = [...(n5KanjiData as LocalEntry[]), ...(n4KanjiData as LocalEntry[])];
const localMap = new Map<string, LocalEntry>(allLocalKanji.map((k) => [k.character, k]));

export async function GET(_req: NextRequest, { params }: { params: Promise<{ char: string }> }) {
  const { char } = await params;
  const decoded = decodeURIComponent(char);

  // Local first (N5 + N4)
  const local = localMap.get(decoded);
  if (local) {
    return NextResponse.json({
      character: local.character,
      onyomi: local.onyomi,
      kunyomi: local.kunyomi,
      meaning_fr: local.meaning_fr,
      jlpt: local.jlpt_level,
      stroke_count: local.stroke_count,
      source: 'local',
    });
  }

  // Fallback: kanjiapi.dev for N3/N2 and beyond
  try {
    const res = await fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(decoded)}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const data = await res.json();
    return NextResponse.json({
      character: decoded,
      onyomi: data.on_readings ?? [],
      kunyomi: data.kun_readings ?? [],
      meaning_fr: (data.meanings ?? []).join(', '),
      jlpt: data.jlpt ?? '—',
      stroke_count: data.stroke_count ?? null,
      source: 'kanjiapi',
    });
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
