# IUBAT CSE 10K Marathon Management System

A complete management system for the IUBAT CSE 10K Marathon. Built with **Laravel 13** + **MySQL** for the backend API and **React 19** + **Vite** + **Tailwind CSS** for the frontend.

## Features

### Public site
- Hero, race-day countdown, live slot meter
- About, route map (OpenStreetMap embed), registration info, FAQ
- Sponsors and organizers / volunteers (driven from the database)
- Registration form with client-side validation
- Simulated bKash / Nagad payment flow with hold expiry countdown
- Certificate lookup (by phone or BIB) + PDF download with QR-code verification
- External results board

### Registration & payment lifecycle
- Capacity-controlled (default 400, configurable) with a timed slot hold (default 10 min)
- Race-safe slot allocation (transaction + recount); expired holds are released automatically
- **Manual bKash / Nagad verification (production default):** the runner sends money to the
  organizers' merchant number, submits the TrxID, and an admin verifies it. The slot is held
  for up to 48 h while verification is pending. A TrxID can only be used once.
- **Simulated checkout (demo only):** enabled with `MARATHON_PAYMENT_MODE=simulated`; the API
  refuses it when `APP_ENV=production`, so nobody can mark themselves as paid on a live site
- Sequential BIB numbers (`IUB0001`, `IUB0002`, …) assigned on confirmation
- Confirmation email + mock SMS, logged to the database; mail failures never break registration
- Public checkout uses an unguessable per-registration token; no email/phone is ever returned
  by public endpoints

### Results & certificates
- Admins import finishing times (`BIB,time` CSV or paste) or edit one runner at a time
- Public results board with overall / student / faculty ranking and search
- Certificates unlock once a finish time exists (`MARATHON_CERT_REQUIRE_FINISH`), and are looked up
  with **BIB + registered phone** so other people's certificates can't be enumerated
- DOMPDF A4 certificate with rank, finish time and a QR code to a public verification page

### Admin dashboard
- Sanctum bearer-token auth with expiring tokens (`SANCTUM_TOKEN_EXPIRATION`, default 12 h)
- Slot usage, payment and category breakdown
- Participant list with debounced search + filters; edit, verify payments, see submitted TrxIDs
- CSV export (formula-injection safe), bulk email / mock SMS notifications
- Results import, sponsor & volunteer management

## Project layout

```
backend/    # Laravel 13 application (API only)
frontend/   # React 19 + Vite + Tailwind SPA
```

## Tech stack

| Layer    | Tech |
| -------- | ---- |
| Backend  | Laravel 13, Sanctum, DOMPDF (`barryvdh/laravel-dompdf`), `simplesoftwareio/simple-qrcode` |
| Database | MySQL (production) / SQLite (local dev) |
| Frontend | React 19, Vite 8, Tailwind CSS 3, Axios, React Router 7 |
| Auth     | Sanctum bearer tokens (admin) |

## Local setup

### 1. Backend (PHP 8.3+, Composer)

```bash
cd backend
cp .env.example .env
php artisan key:generate
touch database/database.sqlite        # SQLite for local dev; or configure MySQL in .env
php artisan migrate --seed            # seeds the admin from ADMIN_EMAIL / ADMIN_PASSWORD
php artisan serve --host=127.0.0.1 --port=8000
```

In a local environment, if `ADMIN_EMAIL`/`ADMIN_PASSWORD` are unset the seeder creates
`admin@example.com` / `password-change-me`. **In production no default admin is ever created** —
set the two variables or run:

```bash
php artisan marathon:create-admin you@example.com
```

### 2. Frontend (Node 20+)

```bash
cd frontend
cp .env.example .env     # VITE_API_BASE_URL
npm install
npm run dev              # http://localhost:5173  (admin: /admin/login)
```

### 3. Tests

```bash
cd backend && php artisan test      # registration, payments, results, certificates, auth
cd frontend && npm run lint && npm run build
```

CI (`.github/workflows/ci.yml`) runs all of the above on every pull request.

## Configuration

Everything event-specific is an environment variable (see `backend/.env.example`):

