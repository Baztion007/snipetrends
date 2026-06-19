import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeString } from "@/lib/validate";

// Admin: bulk import products by pasting Amazon ASINs (one per line or comma-separated).
// Each ASIN becomes a product with a placeholder title + the Amazon affiliate URL.
// The admin then edits each product to add real details.
export async function POST(req: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const raw = String(body?.asins || "");
    const categoryId = String(body?.categoryId || "");
    const baseUrl =
      sanitizeString(body?.baseUrl, 100) || "https://www.amazon.com";

    if (!raw.trim() || !categoryId) {
      return NextResponse.json(
        { error: "ASINs and a category are required." },
        { status: 400 }
      );
    }

    // Parse ASINs: split on newlines/commas/spaces, validate format.
    const asins = raw
      .split(/[\s,]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => /^B[0-9A-Z]{9}$/.test(s));

    // Deduplicate.
    const unique = [...new Set(asins)];

    if (unique.length === 0) {
      return NextResponse.json(
        { error: "No valid ASINs found. ASINs start with 'B' and are 10 characters." },
        { status: 400 }
      );
    }
    if (unique.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 ASINs per import." },
        { status: 400 }
      );
    }

    // Verify the category exists.
    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 400 });
    }

    const created: { asin: string; title: string; id: string }[] = [];
    const skipped: { asin: string; reason: string }[] = [];

    for (const asin of unique) {
      const affiliateUrl = `${baseUrl}/dp/${asin}`;
      // Skip if a product with this affiliate URL already exists.
      const existing = await db.product.findFirst({
        where: { affiliateUrl },
        select: { id: true },
      });
      if (existing) {
        skipped.push({ asin, reason: "Already exists" });
        continue;
      }

      const product = await db.product.create({
        data: {
          title: `Amazon Product ${asin}`,
          description: `Imported ASIN ${asin}. Edit this product to add a real title, description, and image.`,
          image: `https://m.media-amazon.com/images/I/${asin}._AC_SX679_.jpg`,
          images: JSON.stringify([
            `https://m.media-amazon.com/images/I/${asin}._AC_SX679_.jpg`,
          ]),
          price: 0,
          rating: 0,
          reviewCount: 0,
          stock: 0,
          affiliateUrl,
          categoryId,
        },
      });
      created.push({ asin, title: product.title, id: product.id });
    }

    return NextResponse.json({
      ok: true,
      created: created.length,
      skipped: skipped.length,
      createdProducts: created,
      skippedProducts: skipped,
    });
  } catch (e) {
    console.error("[admin/products/import]", e);
    return NextResponse.json({ error: "Import failed." }, { status: 500 });
  }
}
