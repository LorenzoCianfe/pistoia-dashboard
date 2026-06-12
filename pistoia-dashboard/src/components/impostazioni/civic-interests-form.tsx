"use client";

import { useActionState } from "react";
import {
  updateCivicInterestsAction,
  type ProfileState,
} from "@/app/actions/profile";
import { CIVIC_TOPICS, type CivicTopicKey } from "@/lib/civic-topics";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Selettore a chips dei temi civici (A2 §3). Usato sia nelle impostazioni sia
// nell'onboarding in home: checkbox reali (accessibili), aspetto a pillola.

export function CivicInterestsForm({
  interests,
  submitLabel = "Salva i miei temi",
}: {
  interests: CivicTopicKey[];
  submitLabel?: string;
}) {
  const [state, action] = useActionState<ProfileState, FormData>(
    updateCivicInterestsAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      {state?.ok ? <Alert variant="success">Temi salvati. La tua home si adatta da subito.</Alert> : null}
      {state?.error ? <Alert>{state.error}</Alert> : null}

      <fieldset>
        <legend className="sr-only">Temi che ti interessano</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(CIVIC_TOPICS) as [CivicTopicKey, (typeof CIVIC_TOPICS)[CivicTopicKey]][]).map(
            ([key, topic]) => (
              <label
                key={key}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-1.5 rounded-pill border border-border-strong bg-surface px-3.5 py-2 text-sm font-medium text-muted transition-colors",
                  "hover:text-foreground",
                  "has-[:checked]:border-transparent has-[:checked]:bg-teal-soft has-[:checked]:text-teal",
                  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--ring)]",
                )}
              >
                <input
                  type="checkbox"
                  name="interests"
                  value={key}
                  defaultChecked={interests.includes(key)}
                  className="sr-only"
                />
                <span aria-hidden>{topic.emoji}</span>
                {topic.label}
              </label>
            ),
          )}
        </div>
      </fieldset>

      <SubmitButton size="sm" pendingText="Salvataggio…">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
