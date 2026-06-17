import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isCuid } from "@/lib/validate";

// Returns the click history for a single product (for the admin drill-down).
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!isCuid(id)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const product = await db.product.findUnique({
    where: { id },
    select: { id: true, title: true, image: true, price: true, affiliateUrl: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const clicks = await db.affiliateClick.findMany({
    where: { productId: id },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: { id: true, ip: true, userAgent: true, referrer: true, createdAt: true },
  });

  // Daily click totals for the last 14 days (for a mini chart).
  const perDay: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    perDay.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  const idxMap = new Map(perDay.map((p, i) => [p.date, i]));
  for (const c of clicks) {
    const key = c.createdAt.toISOString().slice(0, 10);
    const i = idxMap.get(key);
    if (i !== undefined) perDay[i].count++;
  }

  return NextResponse.json({
    product,
    totalClicks: clicks.length,
    clicks,
    clicksPerDay: perDay,
  });
}
