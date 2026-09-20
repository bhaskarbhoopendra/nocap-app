# Nocap — User Stories

Companion doc to `NOCAP_PROJECT_SPEC.md`. Read that first for full context — this file
breaks every decided feature down into agent-actionable user stories with acceptance
criteria. Stories are grouped by epic and ordered by build priority. Status markers:
`[x] Done` = already implemented and working, `[ ] Not started` = next up.

---

## Epic 1 — Anonymous onboarding & identity

### US-1.1 — Silent anonymous entry

**As a** first-time user, **I want** to open the app and start using it immediately,
**so that** I never hit a signup wall before I've decided if I even like the app.

- [x] Done — App boots and calls `ensureSession()` in `authService.ts`
- [x] Done — Creates a Supabase anonymous auth session if none exists on-device
- [x] Done — DB trigger `handle_new_user` auto-creates a `profiles` row with a
      placeholder username (`nocapper_xxxxxxxx`)
- [x] Done — Session persists across app restarts via `AsyncStorage`

### US-1.2 — Pick a username and avatar

**As a** first-time user, **I want** to choose a username and a visual avatar without
uploading a photo, **so that** I have an identity in the app that feels like mine.

- [x] Done — `OnboardingScreen.tsx` shown automatically while username is still the
      auto-generated placeholder
- [x] Done — Avatar picker offers a fixed set of color/shape presets
      (`avatarPresets.ts`), no camera/upload required
- [x] Done — Username + `avatar_seed` written to `profiles` via
      `updateProfileSetup()`
- [x] Done — Once saved, app routes to the Dashboard instead of Onboarding

### US-1.3 — Upgrade to a real account once eligible

**As a** user who's hit the leaderboard-unlock threshold, **I want** to be prompted to
add a real login, **so that** I don't lose my streak if I reinstall or switch phones.

- [ ] Not started — Trigger an upgrade prompt screen the moment
      `checkAndUnlockLeaderboard()` flips `leaderboard_unlocked` from false to true
      for the first time
- [ ] Not started — Prompt collects email + password, calls
      `upgradeToRealAccount()` (stub already exists in `authService.ts`)
- [ ] Not started — Confirm the same `auth.uid()` / profile row persists after
      upgrade (no data migration needed — Supabase's `updateUser` keeps the same
      user id)
- [ ] Not started — Frame the copy as a reward ("protect your streak"), never as a
      paywall or forced step — user can dismiss and be asked again later

---

## Epic 2 — Dynamic theming

### US-2.1 — Fetch and apply the active theme

**As a** developer/operator, **I want** the app's color palette to live in the
database, **so that** I can change the look without shipping a new app build.

- [x] Done — `themes` table seeded with one active `soft_neon_default` theme
- [x] Done — `getActiveTheme()` in `themeService.ts` fetches the row where
      `is_active = true`, with a hardcoded fallback if the fetch fails
- [x] Done — `ThemeContext.tsx` exposes tokens app-wide via `useTheme()`
- [x] Done — Onboarding + Dashboard screens consume theme tokens instead of
      hardcoded colors

### US-2.2 — Swap themes without a rebuild

**As a** developer/operator, **I want** to activate a different theme via a SQL
update, **so that** a palette change is a database operation, not a deploy.

- [x] Done (by design) — Unique index on `themes (is_active) where is_active = true`
      guarantees only one theme is active; documented in the README with example SQL
- [ ] Not started — No in-app UI for this yet (intentionally admin-only for now via
      direct DB access)

---

## Epic 3 — Templates: built-in library + custom builder

### US-3.1 — Seed built-in templates

**As a** new user, **I want** to see ready-made programs I can start immediately,
**so that** I'm not forced to design my own plan before I can use the app.

- [ ] Not started — Insert at least one built-in `templates` row
      (`source = 'builtin'`, `owner_id = null`) — port the original 14-week job-prep
      roadmap as the first one
- [ ] Not started — Insert matching `template_days` + `template_blocks` rows for
      that template
- [ ] Not started — Add 2–3 more built-in templates across different categories
      (fitness, study/exam, daily habit) so the picker isn't a single option

### US-3.2 — Browse and start a built-in template

