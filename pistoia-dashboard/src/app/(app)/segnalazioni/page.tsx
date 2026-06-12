import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getReports, getReportStats } from "@/lib/data/reports";
import { getNeighborhoods } from "@/lib/data/neighborhoods";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Stat } from "@/components/ui/stat";
import { ReportCard } from "@/components/community/report-card";
import { ReportComposer } from "@/components/community/report-composer";
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

  const [reports, stats, neighborhoods] = await Promise.all([
    getReports(user.id, { category: categoria, mine }),
    getReportStats(),
    getNeighborhoods(),
  ]);

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

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Aperte" value={stats.open} />
        <Stat label="Risolte" value={stats.resolved} />
        <Stat label="Totale" value={stats.total} />
      </div>

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
        "whitespace-nowrap rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-transparent bg-teal-soft text-teal"
          : "border-border-strong bg-surface text-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
