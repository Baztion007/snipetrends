import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// "Trending" = products with the most affiliate clicks in the last 7 days.
// This is the public-facing signal of what's popular right now.
export async function GET() {
  try {
    const since = new Date(Date.now() - 7 * 86400000);
    const recentClicks = await db.affiliateClick.findMany({
      where: { createdAt: { gte: since } },
      select: { productId: true },
    });

    // Tally clicks per product.
    const counts = new Map<string, number>();
    for (const c of recentClicks) {
      counts.set(c.productId, (counts.get(c.productId) ?? 0) + 1);
    }

    if (counts.size === 0) {
      // Fallback: feature highest-rated products when there's no recent click data.
      const fallback = await db.product.findMany({
        where: { rating: { gte: 4 } },
        include: { category: true },
        orderBy: { rating: "desc" },
        take: 10,
      });
      return NextResponse.json({
        products: fallback,
        period: "7d",
        fallback: true,
      });
    }

    const topIds = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    const products = await db.product.findMany({
      where: { id: { in: topIds } },
      include: { category: true },
    });

    // Re-order by click count (descending).
    const ranked = topIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({ ...p, _clicks: counts.get(p!.id) ?? 0 }));

    return NextResponse.json({ products: ranked, period: "7d" });
  } catch (e) {
    console.error("[trending]", e);
    return NextResponse.json(
      { error: "Failed to load trending products" },
      { status: 500 }
    );
  }
}
