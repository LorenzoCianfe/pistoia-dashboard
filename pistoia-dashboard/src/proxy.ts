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
  // "/valutazioni" NON c'è più (R-5, decisione W1 del 2026-08-04): la
  // panoramica e le schede sono a lettura pubblica, nel gruppo (pubblico).
  // Il guard vero resta nella DAL: qui si toglie solo l'acceleratore.
  "/notifiche",
  "/profilo",
  "/impostazioni",
  "/admin",
  "/redazione",
];

function buildCsp(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    /*
      'strict-dynamic': gli script con nonce possono caricarne altri (chunk
      Next). In dev React usa eval per ricostruire gli stack di errore.

      ⚠️ **In sviluppo 'strict-dynamic' NON c'è**, e non è una svista
      (decisione di Lorenzo, 2026-08-05, per sbloccare Next 16.3).
      Da Next 16.3 il server di sviluppo mette nell'HTML **un tag `<script>`
      senza nonce**, che porta codice dell'applicazione. `'strict-dynamic'`
      **disattiva l'allowlist per host**, quindi `'self'` non lo salva: il file
      viene rifiutato, il bundle client non completa e **ogni pagina resta sul
      proprio «Caricamento in corso», col corpo vuoto**. Non è una nostra
      configurazione sbagliata — `required-scripts.js` e il manifest client
      sono identici a 16.2.7 e il nonce lì viene passato — e **in produzione
      non accade**: sull'output di `next build` gli script senza nonce sono
      zero, verificato.

      Che cosa resta in piedi in sviluppo: la CSP c'è tutta, e `'self'`
      continua a rifiutare gli script inline e quelli di altri domini. Cade
      solo la regola che impediva a `'self'` di autorizzare i file serviti da
      noi. In **produzione `'strict-dynamic'` resta**, e con esso il vincolo
      che il tema DEVE essere compilato (`ARCHITECTURE.md` §3).

      Il costo, dichiarato: in sviluppo la CSP non è più identica a quella di
      produzione, quindi un difetto che solo `'strict-dynamic'` intercetta si
      vedrebbe soltanto dopo il build. Questa riga si toglie quando Next
      rimetterà il nonce su quel tag.
    */
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : " 'strict-dynamic'"}`,
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
