# Revia — AI-Powered Consumer Device Repair Platform

Revia is a digital ecosystem that streamlines the device repair lifecycle for both consumers and repair service providers in Egypt. It combines conversational AI diagnostics, a multi-criteria provider-matching engine, and predictive device-care maintenance with a multi-platform booking/tracking/management experience.

## The problem

Getting a phone, laptop, or other electronic device repaired today is slow, opaque, and trust-poor:

- **Diagnostic uncertainty** — most users can't tell whether a device fault is software, hardware, or accidental damage, and have no easy way to get a credible first opinion before paying for a diagnosis.
- **Trust deficit** — there's no transparent way to know whether a given repair shop or technician is reliable, fairly priced, or qualified for a specific device/issue.
- **Fragmented, disconnected experience** — booking, quoting, status updates, and payment for a repair typically happen over disconnected phone calls, walk-ins, and messaging apps, with no single place to track a request end-to-end.
- **Operational pain for providers** — repair shops lack tools for managing incoming requests, quoting, payouts, and customer communication in one place.
- **No preventive care** — once a device is fixed, there's no mechanism to flag at-risk devices before they fail again, so users keep cycling through repairs (or replace devices early), contributing to avoidable e-waste.

## The solution

Revia addresses each of these gaps with a dedicated module, all wired together through one backend:

| Problem | Revia module | How |
|---|---|---|
| Diagnostic uncertainty | **Revia AI Repair Assistant** | Conversational AI (Google Gemini) triages symptoms, gives safe DIY guidance when possible, and only escalates to a paid repair request when professional intervention is actually needed. |
| Trust deficit | **ReviaMatch AI** | A multi-criteria matching/ranking engine connects customers with verified providers based on category fit, proximity, rating, and repair-completion history — instead of a random/unranked listing. |
| Fragmented experience | **Customer + Provider platforms** | A single request flows through booking → matching → quoting/chat → payment → tracking → completion, visible to both sides in real time (Socket.IO chat, status updates). |
| Provider operations | **Provider (Brand) Dashboard** | Repair-request inbox, quoting, payouts, subscriptions, brand chat/support, and performance metrics in one place. |
| No preventive care | **ReviaCare** | Scheduled jobs analyze device/repair history and proactively remind customers about pickup and device care, aiming to extend device lifespan and reduce e-waste. |
| Lack of oversight | **Revia Insights (Admin Dashboard)** | Centralized governance: accounts, categories, brands, subscriptions, payouts, repair requests, and support tickets, with analytics across the whole platform. |

## Core concepts

- **Revia AI Repair Assistant** — conversational diagnostics (Google Gemini) that interprets user-described symptoms and offers preliminary troubleshooting/DIY guidance, or escalates to a professional repair request.
- **ReviaMatch AI** — a multi-criteria matchmaking engine (`backend/src/core/matching`) that ranks and connects customers with verified, nearby providers based on category, location, rating, and completed-repairs history.
- **ReviaCare** — predictive maintenance: scheduled reminders (pickup/care cron jobs) driven by device history, aimed at extending device longevity and reducing e-waste.
- **Revia Insights** — admin-side analytics and oversight across repair requests, providers, subscriptions, and payouts.

## Architecture

Four apps share one MongoDB-backed Express API:

| App | Path | Stack | Default port |
|---|---|---|---|
| Backend (API + Socket.IO) | `backend/` | Node.js, Express, TypeScript, MongoDB/Mongoose | `10001` |
| Admin Dashboard | `admin-frontend/` | Next.js 16, React 19, TypeScript, Tailwind, shadcn/ui | `3000` |
| Customer Web App | `customer-frontend/` | Next.js 16, React 19, TypeScript, Tailwind, Radix UI (en/ar) | `3001` |
| Provider (Brand) Dashboard | `provider-frontend/` | Next.js 16, React 19, TypeScript, Tailwind, Radix UI, next-intl (en/ar) | `3002` |

