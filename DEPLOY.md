# SkillForge — Deployment Guide

## Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New Project**.
3. Choose your organisation, enter a project name (e.g. `skillforge`), set a strong database password, and pick the region closest to your users.
4. Wait ~2 minutes for the project to provision.

---

## Step 2 — Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** → **New Query**.
2. Open `supabase/schema.sql` from this repo and paste the entire contents.
3. Click **Run** (Ctrl+Enter / Cmd+Enter).
4. You should see "Success. No rows returned." — this is correct.
5. Verify the tables exist: **Table Editor** should show `profiles`, `categories`, `skills`, `downloads`, `favorites`, `comments`, `site_settings`.
6. Verify the storage bucket exists: **Storage** → `skill-files` should appear as a public bucket.

---

## Step 3 — Copy API Keys

1. In the Supabase dashboard go to **Project Settings** → **API**.
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 4 — Add Environment Variables Locally

Fill in `.env.local` at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

Test locally with `npm run dev` — the site should now load categories from the DB.

---

## Step 5 — Enable Email Auth

1. Supabase dashboard → **Authentication** → **Providers**.
2. Confirm **Email** is enabled (it is by default).
3. Optional: disable **Confirm email** during development (Auth → Settings → toggle off "Enable email confirmations").

---

## Step 6 — Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the GitHub repo.
3. Framework Preset: **Next.js** (auto-detected).
4. Under **Environment Variables**, add the three keys from Step 3.
5. Click **Deploy**.

> Vercel automatically runs `next build`. The first deploy takes ~2 minutes.

---

## Step 7 — Test the Full Flow

Run through this checklist after deploying:

- [ ] Home page loads categories and (if any) featured skills from DB
- [ ] `/skills` page loads all published skills
- [ ] `/signup` — create a new account → redirected to `/skills`
- [ ] Nav shows username and logout after sign-in
- [ ] `/submit` — submit a new skill form (this currently stores mock, not DB — use `/api/skills` POST directly or wire up the submit page)
- [ ] Upload a `.md` file via `POST /api/upload` (requires auth Bearer token)
- [ ] Create a skill via `POST /api/skills`
- [ ] Visit `/skills/[slug]` — content renders, download button works
- [ ] Download counter increments on the skill page
- [ ] Favorite button appears for logged-in users
- [ ] Logout via nav dropdown → redirected, nav shows logged-out state
- [ ] `/api/search?q=blog` returns matching skills

---

## Supabase Dashboard Cheatsheet

| Task                | Where                            |
| ------------------- | -------------------------------- |
| View all users      | Authentication → Users           |
| View skill rows     | Table Editor → skills            |
| Check storage files | Storage → skill-files            |
| Monitor API usage   | Reports → API                    |
| View logs           | Logs → Postgres / Edge Functions |
| Run SQL             | SQL Editor                       |

---

## Notes

- The **admin panel** at `/admin` uses its own hardcoded auth (unchanged from the original). It is independent of Supabase Auth.
- The **collections page** now persists through the `site_settings` table under the `collections` key. Make sure `supabase/schema.sql` has been applied so the table exists.
- The **submit page** (`/submit`) saves form state locally — wire it to `POST /api/skills` when you're ready to accept community submissions.
- Storage uploads are limited to **100 KB** per `.md` file by the bucket policy.
- Download rate limiting is **30 downloads per IP per hour**, tracked in the `downloads` table (no Redis required).
