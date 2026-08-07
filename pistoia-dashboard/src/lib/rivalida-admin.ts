import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Rinfresca **tutta** l'area del Comune, non la sola pagina che l'azione tocca.
 *
 * Fino al 2026-08-07 le azioni scrivevano `revalidatePath("/admin")`, ed era
 * esatto: l'area era una pagina sola. Spezzata in sette rotte
 * (`docs/piano-admin.md`), quella riga sarebbe diventata muta per sei di esse —
 * si approva una verifica su `/admin/cittadini` e si rinfresca il cruscotto.
 *
 * Perché l'intero sottoalbero e non la sola rotta interessata: **i contatori
 * delle code stanno sulla navigazione di ogni pagina dell'area**. Approvare una
 * verifica cambia un numero che si vede anche da `/admin/proposte`. Elencare a
 * mano quali rotte tocca ogni azione sarebbe una seconda mappa da tenere
 * allineata a quella vera, e divergerebbe al primo inserimento.
 *
 * `type: "layout"` è ciò che estende l'invalidazione a `/admin` **e a tutto ciò
 * che ci sta sotto**; senza, varrebbe solo per `/admin`.
 */
export function rivalidaAreaComune() {
  revalidatePath("/admin", "layout");
}
