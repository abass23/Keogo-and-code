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