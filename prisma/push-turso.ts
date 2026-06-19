/**
 * Push the Prisma schema to a Turso (libSQL) database.
 * The Prisma CLI's `db push` doesn't support libsql:// URLs, so we use
 * the @libsql/client directly to create the tables.
 *
 * Usage:
 *   DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." bun run prisma/push-turso.ts
 */
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !url.startsWith("libsql")) {
  console.error("DATABASE_URL must be a libsql:// URL");
  process.exit(1);
}

const client = createClient({ url, authToken });

// DDL statements to create all tables (matching the Prisma schema).
// These use IF NOT EXISTS so it's safe to run multiple times.
const statements = [
  `CREATE TABLE IF NOT EXISTS AdminUser (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS SiteSetting (
    id TEXT PRIMARY KEY NOT NULL DEFAULT 'singleton',
    amazonAssociateTag TEXT NOT NULL DEFAULT '',
    amazonBaseUrl TEXT NOT NULL DEFAULT 'https://www.amazon.com',
    siteName TEXT NOT NULL DEFAULT 'ShopAffiliate',
    contactEmail TEXT NOT NULL DEFAULT 'hello@shopaffiliate.example',
    disclosureOverride TEXT,
    socialTwitter TEXT,
    socialInstagram TEXT,
    socialYoutube TEXT,
    socialGithub TEXT,
    updatedAt DATETIME NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS Category (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS Product (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    images TEXT,
    price REAL NOT NULL,
    compareAtPrice REAL,
    rating REAL NOT NULL DEFAULT 0,
    reviewCount INTEGER NOT NULL DEFAULT 0,
    brand TEXT,
    badge TEXT,
    featured BOOLEAN NOT NULL DEFAULT false,
    stock INTEGER NOT NULL DEFAULT 0,
    affiliateUrl TEXT NOT NULL,
    categoryId TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (categoryId) REFERENCES Category(id)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_product_categoryId ON Product(categoryId)`,
  `CREATE INDEX IF NOT EXISTS idx_product_featured ON Product(featured)`,
  `CREATE INDEX IF NOT EXISTS idx_product_badge ON Product(badge)`,

  `CREATE TABLE IF NOT EXISTS AffiliateClick (
    id TEXT PRIMARY KEY NOT NULL,
    productId TEXT NOT NULL,
    ip TEXT,
    userAgent TEXT,
    referrer TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
  )`,

  `CREATE INDEX IF NOT EXISTS idx_click_productId ON AffiliateClick(productId)`,
  `CREATE INDEX IF NOT EXISTS idx_click_createdAt ON AffiliateClick(createdAt)`,

  `CREATE TABLE IF NOT EXISTS Subscriber (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS PriceAlert (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL,
    productId TEXT NOT NULL,
    threshold REAL NOT NULL,
    triggered BOOLEAN NOT NULL DEFAULT false,
    triggeredAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
  )`,

  `CREATE INDEX IF NOT EXISTS idx_alert_productId ON PriceAlert(productId)`,
  `CREATE INDEX IF NOT EXISTS idx_alert_email ON PriceAlert(email)`,
  `CREATE INDEX IF NOT EXISTS idx_alert_triggered ON PriceAlert(triggered)`,

  `CREATE TABLE IF NOT EXISTS BlogPost (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    coverImage TEXT,
    category TEXT,
    tags TEXT,
    published BOOLEAN NOT NULL DEFAULT false,
    publishedAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_blog_published ON BlogPost(published)`,
  `CREATE INDEX IF NOT EXISTS idx_blog_slug ON BlogPost(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_blog_category ON BlogPost(category)`,

  `CREATE TABLE IF NOT EXISTS Collection (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    coverImage TEXT,
    type TEXT NOT NULL DEFAULT 'guide',
    published BOOLEAN NOT NULL DEFAULT false,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_collection_published ON Collection(published)`,
  `CREATE INDEX IF NOT EXISTS idx_collection_type ON Collection(type)`,

  `CREATE TABLE IF NOT EXISTS CollectionItem (
    id TEXT PRIMARY KEY NOT NULL,
    collectionId TEXT NOT NULL,
    productId TEXT NOT NULL,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    note TEXT,
    FOREIGN KEY (collectionId) REFERENCES Collection(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
  )`,

  `CREATE INDEX IF NOT EXISTS idx_item_collectionId ON CollectionItem(collectionId)`,
  `CREATE INDEX IF NOT EXISTS idx_item_productId ON CollectionItem(productId)`,
];

async function main() {
  console.log("🚀 Pushing schema to Turso:", url);

  for (const sql of statements) {
    try {
      await client.execute(sql);
      const label = sql.substring(0, 60).replace(/\n/g, " ").trim();
      console.log("  ✓", label + "...");
    } catch (e) {
      // Ignore "already exists" errors, log others
      const msg = (e as Error).message;
      if (!msg.includes("already exists") && !msg.includes("duplicate")) {
        console.error("  ✗", msg.substring(0, 100));
      }
    }
  }

  console.log("\n✅ Schema pushed to Turso!");
  console.log("   Now run the seed: DATABASE_URL='" + url + "' DATABASE_AUTH_TOKEN='...' bun run seed");
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
