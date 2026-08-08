import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getContatoriAdmin, getSegnalazioniAperte } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import { ListaSegnalazioni } from "@/components/admin/liste-code";

export const metadata: Metadata = { title: "Segnalazioni · Area Comune" };

/*
  La coda del triage: **la lista**, e il lavoro su `[id]`.

  Fino al 2026-08-07 questa pagina era una pila di moduli da 323px tenuta a bada
  da un riquadro che scorre: 4.680px di contenuto dentro una finestra da 576,
  cioè **12 segnalazioni su 14 fuori vista**. Il riquadro era un cerotto, e il
  piano lo diceva (`docs/piano-admin.md` §6). Il rimedio è questo.
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
        <p className="mb-3 text-sm text-muted">
          {segnalazioni.length === 0
            ? "Niente in coda."
            : `${segnalazioni.length} aperte, dalla più urgente. Aprine una per lavorarci.`}
        </p>
        <ListaSegnalazioni voci={segnalazioni} />
      </Card>
    </div>
  );
}
