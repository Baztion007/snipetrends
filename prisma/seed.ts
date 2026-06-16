import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/password";

async function main() {
  console.log("Seeding database...");

  // --- Admin user (username + password) ---
  const existing = await db.adminUser.findUnique({ where: { username: "admin" } });
  if (!existing) {
    await db.adminUser.create({
      data: {
        username: "admin",
        passwordHash: hashPassword("admin123"),
        name: "Store Admin",
        role: "admin",
      },
    });
    console.log("Created admin user -> username: admin | password: admin123");
  } else {
    console.log("Admin user already exists.");
  }

  // --- Categories ---
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
    const row = await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    catMap[c.slug] = row.id;
  }
  console.log(`Seeded ${categories.length} categories.`);

  // --- Products ---
  type Seed = {
    title: string;
    description: string;
    image: string;
    price: number;
    compareAtPrice?: number;
    rating: number;
    reviewCount: number;
    brand?: string;
    badge?: string;
    featured?: boolean;
    stock: number;
    categorySlug: string;
  };

  const products: Seed[] = [
    {
      title: "AuraSound Pro Wireless Noise-Cancelling Headphones",
      description:
        "Immerse yourself in studio-grade sound with adaptive active noise cancellation, 40-hour battery life, and plush memory-foam earcups. Bluetooth 5.3 with multipoint pairing.",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      price: 199.99,
      compareAtPrice: 279.99,
      rating: 4.7,
      reviewCount: 12834,
      brand: "AuraSound",
      badge: "bestseller",
      featured: true,
      stock: 120,
      categorySlug: "audio",
    },
    {
      title: "NimbusBook Air 14 Ultra-Thin Laptop",
      description:
        "16GB RAM, 1TB SSD, 14-inch 2.8K OLED display, all-day 18-hour battery. Featherlight aluminum chassis at just 1.1kg.",
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
      price: 1099.0,
      compareAtPrice: 1299.0,
      rating: 4.6,
      reviewCount: 3421,
      brand: "Nimbus",
      badge: "deal",
      featured: true,
      stock: 45,
      categorySlug: "computers",
    },
    {
      title: "PulseFit Smartwatch Series 7",
      description:
        "Track 100+ workouts, SpO2, heart-rate, sleep and stress. AMOLED always-on display, 5ATM water resistance, 14-day battery.",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      price: 149.99,
      compareAtPrice: 199.99,
      rating: 4.5,
      reviewCount: 8776,
      brand: "PulseFit",
      badge: "deal",
      featured: true,
      stock: 200,
      categorySlug: "wearables",
    },
    {
      title: "VisionPro 4K Mirrorless Camera Kit",
      description:
        "26.1MP full-frame sensor, 8K video, in-body stabilization. Includes 24-70mm f/2.8 lens and travel case.",
      image:
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
      price: 1899.0,
      compareAtPrice: 2199.0,
      rating: 4.8,
      reviewCount: 1543,
      brand: "VisionPro",
      badge: "new",
      featured: true,
      stock: 30,
      categorySlug: "photography",
    },
    {
      title: "HelixConsole X Pro Edition",
      description:
        "Next-gen gaming console with 1TB SSD, ray tracing, 120fps gaming and lightning-fast load times. Includes wireless controller.",
      image:
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
      price: 499.99,
      rating: 4.9,
      reviewCount: 22098,
      brand: "Helix",
      badge: "bestseller",
      featured: true,
      stock: 60,
      categorySlug: "gaming",
    },
    {
      title: "LuminaTab S 11-inch Tablet",
      description:
        "11-inch 120Hz display, 128GB storage, quad speakers with Dolby Atmos. Perfect for streaming, note-taking and light gaming.",
      image:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
      price: 329.0,
      compareAtPrice: 399.0,
      rating: 4.4,
      reviewCount: 5610,
      brand: "Lumina",
      badge: "deal",
      stock: 90,
      categorySlug: "electronics",
    },
    {
      title: "EchoBuds Mini True Wireless Earbuds",
      description:
        "Compact earbuds with ANC, wireless charging case, 28h total playtime, IPX5 sweat resistance.",
      image:
        "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80",
      price: 79.99,
      compareAtPrice: 99.99,
      rating: 4.3,
      reviewCount: 9120,
      brand: "EchoBuds",
      stock: 300,
      categorySlug: "audio",
    },
    {
      title: "ZenBrew Smart Coffee Maker",
      description:
        "App-controlled 12-cup coffee maker with adjustable strength, scheduled brewing and keep-warm. Stainless steel carafe.",
      image:
        "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80",
      price: 119.0,
      compareAtPrice: 149.0,
      rating: 4.5,
      reviewCount: 2890,
      brand: "ZenBrew",
      badge: "new",
      stock: 75,
      categorySlug: "home-kitchen",
    },
    {
      title: "TrailBlazer 45L Backpacking Pack",
      description:
        "Ultralight 45L hiking backpack with adjustable torso, rain cover, hydration compatibility and ventilated back panel.",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      price: 159.0,
      rating: 4.6,
      reviewCount: 1788,
      brand: "TrailBlazer",
      stock: 110,
      categorySlug: "outdoor",
    },
    {
      title: "PowerCore 20000mAh Power Bank",
      description:
        "High-capacity 20000mAh power bank with 30W USB-C PD fast charging, charges phones up to 4 times.",
      image:
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
      price: 45.99,
      compareAtPrice: 59.99,
      rating: 4.7,
      reviewCount: 45210,
      brand: "PowerCore",
      badge: "bestseller",
      stock: 500,
      categorySlug: "electronics",
    },
    {
      title: "MechType 75% Mechanical Keyboard",
      description:
        "Hot-swappable mechanical keyboard with RGB backlight, gasket mount, wireless/wired modes. Brown switches.",
      image:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
      price: 89.99,
      compareAtPrice: 119.99,
      rating: 4.6,
      reviewCount: 3344,
      brand: "MechType",
      badge: "deal",
      stock: 140,
      categorySlug: "computers",
    },
    {
      title: "GlowRing Smart LED Light Strip 5m",
      description:
        "16M colors, app + voice control, music sync. Cuttable LED strip perfect for room and desk ambiance.",
      image:
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
      price: 32.99,
      compareAtPrice: 49.99,
      rating: 4.4,
      reviewCount: 12876,
      brand: "GlowRing",
      stock: 400,
      categorySlug: "home-kitchen",
    },
  ];

  for (const p of products) {
    const existingP = await db.product.findFirst({ where: { title: p.title } });
    if (existingP) continue;
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
        brand: p.brand ?? null,
        badge: p.badge ?? null,
        featured: p.featured ?? false,
        stock: p.stock,
        affiliateUrl: `https://example-affiliate.example/dp/${Buffer.from(
          p.title
        )
          .toString("base64")
          .slice(0, 12)
          .replace(/[+/]/g, "")}?tag=affstore-20`,
        categoryId: catMap[p.categorySlug],
      },
    });
  }
  console.log(`Seeded ${products.length} products.`);

  // Sample affiliate clicks for analytics realism
  const allProducts = await db.product.findMany();
  if ((await db.affiliateClick.count()) === 0) {
    const clicks: { productId: string; daysAgo: number }[] = [];
    const now = Date.now();
    for (let i = 0; i < 60; i++) {
      const p = allProducts[i % allProducts.length];
      clicks.push({
        productId: p.id,
        daysAgo: Math.floor(Math.random() * 14),
      });
    }
    for (const c of clicks) {
      await db.affiliateClick.create({
        data: {
          productId: c.productId,
          createdAt: new Date(now - c.daysAgo * 86400000 - Math.random() * 86400000),
        },
      });
    }
    console.log(`Seeded ${clicks.length} sample affiliate clicks.`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
