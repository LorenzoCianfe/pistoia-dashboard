import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, Plus, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getProposals } from "@/lib/data/proposals";
import { getNeighborhoods } from "@/lib/data/neighborhoods";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Alert } from "@/components/ui/alert";
import { ProposalCard } from "@/components/community/proposal-card";
import { ProposalComposer } from "@/components/community/proposal-composer";
import { PROPOSAL_THRESHOLDS } from "@/lib/community";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Proposte" };

export default async function PropostePage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro } = await searchParams;
  const user = await requireUser();
  const mine = filtro === "mie";
  const canSupport = !!user.verifiedType;

  const [proposals, neighborhoods] = await Promise.all([
    getProposals(user.id, { mine }),
    getNeighborhoods(),
  ]);
  const sorted = [...proposals].sort((a, b) => b.supports - a.supports);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Proponi, sostieni, cambia"
        title="Proposte cittadine"
        description={`Le idee dei cittadini per la città. A ${PROPOSAL_THRESHOLDS.official} sostegni il Comune risponde, a ${PROPOSAL_THRESHOLDS.consultation} può diventare una consultazione pubblica.`}
        icon={<Lightbulb size={22} />}
      />

      {!canSupport ? (
        <Alert variant="info">
          Puoi proporre liberamente. Per <strong>sostenere</strong> le proposte serve un profilo
          verificato.{" "}
          <Link href="/profilo?verifica=richiesta" className="font-semibold underline">
            Richiedi la verifica
          </Link>
          .
        </Alert>
      ) : null}

      <Card className="p-0">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full gradient-teal-viola text-white">
                <Plus size={18} />
              </span>
              <div>
                <p className="font-semibold">Nuova proposta</p>
                <p className="text-xs text-muted">Un’idea concreta per migliorare la città</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-teal group-open:hidden">Apri</span>
            <span className="hidden text-sm font-semibold text-muted group-open:inline">Chiudi</span>
          </summary>
          <div className="border-t border-border p-5 sm:p-6">
            <ProposalComposer
              neighborhoods={neighborhoods}
              defaultNeighborhoodId={user.neighborhoodId}
            />
          </div>
        </details>
      </Card>

      <div className="flex gap-2">
        <FilterChip href="/proposte" active={!mine}>
          Tutte
        </FilterChip>
        <FilterChip href="/proposte?filtro=mie" active={mine}>
          Le mie
        </FilterChip>
      </div>

      {sorted.length === 0 ? (
        <Card className="text-center text-sm text-muted">
          Ancora nessuna proposta. Lancia tu la prima idea per la città.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((p) => (
            <ProposalCard key={p.id} proposal={p} canSupport={canSupport} />
          ))}
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-2">
        <ShieldCheck size={13} />
        Il sostegno verificato garantisce un cittadino, un voto.
      </p>
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
        "rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-transparent bg-teal-soft text-teal"
          : "border-border-strong bg-surface text-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
