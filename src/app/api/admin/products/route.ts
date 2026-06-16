import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const categoryId = searchParams.get("categoryId") || undefined;

  const products = await db.product.findMany({
    where: {
      AND: [
        q
          ? { title: { contains: q } }
          : {},
        categoryId ? { categoryId } : {},
      ],
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

    if (!title || !image || price == null || !categoryId || !affiliateUrl) {
      return NextResponse.json(
        { error: "Missing required fields (title, image, price, categoryId, affiliateUrl)." },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        title,
        description: description ?? null,
        image,
        images: images ? JSON.stringify(images) : JSON.stringify([image]),
        price: Number(price),
        compareAtPrice: compareAtPrice != null ? Number(compareAtPrice) : null,
        rating: rating != null ? Number(rating) : 0,
        reviewCount: reviewCount != null ? Number(reviewCount) : 0,
        brand: brand ?? null,
        badge: badge || null,
        featured: !!featured,
        stock: stock != null ? Number(stock) : 0,
        affiliateUrl,
        categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json({ product });
  } catch (e) {
    console.error("[admin/products POST]", e);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
