"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  changePasswordAction,
  type ProfileState,
} from "@/app/actions/profile";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function ChangePasswordForm() {
  const [state, action] = useActionState<ProfileState, FormData>(
    changePasswordAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state?.ok]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {state?.ok ? (
        <Alert variant="success">
          Password aggiornata. Le altre sessioni sono state disconnesse.
        </Alert>
      ) : null}
      {state?.error ? <Alert>{state.error}</Alert> : null}

      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label="Password attuale"
        autoComplete="current-password"
        error={state?.fieldErrors?.currentPassword}
      />
      <PasswordField
        id="newPassword"
        name="newPassword"
        label="Nuova password"
        autoComplete="new-password"
        error={state?.fieldErrors?.newPassword}
        showStrength
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Conferma nuova password"
        autoComplete="new-password"
        error={state?.fieldErrors?.confirmPassword}
      />

      <div className="flex justify-end">
        <SubmitButton pendingText="Aggiornamento…">
          Aggiorna password
        </SubmitButton>
      </div>
    </form>
  );
}
