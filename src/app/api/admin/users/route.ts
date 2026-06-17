import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { isNonEmptyString, sanitizeString } from "@/lib/validate";

const MIN_PW_LEN = 8;
const MAX_PW_LEN = 200;

function meetsPolicy(pw: string): string | null {
  if (pw.length < MIN_PW_LEN) return `Password must be at least ${MIN_PW_LEN} characters.`;
  if (pw.length > MAX_PW_LEN) return `Password must be at most ${MAX_PW_LEN} characters.`;
  if (!/[a-zA-Z]/.test(pw)) return "Password must contain at least one letter.";
  if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
  return null;
}

// List admin users (admin only).
export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await db.adminUser.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ users });
}

// Create a new admin user (admin only).
export async function POST(req: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const username = sanitizeString(body?.username, 100);
    const name = sanitizeString(body?.name, 100);
    const password = String(body?.password ?? "");

    if (!isNonEmptyString(username, 100)) {
      return NextResponse.json(
        { error: "A valid username is required." },
        { status: 400 }
      );
    }
    const policyError = meetsPolicy(password);
    if (policyError) {
      return NextResponse.json({ error: policyError }, { status: 400 });
    }

    // Check for duplicate username.
    const existing = await db.adminUser.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }

    const user = await db.adminUser.create({
      data: {
        username,
        name: name || null,
        passwordHash: hashPassword(password),
        role: "admin",
      },
      select: { id: true, username: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (e) {
    console.error("[admin/users POST]", e);
    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 }
    );
  }
}
