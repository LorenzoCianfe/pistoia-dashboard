import { Check, Plus } from "lucide-react";
import { ActionError } from "@/components/ui/action-error";
import { cn } from "@/lib/utils";

/*
  Aspetto e stati del pulsante "Segui", in un posto solo (Fase A, A-5.2).

  Esistono due pulsanti "Segui" perché esistono due modi di salvare un
  seguito, e la differenza è voluta: gli assessori hanno una tabella dedicata
  (`AssessoreFollow`) con una chiave esterna vera, mentre quartieri, opere,
  segnalazioni, proposte, sondaggi ed eventi usano la tabella polimorfica
  `Follow`, che una chiave esterna non può averla. Fondere i due strati
  perderebbe integrità referenziale — quindi restano due.

  A essere duplicato davvero era l'ASPETTO: due volte le stesse classi, le
  stesse icone, le stesse due etichette. Quello sta qui.

  Componente puramente presentazionale, senza `"use client"`: riceve `onClick`
  da un genitore che è già client, quindi nessuna funzione attraversa il
  confine server/client (AGENTS.md §3, ondata 7, trappola 1).
*/
export function FollowToggle({
  following,
  pending,
  onClick,
  error,
  size = "md",
  className,
}: {
  following: boolean;
  pending: boolean;
  onClick: () => void;
  error?: string | null;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-disabled={pending}
        aria-pressed={following}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-pill font-semibold transition-all active:scale-[0.98]",
          pending && "opacity-60",
          size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm",
          following
            ? "border border-border bg-surface-2 text-foreground"
            : "gradient-teal-viola text-white",
          className,
        )}
      >
        {following ? (
          <>
            <Check size={14} strokeWidth={2.5} />
            Segui già
          </>
        ) : (
          <>
            <Plus size={14} strokeWidth={2.5} />
            Segui
          </>
        )}
      </button>
      <ActionError error={error ?? null} />
    </>
  );
}
