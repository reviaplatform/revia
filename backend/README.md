# Revia Backend

Express + TypeScript + MongoDB (Mongoose) API powering the Revia device-repair platform. Serves three frontends — customer, provider (brand), and admin — from a single process, plus a Socket.IO server for realtime chat and a matching engine that pairs repair requests with providers.

## Tech stack

- **Node.js / Express 4** / **TypeScript**
- **MongoDB** via **Mongoose**
- **Socket.IO** for realtime chat (customer ↔ provider, brand chat)
- **JWT** (`jsonwebtoken`) for auth, separate signing keys per role (admin / provider / user / register)
- **Joi** + a custom `validate` middleware for request validation
- **Multer** + **Sharp** / **fluent-ffmpeg** for file/image/video upload processing
- **AWS S3** (`@aws-sdk/client-s3`) or local disk storage (`STORAGE_PROVIDER` env var)
- **Kashier** payment gateway integration (checkout + webhook)
- **node-cron** for scheduled jobs (subscription expiry, pickup/care reminders)
- **i18next** for `en`/`ar` API response localization
- **winston** for logging, **helmet** / **hpp** / **express-mongo-sanitize** for security hardening
- **@google/genai** (Gemini) — used by AI-assisted features (e.g. repair-chat triage)
- **PM2** for production process management

## Project structure

```
src/
  index.ts                  # entrypoint: initDB() then createServer()
  config/
    env.ts                  # typed process.env access (Config object)
    init.ts, dir.ts
  database/
    init.ts                 # Mongoose connection
    models/                 # one file per collection (customer, provider, admin, brand,
                             # repairRequest, brandOffer, payment, subscription, reel, ...)
    seed.ts                 # `npm run seed`
  core/                     # domain/business logic, framework-agnostic where possible
    auth/                   # JWTAuthService (sign/verify per role)
    account/, brand/, brandChat/, brandOffer/, brandReview/
    category/, chatSession/, device/, inspection/
    matching/                # provider-matching engine (geo + category + rating)
    payment/, payout/, reel/, repairRequest/, subscription/, support/
    analytics/, adminAnalytics/
    errors/                  # ApiError
    shared/, types/, utils/
  server/
    index.ts                 # createServer(): express app, middleware, sockets, cron, listen
    websocket.ts              # Socket.IO JWT auth + event handlers
    middleware/                # isAuth, isBanned, validate, multer, imageProcessing,
                                # cors, helmet, hpp, dataSanitize, securityHeader, logger, error, 404, language
    api/                      # customer-facing routes  -> mounted at /api/v1
      auth/, user/, category/, device/, repairRequest/, brandReview/, reel/, support/
    admin_api/                # admin routes            -> mounted at /api/v1/admin
      auth/, account/, user/, category/, brand/, repairRequest/, payout/, support/,
      subscription/, subscriptionConfig/, analytics/
    provider_api/             # provider/brand routes   -> mounted at /api/v1/provider
      auth/, account/, user/, category/, brand/, branch/, repairRequest/, payout/,
      reel/, support/, subscription/, brandChat/, analytics/
    webhook/                  # Kashier payment webhook -> mounted at /api/v1
    utils/                    # response, i18n, rateLimit, validate, errors
  cron/                      # expireSubscriptions, pickupReminder, careReminder
  scripts/                   # gen-test-token, load-test, matching-verification (ts-node CLI scripts)
  log/                       # winston logger
docs/                        # Postman collections for User / Provider / Admin APIs
locales/                     # i18next translation files (en, ar)
```

### Request flow / module pattern

Each route group under `src/server/{api,admin_api,provider_api}/<feature>/` follows the same layout:

- `<feature>.router.ts` — Express `Router`, wires middleware (`isAuth`, `userIsBanned`, `validateBody(schema)`, `multer`) to controller functions.
- `<feature>.controller.ts` — request/response glue: reads `req`, calls into `src/core/<feature>` or directly into a Mongoose model, sends a response via `src/server/utils/response.ts`.
- `<feature>.valid.ts` — Joi schemas used by `validateBody`.
- `index.ts` — mounts the router on its path prefix (e.g. `app.use('/repair-requests', router)`), then `admin_api/index.ts` / `provider_api/index.ts` / `api/index.ts` compose all features and mount the whole group on `/api/v1/admin`, `/api/v1/provider`, `/api/v1` respectively (see `src/server/index.ts`).

Business logic that's reused across roles (e.g. the provider-matching algorithm, JWT signing) lives in `src/core/` rather than in a specific API group's controller.

### Auth

`src/core/auth` (`JWTAuthService`) signs/verifies four separate token types, each with its own secret + expiry env var: `ADMIN_ACCESS_TOKEN_KEY`, `PROVIDER_ACCESS_TOKEN_KEY`, `USER_ACCESS_TOKEN_KEY` (+ `USER_REFRESH_TOKEN_KEY` for refresh), and `REGISTER_ACCESS_TOKEN_KEY` (short-lived, used mid-registration/OTP flow). `src/server/middleware/isAuth.ts` exposes role-specific guards (customer/admin/provider) that decode the bearer token, attach the resolved document (`req.user` / `req.admin` / `req.provider` + `req.brand`) to the request, and throw `ApiError.invalidAccessToken()` on failure. `isBanned` middleware additionally blocks banned customers/providers post-auth.

