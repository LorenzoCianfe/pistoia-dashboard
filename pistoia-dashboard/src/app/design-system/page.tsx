import type { Metadata } from "next";

import { Sparkline } from "@/components/charts/sparkline";
import { DisplayNumber } from "@/components/signature/display-number";
import { DotScatterTimeline } from "@/components/signature/dot-scatter-timeline";
import { MeshSurface } from "@/components/signature/mesh-surface";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/**
 * Vetrina interna del design system.
 *
 * Non è una pagina di prodotto: serve a rivedere token e componenti isolati
 * dai dati, nei due temi, prima di portarli nelle rotte reali. Esclusa
 * dall'indicizzazione.
 */

const SWATCHES: { name: string; varName: string; note: string }[] = [
  { name: "accent", varName: "--color-accent", note: "azione, link, focus" },
  { name: "highlight", varName: "--highlight", note: "solo sfondo chip/pallini" },
  { name: "error / stemma", varName: "--color-error", note: "urgenza, brand" },
  { name: "success", varName: "--color-success", note: "risolto" },
  { name: "amber", varName: "--amber", note: "in attesa" },
  { name: "viola", varName: "--viola", note: "partecipazione" },
];

const SURFACES: { name: string; varName: string }[] = [
  { name: "body", varName: "--color-background-body" },
  { name: "surface", varName: "--color-background-surface" },
  { name: "muted", varName: "--color-background-muted" },
  { name: "border", varName: "--color-border" },
];

