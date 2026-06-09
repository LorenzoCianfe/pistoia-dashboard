"use client";

import { useActionState } from "react";
import { Check, X } from "lucide-react";
import {
  reviewVerificationAction,
  type VerificationState,
} from "@/app/actions/verification";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { VERIFICATION, ACCOUNT_TYPE } from "@/lib/community";

type Item = {
  id: string;
  type: string;
  organizationName: string | null;
  note: string | null;
  user: { name: string; email: string; accountType: string; avatarColor: string };
};

function QueueItem({ item }: { item: Item }) {
  const [state, action] = useActionState<VerificationState, FormData>(
    reviewVerificationAction,
    undefined,
  );
  const v = VERIFICATION[item.type];

  if (state?.ok) {
    return (
      <Alert variant="success">Richiesta di {item.user.name} gestita.</Alert>
    );
  }

  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-surface-2/40 p-4">
      <div className="flex items-center gap-2.5">
        <Avatar name={item.user.name} color={item.user.avatarColor} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{item.user.name}</p>
          <p className="truncate text-xs text-muted-2">{item.user.email}</p>
        </div>
        {ACCOUNT_TYPE[item.user.accountType] ? (
          <Badge color={ACCOUNT_TYPE[item.user.accountType].color}>
            {ACCOUNT_TYPE[item.user.accountType].label}
          </Badge>
        ) : null}
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-sm">
        <span aria-hidden>{v?.emoji}</span>
        Richiede: <strong>{v?.label ?? item.type}</strong>
      </p>
      {item.organizationName ? (
        <p className="text-xs text-muted">Organizzazione: {item.organizationName}</p>
      ) : null}
      {item.note ? <p className="mt-1 text-xs italic text-muted">«{item.note}»</p> : null}

      {state?.error ? (
        <p className="mt-2 text-xs font-medium text-[var(--red)]">{state.error}</p>
      ) : null}

      <form action={action} className="mt-3 space-y-2">
        <input type="hidden" name="id" value={item.id} />
        <input
          name="note"
          maxLength={300}
          placeholder="Nota (facoltativa)…"
          className="h-9 w-full rounded-pill border border-border-strong bg-surface px-3.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            name="decision"
            value="APPROVED"
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-pill gradient-teal-viola text-sm font-semibold text-white active:scale-[0.98]"
          >
            <Check size={15} strokeWidth={2.5} />
            Approva
          </button>
          <button
            type="submit"
            name="decision"
            value="REJECTED"
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-pill border border-border-strong bg-surface text-sm font-semibold text-muted hover:text-[var(--red)] active:scale-[0.98]"
          >
            <X size={15} strokeWidth={2.5} />
            Rifiuta
          </button>
        </div>
      </form>
    </div>
  );
}

export function VerificationQueue({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-[var(--radius-sm)] border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
        Nessuna richiesta di verifica in attesa.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <QueueItem key={item.id} item={item} />
      ))}
    </div>
  );
}
