"use client";

import { useActionState, useState } from "react";
import { ImagePlus, Loader2, ShieldAlert, X } from "lucide-react";
import {
  updateReportStatusAction,
  validateUrgencyAction,
  addReportPhotoAction,
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
  reportUrgency,
} from "@/lib/community";
import { downscaleImage } from "@/lib/images";
import { formatNumber } from "@/lib/format";

type Item = {
  id: string;
  title: string;
  category: string;
  status: string;
  urgency: string | null;
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

/** Validazione dell'urgenza richiesta dal cittadino (A1 §8). */
function UrgencyReview({ reportId }: { reportId: string }) {
  const [state, action] = useActionState<ReportAdminState, FormData>(
    validateUrgencyAction,
    undefined,
  );
  if (state?.ok) {
    return (
      <Alert variant="success" className="mt-3">
        Urgenza valutata.
      </Alert>
    );
  }
  return (
    <div className="mt-3 rounded-[var(--radius-sm)] border border-[color-mix(in_oklab,var(--red)_30%,transparent)] bg-[var(--red-soft)]/40 p-3">
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <ShieldAlert size={15} className="text-[var(--red)]" aria-hidden />
        Il cittadino segnala un pericolo immediato
      </p>
      {state?.error ? (
        <p className="mt-1 text-xs font-medium text-[var(--red)]">{state.error}</p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <form action={action}>
          <input type="hidden" name="reportId" value={reportId} />
          <input type="hidden" name="outcome" value="confermata" />
          <SubmitButton size="sm" pendingText="…">
            Conferma urgenza
          </SubmitButton>
        </form>
        <form action={action}>
          <input type="hidden" name="reportId" value={reportId} />
          <input type="hidden" name="outcome" value="respinta" />
          <SubmitButton size="sm" variant="secondary" pendingText="…">
            Flusso ordinario
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

/** Foto durante/dopo dal Comune (A1 §4). */
function PhasePhotoForm({ reportId }: { reportId: string }) {
  const [state, action] = useActionState<ReportAdminState, FormData>(
    addReportPhotoAction,
    undefined,
  );
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      setPhoto(await downscaleImage(file, 1024));
    } catch {
      setPhoto(null);
    } finally {
      setBusy(false);
    }
  }

  if (state?.ok) {
    return (
      <Alert variant="success" className="mt-2">
        Foto pubblicata sulla segnalazione.
      </Alert>
    );
  }

  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-xs font-semibold text-teal hover:underline">
        Aggiungi foto durante/dopo
      </summary>
      <form action={action} className="mt-2 space-y-2">
        <input type="hidden" name="reportId" value={reportId} />
        {photo ? <input type="hidden" name="photoData" value={photo} /> : null}
        {state?.error ? (
          <p className="text-xs font-medium text-[var(--red)]">{state.error}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <select name="phase" defaultValue="durante" className={selectClass + " !h-9 !w-auto"} aria-label="Fase">
            <option value="durante">Durante i lavori</option>
            <option value="dopo">A intervento concluso</option>
          </select>
          <label
            htmlFor={`phase-photo-${reportId}`}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-pill border border-border-strong px-3 py-1.5 text-xs font-medium transition-colors hover:border-teal hover:text-teal"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
            {photo ? "Cambia foto" : "Scegli foto"}
          </label>
          <input
            id={`phase-photo-${reportId}`}
            type="file"
            accept="image/*"
            onChange={onPhoto}
            className="sr-only"
          />
          {photo ? (
            <span className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Anteprima" className="h-10 rounded border border-border object-cover" />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                aria-label="Rimuovi foto"
                className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-surface shadow ring-1 ring-border hover:text-[var(--red)]"
              >
                <X size={11} />
              </button>
            </span>
          ) : null}
        </div>
        <input
          name="caption"
          maxLength={160}
          placeholder="Didascalia (facoltativa)"
          className="h-9 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-xs placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
        />
        <SubmitButton size="sm" pendingText="Carico…" disabled={!photo || busy}>
          Pubblica foto
        </SubmitButton>
      </form>
    </details>
  );
}

function TriageItem({ item }: { item: Item }) {
  const [state, action] = useActionState<ReportAdminState, FormData>(
    updateReportStatusAction,
    undefined,
  );
  const cat = reportCategory(item.category);
  const urgency = reportUrgency(item.urgency);

  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-surface-2/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={cat.color}>{cat.label}</Badge>
        <Badge color={reportStatus(item.status).color}>
          {reportStatus(item.status).label}
        </Badge>
        {urgency ? <Badge color={urgency.color}>{urgency.label}</Badge> : null}
        <span className="text-xs text-muted-2">
          {formatNumber(item.confirmations)} conferme
          {item.neighborhoodName ? ` · ${item.neighborhoodName}` : ""}
        </span>
      </div>
      <p className="mt-1.5 text-sm font-semibold">{item.title}</p>

      {item.urgency === "richiesta" ? <UrgencyReview reportId={item.id} /> : null}

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

      {/* Foto durante/dopo (A1 §4) */}
      <PhasePhotoForm reportId={item.id} />
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
