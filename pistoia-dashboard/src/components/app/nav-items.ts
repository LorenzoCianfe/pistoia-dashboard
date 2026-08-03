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
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
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
};

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
