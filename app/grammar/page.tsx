import Link from 'next/link';
import Header from '@/components/layout/Header';
import grammarN5N4 from '@/data/grammar-n5-n4.json';
import grammarN3 from '@/data/grammar-n3.json';
import grammarN3Part2 from '@/data/grammar-n3-part2.json';
import grammarN3Part3 from '@/data/grammar-n3-part3.json';
import type { GrammarPoint, JlptLevel, GrammarCategory } from '@/lib/grammar-types';

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2'];

const CATEGORY_LABELS: Record<string, { en: string; fr: string; icon: string }> = {
  particles:       { en: 'Particles',          fr: 'Particules',         icon: '🔵' },
  verb_form:       { en: 'Verb Forms',          fr: 'Formes verbales',    icon: '⚡' },
  adjective_form:  { en: 'Adjective Forms',     fr: 'Formes adjectivales',icon: '🎨' },
  tense_aspect:    { en: 'Tense & Aspect',      fr: 'Temps & Aspect',     icon: '⏱️' },
  obligation:      { en: 'Obligation',          fr: 'Obligation',         icon: '📌' },
  prohibition:     { en: 'Prohibition',         fr: 'Interdiction',       icon: '🚫' },
  permission:      { en: 'Permission',          fr: 'Permission',         icon: '✅' },
  conditional:     { en: 'Conditional',         fr: 'Conditionnel',       icon: '🔀' },
  passive:         { en: 'Passive Voice',       fr: 'Voix passive',       icon: '↩️' },
  causative:       { en: 'Causative',           fr: 'Causatif',           icon: '🎯' },
  potential:       { en: 'Potential',           fr: 'Potentiel',          icon: '💪' },
  desire:          { en: 'Desire / Intention',  fr: 'Désir / Intention',  icon: '💭' },
  conjunction:     { en: 'Conjunctions',        fr: 'Conjonctions',       icon: '🔗' },
  comparison:      { en: 'Comparison',          fr: 'Comparaison',        icon: '⚖️' },
  expression:      { en: 'Expressions',         fr: 'Expressions',        icon: '💬' },
  keigo:           { en: 'Keigo 敬語',           fr: 'Keigo 敬語',          icon: '🎩' },
  question:        { en: 'Questions',           fr: 'Questions',          icon: '❓' },
  negation:        { en: 'Negation',            fr: 'Négation',           icon: '✖️' },
};

const LEVEL_COLORS: Record<JlptLevel, string> = {
  N5: 'from-emerald-800/40 to-emerald-900/20 border-emerald-700/30',
  N4: 'from-blue-800/40 to-blue-900/20 border-blue-700/30',
  N3: 'from-violet-800/40 to-violet-900/20 border-violet-700/30',
  N2: 'from-rose-800/40 to-rose-900/20 border-rose-700/30',
};

const LEVEL_BADGE: Record<JlptLevel, string> = {
  N5: 'bg-emerald-700/30 text-emerald-300 border-emerald-600/30',
  N4: 'bg-blue-700/30 text-blue-300 border-blue-600/30',
  N3: 'bg-violet-700/30 text-violet-300 border-violet-600/30',
  N2: 'bg-rose-700/30 text-rose-300 border-rose-600/30',
};

const allGrammarData: GrammarPoint[] = [
  ...(grammarN5N4 as GrammarPoint[]),
  ...(grammarN3 as GrammarPoint[]),
  ...(grammarN3Part2 as GrammarPoint[]),
  ...(grammarN3Part3 as GrammarPoint[]),
];

