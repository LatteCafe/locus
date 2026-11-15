# Locus

Check in at a study spot, time your session, rate the place, and compete with
friends on hours studied. Launch market: University of Toronto, St. George.

Expo (React Native) + TypeScript + expo-router, with Supabase for auth,
database and storage.

## Setup

You need **Node 22 or newer** — Expo 58 refuses to start on anything older,
and the seed script cannot read TypeScript without it. This repo has a
`.nvmrc`, so inside the project folder:

```bash
nvm use
```

Run that in **every new terminal** you use for this project, or set it once
and for all with `nvm alias default 22`.

If you see `Unknown file extension ".mts"` or a complaint that Node is
outdated, this is why: that terminal is on an older Node. Check with
`node -v`.

Install dependencies:

```bash
npm install
```

Copy the environment template and fill in your Supabase keys (see
`SETUP.md` for exactly where to find them):

```bash
cp .env.example .env
```

## Running it

```bash
npx expo start
```

From Phase 2 onward the app needs native modules, so it runs in a
**development build** rather than Expo Go:

```bash
npx expo run:ios
npx expo run:android
```

## Database

Migrations live in `supabase/migrations/` and are applied with the Supabase
CLI:

```bash
npm run db:push
```

After changing the schema, regenerate the TypeScript types:

```bash
npm run db:types
```

## Checks

```bash
npm run check
```

Runs `tsc --noEmit` and ESLint. Both must pass before anything is considered
done.

## Project layout

| Path                   | What is in it                                                   |
| ---------------------- | --------------------------------------------------------------- |
| `app/`                 | Screens and navigation (expo-router)                            |
| `src/theme/`           | Colours, spacing, typography — all styling values               |
| `src/config/`          | Ranks, grades, rating weights, streaks, and other product rules |
| `src/components/`      | Shared UI components                                            |
| `src/lib/`             | Supabase client, auth helpers, generated DB types               |
| `supabase/migrations/` | Database schema and Row Level Security                          |
| `seed/`                | One-off scripts and hand-maintained place data                  |

See `AGENTS.md` for the conventions this codebase follows.
