import "server-only";
import { prisma } from "@/lib/db";
import { analiticheOperative } from "@/lib/analitiche";
import { demoBaseline } from "@/lib/demo";
import { SERVIZI, nomePubblico, testoVisibile } from "@/lib/valutazioni";

/*
  I DATI DELL'AREA COMUNE, UNA FUNZIONE PER SUPERFICIE.

  Fino al 2026-08-07 era `getAdminData()`: **un solo `Promise.all` con dieci
  query**, perché la superficie era una sola pagina alta 7.300px. Spezzata
  `/admin` in sette rotte (`docs/piano-admin.md`), quella forma sarebbe
  diventata il difetto peggiore del taglio — ogni sottopagina avrebbe pagato
  tutte e dieci le query per mostrarne una.

  Le condizioni di filtro stanno in costanti condivise e non ricopiate nelle
  singole funzioni: la lista e il contatore della stessa coda **devono** porre
  la stessa domanda al database, altrimenti la navigazione dice «3» e la pagina
  ne mostra quattro. È la regola di `AGENTS.md` §3 (ondata 7, nota finale):
  *due definizioni dello stesso indicatore sono peggio di nessun indicatore.*
*/

/** I quattro modi in cui una segnalazione si chiude. */
const CHIUSE = ["risolta", "chiusa", "non_di_competenza", "duplicata"];

/** Aperta = non ancora chiusa in nessuno dei quattro modi in cui si chiude. */
const SEGNALAZIONE_APERTA = { status: { notIn: CHIUSE } };

/** Le proposte che il Comune ha davanti: pubblicate, in valutazione, risposte. */
const DA_VALUTARE = ["pubblicata", "in_valutazione", "risposta"];
const PROPOSTA_DA_VALUTARE = { status: { in: DA_VALUTARE } };

/** Una domanda del question time senza risposta ufficiale, e non nascosta. */
const DOMANDA_SENZA_RISPOSTA = { answer: null, hidden: false };

/**
 * Una recensione che aspetta il Comune.
 *
 * Non «tutte le recensioni con parole»: quelle non finiscono mai, e un
 * contatore che non può andare a zero non dice se c'è lavoro. Aspettano il
 * Comune quelle a cui non ha ancora né risposto né obiettato — che sono
 * esattamente le due uscite che ha (rimuovere può solo la Redazione, R-4).
 */
const VALUTAZIONE_DA_ESAMINARE = {
  rimossaIl: null,
  testo: { not: null },
  segnalataIl: null,
  risposte: { none: {} },
};

/**
 * I CONTATORI, e si chiedono al database con `count`.
 *
 * ⚠️ Mai contando le righe che una pagina mostra: è la trappola 2 dell'ondata 7
 * (`AGENTS.md` §3), pagata su `getNeighborhoodDetail` — un quartiere con
 * quaranta segnalazioni aperte ne dichiarava sei, perché il numero veniva da
 * una `findMany({ take: 6 })` e restava plausibile. Qui il rischio è lo stesso
 * e più visibile: la lista delle valutazioni è troncata a sei per disegno.
 *
 * Li chiede **ogni** pagina dell'area, perché la navigazione porta i contatori
 * delle code su tutte (`NavAdmin`). Sono sette `count`, che su questo impianto
 * costano meno di una delle `findMany` che hanno sostituito.
 */
