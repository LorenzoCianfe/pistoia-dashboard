"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  DESTINATIONS,
  ADMIN_NAV,
  findDestination,
  isPathActive,
  type NavItem,
} from "./nav-items";
import { cn } from "@/lib/utils";

/*
  Barra laterale: le stesse cinque destinazioni della barra in basso, più le
  sezioni di quella aperta.

  Prima del consolidamento era un elenco di 25 voci in quattro blocchi, di cui
  solo due etichettati. A 1280×720 misurava 1191px contro 656px visibili: il
  45% stava sotto la piega, e sotto la piega finiva l'intero gruppo
  "Trasparenza" — avvisi urgenti compresi.

  Ora il primo livello è sempre visibile per intero e la profondità si apre
  solo dove serve. Notifiche, profilo e impostazioni non sono più qui: erano
  una seconda copia di quello che la barra in alto offre già.
*/

function NavLink({
  item,
  active,
  nested = false,
}: {
  item: NavItem;
  active: boolean;
  nested?: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center rounded-[var(--radius-sm)] transition-colors",
        nested
          ? "gap-2.5 py-1.5 pl-3 pr-3 text-[13px]"
          : "gap-3 px-3.5 py-2.5 text-sm font-medium",
        active ? "text-foreground" : "text-muted hover:text-foreground",
      )}
    >
      {active ? (
        <motion.span
          layoutId="side-active"
          className="absolute inset-0 rounded-[var(--radius-sm)] border border-border bg-surface-2"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      ) : null}
      <Icon
        size={nested ? 15 : 19}
        className={cn("relative z-10 shrink-0", active && "text-teal")}
      />
      <span className="relative z-10 truncate">{item.label}</span>
    </Link>
  );
}

export function SideNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const openDestination = findDestination(pathname);

  // Una sola voce attiva in tutta la barra: la pastiglia scorrevole è un solo
  // elemento condiviso (`layoutId`), e due voci attive insieme se la
  // contenderebbero. Succede su ogni sotto-rotta di una destinazione — es.
  // `/comunita/stanze`, dove combaciano sia la sezione sia Comunità.
  const activeSectionHref =
    openDestination?.sections.find((s) => isPathActive(pathname, s.href))?.href ??
    null;

  return (
    <nav aria-label="Navigazione principale" className="flex flex-col gap-1">
      {DESTINATIONS.map((dest) => {
        const isOpen = openDestination?.href === dest.href;
        return (
          <div key={dest.href} className="flex flex-col gap-1">
            <NavLink
              item={dest}
              active={activeSectionHref === null && isPathActive(pathname, dest.href)}
            />
            {/* Le sezioni si mostrano solo per la destinazione aperta: è la
                progressive disclosure che tiene il primo livello leggibile. */}
            {isOpen && dest.sections.length > 0 ? (
              <ul className="mb-1 ml-[18px] flex flex-col gap-0.5 border-l border-border pl-2.5">
                {dest.sections.map((section) => (
                  <li key={section.href}>
                    <NavLink
                      item={section}
                      active={activeSectionHref === section.href}
                      nested
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}

      {isAdmin ? (
        <>
          <div className="my-2 h-px bg-border" />
          <NavLink
            item={ADMIN_NAV}
            active={isPathActive(pathname, ADMIN_NAV.href)}
          />
        </>
      ) : null}
    </nav>
  );
}
