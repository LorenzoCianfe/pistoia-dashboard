import { prisma } from "@/lib/db";
import { statoArchivio, TIPI_ATTO, type StatoArchivio, type TipoAtto } from "@/lib/atti";
import type { CivicTopicKey } from "@/lib/civic-topics";

/*
  I dati del monitor della pipeline degli atti (cruscotto, forma C — scelta da
  Lorenzo il 2026-08-09 sui tre mockup iniettati).

  I conteggi si chiedono al database con `count`/`groupBy`, mai contando righe
  mostrate — e qui non c'è nemmeno una lista da cui farsi tentare.
*/

export type MonitorAtti = {
  stato: StatoArchivio;
  totale: number;
  ultimaPubblicazione: Date | null;
  ultimaLetturaRiuscita: Date | null;
  perTipo: Array<{ tipo: TipoAtto; totale: number }>;
  perTema: Array<{ tema: CivicTopicKey; totale: number }>;
  senzaTema: number;
};

export async function getMonitorAtti(): Promise<MonitorAtti> {
  const adesso = new Date();
  const [totale, ultimo, ultimaLettura, perTipoGrezzi, perTemaGrezzi, senzaTema] = await Promise.all([
    prisma.atto.count(),
    prisma.atto.findFirst({ orderBy: { inizioPubblicazione: "desc" }, select: { inizioPubblicazione: true } }),
    prisma.letturaAtti.findFirst({
      where: { esito: "riuscita" },
      orderBy: { iniziataIl: "desc" },
      select: { finitaIl: true, iniziataIl: true },
    }),
    prisma.atto.groupBy({ by: ["tipo"], _count: { _all: true } }),
    prisma.atto.groupBy({ by: ["temaCivico"], _count: { _all: true }, where: { NOT: { temaCivico: null } } }),
    prisma.atto.count({ where: { temaCivico: null } }),
  ]);

  // L'ordine dei tipi è quello canonico di TIPI_ATTO, non quello del groupBy:
  // così «Determinazione» non scavalca «Delibera» a seconda dei numeri.
  const contoTipo = new Map(perTipoGrezzi.map((r) => [r.tipo, r._count._all]));
  const perTipo = TIPI_ATTO.filter((t) => contoTipo.has(t)).map((t) => ({ tipo: t, totale: contoTipo.get(t)! }));

  const perTema = perTemaGrezzi
    .map((r) => ({ tema: r.temaCivico as CivicTopicKey, totale: r._count._all }))
    .sort((a, b) => b.totale - a.totale);

  return {
    stato: statoArchivio({
      totaleAtti: totale,
      ultimaPubblicazione: ultimo?.inizioPubblicazione ?? null,
      ultimaLetturaRiuscita: ultimaLettura ? (ultimaLettura.finitaIl ?? ultimaLettura.iniziataIl) : null,
      adesso,
    }),
    totale,
    ultimaPubblicazione: ultimo?.inizioPubblicazione ?? null,
    ultimaLetturaRiuscita: ultimaLettura ? (ultimaLettura.finitaIl ?? ultimaLettura.iniziataIl) : null,
    perTipo,
    perTema,
    senzaTema,
  };
}
