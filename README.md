# IUBAT CSE 10K Marathon Management System

A complete, production-ready management system for the IUBAT CSE 10K Marathon. Built with **Laravel 11** + **MySQL** for the backend API and **React 19** + **Vite** + **Tailwind CSS** for the frontend.

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
- Capacity-controlled (max 400 by default; configurable)
- 10-minute slot reservation with automatic expiry & release
- Serializable transaction + row-level lock to prevent race conditions
- Payment: simulated bKash / Nagad initiate → confirm/fail
- Idempotent payment confirmation; participant status auto-transitions
- Auto-generated unique BIB numbers on successful payment
- Email + mock SMS notifications (logged to DB; failures never break registration)

### Admin dashboard
- Sanctum bearer-token auth (separate `admin` guard)
- Slot usage, payment, and category breakdown
- Participant list with search + filters (category / status)
- Edit participant, manually verify payments, paginate
- Streaming CSV export of participants
- Bulk notifications (email / mock SMS), filterable by category & status
- Sponsor & volunteer CRUD

### Certificates
- DOMPDF rendered, A4 landscape, IUBAT-themed certificate
- Embedded SVG QR code → public verification endpoint
- Download counter tracked per certificate

## Project layout

```
backend/    # Laravel 11 application (API only)
frontend/   # React 19 + Vite + Tailwind SPA
```

## Tech stack

| Layer    | Tech |
| -------- | ---- |
| Backend  | Laravel 11, Sanctum, DOMPDF (`barryvdh/laravel-dompdf`), `simplesoftwareio/simple-qrcode` |
| Database | MySQL (production) / SQLite (local dev) |
| Frontend | React 19, Vite 8, Tailwind CSS 3, Axios, React Router 7 |
| Auth     | Sanctum bearer tokens (admin) |

## Local setup

### 1. Backend

Requires PHP 8.3+ and Composer.

```bash
cd backend
cp .env.example .env
php artisan key:generate
# Optional: switch DB_CONNECTION to mysql in .env
touch database/database.sqlite      # if using sqlite
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

The seeder creates a default super-admin you can log in with:

| Email | Password |
| ----- | -------- |
| `admin@iubat.edu` | `admin12345` |

### 2. Frontend

Requires Node 20+ and npm.

```bash
cd frontend
cp .env.example .env       # contains VITE_API_BASE_URL
npm install
npm run dev                # Starts on http://localhost:5173
```

Open http://localhost:5173. The admin panel lives at `/admin/login`.

## Configuration

All marathon-specific knobs are surfaced as environment variables (see `backend/.env.example`):

| Variable | Purpose |
| -------- | ------- |
| `MARATHON_TOTAL_SLOTS` | Hard cap on participants (default 400) |
| `MARATHON_HOLD_MINUTES` | Slot reservation TTL during checkout |
| `MARATHON_FEE_STUDENT`, `MARATHON_FEE_FACULTY` | Per-category fees |
| `MARATHON_BIB_PREFIX`, `MARATHON_BIB_PAD_LENGTH` | BIB format (default `IUB0001`) |
| `MARATHON_VERIFY_URL` | Public certificate verification URL template (`{uuid}` placeholder) |
| `MARATHON_RESULT_URL` | External results board URL embedded on the Results page |
| `CORS_ALLOWED_ORIGINS` | Frontend origins allowed to call the API |

## Key API endpoints

```
# Public
GET    /api/event
GET    /api/event/sponsors
GET    /api/event/volunteers
GET    /api/slots
POST   /api/registration
POST   /api/payments/initiate
POST   /api/payments/confirm
GET    /api/payments/{transaction}
GET    /api/certificates/lookup?query=...
GET    /api/certificates/{uuid}/verify
GET    /api/certificates/{uuid}/download

# Admin (Sanctum)
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me
GET    /api/admin/dashboard
GET    /api/admin/participants
GET    /api/admin/participants/export
GET    /api/admin/participants/{id}
PATCH  /api/admin/participants/{id}
POST   /api/admin/participants/{id}/verify-payment
POST   /api/admin/notifications/bulk
GET|POST|PUT|DELETE /api/admin/sponsors
GET|POST|PUT|DELETE /api/admin/volunteers
```

## Edge cases handled

- **Duplicate registrations** → unique constraint on email & phone, surfaced as 409 errors.
- **Concurrent registrations** → `Serializable` transaction + slot recount inside the lock.
- **Slot full at checkout** → 410 with current slot summary; user can retry.
- **Payment failure after slot hold** → participant reverts to `reserved`, slot remains held until original expiry.
- **Stale slot holds** → cleaned up automatically on every slot read.
- **Repeated payment confirmation** → idempotent; safe to retry.
- **Mail server down** → notification failures logged but never propagate to the user flow.
- **BIB collisions** → row-level lock + unique check + auto-retry.

## Production deployment notes

- Switch `DB_CONNECTION=mysql` and configure DB credentials.
- Configure a real mailer (`MAIL_MAILER=smtp`, `MAIL_HOST=…`).
- Build the frontend (`npm run build`) and serve the contents of `frontend/dist` from your CDN / web server.
- Point `VITE_API_BASE_URL` to your public API URL before building.
- Update `CORS_ALLOWED_ORIGINS` and `SANCTUM_STATEFUL_DOMAINS` to your production frontend origin.
- Run `php artisan storage:link` if you start storing uploaded sponsor logos / volunteer photos.
- Cache config & routes for performance: `php artisan config:cache && php artisan route:cache`.

## License

MIT — see `LICENSE` (add one before publishing).
