import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, verifyPassword } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { isNonEmptyString } from "@/lib/validate";

// Password requirements (enforced server-side).
const MIN_PW_LEN = 8;
const MAX_PW_LEN = 200;

function meetsPolicy(pw: string): string | null {
  if (pw.length < MIN_PW_LEN) return `Password must be at least ${MIN_PW_LEN} characters.`;
  if (pw.length > MAX_PW_LEN) return `Password must be at most ${MAX_PW_LEN} characters.`;
  if (!/[a-zA-Z]/.test(pw)) return "Password must contain at least one letter.";
  if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
  return null;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const currentPassword = String(body?.currentPassword ?? "");
    const newPassword = String(body?.newPassword ?? "");

    if (
      !isNonEmptyString(currentPassword, MAX_PW_LEN) ||
      !isNonEmptyString(newPassword, MAX_PW_LEN)
    ) {
      return NextResponse.json(
        { error: "Both current and new passwords are required." },
        { status: 400 }
      );
    }

    // Enforce password policy on the new password.
    const policyError = meetsPolicy(newPassword);
    if (policyError) {
      return NextResponse.json({ error: policyError }, { status: 400 });
    }

    // Reject if the new password is identical to the current one.
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from the current password." },
        { status: 400 }
      );
    }

    // Verify the current password before allowing a change.
    const user = await db.adminUser.findUnique({
      where: { id: session.sub },
    });
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 }
      );
    }

    // Hash + persist the new password.
    const newHash = hashPassword(newPassword);
    await db.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/change-password]", e);
    return NextResponse.json(
      { error: "Failed to change password." },
      { status: 500 }
    );
  }
}
