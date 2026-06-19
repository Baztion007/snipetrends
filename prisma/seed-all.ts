import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { hashPassword } from "../src/lib/password";

/**
 * Comprehensive seed script — run this against ANY database (local SQLite
 * or production Turso) to populate it with all initial data:
 *   - Admin user
 *   - Categories
 *   - Products (with Amazon affiliate URLs)
 *   - Blog posts (4 SEO articles with rich markdown)
 *   - Site settings
 *   - Sample affiliate clicks
 *
 * Usage:
 *   DATABASE_URL="file:./db/custom.db" bun run prisma/seed-all.ts
 *   DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." bun run prisma/seed-all.ts
 *
 * Safe to run multiple times — it upserts/skips existing records.
 */

// Create a PrismaClient with adapter for Turso, or plain for local SQLite.
function createDB(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith("libsql")) {
    const adapter = new PrismaLibSql({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

const db = createDB();

const SAMPLE_EMAILS = [
  "olivia.martin@example.com", "liam.chen@example.com", "ava.patel@example.com",
  "noah.kim@example.com", "sophia.rivera@example.com", "ethan.wong@example.com",
  "mia.schmidt@example.com", "lucas.andrade@example.com",
];

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin user ───────────────────────────────────────────────────────────
  const existingAdmin = await db.adminUser.findUnique({ where: { username: "admin" } });
  if (!existingAdmin) {
    await db.adminUser.create({
      data: {
        username: "admin",
        passwordHash: hashPassword("admin123"),
        name: "Store Admin",
        role: "admin",
      },
    });
    console.log("  ✓ Admin user (admin / admin123)");
  } else {
    console.log("  ⊙ Admin user already exists");
  }

  // ─── Site settings ────────────────────────────────────────────────────────
  await db.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "SnipeTrends",
      contactEmail: "hello@snipetrends.com",
      amazonAssociateTag: "",
      amazonBaseUrl: "https://www.amazon.com",
    },
  });
  console.log("  ✓ Site settings");

  // ─── Categories ───────────────────────────────────────────────────────────
  const categories = [
    { name: "Electronics", slug: "electronics", icon: "Smartphone" },
    { name: "Home & Kitchen", slug: "home-kitchen", icon: "Home" },
    { name: "Audio", slug: "audio", icon: "Headphones" },
    { name: "Computers", slug: "computers", icon: "Laptop" },
    { name: "Wearables", slug: "wearables", icon: "Watch" },
    { name: "Gaming", slug: "gaming", icon: "Gamepad2" },
    { name: "Photography", slug: "photography", icon: "Camera" },
    { name: "Outdoor", slug: "outdoor", icon: "Mountain" },
  ];
  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const row = await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    catMap[c.slug] = row.id;
  }
  console.log("  ✓ Categories (" + categories.length + ")");

  // ─── Products ─────────────────────────────────────────────────────────────
  const products = [
    { title: "AuraSound Pro Wireless Noise-Cancelling Headphones", description: "Immerse yourself in studio-grade sound with adaptive active noise cancellation, 40-hour battery life, and plush memory-foam earcups. Bluetooth 5.3 with multipoint pairing.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", price: 199.99, compareAtPrice: 279.99, rating: 4.7, reviewCount: 12834, brand: "AuraSound", badge: "bestseller", featured: true, stock: 120, asin: "B0CHX1W1XY", categorySlug: "audio" },
    { title: "NimbusBook Air 14 Ultra-Thin Laptop", description: "16GB RAM, 1TB SSD, 14-inch 2.8K OLED display, all-day 18-hour battery. Featherlight aluminum chassis at just 1.1kg.", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80", price: 1099.0, compareAtPrice: 1299.0, rating: 4.6, reviewCount: 3421, brand: "Nimbus", badge: "deal", featured: true, stock: 45, asin: "B0CMDRCZBJ", categorySlug: "computers" },
    { title: "PulseFit Smartwatch Series 7", description: "Track 100+ workouts, SpO2, heart-rate, sleep and stress. AMOLED always-on display, 5ATM water resistance, 14-day battery.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", price: 149.99, compareAtPrice: 199.99, rating: 4.5, reviewCount: 8776, brand: "PulseFit", badge: "deal", featured: true, stock: 200, asin: "B0CHKX8W1X", categorySlug: "wearables" },
    { title: "VisionPro 4K Mirrorless Camera Kit", description: "26.1MP full-frame sensor, 8K video, in-body stabilization. Includes 24-70mm f/2.8 lens and travel case.", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80", price: 1899.0, compareAtPrice: 2199.0, rating: 4.8, reviewCount: 1543, brand: "VisionPro", badge: "new", featured: true, stock: 30, asin: "B0CHX1Z3QR", categorySlug: "photography" },
    { title: "HelixConsole X Pro Edition", description: "Next-gen gaming console with 1TB SSD, ray tracing, 120fps gaming and lightning-fast load times. Includes wireless controller.", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80", price: 499.99, rating: 4.9, reviewCount: 22098, brand: "Helix", badge: "bestseller", featured: true, stock: 60, asin: "B0CHX9W1XY", categorySlug: "gaming" },
    { title: "LuminaTab S 11-inch Tablet", description: "11-inch 120Hz display, 128GB storage, quad speakers with Dolby Atmos. Perfect for streaming, note-taking and light gaming.", image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80", price: 329.0, compareAtPrice: 399.0, rating: 4.4, reviewCount: 5610, brand: "Lumina", badge: "deal", stock: 90, asin: "B0CMDRCZBK", categorySlug: "electronics" },
    { title: "EchoBuds Mini True Wireless Earbuds", description: "Compact earbuds with ANC, wireless charging case, 28h total playtime, IPX5 sweat resistance.", image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80", price: 79.99, compareAtPrice: 99.99, rating: 4.3, reviewCount: 9120, brand: "EchoBuds", stock: 300, asin: "B0CHX1Z4QS", categorySlug: "audio" },
    { title: "ZenBrew Smart Coffee Maker", description: "App-controlled 12-cup coffee maker with adjustable strength, scheduled brewing and keep-warm. Stainless steel carafe.", image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80", price: 119.0, compareAtPrice: 149.0, rating: 4.5, reviewCount: 2890, brand: "ZenBrew", badge: "new", stock: 75, asin: "B0CHX1Z5RS", categorySlug: "home-kitchen" },
    { title: "TrailBlazer 45L Backpacking Pack", description: "Ultralight 45L hiking backpack with adjustable torso, rain cover, hydration compatibility and ventilated back panel.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", price: 159.0, rating: 4.6, reviewCount: 1788, brand: "TrailBlazer", stock: 110, asin: "B0CHX1Z6TS", categorySlug: "outdoor" },
    { title: "PowerCore 20000mAh Power Bank", description: "High-capacity 20000mAh power bank with 30W USB-C PD fast charging, charges phones up to 4 times.", image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80", price: 45.99, compareAtPrice: 59.99, rating: 4.7, reviewCount: 45210, brand: "PowerCore", badge: "bestseller", stock: 500, asin: "B0CHX1Z7US", categorySlug: "electronics" },
    { title: "MechType 75% Mechanical Keyboard", description: "Hot-swappable mechanical keyboard with RGB backlight, gasket mount, wireless/wired modes. Brown switches.", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80", price: 89.99, compareAtPrice: 119.99, rating: 4.6, reviewCount: 3344, brand: "MechType", badge: "deal", stock: 140, asin: "B0CHX1Z8VS", categorySlug: "computers" },
    { title: "GlowRing Smart LED Light Strip 5m", description: "16M colors, app + voice control, music sync. Cuttable LED strip perfect for room and desk ambiance.", image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80", price: 32.99, compareAtPrice: 49.99, rating: 4.4, reviewCount: 12876, brand: "GlowRing", stock: 400, asin: "B0CHX1Z9WS", categorySlug: "home-kitchen" },
  ];

  for (const p of products) {
    const existing = await db.product.findFirst({ where: { title: p.title } });
    if (existing) continue;
    await db.product.create({
      data: {
        title: p.title,
        description: p.description,
        image: p.image,
        images: JSON.stringify([p.image]),
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        rating: p.rating,
        reviewCount: p.reviewCount,
        brand: p.brand,
        badge: p.badge ?? null,
        featured: p.featured ?? false,
        stock: p.stock,
        affiliateUrl: `https://www.amazon.com/dp/${p.asin}`,
        categoryId: catMap[p.categorySlug],
      },
    });
  }
  console.log("  ✓ Products (" + products.length + ")");

  // ─── Sample affiliate clicks ──────────────────────────────────────────────
  const allProducts = await db.product.findMany();
  if ((await db.affiliateClick.count()) === 0) {
    const now = Date.now();
    for (let i = 0; i < 80; i++) {
      const p = allProducts[i % allProducts.length];
      await db.affiliateClick.create({
        data: {
          productId: p.id,
          createdAt: new Date(now - Math.floor(Math.random() * 14) * 86400000 - Math.random() * 86400000),
        },
      });
    }
    console.log("  ✓ Sample affiliate clicks (80)");
  }

  // ─── Blog posts ───────────────────────────────────────────────────────────
  const blogPosts = [
    {
      title: "Best Wireless Headphones 2026",
      slug: "best-wireless-headphones-2026",
      excerpt: "Our top picks for wireless headphones this year, from budget to premium.",
      coverImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
      category: "guides",
      tags: "headphones, wireless, audio, buying guide",
      content: `## Top Picks for 2026

Looking for the best wireless headphones? We tested dozens of models to find the best options for every budget.

### What to Look For

- **Battery life** — aim for 20+ hours
- **Active noise cancellation** — essential for travel
- **Comfort** — you will wear them for hours

### Our Recommendations

The **AuraSound Pro** is our top pick for premium buyers. It offers excellent noise cancellation, a 40-hour battery, and plush comfort.

For budget shoppers, the **EchoBuds Mini** delivers surprising quality at a fraction of the cost.

> **Pro tip:** If you wear glasses, look for headphones with over-ear cups rather than on-ear — they press less on your frames.

---

*This article contains affiliate links. As an Amazon Associate, we earn from qualifying purchases — at no extra cost to you.*`,
    },
    {
      title: "Smart Home Setup Guide: Everything You Need in 2026",
      slug: "smart-home-setup-guide-everything-you-need-in-2026",
      excerpt: "Transform your home into a smart home with our complete guide covering lighting, security, entertainment, and automation essentials.",
      coverImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80",
      category: "guides",
      tags: "smart home, automation, iot, guide",
      content: `## Why Build a Smart Home?

A smart home is not just about convenience — it is about security, energy efficiency, and peace of mind.

### The Essentials

1. **A smart hub or voice assistant** — Amazon Echo or Google Home serve as the brain of your setup.
2. **Smart lighting** — Replace traditional bulbs with smart LEDs like the GlowRing Light Strip.
3. **Smart plugs** — The cheapest way to make any appliance "smart."

### Smart Security

- **Smart doorbell** — See who is at your door from anywhere.
- **Smart locks** — Grant access to family members without physical keys.
- **Indoor cameras** — Keep an eye on pets, kids, or your home while traveling.

### Automation Ideas

- **Goodnight routine** — Lights dim, doors lock, and thermostat adjusts with one command.
- **Away mode** — Lights turn on and off randomly to simulate someone being home.
- **Morning routine** — Coffee maker starts, lights gradually brighten, and news plays.

> **Pro tip:** Stick to one ecosystem (Amazon Alexa or Google Home) for the smoothest experience.

---

*This article contains affiliate links. As an Amazon Associate, we earn from qualifying purchases — at no extra cost to you.*`,
    },
    {
      title: "Ultimate Gaming Setup: Build Your Dream Battle Station",
      slug: "ultimate-gaming-setup-build-your-dream-battle-station",
      excerpt: "From mechanical keyboards to 4K consoles, here is everything you need for the ultimate gaming experience.",
      coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
      category: "guides",
      tags: "gaming, setup, keyboard, console, guide",
      content: `## The Perfect Gaming Setup

Your gaming setup defines your experience. This guide covers every component you need.

### The Foundation: Desk and Chair

- **A sturdy desk** — At least 48 inches wide with cable management.
- **An ergonomic chair** — Lumbar support, adjustable armrests, breathable fabric.

### The Brain: Your Gaming Platform

#### PC Gaming

- **Mechanical keyboard** — The MechType 75% is our top pick. Hot-swappable switches and compact layout.
- **Gaming mouse** — Lightweight (under 70g), high-quality sensor, 2+ side buttons.

#### Console Gaming

The **HelixConsole X Pro** is the centerpiece: 4K gaming, ray tracing, 120fps, 1TB SSD.

### The Display

- **Competitive** — 24-27 inch, 144Hz+, 1ms response time.
- **Immersive** — 32+ inch 4K or OLED TV.
- **Console** — 55+ inch 4K TV with HDMI 2.1.

### Audio

- **Gaming headset** — The AuraSound Pro delivers immersive sound with noise cancellation.
- **Speakers** — 2.1 system with subwoofer for single-player games.

### Lighting

- **LED light strips** — The GlowRing adds ambient backlighting behind your monitor.
- **Bias lighting** — Reduces eye fatigue during long sessions.

> **Pro tip:** If you stream, invest in a capture card and a dedicated microphone.

---

*This article contains affiliate links. As an Amazon Associate, we earn from qualifying purchases — at no extra cost to you.*`,
    },
    {
      title: "Best Tech for Productivity: Work Smarter in 2026",
      slug: "best-tech-for-productivity-work-smarter-in-2026",
      excerpt: "From ultrabooks to mechanical keyboards, these are the tech tools that will actually make you more productive.",
      coverImage: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80",
      category: "reviews",
      tags: "productivity, laptop, keyboard, work from home, review",
      content: `## Productivity Tech That Actually Works

There is a difference between buying gadgets and buying tools that make you more productive.

### The Right Computer

The **NimbusBook Air 14** is our top recommendation:

- **16GB RAM** — Enough for browser tabs, Slack, and design tools.
- **1TB SSD** — Fast storage means apps open instantly.
- **18-hour battery** — Work a full day without a charger.
- **1.1kg weight** — Light enough to carry every day.

### The Keyboard Question

The **MechType 75%** is our productivity pick:

- **Tactile switches** — Brown switches give feedback without the loud click.
- **75% layout** — Smaller but keeps arrow keys and function row.
- **Wireless** — Bluetooth means a clean desk.

### Audio for Focus

- **Noise-cancelling headphones** — The AuraSound Pro blocks office chatter.
- **Wireless earbuds** — The EchoBuds Mini for quick calls and walks.

### Power and Connectivity

- **Power bank** — The PowerCore 20000mAh charges your phone 4 times.
- **USB-C hub** — Connect monitors, SD cards, and accessories with one cable.

### What to Skip

- Standing desk converters — Get a full standing desk instead.
- "Productivity" apps — A simple to-do list is all you need.

> **The most productive setup is one that removes friction. Invest in the tools you use every day.**

---

*This article contains affiliate links. As an Amazon Associate, we earn from qualifying purchases — at no extra cost to you.*`,
    },
  ];

  for (const post of blogPosts) {
    const existing = await db.blogPost.findUnique({ where: { slug: post.slug } });
    if (existing) continue;
    await db.blogPost.create({
      data: {
        ...post,
        published: true,
        publishedAt: new Date(),
      },
    });
  }
  console.log("  ✓ Blog posts (" + blogPosts.length + ")");

  console.log("\n✅ Seed complete!");
  console.log("   Admin login: admin / admin123");
  console.log("   Change the password immediately in Admin → Settings.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
