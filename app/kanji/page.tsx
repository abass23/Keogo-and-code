import Header from "@/components/layout/Header";
import KanjiCard from "@/components/kanji/KanjiCard";
import n5KanjiData from "@/data/n5-kanji.json";
import n4KanjiData from "@/data/n4-kanji.json";
import type { KanjiEntry } from "@/lib/types";
import { existsSync } from "fs";
import { join } from "path";

// N3 and N2 loaded at runtime if the seed files exist
function loadOptionalJson(filename: string): KanjiEntry[] {
  const p = join(process.cwd(), "data", filename);
  if (!existsSync(p)) return [];
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(p) as KanjiEntry[];
}

const n3KanjiData = loadOptionalJson("n3-kanji.json");
const n2KanjiData = loadOptionalJson("n2-kanji.json");

const LEVELS: { key: string; label: string; data: KanjiEntry[]; badge: string }[] = [
  { key: "N5", label: "N5 — Foundation",           data: n5KanjiData as KanjiEntry[], badge: "text-emerald-400" },
  { key: "N4", label: "N4 — Elementary",            data: n4KanjiData as KanjiEntry[], badge: "text-cyan-400"    },
  { key: "N3", label: "N3 — Intermediate",          data: n3KanjiData,                 badge: "text-blue-400"    },
  { key: "N2", label: "N2 — Upper-Intermediate",    data: n2KanjiData,                 badge: "text-violet-400"  },
];

export default function KanjiPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Kanji</h1>
          <p className="text-slate-400 text-sm">
            N5 → N2 kanji with readings, mnemonics, and example vocabulary.
          </p>
        </div>

        {LEVELS.map(({ key, label, data, badge }) =>
          data.length > 0 ? (
            <section key={key} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className={`text-sm font-semibold uppercase tracking-wider ${badge}`}>
                  {label}
                </h2>
                <span className="text-xs text-slate-600">{data.length} characters</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {data.map((k) => (
                  <KanjiCard key={k.id} kanji={k} size="sm" />
                ))}
              </div>
            </section>
          ) : (
            <section key={key} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className={`text-sm font-semibold uppercase tracking-wider opacity-40 ${badge}`}>
                  {label}
                </h2>
                <span className="text-xs text-slate-700">Coming soon</span>
              </div>
              <div className="rounded-xl border border-zinc-800 border-dashed p-8 text-center text-slate-700 text-sm">
                {key} kanji will be available in the next update.
              </div>
            </section>
          )
        )}
      </main>
    </div>
  );
}
