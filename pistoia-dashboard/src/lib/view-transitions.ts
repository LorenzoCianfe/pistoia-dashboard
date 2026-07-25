/**
 * Nomi condivisi fra i due capi di una transizione a elemento condiviso.
 *
 * Vivono in un modulo NEUTRO — né `"use client"` né `server-only` — di
 * proposito. Stavano dentro `report-link.tsx`, che è un modulo client, e la
 * pagina di dettaglio (Server Component) importandoli non riceveva le stringhe
 * ma i riferimenti client che l'RSC mette al posto degli export di un modulo
 * marcato `"use client"`. Risultato: l'attributo gemello non finiva nel DOM e
 * la transizione partiva senza avere niente a cui agganciarsi — senza errori,
 * il che è il modo peggiore per rompersi.
 */

/** Assegnato al volo alla card cliccata, e fisso sul suo gemello nel dettaglio. */
export const SHARED_NAME = "segnalazione-attiva";

/**
 * Marca l'elemento gemello nel dettaglio. Serve a due cose: dare al lettore
 * dell'HTML un aggancio esplicito, e dire alla transizione "il dettaglio è nel
 * DOM, puoi scattare la seconda foto".
 */
export const SHARED_ATTR = "data-segnalazione-condivisa";
