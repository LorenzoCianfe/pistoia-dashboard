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
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crest } from "@/components/brand/crest";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { toggleLikeAction, addCommentAction } from "@/app/actions/community";
import { postCategory } from "@/lib/labels";
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
}: {
  post: FeedPost;
  currentUserName: string;
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
        createdAt: new Date(),
      },
    ],
  );
  const [pending, startTransition] = useTransition();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const cat = postCategory(post.category);
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
          <p className="flex items-center gap-2 font-semibold leading-tight">
            <span className="truncate">{post.authorName}</span>
            {post.isMine ? (
              <span className="rounded-pill bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                Tu
              </span>
            ) : null}
          </p>
          <p className="text-xs text-muted-2" suppressHydrationWarning>
            {formatRelativeTime(post.createdAt)}
          </p>
        </div>
        {cat ? <Badge color={cat.color}>{cat.label}</Badge> : null}
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
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {post.answer.body}
          </p>
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
            like.liked
              ? "text-[var(--red)]"
              : "text-muted hover:text-foreground",
          )}
        >
          <motion.span whileTap={{ scale: 0.8 }}>
            <Heart
              size={18}
              className={cn(like.liked && "fill-[var(--red)]")}
            />
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
      </div>

      {/* comments */}
      {showComments ? (
        <div className="mt-1 space-y-3">
          {comments.length > 0 ? (
            <ul className="space-y-2.5">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <Avatar name={c.authorName} size="sm" />
                  <div className="rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2">
                    <p className="text-xs font-semibold">{c.authorName}</p>
                    <p className="text-sm">{c.body}</p>
                  </div>
                </li>
              ))}
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
