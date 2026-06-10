import type { Metadata } from "next";
import Link from "next/link";
import { MapPinned, Megaphone, HardHat, CalendarDays } from "lucide-react";
import { getNeighborhoodsWithCounts } from "@/lib/data/neighborhoods";
import { getCurrentUser } from "@/lib/auth/dal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { FollowButton } from "@/components/community/follow-button";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Quartieri" };

export default async function QuartieriPage() {
  const me = await getCurrentUser();
  const list = await getNeighborhoodsWithCounts(me?.id);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Territorio"
        title="Quartieri e frazioni"
        description="Tutto ciò che accade vicino a te, area per area. Segui il tuo quartiere per ricevere aggiornamenti mirati."
        icon={<MapPinned size={22} />}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((n) => (
          <Card key={n.id} hover className="flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/quartieri/${n.slug}`}
                className="font-semibold leading-snug hover:text-teal"
              >
                {n.name}
              </Link>
              <Badge
                color={n.kind === "frazione" ? "viola" : "teal"}
                soft
                className="bg-surface-2"
              >
                {n.kind === "frazione" ? "Frazione" : "Quartiere"}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-2">
              <span className="flex items-center gap-1">
                <Megaphone size={12} /> {formatNumber(n._count.reports)} segnalazioni
              </span>
              <span className="flex items-center gap-1">
                <HardHat size={12} /> {formatNumber(n._count.opere)} opere
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays size={12} /> {formatNumber(n._count.events)} eventi
              </span>
            </div>
            {me ? (
              <div className="mt-auto pt-4">
                <FollowButton
                  targetType="neighborhood"
                  targetId={n.id}
                  following={n.following}
                  size="sm"
                />
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
