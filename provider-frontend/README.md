# Revia Provider Frontend

Web app for repair-service providers (brands) on the Revia platform: managing repair requests, subscriptions, payouts, brand chat/support, and brand-level accounts. Built with [Next.js](https://nextjs.org) (App Router), React 19, TypeScript, Tailwind CSS, and Radix UI / shadcn-style components. Supports English (default) and Arabic via `next-intl`.

## Tech stack

- **Next.js 16** (App Router)
- **React 19** / **TypeScript**
- **Tailwind CSS 4** + Radix UI primitives
- **next-intl** for i18n routing/messages
- **Axios** for HTTP
- **socket.io-client** for realtime brand chat/support
- **Leaflet / react-leaflet** for maps (service area / location)
- **Lenis** for smooth scrolling, **GSAP** for animation
- **react-markdown** + **remark-gfm** for rendering chat/markdown content

## Project structure

```
src/
  middleware.ts                # next-intl locale middleware + dashboard/auth route guard
  navigation.ts                # next-intl locales (en, ar), Link/useRouter/redirect helpers
  i18n/request.ts              # next-intl request config
  messages/en.json, ar.json    # i18n message dictionaries
  app/
    [locale]/
      page.tsx                 # public landing page
      login/, signup/, forgot-password/, reset-password/
      dashboard/
        page.tsx                # overview
        accounts/                # brand staff/account management
        brand/                   # brand profile
        brand-chat/              # chat with platform/admin
        categories/
        payouts/
        reels/
        repair-requests/         # list + repair-requests/[id] detail
        settings/
        subscription/
        support/
  components/                  # BottomNav, app-sidebar, nav-*, auth forms, team-switcher, SmoothScroll
    media/, ui/                 # shadcn-style UI primitives, media components
  context/
    AuthContext.tsx             # session state: isAuthenticated, user, brand, login/logout
  hooks/
    use-mobile.ts, useSupport.ts
  services/                    # brandChatService, supportService, brandService, subscriptionService
  lib/
    api.ts                      # axios client (apiClient/api) scoped to /api/v1/provider, getMediaUrl()
    socket.ts                   # socket.io-client singleton (getSocket)
    geocoding.ts, utils.ts
  types/                        # account, brand, category, payout, reel, profile, subscription, repair, support, analytics, auth, brandChat
```

### Internationalization & routing

Locales are `en` (default) and `ar`, configured in `src/navigation.ts` via `next-intl`'s `createNavigation`. Use the exported `Link`, `useRouter`, `usePathname`, `redirect` from `src/navigation.ts` instead of Next's defaults so links stay locale-aware.

`src/middleware.ts` combines two concerns:
1. Runs `next-intl`'s `createMiddleware` for locale detection/prefixing.
2. Reads the `providerAccessToken` cookie to guard routes: unauthenticated users hitting `/dashboard/*` are redirected to `/{locale}/login`; authenticated users hitting `/login` or `/signup` are redirected to `/{locale}/dashboard`.

### Backend connectivity

`src/lib/api.ts` exports an axios instance (`apiClient`, aliased as `api`) with `baseURL` set to `${NEXT_PUBLIC_API_URL}/api/v1/provider` — i.e. all requests are automatically scoped under the provider API namespace. A request interceptor reads `providerAccessToken` from `localStorage` and attaches it as `Authorization: Bearer <token>`. `getMediaUrl(path)` resolves relative media paths returned by the API into absolute URLs against `NEXT_PUBLIC_API_URL`.

Some features have a dedicated service module under `src/services/` (`brandService`, `subscriptionService`, `supportService`, `brandChatService`); others (e.g. `repair-requests`, `accounts`, `payouts`) call `apiClient` directly from the page/component.

### Auth

`src/context/AuthContext.tsx` exposes `useAuth()`-style state (`isAuthenticated`, `user`, `brand`, `login`, `logout`, `isLoading`). `login(token)` stores the token in both `localStorage` (read by the axios interceptor) and a `providerAccessToken` cookie (read by `middleware.ts`), then fetches `/me` and `/brand` to populate the session. On mount, it re-verifies any stored token the same way.

### Realtime

`src/lib/socket.ts` provides `getSocket(token)`, a singleton `socket.io-client` connection authenticated with the provider's access token — used for brand chat / support features (`dashboard/brand-chat`, `dashboard/support`, `useSupport` hook).

## Environment variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:10001
```

Backend root; `src/lib/api.ts` appends `/api/v1/provider` for REST calls, `src/lib/socket.ts` connects directly to this root for sockets.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to a locale-prefixed path (`/en` by default).

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint     # ESLint
```

## Updating the project

- **Add a new dashboard feature**: create `src/app/[locale]/dashboard/<feature>/page.tsx`. Either add a service module in `src/services/<feature>Service.ts` (using `apiClient` from `src/lib/api.ts`) or call `apiClient` directly from the page, following the existing `repair-requests`/`payouts` pattern.
- **Add a sidebar entry**: update `src/components/app-sidebar.tsx` (mirrors the admin-frontend pattern).
- **Add translated copy**: add the same keys to both `src/messages/en.json` and `src/messages/ar.json`.
- **Add a new public/auth page**: create it under `src/app/[locale]/<route>/page.tsx`; use `Link`/`useRouter` from `src/navigation.ts` for locale-aware navigation.
- **Change the backend URL**: update `NEXT_PUBLIC_API_URL` in `.env` (restart the dev server after changing env vars).
