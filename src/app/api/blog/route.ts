import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public: list published blog posts.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;

  const where: Record<string, unknown> = {
    published: true,
    NOT: { publishedAt: null },
  };
  if (category) where.category = category;

  const posts = await db.blogPost.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      category: true,
      tags: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ posts });
}
