# Keogo & Code — Phase 6: Hotfix & Polish Sprint

> **Copy this file into your repo root as `.claude/commands/hotfix-sprint.md`**
> Then run: `/hotfix-sprint` in Claude Code

---

## Claude Code Session Config

```yaml
# Start session with:
claude --model sonnet --effort high

# For SRS engine / grammar logic fixes:
claude --model sonnet --effort max

# For architecture decisions or big refactors:
# Switch to plan mode (Shift+Tab ×2) then:
claude --model opus
```

---

## Mission

Fix all broken pages, add missing UX, and ship a fully usable v1 of Keogo & Code.
The user must be able to open the app on their phone, start learning, and never see "Loading..." forever.

**Deadline context**: User needs to use this app daily starting NOW (April 2026) for JLPT prep.
Every day the app is broken is a day of lost study.

---

## Step 0 — Read Context First

Before writing ANY code:
1. Read `CLAUDE.md` at project root
2. Read `data/` directory to understand current JSON seed structure
3. Read `lib/` directory to understand SRS engine and stores
4. Read `app/` directory to understand page routing

Do NOT start coding until you have a mental map of the codebase.

---

## Step 1 — CRITICAL FIXES (use effort: max)

### 1.1 Flashcards Page Infinite Loading

**Problem**: `/flashcards` and `/flashcards?domain=embedded` show "Loading..." forever.
The page tries to fetch from Supabase, which isn't configured in production.

**Fix**:
- Add a fallback data loading chain: Supabase → IndexedDB → local JSON seeds
- In the flashcard store/hook, wrap the Supabase call in try/catch
- On failure, load from IndexedDB (offline cache)
- If IndexedDB is also empty, import directly from `data/*.json` seed files
- Show a subtle toast: "Mode hors-ligne — données locales" (not a blocking error)
- The flashcard UI MUST render within 2 seconds even without any backend

```typescript
// Pattern to implement in the data fetching hook:
async function loadCards(filters) {
  try {
    // 1. Try Supabase
    const { data, error } = await supabase.from('vocabulary').select('*').match(filters);
    if (data?.length) return data;
  } catch (e) { /* silent */ }

  try {
    // 2. Try IndexedDB
    const cached = await idb.getAll('vocabulary', filters);
    if (cached?.length) return cached;
  } catch (e) { /* silent */ }

  // 3. Fallback to JSON seeds
  const seeds = await import(`@/data/vocabulary-${filters.level || 'all'}.json`);
  return filterSeeds(seeds.default, filters);
}
```

**Test**: `npm run dev` → navigate to `/flashcards` → cards MUST appear without Supabase running.

### 1.2 Kanji Detail Pages 404

**Problem**: `/kanji/日` returns 404. URL-encoded Japanese characters break dynamic routing.

**Fix**:
- Check `app/kanji/[character]/page.tsx` exists and uses `decodeURIComponent(params.character)`
- If using static generation, add `generateStaticParams()` that returns all kanji from seed data
- If using SSR/client, ensure the dynamic segment handles encoded URIs
- Test with: `/kanji/%E6%97%A5` (日) and `/kanji/%E4%BA%BA` (人)

```typescript
// app/kanji/[character]/page.tsx
export default function KanjiDetailPage({ params }: { params: { character: string } }) {
  const character = decodeURIComponent(params.character);
  // ... load kanji data for this character
}

// If static:
export function generateStaticParams() {
  const allKanji = [...n5Kanji, ...n4Kanji];
  return allKanji.map(k => ({ character: k.character }));
}
```

### 1.3 Grammar Sessions Infinite Loading

**Problem**: `/grammar/session?mode=learn` and all grammar session URLs show "Loading session..." forever.

**Fix**: Same pattern as flashcards — fallback chain to local JSON grammar seeds.
Grammar exercises in `data/grammar-*.json` must be loadable without Supabase.

---

## Step 2 — ONBOARDING UX (use effort: high)

