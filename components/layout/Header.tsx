"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Menu, X, BookOpen, Bot, BarChart2, Settings, Sword, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/strings";
import SearchModal from "@/components/search/SearchModal";

const navLinks = [
  { href: "/", labelKey: "nav.home", icon: BarChart2 },
  { href: "/flashcards", labelKey: "nav.flashcards", icon: BookOpen },
  { href: "/kanji", labelKey: "nav.kanji", icon: null },
  { href: "/simulator", labelKey: "nav.simulator", icon: Bot },
  { href: "/grammar", labelKey: "nav.grammar", icon: Sword },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { locale, setLocale, furiganaEnabled, toggleFurigana } = useAppStore();

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/30 group-hover:bg-cyan-400/20 transition-colors">
            <Cpu size={16} className="text-cyan-400" />
          </div>
          <span className="font-semibold text-slate-100 tracking-tight hidden sm:block">
            Keigo <span className="text-cyan-400">&</span> Code
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-zinc-800 text-slate-100" : "text-slate-400 hover:text-slate-200 hover:bg-zinc-800/50"
                }`}
              >
                {t(link.labelKey, locale)}
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            title={locale === 'fr' ? 'Rechercher (⌘K)' : 'Search (⌘K)'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-slate-400 border border-zinc-700 hover:text-slate-200 hover:border-zinc-600 transition-colors"
          >
            <Search size={14} />
            <span className="text-xs hidden lg:inline">{locale === 'fr' ? 'Rechercher' : 'Search'}</span>
            <kbd className="hidden lg:inline-block text-[10px] text-slate-600 border border-zinc-700 rounded px-1 ml-1">⌘K</kbd>
          </button>

          {/* Furigana toggle */}
          <button
            onClick={toggleFurigana}
            title={furiganaEnabled
              ? "ふりがな表示中 — クリックで非表示 (Furigana ON — click to hide)"
              : "ふりがな非表示 — クリックで表示 (Furigana OFF — click to show)"}
            aria-label={furiganaEnabled ? "Hide furigana" : "Show furigana"}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold border transition-colors ${
              furiganaEnabled
                ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                : "border-zinc-700 text-slate-500 hover:text-slate-300"
            }`}
          >
            ふり
          </button>

          {/* Locale toggle */}
          <button
            onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
            className="rounded-md px-2.5 py-1 text-xs font-semibold border border-zinc-700 text-slate-400 hover:text-slate-200 hover:border-zinc-600 transition-colors"
          >
            {locale === 'fr' ? 'EN' : 'FR'}
          </button>

          <Link href="/settings">
            <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-zinc-800 transition-colors">
              <Settings size={16} />
            </button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-zinc-800 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-zinc-800 text-slate-100" : "text-slate-400 hover:text-slate-200 hover:bg-zinc-800/50"
                }`}
              >
                {t(link.labelKey, locale)}
              </Link>
            );
          })}
          <div className="flex gap-2 pt-2 border-t border-zinc-800 mt-1">
            {/* Search — mobile */}
            <button
              onClick={() => { setSearchOpen(true); setMobileOpen(false); }}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold border border-zinc-700 text-slate-400"
            >
              <Search size={13} />
              {locale === 'fr' ? 'Chercher' : 'Search'}
            </button>
            <button
              onClick={toggleFurigana}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold border transition-colors ${
                furiganaEnabled
                  ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                  : "border-zinc-700 text-slate-500"
              }`}
            >
              ふり {furiganaEnabled ? '✓' : '—'}
            </button>
            <button
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className="rounded-md px-3 py-1.5 text-xs font-semibold border border-zinc-700 text-slate-400"
            >
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>
          </div>
        </div>
      )}
    </header>

    <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
