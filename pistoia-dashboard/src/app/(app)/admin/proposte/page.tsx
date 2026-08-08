import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getContatoriAdmin, getProposteDaValutare } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import { ListaProposte } from "@/components/admin/liste-code";

export const metadata: Metadata = { title: "Proposte · Area Comune" };

/*
  La coda delle proposte cittadine: **la lista**, e il lavoro su `[id]`.

  Era la coda peggiore dell'area — 1.894px con quattro voci, perché quattro
  moduli identici da 389px in colonna, cioè lineare nel numero di proposte.
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
        <p className="mb-3 text-sm text-muted">
          {proposte.length === 0
            ? "Niente in coda."
            : `${proposte.length} da valutare, dalla più sostenuta. Aprine una per lavorarci.`}
        </p>
        <ListaProposte voci={proposte} />
      </Card>
    </div>
  );
}
