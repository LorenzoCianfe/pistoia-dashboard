import type { Metadata } from "next";
import Link from "next/link";
import { HardHat, MapPin, FolderKanban, ArrowRight } from "lucide-react";
import { getOpere, type OperaItem } from "@/lib/data/opere";
import { getCurrentUser } from "@/lib/auth/dal";
import { getFollowedIds } from "@/lib/data/follow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FollowButton } from "@/components/app/follow-button";
import { OperaLink } from "@/components/opere/opera-link";
import {
  CronoprogrammaChart,
  CronoprogrammaLegenda,
  type RigaCronoprogramma,
} from "@/components/opere/cronoprogramma-chart";
import { DisplayNumber } from "@/components/signature/display-number";
import { MeshSurface, toneFromPercent } from "@/components/signature/mesh-surface";
import { cronoprogramma, scartoInParole } from "@/lib/cronoprogramma";
import { formatEuro, formatEuroCompact, formatDateShort } from "@/lib/format";
import { operaStatus, operaCategory } from "@/lib/labels";
import { sourceInfo } from "@/lib/sources";
import { SourceBadge } from "@/components/ui/source-badge";

export const metadata: Metadata = { title: "Opere" };

/*
  La parola sulla superficie mesh. Il tono viene dalla quota di cantieri che
  rispettano il proprio calendario: è una salute vera, quindi il verde significa
  qualcosa. L'avanzamento medio — la scelta istintiva — NON lo sarebbe: un
  cantiere al 18% aperto il mese scorso è nuovo, non malato, e tingerlo di rosso
  sarebbe un allarme inventato.
*/
const PUNTUALITA: Record<string, string> = {
  good: "Nei tempi",
  warn: "Qualche ritardo",
  bad: "In ritardo",
  cool: "Nessun cantiere",
};

export default async function OperePage() {
  const [data, me] = await Promise.all([getOpere(), getCurrentUser()]);
  const followed = me ? await getFollowedIds(me.id, "opera") : new Set<string>();

  const tono =
    data.puntualita.percentuale === null
      ? "cool"
      : toneFromPercent(data.puntualita.percentuale);

  // Le righe del cronoprogramma: solo i cantieri con un calendario calcolabile,
  // ordinati dal più indietro. Chi è in ritardo si legge per primo.
  const righe: RigaCronoprogramma[] = data.inCorso
    .map((o) => {
      const c = cronoprogramma(o);
      if (!c) return null;
      return {
        id: o.id,
        nome: o.name,
        avanzamento: c.avanzamento,
        tempoConsumato: c.tempoConsumato,
        andamento: c.andamento,
        scarto: scartoInParole(c),
        scaduto: c.scaduto,
      } satisfies RigaCronoprogramma;
    })
    .filter((r): r is RigaCronoprogramma => r !== null)
    .sort((a, b) => a.avanzamento - a.tempoConsumato - (b.avanzamento - b.tempoConsumato));

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="I cantieri della città"
        title="Opere pubbliche"
        description="Quanto è stato realizzato, e se sta succedendo nei tempi previsti."
        icon={<HardHat size={22} />}
      />

      {/* Apertura a bento: la cifra protagonista da una parte, lo stato dei
          tempi dall'altra. */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="scacchiera h-1.5 w-full opacity-60" aria-hidden />
          <div className="flex h-full flex-col justify-between gap-5 p-5 sm:p-6">
            {/*
              L'unica cifra display della schermata (DESIGN.md §8). Nuda: la
              scala a tacche vorrebbe un intervallo reale, e per un investimento
              non esiste un minimo e un massimo che significhino qualcosa.
            */}
            <DisplayNumber
              value={data.totalInvestmentInCorso / 1_000_000}
              formatOptions={{ maximumFractionDigits: 1 }}
              unit="mln €"
              label="Investimento nei cantieri aperti"
            />
            <p className="text-sm text-muted">
              <span className="tabular-nums">
                {formatEuro(data.totalInvestmentInCorso)}
              </span>{" "}
              su {data.inCorsoCount}{" "}
              {data.inCorsoCount === 1 ? "cantiere aperto" : "cantieri aperti"} ·{" "}
              {data.completateCount}{" "}
              {data.completateCount === 1 ? "completato" : "completati"}
            </p>
          </div>
        </Card>

        {/* La tinta È la quota di cantieri in pari, non un ornamento. */}
        <div className="flex flex-col gap-2">
          <MeshSurface
            as="article"
            tone={tono}
            className="flex min-h-[150px] flex-1 items-end p-5 sm:p-6"
          >
            {/* Solo testo grande qui sopra: sul tono `bad` l'inchiostro fa
                3,3:1, che basta per un 26px semibold (WCAG chiede 3:1 sul testo
                grande) e non basterebbe per un corpo da 16px. La spiegazione sta
                fuori, sulla tela. Vedi DESIGN.md §8. */}
            <p className="text-[26px] font-semibold leading-tight tracking-tight">
              {PUNTUALITA[tono]}
            </p>
          </MeshSurface>
          <p className="px-1 text-xs leading-snug text-muted-2">
            {data.puntualita.percentuale === null
              ? "nessun cantiere con un calendario da confrontare"
              : `${data.puntualita.inPari} ${data.puntualita.inPari === 1 ? "cantiere" : "cantieri"} su ${data.puntualita.misurabili} ${data.puntualita.inPari === 1 ? "rispetta" : "rispettano"} il calendario previsto`}
          </p>
        </div>
      </div>

      {/* Il cronoprogramma: la sola lettura che una percentuale da sola non dà. */}
      {righe.length > 0 ? (
        <Card>
          {/* Il titolo dice la conclusione, non la dimensione (DESIGN.md §9). */}
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Il lavoro fatto e il tempo passato
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Il 30% di un cantiere aperto due mesi fa e il 30% di uno aperto due
            anni fa non sono lo stesso 30%. Il marcatore dice dove il calendario
            direbbe di essere oggi.
          </p>
          <div className="mt-4">
            <CronoprogrammaLegenda />
          </div>
          <div className="mt-5">
            <CronoprogrammaChart righe={righe} />
          </div>
          <p className="mt-5 border-t border-border pt-4 text-xs text-muted-2">
            Solo i {righe.length} cantieri in corso. Le opere pianificate non
            hanno un avvio e quelle sospese non hanno una fine prevista: senza
            uno dei due estremi il calendario non si può calcolare, e riempirlo
            con una data verosimile darebbe uno scarto finto.
          </p>
        </Card>
      ) : null}

      {/* Il catalogo completo. */}
      <section aria-labelledby="tutti-i-cantieri">
        <h2
          id="tutti-i-cantieri"
          className="mb-3 px-1 font-display text-lg font-semibold tracking-tight"
        >
          Tutti i cantieri
        </h2>
        {/*
          `grid-cols-1` non è ridondante con `sm:grid-cols-2`. Senza, sotto la
          soglia `sm` non esiste nessun `grid-template-columns` e la traccia
          implicita è `auto`, il cui minimo è il **min-content**: un solo figlio
          con `white-space: nowrap` allarga la colonna oltre il viewport e la
          pagina scorre di lato. `grid-cols-1` compila in
          `repeat(1, minmax(0, 1fr))`, che può stringersi.
        */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.opere.map((o, i) => (
            <OperaCard
              key={o.id}
              opera={o}
              index={i}
              following={followed.has(o.id)}
              canFollow={!!me}
            />
          ))}
        </div>
      </section>

      {/*
        Rimando di navigazione, non di dati: `CivicProject` non ha una relazione
        con `Opera`, quindi non si può dire quale cantiere nasca da quali
        segnalazioni. Il collegamento resta un invito a cambiare pagina — dire
        di più sarebbe inventare un legame che il modello non ha.
      */}
      <Link href="/progetti" className="block">
        <Card hover className="flex items-center gap-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-soft text-teal"
            aria-hidden
          >
            <FolderKanban size={18} />
          </span>
          <p className="min-w-0 flex-1 text-sm">
            <span className="font-semibold">Quando un problema si ripete</span>
            <span className="mt-0.5 block text-muted-2">
              Le segnalazioni ricorrenti diventano progetti pubblici tracciati,
              prima di diventare un cantiere.
            </span>
          </p>
          <ArrowRight size={16} className="shrink-0 text-muted-2" aria-hidden />
        </Card>
      </Link>

      <SourceBadge source={sourceInfo("opere")} />
    </div>
  );
}

