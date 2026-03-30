# Keogo & Code — Phase 6v2: Critical Fixes + Grammar Lessons

> **Usage**: Copy to repo root, then in Claude Code:
> `claude --effort max` → paste the content or run `/hotfix-v2`

---

## SITUATION

The app is deployed at keogo-and-code.vercel.app.
Three pages are COMPLETELY BROKEN — they show "Loading..." forever:
- `/flashcards` (all variants: with ?domain=, ?level= params)  
- `/grammar/session` (all variants: ?mode=learn, ?mode=cram, ?mode=review, ?point=)
- Kanji detail pages may also 404 (needs verification)

The root cause is the same everywhere: data fetching depends on Supabase 
which is NOT configured in production. There is NO fallback to local data.

Working pages: homepage dashboard, kanji listing, simulator mode selector.

Additionally, the Grammar Dojo only has exercises but NO lesson/explanation 
pages. The user wants to LEARN grammar rules before being quizzed.

---

## PRIORITY 1 — FIX DATA LOADING (effort: max)

This is the ONLY thing that matters right now. The app is unusable.

### Root Cause Analysis

Before writing any fix, run these commands to understand the current data flow:

```bash
# Find all Supabase calls
grep -rn "supabase" --include="*.ts" --include="*.tsx" lib/ hooks/ app/ components/

# Find all data fetching hooks
grep -rn "useEffect\|useSWR\|useQuery\|fetch(" --include="*.ts" --include="*.tsx" hooks/ lib/

# Find all JSON seed files
find data/ -name "*.json" | head -20

# Check if there's an IndexedDB/IDB implementation
grep -rn "indexedDB\|idb\|openDB\|createStore" --include="*.ts" --include="*.tsx" lib/
```

### The Fix Pattern

Create a universal data loader that EVERY page uses:

```typescript
// lib/data-loader.ts
// This file is the SINGLE source of truth for loading data.
// It tries Supabase first, falls back to local JSON seeds.

import type { VocabularyItem, GrammarPoint, GrammarExercise, KanjiItem } from '@/lib/types';

type DataSource = 'supabase' | 'cache' | 'seed';

interface LoadResult<T> {
  data: T[];
  source: DataSource;
}

// Vocabulary loader
export async function loadVocabulary(filters?: {
  level?: string;
  domain?: string;
  subdomain?: string;
}): Promise<LoadResult<VocabularyItem>> {
  // 1. Try Supabase (skip if env vars not set)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      let query = supabase.from('vocabulary').select('*');
      if (filters?.level) query = query.eq('jlpt_level', filters.level);
      if (filters?.domain) query = query.eq('domain', filters.domain);
      const { data, error } = await query;
      if (data?.length && !error) return { data, source: 'supabase' };
    } catch (e) { /* Supabase unavailable — silent fallback */ }
  }

  // 2. Load from local JSON seeds (ALWAYS available)
  const allSeeds = await import('@/data/vocabulary.json');
  let items = allSeeds.default as VocabularyItem[];
  if (filters?.level) items = items.filter(i => i.jlpt_level === filters.level);
  if (filters?.domain) items = items.filter(i => i.domain === filters.domain);
  if (filters?.subdomain) items = items.filter(i => i.subdomain === filters.subdomain);
  return { data: items, source: 'seed' };
}

// Grammar loader
export async function loadGrammarPoints(filters?: {
  level?: string;
  pointId?: string;
}): Promise<LoadResult<GrammarPoint>> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      let query = supabase.from('grammar_points').select('*');
      if (filters?.level) query = query.eq('jlpt_level', filters.level);
      if (filters?.pointId) query = query.eq('id', filters.pointId);
      const { data, error } = await query;
      if (data?.length && !error) return { data, source: 'supabase' };
    } catch (e) { /* silent */ }
  }

  // Merge all grammar seed files
  const n5 = (await import('@/data/grammar-n5.json')).default;
  const n4 = (await import('@/data/grammar-n4.json')).default;
  // Add n3.json when seeded
  let items = [...n5, ...n4] as GrammarPoint[];
  if (filters?.level) items = items.filter(i => i.jlpt_level === filters.level);
  if (filters?.pointId) items = items.filter(i => i.id === filters.pointId);
  return { data: items, source: 'seed' };
}

// Same pattern for kanji, exercises, etc.
```

