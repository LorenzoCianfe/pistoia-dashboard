import type { Metadata } from "next";
import { MessageCircleQuestion } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getContatoriAdmin, getDomandeSenzaRisposta } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import { AnswerForm } from "@/components/admin/answer-form";

export const metadata: Metadata = { title: "Domande · Area Comune" };

/*
  La coda delle domande del question time.

  Stessa forma di «Proposte» — moduli identici impilati — e quindi lo stesso
  debito: **1.308px con le voci di oggi**, lineari nel numero delle domande.
  La medicina è lista + dettaglio, e riguarda tutte e due insieme.
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
        <div className="space-y-3">
          {domande.length === 0 ? (
            <p className="rounded-[var(--radius-sm)] border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
              Nessuna domanda in attesa. Ottimo lavoro! 🎉
            </p>
          ) : (
            domande.map((post) => <AnswerForm key={post.id} post={post} />)
          )}
        </div>
      </Card>
    </div>
  );
}
