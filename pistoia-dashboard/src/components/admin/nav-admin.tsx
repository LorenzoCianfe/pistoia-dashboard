"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SUPERFICI_ADMIN, type ChiaveCoda } from "./superfici";
import { cn } from "@/lib/utils";

/*
  LA NAVIGAZIONE DELL'AREA COMUNE.

  Sta **dentro ogni pagina** e non in un `layout.tsx`, ed è una scelta obbligata
  dai contatori: nell'App Router un layout condiviso **non si ri-renderizza**
  navigando fra due sue figlie, quindi i numeri resterebbero quelli del primo
  caricamento — «3 domande in attesa» ancora lì dopo averle chiuse tutte e tre.
  Un contatore che mente è peggio di nessun contatore: si smette di guardarlo.

  Esiste a **ogni larghezza**, e anche questo è deciso da un difetto già pagato
  (`AGENTS.md` §3, «due trappole delle porte»): la barra laterale è `lg:block`,
  quindi una navigazione affidata a quella lascerebbe il telefono senza modo di
  passare da una coda all'altra. Qui è nel flusso della pagina: c'è sempre.

  I contatori arrivano da `getContatoriAdmin()` — numeri, che attraversano il
  confine RSC senza problemi. Le icone no: quelle si importano di qua, dalla
  tabella (`superfici.ts`), e non passano da nessuna prop.
*/

export function NavAdmin({ contatori }: { contatori: Record<ChiaveCoda, number> }) {
  const pathname = usePathname();

  /*
    Il cruscotto vuole la corrispondenza ESATTA, le altre no.

    `/admin` è prefisso di tutte: con la regola dei prefissi sarebbero attive
    due voci insieme su ogni sottopagina — la stessa collisione della trappola 5
    della Fase A/B, che lì si vedeva sulla pastiglia della barra laterale e qui
    si sentirebbe su `aria-current`, cioè su chi la pastiglia non la vede.
  */
  const attiva = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav aria-label="Aree del Comune">
      <ul className="flex flex-wrap gap-2">
        {SUPERFICI_ADMIN.map((s) => {
          const Icon = s.icon;
          const qui = attiva(s.href);
          // Solo una coda ha un numero: lo strumento non deve mai avere un
          // pallino (`DESIGN.md` §6), e qui è il tipo a impedirlo.
          const quanti = s.natura === "coda" ? contatori[s.contatore] : null;

          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={qui ? "page" : undefined}
                className={cn(
                  /*
                    `min-h-11` sono i 44px di `DESIGN.md` §11.6, e il bordo c'è
                    **a riposo**: ciò che dice «si può premere» non si affida
                    all'`:hover`, che su un telefono non avviene mai.

                    ⚠️ Il bordo è `--border-strong`, e la prima stesura aveva
                    messo `--border`. Misurato: `--border` (#e4e3e0) contro la
                    **tela** (#e8e7e4) fa **1,03:1** — cioè il bordo non c'è, e
                    l'affordance tornava a essere solo l'`:hover`, che è
                    esattamente il difetto chiuso stamattina su `.btn-ghost`.
                    `--border` è pensato per stare **su una superficie**, non
                    sulla tela; per una pastiglia appoggiata alla tela il
                    repertorio del progetto usa da sempre `--border-strong`
                    (`quick-report`, `report-composer`, `similar-reports`).
                  */
                  "flex min-h-11 items-center gap-2 rounded-pill border border-border-strong px-3.5 text-sm transition-colors",
                  qui
                    ? "bg-surface-2 font-semibold text-foreground"
                    : "text-muted hover:border-teal hover:text-teal",
                )}
              >
                <Icon size={16} className={cn("shrink-0", qui && "text-teal")} aria-hidden />
                {s.label}
                {quanti !== null ? (
                  <span
                    className={cn(
                      "min-w-5 rounded-pill px-1.5 text-center text-xs tabular-nums",
                      // Zero non è un'assenza: è la risposta «niente in coda»,
                      // e va detta piano. Sopra zero il numero è il segnale.
                      quanti > 0
                        ? "bg-surface-3 font-semibold text-foreground"
                        : "text-muted-2",
                    )}
                  >
                    {quanti}
                    <span className="sr-only">{" in attesa"}</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
