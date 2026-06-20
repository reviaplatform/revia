# Revia Customer Frontend

Customer-facing web app for the Revia platform (device repair requests, subscriptions/offers, support chat). Built with [Next.js](https://nextjs.org) (App Router), React 19, TypeScript, Tailwind CSS, and Radix UI / shadcn-style components. Supports English and Arabic (Arabic is the default locale — MVP focus is Egypt).

## Tech stack

- **Next.js 16** (App Router)
- **React 19** / **TypeScript**
- **Tailwind CSS 4** + Radix UI primitives
- **Axios** for HTTP, with a token-refresh interceptor
- **socket.io-client** for realtime support chat
- **GSAP** for animation, **react-player** for media, **react-markdown** for rendering chat/blog content
- **Vitest** for contract tests (`tests/contract/`)

## Project structure

```
src/
  app/
    [lang]/                    # locale-prefixed routes ("en" | "ar")
      (landing)/page.tsx       # marketing landing page
      dashboard/               # authenticated area (layout.tsx guards via AuthContext)
        page.tsx, devices/, profile/, reels/, repairs/, repairs/[id]/, support/
      blog/[slug]/page.tsx
      contact/page.tsx
      knowledge-hub/page.tsx
      payment/status/page.tsx
      privacy/page.tsx
      [...catchAll]/page.tsx   # 404 fallback inside the locale segment
    api/[...path]/route.ts     # generic backend proxy ("the bridge", see below)
    robots.ts
  components/                  # auth/, common/, contact/, dashboard/, landing/, layout/, legal/, media/, ui/
  context/
    AuthContext.tsx            # session state, login/logout, auth modal
    SidebarContext.tsx
  hooks/                       # useDevices, useRepairs, useProfile, useSupport, useLocation, useSocket
  lib/
    api/
      client.ts                # axios instance + silent token-refresh interceptor
      auth.ts, profile.ts, devices.ts, repairs.ts, reels.ts, chat.ts, offers.ts, support.ts, payments.ts, category.ts
      types.ts                 # shared API/domain types
    utils.ts, device-data.ts
  locales/en/, locales/ar/      # i18n dictionaries (JSON)
  i18n.ts                      # getDictionary(locale) loader
  proxy.ts                      # Next.js middleware: locale redirect + dashboard route guard
tests/contract/                 # Vitest contract tests for API response shapes
```

### Internationalization & routing

Every page lives under `src/app/[lang]/...`, where `lang` is `en` or `ar`. `src/proxy.ts` is registered as Next.js middleware: it redirects locale-less paths to `/${defaultLocale}` (`ar` by default), and protects `/dashboard` routes by checking for a `refreshToken` cookie (redirecting to the locale root with `?auth=required`, or returning a JSON 401 for API-style requests).

### Backend connectivity — the "bridge"

There are **two** paths to the backend, both driven by `NEXT_PUBLIC_API_URL`:

1. **`src/app/api/[...path]/route.ts`** — a catch-all Next.js Route Handler that forwards any `/api/*` request to `${NEXT_PUBLIC_API_URL}/api/v1/...` using axios, with fallback retries (`/api/v1/...` → `/api/...` → `/...`) and Set-Cookie sanitization for local dev. Useful when the browser should call a same-origin path and let the server-side route do the cross-origin call.
2. **`src/lib/api/client.ts`** — a standalone axios instance (`apiClient`) pointed directly at `${NEXT_PUBLIC_API_URL}/api/v1`, used by the `src/lib/api/*.ts` service modules (`auth.ts`, `devices.ts`, `repairs.ts`, etc.). It attaches the `Authorization: Bearer <accessToken>` header, and on a `401`/expired-token response it transparently calls `/auth/refresh` with the stored `refreshToken`, retries the original request, and notifies subscribers via `onSessionUpdate`.

### Auth

`src/context/AuthContext.tsx` wraps the app and exposes `useAuth()` (session state, `setSession`, `logout`, and the auth modal's open/close/step state). On `setSession`, the access token is pushed into the axios client (`setAccessToken`) and the refresh token is saved to both `localStorage` and a cookie (the cookie is what `proxy.ts` middleware checks for route protection). On mount, it calls `getProfile()` to silently verify/restore a session from a stored refresh token.

### Realtime

`src/hooks/useSocket.ts` opens a `socket.io-client` connection to the backend (auth via the stored access token) — used for live support chat updates under `dashboard/support`.

### Feature areas (dashboard)

- **Devices** (`dashboard/devices`, `useDevices`, `lib/api/devices.ts`)
- **Repairs** (`dashboard/repairs`, `dashboard/repairs/[id]`, `useRepairs`, `lib/api/repairs.ts`)
- **Profile** (`dashboard/profile`, `useProfile`, `lib/api/profile.ts`)
- **Support chat** (`dashboard/support`, `useSupport`, `lib/api/support.ts`, `useSocket`)
- **Reels** (`dashboard/reels`, `lib/api/reels.ts`) — short-form video content, rendered with `react-player`
- **Payments / offers** (`payment/status`, `lib/api/payments.ts`, `lib/api/offers.ts`)

## Environment variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:10001
```

Points at the Revia backend root (both the API bridge route and the axios client append `/api/v1/...` themselves).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/ar` (default locale) unless your path already includes `/en` or `/ar`.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint     # ESLint
npm run test     # Vitest contract tests (tests/contract/)
```

## Updating the project

- **Add a new dashboard feature**: create `src/app/[lang]/dashboard/<feature>/page.tsx`, a service module in `src/lib/api/<feature>.ts` (using `apiClient` from `src/lib/api/client.ts`), and a `use<Feature>.ts` hook in `src/hooks/` if it needs shared state/fetching logic.
- **Add a new public page**: create `src/app/[lang]/<route>/page.tsx`; it's automatically locale-aware once placed under `[lang]`.
- **Add translated copy**: add keys to both `src/locales/en/*.json` and `src/locales/ar/*.json`, and load them via `getDictionary` (`src/i18n.ts`) in server components, or via existing locale context in client components.
- **Add an API contract test**: add a `*.test.ts` file under `tests/contract/`, asserting the shape of types from `src/lib/api/types.ts`.
- **Change the backend URL**: update `NEXT_PUBLIC_API_URL` in `.env` (restart the dev server after changing env vars) — this affects both the `/api/*` bridge route and the direct axios client.
