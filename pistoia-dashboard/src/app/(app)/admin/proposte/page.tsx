import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getContatoriAdmin, getProposteDaValutare } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import { ProposalReview } from "@/components/admin/proposal-review";

export const metadata: Metadata = { title: "Proposte · Area Comune" };

/*
  La coda delle proposte cittadine.

  ⚠️ È la coda più lunga dell'area — **1.710px con quattro voci**, perché è
  fatta di moduli identici impilati. Con quaranta farebbe 17.000px, e la
  medicina è **lista + dettaglio** (vale anche per «Domande»). Non si è fatta
  insieme al taglio perché sono due lavori con due rischi diversi.
  **Condizione che apre il debito: quando questa coda supera le ~10 voci** —
  un fatto verificabile dai dati, che è anche il numero che il contatore qui
  sopra mostra a ogni caricamento.
*/
export default async function ProposteAdminPage() {
  await requireAdmin();
  const [contatori, proposte] = await Promise.all([
    getContatoriAdmin(),
    getProposteDaValutare(),
  ]);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Riservato al Comune"
        title="Proposte cittadine"
        description="Le proposte ordinate per sostegno: aggiorna lo stato e rispondi ufficialmente."
        icon={<Lightbulb size={22} className="text-teal" />}
      />

      <NavAdmin contatori={contatori} />

      <Card>
        <ProposalReview items={proposte} />
      </Card>
    </div>
  );
}
