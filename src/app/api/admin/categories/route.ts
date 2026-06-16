import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  return (await getSession()) ?? null;
}

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const name = String(body?.name ?? "").trim();
  const icon = body?.icon ? String(body.icon) : null;
  if (!name) {
    return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  }
  const slug =
    String(body?.slug ?? "").trim() ||
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const category = await db.category.create({ data: { name, slug, icon } });
  return NextResponse.json({ category });
}
