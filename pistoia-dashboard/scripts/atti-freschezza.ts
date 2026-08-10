/*
  IL CANCELLO DI FRESCHEZZA DEGLI ATTI.

    npx tsx scripts/atti-freschezza.ts

  Risponde a una domanda sola: **l'archivio degli atti è ancora vero?** Un
  archivio che ha smesso di aggiornarsi non somiglia a un guasto — somiglia a
  un archivio. Continua a rispondere, continua a mostrare 26.590 atti, e
  l'ultimo è di marzo.

  È la regola di AGENTS.md §3 (Fase A/B, 3) applicata a una pipeline invece che
  a un test: **un cancello deve distinguere «verificato e a posto» da «non
  verificato»**, e non è mai verde per omissione. Qui significa che l'assenza
  di letture è rossa quanto una lettura fallita.

  ⚠️ Perché «bloccata» è un esito a sé. Il WAF del portale risponde **500** con
  una pagina «Web Page Blocked» quando lo user-agent sa di automazione: chi
  legge lo stato conclude «il portale è giù» e aspetta che passi. Non passa —
  si ripara cambiando user-agent. Due guasti diversi vogliono due messaggi
  diversi.
*/

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
// Le soglie stanno in lib/atti.ts perché le usa anche il monitor sul
// cruscotto: una soglia condivisa si importa, non si riscrive.
import { GRIGLIE, GIORNI_MASSIMI_SENZA_ATTI, ORE_MASSIME_SENZA_LETTURA } from "../src/lib/atti";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

const ore = (d: Date, ora: Date) => (ora.getTime() - d.getTime()) / 3_600_000;
const giorni = (d: Date, ora: Date) => ore(d, ora) / 24;

type Controllo = { titolo: string; ok: boolean; dettaglio: string };

async function controlli(adesso: Date): Promise<Controllo[]> {
  const esiti: Controllo[] = [];

  // 1. C'è un archivio? Zero atti non è «un archivio vuoto», è una pipeline
  //    che non ha mai funzionato.
  const totale = await prisma.atto.count();
  esiti.push({
    titolo: "l'archivio esiste",
    ok: totale > 0,
    dettaglio: totale > 0 ? `${totale.toLocaleString("it-IT")} atti` : "nessun atto: la lettura non ha mai funzionato",
  });
  if (totale === 0) return esiti;

  // 2. L'ultima lettura di ciascuna griglia com'è andata? Si guarda per
  //    griglia e non in generale: l'albo può funzionare mentre lo storico no.
  for (const g of GRIGLIE) {
    const ultima = await prisma.letturaAtti.findFirst({ where: { griglia: g }, orderBy: { iniziataIl: "desc" } });
    if (!ultima) {
      // Solo l'albo è tenuto a girare: le altre tre si leggono all'occorrenza.
      if (g === "albo") esiti.push({ titolo: `griglia «${g}»`, ok: false, dettaglio: "mai letta" });
      continue;
    }
    const quando = ultima.finitaIl ?? ultima.iniziataIl;
    const spiega =
      ultima.esito === "bloccata"
        ? "il WAF del portale ha bloccato la lettura — si ripara mandando lo user-agent di un browser vero, non aspettando"
        : (ultima.messaggio ?? ultima.esito);
    esiti.push({
      titolo: `ultima lettura di «${g}»`,
      ok: ultima.esito === "riuscita",
      dettaglio:
        ultima.esito === "riuscita"
          ? `riuscita ${ore(quando, adesso).toFixed(0)}h fa · ${ultima.righeLette} righe`
          : `${ultima.esito.toUpperCase()}: ${spiega}`,
    });
  }

  // 3. La pipeline gira ancora? Una lettura riuscita ma vecchia di un mese
  //    lascia l'archivio fermo senza che niente sia «fallito».
  const ultimaRiuscita = await prisma.letturaAtti.findFirst({ where: { esito: "riuscita" }, orderBy: { iniziataIl: "desc" } });
  if (!ultimaRiuscita) {
    esiti.push({ titolo: "la lettura gira", ok: false, dettaglio: "nessuna lettura riuscita registrata" });
  } else {
    const quando = ultimaRiuscita.finitaIl ?? ultimaRiuscita.iniziataIl;
    const h = ore(quando, adesso);
    esiti.push({
      titolo: "la lettura gira",
      ok: h <= ORE_MASSIME_SENZA_LETTURA,
      dettaglio: `ultima riuscita ${h.toFixed(0)}h fa (tetto ${ORE_MASSIME_SENZA_LETTURA}h)`,
    });
  }

  // 4. Il portale pubblica ancora, e noi lo vediamo? È il controllo che
  //    distingue «la pipeline gira» da «la pipeline porta a casa qualcosa».
  const piuRecente = await prisma.atto.findFirst({ orderBy: { inizioPubblicazione: "desc" } });
  if (piuRecente) {
    const g = giorni(piuRecente.inizioPubblicazione, adesso);
    esiti.push({
      titolo: "l'archivio è fresco",
      ok: g <= GIORNI_MASSIMI_SENZA_ATTI,
      dettaglio:
        `atto più recente ${g.toFixed(1)} giorni fa ` +
        `(${piuRecente.tipo} ${piuRecente.anno}/${piuRecente.numero}, tetto ${GIORNI_MASSIMI_SENZA_ATTI}gg)`,
    });
  }

  return esiti;
}

async function main() {
  const adesso = new Date();
  const esiti = await controlli(adesso);
  console.log("Cancello di freschezza degli atti\n");
  for (const e of esiti) console.log(`  ${e.ok ? "✅" : "❌"} ${e.titolo}: ${e.dettaglio}`);

  const rossi = esiti.filter((e) => !e.ok).length;
  console.log(
    rossi === 0
      ? `\n${esiti.length} controlli, 0 problemi.`
      : `\n${rossi === 1 ? "1 problema" : `${rossi} problemi`} su ${esiti.length} controlli.`,
  );

  await prisma.$disconnect();
  process.exit(rossi === 0 ? 0 : 1);
}

main().catch(async (e) => {
  // Anche il cancello che si rompe è rosso: non è mai verde per omissione.
  console.error("Il cancello non ha potuto controllare:", e);
  await prisma.$disconnect();
  process.exit(1);
});
