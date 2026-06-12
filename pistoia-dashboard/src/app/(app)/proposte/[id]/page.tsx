import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Lightbulb, CircleSlash, ArrowRight } from "lucide-react";
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
import { ThresholdBar } from "@/components/community/threshold-bar";
import { ProposalAssessmentCard } from "@/components/community/proposal-assessment";
import { proposalStatus } from "@/lib/community";
import { AFFECTED_GROUPS } from "@/lib/civic-topics";
import { formatDate, formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Proposta" };

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

      <Card className="space-y-4">
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

        <div className="rounded-[var(--radius-sm)] border border-border bg-surface-2/50 p-4">
          <ThresholdBar supports={proposal.supports} />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
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
