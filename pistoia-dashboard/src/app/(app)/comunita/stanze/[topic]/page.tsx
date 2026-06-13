import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getCommunityFeed } from "@/lib/data/comunita";
import { getNeighborhoods } from "@/lib/data/neighborhoods";
import { EmptyState } from "@/components/ui/empty-state";
import { Composer } from "@/components/comunita/composer";
import { PostCard } from "@/components/comunita/post-card";
import { canModerate } from "@/lib/community";
import { CIVIC_TOPICS, type CivicTopicKey } from "@/lib/civic-topics";
import { accent } from "@/lib/colors";

/* La singola stanza tematica (A1 §17, O4): feed filtrato + composer che
   pubblica già nel tema della stanza. */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const t = CIVIC_TOPICS[topic as CivicTopicKey];
  return { title: t ? `Stanza ${t.label}` : "Stanza tematica" };
}

export default async function StanzaPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  if (!(topic in CIVIC_TOPICS)) notFound();
  const meta = CIVIC_TOPICS[topic as CivicTopicKey];
  const tokens = accent(meta.color);

  const user = await requireUser();
  const [feed, neighborhoods] = await Promise.all([
    getCommunityFeed(user.id, { topic }),
    getNeighborhoods(),
  ]);
  const moderator = canModerate(user.role);

  return (
    <div className="space-y-5 page-enter">
      <div>
        <Link
          href="/comunita/stanze"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} aria-hidden />
          Tutte le stanze
        </Link>
        <h1 className="mt-2 flex items-center gap-3 font-display text-2xl font-bold tracking-tight sm:text-[28px]">
          <span
            className="grid size-11 place-items-center rounded-[var(--radius-sm)] text-xl"
            style={{ backgroundColor: tokens.soft }}
            aria-hidden
          >
            {meta.emoji}
          </span>
          Stanza {meta.label}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Le conversazioni della community su questo tema, con le risposte ufficiali del Comune.
        </p>
      </div>

      <Composer
        name={user.name}
        color={user.avatarColor}
        neighborhoods={neighborhoods}
        defaultNeighborhoodId={user.neighborhoodId}
        topic={topic}
      />

      {feed.length === 0 ? (
        <EmptyState
          accent={meta.color}
          title="La stanza è ancora vuota"
          description={`Nessuna conversazione su ${meta.label.toLowerCase()}, per ora. Apri tu la prima.`}
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
    </div>
  );
}
