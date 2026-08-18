/*
  LA LETTURA DEGLI ATTI — legge il portale della trasparenza e tiene allineato
  il modello `Atto`. La logica pura (chiavi, tema civico, CSV) sta in
  `src/lib/atti.ts` ed è coperta dai test; qui c'è solo ciò che tocca la rete e
  il database.

    corepack pnpm atti              # il giro quotidiano: l'albo, ~2s
    corepack pnpm atti --storico    # il carico iniziale: 26.588 righe, ~3 min
    corepack pnpm atti --tutte      # tutte e quattro le griglie
    corepack pnpm atti --prova      # legge e conta, senza scrivere

  ⚠️ Niente `--` prima delle opzioni: è l'idioma di npm, e pnpm lo passa
  ALLA LETTERA allo script (misurato in Fase 2b: `pnpm x -- --tutte` consegna
  `["--","--tutte"]`). Con pnpm le opzioni si scrivono di seguito.

  PERCHÉ L'ALBO BASTA PER IL GIRO QUOTIDIANO. Un atto resta sull'albo per la
  propria finestra di pubblicazione legale (mediana 15 giorni, misurata) e nel
  frattempo entra anche nello storico. Leggere l'albo ogni giorno intercetta
  quindi tutto, a un costo di due secondi invece di tre minuti. Lo storico si
  rilegge solo per il carico iniziale o per una riconciliazione.

  ⚠️ Tre cose che sembrano dettagli e non lo sono — docs/fonti-atti.md:
  - lo user-agent DEVE sembrare un Chrome vero, o il WAF risponde 500;
  - l'export si chiede DOPO essere passati dalla griglia, con i cookie di
    quella visita: l'URL è identico per tutte le griglie dello stesso portlet e
    quello che esporta dipende dalla sessione del portlet;
  - il CSV si riconosce dal corpo, perché l'export grande dichiara text/html.

  🔴 NIENTE BROWSER, ed è una decisione misurata (2026-08-11). Questa lettura
  girava su Playwright, e Playwright in produzione non esisteva: il Dockerfile
  fa `npm ci`, che installa il pacchetto ma NON scarica i binari — un cron nel
  container sarebbe partito verso «Executable doesn't exist». Le due cose per
  cui serviva un browser sono uno user-agent credibile e i cookie del portlet,
  e `fetch` le fa tutte e due. Misurato su tutte e quattro le griglie: albo
  2,6s · storico 13,47MB in 178s · le due piccole ~1s, nessuna bloccata.
  Il browser sarebbe costato 427MB per immagine, su un disco da 40GB che si è
  già riempito al 100% una volta, per fare due GET.
*/

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  type AttoLetto,
  type Barattolo,
  type Griglia,
  intestazioneCookie,
  paginaDiBlocco,
  raccogliCookie,
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

/** Le intestazioni di un Chrome vero. L'UA è la sola che il WAF guarda, ma le
 *  altre due costano nulla e rendono la richiesta meno anomala. */
const INTESTAZIONI = {
  "User-Agent": UA_BROWSER_VERO,
  "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
} as const;

/** Lo storico impiega ~178s a rispondere: il timeout sta sopra quel numero con
 *  un margine ampio, ma esiste — senza, un portale che non chiude mai la
 *  risposta terrebbe il giro appeso per sempre, che su un lavoro schedulato è
 *  peggio di un errore. */
const TIMEOUT_MS = 300_000;

async function chiedi(url: string, barattolo: Barattolo, referer?: string) {
  const cookie = intestazioneCookie(barattolo);
  const risposta = await fetch(url, {
    headers: {
      ...INTESTAZIONI,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(referer ? { Referer: referer } : {}),
    },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  raccogliCookie(barattolo, risposta.headers.getSetCookie());
  return { stato: risposta.status, corpo: await risposta.text() };
}

async function scaricaGriglia(g: Griglia): Promise<Lettura> {
  // Un barattolo NUOVO per ogni griglia: l'export è agganciato all'ultima
  // griglia visitata nella stessa sessione (fonti-atti.md §1.2), quindi due
  // griglie che condividessero i cookie si esporterebbero a vicenda.
  const barattolo: Barattolo = new Map();

  const griglia = await chiedi(urlGriglia(g), barattolo);
  if (paginaDiBlocco(griglia.corpo)) {
    return { esito: "bloccata", corpo: "", messaggio: `il WAF ha bloccato la griglia (stato ${griglia.stato})` };
  }

  const risultato = await chiedi(urlExport(g), barattolo, urlGriglia(g));
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

const TUTTE: Griglia[] = ["storico", "albo", "provvedimenti", "generali"];

async function main() {
  const argomenti = process.argv.slice(2);
  const prova = argomenti.includes("--prova");
  const chiesteEsplicitamente = argomenti.includes("--tutte") || argomenti.includes("--storico");

  /*
    🔴 SU UN ARCHIVIO VUOTO IL GIRO BREVE NON BASTA, e il difetto sarebbe
    invisibile. L'albo contiene ~220 atti: chi lo leggesse su un archivio a
    zero si ritroverebbe **220 atti su 26.644**, cioè un archivio 120 volte
    più piccolo del vero — e il monitor direbbe «Aggiornato», perché la lettura
    è andata benissimo. Un dato plausibile e falso, che è la categoria di
    difetti che qui costa di più.

    Non è un caso di scuola: è **esattamente lo stato della produzione**, dove
    l'archivio non è mai stato riempito. Il primo scatto dello scheduled task
    ci finirebbe dentro. Quindi il giro se ne accorge da sé e fa il carico
    completo — 178s una volta sola, contro i ~2s di tutti i giorni dopo.

    La soglia è ZERO e non un numero scelto: «vuoto» è un fatto, «troppo
    pochi» sarebbe un giudizio da tarare.
  */
  const archivioVuoto = !prova && (await prisma.atto.count()) === 0;
  const quali: Griglia[] = argomenti.includes("--tutte")
    ? TUTTE
    : argomenti.includes("--storico")
      ? ["storico"]
      : archivioVuoto
        ? TUTTE
        : ["albo"];

  if (archivioVuoto && !chiesteEsplicitamente) {
    console.log("L'archivio è VUOTO: questo giro fa il carico iniziale, non quello quotidiano.");
  }
  console.log(`Lettura degli atti · griglie: ${quali.join(", ")}${prova ? " · PROVA (non scrive)" : ""}`);

  let uscita = 0;
  const raccolti: Array<{ atto: AttoLetto; griglia: Griglia }> = [];

  for (const g of quali) {
    const inizio = new Date();
    process.stdout.write(`  ${CONFIGURAZIONE[g].nome}… `);
    let lettura: Lettura;
    try {
      lettura = await scaricaGriglia(g);
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
