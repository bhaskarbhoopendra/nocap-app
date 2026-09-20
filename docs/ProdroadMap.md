# Nocap — Production Feature Roadmap

How to use this doc: this is the build plan, sequenced the way an experienced PM/tech
lead would actually stage a production launch — not just "what's the feature" but
"what has to exist before this can be built safely, and what breaks if we skip it."

The frontend (Stitch + Claude Code) is already built. This roadmap is written for the
**backend catch-up**, but every feature lists frontend work too, because almost every
screen needs *some* rewiring — swapping mock/static data for real Supabase calls,
handling loading/error/empty states that don't exist yet, etc.

Each feature has:
- **Backend** — schema, services, business logic, infra
- **Frontend** — what changes in the existing screens (not new UI, rewiring)
- **Why here** — why this feature is sequenced at this point, not earlier/later
- **Production risk if skipped** — what breaks in the real world, not just "missing feature"

Phases are ordered. Features within a phase can mostly happen in parallel. Do not skip
ahead to a later phase's feature before its dependencies in earlier phases are done —
the dependency chain is real, not just a suggestion.

---

## Phase 0 — Infrastructure foundations (before any feature work)

Nothing below this line should start until Phase 0 is done. This is the unglamorous
work that prevents a rebuild later.

### F0.1 — Environment separation (dev / staging / prod)
- **Backend**: Create separate Supabase projects for dev and production at minimum
  (staging optional at your stage). Never develop against the same project real users
  will eventually hit.
- **Frontend**: Environment-based config so the app points at the right Supabase
  project per build (`.env.development` / `.env.production`, already partially set up
  via `EXPO_PUBLIC_SUPABASE_URL`).
- **Why here**: Every feature after this touches the database. Fix this once, now,
  or you'll be migrating real user data later.
- **Production risk if skipped**: You will eventually wipe or corrupt real user data
  while testing a new feature against the same project they're using.

### F0.2 — Error monitoring & crash reporting
- **Backend**: Enable Supabase's built-in logging/observability for query errors.
- **Frontend**: Integrate Sentry (or equivalent) for React Native — crash reports,
  unhandled promise rejections, network failures.
- **Why here**: You need visibility from day one of real backend calls, not after
  users start reporting bugs you can't reproduce.
- **Production risk if skipped**: Silent failures. A user's proof submission fails
  and you have no idea it happened, let alone why.

### F0.3 — Analytics foundation
- **Backend**: n/a (client-side events, optionally logged to a `events` table or a
  third-party tool).
- **Frontend**: Integrate a product analytics SDK (PostHog is a solid free-tier pick)
  and instrument key events now: onboarding completed, proof submitted, streak
  broken, leaderboard unlocked, upgrade completed.
- **Why here**: Retroactively adding analytics means you have zero data on the exact
  period (early users) that matters most for figuring out what's working.
- **Production risk if skipped**: You'll be guessing why people churn instead of
  knowing.

### F0.4 — CI basics
- **Backend**: Store SQL migrations in version control (already doing this —
  `supabase/migrations/`), and a documented process for applying them
  (`supabase db push` or manual SQL editor run, consistently).
- **Frontend**: At minimum, a `tsc --noEmit` type-check step before merging changes,
  even if full CI/CD comes later.
- **Why here**: Once multiple features are in flight, an un-versioned schema change
  becomes very hard to debug.
- **Production risk if skipped**: Someone runs a migration once locally, forgets to
  save it, and production drifts from what's in the repo.

---

## Phase 1 — Identity & schema reconciliation

### F1.1 — Schema migration: dual scheduling model
- **Backend**: New migration adding `schedule_type` to `templates`
  (`'fixed_days'` / `'frequency'`), `template_id` direct FK + nullable
  `frequency_days_per_week` on `template_blocks`, updated RLS policy covering both
  attachment paths (via `template_day_id` or direct `template_id`).
