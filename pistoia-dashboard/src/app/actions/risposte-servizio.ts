"use server";

import { revalidatePath } from "next/cache";
import { rivalidaAreaComune } from "@/lib/rivalida-admin";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/dal";
import { limitWrite } from "@/lib/limits";
import { periodoDi, servizio as trovaServizio } from "@/lib/valutazioni";
import {
  MOTIVO_MAX,
  RISPOSTA_TESTO_MAX,
  TIPO_QUADRO,
  TIPO_SINGOLA,
  timbroCarica,
} from "@/lib/redazione";

/*
  Il lato del COMUNE su R-4: risponde (al quadro e alla singola) e segnala.
  Rimuovere NON si può da qui — rimuove la Redazione (`actions/redazione.ts`),
  e il cancello della fase è il test che lo prova.

  L'attribuzione segue l'account che scrive (piano §1, decisione 9): se
  l'email dell'account è di un componente della giunta, la risposta porta il
  TIMBRO della carica scattato ADESSO (`caricaAlMomento`) e mai ricalcolato;
  altrimenti a firmare è l'account così come si presenta in pubblico
  (`publicName` — per l'account generico, «Comune di Pistoia»).
*/

export type RispostaState = { ok?: boolean; error?: string } | undefined;

const quadroSchema = z.object({
  servizioId: z.string().min(1),
  testo: z
    .string()
    .trim()
    .min(1, "La risposta è vuota.")
    .max(RISPOSTA_TESTO_MAX, `La risposta è troppo lunga: massimo ${RISPOSTA_TESTO_MAX} caratteri.`),
});

export async function rispondiQuadroAction(
  _prev: RispostaState,
  formData: FormData,
): Promise<RispostaState> {
  const user = await requireStaff();
  const parsed = quadroSchema.safeParse({
    servizioId: formData.get("servizioId"),
    testo: formData.get("testo"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }
  const s = trovaServizio(parsed.data.servizioId);
  if (!s) return { error: "Servizio sconosciuto." };

  const lw = await limitWrite(user.id, "risposta");
  if (!lw.ok) return { error: lw.error };

  const adesso = new Date();
  const periodo = periodoDi(adesso);

  // Un quadro, una risposta: la seconda non sovrascrive in silenzio la prima —
  // una risposta pubblica già letta da qualcuno non deve poter cambiare senza
  // lasciare traccia.
  const esistente = await prisma.rispostaServizio.findFirst({
    where: { servizioId: s.id, tipo: TIPO_QUADRO, periodo },
    select: { id: true },
  });
  if (esistente) {
    return {
      error: "Il quadro di questo mese ha già una risposta del Comune.",
    };
  }

  await prisma.$transaction([
    prisma.rispostaServizio.create({
      data: {
        tipo: TIPO_QUADRO,
        servizioId: s.id,
        periodo,
        testo: parsed.data.testo,
        autoreId: user.id,
        caricaAlMomento: timbroCarica(user.email, adesso),
      },
    }),
    prisma.moderationAction.create({
      data: {
        actorId: user.id,
        action: "risposta_quadro",
        targetType: "servizio",
        targetId: s.id,
        reason: periodo,
      },
    }),
  ]);

  revalidatePath(`/valutazioni/${s.id}`);
  rivalidaAreaComune();
  return { ok: true };
}

const singolaSchema = z.object({
  valutazioneId: z.string().min(1),
  testo: z
    .string()
    .trim()
    .min(1, "La risposta è vuota.")
    .max(RISPOSTA_TESTO_MAX, `La risposta è troppo lunga: massimo ${RISPOSTA_TESTO_MAX} caratteri.`),
});

export async function rispondiSingolaAction(
  _prev: RispostaState,
  formData: FormData,
): Promise<RispostaState> {
  const user = await requireStaff();
  const parsed = singolaSchema.safeParse({
    valutazioneId: formData.get("valutazioneId"),
    testo: formData.get("testo"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const lw = await limitWrite(user.id, "risposta");
  if (!lw.ok) return { error: lw.error };

  const v = await prisma.valutazione.findUnique({
    where: { id: parsed.data.valutazioneId },
    select: { id: true, servizioId: true, rimossaIl: true, risposte: { select: { id: true } } },
  });
  if (!v || v.rimossaIl) return { error: "Valutazione non trovata." };
  if (v.risposte.length > 0) {
    return { error: "Questa recensione ha già una risposta del Comune." };
  }

  await prisma.$transaction([
    prisma.rispostaServizio.create({
      data: {
        tipo: TIPO_SINGOLA,
        servizioId: v.servizioId,
        valutazioneId: v.id,
        testo: parsed.data.testo,
        autoreId: user.id,
        caricaAlMomento: timbroCarica(user.email, new Date()),
      },
    }),
    prisma.moderationAction.create({
      data: {
        actorId: user.id,
        action: "risposta_singola",
        targetType: "valutazione",
        targetId: v.id,
      },
    }),
  ]);

  revalidatePath(`/valutazioni/${v.servizioId}`);
  rivalidaAreaComune();
  return { ok: true };
}

const segnalaSchema = z.object({
  valutazioneId: z.string().min(1),
  motivo: z
    .string()
    .trim()
    .min(1, "Il motivo è obbligatorio: è ciò che la redazione esamina.")
    .max(MOTIVO_MAX, `Il motivo è troppo lungo: massimo ${MOTIVO_MAX} caratteri.`),
});

/**
 * Il Comune CONTESTA, non cancella (piano §2.6): la valutazione resta
 * pubblicata e senza segni pubblici finché la Redazione non decide
 * (decisione di Lorenzo, 2026-08-03). L'atto finisce nel log di audit.
 */
export async function segnalaValutazioneAction(
  _prev: RispostaState,
  formData: FormData,
): Promise<RispostaState> {
  const user = await requireStaff();
  const parsed = segnalaSchema.safeParse({
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
    select: { id: true, servizioId: true, rimossaIl: true, segnalataIl: true },
  });
  if (!v || v.rimossaIl) return { error: "Valutazione non trovata." };
  if (v.segnalataIl) {
    return { error: "Già segnalata: la redazione la esaminerà." };
  }

  await prisma.$transaction([
    prisma.valutazione.update({
      where: { id: v.id },
      data: { segnalataIl: new Date(), segnalataMotivo: parsed.data.motivo },
    }),
    prisma.moderationAction.create({
      data: {
        actorId: user.id,
        action: "valutazione_segnalata",
        targetType: "valutazione",
        targetId: v.id,
        reason: parsed.data.motivo,
      },
    }),
  ]);

  revalidatePath(`/valutazioni/${v.servizioId}`);
  revalidatePath("/redazione");
  return { ok: true };
}
