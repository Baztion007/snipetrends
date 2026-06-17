import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession, getSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { isNonEmptyString } from "@/lib/validate";

// Brute-force protection: 5 login attempts / 15 min / IP.
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW = 15 * 60 * 1000;
const MAX_CREDENTIAL_LEN = 200;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, {
    limit: LOGIN_LIMIT,
    windowMs: LOGIN_WINDOW,
  });
  if (limited) return limited;

  try {
    const body = await req.json();
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "");

    if (
      !isNonEmptyString(username, MAX_CREDENTIAL_LEN) ||
      !isNonEmptyString(password, MAX_CREDENTIAL_LEN)
    ) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const user = await db.adminUser.findUnique({ where: { username } });
    // Use the same verify call regardless of whether the user exists to avoid
    // user-enumeration timing attacks.
    const valid = user
      ? verifyPassword(password, user.passwordHash)
      : verifyPassword(password, "$scrypt$invalid$00".padEnd(120, "0"));

    if (!user || !valid) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    await createSession({
      sub: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      ok: true,
      user: { username: user.username, name: user.name, role: user.role },
    });
  } catch (e) {
    console.error("[admin/login] error", e);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session });
}
