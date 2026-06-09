"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type AuthState } from "@/app/actions/auth";
import { Field, Input } from "@/components/ui/input";
import { PasswordField } from "./password-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { PASSWORD_MIN } from "@/lib/auth/validation";

export function RegisterForm() {
  const [state, action] = useActionState<AuthState, FormData>(
    signupAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.error ? <Alert>{state.error}</Alert> : null}

      <Field label="Nome e cognome" htmlFor="name" error={state?.fieldErrors?.name}>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Mario Rossi"
          defaultValue={state?.values?.name}
          invalid={!!state?.fieldErrors?.name}
          required
        />
      </Field>

      <Field label="Tipo di account" htmlFor="accountType">
        <select
          id="accountType"
          name="accountType"
          defaultValue="CITIZEN"
          className="h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 text-sm text-foreground focus-visible:border-teal focus-visible:outline-none"
        >
          <option value="CITIZEN">Cittadino</option>
          <option value="ASSOCIATION">Associazione</option>
          <option value="BUSINESS">Attività locale</option>
        </select>
      </Field>

      <Field label="Email" htmlFor="email" error={state?.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nome@esempio.it"
          defaultValue={state?.values?.email}
          invalid={!!state?.fieldErrors?.email}
          required
        />
      </Field>

      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="new-password"
        error={state?.fieldErrors?.password}
        showStrength
      />

      <p className="text-xs text-muted-2">
        Almeno {PASSWORD_MIN} caratteri, con almeno una lettera e un numero.
      </p>

      <SubmitButton className="w-full" pendingText="Creazione account…">
        Crea account
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        Hai già un account?{" "}
        <Link href="/login" className="font-semibold text-teal hover:underline">
          Accedi
        </Link>
      </p>
    </form>
  );
}
