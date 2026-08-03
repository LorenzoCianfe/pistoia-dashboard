"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/auth/rate-limit";
import { findBlockedWord } from "@/lib/moderation";
import { emailConfigurata, sendEmail } from "@/lib/email";
import {
  limiteConservazioneIp,
  periodoDi,
  puoVotare,
  stelleValide,
  servizio as trovaServizio,
  type Servizio,
} from "@/lib/valutazioni";

/*
  Il voto — l'unica write action della piattaforma aperta a chi NON ha un
  account (decisione del 2026-08-03: nessun account richiesto, email sempre
  obbligatoria). Ne discendono tre differenze rispetto alle azioni sorelle:

  1. Niente `requireUser()`: `getCurrentUser()` serve solo ad attribuire il
     voto a un account quando c'è.
  2. Il rate limit non può usare l'utente: usa IP ed email, entrambi
     dichiaratamente aggirabili (vedi la nota su `clientMeta`) — sono un
     argine contro lo spam pigro, non un'autenticazione. La difesa vera è a
     valle: la conferma via email, la revoca a un tocco, la moderazione.
  3. Il voto entra SUBITO nel conteggio. La mail non è un cancello: serve a
     revocare e a bloccare gli abusi a posteriori, e rende autolesionista
     digitare l'indirizzo di un altro.
*/

export type VotoState = { ok?: boolean; error?: string } | undefined;

const HOUR = 60 * 60 * 1000;
// Un ufficio o una famiglia condividono l'IP: generoso per l'uso vero,
// stretto per un ciclo di spam.
const VOTI_PER_IP_ORA = 12;
const VOTI_PER_EMAIL_ORA = 6;
const TESTO_MAX = 800;

const votoSchema = z.object({
  servizioId: z.string().min(1),
  stelle: z.coerce
    .number()
    .refine(stelleValide, "Scegli da 1 a 5 stelle."),
  testo: z
    .string()
    .trim()
    .max(TESTO_MAX, "Il racconto è troppo lungo: massimo 800 caratteri.")
    .optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Inserisci un indirizzo email valido.")),
  nomeVisualizzato: z
    .string()
    .trim()
    .max(80, "Il nome è troppo lungo.")
    .optional(),
  quartiereId: z.string().optional(),
  qrCodice: z.string().optional(),
});

/**
 * IP e user agent della richiesta. Stessa lettura — e stessa riserva — di
 * `clientMeta` in `actions/auth.ts` (file protetto, quindi copiata e non
 * importata: esportare un helper da un file `"use server"` lo trasformerebbe
 * in un endpoint invocabile): x-forwarded-for è controllabile dal client
 * finché l'app non sta dietro un proxy fidato, perciò tutto ciò che vi si
 * appoggia è best-effort dichiarato.
 */
async function clientMeta() {
  const h = await headers();
  const ip = (
    h.get("x-forwarded-for")?.split(",")[0] ??
    h.get("x-real-ip") ??
    "local"
  ).trim();
  return { ip, userAgent: h.get("user-agent") };
}

/** L'origine assoluta per i link nella mail (host del proxy se c'è). */
async function baseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

function testoMail(
  s: Servizio,
  stelle: number,
  urlConferma: string,
  base: string,
) {
  const stelleTxt = stelle === 1 ? "1 stella" : `${stelle} stelle`;
  return [
    `Da questo indirizzo sono state lasciate ${stelleTxt} su «${s.nome}»`,
    `(Valutazioni dei servizi — Dashboard di Pistoia).`,
    ``,
    `Il voto è già nel conteggio: non devi fare nulla perché resti.`,
    ``,
    `Da qui puoi confermare che sei tu — le valutazioni confermate sono`,
    `dichiarate a parte nella composizione del campione — oppure rimuoverlo`,
    `subito, se non lo riconosci:`,
    ``,
    urlConferma,
    ``,
    `L'indirizzo email resta associato alla valutazione finché è pubblicata,`,
    `poi viene cancellato con lei, e non è usato per nient'altro.`,
    `L'informativa completa: ${base}/privacy`,
  ].join("\n");
}

