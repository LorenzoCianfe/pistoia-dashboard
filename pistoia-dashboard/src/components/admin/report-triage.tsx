"use client";

import { useActionState, useState } from "react";
import { ImagePlus, Loader2, ShieldAlert, X } from "lucide-react";
import {
  updateReportStatusAction,
  validateUrgencyAction,
  addReportPhotoAction,
  type ReportAdminState,
} from "@/app/actions/reports";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { REPORT_FLOW, REPORT_STATUS, DEPARTMENTS } from "@/lib/community";
import { downscaleImage } from "@/lib/images";

/*
  IL MODULO DI TRIAGE DI **UNA** SEGNALAZIONE.

  Fino al 2026-08-07 questo file esportava anche la lista, e la coda era una
  pila di questi moduli: 323px l'uno, 4.680px in quattordici. Adesso la lista è
  fatta di righe da 69px (`components/admin/coda.tsx`) e qui resta il solo
  lavoro, che vive su `/admin/segnalazioni/[id]`.

  Il merito — titolo, descrizione, autore, luogo — lo rende la **pagina**, che è
  un Server Component: è testo statico, e non c'è ragione di spedirlo al browser
  dentro un componente client.
*/
type Item = {
  id: string;
  status: string;
  urgency: string | null;
  assignedDepartment: string | null;
};

// `h-11` sono i 44px di `DESIGN.md` §11.6: era `h-10`, cioè 40 — quattro pixel
// sotto la soglia, su ogni riga di ogni modulo di questa pagina.
const selectClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm focus-visible:border-teal focus-visible:outline-none";

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
      {/*
        `flex-wrap` e non `flex`: i due pulsanti affiancati misurano 301px, e
        nella colonna del dettaglio a 375px ce ne sono 239. Senza, «Flusso
        ordinario» **sporge di 62px e la card lo ritaglia** — un controllo che
        esiste e non si può premere. Nessun cancello lo vede: `shots` misura il
        traboccamento *della pagina* (che resta zero), `bersagli` misura la
        *dimensione* (che è a norma), e axe non ha una regola per «tagliato».
      */}
      <div className="mt-2 flex flex-wrap gap-2">
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
      {/* `<summary>` è un bersaglio a tutti gli effetti, e questo era alto
          **16px**: il testo e basta. `min-h-11` gli dà i 44 di §11.6 senza
          cambiare l'aspetto della riga, che resta una sola parola cliccabile. */}
      <summary className="inline-flex min-h-11 cursor-pointer items-center text-xs font-semibold text-teal hover:underline">
        Aggiungi foto durante/dopo
      </summary>
      <form action={action} className="mt-2 space-y-2">
        <input type="hidden" name="reportId" value={reportId} />
        {photo ? <input type="hidden" name="photoData" value={photo} /> : null}
        {state?.error ? (
          <p className="text-xs font-medium text-[var(--red)]">{state.error}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <select name="phase" defaultValue="durante" className={selectClass + " !w-auto"} aria-label="Fase">
            <option value="durante">Durante i lavori</option>
            <option value="dopo">A intervento concluso</option>
          </select>
          <label
            htmlFor={`phase-photo-${reportId}`}
            /* L'`<input type=file>` è `sr-only`: il bersaglio VERO è questa
               etichetta, quindi i 44px di §11.6 vanno qui. */
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-pill border border-border-strong px-3 py-1.5 text-xs font-medium transition-colors hover:border-teal hover:text-teal"
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
            /*
              La pastiglia d'angolo è sparita, e non per gusto: era un
              bersaglio da **20px** appiccicato a una miniatura da 40, cioè un
              caso in cui i 44px di §11.6 non ci stanno per costruzione. Un
              comando accanto, con la sua parola, li rispetta e per giunta si
              legge — in uno strumento di redazione una «X» minuscola è la
              forma peggiore per un'azione distruttiva.
            */
            <span className="inline-flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Anteprima" className="h-10 rounded border border-border object-cover" />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="inline-flex min-h-11 items-center gap-1 rounded-pill px-2.5 text-xs font-medium text-muted-2 hover:text-[var(--red)]"
              >
                <X size={13} /> Rimuovi foto
              </button>
            </span>
          ) : null}
        </div>
        <input
          name="caption"
          maxLength={160}
          placeholder="Didascalia (facoltativa)"
          className="h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-xs placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
        />
        <SubmitButton size="sm" pendingText="Carico…" disabled={!photo || busy}>
          Pubblica foto
        </SubmitButton>
      </form>
    </details>
  );
}

export function TriageSegnalazione({ item }: { item: Item }) {
  const [state, action] = useActionState<ReportAdminState, FormData>(
    updateReportStatusAction,
    undefined,
  );

  return (
    <div>
      {item.urgency === "richiesta" ? <UrgencyReview reportId={item.id} /> : null}

      {state?.ok ? (
        <Alert variant="success" className="mt-3">
          Stato aggiornato.
        </Alert>
      ) : (
        <form action={action} className="@container mt-3 space-y-2">
          <input type="hidden" name="reportId" value={item.id} />
          {state?.error ? (
            <p className="text-xs font-medium text-[var(--red)]">{state.error}</p>
          ) : null}
          {/*
            `@sm:` e non `sm:`: da quando il triage vive sulla pagina della voce,
            questo modulo è largo **479px** nella colonna del dettaglio e ~303 su
            telefono — due larghezze, mai quella della finestra. Con `sm:` la
            variante a due colonne scattava per il fatto che la *finestra* fosse
            larga, che è la trappola del footer del 2026-08-05 (`DESIGN.md` §6).
            Oggi darebbe lo stesso esito; smetterebbe di darlo al primo cambio di
            larghezza della colonna.
          */}
          <div className="grid gap-2 @sm:grid-cols-2">
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
