import type { Metadata } from "next";
import {
  Shield,
  MessageCircleQuestion,
  HardHat,
  Vote,
  Megaphone,
  BadgeCheck,
  Lightbulb,
  History,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminData, getModerationData } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { AnswerForm } from "@/components/admin/answer-form";
import { OperaProgressForm } from "@/components/admin/opera-progress-form";
import { CreatePollForm } from "@/components/admin/create-poll-form";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { VerificationQueue } from "@/components/admin/verification-queue";
import { ReportTriage } from "@/components/admin/report-triage";
import { ProposalReview } from "@/components/admin/proposal-review";
import { ModerationPanel } from "@/components/admin/moderation-panel";
import { ShieldAlert } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Area Comune" };

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
};

export default async function AdminPage() {
  await requireAdmin();
  const [data, moderation] = await Promise.all([getAdminData(), getModerationData()]);

  const stats = [
    { label: "Cittadini registrati", value: data.userCount },
    { label: "Verifiche in attesa", value: data.pendingVerifications.length },
    { label: "Segnalazioni aperte", value: data.openReportsCount },
    { label: "Domande in attesa", value: data.unanswered.length },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Riservato al Comune"
        title="Area Comune"
        description="Verifica i profili, gestisci segnalazioni e proposte, rispondi ai cittadini. Tutto simulato."
        icon={<Shield size={22} className="text-[var(--red)]" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="text-center">
            <p className="text-3xl font-bold tabular-nums">{s.value}</p>
            <p className="mt-1 text-xs text-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Verifiche + Segnalazioni */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <BadgeCheck size={18} className="text-teal" />
            <h2 className="text-base font-semibold">Richieste di verifica</h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            Approva o rifiuta le richieste dei cittadini e delle organizzazioni.
          </p>
          <div className="mt-4">
            <VerificationQueue items={data.pendingVerifications} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-teal" />
            <h2 className="text-base font-semibold">Segnalazioni aperte</h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            Cambia stato, assegna un ufficio e lascia una nota ufficiale.
          </p>
          <div className="mt-4 max-h-[36rem] overflow-y-auto pr-1">
            <ReportTriage items={data.openReports} />
          </div>
        </Card>
      </div>

      {/* Proposte da valutare */}
      <Card>
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Proposte cittadine</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Le proposte ordinate per sostegno: aggiorna lo stato e rispondi ufficialmente.
        </p>
        <div className="mt-4">
          <ProposalReview items={data.proposalsToReview} />
        </div>
      </Card>

      {/* Domande senza risposta */}
      <Card>
        <div className="flex items-center gap-2">
          <MessageCircleQuestion size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Domande senza risposta</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Le domande dei cittadini che aspettano una risposta ufficiale.
        </p>
        <div className="mt-4 space-y-3">
          {data.unanswered.length === 0 ? (
            <p className="rounded-[var(--radius-sm)] border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
              Nessuna domanda in attesa. Ottimo lavoro! 🎉
            </p>
          ) : (
            data.unanswered.map((post) => <AnswerForm key={post.id} post={post} />)
          )}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Aggiorna cantieri */}
        <Card>
          <div className="flex items-center gap-2">
            <HardHat size={18} className="text-teal" />
            <h2 className="text-base font-semibold">Aggiorna un cantiere</h2>
          </div>
          <div className="mt-4">
            <OperaProgressForm opere={data.opere} />
          </div>
        </Card>

        {/* Crea sondaggio */}
        <Card>
          <div className="flex items-center gap-2">
            <Vote size={18} className="text-teal" />
            <h2 className="text-base font-semibold">Crea un sondaggio</h2>
          </div>
          <div className="mt-4">
            <CreatePollForm />
          </div>
        </Card>
      </div>

      {/* Broadcast */}
      <Card>
        <div className="flex items-center gap-2">
          <Megaphone size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Invia una notifica</h2>
        </div>
        <p className="mt-1 text-sm text-muted">Raggiunge tutti i cittadini registrati.</p>
        <div className="mt-4 max-w-md">
          <BroadcastForm />
        </div>
      </Card>

      {/* Moderazione community (§14) */}
      <Card>
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-[var(--red)]" />
          <h2 className="text-base font-semibold">Moderazione community</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Commenti segnalati, ban e sospensioni, parole bloccate e unione di segnalazioni duplicate.
        </p>
        <div className="mt-4">
          <ModerationPanel
            flaggedComments={moderation.flaggedComments}
            blockedWords={moderation.blockedWords}
            sanctioned={moderation.sanctioned}
            openReports={data.openReports.map((r) => ({ id: r.id, title: r.title }))}
          />
        </div>
      </Card>

      {/* Registro moderazione / audit */}
      <Card>
        <div className="flex items-center gap-2">
          <History size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Registro delle azioni</h2>
        </div>
        {data.recentModeration.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nessuna azione registrata.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border text-sm">
            {data.recentModeration.map((m) => (
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
