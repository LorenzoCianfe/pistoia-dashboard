import type { Metadata } from "next";
import { MapPinned, HardHat, CalendarDays } from "lucide-react";
import {
  getNeighborhoodsWithCounts,
  type NeighborhoodWithCounts,
} from "@/lib/data/neighborhoods";
import { getCurrentUser } from "@/lib/auth/dal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { FollowButton } from "@/components/community/follow-button";
import { QuartiereLink } from "@/components/territorio/quartiere-link";
import { MeshSurface, toneFromPercent } from "@/components/signature/mesh-surface";
import { CAMPIONE_MINIMO_PER_GIUDIZIO, tassoGiudicabile } from "@/lib/citystats";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Quartieri" };

export default async function QuartieriPage() {
  const me = await getCurrentUser();
  const list = await getNeighborhoodsWithCounts(me?.id);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Territorio"
        title="Quartieri e frazioni"
        description="Tutto ciò che accade vicino a te, area per area. Il colore di ogni scheda dice quante segnalazioni si chiudono lì."
        icon={<MapPinned size={22} />}
      />

      {/* `grid-cols-1` esplicito: senza, sotto `sm` la traccia implicita è
          `auto` e il suo minimo è il min-content — un figlio non spezzabile
          allargherebbe la colonna oltre il viewport (AGENTS.md §3). */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {list.map((n) => (
          <QuartiereCard key={n.id} quartiere={n} canFollow={!!me} />
        ))}
      </div>

      <p className="px-1 text-xs leading-relaxed text-muted-2">
        La tinta è il tasso di risoluzione delle segnalazioni di quell&apos;area —
        risolte sul totale, esclusi duplicati e casi non di competenza del
        Comune: la stessa misura dello «Stato della città». Le aree grigie
        restano senza giudizio, o perché non hanno ancora segnalazioni o perché
        ne hanno meno di {CAMPIONE_MINIMO_PER_GIUDIZIO}: sotto quella soglia una
        percentuale è aritmetica esatta e informazione nulla, e colorarla
        peserebbe su un quartiere vero.
      </p>
    </div>
  );
}

function QuartiereCard({
  quartiere: n,
  canFollow,
}: {
  quartiere: NeighborhoodWithCounts;
  canFollow: boolean;
}) {
  const tasso = n.segnalazioni.tassoRisoluzione;
  const giudicabile = tassoGiudicabile(n.segnalazioni.conteggiabili);
  /*
    `cool` non è un ripiego: DESIGN.md §8 lo riserva alle superfici che NON
    rappresentano una salute, e qui i casi sono due.

    Un quartiere senza segnalazioni non sta né bene né male — nessuno gli ha
    ancora chiesto niente. E un quartiere con due segnalazioni non ha un tasso:
    ha due segnalazioni. «0% risolte» su due è aritmetica esatta e informazione
    nulla, ma tinta di rosso si legge come un'accusa a un quartiere vero.
  */
  const tono = tasso === null || !giudicabile ? "cool" : toneFromPercent(tasso);

  return (
    // `data-quartiere-card` è l'aggancio della transizione a elemento condiviso.
    <Card hover data-quartiere-card className="flex flex-col overflow-hidden p-0">
      {/*
        La fascia mesh occupa lo spazio che una fotografia del quartiere avrebbe
        preso (DISCOVERY D7). Resta astratta finché non ci sono immagini reali e
        con licenza: oggi ogni immagine dell'app è un SVG generato dal seed, e
        un finto scorcio di Pistoia su una pagina istituzionale è peggio di
        nessuno scorcio. Quando arriveranno le foto, entreranno in questa
        cornice senza rifare il resto.

        Sopra ci va SOLO il nome, a 24px semibold: sul tono `bad` l'inchiostro
        fa 3,3:1, che basta per il testo grande (≥24px) e non basterebbe per i
        conteggi qui sotto — che infatti stanno sul vetro.
      */}
      <MeshSurface
        tone={tono}
        className="flex min-h-[104px] items-end p-4 sm:p-5"
      >
        {/* 26px e non 24: per WCAG il "testo grande" parte da 18,5pt ≈ 24,7px
            se non è in grassetto, e semibold non conta come grassetto. A 24px
            un nome sul tono `bad` (3,3:1) sarebbe finito appena sotto la
            soglia. È la stessa misura già verificata in `city-state-hero`. */}
        <QuartiereLink
          slug={n.slug}
          className="text-[26px] font-semibold leading-tight tracking-tight hover:underline"
        >
          {n.name}
        </QuartiereLink>
      </MeshSurface>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted">
            {tasso === null
              ? "Nessuna segnalazione da contare"
              : giudicabile
                ? `${tasso}% delle segnalazioni risolte`
                : "Troppo poche segnalazioni per una media"}
          </p>
          <Badge
            color={n.kind === "frazione" ? "viola" : "teal"}
            soft
            className="shrink-0 bg-surface-2"
          >
            {n.kind === "frazione" ? "Frazione" : "Quartiere"}
          </Badge>
        </div>
        {tasso !== null ? (
          <p className="mt-0.5 text-xs tabular-nums text-muted-2">
            {formatNumber(n.segnalazioni.risolte)} su{" "}
            {formatNumber(n.segnalazioni.conteggiabili)}
          </p>
        ) : null}

        {/* Il conteggio grezzo delle segnalazioni non sta più qui: accanto a
            «1 su 8» un «9 segnalazioni» sembrava una contraddizione, e la
            differenza — un duplicato fuori dal denominatore — non si può
            spiegare in una riga di card. */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-2">
          <span className="flex items-center gap-1">
            <HardHat size={12} aria-hidden />{" "}
            {formatNumber(n._count.opere)}{" "}
            {n._count.opere === 1 ? "opera" : "opere"}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays size={12} aria-hidden />{" "}
            {formatNumber(n._count.events)}{" "}
            {n._count.events === 1 ? "evento" : "eventi"}
          </span>
        </div>

        {canFollow ? (
          <div className="mt-auto pt-4">
            <FollowButton
              targetType="neighborhood"
              targetId={n.id}
              following={n.following}
              size="sm"
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
