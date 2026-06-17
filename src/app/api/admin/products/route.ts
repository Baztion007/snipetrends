import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  isNonEmptyString,
  isPositiveNumber,
  isSafeUrl,
  isCuid,
  sanitizeString,
} from "@/lib/validate";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

const ALLOWED_BADGES = new Set(["deal", "bestseller", "new"]);

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = sanitizeString(searchParams.get("q"), 200);
  const categoryId = searchParams.get("categoryId");
  const safeCatId = categoryId && isCuid(categoryId) ? categoryId : undefined;

  const products = await db.product.findMany({
    where: {
      AND: [
        q ? { title: { contains: q } } : {},
        safeCatId ? { categoryId: safeCatId } : {},
      ],
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const title = sanitizeString(body?.title, 300);
    const description = sanitizeString(body?.description, 5000);
    const image = body?.image;
    const price = Number(body?.price);
    const compareAtPrice =
      body?.compareAtPrice != null && body?.compareAtPrice !== ""
        ? Number(body?.compareAtPrice)
        : null;
    const rating = Number(body?.rating ?? 0);
    const reviewCount = Number(body?.reviewCount ?? 0);
    const brand = sanitizeString(body?.brand, 100);
    const badge = body?.badge && ALLOWED_BADGES.has(body.badge) ? body.badge : null;
    const featured = !!body?.featured;
    const stock = Number(body?.stock ?? 0);
    const affiliateUrl = body?.affiliateUrl;
    const categoryId = body?.categoryId;

    // Validate required + safe inputs.
    if (
      !isNonEmptyString(title, 300) ||
      !isSafeUrl(image) ||
      !isPositiveNumber(price) ||
      !isCuid(categoryId) ||
      !isSafeUrl(affiliateUrl)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid input. Required: title, valid http(s) image URL, positive price, valid categoryId, valid http(s) affiliateUrl.",
        },
        { status: 400 }
      );
    }
    if (compareAtPrice !== null && !isPositiveNumber(compareAtPrice)) {
      return NextResponse.json(
        { error: "Compare-at price must be a positive number." },
        { status: 400 }
      );
    }
    if (rating < 0 || rating > 5 || stock < 0 || reviewCount < 0) {
      return NextResponse.json(
        { error: "Rating (0-5), stock, and review count must be non-negative." },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        title,
        description: description || null,
        image,
        images: JSON.stringify([image]),
        price,
        compareAtPrice,
        rating,
        reviewCount,
        brand: brand || null,
        badge,
        featured,
        stock: Math.floor(stock),
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