### 2.1 First-Visit Welcome Flow

**Problem**: New user arrives, sees all zeros, doesn't know where to start.

**Fix**: Detect first visit (streak === 0 AND total reviews === 0) and show an onboarding overlay:

```
┌─────────────────────────────────────────┐
│  ようこそ！Welcome to Keigo & Code      │
│                                          │
│  Let's start your journey to N3/N2.     │
│  We'll begin with 5 kanji you might     │
│  already know.                           │
│                                          │
│  [🎯 Start 5-Card Mini Session]         │
│                                          │
│  Your level: N5 → N4 (transitioning)    │
│  Daily goal: 20 cards (adjustable)       │
│  JLPT July 2026: 98 days away          │
└─────────────────────────────────────────┘
```

- Button launches a curated 5-card session (mix of N5 kanji the user likely knows)
- After completing it, show: "Great! You just reviewed your first cards. Come back tomorrow to keep your streak!"
- Set a flag in localStorage/IDB: `onboarding_completed: true`

### 2.2 Active Nav Indicator

**Problem**: No visual indicator of current page in the navigation bar.

**Fix**: Add active state styling to the nav component. Use `usePathname()` from Next.js:

```tsx
const pathname = usePathname();
const isActive = (path: string) => pathname.startsWith(path);
// Apply: className={isActive('/kanji') ? 'text-primary border-b-2 border-primary' : 'text-muted'}
```

### 2.3 Furigana Toggle Clarity

**Problem**: The "ふり" toggle button's purpose isn't clear.

**Fix**: Add a tooltip on hover/long-press: "Furigana ON/OFF — ふりがな表示切替"

---

## Step 3 — AUDIO INTEGRATION (use effort: high)

### 3.1 Quick Audio via SpeechSynthesis API

**Problem**: No audio anywhere in the app. Audio is a core feature for listening training.

**Fix** (fast, no API key needed):
- Create `lib/audio.ts` with a `speakJapanese(text: string)` function
- Use `window.speechSynthesis` with `lang: 'ja-JP'`
- Add a 🔊 button on every flashcard, kanji card, and vocabulary item
- On flashcard flip (showing answer), autoplay the Japanese reading
- Add volume/mute toggle in settings

```typescript
// lib/audio.ts
export function speakJapanese(text: string, rate = 0.9) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = rate; // slightly slower for learners
  // Try to find a Japanese voice
  const voices = speechSynthesis.getVoices();
  const jpVoice = voices.find(v => v.lang.startsWith('ja'));
  if (jpVoice) utterance.voice = jpVoice;
  speechSynthesis.speak(utterance);
}
```

- Later (Phase 7+), upgrade to Google Cloud TTS for native quality.
- For now, SpeechSynthesis is free, instant, and works offline.

---

## Step 4 — MISSING CONTENT (use effort: high)

### 4.1 Automotive Deck Tile

**Problem**: No "Automotive 自動車" deck visible on homepage despite having the data.

**Fix**: Add a deck card on the homepage between "Systèmes embarqués" and "Keigo professionnel":

```
## Automotive 自動車
ECU, 車載, 安全規格, 検証 — vocabulaire pour l'industrie automobile japonaise.
Tags: [ECU] [ISO 26262] [HIL] [検証]
[Tout réviser →] /flashcards?domain=automotive
```

### 4.2 N3 Grammar Seed

**Problem**: Grammar Dojo shows "N3 Coming soon" — this is the June-August study priority.

**Fix**:
- Create `data/grammar-n3.json` with at least the top 50 most common N3 grammar points
- Each point needs minimum 3 exercises (1 fill_blank, 1 mcq, 1 conjugation)
- Priority categories: causative (～させる), passive-causative, ～ようにする, ～ことにする, ～はずだ, ～わけだ, ～ために vs ～ように, ～てしまう, ～ばかり, ～ところ
- Include domain-specific sentences (embedded, business, automotive)

