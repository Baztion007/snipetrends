import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://shopaffiliate.example";

  const now = new Date();

  // Static entry — the storefront home.
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // One entry per category (the storefront filters by category client-side,
  // but we still surface them so search engines discover category keywords).
  try {
    const categories = await db.category.findMany();
    for (const c of categories) {
      entries.push({
        url: `${baseUrl}/?category=${encodeURIComponent(c.slug)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // DB may not be ready during build — skip category entries silently.
  }

  return entries;
}
