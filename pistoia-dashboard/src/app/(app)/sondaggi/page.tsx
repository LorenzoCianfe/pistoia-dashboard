import type { Metadata } from "next";
import { Vote, Smile } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getPolls, SODDISFAZIONE_DIGITALE } from "@/lib/data/sondaggi";
import { getOrg } from "@/lib/data/organigramma";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { RingGauge } from "@/components/charts/ring-gauge";
import { PollCard } from "@/components/sondaggi/poll-card";
import { FollowButton } from "@/components/assessori/follow-button";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Sondaggi" };

export default async function SondaggiPage() {
  const user = await requireUser();
  const [polls, org] = await Promise.all([
    getPolls(user.id),
    getOrg(user.id),
  ]);

  const followMap = new Map(
    [org.sindaco, ...org.members]
      .filter(Boolean)
      .map((m) => [m!.id, m!.followedByMe]),
  );

  const mainPoll = polls.find((p) => p.active) ?? polls[0];
  const referente = mainPoll?.assessore;

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="La voce dei cittadini"
        title="Sondaggi"
        description="Il Comune fa una domanda, tu rispondi. I risultati sono pubblici e in tempo reale."
        icon={<Vote size={22} />}
      />

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Polls */}
        <div className="space-y-5">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>

        {/* Side column */}
        <div className="space-y-5">
          {referente ? (
            <Card>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                Assessore di riferimento
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar
                  initials={referente.initials}
                  color={referente.color}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">{referente.name}</p>
                  <p className="text-sm text-muted">{referente.role}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">
                Eletta con{" "}
                <span className="font-semibold text-foreground">
                  {formatNumber(referente.votesElected)}
                </span>{" "}
                preferenze.
              </p>
              <div className="mt-4">
                <FollowButton
                  assessoreId={referente.id}
                  following={followMap.get(referente.id) ?? false}
                />
              </div>
            </Card>
          ) : null}

          {/* Soddisfazione servizi digitali — KPI mock, visibile solo in DEMO_MODE */}
          {SODDISFAZIONE_DIGITALE != null ? (
            <Card>
              <div className="flex items-center gap-2">
                <Smile size={18} className="text-teal" />
                <h3 className="text-base font-semibold">Servizi digitali</h3>
              </div>
              <p className="mt-1 text-sm text-muted">
                Soddisfazione media dei cittadini.
              </p>
              <div className="mt-2 flex justify-center">
                <RingGauge
                  value={SODDISFAZIONE_DIGITALE}
                  color="green"
                  size={120}
                  label="Soddisfazione"
                />
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
