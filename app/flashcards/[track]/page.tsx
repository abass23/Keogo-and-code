import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import FlashCardSession from "@/components/flashcard/FlashCardSession";
import techData from "@/data/tech-vocabulary.json";
import lifeData from "@/data/life-vocabulary.json";
import { FlashCard, Track } from "@/lib/types";

type Props = {
  params: Promise<{ track: string }>;
};

export async function generateStaticParams() {
  return [{ track: "tech" }, { track: "life" }];
}

export default async function FlashcardsPage({ params }: Props) {
  const { track } = await params;

  if (track !== "tech" && track !== "life") {
    notFound();
  }

  const cards: FlashCard[] =
    track === "tech"
      ? (techData as FlashCard[])
      : (lifeData as FlashCard[]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-3xl py-6">
        <FlashCardSession track={track as Track} cards={cards} />
      </main>
    </div>
  );
}
