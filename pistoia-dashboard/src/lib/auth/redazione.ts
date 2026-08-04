import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { requireUser, type CurrentUser } from "./dal";
import { isRedazione } from "@/lib/redazione";

/**
 * Il gate della Redazione (R-4).
 *
 * Vive in un file PROPRIO e non in `dal.ts` perché la DAL è parte
 * dell'autenticazione, protetta da modifiche senza un ok esplicito
 * (AGENTS.md): qui si COMPONE `requireUser` senza toccare nulla di esistente.
 * Se Lorenzo vorrà, la funzione può migrare in `dal.ts` accanto alle sorelle
 * senza cambiare nessun chiamante.
 *
 * ⚠️ Non è `requireModerator`: quella lascia passare anche `ADMIN`, che in
 * questo modello è il super-account del COMUNE (SECURITY.md §4) — e il piano
 * (§2.6) non lascia cancellare al Comune ciò che lo riguarda. Il cancello di
 * R-4 esiste esattamente per questa differenza.
 */
export const requireRedazione = cache(async (): Promise<CurrentUser> => {
  const user = await requireUser();
  if (!isRedazione(user.role)) redirect("/la-mia-citta");
  return user;
});
