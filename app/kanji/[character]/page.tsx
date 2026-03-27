import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import KanjiDetail from "@/components/kanji/KanjiDetail";
import n5KanjiData from "@/data/n5-kanji.json";
import techVocab from "@/data/tech-vocabulary.json";
import n5Vocab from "@/data/n5-vocabulary.json";
import n4Vocab from "@/data/n4-vocabulary.json";
import type { KanjiEntry, VocabCard } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  return (n5KanjiData as KanjiEntry[]).map((k) => ({
    character: encodeURIComponent(k.character),
  }));
}

export default async function KanjiDetailPage({
  params,
}: {
  params: Promise<{ character: string }>;
}) {
  const { character } = await params;
  const decoded = decodeURIComponent(character);

  const allKanji = n5KanjiData as KanjiEntry[];
  const kanji = allKanji.find((k) => k.character === decoded);

  if (!kanji) notFound();

  // Find vocabulary containing this kanji
  const allVocab = [...(n5Vocab as VocabCard[]), ...(n4Vocab as VocabCard[]), ...(techVocab as VocabCard[])];
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
