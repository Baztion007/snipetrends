import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  // related products in same category
  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 6,
    orderBy: { rating: "desc" },
  });
  return NextResponse.json({ product, related });
}
