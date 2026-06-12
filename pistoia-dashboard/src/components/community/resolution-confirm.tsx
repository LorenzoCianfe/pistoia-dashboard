"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { confirmResolutionAction } from "@/app/actions/reports";

/*
  Conferma del cittadino dopo la risoluzione (A1 §5): "È davvero risolta?".
  Solo l'autore la vede; "no" riapre la pratica con nota pubblica.
*/
export function ResolutionConfirm({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"confermata" | "riaperta" | null>(null);

  function send(outcome: "confermata" | "riaperta") {
    setError(null);
    startTransition(async () => {
      const res = await confirmResolutionAction(reportId, outcome);
      if (res.ok) setDone(outcome);
      else setError(res.error ?? "Qualcosa è andato storto. Riprova.");
    });
  }

  if (done) {
    return (
      <p
        role="status"
        className="pulse-civico flex items-center gap-2 text-sm font-medium"
      >
        {done === "confermata" ? (
          <>
            <CheckCircle2 size={17} className="text-[var(--green)]" />
            Grazie! La tua conferma chiude il cerchio della segnalazione.
          </>
        ) : (
          <>
            <RotateCcw size={17} className="text-[var(--amber)]" />
            Pratica riaperta: il Comune riceverà la tua verifica.
          </>
        )}
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold">Il problema è davvero risolto?</p>
      <p className="mt-0.5 text-sm text-muted">
        La tua verifica sul posto vale più di qualsiasi stato: conferma o riapri
        la pratica.
      </p>
      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-[var(--red)]">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => send("confermata")}
          className="inline-flex h-10 items-center gap-1.5 rounded-pill bg-[var(--green-soft)] px-4 text-sm font-semibold text-[var(--green)] transition-[filter] hover:brightness-95 disabled:opacity-50 dark:hover:brightness-110"
        >
          <CheckCircle2 size={15} />
          Sì, è risolta
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => send("riaperta")}
          className="inline-flex h-10 items-center gap-1.5 rounded-pill border border-border-strong px-4 text-sm font-semibold text-muted transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)] disabled:opacity-50"
        >
          <RotateCcw size={15} />
          No, è ancora presente
        </button>
      </div>
    </div>
  );
}
