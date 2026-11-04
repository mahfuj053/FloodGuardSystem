# FloodGuard Frontend (React + Vite)

## Setup

```bash
cd frontend
npm install
npm run dev
```

Dev server runs on `http://localhost:5173`. API calls to `/api/*` are proxied to
`http://127.0.0.1:8000` (Django dev server) — see `vite.config.js`.

## What's implemented

- Vite + React Router project scaffold
- Role select screen → Login → Register
- JWT-based auth (`AuthContext`) with access/refresh tokens in localStorage,
  auto-refresh on 401 via axios interceptor
- `ProtectedRoute` for auth + role gating
- Three role-based landing pages:
  - `/home` — general/affected citizen
  - `/admin` — admin dashboard (stats + quick links)
  - `/responder` — rescue/NGO dashboard (assigned requests)
- Shared components: `Navbar`, `Card`, `StatCard`, `Badge`
- `src/api/endpoints.js` — central place for all backend calls

## ⚠️ Backend contract assumptions — verify against your Django URLs

The endpoint paths in `src/api/endpoints.js` are best-guess based on your app names
(`accounts`, `alerts`, `requests_help`, `relief`, `funds`). Update them to match your
actual `urls.py`. Expected shapes:

- `POST /api/auth/login/` → `{ access, refresh, user: { id, username, role, ... } }`
- `POST /api/auth/token/refresh/` → `{ access }`
- `GET /api/accounts/me/` → current user profile (must include `role`)
- `role` values used in frontend: `"general" | "responder" | "admin"` — align with
  your `accounts` app's role choices, or adjust `ROLES` in `src/auth/AuthContext.jsx`.

## Still to build (not in this pass)

- HelpRequest / FoodRequest pages (general)
- SendAlert, Users, Requests, Supplies, Aid, Feedbacks, Volunteers, Chat, Analytics pages (admin)
- AffectedAreas, Requests, Donate, Chat pages (responder)
- Profile, Feedback (general, shared)
