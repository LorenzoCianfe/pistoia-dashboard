import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
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
        che non c'è (DESIGN.md §8).

        ⚠️ Sopra c'era la **scacchiera dello stemma** come momento di marca, ed
        è uscita col battesimo del 2026-08-12: l'araldica dell'ente su una
        piattaforma che l'ente non è sarebbe il travestimento che
        `direzione-prodotto.md` §1.4 vieta. Adesso il momento di marca è il
        marchio stesso — vedi il commento accanto.
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
          {/* Qui c'era la SCACCHIERA, ed è uscita col rebranding: è l'araldica
              del Comune, e come firma di una piattaforma che il Comune non è
              sarebbe il travestimento che `direzione-prodotto.md` §1.4 vieta.

              Non è stata sostituita da un altro motivo, ed è una scelta: le
              fasce romaniche vivono a contrasto minimo (3,5%, `DESIGN.md` §3)
              e sopra il mesh quel valore non si legge come ornamento — si
              legge come un blocco di caricamento rimasto lì. Un motivo che
              sembra un guasto è peggio di nessun motivo, e il pannello ha già
              due cose che parlano: il marchio e la materia del mesh.

              Il marchio sta poi su una PASTIGLIA PIENA e non direttamente sul
              mesh, e anche questa è una misura: il rosso del «.app» sopra gli
              stop di `cool` fa **2,45:1** sul chiaro e **1,17:1** sullo scuro
              — sotto il 3:1 che vale perfino per il testo grande. È
              `DESIGN.md` §8 («sotto una superficie mesh il testo minuto non ci
              va») e P2 della ricognizione: il payload si legge sul pieno, e il
              marchio è payload, non ornamento. */}
          {/* `self-start`: il pannello è un flex column, e senza questo la
              pastiglia si stira a tutta colonna e smette di sembrare un
              marchio. */}
          <span className="inline-flex self-start rounded-pill bg-surface px-4 py-2.5 shadow-sm">
            <Wordmark />
          </span>

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
          <Link href="/" className="lg:hidden">
            <Wordmark />
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
