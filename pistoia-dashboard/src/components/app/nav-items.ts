import {
  Sparkles,
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
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom navigation. */
  core: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/la-mia-citta", label: "La mia città", icon: Sparkles, core: true },
  { href: "/bilancio", label: "Bilancio", icon: Wallet, core: true },
  { href: "/opere", label: "Opere", icon: HardHat, core: true },
  { href: "/mappa", label: "Mappa", icon: MapIcon, core: false },
  { href: "/sondaggi", label: "Sondaggi", icon: Vote, core: false },
  { href: "/comunita", label: "Comunità", icon: MessagesSquare, core: true },
  { href: "/segnalazioni", label: "Segnalazioni", icon: Megaphone, core: true },
  { href: "/proposte", label: "Proposte", icon: Lightbulb, core: false },
  { href: "/eventi", label: "Eventi", icon: CalendarDays, core: false },
  { href: "/quartieri", label: "Quartieri", icon: MapPinned, core: false },
  { href: "/organigramma", label: "Organigramma", icon: Network, core: false },
];

// Sezione "Trasparenza" (O3): le pagine che chiudono il cerchio della
// partecipazione. Gruppo separato nella side-nav, sotto un'etichetta propria.
export const TRANSPARENCY_NAV: NavItem[] = [
  { href: "/avvisi", label: "Avvisi urgenti", icon: Siren, core: false },
  { href: "/decisioni", label: "Decisioni", icon: Landmark, core: false },
  { href: "/promesse", label: "Promesse", icon: Target, core: false },
  { href: "/digest", label: "Report del mese", icon: Newspaper, core: false },
  { href: "/faq", label: "FAQ della città", icon: HelpCircle, core: false },
  { href: "/glossario", label: "Glossario", icon: BookOpenText, core: false },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/notifiche", label: "Notifiche", icon: Bell, core: false },
  { href: "/profilo", label: "Profilo", icon: User, core: false },
  { href: "/impostazioni", label: "Impostazioni", icon: Settings, core: false },
];

export const ADMIN_NAV: NavItem = {
  href: "/admin",
  label: "Area Comune",
  icon: Shield,
  core: false,
};

// ---------------------------------------------------------------------------
// Percorsi guidati "Cosa vuoi fare?" (A1 §23) — condivisi tra la home e le
// azioni rapide della palette di ricerca.
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