export async function votaAction(
  _prev: VotoState,
  formData: FormData,
): Promise<VotoState> {
  const parsed = votoSchema.safeParse({
    servizioId: formData.get("servizioId"),
    stelle: formData.get("stelle"),
    testo: formData.get("testo") || undefined,
    email: formData.get("email"),
    nomeVisualizzato: formData.get("nomeVisualizzato") || undefined,
    quartiereId: formData.get("quartiereId") || undefined,
    qrCodice: formData.get("qrCodice") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }
  const { stelle, testo, email, nomeVisualizzato, quartiereId } = parsed.data;

  // Dal QR il codice è la fonte di verità per servizio e luogo: i campi del
  // form non si fidano di sé stessi.
  let s: Servizio | null;
  let canale = "web";
  let qrLuogo: string | null = null;
  if (parsed.data.qrCodice) {
    const codice = await prisma.codiceQr.findUnique({
      where: { codice: parsed.data.qrCodice },
    });
    if (!codice || !codice.attivo) {
      return { error: "Questo codice non è più attivo." };
    }
    s = trovaServizio(codice.servizioId);
    canale = "qr";
    qrLuogo = codice.luogo;
  } else {
    s = trovaServizio(parsed.data.servizioId);
  }
  if (!s) return { error: "Servizio sconosciuto." };

  // Prima di scrivere: se l'invio non può riuscire, meglio nessun voto che un
  // voto senza la mail che lo rende revocabile.
  if (!emailConfigurata()) {
    return {
      error:
        "L'invio delle email di conferma non è ancora configurato: il voto non è stato registrato.",
    };
  }

  const { ip, userAgent } = await clientMeta();
  const perIp = await rateLimit(`valutazione:ip:${ip}`, VOTI_PER_IP_ORA, HOUR);
  const perEmail = perIp.ok
    ? await rateLimit(`valutazione:email:${email}`, VOTI_PER_EMAIL_ORA, HOUR)
    : perIp;
  if (!perIp.ok || !perEmail.ok) {
    return {
      error:
        "Sono arrivate troppe valutazioni in poco tempo da questa postazione. Riprova più tardi.",
    };
  }

  const daControllare = [testo, nomeVisualizzato].filter(Boolean).join(" ");
  if (daControllare && (await findBlockedWord(daControllare))) {
    return {
      error:
        "Il testo contiene un termine non consentito dalle regole della community.",
    };
  }

  const adesso = new Date();
  const periodo = periodoDi(adesso);

  // La regola mensile delle condizioni (gli sportelli sono a episodio e
  // `puoVotare` li lascia sempre passare senza bisogno di leggere niente).
  if (s.famiglia === "condizione") {
    const precedenti = await prisma.valutazione.findMany({
      where: { servizioId: s.id, periodo, email, rimossaIl: null },
      select: { servizioId: true, periodo: true, email: true },
    });
    if (!puoVotare(s, email, periodo, precedenti)) {
      return {
        error: `Con questo indirizzo hai già valutato «${s.nome}» questo mese. Il voto vale un mese: il prossimo potrai rinnovarlo.`,
      };
    }
  }

  if (quartiereId) {
    const q = await prisma.neighborhood.findUnique({
      where: { id: quartiereId },
      select: { id: true },
    });
    if (!q) return { error: "Quartiere non riconosciuto." };
  }

  const user = await getCurrentUser();
  const confermaToken = crypto.randomBytes(24).toString("base64url");

  await prisma.valutazione.create({
    data: {
      servizioId: s.id,
      stelle,
      testo: testo || null,
      email,
      emailConfermata: false,
      confermaToken,
      nomeVisualizzato: nomeVisualizzato || null,
      mostraNomeIntero: formData.get("mostraNomeIntero") === "on",
      userId: user?.id ?? null,
      quartiereId: quartiereId || null,
      periodo,
      canale,
      qrLuogo,
      ip,
      userAgent,
    },
  });

  // La conservazione dell'IP si applica da sola, agganciata all'evento che
  // produce il dato: una demo locale non ha un cron, e una regola dichiarata
  // su /privacy ma mai eseguita sarebbe peggio di nessuna regola.
  await prisma.valutazione.updateMany({
    where: { ip: { not: null }, createdAt: { lt: limiteConservazioneIp(adesso) } },
    data: { ip: null },
  });

  const base = await baseUrl();
  await sendEmail({
    to: email,
    subject: `La tua valutazione: ${s.nome}`,
    text: testoMail(s, stelle, `${base}/v/conferma/${confermaToken}`, base),
  });

  revalidatePath("/valutazioni");
  revalidatePath(`/valutazioni/${s.id}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Conferma e revoca — i due esiti del link nella mail
// ---------------------------------------------------------------------------

/*
  Entrambe sono azioni legate a un form della pagina di atterraggio, MAI
  effetti di un GET: i filtri antispam aprono i link delle mail per
  ispezionarli, e un link che revoca al passaggio cancellerebbe voti legittimi
  in silenzio. Il link della mail porta a una pagina; a decidere è un tocco.
*/

export async function confermaValutazioneAction(token: string): Promise<void> {
  const v = await prisma.valutazione.findUnique({
    where: { confermaToken: token },
    select: { id: true, emailConfermata: true, servizioId: true },
  });
  if (v && !v.emailConfermata) {
    await prisma.valutazione.update({
      where: { id: v.id },
      data: { emailConfermata: true },
    });
    revalidatePath("/valutazioni");
    revalidatePath(`/valutazioni/${v.servizioId}`);
  }
  redirect(`/v/conferma/${token}`);
}

/**
 * «Non sono stato io, rimuovi» — la riga sparisce DAVVERO, email compresa.
 *
 * Non è la rimozione redazionale (che azzera il testo e lascia la riga nel
 * registro pubblico): quella documenta un atto di moderazione su un contenuto
 * altrui. Qui è il titolare dell'indirizzo che disconosce il voto, e tenere
 * qualunque traccia — email in testa — significherebbe conservare dati di una
 * persona che ha appena detto «non sono stato io».
 */
export async function revocaValutazioneAction(token: string): Promise<void> {
  const v = await prisma.valutazione.findUnique({
    where: { confermaToken: token },
    select: { id: true, servizioId: true },
  });
  if (!v) redirect(`/v/conferma/${token}`);
  await prisma.valutazione.delete({ where: { id: v.id } });
  revalidatePath("/valutazioni");
  revalidatePath(`/valutazioni/${v.servizioId}`);
  redirect(`/v/conferma/${token}?esito=rimossa`);
}
