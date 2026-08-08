import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircleQuestion } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import {
  getContatoriAdmin,
  getDomandaSenzaRisposta,
  getDomandeSenzaRisposta,
} from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import {
  CodaConDettaglio,
  FuoriDallaCoda,
  TornaAllaCoda,
} from "@/components/admin/coda";
import { ListaDomande } from "@/components/admin/liste-code";
import { AnswerForm } from "@/components/admin/answer-form";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Domanda · Area Comune" };

/** La risposta a UNA domanda del question time. */
export default async function DomandaAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [contatori, coda, voce] = await Promise.all([
    getContatoriAdmin(),
    getDomandeSenzaRisposta(),
    getDomandaSenzaRisposta(id),
  ]);
  if (!voce) notFound();

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
        <CodaConDettaglio lista={<ListaDomande voci={coda} attivo={voce.id} />}>
          <TornaAllaCoda href="/admin/domande" testo="Tutte le domande" />

          <div className="mt-2 flex items-center gap-2.5">
            <Avatar name={voce.authorName} color={voce.authorColor} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">
                {voce.authorName}
              </p>
              <p className="text-xs text-muted-2">
                {formatDate(voce.createdAt)}
                {voce.quartiere ? ` · ${voce.quartiere}` : ""}
              </p>
            </div>
          </div>

          <p className="mt-2 whitespace-pre-line text-base leading-relaxed">
            {voce.content}
          </p>

          {/*
            «È ancora in coda?» si chiede alla lista che abbiamo già in pagina,
            mai a una seconda copia di `DOMANDA_SENZA_RISPOSTA`
            (`lib/data/admin.ts`) — che oltre alla risposta guarda anche
            `hidden`, cioè un caso che una condizione riscritta a mano
            dimenticherebbe.
          */}
          {!coda.some((v) => v.id === voce.id) ? (
            <FuoriDallaCoda>
              {voce.risposta
                ? `Il Comune ha già risposto${voce.risposta.department ? ` (${voce.risposta.department})` : ""}: è uscita dalla coda.`
                : "Questa domanda è nascosta dalla moderazione: è uscita dalla coda."}
            </FuoriDallaCoda>
          ) : null}

          {voce.risposta ? (
            <div className="mt-3 rounded-[var(--radius-sm)] border border-border bg-surface-2/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                Risposta pubblicata
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted">
                {voce.risposta.body}
              </p>
            </div>
          ) : (
            <AnswerForm postId={voce.id} />
          )}
        </CodaConDettaglio>
      </Card>
    </div>
  );
}