### Apply to Every Broken Page

**Flashcards page** (`app/flashcards/page.tsx` or equivalent):
```typescript
// REPLACE whatever Supabase-dependent loading exists with:
const [cards, setCards] = useState<VocabularyItem[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadVocabulary({ level: searchParams.get('level'), domain: searchParams.get('domain') })
    .then(({ data, source }) => {
      setCards(data);
      if (source === 'seed') toast.info('Mode hors-ligne — données locales');
    })
    .finally(() => setLoading(false));
}, [searchParams]);

// ALSO: add a timeout — if still loading after 3 seconds, force seed fallback
```

**Grammar session page** (`app/grammar/session/page.tsx` or equivalent):
- Same pattern with `loadGrammarPoints()`
- Load exercises for the selected grammar point
- MUST render within 3 seconds

**Kanji detail page**: verify it works, fix if needed with same pattern.

### Verification

After implementing, test ALL of these URLs load correctly:
```
localhost:3000/flashcards                         → shows cards
localhost:3000/flashcards?domain=embedded          → shows embedded cards  
localhost:3000/flashcards?domain=business           → shows business cards
localhost:3000/flashcards?level=N5                  → shows N5 cards
localhost:3000/grammar/session?mode=learn            → shows exercise
localhost:3000/grammar/session?mode=cram&level=N4    → shows N4 exercises
localhost:3000/grammar/session?mode=cram&point=te_form → shows te-form exercises
localhost:3000/kanji/日                              → shows kanji detail (if page exists)
```

Test WITHOUT any .env.local file (no Supabase vars). 
Every page MUST work with seed data alone.

Run `npm run build` — it must pass with zero errors.

---

## PRIORITY 2 — GRAMMAR LESSONS (effort: high)

### The Problem

Right now the Grammar Dojo only has exercises (fill blank, MCQ, etc.).
But the user needs to LEARN the grammar rule BEFORE being quizzed.
Currently if you click "Learn New", you get thrown into exercises 
with no explanation of what the grammar point even means.

### The Solution: Lesson Page Before Exercises

Add a **Grammar Lesson view** that appears:
- When clicking "Learn New" → show lesson first, then exercises
- When clicking a specific grammar point (e.g., ～て形) → show lesson page
- After failing an exercise 3 times → offer "Review the lesson?"

### Lesson Page Structure

Create `app/grammar/lesson/[pointId]/page.tsx`:

```
┌─────────────────────────────────────────────────┐
│  ← Back to Grammar Dojo                  N4 🏷️ │
│                                                  │
│  ～なければならない                               │
│  must / have to — devoir / il faut               │
│                                                  │
│  🔊 (audio of the pattern)                      │
│                                                  │
│ ─── Formation ───────────────────────────────── │
│                                                  │
│  Verb (ない-form) → drop ない → なければならない   │
│                                                  │
│  食べる → 食べない → 食べ＋なければならない         │
│  行く  → 行かない → 行か＋なければならない         │
│  する  → しない   → し＋なければならない           │
│                                                  │
│  📝 Short forms:                                │
│  ～なきゃ (casual)                               │
│  ～ないといけない (alternative)                    │
│  ～ねばならない (formal/written)                   │
│                                                  │
│ ─── Examples ────────────────────────────────── │
│                                                  │
│  🔊 毎日、日本語を勉強しなければなりません。       │
│     ふりがな: まいにち、にほんごをべんきょう       │
│              しなければなりません。                │
│     EN: I must study Japanese every day.          │
│     FR: Je dois étudier le japonais chaque jour.  │
│                                                  │
│  🔊 リリース前にテストを実行しなければなりません。 │
│     EN: Tests must be run before release.         │
│     FR: Les tests doivent être exécutés avant     │
│         le release.                    [embedded] │
│                                                  │
│  🔊 面接の前に自己紹介を準備しなければなりません。 │
│     EN: You must prepare your self-introduction   │
│         before the interview.          [business] │
│                                                  │
│ ─── Common Mistakes ────────────────────────── │
│                                                  │
│  ✗ 食べるなければならない                         │
│    → Dictionary form ≠ ない-stem                  │
│  ✓ 食べなければならない                           │
│    → Use ない-stem: 食べない → 食べ               │
│                                                  │
│  ✗ 行きなければならない                           │
│    → ます-stem ≠ ない-stem for godan verbs        │
│  ✓ 行かなければならない                           │
│    → ない-stem of 行く is 行か                    │
│                                                  │
│ ─── Related Grammar ─────────────────────────── │
│                                                  │
│  [～べき] should/ought to (stronger moral duty)   │
│  [～ないといけない] must (casual alternative)      │
│  [～ざるを得ない] cannot help but (N2, formal)     │
│                                                  │
│ ─── Nuance Note ─────────────────────────────── │
│                                                  │
│  💡 ～なければならない sounds formal/textbook.     │
│  In daily speech, Japanese people usually say:    │
│  ～なきゃ (most casual)                           │
│  ～ないと (dropping いけない — very common)        │
│  In business/interviews, use the full form.       │
│                                                  │
│  ┌──────────────────────────────────────┐        │
│  │  🎯 Ready to practice?              │        │
│  │  [Start Exercises (6 questions)]     │        │
│  └──────────────────────────────────────┘        │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Data Structure for Lessons

Add these fields to the grammar point JSON if not already present:

```typescript
interface GrammarLesson {
  // Already in GrammarPoint:
  pattern: string;
  meaning_en: string;
  meaning_fr: string;
  formation: FormationRule[];
  example_sentences: GrammarSentence[];
  common_mistakes: CommonMistake[];
  related_points: string[];
  
