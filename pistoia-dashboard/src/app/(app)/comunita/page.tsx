import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare, DoorOpen } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getCommunityFeed } from "@/lib/data/comunita";
import { getServiceReviews } from "@/lib/data/sondaggi";
import { getNeighborhoods } from "@/lib/data/neighborhoods";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StarRating } from "@/components/ui/star-rating";
import { Composer } from "@/components/comunita/composer";
import { PostCard } from "@/components/comunita/post-card";
import { canModerate } from "@/lib/community";
import { CIVIC_TOPICS, CIVIC_TOPIC_KEYS } from "@/lib/civic-topics";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Comunità" };

export default async function ComunitaPage() {
  const user = await requireUser();
  const [feed, reviews, neighborhoods] = await Promise.all([
    getCommunityFeed(user.id),
    getServiceReviews(),
    getNeighborhoods(),
  ]);
  const moderator = canModerate(user.role);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="La città che si risponde"
        title="Comunità"
        description="Domande pubbliche dei cittadini e risposte ufficiali del Comune, visibili a tutti."
        icon={<MessagesSquare size={22} />}
      />

      {/* Stanze tematiche (A1 §17, O4): l'ingresso per tema. */}
      <nav aria-label="Stanze tematiche" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <Link
          href="/comunita/stanze"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-border-strong px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-teal hover:text-teal"
        >
          <DoorOpen size={13} aria-hidden />
          Tutte le stanze
        </Link>
        {CIVIC_TOPIC_KEYS.slice(0, 6).map((key) => (
          <Link
            key={key}
            href={`/comunita/stanze/${key}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-teal hover:text-teal"
          >
            <span aria-hidden>{CIVIC_TOPICS[key].emoji}</span>
            {CIVIC_TOPICS[key].label}
          </Link>
        ))}
      </nav>

      <Composer
        name={user.name}
        color={user.avatarColor}
        neighborhoods={neighborhoods}
        defaultNeighborhoodId={user.neighborhoodId}
      />

      {feed.length === 0 ? (
        <EmptyState
          accent="viola"
          title="Ancora nessuna conversazione"
          description="Questo è lo spazio del dialogo con il Comune. Apri tu la prima domanda."
        />
      ) : (
        <div className="space-y-4">
          {feed.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserName={user.name}
              canModerate={moderator}
            />
          ))}
        </div>
      )}

      {/* Interamente mock: getServiceReviews() è vuoto fuori da DEMO_MODE. */}
      {reviews.length > 0 ? (
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
      ) : null}
    </div>
  );
}
