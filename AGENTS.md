<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Streamku client

Frontend only. All data comes from a separate Laravel API at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api/v1`). `.env*` is gitignored and no env file exists — create `.env.local` if your API runs elsewhere. (`CLAUDE.md` is just `@AGENTS.md` — keep guidance here only.)

## Commands

- `npm run dev` / `npm run build` — standard Next.js scripts
- `npm run lint` — flat-config ESLint; currently 0 errors / 26 warnings (react-hooks), don't add errors
- Typecheck is **not** a script: `npx tsc --noEmit`
- No tests and no CI. Verify with lint + typecheck + `npm run build`.
- Commits follow Conventional Commits (`feat:`, `fix:`, `refactor:`).

## Architecture

- App Router route groups: `(main)` public site, `(auth)` login/register, `(admin)` admin panel. Admin gating is **client-side only** in `app/(admin)/layout.tsx` (`user.is_admin` redirect) — there is no middleware/proxy.
- Backend calls go through two helpers, pick the right one:
  - Server components → `fetchApi` / `fetchAdminPage` from `lib/api.ts` (reads `token` cookie via `next/headers`)
  - Client components → `apiFetch` from `lib/apiClient.ts` (token resolved via the `getAuthTokenAction` server action because the cookie is httpOnly)
- Server actions live in `app/actions/` (`auth.ts`, `admin.ts`, `admin-content.ts` + `admin-content-media.ts` + `admin-content-embeds.ts`). Note `getAuthTokenAction` lives in `auth.ts`, not near `lib/apiClient.ts`.
- The root layout (`app/layout.tsx`) is an async server component: it fetches `/auth/me` and hydrates `AuthProvider` with `initialUser`. Auth-flow changes must account for both the server-side seed and client state.
- `fetchApi` forces `cache: 'no-store'` in development unless the caller passes an explicit `next`/`cache` option — don't be surprised by dev/prod caching differences.
- Auth is a Laravel Bearer token in an httpOnly cookie named `token`. Never touch it directly from client code — always through the helpers above.
- All external URLs come from `lib/config.ts` (`API_BASE_URL`, `tmdbImageUrl` for TMDB posters, `buildStreamUrl` for media streaming). Don't hardcode hosts.
- Video uploads are resumable tus uploads (`tus-js-client`) via `hooks/useTusUpload.ts` → `{API_BASE_URL}/admin/tus`, 50 MB chunks.
- Admin pages follow one pattern: async server page fetches the first page with `fetchAdminPage`, then renders a co-located client component (e.g. `MoviesClient`) that owns the table/pagination/mutations.

## UI stack quirks

- shadcn with `"style": "base-nova"` — primitives are **@base-ui/react**, NOT Radix. Add components with `npx shadcn add <name>` (aliases in `components.json`: `@/components`, `@/hooks`, `@/lib`).
- Tailwind v4, CSS-first config in `app/globals.css` — there is no `tailwind.config` file.
- Dark theme only: the `dark` class is hardcoded on `<html>` in `app/layout.tsx`; don't build light-mode variants.
- TanStack Query is provided globally in `providers/QueryProvider.tsx`; user state in `providers/AuthProvider.tsx`.