export async function getContatoriAdmin() {
  const [
    cittadiniRegistrati,
    verifiche,
    commentiSegnalati,
    segnalazioni,
    domande,
    proposte,
    valutazioni,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.profileVerification.count({ where: { status: "PENDING" } }),
    prisma.commentReport.count({ where: { status: "open" } }),
    prisma.report.count({ where: SEGNALAZIONE_APERTA }),
    prisma.communityPost.count({ where: DOMANDA_SENZA_RISPOSTA }),
    prisma.proposal.count({ where: PROPOSTA_DA_VALUTARE }),
    prisma.valutazione.count({ where: VALUTAZIONE_DA_ESAMINARE }),
  ]);

  return {
    cittadiniRegistrati,
    verifiche,
    commentiSegnalati,
    segnalazioni,
    domande,
    proposte,
    valutazioni,
    /*
      «Cittadini» fonde due code — verifiche e moderazione — perché sono lo
      stesso mestiere: tenere sana la comunità (`docs/piano-admin.md` §4). Il
      contatore le somma per la stessa ragione, e la pagina le tiene distinte:
      il badge dice *quanto* lavoro c'è, la pagina *quale*.
    */
    cittadini: verifiche + commentiSegnalati,
  };
}

export type ContatoriAdmin = Awaited<ReturnType<typeof getContatoriAdmin>>;

// ---------------------------------------------------------------------------
// Le code — una LISTA e un DETTAGLIO per ciascuna
// ---------------------------------------------------------------------------

/*
  DUE FUNZIONI PER CODA, E LA SECONDA NON CHIEDE ALLA CODA.

  Le liste filtrano con le costanti qui sopra; i dettagli prendono **per id e
  senza filtro**, e non è una svista da "sistemare".

  Ogni azione che riesce toglie la voce dalla propria coda: si risolve una
  segnalazione, si risponde a una domanda, si approva una proposta, si replica a
  una recensione. Un dettaglio che interrogasse la coda risponderebbe quindi
  **404 subito dopo un'azione riuscita** — cioè esattamente nel momento in cui
  l'operatore ha appena fatto la cosa giusta, e con un errore che somiglia a un
  guasto invece che a un successo. La pagina resta, dice che la voce è uscita
  dalla coda, e offre la strada di ritorno.

  Le liste portano solo ciò che la riga mostra. Il resto — descrizione, testo
  della proposta, valutazione sintetica — sta nel dettaglio, che è uno: prima
  del taglio quei campi viaggiavano moltiplicati per il numero di voci, e la
  `description` delle segnalazioni viaggiava **senza essere mostrata da
  nessuna parte** (vedi `getSegnalazioneDaTriare`).

  ⚠️ E «questa voce è ancora in coda?» **non si ricalcola qui**. La prima
  stesura lo faceva, riscrivendo in JavaScript la stessa condizione delle
  costanti qui sopra (`d.answer === null && !d.hidden` per
  `DOMANDA_SENZA_RISPOSTA`, e quattro termini per `VALUTAZIONE_DA_ESAMINARE`):
  due definizioni dello stesso indicatore, cioè esattamente ciò che questo file
  esiste per evitare. La pagina di dettaglio **carica già la lista** — le serve
  per la colonna di sinistra — quindi la risposta è `coda.some(v => v.id === id)`,
  che viene dall'unico `where` che esiste. Nessuna lista ha un `take`, quindi è
  esatta e non stimata.
*/

/** `/admin/cittadini`, prima metà: chi chiede di essere verificato. */
export async function getVerifichePendenti() {
  return prisma.profileVerification.findMany({
    where: { status: "PENDING" },
    orderBy: { requestedAt: "asc" },
    include: {
      user: { select: { name: true, email: true, accountType: true, avatarColor: true } },
    },
  });
}

/** Le richieste di urgenza da validare (A1 §8) salgono in cima: sono l'unica
 *  cosa in questa coda che ha una scadenza fuori dal Comune. */
const rangoUrgenza = (u: string | null) =>
  u === "richiesta" ? 0 : u === "confermata" ? 1 : 2;

/** `/admin/segnalazioni`: la lista del triage. */
export async function getSegnalazioniAperte() {
  const righe = await prisma.report.findMany({
    where: SEGNALAZIONE_APERTA,
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      urgency: true,
      baseConfirmations: true,
      neighborhood: { select: { name: true } },
      _count: { select: { confirmations: true } },
    },
  });

  return righe
    .map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      status: r.status,
      urgency: r.urgency,
      neighborhoodName: r.neighborhood?.name ?? null,
      confirmations: demoBaseline(r.baseConfirmations) + r._count.confirmations,
    }))
    .sort((a, b) => rangoUrgenza(a.urgency) - rangoUrgenza(b.urgency));
}

