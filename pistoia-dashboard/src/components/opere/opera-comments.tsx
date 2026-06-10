"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Send, EyeOff } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { addOperaCommentAction, hideOperaCommentAction } from "@/app/actions/opere";
import { formatRelativeTime, formatNumber } from "@/lib/format";
import type { OperaComment } from "@/lib/data/opere";

export function OperaComments({
  operaId,
  comments,
  currentUserName,
  canComment,
  canModerate = false,
}: {
  operaId: string;
  comments: OperaComment[];
  currentUserName: string;
  canComment: boolean;
  canModerate?: boolean;
}) {
  const [optimistic, addOptimistic] = useOptimistic(
    comments,
    (list, body: string) => [
      {
        id: `temp-${list.length}`,
        operaId,
        authorId: null,
        authorName: currentUserName,
        authorInitials: "",
        authorColor: "teal",
        body,
        hidden: false,
        createdAt: new Date(),
      },
      ...list,
    ],
  );
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    setError(null);
    startTransition(async () => {
      addOptimistic(body);
      const res = await addOperaCommentAction(operaId, body);
      if (!res.ok) setError(res.error ?? "Non è stato possibile pubblicare il commento.");
    });
  }

  function hide(id: string) {
    startTransition(async () => {
      await hideOperaCommentAction(id);
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        Commenti dei cittadini
        <span className="text-sm font-normal text-muted-2">
          {formatNumber(optimistic.length)}
        </span>
      </h2>

      {canComment ? (
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={600}
            aria-label="Scrivi un commento su questo cantiere"
            placeholder="Scrivi un commento…"
            className="h-11 flex-1 rounded-pill border border-border-strong bg-surface px-4 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
          />
          <button
            type="submit"
            disabled={pending || !text.trim()}
            aria-label="Invia commento"
            className="grid size-11 shrink-0 place-items-center rounded-full gradient-teal-viola text-white disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted-2">Accedi per commentare questo cantiere.</p>
      )}
      {error ? <p className="text-sm text-[var(--red)]">{error}</p> : null}

      {optimistic.length > 0 ? (
        <ul className="space-y-3">
          {optimistic.map((c) => (
            <li key={c.id} className="flex gap-2.5">
              <Avatar
                name={c.authorName}
                initials={c.authorInitials || undefined}
                color={c.authorColor}
                size="sm"
              />
              <div className="min-w-0 flex-1 rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2">
                <p className="flex items-center gap-2 text-xs font-semibold">
                  {c.authorName}
                  <span className="font-normal text-muted-2" suppressHydrationWarning>
                    · {formatRelativeTime(c.createdAt)}
                  </span>
                  {canModerate && !String(c.id).startsWith("temp-") ? (
                    <button
                      type="button"
                      onClick={() => hide(c.id)}
                      disabled={pending}
                      className="ml-auto flex items-center gap-1 text-[11px] text-muted-2 transition-colors hover:text-[var(--red)]"
                      title="Nascondi (moderazione)"
                    >
                      <EyeOff size={13} /> Nascondi
                    </button>
                  ) : null}
                </p>
                <p className="mt-0.5 text-sm">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-2">
          Ancora nessun commento. Inizia tu la conversazione.
        </p>
      )}
    </div>
  );
}
