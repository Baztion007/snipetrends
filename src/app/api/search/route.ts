import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ products: [] });

  const products = await db.product.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { brand: { contains: q } },
      ],
    },
    include: { category: true },
    take: 30,
    orderBy: { rating: "desc" },
  });

  return NextResponse.json({ products, query: q });
}
