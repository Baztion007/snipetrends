import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isNonEmptyString, sanitizeString } from "@/lib/validate";

// Admin: list all blog posts (including drafts).
export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await db.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      category: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({ posts });
}

// Admin: create a blog post.
export async function POST(req: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const title = sanitizeString(body?.title, 300);
    if (!isNonEmptyString(title, 300)) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    const slug =
      sanitizeString(body?.slug, 200) ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Check slug uniqueness.
    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already in use." }, { status: 409 });
    }

    const published = !!body?.published;
    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        excerpt: sanitizeString(body?.excerpt, 500) || null,
        content: sanitizeString(body?.content, 50000) || "",
        coverImage: body?.coverImage || null,
        category: sanitizeString(body?.category, 50) || null,
        tags: sanitizeString(body?.tags, 200) || null,
        published,
        publishedAt: published ? new Date() : null,
      },
    });

    return NextResponse.json({ post });
  } catch (e) {
    console.error("[admin/blog POST]", e);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}
