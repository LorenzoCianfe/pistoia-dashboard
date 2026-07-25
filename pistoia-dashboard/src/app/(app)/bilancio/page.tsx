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
import { SankeyFlow, type SankeyNode } from "@/components/charts/sankey-flow";
import { DisplayNumber } from "@/components/signature/display-number";
import { ScrollTold, ScrollStep } from "@/components/signature/scroll-told";
import { ProgressBar } from "@/components/ui/progress-bar";
import { GlossaryTip } from "@/components/trasparenza/glossary-tip";
import { formatEuro, formatEuroCompact, monthLabel } from "@/lib/format";

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
  const investimenti = by.months.reduce((s, m) => s + m.investimenti, 0);

  /*
    Il sankey si ferma a DUE stadi, e non è una semplificazione estetica: il
    modello dati non ha la scomposizione delle entrate per fonte né il livello
    "programmi" sotto le missioni. Un terzo stadio richiederebbe di inventare
    numeri su una piattaforma pubblica. Questi due, invece, tornano esatti:
    entrate = spesa + avanzo, e la somma delle missioni è la spesa.
  */
  const colonne: SankeyNode[][] = [
    [
      {
        id: "entrate",
        label: "Entrate previste",
        value: by.totalEntrate,
        display: formatEuroCompact(by.totalEntrate),
      },
    ],
    [
      {
        id: "spesa",
        label: "Spesa programmata",
        value: by.totalSpesa,
        display: formatEuroCompact(by.totalSpesa),
      },
      {
        id: "avanzo",
        label: by.avanzo >= 0 ? "Avanzo" : "Disavanzo",
        value: Math.abs(by.avanzo),
        display: formatEuroCompact(Math.abs(by.avanzo)),
        // Il rosso dello stemma solo sugli scostamenti negativi (DESIGN.md §9):
        // un avanzo positivo è una quantità, non un allarme e nemmeno un merito.
        tone: by.avanzo >= 0 ? "flow" : "bad",
      },
    ],
    by.categories.map((c) => ({
      id: c.id,
      label: c.label,
      value: c.amount,
      display: formatEuroCompact(c.amount),
    })),
  ];

  const collegamenti = [
    {
      from: "entrate",
      to: "spesa",
      value: by.totalSpesa,
      display: formatEuroCompact(by.totalSpesa),
    },
    {
      from: "entrate",
      to: "avanzo",
      value: Math.abs(by.avanzo),
      display: formatEuroCompact(Math.abs(by.avanzo)),
    },
    ...by.categories.map((c) => ({
      from: "spesa",
      to: c.id,
      value: c.amount,
      display: formatEuroCompact(c.amount),
    })),
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="I soldi della città"
        title="Bilancio 2026"
        description="Dove vengono programmate e spese le risorse del Comune di Pistoia."
        icon={<Wallet size={22} />}
      />

      {/* Apertura a bento (DISCOVERY G5): la cifra protagonista da una parte,
          gli indicatori di avanzamento dall'altra. */}
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card className="flex flex-col justify-between gap-5">
          {/*
            L'unica cifra display della schermata (DESIGN.md §8). Nuda di
            proposito: la scala a tacche vorrebbe un intervallo reale — un
            minimo e un massimo storici — che il modello dati non ha, e una
            scala inventata è peggio di nessuna scala.
          */}
          <DisplayNumber
            value={milioni}
            unit="mln €"
            label="Spesa programmata per il 2026"
          />
          <div>
            <p className="text-sm text-muted-2 tabular-nums">
              {formatEuro(by.totalSpesa)}
            </p>
            {/* Glossario in linea (A2 §27, O3): i termini tecnici si spiegano
                dove si incontrano, senza cambiare pagina. */}
            <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
              Parole difficili?{" "}
              <GlossaryTip slug="riscossione">Riscossione</GlossaryTip>,{" "}
              <GlossaryTip slug="impegni">impegni</GlossaryTip>,{" "}
              <GlossaryTip slug="pnrr">PNRR</GlossaryTip> e{" "}
              <GlossaryTip slug="avanzo">avanzo</GlossaryTip> sono spiegate nel
              glossario: tocca una parola sottolineata.
            </p>
          </div>
        </Card>

        {/* `flex-wrap` non è decorativo: gli anelli sono larghi 132px fissi e a
            360px — la viewport minima dichiarata — tre in fila spingerebbero la
            pagina di lato. */}
        <Card className="flex flex-wrap items-center justify-around gap-4">
          {/* Tre anelli, una sola tinta (DESIGN.md §4): sono tre percentuali
              dello stesso tipo, non tre categorie. A distinguerle è l'etichetta,
              che sta lì sotto — non serve un colore diverso per ciascuna. */}
          <RingGauge value={by.riscossione} label="Riscossione entrate" delay={0.1} />
          <RingGauge value={by.impegni} label="Impegni di spesa" delay={0.25} />
          <RingGauge value={by.pnrr} label="Avanzamento PNRR" delay={0.4} />
        </Card>
      </div>

      {/* L'unica sezione narrata dell'intera piattaforma (DESIGN.md §8): il
          bilancio è il solo posto dove c'è un ragionamento da accompagnare. */}
      <Card>
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Dove scorrono i soldi
        </h2>
        <p className="mt-1 text-sm text-muted">
          Tre passaggi per capire il bilancio, poi il flusso completo.
        </p>

        <ScrollTold className="mt-2">
          <ScrollStep>
            <Passo
              eyebrow="Primo passaggio"
              figura={formatEuroCompact(by.totalEntrate)}
            >
              Ogni anno il Comune scrive in anticipo quanto pensa di incassare e
              quanto pensa di spendere. Per il 2026 le entrate previste sono
              queste.
            </Passo>
          </ScrollStep>

          <ScrollStep>
            <Passo
              eyebrow="Secondo passaggio"
              figura={formatEuroCompact(by.totalSpesa)}
            >
              È la parte già destinata a missioni precise prima ancora che
              l&apos;anno cominci. Di questa, {formatEuroCompact(investimenti)}{" "}
              sono investimenti: opere che restano alla città, non spesa
              corrente.
            </Passo>
          </ScrollStep>

          <ScrollStep>
            <Passo
              eyebrow="Terzo passaggio"
              figura={formatEuroCompact(Math.abs(by.avanzo))}
            >
              È l&apos;{by.avanzo >= 0 ? "avanzo" : "disavanzo"}: la differenza
              fra ciò che entra e ciò che è stato programmato. Non è un
              risparmio — è la parte ancora da destinare.
            </Passo>
          </ScrollStep>
        </ScrollTold>

        {/* Il diagramma sta FUORI dagli step: dentro sbiadirebbe al 35% appena
            si continua a scorrere, e un grafico che si vuole leggere non può
            dipendere da dove si è fermata la rotella. */}
        <div className="mt-2 border-t border-border pt-6">
          <h3 className="text-base font-semibold">
            E i {milioni} milioni programmati si dividono così
          </h3>
          <p className="mt-1 text-sm text-muted">
            Lo spessore di ogni nastro è l&apos;importo. Passa sopra una voce, o
            usa le frecce da tastiera, per leggerne il valore.
          </p>

          <SankeyFlow
            className="mt-4"
            title={`Flusso del bilancio 2026: ${formatEuroCompact(by.totalEntrate)} di entrate si dividono fra spesa programmata e avanzo, e la spesa si distribuisce fra ${by.categories.length} missioni`}
            captions={["Entrate", "Destinazione", "Missioni di spesa"]}
            columns={colonne}
            links={collegamenti}
            height={440}
          />

          <details className="group mt-4">
            <summary className="w-fit cursor-pointer list-none text-sm font-medium text-teal transition-colors hover:text-teal-strong">
              <span className="group-open:hidden">
                Vedi le proporzioni e l&apos;elenco
              </span>
              <span className="hidden group-open:inline">Nascondi</span>
            </summary>

            {/* Lettura alternativa, non concorrente: a riposo sullo schermo c'è
                un grafico solo. Il treemap risponde a "quanto pesa una missione
                rispetto alle altre", il sankey a "da dove viene e dove va". */}
            <Treemap
              className="mt-4"
              ariaLabel={`Spesa 2026 per missione, ${milioni} milioni di euro in totale`}
              data={by.categories.map((c) => ({
                id: c.id,
                label: c.label,
                value: c.amount,
              }))}
              format={formatEuroCompact}
            />

            <ul className="mt-5 space-y-4">
              {by.categories.map((c, i) => (
                <li key={c.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      {/* Stessa rampa del treemap, resa con l'opacità: un
                          pallino di 10px in una tinta smorta sparirebbe. */}
                      <span
                        className="size-2.5 rounded-full bg-[var(--color-accent)]"
                        style={{ opacity: Math.max(0.9 - i * 0.12, 0.35) }}
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
                    delay={i * 0.08}
                    height={8}
                  />
                </li>
              ))}
            </ul>
          </details>
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
            <Legend color="var(--teal)" label="Entrate" />
            <Legend color="var(--viola)" label="Spese" />
            <Legend color="var(--green)" label="Investimenti" />
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
            /* La freccia porta il segno, non di nuovo l'importo: ripetere
               "6,0 mln €" a due centimetri da sé stesso non aggiunge nulla. */
            trend={{
              value: by.avanzo >= 0 ? "in attivo" : "in passivo",
              direction: by.avanzo >= 0 ? "up" : "down",
            }}
            hint="Differenza entrate / spese"
          />
        </div>
      </Card>

      <SourceBadge source={sourceInfo("bilancio", by)} />
    </div>
  );
}

/** Un passaggio della narrazione: etichetta, cifra media, frase. */
function Passo({
  eyebrow,
  figura,
  children,
}: {
  eyebrow: string;
  figura: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
        {eyebrow}
      </p>
      {/*
        Peso 300 come la cifra display, ma a un terzo della scala: eco della
        firma, non un secondo protagonista. La regola "una sola cifra display
        per schermata" resta intatta perché la protagonista è in cima.
      */}
      <p className="font-display mt-1.5 text-3xl font-light tracking-tight tabular-nums sm:text-4xl">
        {figura}
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{children}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted">
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