- **Frontend**: No visible change — this just makes the existing Custom Builder UI
  (which already shows "Frequency: 5 Days/Wk") save to a real, correct schema instead
  of nothing.
- **Why here**: Every later feature that reads/writes templates depends on this shape
  being final first.
- **Production risk if skipped**: You build the whole template/program system on a
  schema that doesn't match half your own UI, then have to migrate real program data
  later.

### F1.2 — Profile screen: full field parity
- **Backend**: Add missing fields to `profiles` seen in the actual UI: `level`
  (derived or stored), `total_proofs_submitted` (or derive via count), streak-reminder
  preference, haptics/sound preference. Decide which are derived (computed from
  `task_logs`/`programs`) vs. stored directly.
- **Frontend**: Wire the real Profile screen (Level badge, 4 stat cards, Preferences
  toggles) to real data instead of the placeholder Dashboard we scaffolded earlier.
- **Why here**: Almost every other screen's header shows streak/XP — get the single
  source of truth right before building anything that reads it.
- **Production risk if skipped**: Stats shown in different screens silently drift out
  of sync with each other (e.g. header streak ≠ profile streak).

### F1.3 — Real account upgrade flow (email/password)
- **Backend**: Finish `upgradeToRealAccount()` — confirm same `auth.uid()` persists,
  add server-side validation (password strength, email format/uniqueness).
- **Frontend**: Wire the actual "Protect Your Streak" card (Profile screen) and the
  dedicated Log In screen to the real upgrade call. Handle error states (email taken,
  weak password) which the current mock UI has no path for.
- **Why here**: This is the single most important retention mechanic in the whole
  app — losing it to an unhandled error is the worst possible failure mode.
- **Production risk if skipped**: A user hits their unlock moment, tries to secure
  their streak, hits a silent failure, loses trust in the app permanently.

### F1.4 — Apple / Google OAuth
- **Backend**: Enable Apple and Google providers in Supabase Auth settings; Apple
  Sign-In is close to mandatory if you offer any other third-party login on iOS (App
  Store review requirement).
- **Frontend**: Wire the "Continue with Apple / Google" buttons already present in the
  Log In screen mock.
- **Why here**: Grouped with F1.3 since it's the same upgrade flow, different method.
- **Production risk if skipped**: If you ship Google Sign-In without Apple Sign-In on
  iOS, Apple can reject the app during review.

---

## Phase 2 — Template system (Program Library + Custom Builder)

### F2.1 — Seed built-in templates
- **Backend**: Insert real `templates`/`template_days`/`template_blocks` rows for the
  templates already designed in the UI mock: 14-Week Job Prep, Morning 75 Deep Work
  Sprint, 100-Day Calisthenics. Port the original job-prep roadmap content we built
  early on as the first one.
- **Frontend**: n/a — this makes the existing Program Library screen show real data
  where it currently shows hardcoded mock cards.
- **Why here**: Nothing in Program Library can be tested end-to-end without real rows
  to query.
- **Production risk if skipped**: Launch with zero usable templates for a brand-new
  user with no idea how to build their own yet.

### F2.2 — Program Library: browse, search, filter
- **Backend**: Query service for templates with category filter + text search
  (Postgres full-text search on `name`/`description` is enough at this scale).
- **Frontend**: Wire the search bar and category tabs (All Tracks / Career & Job Prep
  / Deep Work, etc.) to the real query instead of static UI.
- **Why here**: Depends on F2.1 having real data to search.
- **Production risk if skipped**: Search bar that returns nothing, or nothing
  filterable — looks broken even though it's "just UI."

### F2.3 — Start a program from a template
- **Backend**: `programs` insert (already designed) + validation (can't start the same
  template twice while another instance is active, unless that's actually desired —
  decide explicitly).
- **Frontend**: Wire "Clone Track" / "Preview" → "Start" actions.
- **Why here**: This is the actual conversion moment from browsing to using the app.
- **Production risk if skipped**: Users can look but never actually start anything.