  // NEW fields for lesson content:
  lesson: {
    summary_en: string;        // 1-2 sentence TL;DR
    summary_fr: string;
    formation_visual: string;  // formatted conjugation chart (markdown)
    short_forms: {             // casual/alternative forms
      form: string;
      register: 'casual' | 'polite' | 'formal' | 'written';
      note_en: string;
      note_fr: string;
    }[];
    nuance_en: string;         // usage subtleties, when to use vs alternatives
    nuance_fr: string;
    cultural_note?: string;    // optional: how it's really used vs textbook
    domain_examples: {         // examples with domain tags
      sentence: string;
      reading: string;
      meaning_en: string;
      meaning_fr: string;
      domain: 'embedded' | 'business' | 'automotive' | 'daily';
      audio_url?: string;
    }[];
  };
}
```

### Update the Grammar Dojo Flow

```
Current flow (BROKEN):
  Grammar Dojo → Click "Learn New" → Loading... (stuck)

New flow:
  Grammar Dojo → Click "Learn New" → Lesson Page (read & understand)
                                        ↓
                                    [Start Exercises] → Exercise Session
                                        ↓
                                    Results + Explanation Card
                                        ↓
                                    Back to Grammar Dojo (point added to SRS)

  Grammar Dojo → Click specific point (e.g., ～て形) 
                   → Lesson Page for that point
                   → [Practice] → Exercises for that point

  During exercise → Wrong 3 times → [📖 Review Lesson?] → Lesson Page
```

### Grammar Dojo Page Updates

On the Grammar Dojo main page (`/grammar`), each grammar point card should show TWO buttons:

```
[～なければならない]
  must / have to
  📖 Lesson    ⚡ Practice
```

- **📖 Lesson** → `/grammar/lesson/nakereba_naranai` (new lesson page)
- **⚡ Practice** → `/grammar/session?mode=cram&point=nakereba_naranai` (existing exercises)

### Lesson Data Seed

Add lesson content to existing grammar seed JSONs. Start with the points 
already seeded (N5 + N4). Each point needs:
- `lesson.summary` (2 sentences max)
- `lesson.formation_visual` (conjugation chart)
- `lesson.short_forms` (at least 1 alternative)
- `lesson.nuance` (when/how real Japanese people use it)
- `lesson.domain_examples` (min 2: one embedded/automotive, one business)

Delegate this to the @grammar-seeder agent with instruction:
"Add lesson content to all existing grammar points in grammar-n5.json and grammar-n4.json"

---

## PRIORITY 3 — QUICK WINS (effort: medium)

### 3.1 Audio on All Japanese Text

Add `speakJapanese()` using Web Speech API to:
- Every flashcard (on flip)
- Every kanji card (on click)
- Every grammar example sentence (🔊 button)
- Lesson page pattern pronunciation

### 3.2 Active Nav Indicator

Highlight current page in navigation:
```tsx
const pathname = usePathname();
// Add active class: border-b-2 border-primary text-primary font-semibold
```

### 3.3 Onboarding First Visit

If streak === 0 AND no review history, show welcome overlay with 
"Start 5-Card Session" button.

### 3.4 Automotive Deck on Homepage

Add a deck card for automotive vocabulary between embedded and business.

### 3.5 JLPT Countdown Fix

The countdown shows "98 jours" — verify this updates dynamically 
based on actual date difference to July 5, 2026.

---

## AGENT & SKILL FILES TO CREATE

### `.claude/agents/grammar-seeder.md`

```yaml
---
name: grammar-seeder
description: Generates and enriches grammar lesson + exercise seed data
effort: max
skills:
  - japanese-grammar
