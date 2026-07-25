"use client";

import type { ReactNode } from "react";

import { SharedElementLink } from "@/components/app/shared-element-link";
import { CONDIVISO } from "@/lib/view-transitions";

/**
 * Link a un cantiere con la transizione a elemento condiviso lista → dettaglio.
 * Il meccanismo sta in `SharedElementLink`; qui resta solo la forma dell'URL e
 * la coppia di nomi delle opere.
 */
export function OperaLink({
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
      href={`/opere/${id}`}
      target={CONDIVISO.opera}
      className={className}
    >
      {children}
    </SharedElementLink>
  );
}