export default function GrammarDojoPage() {
  const allPoints = allGrammarData;

  // Group by level
  const byLevel = LEVELS.reduce(
    (acc, lvl) => {
      acc[lvl] = allPoints.filter((p) => p.jlpt_level === lvl);
      return acc;
    },
    {} as Record<JlptLevel, GrammarPoint[]>,
  );

  // Unique categories in seed data
  const categoriesInData = [...new Set(allPoints.map((p) => p.category))];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⛩️</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                文法道場 <span className="text-slate-400 text-lg font-normal">Grammar Dojo</span>
              </h1>
              <p className="text-slate-400 text-sm">
                Master Japanese grammar through active practice — 7 exercise types, SRS-powered.
              </p>
            </div>
          </div>
        </div>

        {/* Quick start cards */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/grammar/session?mode=review"
            className="bg-cyan-950/30 border border-cyan-700/30 rounded-2xl p-4 hover:border-cyan-500/50 transition-colors group"
          >
            <p className="text-2xl mb-2">📖</p>
            <p className="font-semibold text-cyan-300 group-hover:text-cyan-200">SRS Review</p>
            <p className="text-xs text-slate-400 mt-1">Points due for review</p>
          </Link>
          <Link
            href="/grammar/session?mode=learn"
            className="bg-emerald-950/30 border border-emerald-700/30 rounded-2xl p-4 hover:border-emerald-500/50 transition-colors group"
          >
            <p className="text-2xl mb-2">✨</p>
            <p className="font-semibold text-emerald-300 group-hover:text-emerald-200">Learn New</p>
            <p className="text-xs text-slate-400 mt-1">Introduce new grammar points</p>
          </Link>
          <Link
            href="/grammar/session?mode=cram&level=N4"
            className="bg-amber-950/30 border border-amber-700/30 rounded-2xl p-4 hover:border-amber-500/50 transition-colors group"
          >
            <p className="text-2xl mb-2">⚡</p>
            <p className="font-semibold text-amber-300 group-hover:text-amber-200">Cram N4</p>
            <p className="text-xs text-slate-400 mt-1">No SRS impact — rapid drill</p>
          </Link>
          <Link
            href="/grammar/session?mode=cram&level=N3"
            className="bg-violet-950/30 border border-violet-700/30 rounded-2xl p-4 hover:border-violet-500/50 transition-colors group"
          >
            <p className="text-2xl mb-2">🏯</p>
            <p className="font-semibold text-violet-300 group-hover:text-violet-200">Cram N3</p>
            <p className="text-xs text-slate-400 mt-1">Intermediate grammar drill</p>
          </Link>
        </div>

        {/* Grammar points by level */}
        {LEVELS.map((level) => {
          const points = byLevel[level];
          if (!points.length) return null;

          // Group by category
          const byCategory = points.reduce(
            (acc, p) => {
              if (!acc[p.category]) acc[p.category] = [];
              acc[p.category].push(p);
              return acc;
            },
            {} as Record<string, GrammarPoint[]>,
          );

          return (
            <section key={level} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full border ${LEVEL_BADGE[level]}`}>
                    {level}
                  </span>
                  <span className="text-slate-300 font-semibold">
                    {level === 'N5' ? 'Foundation' : level === 'N4' ? 'Elementary' : level === 'N3' ? 'Intermediate' : 'Upper-Intermediate'}
                  </span>
                </div>
                <Link
                  href={`/grammar/session?mode=cram&level=${level}`}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Cram all {level} →
                </Link>
              </div>

              <div className={`rounded-2xl bg-gradient-to-br border p-4 ${LEVEL_COLORS[level]} space-y-3`}>
                {Object.entries(byCategory).map(([cat, catPoints]) => {
                  const catInfo = CATEGORY_LABELS[cat] ?? { en: cat, fr: cat, icon: '📚' };
                  return (
                    <div key={cat} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{catInfo.icon}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wide">
                          {catInfo.en}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pl-5">
                        {catPoints.map((point) => (
                          <Link
                            key={point.id}
                            href={`/grammar/session?mode=cram&point=${point.id}`}
                            className="font-jp text-sm bg-slate-900/60 border border-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                          >
                            {point.pattern}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Coming soon: N2 */}
        <section className="opacity-50">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${LEVEL_BADGE['N2']}`}>
              N2
            </span>
            <span className="text-slate-500 text-sm">Coming soon — ~195 points</span>
          </div>
          <div className="rounded-2xl border border-slate-700/30 p-6 text-center">
            <p className="text-slate-600 text-sm">
              N2 grammar points will be added in the next seed batch
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
