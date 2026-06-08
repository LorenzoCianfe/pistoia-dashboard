import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "pistoia_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// Fail fast: the whole session scheme's forgery-resistance depends on this
// secret being private. Never let a production build boot with the dev fallback.
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET must be set in production (no insecure fallback allowed).",
  );
}

const secret =
  process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me";

/**
 * The cookie holds a high-entropy opaque token. The database stores only its
 * HMAC (keyed with SESSION_SECRET), so a database leak cannot be used to forge
 * a valid session cookie.
 */
function hashToken(token: string): string {
  return createHmac("sha256", secret).update(token).digest("hex");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createSession(
  userId: string,
  meta?: { userAgent?: string | null; ip?: string | null },
) {
  const token = generateSessionToken();
  const id = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      id,
      userId,
      expiresAt,
      userAgent: meta?.userAgent ?? null,
      ip: meta?.ip ?? null,
    },
  });

  await setSessionCookie(token, expiresAt);
  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export type ValidatedSession = NonNullable<
  Awaited<ReturnType<typeof validateSession>>
>;

/** Read-only session validation (safe to call during render). */
export async function validateSession() {
  const token = await getSessionToken();
  if (!token) return null;

  const id = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id } }).catch(() => {});
    return null;
  }

  return session;
}

/** Destroy the current session (DB row + cookie). Call from a Server Action. */
export async function destroyCurrentSession() {
  const token = await getSessionToken();
  if (token) {
    const id = hashToken(token);
    await prisma.session.delete({ where: { id } }).catch(() => {});
  }
  await clearSessionCookie();
}

/** Remove every session for a user (e.g. "log out everywhere"). */
export async function destroyAllSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}
