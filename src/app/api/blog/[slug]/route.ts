import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public: get a single published blog post by slug.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug },
  });
  if (!post || !post.published) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}
