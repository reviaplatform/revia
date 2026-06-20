# Revia — Credentials & Test Accounts

This file documents everything needed to log into the seeded local environment
and the third-party platforms the backend integrates with. It is generated
for local/dev use — do not put real production secrets in this file.

## Quick start

```sh
cp .env.example .env
docker compose up --build
```

MongoDB now runs as a Docker service (`mongo`) — there is **no MongoDB Atlas
dependency anymore**. On every backend container start, `backend/src/database/seed.ts`
runs automatically and seeds the database if it's empty (it's idempotent —
re-running it on an already-seeded database is a no-op).

## Test accounts

| Role | Identifier | Password / OTP | Notes |
|------|------------|-----------------|-------|
| Admin | `admin@test.com` / phone `01111111111` | password `12345678` | Login is **email + password** (`POST /api/v1/admin/auth/login`). Password reset uses a real OTP sent to the admin's email. |
| Customer (user) | phone `01111111111`, email `user@test.com` | OTP `000000` | Login is **phone + OTP only**, no password. Gender `male`, birthday `01:01:2000`. |
| Provider | phone `01111111111` / email `provider@test.com` | password `12345678` | Login is **phone (or email) + password** (`POST /api/v1/provider/auth/login`). Owns the seeded brand "TechFix Egypt". Password reset uses a real OTP sent via SMS. |

All three roles intentionally share the test phone `01111111111` — they live
in separate Mongo collections (Admin / Customer / Provider) so there's no
unique-index conflict. All seeded admins/providers share the password `12345678`.

Extra seeded admins (mixed roles, same password as above) — for testing
ban/unban in the admin panel:
- `mona.adel@revia.com` / `01055566677` (manager, active)
- `khaled.ibrahim@revia.com` / `01066677788` (admin, active)
- `yasmine.tarek@revia.com` / `01088899900` (manager, **banned** — login returns 403)
- `hany.said@revia.com` / `01077788899` (admin, active)

Extra seeded providers — each brand has 2 providers, for testing ban/unban:
- **TechFix Egypt**: `provider@test.com` (active) + `heba.younis@test.com` / `01022211100` (active)
- **QuickFix Mobile**: `provider2@test.com` (active) + `ziad.naguib@test.com` / `01033322200` (**banned**)
- **ProCare Electronics**: `provider3@test.com` (active) + `nour.adly@test.com` / `01044433300` (active)

Extra seeded customers (no fixed password, OTP-only) for variety in
repair requests / reel likes, plus two for testing ban/delete:
- `sara.ahmed@example.com` / `01022233344` (active)
- `omar.khaled@example.com` / `01133344455` (active)
- `mona.saeed@example.com` / `01044455566` (active)
- `karim.adel@example.com` / `01155566677` (active)
- `reem.hassan@example.com` / `01166677788` (status **banned**)
- `tamer.fouad@example.com` / `01177788899` (status **deleted**)

## OTP rules (see `backend/src/core/auth/otp.ts`)

| Phone | OTP |
|-------|-----|
| `01111111111` | always `000000` |
| any other phone, when `NODE_ENV` is `development`, `local`, or `production` | always `102030` |
| any other phone otherwise | a real random 6-digit code sent via SMS (Beon) |

Admin and Provider **password-reset** OTPs are never bypassed — a real random
code is sent via email (Admin) or SMS (Provider).

## Seeded data summary

- 5 admins (1 fixed test admin + 4 extra, mixed admin/manager roles, 1 banned).
- 2 categories: Smartphones, Laptops — both 10% commission per request.
- 3 active/approved brands, each with 2 providers/owners (1 banned at QuickFix
  Mobile): **TechFix Egypt**, **QuickFix Mobile**, **ProCare Electronics**.
- 7 customers, 7 devices (phones + laptops) — 5 active, 1 banned, 1 deleted.
- ~9 repair requests covering the full status lifecycle (from `ai_assessing`
  through `completed`, plus one `cancelled`) on TechFix Egypt, with matching
  brand offers, inspections, payments, brand-wallet credit transactions, and
  a brand review where relevant.
- Payouts: TechFix Egypt has one `sent` (bank transfer) and one `pending`
  (InstaPay) payout request, with matching `BrandWalletTransaction` debit
  records; QuickFix Mobile has one `rejected` payout; ProCare Electronics has
  one `pending` payout.
- 8 reels, all cloned from a single downloaded sample video + thumbnail,
  distributed round-robin across the 3 brands, with randomized view counts
  and real `ReelLike` documents driving each reel's `likesCount`.
- Brand subscription config set to **0 EGP / 7 days**, with all 3 brands
  given an active subscription on that plan.
- 6 support tickets (3 from customers, 3 from brands) covering every status
  (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) and priority.

## Platform credentials reference (from `.env.example` / `backend/.env`)

| Platform | Env vars | Purpose |
|----------|----------|---------|
| MongoDB | `MONGODB_URI` | Now points at the Dockerized `mongo` service (`mongodb://mongo:27017/revia`), not Atlas. |
| Email (Gmail SMTP via nodemailer) | `EMAIL_SENDER`, `EMAIL_SENDER_NAME`, `EMAIL_SENDER_PASSWORD` | Admin password-reset OTPs, customer notification emails. |
| SMS (Beon) | `SMS_ACCESS_TOKEN` | Phone OTPs for customer/provider login and password reset. |
| File storage | `STORAGE_PROVIDER` (`local` or `s3`), `S3_BUCKET_NAME`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Reel videos/thumbnails, brand logos, inspection photos. Defaults to `local` (served from `backend/uploads/`). |
| Kashier | `KASHIER_MERCHANT_ID`, `KASHIER_API_KEY`, `KASHIER_SECRET_KEY` | Online payment gateway. |
| Google Gemini | `GEMINI_API_KEY` | AI chat assessment flow. |
| Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Brand chat session storage. |

JWT signing keys (`ADMIN_ACCESS_TOKEN_KEY`, `PROVIDER_ACCESS_TOKEN_KEY`,
`USER_ACCESS_TOKEN_KEY`, `USER_REFRESH_TOKEN_KEY`, `REGISTER_ACCESS_TOKEN_KEY`)
should be long random strings per environment — see `.env.example` for the
full list with placeholder defaults.
