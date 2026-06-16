import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = body?.productId;
    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const headers = req.headers;
    const ip =
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers.get("x-real-ip") ||
      null;
    const userAgent = headers.get("user-agent") || null;
    const referrer = headers.get("referer") || null;

    await db.affiliateClick.create({
      data: { productId, ip, userAgent, referrer },
    });

    return NextResponse.json({ ok: true, affiliateUrl: product.affiliateUrl });
  } catch (e) {
    console.error("[track-click]", e);
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
  }
}
