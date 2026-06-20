# Revia Admin Dashboard

Admin dashboard for the Revia platform, built with [Next.js](https://nextjs.org) (App Router), React 19, TypeScript, Tailwind CSS, and [shadcn/ui](https://ui.shadcn.com) components.

## Tech stack

- **Next.js 16** (App Router, Turbopack dev server)
- **React 19** / **TypeScript**
- **Tailwind CSS 4** + shadcn/ui (Radix UI primitives) for the design system
- **GSAP** for animation (theme transition effect)
- **Recharts** for dashboard charts
- **Sonner** for toast notifications

## Project structure

```
src/
  app/                 # Route segments (Next.js App Router)
    auth/              # login, forgot-password, otp-verification, reset-password
    dashboard/         # overview + charts
    accounts/          # admin/provider/customer account management
    categories/
    brands/
    subscriptions/
    payout/
    repair-requests/
    support/
    profile/
    layout.tsx         # root layout: fonts, ThemeProvider, Toaster
  components/          # feature components (tables, modals, dropdowns, skeletons)
    ui/                # shadcn/ui primitives (button, dialog, table, sidebar, etc.)
  contexts/
    theme-context.tsx  # light/dark/system theme provider
  services/            # one file per API resource (adminService, brandService, ...)
  lib/
    api.ts             # apiFetch() wrapper: auth header injection + error parsing
    utils.ts           # cn(), formatErrorMessage(), misc helpers
    validation.ts       # form validation helpers
  hooks/
    use-mobile.ts
```

### How a feature page works

Each route under `src/app/<feature>/page.tsx` follows the same pattern:
1. Calls a `src/services/<feature>Service.ts` function, which wraps `apiFetch` from `src/lib/api.ts`.
2. `apiFetch` resolves the base URL from `NEXT_PUBLIC_API_URL`, attaches the `Authorization: Bearer <accessToken>` header from `localStorage`, and throws a normalized `Error` on non-2xx responses.
3. The page renders a `*-table.tsx` / `*-card.tsx` component with a matching `*-skeleton.tsx` loading state, and action dropdowns (`*-actions-dropdown.tsx`) for row-level operations (ban/unban, edit, delete, etc.).
4. Create/update flows use modal dialogs (e.g. `create-admin-modal.tsx`, `create-provider-modal.tsx`, `create-category-dialog.tsx`).

### Navigation

Sidebar sections are defined in `src/components/app-sidebar.tsx`: Dashboard, Profile, Payout, Accounts, Categories, Brands, Subscriptions, Repair Requests, Support Tickets.

### Auth

Auth pages live under `src/app/auth/` (login, forgot-password, otp-verification, reset-password) and call `api.login`, `api.forgotPassword`, `api.verifyPasswordOtp`, `api.resetPassword` from `src/lib/api.ts`. On login, the access token is stored in `localStorage` under `accessToken` and reused by `apiFetch` for subsequent requests.

### Theming

`src/contexts/theme-context.tsx` provides light/dark/system theme support with SSR-safe defaults; `src/components/theme-transition.tsx` adds a GSAP-driven transition effect when the theme changes.

## Environment variables

Create a `.env` file in the project root:

```bash
NEXT_PUBLIC_API_URL=http://localhost:10001/api/v1/admin
```

This should point at the Revia backend's admin API base path.

## Getting started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. The dev server uses Turbopack and hot-reloads on file changes.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint     # ESLint
```

## Updating the project

- **Add a new page/feature**: create `src/app/<feature>/page.tsx`, a service in `src/services/<feature>Service.ts` (mirroring the pattern in `src/services/adminService.ts`), and add an entry to the `items` array in `src/components/app-sidebar.tsx` if it needs sidebar navigation.
- **Add a UI primitive**: this project uses shadcn/ui — add new primitives under `src/components/ui/` following the existing component conventions (see `components.json` for the configured aliases and base color).
- **Call a new backend endpoint**: add a method to the relevant `*Service.ts` file using `apiFetch<T>(endpoint, options)` from `src/lib/api.ts` — it already handles auth headers and error normalization, so individual services should stay thin.
- **Change the API base URL**: update `NEXT_PUBLIC_API_URL` in `.env` (restart the dev server after changing env vars).
