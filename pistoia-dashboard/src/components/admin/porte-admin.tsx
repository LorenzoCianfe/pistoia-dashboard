import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PORTE_ADMIN } from "./superfici";
import type { ContatoriAdmin } from "@/lib/data/admin";

/*
  LE SEI PORTE, sul cruscotto.

  Sul cruscotto la navigazione **sono** queste schede, e non c'è anche la riga
  di pastiglie di `NavAdmin`: sarebbero due elenchi della stessa cosa nella
  stessa schermata, e il secondo non aggiungerebbe una destinazione. Le
  pastiglie vivono sulle sei sottopagine, dove il compito è passare da una coda
  all'altra senza tornare indietro.

  Server Component: le icone si leggono dalla tabella qui dentro, senza
  attraversare il confine RSC (`superfici.ts` spiega perché conta).
*/
export function PorteAdmin({ contatori }: { contatori: ContatoriAdmin }) {
  return (
    <nav aria-label="Le aree di lavoro del Comune">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PORTE_ADMIN.map((p) => {
          const Icon = p.icon;
          const quanti = p.natura === "coda" ? contatori[p.contatore] : null;

          return (
            <li key={p.href}>
              <Link
                href={p.href}
                className="card card-hover group flex h-full items-start gap-3 p-4"
              >
                <span className="mt-0.5 shrink-0 text-teal">
                  <Icon size={19} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">{p.label}</span>
                    {/*
                      Il numero è **solo** delle code: uno strumento non ha una
                      fila che si allunga, quindi non ha niente da contare
                      (`DESIGN.md` §6). Qui è il tipo a garantirlo, non la
                      memoria di chi scrive la prossima porta.
                    */}
                    {quanti !== null ? (
                      <span
                        className={
                          quanti > 0
                            ? "text-sm font-semibold tabular-nums text-foreground"
                            : "text-sm tabular-nums text-muted-2"
                        }
                      >
                        {quanti}
                        <span className="sr-only">{" in attesa"}</span>
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {p.descrizione}
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="mt-0.5 shrink-0 text-muted-2 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
