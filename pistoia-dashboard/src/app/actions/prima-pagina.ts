"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRedazione } from "@/lib/auth/redazione";
import { limitWrite } from "@/lib/limits";
import { idValido } from "@/lib/token";
import { validaCura } from "@/lib/prima-pagina";

/*
  LA CURA DEL FATTO DEL GIORNO (Ondata 10).

  È l'unico posto della piattaforma in cui una persona scrive **sopra** un atto,
  e il gate è `requireRedazione` — cioè il solo `MODERATOR`, **non** `ADMIN`.

  Non è pignoleria sui ruoli: `ADMIN` è il super-account del **Comune**
  (`SECURITY.md` §4), e la prima pagina di una piattaforma che osserva il Comune
  non la può scrivere il Comune. È la stessa linea che R-4 ha tracciato sulle
  valutazioni — chi è giudicato può segnalare, decide la Redazione — applicata
  al posto in cui conta di più, perché qui si decide che cosa la città legge per
  primo.

  ⚠️ **Gli argomenti di una Server Action sono input NON FIDATO**: l'azione è un
  endpoint HTTP pubblico e la firma TypeScript non vale al confine di rete
  (`AGENTS.md` §3, 2026-08-08). L'id si guarda con `idValido` **prima** della
  query, non dentro — `undefined` in un `where` di Prisma non è «nessuna riga»,
  è «nessun filtro».
*/

export type CuraState = { ok?: boolean; error?: string } | undefined;

/** Le due superfici che cambiano quando la cura cambia. */
function rivalida() {
  revalidatePath("/");
  revalidatePath("/redazione");
}

/**
 * Scrive il titolo umano e la didascalia su un atto: da quel momento la prima
 * pagina apre con lui.
 *
 * `curatoIl` si aggiorna a ogni salvataggio e non solo al primo: è il campo su
 * cui `fattoDelGiorno()` sceglie quando due atti dello stesso giorno sono
 * curati, e la regola dichiarata è che **vince l'ultimo curato** — cioè un
 * ripensamento deve poter vincere senza dover prima disfare il primo.
 */
export async function curaFattoDelGiornoAction(
  _prev: CuraState,
  formData: FormData,
): Promise<CuraState> {
  const user = await requireRedazione();

  const attoId = formData.get("attoId");
  if (!idValido(attoId)) return { error: "Scegli l'atto da curare." };

  const lw = await limitWrite(user.id, "moderazione");
  if (!lw.ok) return { error: lw.error };

  const atto = await prisma.atto.findUnique({
    where: { id: attoId },
    select: { id: true, oggetto: true },
  });
  if (!atto) return { error: "Atto non trovato." };

  // La validazione vera sta nel modulo puro, che i test coprono: qui l'azione
  // la chiama, non la riscrive. Fra le tre regole c'è quella che conta —
  // il titolo non può essere l'oggetto ufficiale ricopiato.
  const esito = validaCura(
    formData.get("titolo"),
    formData.get("sommario"),
    atto.oggetto,
  );
  if (!esito.ok) return { error: esito.problema };

  await prisma.$transaction([
    prisma.atto.update({
      where: { id: atto.id },
      data: {
        titoloRedazionale: esito.titolo,
        sommarioRedazionale: esito.sommario,
        curatoIl: new Date(),
      },
    }),
    /*
      La firma pubblica è sempre l'entità collettiva (`FIRMA_REDAZIONE`): chi ha
      curato non compare mai in prima pagina. Ma **compare nel registro**, che è
      dove vivono gli attori di ogni altra azione della piattaforma
      (`SECURITY.md` §5, append-only). È la ragione per cui l'atto non porta un
      campo «autore»: sarebbe una seconda anagrafe della stessa cosa.
    */
    prisma.moderationAction.create({
      data: {
        actorId: user.id,
        action: "fatto_del_giorno_curato",
        targetType: "atto",
        targetId: atto.id,
        reason: esito.titolo,
      },
    }),
  ]);

  rivalida();
  return { ok: true };
}

/**
 * Toglie la cura: la prima pagina torna ad aprire col fiume degli atti.
 *
 * Esiste perché «senza cura non c'è apertura» dev'essere una strada
 * percorribile in tutti e due i versi. Un titolo sbagliato che si può solo
 * sostituire, mai ritirare, obbligherebbe la redazione a scriverne un altro
 * per correggere il primo — e la home direbbe comunque qualcosa quando la cosa
 * giusta è tacere.
 */
export async function togliCuraAction(
  _prev: CuraState,
  formData: FormData,
): Promise<CuraState> {
  const user = await requireRedazione();

  const attoId = formData.get("attoId");
  if (!idValido(attoId)) return { error: "Atto non valido." };

  const lw = await limitWrite(user.id, "moderazione");
  if (!lw.ok) return { error: lw.error };

  const atto = await prisma.atto.findUnique({
    where: { id: attoId },
    select: { id: true, titoloRedazionale: true },
  });
  if (!atto) return { error: "Atto non trovato." };
  if (!atto.titoloRedazionale) return { error: "Questo atto non è curato." };

  await prisma.$transaction([
    prisma.atto.update({
      where: { id: atto.id },
      data: {
        titoloRedazionale: null,
        sommarioRedazionale: null,
        curatoIl: null,
      },
    }),
    prisma.moderationAction.create({
      data: {
        actorId: user.id,
        action: "fatto_del_giorno_tolto",
        targetType: "atto",
        targetId: atto.id,
        reason: atto.titoloRedazionale,
      },
    }),
  ]);

  rivalida();
  return { ok: true };
}
