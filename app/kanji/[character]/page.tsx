import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import KanjiDetail from "@/components/kanji/KanjiDetail";
import n5KanjiData from "@/data/n5-kanji.json";
import n4KanjiData from "@/data/n4-kanji.json";
import techVocab from "@/data/tech-vocabulary.json";
import n5Vocab from "@/data/n5-vocabulary.json";
import n4Vocab from "@/data/n4-vocabulary.json";
import type { KanjiEntry, VocabCard } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Allow dynamic rendering for kanji not pre-generated (N4, N3, N2, etc.)
export const dynamicParams = true;

export async function generateStaticParams() {
  return (n5KanjiData as KanjiEntry[]).map((k) => ({
    character: encodeURIComponent(k.character),
  }));
}

async function fetchKanjiFromApi(character: string): Promise<KanjiEntry | null> {
  try {
    const res = await fetch(
      `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(character)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: `api-${character}`,
      character,
      onyomi: data.on_readings ?? [],
      kunyomi: data.kun_readings ?? [],
      meaning_en: (data.meanings ?? []).join(", "),
      meaning_fr: (data.meanings ?? []).join(", "),
      jlpt_level: (data.jlpt ?? "N4") as KanjiEntry["jlpt_level"],
      stroke_count: data.stroke_count ?? 0,
      radicals: [],
    };
  } catch {
    return null;
  }
}

export default async function KanjiDetailPage({
  params,
}: {
  params: Promise<{ character: string }>;
}) {
  const { character } = await params;
  const decoded = decodeURIComponent(character);

  // Search all local kanji data
  const allLocalKanji = [
    ...(n5KanjiData as KanjiEntry[]),
    ...(n4KanjiData as KanjiEntry[]),
  ];
  let kanji = allLocalKanji.find((k) => k.character === decoded);

  // Fall back to kanjiapi.dev for N4/N3/N2 kanji not yet in local data
  if (!kanji) {
    kanji = (await fetchKanjiFromApi(decoded)) ?? undefined;
  }

  if (!kanji) notFound();

  // Find vocabulary containing this kanji
  const allVocab = [
    ...(n5Vocab as VocabCard[]),
    ...(n4Vocab as VocabCard[]),
    ...(techVocab as VocabCard[]),
  ];
  const relatedVocab = allVocab.filter((v) => v.kanji.includes(decoded)).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <Link
            href="/kanji"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            Kanji
          </Link>
        </div>
        <KanjiDetail kanji={kanji} relatedVocab={relatedVocab} />
      </main>
    </div>
  );
}