```
revia/
  backend/              Express API: customer (/api/v1), admin (/api/v1/admin),
                         provider (/api/v1/provider) routes + Kashier webhook + Socket.IO
  admin-frontend/        Internal dashboard: accounts, categories, brands,
                         subscriptions, payouts, repair requests, support
  customer-frontend/      Public-facing app: repair booking/tracking, devices,
                         subscriptions/offers, support chat, reels (ar default)
  provider-frontend/      Brand-facing app: repair requests, quoting, payouts,
                         brand chat/support, subscriptions (en default)
  docker-compose.yml     Orchestrates mongo + all four apps
  .env.example           Single env file consumed by docker-compose
  CREDENTIALS.md         Seeded test accounts for local/dev
  DOCKER.md              Docker quick-start
```

The backend is the single source of truth: each frontend talks to its own namespaced API base path (`/api/v1`, `/api/v1/admin`, `/api/v1/provider`) and to a shared Socket.IO server for realtime chat (customer support, brand chat).

## Tech stack in detail

### Backend (`backend/`)

- **Runtime/framework**: Node.js, Express 4, TypeScript
- **Database**: MongoDB via Mongoose — one model per collection (customer, provider, admin, brand, repairRequest, brandOffer, payment, subscription, reel, ...)
- **Realtime**: Socket.IO (JWT-authenticated handshake) for repair-request chat and brand chat
- **Auth**: JWT (`jsonwebtoken`) with separate signing keys per role — admin / provider / user / register (short-lived OTP/registration token)
- **Validation**: Joi schemas + a custom `validate` middleware
- **File/media handling**: Multer for uploads, Sharp for image processing, fluent-ffmpeg/ffmpeg-static for video (reels); storage backend is pluggable — local disk or AWS S3 (`STORAGE_PROVIDER`)
- **Payments**: Kashier gateway (hosted checkout + webhook reconciliation)
- **Scheduled jobs**: node-cron — subscription expiry, pickup reminders, device-care reminders (ReviaCare)
- **AI**: `@google/genai` (Gemini) for AI-assisted features such as repair-chat triage
- **i18n**: i18next for English/Arabic API response localization
- **Security/hardening**: helmet, hpp, express-mongo-sanitize
- **Logging**: winston
- **Process management**: PM2 in production
- **Matching engine**: `src/core/matching` — deterministic scoring/ranking of providers by category, geo-proximity, rating, and completed-repair count (ReviaMatch AI, productionized)
- **Module pattern**: each feature under `src/server/{api,admin_api,provider_api}/<feature>/` has a `*.router.ts`, `*.controller.ts`, `*.valid.ts` (Joi), and `index.ts`; cross-role business logic lives in `src/core/<feature>/`

### Admin Dashboard (`admin-frontend/`)

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS 4 + shadcn/ui (Radix UI primitives)
- GSAP for theme-transition animation, Recharts for dashboard charts, Sonner for toasts
- Pages: dashboard/overview, accounts (admin/provider/customer), categories, brands, subscriptions, payout, repair requests, support, profile
- API access via `apiFetch` (`src/lib/api.ts`) — attaches bearer token, normalizes errors

### Customer Web App (`customer-frontend/`)

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 + Radix UI primitives
- Axios with a silent token-refresh interceptor; socket.io-client for live support chat
- GSAP for animation, react-player for media (reels), react-markdown for chat/blog content
- Locale-prefixed routing (`[lang]` = `en`/`ar`, Arabic default — MVP focus is Egypt)
- Feature areas: devices, repairs (+ detail/tracking), profile, support chat, reels, payments/offers
- Vitest contract tests under `tests/contract/`

### Provider (Brand) Dashboard (`provider-frontend/`)

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 + Radix UI primitives, next-intl for i18n routing (en default, ar)
- Axios client scoped to `/api/v1/provider`; socket.io-client for brand chat/support
- Leaflet/react-leaflet for service-area maps, Lenis + GSAP for scroll/animation
- Pages: accounts, brand profile, brand chat, categories, payouts, reels, repair requests (+ detail), settings, subscription, support

### Revia AI Repair Assistant

