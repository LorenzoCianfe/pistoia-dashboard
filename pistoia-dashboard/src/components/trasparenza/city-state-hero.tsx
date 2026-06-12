import Link from "next/link";
import { Megaphone, HardHat, Lightbulb, Siren, ArrowRight } from "lucide-react";
import type { CityState } from "@/lib/data/citystate";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/sparkline";
import { formatNumber } from "@/lib/format";

/*
  "Stato della città" (O3, 🆕): il colpo d'occhio in cima alla home.
  Quattro indicatori sintetici con sparkline sulle segnalazioni — il filo
  rosso identitario è la scacchiera dello stemma in testa alla card.
*/

function Indicator({
  icon: Icon,
  label,
  value,
  detail,
  href,
  spark,
}: {
  icon: typeof Megaphone;
  label: string;
  value: string;
  detail?: string;
  href: string;
  spark?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 items-start gap-3 rounded-[var(--radius-sm)] p-3 transition-colors hover:bg-surface-2/70"
    >
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
        <span className="mt-0.5 flex items-end justify-between gap-2">
          <span className="font-display text-2xl font-semibold leading-none tracking-tight">
            {value}
          </span>
          {spark}
        </span>
        {detail ? (
          <span className="mt-1 block truncate text-xs text-muted-2">{detail}</span>
        ) : null}
      </span>
    </Link>
  );
}

export function CityStateHero({ state }: { state: CityState }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="scacchiera h-1.5 w-full opacity-60" aria-hidden />
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold tracking-tight">
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
        <div className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
          <Indicator
            icon={Megaphone}
            label="Risolte (8 settimane)"
            value={formatNumber(state.reports.resolvedLast8w)}
            detail={`${formatNumber(state.reports.open)} segnalazioni aperte`}
            href="/segnalazioni"
            spark={
              <Sparkline
                points={state.reports.resolvedSeries}
                color="green"
                label="Segnalazioni risolte per settimana, ultime 8 settimane"
                className="shrink-0"
              />
            }
          />
          <Indicator
            icon={HardHat}
            label="Cantieri in corso"
            value={formatNumber(state.opere.inCorso)}
            detail={`avanzamento medio ${state.opere.avgProgress}%`}
            href="/opere"
          />
          <Indicator
            icon={Lightbulb}
            label="Proposte attive"
            value={formatNumber(state.proposals.active)}
            detail="in raccolta firme o valutazione"
            href="/proposte"
          />
          <Indicator
            icon={Siren}
            label="Avvisi attivi"
            value={formatNumber(state.notices.active)}
            detail={state.notices.active > 0 ? "leggi cosa cambia per te" : "nessuna emergenza"}
            href="/avvisi"
          />
        </div>
      </div>
    </Card>
  );
}
