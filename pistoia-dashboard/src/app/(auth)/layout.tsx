import Link from "next/link";
import { Crest } from "@/components/brand/crest";
import { PreviewBadge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MeshSurface } from "@/components/signature/mesh-surface";

const highlights = [
  "Il bilancio della città, leggibile in 30 secondi",
  "I cantieri che avanzano, in tempo reale",
  "La tua voce nei sondaggi del Comune",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/*
        Pannello di marca — rifatto nell'ondata 6.

        Prima portava il gradiente teal→viola più due aloni bianchi sfocati agli
        angoli. Erano tre violazioni in una schermata sola: `DESIGN.md` §4
        concede il gradiente a UN momento per pagina e questo se lo mangiava
        all'ingresso, §6 stabilisce che l'elevazione è translucenza e filo di
        luce e non alone, e gli aloni erano esattamente aloni.

        Al loro posto la superficie-firma `MeshSurface` in tono `cool`. `cool` è
        il neutro ed è la scelta giusta qui: la schermata di accesso non
        rappresenta una salute, e usare `good` farebbe dire al verde una cosa
        che non c'è (DESIGN.md §8). Sopra, la scacchiera dello stemma come
        momento di marca.
      */}
      <aside className="relative hidden overflow-hidden lg:block">
        <MeshSurface
          tone="cool"
          className="flex h-full flex-col justify-between rounded-none p-12"
        >
          {/*
            L'inchiostro non si dichiara qui: `.mesh-surface` lo imposta a
            `--highlight-ink` e i titoli lo ereditano (vedi la regola in
            globals.css sul reset di Astryx). Sugli stop di `cool` quel nero
            caldo sta fra 4,6:1 e 9,6:1 — AA anche sul testo corrente. È il
            motivo per cui `cool` regge il testo piccolo mentre `bad` no
            (vedi `city-state-hero.tsx`).
          */}
          <div>
            <div className="flex items-center gap-3">
              <Crest className="h-11 w-auto" />
              <span className="text-lg font-bold tracking-tight">
                Comune di Pistoia
              </span>
            </div>
            {/* Alta 12px quanto il passo del motivo: sotto si vede una sola
                fila di quadretti e la scacchiera si legge come un tratteggio. */}
            <div className="scacchiera mt-6 h-3 w-28 opacity-80" aria-hidden />
          </div>

          <div className="max-w-md">
            <h2 className="font-display text-[34px] font-light leading-tight tracking-tight">
              I dati della tua città, finalmente leggibili.
            </h2>
            <ul className="mt-8 space-y-3.5">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-3">
                  <span
                    className="mt-px size-1.5 shrink-0 rounded-full bg-current"
                    aria-hidden
                  />
                  <span className="text-base font-medium">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm font-medium opacity-80">
            Un progetto civico · dati dimostrativi
          </p>
        </MeshSurface>
      </aside>

      {/* Form side */}
      <main className="relative flex flex-col">
        <header className="flex items-center justify-between p-5 sm:p-6">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <Crest className="h-9 w-auto" />
            <span className="font-bold tracking-tight">Comune di Pistoia</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <PreviewBadge />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
