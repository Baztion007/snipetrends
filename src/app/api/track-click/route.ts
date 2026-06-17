import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { isCuid, sanitizeHeader } from "@/lib/validate";

// Track-click is the affiliate revenue action, so we rate-limit per IP to
// deter click-fraud without blocking real shoppers. 60 clicks / 10 min / IP.
const CLICK_LIMIT = 60;
const CLICK_WINDOW = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  // Rate limit first (before any DB work).
  const limited = rateLimit(req, {
    limit: CLICK_LIMIT,
    windowMs: CLICK_WINDOW,
  });
  if (limited) return limited;

  try {
    const body = await req.json();
    const productId = body?.productId;

    if (!isCuid(productId)) {
      return NextResponse.json(
        { error: "Invalid product id." },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, affiliateUrl: true }, // only return what we need
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Validate the stored affiliate URL is http(s) before returning it.
    try {
      const u = new URL(product.affiliateUrl);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return NextResponse.json(
          { error: "Invalid affiliate URL" },
          { status: 500 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid affiliate URL" },
        { status: 500 }
      );
    }

    // Sanitize IP / UA / referrer to prevent log-injection and oversized storage.
    const ip = sanitizeHeader(
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip")
    );
    const userAgent = sanitizeHeader(req.headers.get("user-agent"));
    const referrer = sanitizeHeader(req.headers.get("referer"));

    await db.affiliateClick.create({
      data: { productId, ip, userAgent, referrer },
    });

    return NextResponse.json({ ok: true, affiliateUrl: product.affiliateUrl });
  } catch (e) {
    console.error("[track-click]", e);
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }
}
