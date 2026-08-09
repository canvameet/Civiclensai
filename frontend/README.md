# CivicLens AI — Frontend (`site/`)

React + TypeScript single-page app for CivicLens AI, an AI-assisted civic issue
reporting platform. It contains the public landing page, the citizen portal, and
the (unlinked) admin panel — authority dashboard and social intelligence feed.

The app talks to the Express backend at `Backend/civiclens/backend`.

## Stack

| | |
|---|---|
| React 19 + TypeScript | UI, strict typing |
| Vite 8 | dev server, build, `/api` proxy |
| React Router 7 | client-side routing (`BrowserRouter`) |
| Tailwind CSS 3.4 | styling (custom `ink` / `neon` palette) |
| Framer Motion 13 | scroll and entrance animation |
| lucide-react | icons |
| oxlint | linting |

## Getting started

The frontend needs the backend running on **port 5000** — Vite proxies `/api`
and `/uploads` there, so the browser stays on a single origin (no CORS, no
absolute URLs in code).

```bash
npm install
npm run dev
```

Dev server: `http://localhost:5174` (the workspace root script pins that port;
plain `npm run dev` uses Vite's default 5173).

From the workspace root you can start either side:

```bash
npm run backend
```

```bash
npm run frontend
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b` typecheck, then production build to `dist/` |
| `npm run preview` | serve the built `dist/` locally |
| `npm run lint` | oxlint over the source tree |

### Environment

| Variable | Default | Notes |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:5000` | dev-only; the proxy target in [vite.config.ts](vite.config.ts) |
| `VITE_API_BASE` | `''` (same origin) | prefix for API calls in production, where there is no Vite proxy |

## Routes

Defined in [App.tsx](src/App.tsx); the href constants live in
[routes.ts](src/routes.ts) so links have one place to change.

| Route | Page | Access |
|---|---|---|
| `/` | landing page | public |
| `/login`, `/signup` | citizen auth | public |
| `/citizen` | submit and track complaints | signed in (`RequireAuth`) |
| `/admin/login` | admin door | public, but **not linked** from anywhere |
| `/authority` | complaint queue, analytics, hotspots | admin (`RequireAdmin`) |
| `/social` | scraped social posts → complaints | admin (`RequireAdmin`) |
| `*` | falls back to the landing page | public |

The admin panel is reachable only by typing the URL. There is no admin sign-up
path, and the route guards are a UX convenience — the backend enforces roles on
every request.

## Auth

[`lib/auth.tsx`](src/lib/auth.tsx) exposes an `AuthProvider` and a `useAuth()`
hook. A JWT is kept in `localStorage` under `civiclens_token` and verified
against `/api/auth/me` once on boot; an invalid or expired token is dropped
rather than left as a dead session. While that check is in flight the guards
render a spinner, so a signed-in user never sees a flash of the login form on
refresh.

Roles are `citizen | authority | admin`. `isAdmin()` is the single source of
truth for "may see the admin panel" — `authority` predates the admin role and is
still treated as privileged.

Three entry points: `login()` → `/api/auth/login`, `signup()` →
`/api/auth/register`, `adminLogin()` → `/api/auth/admin/login`.

## API client

[`lib/api.ts`](src/lib/api.ts) is the only place that calls the backend. Every
request attaches the stored bearer token, parses the backend's JSON `error`
field, and throws `ApiError` (with `status`) instead of a bare failure — a
network failure surfaces as status `0` with a "is the backend running?" message.

| Function | Endpoint |
|---|---|
| `listComplaints(filters)` | `GET /api/complaints` |
| `getComplaint(id)` | `GET /api/complaints/:id` |
| `submitComplaint({ rawText, area, city, image })` | `POST /api/complaints` (multipart) |
| `updateStatus(id, status, note)` | `PATCH /api/complaints/:id/status` |
| `subscribeToComplaints(onChange)` | `GET /api/complaints/stream/live` (SSE) |
| `getSocialFeed(filters)` | `GET /api/social/feed` |
| `triggerScrape()` | `POST /api/social/scrape` |
| `convertPost(postId)` | `POST /api/social/:id/convert` |
| `getAnalytics()` | `GET /api/analytics` |
| `getHotspots()` | `GET /api/analytics/area` |

Domain vocabulary is exported from the same module and shared by every form and
badge: `CATEGORIES`, `SEVERITIES`, `STATUSES`, `AREAS`, plus the `Complaint`,
`SocialPost`, `Analytics`, and `Hotspot` types.

The authority dashboard subscribes to the SSE stream and refetches on each
event, so new complaints and status changes appear without a reload.

## Structure

```
site/
├── src/
│   ├── App.tsx                     # router + AuthProvider
│   ├── main.tsx                    # React entry
│   ├── routes.ts                   # route href constants
│   ├── index.css                   # Tailwind layers + custom utilities
│   ├── lib/
│   │   ├── api.ts                  # typed backend client, ApiError
│   │   └── auth.tsx                # AuthProvider, useAuth, isAdmin
│   ├── pages/
│   │   ├── LandingPage.tsx         # composes the marketing sections
│   │   ├── AuthPage.tsx            # login + signup (mode prop)
│   │   ├── AdminLoginPage.tsx      # admin-only sign-in
│   │   ├── CitizenPage.tsx         # submit + track complaints
│   │   ├── AuthorityPage.tsx       # queue, filters, analytics, hotspots
│   │   └── SocialPage.tsx          # social feed, scrape, convert
│   └── components/
│       ├── Navbar.tsx  Hero.tsx  Services.tsx
│       ├── HowItWorks.tsx  About.tsx  Footer.tsx
│       ├── Clients.tsx  Work.tsx      # landing sections
│       ├── BrandIcons.tsx             # inline brand SVGs (X, …)
│       ├── RequireAuth.tsx            # citizen route guard
│       ├── RequireAdmin.tsx           # admin route guard
│       └── dashboard/Shell.tsx        # shared dashboard UI kit
├── public/                            # static assets
├── vite.config.ts                     # /api + /uploads proxy
└── tailwind.config.js                 # theme extension
```

### Dashboard UI kit

The three signed-in pages share one vocabulary from
[`components/dashboard/Shell.tsx`](src/components/dashboard/Shell.tsx) rather
than restyling per page: `DashboardShell` (nav chrome, tabs by role, sign-out),
`Panel`, `EmptyState`, `ErrorNote`, `Spinner`, `StatusBadge`, `SeverityBadge`,
`StatusStepper`, and the `FIELD` / `LABEL` / `BTN_PRIMARY` / `BTN_GHOST` class
constants.

## Design

- Background `ink` (`#050506`), accents `neon.amber` (`#ffb300`) and
  `neon.orange` (`#ff7a1a`) — defined in [tailwind.config.js](tailwind.config.js).
- Font: Outfit. Headings `font-black` and tight tracking; body `font-light`.
- Surfaces are glassmorphic: `bg-white/5` over `border-white/10` with backdrop
  blur.
- Motion: scroll-linked reveals via `useScroll`/`useTransform`, entrance
  animations with `whileInView` and `viewport={{ once: true }}` so they do not
  re-trigger.
- Mobile-first, standard Tailwind breakpoints (`sm` 640, `md` 768, `lg` 1024).

## Build

```bash
npm run build
```

Emits `dist/`. `npm run preview` serves it, and the workspace root
`npm run static` serves the built output through `server.js` on port 4173.
Because the Vite proxy only exists in dev, a deployed build must either sit
behind a reverse proxy that forwards `/api` and `/uploads`, or be built with
`VITE_API_BASE` pointing at the backend origin.
