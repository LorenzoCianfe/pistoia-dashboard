import type { Metadata } from "next";
import {
  MessagesSquare,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { ChiPubblica } from "@/components/osservatorio/chi-pubblica";

export const metadata: Metadata = {
  title: "Pagella mensile della giunta",
  description:
    "La pagella dell'osservatorio civico: sei materie, un voto alla giunta, la metodologia che lo produce e la dichiarazione di chi la pubblica.",
};

/*
  La prima pagina di giudizio, e per ora **solo la sua impalcatura**.

  Esiste già a metà perché la dichiarazione di chi pubblica (ROADMAP.md §6,
  prerequisito 1) andava giudicata dove il difetto che corregge esiste
  davvero: sotto la barra in alto, che porta lo stemma del Comune. Una
  proposta su fondo neutro non avrebbe detto cosa cambia.

  Nessun voto è calcolato, e non per pigrizia: senza la metodologia versionata
  e senza i dati reali un voto sarebbe inventato, che `AGENTS.md` §2 vieta. Il
  posto del voto resta vuoto e dichiara perché — che è anche il modo in cui il
  vuoto resta disegnato invece che dimenticato (`DESIGN.md` §12).
*/

const MATERIE = [
  { nome: "Sicurezza", icona: ShieldCheck },
  { nome: "Decoro", icona: Sparkles },
  { nome: "Trasparenza", icona: ScrollText },
  { nome: "Spesa", icona: Wallet },
  { nome: "Ascolto", icona: MessagesSquare },
  { nome: "Promesse", icona: Target },
];

function Materia({
  nome,
  icona: Icona,
}: {
  nome: string;
  icona: typeof ShieldCheck;
}) {
  return (
    <Card className="min-w-0">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-teal">
          <Icona size={16} aria-hidden />
        </span>
        {nome}
      </p>
      <p
        className="mt-3 font-display text-[40px] font-light leading-none tracking-tight text-muted-2"
        aria-hidden
      >
        —
      </p>
      <p className="mt-2 text-xs text-muted">
        Nessun voto: la metodologia che lo produrrebbe non è ancora scritta.
      </p>
    </Card>
  );
}

export default function PagellaPage() {
  return (
    <div className="space-y-6 page-enter">
      {/* Primo elemento: il filo è `sticky` e va agganciato sotto la barra in
          alto, non più in basso. */}
      <ChiPubblica />

      <SectionHeader
        eyebrow="Osservatorio civico"
        title="Pagella mensile della giunta"
        description="Sei materie, un voto da 1 a 10 ciascuna, ricalcolato ogni mese sui dati pubblicati. Il voto vive al livello della giunta e mai su una singola persona."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MATERIE.map((m) => (
          <Materia key={m.nome} nome={m.nome} icona={m.icona} />
        ))}
      </div>

      <Card id="metodologia" className="scroll-mt-24 bg-surface-2/40">
        <h2 className="text-base font-bold tracking-tight">Come si calcola</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Definizione, fonte, peso e soglia di ogni indicatore vivranno su
          <span className="font-semibold text-foreground"> /metodologia</span>,
          versionati, con un registro delle modifiche. Ogni pagella porta il
          timbro della versione che l&apos;ha calcolata: senza il timbro, una
          pagella vecchia diventa incontestabile perché nessuno sa più con quali
          regole fu prodotta.
        </p>
      </Card>

      <Card id="fonti" className="scroll-mt-24 bg-surface-2/40">
        <h2 className="text-base font-bold tracking-tight">
          Da dove vengono i numeri
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Da <em>Amministrazione trasparente</em> del Comune di Pistoia, la cui
          pubblicazione è obbligatoria per legge (D.Lgs 33/2013), e da ISTAT per
          i confronti con il reddito. Ogni affermazione è una riga con il
          proprio link al documento e la data in cui è stato consultato; il
          renderer rifiuta le righe senza fonte.
        </p>
      </Card>
    </div>
  );
}
