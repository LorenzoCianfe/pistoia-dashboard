import type { Metadata } from "next";
import { MessageCircleQuestion, Landmark, CalendarClock } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getQuestionTimes } from "@/lib/data/territorio";
import { QtVoteButton, QtAskForm } from "@/components/territorio/qt-interactions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { DisplayNumber } from "@/components/signature/display-number";
import { qtStatus } from "@/lib/territorio";
import { civicTopic } from "@/lib/civic-topics";
import { campioneSufficiente } from "@/lib/citystats";
import { formatDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Question time",
  description:
    "Il Comune apre un tema, i cittadini fanno domande e le votano: le più votate ricevono risposta ufficiale, pubblica e archiviata.",
};

/*
  Question time digitale (A2 §22, O4): il dialogo strutturato. Niente botta e
  risposta dispersi — domande votate dal basso, risposte ufficiali che restano.
*/

export default async function QuestionTimePage() {
  const user = await requireUser();
  const sessions = await getQuestionTimes(user.id);

  /*
    Il conto si fa sulle domande di TUTTE le sessioni, aperte comprese, e
    questo è il punto delicato: in una sessione ancora aperta le domande non
    hanno ancora ricevuto risposta perché il termine non è scaduto, non perché
    il Comune non risponda. Metterle al denominatore e mostrare il risultato
    come un rapporto racconterebbe un'inadempienza che non c'è — lo stesso
    errore che /comunita evita escludendo discussioni e idee dal proprio.

    Per la stessa ragione non c'è scala a tacche: l'intervallo 0→domande poste
    darebbe per traguardo «a ogni domanda una risposta ufficiale», mentre la
    regola dichiarata di questa pagina è che rispondono alle **più votate**.
    Una scala su un traguardo che nessuno ha promesso è una scala inventata,
    e DESIGN.md §8 la considera peggio di nessuna scala.

    Resta la regola del campione minimo (`lib/citystats.ts`), applicata a ciò
    che la pagina dice del numero: sotto soglia il conteggio è esatto ma non
    regge una lettura d'insieme, e va dichiarato.
  */
  const domande = sessions.flatMap((s) => s.questions);
  const conRisposta = domande.filter((q) => q.officialAnswer).length;
  const sessioniAperte = sessions.filter((s) => s.status === "aperto").length;
  const campioneRegge = campioneSufficiente(domande.length);

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Partecipazione"
        title="Question time digitale"
        description="Il Comune apre un tema, tu fai le domande e voti quelle degli altri: le più votate ricevono risposta ufficiale, che resta archiviata qui."
        icon={<MessageCircleQuestion size={26} />}
      />

      {domande.length > 0 ? (
        <Card>
          <DisplayNumber
            value={conRisposta}
            unit={conRisposta === 1 ? "risposta" : "risposte"}
            label="Ufficiali, dagli assessorati"
          />
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
            su {formatNumber(domande.length)}{" "}
            {domande.length === 1 ? "domanda posta" : "domande poste"} dai
            cittadini
            {sessioniAperte > 0 ? (
              <>
                {" · "}
                <span className="font-semibold text-teal">
                  {formatNumber(sessioniAperte)}
                </span>{" "}
                {sessioniAperte === 1
                  ? "sessione è ancora aperta, e le sue domande aspettano il termine"
                  : "sessioni sono ancora aperte, e le loro domande aspettano il termine"}
              </>
            ) : null}
            .
            {!campioneRegge ? (
              <>
                {" "}
                Le domande poste sono ancora poche: il conteggio è esatto, ma
                non basta a dire quanto il Comune risponda.
              </>
            ) : null}
          </p>
        </Card>
      ) : null}

      {sessions.length === 0 ? (
        <EmptyState
          title="Nessuna sessione aperta"
          description="Quando il Comune aprirà un tema, qui potrai fare domande e votare quelle degli altri."
        />
      ) : (
        <div className="space-y-6 stagger">
          {sessions.map((s) => {
            const st = qtStatus(s.status);
            const topic = civicTopic(s.topic);
            const open = s.status === "aperto";
            return (
              <Card key={s.id} className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={st.color}>{st.label}</Badge>
                  {topic ? (
                    <Badge color={topic.color}>
                      <span aria-hidden>{topic.emoji}</span> {topic.label}
                    </Badge>
                  ) : null}
                  {s.closesAt ? (
                    <span
                      className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-2"
                      suppressHydrationWarning
                    >
                      <CalendarClock size={13} aria-hidden />
                      {open ? `domande fino al ${formatDate(s.closesAt)}` : `chiuso il ${formatDate(s.closesAt)}`}
                    </span>
                  ) : null}
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight">{s.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.description}</p>
                  {s.department ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                      <Landmark size={13} aria-hidden />
                      Risponde: {s.department}
                    </p>
                  ) : null}
                </div>

                <ol className="space-y-3" aria-label="Domande, dalla più votata">
                  {s.questions.map((q) => (
                    <li key={q.id} className="flex gap-3">
                      <QtVoteButton
                        questionId={q.id}
                        votes={q.votes}
                        voted={q.voted}
                        open={open}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-relaxed">{q.body}</p>
                        <p className="mt-1 text-xs text-muted-2">{q.authorName}</p>
                        {q.officialAnswer ? (
                          <div className="mt-2 rounded-[var(--radius-sm)] border-l-2 border-teal bg-surface-2/60 px-3.5 py-2.5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal">
                              🏛️ Risposta ufficiale
                              {q.answeredAt ? (
                                <span
                                  className="ml-2 font-normal normal-case tracking-normal text-muted-2"
                                  suppressHydrationWarning
                                >
                                  {formatDate(q.answeredAt)}
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed">{q.officialAnswer}</p>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>

                {open ? (
                  <div className="border-t border-border pt-4">
                    <QtAskForm sessionId={s.id} />
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-surface-2/40">
        <p className="text-sm text-muted">
          Sessioni <strong>dimostrative</strong>: in una versione reale i temi
          verrebbero aperti dagli assessorati con un calendario regolare, e le
          risposte firmate dall&apos;ufficio competente.
        </p>
      </Card>
    </div>
  );
}
