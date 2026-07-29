"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Chiaro", icon: Sun },
  { value: "dark", label: "Scuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

// Hydration-safe "siamo sul client?" senza setState-in-effect.
const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const current = mounted ? theme : undefined;

  /*
    Il controllo era `inline-flex` con tre pastiglie a larghezza propria: non si
    stringeva, e in modalità semplice (scala 115%) misurava 328px contro i 276
    disponibili a 360px — 11px di traboccamento orizzontale su /impostazioni.
    Non si era mai visto perché la pagina è entrata nel cancello delle schermate
    solo ora (Fase B, terzo scaglione).

    Ora è a larghezza piena con i tre segmenti che si dividono lo spazio, che è
    anche la forma giusta di un segmented control sul telefono. Le icone
    spariscono sotto `sm`: sono decorative, le etichette dicono già tutto, e i
    21px che liberano sono ciò che fa entrare «Sistema» senza troncarlo.

    `min-h-11` porta il bersaglio a 44px: prima era ~33px, sotto il minimo
    dichiarato in DESIGN.md §11.
  */
  return (
    <div className="flex w-full rounded-pill border border-border bg-surface-2 p-1">
      {OPTIONS.map((o) => {
        const active = current === o.value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            className={cn(
              "inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-pill px-2 text-sm font-medium transition-colors sm:px-3.5",
              active
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            <Icon size={15} className="hidden shrink-0 sm:inline" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
