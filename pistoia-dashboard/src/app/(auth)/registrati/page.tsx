import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Registrati" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/la-mia-citta");

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight">Crea il tuo account</h1>
        <p className="mt-1.5 text-sm text-muted">
          Partecipa alla vita della tua città. Gratis, in un minuto.
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