/**
 * `/admin/segnalazioni/[id]`: la segnalazione su cui si sta lavorando.
 *
 * ⚠️ **La `description` non era mostrata da nessuna parte.** Fino al 2026-08-07
 * la coda la caricava — quattordici volte, una per voce — e `ReportTriage` non
 * l'aveva nemmeno nel proprio tipo: il Comune sceglieva lo stato, assegnava
 * l'ufficio e scriveva una **nota ufficiale visibile al cittadino** vedendo il
 * solo titolo. Il dettaglio nasce prima di tutto per questo; l'altezza della
 * pagina è la seconda ragione, non la prima.
 *
 * Le foto restano sulla scheda pubblica, a un clic: nel regime dimostrativo
 * sono gradienti dichiarati (`imageSeed`), quindi ridisegnarle qui aggiungerebbe
 * un secondo posto da tenere allineato senza aggiungere informazione.
 */
export async function getSegnalazioneDaTriare(id: string) {
  const r = await prisma.report.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      urgency: true,
      authorName: true,
      anonymous: true,
      location: true,
      assignedDepartment: true,
      baseConfirmations: true,
      createdAt: true,
      neighborhood: { select: { name: true } },
      _count: { select: { confirmations: true, photos: true } },
    },
  });
  if (!r) return null;

  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    status: r.status,
    urgency: r.urgency,
    autore: r.anonymous ? null : r.authorName,
    luogo: r.location,
    assignedDepartment: r.assignedDepartment,
    neighborhoodName: r.neighborhood?.name ?? null,
    confirmations: demoBaseline(r.baseConfirmations) + r._count.confirmations,
    foto: r._count.photos,
    createdAt: r.createdAt,
  };
}

/**
 * Le stesse segnalazioni aperte, ma **solo titolo e id**.
 *
 * Serve all'unione dei duplicati, che vive nel pannello di moderazione su
 * `/admin/cittadini`: quella pagina ha bisogno di sapere *quali* segnalazioni
 * esistono, non di tutto il carico del triage. Senza questa variante il taglio
 * avrebbe riportato l'intera query delle segnalazioni su una pagina che non le
 * mostra — cioè avrebbe rifatto in piccolo il difetto che sta chiudendo.
 */
export async function getSegnalazioniPerUnione() {
  return prisma.report.findMany({
    where: SEGNALAZIONE_APERTA,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });
}

/** `/admin/proposte`: ordinate per sostegno, che è l'ordine in cui si guardano. */
export async function getProposteDaValutare() {
  const righe = await prisma.proposal.findMany({
    where: PROPOSTA_DA_VALUTARE,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      officialReply: true,
      baseSupports: true,
      _count: { select: { supports: true } },
    },
  });

  return righe
    .map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      hasReply: !!p.officialReply,
      supports: demoBaseline(p.baseSupports) + p._count.supports,
    }))
    .sort((a, b) => b.supports - a.supports);
}

/** `/admin/proposte/[id]`: la proposta da giudicare, col testo che l'ha scritta. */
export async function getPropostaDaValutare(id: string) {
  const p = await prisma.proposal.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      problem: true,
      status: true,
      officialReply: true,
      authorName: true,
      baseSupports: true,
      createdAt: true,
      neighborhood: { select: { name: true } },
      _count: { select: { supports: true } },
      // Valutazione sintetica corrente (A1 §15): precompila il form di review.
      estimatedImpact: true,
      estimatedCost: true,
      estimatedTime: true,
      feasibility: true,
    },
  });
  if (!p) return null;

  return {
    id: p.id,
    title: p.title,
    descrizione: p.description,
    problema: p.problem,
    status: p.status,
    hasReply: !!p.officialReply,
    rispostaCorrente: p.officialReply,
    autore: p.authorName,
    quartiere: p.neighborhood?.name ?? null,
    supports: demoBaseline(p.baseSupports) + p._count.supports,
    estimatedImpact: p.estimatedImpact,
    estimatedCost: p.estimatedCost,
    estimatedTime: p.estimatedTime,
    feasibility: p.feasibility,
    createdAt: p.createdAt,
  };
}

