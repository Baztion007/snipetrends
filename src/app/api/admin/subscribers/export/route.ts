import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Export newsletter subscribers as CSV (admin only).
export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscribers = await db.subscriber.findMany({
    orderBy: { createdAt: "desc" },
    select: { email: true, createdAt: true },
  });

  const header = "email,subscribed_at";
  const rows = subscribers.map(
    (s) => `${s.email},${s.createdAt.toISOString()}`
  );
  const csv = [header, ...rows].join("\n");
  const filename = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
