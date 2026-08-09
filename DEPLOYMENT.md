# Deployment Guide — CivicLens AI

Full free-tier deployment using:
- **MongoDB Atlas** — database (free M0 cluster)
- **Railway** — backend (Node/Express)
- **Vercel** — frontend (React/Vite)

All three have permanent free tiers. No credit card required for the limits this app needs.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [MongoDB Atlas Setup](#2-mongodb-atlas-setup)
3. [Prepare the Code](#3-prepare-the-code)
4. [Deploy Backend on Railway](#4-deploy-backend-on-railway)
5. [Seed the Master Admin](#5-seed-the-master-admin)
6. [Deploy Frontend on Vercel](#6-deploy-frontend-on-vercel)
7. [Connect Frontend to Backend](#7-connect-frontend-to-backend)
8. [Verify Everything Works](#8-verify-everything-works)
9. [Optional — API Keys](#9-optional--api-keys)
10. [Updating After Code Changes](#10-updating-after-code-changes)
11. [Troubleshooting](#11-troubleshooting)
12. [Free Tier Limits](#12-free-tier-limits)

---

## 1. Prerequisites

- **Git** installed and repo pushed to GitHub (public or private both work)
- **Node.js 18+** installed locally (only needed for the seed step)
- A **GitHub account**

Push your project to GitHub if you haven't already:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 2. MongoDB Atlas Setup

Atlas hosts the database. The free M0 tier gives 512 MB — more than enough.

### 2.1 Create a free cluster

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign up / log in.
2. Click **Create** → choose **M0 Free** tier.
3. Pick any cloud provider and region closest to you.
4. Name the cluster (e.g. `civiclens`). Click **Create Deployment**.

### 2.2 Create a database user

1. In the left sidebar go to **Database Access**.
2. Click **Add New Database User**.
3. Choose **Password** authentication.
4. Set a username (e.g. `civiclens_user`) and a strong password. **Save these — you'll need them.**
5. Set privileges to **Read and write to any database**. Click **Add User**.

### 2.3 Allow network access

1. Go to **Network Access** in the left sidebar.
2. Click **Add IP Address**.
3. Click **Allow Access from Anywhere** (`0.0.0.0/0`). Click **Confirm**.

> This is required because Railway/Vercel use dynamic IPs. It's safe since the DB user has a password.

### 2.4 Get your connection string

1. Go to **Database** → click **Connect** on your cluster.
2. Choose **Drivers** → Node.js.
3. Copy the connection string. It looks like:
   ```
   mongodb+srv://civiclens_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password.
5. Add the database name before the `?`:
   ```
   mongodb+srv://civiclens_user:YOURPASSWORD@cluster0.xxxxx.mongodb.net/citysetu?retryWrites=true&w=majority
   ```

**Keep this URI — it goes into Railway as `MONGODB_URI`.**

---

## 3. Prepare the Code

### 3.1 Add a `nixpacks.toml` for Railway (backend)

Railway auto-detects Node but needs to know the start command. Create this file in the `backend` folder:

```toml
# backend/nixpacks.toml
[start]
cmd = "node -r dotenv/config src/app.js"
```

Or you can skip this file — Railway will use the `start` script from `package.json` automatically (`node -r dotenv/config src/app.js`), which is already correct.

### 3.2 Set the `engines` field (recommended)

In `backend/package.json`, add:

```json
"engines": {
  "node": ">=18"
}
```

### 3.3 Add a `vercel.json` for the frontend SPA routing

Create `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures React Router routes like `/admin/login` and `/citizen` work on hard refresh.

### 3.4 Commit everything

```bash
git add .
git commit -m "add deployment config"
git push
```

---

## 4. Deploy Backend on Railway

### 4.1 Create a Railway project

1. Go to [https://railway.app](https://railway.app) and sign up with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository.
4. Railway will detect it as a monorepo. When asked, set the **root directory** to `backend`.
5. Click **Deploy**.

The first deploy will fail because env vars aren't set yet — that's expected.

### 4.2 Set environment variables

In your Railway project, go to the service → **Variables** tab. Add each of these:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string from step 2.4 |
| `JWT_SECRET` | A random 64-char hex string (generate below) |
| `PORT` | `5000` |
| `ADMIN_NAME` | `CivicLens Master Admin` (or any name) |
| `ADMIN_EMAIL` | Your admin email (e.g. `admin@yourdomain.com`) |
| `ADMIN_PASSWORD` | A strong password (min 8 chars) |
| `NODE_ENV` | `production` |

**Generate JWT_SECRET** — run this locally:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Copy the output and paste it as `JWT_SECRET`.

**Optional API keys** (app works without these, AI and X scraping are skipped):

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | AI complaint classification |
| `X_BEARER_TOKEN` | X/Twitter scraping |

### 4.3 Trigger a redeploy

After adding variables, go to **Deployments** → click **Redeploy**. Wait for the green checkmark.

### 4.4 Get your backend URL

In Railway, go to your service → **Settings** → **Networking** → **Generate Domain**.

It will give you a URL like:
```
https://civiclens-backend-production.up.railway.app
```

**Copy this URL — you need it for the frontend.**

---

## 5. Seed the Master Admin

This creates the master admin account in the production database. Run it once from your local machine.

### 5.1 Create a temporary local `.env` pointing to production

In the `backend` folder, temporarily set your `.env` to use the production MongoDB URI and the same `ADMIN_EMAIL`/`ADMIN_PASSWORD` you set on Railway.

Or run it inline (Windows CMD):

```cmd
cd backend
set MONGODB_URI=mongodb+srv://civiclens_user:YOURPASSWORD@cluster0.xxxxx.mongodb.net/citysetu?retryWrites=true^&w=majority
set ADMIN_EMAIL=admin@yourdomain.com
set ADMIN_PASSWORD=yourpassword
set ADMIN_NAME=CivicLens Master Admin
node seed-admin.js
```

Or on PowerShell:
```powershell
cd backend
$env:MONGODB_URI="mongodb+srv://civiclens_user:YOURPASSWORD@cluster0.xxxxx.mongodb.net/citysetu?retryWrites=true&w=majority"
$env:ADMIN_EMAIL="admin@yourdomain.com"
$env:ADMIN_PASSWORD="yourpassword"
$env:ADMIN_NAME="CivicLens Master Admin"
node seed-admin.js
```

Expected output:
```
MongoDB connected
Admin account created: admin@yourdomain.com
```

> After this you can clear `ADMIN_EMAIL` and `ADMIN_PASSWORD` from Railway's env vars if you want — the account is permanently stored in the DB.

---

## 6. Deploy Frontend on Vercel

### 6.1 Import the project

1. Go to [https://vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **Add New Project** → Import your GitHub repo.
3. Vercel will ask for the root directory. Set it to **`frontend`**.
4. Framework preset will auto-detect as **Vite**.
5. Do **not** click Deploy yet — set the env var first.

### 6.2 Set the backend URL env var

In the Vercel project settings before deploying, under **Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_API_BASE` | Your Railway backend URL (e.g. `https://civiclens-backend-production.up.railway.app`) |

> This is the variable that tells the frontend where the API lives. Without it, requests go to the same origin and fail in production.

### 6.3 Deploy

Click **Deploy**. Vercel will run `npm run build` (`tsc -b && vite build`) and publish the static files.

Your frontend URL will look like:
```
https://your-project-name.vercel.app
```

---

## 7. Connect Frontend to Backend

### 7.1 Fix CORS on the backend

The backend currently uses `cors()` with no origin restriction, so it already accepts requests from any origin. No change needed.

If you ever want to restrict it to your Vercel domain only, update `backend/src/app.js`:

```js
app.use(cors({
  origin: 'https://your-project-name.vercel.app',
  credentials: true,
}));
```

Then commit and push to trigger a Railway redeploy.

### 7.2 Verify the connection

Open your Vercel URL, open browser DevTools → Network tab. When the landing page loads, check that no requests to `/api/*` are returning errors.

Visit:
```
https://civiclens-backend-production.up.railway.app/api/health
```

You should get:
```json
{ "status": "ok", "timestamp": "..." }
```

---

## 8. Verify Everything Works

Work through this checklist top to bottom:

### ✅ Backend health
```
GET https://YOUR_RAILWAY_URL/api/health
→ { "status": "ok" }
```

### ✅ Master admin login
1. Go to `https://YOUR_VERCEL_URL/admin/login`
2. Log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you seeded
3. You should land on `/authority` and see the **Manage Admins** tab

### ✅ Create a scoped admin
1. Go to `/master-admin`
2. Click **New admin**, fill in name/email/password, assign an area and department
3. Click **Create account**
4. Log out, log back in as the new admin
5. The authority dashboard should only show issues for that area/department

### ✅ Citizen signup and complaint
1. Go to `https://YOUR_VERCEL_URL/signup`
2. Create a citizen account
3. Submit a complaint — it should get AI-classified and appear in the authority dashboard

### ✅ Social Intelligence (if X_BEARER_TOKEN is set)
1. Log in as master admin → go to `/social`
2. Click **Trigger scrape**
3. Posts should appear in the feed

---

## 9. Optional — API Keys

These are not required — the app works without them, but AI features are skipped.

### OpenRouter (AI classification)

1. Sign up at [https://openrouter.ai](https://openrouter.ai)
2. Go to **Keys** → **Create Key**
3. Add to Railway env vars as `OPENROUTER_API_KEY`
4. Free tier includes several models. The app uses an OpenAI-compatible endpoint.

### X / Twitter Bearer Token

1. Sign up at [https://developer.twitter.com](https://developer.twitter.com)
2. Create a project and app → copy the **Bearer Token**
3. Add to Railway env vars as `X_BEARER_TOKEN`
4. Free tier allows read-only access, which is all the scraper needs.

After adding either key, Railway will automatically redeploy.

---

## 10. Updating After Code Changes

### Backend update
```bash
git add .
git commit -m "your change"
git push
```
Railway detects the push and redeploys automatically. Takes ~1-2 minutes.

### Frontend update
Same — push to GitHub. Vercel detects the push and rebuilds automatically. Takes ~1 minute.

### Re-seeding (e.g. resetting master admin password)
Just run `node seed-admin.js` again from local with the updated `ADMIN_PASSWORD` env var. It will update the existing account.

---

## 11. Troubleshooting

### "Cannot reach the API" on the frontend
- Check that `VITE_API_BASE` is set correctly in Vercel env vars
- The value must not have a trailing slash: ✅ `https://...railway.app` ❌ `https://...railway.app/`
- Trigger a Vercel redeploy after changing env vars (they're baked into the build)

### "MongoDB connection failed" on Railway
- Double-check the `MONGODB_URI` — ensure the password has no special characters that need URL-encoding (replace `@` with `%40`, `#` with `%23` if present in the password)
- Confirm Atlas Network Access allows `0.0.0.0/0`
- Confirm the database user has read/write permissions

### "Invalid admin credentials"
- Make sure you ran `seed-admin.js` against the **production** MongoDB URI, not a local one
- The email in the login form must exactly match `ADMIN_EMAIL` (case-insensitive, but no extra spaces)
- Password must be at least 8 characters

### "Request failed (502)" on login
- The backend isn't running — check Railway deployment logs
- Go to Railway project → your service → **Deployments** → click the latest deployment → **View Logs**

### CORS errors in browser console
- The frontend `VITE_API_BASE` must point to the exact Railway domain
- Do not include a path like `/api` in `VITE_API_BASE` — just the base URL

### Uploads not persisting (images)
- Railway's filesystem is ephemeral — uploaded images are lost on redeploy
- For persistent uploads, integrate Cloudinary (free tier: 25 GB): store the Cloudinary URL instead of a local path
- This is a known limitation on free Railway hosting

### Live complaints stream (SSE) not working
- Some proxies/CDNs buffer SSE. This is expected on some networks.
- The dashboard's **Refresh** button is the fallback — data is not lost, just not pushed.

---

## 12. Free Tier Limits

| Service | Limit | Notes |
|---|---|---|
| MongoDB Atlas M0 | 512 MB storage | Plenty for thousands of complaints |
| Railway Hobby | $5 free credit/month | ~500 hours of runtime — enough for always-on |
| Vercel Hobby | 100 GB bandwidth/month | More than enough for this app |

> **Railway note:** The free Hobby plan gives $5/month credit. A small Express app uses roughly $0.50–1/month, so it effectively runs free. If you exceed credits, the service sleeps. Upgrade to the $5/month Developer plan for guaranteed always-on.

---

## Quick Reference

| Thing | Where |
|---|---|
| Frontend URL | `https://YOUR_PROJECT.vercel.app` |
| Backend URL | `https://YOUR_PROJECT.up.railway.app` |
| Admin login | `https://YOUR_PROJECT.vercel.app/admin/login` |
| Citizen signup | `https://YOUR_PROJECT.vercel.app/signup` |
| Health check | `https://YOUR_PROJECT.up.railway.app/api/health` |
| Atlas dashboard | `https://cloud.mongodb.com` |
| Railway dashboard | `https://railway.app/dashboard` |
| Vercel dashboard | `https://vercel.com/dashboard` |
