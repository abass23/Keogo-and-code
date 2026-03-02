import Header from "@/components/layout/Header";
import TrackCard from "@/components/dashboard/TrackCard";
import techData from "@/data/tech-vocabulary.json";
import lifeData from "@/data/life-vocabulary.json";
import { FlashCard } from "@/lib/types";

const techCards = techData as FlashCard[];
const lifeCards = lifeData as FlashCard[];

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10">
        {/* Hero */}
        <div className="mb-10">
          <p className="font-jp text-lg text-slate-400 mb-2">おはようございます！</p>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Keigo <span className="text-cyan-400">&</span> Code
          </h1>
          <p className="text-slate-400 max-w-xl">
            Japanese tailored for embedded engineers — RTOS vocabulary, Agile Keigo, and
            travel phrases for your 2026 Japan trip.
          </p>
        </div>

        {/* Two tracks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TrackCard
            track="tech"
            cards={techCards}
            title="Tech & Keigo"
            description="RTOS concepts, Agile meeting phrases, and polite business Japanese for interviews and daily standups."
            subcategories={["RTOS", "Agile", "Keigo", "Embedded"]}
          />
          <TrackCard
            track="life"
            cards={lifeCards}
            title="Life & Travel"
            description="Navigate trains, book ryokans, order food, and handle daily situations during your trip to Japan."
            subcategories={["Transport", "Ryokan", "Food", "Shopping"]}
          />
        </div>

        {/* Footer note */}
        <p className="mt-12 text-center text-xs text-slate-600">
          Progress saved locally in your browser · Phase 2: AI voice simulator coming soon
        </p>
      </main>
    </div>
  );
}
