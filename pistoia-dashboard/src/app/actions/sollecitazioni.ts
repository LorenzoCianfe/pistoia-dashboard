"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/auth/rate-limit";
import { notify } from "@/lib/notify";
import { periodoDi, servizio as trovaServizio } from "@/lib/valutazioni";
import {
  CANALI_SOLLECITAZIONE,
  ESITI_SOLLECITAZIONE,
  puoMostrarePopup,
  type CanaleSollecitazione,
  type EsitoSollecitazione,
} from "@/lib/sollecitazioni";
import {
  getCampagnaPersona,
  getStatoSollecitazioni,
} from "@/lib/data/sollecitazioni";
import { inviaPromemorieScadute } from "@/lib/promemoria";
import { etichettaPeriodo } from "@/lib/redazione";
import { idValido, tokenValido } from "@/lib/token";
import { env } from "@/lib/env";

/*
  Le azioni del contatore unico (R-5). Tre discipline, tutte già pagate
  altrove nel progetto:

  1. **Mai una scrittura dentro un GET.** La mostra di una sollecitazione si
     registra da un'azione invocata dal client al montaggio (o dentro
     l'azione che produce l'invito, come per la segnalazione risolta) — la
     stessa ragione per cui i link delle mail portano a form.
  2. **Il client non decide niente**: ogni azione riverifica pubblico e
     finestra sul server prima di scrivere. Il beacon è un suggerimento,
     non un ordine.
  3. L'invio dei promemoria è opportunistico (vedi `lib/promemoria.ts`):
     si aggancia qui perché queste azioni sono il battito del contatore.
*/

/** L'origine assoluta per i link nelle mail. Stessa lettura — e stessa
 *  riserva — di `baseUrl` in `actions/valutazioni.ts`: copiata e non
 *  importata, perché esportare un helper da un file `"use server"` lo
 *  trasformerebbe in un endpoint invocabile. `APP_ORIGIN` per prima e gli
 *  header solo come ripiego: il perché sta in `lib/env.ts`. */
