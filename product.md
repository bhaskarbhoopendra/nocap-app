# Nocap — Project Spec & Scope of Work

A proof-based consistency app. Users don't just tick a checkbox to mark a habit or
program task done — they back it up with real proof (a photo, a timed focus session,
or an honest self-check), build a streak, earn XP, and eventually unlock a leaderboard.
Built to be genuinely useful for people who struggle with consistency (fitness, study,
job search, creative projects, quitting a habit, anything), not just another habit
tracker that gets deleted after a week.

This doc is the single source of truth for what's been decided and built so far, and
what's left to build. Read this fully before making changes.

---

## 1. Product vision

- **Not a checkbox tracker.** The core insight: checkboxes have zero cost to lying to
  yourself. Every task requires _proof_ of some kind, which makes self-honesty
  structural instead of optional.
- **Fully flexible, template-based.** Any user can build a custom multi-week program
  (or an ongoing daily habit) out of flexible daily "blocks" — not locked into fixed
  categories. This is what lets the same engine power a job-search roadmap, a fitness
  plan, an exam prep schedule, or a "meditate every day" habit.
- **Vibe: soft dark neon.** Dark, techy, a little sassy — but toned down from full
  glow/saturation so it doesn't distract someone trying to actually focus. Signature
  pink → purple gradient accent, near-black base.
- **Tone: supportive, not punitive.** Missing a day or breaking a timer session early
  is logged honestly, but paired with encouraging messaging, not shame or a wiped
  streak. The goal is to keep people using the app after a bad day, not scare them off.

## 2. Core mechanics (decided)

### Proof types (per task block, user's choice)

- **Photo** — private on-device/private-by-default in storage; user can opt in to
  share it later (to a future squad feature, or publicly). The _fact_ that a proof was
  submitted always counts toward XP/streak/leaderboard, regardless of whether the
  photo itself is ever shared.
- **Timer / focus session** — a live timer runs while the user works. If they leave
  the app early, the session is honestly logged as an early exit (not silently counted
  as a full success), but the app responds with a supportive message, not a failure
  state or shame screen.
- **Self-check** — honor system, always available as a fallback for any block.

### Progression & leaderboard

- **Streak** = the headline number (consecutive days with at least one proof logged).
- **XP** = the depth layer, earned per proof submitted, drives leveling over time.
- **Leaderboard unlock**: a user becomes eligible for ranked status once they hit
  **either** a streak-length threshold **or** an XP threshold (currently 7 days streak
  OR 500 XP — tunable, see `src/services/leaderboardService.ts`).
- **Two leaderboards**: one global (across all users, all templates), one scoped to
  the user's specific template/category. Global streak = "did you log _any_ proof
  today across any active program." Per-template streak/XP is tracked on the
  `programs` row itself, since a user can run multiple programs at once.
