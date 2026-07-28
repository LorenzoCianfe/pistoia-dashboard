"use client";

import type { ReactNode } from "react";

import { SharedElementLink } from "@/components/app/shared-element-link";
import { CONDIVISO } from "@/lib/view-transitions";

/**
 * Link a una segnalazione con la transizione a elemento condiviso.
 *
 * Il meccanismo sta in `SharedElementLink` — qui resta solo ciò che è proprio
 * delle segnalazioni: la forma dell'URL e quale coppia di nomi usare.
 */
export function ReportLink({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <SharedElementLink
      href={`/segnalazioni/${id}`}
      target={CONDIVISO.segnalazione}
      className={className}
    >
      {children}
    </SharedElementLink>
  );
}
