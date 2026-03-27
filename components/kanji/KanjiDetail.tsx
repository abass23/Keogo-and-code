"use client";

import type { KanjiEntry, VocabCard } from "@/lib/types";
import { Volume2 } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import FuriganaText from "@/components/flashcard/FuriganaText";

interface KanjiDetailProps {
  kanji: KanjiEntry;
  relatedVocab?: VocabCard[];
}

export default function KanjiDetail({ kanji, relatedVocab = [] }: KanjiDetailProps) {
  const locale = useAppStore((s) => s.locale);

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    utter.rate = 0.8;
    window.speechSynthesis.speak(utter);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Hero */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-4">
        <button
          onClick={() => speak(kanji.character)}
          className="group relative"
          title="Listen to pronunciation"
        >
          <span className="font-jp text-8xl text-slate-100 group-hover:text-cyan-300 transition-colors">
            {kanji.character}
          </span>
          <Volume2 size={16} className="absolute -bottom-1 -right-2 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </button>

        <p className="text-xl font-semibold text-slate-200 text-center">
          {locale === "fr" ? kanji.meaning_fr : kanji.meaning_en}
        </p>

        <div className="flex gap-2 flex-wrap justify-center">
          <span className="text-xs font-mono px-2 py-1 rounded border border-cyan-400/30 text-cyan-400 bg-cyan-400/5">
            {kanji.jlpt_level}
          </span>
          <span className="text-xs text-slate-500 px-2 py-1 rounded border border-zinc-700">
            {kanji.stroke_count} strokes
          </span>
          {kanji.radicals.map((r) => (
            <span key={r} className="text-xs font-jp px-2 py-1 rounded border border-zinc-700 text-slate-400">
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Readings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-4">
          {locale === "fr" ? "Lectures" : "Readings"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {kanji.onyomi.length > 0 && (
            <div>
              <p className="text-xs text-slate-600 mb-1">音読み On&apos;yomi</p>
              <div className="flex flex-wrap gap-2">
                {kanji.onyomi.map((r) => (
                  <button
                    key={r}
                    onClick={() => speak(r)}
                    className="font-jp text-lg text-cyan-300 hover:text-cyan-200 bg-cyan-400/5 border border-cyan-400/20 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
          {kanji.kunyomi.filter(Boolean).length > 0 && (
            <div>
              <p className="text-xs text-slate-600 mb-1">訓読み Kun&apos;yomi</p>
              <div className="flex flex-wrap gap-2">
                {kanji.kunyomi.filter(Boolean).map((r) => (
                  <button
                    key={r}
                    onClick={() => speak(r.replace(".", ""))}
                    className="font-jp text-lg text-amber-300 hover:text-amber-200 bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mnemonic */}
      {kanji.mnemonic && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-2">
            {locale === "fr" ? "Mnémotechnique" : "Mnemonic"}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">💡 {kanji.mnemonic}</p>
        </div>
      )}

      {/* Related vocabulary */}
      {relatedVocab.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-4">
            {locale === "fr" ? "Vocabulaire avec ce kanji" : "Vocabulary with this kanji"}
          </h2>
          <div className="space-y-3">
            {relatedVocab.map((v) => (
              <div key={v.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => speak(v.hiragana)}>
                    <span className="font-jp text-lg text-slate-100 hover:text-cyan-300 transition-colors">
                      <FuriganaText kanji={v.kanji} hiragana={v.hiragana} />
                    </span>
                  </button>
                  <span className="text-sm text-slate-400">
                    {locale === "fr" ? v.meaning_fr : v.meaning_en}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-600">{v.jlpt_level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