- The leaderboard is **visible before unlock** (so it's aspirational) but the user
  can't appear on it or fully interact with it until they've earned eligibility.

### Identity & onboarding

- **Fully anonymous to start.** No email, no password, no signup form. On first
  launch the app silently creates an anonymous Supabase auth session, then the user
  just picks a username and a generated avatar (color/shape combo — no photo upload
  needed for the avatar itself).
- **Real account creation is deferred and earned.** Only once the user hits the
  leaderboard-unlock threshold are they prompted to add a real login (email/password).
  This upgrades the _same_ underlying user ID, so all their existing streak/XP/history
  carries over — it's framed as a reward ("protect your streak"), not a paywall.

### Launch scope decisions

- **Solo-first.** No squads / accountability partners in the first version —
  deliberately deferred to a later phase.
- **Freemium from day one.** Core tracking is free; premium tier covers AI-generated
  plans and advanced templates/analytics (see §5).
- **Not building yet, explicitly deferred:** OS-level app-blocking / distraction
  lockout during focus sessions (needs Screen Time / Usage Access APIs — a
  significantly bigger, separate effort). Squads/accountability partners.

## 3. Naming & visual identity

- **Name: Nocap.**
- **Palette**: near-black base (`#0a0a0f` range), signature pink→purple gradient
  (`#e0308f` → `#6a2fd9` currently), glow/saturation dialed back from a full
  cyberpunk look — calm enough to sit next to while studying.
- **Theming is dynamic, not hardcoded.** Colors live in a `themes` table in Supabase
  as a jsonb blob of tokens. Changing the palette later is a database update, not a
  code change or app store resubmission.

## 4. Tech stack & architecture

- **Client**: React Native + TypeScript, via Expo. Single codebase targets Android
  and iOS.
- **Backend**: Supabase (hosted Postgres + Auth + Storage + auto-generated REST API).
  **There is no separate custom backend server** — the client talks directly to
  Supabase. This is safe because of Postgres row-level security (RLS): every table has
  policies keyed on `auth.uid()` so a user can only read/write their own rows, even
  though the client holds a public "anon key."
- **Auth flow**: anonymous sign-in on first launch → JWT persisted on-device via
  `AsyncStorage` → attached automatically to every request → optional later upgrade to
  email/password on the _same_ user ID once leaderboard-eligible.
- **Automatic profile creation**: a Postgres trigger (`handle_new_user`) fires on every
  new `auth.users` insert (including anonymous ones) and creates a matching `profiles`
  row with a placeholder username — no app code needed to bootstrap this.
- **Leaderboards are SQL views** (`leaderboard_global`, `leaderboard_by_template`), not
  separately-maintained tables — they're computed live from `profiles` and `programs`.

## 5. Data model (implemented — see `supabase/migrations/0001_init.sql`)

| Table              | Purpose                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `profiles`         | One row per user (anonymous or upgraded). Username, avatar seed, total XP, current/longest streak, leaderboard unlock status.              |
| `themes`           | Dynamic color tokens; exactly one row has `is_active = true` at a time.                                                                    |
| `templates`        | The blueprint for a program — built-in, user-created, or AI-generated. Has a `category`, optional `duration_weeks` (null = ongoing habit). |
| `template_days`    | Structure within a template — week number, day index, rest-day flag, notes.                                                                |
| `template_blocks`  | The actual flexible tasks within a day — label, task text, `proof_type` (photo/timer/self_check), target duration for timers.              |
| `programs`         | A specific user's _running instance_ of a template. Tracks its own `current_streak`/`total_xp` (feeds the per-template leaderboard).       |
| `task_logs`        | Actual proof submissions — status (completed/incomplete_early_exit/skipped), photo path, timer actual-vs-target seconds, XP earned.        |
| `ai_plan_requests` | Stores the AI goal-planning intake + generated template link (see §7).                                                                     |

RLS is enabled on every table. Full policies are in the migration file — the general
rule is "public/built-in data is readable by everyone, private data is only
readable/writable by its owner via `auth.uid()`."

## 6. What's already built (working code, not just spec)

- Full Supabase schema + RLS + seed theme (`supabase/migrations/0001_init.sql`)
- Supabase client init (`src/lib/supabase.ts`)
- TypeScript types mirroring the schema (`src/types/database.ts`)
- Auth service: anonymous sign-in, session persistence, profile setup, account
  upgrade stub (`src/services/authService.ts`)
- Theme service: fetch active theme from DB with a hardcoded fallback
  (`src/services/themeService.ts`)
- Leaderboard service: global + per-template queries, unlock-threshold check
  (`src/services/leaderboardService.ts`)
- Dynamic theme context + session context (React providers wrapping the app)
- Generated-avatar system (color/shape presets, no photo upload) + `Avatar` component
- Onboarding screen: avatar picker + username entry, writes to `profiles`
- Dashboard screen: real streak/XP display, leaderboard preview that's visibly
  locked/unlocked based on the user's actual progress
- `App.tsx` wiring: boots session + theme, routes to onboarding vs dashboard based on
  whether the user still has a placeholder username

## 7. Scope of work — what's next (in priority order)

1. **Template picker + custom builder screen.** Browse built-in templates
   (`templates` where `source = 'builtin'` — none seeded yet, need to insert some,
   e.g. port the original 14-week job-prep roadmap as the first built-in template) and
   a form flow for users to build their own flexible day/block structure from scratch.
2. **Proof submission flow.** The actual UI for each proof type:
   - Photo: camera capture (`expo-camera` / `expo-image-picker`, already in
     `package.json`), upload to Supabase Storage, write `task_logs` row.
   - Timer: a live countdown/countup UI; detect app-background/exit to mark
     `incomplete_early_exit`; supportive copy on early exit.
   - Self-check: simple confirm button.
   - All three need to update `programs.current_streak` / `total_xp` and
     `profiles.current_streak` / `total_xp` on submission, then call
     `checkAndUnlockLeaderboard()`.
3. **Supabase Storage bucket setup** for photo proofs (not yet created — needs a
   bucket + storage RLS policies mirroring the task_logs ownership rules).
4. **Real-account upgrade prompt.** Trigger the upgrade flow
   (`upgradeToRealAccount()` in `authService.ts`) right when
   `checkAndUnlockLeaderboard()` flips a user's status for the first time.
5. **Per-template leaderboard screen.** `getTemplateLeaderboard()` already exists in
   `leaderboardService.ts` — needs a screen + category picker UI.
6. **AI-assisted goal planning** (premium feature). Guided intake flow (goal
   description + a few structured questions — time budget, current level, hard
   constraints) → LLM call → writes a new `templates` / `template_days` /
   `template_blocks` set → user can edit before starting. Tracked via
   `ai_plan_requests`. This is a paid-tier feature (API cost per generation), not free.
7. **Freemium paywall logic.** Decide and implement what's actually gated (currently:
   AI-generated plans + premium templates/analytics are paid; manual custom templates
   and core tracking are free).
8. **Later phases, not now:** squads/accountability partners; OS-level app-blocking
   during focus sessions; template sharing/community marketplace.

## 8. Open questions for whoever picks this up

- Exact XP formula per proof type (currently unspecified — needs a decision, e.g. flat
  XP per proof vs. scaled by timer duration).
- Whether `incomplete_early_exit` timer sessions earn partial XP or zero XP.
- Whether streak counts require _all_ of a day's blocks completed, or just one.
- Storage bucket privacy rules for shared vs. private photos.
