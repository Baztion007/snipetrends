import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isNonEmptyString, isCuid, sanitizeString } from "@/lib/validate";

const ALLOWED_TYPES = new Set(["guide", "edit", "seasonal"]);

// Admin: list all collections (including drafts).
export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const collections = await db.collection.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      published: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });
  return NextResponse.json({ collections });
}

// Admin: create a collection.
export async function POST(req: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const title = sanitizeString(body?.title, 200);
    if (!isNonEmptyString(title, 200)) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    const slug =
      sanitizeString(body?.slug, 200) ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existing = await db.collection.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already in use." }, { status: 409 });
    }

    const type = body?.type && ALLOWED_TYPES.has(body.type) ? body.type : "guide";
    const published = !!body?.published;

    // Validate product IDs if provided.
    const productIds: string[] = Array.isArray(body?.productIds)
      ? body.productIds.filter((id: unknown) => isCuid(id))
      : [];

    const collection = await db.collection.create({
      data: {
        title,
        slug,
        description: sanitizeString(body?.description, 1000) || null,
        coverImage: body?.coverImage || null,
        type,
        published,
        items: productIds.length
          ? {
              create: productIds.map((productId, sortOrder) => ({
                productId,
                sortOrder,
              })),
            }
          : undefined,
      },
      include: { _count: { select: { items: true } } },
    });

    return NextResponse.json({ collection });
  } catch (e) {
    console.error("[admin/collections POST]", e);
    return NextResponse.json({ error: "Failed to create collection." }, { status: 500 });
  }
}