const SCATTER = [
  { label: "1 set", value: 12, weight: 0.3, status: "neutral" as const },
  { label: "8 set", value: 19, weight: 0.5, status: "neutral" as const },
  { label: "15 set", value: 31, weight: 0.8, status: "warn" as const },
  { label: "22 set", value: 24, weight: 0.6, status: "neutral" as const },
  { label: "29 set", value: 41, weight: 1, status: "bad" as const },
  { label: "6 ott", value: 22, weight: 0.55, status: "neutral" as const },
  { label: "13 ott", value: 14, weight: 0.35, status: "good" as const },
  { label: "20 ott", value: 9, weight: 0.25, status: "good" as const },
];

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {hint ? <p className="mb-5 mt-1 text-sm text-muted">{hint}</p> : <div className="mb-5" />}
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <header className="mb-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
          Uso interno
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Design system</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Token e componenti isolati dai dati. Da rivedere nei due temi e in
          modalità semplice prima di portare qualcosa nelle rotte reali.
        </p>
      </header>

      <Section title="Colore" hint="La semantica non è negoziabile: vedi DESIGN.md §4.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SWATCHES.map((s) => (
            <div key={s.name} className="card p-4">
              <div
                className="mb-3 h-14 w-full rounded-[var(--radius-inner)]"
                style={{ background: `var(${s.varName})` }}
              />
              <p className="text-sm font-medium">{s.name}</p>
              <p className="text-xs text-muted-2">{s.note}</p>
              <code className="mt-1 block font-mono text-[10px] text-muted-2">
                {s.varName}
              </code>
            </div>
          ))}
        </div>

        <div className="mt-4 card p-4">
          <p className="mb-3 text-sm font-medium">Superfici</p>
          <div className="flex flex-wrap gap-3">
            {SURFACES.map((s) => (
              <div key={s.name} className="text-center">
                <div
                  className="h-12 w-24 rounded-[var(--radius-inner)] border border-[var(--border)]"
                  style={{ background: `var(${s.varName})` }}
                />
                <p className="mt-1 text-[11px] text-muted-2">{s.name}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 rounded-[var(--radius-inner)] bg-[var(--amber-soft)] p-3 text-xs text-foreground">
          <strong>Lime:</strong> su bianco fa 1,1:1. È ammesso solo come sfondo,
          con testo <code className="font-mono">--highlight-ink</code> sopra
          (15,8:1). Non esiste <code className="font-mono">text-highlight</code>.
        </p>
      </Section>

      <Section
        title="Cifra display"
        hint="Una sola per schermata. La gerarchia viene dalla scala: label 11px contro cifra 88px, e il peso va al contrario (cifra 300, label 600)."
      >
        <div className="card p-8">
          <DisplayNumber
            label="Spesa programmata per il 2026"
            value={129}
            unit="mln €"
            scale={{
              min: 98,
              max: 148,
              label: "129 milioni, in un intervallo storico da 98 a 148",
            }}
            delta={{ value: 3.2, period: "rispetto al 2025" }}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card p-6">
            <DisplayNumber
              label="Avanzamento PNRR"
              value={71}
              unit="%"
              delta={{ value: 6, period: "ultimi 30 giorni" }}
            />
          </div>
          <div className="card p-6">
            <DisplayNumber
              label="Segnalazioni chiuse"
              value={1204}
              sparkline={
                <Sparkline
                  points={[12, 19, 31, 24, 41, 22, 14, 9]}
                  label="Chiuse per settimana"
                />
              }
            />
          </div>
        </div>

        <p className="mt-3 rounded-[var(--radius-inner)] bg-[var(--surface-2)] p-3 text-xs text-muted">
          Il corredo (unità, scala, delta, sparkline) è <strong>tutto
          opzionale</strong>. Va aggiunto solo quando dice qualcosa: un numero
          circondato da quattro decorazioni non è più leggibile di uno nudo.
        </p>
      </Section>

      <Section
        title="Superficie mesh"
        hint="La tinta codifica un dato: verde sano, ambra attenzione, rosso critico. Il neutro è «cool»."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["good", "warn", "bad", "cool"] as const).map((tone) => (
            <MeshSurface key={tone} tone={tone} className="aspect-[4/3] p-5">
              <p className="text-sm text-white/85">
                {tone === "good"
                  ? "In linea"
                  : tone === "warn"
                    ? "In ritardo"
                    : tone === "bad"
                      ? "Critico"
                      : "Neutro"}
              </p>
              <div className="mt-6 text-white">
                <DisplayNumber
                  size="md"
                  value={
                    tone === "good"
                      ? 92
                      : tone === "warn"
                        ? 58
                        : tone === "bad"
                          ? 24
                          : 50
                  }
                  unit="%"
                />
              </div>
            </MeshSurface>
          ))}
        </div>
      </Section>

      <Section
        title="Timeline a punti"
        hint="Attraversabile da tastiera: fai focus e usa le frecce. Tabella equivalente sempre presente."
      >
        <div className="card p-6">
          <DotScatterTimeline
            title="Le segnalazioni aperte stanno calando da ottobre"
            caption="Diametro = intensità · colore = stato. Dati dimostrativi."
            points={SCATTER}
          />
        </div>
      </Section>

      <Section title="Elevazione e raggi">
        <div className="flex flex-wrap gap-4">
          <div className="card card-hover p-6">
            <p className="text-sm">card + card-hover</p>
            <p className="text-xs text-muted-2">radius-container · 32px</p>
          </div>
          <div className="rounded-[var(--radius-inner)] bg-[var(--surface)] p-6 shadow-[var(--elev-rest)]">
            <p className="text-sm">radius-inner</p>
            <p className="text-xs text-muted-2">10,5px</p>
          </div>
          <div className="rounded-[var(--radius-full)] bg-[var(--surface)] px-6 py-4 shadow-[var(--elev-rest)]">
            <p className="text-sm">radius-full</p>
          </div>
        </div>
      </Section>

      <Section title="Motivi identitari" hint="L'unico vocabolario decorativo ammesso (DESIGN.md §2).">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card overflow-hidden p-0">
            <div className="bande-romaniche h-24" />
            <p className="p-3 text-xs text-muted">Fasce romaniche</p>
          </div>
          {/* Qui c'era la SCACCHIERA come motivo identitario. È uscita col
              battesimo (DESIGN.md §3, 2026-08-12) perché evoca lo stemma, e
              il filo rosso che l'aveva sostituita è uscito a sua volta la sera
              stessa: messo a confronto in quattro varianti sulla card vera,
              nessuna convinceva. Un ornamento che non risolve niente non si
              rimpiazza — si toglie. Restano le fasce e il rosso come colore. */}
          <div className="card flex flex-col justify-between p-0">
            <div className="flex-1" />
            <hr className="divider-bande mx-3" />
            <p className="p-3 text-xs text-muted">Separatore a fasce</p>
          </div>
        </div>
      </Section>
    </main>
  );
}
