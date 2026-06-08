import type { Metadata } from "next";
import { Settings, ShieldCheck, Palette, LogOut, KeyRound } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { logoutEverywhereAction } from "@/app/actions/profile";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/impostazioni/change-password-form";
import { ThemeSelector } from "@/components/impostazioni/theme-selector";

export const metadata: Metadata = { title: "Impostazioni" };

export default async function ImpostazioniPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SectionHeader
        eyebrow="Account e preferenze"
        title="Impostazioni"
        icon={<Settings size={22} />}
      />

      {/* Aspetto */}
      <Card>
        <div className="flex items-center gap-2">
          <Palette size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Aspetto</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Scegli il tema dell&apos;applicazione.
        </p>
        <div className="mt-4">
          <ThemeSelector />
        </div>
      </Card>

      {/* Sicurezza */}
      <Card>
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Cambia password</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Per la tua sicurezza, le password sono protette con hashing Argon2id.
        </p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </Card>

      {/* Sessioni */}
      <Card>
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Sicurezza dell&apos;account</h2>
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Protezione password</dt>
            <dd className="font-medium">Argon2id</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Sessione</dt>
            <dd className="font-medium">Cookie HttpOnly · 30 giorni</dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-border pt-4">
          <form action={logoutEverywhereAction}>
            <Button type="submit" variant="danger" size="sm">
              <LogOut size={15} />
              Esci da tutti i dispositivi
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-2">
            Disconnette ogni sessione attiva, su questo e sugli altri
            dispositivi.
          </p>
        </div>
      </Card>

      <p className="px-1 text-xs text-muted-2">
        Dashboard di Pistoia · progetto dimostrativo. I dati mostrati sono di
        esempio.
      </p>
    </div>
  );
}
