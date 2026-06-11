"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

// Hydration-safe "siamo sul client?" senza setState-in-effect:
// lato server restituisce false, al primo render client true.
const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  // Gate su `mounted`: il server non conosce il tema risolto, quindi durante
  // l'hydration entrambi i lati devono rendere lo stesso label (no mismatch).
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Passa al tema chiaro" : "Passa al tema scuro"}
      className={cn(
        "grid size-9 place-items-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-foreground hover:bg-surface-2",
        className,
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun size={18} />
        ) : (
          <Moon size={18} />
        )
      ) : (
        <span className="size-[18px]" />
      )}
    </button>
  );
}
