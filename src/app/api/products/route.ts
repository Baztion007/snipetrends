import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") || undefined;
  const badge = searchParams.get("badge") || undefined;
  const featured = searchParams.get("featured");
  const sort = searchParams.get("sort") || "featured";
  const limit = Math.min(Number(searchParams.get("limit") || 24), 60);

  const where: Record<string, unknown> = {
    AND: [
      categoryId ? { categoryId } : {},
      badge ? { badge } : {},
      featured === "true" ? { featured: true } : {},
    ],
  };

  let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  else if (sort === "price-desc") orderBy = { price: "desc" };
  else if (sort === "rating") orderBy = { rating: "desc" };
  else if (sort === "featured") orderBy = { featured: "desc" };

  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy,
    take: limit,
  });

  return NextResponse.json({ products });
}
