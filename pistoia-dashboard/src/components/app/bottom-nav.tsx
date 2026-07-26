"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DESTINATIONS, findDestination } from "./nav-items";
import { cn } from "@/lib/utils";

/*
  Barra di navigazione su telefono: le cinque destinazioni, tutte.

  Prima del consolidamento mostrava le cinque voci marcate `core` su 25, e le
  altre 16 non avevano alcun percorso navigabile: la barra laterale sparisce
  sotto i 1024px e non c'era nulla a sostituirla — nessun menu a panino, nessun
  pannello. Si raggiungevano solo digitandone il nome nella palette, cioè solo
  sapendo già che esistevano.

  Fra le 16 c'erano tutti e sette gli strumenti di partecipazione strutturata,
  benché "partecipare" sia uno dei due compiti primari della piattaforma.

  Profilo e impostazioni restano nel menu avatar della barra in alto: non sono
  destinazioni civiche e non vanno duplicate qui.
*/

export function BottomNav() {
  const pathname = usePathname();
  const active = findDestination(pathname);

  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/85 backdrop-blur-lg lg:hidden print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {DESTINATIONS.map((item) => {
          const isActive = active?.href === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 pb-2 pt-2 text-[11px] font-medium transition-colors",
                  isActive ? "text-teal" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center rounded-pill px-5 py-1 transition-colors",
                    isActive && "bg-teal-soft",
                  )}
                >
                  <Icon size={20} />
                </span>
                <span className="max-w-full truncate px-0.5">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
