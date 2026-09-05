# Streamku — Client

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

Frontend for **Streamku**, a movie & TV streaming catalog. Browse titles, watch with resumable playback, track progress, build a library, write reviews — plus a full admin panel for content management.

> Backend lives in [`../server`](../server). The client is frontend-only; every data call goes to the Laravel API.

## Features

| Area | What |
| ---- | ---- |
| Catalog | Home rows, movies / TV grids with genre filter, search, sort, pagination |
| Detail | Hero trailer, cast, backdrops, recommendations, seasons & episodes |
| Watch | Custom player (progress, subtitles, speed, PiP, theater, fullscreen), continue-watching, embed providers |
| Library | Watchlist, favorites, watch history, profile pages |
| Social | Ratings, reviews, threaded comments, moderation-safe forms |
| Auth | Login, register, settings (profile, password, preferences) |
| Admin | Dashboard analytics, content CRUD, TMDB import, season/episode editor, tus video uploads, genre/cast management, comment & review moderation |

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** (CSS-first config in `app/globals.css`, dark-only)
- **Base UI** primitives via shadcn `base-nova` style (`components.json`)
- **TanStack Query** (server-state) + **TanStack Table** (admin tables)
- **tus-js-client** resumable uploads (50 MB chunks)

## Prerequisites

- Node.js 20+
- A running Streamku API (default `http://localhost:8000/api/v1`) — see [`../server`](../server)

## Quickstart

```bash
npm install

# point at your API (optional if it runs on the default URL)
cp .env.example .env.local 2>/dev/null || echo 'NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1' > .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Base URL of the Laravel API |

## Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Start dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint (must stay 0 errors) |
| `npx tsc --noEmit` | Typecheck (no dedicated script) |

## Project structure

```
app/
  (main)/          # public site: home, movies, tv, genres, detail, watch, settings, profile
  (auth)/          # login, register
  (admin)/         # admin panel (client-side is_admin guard)
  actions/         # server actions (auth, admin content/media/embeds, comments, reviews)
  layout.tsx       # async root: seeds AuthProvider from /auth/me
components/
  ui/              # shadcn primitives + shared icons.tsx
  player/          # custom video player (index, ControlsBar, hooks/, utils/)
  media/           # catalog, detail, reviews, comments-section, season-viewer, hero-carousel
  admin/           # forms/*, title-editor/*, lists/*, moderation/*
  auth/            # AuthLayout, PasswordField
  layout/          # Navbar, Footer, dialogs
hooks/             # kebab-case client hooks (use-*.ts)
lib/               # *.utils.ts helpers + embed/, playback/ domains
providers/         # AuthProvider, QueryProvider
types/             # media.ts, social.ts (re-exported via index.ts)
```

## Backend calling convention

Two helpers, pick by context — auth is an httpOnly `token` cookie, never touched directly:

- **Server components** → `fetchApi` / `fetchAdminPage` from `lib/api.utils` (reads cookie via `next/headers`)
- **Client components** → `apiFetch` from `lib/api-client.utils` (token via `getAuthTokenAction` server action)

Admin list pages follow one pattern: async server page fetches page one with `fetchAdminPage`, then a co-located `*Client` component owns table, pagination, and mutations.

## Related docs

- [`../server`](../server) — API setup, endpoints, testing
- [`AGENTS.md`](AGENTS.md) — agent working rules for this repo
