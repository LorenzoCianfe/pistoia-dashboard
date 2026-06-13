"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Compass, X } from "lucide-react";
import { TOUR_START_EVENT } from "./command-palette";

/*
  Invito al tour per i nuovi account (O4): finché l'utente non ha mai concluso
  il tour guidato, una scheda discreta lo propone. "Più tardi" la nasconde per
  la sessione; il tour concluso (o la checklist archiviata) la spegne per
  sempre — la condizione arriva dal server via prop.
*/

const LATER_KEY = "pst-tour-later";

const subscribeNoop = () => () => {};

export function TourOffer() {
  // Cliente-only: evita mismatch di idratazione (sessionStorage non esiste in SSR).
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  if (!mounted) return null;
  return <TourOfferCard />;
}

function TourOfferCard() {
  const pathname = usePathname();
  // L'inizializzatore legge sessionStorage una sola volta, lato client.
  const [open, setOpen] = useState(
    () => sessionStorage.getItem(LATER_KEY) !== "1",
  );

  // Sulla home la checklist "primi passi" propone già il tour: niente doppioni.
  if (!open || pathname === "/la-mia-citta") return null;

  const start = () => {
    setOpen(false);
    sessionStorage.setItem(LATER_KEY, "1");
    window.dispatchEvent(new Event(TOUR_START_EVENT));
  };
  const later = () => {
    setOpen(false);
    sessionStorage.setItem(LATER_KEY, "1");
  };

  return (
    <div
      role="complementary"
      aria-label="Invito alla presentazione guidata"
      className="card fixed inset-x-4 bottom-20 z-30 mx-auto max-w-sm p-4 lg:bottom-6 lg:right-6 lg:left-auto lg:mx-0 lg:w-80 print:hidden"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full gradient-teal-viola text-white" aria-hidden>
          <Compass size={19} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug">Prima volta qui?</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Fai il giro guidato della piattaforma: 2 minuti, dieci passi.
          </p>
        </div>
        <button
          type="button"
          onClick={later}
          aria-label="Chiudi l'invito"
          className="-mr-1 -mt-1 grid size-7 shrink-0 place-items-center rounded-full text-muted-2 transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <X size={14} />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={start}
          className="gradient-teal-viola inline-flex h-8 items-center rounded-pill px-3.5 text-xs font-semibold text-white transition-[filter] hover:brightness-105"
        >
          Inizia il tour
        </button>
        <button
          type="button"
          onClick={later}
          className="inline-flex h-8 items-center rounded-pill border border-border-strong px-3.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          Più tardi
        </button>
      </div>
    </div>
  );
}
