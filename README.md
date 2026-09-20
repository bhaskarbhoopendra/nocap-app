# Nocap

A proof-based consistency app. Not another checkbox habit tracker — you back up your
consistency with real proof (photo, timed focus session, or self-check), build a streak,
earn XP, and unlock your way onto a leaderboard.

This is the **first working slice**: anonymous onboarding (username + generated avatar),
a dynamic theme pulled live from Supabase, and a dashboard with a streak card and a
locked/unlocked leaderboard preview. The template/program builder, proof submission flow,
and AI goal-planning feature are the next slices — see **What's next** at the bottom.

## Stack

- React Native + TypeScript (Expo) — Android & iOS from one codebase
- Supabase — Postgres, anonymous auth, row-level security, realtime-ready

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In your project, open the **SQL Editor** and run the migration file at
   `supabase/migrations/0001_init.sql` (paste its full contents and run it). This creates
   every table, the leaderboard views, RLS policies, and seeds the default theme.
3. Go to **Authentication → Providers** and make sure **Anonymous Sign-Ins** is enabled
   (Supabase supports this natively — it's what lets people use the app with zero signup).
4. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.

## 2. Configure the app

```bash
cd nocap-app
cp .env.example .env
```

Edit `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Install & run

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `a` / `i` for an Android/iOS
emulator (same as before — see the earlier roadmap app's README for emulator setup details
if you need a refresher).

## What happens on first launch

1. The app silently signs the device in **anonymously** via Supabase — no form, no email.
2. A DB trigger auto-creates a `profiles` row with a placeholder username
   (`nocapper_xxxxxxxx`).
3. The app detects the placeholder username and shows the **onboarding screen**: pick an
   avatar (color/shape combo, no photo upload needed) and a real username.
4. From then on, the dashboard shows their streak, XP, and a leaderboard preview — visible
   but greyed out and locked until they hit **7-day streak OR 500 XP** (tunable in
   `src/services/leaderboardService.ts`).

## Project structure

```
nocap-app/
├── App.tsx                        entry point, session/theme gating
├── supabase/migrations/0001_init.sql   full DB schema, RLS, seed theme
├── src/
│   ├── lib/supabase.ts            Supabase client init
│   ├── types/database.ts          TS types mirroring the SQL schema
│   ├── services/
│   │   ├── authService.ts         anonymous sign-in, upgrade to real account
│   │   ├── themeService.ts        fetch active theme from DB
│   │   └── leaderboardService.ts  leaderboard queries + unlock logic
│   ├── hooks/SessionContext.tsx   app-wide auth/profile state
│   ├── theme/
│   │   ├── ThemeContext.tsx       app-wide dynamic theme state
│   │   └── avatarPresets.ts       generated-avatar color/shape options
│   ├── components/Avatar.tsx      renders an avatar from its seed
│   └── screens/
│       ├── OnboardingScreen.tsx   username + avatar picker
│       └── DashboardScreen.tsx    streak card + leaderboard preview
```

## Changing the theme without a rebuild

The whole point of the `themes` table: to change the app's colors, just update the active
row in Supabase — no code change, no app store resubmission.

```sql
update themes set tokens = jsonb_set(tokens, '{gradientStart}', '"#00e0c6"') where is_active = true;
```

Reopen the app and the new color is live. To add a whole new theme and switch to it:

```sql
insert into themes (name, is_active, tokens) values ('winter_drop', false, '{...}'::jsonb);
update themes set is_active = false where name != 'winter_drop';
update themes set is_active = true where name = 'winter_drop';
```

(The unique index on `is_active = true` means only one theme can be active at a time —
the second update above is required before the third will succeed.)

## What's next

These are designed into the schema already but not wired into the UI yet:

- **Template picker + custom builder** — browsing built-in templates (`templates` table,
  `source = 'builtin'`) and building your own flexible day/block structure.
- **Proof submission flow** — the actual photo capture / timer session / self-check UI
  that writes to `task_logs` and updates streak + XP on the profile and program.
- **AI goal-planning** — the guided intake → LLM-generated template flow, writing into
  `ai_plan_requests` and generating real `templates`/`template_days`/`template_blocks` rows.
- **Real account upgrade prompt** — triggering `upgradeToRealAccount()` in
  `authService.ts` right when `checkAndUnlockLeaderboard()` flips a user's status.
- **Per-template leaderboard screen** — `getTemplateLeaderboard()` is already built in
  `leaderboardService.ts`, just needs a screen and category picker.
