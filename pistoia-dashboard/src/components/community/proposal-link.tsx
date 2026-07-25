"use client";

import type { ReactNode } from "react";

import { SharedElementLink } from "@/components/app/shared-element-link";
import { CONDIVISO } from "@/lib/view-transitions";

/**
 * Link a una proposta con la transizione a elemento condiviso lista → dettaglio.
 * Il meccanismo sta in `SharedElementLink`; qui resta la forma dell'URL e
 * l'attributo gemello delle proposte.
 */
export function ProposalLink({
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
      href={`/proposte/${id}`}
      target={CONDIVISO.proposta}
      className={className}
    >
      {children}
    </SharedElementLink>
  );
}
