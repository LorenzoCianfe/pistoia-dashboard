import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getCommunityFeed } from "@/lib/data/comunita";
import { getServiceReviews } from "@/lib/data/sondaggi";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StarRating } from "@/components/ui/star-rating";
import { Composer } from "@/components/comunita/composer";
import { PostCard } from "@/components/comunita/post-card";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Comunità" };

export default async function ComunitaPage() {
  const user = await requireUser();
  const [feed, reviews] = await Promise.all([
    getCommunityFeed(user.id),
    getServiceReviews(),
  ]);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="La città che si risponde"
        title="Comunità"
        description="Domande pubbliche dei cittadini e risposte ufficiali del Comune, visibili a tutti."
        icon={<MessagesSquare size={22} />}
      />

      <Composer name={user.name} color={user.avatarColor} />

      <div className="space-y-4">
        {feed.map((post) => (
          <PostCard key={post.id} post={post} currentUserName={user.name} />
        ))}
      </div>

      <Card>
        <h2 className="text-base font-semibold">Recensioni dei servizi</h2>
        <p className="text-sm text-muted">
          Come i cittadini valutano i servizi del Comune.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-2/50 p-4"
            >
              <div>
                <p className="font-semibold">{r.service}</p>
                <p className="text-xs text-muted-2">
                  {formatNumber(r.count)} valutazioni
                </p>
              </div>
              <StarRating value={r.rating} showValue />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
