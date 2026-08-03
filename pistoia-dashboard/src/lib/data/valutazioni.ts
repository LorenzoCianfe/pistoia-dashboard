import "server-only";
import { prisma } from "@/lib/db";
import { CAMPIONE_MINIMO_PER_GIUDIZIO, STATI_FUORI_CONTEGGIO } from "@/lib/citystats";
import {
  SERVIZI,
  colonnaDuraDa,
  composizione,
  inizioFinestra,
  media,
  nomePubblico,
  periodoDi,
  serviziDi,
  testoVisibile,
  ultimiPeriodi,
  type ColonnaDura,
  type Composizione,
  type Famiglia,
  type Media,
  type Servizio,
} from "@/lib/valutazioni";

export type { ColonnaDura };

/*
  Due sorgenti, due ruoli, e non è un compromesso.

  Le **stelle** vengono da `Valutazione`, e il giorno uno sono zero. La
  **colonna dura** viene da `Report`, cioè da dati che la piattaforma possiede
  da sempre: quante segnalazioni la città apre su quella materia e in quanti
  giorni il Comune le chiude.

  È la risposta alla domanda che ha bloccato questa funzione fin dall'inizio —
  *cosa mostra la pagina finché i voti non esistono* — e la ragione per cui la
  scheda non è mai vuota e non è mai finta. L'accostamento è anche il prodotto
  vero: «le segnalazioni si chiudono in 9 giorni, i cittadini danno 2,4 su 5»
  dice qualcosa che nessuno dei due numeri dice da solo.
*/

export type SchedaServizio = {
  servizio: Servizio;
  media: Media;
  composizione: Composizione;
  colonna: ColonnaDura | null;
};

const ANNO_MS = 365 * 86_400_000;

async function colonnaDura(s: Servizio, oggi: Date): Promise<ColonnaDura | null> {
  if (s.categorieReport.length === 0) return null;

  const da = new Date(oggi.getTime() - ANNO_MS);
  const reports = await prisma.report.findMany({
    where: {
      category: { in: s.categorieReport },
      createdAt: { gte: da },
      status: { notIn: [...STATI_FUORI_CONTEGGIO] },
    },
    select: { createdAt: true, resolvedAt: true },
  });

  const giorni = reports
    .filter((r) => r.resolvedAt != null)
    .map((r) =>
      Math.max(
        0,
        Math.round((r.resolvedAt!.getTime() - r.createdAt.getTime()) / 86_400_000),
      ),
    );

  // La soglia della mediana è quella di `citystats` (5), non quella delle
  // valutazioni (20): le segnalazioni arrivano da sole, le recensioni no.
  return colonnaDuraDa(s, giorni, reports.length, CAMPIONE_MINIMO_PER_GIUDIZIO);
}

/**
 * Quali valutazioni entrano nella media di questo servizio.
 *
 * Unica asimmetria fra le due famiglie, e segue la loro natura: uno sportello
 * media **tutto lo storico** (una recensione di una visita del 2024 resta vera
 * come verbale di quella visita), una condizione una **finestra mobile** (un
 * voto sulla pulizia del 2024 è scaduto: la strada è stata spazzata da allora).
 */
function finestraDi(s: Servizio, oggi: Date) {
  return s.famiglia === "condizione"
    ? { createdAt: { gte: inizioFinestra(oggi) } }
    : {};
}

export async function getScheda(
  s: Servizio,
  oggi: Date = new Date(),
): Promise<SchedaServizio> {
  const [valutazioni, colonna] = await Promise.all([
    prisma.valutazione.findMany({
      where: { servizioId: s.id, rimossaIl: null, ...finestraDi(s, oggi) },
      select: { stelle: true, emailConfermata: true, canale: true, rimossaIl: true },
    }),
    colonnaDura(s, oggi),
  ]);

  return {
    servizio: s,
    media: media(valutazioni.map((v) => v.stelle)),
    composizione: composizione(valutazioni),
    colonna,
  };
}

/** La panoramica: i due tabelloni, **mai fusi**. */
export async function getPanoramica(oggi: Date = new Date()) {
  const schede = await Promise.all(SERVIZI.map((s) => getScheda(s, oggi)));
  const per = (f: Famiglia) =>
    schede
      .filter((x) => x.servizio.famiglia === f)
      .sort((a, b) => a.servizio.ordine - b.servizio.ordine);

  return {
    sportello: per("sportello"),
    condizione: per("condizione"),
    /** Quante caselle hanno guadagnato la propria media. Vero, e spesso zero. */
    conVoto: schede.filter((x) => x.media.pubblicabile).length,
    totale: schede.length,
  };
}

export type RecensioneResa = {
  id: string;
  stelle: number;
  testo: string | null;
  autore: string;
  confermata: boolean;
  daQr: boolean;
  qrLuogo: string | null;
  quartiere: string | null;
  quando: Date;
};

