# Keogo & Code — Japanese Learning App for Embedded Engineers

## CLAUDE.md (Project Root Instructions)

```markdown
# Keogo & Code

Japanese learning app tailored for embedded software engineers relocating to Japan.
Target: Take user from JLPT N5/N4 → functional N3/N2 by December 2026.

## Tech Stack
- Next.js 14+ (App Router) with TypeScript strict mode
- Tailwind CSS + shadcn/ui components
- Capacitor for native iOS/Android builds (PWA fallback)
- Supabase (auth, PostgreSQL, Edge Functions, Realtime)
- Web Speech API + Google Cloud TTS (audio)
- Anthropic API (Claude Sonnet 4) for AI conversation simulator
- Zustand for client state, React Query for server state

## AI Model Configuration (In-App)
- Model: `claude-sonnet-4-20250514` (best quality/speed/cost ratio for interactive chat)
- max_tokens: 1000 (tutor responses must stay concise)
- temperature: 0.7 (natural variety without sacrificing grammar accuracy)
- DO NOT use Opus in-app — too slow for mobile conversation UX
- DO NOT use Haiku — too weak for nuanced keigo corrections
- All API calls go through Supabase Edge Functions (never expose key client-side)

## Claude Code Development Settings
- Default model: Sonnet (standard implementation work)
- Use Opus for: architecture planning, spec reviews, complex refactors
- Effort levels:
  - `max` — SRS engine (/lib/srs.ts), database migrations, test suites
  - `high` — UI components, API routes, seed data pipelines
  - `medium` — config files, documentation, minor fixes

## Architecture
- /app — Next.js App Router pages
- /components — Reusable UI (shadcn-based)
- /lib — Core logic: SRS engine, audio, AI client
- /data — Static vocabulary/kanji/grammar JSON seeds
- /hooks — Custom React hooks
- /capacitor — Native mobile config
- /supabase — Migrations, edge functions, seed data

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run test` — vitest unit tests
- `npm run test:e2e` — playwright e2e
- `npm run db:migrate` — run Supabase migrations
- `npm run db:seed` — seed vocabulary data
- `npx cap sync` — sync Capacitor native projects

## Code Conventions
- Use ES modules, destructured imports
- Prefer functional components with hooks
- All Japanese text stored as: { kanji, hiragana, romaji, meaning_en, meaning_fr, audio_url }
- SRS intervals follow SM-2 algorithm
- Every API route must validate auth via Supabase JWT
- Mobile-first responsive design (min-width: 320px)
- All user-facing strings support FR/EN toggle

