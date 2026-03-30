'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Volume2, ArrowRight, BookOpen, Zap } from 'lucide-react';
import Header from '@/components/layout/Header';
import GrammarFurigana from '@/components/grammar/GrammarFurigana';
import { useAppStore } from '@/stores/app-store';
import { speakJapanese } from '@/lib/audio';
import grammarN5N4 from '@/data/grammar-n5-n4.json';
import grammarN3 from '@/data/grammar-n3.json';
import grammarN3Part2 from '@/data/grammar-n3-part2.json';
import grammarN3Part3 from '@/data/grammar-n3-part3.json';
import type { GrammarPoint } from '@/lib/grammar-types';
import { use } from 'react';

const allGrammar = [
  ...(grammarN5N4 as GrammarPoint[]),
  ...(grammarN3 as GrammarPoint[]),
  ...(grammarN3Part2 as GrammarPoint[]),
  ...(grammarN3Part3 as GrammarPoint[]),
];

const LEVEL_BADGE: Record<string, string> = {
  N5: 'bg-emerald-700/30 text-emerald-300 border-emerald-600/30',
  N4: 'bg-blue-700/30 text-blue-300 border-blue-600/30',
  N3: 'bg-violet-700/30 text-violet-300 border-violet-600/30',
  N2: 'bg-rose-700/30 text-rose-300 border-rose-600/30',
};

// Strip {漢字|reading} → just kanji for TTS
function stripFurigana(text: string): string {
  return text.replace(/\{([^|]+)\|[^}]+\}/g, '$1');
}

