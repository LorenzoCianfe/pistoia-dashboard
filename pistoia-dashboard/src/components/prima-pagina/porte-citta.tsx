import Link from "next/link";
import { ArrowRight, Lock, MapPin, ClipboardCheck, Megaphone } from "lucide-react";

/**
 * LE TRE PORTE — dove si va dalla prima pagina.
 *
 * Sono i tre magneti del lancio che non sono già in pagina: gli atti li porta
 * la prima pagina stessa (`direzione-prodotto.md` §1.6), qui ci sono il
 * quartiere, la pagella e l'azione.
 *
 * ⚠️ **Il lucchetto dice la verità di oggi, e non è un ornamento.** Tutte e tre
 * le destinazioni vivono nel gruppo `(app)`, il cui layout chiama
 * `requireUser()`: per un visitatore anonimo sono chiuse. Il layout `(pubblico)`
 * ha già scritto la regola che ne discende — *un menu di porte chiuse è una
 * presa in giro* — e la via d'uscita non è nascondere le porte, è dichiararle:
 * è la stessa scelta che il footer fa dal 2026-08-05 con la sua riga
 * «Avvisi, organigramma, FAQ e glossario si aprono con un account».
 *
 * Le due chiusure però **non sono la stessa cosa**, e il testo lo distingue:
 * *segnalare* è un'azione, e l'account lo chiede per disegno (§1.6-bis.1,
 * «l'account serve solo per agire»); *leggere* il quartiere e la pagella no —
 * lì il conto è un residuo dell'assetto precedente, e cade col riordino delle
 * sezioni, che è il passo successivo di O10. Nessuna data promessa in pagina.
 */

type Porta = {
  href: string;
  icona: typeof MapPin;
  titolo: string;
  testo: string;
  colore: string;
  /** `azione` = l'account è il disegno; `lettura` = è un residuo che cadrà. */
  chiusura: "azione" | "lettura";
};

const PORTE: Porta[] = [
  {
    href: "/quartieri",
    icona: MapPin,
    titolo: "Il tuo quartiere",
    testo:
      "Che cosa succede dove abiti: gli atti che lo nominano, i cantieri, le segnalazioni aperte.",
    colore: "var(--teal)",
    chiusura: "lettura",
  },
  {
    href: "/pagella",
    icona: ClipboardCheck,
    titolo: "La pagella della città",
    testo:
      "Come sta Pistoia — sanità, scuola, ambiente — su dati ministeriali, con la fonte accanto a ogni voto.",
    colore: "var(--viola)",
    chiusura: "lettura",
  },
  {
    href: "/segnalazioni",
    icona: Megaphone,
    titolo: "Segnala un problema",
    testo:
      "Racconta cosa non va: la segnalazione è pubblica e il quartiere la conferma.",
    colore: "var(--amber)",
    chiusura: "azione",
  },
];

export function PorteCitta({ autenticato }: { autenticato: boolean }) {
  return (
    <section aria-labelledby="porte-titolo">
      <h2 id="porte-titolo" className="sr-only">
        Da qui si va
      </h2>
      {/* `grid-cols-1` accanto a `sm:grid-cols-3` non è ridondante: senza, sotto
          la soglia non esiste nessun `grid-template-columns` e la traccia
          implicita `auto` si ferma al min-content dei figli, che fa scorrere la
          pagina di lato a 360px (`AGENTS.md` §3, ondata 7, 5). */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PORTE.map((p) => {
          const Icona = p.icona;
          return (
            <li key={p.href}>
              <Link
                href={p.href}
                className="card card-hover group flex h-full flex-col p-5"
              >
                <span
                  aria-hidden
                  className="grid size-10 place-items-center rounded-[var(--radius-sm)]"
                  style={{
                    color: p.colore,
                    backgroundColor: `color-mix(in oklab, ${p.colore} 14%, transparent)`,
                  }}
                >
                  <Icona size={20} />
                </span>
                <span className="mt-4 flex items-center gap-1.5 text-base font-semibold tracking-tight">
                  {p.titolo}
                  <ArrowRight
                    size={15}
                    aria-hidden
                    className="text-muted-2 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </span>
                <span className="mt-1.5 text-sm leading-relaxed text-muted">
                  {p.testo}
                </span>
                {autenticato ? null : (
                  // Il lucchetto è INLINE dentro la frase e non un elemento
                  // flex accanto: da solo, in colonna stretta, finisce su una
                  // riga sua e sembra un guasto (`AGENTS.md` §3, Fase C, 5).
                  <span className="mt-3 text-xs text-muted-2">
                    <Lock
                      size={11}
                      aria-hidden
                      className="mr-1 inline-block align-[-1px]"
                    />
                    {p.chiusura === "azione"
                      ? "Serve un account: le azioni portano un nome."
                      : "Oggi serve un account."}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
