import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { cachedShared, TAGS } from "@/lib/cache";
import { DEMO_MODE } from "@/lib/demo";

// "Cantieri censiti" headline figure from the concept (historical total, mock).
// Null fuori da DEMO_MODE: la UI ricade sul conteggio reale dal DB.
export const TOTALE_CANTIERI_CENSITI = DEMO_MODE ? 318 : null;

/** Full detail for a single public work (§18): photos, FAQ, updates, comments. */
export const getOperaById = cache(async (id: string) => {
  return prisma.opera.findUnique({
    where: { id },
    include: {
      updates: { orderBy: { date: "desc" } },
      photos: { orderBy: [{ phase: "asc" }, { order: "asc" }] },
      faqs: { orderBy: { order: "asc" } },
      comments: { where: { hidden: false }, orderBy: { createdAt: "desc" } },
      neighborhood: { select: { name: true, slug: true } },
    },
  });
});

export type OperaDetail = NonNullable<Awaited<ReturnType<typeof getOperaById>>>;
export type OperaComment = OperaDetail["comments"][number];

// Lista condivisa (nessun dato per-utente): cache a tag "opere", invalidata
// dall'admin quando aggiorna un cantiere.
const getOpereRows = cachedShared(
  async () =>
    prisma.opera.findMany({
      orderBy: [{ featured: "desc" }, { status: "asc" }, { progress: "desc" }],
      include: { updates: { orderBy: { date: "desc" }, take: 3 } },
    }),
  "opere-list",
  [TAGS.opere],
);

export async function getOpere() {
  const opere = await getOpereRows();

  const inCorso = opere.filter((o) => o.status === "in_corso");
  const totalInvestmentInCorso = inCorso.reduce((s, o) => s + o.investment, 0);
  const avgProgress = inCorso.length
    ? Math.round(inCorso.reduce((s, o) => s + o.progress, 0) / inCorso.length)
    : 0;

  return {
    opere,
    featured: opere.filter((o) => o.featured),
    inCorsoCount: inCorso.length,
    completateCount: opere.filter((o) => o.status === "completata").length,
    totalInvestmentInCorso,
    avgProgress,
    nuoviQuestoMese: DEMO_MODE ? 4 : null, // mock KPI from the concept ("+4")
  };
}

export type OpereData = Awaited<ReturnType<typeof getOpere>>;
export type OperaItem = OpereData["opere"][number];