Use a subagent for this — see Agent Setup below.

---

## Step 5 — DASHBOARD ENHANCEMENTS (use effort: medium)

### 5.1 Study Heatmap

Add a GitHub-style contribution heatmap showing study days. 
Use the `study_sessions` data (or localStorage timestamps).
Libraries: `react-activity-calendar` or custom SVG grid.

### 5.2 Streak Persistence

Ensure the streak counter persists across sessions:
- On each completed review session, save `{ date: today, reviewed: true }` to IDB
- On app load, calculate current streak from consecutive dates
- Show streak freeze option (max 2 per month)

---

## Agent & Skill Setup

Create these files in the repo for future Claude Code sessions:

### `.claude/agents/grammar-seeder.md`
```markdown
---
name: grammar-seeder
description: Generates N3/N2 grammar point seed data with exercises
effort: max
skills:
  - japanese-grammar
maxTurns: 50
---
You are a Japanese grammar data generator for the Keogo & Code app.

Your task is to generate grammar point JSON seed files following the exact
schema in `data/grammar-n4.json` (read it first as your template).

For each grammar point, generate:
1. Pattern, meaning (EN + FR), JLPT level, category
2. Formation rules with examples
3. Common mistakes (wrong → correct + explanation)
4. 5-8 exercises mixing types: fill_blank, mcq, conjugation, context_match
5. At least 1 exercise per domain: embedded, business, daily

CRITICAL: All Japanese text must be natural and grammatically perfect.
Cross-reference with Bunpro and JLPT Sensei for accuracy.

Output format: valid JSON array, one file per JLPT level.
Write to: data/grammar-n3.json (or n2.json)
After writing, run validation: node scripts/validate-grammar-seed.js
```

### `.claude/agents/ui-fixer.md`
```markdown
---
name: ui-fixer
description: Fixes UI bugs and adds missing UX components
effort: high
allowedTools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
---
You are a Next.js/React UI specialist fixing bugs in Keogo & Code.

Rules:
- Mobile-first: always test at 375px width
- Use shadcn/ui components — never raw HTML
- Dark mode must work on every component you touch
- Tailwind only — no inline styles, no CSS modules
- After every change, verify no TypeScript errors: npx tsc --noEmit
- Test the page renders without Supabase connection
```

### `.claude/skills/japanese-grammar/SKILL.md`
```markdown
---
name: japanese-grammar
description: Japanese grammar rules, JLPT patterns, and exercise generation
---
# Japanese Grammar Knowledge

## JLPT Grammar Counts
- N5: ~75 points (は/が, て-form, ている, adjective conjugation, ～たい, ～ましょう)
- N4: ~130 points (conditionals, passive, potential, causative, keigo intro)
- N3: ~180 points (causative-passive, ～ようにする, ～はず, ～わけ, ～ばかり, formal expressions)
- N2: ~195 points (advanced keigo, written forms, complex conditionals, ～にすぎない, ～をもとに)

## Exercise Type Rules
- fill_blank: sentence with ＿＿＿ blank, user types hiragana/kanji answer
- mcq: 4 options, only 1 correct, ALL options explained after answer
- conjugation: given verb + target form → user types conjugated form
- sentence_builder: word tiles with 1-2 distractors, user orders them
- error_spotter: sentence with 1 grammar error, user taps + corrects
- context_match: 3 formality levels, user picks correct one for situation
- transform: rewrite sentence using target grammar pattern

## Domain Sentence Guidelines
- embedded: use RTOS, debugging, testing, protocol terminology
- business: use meeting, email, reporting, interview terminology
- automotive: use ECU, safety standards, validation terminology
- daily: use office, commute, lunch, team interaction scenarios

## Common Pitfalls in Grammar Seeds
- Don't mix up transitive/intransitive pairs (開ける/開く)
- Ensure て-form exercises cover all irregular verbs (行って, not 行いて)
- Keigo exercises must distinguish 尊敬語, 謙譲語, and 丁寧語
- Multiple valid answers MUST be listed (e.g., ～なきゃ = ～なければ)
```

