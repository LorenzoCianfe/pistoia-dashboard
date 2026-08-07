import "server-only";
import { prisma } from "@/lib/db";
import { demoBaseline } from "@/lib/demo";

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

/** Aperta = non ancora chiusa in nessuno dei quattro modi in cui si chiude. */
const SEGNALAZIONE_APERTA = {
  status: { notIn: ["risolta", "chiusa", "non_di_competenza", "duplicata"] },
};

/** Le proposte che il Comune ha davanti: pubblicate, in valutazione, risposte. */
const PROPOSTA_DA_VALUTARE = {
  status: { in: ["pubblicata", "in_valutazione", "risposta"] },
};

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
// Le code
// ---------------------------------------------------------------------------

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

/**
 * `/admin/segnalazioni`: il triage.
 *
 * Le richieste di urgenza da validare (A1 §8) salgono in cima: sono l'unica
 * cosa in questa coda che ha una scadenza fuori dal Comune.
 */
export async function getSegnalazioniAperte() {
  const righe = await prisma.report.findMany({
    where: SEGNALAZIONE_APERTA,
    orderBy: [{ createdAt: "desc" }],
    include: {
      neighborhood: { select: { name: true } },
      _count: { select: { confirmations: true } },
    },
  });

  const rangoUrgenza = (u: string | null) =>
    u === "richiesta" ? 0 : u === "confermata" ? 1 : 2;

  return righe
    .map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      status: r.status,
      urgency: r.urgency,
      neighborhoodName: r.neighborhood?.name ?? null,
      assignedDepartment: r.assignedDepartment,
      confirmations: demoBaseline(r.baseConfirmations) + r._count.confirmations,
      createdAt: r.createdAt,
    }))
    .sort((a, b) => rangoUrgenza(a.urgency) - rangoUrgenza(b.urgency));
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
    include: { _count: { select: { supports: true } } },
  });

  return righe
    .map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      hasReply: !!p.officialReply,
      supports: demoBaseline(p.baseSupports) + p._count.supports,
      // Valutazione sintetica corrente (A1 §15): precompila il form di review.
      estimatedImpact: p.estimatedImpact,
      estimatedCost: p.estimatedCost,
      estimatedTime: p.estimatedTime,
      feasibility: p.feasibility,
      createdAt: p.createdAt,
    }))
    .sort((a, b) => b.supports - a.supports);
}

/** `/admin/domande`: le domande dei cittadini che aspettano una risposta. */
export async function getDomandeSenzaRisposta() {
  return prisma.communityPost.findMany({
    where: DOMANDA_SENZA_RISPOSTA,
    orderBy: { createdAt: "desc" },
    include: { neighborhood: { select: { name: true } } },
  });
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
