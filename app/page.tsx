import Header from "@/components/layout/Header";
import ProgressDashboard from "@/components/dashboard/ProgressDashboard";
import DeckCard from "@/components/dashboard/DeckCard";
import techData from "@/data/tech-vocabulary.json";
import lifeData from "@/data/life-vocabulary.json";
import n5Data from "@/data/n5-vocabulary.json";
import n4Data from "@/data/n4-vocabulary.json";
import businessData from "@/data/business-vocabulary.json";
import type { VocabCard } from "@/lib/types";

const allCards = [
  ...n5Data,
  ...n4Data,
  ...techData,
  ...lifeData,
  ...businessData,
] as VocabCard[];

const DECKS = [
  {
    title_en: "Embedded Systems",
    title_fr: "Systèmes embarqués",
    description_en: "RTOS, CAN bus, interrupts, debugging — the vocabulary you need for Japanese tech interviews.",
    description_fr: "RTOS, bus CAN, interruptions, débogage — le vocabulaire pour vos entretiens techniques au Japon.",
    cards: techData as VocabCard[],
    href: "/flashcards?domain=embedded",
    accent: "cyan" as const,
    tags: ["RTOS", "CAN", "HAL", "デバッグ"],
  },
  {
    title_en: "Business Keigo",
    title_fr: "Keigo professionnel",
    description_en: "Interview phrases, office greetings, Agile/Scrum terminology, and email patterns.",
    description_fr: "Phrases d'entretien, salutations, terminologie Agile/Scrum et formules d'email.",
    cards: businessData as VocabCard[],
    href: "/flashcards?domain=business",
    accent: "violet" as const,
    tags: ["自己紹介", "スプリント", "報連相", "敬語"],
  },
  {
    title_en: "N5 Core",
    title_fr: "N5 Fondamentaux",
    description_en: "Essential N5 vocabulary — the building blocks of Japanese.",
    description_fr: "Vocabulaire N5 essentiel — les bases du japonais.",
    cards: n5Data as VocabCard[],
    href: "/flashcards?level=N5",
    accent: "emerald" as const,
    tags: ["日本語", "仕事", "時間", "見る"],
  },
  {
    title_en: "Life & Travel",
    title_fr: "Vie & Voyage",
    description_en: "Navigate daily life in Japan — transport, restaurants, shopping, ryokans.",
    description_fr: "Vivre au Japon au quotidien — transports, restaurants, achats, ryokans.",
    cards: lifeData as VocabCard[],
    href: "/flashcards?domain=core&subdomain=life",
    accent: "amber" as const,
    tags: ["電車", "旅館", "食べ物", "買い物"],
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <p className="font-jp text-lg text-slate-400 mb-1">おはようございます！</p>
          <h1 className="text-3xl font-bold text-slate-100 mb-1">
            Keigo <span className="text-cyan-400">&</span> Code
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Japanese for embedded engineers — N5→N3/N2 by December 2026.
          </p>
        </div>

        {/* Progress */}
        <ProgressDashboard allCards={allCards} />

        {/* Deck cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DECKS.map((deck) => (
            <DeckCard key={deck.href} {...deck} />
          ))}
        </div>
      </main>
    </div>
  );
}