An intelligent full-stack IT support and mobile device repair diagnostic bot. Bridges consumers experiencing device malfunctions and professional repair technicians via multimodal AI.

- **3-step diagnostic pipeline**: Onboarding → Troubleshooting → Resolution (DIY guidance or structured ticket escalation).
- **Multimodal**: image upload (Base64 inline data) for visual fault diagnosis; native voice input via `MediaRecorder`.
- **Retrieval & grounding**: RAG via `pgvector` over an internal manufacturer-aligned teardown database; iFixit & YouTube Data API v3 for repair guides/videos; Gemini's native `googleSearch` grounding as a fallback for specs not covered by RAG.
- **Safety guardrails**: refuses non-IT queries and halts gracefully on hazardous scenarios (e.g. swollen batteries, shattered glass).
- **Stack**: Google Gemini (`@google/genai`), Supabase/PostgreSQL with `pgvector`, iFixit REST API, YouTube Data API v3.
- **Run**: `npm install`, configure `.env` (`GEMINI_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), `npm run dev`.

### ReviaMatch AI

A standalone TypeScript library (`src/lib/matching.ts`) implementing the recommendation logic — takes a diagnostic ticket from the Revia AI Repair Assistant and ranks/connects the user with qualified, highly-rated providers. Wrapped in an interactive React testing environment (`src/App.tsx`) for simulating tickets and inspecting matches in real time.

- **Schemas**: diagnostic ticket JSON shape, provider profile JSON shape.

The production matching logic that actually ships in this monorepo lives in `backend/src/core/matching/` (a deterministic port of this prototype's algorithm) — see [`backend/README.md`](./backend/README.md#matching-engine).

## Getting started

### Option A — Docker (recommended, runs everything incl. MongoDB)

```bash
cp .env.example .env   # fill in real secrets
docker compose up --build
```

- Backend API → http://localhost:10001
- Admin frontend → http://localhost:3000
- Customer frontend → http://localhost:3001
- Provider frontend → http://localhost:3002

See `DOCKER.md` for other compose commands, and `CREDENTIALS.md` for seeded test accounts (admin/customer/provider logins).

### Option B — Run each app locally

Requires a running MongoDB instance. Each app has its own `.env` (see its README for the required variables) and is started independently:

```bash
cd backend && npm install && npm run dev              # http://localhost:10001
cd admin-frontend && npm install && npm run dev       # http://localhost:3000
cd customer-frontend && npm install && npm run dev    # http://localhost:3001
cd provider-frontend && npm install && npm run dev    # http://localhost:3002
```

## Shared concerns across apps

- **Auth**: JWT-based, one signing key per role (admin/provider/user), issued by the backend and stored client-side (localStorage + cookie, depending on the app — see each frontend's README for its exact auth flow).
- **Realtime**: a single Socket.IO server on the backend powers customer support chat and brand chat across both frontends.
- **i18n**: customer-frontend and provider-frontend both support English/Arabic (customer-frontend defaults to Arabic; provider-frontend defaults to English); admin-frontend is English-only. Backend API responses are localized via i18next (`en`/`ar`).
- **Payments**: Kashier gateway — frontends redirect to a Kashier-hosted checkout; the backend's webhook (`/api/v1/webhook/kashier/payment-webhook`) reconciles payment/subscription state.

## Per-app documentation

- [`backend/README.md`](./backend/README.md) — API structure, module pattern, matching engine, payments, background jobs, file uploads.
- [`admin-frontend/README.md`](./admin-frontend/README.md) — dashboard pages, services, theming.
- [`customer-frontend/README.md`](./customer-frontend/README.md) — locale routing, the backend "bridge" proxy, dashboard features.
- [`provider-frontend/README.md`](./provider-frontend/README.md) — next-intl routing, brand-scoped API client, realtime brand chat.

## Other root-level docs

- [`DOCKER.md`](./DOCKER.md) — Docker Compose quick-start and commands.
- [`CREDENTIALS.md`](./CREDENTIALS.md) — seeded test accounts and third-party credentials for local/dev.
