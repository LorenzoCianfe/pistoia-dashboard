import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  Settings,
  ShieldCheck,
  Palette,
  LogOut,
  KeyRound,
  Bell,
  Lock,
  HeartHandshake,
} from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { logoutEverywhereAction } from "@/app/actions/profile";
import { getNotifPrefs } from "@/lib/data/preferences";
import { Card, CardEyebrow } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/impostazioni/change-password-form";
import { ThemeSelector } from "@/components/impostazioni/theme-selector";
import { NotificationPreferencesForm } from "@/components/impostazioni/notification-preferences-form";
import { PrivacyControls } from "@/components/impostazioni/privacy-controls";
import { CivicInterestsForm } from "@/components/impostazioni/civic-interests-form";
import { SimpleModeToggle } from "@/components/impostazioni/simple-mode-toggle";
import { SIMPLE_MODE_COOKIE } from "@/lib/ui-prefs";

export const metadata: Metadata = { title: "Impostazioni" };

/**
 * L'indice in cima, e perché serve proprio qui.
 *
 * La pagina impila sei riquadri di peso identico: su telefono sono quattro
 * schermate di scorrimento senza un punto di riferimento, e chi arriva sa già
 * *cosa* cerca — la password, il tema, il consenso alla geolocalizzazione — ma
 * non ha modo di sapere dove sia senza scorrere tutto. È la stessa situazione
 * di /organigramma e /glossario: un elenco in cui si cerca **una** voce, non un
 * racconto che si legge in ordine.
 */
const SEZIONI = [
  { id: "temi-civici", label: "I tuoi temi" },
  { id: "notifiche", label: "Notifiche" },
  { id: "aspetto", label: "Aspetto" },
  { id: "password", label: "Password" },
  { id: "accesso", label: "Accesso e dispositivi" },
  { id: "privacy", label: "Privacy e dati" },
];

export default async function ImpostazioniPage() {
  const user = await requireUser();
  const prefs = await getNotifPrefs(user.id);
  const simpleMode = (await cookies()).get(SIMPLE_MODE_COOKIE)?.value === "1";

  return (
    <div className="mx-auto max-w-2xl space-y-5 page-enter">
      <SectionHeader
        eyebrow="Account e preferenze"
        title="Impostazioni"
        icon={<Settings size={22} />}
      />

      <Card>
        <CardEyebrow>Cosa puoi cambiare</CardEyebrow>
        <ul className="mt-3 flex flex-wrap gap-2">
          {SEZIONI.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="inline-flex rounded-pill border border-border bg-surface-2/60 px-3 py-1.5 text-sm transition-colors hover:border-border-strong hover:bg-surface-2"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </Card>

      {/* Temi civici (A2 §3) */}
      <Card id="temi-civici" className="scroll-mt-24">
        <div className="flex items-center gap-2">
          <HeartHandshake size={18} className="text-teal" />
          <h2 className="text-base font-semibold">I tuoi temi</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          La home &ldquo;Per te&rdquo; mostra prima le novità sui temi che scegli qui.
        </p>
        <div className="mt-4">
          <CivicInterestsForm interests={user.civicInterests} />
        </div>
      </Card>

      {/* Notifiche */}
      <Card id="notifiche" className="scroll-mt-24">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Notifiche</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Scegli di cosa vuoi essere avvisato.
        </p>
        <div className="mt-3">
          <NotificationPreferencesForm prefs={prefs} />
        </div>
      </Card>

      {/* Aspetto */}
      <Card id="aspetto" className="scroll-mt-24">
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
        <div className="mt-4 border-t border-border pt-4">
          <SimpleModeToggle enabled={simpleMode} />
        </div>
      </Card>

      {/*
        Due riquadri parlavano entrambi di sicurezza e si chiamavano «Cambia
        password» e «Sicurezza dell'account»: nell'indice sarebbero state due
        voci indistinguibili. Ora una è l'azione (Password) e l'altra è lo stato
        (Accesso e dispositivi), che è anche la differenza vera fra le due.
      */}
      <Card id="password" className="scroll-mt-24">
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Password</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Per la tua sicurezza, le password sono protette con hashing Argon2id.
        </p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </Card>

      {/* Sessioni */}
      <Card id="accesso" className="scroll-mt-24">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Accesso e dispositivi</h2>
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

      {/* Privacy e dati (§23) */}
      <Card id="privacy" className="scroll-mt-24">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Privacy e dati</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Gestisci il consenso alla geolocalizzazione, esporta i tuoi dati o cancella l&apos;account.
        </p>
        <div className="mt-4">
          <PrivacyControls geoConsent={user.geoConsent} />
        </div>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-4 text-xs text-muted-2">
          <Link href="/privacy" className="hover:text-foreground">Informativa privacy</Link>
          <Link href="/cookie" className="hover:text-foreground">Cookie policy</Link>
          <Link href="/note-comunita" className="hover:text-foreground">Regole della community</Link>
        </p>
      </Card>

      <p className="px-1 text-xs text-muted-2">
        Dashboard di Pistoia · progetto dimostrativo. I dati mostrati sono di
        esempio.
      </p>
    </div>
  );
}
