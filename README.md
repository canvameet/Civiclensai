# CivicLens AI

A full-stack civic complaint management platform. Citizens report local issues, AI classifies and routes them to the right department, and authority admins resolve them — all in real time.

---

## What it does

- **Citizens** submit complaints (potholes, water leaks, power outages, etc.) with optional photo evidence
- **AI** classifies each complaint by category, severity, and department — and detects duplicates automatically
- **Authority admins** manage and resolve issues through a live dashboard with SSE-powered real-time updates
- **Social Intelligence** scrapes X (Twitter) for civic complaints in your area and lets admins convert posts into formal complaints with one click
- **Master Admin** creates and manages scoped admin accounts — each admin can be restricted to a specific area and department so they only see what's relevant to them

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express 4, MongoDB / Mongoose |
| Auth | JWT (separate citizen and admin login doors) |
| AI | OpenRouter API (OpenAI-compatible, switchable models) |
| Social | X/Twitter API v2 |
| Real-time | Server-Sent Events (SSE) |

---

## Project Structure

```
Final-Project/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app entry point
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT middleware, role guards
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js       # Multer file uploads
│   │   ├── models/
│   │   │   ├── User.js         # citizen | authority | admin | master-admin
│   │   │   ├── Complaint.js    # Full complaint lifecycle
│   │   │   ├── Department.js
│   │   │   └── SocialPost.js
│   │   ├── routes/
│   │   │   ├── auth.js         # /api/auth/*
│   │   │   ├── complaints.js   # /api/complaints/*
│   │   │   ├── analytics.js    # /api/analytics/*
│   │   │   ├── social.js       # /api/social/*
│   │   │   └── masterAdmin.js  # /api/master-admin/*
│   │   └── services/
│   │       ├── aiService.js    # AI classification via OpenRouter
│   │       └── xScraper.js     # X/Twitter scraper
│   ├── seed-admin.js           # Provision master admin account
│   ├── seed.js                 # Demo data seeder
│   └── .env.example
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.tsx
│       │   ├── AuthPage.tsx        # Citizen login/signup
│       │   ├── AdminLoginPage.tsx  # Admin-only login door
│       │   ├── CitizenPage.tsx     # Complaint submission portal
│       │   ├── AuthorityPage.tsx   # Admin complaint dashboard
│       │   ├── SocialPage.tsx      # Social intelligence feed
│       │   └── MasterAdminPage.tsx # Admin account management
│       ├── components/
│       │   ├── dashboard/Shell.tsx # Shared dashboard layout
│       │   ├── RequireAuth.tsx
│       │   ├── RequireAdmin.tsx
│       │   └── RequireMasterAdmin.tsx
│       └── lib/
│           ├── api.ts          # Typed API client
│           └── auth.tsx        # Auth context + hooks
├── DEPLOYMENT.md
└── README.md
```

---

## User Roles

| Role | Access |
|---|---|
| `citizen` | Submit complaints, track own reports |
| `authority` | View and resolve complaints (legacy role) |
| `admin` | Full authority dashboard + social intelligence, scoped to assigned area/dept |
| `master-admin` | Everything above + create/manage admin accounts |

Roles have **separate login doors** — citizens use `/login`, admins use `/admin/login`. Admin accounts can never be created from the public signup form.

---

## Getting Started (Local)

### Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone the repo

```bash
git clone https://github.com/canvameet/Civiclensai.git
cd Civiclensai
```

### 2. Configure the backend

```bash
cd backend
copy .env.example .env
```

Open `.env` and fill in:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/citysetu
PORT=5000

# Generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=your_generated_secret

ADMIN_NAME=CivicLens Master Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=yourpassword123

# Optional — AI and X scraping work without these, features are skipped if absent
OPENROUTER_API_KEY=
X_BEARER_TOKEN=
```

### 3. Install dependencies

```bash
# In backend/
npm install

