# ShopAffiliate — Amazon Affiliate Storefront

An Amazon-style affiliate product-recommendation site. Curate products, send visitors to Amazon via your affiliate links, and earn commissions. Built with Next.js 16, Prisma, Tailwind CSS, and shadcn/ui.

> **Affiliate model:** This site does **not** sell products. It curates listings and refers shoppers to Amazon. There is no cart, checkout, or orders — the primary action is "View on Amazon" (tracks the click, then opens your affiliate URL).

## Features

- **Storefront**: hero carousel, trending rail (driven by click data), today's deals, product grid with search + advanced filters (price, brand, rating, availability), product detail with image gallery + Specs/Details/Reviews tabs.
- **Affiliate actions**: "View on Amazon" click-throughs (tracked), wishlist, side-by-side compare (up to 3), recently-viewed, share button.
- **Admin panel** (username + password): dashboard with click analytics + clicks-by-category, products CRUD, categories CRUD, analytics, and a **Settings** panel to configure your Amazon Associate tag and change your password.
- **Production-ready**: rate limiting, input validation, security headers (CSP, HSTS, X-Frame-Options), WCAG accessibility (skip link, ARIA, keyboard nav), SEO/AEO (metadata, JSON-LD, sitemap, robots), affiliate disclosure compliance.

## Quick start (local dev)

```bash
bun install
cp .env.example .env          # then edit .env
bun run db:push               # create SQLite schema
bun run db:generate           # generate Prisma client
bun run prisma/seed.ts        # seed categories + products + clicks
bun run prisma/seed-orders.ts # (optional) seed gallery images for products
bun run dev                   # http://localhost:3000
```

**Default admin login:** `admin` / `admin123` — **change this immediately** in Admin → Settings → Change Password.

## Where do I add my Amazon affiliate links?

This is the key setup step. You have two options:

### Option 1 (recommended): Set your Associate tag once
1. Sign up at the [Amazon Associates program](https://affiliate-program.amazon.com/) and get your tracking ID (e.g. `yourstore-20`).
2. Sign in to the admin panel → **Settings** → **Affiliate Configuration**.
3. Enter your **Amazon Associate Tag** and save.
4. Every "View on Amazon" click will now append `?tag=yourstore-20` to the product URL automatically. You don't need to edit each product.

### Option 2: Set per-product affiliate URLs
When creating/editing a product in Admin → Products, the **Affiliate URL** field accepts any full Amazon URL. If the URL already contains a `?tag=...`, your global tag won't be duplicated. Use this for products from different Amazon locales or custom campaigns.

> The Associate tag is applied server-side in `/api/track-click` — it's never exposed in the page source, which helps prevent tag-stripping.

## Deployment

### Prerequisites
- A [GitHub](https://github.com) account
- A [Cloudflare](https://cloudflare.com) account (Pages or Workers)
- A **hosted database** (SQLite files don't work on serverless edge runtimes):
  - **Recommended**: [Turso](https://turso.tech) (libSQL — Prisma supports it natively, generous free tier)
  - Alternatives: [Neon](https://neon.tech) (Postgres), [PlanetScale](https://planetscale.com) (MySQL)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/shopaffiliate.git
git push -u origin main
```
The included `.github/workflows/ci.yml` runs lint + type-check on every push/PR.

### Step 2: Set up a hosted database (Turso example)
```bash
# Install Turso CLI
curl -sSfL https://get.turso.tech | bash

# Create a database
turso db create shopaffiliate

# Get the connection URL + auth token
turso db show shopaffiliate --url
turso db tokens create shopaffiliate
```
Your `DATABASE_URL` will look like:
`libsql://shopaffiliate-<you>.turso.io?authToken=<token>`

### Step 3: Update Prisma datasource for production
For Turso (libSQL), install the adapter and change the datasource provider. See the [Prisma + Turso guide](https://www.prisma.io/docs/orm/overview/databases/turso). For Postgres (Neon), change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma` and run `bun run db:push`.

### Step 4: Deploy to Cloudflare
This project is configured for [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare):

```bash
# Install the Cloudflare adapter
bun add -D @opennextjs/cloudflare wrangler

# Build the Cloudflare worker
bunx opennextjs-cloudflare

# Deploy
bunx wrangler deploy
```

Or connect your GitHub repo in the **Cloudflare Pages dashboard**:
- Framework preset: Next.js
- Build command: `bunx opennextjs-cloudflare`
- Output directory: `.open-next`
- Environment variables (set in dashboard or via `wrangler secret`):
  - `DATABASE_URL` — your Turso/Neon connection string
  - `SESSION_SECRET` — `openssl rand -base64 32`
  - `NEXT_PUBLIC_SITE_URL` — `https://your-domain.com`

After the first deploy, run the schema migration against your hosted DB:
```bash
DATABASE_URL="libsql://..." bun run db:push
DATABASE_URL="libsql://..." bun run prisma/seed.ts
```

### Post-deploy checklist
- [ ] Change the admin password (Admin → Settings → Change Password)
- [ ] Set your Amazon Associate tag (Admin → Settings)
- [ ] Set `SESSION_SECRET` to a strong random value
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your real domain
- [ ] Replace placeholder product affiliate URLs with real Amazon links (or rely on the global tag)
- [ ] Verify the affiliate disclosure appears in the footer (Amazon Associates requirement)
- [ ] Test a "View on Amazon" click and confirm the URL includes your `?tag=`

## Tech stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM (SQLite for dev; Turso/Neon for prod)
- **Auth**: Cookie-session JWT (jose) + scrypt password hashing
- **Charts**: Recharts
- **Icons**: lucide-react

## Scripts
| Command | Description |
|---|---|
| `bun run dev` | Start dev server (port 3000) |
| `bun run lint` | ESLint |
| `bun run db:push` | Push schema to DB |
| `bun run db:generate` | Generate Prisma client |
| `bun run prisma/seed.ts` | Seed categories + products + clicks |
| `bun run prisma/seed-orders.ts` | Seed product gallery images |

## License
MIT — use this for your own affiliate site. As an Amazon Associate you must comply with the [Amazon Associates Operating Agreement](https://affiliate-program.amazon.com/help/operating/schedule).
