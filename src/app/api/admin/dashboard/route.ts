import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalProducts,
    totalCategories,
    totalClicks,
    featuredCount,
    lowStock,
  ] = await Promise.all([
    db.product.count(),
    db.category.count(),
    db.affiliateClick.count(),
    db.product.count({ where: { featured: true } }),
    db.product.count({ where: { stock: { lt: 50 } } }),
  ]);

  // Catalog value (sum of price * stock)
  const products = await db.product.findMany({ select: { price: true, stock: true } });
  const catalogValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  // Clicks over last 14 days (per day)
  const since = new Date(Date.now() - 14 * 86400000);
  const clicks = await db.affiliateClick.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, productId: true },
  });

  const perDay: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    perDay.push({ date: key, count: 0 });
  }
  const idxMap = new Map(perDay.map((p, i) => [p.date, i]));
  for (const c of clicks) {
    const key = c.createdAt.toISOString().slice(0, 10);
    const i = idxMap.get(key);
    if (i !== undefined) perDay[i].count++;
  }

  // Top clicked products
  const topProductIds = new Map<string, number>();
  for (const c of clicks) {
    topProductIds.set(c.productId, (topProductIds.get(c.productId) ?? 0) + 1);
  }
  const topIds = [...topProductIds.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
  const topProducts = topIds.length
    ? await db.product.findMany({
        where: { id: { in: topIds } },
        select: { id: true, title: true, image: true, price: true },
      })
    : [];
  const topRanked = topIds
    .map((id) => {
      const p = topProducts.find((p) => p.id === id);
      return p ? { ...p, clicks: topProductIds.get(id) ?? 0 } : null;
    })
    .filter(Boolean);

  return NextResponse.json({
    stats: {
      totalProducts,
      totalCategories,
      totalClicks,
      featuredCount,
      lowStock,
      catalogValue,
    },
    clicksPerDay: perDay,
    topProducts: topRanked,
  });
}