/** `/admin/domande`: le domande dei cittadini che aspettano una risposta. */
export async function getDomandeSenzaRisposta() {
  const righe = await prisma.communityPost.findMany({
    where: DOMANDA_SENZA_RISPOSTA,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      authorName: true,
      authorColor: true,
      content: true,
      createdAt: true,
      neighborhood: { select: { name: true } },
    },
  });
  return righe.map((d) => ({
    id: d.id,
    authorName: d.authorName,
    authorColor: d.authorColor,
    content: d.content,
    createdAt: d.createdAt,
    quartiere: d.neighborhood?.name ?? null,
  }));
}

/** `/admin/domande/[id]`: la domanda a cui si sta rispondendo. */
export async function getDomandaSenzaRisposta(id: string) {
  const d = await prisma.communityPost.findUnique({
    where: { id },
    select: {
      id: true,
      authorName: true,
      authorColor: true,
      content: true,
      createdAt: true,
      hidden: true,
      neighborhood: { select: { name: true } },
      answer: { select: { body: true, department: true, createdAt: true } },
    },
  });
  if (!d) return null;

  return {
    id: d.id,
    authorName: d.authorName,
    authorColor: d.authorColor,
    content: d.content,
    createdAt: d.createdAt,
    quartiere: d.neighborhood?.name ?? null,
    risposta: d.answer,
  };
}

/** `/admin/valutazioni`: le recensioni che aspettano il Comune — **tutte**.
 *
 *  ⚠️ Fino al 2026-08-07 questa pagina chiamava `getRecensioniRecenti()`, che
 *  tronca a sei: il contatore diceva **32** e la lista ne mostrava 6, e le altre
 *  26 non erano raggiungibili da nessuna parte. Qui la domanda è la stessa del
 *  contatore (`VALUTAZIONE_DA_ESAMINARE`), quindi i due numeri non possono
 *  divergere — che è la regola scritta in testa a questo file. */
export async function getValutazioniDaEsaminare() {
  const righe = await prisma.valutazione.findMany({
    where: VALUTAZIONE_DA_ESAMINARE,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      servizioId: true,
      stelle: true,
      testo: true,
      rimossaIl: true,
      nomeVisualizzato: true,
      mostraNomeIntero: true,
      createdAt: true,
    },
  });
  return righe.map((r) => ({
    id: r.id,
    servizio: SERVIZI.find((s) => s.id === r.servizioId)?.nome ?? r.servizioId,
    servizioId: r.servizioId,
    stelle: r.stelle,
    testo: testoVisibile(r),
    autore: nomePubblico(r.nomeVisualizzato, r.mostraNomeIntero),
    quando: r.createdAt,
  }));
}

/** `/admin/valutazioni/[id]`: la recensione a cui si sta rispondendo. */
export async function getValutazioneDaEsaminare(id: string) {
  const r = await prisma.valutazione.findUnique({
    where: { id },
    select: {
      id: true,
      servizioId: true,
      stelle: true,
      testo: true,
      rimossaIl: true,
      nomeVisualizzato: true,
      mostraNomeIntero: true,
      createdAt: true,
      segnalataIl: true,
      risposte: { select: { id: true }, take: 1 },
    },
  });
  if (!r) return null;

  const segnalata = r.segnalataIl != null;
  const haRisposta = r.risposte.length > 0;
  return {
    id: r.id,
    servizio: SERVIZI.find((s) => s.id === r.servizioId)?.nome ?? r.servizioId,
    servizioId: r.servizioId,
    stelle: r.stelle,
    testo: testoVisibile(r),
    autore: nomePubblico(r.nomeVisualizzato, r.mostraNomeIntero),
    quando: r.createdAt,
    segnalata,
    haRisposta,
    rimossa: r.rimossaIl != null,
  };
}

