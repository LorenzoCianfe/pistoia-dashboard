import Link from "next/link";
import { Crest } from "@/components/brand/crest";
import { PreviewBadge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const highlights = [
  "Il bilancio della città, leggibile in 30 secondi",
  "I cantieri che avanzano, in tempo reale",
  "La tua voce nei sondaggi del Comune",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 gradient-teal-viola opacity-[0.92]" />
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-3 text-white">
          <Crest className="h-11 w-auto drop-shadow" />
          <span className="text-lg font-bold tracking-tight">
            Comune di Pistoia
          </span>
        </div>

        <div className="relative max-w-md text-white">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            I dati della tua città, finalmente leggibili.
          </h2>
          <ul className="mt-8 space-y-3.5">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-white/90">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/20">
                  <span className="size-2 rounded-full bg-white" />
                </span>
                <span className="text-[15px]">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/70">
          Un progetto civico · dati dimostrativi
        </p>
      </aside>

      {/* Form side */}
      <main className="relative flex flex-col">
        <header className="flex items-center justify-between p-5 sm:p-6">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <Crest className="h-9 w-auto" />
            <span className="font-bold tracking-tight">Comune di Pistoia</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <PreviewBadge />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
