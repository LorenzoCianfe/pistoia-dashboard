import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { globalSearch } from "@/lib/data/search";

// Endpoint read-only per la palette di ricerca (Cmd+K).
// Autenticato: la piattaforma è interamente dietro login.
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ results: [] }, { status: 401 });
  }
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await globalSearch(q);
  return NextResponse.json({ results });
}