### Realtime

`src/server/websocket.ts` runs a Socket.IO server attached to the same HTTP server. A handshake-level middleware authenticates the socket by trying the user JWT, then the provider JWT, against the bearer token in `socket.handshake.auth.token` (or `query.token`), attaching `socket.data.customer` / `socket.data.provider`. Used for repair-request chat (`repairRequest.socket.ts`) and brand chat.

### Matching engine

`src/core/matching/index.ts` is a deterministic port of a separate matching-engine project: given a repair request's category/location and a set of providers (with branches, categories, tags, rating, completed-repairs count), it scores and ranks providers to decide who receives an offer opportunity. `src/scripts/matching-verification.ts` is a standalone script to sanity-check the algorithm against fixtures.

### Payments

Kashier is the payment gateway. The frontend redirects to a Kashier-hosted checkout; `src/server/webhook/webhook.route.ts` exposes `POST /api/v1/webhook/kashier/payment-webhook`, handled by `webhook.controller.ts`, which verifies the payload and updates the relevant `payment`/`repairRequest`/`subscription` records.

### Background jobs

Started in `src/server/index.ts` on boot (`src/cron/`):
- `expireSubscriptions` — expires brand subscriptions past their period.
- `pickupReminder` — reminds customers to pick up repaired devices.
- `careReminder` — periodic device-care notifications.

### File uploads & media

`src/server/middleware/multer.ts` handles multipart uploads (e.g. repair-request attachments, reels). `imageProcessing.ts` resizes/optimizes images with `sharp` before storage; video (reels) processing uses `fluent-ffmpeg`/`ffmpeg-static`. Storage backend is selected by `STORAGE_PROVIDER` (`local` writes to `/uploads`, served statically by Express; `s3` uploads to the bucket configured by the `S3_*` env vars).

## Environment variables

See `.env` for the full list (do not commit real secrets). Key groups:

- `PORT`, `NODE_ENV`, `MONGODB_URI`
- `ADMIN_ACCESS_TOKEN_KEY` / `_EXP`, `PROVIDER_ACCESS_TOKEN_KEY` / `_EXP`, `USER_ACCESS_TOKEN_KEY` / `_EXP`, `USER_REFRESH_TOKEN_KEY` / `_EXP`, `REGISTER_ACCESS_TOKEN_KEY` / `_EXP`
- `EMAIL_SENDER`, `EMAIL_SENDER_NAME`, `EMAIL_SENDER_PASSWORD` (nodemailer)
- `SMS_ACCESS_TOKEN`
- `STORAGE_PROVIDER` (`local` | `s3`), `S3_BUCKET_NAME`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `DOMAIN` — public base URL (used in emails/links)
- `KASHIER_MERCHANT_ID`, `KASHIER_API_KEY`, `KASHIER_SECRET_KEY`
- `GEMINI_API_KEY` — Google Gemini API key for AI-assisted features
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`

## Getting started

```bash
npm install
npm run dev
```

`npm run dev` runs `nodemon` → `ts-node -r tsconfig-paths/register ./src/index.ts`, watching `src/**/*.ts`. The server listens on `PORT` (default `10001` locally) and exposes:

- `/api/v1/*` — customer API
- `/api/v1/admin/*` — admin API
- `/api/v1/provider/*` — provider/brand API
- `/api/v1/webhook/*` — payment webhooks
- Socket.IO on the same HTTP server/port

Postman collections for all three APIs are in `docs/`.

### Other scripts

```bash
npm run build              # tsc + tsc-alias -> dist/
npm run start              # node dist/index.js
npm run start:prod         # pm2 start dist/index.js --name revia-backend
npm run seed               # ts-node ./src/database/seed.ts
npm run loadtest:token      # generate a JWT for load testing
npm run loadtest            # run the load test script
npm run matching:verify     # sanity-check the matching engine
```

## Updating the project

- **Add a new endpoint to an existing feature**: add a handler to `<feature>.controller.ts`, wire it in `<feature>.router.ts`, and add/extend the Joi schema in `<feature>.valid.ts` if the request body needs validation.
- **Add a new feature/resource**: create `src/server/{api,admin_api,provider_api}/<feature>/` with `index.ts`, `<feature>.router.ts`, `<feature>.controller.ts`, `<feature>.valid.ts`, then import and call `init<Feature>(router)` from the relevant `server/{api,admin_api,provider_api}/index.ts`. Put framework-agnostic logic shared across roles in `src/core/<feature>/`. Add a Mongoose model in `src/database/models/` if it needs its own collection.
- **Add a new role-aware auth guard**: extend `src/server/middleware/isAuth.ts` following the existing customer/admin/provider pattern.
- **Add a cron job**: add a file to `src/cron/` and start it from `src/server/index.ts`.
- **Add a translated API message**: add the key to `locales/en/` and `locales/ar/`.
- **Change env config**: add the var to `.env` and read it via `src/config/env.ts` (`Config.<NAME>`) rather than `process.env` directly elsewhere.