### F2.4 — Custom Builder: dual-mode save
- **Backend**: Save logic branching on `schedule_type` (F1.1) — frequency blocks
  attach directly to the template, fixed-day blocks attach through `template_days`.
- **Frontend**: Wire "Append Block to Program" and the final "save/publish template"
  action (not fully shown in the screenshots — confirm there's a final save step
  beyond appending individual blocks).
- **Why here**: Depends on F1.1's schema being live.
- **Production risk if skipped**: Users can design a custom routine that visually
  looks saved but silently isn't persisted.

### F2.5 — AI Plan Generator (Pro tier)
- **Backend**: Guided intake storage (`ai_plan_requests`), LLM call producing a plan
  shaped exactly like `template_days`/`template_blocks`, written as a new
  `ai_generated` template. Needs a premium-tier check (Phase 6) before this ships for
  real — build it gated behind a temporary "always allow" flag until billing exists,
  or sequence billing first if you'd rather not build throwaway gating logic.
- **Frontend**: Wire the "Draft" button and input field already in the Program
  Library mock; handle the generation loading state and the review/edit step before
  a generated plan is confirmed.
- **Why here**: Technically could come later, but it's clearly a flagship feature in
  the actual UI (front and center in Program Library) — don't leave it dead for long.
- **Production risk if skipped**: A prominent "PRO TIER" button that does nothing is
  a worse look than not showing it at all.

---

## Phase 3 — Core loop: proof submission

This is the actual product. Nothing else matters if this isn't rock solid.

### F3.1 — Today screen: resolve real daily state
- **Backend**: Logic to compute "today's blocks" for an active program against
  `start_date` + schedule type (fixed-day index math, or frequency-based rolling
  schedule — frequency needs its own resolution logic: e.g. "5 days/week" needs a rule
  for *which* 5 days, decide now — user-chosen days vs. any 5 of 7, flexible).
- **Frontend**: Wire the "Daily Lock-in" card and Proof Protocol list to real data
  instead of the mocked "Day 14 of 90" state.
- **Why here**: Every proof-type feature below depends on this resolving correctly.
- **Production risk if skipped**: Nothing to submit proof against — the whole app is
  non-functional without this.

### F3.2 — Self-check proof submission
- **Backend**: Simple `task_logs` insert, `status = 'completed'`.
- **Frontend**: Wire the existing self-check confirmation UI.
- **Why here**: Build the simplest proof type first to validate the whole
  submission → streak/XP update pipeline before tackling camera/timer complexity.
- **Production risk if skipped**: n/a — but skipping this to start with photo/timer
  is the wrong build order; you'll debug the pipeline and the camera at the same time.

### F3.3 — Streak & XP update engine
- **Backend**: Central function (Postgres function or edge function — a Postgres
  function triggered on `task_logs` insert is cleanest) that updates
  `programs.current_streak/total_xp` and rolls up to `profiles`. **Decisions needed
  now, not later**: exact XP per proof type, whether streak requires all blocks done
  or just one, how streak multipliers (spotted in the UI) factor in if you're building
  those for real.
