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
  { href: "/sondaggi", label: "Sondaggi", icon: Vote, core: false },
  { href: "/comunita", label: "Comunità", icon: MessagesSquare, core: true },
  { href: "/segnalazioni", label: "Segnalazioni", icon: Megaphone, core: true },
  { href: "/proposte", label: "Proposte", icon: Lightbulb, core: false },
  { href: "/organigramma", label: "Organigramma", icon: Network, core: false },
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
