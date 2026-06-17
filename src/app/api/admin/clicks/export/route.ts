import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// Exports all affiliate clicks as CSV (admin only).
export async function GET(req: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days")) || 30;
  const since = new Date(Date.now() - days * 86400000);

  const clicks = await db.affiliateClick.findMany({
    where: { createdAt: { gte: since } },
    include: {
      product: { select: { title: true, affiliateUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  const header = [
    "click_id",
    "timestamp",
    "product_id",
    "product_title",
    "ip",
    "user_agent",
    "referrer",
  ];

  const rows = clicks.map((c) =>
    [
      c.id,
      c.createdAt.toISOString(),
      c.productId,
      c.product?.title ?? "",
      c.ip ?? "",
      c.userAgent ?? "",
      c.referrer ?? "",
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");
  const filename = `affiliate-clicks-${days}d-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
