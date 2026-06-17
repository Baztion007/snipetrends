import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// List newsletter subscribers (admin only).
export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subscribers = await db.subscriber.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, createdAt: true },
  });
  return NextResponse.json({
    subscribers,
    total: subscribers.length,
  });
}
