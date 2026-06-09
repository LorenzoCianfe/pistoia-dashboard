"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { answerPostAction, type AdminState } from "@/app/actions/admin";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/format";
import { DEPARTMENTS } from "@/lib/community";

export function AnswerForm({
  post,
}: {
  post: { id: string; authorName: string; authorColor: string; content: string; createdAt: Date };
}) {
  const [state, action] = useActionState<AdminState, FormData>(
    answerPostAction,
    undefined,
  );

  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-surface-2/40 p-4">
      <div className="flex items-center gap-2.5">
        <Avatar name={post.authorName} color={post.authorColor} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">
            {post.authorName}
          </p>
          <p className="text-xs text-muted-2" suppressHydrationWarning>
            {formatRelativeTime(post.createdAt)}
          </p>
        </div>
      </div>
      <p className="mt-2 text-sm">{post.content}</p>

      {state?.ok ? (
        <Alert variant="success" className="mt-3">
          Risposta pubblicata.
        </Alert>
      ) : (
        <form action={action} className="mt-3 space-y-2">
          <input type="hidden" name="postId" value={post.id} />
          {state?.error ? (
            <p className="text-xs font-medium text-[var(--red)]">{state.error}</p>
          ) : null}
          <select
            name="department"
            defaultValue=""
            aria-label="Ufficio responsabile"
            className="h-9 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm focus-visible:border-teal focus-visible:outline-none"
          >
            <option value="">Ufficio responsabile (facoltativo)…</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <textarea
            name="body"
            rows={2}
            maxLength={600}
            required
            placeholder="Risposta ufficiale del Comune…"
            className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
          />
          <div className="flex justify-end">
            <SubmitButton size="sm" pendingText="Invio…">
              <Send size={14} />
              Pubblica risposta
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
