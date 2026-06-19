import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public: list published collections.
export async function GET() {
  const collections = await db.collection.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      type: true,
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ collections });
}
