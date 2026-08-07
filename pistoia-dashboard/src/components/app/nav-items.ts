import {
  Sparkles,
  Hand,
  Eye,
  Compass,
  Coins,
  Wallet,
  HardHat,
  Vote,
  MessagesSquare,
  Megaphone,
  Lightbulb,
  Network,
  Bell,
  User,
  Settings,
  Shield,
  CalendarDays,
  Map as MapIcon,
  MapPinned,
  Landmark,
  Target,
  Siren,
  HelpCircle,
  Newspaper,
  BookOpenText,
  MessageCircleQuestion,
  ListOrdered,
  HeartHandshake,
  Handshake,
  FolderKanban,
  Star,
  Award,
  PenLine,
  type LucideIcon,
} from "lucide-react";

import { EDIZIONI } from "@/lib/pagella";
// Modulo neutro (né `"use client"` né `server-only`): importabile da qui, che
// finisce dentro componenti client. La regola sta in testa a `lib/redazione.ts`.
import { isRedazione } from "@/lib/redazione";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /**
   * La tinta dell'icona dove la voce va distinta dalle altre — oggi il solo
   * menu del profilo, dove una superficie riservata sta in mezzo alle voci
   * dell'account. Vive **qui** e non nel menu perché altrimenti nascerebbe una
   * seconda lista di superfici di staff accanto a `staffNav()`, e due liste
   * della stessa cosa divergono al primo inserimento (`AGENTS.md` §3, nota
   * finale dell'ondata 7). La barra laterale la ignora: lì le icone sono
   * uniformi per disegno.
   */
  tinta?: string;
};

/**
 * Una destinazione di primo livello, con le sezioni che contiene.
 *
 * **Cinque, perché cinque sono gli slot di una barra in basso.** La struttura
 * non è stata scelta a tavolino e poi adattata al telefono: è derivata dal
 * vincolo più stretto, così desktop e mobile mostrano le STESSE destinazioni.
 *
 * Prima del consolidamento (Fase A) qui c'erano quattro elenchi paralleli per
 * 25 voci, e un campo `core` decideva quali cinque sopravvivessero su telefono:
 * le altre 16 non avevano alcun percorso navigabile sotto i 1024px, dove la
 * barra laterale non è collassata ma rimossa. Il campo `core` è sparito con la
 * ragione che lo rendeva necessario.
 *
 * Ogni sezione resta una pagina propria, al suo indirizzo: cambia da dove ci
 * si arriva, non cosa c'è.
 */
export type NavDestination = NavItem & {
  sections: NavItem[];
};

