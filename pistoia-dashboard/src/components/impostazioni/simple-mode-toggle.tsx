"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { SIMPLE_MODE_COOKIE } from "@/lib/ui-prefs";
import { buttonClasses } from "@/components/ui/button";

// Toggle della modalità semplice (A1 §19). Scrive un cookie di preferenza
// (non sensibile) e ricarica i server component: testo più grande ovunque,
// home ridotta alle quattro azioni essenziali.

function writeCookie(on: boolean) {
  document.cookie = `${SIMPLE_MODE_COOKIE}=${on ? "1" : "0"}; path=/; max-age=31536000; SameSite=Lax`;
}

export function SimpleModeToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [pending, startTransition] = useTransition();

  function change(next: boolean) {
    setOn(next);
    writeCookie(next);
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <label htmlFor="simple-mode" className="min-w-0">
        <span className="block text-sm font-medium">Interfaccia semplificata</span>
        <span className="block text-xs text-muted-2">
          Testo più grande e home ridotta alle azioni essenziali. Pensata per chi
          ha meno confidenza con il digitale.
        </span>
      </label>
      <input
        id="simple-mode"
        type="checkbox"
        checked={on}
        onChange={(e) => change(e.target.checked)}
        aria-busy={pending}
        className="size-5 shrink-0 cursor-pointer accent-[var(--teal)]"
      />
    </div>
  );
}

/** Uscita rapida dalla home semplificata, senza passare dalle impostazioni. */
export function SimpleModeExit() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={buttonClasses("secondary", "sm")}
      onClick={() => {
        writeCookie(false);
        startTransition(() => router.refresh());
      }}
    >
      <LayoutGrid size={15} />
      Passa alla vista completa
    </button>
  );
}
