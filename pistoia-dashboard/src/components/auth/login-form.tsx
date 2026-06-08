"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { Field, Input } from "@/components/ui/input";
import { PasswordField } from "./password-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state?.error ? <Alert>{state.error}</Alert> : null}

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
        autoComplete="current-password"
        error={state?.fieldErrors?.password}
      />

      <SubmitButton className="w-full" pendingText="Accesso in corso…">
        Accedi
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        Non hai un account?{" "}
        <Link
          href="/registrati"
          className="font-semibold text-teal hover:underline"
        >
          Registrati
        </Link>
      </p>
    </form>
  );
}