maxTurns: 50
---
```

You generate Japanese grammar seed data for Keogo & Code.

Read `data/grammar-n5.json` and `data/grammar-n4.json` as templates.

Your tasks:
1. ADD lesson content to all existing grammar points (lesson field with 
   summary, formation_visual, short_forms, nuance, domain_examples)
2. GENERATE N3 grammar seed file (`data/grammar-n3.json`) with ~50 
   priority points, each with full lesson + 5-8 exercises
3. Validate: every Japanese sentence must be grammatically perfect
4. Every point must have at least 1 embedded and 1 business domain example

Output: valid JSON, write directly to data/ directory.
Run `node -e "JSON.parse(require('fs').readFileSync('data/grammar-n3.json'))"` to validate.

### `.claude/skills/japanese-grammar/SKILL.md`

```yaml
---
name: japanese-grammar  
description: JLPT grammar knowledge for exercise and lesson generation
---
```

(Content same as previous version — grammar counts, exercise type rules, 
domain guidelines, common pitfalls)

### `.claude/commands/hotfix-v2.md`

```yaml
---
description: Fix broken pages + add grammar lessons — Phase 6v2
---
```

Execute in strict order:

1. **Read the codebase first** — `grep` for Supabase calls, find data hooks
2. **Create `lib/data-loader.ts`** — universal fallback data loader  
3. **Fix `/flashcards` page** — use data-loader, test without Supabase
4. **Fix `/grammar/session` page** — use data-loader, test all modes
5. **Fix kanji detail page** — if 404, fix dynamic route
6. **Create `/grammar/lesson/[pointId]` page** — lesson view with full layout
7. **Update Grammar Dojo page** — add Lesson/Practice buttons per point
8. **Update "Learn New" flow** — lesson first, then exercises
9. **Add lesson data to grammar seeds** — delegate to @grammar-seeder
10. **Add audio** — `lib/audio.ts` with SpeechSynthesis
11. **Add nav active indicator**
12. **Add onboarding overlay**

After each step: `npx tsc --noEmit && npm run build`

Test without .env.local → every page must load from seed data.

Commit format: `fix(p6v2.N): description`

---

## VERIFICATION CHECKLIST

```
CRITICAL (app is broken without these):
[ ] /flashcards loads cards from seed data (no Supabase)
[ ] /flashcards?domain=embedded shows embedded cards
[ ] /flashcards?domain=business shows business cards
[ ] /flashcards?level=N5 shows N5 cards
[ ] /grammar/session?mode=learn shows exercise (no infinite loading)
[ ] /grammar/session?mode=cram&level=N4 shows N4 exercises
[ ] /grammar/session?mode=cram&point=te_form shows te-form exercises
[ ] npm run build passes with NO .env.local file

GRAMMAR LESSONS (new feature):
[ ] /grammar page shows 📖 Lesson + ⚡ Practice buttons per point
[ ] /grammar/lesson/te_form shows full lesson page
[ ] /grammar/lesson/nakereba_naranai shows lesson with domain examples
[ ] Lesson page has audio buttons (SpeechSynthesis)
[ ] Lesson page has "Start Exercises" CTA at bottom
[ ] "Learn New" flow goes Lesson → Exercises (not directly to exercises)
[ ] After 3 wrong answers in exercise, "Review Lesson?" link appears

POLISH:
[ ] 🔊 Audio works on flashcards, kanji, grammar examples
[ ] Nav highlights current page
[ ] First visit shows onboarding overlay
[ ] JLPT countdown is accurate (days until July 5, 2026)
[ ] Dark mode works on lesson page
[ ] Lesson page is readable on mobile (375px)
```
