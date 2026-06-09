import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Wallet,
  HardHat,
  Vote,
  MessagesSquare,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { Crest } from "@/components/brand/crest";
import { PreviewBadge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonClasses } from "@/components/ui/button";

const sections = [
  {
    icon: Wallet,
    title: "Bilancio",
    text: "Dove vanno i 142 milioni della città, senza scaricare un PDF.",
    color: "var(--teal)",
  },
  {
    icon: HardHat,
    title: "Opere",
    text: "Ogni cantiere, con la sua percentuale di avanzamento in tempo reale.",
    color: "var(--viola)",
  },
  {
    icon: Vote,
    title: "Sondaggi",
    text: "Il Comune chiede, i cittadini rispondono. La tua voce conta.",
    color: "var(--amber)",
  },
  {
    icon: MessagesSquare,
    title: "Comunità",
    text: "Domande pubbliche e risposte ufficiali, visibili a tutti.",
    color: "var(--green)",
  },
];

export default async function LandingPage() {
  if (await getCurrentUser()) redirect("/la-mia-citta");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <Crest className="h-9 w-auto" />
          <span className="font-bold tracking-tight">Comune di Pistoia</span>
          <PreviewBadge className="ml-1 hidden sm:inline-flex" />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className={buttonClasses("secondary", "sm")}>
            Accedi
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-12 sm:px-8">
        <section className="max-w-3xl">
          <span
            className="inline-flex items-center gap-2 rounded-pill px-3 py-1 text-xs font-semibold"
            style={{
              color: "var(--teal-strong)",
              backgroundColor: "var(--teal-soft)",
            }}
          >
            Trasparenza civica · anteprima
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            I dati di Pistoia,
            <br />
            <span className="text-gradient">finalmente leggibili.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Bilancio, cantieri, sondaggi e la città che si risponde. Una sola app
            civica, chiara e veloce — pensata per i cittadini, non per i
            ragionieri.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/registrati" className={buttonClasses("primary", "lg")}>
              Crea un account
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className={buttonClasses("secondary", "lg")}>
              Accedi
            </Link>
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((s) => (
            <div key={s.title} className="card card-hover p-5">
              <span
                className="grid size-11 place-items-center rounded-[var(--radius-sm)]"
                style={{
                  color: s.color,
                  backgroundColor:
                    "color-mix(in oklab, " + s.color + " 14%, transparent)",
                }}
              >
                <s.icon size={22} />
              </span>
              <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-5 py-8 text-sm text-muted-2 sm:px-8">
        Progetto dimostrativo · i dati mostrati sono di esempio e non
        rappresentano fonti ufficiali.
      </footer>
    </div>
  );
}
