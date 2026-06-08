import type { Metadata } from "next";
import { Shield, MessageCircleQuestion, HardHat, Vote, Megaphone } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminData } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { AnswerForm } from "@/components/admin/answer-form";
import { OperaProgressForm } from "@/components/admin/opera-progress-form";
import { CreatePollForm } from "@/components/admin/create-poll-form";
import { BroadcastForm } from "@/components/admin/broadcast-form";

export const metadata: Metadata = { title: "Area Comune" };

export default async function AdminPage() {
  await requireAdmin();
  const data = await getAdminData();

  const stats = [
    { label: "Cittadini registrati", value: data.userCount },
    { label: "Sondaggi attivi", value: data.pollCount },
    { label: "Risposte pubblicate", value: data.answeredCount },
    { label: "Domande in attesa", value: data.unanswered.length },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Riservato al Comune"
        title="Area Comune"
        description="Rispondi ai cittadini, aggiorna i cantieri e lancia nuovi sondaggi. Tutto simulato."
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
            data.unanswered.map((post) => (
              <AnswerForm key={post.id} post={post} />
            ))
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
        <p className="mt-1 text-sm text-muted">
          Raggiunge tutti i cittadini registrati.
        </p>
        <div className="mt-4 max-w-md">
          <BroadcastForm />
        </div>
      </Card>
    </div>
  );
}