### `.claude/skills/offline-fallback/SKILL.md`
```markdown
---
name: offline-fallback
description: Pattern for graceful offline/no-backend data loading in Keogo
---
# Offline Fallback Pattern

All data-loading hooks in Keogo MUST follow this cascade:

1. Supabase (primary, when configured and reachable)
2. IndexedDB (offline cache from last successful sync)
3. Local JSON seeds in /data/*.json (always available, bundled with app)

## Implementation Pattern
```typescript
async function loadWithFallback<T>(
  supabaseQuery: () => Promise<T[]>,
  idbStore: string,
  seedImport: () => Promise<{ default: T[] }>,
  filters?: Record<string, any>
): Promise<{ data: T[]; source: 'supabase' | 'idb' | 'seed' }> {
  // 1. Supabase
  try {
    const data = await supabaseQuery();
    if (data?.length) {
      // Cache to IDB for offline use
      await idb.putAll(idbStore, data);
      return { data, source: 'supabase' };
    }
  } catch {}

  // 2. IndexedDB
  try {
    const cached = await idb.getAll(idbStore);
    if (cached?.length) return { data: applyFilters(cached, filters), source: 'idb' };
  } catch {}

  // 3. JSON seeds
  const mod = await seedImport();
  return { data: applyFilters(mod.default, filters), source: 'seed' };
}
```

## Toast Messages by Source
- supabase: no toast (normal operation)
- idb: "📱 Mode hors-ligne" (subtle, bottom)
- seed: "📦 Données locales — connectez Supabase pour la synchronisation" (info, dismissable)

## CRITICAL RULES
- NEVER show "Loading..." for more than 3 seconds
- NEVER show a blank page or error screen — always fall back to seeds
- NEVER block the UI waiting for network — use optimistic rendering
```

### `.claude/commands/hotfix-sprint.md`
```markdown
---
description: Run the Phase 6 hotfix sprint — fix all broken pages and add missing UX
---

Read the full sprint plan at KEOGO_HOTFIX_PROMPT.md in the repo root.

Execute in this order:
1. Step 1 — Critical fixes (flashcards, kanji 404, grammar loading)
2. Step 2 — Onboarding UX (welcome flow, nav, furigana tooltip)
3. Step 3 — Audio (SpeechSynthesis integration)
4. Step 4 — Missing content (automotive deck, N3 grammar seed)
5. Step 5 — Dashboard (heatmap, streak persistence)

For grammar seeding, delegate to @grammar-seeder agent.
For UI fixes, delegate to @ui-fixer agent.

After each step, run:
- `npx tsc --noEmit` (no type errors)
- `npm run build` (production build succeeds)
- Manual check: open localhost:3000 WITHOUT Supabase env vars set

Commit after each step with message format:
fix(phase6.X): <description>
```

---

## Execution Checklist

```
[ ] Step 1.1 — Flashcards offline fallback
[ ] Step 1.2 — Kanji detail 404 fix
[ ] Step 1.3 — Grammar session offline fallback
[ ] Step 2.1 — Onboarding welcome flow
[ ] Step 2.2 — Active nav indicator
[ ] Step 2.3 — Furigana tooltip
[ ] Step 3.1 — Audio SpeechSynthesis integration
[ ] Step 4.1 — Automotive deck tile
[ ] Step 4.2 — N3 grammar seed (delegate to @grammar-seeder)
[ ] Step 5.1 — Study heatmap
[ ] Step 5.2 — Streak persistence

Final checks:
[ ] `npm run build` passes
[ ] App works at localhost:3000 without Supabase env vars
[ ] All pages load in < 3 seconds on mobile (375px)
[ ] Dark mode works on all new/modified components
[ ] No console errors in browser dev tools
[ ] Push to master → Vercel auto-deploys
```