async function baseUrl() {
  if (env.APP_ORIGIN) return env.APP_ORIGIN.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

// ---------------------------------------------------------------------------
// La campagna mensile (B): il beacon della card in home
// ---------------------------------------------------------------------------

/**
 * Registra la mostra della campagna del mese e ne genera la notifica —
 * UNA sollecitazione con due facce (card + campanello), una riga sola.
 */
export async function registraCampagnaAction(): Promise<void> {
  const user = await requireUser();
  const oggi = new Date();

  // Riverifica: il beacon arriva dal client, che può essere vecchio di ore.
  const campagna = await getCampagnaPersona(
    { id: user.id, email: user.email },
    oggi,
  );
  if (campagna.daRegistrare) {
    await prisma.sollecitazione.create({
      data: { userId: user.id, canale: "campagna" },
    });
    await notify(user.id, {
      type: "valutazioni",
      title: `Il voto di ${etichettaPeriodo(periodoDi(oggi))} si è aperto`,
      body: "Le condizioni della città si valutano ogni mese: il tuo voto del mese scorso è scaduto. Rinnovalo quando vuoi.",
      href: "/valutazioni",
    });
  }

  await inviaPromemorieScadute(oggi, await baseUrl());
}

// ---------------------------------------------------------------------------
// Il pop-up (D): chiede il permesso al contatore, mai al client
// ---------------------------------------------------------------------------

export type RispostaPopup =
  | { mostra: false }
  | { mostra: true; rinnovo: string[] | null };

/**
 * Il pop-up si arma solo dopo un voto espresso (decisione D1): il client
 * segnala il completamento, il server decide. Se la persona ha un rinnovo in
 * sospeso il pop-up ne veste il messaggio (composizione di Lorenzo,
 * 2026-08-04) — ma la riga resta `popup`: le regole di silenzio seguono la
 * superficie, non il vestito.
 */
export async function chiediPopupAction(): Promise<RispostaPopup> {
  const user = await requireUser();
  const oggi = new Date();
  const persona = { id: user.id, email: user.email };

  const stato = await getStatoSollecitazioni(persona);
  if (!puoMostrarePopup(oggi, stato)) return { mostra: false };

  const campagna = await getCampagnaPersona(persona, oggi);

  await prisma.sollecitazione.create({
    data: { userId: user.id, canale: "popup" },
  });
  await inviaPromemorieScadute(oggi, await baseUrl());

  return {
    mostra: true,
    rinnovo: campagna.serviziRinnovabili.length > 0 ? campagna.serviziRinnovabili : null,
  };
}

// ---------------------------------------------------------------------------
// Gli esiti
// ---------------------------------------------------------------------------

/**
 * Segna l'esito dell'ultima sollecitazione aperta di quel canale.
 * «chiusa» sul pop-up è la X, e vale il silenzio lungo; «rimandata» è un
 * «non ora»; «seguita» è il clic sull'invito. Righe mai cancellate.
 */
export async function segnaEsitoSollecitazioneAction(
  canale: CanaleSollecitazione,
  esito: EsitoSollecitazione,
): Promise<void> {
  const user = await requireUser();
  if (
    !CANALI_SOLLECITAZIONE.includes(canale) ||
    !ESITI_SOLLECITAZIONE.includes(esito)
  ) {
    return;
  }
  const riga = await prisma.sollecitazione.findFirst({
    where: { userId: user.id, canale, esito: null },
    orderBy: { mostrataIl: "desc" },
    select: { id: true },
  });
  if (!riga) return;
  await prisma.sollecitazione.update({
    where: { id: riga.id },
    data: { esito, esitoIl: new Date() },
  });
}

// ---------------------------------------------------------------------------
// Il promemoria per email (B3): chiesto, mai imposto
// ---------------------------------------------------------------------------

export type PromemoriaState = { ok?: boolean; error?: string } | undefined;

/**
 * Attiva il promemoria mensile per l'email di una valutazione appena
 * lasciata. L'aggancio alla valutazione — e non a un'email libera — è ciò
 * che impedisce di iscrivere l'indirizzo di un altro: il modulo l'ha già
 * verificata quanto basta, e la mail di conferma con revoca è già partita.
 */
export async function chiediPromemoriaAction(
  valutazioneId: string,
): Promise<PromemoriaState> {
  // L'azione è invocabile senza sessione: l'argomento si guarda PRIMA di
  // portarlo a Prisma (`lib/token.ts` dice perché).
  if (!idValido(valutazioneId)) return { error: "Valutazione non trovata." };

  const h = await headers();
  const ip = (
    h.get("x-forwarded-for")?.split(",")[0] ??
    h.get("x-real-ip") ??
    "local"
  ).trim();
  const rl = await rateLimit(`promemoria:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.ok) return { error: "Troppe richieste in poco tempo. Riprova più tardi." };

  const v = await prisma.valutazione.findUnique({
    where: { id: valutazioneId },
    select: { email: true, servizioId: true, rimossaIl: true, createdAt: true },
  });
  if (!v || v.rimossaIl != null) return { error: "Valutazione non trovata." };
  // Solo dal voto appena lasciato: un id raccolto altrove non deve bastare.
  if (Date.now() - v.createdAt.getTime() > 60 * 60 * 1000) {
    return { error: "Questo voto non è più appena fatto: rivota il mese prossimo." };
  }
  const s = trovaServizio(v.servizioId);
  if (!s || s.famiglia !== "condizione") {
    return { error: "Il promemoria vale solo per le condizioni della città." };
  }

  await prisma.promemoriaRinnovo.upsert({
    where: { email: v.email },
    create: {
      email: v.email,
      token: crypto.randomBytes(18).toString("base64url"),
    },
    update: {},
  });
  return { ok: true };
}

/**
 * «Non inviarmelo più» — azione del form sulla pagina del token, mai un
 * effetto del GET. La riga sparisce per intero: chi si disiscrive non resta
 * in nessun archivio.
 */
export async function rimuoviPromemoriaAction(token: string): Promise<void> {
  /*
    ⚠️ Questa riga di guardia vale l'intera tabella. `deleteMany` con un
    `where` il cui unico campo è `undefined` non cancella zero righe: cancella
    TUTTO, perché Prisma lascia cadere i campi indefiniti e resta un filtro
    vuoto (misurato, `lib/token.ts`). L'azione non ha sessione, e una Server
    Action è un endpoint pubblico: senza questo controllo bastava invocarla
    senza argomenti per disiscrivere ogni persona in archivio, in silenzio.
  */
  if (!tokenValido(token)) redirect("/valutazioni");
  await prisma.promemoriaRinnovo.deleteMany({ where: { token } });
  redirect(`/v/promemoria/${token}?esito=rimosso`);
}
