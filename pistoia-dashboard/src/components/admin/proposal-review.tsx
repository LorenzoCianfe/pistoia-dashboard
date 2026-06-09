"use client";

import { useActionState } from "react";
import {
  reviewProposalAction,
  type ProposalAdminState,
} from "@/app/actions/proposals";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { PROPOSAL_STATUS, proposalStatus } from "@/lib/community";
import { formatNumber } from "@/lib/format";

type Item = {
  id: string;
  title: string;
  status: string;
  hasReply: boolean;
  supports: number;
};

const selectClass =
  "h-10 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm focus-visible:border-teal focus-visible:outline-none";

const SETTABLE = ["pubblicata", "in_valutazione", "risposta", "approvata", "respinta"];

function ReviewItem({ item }: { item: Item }) {
  const [state, action] = useActionState<ProposalAdminState, FormData>(
    reviewProposalAction,
    undefined,
  );

  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-surface-2/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={proposalStatus(item.status).color}>
          {proposalStatus(item.status).label}
        </Badge>
        <span className="text-xs font-semibold tabular-nums">
          {formatNumber(item.supports)} sostegni
        </span>
        {item.hasReply ? (
          <span className="text-xs text-muted-2">· risposta pubblicata</span>
        ) : null}
      </div>
      <p className="mt-1.5 text-sm font-semibold">{item.title}</p>

      {state?.ok ? (
        <Alert variant="success" className="mt-3">
          Proposta aggiornata.
        </Alert>
      ) : (
        <form action={action} className="mt-3 space-y-2">
          <input type="hidden" name="proposalId" value={item.id} />
          {state?.error ? (
            <p className="text-xs font-medium text-[var(--red)]">{state.error}</p>
          ) : null}
          <select name="status" defaultValue={item.status} className={selectClass} aria-label="Stato">
            {SETTABLE.map((s) => (
              <option key={s} value={s}>
                {PROPOSAL_STATUS[s].label}
              </option>
            ))}
          </select>
          <textarea
            name="reply"
            rows={2}
            maxLength={800}
            placeholder="Risposta ufficiale del Comune (facoltativa)…"
            className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
          />
          <div className="flex justify-end">
            <SubmitButton size="sm" pendingText="Salvataggio…">
              Aggiorna proposta
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}

export function ProposalReview({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-[var(--radius-sm)] border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
        Nessuna proposta da valutare.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ReviewItem key={item.id} item={item} />
      ))}
    </div>
  );
}
