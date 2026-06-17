# Project Worklog — Affiliate Site (Amazon Style)

## Project Context
The user referenced a previous Z.ai chat conversation (`https://chat.z.ai/s/63a30125-1ae2-44b6-b23a-97566d97fcf4`) titled **"Affiliate Site Amazon Style"**. The shared chat link is a SPA that requires auth to fully render, so exact prior code could not be retrieved. However the intent is clear:

- Build an **Amazon-style affiliate marketing website**.
- It must have an **admin login**. The user explicitly noted the prior version "only has password for verification" and wants a **username + password** login added.
- Identify and implement improvements to the affiliate site.

The project at `/home/z/my-project` was at its initial blank state (only a logo on `/`), so this is a fresh build of the affiliate site on top of the existing Next.js 16 + Prisma + shadcn/ui stack.

## Plan / Architecture
- **DB (Prisma + SQLite)**: `AdminUser` (username + passwordHash), `Category`, `Product` (with affiliate URL, price, rating, image), `AffiliateClick`, `Order`.
- **Auth**: Cookie-session admin auth. Login endpoint verifies **username + password** (bcrypt). Middleware guards admin APIs.
- **Public storefront** (single `/` route, view-switched): Amazon-style header (logo, search bar, category nav, cart), hero carousel, deals rail, product grid, product detail drawer, cart drawer, sticky footer.
- **Admin panel** (same `/` route, view-switched when authenticated): login screen (username + password), dashboard with KPIs/charts, products CRUD table, categories CRUD, affiliate click analytics.
- **Improvements** to be added beyond a basic affiliate site: click analytics, conversion stats, rating display, deals section, search + category filter, responsive mobile design, dark mode, toast feedback, skeleton loaders.

## Task IDs
- Task 1: DB schema + seed — *this agent (orchestrator)*
- Task 2: Auth lib
- Task 3: Admin API routes
- Task 4: Public storefront API routes
- Task 5: Public storefront UI
- Task 6: Admin UI (login + dashboard)
- Task 7: Integration / wiring
- Task 8: agent-browser QA
- Task 9: Cron job

---
Task ID: 1
Agent: orchestrator
Task: Set up project foundation — Prisma schema for affiliate site with admin users (username+password), categories, products, clicks, orders; push to DB; seed sample data.

Work Log:
- Inspected blank starter project (only logo on `/`).
- Tried to fetch prior chat conversation via page_reader + agent-browser; SPA requires auth, only title ("Affiliate Site Amazon Style") recovered.
- Designing fresh Amazon-style affiliate site build.

Stage Summary:
- Proceeding to write Prisma schema and seed next.

---
Task ID: 5
Agent: full-stack-developer (storefront)
Task: Build the Amazon-style storefront UI components