export default function GrammarLessonPage({ params }: { params: Promise<{ pointId: string }> }) {
  const { pointId } = use(params);
  const { locale } = useAppStore();

  const point = allGrammar.find((p) => p.id === pointId);
  if (!point) notFound();

  const relatedPoints = point.related_points
    .map((id) => allGrammar.find((p) => p.id === id))
    .filter(Boolean) as GrammarPoint[];

  // Collect domain examples from exercises (embedded + business preferred)
  const domainExamples = (point.exercises ?? [])
    .filter((ex) => ex.type === 'fill_blank' || ex.type === 'mcq')
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Top nav */}
        <div className="flex items-center justify-between">
          <Link
            href="/grammar"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'fr' ? 'Retour au dojo' : 'Back to Grammar Dojo'}
          </Link>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${LEVEL_BADGE[point.jlpt_level] ?? ''}`}>
            {point.jlpt_level}
          </span>
        </div>

        {/* Pattern + meaning */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <h1 className="text-3xl font-jp text-slate-100 flex-1">{point.pattern}</h1>
            <button
              onClick={() => speakJapanese(stripFurigana(point.pattern))}
              className="mt-1 p-2 rounded-full hover:bg-slate-800 text-slate-500 hover:text-cyan-400 transition-colors shrink-0"
              aria-label="Pronounce"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-slate-300 text-base">
            {locale === 'fr' ? point.meaning_fr : point.meaning_en}
          </p>
        </div>

        {/* Summary explanation */}
        <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/40 space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
            {locale === 'fr' ? 'Explication' : 'Explanation'}
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {locale === 'fr' ? point.explanation_fr : point.explanation_en}
          </p>
        </div>

        {/* Formation */}
        {point.formation.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              {locale === 'fr' ? 'Formation' : 'Formation'}
            </h2>
            <div className="space-y-4">
              {point.formation.map((rule, i) => (
                <div key={i} className="bg-slate-900/60 rounded-2xl border border-slate-700/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-cyan-900/40 text-cyan-400 border border-cyan-700/30 px-2 py-1 rounded-md font-jp">
                      {rule.base}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-xs text-slate-400">{rule.rule}</span>
                  </div>
                  {rule.examples.length > 0 && (
                    <div className="space-y-1 pl-2 border-l-2 border-slate-700/40">
                      {rule.examples.map((ex, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm">
                          <span className="font-jp text-slate-400">{ex.input}</span>
                          <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                          <button
                            onClick={() => speakJapanese(stripFurigana(ex.output))}
                            className="font-jp text-emerald-300 hover:text-emerald-200 transition-colors"
                          >
                            <GrammarFurigana text={ex.output} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Example sentences from exercises */}
        {domainExamples.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              {locale === 'fr' ? 'Exemples' : 'Examples'}
            </h2>
            <div className="space-y-3">
              {domainExamples.map((ex) => {
                const sentence =
                  'sentence' in ex.question ? (ex.question as { sentence: string }).sentence : '';
                const hint = 'hint_en' in ex.question
                  ? (ex.question as { hint_en: string; hint_fr: string })
                  : null;
                if (!sentence) return null;
                return (
                  <div
                    key={ex.id}
                    className="bg-slate-900/60 rounded-2xl border border-slate-700/40 p-4 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => speakJapanese(stripFurigana(sentence))}
                        className="mt-0.5 p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-cyan-400 transition-colors shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <p className="font-jp text-slate-200 text-sm leading-relaxed">
                        <GrammarFurigana text={sentence} />
                      </p>
                    </div>
                    {hint && (
                      <p className="text-xs text-slate-500 pl-7">
                        {locale === 'fr' ? hint.hint_fr : hint.hint_en}
                      </p>
                    )}
                    <div className="pl-7">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        ex.domain === 'embedded' ? 'bg-cyan-900/30 text-cyan-400 border-cyan-800/40' :
                        ex.domain === 'business' ? 'bg-violet-900/30 text-violet-400 border-violet-800/40' :
                        ex.domain === 'automotive' ? 'bg-blue-900/30 text-blue-400 border-blue-800/40' :
                        'bg-slate-800/40 text-slate-500 border-slate-700/30'
                      }`}>
                        {ex.domain}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Common mistakes */}
        {point.common_mistakes.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              {locale === 'fr' ? 'Erreurs fréquentes' : 'Common Mistakes'}
            </h2>
            <div className="space-y-2">
              {point.common_mistakes.map((mistake, i) => (
                <div key={i} className="bg-slate-900/60 rounded-2xl border border-slate-700/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="text-red-400 line-through font-jp">
                      <GrammarFurigana text={mistake.wrong} />
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-emerald-400 font-jp">
                      <GrammarFurigana text={mistake.correct} />
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {locale === 'fr' ? mistake.explanation_fr : mistake.explanation_en}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nuance */}
        {point.nuance && (
          <div className="bg-amber-950/20 border border-amber-700/30 rounded-2xl p-4 space-y-1">
            <p className="text-xs text-amber-500 uppercase tracking-wide font-semibold">
              💡 {locale === 'fr' ? 'Nuance' : 'Nuance'}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">{point.nuance}</p>
          </div>
        )}

        {/* Related grammar */}
        {relatedPoints.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              {locale === 'fr' ? 'Grammaire liée' : 'Related Grammar'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedPoints.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/grammar/lesson/${rel.id}`}
                  className="bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-2 text-sm hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                >
                  <span className="font-jp text-slate-300">{rel.pattern}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {locale === 'fr' ? rel.meaning_fr : rel.meaning_en}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-semibold text-slate-100">
                {locale === 'fr' ? 'Prêt à pratiquer ?' : 'Ready to practice?'}
              </p>
              <p className="text-xs text-slate-400">
                {(point.exercises ?? []).length} {locale === 'fr' ? 'exercices disponibles' : 'exercises available'}
              </p>
            </div>
          </div>
          <Link
            href={`/grammar/session?mode=cram&point=${point.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-3 text-white font-semibold transition-colors"
          >
            <Zap className="w-4 h-4" />
            {locale === 'fr' ? 'Commencer les exercices' : 'Start Exercises'}
          </Link>
          <Link
            href={`/grammar/session?mode=learn&point=${point.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 py-3 text-slate-200 font-semibold transition-colors text-sm"
          >
            <BookOpen className="w-4 h-4" />
            {locale === 'fr' ? 'Ajouter à la file SRS' : 'Add to SRS Queue'}
          </Link>
        </div>

        {/* Bottom padding */}
        <div className="h-8" />
      </main>
    </div>
  );
}
