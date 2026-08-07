import {
  LayoutDashboard,
  Star,
  Lightbulb,
  MessageCircleQuestion,
  Megaphone,
  Users,
  Send,
  type LucideIcon,
} from "lucide-react";

/*
  LE SETTE SUPERFICI DELL'AREA COMUNE, in un posto solo.

  Le usano la navigazione interna (`NavAdmin`, client) e le porte sul cruscotto
  (`/admin`, server). Una lista sola perché due divergono al primo inserimento —
  ed è già successo in questo repository fra `rotte.mjs` e `shots.mjs`.

  **Modulo neutro**: né `"use client"` né `server-only`. `icon` è un componente
  React, quindi non può attraversare il confine RSC come prop (`AGENTS.md` §3,
  ondata 7, 1 — ripagata il 2026-08-07 su `ADMIN_NAV`). Qui non lo attraversa:
  chi disegna importa la tabella e legge l'icona di là.

  Il taglio è deciso in `docs/piano-admin.md` e la regola che lo governa vive in
  `DESIGN.md` §6:

      una coda una pagina · gli strumenti insieme ·
      le letture sul cruscotto, finché ci stanno · il registro è una lettura

  `/admin/codici-qr` non è qui: è un foglio da stampare, non una superficie di
  lavoro, e la sua porta sta sul cruscotto insieme alle altre letture.
*/

/** La chiave del contatore dentro `getContatoriAdmin()`. */
export type ChiaveCoda =
  | "valutazioni"
  | "proposte"
  | "domande"
  | "segnalazioni"
  | "cittadini";

type Base = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Cosa ci si fa. La legge il cruscotto, sotto ogni porta. */
  descrizione: string;
};

/**
 * **Solo una coda ha un contatore, ed è il tipo a dirlo.**
 *
 * `natura` e `contatore` non sono due campi indipendenti: un'unione
 * discriminata rende «uno strumento con un pallino» non scrivibile, invece che
 * scrivibile e sbagliato. La regola di `DESIGN.md` §6 — *lo strumento non deve
 * mai avere un pallino* — smette così di essere una convenzione da ricordare.
 */
export type SuperficieAdmin =
  | (Base & { natura: "cruscotto" | "strumenti" })
  | (Base & { natura: "coda"; contatore: ChiaveCoda });

export const SUPERFICI_ADMIN: SuperficieAdmin[] = [
  {
    href: "/admin",
    label: "Cruscotto",
    icon: LayoutDashboard,
    natura: "cruscotto",
    descrizione: "I numeri della città, il registro delle azioni e i fogli QR.",
  },
  {
    href: "/admin/valutazioni",
    label: "Valutazioni",
    icon: Star,
    natura: "coda",
    contatore: "valutazioni",
    descrizione: "Le recensioni dei servizi: rispondi o segnala alla redazione.",
  },
  {
    href: "/admin/proposte",
    label: "Proposte",
    icon: Lightbulb,
    natura: "coda",
    contatore: "proposte",
    descrizione: "Le proposte dei cittadini, ordinate per sostegno ricevuto.",
  },
  {
    href: "/admin/domande",
    label: "Domande",
    icon: MessageCircleQuestion,
    natura: "coda",
    contatore: "domande",
    descrizione: "Le domande del question time che aspettano una risposta.",
  },
  {
    href: "/admin/segnalazioni",
    label: "Segnalazioni",
    icon: Megaphone,
    natura: "coda",
    contatore: "segnalazioni",
    descrizione: "Il triage: stato, ufficio assegnato e nota ufficiale.",
  },
  {
    href: "/admin/cittadini",
    label: "Cittadini",
    icon: Users,
    natura: "coda",
    contatore: "cittadini",
    descrizione: "Richieste di verifica e moderazione della community.",
  },
  {
    href: "/admin/pubblica",
    label: "Pubblica",
    icon: Send,
    natura: "strumenti",
    descrizione: "Aggiorna un cantiere, crea un sondaggio, invia una notifica.",
  },
];

/** Le sei destinazioni oltre al cruscotto: le porte che il cruscotto apre. */
export const PORTE_ADMIN = SUPERFICI_ADMIN.filter((s) => s.natura !== "cruscotto");