// ---------------------------------------------------------------------------
// Gli strumenti e le letture
// ---------------------------------------------------------------------------

/** `/admin/pubblica`: le opere fra cui scegliere quella da aggiornare. */
export async function getOperePerAvanzamento() {
  return prisma.opera.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, progress: true, status: true },
  });
}

/**
 * Il registro delle azioni: una **lettura**, e sta sul cruscotto.
 *
 * Il `take` qui è corretto e non contraddice la regola dei contatori: nessuno
 * conta queste righe: dicono *cosa è successo di recente*, non *quanto*.
 */
export async function getRegistroAzioni(quante = 8) {
  return prisma.moderationAction.findMany({
    orderBy: { createdAt: "desc" },
    take: quante,
    include: { actor: { select: { name: true } } },
  });
}

/**
 * Le analitiche operative del cruscotto (Ondata 8).
 *
 * ⚠️ **Una `findMany` senza `take`, ed è voluto.** Sembra la trappola dei
 * contatori — «mai contando le righe che una pagina mostra» — e non lo è: qui
 * la pagina mostra **cinque uffici**, mentre questa query legge **tutte** le
 * segnalazioni. È l'aggregazione a ridurre, non il database. Un `take` a monte
 * darebbe mediane calcolate su un pezzo di città e plausibili lo stesso, che è
 * il modo peggiore di sbagliare (`AGENTS.md` §3, ondata 7, 2).
 *
 * `groupBy` non basta: i conteggi sì, ma la **mediana** dei tempi di chiusura
 * vuole le durate una per una. Cinque colonne scalari su una tabella di questa
 * scala costano meno di due giri.
 */
export async function getAnaliticheOperative() {
  const righe = await prisma.report.findMany({
    select: {
      status: true,
      category: true,
      assignedDepartment: true,
      createdAt: true,
      resolvedAt: true,
    },
  });
  return analiticheOperative(righe);
}

/** Community moderation surface (§14): flagged comments, blocked words, sanctioned users. */
export async function getModerationData() {
  const [flaggedRaw, blockedWords, sanctioned] = await Promise.all([
    prisma.commentReport.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      include: {
        comment: {
          select: {
            id: true,
            postId: true,
            authorId: true,
            authorName: true,
            body: true,
            hidden: true,
          },
        },
      },
    }),
    prisma.blockedWord.findMany({ orderBy: { word: "asc" } }),
    prisma.user.findMany({
      where: { OR: [{ banned: true }, { suspendedUntil: { gt: new Date() } }] },
      select: { id: true, name: true, banned: true, suspendedUntil: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const byComment = new Map<
    string,
    {
      commentId: string;
      postId: string;
      authorId: string | null;
      authorName: string;
      body: string;
      hidden: boolean;
      count: number;
      reasons: string[];
    }
  >();
  for (const f of flaggedRaw) {
    if (!f.comment) continue;
    const e = byComment.get(f.commentId) ?? {
      commentId: f.comment.id,
      postId: f.comment.postId,
      authorId: f.comment.authorId,
      authorName: f.comment.authorName,
      body: f.comment.body,
      hidden: f.comment.hidden,
      count: 0,
      reasons: [],
    };
    e.count += 1;
    if (f.reason) e.reasons.push(f.reason);
    byComment.set(f.commentId, e);
  }

  return {
    flaggedComments: [...byComment.values()],
    blockedWords,
    sanctioned,
  };
}

export type ModerationData = Awaited<ReturnType<typeof getModerationData>>;
