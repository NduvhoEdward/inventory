# Bench Inventory

Electronics parts inventory. Next.js frontend, data stored in Upstash Redis so your phone and desktop see the same list.

## 1. Create a free database (2 minutes)

1. Go to https://upstash.com and sign up (free tier is plenty for this).
2. Create a new **Redis** database (any region close to you is fine).
3. On the database's page, find the **REST API** section. Copy the two values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

Keep these handy for step 3.

## 2. Get the code onto Vercel

You have two options — pick whichever is easier for you.

### Option A — Vercel CLI, no GitHub needed (fastest)

In this project folder, on your own computer:

```bash
npm install -g vercel
npm install
vercel
```

`vercel` will ask you to log in (opens a browser) and a few setup questions — accept the defaults. It deploys a preview immediately.

### Option B — GitHub + Vercel dashboard (better if you'll keep editing it)

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repo on GitHub, then:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

Then on https://vercel.com: **Add New → Project**, import that GitHub repo, and click **Deploy**.

## 3. Add the environment variables

In your Vercel project: **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `UPSTASH_REDIS_REST_URL` | (from step 1) |
| `UPSTASH_REDIS_REST_TOKEN` | (from step 1) |

Apply to all environments (Production, Preview, Development), then go to **Deployments** and **redeploy** (env vars only take effect on a fresh deploy).

## 4. Open it

Vercel gives you a URL like `bench-inventory.vercel.app`. Open that on your phone and add it to your home screen (Share → Add to Home Screen on iOS, or the browser menu → Add to Home Screen on Android) so it behaves like an app icon.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev
```

Visit http://localhost:3000.

## Notes

- All parts data lives in one Redis key (`parts`), matching the same structure the artifact version used — nothing to migrate manually if you copy data across.
- A new database starts empty. Add your own components using **Add part**; the app never writes sample parts automatically.
- Search across names, locations, suppliers, part numbers, and specs. Filter by category or stock status, then sort by name, quantity, or storage location.
- On phones, category selection sits above the component cards and the part form opens as a bottom sheet.
- Failed loads show a retry action. Failed saves keep your form entries available so you can retry.