export const DESTINATIONS: NavDestination[] = [
  {
    href: "/la-mia-citta",
    label: "La mia città",
    icon: Sparkles,
    sections: [],
  },
  {
    href: "/partecipa",
    label: "Partecipa",
    icon: Hand,
    sections: [
      { href: "/segnalazioni", label: "Segnalazioni", icon: Megaphone },
      { href: "/proposte", label: "Proposte", icon: Lightbulb },
      { href: "/sondaggi", label: "Sondaggi", icon: Vote },
      // Sta sotto «Partecipa» e non sotto «Trasparenza» perché il gesto è
      // partecipare: si lascia un voto. Leggerlo è trasparenza, ma chi arriva
      // qui dal menu ci arriva per dire la sua, come per i sondaggi.
      { href: "/valutazioni", label: "Valutazioni dei servizi", icon: Star },
      { href: "/priorita", label: "Vota la priorità", icon: ListOrdered },
      { href: "/question-time", label: "Question time", icon: MessageCircleQuestion },
      { href: "/volontariato", label: "Volontariato", icon: HeartHandshake },
      { href: "/patti", label: "Patti e luoghi", icon: Handshake },
      { href: "/progetti", label: "Progetti civici", icon: FolderKanban },
    ],
  },
  {
    href: "/trasparenza",
    label: "Trasparenza",
    icon: Eye,
    sections: [
      { href: "/bilancio", label: "Bilancio", icon: Wallet },
      { href: "/opere", label: "Opere", icon: HardHat },
      { href: "/decisioni", label: "Decisioni", icon: Landmark },
      { href: "/promesse", label: "Promesse", icon: Target },
      {
        href: "/trasparenza/costo-amministrazione",
        label: "Costo dell'amministrazione",
        icon: Coins,
      },
      /*
        LA PAGELLA, e la porta si apre da sé.

        Sta sotto Trasparenza (decisione di Lorenzo, 2026-08-06) perché è ciò
        che quella sezione promette portato alla conclusione, accanto a
        Promesse e Bilancio che sono le sue fonti. Non sotto Partecipa: lì il
        gesto è del cittadino, qui è la Redazione che giudica e il cittadino
        legge.

        **La condizione non è una data ma un fatto**: `EDIZIONI` è vuoto finché
        la prima ricognizione reale non esiste (`lib/pagella.ts`, con un test a
        guardia). Finché lo è, una voce di menu manderebbe un cittadino su una
        pagina che dichiara di non avere ancora niente da dire. Il giorno in cui
        la prima edizione entra in quell'elenco, questa voce compare **senza che
        nessuno debba ricordarsene** — che è l'unica forma di rinvio che non si
        dimentica.
      */
      ...(EDIZIONI.length > 0
        ? [{ href: "/pagella", label: "La pagella della giunta", icon: Award }]
        : []),
      { href: "/digest", label: "Report del mese", icon: Newspaper },
    ],
  },
  {
    href: "/territorio",
    label: "Territorio",
    icon: Compass,
    sections: [
      { href: "/mappa", label: "Mappa", icon: MapIcon },
      { href: "/quartieri", label: "Quartieri", icon: MapPinned },
      { href: "/eventi", label: "Eventi", icon: CalendarDays },
    ],
  },
  {
    href: "/comunita",
    label: "Comunità",
    icon: MessagesSquare,
    sections: [
      { href: "/comunita/stanze", label: "Stanze tematiche", icon: MessagesSquare },
    ],
  },
];

/**
 * Aiuto e servizio: pagine che restano, fuori dal menu principale.
 *
 * Gli avvisi urgenti erano al 17° posto della barra laterale, sotto la piega,
 * per contenuti di severità "Critico". Il loro canale vero è il banner in home;
 * qui resta l'archivio.
 */
export const UTILITY_NAV: NavItem[] = [
  { href: "/avvisi", label: "Avvisi urgenti", icon: Siren },
  { href: "/organigramma", label: "Organigramma", icon: Network },
  { href: "/faq", label: "FAQ della città", icon: HelpCircle },
  { href: "/glossario", label: "Glossario", icon: BookOpenText },
];

/**
 * Le pagine che spiegano il PROGETTO invece della città.
 *
 * Stanno insieme per una ragione di sostanza e non di simmetria: **sono tutte
 * a lettura pubblica**, mentre `UTILITY_NAV` chiede un account. È quella
 * differenza che il footer dichiara con una pastiglia sola.
 *
 * Vive qui e non dentro `footer.tsx` perché dal 2026-08-06 la usano in due —
 * il footer e la porta d'ingresso `/` — e due elenchi paralleli divergono
 * sempre: sarebbero due risposte diverse alla stessa domanda «cosa può leggere
 * chi non è entrato».
 */
