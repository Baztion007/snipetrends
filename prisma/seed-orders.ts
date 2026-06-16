import { db } from "../src/lib/db";

const SAMPLE_EMAILS = [
  "olivia.martin@example.com",
  "liam.chen@example.com",
  "ava.patel@example.com",
  "noah.kim@example.com",
  "sophia.rivera@example.com",
  "ethan.wong@example.com",
  "mia.schmidt@example.com",
  "lucas.andrade@example.com",
  "isabella.novak@example.com",
  "mason.tanaka@example.com",
];
const SAMPLE_NAMES = [
  "Olivia Martin",
  "Liam Chen",
  "Ava Patel",
  "Noah Kim",
  "Sophia Rivera",
  "Ethan Wong",
  "Mia Schmidt",
  "Lucas Andrade",
  "Isabella Novak",
  "Mason Tanaka",
];
const STATUSES = ["completed", "completed", "completed", "pending", "cancelled"];

async function main() {
  console.log("Seeding orders + gallery images...");

  const products = await db.product.findMany();
  if (products.length === 0) {
    console.log("No products found — run the main seed first.");
    return;
  }

  // 1) Enrich each product with a small gallery (reuse main image + related
  //    unsplash photos so the detail-dialog gallery has multiple thumbnails).
  const extraImages = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
  ];
  for (const p of products) {
    // Build a 4-image gallery: main image + 3 extras (deterministic per product).
    const gallery = [
      p.image,
      extraImages[(p.title.length + 0) % extraImages.length],
      extraImages[(p.title.length + 1) % extraImages.length],
      extraImages[(p.title.length + 2) % extraImages.length],
    ];
    await db.product.update({
      where: { id: p.id },
      data: { images: JSON.stringify(gallery) },
    });
  }
  console.log(`Enriched ${products.length} products with 4-image galleries.`);

  // 2) Seed ~40 orders spread over the last 30 days.
  const existingOrders = await db.order.count();
  if (existingOrders > 0) {
    console.log(`Orders already exist (${existingOrders}). Skipping order seed.`);
    return;
  }

  const now = Date.now();
  for (let i = 0; i < 44; i++) {
    const product = products[i % products.length];
    const quantity = 1 + (i % 4); // 1..4
    const total = product.price * quantity;
    const status = STATUSES[i % STATUSES.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const customerIdx = i % SAMPLE_EMAILS.length;
    await db.order.create({
      data: {
        productId: product.id,
        quantity,
        total,
        status,
        customerEmail: SAMPLE_EMAILS[customerIdx],
        customerName: SAMPLE_NAMES[customerIdx],
        createdAt: new Date(now - daysAgo * 86400000 - Math.random() * 86400000),
      },
    });
  }
  console.log("Seeded 44 sample orders.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