function OperaCard({
  opera,
  index,
  following,
  canFollow,
}: {
  opera: OperaItem;
  index: number;
  following: boolean;
  canFollow: boolean;
}) {
  const status = operaStatus(opera.status);
  return (
    // `data-opera-card` è l'aggancio che `OperaLink` risale per assegnare il
    // `view-transition-name` alla sola card cliccata.
    <Card hover data-opera-card className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="teal" soft className="bg-surface-2">
            {operaCategory(opera.category)}
          </Badge>
          {/* «In evidenza», non «Seguito»: accanto al bottone «Segui» in fondo
              alla card la seconda parola si legge come lo stato di quel
              bottone, che è tutt'altra cosa. Il lime qui è sfondo, mai testo
              (DESIGN.md §4). */}
          {opera.featured ? (
            <span className="rounded-pill bg-highlight px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--highlight-ink)]">
              In evidenza
            </span>
          ) : null}
        </div>
        <Badge color={status.color}>{status.label}</Badge>
      </div>

      <OperaLink
        id={opera.id}
        className="mt-3 font-semibold leading-snug hover:text-teal"
      >
        {opera.name}
      </OperaLink>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{opera.description}</p>

      <div className="mt-auto pt-4">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
          <span className="flex min-w-0 items-center gap-1 text-muted">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">{opera.location ?? "Pistoia"}</span>
          </span>
          <span className="shrink-0 font-semibold tabular-nums">
            {opera.progress}%
          </span>
        </div>
        <ProgressBar
          value={opera.progress}
          etichetta={`Avanzamento del cantiere ${opera.name}`}
          delay={index * 0.05}
          height={8}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          {/* Va a capo invece di troncare: a 360px l'ellissi mangerebbe la
              data di fine prevista, che è il pezzo che vale di più. */}
          <p className="min-w-0 text-xs text-muted-2">
            {formatEuroCompact(opera.investment)}
            {opera.expectedEnd
              ? ` · fine prevista ${formatDateShort(opera.expectedEnd)}`
              : ""}
          </p>
          {canFollow ? (
            <FollowButton
              targetType="opera"
              targetId={opera.id}
              following={following}
              size="sm"
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
}
