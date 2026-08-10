/*
  LA LETTURA DEGLI ATTI — legge il portale della trasparenza e tiene allineato
  il modello `Atto`. La logica pura (chiavi, tema civico, CSV) sta in
  `src/lib/atti.ts` ed è coperta dai test; qui c'è solo ciò che tocca la rete e
  il database.

    npx tsx scripts/atti.ts              # il giro quotidiano: l'albo, ~2s
    npx tsx scripts/atti.ts --storico    # il carico iniziale: 26.588 righe, ~3 min
    npx tsx scripts/atti.ts --tutte      # tutte e quattro le griglie
    npx tsx scripts/atti.ts --prova      # legge e conta, senza scrivere

  PERCHÉ L'ALBO BASTA PER IL GIRO QUOTIDIANO. Un atto resta sull'albo per la
  propria finestra di pubblicazione legale (mediana 15 giorni, misurata) e nel
  frattempo entra anche nello storico. Leggere l'albo ogni giorno intercetta
  quindi tutto, a un costo di due secondi invece di tre minuti. Lo storico si
  rilegge solo per il carico iniziale o per una riconciliazione.

  ⚠️ Tre cose che sembrano dettagli e non lo sono — docs/fonti-atti.md:
  - lo user-agent DEVE sembrare un Chrome vero, o il WAF risponde 500;
  - l'export si chiede DOPO essere passati dalla griglia, nello stesso
    contesto: l'URL è identico per tutte e quello che esporta dipende dalla
    sessione del portlet;
  - il CSV si riconosce dal corpo, perché l'export grande dichiara text/html.
*/

import "dotenv/config";
import { chromium, type Page } from "@playwright/test";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  type AttoLetto,
  type Griglia,
  paginaDiBlocco,
  rigaAdAtto,
  righeConIntestazione,
  sembraCsvDegliAtti,
  vinceSu,
} from "../src/lib/atti";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

const RADICE = "https://pistoia.trasparenza-valutazione-merito.it/web/trasparenzaj";

/** L'UA di un Chrome vero. Con quello di Playwright il WAF risponde 500 con
 *  una pagina «Web Page Blocked», che somiglia a un guasto del portale. */
const UA_BROWSER_VERO =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

const CONFIGURAZIONE: Record<Griglia, { portlet: string; igrid: string; nome: string }> = {
  storico: { portlet: "papca-ap", igrid: "29243408", nome: "Storico atti" },
  albo: { portlet: "papca-ap", igrid: "29243403", nome: "Albo pretorio" },
  provvedimenti: { portlet: "papca-p", igrid: "29243380", nome: "Provvedimenti organi indirizzo politico" },
  generali: { portlet: "papca-g", igrid: "29243391", nome: "Atti generali" },
};

const urlGriglia = (g: Griglia) => `${RADICE}/${CONFIGURAZIONE[g].portlet}/-/papca/igrid/${CONFIGURAZIONE[g].igrid}`;

const urlExport = (g: Griglia) => {
  const p = "jcitygovalbopubblicazioni_WAR_jcitygovalbiportlet";
  return (
    `${RADICE}/${CONFIGURAZIONE[g].portlet}?p_p_id=${p}&p_p_lifecycle=2&p_p_state=pop_up&p_p_mode=view` +
    `&p_p_resource_id=exportList&p_p_cacheability=cacheLevelPage&_${p}_format=csv` +
    `&_${p}_action=mostraLista&_${p}_fromAction=eseguiFiltro`
  );
};

type Esito = "riuscita" | "bloccata" | "vuota" | "errore";
type Lettura = { esito: Esito; corpo: string; messaggio: string | null };

