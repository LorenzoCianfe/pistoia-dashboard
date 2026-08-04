"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRedazione } from "@/lib/auth/redazione";
import { limitWrite } from "@/lib/limits";
import { servizio as trovaServizio } from "@/lib/valutazioni";
import {
  MOTIVO_MAX,
  NOTA_TESTO_MAX,
  TIPO_NOTA_REDAZIONE,
  notaPubblicabile,
} from "@/lib/redazione";

/*
  Il lato della REDAZIONE su R-4: esamina le segnalazioni del Comune, rimuove
  (lasciando la riga nel registro pubblico), oppure lascia pubblicato; e
  scrive le Note della Redazione, con fonte obbligatoria.

  Il gate è `requireRedazione`, NON `requireModerator`: quella lascerebbe
  passare `ADMIN`, che è il super-account del Comune — e il piano (§2.6) non
  lascia cancellare al Comune ciò che lo riguarda. È il cancello della fase.

  In pubblico ogni atto di questa pagina firma come l'entità collettiva
  (`FIRMA_REDAZIONE`), mai con un nome proprio: l'`actorId` resta solo nel
  log di audit interno (`ModerationAction`, append-only — SECURITY.md §5).
*/

export type RedazioneState = { ok?: boolean; error?: string } | undefined;

const rimuoviSchema = z.object({
  valutazioneId: z.string().min(1),
  motivo: z
    .string()
    .trim()
    .min(1, "Il motivo è obbligatorio: finisce nel registro pubblico.")
    .max(MOTIVO_MAX, `Il motivo è troppo lungo: massimo ${MOTIVO_MAX} caratteri.`),
});

/**
 * La rimozione redazionale: AZZERA il testo e lascia la riga (piano §5.2) —
 * il motivo più frequente sono i dati di un terzo, che vanno tolti davvero.
 * È l'opposto della revoca del votante, che cancella riga, email e token.
 */
export async function rimuoviValutazioneAction(
  _prev: RedazioneState,
  formData: FormData,
): Promise<RedazioneState> {
  const user = await requireRedazione();
  const parsed = rimuoviSchema.safeParse({
    valutazioneId: formData.get("valutazioneId"),
    motivo: formData.get("motivo"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const lw = await limitWrite(user.id, "moderazione");
  if (!lw.ok) return { error: lw.error };

  const v = await prisma.valutazione.findUnique({
    where: { id: parsed.data.valutazioneId },
    select: { id: true, servizioId: true, rimossaIl: true },
  });
  if (!v) return { error: "Valutazione non trovata." };
  if (v.rimossaIl) return { error: "Già rimossa." };

  await prisma.$transaction([
    prisma.valutazione.update({
      where: { id: v.id },
      data: {
        testo: null,
        rimossaIl: new Date(),
        rimossaMotivo: parsed.data.motivo,
      },
    }),
    prisma.moderationAction.create({
      data: {
        actorId: user.id,
        action: "valutazione_rimossa",
        targetType: "valutazione",
        targetId: v.id,
        reason: parsed.data.motivo,
      },
    }),
  ]);

  revalidatePath(`/valutazioni/${v.servizioId}`);
  revalidatePath("/valutazioni");
  revalidatePath("/redazione");
  return { ok: true };
}

/**
 * «Lascia pubblicata»: la segnalazione del Comune si chiude senza rimozione.
 * La valutazione torna com'era (nessun segno pubblico esisteva né resta);
 * la traccia dell'esame vive nel log di audit, col motivo originale.
 */
export async function lasciaValutazioneAction(
  _prev: RedazioneState,
  formData: FormData,
): Promise<RedazioneState> {
  const user = await requireRedazione();
  const valutazioneId = String(formData.get("valutazioneId") ?? "");
  if (!valutazioneId) return { error: "Dati non validi." };

  const lw = await limitWrite(user.id, "moderazione");
  if (!lw.ok) return { error: lw.error };

  const v = await prisma.valutazione.findUnique({
    where: { id: valutazioneId },
    select: { id: true, servizioId: true, segnalataIl: true, segnalataMotivo: true },
  });
  if (!v || !v.segnalataIl) return { error: "Segnalazione non trovata." };

  await prisma.$transaction([
    prisma.valutazione.update({
      where: { id: v.id },
      data: { segnalataIl: null, segnalataMotivo: null },
    }),
    prisma.moderationAction.create({
      data: {
        actorId: user.id,
        action: "valutazione_lasciata",
        targetType: "valutazione",
        targetId: v.id,
        reason: v.segnalataMotivo,
      },
    }),
  ]);

  revalidatePath(`/valutazioni/${v.servizioId}`);
  revalidatePath("/redazione");
  return { ok: true };
}

const notaSchema = z.object({
  servizioId: z.string().min(1),
  testo: z
    .string()
    .trim()
    .min(1, "Il testo della nota è vuoto.")
    .max(NOTA_TESTO_MAX, `La nota è troppo lunga: massimo ${NOTA_TESTO_MAX} caratteri.`),
  urlFonte: z
    .string()
    .trim()
    .pipe(z.url("L'URL della fonte non è valido — ed è obbligatorio: senza, la nota non va a schermo.")),
  dataConsultazione: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La data di consultazione è obbligatoria (AAAA-MM-GG)."),
});

/**
 * La Nota della Redazione AGGIUNGE UN DATO, non risponde (piano §1.1.2): non
 * occupa mai lo slot della risposta, e senza `urlFonte` + `dataConsultazione`
 * non esiste — qui il rifiuto sta anche alla scrittura, non solo alla resa.
 */
export async function notaRedazioneAction(
  _prev: RedazioneState,
  formData: FormData,
): Promise<RedazioneState> {
  const user = await requireRedazione();
  const parsed = notaSchema.safeParse({
    servizioId: formData.get("servizioId"),
    testo: formData.get("testo"),
    urlFonte: formData.get("urlFonte"),
    dataConsultazione: formData.get("dataConsultazione"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }
  const s = trovaServizio(parsed.data.servizioId);
  if (!s) return { error: "Servizio sconosciuto." };

  const lw = await limitWrite(user.id, "moderazione");
  if (!lw.ok) return { error: lw.error };

  const nota = {
    tipo: TIPO_NOTA_REDAZIONE,
    servizioId: s.id,
    testo: parsed.data.testo,
    urlFonte: parsed.data.urlFonte,
    dataConsultazione: parsed.data.dataConsultazione,
  };
  // Cintura oltre le bretelle di zod: la stessa regola che il renderer applica.
  if (!notaPubblicabile(nota)) {
    return { error: "Una nota senza fonte non va a schermo." };
  }

  await prisma.$transaction([
    prisma.rispostaServizio.create({
      data: { ...nota, autoreId: user.id },
    }),
    prisma.moderationAction.create({
      data: {
        actorId: user.id,
        action: "nota_redazione",
        targetType: "servizio",
        targetId: s.id,
      },
    }),
  ]);

  revalidatePath(`/valutazioni/${s.id}`);
  revalidatePath("/redazione");
  return { ok: true };
}
