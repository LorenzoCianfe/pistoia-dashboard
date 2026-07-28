import { MapPin, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProposalLink } from "@/components/proposte/proposal-link";
import { Badge } from "@/components/ui/badge";
import { SupportButton } from "@/components/proposte/support-button";
import { ThresholdBar } from "@/components/proposte/threshold-bar";
import { AssessmentInline } from "@/components/proposte/proposal-assessment";
import { Avatar } from "@/components/ui/avatar";
import { proposalStatus } from "@/lib/community";
import { formatRelativeTime } from "@/lib/format";
import type { ProposalListItem } from "@/lib/data/proposals";

export function ProposalCard({
  proposal,
  canSupport,
}: {
  proposal: ProposalListItem;
  canSupport: boolean;
}) {
  const st = proposalStatus(proposal.status);
  return (
    // `data-proposta-card` è l'aggancio che `ProposalLink` risale per assegnare
    // il `view-transition-name` alla sola card cliccata.
    <Card hover data-proposta-card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color="green">
          <Lightbulb size={12} />
          Proposta
        </Badge>
        <Badge color={st.color}>{st.label}</Badge>
        {proposal.category ? (
          <span className="text-xs text-muted-2">· {proposal.category}</span>
        ) : null}
        <span className="ml-auto">
          <AssessmentInline assessment={proposal.assessment} />
        </span>
      </div>

      <div>
        <ProposalLink
          id={proposal.id}
          className="block text-lg font-semibold leading-snug tracking-tight hover:text-teal"
        >
          {proposal.title}
        </ProposalLink>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{proposal.description}</p>
      </div>

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

      <ThresholdBar supports={proposal.supports} />

      <div className="border-t border-border pt-3">
        <SupportButton
          proposalId={proposal.id}
          supported={proposal.supportedByMe}
          count={proposal.supports}
          canSupport={canSupport}
        />
      </div>
    </Card>
  );
}
