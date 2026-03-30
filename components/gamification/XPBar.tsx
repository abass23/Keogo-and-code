"use client";

import { Zap } from "lucide-react";
import { useGamificationStore, xpToLevel, xpInCurrentLevel, getLevelTitle } from "@/stores/gamification-store";

const XP_PER_LEVEL = 500;

export default function XPBar() {
  const { totalXP } = useGamificationStore();
  const level = xpToLevel(totalXP);
  const xpInLevel = xpInCurrentLevel(totalXP);
  const pct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);
  const title = getLevelTitle(level);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl">
      <div className="flex items-center gap-1.5 shrink-0">
        <Zap size={14} className="text-yellow-400" />
        <span className="text-xs font-bold text-yellow-400">Lv {level}</span>
      </div>
      <div className="flex-1">
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-cyan-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-[10px] text-slate-500 shrink-0">{xpInLevel}/{XP_PER_LEVEL}</span>
      <span className="text-[10px] text-slate-400 shrink-0 hidden sm:block">{title}</span>
    </div>
  );
}
