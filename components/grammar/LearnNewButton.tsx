'use client';

import { useRouter } from 'next/navigation';
import { useGrammarStore } from '@/stores/grammar-store';
import grammarN5N4 from '@/data/grammar-n5-n4.json';
import grammarN3 from '@/data/grammar-n3.json';
import grammarN3Part2 from '@/data/grammar-n3-part2.json';
import grammarN3Part3 from '@/data/grammar-n3-part3.json';
import type { GrammarPoint } from '@/lib/grammar-types';

const allGrammar = [
  ...(grammarN5N4 as GrammarPoint[]),
  ...(grammarN3 as GrammarPoint[]),
  ...(grammarN3Part2 as GrammarPoint[]),
  ...(grammarN3Part3 as GrammarPoint[]),
];

export default function LearnNewButton() {
  const router = useRouter();
  const { getSRS } = useGrammarStore();

  function handleClick() {
    // Find first grammar point with 0 reviews (never seen)
    const firstNew = allGrammar.find((p) => getSRS(p.id).total_reviews === 0);
    if (firstNew) {
      router.push(`/grammar/lesson/${firstNew.id}`);
    } else {
      // All points seen — go to review session
      router.push('/grammar/session?mode=learn');
    }
  }

  return (
    <button
      onClick={handleClick}
      className="bg-emerald-950/30 border border-emerald-700/30 rounded-2xl p-4 hover:border-emerald-500/50 transition-colors group text-left w-full"
    >
      <p className="text-2xl mb-2">✨</p>
      <p className="font-semibold text-emerald-300 group-hover:text-emerald-200">Learn New</p>
      <p className="text-xs text-slate-400 mt-1">Lesson first, then exercises</p>
    </button>
  );
}
