"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crest } from "@/components/brand/crest";
import { PreviewBadge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/*
  La barra in alto per chi NON è autenticato (R-5, decisione W1 del
  2026-08-04: /valutazioni si apre in sola lettura). Componente SEPARATO da
  `TopBar` di proposito: la barra autenticata è una superficie protetta e
  non si tocca; questa è la sua variante minima — stemma, nome, tema e un
  solo invito, «Accedi».

  Client per una sola ragione: `usePathname`, che costruisce il `?next=` così
  chi entra dal login riatterra sulla pagina che stava leggendo — lo stesso
  contratto del guard nel proxy.
*/
export function TopBarAnonima() {
  const pathname = usePathname();
  const login = `/login?next=${encodeURIComponent(pathname ?? "/valutazioni")}`;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-lg print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <span className="flex items-center gap-2.5">
          <Crest className="h-8 w-auto" />
          <span className="hidden font-bold tracking-tight sm:inline">
            Comune di Pistoia
          </span>
          <PreviewBadge className="hidden md:inline-flex" />
        </span>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href={login} className="btn btn-primary btn-sm">
            Accedi
          </Link>
        </div>
      </div>
    </header>
  );
}
