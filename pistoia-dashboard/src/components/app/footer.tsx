import Link from "next/link";
import { Crest } from "@/components/brand/crest";

const LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/cookie", label: "Cookie" },
  { href: "/note-comunita", label: "Regole community" },
  { href: "/mappa", label: "Mappa" },
];

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-white shadow-sm ring-1 ring-border">
            <Crest className="h-4 w-auto" />
          </span>
          <div className="text-xs text-muted-2">
            <p className="font-semibold text-muted">Dashboard di Pistoia</p>
            <p>Progetto dimostrativo · dati di esempio</p>
          </div>
        </div>
        <nav aria-label="Link istituzionali" className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted-2 transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
