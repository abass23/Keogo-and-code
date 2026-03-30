'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import FlashCardSession from '@/components/flashcard/FlashCardSession';
import DeckSelector from '@/components/dashboard/DeckSelector';
import type { VocabCard, DeckFilter } from '@/lib/types';
import techData from '@/data/tech-vocabulary.json';
import lifeData from '@/data/life-vocabulary.json';
import n5Data from '@/data/n5-vocabulary.json';
import n4Data from '@/data/n4-vocabulary.json';
import businessData from '@/data/business-vocabulary.json';

const ALL_CARDS = [
  ...n5Data,
  ...n4Data,
  ...techData,
  ...lifeData,
  ...businessData,
] as VocabCard[];

function FlashcardsContent() {
  const searchParams = useSearchParams();

  const initialFilter: DeckFilter = {};
  const level = searchParams.get('level');
  const domain = searchParams.get('domain');
  if (level) initialFilter.jlpt_level = [level as never];
  if (domain) initialFilter.domain = [domain as never];

  const [filter, setFilter] = useState<DeckFilter>(initialFilter);

  return (
    <>
      <div className="max-w-2xl mx-auto w-full px-4 py-4">
        <DeckSelector selected={filter} onChange={setFilter} />
      </div>
      <main className="flex-1">
        <FlashCardSession cards={ALL_CARDS} filter={filter} />
      </main>
    </>
  );
}

export default function FlashcardsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-500">Loading...</div>}>
        <FlashcardsContent />
      </Suspense>
    </div>
  );
}