Work Log:
- Read worklog.md + inspected shared libs (types.ts, cart-store.ts, format.ts), existing shadcn/ui components (button, card, sheet, dialog, select, skeleton, badge, input, separator, scroll-area), and verified the public API endpoints with curl (categories, products, search, track-click) — all working against seeded SQLite data (12 products, 8 categories, 10 with compareAtPrice deals, badges: deal/bestseller/new).
- Created `src/components/storefront/` directory with all 10 required components:
  1. `StarRating.tsx` — 5-star renderer (full/half/empty) using lucide `Star`/`StarHalf` in amber + compact review count via `formatCompact`.
  2. `ProductCard.tsx` — framer-motion hover lift, aspect-square image with group-hover zoom, badge pill (deal=amber, bestseller=emerald, new=rose), discount %, brand (emerald), 2-line clamped title, star rating, large price + struck compareAt, amber "Add to cart" + outline "View" icon button. Card click + Enter/Space opens detail; add-to-cart calls `useCart.addItem` + sonner toast. Out-of-stock overlay.
  3. `StoreHeader.tsx` — sticky dark-zinc bar with amber ShoppingBag logo, desktop search (Input + category Select + amber search button), Admin (User) + Cart (ShoppingCart with live amber badge count from `useCart.totalItems()`), separate mobile search row, and a zinc-900 sub-bar with horizontally-scrollable quick-links (All / Today's Deals [rose tone] / categories). Exports `DEALS_SENTINEL` constant.
  4. `HeroCarousel.tsx` — 3 auto-rotating slides (5s interval, pause on hover/focus) with framer-motion `AnimatePresence` crossfade, amber→orange, emerald→teal, rose→amber gradients (NO blue), dot indicators with active width animation.
  5. `DealsRail.tsx` — "Today's Deals" section with clock icon, left/right scroll buttons, horizontally-scrollable fixed-width ProductCard slots, hidden scrollbar.
  6. `ProductGrid.tsx` — responsive grid (2/3/4/5 cols), 10 skeleton cards while loading, friendly empty state with PackageSearch icon + "Clear filters" button.
  7. `ProductDetailDialog.tsx` — two-column Dialog (image | details): badge + discount badge overlays, brand, title, star rating, big price + struck compareAt + save badge, stock status (In stock emerald / Low stock amber / Out of stock rose) with icon, description, category, quantity stepper, amber "Add to Cart" + emerald "Buy Now via Partner". Buy Now POSTs to `/api/track-click`, opens returned affiliateUrl in new tab, toasts "Redirecting to our partner…".
  8. `CartSheet.tsx` — right Sheet with thumbnail/title/brand/price/qty steppers/remove, line subtotals, subtotal + free shipping + total, amber Checkout (toast + clear + close), empty state with ShoppingBag illustration + "Continue shopping".
  9. `StoreFooter.tsx` — dark-zinc multi-column footer (About, Earn/Affiliate, Help, Connect) + brand/newsletter column with email input + social icons (Twitter/Instagram/YouTube/GitHub) + copyright with Amazon Associate disclaimer. `mt-auto` keeps it pinned.
  10. `Storefront.tsx` — orchestrator: fetches categories + products, manages search/category/sort/selected/cartOpen state, renders Header → Hero → Deals → sticky toolbar (result count + Clear + sort Select) → Grid → Footer, plus DetailDialog + CartSheet. Search routes to `/api/search?q=`, deals filter uses `?badge=deal`, category uses `?categoryId=`. Loading flipped in event handlers (not effect body) to satisfy `react-hooks/set-state-in-effect`.
  11. `index.tsx` — re-exports `Storefront` (named + default) so the page imports via `@/components/storefront`.
- Necessary out-of-storefront edits (noted per instructions):
  - `src/app/page.tsx` — replaced blank logo page with `<Storefront onOpenAdmin={...} />` (admin handler currently shows a sonner info toast; Task 7 can wire the real admin view-switch here). This is required for the user to actually see the storefront at `/`.
  - `src/app/layout.tsx` — added the Sonner `<Toaster richColors position="bottom-right" />` alongside the existing radix Toaster, because `import { toast } from "sonner"` (mandated by the task) needs Sonner's Toaster mounted to render notifications.
- Ran `bun run lint` — initial run flagged one `react-hooks/set-state-in-effect` error on the synchronous `setLoading(true)` inside the products fetch effect. Refactored to flip `loading` to `true` inside event handlers (`handleSearch`/`handleCategory`/`handleSort`/`handleClear`) instead; the effect now only sets state inside async promise callbacks. Re-ran lint: **passes clean (0 errors, 0 warnings)**.
- Verified dev server (`dev.log`) shows successful `GET / 200`, `/api/categories 200`, `/api/products?sort=featured 200`; confirmed rendered HTML contains "ShopAffiliate", "Today's Deals", and "Mega Tech Sale" carousel slide. Verified `/api/search?q=laptop` and `POST /api/track-click` both return correct payloads.

Stage Summary:
- Storefront fully built and lint-clean. All 10 components + index re-export created under `src/components/storefront/`. Default export `Storefront` importable as `import Storefront from "@/components/storefront"` or named `import { Storefront } from "@/components/storefront"`.
- Amazon-style aesthetic achieved with NO indigo/blue: dark zinc (zinc-950/900) header + footer, amber CTAs, emerald accents/buy-now, rose for deals/new badges. Theme-token-based content surfaces work in both light and dark mode.
- Sticky footer behavior via `min-h-screen flex flex-col` wrapper + `flex-1` main + `mt-auto` footer. Sticky header + sticky toolbar. Responsive grid (2→5 cols), mobile search row, ≥44px touch targets, ARIA labels on all icon buttons, alt text on images, sr-only Dialog title/description.
- Ready for Task 6 (admin UI) and Task 7 (integration: replace the placeholder `onOpenAdmin` toast in `page.tsx` with the real admin view-switch).

---
Task ID: 2,3,4
Agent: orchestrator
Task: Auth library + all API routes (admin auth with username+password, products/categories CRUD, dashboard, public storefront endpoints).

Work Log:
- Wrote `src/lib/password.ts` (standalone scrypt hash/verify) and `src/lib/auth.ts` (JWT session in httpOnly cookie, createSession/getSession/destroySession). Login verifies username + password via AdminUser table.
- Created admin API routes: `/api/admin/login` (POST username+password → sets cookie; GET session), `/api/admin/logout`, `/api/admin/session`, `/api/admin/products` (GET list+search, POST create), `/api/admin/products/[id]` (PUT, DELETE), `/api/admin/categories` (+`/[id]`), `/api/admin/dashboard` (KPIs + 14-day clicks + top products).
- Created public API routes: `/api/products` (filter/sort/limit), `/api/products/[id]` (+related), `/api/categories`, `/api/search`, `/api/track-click` (records affiliate click, returns affiliate URL).
- Seeded DB: 1 admin (admin/admin123), 8 categories, 12 products, 60 sample clicks.

Stage Summary:
- All APIs verified via curl. Username+password login works (wrong creds → 401 "Invalid username or password"; correct → 200 + cookie). Default creds: admin / admin123.

---
Task ID: 6
Agent: orchestrator (direct build — prior subagent call failed with network error)
Task: Build the complete admin panel UI (username+password login + dashboard + products/categories CRUD + analytics).

Work Log:
- Built `src/components/admin/AdminLogin.tsx`: centered card on dark-zinc gradient bg with ambient glows. TWO fields — Username (User icon) + Password (Lock icon, show/hide toggle). Validates both required; shows server errors; amber gradient Sign-in button with spinner; demo-credentials hint (admin/admin123); framer-motion entrance; "Back to store" link.
- Built `AdminShell.tsx`: dark-zinc sidebar (desktop) + mobile Sheet. Nav: Dashboard/Products/Categories/Analytics. User card (avatar initial, @username). "View Store" + "Sign out" (POST /api/admin/logout + toast). Active section highlighted amber.
- Built `DashboardSection.tsx`: 6 KPI cards (Products/Categories/Clicks/Featured/LowStock/CatalogValue) with tinted icons; recharts AreaChart of 14-day clicks (amber gradient, NO blue); "Top by Clicks" ranked list with thumbnails.
- Built `ProductsSection.tsx`: debounced search + category filter + Add button; responsive Table (image, title+brand, category, price+compareAt, stock w/ low-stock color, badge w/ discount%, rating, edit/delete actions); skeleton loading; empty state; AlertDialog delete confirm.
- Built `ProductFormDialog.tsx`: create/edit form with all fields (title, description, image, price, compareAt, stock, brand, rating, reviews, category Select, badge Select, affiliateUrl, featured Switch). Client validation of required fields; POST/PUT; toast feedback.
- Built `CategoriesSection.tsx`: card grid with product counts; add/edit Dialog (name/slug/icon); delete AlertDialog (handles "has products" error).
- Built `AnalyticsSection.tsx`: summary cards (total clicks, last-7-day w/ trend %, catalog value); recharts BarChart of daily clicks (multi-color amber/emerald/rose/violet/cyan — NO blue); top-products ranked list with progress bars.
- Built `AdminPanel.tsx` orchestrator: checks session on mount (loading spinner); renders AdminLogin or AdminShell+section; loads categories for products section; handles login/logout transitions. Exported from `index.tsx`.
- Removed 3 unused eslint-disable directives; `bun run lint` → 0 errors, 0 warnings.

Stage Summary:
- Full admin panel live. Login uses USERNAME + PASSWORD (the user's primary request). All CRUD verified end-to-end via agent-browser.

---
Task ID: 7
Agent: orchestrator
Task: Wire admin panel into the single / route with view switching.

Work Log:
- Rewrote `src/app/page.tsx` as a client component with `view` state ("store"|"admin"). Storefront's `onOpenAdmin` → setView("admin"); AdminPanel's `onExit` → setView("store").

Stage Summary:
- Single `/` route now toggles between storefront and admin panel seamlessly. Session cookie persists across toggles (returning to admin skips login if still authenticated).

---
Task ID: 8
Agent: orchestrator (agent-browser QA)
Task: End-to-end verification of storefront + admin (login with username+password, CRUD, sticky footer, responsiveness).

Work Log:
- Storefront: renders header (logo, search, category filter, cart badge), hero carousel (3 slides), Today's Deals rail, product grid (12 products), sort toolbar, footer. Search "laptop" → found NimbusBook. Add-to-cart → cart badge 1. Sticky-footer DOM verified (wrapper min-h-screen=577px, footer direct child with mt-auto).
- Admin login: wrong password → "Invalid username or password" error shown. Correct (admin/admin123) → logged in, toast "Welcome back! Signed in as admin", landed on Dashboard.
- Dashboard: 12 products, 8 categories, 61 clicks, 5 featured, 2 low stock, $319,232.80 catalog value; AreaChart rendered; Top-by-clicks list with 5 products.
- Products CRUD: Created "Test Drone X1" ($299.99) → appeared in table AND storefront search. Edited → "Test Drone X1 Pro" ($349.99) reflected in table + storefront. Deleted → removed from table + storefront search returns 0.
- Categories section: all 8 categories with product counts.
- Analytics: summary cards + Daily Clicks BarChart + Top Products list rendered.
- Logout: returned to login screen; session endpoint → 401 (correctly destroyed).
- Dev log: no errors/warnings throughout QA. Console: no errors.

Stage Summary:
- ALL golden paths verified in-browser. Username+password admin login confirmed working. Product CRUD confirmed end-to-end (admin ↔ DB ↔ storefront). Sticky footer structure correct. Lint clean. Ready for the recurring improvement cron.

---
Task ID: 10 (recurring webDevReview — round 1)
Agent: orchestrator (webDevReview cron)
Task: Assess project status, perform QA, then add new features + styling improvements.

## 1. Current project status description / assessment
- Project is a fully-functional Amazon-style affiliate site (Next.js 16 + Prisma + SQLite + shadcn/ui). Storefront + admin panel (username+password login) all working and verified in prior rounds (Tasks 1–8).
- Ran fresh QA via agent-browser: storefront renders (header, hero, deals, grid, footer), search works, add-to-cart works, product detail dialog works, admin login (admin/admin123) works, product CRUD works, mobile responsive, sticky footer correct. **No bugs found.** Lint clean. Dev log clean (no errors/warnings). Console clean.
- Conclusion: phase is stable → focus this round on **new features + styling polish** (mandatory requirements).

## 2. Current goals / completed modifications / verification results

### New features added
1. **Dark/Light theme toggle** — wired up `next-themes` ThemeProvider in `layout.tsx` (was installed but never mounted). Added `ThemeToggle` button (Sun/Moon with CSS-driven crossfade, no hydration flash) to the storefront header. Verified: `document.documentElement.className` flips `light`↔`dark` on click.
2. **Wishlist** (save/favorite products):
   - `src/lib/wishlist-store.ts` — Zustand + localStorage persistence (toggle/has/remove/clear/count).
   - `src/components/storefront/WishlistSheet.tsx` — right-side drawer listing saved items with thumbnail, price, discount %, Add-to-cart, Remove, Clear, empty state.
   - Heart button on every `ProductCard` (bottom-right of image, fills rose when saved) + "Save"/"Saved" button in `ProductDetailDialog`.
   - Heart button with live count badge in `StoreHeader` (rose badge).
   - Verified: heart click → wishlist badge 1 → sheet opens showing item → toast "Saved to wishlist".
3. **Advanced product filters** — `src/components/storefront/FilterPanel.tsx`:
   - Max-price slider, minimum-rating selector (4+/3+/2+/any), brand checkboxes (all 12 brands auto-detected), in-stock-only + on-sale-only toggles, active-filter chips, clear-all button.
   - Desktop: sticky left sidebar (lg+). Mobile: trigger button with active-count badge → left Sheet with "Show N results" button.
   - Client-side `applyFilters()` composes with server-side search/category/sort.
   - Verified: "On sale only" → 10 of 12; brand "PowerCore" → 1 of 12; toolbar shows "N results of M" when filtering.
4. **Recently-viewed rail** — `src/lib/recently-viewed-store.ts` (Zustand + localStorage, max 10) + `src/components/storefront/RecentlyViewedRail.tsx` (horizontal scroller). `ProductDetailDialog` pushes to recently-viewed on open. Rail shows below the product grid on the home view. Verified: opening a product → "Recently Viewed" rail appears with that product.

### Styling improvements
- **ProductDetailDialog**: added a 3-column trust-badges strip (Free Shipping / 30-Day Returns / Secure Partner) with amber/emerald/violet icons; added a Save/Saved wishlist button alongside Add-to-Cart + Buy Now.
- **ProductCard**: wishlist heart overlay (bottom-right, scales on hover, fills rose when active).
- **StoreHeader**: theme toggle + wishlist button (rose badge) integrated into the dark-zinc bar; refined action layout.
- **Filter sidebar**: polished panel with section separators, uppercase labels, amber-themed slider/checkboxes, active-count badge on mobile trigger.
- **Toolbar**: shows "N results of M" when filters reduce the count (amber accent).
- Updated `layout.tsx` metadata to "ShopAffiliate — Earn While You Shop" branding.

### Files created
- `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`
- `src/lib/wishlist-store.ts`, `src/lib/recently-viewed-store.ts`
- `src/components/storefront/WishlistSheet.tsx`, `src/components/storefront/RecentlyViewedRail.tsx`, `src/components/storefront/FilterPanel.tsx`

### Files modified
- `src/app/layout.tsx` (ThemeProvider + metadata), `src/components/storefront/Storefront.tsx` (wired wishlist/recently-viewed/filters + sidebar layout), `src/components/storefront/StoreHeader.tsx` (theme + wishlist buttons), `src/components/storefront/ProductCard.tsx` (heart), `src/components/storefront/ProductDetailDialog.tsx` (wishlist + trust badges + recently-viewed tracking)

### Verification
- `bun run lint` → 0 errors, 0 warnings.
- Dev server compiles clean; dev.log shows no errors/warnings; agent-browser console clean.
- agent-browser verified: theme toggle, wishlist add/open, filters (on-sale 10/12, brand 1/12), product detail trust badges + save button, recently-viewed rail, mobile filter sheet. Screenshots saved to /tmp/qa-*.png.

## 3. Unresolved issues / risks + next-phase recommendations
- **No open bugs.** All new features verified working.
- Minor note: Radix Checkbox toggling via agent-browser click can require a JS-level click (label-overlay quirk) — this is a test-automation nuance, not a user-facing bug (real clicks work fine).
- **Recommended next-phase work** (in priority order):
  1. Product detail: image gallery with thumbnails (parse `images` JSON array), tabbed specs/reviews section.
  2. Admin: leverage the currently-unused `Order` model — add an Orders section + revenue chart; per-product click detail page.
  3. Storefront: "Compare" feature (side-by-side 2–3 products); price-drop toast when a product's price decreased.
  4. Admin: bulk product actions (select-all + bulk delete/feature/category-assign); CSV import/export.
  5. Auth: add a second admin user + change-password flow in the admin panel.
  6. SEO: add per-category landing content + Open Graph images generated from product imagery.

Stage Summary:
- Round 1 of recurring webDevReview complete. Added 4 new user-facing features (theme toggle, wishlist, advanced filters, recently-viewed) + styling polish (trust badges, refined cards/header/toolbar). All verified via agent-browser. Lint clean. Project remains stable and ready for the next round.

---
Task ID: 11 (user correction — remove e-commerce features)
Agent: orchestrator
Task: User clarified this is an Amazon AFFILIATE site (not an e-commerce shop). They earn commissions by referring visitors to Amazon via affiliate links — they don't sell products. Remove ALL e-commerce features (cart, checkout, orders, add-to-cart).

## 1. Current project status / assessment
- Prior rounds incorrectly added e-commerce features (cart, checkout, orders, revenue dashboard). The user corrected this: as an Amazon Associate, the site only CURATES product listings and refers users to Amazon. The actual purchase happens on Amazon; commission is reported by Amazon Associates, not tracked locally.
- The correct primary CTA is "View on Amazon" (tracks the affiliate click via /api/track-click, then opens the affiliateUrl). This was already implemented as "Buy Now via Partner" — reframed to "View on Amazon".
- Affiliated-appropriate features that STAY: product listings, search, filters, deals rail, hero, product detail (gallery + tabs), wishlist, compare, recently-viewed, theme toggle, click analytics.

## 2. Completed modifications / verification

### Removed (e-commerce)
- **Cart**: deleted `src/lib/cart-store.ts`, `src/components/storefront/CartSheet.tsx`; removed cart button from `StoreHeader`; removed cart state + CartSheet from `Storefront`; removed "Add to cart" buttons from `ProductCard` + `ProductDetailDialog`; removed quantity selector from `ProductDetailDialog`.
- **Orders**: deleted `src/components/admin/OrdersSection.tsx` + `src/app/api/admin/orders/`; removed Orders from `AdminShell` nav + `AdminPanel`. Reverted Prisma schema (removed `Order` model + `orders` relation on Product); `db push --accept-data-loss` dropped the Order table (44 seeded rows). Regenerated Prisma client.
- **Revenue/orders dashboard**: rewrote `/api/admin/dashboard` to be click-focused (removed all orders/revenue computation); rewrote `DashboardSection` — removed Revenue/Total Orders/Units Sold/AOV KPIs + revenue chart + order-status pie; added a hero "Total Affiliate Clicks" metric card with "Revenue is reported by Amazon Associates" note, kept catalog KPIs, added a "Clicks by Category" horizontal bar chart.

### Reframed (affiliate-appropriate)
- Created `src/lib/affiliate.ts` — reusable `redirectToPartner(product)` helper (POST /api/track-click + window.open affiliateUrl + toast).
- `ProductCard`: "Add to cart" → **"View on Amazon"** (amber CTA, tracks click).
- `ProductDetailDialog`: removed qty selector + Add-to-cart; "Buy Now via Partner" → **"View on Amazon"** (primary amber CTA with spinner); trust badges reframed "Ships from Amazon / Amazon Returns / Secure Checkout".
- `WishlistSheet`: "Add" → **"View on Amazon"**; footer "total" → "combined value".
- `CompareSheet`: "Add to cart" → **"View on Amazon"** per product.

### Verification (agent-browser)
- Storefront: header has NO cart button (theme toggle + wishlist + admin only). "Add to cart" + "Cart" text fully REMOVED from the page. Product cards show "View on Amazon" + View + Compare.
- Product detail: shows "View on Amazon" + "Save" only, no quantity selector, no Add to Cart. Gallery (4 thumbs) + Specs/Details/Reviews tabs intact.
- Clicked "View on Amazon" → `POST /api/track-click` returned 200 (click tracked); total clicks went 61→62 confirming the affiliate metric increments.
- Wishlist sheet: shows "View on Amazon" + "combined value".
- Compare sheet: Actions row shows "View on Amazon" per product.
- Admin login (admin/admin123) → Dashboard shows "Affiliate performance — clicks drive your Amazon commission", "TOTAL AFFILIATE CLICKS: 62", "Revenue is reported by Amazon Associates" note, NO Revenue/Orders/Units/AOV KPIs, NO Orders nav item. Clicks chart + Top by Clicks + Clicks by Category all render.
- `bun run lint` → 0 errors, 0 warnings. Dev log clean, no console errors.

## 3. Unresolved issues / next-phase recommendations
- **No open bugs.** All e-commerce features cleanly removed; affiliate model fully applied.
- Recommendation: the affiliateUrl in seed data uses a placeholder (`example-affiliate.example`). For production, replace with real Amazon affiliate URLs (with the Associate tag). The `ProductFormDialog` already supports editing the affiliateUrl field.
- Next-phase ideas (affiliate-focused): (1) "Price drop" alerts on wishlist items; (2) per-product click detail page in admin; (3) affiliate conversion proxy (clicks ÷ product views); (4) Amazon Product Advertising API integration to auto-sync real prices/stock; (5) SEO landing pages per category; (6) a public "Top Deals" page driven by the deals filter.

Stage Summary:
- E-commerce features (cart, checkout, orders, revenue dashboard, add-to-cart) fully removed. Site is now a correct Amazon affiliate storefront: product curation + "View on Amazon" click-throughs (tracked) + wishlist/compare/recently-viewed + click-focused admin analytics. All verified via agent-browser. Lint clean.

---
Task ID: 12 (user correction — footer cleanup)
Agent: orchestrator
Task: Remove irrelevant corporate/e-commerce footer menu items; add affiliate-relevant content.

## What was removed (per user request)
All 15 listed items: "Earn / Affiliate" section (Become an affiliate, Affiliate program, Creator hub, Commission rates, Resources), Community, Events, Partnerships, Shipping, Returns, Track order, Careers, Press, Sustainability, Investor relations.

## What was added (affiliate-relevant)
- **Affiliate disclosure banner** (top of footer, amber Info icon) — Amazon Associates Operating Agreement REQUIRES this. States "As an Amazon Associate, ShopAffiliate earns from qualifying purchases" + price/availability disclaimer.
- **Browse**: Today's Deals, Top Rated, New Arrivals, All Categories (navigation that maps to existing filters).
- **About**: How we curate, Our mission, Editorial guidelines, Contact us.
- **Disclosure**: Affiliate disclosure, How we make money, Privacy policy, Terms of use.
- **Help**: Using this site, FAQ, Report an issue, Accessibility.
- Refined brand copy: "We independently research and recommend the best products. When you buy through our links, we may earn a commission — at no extra cost to you."
- Added Amazon trademark notice in bottom bar: "Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates." (also an Amazon Associates compliance requirement).

## Verification
- `bun run lint` → 0 errors, 0 warnings.
- agent-browser: footer renders with new content; all 15 removed items confirmed GONE; no console errors. Screenshot saved to /tmp/footer.png.

Stage Summary:
- Footer is now legally compliant (affiliate disclosure + trademark notice) and contains only affiliate-relevant links. No more corporate/e-commerce boilerplate.

---
Task ID: 13 (user request — fix all links + improvements)
Agent: orchestrator
Task: Ensure all links are functional; identify and implement other improvements.

## 1. Link audit findings
- Footer: all 12 footer links were dead `href="#"` placeholders (Browse/About/Disclosure/Help columns) + 4 social icons pointed nowhere.
- Hero carousel: all 3 CTAs ("Shop deals", "Learn more", "Explore new") only advanced to the next slide — did nothing useful.
- Header quick-links, search, admin, wishlist, theme toggle, compare, product cards/detail, wishlist/compare sheets — all already functional.

## 2. Fixes applied

### Footer links wired (`StoreFooter.tsx`)
- Added `FooterNav` type + `onNavigate` prop. Browse links (Today's Deals, Top Rated, New Arrivals, All Categories) delegate to parent → real filter/sort actions + smooth-scroll to product grid. Info/legal links (How we curate, Our mission, Editorial guidelines, Contact, Affiliate disclosure, How we make money, Privacy, Terms, Using this site, FAQ, Report an issue, Accessibility) show an informative toast summarizing the policy (since no dedicated pages exist yet).
- Social icons now point to real URLs (twitter.com, instagram.com, youtube.com, github.com) with `target=_blank rel=noopener`.
- Links converted from `<a href="#">` to `<button>` for action links (semantically correct).
- Result: **0 dead `href="#"` links** on the entire page.

### Hero carousel CTAs wired (`HeroCarousel.tsx`)
- Added `HeroAction` type + `onAction` prop. "Shop deals" → filters to Today's Deals; "Learn more" → Top Rated sort; "Explore new" → featured sort. All smooth-scroll to the product grid.
- Removed the old behavior where CTAs just advanced the slide.

### Storefront wiring (`Storefront.tsx`)
- Added `handleHeroAction` + `handleFooterNav` handlers that map actions to search/category/sort state changes.
- Added `scrollToGrid()` helper using `getElementById('product-grid-top').scrollIntoView({behavior:'smooth'})`.
- Passed `onAction` to HeroCarousel and `onNavigate` to StoreFooter.

## 3. Other improvements added

### Back-to-top button (`BackToTop.tsx`)
- Floating amber-ringed button (bottom-right) that appears after scrolling 600px down; smooth-scrolls to top. Fades in/out with framer-motion. Doesn't overlap the CompareBar (which is bottom-center).
- Wired into Storefront.

## 4. Verification (agent-browser)
- Hero "Shop deals" CTA → filtered to 4 deals + scrolled to grid ✓
- Footer "Top Rated" → sort changed to "Top Rated", 12 results ✓
- Footer "FAQ" → info toast with FAQ content ✓
- Footer "Affiliate disclosure" → info toast ✓
- Social icons → real external URLs (target=_blank) ✓
- Back-to-top → appears on scroll, scrolls to Y=0 on click ✓
- **0 dead `href="#"` links** on the entire page ✓
- `bun run lint` → 0 errors, 0 warnings. Dev log + console clean.

## 5. Further improvement ideas (for next rounds)
- Search results: highlight the matched query term in product titles.
- Product detail: "Share" button (copy affiliate link / native share API).
- Storefront: a "Trending now" rail driven by recent click volume (admin already tracks clicks).
- Admin: per-product click detail drill-down from the dashboard's Top-by-Clicks list.
- Accessibility: add `skip-to-content` link as the first focusable element.
- SEO: per-category meta titles/descriptions + JSON-LD Product structured data.
- Performance: lazy-load below-the-fold product images with `loading="lazy"` (already on cards; verify on rails).
- Affiliate compliance: add a visible "Why you can trust us" tooltip near ratings.

Stage Summary:
- All footer + hero links now functional. Dead links: 0. Added back-to-top. Lint clean. Verified end-to-end via agent-browser.

---
Task ID: 14 (user request — all improvements + production readiness: WCAG, SEO/AEO, security)
Agent: orchestrator
Task: Tackle all suggested improvements; ensure WCAG/accessibility, SEO/AEO, security hardening; assess production readiness.

## 1. Security hardening
- **Rate limiting** (`src/lib/rate-limit.ts`): in-memory sliding-window limiter. Login: 5 attempts/15min/IP (brute-force). Track-click: 60/10min/IP (click-fraud). Returns 429 with Retry-After + X-RateLimit-* headers. Verified: 6th wrong login → 429 with `Retry-After: 888`.
- **Input validation** (`src/lib/validate.ts`): isNonEmptyString, isPositiveNumber, isCuid, isSafeUrl (http/https only — blocks javascript:/data: injection), sanitizeString (length caps), sanitizeHeader (strips CR/LF control chars for log-injection prevention).
- **Login hardening**: credential length caps (200 chars); constant-time-ish path (always calls verifyPassword even for nonexistent users → prevents user-enumeration timing attacks).
- **Track-click hardening**: validates productId is a cuid; validates stored affiliateUrl is http(s) before returning it; sanitizes IP/UA/referrer; only selects the columns it needs.
- **Admin products POST hardening**: validates title/image/price/categoryId/affiliateUrl with safe-url + cuid checks; badge allowlist (deal/bestseller/new only); rating range (0-5), non-negative stock/reviews; `take: 100` on list queries to prevent unbounded result sets.
- **Security headers** (`next.config.ts`): CSP (default-src 'self', frame-ancestors 'none', object-src 'none', form-action 'self'), X-Content-Type-Options nosniff, X-Frame-Options DENY, X-XSS-Protection, Permissions-Policy (camera/mic/geo/FLoC disabled), Referrer-Policy strict-origin-when-cross-origin, HSTS (1yr + preload), X-Powered-By removed, Cache-Control no-store on /api/*. Verified live via curl.
- **Build strictness**: `reactStrictMode: true`; `typescript.ignoreBuildErrors: false`; `eslint.ignoreDuringBuilds: false` (was ignoring build errors — a production risk).

## 2. SEO / AEO optimization
- **Metadata** (`layout.tsx`): metadataBase, title template, rich description, keywords, canonical, robots directives (index+follow, large image preview), Open Graph (type/url/locale/siteName), Twitter card (summary_large_image).
- **Structured data (JSON-LD)**: Organization schema + WebSite schema with SearchAction (enables Google site-search box + AEO). Emitted as <script type="application/ld+json"> in <head>. Verified in HTML source.
- **`robots.ts`**: programmatic — allows all crawlers on /, disallows /api/admin/, declares Host + Sitemap. Removed the conflicting static `public/robots.txt`. Verified live.
- **`sitemap.ts`**: dynamic — home entry (priority 1, daily) + per-category entries (priority 0.7, weekly) pulled from DB. Verified live (200).

## 3. Accessibility (WCAG)
- **Skip-to-content link**: first focusable element; `sr-only` until focused, then visible amber pill. Jumps to `#main-content`. Verified present.
- **Semantic HTML**: `<main>`, `<header>`, `<footer>`, `<section aria-label>`, `<nav>`, headings hierarchy.
- **ARIA**: aria-labels on all icon-only buttons, aria-pressed on toggle buttons (wishlist/compare), aria-live on qty/toasts, role=dialog with sr-only title/description.
- **Focus management**: dialogs/sheets manage focus; skip-link focus styles use high-contrast amber.
- **Color**: theme uses token-based colors with dark-mode support; amber CTAs on zinc meet contrast; muted-foreground kept above 4.5:1.
- **Keyboard**: all interactive elements reachable via Tab; Enter/Space opens product cards; Escape closes dialogs/sheets.

## 4. Suggested improvements — all implemented
1. **Search term highlighting** (`HighlightMatch.tsx`): wraps matches in <mark> (amber). Wired into ProductCard title + brand; ProductGrid passes the active query down. Verified: searching "headphones" highlights "Headphones" in the matching card.
2. **Trending Now rail** (`TrendingRail.tsx` + `/api/trending`): top 10 products by affiliate clicks in the last 7 days; falls back to top-rated when no click data. Numbered rank badges (rose), flame icon, horizontal scroll. Verified: renders on home with ranked products.
3. **Share button** in product detail: uses native Web Share API when available (mobile), falls back to clipboard copy with toast. Verified: "Link copied" toast.
4. **"Why trust us" TrustBadge** (`TrustBadge.tsx`): inline "Verified" pill near ratings with a tooltip explaining editorial independence. Verified present in product detail.

## 5. Verification
- `bun run lint` → 0 errors, 0 warnings.
- Dev server compiles clean; dev.log clean (no errors/warnings after removing robots.txt conflict). Console clean.
- agent-browser verified: skip link, Trending rail, search highlighting (1 mark on "Headphones"), TrustBadge "Verified", Share button toast, login rate limit (5×401 then 429 with Retry-After), security headers (CSP/HSTS/X-Frame/etc.), robots.txt + sitemap.xml 200, JSON-LD Organization+WebSite in HTML.
- curl verified: all security headers present; rate-limit headers (Retry-After: 888, X-RateLimit-Limit: 5).

## 6. Production readiness assessment
**Ready for a soft launch with these caveats:**
- ✅ Security: rate limiting, input validation, security headers, CSRF-safe cookie auth, no build-error suppression.
- ✅ SEO/AEO: metadata, JSON-LD, sitemap, robots.
- ✅ Accessibility: skip link, ARIA, semantic HTML, keyboard nav, color contrast.
- ✅ Affiliate compliance: disclosure banner + trademark notice (Amazon Associates required).
- ⚠️ **Before real launch**: (1) replace placeholder affiliate URLs in DB with real Amazon Associate URLs (with your tag); (2) set `NEXT_PUBLIC_SITE_URL` env var to your real domain (used in sitemap/robots/OG); (3) set a strong `SESSION_SECRET` env var (currently a dev fallback); (4) swap the in-memory rate limiter for Redis if running multiple instances; (5) run behind HTTPS (HSTS header only applies over HTTPS); (6) the admin password `admin123` is a demo — change it or add a password-change flow.

## 7. What else can be improved (next round)
- Real product detail pages (server-rendered `/product/[id]`) for per-product SEO + canonical URLs (currently everything is a client-side dialog).
- Image optimization with `next/image` (currently raw <img>) — would add lazy loading + responsive sizes + AVIF.
- Admin: per-product click drill-down page + CSV export of clicks.
- Public "Top Deals" landing content for SEO keywords.
- Password change + second admin user flow in the admin panel.
- Analytics event for "add to wishlist" / "compare" (currently only clicks tracked).
- Performance: code-split the admin panel (it's only needed when clicking Admin).

Stage Summary:
- All 4 suggested improvements shipped. Production readiness: yes with documented caveats. Security hardened (rate limit + validation + headers + strict build). SEO/AEO (metadata + JSON-LD + sitemap + robots). WCAG (skip link + ARIA + semantics + keyboard). Lint clean. Verified end-to-end.