export const PROGETTO_NAV = [
  { href: "/metodologia", label: "Metodologia" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookie", label: "Cookie" },
  { href: "/note-comunita", label: "Regole community" },
];

/**
 * Raggiungibili dalla barra in alto — campanella e menu avatar.
 *
 * Non stanno nel menu laterale: ci stavano, ed erano una seconda copia dello
 * stesso collegamento, tre slot di primo livello per niente.
 */
export const ACCOUNT_NAV: NavItem[] = [
  { href: "/notifiche", label: "Notifiche", icon: Bell },
  { href: "/profilo", label: "Profilo", icon: User },
  { href: "/impostazioni", label: "Impostazioni", icon: Settings },
];

export const ADMIN_NAV: NavItem = {
  href: "/admin",
  label: "Area Comune",
  icon: Shield,
  tinta: "var(--red)",
};

/** Viola come il titolo della sua pagina: la Redazione non è il Comune. */
export const REDAZIONE_NAV: NavItem = {
  href: "/redazione",
  label: "Redazione",
  icon: PenLine,
  tinta: "var(--viola)",
};

/**
 * La superficie riservata di un ruolo, se ne ha una.
 *
 * **Perché una funzione e non due booleani.** Le due superfici sono
 * mutuamente esclusive per disegno (R-4): `/redazione` respinge l'admin —
 * il Comune non modera ciò che lo riguarda — e `/admin` respinge il
 * moderatore. Due `isAdmin`/`isModeratore` accanto lascerebbero scrivibile lo
 * stato «tutti e due», che non esiste.
 *
 * Nasce il 2026-08-07 da un difetto che nessun cancello poteva vedere:
 * `/redazione` **non era raggiungibile da nessun collegamento** — zero `href`
 * in tutta l'applicazione — quindi il moderatore doveva digitare l'indirizzo,
 * e sulla sua unica superficie di lavoro la barra non aveva nessuna voce
 * attiva. `rotte`, il cancello axe e quello dei bersagli ci arrivano **tutti
 * per indirizzo**, mai cliccando: una porta che non c'è resta verde ovunque.
 */
export function staffNav(ruolo: string): NavItem | null {
  if (ruolo === "ADMIN") return ADMIN_NAV;
  if (isRedazione(ruolo)) return REDAZIONE_NAV;
  return null;
}

/** Tutte le pagine navigabili, piatte: la palette di ricerca le vuole così. */
export const ALL_PAGES: NavItem[] = [
  ...DESTINATIONS.flatMap((d) => [
    { href: d.href, label: d.label, icon: d.icon },
    ...d.sections,
  ]),
  ...UTILITY_NAV,
  ...ACCOUNT_NAV,
];

/** Vero se `pathname` è quella rotta o una sua sotto-rotta. */
export function isPathActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * La destinazione a cui appartiene il percorso corrente.
 *
 * Le sezioni si controllano prima delle destinazioni: `/comunita/stanze` è una
 * sezione di Comunità e deve risolvere a Comunità, non fermarsi al primo
 * prefisso che combacia.
 */
export function findDestination(pathname: string): NavDestination | null {
  return (
    DESTINATIONS.find((d) =>
      d.sections.some((s) => isPathActive(pathname, s.href)),
    ) ??
    DESTINATIONS.find((d) => isPathActive(pathname, d.href)) ??
    null
  );
}

// ---------------------------------------------------------------------------
// Percorsi guidati "Cosa vuoi fare?" (A1 §23) — condivisi tra la home e le
// azioni rapide della palette di ricerca.
//
// PROTETTO (Fase A): è l'unica navigazione per obiettivi della piattaforma, e
// l'unico punto che parla di cosa vuoi fare invece che di come si chiama la
// sezione. Si promuove, non si scioglie.
// ---------------------------------------------------------------------------

export type GuidedAction = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: "teal" | "viola" | "amber" | "green" | "red";
};

export const GUIDED_ACTIONS: GuidedAction[] = [
  {
    href: "/segnalazioni",
    title: "Segnala un problema",
    description: "Buche, lampioni, rifiuti: avvisa il Comune",
    icon: Megaphone,
    color: "amber",
  },
  {
    href: "/proposte",
    title: "Proponi un'idea",
    description: "Un'idea concreta per migliorare la città",
    icon: Lightbulb,
    color: "green",
  },
  {
    href: "/sondaggi",
    title: "Partecipa a un sondaggio",
    description: "Di' la tua sulle scelte della città",
    icon: Vote,
    color: "viola",
  },
  {
    href: "/bilancio",
    title: "Scopri dove vanno i soldi",
    description: "Il bilancio del Comune, leggibile",
    icon: Wallet,
    color: "teal",
  },
  {
    href: "/eventi",
    title: "Trova un evento",
    description: "Cosa succede in città nei prossimi giorni",
    icon: CalendarDays,
    color: "viola",
  },
  {
    href: "/organigramma",
    title: "Contatta il Comune",
    description: "Uffici, assessori e referenti",
    icon: Network,
    color: "red",
  },
];
