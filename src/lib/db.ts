import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Creates a PrismaClient configured for the current DATABASE_URL.
 *
 * - When DATABASE_URL starts with `libsql://` (Turso), uses the
 *   @prisma/adapter-libsql driver adapter — edge-runtime compatible,
 *   works on Cloudflare Workers/Pages.
 * - When DATABASE_URL is a `file:` path (local dev), uses plain SQLite.
 */
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  // Turso / libSQL remote connection.
  if (url && url.startsWith("libsql")) {
    const adapter = new PrismaLibSql({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }

  // Local SQLite file (development).
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
