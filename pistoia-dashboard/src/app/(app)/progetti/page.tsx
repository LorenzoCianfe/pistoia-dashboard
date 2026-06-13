import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Landmark, MapPin, ArrowRight } from "lucide-react";
import { getCivicProjects, getRecurringPatterns } from "@/lib/data/territorio";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { projectStatus } from "@/lib/territorio";
import { reportCategory, reportStatus } from "@/lib/community";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Da segnalazione a progetto",
  description:
    "Quando le segnalazioni si ripetono, il problema è strutturale: i cluster diventano progetti pubblici tracciati, con ufficio responsabile e stato.",
};

/*
  "Da segnalazione a progetto" (A2 §8) + problemi ricorrenti (A2 §7, O4):
  il passaggio di scala reso visibile — dalle riparazioni spot al progetto
  organico, con le segnalazioni d'origine sempre collegate.
*/

export default async function ProgettiPage() {
  const [projects, patterns] = await Promise.all([
    getCivicProjects(),
    getRecurringPatterns(),
  ]);
  // I pattern senza progetto: il "radar" di ciò che potrebbe diventarlo.
  const unaddressed = patterns.filter((p) => !p.projectId);

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Territorio"
        title="Da segnalazione a progetto"
        description="Quando le stesse segnalazioni si ripetono nella stessa zona, il problema è strutturale: il Comune apre un progetto unico e tracciato, e le segnalazioni d'origine restano collegate."
        icon={<FolderKanban size={26} />}
      />

      {projects.length === 0 ? (
        <EmptyState
          title="Nessun progetto aperto"
          description="Quando un gruppo di segnalazioni mostrerà un problema strutturale, qui nascerà un progetto pubblico."
        />
      ) : (
        <div className="space-y-5 stagger">
          {projects.map((p) => {
            const st = projectStatus(p.status);
            const cat = reportCategory(p.category);
            return (
              <Card key={p.id} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={st.color}>{st.label}</Badge>
                  <Badge color={cat.color}>{cat.label}</Badge>
                  {p.neighborhoodName ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-2">
                      <MapPin size={12} aria-hidden /> {p.neighborhoodName}
                    </span>
                  ) : null}
                  <span className="ml-auto text-xs text-muted-2" suppressHydrationWarning>
                    aperto il {formatDate(p.createdAt)}
                  </span>
                </div>
                <h2 className="font-display text-xl font-semibold tracking-tight">{p.title}</h2>
                <p className="text-sm leading-relaxed text-muted">{p.summary}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
                  <span className="font-semibold text-foreground">
                    {p.reportCount} segnalazioni all&apos;origine
                  </span>
                  {p.department ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Landmark size={13} aria-hidden />
                      {p.department}
                    </span>
                  ) : null}
                </div>
                {p.reports.length > 0 ? (
                  <ul className="space-y-1.5 border-t border-border pt-3">
                    {p.reports.map((r) => {
                      const rst = reportStatus(r.status);
                      return (
                        <li key={r.id}>
                          <Link
                            href={`/segnalazioni/${r.id}`}
                            className="group flex items-center gap-2.5 text-sm"
                          >
                            <span className="min-w-0 flex-1 truncate font-medium transition-colors group-hover:text-teal">
                              {r.title}
                            </span>
                            <Badge color={rst.color} className="px-2 py-0.5 text-[11px]">
                              {rst.label}
                            </Badge>
                            <ArrowRight size={13} className="shrink-0 text-muted-2" aria-hidden />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      {/* Problemi ricorrenti non ancora diventati progetto (A2 §7) */}
      {unaddressed.length > 0 ? (
        <section aria-labelledby="pattern-radar">
          <h2
            id="pattern-radar"
            className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2"
          >
            Sul radar: problemi che si ripetono
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {unaddressed.map((p) => {
              const cat = reportCategory(p.category);
              return (
                <Card key={`${p.category}-${p.neighborhoodName}`} className="flex items-center gap-3 p-4">
                  <span className="font-display text-2xl font-semibold tabular-nums text-amber">
                    {p.count}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug">
                      segnalazioni «{cat.label}» a {p.neighborhoodName}
                    </p>
                    <p className="text-xs text-muted-2">
                      aperte in questo momento — possibile problema strutturale
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      <Card className="bg-surface-2/40">
        <p className="text-sm text-muted">
          Progetti <strong>dimostrativi</strong>: in una versione reale i
          cluster verrebbero individuati dagli uffici (o suggeriti dai dati) e
          ogni progetto avrebbe budget e cronoprogramma collegati.
        </p>
      </Card>
    </div>
  );
}
