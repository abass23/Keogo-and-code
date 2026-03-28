'use client';
import { useState } from 'react';
import { Delete } from 'lucide-react';

/**
 * JapaneseKeyboard — virtual hiragana keyboard for grammar exercise inputs.
 *
 * Props:
 *   onChar(char)   — insert character at cursor (caller manages the ref)
 *   onDelete()     — delete character before cursor
 *   onSpace()      — insert a space (for sentence transform exercises)
 *   showSpace      — whether to show the space key (default false)
 */

interface JapaneseKeyboardProps {
  onChar: (char: string) => void;
  onDelete: () => void;
  onSpace?: () => void;
  showSpace?: boolean;
}

// ── Gojuuon layout ───────────────────────────────────────────
// Each sub-array is a column: [a, i, u, e, o] sound
const BASIC_COLS = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', null, 'ゆ', null, 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', null, null, null, 'を'],
];

const DAKUTEN_COLS = [
  ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
  ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
  ['だ', 'ぢ', 'づ', 'で', 'ど'],
  ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
  ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
];

const SMALL_CHARS = ['っ', 'ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ'];
const SYMBOLS = ['ん', 'ー', '。', '、', '！', '？'];

type Tab = 'basic' | 'dakuten' | 'small';

const TAB_LABELS: Record<Tab, string> = {
  basic: 'あ',
  dakuten: 'が',
  small: 'っ',
};

export default function JapaneseKeyboard({
  onChar,
  onDelete,
  onSpace,
  showSpace = false,
}: JapaneseKeyboardProps) {
  const [tab, setTab] = useState<Tab>('basic');

  const cols = tab === 'basic' ? BASIC_COLS : tab === 'dakuten' ? DAKUTEN_COLS : null;

  function Key({ char, wide }: { char: string | null; wide?: boolean }) {
    if (!char) {
      return <div className={`${wide ? 'w-10' : 'w-9'} h-9`} />;
    }
    return (
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); onChar(char); }}
        className={`${wide ? 'w-10' : 'w-9'} h-9 rounded-lg bg-slate-700 hover:bg-slate-600 active:bg-cyan-700 text-slate-100 font-jp text-sm flex items-center justify-center select-none transition-colors touch-none`}
      >
        {char}
      </button>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 space-y-2 select-none">
      {/* Tab selector */}
      <div className="flex items-center gap-1">
        {(['basic', 'dakuten', 'small'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onPointerDown={(e) => { e.preventDefault(); setTab(t); }}
            className={`flex-1 py-1 rounded-lg text-sm font-jp transition-colors ${
              tab === t
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
        {/* Delete key — always visible in tab bar */}
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); onDelete(); }}
          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 transition-colors"
          aria-label="Delete"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      {cols && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {cols.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map((char, ri) => (
                <Key key={ri} char={char} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Small characters tab */}
      {tab === 'small' && (
        <div className="flex flex-wrap gap-1">
          {SMALL_CHARS.map((char) => (
            <Key key={char} char={char} />
          ))}
        </div>
      )}

      {/* Symbols row — always shown */}
      <div className="flex gap-1 flex-wrap border-t border-slate-800 pt-2">
        {SYMBOLS.map((char) => (
          <Key key={char} char={char} />
        ))}
        {showSpace && onSpace && (
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); onSpace(); }}
            className="flex-1 min-w-[80px] h-9 rounded-lg bg-slate-700 hover:bg-slate-600 active:bg-cyan-700 text-slate-400 text-xs transition-colors touch-none"
          >
            スペース
          </button>
        )}
      </div>
    </div>
  );
}
