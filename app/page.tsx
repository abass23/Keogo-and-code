import Header from "@/components/layout/Header";
import ProgressDashboard from "@/components/dashboard/ProgressDashboard";
import DeckCard from "@/components/dashboard/DeckCard";
import StudyHeatmap from "@/components/gamification/StudyHeatmap";
import WelcomeOverlay from "@/components/onboarding/WelcomeOverlay";
import techData from "@/data/tech-vocabulary.json";
import lifeData from "@/data/life-vocabulary.json";
import n5Data from "@/data/n5-vocabulary.json";
import n4Data from "@/data/n4-vocabulary.json";
import businessData from "@/data/business-vocabulary.json";
import automotiveData from "@/data/automotive-vocabulary.json";
import type { VocabCard } from "@/lib/types";

const allCards = [
  ...n5Data,
  ...n4Data,
  ...techData,
  ...lifeData,
  ...businessData,
  ...automotiveData,
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
    title_en: "Automotive 自動車",
    title_fr: "Automobile 自動車",
    description_en: "ECU, safety standards, validation, HIL testing — vocabulary for the Japanese automotive industry.",
    description_fr: "ECU, normes de sécurité, validation, tests HIL — vocabulaire pour l'industrie automobile japonaise.",
    cards: automotiveData as VocabCard[],
    href: "/flashcards?domain=automotive",
    accent: "blue" as const,
    tags: ["ECU", "ISO 26262", "HIL", "検証"],
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
      <WelcomeOverlay />
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

        {/* Grammar Dojo feature card */}
        <div className="mb-6">
          <a
            href="/grammar"
            className="block rounded-2xl bg-gradient-to-br from-violet-900/30 to-indigo-900/20 border border-violet-700/30 p-5 hover:border-violet-500/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⛩️</span>
                <div>
                  <p className="font-semibold text-violet-300 group-hover:text-violet-200">
                    文法道場 — Grammar Dojo
                  </p>
                  <p className="text-xs text-slate-400">Phase 5 · Feature 7</p>
                </div>
              </div>
              <span className="text-xs bg-violet-700/30 text-violet-300 border border-violet-600/30 px-2 py-1 rounded-full">New</span>
            </div>
            <p className="text-sm text-slate-400">
              7 exercise types · SM-2 SRS · Ghost grammar · N5→N4 seed loaded
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['✏️ Fill Blank', '🎯 MCQ', '⚡ Conjugation', '🧩 Builder', '🔍 Error Spotter'].map((tag) => (
                <span key={tag} className="text-xs text-slate-500 bg-slate-800/60 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </a>
        </div>

        {/* Deck cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DECKS.map((deck) => (
            <DeckCard key={deck.href} {...deck} />
          ))}
        </div>

        {/* Study heatmap */}
        <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
          <StudyHeatmap />
        </div>
      </main>
    </div>
  );
}
