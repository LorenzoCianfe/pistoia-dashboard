"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Trees,
  Bike,
  Sparkles,
  Landmark,
  MapPin,
  EyeOff,
  Flag,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crest } from "@/components/brand/crest";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { AuthorVerification } from "@/components/community/badges";
import { AnswerFeedback } from "@/components/community/answer-feedback";
import { toggleLikeAction, addCommentAction } from "@/app/actions/community";
import { hidePostAction, reportCommentAction } from "@/app/actions/moderation";
import { postCategory } from "@/lib/labels";
import { postKind } from "@/lib/community";
import { accent } from "@/lib/colors";
import { formatRelativeTime, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/lib/data/comunita";

const BANNER_ICON: Record<string, LucideIcon> = {
  verde: Trees,
  mobilita: Bike,
  servizi: Sparkles,
  cultura: Landmark,
};

export function PostCard({
  post,
  currentUserName,
  canModerate = false,
}: {
  post: FeedPost;
  currentUserName: string;
  canModerate?: boolean;
}) {
  const [like, toggleLikeOptimistic] = useOptimistic(
    { count: post.likeCount, liked: post.likedByMe },
    (s) => ({ count: s.liked ? s.count - 1 : s.count + 1, liked: !s.liked }),
  );
  const [comments, addCommentOptimistic] = useOptimistic(
    post.comments,
    (list, body: string) => [
      ...list,
      {
        id: `temp-${list.length}`,
        postId: post.id,
        authorId: null,
        authorName: currentUserName,
        body,
        hidden: false,
        createdAt: new Date(),
      },
    ],
  );
  const [pending, startTransition] = useTransition();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [hidden, setHidden] = useState(false);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

  function flagComment(id: string) {
    setFlagged((s) => new Set(s).add(id));
    startTransition(async () => {
      await reportCommentAction(id);
    });
  }

  const cat = postCategory(post.category);
  const kind = postKind(post.kind);
  const BannerIcon = post.category ? BANNER_ICON[post.category] : undefined;

  function like_() {
    startTransition(async () => {
      toggleLikeOptimistic(undefined);
      await toggleLikeAction(post.id);
    });
  }

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const body = commentText.trim();
    if (!body) return;
    setCommentText("");
    setShowComments(true);
    startTransition(async () => {
      addCommentOptimistic(body);
      await addCommentAction(post.id, body);
    });
  }

  function hide() {
    setHidden(true);
    startTransition(async () => {
      await hidePostAction(post.id);
    });
  }

  if (hidden) return null;

  return (
    <Card>
      {/* header */}
      <div className="flex items-center gap-3">
        <Avatar
          name={post.authorName}
          initials={post.authorInitials}
          color={post.authorColor}
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-semibold leading-tight">
            <span className="truncate">{post.authorName}</span>
            <AuthorVerification type={post.authorVerifiedType} />
            {post.isMine ? (
              <span className="rounded-pill bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                Tu
              </span>
            ) : null}
          </p>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-2">
            {post.neighborhoodName ? (
              <span className="flex items-center gap-0.5">
                <MapPin size={11} />
                {post.neighborhoodName}
              </span>
            ) : null}
            <span suppressHydrationWarning>· {formatRelativeTime(post.createdAt)}</span>
          </p>
        </div>
        <Badge color={kind.color}>{kind.label}</Badge>
      </div>

      {/* content */}
      <p className="mt-3 text-[15px] leading-relaxed">{post.content}</p>

      {/* decorative banner */}
      {post.imageSeed ? (
        <div
          className="mt-3 grid h-28 place-items-center overflow-hidden rounded-[var(--radius-sm)]"
          style={{
            background: `linear-gradient(120deg, ${accent(cat?.color ?? "teal").soft}, ${accent("viola").soft})`,
          }}
        >
          {BannerIcon ? (
            <BannerIcon
              size={44}
              className="opacity-60"
              style={{ color: accent(cat?.color ?? "teal").fg }}
            />
          ) : null}
        </div>
      ) : null}

      {/* official answer */}
      {post.answer ? (
        <div className="mt-3 rounded-[var(--radius-sm)] border border-border bg-surface-2/60 p-3.5">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-white shadow-sm ring-1 ring-border">
              <Crest className="h-4 w-auto" />
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold">
              Comune di Pistoia
              <VerifiedBadge size={15} />
            </span>
            <span className="ml-auto text-xs text-muted-2" suppressHydrationWarning>
              {formatRelativeTime(post.answer.createdAt)}
            </span>
          </div>
          {post.answer.department ? (
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-2">
              {post.answer.department}
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {post.answer.body}
          </p>
          <div className="mt-3 border-t border-border pt-2.5">
            <AnswerFeedback
              targetType="post_answer"
              targetId={post.answer.id}
              helpfulCount={post.answer.helpfulCount}
              myVote={post.answer.myVote}
            />
          </div>
        </div>
      ) : null}

      {/* actions */}
      <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
        <button
          type="button"
          onClick={like_}
          disabled={pending}
          aria-pressed={like.liked}
          className={cn(
            "flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-medium transition-colors",
            like.liked ? "text-[var(--red)]" : "text-muted hover:text-foreground",
          )}
        >
          <motion.span whileTap={{ scale: 0.8 }}>
            <Heart size={18} className={cn(like.liked && "fill-[var(--red)]")} />
          </motion.span>
          {formatNumber(like.count)}
        </button>

        <button
          type="button"
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <MessageCircle size={18} />
          {formatNumber(comments.length)}
        </button>

        {canModerate ? (
          <button
            type="button"
            onClick={hide}
            disabled={pending}
            className="ml-auto flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-medium text-muted-2 transition-colors hover:text-[var(--red)]"
            title="Nascondi (moderazione)"
          >
            <EyeOff size={15} />
            Nascondi
          </button>
        ) : null}
      </div>

      {/* comments */}
      {showComments ? (
        <div className="mt-1 space-y-3">
          {comments.length > 0 ? (
            <ul className="space-y-2.5">
              {comments.map((c) => {
                const isTemp = String(c.id).startsWith("temp-");
                const isFlagged = flagged.has(c.id);
                return (
                  <li key={c.id} className="group flex items-start gap-2.5">
                    <Avatar name={c.authorName} size="sm" />
                    <div className="min-w-0 flex-1 rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2">
                      <p className="text-xs font-semibold">{c.authorName}</p>
                      <p className="text-sm">{c.body}</p>
                    </div>
                    {!isTemp ? (
                      <button
                        type="button"
                        onClick={() => flagComment(c.id)}
                        disabled={isFlagged}
                        title={isFlagged ? "Segnalato" : "Segnala commento"}
                        aria-label={isFlagged ? "Commento segnalato" : "Segnala commento"}
                        className="mt-1 shrink-0 text-muted-2 transition-colors hover:text-[var(--red)] disabled:text-[var(--amber)]"
                      >
                        <Flag size={13} className={isFlagged ? "fill-[var(--amber)]" : undefined} />
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
          <form onSubmit={submitComment} className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={400}
              aria-label="Scrivi un commento"
              placeholder="Scrivi un commento…"
              className="h-10 flex-1 rounded-pill border border-border-strong bg-surface px-4 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={pending || !commentText.trim()}
              aria-label="Invia commento"
              className="grid size-10 shrink-0 place-items-center rounded-full gradient-teal-viola text-white disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : null}
    </Card>
  );
}