| Variable | Purpose |
| -------- | ------- |
| `MARATHON_EVENT_NAME`, `_DATE`, `_VENUE`, `_ORGANIZER`, `MARATHON_SUPPORT_EMAIL` | Shown across the site, emails and certificates |
| `MARATHON_TOTAL_SLOTS`, `MARATHON_HOLD_MINUTES` | Capacity and checkout hold |
| `MARATHON_FEE_STUDENT`, `MARATHON_FEE_FACULTY` | Per-category fees (BDT) |
| `MARATHON_PAYMENT_MODE` | `manual` (production) or `simulated` (demo, refused in production) |
| `MARATHON_BKASH_NUMBER`, `MARATHON_NAGAD_NUMBER` | Merchant numbers shown on the payment page |
| `MARATHON_VERIFICATION_HOLD_HOURS` | How long a slot is kept while a TrxID awaits verification |
| `MARATHON_CERT_REQUIRE_FINISH` | Only finishers (with a recorded time) get certificates |
| `MARATHON_BIB_PREFIX`, `MARATHON_BIB_PAD_LENGTH` | BIB format (`IUB0001`) |
| `MARATHON_VERIFY_URL` | Certificate QR target, `{uuid}` placeholder |
| `MARATHON_RESULT_URL` | Optional external results link |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin created by the seeder |
| `CORS_ALLOWED_ORIGINS`, `SANCTUM_TOKEN_EXPIRATION` | API access control |

## Key API endpoints

```
# Public
GET    /api/event                    GET /api/slots          GET /api/results
GET    /api/event/sponsors           GET /api/event/volunteers
POST   /api/registration
GET    /api/payments/config
POST   /api/payments/initiate        POST /api/payments/submit   (manual TrxID)
POST   /api/payments/confirm         (simulated mode only)
GET    /api/payments/{transaction}?token=…
GET    /api/certificates/lookup?bib=…&phone=…
GET    /api/certificates/{uuid}/verify | /download

# Admin (Sanctum bearer token)
POST   /api/admin/login | /logout    GET /api/admin/me | /dashboard
GET    /api/admin/participants[/export|/{id}]   PATCH /api/admin/participants/{id}
POST   /api/admin/participants/{id}/verify-payment
POST   /api/admin/results/import     POST /api/admin/notifications/bulk
apiResource /api/admin/sponsors, /api/admin/volunteers
```

## Edge cases handled

- **Duplicate registrations** → blocked while an active registration exists for the email/phone (409). Expired or cancelled holds don't block a retry.
- **Concurrent registrations** → transaction + recount inside the lock; BIB assignment retries on unique-index collisions.
- **Slot full** → 410 with the current slot summary.
- **Self-confirming payments** → the public confirm endpoint is closed outside simulated mode, and each call must present the registration's private token.
- **Reused TrxID** → rejected (409).
- **Late verification of an expired hold** → only confirmed if capacity remains.
- **Repeated payment confirmation** → idempotent.
- **Mail server down** → logged, never surfaced to the runner.

## Production checklist

- `APP_ENV=production`, `APP_DEBUG=false`, a real `APP_KEY`, MySQL, and `MARATHON_PAYMENT_MODE=manual`.
- Set `MARATHON_BKASH_NUMBER` / `MARATHON_NAGAD_NUMBER`, `MARATHON_SUPPORT_EMAIL`, a real mailer, and `MARATHON_VERIFY_URL` to your public site.
- Create the admin with `php artisan marathon:create-admin` (≥ 12-character password).
- Set `CORS_ALLOWED_ORIGINS` to the frontend origin; serve everything over HTTPS.
- `npm run build` in `frontend/` with `VITE_API_BASE_URL` pointing at the API; serve `dist/` with an SPA fallback to `index.html`.
- Schedule `php artisan schedule:run` if you add jobs; cache with `php artisan config:cache route:cache`.
- Replace the placeholder race-pack copy on the home page and FAQ with what you will actually deliver.

## License

MIT — see [LICENSE](LICENSE).
