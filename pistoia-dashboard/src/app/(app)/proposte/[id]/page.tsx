import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Lightbulb, CircleSlash, ArrowRight, Check } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getProposal } from "@/lib/data/proposals";
import { isFollowing } from "@/lib/data/follow";
import { getAnswerFeedback } from "@/lib/data/feedback";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Crest } from "@/components/brand/crest";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { SupportButton } from "@/components/community/support-button";
import { FollowButton } from "@/components/community/follow-button";
import { AnswerFeedback } from "@/components/community/answer-feedback";
import { ProposalAssessmentCard } from "@/components/community/proposal-assessment";
import { DisplayNumber } from "@/components/signature/display-number";
import { proposalStatus, PROPOSAL_THRESHOLDS } from "@/lib/community";
import { AFFECTED_GROUPS } from "@/lib/civic-topics";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { CONDIVISO, NOME_CONDIVISO } from "@/lib/view-transitions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Proposta" };

/** I tre gradini della scala del sostegno, con cosa scatta a ciascuno. */
const GRADINI = [
  {
    soglia: PROPOSAL_THRESHOLDS.highlight,
    cosa: "La proposta va in evidenza",
    precedente: 0,
  },
  {
    soglia: PROPOSAL_THRESHOLDS.official,
    cosa: "Il Comune deve rispondere",
    precedente: PROPOSAL_THRESHOLDS.highlight,
  },
  {
    soglia: PROPOSAL_THRESHOLDS.consultation,
    cosa: "Può diventare consultazione pubblica",
    precedente: PROPOSAL_THRESHOLDS.official,
  },
] as const;

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const proposal = await getProposal(id, user.id);
  if (!proposal) notFound();

  const following = await isFollowing(user.id, "proposal", proposal.id);
  const st = proposalStatus(proposal.status);
  const fb = proposal.officialReply
    ? await getAnswerFeedback("proposal", proposal.id, user.id)
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href="/proposte"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Tutte le proposte
      </Link>

      {/* Il gemello della transizione a elemento condiviso: la card della lista
          morfa in questa. Vedi `ProposalLink` e DESIGN.md §7. */}
      <Card
        className="space-y-4"
        style={{ viewTransitionName: NOME_CONDIVISO }}
        {...{ [CONDIVISO.proposta.attr]: "" }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="green">
            <Lightbulb size={12} />
            Proposta
          </Badge>
          <Badge color={st.color}>{st.label}</Badge>
          {proposal.category ? (
            <span className="text-xs text-muted-2">· {proposal.category}</span>
          ) : null}
        </div>

        <h1 className="text-2xl font-bold tracking-tight">{proposal.title}</h1>

        <div className="flex items-center gap-2 text-xs text-muted-2">
          <Avatar
            name={proposal.authorName}
            initials={proposal.authorInitials}
            color={proposal.authorColor}
            size="sm"
          />
          <span>{proposal.authorName}</span>
          {proposal.neighborhoodName ? (
            <span className="flex items-center gap-1">
              · <MapPin size={11} /> {proposal.neighborhoodName}
            </span>
          ) : null}
          <span suppressHydrationWarning>· {formatRelativeTime(proposal.createdAt)}</span>
        </div>

        {proposal.problem ? (
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                Il problema
              </p>
              <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed">
                {proposal.problem}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                La proposta
              </p>
              <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed">
                {proposal.description}
              </p>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-line text-[15px] leading-relaxed">
            {proposal.description}
          </p>
        )}

        {proposal.affectedGroups.length > 0 ? (
          <p className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-medium text-muted-2">Porta beneficio a:</span>
            {proposal.affectedGroups.map((g) => (
              <span
                key={g}
                className="rounded-pill bg-surface-2 px-2.5 py-1 font-medium text-muted"
              >
                <span aria-hidden>{AFFECTED_GROUPS[g]?.emoji}</span>{" "}
                {AFFECTED_GROUPS[g]?.label ?? g}
              </span>
            ))}
          </p>
        ) : null}

      </Card>

      {/*
        Il sostegno, con la cifra display della schermata.

        È l'unico posto della piattaforma dove la SCALA A TACCHE ha un intervallo
        vero sotto (DESIGN.md §8): 0 e 500 non sono un minimo e un massimo scelti
        per far stare bene il grafico, sono il nulla e la soglia oltre la quale
        la proposta può diventare una consultazione pubblica. Le tre soglie sono
        in `PROPOSAL_THRESHOLDS`, cioè nella stessa costante che decide il
        comportamento — la scala non può scollarsi dalle regole che illustra.

        La barra qui sotto resta perché risponde a un'altra domanda: la scala
        dice a che punto della salita sei, la barra quanto manca al gradino
        successivo.
      */}
      <Card>
        <DisplayNumber
          value={proposal.supports}
          unit={proposal.supports === 1 ? "sostegno" : "sostegni"}
          label="Sostegno raccolto"
          scale={{
            min: 0,
            max: PROPOSAL_THRESHOLDS.consultation,
            label: `${proposal.supports} sostegni su una scala da 0 a ${PROPOSAL_THRESHOLDS.consultation}: a ${PROPOSAL_THRESHOLDS.highlight} la proposta va in evidenza, a ${PROPOSAL_THRESHOLDS.official} il Comune deve rispondere, a ${PROPOSAL_THRESHOLDS.consultation} può diventare una consultazione pubblica.`,
          }}
        />

        {/*
          I tre gradini al posto della barra.

          La barra `ThresholdBar` resta giusta sulle card della lista, dove è
          l'unica cosa che parla di soglie. Qui no: mostrava «212 / 500», cioè
          esattamente l'intervallo che la scala a tacche sopra già disegna — due
          elementi che rispondono alla stessa domanda, e nessuno dei due che
          dice quali gradini siano stati superati e cosa succede a ciascuno.
        */}
        <ul className="mt-6 grid grid-cols-1 gap-2 border-t border-border pt-5 sm:grid-cols-3">
          {GRADINI.map((g) => {
            const superato = proposal.supports >= g.soglia;
            const prossimo = !superato && proposal.supports >= (g.precedente ?? 0);
            return (
              <li
                key={g.soglia}
                className={cn(
                  "rounded-[var(--radius-inner)] border p-3",
                  superato
                    ? "border-transparent bg-teal-soft"
                    : prossimo
                      ? "border-border-strong bg-surface"
                      : "border-border bg-surface opacity-60",
                )}
              >
                <p className="flex items-center gap-1.5 text-sm font-semibold tabular-nums">
                  {superato ? (
                    <Check size={14} className="text-teal" aria-hidden />
                  ) : (
                    <span className="text-muted-2" aria-hidden>
                      →
                    </span>
                  )}
                  {g.soglia}
                  <span className="sr-only">
                    {superato ? "soglia superata" : "soglia non ancora raggiunta"}
                  </span>
                </p>
                <p className="mt-0.5 text-xs leading-snug text-muted">{g.cosa}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <SupportButton
            proposalId={proposal.id}
            supported={proposal.supportedByMe}
            count={proposal.supports}
            canSupport={!!user.verifiedType}
          />
          <FollowButton targetType="proposal" targetId={proposal.id} following={following} />
        </div>
      </Card>

      <ProposalAssessmentCard assessment={proposal.assessment} />

      {/* "Perché non si può fare?" (A1 §13, O3): il rifiuto spiegato punto
          per punto trasforma un no in comunicazione trasparente. */}
      {proposal.status === "respinta" && proposal.rejectionReasons.length > 0 ? (
        <Card className="border-[var(--red)]/20">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <CircleSlash size={18} className="text-[var(--red)]" aria-hidden />
            Perché non si può fare?
          </h2>
          <ul className="mt-3 space-y-2.5">
            {proposal.rejectionReasons.map((reason) => (
              <li key={reason} className="flex gap-2.5 text-sm leading-relaxed">
                <span
                  className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[var(--red)]"
                  aria-hidden
                />
                {reason}
              </li>
            ))}
          </ul>
          <Link
            href="/decisioni"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline"
          >
            Tutte le decisioni del Comune
            <ArrowRight size={15} aria-hidden />
          </Link>
        </Card>
      ) : null}

      {proposal.officialReply ? (
        <Card>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-white shadow-sm ring-1 ring-border">
              <Crest className="h-4 w-auto" />
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold">
              Risposta del Comune di Pistoia
              <VerifiedBadge size={15} />
            </span>
            {proposal.officialReplyAt ? (
              <span className="ml-auto text-xs text-muted-2" suppressHydrationWarning>
                {formatDate(proposal.officialReplyAt)}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {proposal.officialReply}
          </p>
          {fb ? (
            <div className="mt-3 border-t border-border pt-3">
              <AnswerFeedback
                targetType="proposal"
                targetId={proposal.id}
                helpfulCount={fb.helpfulCount}
                myVote={fb.myVote}
              />
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
