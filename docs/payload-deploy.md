# Deploying Payload CMS to production

This dashboard runs Payload CMS *inside* the same Next.js process at
`/admin`. Public reads, drafts, previews, and the writing surface all
live in this one app.

The deployment story has three pieces that must line up:

1. **Postgres** for Payload's data
2. **Environment variables** on Vercel
3. **First-run schema sync** (one-time)

## 1. Postgres

Payload writes to the database pointed to by `PAYLOAD_DATABASE_URL`. It
is intentionally kept *separate* from `DATABASE_URL` (which Prisma uses
for the existing developer-keys / entities / subscribers tables). Two
options for prod:

- **Same physical database, separate logical isolation.** Set
  `PAYLOAD_DATABASE_URL` to the same Supabase Postgres connection string,
  optionally with a different schema. Payload will create its tables
  alongside Prisma's — no name collisions
  (`users`, `media`, `blog_posts`, `payload_*`).
- **Separate database for content.** A second Supabase project (or any
  Postgres host) reserved for CMS content. Cleaner blast radius — wiping
  CMS data can't touch Prisma data — and keeps content backups
  independent.

Recommended: separate database. The $0 Supabase project has plenty of
room for a year of blog content.

## 2. Vercel environment variables

| Var | Scope | Notes |
|-----|-------|-------|
| `PAYLOAD_DATABASE_URL` | Production + Preview | Postgres connection string for the CMS DB. Use the **pooled** URL (port 6543 on Supabase) — Payload reuses connections and Vercel functions are short-lived. |
| `PAYLOAD_SECRET` | Production + Preview | 64-char hex string. Generate locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and **never reuse the local dev value**. |
| `NEXT_PUBLIC_SITE_URL` | Production + Preview | Used by the Preview button to compose `/blogs/<slug>?preview=true`. Set to `https://www.zynd.ai` in prod. |

Add via the Vercel dashboard or CLI:

```bash
vercel env add PAYLOAD_DATABASE_URL production
vercel env add PAYLOAD_SECRET production
vercel env add NEXT_PUBLIC_SITE_URL production
```

`DATABASE_URL` and `DIRECT_URL` (for Prisma) stay as-is.

## 3. First-run schema sync

Local dev uses `push: true` — Payload auto-creates tables on first
request. **Production uses `push: false`** (this is enforced by
`process.env.NODE_ENV !== "production"` in `src/payload.config.ts`),
so the production DB needs schema applied via migrations.

There is currently a known upstream incompatibility between
`payload@3.84` and `next@16.2`'s `@next/env` package shape — the
official `payload migrate` CLI crashes under tsx's CJS loader. We
work around this two ways:

- **For now:** before the first prod deploy, set `push: true` on a
  one-time deploy, hit `/admin` once to materialize the tables, then
  redeploy with `push: false`. Ugly but safe — the operation is
  additive and won't touch Prisma's tables.
- **Once upstream is fixed:** revert to standard migrations:
  ```bash
  npx tsx scripts/payload-migrate.mts migrate:create init
  git add payload-migrations/
  npx tsx scripts/payload-migrate.mts migrate
  ```

The patch we apply in `node_modules/payload/dist/bin/loadEnv.js`
(turning `loadEnv` into a no-op) is a local workaround only — it
should be removed once Payload upgrades `@next/env`.

## 4. Seeding the existing posts

Once the prod DB has tables, run the seed script against it to insert
metadata for the 5 hand-coded blog posts:

```bash
PAYLOAD_DATABASE_URL=<prod-pooled-connection> \
PAYLOAD_SECRET=<prod-secret> \
  npx tsx scripts/seed-blog-posts.mts
```

The script is idempotent (re-runs are safe). It creates **drafts**, not
published entries — the public `/blogs/<slug>` route still serves the
hand-coded `src/app/(site)/blogs/<slug>/page.tsx` for those slugs.

## 5. Sequencing the rollout

1. Merge `feat/payload-cms` into `main` on a quiet day.
2. Add the three env vars to Vercel.
3. First deploy with `push: true` (temporarily flip in
   `src/payload.config.ts`), hit `/admin/create-first-user` to seed the
   admin user, confirm tables exist in the DB.
4. Flip `push: false`, redeploy.
5. Run `npm run seed:blog-posts` against the prod DB.
6. The 5 hand-coded posts now have CMS scaffolds (status: draft). Edit
   each one in the admin, paste the body in, set status to *published*,
   then delete `src/app/(site)/blogs/<slug>/page.tsx` to hand routing
   over to the dynamic `[slug]` route.

## 6. What to watch after deploy

- `/admin` returns 200 and the login screen renders.
- `/api/payload-preferences/...` returns 200 for an authenticated admin.
- `/blogs` lists at least the 5 static posts (CMS posts only show
  *after* you publish them).
- Image uploads land in the configured storage. Today this is local
  filesystem under `media/` — for production, plug in
  `@payloadcms/storage-s3` or `@payloadcms/storage-vercel-blob`
  before going live, otherwise uploaded images vanish on each deploy.
