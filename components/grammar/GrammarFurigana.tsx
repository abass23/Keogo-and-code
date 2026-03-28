'use client';

/**
 * GrammarFurigana — always renders furigana (ignores the global toggle).
 *
 * Accepts sentences with inline {kanji|reading} notation:
 *   "明日{迄|まで}に{提出|ていしゅつ}する"
 *   → <ruby>迄<rt>まで</rt></ruby>に<ruby>提出<rt>ていしゅつ</rt></ruby>する
 *
 * Plain text segments are rendered as-is.
 * ＿＿ blank placeholders are preserved without modification.
 */

interface GrammarFuriganaProps {
  text: string;
  className?: string;
}

type Segment =
  | { type: 'text'; content: string }
  | { type: 'ruby'; kanji: string; reading: string };

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const re = /\{([^|{}]+)\|([^|{}]+)\}/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: 'text', content: text.slice(last, match.index) });
    }
    segments.push({ type: 'ruby', kanji: match[1], reading: match[2] });
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    segments.push({ type: 'text', content: text.slice(last) });
  }

  return segments;
}

export default function GrammarFurigana({ text, className = '' }: GrammarFuriganaProps) {
  const segments = parseSegments(text);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === 'text' ? (
          <span key={i}>{seg.content}</span>
        ) : (
          <ruby key={i}>
            {seg.kanji}
            <rt className="text-[0.5em] text-slate-400 font-normal tracking-wider not-italic">
              {seg.reading}
            </rt>
          </ruby>
        ),
      )}
    </span>
  );
}
