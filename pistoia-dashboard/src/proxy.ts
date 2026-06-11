import { NextResponse, type NextRequest } from "next/server";

// Due responsabilità (entrambe per-request, quindi vivono nel proxy):
// 1. guard ottimistico di autenticazione (solo presenza cookie — la verifica
//    reale è nel Data Access Layer, src/lib/auth/dal.ts);
// 2. Content-Security-Policy con nonce per-request (Fase 0) — il nonce viene
//    letto da Next per i propri script e dal root layout per next-themes.

const SESSION_COOKIE = "pistoia_session";

const PROTECTED_PREFIXES = [
  "/la-mia-citta",
  "/bilancio",
  "/opere",
  "/sondaggi",
  "/comunita",
  "/segnalazioni",
  "/proposte",
  "/eventi",
  "/mappa",
  "/quartieri",
  "/organigramma",
  "/notifiche",
  "/profilo",
  "/impostazioni",
  "/admin",
];

function buildCsp(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    // 'strict-dynamic': gli script con nonce possono caricarne altri (chunk
    // Next). In dev React usa eval per ricostruire gli stack di errore.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Motion/Leaflet/next-themes impostano style attribute inline: il nonce
    // sugli stili romperebbe le librerie. Compromesso standard e a basso rischio.
    "style-src 'self' 'unsafe-inline'",
    // data:/blob: per le foto caricate (data URL in DB) e le anteprime;
    // i tile OSM arrivano dai sottodomini a/b/c di tile.openstreetmap.org.
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // Guard ottimistico: i visitatori non autenticati delle rotte protette vanno
  // al login. Non redirigiamo MAI gli utenti autenticati via cookie qui — un
  // cookie presente-ma-scaduto causerebbe un loop infinito. Quel controllo
  // (con accesso al DB) vive nelle pagine login/registrati.
  if (isProtected && !hasSession) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
