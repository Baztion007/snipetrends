import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined; // pending|completed|cancelled|all
  const range = searchParams.get("range") || "30"; // days

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (range && range !== "all") {
    const days = Number(range);
    if (!isNaN(days)) {
      where.createdAt = { gte: new Date(Date.now() - days * 86400000) };
    }
  }

  const orders = await db.order.findMany({
    where,
    include: { product: { select: { id: true, title: true, image: true, price: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ orders });
}
