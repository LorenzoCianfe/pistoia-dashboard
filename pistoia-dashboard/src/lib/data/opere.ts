import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

// "Cantieri censiti" headline figure from the concept (historical total, mock).
export const TOTALE_CANTIERI_CENSITI = 318;

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

export async function getOpere() {
  const opere = await prisma.opera.findMany({
    orderBy: [{ featured: "desc" }, { status: "asc" }, { progress: "desc" }],
    include: { updates: { orderBy: { date: "desc" }, take: 3 } },
  });

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
    nuoviQuestoMese: 4, // mock KPI from the concept ("+4")
  };
}

export type OpereData = Awaited<ReturnType<typeof getOpere>>;
export type OperaItem = OpereData["opere"][number];