**As a** user, **I want** to browse available templates and start one, **so that** I
can begin tracking a real program right away.

- [ ] Not started — Template list screen querying `templates` where `is_public =
    true or source = 'builtin' or owner_id = auth.uid()` (RLS already enforces this
      — the query itself is simple)
- [ ] Not started — Tapping a template creates a new `programs` row
      (`user_id`, `template_id`, `start_date = today`, `status = 'active'`)
- [ ] Not started — After starting, route to the program's day-by-day view (see
      Epic 4)

### US-3.3 — Build a fully custom template

**As a** user with a specific goal, **I want** to design my own program with
custom-labeled daily blocks, **so that** the app fits my exact plan instead of a
generic one.

- [ ] Not started — Form flow: name, category, duration (or "ongoing" for a habit
      with no end date), then add days/weeks
- [ ] Not started — Per day: add any number of blocks, each with a custom label,
      task description, and a **required choice of proof type** (photo / timer /
      self_check) — nudge photo/timer as suggested defaults but never force them
- [ ] Not started — For timer blocks, collect a target duration in minutes
- [ ] Not started — Saves as a `templates` row with `source = 'user_created'`,
      `owner_id = auth.uid()`, plus its `template_days` / `template_blocks`
- [ ] Not started — Built template immediately offered as "start this program now"

---

## Epic 4 — Proof submission (the core mechanic)

### US-4.1 — View today's blocks for an active program

**As a** user with an active program, **I want** to see today's tasks clearly, **so
that** I know exactly what to do and how to prove it.

- [ ] Not started — Program detail screen: resolve "today" against `start_date` +
      `template_days` structure, show that day's `template_blocks`
