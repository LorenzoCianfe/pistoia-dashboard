import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  OGGETTO_CORTO,
  OGGETTO_CURATO,
  SOMMARIO_CURATO,
  TITOLO_CURATO,
} from "./costanti-atti";

/*
  GLI ATTI DI PROVA DELLA PRIMA PAGINA.

  ⚠️ **Perché non stanno in `prisma/seed.ts`**, ed è una regola e non una
  comodità: il seed contiene dati **dimostrativi e dichiarati tali**, mentre gli
  atti sono decisioni vere di un'amministrazione vera — `prisma/schema.prisma`
  lo scrive sul modello, e `lib/giunta.ts` fa la stessa distinzione per le nove
  persone della giunta. Un atto inventato dentro il seed, accanto a «Lampione
  spento in via Roma», confonde le due categorie nel punto in cui la
  distinzione conta di più. Il seed quindi **non riempie mai `Atto`**, e
  `e2e.db` nasce con l'archivio a zero.

  🔴 **E perché non stanno nemmeno in `global-setup.ts`, dove erano finiti al
  primo tentativo.** Seminarli per tutta la suite ha fatto cadere
  `analitiche.spec.ts` → *«il monitor degli atti dice la verità su una base
  dati mai letta»*, che esiste **proprio perché** l'archivio è vuoto — e quel
  vuoto non è un caso di laboratorio: **è lo stato della produzione** finché la
  lettura schedulata non esiste. Una copertura che se ne va in silenzio per far
  passare una copertura nuova è il difetto che `AGENTS.md` §2 chiama per nome:
  l'accessibilità e le verifiche non si regrediscono.

  Quindi la semina è **circoscritta al solo spec che ne ha bisogno**, con la
  pulizia in `afterAll`: fuori da `prima-pagina.spec.ts` l'archivio resta a
  zero, e nessun altro test dipende dall'ordine dei file.

  Le due composizioni della home restano coperte tutte e due:
  - **vuota** — dai tre cancelli condivisi (`/` è in `pagine-cancello.ts`), che
    è anche lo stato che vedrebbe oggi chi aprisse la produzione;
  - **piena** — dall'analisi axe che `prima-pagina.spec.ts` fa da sé, sui due
    temi, mentre gli atti ci sono.

  Le date sono **relative a oggi** e non fisse: i conteggi della striscia
  («ultimi 7 giorni») e lo stato dell'archivio si calcolano da adesso, quindi un
  giorno fissato nel passato renderebbe l'archivio permanentemente «fermo» e i
  contatori a zero — cioè proverebbe uno stato degenere invece di quello normale.
*/

/**
 * ⚠️ Con `E2E_BASE_URL` il database non è isolato: lo ha scelto il server già in
 * ascolto, e da qui non è raggiungibile. Scrivere «a occhi chiusi» finirebbe
 * quasi certamente su `dev.db`, cioè sul database della dimostrazione — 26.644
 * atti veri con dentro i nostri finti. Meglio fallire con una frase che dice
 * perché.
 */
function client() {
  if (process.env.E2E_BASE_URL) {
    throw new Error(
      "semina-atti: con E2E_BASE_URL il database non è isolato e questa semina " +
        "finirebbe su dev.db. Lancia `npm run test:e2e` senza E2E_BASE_URL.",
    );
  }
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? "file:./prisma/e2e.db",
    }),
  });
}

/** Il marcatore che rende gli atti di prova riconoscibili e cancellabili. */
const GRIGLIA_DI_PROVA = "e2e";

function mezzanotte(giorniFa: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() - giorniFa * 86_400_000);
}

type Bozza = {
  tipo: string;
  numero: number;
  oggetto: string;
  ufficio: string;
  temaCivico: string | null;
  giorniFa: number;
  curato?: boolean;
};

