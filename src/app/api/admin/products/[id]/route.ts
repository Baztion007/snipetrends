import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  return session ?? null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const {
      title,
      description,
      image,
      images,
      price,
      compareAtPrice,
      rating,
      reviewCount,
      brand,
      badge,
      featured,
      stock,
      affiliateUrl,
      categoryId,
    } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description ?? null;
    if (image !== undefined) data.image = image;
    if (images !== undefined) data.images = JSON.stringify(images);
    if (price !== undefined) data.price = Number(price);
    if (compareAtPrice !== undefined)
      data.compareAtPrice = compareAtPrice != null ? Number(compareAtPrice) : null;
    if (rating !== undefined) data.rating = Number(rating);
    if (reviewCount !== undefined) data.reviewCount = Number(reviewCount);
    if (brand !== undefined) data.brand = brand ?? null;
    if (badge !== undefined) data.badge = badge || null;
    if (featured !== undefined) data.featured = !!featured;
    if (stock !== undefined) data.stock = Number(stock);
    if (affiliateUrl !== undefined) data.affiliateUrl = affiliateUrl;
    if (categoryId !== undefined) data.categoryId = categoryId;

    const product = await db.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    return NextResponse.json({ product });
  } catch (e) {
    console.error("[admin/products PUT]", e);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/products DELETE]", e);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
