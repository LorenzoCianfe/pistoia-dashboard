import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { globalSearch } from "@/lib/data/search";

/*
  Endpoint read-only per la palette di ricerca (Cmd+K).
  Autenticato: la piattaforma è interamente dietro login.

  ⚠️ `Cache-Control` esplicito. Misurato il 2026-08-08: le PAGINE ricevono da
  Next `no-cache, must-revalidate`, queste due rotte **niente** — e una
  risposta 200 senza istruzioni può essere conservata da una cache intermedia
  con la propria euristica (RFC 9111 §4.2.2). Il contenuto è dietro sessione;
  quello della rotta sorella è per-utente. `Vary: Cookie` è la seconda metà:
  dice che due sessioni diverse non condividono la stessa voce.
*/
const NON_CONSERVARE = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
};

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ results: [] }, { status: 401, headers: NON_CONSERVARE });
  }
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await globalSearch(q);
  return NextResponse.json({ results }, { headers: NON_CONSERVARE });
}
