"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  DESTINATIONS,
  findDestination,
  isPathActive,
  staffNav,
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
        /*
          `min-h-11` sono i 44px di `DESIGN.md` §11.6, e qui il prezzo si paga
          in altezza di colonna: le righe erano **31,5px** annidate e **40** al
          primo livello, cioè la superficie di navigazione era l'unica della
          piattaforma con bersagli sotto la soglia su ogni pagina.

          Non c'era una via più economica. L'eccezione della spaziatura chiede
          che un cerchio da 44px centrato su una riga non tocchi la riga
          accanto: fra due voci sottodimensionate significa un passo di 44px,
          cioè **esattamente lo spazio che costa farle alte 44**. Misurato: la
          colonna passa da 423 a ~517px con Trasparenza aperta, e con la
          sezione più lunga (Partecipa, nove sezioni) sfiora i 744px, quindi
          su uno schermo da 720 scorre. È il costo dichiarato della scelta.
        */
        "group relative flex min-h-11 items-center rounded-[var(--radius-sm)] transition-colors",
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

/**
 * Riceve il **RUOLO**, una stringa, e si ricava qui la superficie riservata.
 *
 * Era `isAdmin: boolean`, e quel booleano è stato la ragione per cui la
 * Redazione è rimasta senza porta: un secondo booleano accanto avrebbe lasciato
 * scrivibile «admin e moderatore insieme», che non esiste (R-4).
 *
 * ⚠️ **La prop non può essere il `NavItem`**, ed è una trappola già pagata
 * (`AGENTS.md` §3, ondata 7, 1). `AppShell` è un Server Component: passargli
 * l'oggetto significa passare `icon`, che è un **componente React** — cioè una
 * funzione — attraverso il confine RSC, e React rifiuta a runtime con
 * «Functions cannot be passed directly to Client Components». Typecheck e lint
 * restano verdi tutti e due; il primo segno è la pagina sull'error boundary.
 * Prima del 2026-08-07 il problema non esisteva perché `ADMIN_NAV` veniva
 * importato **qui dentro**, e l'icona non attraversava niente.
 */
export function SideNav({ ruolo }: { ruolo: string }) {
  const staff = staffNav(ruolo);
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

      {staff ? (
        <>
          <div className="my-2 h-px bg-border" />
          <NavLink item={staff} active={isPathActive(pathname, staff.href)} />
        </>
      ) : null}
    </nav>
  );
}
