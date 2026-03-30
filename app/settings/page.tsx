'use client';

import Header from "@/components/layout/Header";
import BadgeGrid from "@/components/gamification/BadgeGrid";
import StudyHeatmap from "@/components/gamification/StudyHeatmap";
import XPBar from "@/components/gamification/XPBar";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/strings";

export default function SettingsPage() {
  const { locale, setLocale, furiganaEnabled, toggleFurigana } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 space-y-8">

        <h1 className="text-2xl font-bold text-slate-100">{t('nav.settings', locale)}</h1>

        {/* XP bar */}
        <XPBar />

        {/* Preferences */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            {locale === 'fr' ? 'Préférences' : 'Preferences'}
          </h2>

          {/* Locale */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-200">{t('settings.language', locale)}</p>
              <p className="text-xs text-slate-500">French / English</p>
            </div>
            <button
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className="px-4 py-1.5 rounded-lg border border-zinc-700 text-sm text-slate-300 hover:border-zinc-500 transition-colors"
            >
              {locale === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
            </button>
          </div>

          {/* Furigana */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-200">{t('settings.furigana', locale)}</p>
              <p className="text-xs text-slate-500">ふりがな / ruby text above kanji</p>
            </div>
            <button
              onClick={toggleFurigana}
              className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                furiganaEnabled
                  ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400'
                  : 'border-zinc-700 text-slate-500'
              }`}
            >
              {furiganaEnabled ? (locale === 'fr' ? 'Activé' : 'On') : (locale === 'fr' ? 'Désactivé' : 'Off')}
            </button>
          </div>
        </section>

        {/* Badges */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <BadgeGrid />
        </section>

        {/* Study heatmap */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <StudyHeatmap />
        </section>

      </main>
    </div>
  );
}
