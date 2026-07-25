import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { cachedShared, TAGS } from "@/lib/cache";
import { quotaInPari } from "@/lib/cronoprogramma";

/*
  Via da qui, nell'ondata 7, due KPI inventati che reggevano la vecchia
  apertura: "318 cantieri censiti" (un totale storico che nessun dato produce)
  e "+4 nuovi questo mese". La pagina ora apre su cifre che si calcolano dalle
  righe vere — investimento aperto e puntualità — e un numero inventato accanto
  a numeri veri li fa sembrare tutti inventati.
*/

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

  return {
    opere,
    featured: opere.filter((o) => o.featured),
    inCorso,
    inCorsoCount: inCorso.length,
    completateCount: opere.filter((o) => o.status === "completata").length,
    totalInvestmentInCorso,
    /*
      La puntualità si calcola QUI e non dentro `getOpereRows`, che è in cache a
      tag: dipende dall'ora corrente, e chiusa nella cache resterebbe ferma al
      momento della prima richiesta finché un aggiornamento dall'admin non la
      invalida. Un cantiere diventerebbe "in ritardo" solo per grazia di un
      altro cantiere modificato.
    */
    puntualita: quotaInPari(inCorso),
  };
}

export type OpereData = Awaited<ReturnType<typeof getOpere>>;
export type OperaItem = OpereData["opere"][number];