/*
  Otto atti nel giorno più recente e cinque tre giorni prima.

  Otto e non sei: il fiume ne mostra **sei** e dichiara accanto il numero vero,
  quindi con otto si attraversa anche il ramo «ce ne sono altri» — che con sei
  esatti non verrebbe mai eseguito. È la stessa ragione per cui i cinque atti
  più vecchi ci sono: senza, il totale dell'archivio e il conteggio del giorno
  sarebbero lo stesso numero, e un test che li confondesse passerebbe lo stesso.
*/
const BOZZE: Bozza[] = [
  {
    tipo: "DETERMINAZIONE DEL DIRIGENTE",
    numero: 1692,
    oggetto: OGGETTO_CURATO,
    ufficio: "U.O. Amministrativa LLPP",
    temaCivico: "lavori",
    giorniFa: 0,
    curato: true,
  },
  {
    tipo: "DETERMINAZIONE DEL DIRIGENTE",
    numero: 1689,
    oggetto:
      "DETERMINA A CONTRARRE E AFFIDAMENTO DIRETTO DEL SERVIZIO DI ANALISI E TAMPONI PER I SERVIZI EDUCATIVI COMUNALI E PER IL SERVIZIO DI REFEZIONE SCOLASTICA - PERIODO 2026/2029.",
    ufficio: "Servizio Educazione e Istruzione",
    temaCivico: "scuole",
    giorniFa: 0,
  },
  {
    tipo: "DETERMINAZIONE DEL DIRIGENTE",
    numero: 1683,
    oggetto:
      "EROGAZIONE CONTRIBUTO AD ENPA ODV PER MANTENIMENTO CANI CEDUTI IN ATTUAZIONE VERBALE ASSEMBLEA DEI SINDACI.",
    ufficio: "U.O. Ambiente e Tutela degli Animali",
    temaCivico: "ambiente",
    giorniFa: 0,
  },
  {
    tipo: "DETERMINAZIONE DEL DIRIGENTE",
    numero: 1670,
    oggetto:
      "AVVIO DI INDAGINE DI MERCATO PER MANIFESTAZIONI D'INTERESSE RELATIVE ALLA GESTIONE DELLA PISCINA COMUNALE.",
    ufficio: "U.O. Promozione Sportiva",
    temaCivico: "sport",
    giorniFa: 0,
  },
  {
    tipo: "ORDINANZA",
    numero: 978,
    oggetto:
      "ORDINANZA - PROVVEDIMENTI DIVIETO DI SOSTA E RESTRINGIMENTO CARREGGIATA CON SENSO UNICO ALTERNATO IN VIA PROVINCIALE LUCCHESE.",
    ufficio: "U.O. Mobilita', Traffico e Segnaletica",
    temaCivico: "mobilita",
    giorniFa: 0,
  },
  {
    tipo: "ORDINANZA",
    numero: 977,
    oggetto:
      "ORDINANZA - PROVVEDIMENTI DIVIETO DI SOSTA PER CANTIERE IN VIA VECCHIA FIORENTINA.",
    ufficio: "U.O. Mobilita', Traffico e Segnaletica",
    temaCivico: "mobilita",
    giorniFa: 0,
  },
  {
    tipo: "DETERMINAZIONE DEL DIRIGENTE",
    numero: 1691,
    // Senza tema civico: è un esito legittimo — il 31% degli atti veri non ne
    // ha — e la prima pagina non deve inventarne uno per riempire la casella.
    oggetto:
      "APPROVAZIONE DEI RIEPILOGHI DELLE RISCOSSIONI E DELLE SPESE ORDINARIE EFFETTUATE DALL'ECONOMO COMUNALE.",
    ufficio: "U.O. Gestioni Economali",
    temaCivico: null,
    giorniFa: 0,
  },
  {
    tipo: "DECRETO",
    numero: 41,
    // Corto di proposito: è l'atto su cui `prima-pagina.spec.ts` prova il
    // rifiuto del titolo ricopiato (vedi `OGGETTO_CORTO` in costanti-atti.ts).
    oggetto: OGGETTO_CORTO,
    ufficio: "Segreteria Generale",
    temaCivico: null,
    giorniFa: 0,
  },
  {
    tipo: "DELIBERA DI GIUNTA",
    numero: 210,
    oggetto:
      "APPROVAZIONE DELLE LINEE DI INDIRIZZO PER LA MANUTENZIONE DEL VERDE PUBBLICO.",
    ufficio: "U.O. Verde Pubblico",
    temaCivico: "ambiente",
    giorniFa: 3,
  },
  {
    tipo: "DETERMINAZIONE DEL DIRIGENTE",
    numero: 1640,
    oggetto: "AFFIDAMENTO DEL SERVIZIO DI MANUTENZIONE DEGLI IMPIANTI SEMAFORICI.",
    ufficio: "U.O. Mobilita', Traffico e Segnaletica",
    temaCivico: "mobilita",
    giorniFa: 3,
  },
  {
    tipo: "ORDINANZA",
    numero: 951,
    oggetto: "ORDINANZA - CHIUSURA TEMPORANEA DI VIA DELLA ROSA PER NUOVO ALLACCIO.",
    ufficio: "U.O. Mobilita', Traffico e Segnaletica",
    temaCivico: "mobilita",
    giorniFa: 3,
  },
  {
    tipo: "DETERMINAZIONE DEL DIRIGENTE",
    numero: 1638,
    oggetto: "LIQUIDAZIONE DEL CONTRIBUTO ALLE ASSOCIAZIONI CULTURALI CITTADINE.",
    ufficio: "U.O. Cultura e Biblioteche",
    temaCivico: "cultura",
    giorniFa: 3,
  },
  {
    tipo: "DETERMINAZIONE DEL DIRIGENTE",
    numero: 1631,
    oggetto: "AFFIDAMENTO DEL SERVIZIO DI ASSISTENZA DOMICILIARE PER ANZIANI.",
    ufficio: "U.O. Servizi per l'Abitare e Inclusione Sociale",
    temaCivico: "sociale",
    giorniFa: 3,
  },
];

