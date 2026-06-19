import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public: get a single published collection with its products.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const collection = await db.collection.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
  });
  if (!collection || !collection.published) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }
  return NextResponse.json({ collection });
}
