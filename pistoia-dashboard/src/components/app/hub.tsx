import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  Pezzi condivisi delle tre pagine-contenitore (Fase A, A-2): Partecipa,
  Trasparenza, Territorio.

  La regola che le governa sta in `docs/piano-esecuzione-fase-a.md` A-2: un hub
  che elenca soltanto non consolida niente, sposta il clic — l'utente ne fa due
  dove prima ne faceva uno. Per questo `HubNow` viene PRIMA di `HubSections`:
  la destinazione apre su cosa sta succedendo adesso, e l'elenco delle sezioni
  è la seconda cosa che si legge, non la prima.
*/

/** Una cifra viva in apertura di hub: cosa è aperto, in corso, in scadenza. */
export type HubStat = {
  value: number | string;
  label: string;
  href: string;
};

export function HubNow({ stats }: { stats: HubStat[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <Link
          key={s.href + s.label}
          href={s.href}
          className="card card-hover flex items-baseline gap-2.5 p-4"
        >
          <span className="font-display text-[28px] font-semibold leading-none tracking-tight tabular-nums text-teal">
            {s.value}
          </span>
          <span className="min-w-0 text-sm leading-snug text-muted">{s.label}</span>
        </Link>
      ))}
    </div>
  );
}

export type HubSection = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Riga di stato viva. `null` quando la sezione non ha nulla di aperto. */
  status?: string | null;
};

export function HubSections({
  sections,
  className,
}: {
  sections: HubSection[];
  className?: string;
}) {
  return (
    // `grid-cols-1` accanto a `sm:grid-cols-2` non è ridondante: senza, sotto
    // la soglia sm la traccia implicita è `auto`, il cui minimo è il
    // min-content — e una riga di stato non spezzabile allarga la colonna
    // oltre il viewport (AGENTS.md §3, ondata 7, trappola 5).
    <ul className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      {sections.map((s) => {
        const Icon = s.icon;
        return (
          <li key={s.href}>
            <Link
              href={s.href}
              className="card card-hover group flex h-full items-start gap-3.5 p-4 sm:p-5"
            >
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-teal-soft text-teal">
                <Icon size={18} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold tracking-tight">{s.label}</span>
                  <ArrowRight
                    size={14}
                    aria-hidden
                    className="shrink-0 text-muted-2 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">
                  {s.description}
                </span>
                {s.status ? (
                  <span className="mt-2 block text-xs font-medium text-teal">
                    {s.status}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
