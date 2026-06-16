import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { hashPassword, verifyPassword } from "./password";

export { hashPassword, verifyPassword };

const SESSION_COOKIE = "aff_admin_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "affiliate-site-dev-secret-change-me-in-production-please-32+chars";

const encoder = new TextEncoder();

function getSecretKey() {
  return encoder.encode(SESSION_SECRET);
}

// ---- Session (JWT in httpOnly cookie) ----

export interface SessionPayload {
  sub: string; // admin user id
  username: string;
  role: string;
  name?: string | null;
}

export async function createSession(user: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return {
      sub: payload.sub as string,
      username: (payload.username as string) || "",
      role: (payload.role as string) || "admin",
      name: (payload.name as string | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
