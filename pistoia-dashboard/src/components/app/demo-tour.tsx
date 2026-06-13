"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { TOUR_START_EVENT } from "./command-palette";
import { completeTourAction } from "@/app/actions/onboarding";
import { cn } from "@/lib/utils";

/*
  Modalità presentazione (ROADMAP O0, → OB-4): la piattaforma si racconta da
  sola. Una scheda non modale guida tra le pagine principali; la pagina sotto
  resta esplorabile. Si avvia dalla command palette ("Avvia la presentazione
  guidata") e si chiude con Esc o con la X.
*/

type Step = {
  route: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    route: "/la-mia-citta",
    title: "La tua città, in una pagina",
    body: "La home parte da te: percorsi guidati per segnalare, proporre e capire, più un feed costruito sui tuoi temi di interesse.",
  },
  {
    route: "/bilancio",
    title: "Dove vanno i soldi",
    body: "Il bilancio comunale, finalmente leggibile: ogni numero dichiara fonte e data di aggiornamento.",
  },
  {
    route: "/opere",
    title: "Le opere, seguibili nel tempo",
    body: "Ogni cantiere ha avanzamento, costi e aggiornamenti. Puoi seguire quelli che ti riguardano.",
  },
  {
    route: "/mappa",
    title: "La città sulla mappa",
    body: "Opere, segnalazioni, eventi e quartieri su livelli attivabili: la geografia delle cose che succedono.",
  },
  {
    route: "/segnalazioni",
    title: "Segnala in pochi passi",
    body: "Una buca, un lampione spento: foto, posizione, categoria. Lo stato della pratica è tracciato e visibile.",
  },
  {
    route: "/proposte",
    title: "Le idee diventano proposte",
    body: "I cittadini verificati propongono e sostengono: al raggiungimento delle soglie il Comune risponde.",
  },
  {
    route: "/comunita",
    title: "Domande pubbliche, risposte ufficiali",
    body: "Il dialogo con il Comune è pubblico e ordinato: niente botta e risposta dispersi sui social.",
  },
  {
    route: "/decisioni",
    title: "Cosa succede dopo la partecipazione",
    body: "Ogni proposta arriva a una decisione con il suo motivo — anche quando è un no. Promesse, avvisi urgenti e report mensile chiudono il cerchio della trasparenza.",
  },
  {
    route: "/question-time",
    title: "Il dialogo si fa strutturato",
    body: "Question time con domande votate, «Vota la priorità» sugli interventi, volontariato e patti di quartiere: gli strumenti per decidere e fare insieme.",
  },
  {
    route: "/quartieri",
    title: "Il tuo quartiere",
    body: "Ogni zona ha la sua pagina con il diario della settimana: segnalazioni risolte, cantieri e novità di chi ci vive.",
  },
  {
    route: "/impostazioni",
    title: "Su misura per chiunque",
    body: "Tema scuro, modalità semplice per chi vuole solo l'essenziale, preferenze sui temi civici. E con Ctrl+K cerchi e agisci ovunque.",
  },
];

export function DemoTour() {
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const goTo = useCallback(
    (index: number) => {
      const next = STEPS[index];
      if (!next) return;
      setStep(index);
      router.push(next.route);
    },
    [router],
  );

  // Avvio dal comando in palette.
  useEffect(() => {
    const onStart = () => {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      goTo(0);
    };
    window.addEventListener(TOUR_START_EVENT, onStart);
    return () => window.removeEventListener(TOUR_START_EVENT, onStart);
  }, [goTo]);

  const close = useCallback(() => {
    setStep(null);
    restoreFocusRef.current?.focus();
  }, []);

  // L'ultimo passo conclude davvero il tour: lo ricordiamo sul profilo, così
  // l'onboarding spunta il passo e l'invito non viene più riproposto.
  const finish = useCallback(() => {
    void completeTourAction();
    close();
  }, [close]);

  // Il focus va sulla scheda quando il tour parte; Esc chiude da ovunque.
  useEffect(() => {
    if (step === null) return;
    cardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step === null, close]); // eslint-disable-line react-hooks/exhaustive-deps -- rifocalizza solo all'apertura, non a ogni passo

  if (step === null) return null;
  const current = STEPS[step];
  const last = step === STEPS.length - 1;
  // Se l'utente naviga altrove a metà tour, la scheda resta e lo dice.
  const offRoute = pathname !== current.route;

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label={`Presentazione guidata, passo ${step + 1} di ${STEPS.length}`}
      tabIndex={-1}
      className="card fixed inset-x-4 bottom-20 z-40 mx-auto max-w-md p-0 outline-none lg:bottom-6 lg:right-6 lg:left-auto lg:mx-0 lg:w-96 print:hidden"
    >
      {/* Filo rosso identitario: la scacchiera dello stemma. */}
      <div className="scacchiera h-1.5 w-full rounded-t-[var(--radius)] opacity-60" aria-hidden />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            Presentazione · {step + 1} di {STEPS.length}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Chiudi la presentazione"
            className="-mr-1 -mt-1 grid size-8 place-items-center rounded-full text-muted-2 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
        <h2 className="font-display mt-1.5 text-xl font-semibold tracking-tight">
          {current.title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {current.body}
        </p>
        {offRoute ? (
          <button
            type="button"
            onClick={() => router.push(current.route)}
            className="mt-2 text-sm font-medium text-teal hover:underline"
          >
            Torna alla pagina di questo passo →
          </button>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          {/* Avanzamento a tacche: leggibile a colpo d'occhio. */}
          <div className="flex gap-1" aria-hidden>
            {STEPS.map((s, i) => (
              <span
                key={s.route}
                className={cn(
                  "h-1.5 rounded-pill transition-all",
                  i === step ? "w-5 bg-teal" : "w-1.5 bg-border-strong",
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                aria-label="Passo precedente"
                className="grid size-9 place-items-center rounded-pill border border-border-strong text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <ArrowLeft size={16} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={last ? finish : () => goTo(step + 1)}
              className="gradient-teal-viola inline-flex h-9 items-center gap-1.5 rounded-pill px-4 text-sm font-semibold text-white transition-[filter] hover:brightness-105"
            >
              {last ? "Concludi" : "Avanti"}
              {last ? null : <ArrowRight size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
