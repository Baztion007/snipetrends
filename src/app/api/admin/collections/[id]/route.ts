import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isCuid, sanitizeString } from "@/lib/validate";

const ALLOWED_TYPES = new Set(["guide", "edit", "seasonal"]);

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!isCuid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.title !== undefined) data.title = sanitizeString(body.title, 200);
    if (body.slug !== undefined) data.slug = sanitizeString(body.slug, 200);
    if (body.description !== undefined) data.description = sanitizeString(body.description, 1000) || null;
    if (body.coverImage !== undefined) data.coverImage = body.coverImage || null;
    if (body.type !== undefined && ALLOWED_TYPES.has(body.type)) data.type = body.type;
    if (body.published !== undefined) data.published = !!body.published;

    // Update items if a productIds array is provided.
    if (Array.isArray(body.productIds)) {
      const productIds: string[] = body.productIds.filter((pid: unknown) => isCuid(pid));
      // Replace all items.
      await db.collectionItem.deleteMany({ where: { collectionId: id } });
      if (productIds.length) {
        await db.collectionItem.createMany({
          data: productIds.map((productId, sortOrder) => ({
            collectionId: id,
            productId,
            sortOrder,
          })),
        });
      }
    }

    const collection = await db.collection.update({
      where: { id },
      data,
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json({ collection });
  } catch (e) {
    console.error("[admin/collections PUT]", e);
    return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!isCuid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    await db.collection.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}
