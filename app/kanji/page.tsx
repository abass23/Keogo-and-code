import Header from "@/components/layout/Header";
import KanjiCard from "@/components/kanji/KanjiCard";
import n5KanjiData from "@/data/n5-kanji.json";
import type { KanjiEntry } from "@/lib/types";

export default function KanjiPage() {
  const n5Kanji = n5KanjiData as KanjiEntry[];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Kanji</h1>
          <p className="text-slate-400 text-sm">
            N5 kanji with readings, mnemonics, and example vocabulary.
          </p>
        </div>

        {/* N5 grid */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">N5</h2>
            <span className="text-xs text-slate-600">{n5Kanji.length} characters</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {n5Kanji.map((k) => (
              <KanjiCard key={k.id} kanji={k} size="sm" />
            ))}
          </div>
        </section>

        {/* Placeholder for N4 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">N4</h2>
            <span className="text-xs text-slate-600">Coming soon</span>
          </div>
          <div className="rounded-xl border border-zinc-800 border-dashed p-8 text-center text-slate-600 text-sm">
            N4 kanji will be available in the next update.
          </div>
        </section>
      </main>
    </div>
  );
}
