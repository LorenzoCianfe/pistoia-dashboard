import "server-only";
import { cookies, headers } from "next/headers";
import { createHmac, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

const COOKIE_NAME = "pistoia_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// La resistenza alla contraffazione delle sessioni dipende da questo segreto.
// env.ts garantisce il fail-fast: in produzione richiede >=32 caratteri,
// in sviluppo usa un fallback dichiaratamente insicuro.
const secret = env.SESSION_SECRET;

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

/**
 * `Secure` si decide dal protocollo **reale** della richiesta, non da
 * `NODE_ENV`.
 *
 * Prima era `NODE_ENV === "production"`, e su un deploy servito in **HTTP** era
 * un modo silenzioso di impedire l'accesso: un browser **non conserva un cookie
 * `Secure` arrivato in chiaro**, quindi il login riusciva — il redirect lo
 * decide il server nella stessa risposta — ma la navigazione successiva tornava
 * al login, per sempre. Riprodotto contro il deploy il 2026-08-05: dopo
 * l'accesso il browser aveva **zero cookie** e ogni rotta protetta atterrava su
 * `/login`.
 *
 * Il ripiego è **conservativo di proposito**: si rinuncia a `Secure` solo
 * quando il proxy dichiara positivamente che la connessione è in chiaro. Se
 * l'intestazione non c'è — nessun reverse proxy davanti — si torna al
 * comportamento di prima, perché un cookie di sessione senza `Secure` su una
 * connessione che potrebbe essere HTTPS sarebbe un regalo a chi ascolta.
 *
 * Il giorno che il deploy avrà un certificato valido questa funzione si
 * riaccende **da sola**, senza toccare codice: è la stessa forma della
 * correzione fatta alla CSP (`src/proxy.ts`).
 */
async function connessioneCifrata(): Promise<boolean> {
  const h = await headers();
  // Traefik/Coolify mandano `x-forwarded-proto`; alcuni proxy usano `-scheme`.
  // Con più proxy in fila il valore è una lista: vale il primo, cioè il client.
  const dichiarato = (
    h.get("x-forwarded-proto") ??
    h.get("x-forwarded-scheme") ??
    ""
  )
    .split(",")[0]
    .trim()
    .toLowerCase();

  if (dichiarato) return dichiarato === "https";
  return process.env.NODE_ENV === "production";
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: await connessioneCifrata(),
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

  // Permanently banned accounts are fully signed out (§14).
  if (session.user.banned) {
    await prisma.session.deleteMany({ where: { userId: session.userId } }).catch(() => {});
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