- [ ] Not started — Each block shows its label, task text, and proof-type icon
- [ ] Not started — Already-submitted blocks (existing `task_logs` row for
      today's date) show as completed/incomplete, not re-promptable

### US-4.2 — Submit photo proof

**As a** user completing a photo-proof task, **I want** to snap a photo to mark it
done, **so that** I have a real record I can't fake with a tap.

- [ ] Not started — Camera capture via `expo-camera` or `expo-image-picker`
      (already in `package.json`)
- [ ] Not started — Upload to a Supabase Storage bucket (bucket + RLS policies not
      yet created — see US-4.5)
- [ ] Not started — Write a `task_logs` row: `status = 'completed'`,
      `proof_type_used = 'photo'`, `photo_path` set, `photo_shared = false` by
      default
- [ ] Not started — Photo stays private unless the user explicitly opts to share it
      (share toggle — UI can be deferred, but the `photo_shared` flag must default
      false and never auto-flip true)

### US-4.3 — Submit timer/focus proof

**As a** user completing a timer-proof task, **I want** to run a focus session that
honestly tracks whether I stayed in the app, **so that** my streak reflects real
effort, not a fake tap.

- [ ] Not started — Live countdown UI running for `target_duration_minutes`
- [ ] Not started — Detect app backgrounding/exit before the timer completes
- [ ] Not started — On early exit: write `task_logs` with
      `status = 'incomplete_early_exit'`, `timer_seconds_actual` = elapsed time,
      and show a supportive message ("you showed up, that's still something — come
      back and finish when you're ready") — **no shame screen, no streak wipe from
      this alone**
- [ ] Not started — On full completion: `status = 'completed'`,
      `timer_seconds_actual = timer_seconds_target`

### US-4.4 — Submit self-check proof

**As a** user completing a self-check task, **I want** a simple one-tap confirmation,
**so that** low-stakes or trust-based tasks aren't over-engineered.

- [ ] Not started — Single confirm button, writes `task_logs` with
      `status = 'completed'`, `proof_type_used = 'self_check'`

### US-4.5 — Set up Supabase Storage for photos

**As a** developer, **I want** a dedicated storage bucket with correct access rules,
**so that** photo proofs are stored securely and privately by default.

- [ ] Not started — Create a Storage bucket (e.g. `proof-photos`)
- [ ] Not started — Storage RLS policies mirroring `task_logs` ownership: a user can
      only read/write objects under their own user-id-prefixed path
- [ ] Not started — Public read access only for photos explicitly marked
      `photo_shared = true` (requires a small policy or a signed-URL approach)

### US-4.6 — Update streak/XP on any proof submission

**As a** user, **I want** my streak and XP to update immediately after I submit
proof, **so that** the app feels responsive and the mechanic feels real.

- [ ] Not started — On every successful `task_logs` insert, update the parent
      `programs.current_streak` / `longest_streak` / `total_xp`
- [ ] Not started — Also roll up to `profiles.current_streak` / `total_xp` (global
      figures — see spec doc §2 for the "any program counts" streak definition)
- [ ] Not started — Call `checkAndUnlockLeaderboard()` after every update
- [ ] Not started — **Decision needed before building**: exact XP value per proof
      type, and whether `incomplete_early_exit` earns partial or zero XP (flagged as
      open question in the project spec)

---

## Epic 5 — Leaderboard

### US-5.1 — Show a locked leaderboard preview

**As a** user who hasn't unlocked ranking yet, **I want** to see the leaderboard
exists and what it takes to join, **so that** it's aspirational, not just invisible.

- [x] Done — Dashboard shows top-5 global preview via `getGlobalLeaderboard()`,
      visually greyed out with a progress bar toward the unlock threshold when
      `leaderboard_unlocked = false`

### US-5.2 — Full global leaderboard screen

**As an** unlocked user, **I want** to see the full global leaderboard, **so that**
I can see how I stack up against everyone.

- [ ] Not started — Dedicated screen paginating/scrolling `leaderboard_global`
      beyond the top-5 dashboard preview

### US-5.3 — Per-template/category leaderboard screen

**As an** unlocked user running a specific type of program, **I want** to see how I
rank against others doing the same kind of program, **so that** the comparison feels
fair and relevant, not buried under unrelated categories.

- [ ] Not started — Screen with a category picker, calling
      `getTemplateLeaderboard(category)` (already implemented in
      `leaderboardService.ts` — just needs a UI)

---

## Epic 6 — AI-assisted goal planning (premium)

### US-6.1 — Guided intake for a new goal

**As a** user with a vague goal, **I want** to answer a few structured questions,
**so that** the AI has enough context to build a realistic plan instead of guessing.

- [ ] Not started — Intake flow: goal description (free text) + structured questions
      (time budget per day/week, current skill/fitness level, hard constraints/dates)
- [ ] Not started — Save as an `ai_plan_requests` row with `status = 'pending'`

### US-6.2 — Generate an editable plan

**As a** user who completed the intake, **I want** the AI to draft a structured
multi-week plan into the app's normal template format, **so that** I get a real
usable program, not just text advice.

- [ ] Not started — LLM call using the intake answers, producing a plan shaped like
      `template_days` / `template_blocks` (reuse the same schema — AI output must
      conform to it, not invent a new structure)
- [ ] Not started — Writes a new `templates` row (`source = 'ai_generated'`) plus its
      days/blocks, links it via `ai_plan_requests.generated_template_id`, sets
      `status = 'completed'`
- [ ] Not started — User can edit any block before starting the program (AI drafts,
      human owns it — no auto-start without review)
- [ ] Not started — Gate this feature behind the premium tier (see Epic 7)

---

## Epic 7 — Freemium gating

### US-7.1 — Gate AI plan generation behind premium

**As a** business, **I want** AI-generated plans restricted to paying users, **so
that** the per-generation API cost is covered by revenue, not absorbed on every free
signup.

- [ ] Not started — Check user's premium status before allowing an
      `ai_plan_requests` submission (premium/subscription table not yet designed —
      needs its own schema addition)
- [ ] Not started — Free users can still manually build unlimited custom templates
      (Epic 3.3 stays free)

---

## Deferred — not in current scope, do not build yet

- Squads / accountability partners (any feature letting users see each other's
  proof, form groups, or compete privately with named friends)
- OS-level app-blocking / distraction lockout during timer sessions (needs
  Screen Time API / Android Usage Access — a separate, larger effort)
- Template sharing / public template marketplace

If a task in this file references something in this "Deferred" list, stop and confirm
before building — these were explicitly filed for a later phase.
