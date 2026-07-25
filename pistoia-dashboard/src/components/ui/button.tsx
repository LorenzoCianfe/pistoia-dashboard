import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Bottone Pistoia.
 *
 * Lo stile vive in `globals.css` come classi (`.btn`, `.btn-primary`, …), non
 * qui. Motivo: in più punti serve un `<Link>` vestito da bottone, e un
 * componente React non può vestire un link. Con le classi, `Button` e
 * `buttonClasses` condividono un'unica fonte di verità e non divergono.
 *
 * Perché non `Button` di Astryx: la 0.1.8 espone solo classi atomiche StyleX,
 * senza il gancio stabile `.astryx-button` che la documentazione promette —
 * quindi non c'è modo di dare a un link lo stesso aspetto. Quando quelle classi
 * arriveranno, questo file può diventare un wrapper sottile senza toccare le
 * chiamate esistenti.
 *
 * Revisione 2026-07-25: rimossi gradiente teal→viola e ombra colorata. Erano
 * l'ultimo residuo dei bagliori che il sistema ha eliminato dalle superfici.
 */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

/** Per i `<Link>` e per qualunque elemento che debba sembrare un bottone. */
export const buttonClasses = (
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) => cn("btn", `btn-${variant}`, `btn-${size}`, className);
