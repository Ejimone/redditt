# Reddit Clone (Next.js + Strapi)

This workspace contains:

- `frontend`: Next.js App Router app (root folder)
- `backend`: Strapi CMS/API (`backend/`)

The app now uses real backend data for communities, posts, comments, rules, and voting.

## What Is Implemented

- Community creation and listing
- Subreddit feed from Strapi
- Create post (including optional image upload)
- Upvote/downvote posts and comments
- Comment creation and listing
- Rules and trending pages powered by backend data
- Strapi webhook endpoint for frontend cache revalidation
- Initial seed data on Strapi bootstrap

## 1. Environment Setup

Frontend (`.env.local`):

```bash
cp .env.example .env.local
```

Backend (`backend/.env`):

```bash
cp backend/.env.example backend/.env
```

Required frontend env values:

- `NEXT_PUBLIC_APP_URL` (your site origin for metadata, e.g. `http://localhost:3000` or your Vercel URL)
- `NEXT_PUBLIC_STRAPI_URL` (example: `http://localhost:1337`)
- `STRAPI_API_TOKEN` (Strapi API token with content read/write permissions)
- `STRAPI_WEBHOOK_SECRET` (must match webhook secret in Strapi webhook settings)
- `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`

## 2. Install Dependencies

```bash
npm install
cd backend && npm install
```

## 3. Run Locally

Terminal 1 (Strapi):

```bash
cd backend
npm run develop
```

Terminal 2 (Next.js):

```bash
npm run dev
```

Open `http://localhost:3000`.

## 4. Build Validation

Frontend:

```bash
npm run build
```

If `next build` fails with a Turbopack native-bindings error in your environment, use Webpack instead:

```bash
npx next build --webpack
```

Backend:

```bash
cd backend
npm run build
```

## 5. Strapi Webhook (Recommended)

Create a Strapi webhook to call:

- `POST https://<your-frontend-domain>/api/webhooks/strapi`
- Header: `x-webhook-secret: <STRAPI_WEBHOOK_SECRET>`

This keeps frontend pages fresh when content changes.

## 6. Vercel Deployment Checklist

1. Deploy Next.js app to Vercel from repo root.
2. Configure all frontend environment variables in Vercel.
3. Deploy Strapi separately (Render, Railway, Fly.io, etc.) and set `NEXT_PUBLIC_STRAPI_URL` to that public URL.
4. Ensure Strapi uploads are publicly reachable from the frontend domain.
5. Configure Strapi webhook to your Vercel URL (`/api/webhooks/strapi`).