# In frontend/
cd ../frontend
npm install
```

### 4. Seed the master admin

```bash
cd ../backend
npm run seed:admin
```

Expected output: `Admin account created: admin@example.com`

### 5. Start both servers

Open two terminals:

```bash
# Terminal 1 — backend (port 5000)
cd backend
npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Key Routes

### Frontend

| Path | Description |
|---|---|
| `/` | Landing page |
| `/signup` | Citizen registration |
| `/login` | Citizen login |
| `/citizen` | Complaint submission portal (auth required) |
| `/admin/login` | Admin login — not linked from the public site |
| `/authority` | Authority complaint dashboard (admin required) |
| `/social` | Social intelligence feed (admin required) |
| `/master-admin` | Admin account management (master-admin only) |

### Backend API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Citizen signup |
| POST | `/api/auth/login` | — | Citizen login |
| POST | `/api/auth/admin/login` | — | Admin login |
| GET | `/api/auth/me` | Bearer | Resolve current session |
| POST | `/api/complaints` | — | Submit a complaint |
| GET | `/api/complaints` | — | List complaints (scoped for admins) |
| PATCH | `/api/complaints/:id/status` | Admin | Update complaint status |
| GET | `/api/complaints/stream/live` | — | SSE real-time stream |
| GET | `/api/analytics` | Admin | Stats (scoped to admin's area/dept) |
| GET | `/api/analytics/area` | Admin | Area hotspots |
| GET | `/api/social/feed` | Admin | Social posts feed |
| POST | `/api/social/scrape` | Admin | Trigger X scrape |
| POST | `/api/social/:postId/convert` | Admin | Convert post to complaint |
| GET | `/api/master-admin/users` | Master Admin | List admin accounts |
| POST | `/api/master-admin/users` | Master Admin | Create admin account |
| PATCH | `/api/master-admin/users/:id` | Master Admin | Update admin account |
| DELETE | `/api/master-admin/users/:id` | Master Admin | Delete admin account |

---

## How Scoped Admins Work

When a master admin creates an admin account, they can assign:
- **Area** — e.g. `Bopal`, `Satellite`, `Navrangpura`
- **Department** — e.g. `Roads`, `Water`, `Sanitation`

A scoped admin logging into the authority dashboard will:
- Only see complaints from their assigned area and/or department
- Have the area/category filters locked (cannot be changed)
- See analytics and hotspot data scoped to their slice only
- Be blocked server-side from updating statuses on out-of-scope complaints

Master admins and unscoped admins see everything.

---

## Complaint Lifecycle

```
Submitted → Verified → Assigned → In Progress → Resolved
```

Each status change is recorded in `statusHistory` with a timestamp and optional note. Citizens can track the full pipeline from their portal. Status changes propagate to all connected admin dashboards instantly via SSE.

---

## AI Classification

When a complaint is submitted, the AI service:

1. Classifies it into a **category** (Roads / Water / Sanitation / Electricity / Other)
2. Assigns a **severity** (Low / Medium / High / Critical) with a reason
3. Suggests a **department** for routing with an explanation
4. Generates a **summary** of the complaint
5. Checks for **duplicates** against recent complaints in the same area

Requires `OPENROUTER_API_KEY`. Without it the app still works — complaints are stored with schema default values.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `PORT` | ✅ | Backend port (default 5000) |
| `JWT_SECRET` | ✅ | Secret for signing JWTs |
| `ADMIN_NAME` | ✅ (seed) | Master admin display name |
| `ADMIN_EMAIL` | ✅ (seed) | Master admin email |
| `ADMIN_PASSWORD` | ✅ (seed) | Master admin password (min 8 chars) |
| `OPENROUTER_API_KEY` | Optional | Enables AI classification |
| `X_BEARER_TOKEN` | Optional | Enables X/Twitter scraping |

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full free-tier deployment guide using:
- MongoDB Atlas (database)
- Railway (backend)
- Vercel (frontend)

---

## License

MIT
