import Link from "next/link";
import { HardHat, Lightbulb, Siren, ArrowRight } from "lucide-react";
import type { CityState } from "@/lib/data/citystate";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/sparkline";
import { DisplayNumber } from "@/components/signature/display-number";
import {
  MeshSurface,
  toneFromPercent,
  type MeshTone,
} from "@/components/signature/mesh-surface";
import { formatNumber } from "@/lib/format";

/*
  "Stato della città" (O3): il colpo d'occhio in cima alla home, ridisegnato a
  bento nell'ondata 6.

  Il perno è il tasso di risoluzione delle segnalazioni: è la cifra display
  dell'intera schermata (una sola per schermata, DESIGN.md §8) ed è lo stesso
  numero che decide la tinta della superficie mesh accanto. Non è un mesh scelto
  perché sta bene: `toneFromPercent` lo deriva dal dato, quindi il verde
  significa davvero "la città chiude le segnalazioni".

  Perché la cifra sta sul VETRO e non sopra il mesh, che sarebbe più
  spettacolare: sulle tinte mesh nessun inchiostro passa l'AA in tutti e quattro
  i toni — il bianco sparisce sulle tinte chiare (`good` e `warn` hanno stop
  attorno a #7FD8CF e #F3C969), lo scuro non arriva a 4,5:1 su `bad` (#C2334F)
  né su `cool`. Sopra il mesh resta quindi solo testo GRANDE, per cui basta 3:1.
  Il vetro invece è verificato a 16,8:1 in chiaro e 16,0:1 in scuro.
*/

const STATO: Record<MeshTone, { parola: string; spiega: string }> = {
  good: { parola: "In linea", spiega: "la gran parte delle segnalazioni si chiude" },
  warn: { parola: "A rilento", spiega: "più di una su tre resta aperta" },
  bad: { parola: "In affanno", spiega: "la maggior parte resta aperta" },
  cool: { parola: "Nessun dato", spiega: "non ci sono ancora segnalazioni" },
};

export function CityStateHero({ state }: { state: CityState }) {
  const rate = state.reports.resolvedRate;
  const tone = rate === null ? "cool" : toneFromPercent(rate);
  const stato = STATO[tone];

  return (
    <section aria-labelledby="stato-citta" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="stato-citta"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Stato della città
        </h2>
        <Link
          href="/digest"
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal hover:underline"
        >
          Report del mese
          <ArrowRight size={13} aria-hidden />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Cella protagonista: la cifra display della schermata. */}
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="flex h-full flex-col justify-between gap-5 p-5 sm:p-6">
            {rate === null ? (
              <p className="text-sm text-muted">
                Non ci sono ancora segnalazioni: questo spazio si riempirà con
                la prima.
              </p>
            ) : (
              <DisplayNumber
                value={rate}
                unit="%"
                label="Segnalazioni risolte in città"
              />
            )}

            <div className="flex flex-wrap items-end justify-between gap-4">
              <p className="text-sm text-muted">
                {formatNumber(state.reports.resolvedTotal)} risolte su{" "}
                {formatNumber(state.reports.total)} ·{" "}
                <Link href="/segnalazioni" className="font-semibold text-teal hover:underline">
                  {formatNumber(state.reports.open)} ancora aperte
                </Link>
              </p>
              <Sparkline
                points={state.reports.resolvedSeries}
                color="green"
                label="Segnalazioni risolte per settimana, ultime 8 settimane"
                className="shrink-0"
              />
            </div>
          </div>
        </Card>

        {/* Cella mesh: la tinta È il tasso di risoluzione, non un ornamento. */}
        <div className="flex flex-col gap-2">
          <MeshSurface
            as="article"
            tone={tone}
            className="flex min-h-[150px] flex-1 items-end p-5 sm:p-6"
          >
            {/*
              Sul mesh va SOLO testo grande, e il calcolo è questo: l'inchiostro
              scuro del sistema su `--mesh-bad-b` (#C2334F, lo stop peggiore) fa
              3,29:1. Basta per un 26px semibold, che per WCAG è testo grande e
              richiede 3:1; non basterebbe per un corpo da 16px, che ne chiede
              4,5. Per questo la frase di spiegazione sta FUORI dalla superficie,
              sulla tela, dove il contrasto è quello verificato del tema.
            */}
            <p className="text-[26px] font-semibold leading-tight tracking-tight">
              {stato.parola}
            </p>
          </MeshSurface>
          <p className="px-1 text-xs leading-snug text-muted-2">{stato.spiega}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Tessera
          icon={HardHat}
          label="Cantieri in corso"
          value={formatNumber(state.opere.inCorso)}
          detail={`avanzamento medio ${state.opere.avgProgress}%`}
          href="/opere"
        />
        <Tessera
          icon={Lightbulb}
          label="Proposte attive"
          value={formatNumber(state.proposals.active)}
          detail="in raccolta firme o valutazione"
          href="/proposte"
        />
        <Tessera
          icon={Siren}
          label="Avvisi attivi"
          value={formatNumber(state.notices.active)}
          detail={
            state.notices.active > 0
              ? "leggi cosa cambia per te"
              : "nessuna emergenza"
          }
          href="/avvisi"
        />
      </div>
    </section>
  );
}

function Tessera({
  icon: Icon,
  label,
  value,
  detail,
  href,
}: {
  icon: typeof HardHat;
  label: string;
  value: string;
  detail: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card hover className="flex h-full items-start gap-3 p-4">
        <span
          className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-teal-soft text-teal"
          aria-hidden
        >
          <Icon size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            {label}
          </span>
          <span className="font-display mt-0.5 block text-2xl font-semibold leading-none tracking-tight tabular-nums">
            {value}
          </span>
          <span className="mt-1 block truncate text-xs text-muted-2">{detail}</span>
        </span>
      </Card>
    </Link>
  );
}
