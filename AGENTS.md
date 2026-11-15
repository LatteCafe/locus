This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

---

# Locus project conventions

Locus is a study-spot app for U of T St. George students: check in at a spot,
time the session, rate the place, compete with friends on hours studied.

## Where things live

- `app/` — expo-router routes only. Route groups: `(auth)`, `(onboarding)`,
  `(tabs)`, `settings/`. `app/_auth-gate.tsx` does all the redirecting based on
  session and onboarding state; screens never guard themselves.
- `src/theme/` — every colour, spacing value and text style. Screens must not
  hardcode colours or font sizes, and must not set their own background.
- `src/config/` — all tunable product rules and copy: rank names and
  thresholds, personality types, grade scale, rating attributes and weights,
  pomodoro and streak settings, recommendation formula, schools. Change copy
  and numbers here, never in a screen.
- `src/components/` — shared UI. Use `Text` rather than React Native's, so
  type styles stay in the theme.
- `src/lib/` — Supabase client, auth helpers, generated database types.
- `supabase/migrations/` — timestamped SQL. Never edit an applied migration;
  add a new one.

## Rules that matter

- **Timezone**: every week and month boundary is America/Toronto, and weeks
  start Monday 00:00. Use the `app.week_start` / `app.month_start` SQL helpers.
- **The timer is timestamps, never a counter.** Elapsed time is always derived
  from `started_at`, `paused_seconds` and `paused_at`, so it survives the app
  being killed.
- **Derived data stays derived.** Hours, ranks, streaks and leaderboards are
  computed from `sessions` in SQL views and functions. Do not store them.
- **RLS on every table.** Users write only their own rows. A friend sees your
  sessions only while your `location_sharing` is on. Leaderboards expose hours
  and streaks, never places.
- **Never block a check-in on GPS.** Record `checkin_distance_m` and surface
  outliers in `admin_suspicious_weeks` for manual review.
- **Scoring formula lives in TypeScript** (`src/config/ratings.ts`). Public
  place scores are computed on the client from the aggregated attributes in
  the `place_attribute_stats` view, so one formula is the source of truth.

## Checks before calling anything done

```
npm run check      # tsc --noEmit, then eslint
```

Regenerate database types after a migration: `npm run db:types`.
