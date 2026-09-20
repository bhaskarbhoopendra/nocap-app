# Nocap — Engineering Conventions

This file is the source of truth for **how** code gets written in this repo. `product.md`
is the source of truth for **what** to build; `userstories.md` for **what's done vs.
next**. Read those for feature context — this file is purely about code structure and
style, and applies to every change regardless of which feature it's for.

Enforcement: ESLint (`eslint-config-expo` + Prettier) catches syntax-level issues —
run `npm run lint` / `npm run typecheck` before considering any change finished. This
doc covers the structural conventions a linter can't check.

## Folder structure — where new code goes

```
src/
├── components/   Reusable, dumb UI pieces used by 2+ screens (Avatar, buttons, cards).
│                 No data fetching, no service calls. Props in, JSX out.
├── screens/      One top-level screen per file/folder. Owns its own data fetching
│                 (via hooks/services) and layout. If a screen grows complex sub-parts
│                 that aren't reused elsewhere, give it a folder:
│                 src/screens/ProgramDetail/index.tsx + BlockCard.tsx, not one 400-line file.
├── services/     One file per domain (authService, themeService, leaderboardService,
│                 programService, taskLogService...). Pure functions wrapping Supabase
│                 calls. Never import from screens/components — services are leaves.
├── hooks/        Cross-cutting React state (SessionContext-style providers) and any
│                 reusable custom hooks that aren't tied to one screen.
├── theme/        Theme context + design tokens + anything about the visual system
│                 (avatar presets, gradients).
├── types/        TypeScript types mirroring the DB schema (`database.ts`) and any
│                 shared domain types. Do not redeclare DB shapes inline in a
│                 screen/service — import from here.
└── lib/          Thin SDK/client initialization only (supabase.ts). Nothing else.
```

New feature domains (templates, proof submission, AI planning) slot into this same
layout — e.g. `src/services/templateService.ts`, `src/screens/TemplatePicker/`,
`src/screens/ProofSubmission/`. Don't invent a parallel structure (no `src/features/`,
no `src/modules/`) — this app stays layered, not feature-sharded, at its current size.

## Naming

- Components/screens: `PascalCase.tsx` (`DashboardScreen.tsx`, `Avatar.tsx`).
- Services/hooks/utils: `camelCase.ts` (`leaderboardService.ts`, `useSession` inside
  `SessionContext.tsx`).
- One default export per component/screen file; named exports for everything in
  `services/`, `types/`, `theme/` (no default exports there).
- Import via the `@/` alias (`@/services/authService`), never relative `../../..` paths.

## Component & screen patterns

- Screens read state via context hooks (`useTheme()`, `useSession()`) — never reach
  into `supabase` directly from a screen. Screens call `services/*`, services call
  Supabase.
- Guard on missing data with an early `return null` (or a loading/placeholder state),
  matching the existing style in `DashboardScreen.tsx` — don't add prop-drilled loading
  booleans through multiple component layers.
- Styling: NativeWind (`className`) is the styling layer as of the Stitch-design UI
  build-out — use Tailwind utility classes for layout, spacing, color, and typography,
  matching the token names declared in `tailwind.config.js` (which mirrors the Stitch
  "Soft Dark Neon" design system 1:1: `bg-surface-container`, `text-on-surface`,
  `text-primary`, `font-headline-md`, `rounded-xl`, `gap-space-sm`, etc.). Never use a
  raw hex color in `className` or inline `style` — add it to `tailwind.config.js` first
  if it's genuinely a new token. Reach for the RN `style` prop only for values NativeWind
  can't express: runtime-computed numbers (safe-area insets, animated values, SVG
  `stroke`/`viewBox` props) and gradients/blur (via `expo-linear-gradient` /
  `expo-blur`, since CSS `background: linear-gradient()` and `backdrop-filter: blur()`
  have no RN View equivalent). `StyleSheet.create` is legacy at this point (still used
  by pre-NativeWind screens like `DashboardScreen.tsx`/`OnboardingScreen.tsx`) — don't
  add new `StyleSheet.create` usage in new screens.
- **Known open question**: the dynamic DB-driven theme system (`ThemeContext`,
  `themes` table) predates NativeWind and currently has no wiring into it —
  NativeWind's colors are static values baked into `tailwind.config.js` at build time.
  Reconciling "palette changes are a DB update, not a code change" with NativeWind's
  compile-time classes is unsolved; don't invent an ad-hoc fix for it inside a single
  screen — it needs a real decision (e.g. CSS variables + `vars()` from NativeWind, or
  accepting static-only theming going forward) before any screen depends on it.
- No inline anonymous functions creating new component types on every render (e.g.
  don't define a component inside another component's render body).

## Service layer patterns

- Every service function talks to Supabase and returns typed data — never raw
  Supabase response objects.
- Error handling convention already established — **follow it, don't mix in
  exceptions-as-control-flow**:
  - Reads that have a sensible fallback (theme, profile, leaderboard rows): catch the
    error, `console.warn` with context, return a fallback value (`null`, `[]`, default
    tokens). See `themeService.ts`, `authService.getMyProfile`.
  - Writes/mutations where failure must block the caller (sign-in, profile update):
    throw the Supabase error, let the caller's try/catch decide the UX. See
    `authService.updateProfileSetup`.
- Never let a missing env var or bad config throw at module load time (see
  `src/lib/supabase.ts` — falls back to a placeholder + an `isSupabaseConfigured` flag
  instead of crashing the app tree). Any new SDK client init follows the same rule.

## TypeScript

- `strict` is on (`tsconfig.json`) — keep it on. No `any` unless annotated with a
  one-line comment explaining why it's unavoidable (e.g. a third-party type gap).
- DB row shapes live in `src/types/database.ts` and must stay in sync with
  `supabase/migrations/*.sql` — when a migration adds/changes a column, update the
  matching type in the same change.
- Run `npm run typecheck` before calling any change done.

## What "done" means for any new piece of work

1. `npm run typecheck` clean.
2. `npm run lint` clean (warnings included — fix or, if genuinely a false positive,
   suppress with a one-line inline comment explaining why, not a blanket rule change).
3. New DB columns/tables have a matching migration file under `supabase/migrations/`
   *and* a matching type update in `src/types/database.ts`.
4. No hardcoded colors, no relative `../` imports, no dead/commented-out code left in.
5. If it's a new service function, it follows the read-fallback vs. write-throw
   convention above — don't invent a third error-handling style.
