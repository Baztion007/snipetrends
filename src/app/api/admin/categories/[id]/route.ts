import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  return (await getSession()) ?? null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const name = body?.name ? String(body.name) : undefined;
  const icon = body?.icon !== undefined ? String(body.icon) : undefined;
  const slug = body?.slug ? String(body.slug) : undefined;

  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (icon !== undefined) data.icon = icon || null;
  if (slug) data.slug = slug;

  const category = await db.category.update({ where: { id }, data });
  return NextResponse.json({ category });
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
    await db.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete category (it may have products)." },
      { status: 400 }
    );
  }
}
