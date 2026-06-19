import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { isCuid, sanitizeString } from "@/lib/validate";

// Subscribe to a price-drop alert for a product.
const LIMIT = 10;
const WINDOW = 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: LIMIT, windowMs: WINDOW });
  if (limited) return limited;

  try {
    const body = await req.json();
    const email = sanitizeString(body?.email, 254).toLowerCase();
    const productId = body?.productId;
    const threshold = Number(body?.threshold);

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }
    if (!isCuid(productId)) {
      return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    }
    if (isNaN(threshold) || threshold <= 0) {
      return NextResponse.json({ error: "Valid threshold required." }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Upsert — avoid duplicates if the same email+product combo resubscribes.
    const existing = await db.priceAlert.findFirst({
      where: { email, productId },
    });
    if (existing) {
      await db.priceAlert.update({
        where: { id: existing.id },
        data: { threshold, triggered: false, triggeredAt: null },
      });
    } else {
      await db.priceAlert.create({
        data: { email, productId, threshold },
      });
    }

    return NextResponse.json({
      ok: true,
      message: `We'll email ${email} when ${product.title} drops below $${threshold}.`,
    });
  } catch (e) {
    console.error("[price-alerts]", e);
    return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
  }
}
