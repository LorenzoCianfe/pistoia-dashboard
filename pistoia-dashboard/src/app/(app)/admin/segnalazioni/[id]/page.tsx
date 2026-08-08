import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Megaphone } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import {
  getContatoriAdmin,
  getSegnalazioneDaTriare,
  getSegnalazioniAperte,
} from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import {
  CodaConDettaglio,
  FuoriDallaCoda,
  TornaAllaCoda,
} from "@/components/admin/coda";
import { ListaSegnalazioni } from "@/components/admin/liste-code";
import { TriageSegnalazione } from "@/components/admin/report-triage";
import { reportCategory, reportStatus, reportUrgency } from "@/lib/community";
import { formatDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Segnalazione · Area Comune" };

/*
  Il triage di UNA segnalazione — la superficie di lavoro vera.

  ⚠️ **La descrizione compare qui per la prima volta.** Fino al 2026-08-07 la
  coda la caricava e non la mostrava: il Comune sceglieva lo stato, assegnava
  l'ufficio e scriveva una nota ufficiale **visibile al cittadino** avendo
  davanti il solo titolo. Non era un problema di impaginazione.
*/
export default async function SegnalazioneAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [contatori, coda, voce] = await Promise.all([
    getContatoriAdmin(),
    getSegnalazioniAperte(),
    getSegnalazioneDaTriare(id),
  ]);
  if (!voce) notFound();

  const cat = reportCategory(voce.category);
  const stato = reportStatus(voce.status);
  const urgenza = reportUrgency(voce.urgency);

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
        <CodaConDettaglio
          lista={<ListaSegnalazioni voci={coda} attivo={voce.id} />}
        >
          <TornaAllaCoda href="/admin/segnalazioni" testo="Tutte le segnalazioni" />

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge color={cat.color}>{cat.label}</Badge>
            <Badge color={stato.color}>{stato.label}</Badge>
            {urgenza ? <Badge color={urgenza.color}>{urgenza.label}</Badge> : null}
            <span className="text-xs text-muted-2">
              {formatNumber(voce.confirmations)} conferme
              {voce.neighborhoodName ? ` · ${voce.neighborhoodName}` : ""}
            </span>
          </div>

          <h2 className="mt-1.5 text-lg font-semibold leading-snug">
            {voce.title}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
            {voce.description}
          </p>
          <p className="mt-2 text-xs text-muted-2">
            Inviata il {formatDate(voce.createdAt)}
            {voce.autore ? ` da ${voce.autore}` : " in forma anonima"}
            {voce.luogo ? ` · ${voce.luogo}` : ""}
            {voce.foto > 0 ? ` · ${voce.foto} foto` : ""}
          </p>

          {/*
            Le foto e lo storico stanno sulla scheda pubblica, a un clic. Nel
            regime dimostrativo sono gradienti dichiarati (`imageSeed`), quindi
            ridisegnarle qui sarebbe un secondo posto da tenere allineato senza
            aggiungere informazione.
          */}
          <p className="mt-1 text-xs">
            <Link
              href={`/segnalazioni/${voce.id}`}
              className="inline-flex min-h-11 items-center gap-1 text-teal hover:underline"
            >
              Apri la scheda pubblica
              <ArrowUpRight size={13} aria-hidden />
            </Link>
          </p>

          {/* «È ancora in coda?» si chiede alla lista che abbiamo già, mai a una
              seconda copia della condizione (`lib/data/admin.ts`). */}
          {!coda.some((v) => v.id === voce.id) ? (
            <FuoriDallaCoda>
              Questa segnalazione è <strong>{stato.label.toLowerCase()}</strong>:
              è uscita dalla coda, e resta modificabile da qui.
            </FuoriDallaCoda>
          ) : null}

          <TriageSegnalazione
            item={{
              id: voce.id,
              status: voce.status,
              urgency: voce.urgency,
              assignedDepartment: voce.assignedDepartment,
            }}
          />
        </CodaConDettaglio>
      </Card>
    </div>
  );
}
