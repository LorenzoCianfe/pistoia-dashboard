import type { Metadata } from "next";
import { MessageCircleQuestion } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getContatoriAdmin, getDomandeSenzaRisposta } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import { ListaDomande } from "@/components/admin/liste-code";

export const metadata: Metadata = { title: "Domande · Area Comune" };

/*
  La coda del question time: **la lista**, e la risposta su `[id]`.

  Stessa forma di «Proposte» — moduli identici impilati, 1.492px con quattro
  domande — e quindi lo stesso rimedio.
*/
export default async function DomandeAdminPage() {
  await requireAdmin();
  const [contatori, domande] = await Promise.all([
    getContatoriAdmin(),
    getDomandeSenzaRisposta(),
  ]);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Riservato al Comune"
        title="Domande senza risposta"
        description="Le domande dei cittadini che aspettano una risposta ufficiale."
        icon={<MessageCircleQuestion size={22} className="text-teal" />}
      />

      <NavAdmin contatori={contatori} />

      <Card>
        <p className="mb-3 text-sm text-muted">
          {domande.length === 0
            ? "Niente in coda."
            : `${domande.length} in attesa, dalla più recente. Aprine una per rispondere.`}
        </p>
        <ListaDomande voci={domande} />
      </Card>
    </div>
  );
}
