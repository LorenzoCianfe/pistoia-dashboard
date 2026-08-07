import type { Metadata } from "next";
import Link from "next/link";
import { Shield, History, QrCode } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getContatoriAdmin, getRegistroAzioni } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { PorteAdmin } from "@/components/admin/porte-admin";
import { formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Area Comune" };

/*
  IL CRUSCOTTO — ciò che resta di `/admin` dopo il taglio del 2026-08-07.

  Era una colonna sola con **dieci mestieri e 7.300px**, senza indice né ancore:
  per arrivare alla moderazione si scorrevano 6.000px del lavoro di qualcun
  altro. Il taglio, e la regola che lo governa, stanno in `docs/piano-admin.md`
  e in `DESIGN.md` §6:

      una coda una pagina · gli strumenti insieme ·
      le letture sul cruscotto, finché ci stanno · il registro è una lettura

  Qui restano le **letture** — i quattro numeri e il registro — più le sei
  porte e il foglio dei QR. Il giorno in cui una di queste letture crescerà
  oltre lo schermo, esce e prende una rotta sua: è la condizione, non una data.
*/

const MOD_LABEL: Record<string, string> = {
  verify_approve: "Verifica approvata",
  verify_reject: "Verifica rifiutata",
  report_status: "Stato segnalazione aggiornato",
  proposal_status: "Stato proposta aggiornato",
  hide_post: "Post nascosto",
  hide_comment: "Commento nascosto",
  hide_opera_comment: "Commento opera nascosto",
  suspend_user: "Utente sospeso",
  ban_user: "Utente bannato",
  lift_sanction: "Sanzione revocata",
  merge_reports: "Segnalazioni unite",
  event_approve: "Evento approvato",
  event_reject: "Evento rifiutato",
  answer: "Risposta pubblicata",
  broadcast: "Notifica inviata",
  // R-4, valutazioni: il Comune risponde e segnala; rimuove SOLO la redazione.
  risposta_quadro: "Risposta al quadro pubblicata",
  risposta_singola: "Risposta a una recensione pubblicata",
  valutazione_segnalata: "Valutazione segnalata alla redazione",
  valutazione_rimossa: "Valutazione rimossa (redazione)",
  valutazione_lasciata: "Segnalazione chiusa: lasciata pubblicata",
  nota_redazione: "Nota della Redazione pubblicata",
};

export default async function AdminPage() {
  await requireAdmin();
  const [contatori, registro] = await Promise.all([
    getContatoriAdmin(),
    getRegistroAzioni(),
  ]);

  const numeri = [
    { label: "Cittadini registrati", value: contatori.cittadiniRegistrati },
    { label: "Verifiche in attesa", value: contatori.verifiche },
    { label: "Segnalazioni aperte", value: contatori.segnalazioni },
    { label: "Domande in attesa", value: contatori.domande },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Riservato al Comune"
        title="Area Comune"
        description="Lo stato della città e le aree di lavoro. Tutto simulato."
        icon={<Shield size={22} className="text-[var(--red)]" />}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {numeri.map((n) => (
          <Card key={n.label} className="text-center">
            <p className="text-3xl font-bold tabular-nums">{n.value}</p>
            <p className="mt-1 text-xs text-muted">{n.label}</p>
          </Card>
        ))}
      </div>

      <PorteAdmin contatori={contatori} />

      {/* R-3: i fogli QR delle valutazioni, da stampare e appendere. */}
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <QrCode size={18} className="shrink-0 text-teal" aria-hidden />
          <div>
            <p className="text-sm font-semibold">Codici QR delle valutazioni</p>
            <p className="text-xs text-muted">
              I fogli da stampare per sportelli e luoghi: portano al voto con
              servizio e luogo già compilati.
            </p>
          </div>
        </div>
        <Link href="/admin/codici-qr" className={buttonClasses("secondary", "sm")}>
          Apri e stampa
        </Link>
      </Card>

      {/* Registro moderazione / audit */}
      <Card>
        <div className="flex items-center gap-2">
          <History size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Registro delle azioni</h2>
        </div>
        {registro.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nessuna azione registrata.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border text-sm">
            {registro.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                <span>
                  <span className="font-medium">{MOD_LABEL[m.action] ?? m.action}</span>
                  {m.reason ? <span className="text-muted"> · {m.reason}</span> : null}
                </span>
                <span className="shrink-0 text-xs text-muted-2" suppressHydrationWarning>
                  {m.actor?.name ?? "—"} · {formatRelativeTime(m.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
