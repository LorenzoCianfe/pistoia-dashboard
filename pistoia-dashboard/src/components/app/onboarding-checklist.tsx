"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  Check,
  Compass,
  HeartHandshake,
  BadgeCheck,
  Eye,
  Vote,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TOUR_START_EVENT } from "./command-palette";
import { dismissOnboardingAction } from "@/app/actions/onboarding";
import type { OnboardingStep, OnboardingStepKey } from "@/lib/onboarding";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/*
  Onboarding "primi passi in città" (O4, ROADMAP §6): checklist progressiva
  delle prime azioni utili. I passi si spuntano da soli usando la piattaforma;
  niente wizard bloccanti — solo una guida che sparisce quando ha finito il
  suo lavoro (o quando l'utente la nasconde).
*/

const STEP_META: Record<
  OnboardingStepKey,
  { label: string; description: string; href: string | null; cta: string; icon: LucideIcon }
> = {
  tour: {
    label: "Fai il giro guidato",
    description: "Dieci passi, due minuti: scopri dove trovi tutto.",
    href: null, // avvia il tour, non naviga
    cta: "Avvia il tour",
    icon: Compass,
  },
  interests: {
    label: "Scegli i tuoi temi",
    description: "La home mostrerà prima le novità che ti interessano.",
    href: "/impostazioni#temi-civici",
    cta: "Scegli i temi",
    icon: HeartHandshake,
  },
  verify: {
    label: "Verifica il profilo",
    description: "Serve per sostenere proposte e votare nelle consultazioni.",
    href: "/profilo",
    cta: "Richiedi la verifica",
    icon: BadgeCheck,
  },
  follow: {
    label: "Segui qualcosa che ti riguarda",
    description: "Un cantiere, il tuo quartiere, una proposta: gli aggiornamenti arrivano a te.",
    href: "/opere",
    cta: "Esplora le opere",
    icon: Eye,
  },
  participate: {
    label: "Partecipa la prima volta",
    description: "Vota un sondaggio, sostieni una proposta o aderisci a un'iniziativa.",
    href: "/sondaggi",
    cta: "Vai ai sondaggi",
    icon: Vote,
  },
};

export function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
  const [pending, startTransition] = useTransition();
  const done = steps.filter((s) => s.done).length;

  return (
    <Card className="border-teal/30 p-0">
      <div className="scacchiera h-1.5 w-full rounded-t-[var(--radius)] opacity-50" aria-hidden />
      <div className="p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-bold tracking-tight">
              Primi passi in città
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {done} di {steps.length} completati — la checklist si spunta da sola, al tuo ritmo.
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => void dismissOnboardingAction())}
            className="text-xs font-medium text-muted-2 transition-colors hover:text-foreground disabled:opacity-50"
          >
            Nascondi
          </button>
        </div>

        {/* Avanzamento */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-surface-2" aria-hidden>
          <div
            className="h-full rounded-pill gradient-teal-viola transition-[width] duration-500"
            style={{ width: `${(done / steps.length) * 100}%` }}
          />
        </div>

        <ul className="mt-4 space-y-1">
          {steps.map((s) => {
            const meta = STEP_META[s.key];
            return (
              <li
                key={s.key}
                className="flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-2.5"
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border",
                    s.done
                      ? "border-transparent bg-teal text-white"
                      : "border-border-strong text-muted-2",
                  )}
                  aria-hidden
                >
                  {s.done ? <Check size={14} strokeWidth={3} /> : <meta.icon size={14} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-semibold leading-snug",
                      s.done && "text-muted line-through decoration-border-strong",
                    )}
                  >
                    {meta.label}
                  </span>
                  {!s.done ? (
                    <span className="mt-0.5 hidden text-xs leading-snug text-muted-2 sm:block">
                      {meta.description}
                    </span>
                  ) : null}
                </span>
                {!s.done ? (
                  meta.href ? (
                    <Link
                      href={meta.href}
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-teal hover:underline"
                    >
                      {meta.cta}
                      <ArrowRight size={12} aria-hidden />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new Event(TOUR_START_EVENT))}
                      className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-teal-soft px-3 py-1.5 text-xs font-semibold text-teal transition-colors hover:bg-teal hover:text-white"
                    >
                      {meta.cta}
                    </button>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
