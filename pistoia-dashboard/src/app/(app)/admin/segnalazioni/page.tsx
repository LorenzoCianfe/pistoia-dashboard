import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getContatoriAdmin, getSegnalazioniAperte } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import { ReportTriage } from "@/components/admin/report-triage";

export const metadata: Metadata = { title: "Segnalazioni · Area Comune" };

/*
  Il triage delle segnalazioni.

  ⚠️ **Il riquadro che scorre dentro la pagina resta**, e la prima stesura del
  taglio l'aveva tolto ragionando che «adesso a scorrere è la pagina». Misurato
  subito dopo: senza, questa pagina fa **5.000px** con le 14 segnalazioni
  aperte del seed — cioè da sola più alta di quanto il piano preveda per
  l'intera area, e più del triplo della coda peggiore. Il taglio serviva a non
  avere pagine così.

  Il vero rimedio non è il riquadro ma **lista + dettaglio**, e il piano lo
  tiene fuori di proposito (`docs/piano-admin.md` §6): sono due lavori con due
  rischi diversi. **La condizione che lo apre — una coda oltre le ~10 voci — è
  già soddisfatta qui**, e questa nota esiste perché non serva rimisurarlo.
*/
export default async function SegnalazioniAdminPage() {
  await requireAdmin();
  const [contatori, segnalazioni] = await Promise.all([
    getContatoriAdmin(),
    getSegnalazioniAperte(),
  ]);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Riservato al Comune"
        title="Segnalazioni aperte"
        description="Cambia stato, assegna un ufficio e lascia una nota ufficiale. Le richieste di urgenza da validare salgono in cima."
        icon={<Megaphone size={22} className="text-teal" />}
      />

      <NavAdmin contatori={contatori} />

      <Card>
        <div className="max-h-[36rem] overflow-y-auto pr-1">
          <ReportTriage items={segnalazioni} />
        </div>
      </Card>
    </div>
  );
}
