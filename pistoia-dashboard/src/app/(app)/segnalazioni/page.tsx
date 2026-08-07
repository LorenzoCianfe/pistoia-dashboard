import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getReports, getReportStats, getReportActivity } from "@/lib/data/reports";
import { getNeighborhoods } from "@/lib/data/neighborhoods";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { DotScatterTimeline } from "@/components/signature/dot-scatter-timeline";
import { ReportCard } from "@/components/segnalazioni/report-card";
import { ReportComposer } from "@/components/segnalazioni/report-composer";
import { QuickReport } from "@/components/segnalazioni/quick-report";
import { REPORT_CATEGORY, reportCategory } from "@/lib/community";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Segnalazioni" };

export default async function SegnalazioniPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; filtro?: string }>;
}) {
  const { categoria, filtro } = await searchParams;
  const user = await requireUser();
  const mine = filtro === "mie";

  const [reports, stats, neighborhoods, attivita] = await Promise.all([
    getReports(user.id, { category: categoria, mine }),
    getReportStats(),
    getNeighborhoods(),
    // Dodici settimane e non otto: a otto la finestra tagliava fuori quasi
    // tutto lo storico e il grafico si presentava piatto, che è il modo più
    // rapido per far sembrare rotto un componente che funziona.
    getReportActivity(12),
  ]);

  /*
    La timeline a punti codifica tre grandezze insieme (DESIGN.md §8):
    altezza = quante ne sono arrivate, diametro = quante ne sono state chiuse,
    colore = se la settimana è andata in pari. Si preferisce alla spezzata
    perché le segnalazioni sono eventi discreti: una linea suggerirebbe una
    continuità che nei dati non c'è.
  */
  const maxRisolte = Math.max(...attivita.risolte, 1);
  const punti = attivita.labels.map((label, i) => ({
    label,
    value: attivita.ricevute[i],
    weight: attivita.risolte[i] / maxRisolte,
    status:
      attivita.risolte[i] >= attivita.ricevute[i] && attivita.ricevute[i] > 0
        ? ("good" as const)
        : ("neutral" as const),
  }));
  const settimaneInPari = punti.filter((p) => p.status === "good").length;
  const settimaneAttive = punti.filter((p) => p.value > 0).length;
  // Il titolo dice la conclusione (DESIGN.md §9) — ma solo se i dati ne
  // reggono una. Con una o due settimane di attività qualunque tendenza
  // sarebbe inventata, e su una piattaforma pubblica non si afferma per riempire.
  const conclusione =
    settimaneAttive < 2
      ? "Poche segnalazioni in queste settimane"
      : settimaneInPari * 2 >= settimaneAttive
        ? "La città sta stando al passo"
        : "Arrivano più segnalazioni di quante se ne chiudano";

  const chips = [
    { label: "Tutte", href: "/segnalazioni", active: !categoria && !mine },
    { label: "Le mie", href: "/segnalazioni?filtro=mie", active: mine },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Agisci sulla tua città"
        title="Segnalazioni"
        description="Segnala un problema sul territorio e segui lo stato dell'intervento. «Anche io» evita i doppioni e misura la priorità."
        icon={<Megaphone size={22} />}
      />

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">{conclusione}</h2>
            <p className="mt-1 text-sm text-muted">
              Ogni punto è una settimana: più in alto sta, più segnalazioni sono
              arrivate; più è grande, più ne sono state chiuse. I punti verdi
              sono le settimane chiuse in pari.
            </p>
          </div>
          <div className="flex gap-4 text-xs">
            <span>
              <span className="block font-display text-2xl font-semibold tabular-nums leading-none">
                {stats.open}
              </span>
              <span className="mt-1 block text-muted-2">aperte</span>
            </span>
            <span>
              <span className="block font-display text-2xl font-semibold tabular-nums leading-none">
                {stats.resolved}
              </span>
              <span className="mt-1 block text-muted-2">risolte</span>
            </span>
            <span>
              <span className="block font-display text-2xl font-semibold tabular-nums leading-none">
                {stats.total}
              </span>
              <span className="mt-1 block text-muted-2">in tutto</span>
            </span>
          </div>
        </div>

        <DotScatterTimeline
          className="mt-4"
          points={punti}
          title={`Segnalazioni ricevute per settimana nelle ultime ${punti.length} settimane, con quante ne sono state chiuse`}
          caption={
            settimaneAttive === 0
              ? "Nessuna segnalazione ricevuta nelle ultime 12 settimane."
              : `${settimaneInPari} ${settimaneInPari === 1 ? "settimana" : "settimane"} su ${settimaneAttive} con segnalazioni chiuse in pari o in attivo.`
          }
        />
      </Card>

      {/* Flusso rapido mobile-first (A2 §4) */}
      <QuickReport
        neighborhoods={neighborhoods}
        defaultNeighborhoodId={user.neighborhoodId}
      />

      <Card className="p-0">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full gradient-teal-viola text-white">
                <Plus size={18} />
              </span>
              <div>
                <p className="font-semibold">Nuova segnalazione</p>
                <p className="text-xs text-muted">Buche, illuminazione, rifiuti, verde…</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-teal group-open:hidden">Apri</span>
            <span className="hidden text-sm font-semibold text-muted group-open:inline">Chiudi</span>
          </summary>
          <div className="border-t border-border p-5 sm:p-6">
            <ReportComposer
              neighborhoods={neighborhoods}
              defaultNeighborhoodId={user.neighborhoodId}
            />
          </div>
        </details>
      </Card>

      {/* Filters */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {chips.map((c) => (
          <FilterChip key={c.href} href={c.href} active={c.active}>
            {c.label}
          </FilterChip>
        ))}
        {Object.keys(REPORT_CATEGORY).map((key) => (
          <FilterChip
            key={key}
            href={`/segnalazioni?categoria=${key}`}
            active={categoria === key}
          >
            {reportCategory(key).label}
          </FilterChip>
        ))}
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="Nessuna segnalazione qui"
          description="Con questi filtri non c'è ancora nulla. Sii il primo a segnalare un problema del tuo quartiere."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        // `min-h-11`: i 44px di `DESIGN.md` §11.6. Erano 34, e l'eccezione
        // della spaziatura non li copriva — la riga va a capo su `sm:flex-wrap`
        // e le due file si avvicinano abbastanza da toccarsi.
        "inline-flex min-h-11 items-center whitespace-nowrap rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-transparent bg-teal-soft text-teal"
          : "border-border-strong bg-surface text-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
