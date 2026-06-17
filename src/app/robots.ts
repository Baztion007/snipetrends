import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://shopaffiliate.example";

  return {
    rules: [
      {
        // Allow all crawlers to index the public storefront.
        userAgent: "*",
        allow: "/",
        // Keep admin API + session out of the index.
        disallow: ["/api/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