async function scaricaGriglia(page: Page, g: Griglia): Promise<Lettura> {
  const risposta = await page.goto(urlGriglia(g), { waitUntil: "domcontentloaded", timeout: 120_000 });
  const html = await page.content();
  if (paginaDiBlocco(html)) {
    return { esito: "bloccata", corpo: "", messaggio: `il WAF ha bloccato la griglia (stato ${risposta?.status()})` };
  }

  // L'export si chiede DENTRO la pagina, così valgono i cookie del portlet.
  const risultato = await page.evaluate(async (u) => {
    const r = await fetch(u, { credentials: "include" });
    return { stato: r.status, corpo: await r.text() };
  }, urlExport(g));

  if (paginaDiBlocco(risultato.corpo)) {
    return { esito: "bloccata", corpo: "", messaggio: "il WAF ha bloccato l'export" };
  }
  // Il tipo dichiarato non si guarda: sull'export grande il server manda CSV
  // dicendo text/html.
  if (!sembraCsvDegliAtti(risultato.corpo)) {
    return { esito: "errore", corpo: "", messaggio: `l'export non è un CSV (stato ${risultato.stato}, ${risultato.corpo.length} caratteri)` };
  }
  const righe = righeConIntestazione(risultato.corpo);
  if (righe.length === 0) {
    return { esito: "vuota", corpo: risultato.corpo, messaggio: "l'export non contiene righe" };
  }
  return { esito: "riuscita", corpo: risultato.corpo, messaggio: null };
}

/** Fra due pubblicazioni dello stesso atto lette nello STESSO giro tiene la
 *  vincente, così un `--tutte` non litiga con sé stesso. */
function riduci(letti: Array<{ atto: AttoLetto; griglia: Griglia }>) {
  const per = new Map<string, { atto: AttoLetto; griglia: Griglia }>();
  for (const v of letti) {
    const c = per.get(v.atto.chiave);
    if (!c || vinceSu({ griglia: v.griglia, numeroRegistrazione: v.atto.numeroRegistrazione }, { griglia: c.griglia, numeroRegistrazione: c.atto.numeroRegistrazione })) {
      per.set(v.atto.chiave, v);
    }
  }
  return [...per.values()];
}

async function salva(letti: Array<{ atto: AttoLetto; griglia: Griglia }>, adesso: Date) {
  const esistenti = new Map(
    (await prisma.atto.findMany({ select: { chiave: true, griglia: true, numeroRegistrazione: true } })).map((a) => [
      a.chiave,
      a,
    ]),
  );

  const nuovi: Array<Record<string, unknown>> = [];
  const daAggiornare: Array<{ atto: AttoLetto; griglia: Griglia }> = [];
  const invariati: string[] = [];

  for (const v of letti) {
    const gia = esistenti.get(v.atto.chiave);
    if (!gia) {
      nuovi.push(perIlDatabase(v.atto, v.griglia, adesso));
    } else if (
      vinceSu(
        { griglia: v.griglia, numeroRegistrazione: v.atto.numeroRegistrazione },
        { griglia: gia.griglia as Griglia, numeroRegistrazione: gia.numeroRegistrazione },
      )
    ) {
      daAggiornare.push(v);
    } else {
      invariati.push(v.atto.chiave);
    }
  }

  // A blocchi: 26.588 insert uno per uno su SQLite non finiscono più.
  for (let i = 0; i < nuovi.length; i += 500) {
    await prisma.atto.createMany({ data: nuovi.slice(i, i + 500) as never });
  }
  for (const v of daAggiornare) {
    await prisma.atto.update({ where: { chiave: v.atto.chiave }, data: perIlDatabase(v.atto, v.griglia, adesso) as never });
  }
  // «Visto di nuovo» è un fatto che serve al cancello di freschezza: dice che
  // la pipeline gira anche quando non cambia niente.
  for (let i = 0; i < invariati.length; i += 500) {
    await prisma.atto.updateMany({ where: { chiave: { in: invariati.slice(i, i + 500) } }, data: { lettoIl: adesso } });
  }

  return { nuovi: nuovi.length, aggiornati: daAggiornare.length, invariati: invariati.length };
}

