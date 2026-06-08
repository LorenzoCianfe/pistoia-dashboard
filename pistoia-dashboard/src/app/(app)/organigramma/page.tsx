import type { Metadata } from "next";
import { Network, Users, Mail } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getOrg, type OrgMember } from "@/lib/data/organigramma";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "@/components/assessori/follow-button";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Organigramma" };

export default async function OrganigrammaPage() {
  const user = await requireUser();
  const org = await getOrg(user.id);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Chi governa la città"
        title="Organigramma"
        description="La giunta del Comune di Pistoia: chi ha la responsabilità di ogni area, e quante persone segue ciascun assessore."
        icon={<Network size={22} />}
      />

      {/* Sindaco */}
      {org.sindaco ? (
        <Card className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 size-56 rounded-full bg-[var(--red-soft)] opacity-60 blur-2xl" />
          <div className="relative flex flex-col items-center gap-4 py-2 text-center sm:flex-row sm:text-left">
            <Avatar
              initials={org.sindaco.initials}
              color={org.sindaco.color}
              size="xl"
            />
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
                {org.sindaco.role}
              </p>
              <h2 className="text-2xl font-bold tracking-tight">
                {org.sindaco.name}
              </h2>
              <p className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {formatNumber(org.sindaco.followerCount)} follower
                </span>
                <span>
                  {formatNumber(org.sindaco.votesElected)} preferenze
                </span>
              </p>
            </div>
            <FollowButton
              assessoreId={org.sindaco.id}
              following={org.sindaco.followedByMe}
            />
          </div>
        </Card>
      ) : null}

      {/* Connector */}
      <div className="flex justify-center" aria-hidden="true">
        <div className="h-6 w-px bg-border-strong" />
      </div>

      {/* Giunta */}
      <div>
        <h2 className="mb-3 px-1 text-base font-semibold">La giunta</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {org.members.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MemberCard({ member }: { member: OrgMember }) {
  return (
    <Card hover className="flex flex-col">
      <div className="flex items-center gap-3">
        <Avatar initials={member.initials} color={member.color} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{member.name}</p>
          <p className="text-xs text-muted">{member.area}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">{member.role}</p>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-2">
        <span className="flex items-center gap-1.5">
          <Users size={13} />
          {formatNumber(member.followerCount)} follower
        </span>
        {member.email ? (
          <span className="flex items-center gap-1.5 truncate">
            <Mail size={13} />
            <span className="truncate">{member.email}</span>
          </span>
        ) : null}
      </div>

      <div className="mt-4 pt-1">
        <FollowButton
          assessoreId={member.id}
          following={member.followedByMe}
          className="w-full justify-center"
        />
      </div>
    </Card>
  );
}
