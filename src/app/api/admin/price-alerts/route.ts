import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// List all price alerts (admin only).
export async function GET(req: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // "active" | "triggered" | null

  const where: Record<string, unknown> = {};
  if (filter === "triggered") where.triggered = true;
  if (filter === "active") where.triggered = false;

  const alerts = await db.priceAlert.findMany({
    where,
    include: {
      product: { select: { id: true, title: true, image: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return NextResponse.json({ alerts, total: alerts.length });
}
