import Link from "next/link";
import { MapPin, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupportButton } from "@/components/community/support-button";
import { ThresholdBar } from "@/components/community/threshold-bar";
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
    <Card hover className="flex flex-col gap-3">
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

      <div>
        <Link
          href={`/proposte/${proposal.id}`}
          className="block text-lg font-semibold leading-snug tracking-tight hover:text-teal"
        >
          {proposal.title}
        </Link>
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
