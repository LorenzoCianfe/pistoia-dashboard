import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  MessageCircleQuestion,
  HardHat,
  Vote,
  Megaphone,
  BadgeCheck,
  Lightbulb,
  History,
  QrCode,
  Star,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminData, getModerationData } from "@/lib/data/admin";
import { getRecensioniRecenti } from "@/lib/data/valutazioni";
import { ControlliRecensione } from "@/components/valutazioni/controlli-staff";
import { StarRating } from "@/components/ui/star-rating";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
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
  const [data, moderation, recensioni] = await Promise.all([
    getAdminData(),
    getModerationData(),
    getRecensioniRecenti(),
  ]);

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

      {/*
        R-4, forma A2: il posto di lavoro del Comune sulle valutazioni.
        Rispondere e segnalare sì; rimuovere no — rimuove solo la redazione,
        e le azioni di rimozione rifiutano gli account del Comune.
      */}
      <Card>
        <div className="flex items-center gap-2">
          <Star size={18} className="text-teal" aria-hidden />
          <h2 className="text-base font-semibold">Valutazioni dei servizi</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Le ultime recensioni con parole: rispondi alla singola o segnala alla
          redazione. Il quadro del mese si risponde dalla scheda del servizio.
          Rimuovere non si può da qui: rimuove solo la redazione.
        </p>
        {recensioni.length === 0 ? (
          <p className="mt-4 border-t border-border pt-3 text-sm text-muted">
            Nessuna recensione scritta, ancora: i voti senza testo non hanno
            niente a cui rispondere.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recensioni.map((r) => (
              <li key={r.id} className="border-t border-border pt-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <Link
                      href={`/valutazioni/${r.servizioId}`}
                      className="font-semibold hover:underline"
                    >
                      {r.servizio}
                    </Link>
                    <StarRating value={r.stelle} size={12} />
                    <span className="text-muted">{r.autore}</span>
                  </p>
                  <p className="text-xs text-muted-2">
                    <time dateTime={r.quando.toISOString()}>
                      {r.quando.toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "long",
                      })}
                    </time>
                  </p>
                </div>
                {r.testo ? (
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    «{r.testo}»
                  </p>
                ) : null}
                <ControlliRecensione
                  valutazioneId={r.id}
                  segnalata={r.segnalata}
                  haRisposta={r.haRisposta}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/*
        `grid-cols-1` accanto a `lg:grid-cols-2` non è ridondante, ed è la
        trappola 5 dell'ondata 7 (AGENTS.md §3). Sotto la soglia `lg` non
        esiste alcun `grid-template-columns`, quindi la traccia implicita è
        `auto` — e il minimo di `auto` è il **min-content**: la colonna non può
        stringersi sotto la larghezza minima della card più larga, qualunque
        cosa ci sia dentro. Misurato: /admin traboccava di **125px** a 360px in
        modalità semplice, min-content della traccia **467px**. Con
        `grid-cols-1` la traccia compila in `repeat(1, minmax(0, 1fr))`, che si
        stringe, e l'eccesso va a zero.

        Non si era mai visto perché /admin è entrata nel cancello delle
        schermate solo il 2026-08-06 (Lavoro D §4): quando una pagina entra per
        la prima volta in un cancello, i rossi possono essere suoi di nascita.
      */}
      {/* Verifiche + Segnalazioni */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
