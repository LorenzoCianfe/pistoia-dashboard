"use client";

import { useActionState } from "react";
import {
  updateReportStatusAction,
  type ReportAdminState,
} from "@/app/actions/reports";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import {
  REPORT_FLOW,
  REPORT_STATUS,
  DEPARTMENTS,
  reportCategory,
  reportStatus,
} from "@/lib/community";
import { formatNumber } from "@/lib/format";

type Item = {
  id: string;
  title: string;
  category: string;
  status: string;
  neighborhoodName: string | null;
  assignedDepartment: string | null;
  confirmations: number;
};

const selectClass =
  "h-10 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm focus-visible:border-teal focus-visible:outline-none";

// Statuses an operator can set (flow + side states).
const SETTABLE = [
  ...REPORT_FLOW,
  "duplicata",
  "non_di_competenza",
] as const;

function TriageItem({ item }: { item: Item }) {
  const [state, action] = useActionState<ReportAdminState, FormData>(
    updateReportStatusAction,
    undefined,
  );
  const cat = reportCategory(item.category);

  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-surface-2/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={cat.color}>{cat.label}</Badge>
        <Badge color={reportStatus(item.status).color}>
          {reportStatus(item.status).label}
        </Badge>
        <span className="text-xs text-muted-2">
          {formatNumber(item.confirmations)} conferme
          {item.neighborhoodName ? ` · ${item.neighborhoodName}` : ""}
        </span>
      </div>
      <p className="mt-1.5 text-sm font-semibold">{item.title}</p>

      {state?.ok ? (
        <Alert variant="success" className="mt-3">
          Stato aggiornato.
        </Alert>
      ) : (
        <form action={action} className="mt-3 space-y-2">
          <input type="hidden" name="reportId" value={item.id} />
          {state?.error ? (
            <p className="text-xs font-medium text-[var(--red)]">{state.error}</p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <select name="status" defaultValue={item.status} className={selectClass} aria-label="Stato">
              {SETTABLE.map((s) => (
                <option key={s} value={s}>
                  {REPORT_STATUS[s].label}
                </option>
              ))}
            </select>
            <select
              name="department"
              defaultValue={item.assignedDepartment ?? ""}
              className={selectClass}
              aria-label="Ufficio"
            >
              <option value="">Nessun ufficio</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="note"
            rows={2}
            maxLength={400}
            placeholder="Nota ufficiale (visibile al cittadino)…"
            className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
          />
          <div className="flex justify-end">
            <SubmitButton size="sm" pendingText="Salvataggio…">
              Aggiorna stato
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}

export function ReportTriage({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-[var(--radius-sm)] border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
        Nessuna segnalazione aperta. 🎉
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <TriageItem key={item.id} item={item} />
      ))}
    </div>
  );
}