## Important Rules
- NEVER store API keys in client code — use Edge Functions
- NEVER hardcode vocabulary — always load from DB/JSON seeds
- All audio must have lazy loading + preload on card flip
- SRS state persists to Supabase, with offline IndexedDB sync
- Kanji MUST always show furigana toggle option
- Test coverage > 80% on /lib/*
```

---

## 1. USER PROFILE & LEARNING CONTEXT

### Who Is the Learner
- **Name**: Abassy Barry
- **Profession**: Senior Embedded Software Engineer (8+ years, C/C++, RTOS, AUTOSAR, CAN, Qt)
- **Current role**: Freelance at Essilor-Luxottica (C/C++, Qt, RT Linux)
- **Target**: Relocate to Japan for embedded/automotive role (Woven by Toyota pipeline active)
- **Japanese level**: JLPT N5 certified, approaching N4. Reads hiragana/katakana fluently, ~100 kanji
- **Study history**: 600+ day Duolingo streak, 3 years of casual study since March 2023
- **Partner**: Half-Japanese (immersion support at home)
- **Timeline**: Must be interview-ready in Japanese by December 2026 (9 months)
- **Goal JLPT level**: Functional N3 with N2 vocabulary in embedded/automotive domain

### What "Interview-Ready" Means
1. Deliver a 2-minute 自己紹介 (jikoshoukai) in keigo describing embedded career
2. Explain technical concepts (RTOS, CAN bus, debugging) in simple Japanese
3. Understand and respond to common interview questions in Japanese
4. Read job descriptions and technical specs with kanji at N3+ level
5. Follow team meetings at ~70% comprehension (daily standup level)

---

## 2. STUDY METHODOLOGY (Outside the App)

### Phase 1: Foundation Lock-In (April–May 2026) — N4 Consolidation
**Daily routine: 90 minutes minimum**

| Time | Activity | Tool |
|------|----------|------|
| 15 min | Keogo App — SRS flashcard review (vocab + kanji) | App |
| 15 min | Bunpro — N4 grammar SRS drills | bunpro.jp |
| 20 min | Genki II textbook — 1 lesson section per day | Physical book |
| 15 min | Keogo App — Listening drills (embedded vocab with audio) | App |
| 15 min | Shadowing practice — NHK World Easy News | nhk.or.jp/lesson |
| 10 min | Keogo App — AI conversation practice (jikoshoukai mode) | App |

**Weekly additions:**
- Saturday: 1 hour — Write jikoshoukai draft, practice with partner
- Sunday: 1 hour — Watch Japanese tech YouTube (ゆっくり解説 channels) with JP subtitles

**Milestones:**
- [ ] Complete Genki II
- [ ] 300 kanji recognized (N4 complete set)
- [ ] All N4 grammar points reviewed in Bunpro
- [ ] 30-second jikoshoukai memorized

### Phase 2: N3 Push (June–August 2026)
**Daily routine: 2 hours**

| Time | Activity | Tool |
|------|----------|------|
| 20 min | Keogo App — SRS review (N3 vocab + embedded terms) | App |
| 15 min | Bunpro — N3 grammar (3 new points/day) | bunpro.jp |
| 20 min | Shin Kanzen Master N3 読解 (reading) | Physical book |
| 20 min | Keogo App — Kanji reading trainer (context sentences) | App |
| 15 min | Todaii app — Read NHK Easy articles | todaii.co |
| 15 min | Keogo App — AI interview simulator (full questions) | App |
| 15 min | Listening — Japanese podcasts at N3 level | Nihongo con Teppei |

**Weekly additions:**
- Wednesday: 30 min iTalki lesson with Japanese tutor (interview prep focus)
- Saturday: Practice 2-minute jikoshoukai with technical vocabulary
- Sunday: Mock JLPT N3 practice test section

**Milestones:**
- [ ] 600+ kanji (N3 set)
- [ ] 3000+ vocabulary words
- [ ] Full 2-minute jikoshoukai in keigo
- [ ] Can read simple job postings on Indeed Japan

### Phase 3: N2 Vocabulary Sprint + Interview Prep (September–December 2026)
**Daily routine: 2.5 hours**

| Time | Activity | Tool |
|------|----------|------|
| 20 min | Keogo App — SRS review (N2 priority vocab) | App |
| 15 min | Bunpro — N2 grammar | bunpro.jp |
| 20 min | Shin Kanzen Master N2 語彙 | Physical book |
| 20 min | Keogo App — Technical reading trainer (spec documents) | App |
| 20 min | Keogo App — Full interview simulation (AI) | App |
| 15 min | Business Japanese — email/Slack patterns | App |
| 20 min | Listening — Japanese tech talks, meeting recordings | YouTube |

**Weekly additions:**
- Tuesday + Thursday: iTalki lessons (mock interviews)
- Saturday: Full JLPT N2 practice test
- Sunday: Review weak kanji + write technical Japanese blog post

**Milestones:**
- [ ] 1000+ kanji (N2 reading level)
- [ ] 6000+ vocabulary words
- [ ] 5-minute technical self-presentation in Japanese
- [ ] Can explain RTOS, CAN bus, debugging workflow in Japanese
- [ ] JLPT N3 passed (July session) or N2 attempted (December session)

### Key Resources Outside the App
1. **Textbooks**: Genki II → Shin Kanzen Master N3/N2 series (Grammar, Vocab, Reading, Listening, Kanji)
2. **Grammar SRS**: Bunpro.jp (essential complement — grammar is its weakness area in most apps)
3. **Tutoring**: iTalki (weekly sessions focused on interview roleplay)
4. **Immersion**: NHK World Easy News, Todaii app, Japanese tech YouTube
5. **Podcasts**: Nihongo con Teppei (beginner → intermediate), ビジネス日本語 channels
6. **Partner practice**: Daily 10-minute conversation with partner in Japanese

---

## 3. APP SPECIFICATION — KEOGO & CODE

### 3.1 Core Features

#### Feature 1: SRS Flashcard Engine (SM-2 Algorithm)
**Description**: Spaced repetition flashcards with embedded systems vocabulary as a priority domain.

**Card Types**:
- **Vocabulary Card**: kanji → reading + meaning (with audio autoplay)
- **Reverse Card**: meaning → type kanji/hiragana
- **Listening Card**: audio only → select correct meaning
- **Context Card**: sentence with blank → fill correct word
- **Kanji Recognition Card**: kanji → stroke order animation + readings

**Decks (structured by JLPT level + domain)**:
```
N5 Core (800 words) — already partially known
N4 Core (700 words)
N3 Core (1500 words)
N2 Priority (2000 most common)
Embedded Systems (500 words) — CUSTOM DOMAIN
  ├── RTOS & OS concepts (タスク, 割り込み, セマフォ, デッドロック...)
  ├── Protocols (通信プロトコル, シリアル通信, バス...)
  ├── Hardware (マイコン, 基板, 回路, センサー...)
  ├── Development (デバッグ, コンパイル, テスト, 不具合...)
  └── Agile/Scrum (スプリント, バックログ, レビュー...)
Automotive (300 words)
  ├── Vehicle systems (ECU, 車載, 安全性...)
  ├── Standards (規格, 認証, 適合性...)
  └── Testing (検証, バリデーション, HIL...)
Business Keigo (200 phrases)
  ├── Interview patterns (志望動機, 自己紹介, 長所/短所...)
  ├── Email/Slack patterns (お疲れ様です, ご確認ください...)
  └── Meeting phrases (報告します, 検討します...)
```

**SRS Engine Implementation**:
```typescript
interface SRSCard {
  id: string;
  front: CardContent;
  back: CardContent;
  deck: string;
  jlptLevel: 'N5' | 'N4' | 'N3' | 'N2';
  domain: 'core' | 'embedded' | 'automotive' | 'business';
  srs: {
    interval: number;      // days until next review
    repetitions: number;   // consecutive correct answers
    easeFactor: number;    // SM-2 ease factor (min 1.3)
    nextReview: Date;
    lastReview: Date | null;
  };
  audio_url: string | null;
  example_sentences: JapaneseSentence[];
}

interface CardContent {
  kanji?: string;
  hiragana: string;
  romaji: string;
  meaning_en: string;
  meaning_fr: string;
}

// SM-2 Algorithm
function updateSRS(card: SRSCard, quality: 0 | 1 | 2 | 3 | 4 | 5): SRSCard {
  // quality: 0=complete fail, 3=correct with difficulty, 5=perfect
  let { interval, repetitions, easeFactor } = card.srs;
  
  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }
  
  easeFactor = Math.max(1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  return {
    ...card,
    srs: {
      interval,
      repetitions,
      easeFactor,
      nextReview: addDays(new Date(), interval),
      lastReview: new Date(),
    }
  };
}
```

#### Feature 2: Kanji Learning System
**Description**: Progressive kanji learning with radical decomposition, stroke order, and contextual reading.

**Components**:
- **Radical Breakdown**: Show kanji as composition of radicals with mnemonics
- **Stroke Order Animation**: SVG animated stroke order (use KanjiVG data)
- **Reading Modes**: On'yomi (音読み) and Kun'yomi (訓読み) with audio
- **Context Sentences**: 3 example sentences per kanji, graded by JLPT level
- **Kanji → Word Map**: Show all vocabulary words using this kanji
- **Handwriting Practice**: Canvas-based input with stroke recognition
- **Daily Kanji Challenge**: 5 new kanji/day with spaced review

**Data Source**: KanjiVG (open source SVG stroke data) + custom embedded vocabulary mapping

#### Feature 3: AI Conversation Simulator
**Description**: Claude-powered conversation practice with specific scenarios.

**Modes**:
1. **自己紹介 Practice** (Jikoshoukai)
   - AI guides user through building their self-introduction step by step
   - Template: greeting → name → origin → education → career summary → why Japan → yoroshiku
   - Feedback on keigo correctness, naturalness, and completeness
   - Record audio → transcribe → compare with model answer

2. **Interview Simulator**
   - Common Japanese interview questions with real-time AI feedback
   - Questions pulled from structured bank:
     - 自己紹介をお願いします (self-introduction)
     - 志望動機を教えてください (motivation for applying)
     - あなたの長所・短所は？ (strengths/weaknesses)
     - これまでの経験を教えてください (work experience)
     - 将来どんな仕事をしたいですか？ (future goals)
   - AI evaluates: grammar, keigo usage, content relevance, naturalness
   - Difficulty scales: N4 polite → N3 business → N2 advanced keigo

3. **Daily Conversation**
   - Scenario-based: at the office, team standup, lunch with colleagues, meeting
   - AI acts as Japanese colleague, responds naturally
   - Vocab hints shown when user is stuck
   - Conversation saved for review

4. **Technical Discussion**
   - Explain your current project in Japanese
   - Discuss a bug you found and how you fixed it
   - Describe an RTOS architecture
   - AI responds with follow-up technical questions

**Implementation**:
```typescript
// API call config — Supabase Edge Function wrapper
const AI_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1000,
  temperature: 0.7,
  // Streaming enabled for real-time chat feel on mobile
  stream: true,
} as const;

const systemPrompt = `You are a Japanese language tutor for an embedded software engineer
preparing for job interviews in Japan. The user's level is {userLevel}.

RULES:
- Respond in Japanese appropriate to {userLevel} level
- After each user response, provide:
  1. Corrected version (if needed) with explanation
  2. Natural follow-up question to continue conversation
  3. New vocabulary words used (with reading and meaning)
- Use keigo appropriate for business/interview context
- If user is stuck, provide a hint in romaji
- Track and report grammar patterns the user struggles with

CONTEXT: The user is a French embedded software engineer with 8+ years of experience
in C/C++, RTOS, AUTOSAR, CAN protocols. They want to work at automotive/tech
companies in Japan.`;
```

#### Feature 4: Audio & Listening Training
**Description**: Native-quality audio for all content with listening-specific exercises.

**Audio Sources**:
- Google Cloud TTS (ja-JP voices: ja-JP-Neural2-B male, ja-JP-Neural2-C female)
- Pre-generated for all vocabulary cards (stored in Supabase Storage)
- Real-time generation for AI conversation responses

**Listening Exercises**:
- **Word Recognition**: Hear word → select from 4 options
- **Sentence Dictation**: Hear sentence → type in hiragana/kanji
- **Speed Training**: Same content at 0.75x → 1.0x → 1.25x speed
- **Minimal Pairs**: Distinguish similar-sounding words (e.g., びょういん vs びよういん)
- **Meeting Comprehension**: Listen to simulated standup → answer questions

#### Feature 5: Progress Dashboard
**Description**: Comprehensive learning analytics.

**Metrics**:
- Daily streak counter (continue from Duolingo motivation model)
- Cards reviewed today / due today / new today
- JLPT level progress bar (% of N4/N3/N2 vocab mastered)
- Kanji mastered count with visual grid (like WaniKani)
- Weekly study time chart
- Weakest areas (grammar patterns, vocab categories)
- Interview readiness score (based on AI conversation performance)
- Countdown to JLPT exam dates (July 5 & December 6, 2026)

#### Feature 6: Gamification
**Description**: Motivation system inspired by Duolingo but adapted for serious learners.

- **Daily XP**: Points for reviews, new cards, conversations, listening
- **Streak System**: Daily streak with streak freeze (max 2)
- **Level System**: 組込みエンジニア levels (intern → junior → senior → lead → CTO)
- **Weekly Goals**: Configurable (relaxed/standard/intense/insane)
- **Achievement Badges**: "First 100 Kanji", "Jikoshoukai Master", "RTOS Vocabulary Complete"
- **Review Heatmap**: GitHub-style contribution graph for study days

#### Feature 7: Grammar Dojo (文法道場)
**Description**: Interactive grammar practice section inspired by Bunpro's cloze deletion approach but with multiple exercise types, gamified progression, and detailed explanations. The user must actively produce or choose answers — never passive reading.

**Design Principles**:
- User ALWAYS answers first, THEN gets feedback (never show the rule before the exercise)
- Wrong answers are learning moments: show WHY it's wrong with a clear comparison
- Each grammar point has multiple sentence variations to prevent pattern memorization
- Exercises mix production (typing) and recognition (MCQ) to train different skills
- SRS tracks grammar points independently from vocabulary cards
- Embedded/business domain sentences mixed in so grammar practice doubles as domain vocab exposure

**Exercise Types**:

1. **Fill-in-the-Blank (穴埋め)** — Bunpro-style cloze deletion
   - Show a Japanese sentence with one blank where the grammar point goes
   - User types the answer in hiragana/kanji
   - Nudge system: if close but wrong form, show hint without revealing the answer
   - Accept multiple valid answers (e.g., both なければならない and なきゃ for obligation)
   ```
   Example:
   Sentence: 明日までにレポートを＿＿＿＿なりません。
   Hint: "must / have to"
   Answer: 出さなければ
   If wrong: "You need the negative form of 出す before なければなりません"
   ```

2. **Sentence Builder (文作り)** — Drag-and-drop or tap-to-order
   - Given scrambled word tiles, build the correct sentence
   - Tests particle placement, word order, and conjugation awareness
   - Tiles include distractors (wrong particles, wrong verb forms)
   ```
   Example:
   Target: タスクの優先度を変更しなければなりません。
   Tiles: [タスクの] [を] [優先度] [変更] [なりません] [しなければ] [が] (distractor)
   ```

3. **Error Spotter (間違い探し)** — Find and fix the mistake
   - Show a sentence with ONE grammar error
   - User taps the wrong part, then types the correction
   - Trains proofreading skill (useful for reading Japanese specs/emails)
   ```
   Example:
   Sentence: このバグは再現するのが難しいくて、まだ調査中です。
   Error: 難しいくて → 難しくて (i-adjective te-form rule)
   Explanation: "い-adjectives drop い before くて. 難しい → 難しくて"
   ```

4. **Choose the Right Form (正しい形を選べ)** — Contextual MCQ
   - Show a sentence with 4 possible grammar completions
   - Only ONE is grammatically correct AND contextually appropriate
   - After answering, ALL 4 options are explained (why right or why wrong)
   ```
   Example:
   デバッグが終わった＿＿＿、テストを実行します。
   A) あとで  ✓ (after ~ing — correct temporal sequence)
   B) まえに  ✗ (before — wrong temporal direction)
   C) ながら  ✗ (while — simultaneous, wrong here)
   D) ために  ✗ (in order to — wrong logical relationship)
   ```

5. **Conjugation Challenge (活用チャレンジ)** — Speed drill
   - Given a verb/adjective + target form, type the conjugation
   - Timed mode available (beat your record)
   - Covers: て-form, ない-form, た-form, 可能形, 受身形, 使役形, 条件形, 意志形
   ```
   Example:
   動詞: 書く → て形 → Answer: 書いて
   動詞: 食べる → 可能形 → Answer: 食べられる
   い形容詞: 高い → ない形 → Answer: 高くない
   ```

6. **Context Match (場面マッチ)** — Politeness level selector
   - Show a situation + sentence, choose the correct formality level
   - Critical for keigo/business Japanese interview prep
   - 3 levels: casual (タメ口), polite (です/ます), honorific/humble (敬語)
   ```
   Example:
   Situation: チームリーダーに進捗を報告する
   A) 終わったよ (casual) ✗
   B) 終わりました (polite) ✗ — acceptable but not ideal for reporting UP
   C) 完了いたしました (humble keigo) ✓
   Explanation: "When reporting to a superior, use 謙譲語 (humble language).
   いたす is the humble form of する."
   ```

7. **Sentence Transform (書き換え)** — Rewrite in target grammar
   - Given a sentence + instruction, rewrite using the specified grammar
   - Tests ability to actively produce grammar, not just recognize it
   ```
   Example:
   Original: この問題は難しいです。解けません。
   Instruction: ～すぎて を使って一つの文にしてください
   Answer: この問題は難しすぎて、解けません。
   Explanation: "～すぎる expresses excess. For い-adjectives: drop い, add すぎる.
   難しい → 難しすぎる → 難しすぎて (te-form for cause/reason)"
   ```

**Grammar Point Data Structure**:
```typescript
interface GrammarPoint {
  id: string;
  pattern: string;           // e.g., "～なければならない"
  meaning_en: string;        // "must / have to"
  meaning_fr: string;        // "devoir / il faut"
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2';
  category: string;          // "obligation", "conditional", "passive", etc.
  formation: FormationRule[];
  explanation_en: string;
  explanation_fr: string;
  nuance: string;            // subtle usage notes
  related_points: string[];  // IDs of similar grammar
  common_mistakes: CommonMistake[];
  exercises: GrammarExercise[];
  example_sentences: GrammarSentence[];
  audio_url: string | null;
  srs: GrammarSRS;           // independent from vocab SRS
}

interface FormationRule {
  base: string;              // "Verb (ない-form)"
  rule: string;              // "drop ない → なければならない"
  examples: { input: string; output: string }[];
}

interface CommonMistake {
  wrong: string;
  correct: string;
  explanation_en: string;
  explanation_fr: string;
}

interface GrammarExercise {
  id: string;
  type: 'fill_blank' | 'sentence_builder' | 'error_spotter' |
        'mcq' | 'conjugation' | 'context_match' | 'transform';
  question: GrammarQuestion;
  answers: ValidAnswer[];     // multiple accepted answers
  distractors?: string[];     // wrong options for MCQ
  hints: string[];            // progressive hints (shown after wrong attempts)
  explanation: {
    correct: string;
    wrong_explanations: Map<string, string>; // common wrong answer → why
  };
  domain?: string;            // "embedded" | "business" | "daily"
  difficulty: 1 | 2 | 3;     // within the JLPT level
}

interface GrammarSRS {
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: Date;
  lastReview: Date | null;
  typeAccuracy: {             // track per exercise type
    fill_blank: { correct: number; total: number };
    sentence_builder: { correct: number; total: number };
    error_spotter: { correct: number; total: number };
    mcq: { correct: number; total: number };
    conjugation: { correct: number; total: number };
    context_match: { correct: number; total: number };
    transform: { correct: number; total: number };
  };
  weakestType: string;        // auto-detected → more of this type shown
}
```

**Feedback UX Flow**:
```
1. Show exercise → user answers
   ↓
2a. CORRECT →
   - Green flash animation + satisfying sound
   - "✓ Correct!" + brief reinforcement note
   - Related grammar tip (30% of the time to keep it fresh)
   - +XP: first try = 10XP, with hint = 5XP
   ↓
2b. WRONG (attempt 1) →
   - Orange/amber flash (not red — learning, not failing)
   - Nudge hint: "Close! Think about the verb form..."
   - Let user try again (max 3 attempts)
   ↓
2c. WRONG (attempt 2+) →
   - Progressive hint (more specific each time)
   - After 3rd wrong: reveal answer with FULL explanation
   ↓
3. EXPLANATION CARD (shown after every answer):
   - Rule summary with formation pattern
   - Sentence explained word-by-word
   - Common mistake for this point
   - "Similar grammar" links (e.g., ～なければならない vs ～べき)
   - "Practice more" button → adds to SRS with shorter interval
   - Audio of the correct sentence (autoplay)
```

**Progression System**:
- Grammar points organized by JLPT level → category
- Score ≥70% on exercises to "learn" a point (add to SRS review queue)
- Cram Mode: review without affecting SRS (pre-exam cramming)
- Ghost Grammar: repeatedly wrong points get "ghost" status with adapted SRS
- Weekly Grammar Report: "Learned 8 new points, struggled with て-form, mastered ～たら"

**Domain-Specific Grammar Sentences (samples)**:
```json
{
  "grammar_id": "nakereba_naranai",
  "domain_exercises": [
    {
      "domain": "embedded",
      "sentence": "リリース前にすべてのテストケースを＿＿＿なりません。",
      "answer": "実行しなければ",
      "en": "All test cases must be executed before release.",
      "fr": "Tous les cas de test doivent être exécutés avant le release."
    },
    {
      "domain": "business",
      "sentence": "会議の前に議事録を＿＿＿なりません。",
      "answer": "準備しなければ",
      "en": "Meeting minutes must be prepared before the meeting.",
      "fr": "Le compte-rendu doit être préparé avant la réunion."
    },
    {
      "domain": "automotive",
      "sentence": "ECUのソフトウェアは安全規格に＿＿＿なりません。",
      "answer": "適合しなければ",
      "en": "ECU software must comply with safety standards.",
      "fr": "Le logiciel ECU doit être conforme aux normes de sécurité."
    }
  ]
}
```

**Grammar Seed Data Counts**:
```
N5: ~75 grammar points (foundation — should know most already)
N4: ~130 grammar points (April-May priority)
N3: ~180 grammar points (June-August priority)
N2: ~195 grammar points (September-December priority)
Total: ~580 grammar points × 5-8 exercises each = ~3500 exercises
```

**Database Tables for Grammar** (add to migration):
```sql
-- Grammar Points
CREATE TABLE grammar_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern TEXT NOT NULL,           -- ～なければならない
  meaning_en TEXT NOT NULL,
  meaning_fr TEXT NOT NULL,
  jlpt_level TEXT NOT NULL,
  category TEXT NOT NULL,          -- obligation, conditional, etc.
  formation JSONB NOT NULL,        -- conjugation rules
  explanation_en TEXT NOT NULL,
  explanation_fr TEXT NOT NULL,
  nuance TEXT,
  related_points TEXT[],
  common_mistakes JSONB DEFAULT '[]',
  audio_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Grammar Exercises
CREATE TABLE grammar_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grammar_point_id UUID REFERENCES grammar_points(id) ON DELETE CASCADE,
  type TEXT NOT NULL,              -- fill_blank, mcq, conjugation, etc.
  question JSONB NOT NULL,         -- sentence, hints, context
  answers JSONB NOT NULL,          -- accepted answers array
  distractors JSONB,              -- wrong options for MCQ
  hints TEXT[] DEFAULT '{}',
  explanation JSONB NOT NULL,      -- correct + wrong explanations
  domain TEXT DEFAULT 'core',
  difficulty INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Grammar SRS (independent from vocab SRS)
CREATE TABLE user_grammar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  grammar_point_id UUID REFERENCES grammar_points(id),
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  next_review TIMESTAMPTZ DEFAULT now(),
  last_review TIMESTAMPTZ,
  total_reviews INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  is_ghost BOOLEAN DEFAULT false,  -- haunted grammar points
  type_accuracy JSONB DEFAULT '{}', -- per exercise type stats
  weakest_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, grammar_point_id)
);
```

**API Routes for Grammar**:
```
GET    /api/grammar/points?level=N4&category=conditional
GET    /api/grammar/exercises/:grammarPointId
GET    /api/grammar/due          — grammar points due for SRS review
POST   /api/grammar/review       — submit answer (updates grammar SRS)
GET    /api/grammar/stats        — accuracy per type, ghosts, progress
POST   /api/grammar/cram         — cram session (no SRS impact)
GET    /api/grammar/weekly-report — weekly grammar learning summary
```

### 3.2 Technical Architecture

#### Database Schema (Supabase/PostgreSQL)
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  native_language TEXT DEFAULT 'fr', -- 'fr' or 'en'
  current_level TEXT DEFAULT 'N5',
  daily_goal INTEGER DEFAULT 50, -- cards per day
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vocabulary
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kanji TEXT,
  hiragana TEXT NOT NULL,
  romaji TEXT NOT NULL,
  meaning_en TEXT NOT NULL,
  meaning_fr TEXT NOT NULL,
  jlpt_level TEXT NOT NULL, -- N5, N4, N3, N2
  domain TEXT NOT NULL, -- core, embedded, automotive, business
  subdomain TEXT, -- rtos, protocols, hardware, interview, etc.
  part_of_speech TEXT,
  audio_url TEXT,
  example_sentences JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kanji
CREATE TABLE kanji (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character TEXT UNIQUE NOT NULL,
  onyomi TEXT[], -- on readings
  kunyomi TEXT[], -- kun readings
  meaning_en TEXT NOT NULL,
  meaning_fr TEXT NOT NULL,
  jlpt_level TEXT NOT NULL,
  stroke_count INTEGER,
  radicals TEXT[],
  mnemonic TEXT,
  svg_data TEXT, -- KanjiVG stroke order SVG
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SRS Cards (user-specific state)
CREATE TABLE user_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_id UUID REFERENCES vocabulary(id),
  card_type TEXT NOT NULL, -- vocab, reverse, listening, context, kanji
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  next_review TIMESTAMPTZ DEFAULT now(),
  last_review TIMESTAMPTZ,
  total_reviews INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, vocabulary_id, card_type)
);

-- Conversation History
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL, -- jikoshoukai, interview, daily, technical
  messages JSONB NOT NULL DEFAULT '[]',
  feedback JSONB, -- AI analysis
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Study Sessions
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- review, learn, listen, converse
  cards_reviewed INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
```

#### API Routes
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/cards/due          — get cards due for review
POST   /api/cards/review       — submit review result (SM-2 update)
GET    /api/cards/new          — get new cards to learn
GET    /api/vocabulary?level=N3&domain=embedded
GET    /api/kanji/:character
POST   /api/conversation/start — start AI conversation
POST   /api/conversation/message — send message in conversation
GET    /api/conversation/history
GET    /api/progress/dashboard
GET    /api/progress/streak
POST   /api/audio/generate     — TTS for custom text
GET    /api/achievements
```

#### Mobile Strategy (Capacitor)
```
capacitor.config.ts:
- App name: "Keogo"
- Bundle ID: com.keogo.app
- Plugins: @capacitor/keyboard, @capacitor/haptics, @capacitor/status-bar
- Background audio support for listening exercises
- Offline mode with IndexedDB → Supabase sync on reconnect
- Push notifications for daily review reminders
```

### 3.3 UI/UX Design Principles

1. **Mobile-first**: Primary use case is phone during commute (30 min sessions)
2. **Dark mode default**: Easier on eyes for evening study
3. **Japanese-inspired aesthetic**: Clean, minimal, inspired by Muji/LINE design
4. **Large touch targets**: Cards swipeable (left=wrong, right=correct, up=easy)
5. **Furigana toggle**: Always accessible, default ON for new kanji
6. **Audio autoplay**: On card flip, with volume control
7. **Progress always visible**: Streak, daily goal progress bar in header

### 3.4 Embedded Systems Vocabulary Data (Seed Sample)

```json
[
  {
    "kanji": "組込みシステム",
    "hiragana": "くみこみしすてむ",
    "romaji": "kumikomi shisutemu",
    "meaning_en": "embedded system",
    "meaning_fr": "système embarqué",
    "jlpt_level": "N2",
    "domain": "embedded",
    "subdomain": "general",
    "example_sentences": [
      {
        "jp": "私は組込みシステムのエンジニアです。",
        "reading": "わたしはくみこみしすてむのえんじにあです。",
        "en": "I am an embedded systems engineer.",
        "fr": "Je suis ingénieur en systèmes embarqués."
      }
    ]
  },
  {
    "kanji": "割り込み",
    "hiragana": "わりこみ",
    "romaji": "warikomi",
    "meaning_en": "interrupt (hardware/software)",
    "meaning_fr": "interruption (matériel/logiciel)",
    "jlpt_level": "N2",
    "domain": "embedded",
    "subdomain": "rtos",
    "example_sentences": [
      {
        "jp": "割り込み処理の優先度を設定しました。",
        "reading": "わりこみしょりのゆうせんどをせっていしました。",
        "en": "I configured the interrupt handler priority.",
        "fr": "J'ai configuré la priorité du gestionnaire d'interruptions."
      }
    ]
  },
  {
    "kanji": "不具合",
    "hiragana": "ふぐあい",
    "romaji": "fuguai",
    "meaning_en": "bug / defect / malfunction",
    "meaning_fr": "bogue / défaut / dysfonctionnement",
    "jlpt_level": "N2",
    "domain": "embedded",
    "subdomain": "development",
    "example_sentences": [
      {
        "jp": "この不具合はタスクの優先度に関係しています。",
        "reading": "このふぐあいはたすくのゆうせんどにかんけいしています。",
        "en": "This bug is related to task priority.",
        "fr": "Ce bogue est lié à la priorité des tâches."
      }
    ]
  },
  {
    "kanji": "基板",
    "hiragana": "きばん",
    "romaji": "kiban",
    "meaning_en": "circuit board / PCB",
    "meaning_fr": "carte de circuit imprimé / PCB",
    "jlpt_level": "N2",
    "domain": "embedded",
    "subdomain": "hardware"
  },
  {
    "kanji": "検証",
    "hiragana": "けんしょう",
    "romaji": "kenshou",
    "meaning_en": "verification / validation",
    "meaning_fr": "vérification / validation",
    "jlpt_level": "N2",
    "domain": "automotive",
    "subdomain": "testing"
  },
  {
    "kanji": "お疲れ様です",
    "hiragana": "おつかれさまです",
    "romaji": "otsukaresama desu",
    "meaning_en": "thank you for your hard work (greeting)",
    "meaning_fr": "merci pour votre travail (salutation)",
    "jlpt_level": "N3",
    "domain": "business",
    "subdomain": "daily"
  },
  {
    "kanji": "志望動機",
    "hiragana": "しぼうどうき",
    "romaji": "shibou douki",
    "meaning_en": "motivation for applying",
    "meaning_fr": "motivation de candidature",
    "jlpt_level": "N2",
    "domain": "business",
    "subdomain": "interview"
  }
]
```

### 3.5 Jikoshoukai Template (Built into App)

```
# 自己紹介テンプレート — 組込みエンジニア向け

## Structure (2 minutes)

### 1. 挨拶 (Greeting) — 10 seconds
はじめまして。{name}と申します。
フランス出身で、現在{age}歳です。

### 2. 学歴 (Education) — 15 seconds
ソルボンヌ大学で電子工学を学び、
その後、組込みシステムの学士号を取得しました。

### 3. 職歴 (Career) — 45 seconds
組込みソフトウェアエンジニアとして{X}年以上の経験があります。
自動車業界では、ルノーでHILバリデーション、
ステランティスでソフトウェアインテグレーション、
フォーシーパワーではバッテリーマネジメントシステムの開発に
携わりました。
C/C++、RTOS、CAN通信プロトコルを専門としています。

### 4. 来日の動機 (Why Japan) — 20 seconds
日本の自動車技術と品質へのこだわりに強く惹かれています。
パートナーが日系で、以前日本を訪れた際に
日本で働きたいという思いが強くなりました。

### 5. 締め (Closing) — 10 seconds
御社で組込みシステムの経験を活かし、
貢献できればと考えております。
よろしくお願いいたします。
```

---

## 4. IMPLEMENTATION PLAN (Phased)

### Phase 1: Core Foundation (Week 1–2)
```
Tasks:
1. Set up Next.js 14 project with TypeScript, Tailwind, shadcn/ui
2. Configure Supabase project (auth, database, storage)
3. Run database migrations (all tables above)
4. Implement SM-2 SRS engine in /lib/srs.ts with unit tests
5. Seed N5 + N4 vocabulary (1500 words) + embedded domain (200 words)
6. Build basic flashcard review UI (swipe cards)
7. Add audio playback (preloaded TTS files)
8. Implement basic auth flow (email/password via Supabase)
9. Set up Capacitor for iOS/Android
```

### Phase 2: Kanji & Content (Week 3–4)
```
Tasks:
1. Integrate KanjiVG stroke order data
2. Build kanji detail page (radicals, readings, example words)
3. Implement kanji writing practice canvas
4. Seed N5–N3 kanji data (600 characters)
5. Build deck selection UI with domain filters
6. Add furigana toggle component (ruby text)
7. Implement listening card type with audio-only mode
8. Add context sentence cards with blank fill
9. Build progress dashboard (streak, cards, level bars)
```

### Phase 3: AI Conversation (Week 5–6)
```
Tasks:
1. Set up Anthropic API via Supabase Edge Function
2. Build conversation UI (chat interface)
3. Implement jikoshoukai mode with structured guidance
4. Implement interview simulator with question bank
5. Add real-time correction display (diff view)
6. Implement technical discussion mode
7. Add conversation history and review
8. Build speech-to-text input (Web Speech API)
9. Score conversations and feed into progress dashboard
```

### Phase 4: Gamification & Polish (Week 7–8)
```
Tasks:
1. Implement XP system and level progression
2. Build achievement badge system
3. Add streak tracking with notifications
4. Build study heatmap visualization
5. Add daily/weekly goal settings
6. Implement offline mode (IndexedDB sync)
7. Add push notifications (Capacitor)
8. Dark mode + theme system
9. Performance optimization (lazy loading, code splitting)
10. Deploy to Vercel (web) + TestFlight/Play Console (mobile)
```

### Phase 5: Grammar Dojo (Week 9–10)
```
Tasks:
1. Run grammar DB migration (grammar_points, grammar_exercises, user_grammar tables)
2. Seed N5 + N4 grammar points (~205 points) with exercises from JSON
3. Build Grammar Dojo main page — level selector + category filter
4. Implement Fill-in-the-Blank exercise component with nudge hints
5. Implement MCQ (Choose the Right Form) with full option explanations
6. Implement Conjugation Challenge with optional timer mode
7. Implement Sentence Builder (drag-and-drop tile ordering)
8. Implement Error Spotter (tap-to-select + correction input)
9. Implement Context Match (politeness level selector for keigo)
10. Implement Sentence Transform (rewrite with target grammar)
11. Build grammar SRS engine in /lib/grammar-srs.ts (separate from vocab SRS)
12. Build feedback/explanation card component (shared across all exercise types)
13. Add ghost grammar system (adapted SRS for persistent weak points)
14. Build weekly grammar report component
15. Integrate grammar progress into main dashboard
16. Seed N3 grammar points (~180 points) with domain-specific exercises
17. Add grammar achievements ("て-form Master", "Keigo Apprentice", etc.)
18. Write tests for grammar SRS + answer validation logic
```

---

## 5. CLAUDE CODE EXECUTION INSTRUCTIONS

When working on this project with Claude Code:

1. **Always start sessions by reading CLAUDE.md** at root
2. **Use plan mode first** (Shift+Tab ×2) for any feature > 50 lines
3. **Write tests before implementation** for all /lib/* modules
4. **Seed data is critical** — never hardcode vocabulary, always use JSON seeds or DB
5. **Audio files**: Pre-generate TTS for all vocabulary during seed phase, store URLs in DB
6. **Mobile testing**: After every UI change, test at 375px width (iPhone SE)
7. **Japanese text**: Always include kanji + hiragana + romaji + meaning in both EN/FR
8. **SRS engine**: Must have 100% test coverage — it's the core of the app
9. **AI prompts**: Store system prompts in /data/prompts/*.md, not hardcoded in components
10. **Security**: API keys in .env.local only, Supabase RLS enabled on all tables

### Reference Repos for Best Practices
- `github.com/msitarzewski/agency-agents` — Agent architecture patterns, skills structure
- `github.com/affaan-m/everything-claude-code` — CLAUDE.md patterns, progressive disclosure, skills/hooks

### Key Patterns from Reference Repos
- Use `.claude/skills/` for domain-specific knowledge (Japanese vocab rules, SRS algorithm docs)
- Create `.claude/commands/` for common workflows (seed-vocab, generate-audio, run-tests)
- Use progressive disclosure — don't load all context at once
- Create feature-specific subagents for complex tasks (AI conversation, kanji data pipeline)
- Keep CLAUDE.md under 200 lines, link to skills for details

---

## 6. VOCABULARY DOMAIN LISTS (Categories to Seed)

### Embedded Systems (組込みシステム)
- RTOS: タスク, スレッド, セマフォ, ミューテックス, デッドロック, 割り込み, 優先度, スケジューラ, コンテキストスイッチ, タイマー
- Protocols: CAN通信, シリアル通信, UART, SPI, I2C, Ethernet, TCP/IP, UDS, 診断通信
- Hardware: マイコン, 基板, 回路, センサー, アクチュエータ, メモリ, レジスタ, GPIO, ADC, PWM
- Development: デバッグ, コンパイル, ビルド, テスト, 不具合, 修正, リリース, 仕様書, 設計書, コードレビュー
- Tools: オシロスコープ, ロジックアナライザ, デバッガ, エミュレータ, シミュレータ

### Automotive (自動車)
- ECU, 車載, 安全性, 規格, AUTOSAR, 機能安全, ISO 26262, 認証, 適合性
- 検証, バリデーション, HILテスト, 試験, 評価, 品質管理

### Business/Interview (ビジネス)
- 自己紹介, 志望動機, 長所, 短所, 経験, 入社, 退職, 転職
- 報告, 連絡, 相談 (ほうれんそう), 会議, 打ち合わせ, 議事録
- お疲れ様です, お世話になっております, ご確認ください, 承知しました

### Agile/Scrum (アジャイル)
- スプリント, バックログ, レビュー, レトロスペクティブ, デイリースタンドアップ
- ストーリーポイント, ベロシティ, カンバン, リファインメント