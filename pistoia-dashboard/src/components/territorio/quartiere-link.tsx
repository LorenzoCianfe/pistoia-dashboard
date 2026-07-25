"use client";

import type { ReactNode } from "react";

import { SharedElementLink } from "@/components/app/shared-element-link";
import { CONDIVISO } from "@/lib/view-transitions";

/**
 * Link a un quartiere con la transizione a elemento condiviso lista → dettaglio.
 * Il meccanismo sta in `SharedElementLink`; qui resta la forma dell'URL — che
 * per i quartieri usa lo slug, non l'id — e l'attributo gemello.
 */
export function QuartiereLink({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <SharedElementLink
      href={`/quartieri/${slug}`}
      target={CONDIVISO.quartiere}
      className={className}
    >
      {children}
    </SharedElementLink>
  );
}
