import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Delete an admin user. Prevents deleting yourself or the last remaining admin.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  // Don't allow self-deletion.
  if (id === session.sub) {
    return NextResponse.json(
      { error: "You cannot delete your own account while signed in." },
      { status: 400 }
    );
  }

  // Don't allow deleting the last admin.
  const count = await db.adminUser.count();
  if (count <= 1) {
    return NextResponse.json(
      { error: "Cannot delete the last remaining admin account." },
      { status: 400 }
    );
  }

  try {
    await db.adminUser.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "User not found or could not be deleted." },
      { status: 404 }
    );
  }
}
