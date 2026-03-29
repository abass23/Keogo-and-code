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
import { existsSync } from "fs";
import { join } from "path";

// N3/N2 loaded at runtime if seed files exist
function loadOptionalJson(filename: string): KanjiEntry[] {
  const p = join(process.cwd(), "data", filename);
  if (!existsSync(p)) return [];
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(p) as KanjiEntry[];
}

const n3KanjiData = loadOptionalJson("n3-kanji.json");
const n2KanjiData = loadOptionalJson("n2-kanji.json");

// Allow dynamic rendering for kanji not pre-generated (N4, N3, N2, etc.)
export const dynamicParams = true;

export async function generateStaticParams() {
  // Return raw characters — Next.js handles URL-encoding internally.
  // Using encodeURIComponent here causes double-encoding (%25XX) and 404s.
  const n5 = (n5KanjiData as KanjiEntry[]).map((k) => ({ character: k.character }));
  const n4 = (n4KanjiData as KanjiEntry[]).map((k) => ({ character: k.character }));
  const n3 = n3KanjiData.map((k) => ({ character: k.character }));
  const n2 = n2KanjiData.map((k) => ({ character: k.character }));
  return [...n5, ...n4, ...n3, ...n2];
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

  // Search all local kanji data (N5 → N2)
  const allLocalKanji = [
    ...(n5KanjiData as KanjiEntry[]),
    ...(n4KanjiData as KanjiEntry[]),
    ...n3KanjiData,
    ...n2KanjiData,
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