- **Frontend**: Reflect updated streak/XP immediately after submission (optimistic UI
  update, don't wait for a full refetch).
- **Why here**: Every proof type after F3.2 depends on this being correct — build and
  test it against the simplest case first.
- **Production risk if skipped**: Incorrect XP/streak math is the kind of bug users
  notice immediately and lose trust over fast.

### F3.4 — Photo proof submission + Storage
- **Backend**: Supabase Storage bucket + RLS policies (private by default, per
  earlier decision). Anti-cheat requirements visible in your own UI ("No gallery
  uploads," "Anti-Spoof ON," "EXIF metadata + live camera capture") need real
  enforcement: force camera capture via `expo-camera` (not `expo-image-picker`'s
  gallery option), optionally verify EXIF creation timestamp is recent server-side.
- **Frontend**: Wire "SNAP PROOF" to real camera capture + upload with a progress
  state (uploads aren't instant on real networks).
- **Why here**: Most complex proof type — build after the pipeline is proven via F3.2.
- **Production risk if skipped**: Your UI actively advertises anti-cheat claims
  ("Anti-Spoof ON") that would be **false advertising** if not actually enforced —
  fix this before real users see that copy.

### F3.5 — Timer/focus proof submission
- **Backend**: `task_logs` write on both full completion and early exit, per our
  earlier decision (honest logging, supportive messaging, no shame state).
- **Frontend**: Live countdown UI + `AppState` listener to detect backgrounding, and
  the supportive early-exit message already designed.
- **Why here**: Needs F3.3's XP engine finalized, including the still-open question
  of partial XP on early exit.
- **Production risk if skipped**: The "Zero tab switching" claim in your Deep Work
  template description is, again, currently just copy — needs real enforcement.

### F3.6 — Task expiry windows
- **Backend**: Decide and implement: what actually happens when a task's window
  expires unsubmitted — does it count as a missed proof (streak risk) or just
  disappear? This is a real mechanic decision, not just a countdown timer.
- **Frontend**: Wire the live countdown ("Expires in 6h 40m") to a real deadline
  instead of a static mock number.
- **Why here**: This was flagged as UI-only earlier — decide now whether it's a real
  mechanic before building more features that assume tasks are always available.

---

## Phase 4 — Progression & competition

### F4.1 — Leaderboard: real queries
- **Backend**: `leaderboard_global` / `leaderboard_by_template` views already exist —
  confirm they perform well once real data volume exists (add indexes on
  `current_streak`, `total_xp` if query plans need it).
- **Frontend**: Wire the Ranks screen (Global Standings / per-track tabs) to real
  data, replacing the mocked `neo_runner`/`dev_marathon` rows.
- **Why here**: Needs F3.3's XP/streak engine live and producing real numbers first.

### F4.2 — Leaderboard unlock flow
- **Backend**: `checkAndUnlockLeaderboard()` (already stubbed) wired to fire after
  every `task_logs` insert via F3.3's engine.
- **Frontend**: Wire the eligibility progress card and the locked/pending row at the
  bottom of the leaderboard.
- **Why here**: Depends on F4.1 and F3.3.

### F4.3 — Badges / titles (decide scope first)
- **Backend**: If building for real: a `badges` table + rules engine (streak
  thresholds, proof-count thresholds, etc.) computing which badges a user has earned.
- **Frontend**: Wire badge display on leaderboard rows.
- **Why here**: Nice-to-have, sequenced after the core progression system works, not
  before. Confirm scope before building — this was flagged as "spotted, not decided."

### F4.4 — Streak multipliers (decide scope first)
- **Backend**: If building for real: add a multiplier field to `templates`, factor it
  into the XP engine from F3.3.
- **Frontend**: Display multiplier badges on template cards (already in the mock UI).
- **Why here**: Same as F4.3 — confirm this is a real mechanic, not just a visual,
  before wiring it into the XP math.

---

## Phase 5 — Retention & engagement

### F5.1 — Push notifications: streak reminders
- **Backend**: Device push token registration table, a scheduled job (Supabase Edge
  Function + `pg_cron`, or a simpler client-scheduled local notification for v1) that
  checks who hasn't logged proof today as their reminder time approaches.
- **Frontend**: Wire the "Streak Reminders — gentle nudge at 8:00 PM" toggle to a
  real, user-adjustable time, not a hardcoded one.
- **Why here**: This is a genuine retention lever — sequence early in production
  hardening, not as an afterthought.

### F5.2 — Haptics & sound
- **Backend**: n/a
- **Frontend**: Wire `expo-haptics` to proof submission success, respecting the
  Preferences toggle already in the UI.

### F5.3 — Per-user theme selection
- **Backend**: Decide: is this actually multiple theme rows a user can pick between
  (extends the existing `themes` table with a `user_theme_preference` on `profiles`),
  or does "Soft Dark Neon (Active)" just mean there's currently only one theme and the
  toggle is future-proofing? Resolve before building more themes.
- **Frontend**: Wire the Preferences theme selector once the above is decided.

---

## Phase 6 — Monetization

### F6.1 — Subscription infrastructure
- **Backend**: This needs real thought, not just a boolean flag. **Apple requires
  in-app purchase (StoreKit) for any digital subscription consumed inside an iOS
  app** — you cannot legally route this through plain Stripe checkout inside the app.
  The standard, much-less-painful path here is **RevenueCat**, which wraps both
  Apple's StoreKit and Google Play Billing behind one API and syncs entitlement
  status into your own backend via webhooks.
- **Frontend**: Paywall screen (not yet designed in your mocks) gating AI Plan
  Generator and premium templates/analytics.
- **Why here**: Sequenced after the core loop and progression system are solid — you
  need something worth paying for before building the paywall around it.
- **Production risk if skipped**: Building your own subscription/receipt-validation
  system from scratch is a well-known time sink and a common source of App Store
  rejections if done wrong.

### F6.2 — Feature gating logic
- **Backend**: Central entitlement check (is this user premium?) used by F2.5 (AI
  plans) and any premium templates.
- **Frontend**: Locked-state UI for premium features when accessed by free users.

---

## Phase 7 — Production hardening & compliance

Do this **before** any public launch, not after.

### F7.1 — Privacy policy & data handling
- **Backend**: Account deletion flow (a legal requirement in most jurisdictions —
  GDPR/CCPA) that actually removes/anonymizes `profiles`, `task_logs`, and Storage
  photos, not just the auth row.
- **Frontend**: Settings → Delete Account flow (not yet in the mocks — needs adding).
- **Production risk if skipped**: App Store/Play Store rejection, or real legal
  exposure once you have real users' photos and personal data stored.

### F7.2 — Rate limiting & abuse prevention
- **Backend**: Basic abuse guards — rate-limit `task_logs` inserts (stop someone
  scripting fake streak progress), Storage upload size/type limits.
- **Why here**: Your entire value proposition is "proof you can trust" — an
  un-rate-limited API undermines that promise directly.

### F7.3 — App Store / Play Store submission prep
- **Frontend/Ops**: Privacy nutrition labels (Apple requires disclosing exactly what
  data — camera, anonymous ID, etc. — you collect and why), age rating, screenshots,
  app icon, TestFlight/internal testing round before public release.

### F7.4 — Load & performance check
- **Backend**: Sanity-check query performance on the leaderboard views and
  today's-tasks resolution logic under realistic data volume before public launch —
  cheap to check now, expensive to discover in production.

---

## Suggested milestone cutoffs

If you want checkpoints rather than building all of this in one continuous push:

- **Milestone A — "Backend-complete alpha"**: Phases 0–3. The core loop works
  end-to-end with real data, for you and a handful of testers, no payments, no push
  notifications yet.
- **Milestone B — "Closed beta"**: add Phase 4–5. Leaderboard and retention features
  live, still no monetization — good point to invite a wider test group.
- **Milestone C — "Public launch-ready"**: add Phase 6–7. Monetization and every
  compliance/hardening item done. This is the actual "submit to App Store" line.

---

## Open decisions this doc surfaces (resolve before the relevant phase starts)

- Exact XP values per proof type, and partial-XP rules for early timer exit (F3.3)
- Whether a day's streak requires all blocks done or just one (F3.3)
- What "frequency: 5 days/week" actually enforces — user-chosen days vs. any 5 of 7
  (F3.1)
- What happens when a task's expiry window passes unsubmitted (F3.6)
- Whether badges and streak multipliers are real mechanics or UI polish to simplify
  away (F4.3, F4.4)
- Whether per-user theme selection needs more than one real theme built (F5.3)