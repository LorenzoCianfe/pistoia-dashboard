import { NextResponse, type NextRequest } from "next/server";

// Optimistic auth check (cookie presence only — no DB access here, since proxy
// runs on every request including prefetches). Real verification happens in the
// Data Access Layer (src/lib/auth/dal.ts), close to the data.

const SESSION_COOKIE = "pistoia_session";

const PROTECTED_PREFIXES = [
  "/la-mia-citta",
  "/bilancio",
  "/opere",
  "/sondaggi",
  "/comunita",
  "/segnalazioni",
  "/proposte",
  "/organigramma",
  "/notifiche",
  "/profilo",
  "/impostazioni",
  "/admin",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // Optimistic guard: send unauthenticated visitors of protected routes to
  // login. We intentionally do NOT redirect authenticated users away from auth
  // pages here — a stale-but-present cookie would cause an infinite loop. That
  // (DB-backed) check lives in the login/registrati pages instead.
  if (isProtected && !hasSession) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
