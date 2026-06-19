import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isCuid, sanitizeString } from "@/lib/validate";

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
    if (body.title !== undefined) data.title = sanitizeString(body.title, 300);
    if (body.slug !== undefined) data.slug = sanitizeString(body.slug, 200);
    if (body.excerpt !== undefined) data.excerpt = sanitizeString(body.excerpt, 500) || null;
    if (body.content !== undefined) data.content = sanitizeString(body.content, 50000) || "";
    if (body.coverImage !== undefined) data.coverImage = body.coverImage || null;
    if (body.category !== undefined) data.category = sanitizeString(body.category, 50) || null;
    if (body.tags !== undefined) data.tags = sanitizeString(body.tags, 200) || null;
    if (body.published !== undefined) {
      data.published = !!body.published;
      // Set publishedAt when publishing for the first time.
      if (body.published) {
        const existing = await db.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });
        if (!existing?.publishedAt) data.publishedAt = new Date();
      }
    }

    const post = await db.blogPost.update({ where: { id }, data });
    return NextResponse.json({ post });
  } catch (e) {
    console.error("[admin/blog PUT]", e);
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
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
    await db.blogPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}
