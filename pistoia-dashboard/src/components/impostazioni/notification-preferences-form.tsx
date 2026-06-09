"use client";

import { useActionState } from "react";
import {
  updateNotifPrefsAction,
  type PrefsState,
} from "@/app/actions/preferences";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import type { NotifPrefs } from "@/lib/data/preferences";

const OPTIONS: { name: keyof NotifPrefs; label: string; hint: string }[] = [
  { name: "neighborhood", label: "Il mio quartiere", hint: "Novità e segnalazioni nella tua zona" },
  { name: "followedItems", label: "Elementi che seguo", hint: "Aggiornamenti su cantieri, segnalazioni e proposte seguite" },
  { name: "polls", label: "Sondaggi e consultazioni", hint: "Nuovi sondaggi pubblici e consultazioni" },
  { name: "proposals", label: "Proposte", hint: "Risposte del Comune alle proposte" },
  { name: "generalDiscussions", label: "Discussioni generali", hint: "Attività generale della community" },
  { name: "urgent", label: "Avvisi urgenti", hint: "Allerte e comunicazioni importanti del Comune" },
];

export function NotificationPreferencesForm({ prefs }: { prefs: NotifPrefs }) {
  const [state, action] = useActionState<PrefsState, FormData>(
    updateNotifPrefsAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-3">
      {state?.ok ? <Alert variant="success">Preferenze salvate.</Alert> : null}

      <ul className="divide-y divide-border">
        {OPTIONS.map((o) => (
          <li key={o.name} className="flex items-center justify-between gap-4 py-3">
            <label htmlFor={`pref-${o.name}`} className="min-w-0">
              <span className="block text-sm font-medium">{o.label}</span>
              <span className="block text-xs text-muted-2">{o.hint}</span>
            </label>
            <input
              id={`pref-${o.name}`}
              name={o.name}
              type="checkbox"
              defaultChecked={prefs[o.name]}
              className="size-5 shrink-0 cursor-pointer accent-[var(--teal)]"
            />
          </li>
        ))}
      </ul>

      <SubmitButton size="sm" pendingText="Salvataggio…">
        Salva preferenze
      </SubmitButton>
    </form>
  );
}
