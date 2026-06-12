import { MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  "Spiegamelo semplice" (A2 §11, versione redazionale): la traduzione in
  linguaggio cittadino di un contenuto amministrativo. Il testo arriva dal
  seed (redazione del Comune) — la versione AI resta un'idea 💡 in roadmap,
  e quando arriverà dovrà dichiararsi come tale.
*/

export function SimpleExplainer({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-sm)] border border-teal/25 bg-teal-soft/40 p-4",
        className,
      )}
    >
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal">
        <MessageCircleQuestion size={14} aria-hidden />
        Spiegamelo semplice
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{text}</p>
      <p className="mt-2 text-[11px] text-muted-2">
        Versione semplificata a cura della redazione · fa fede il testo ufficiale
      </p>
    </div>
  );
}