function perIlDatabase(a: AttoLetto, griglia: Griglia, adesso: Date) {
  return {
    chiave: a.chiave,
    tipo: a.tipo,
    anno: a.anno,
    numero: a.numero,
    oggetto: a.oggetto,
    ufficio: a.ufficio,
    temaCivico: a.temaCivico,
    dirigente: a.dirigente,
    dataAtto: a.dataAtto,
    dataEsecutivita: a.dataEsecutivita,
    numeroAllegati: a.numeroAllegati,
    inizioPubblicazione: a.inizioPubblicazione,
    finePubblicazione: a.finePubblicazione,
    urlFonte: a.urlFonte,
    idPubblicazione: a.idPubblicazione,
    griglia,
    numeroRegistrazione: a.numeroRegistrazione,
    lettoIl: adesso,
  };
}

async function main() {
  const argomenti = process.argv.slice(2);
  const prova = argomenti.includes("--prova");
  const quali: Griglia[] = argomenti.includes("--tutte")
    ? ["storico", "albo", "provvedimenti", "generali"]
    : argomenti.includes("--storico")
      ? ["storico"]
      : ["albo"];

  console.log(`Lettura degli atti · griglie: ${quali.join(", ")}${prova ? " · PROVA (non scrive)" : ""}`);

  const browser = await chromium.launch();
  const contesto = await browser.newContext({
    userAgent: UA_BROWSER_VERO,
    locale: "it-IT",
    extraHTTPHeaders: { "Accept-Language": "it-IT,it;q=0.9,en;q=0.8" },
  });
  const page = await contesto.newPage();

  let uscita = 0;
  const raccolti: Array<{ atto: AttoLetto; griglia: Griglia }> = [];

  for (const g of quali) {
    const inizio = new Date();
    process.stdout.write(`  ${CONFIGURAZIONE[g].nome}… `);
    let lettura: Lettura;
    try {
      lettura = await scaricaGriglia(page, g);
    } catch (e) {
      lettura = { esito: "errore", corpo: "", messaggio: (e as Error).message.split("\n")[0] };
    }

    let righeLette = 0;
    let scartate = 0;
    if (lettura.esito === "riuscita") {
      const righe = righeConIntestazione(lettura.corpo);
      righeLette = righe.length;
      for (const r of righe) {
        const a = rigaAdAtto(r);
        if (a) raccolti.push({ atto: a, griglia: g });
        else scartate++;
      }
      console.log(`${righeLette} righe, ${scartate} non atti del Comune (${((Date.now() - inizio.getTime()) / 1000).toFixed(1)}s)`);
    } else {
      uscita = 1;
      console.log(`❌ ${lettura.esito}: ${lettura.messaggio}`);
    }

    if (!prova) {
      await prisma.letturaAtti.create({
        data: {
          griglia: g,
          iniziataIl: inizio,
          finitaIl: new Date(),
          esito: lettura.esito,
          righeLette,
          righeScartate: scartate,
          messaggio: lettura.messaggio,
        },
      });
    }
  }

  await browser.close();

  const ridotti = riduci(raccolti);
  console.log(`\n  ${raccolti.length} righe utili → ${ridotti.length} atti distinti`);

  if (prova) {
    const perTema = new Map<string, number>();
    for (const v of ridotti) perTema.set(v.atto.temaCivico ?? "(nessun tema)", (perTema.get(v.atto.temaCivico ?? "(nessun tema)") ?? 0) + 1);
    console.log(`  temi: ${[...perTema.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n}`).join(" · ")}`);
  } else if (ridotti.length > 0) {
    const conto = await salva(ridotti, new Date());
    console.log(`  nuovi ${conto.nuovi} · aggiornati ${conto.aggiornati} · invariati ${conto.invariati}`);
    console.log(`  in archivio: ${await prisma.atto.count()} atti`);
  }

  // Un giro che non ha letto niente non è un giro riuscito: la regola di
  // AGENTS.md §3 — un cancello distingue «verificato» da «non verificato».
  if (ridotti.length === 0) uscita = 1;
  await prisma.$disconnect();
  process.exit(uscita);
}

main().catch(async (e) => {
  console.error("Lettura fallita:", e);
  await prisma.$disconnect();
  process.exit(1);
});
