"use client";

import { useActionState, useState } from "react";
import {
  updateOperaProgressAction,
  type AdminState,
} from "@/app/actions/admin";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

type Opera = { id: string; name: string; progress: number; status: string };

export function OperaProgressForm({ opere }: { opere: Opera[] }) {
  const [state, action] = useActionState<AdminState, FormData>(
    updateOperaProgressAction,
    undefined,
  );
  const [selected, setSelected] = useState(opere[0]?.id ?? "");
  const current = opere.find((o) => o.id === selected);
  const [progress, setProgress] = useState(current?.progress ?? 0);

  return (
    <form action={action} className="space-y-4">
      {state?.ok ? (
        <Alert variant="success">Cantiere aggiornato.</Alert>
      ) : state?.error ? (
        <Alert>{state.error}</Alert>
      ) : null}

      <Field label="Cantiere" htmlFor="operaId">
        <select
          id="operaId"
          name="operaId"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            const o = opere.find((x) => x.id === e.target.value);
            if (o) setProgress(o.progress);
          }}
          className="h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 text-sm focus-visible:border-teal focus-visible:outline-none"
        >
          {opere.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} · {o.progress}%
            </option>
          ))}
        </select>
      </Field>

      <Field label={`Avanzamento: ${progress}%`} htmlFor="progress">
        <input
          id="progress"
          name="progress"
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full accent-[var(--teal)]"
        />
      </Field>

      <Field label="Nota di aggiornamento" htmlFor="note">
        <Input
          id="note"
          name="note"
          maxLength={300}
          required
          placeholder="Es. Completata la posa degli impianti."
        />
      </Field>

      <div className="flex justify-end">
        <SubmitButton pendingText="Aggiornamento…">
          Aggiorna cantiere
        </SubmitButton>
      </div>
    </form>
  );
}
