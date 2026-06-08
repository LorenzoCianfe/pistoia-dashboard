"use client";

import { useActionState, useState } from "react";
import { Check } from "lucide-react";
import {
  updateProfileAction,
  type ProfileState,
} from "@/app/actions/profile";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { ACCENTS, accent, type AccentColor } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/auth/dal";

const COLOR_NAMES: Record<AccentColor, string> = {
  teal: "verde acqua",
  viola: "viola",
  amber: "ambra",
  red: "rosso",
  green: "verde",
};

export function ProfileForm({ user }: { user: CurrentUser }) {
  const [state, action] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    undefined,
  );
  const [color, setColor] = useState<string>(user.avatarColor);
  const [name, setName] = useState(user.name);

  return (
    <Card>
      <h2 className="text-base font-semibold">Modifica profilo</h2>
      <p className="text-sm text-muted">
        Aggiorna i tuoi dati e l&apos;aspetto del tuo avatar.
      </p>

      <form action={action} className="mt-5 space-y-4">
        {state?.ok ? (
          <Alert variant="success">Profilo aggiornato con successo.</Alert>
        ) : null}

        <div className="flex items-center gap-4">
          <Avatar name={name || user.name} color={color} size="xl" />
          <div>
            <p className="text-sm font-medium">Colore avatar</p>
            <div className="mt-2 flex gap-2">
              {ACCENTS.map((c: AccentColor) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Colore ${COLOR_NAMES[c]}`}
                  aria-pressed={color === c}
                  className={cn(
                    "grid size-8 place-items-center rounded-full transition-transform",
                    color === c && "scale-110",
                  )}
                  style={{ backgroundColor: accent(c).fg }}
                >
                  {color === c ? (
                    <Check size={15} className="text-white" strokeWidth={3} />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
          <input type="hidden" name="avatarColor" value={color} />
        </div>

        <Field label="Nome e cognome" htmlFor="name" error={state?.fieldErrors?.name}>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            invalid={!!state?.fieldErrors?.name}
          />
        </Field>

        <Field
          label="Quartiere"
          htmlFor="quartiere"
          error={state?.fieldErrors?.quartiere}
        >
          <Input
            id="quartiere"
            name="quartiere"
            defaultValue={user.quartiere ?? ""}
            placeholder="Es. Centro storico"
          />
        </Field>

        <Field label="Bio" htmlFor="bio" error={state?.fieldErrors?.bio}>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={280}
            defaultValue={user.bio ?? ""}
            placeholder="Racconta qualcosa di te…"
            className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--teal)_30%,transparent)]"
          />
        </Field>

        <div className="flex justify-end">
          <SubmitButton pendingText="Salvataggio…">Salva modifiche</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
