import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { findSimilarReports } from "@/lib/data/reports";
import { REPORT_CATEGORIES } from "@/lib/community";

// Anti-duplicati (A1 §2): suggerisce segnalazioni aperte simili mentre il
// cittadino compila, così può unirsi con "Anche io" invece di duplicare.
// Read-only, autenticato come /api/search.
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ results: [] }, { status: 401 });
  }
  const category = req.nextUrl.searchParams.get("categoria") ?? "";
  if (!REPORT_CATEGORIES.includes(category)) {
    return NextResponse.json({ results: [] });
  }
  const neighborhoodId = req.nextUrl.searchParams.get("quartiere") || null;
  const results = await findSimilarReports(user.id, category, neighborhoodId);
  return NextResponse.json({ results });
}