export async function seminaAtti() {
  const prisma = client();
  try {
    const anno = new Date().getUTCFullYear();
    for (const b of BOZZE) {
      const inizio = mezzanotte(b.giorniFa);
      const chiave = `${b.tipo}|${anno}/${b.numero}`;
      const dati = {
        chiave,
        tipo: b.tipo,
        anno,
        numero: b.numero,
        oggetto: b.oggetto,
        ufficio: b.ufficio,
        temaCivico: b.temaCivico,
        dataAtto: inizio,
        numeroAllegati: 0,
        inizioPubblicazione: inizio,
        // Uno storico plausibile: è l'URL che la pipeline preferisce, perché
        // quello dell'albo scade dopo ~15 giorni (`lib/atti.ts`).
        urlFonte: `https://trasparenza.comune.pistoia.it/web/trasparenza/storico-atti/-/papca/display/${900000 + b.numero}`,
        idPubblicazione: String(900000 + b.numero),
        griglia: GRIGLIA_DI_PROVA,
        numeroRegistrazione: b.numero,
        lettoIl: new Date(),
        titoloRedazionale: b.curato ? TITOLO_CURATO : null,
        sommarioRedazionale: b.curato ? SOMMARIO_CURATO : null,
        curatoIl: b.curato ? new Date() : null,
      };
      // `upsert` e non `create`: se uno spec precedente è caduto a metà, il
      // giro successivo non deve morire su un vincolo di unicità invece che
      // sul difetto vero.
      await prisma.atto.upsert({ where: { chiave }, update: dati, create: dati });
    }

    // Una lettura riuscita: senza, `statoArchivio()` direbbe «fermo» anche con
    // gli atti di oggi in archivio — la freschezza guarda la LETTURA, non solo
    // la pubblicazione, ed è la distinzione che il monitor esiste per fare.
    await prisma.letturaAtti.create({
      data: {
        griglia: GRIGLIA_DI_PROVA,
        iniziataIl: new Date(),
        finitaIl: new Date(),
        esito: "riuscita",
        righeLette: BOZZE.length,
        attiNuovi: BOZZE.length,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Rimette l'archivio a zero.
 *
 * Cancella **per marcatore** (`griglia: "e2e"`) e non tutta la tabella: se un
 * giorno questo spec girasse contro un archivio che qualcun altro ha riempito,
 * un `deleteMany` senza filtro lo svuoterebbe — ed è esattamente la forma del
 * difetto di `AGENTS.md` §3 (2026-08-08), dove un `where` senza condizione non
 * significa «nessuna riga» ma «nessun filtro».
 */
export async function rimuoviAttiDiProva() {
  const prisma = client();
  try {
    await prisma.atto.deleteMany({ where: { griglia: GRIGLIA_DI_PROVA } });
    await prisma.letturaAtti.deleteMany({ where: { griglia: GRIGLIA_DI_PROVA } });
  } finally {
    await prisma.$disconnect();
  }
}

/*
  ⚠️ **Questo file si esegue come SCRIPT, e non si importa da uno spec.**

  Non è una preferenza di stile: il client generato da Prisma è TypeScript in
  forma CommonJS, e il caricatore di Playwright tratta i `.ts` come ESM. Un
  `import` da uno spec muore su **«exports is not defined in ES module scope»**,
  con lo stack che punta al file generato — cioè un errore che sembra un guasto
  di Prisma e invece è il caricatore. `tsx` lo carica senza storie, ed è già il
  modo in cui `global-setup.ts` lancia il seed.

      npx tsx tests/e2e/semina-atti.ts semina
      npx tsx tests/e2e/semina-atti.ts pulisci
*/
const comando = process.argv[2];
if (comando === "semina" || comando === "pulisci") {
  (comando === "semina" ? seminaAtti() : rimuoviAttiDiProva())
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(`[e2e] semina-atti ${comando} fallita:`, e);
      process.exit(1);
    });
} else if (comando !== undefined) {
  console.error(`[e2e] semina-atti: comando sconosciuto «${comando}»`);
  process.exit(1);
}
