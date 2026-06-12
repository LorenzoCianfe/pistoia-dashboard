import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { getBudgetYear } from "@/lib/data/budget";
import { sourceInfo } from "@/lib/sources";
import { SourceBadge } from "@/components/ui/source-badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Stat } from "@/components/ui/stat";
import { RingGauge } from "@/components/charts/ring-gauge";
import { LineChart } from "@/components/charts/line-chart";
import { Treemap } from "@/components/charts/treemap";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatEuro, formatEuroCompact, monthLabel } from "@/lib/format";
import { accent } from "@/lib/colors";

export const metadata: Metadata = { title: "Bilancio" };

export default async function BilancioPage() {
  const by = await getBudgetYear(2026);
  if (!by) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Dati di bilancio non ancora disponibili
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Questa sezione si riempirà appena i dati del Comune saranno
            pubblicati. Torna a trovarci presto.
          </p>
        </div>
      </div>
    );
  }

  const milioni = Math.round(by.totalSpesa / 1_000_000);
  const maxCategory = Math.max(...by.categories.map((c) => c.amount), 1);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="I soldi della città"
        title="Bilancio 2026"
        description="Dove vengono programmate e spese le risorse del Comune di Pistoia."
        icon={<Wallet size={22} />}
      />

      {/* Hero: total + the three rings */}
      <Card className="overflow-hidden">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1.4fr]">
          <div>
            <p className="text-sm font-medium text-muted">
              Spesa programmata per il 2026
            </p>
            <p className="font-display mt-2 flex items-baseline gap-2 text-5xl font-semibold tracking-tight sm:text-6xl">
              <AnimatedNumber value={milioni} />
              <span className="text-2xl font-medium text-muted">mln €</span>
            </p>
            <p className="mt-2 text-sm text-muted-2">{formatEuro(by.totalSpesa)}</p>
          </div>

          <div className="flex flex-wrap items-center justify-around gap-4">
            <RingGauge value={by.riscossione} color="teal" label="Riscossione entrate" delay={0.1} />
            <RingGauge value={by.impegni} color="viola" label="Impegni di spesa" delay={0.25} />
            <RingGauge value={by.pnrr} color="amber" label="Avanzamento PNRR" delay={0.4} />
          </div>
        </div>
      </Card>

      {/* Andamento annuale */}
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Andamento 2026</h2>
            <p className="text-sm text-muted">
              Entrate, spese e investimenti mese per mese.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-medium">
            <Legend color="teal" label="Entrate" />
            <Legend color="viola" label="Spese" />
            <Legend color="green" label="Investimenti" />
          </div>
        </div>

        <LineChart
          height={240}
          title="Andamento mensile 2026 di entrate, spese e investimenti in milioni di euro"
          labels={by.months.map((m) => monthLabel(m.month))}
          series={[
            { name: "Entrate", color: "teal", points: by.months.map((m) => m.entrate / 1e6) },
            { name: "Spese", color: "viola", points: by.months.map((m) => m.spese / 1e6) },
            { name: "Investimenti", color: "green", points: by.months.map((m) => m.investimenti / 1e6) },
          ]}
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat
            label="Entrate totali"
            value={formatEuroCompact(by.totalEntrate)}
            hint="Previste per l'anno"
          />
          <Stat
            label="Spese totali"
            value={formatEuroCompact(by.totalSpesa)}
            hint="Programmate per l'anno"
          />
          <Stat
            label="Avanzo"
            value={formatEuroCompact(by.avanzo)}
            trend={{
              value: formatEuroCompact(by.avanzo),
              direction: by.avanzo >= 0 ? "up" : "down",
            }}
            hint="Differenza entrate / spese"
          />
        </div>
      </Card>

      {/* Spesa per missione: la treemap fa vedere le proporzioni a colpo
          d'occhio; l'elenco resta come lettura alternativa. */}
      <Card>
        <h2 className="text-base font-semibold">Dove vanno i {milioni} milioni</h2>
        <p className="text-sm text-muted">
          Ogni riquadro è una missione di spesa: più è grande, più risorse riceve.
        </p>
        <Treemap
          className="mt-5"
          ariaLabel={`Spesa 2026 per missione, ${milioni} milioni di euro in totale`}
          data={by.categories.map((c) => ({
            id: c.id,
            label: c.label,
            value: c.amount,
            color: c.color,
          }))}
          format={formatEuroCompact}
        />
        <details className="group mt-4">
          <summary className="cursor-pointer text-sm font-medium text-teal transition-colors hover:text-teal-strong">
            <span className="group-open:hidden">Vedi come elenco</span>
            <span className="hidden group-open:inline">Nascondi l&apos;elenco</span>
          </summary>
          <ul className="mt-4 space-y-4">
            {by.categories.map((c, i) => (
              <li key={c.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: accent(c.color).fg }}
                    />
                    {c.label}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatEuroCompact(c.amount)}
                  </span>
                </div>
                <ProgressBar
                  value={(c.amount / maxCategory) * 100}
                  gradient={false}
                  color={c.color}
                  delay={i * 0.08}
                  height={8}
                />
              </li>
            ))}
          </ul>
        </details>
      </Card>

      <SourceBadge source={sourceInfo("bilancio", by)} />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted">
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: accent(color).fg }}
      />
      {label}
    </span>
  );
}
