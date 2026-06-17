import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/validate";

// Newsletter signup from the footer. Rate-limited to deter list-bombing.
const SUB_LIMIT = 5;
const SUB_WINDOW = 60 * 60 * 1000; // 1 hour

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: SUB_LIMIT, windowMs: SUB_WINDOW });
  if (limited) return limited;

  try {
    const body = await req.json();
    const email = sanitizeString(body?.email, 254).toLowerCase();

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Upsert so re-subscribing doesn't error on the unique constraint.
    await db.subscriber.upsert({
      where: { email },
      update: {}, // no fields to update — just ensure it exists
      create: { email },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[subscribe]", e);
    return NextResponse.json(
      { error: "Could not subscribe. Please try again." },
      { status: 500 }
    );
  }
}