/** Le recensioni scritte, dalla più recente. Le rimosse non compaiono mai. */
export async function getRecensioni(
  s: Servizio,
  oggi: Date = new Date(),
  quante = 20,
): Promise<RecensioneResa[]> {
  const righe = await prisma.valutazione.findMany({
    where: { servizioId: s.id, rimossaIl: null, ...finestraDi(s, oggi) },
    orderBy: { createdAt: "desc" },
    take: quante,
    select: {
      id: true,
      stelle: true,
      testo: true,
      rimossaIl: true,
      emailConfermata: true,
      canale: true,
      qrLuogo: true,
      nomeVisualizzato: true,
      mostraNomeIntero: true,
      createdAt: true,
      quartiere: { select: { name: true } },
    },
  });

  return righe.map((r) => ({
    id: r.id,
    stelle: r.stelle,
    testo: testoVisibile(r),
    autore: nomePubblico(r.nomeVisualizzato, r.mostraNomeIntero),
    confermata: r.emailConfermata,
    daQr: r.canale === "qr",
    qrLuogo: r.qrLuogo,
    quartiere: r.quartiere?.name ?? null,
    quando: r.createdAt,
  }));
}

/**
 * L'andamento: un punto al mese.
 *
 * Un mese sotto soglia resta un **buco dichiarato**, non uno zero. Uno zero
 * direbbe «valutato pessimo», che è il contrario di «non abbiamo abbastanza
 * risposte» — la stessa distinzione fra assenza e giudizio che regge tutta la
 * funzione.
 */
export async function getAndamento(
  s: Servizio,
  oggi: Date = new Date(),
  mesi = 6,
): Promise<{ periodo: string; media: number | null; campione: number }[]> {
  const periodi = ultimiPeriodi(oggi, mesi);
  const righe = await prisma.valutazione.findMany({
    where: { servizioId: s.id, rimossaIl: null, periodo: { in: periodi } },
    select: { periodo: true, stelle: true },
  });

  return periodi.map((periodo) => {
    const stelle = righe.filter((r) => r.periodo === periodo).map((r) => r.stelle);
    const m = media(stelle);
    return { periodo, media: m.valore, campione: m.campione };
  });
}

/** Il registro pubblico delle rimozioni: cosa è stato tolto, quando e perché. */
export async function getRimozioni(s: Servizio) {
  return prisma.valutazione.findMany({
    where: { servizioId: s.id, rimossaIl: { not: null } },
    orderBy: { rimossaIl: "desc" },
    take: 10,
    select: { id: true, rimossaIl: true, rimossaMotivo: true },
  });
}

/** Le risposte del Comune e le note della redazione su questo servizio. */
export async function getRisposte(s: Servizio) {
  return prisma.rispostaServizio.findMany({
    where: { servizioId: s.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      tipo: true,
      periodo: true,
      testo: true,
      caricaAlMomento: true,
      urlFonte: true,
      dataConsultazione: true,
      createdAt: true,
      autore: { select: { name: true, accountType: true, avatarColor: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// R-3, il voto
// ---------------------------------------------------------------------------

/** Il codice stampato: porta servizio e luogo alla pagina `/v/[codice]`. */
export async function getCodiceQr(codice: string) {
  return prisma.codiceQr.findUnique({ where: { codice } });
}

/** Tutti i codici, per il foglio da stampare (`/admin/codici-qr`). */
export async function getCodiciQrTutti() {
  return prisma.codiceQr.findMany({
    orderBy: [{ servizioId: "asc" }, { codice: "asc" }],
  });
}

/**
 * I quartieri per la tendina del voto sulle condizioni. Facoltativa per chi
 * vota, necessaria alla piattaforma: è ciò che permette a un quartiere di
 * sbloccarsi da solo quando supera la soglia (`quartiereSbloccato`).
 */
export async function getQuartieriPerVoto(): Promise<{ id: string; nome: string }[]> {
  const righe = await prisma.neighborhood.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return righe.map((r) => ({ id: r.id, nome: r.name }));
}

/**
 * La valutazione dietro un link di conferma. Il token è l'unica chiave: chi ha
 * la mail può confermare o revocare, nessun account richiesto.
 */
export async function getValutazionePerToken(token: string) {
  if (!token || token.length > 64) return null;
  const v = await prisma.valutazione.findUnique({
    where: { confermaToken: token },
    select: {
      stelle: true,
      testo: true,
      rimossaIl: true,
      emailConfermata: true,
      servizioId: true,
      createdAt: true,
      qrLuogo: true,
    },
  });
  if (!v) return null;
  const s = SERVIZI.find((x) => x.id === v.servizioId) ?? null;
  if (!s) return null;
  return {
    servizio: s,
    stelle: v.stelle,
    testo: testoVisibile(v),
    emailConfermata: v.emailConfermata,
    quando: v.createdAt,
    qrLuogo: v.qrLuogo,
  };
}

export const PERIODO_CORRENTE = () => periodoDi(new Date());
export { serviziDi };
