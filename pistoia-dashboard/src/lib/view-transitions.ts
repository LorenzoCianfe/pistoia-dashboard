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

/**
 * Il `view-transition-name` è **uno solo per tutta l'applicazione**, non uno
 * per entità.
 *
 * Non è una scorciatoia. Una transizione per volta è già la regola (DESIGN.md
 * §7: il nome si assegna alla sola card cliccata e si toglie a volo finito),
 * quindi due elementi con questo nome non possono mai coesistere in una
 * fotografia. Un nome per entità obbligherebbe invece a elencarle tutte in
 * `globals.css`, perché `::view-transition-*` vuole il nome letterale e non
 * accetta una variabile: la quinta entità che morfa si dimenticherebbe di
 * aggiungersi lì, e la transizione partirebbe senza durata né curva, cioè con
 * i valori di default del browser. Un difetto che non dà errori.
 */
export const NOME_CONDIVISO = "elemento-attivo";

export type ElementoCondiviso = {
  /**
   * Marca l'elemento gemello nel dettaglio. È per entità — e non generico —
   * perché è il segnale che la transizione aspetta per sapere che il dettaglio
   * *giusto* è nel DOM: generico, si accontenterebbe di qualunque pagina.
   */
  attr: string;
  /** Attributo con cui la card della lista si fa trovare dal link che contiene. */
  card: string;
};

export const CONDIVISO = {
  segnalazione: {
    attr: "data-condiviso-segnalazione",
    card: "data-report-card",
  },
  opera: {
    attr: "data-condiviso-opera",
    card: "data-opera-card",
  },
  proposta: {
    attr: "data-condiviso-proposta",
    card: "data-proposta-card",
  },
  quartiere: {
    attr: "data-condiviso-quartiere",
    card: "data-quartiere-card",
  },
} as const satisfies Record<string, ElementoCondiviso>;
