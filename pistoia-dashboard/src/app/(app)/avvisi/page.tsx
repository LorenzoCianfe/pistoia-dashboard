import type { Metadata } from "next";
import Link from "next/link";
import { Siren, MapPin, CheckCircle2 } from "lucide-react";
import { getNotices, type NoticeItem } from "@/lib/data/transparency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { DisplayNumber } from "@/components/signature/display-number";
import { MapCanvas } from "@/components/mappa/map-canvas";
import { noticeKind, noticeSeverity } from "@/lib/transparency";
import { formatRelativeTime, formatDateShort, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Avvisi urgenti",
  description:
    "Allerte, chiusure, interruzioni e ordinanze del Comune — con «cosa cambia per me» in punti pratici.",
};

/*
  Bacheca avvisi urgenti (A1 §21, O3): le comunicazioni critiche separate dal
  resto. Ogni avviso traduce il linguaggio amministrativo in impatto pratico
  con "Cosa cambia per me?" (A1 §24); quelli geolocalizzati finiscono anche
  sulla mappa cittadina.
*/

function NoticeCard({ n }: { n: NoticeItem }) {
  const kind = noticeKind(n.kind);
  const sev = noticeSeverity(n.severity);
  const closed = !n.active;

  return (
    <Card className={closed ? "space-y-3 opacity-80" : "space-y-3"}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={closed ? "green" : sev.color}>
          {closed ? (
            <>
              <CheckCircle2 size={12} aria-hidden />
              Concluso
            </>
          ) : (
            sev.label
          )}
        </Badge>
        <span className="text-xs font-medium text-muted">
          <span aria-hidden>{kind.emoji}</span> {kind.label}
        </span>
        <span className="ml-auto text-xs text-muted-2" suppressHydrationWarning>
          {closed && n.endsAt
            ? `concluso il ${formatDateShort(n.endsAt)}`
            : formatRelativeTime(n.startsAt)}
        </span>
      </div>

      <h3 className="text-base font-bold tracking-tight">{n.title}</h3>
      <p className="text-sm leading-relaxed text-foreground/90">{n.body}</p>

      {n.location ? (
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <MapPin size={13} aria-hidden />
          {n.location}
        </p>
      ) : null}

      {n.whatChanges.length > 0 ? (
        <div className="rounded-[var(--radius-sm)] border border-border bg-surface-2/50 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            Cosa cambia per me
          </p>
          <ul className="mt-2 space-y-2">
            {n.whatChanges.map((w) => (
              <li key={w} className="flex gap-2.5 text-sm leading-relaxed">
                <span
                  className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[var(--teal)]"
                  aria-hidden
                />
                {w}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}

export default async function AvvisiPage() {
  const notices = await getNotices();
  const active = notices.filter((n) => n.active);
  const past = notices.filter((n) => !n.active);
  const critici = active.filter((n) => n.severity === "critico").length;
  const geoPoints = active
    .filter((n) => n.latitude != null && n.longitude != null)
    .map((n) => ({
      id: n.id,
      layer: "avvisi" as const,
      lat: n.latitude!,
      lng: n.longitude!,
      title: n.title,
      subtitle: noticeKind(n.kind).label,
      color: "red",
    }));

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Trasparenza"
        title="Avvisi urgenti"
        description="Allerte meteo, chiusure, interruzioni di servizi e ordinanze: le comunicazioni che contano, separate dal resto e tradotte in impatto pratico."
        icon={<Siren size={26} />}
      />

      {active.length === 0 ? (
        /*
          Lo stato vuoto SOSTITUISCE la cifra, non la affianca — ed è una scelta,
          non una dimenticanza.

          Zero avvisi attivi è la notizia migliore che questa pagina possa dare,
          ma resa come cifra display sarebbe uno «0» a 88px: indistinguibile dal
          difetto di AGENTS.md §3 (Fase A, 1), dove una pagina che non anima
          restituisce zeri plausibili. Chi la vedesse non saprebbe se la città è
          tranquilla o se il conteggio è rotto. La buona notizia vuole parole.
        */
        <EmptyState
          title="Nessun avviso attivo"
          description="Buone notizie: al momento non ci sono emergenze o comunicazioni urgenti."
          accent="green"
        />
      ) : (
        <>
          <Card>
            {/*
              La cifra conta gli avvisi ATTIVI: sono righe vere di `Notice`,
              senza `demoBaseline` e senza `take` a monte. È anche l'unica cifra
              che risponde alla domanda con cui si arriva qui — «mi riguarda
              qualcosa adesso?» — mentre un totale storico direbbe soltanto da
              quanto esiste la bacheca.

              Nessuna scala a tacche: l'intervallo 0→totale è vero in aritmetica
              ma nessuno ha fissato un traguardo di quante emergenze debbano
              esserci, e una tacca lo farebbe sembrare un obiettivo mancato o
              raggiunto (FEATURES.md §5).
            */}
            <DisplayNumber
              value={active.length}
              unit={active.length === 1 ? "avviso" : "avvisi"}
              label="In corso adesso"
            />
            <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
              {critici > 0 ? (
                <>
                  di cui{" "}
                  <span className="font-semibold text-[var(--red)]">
                    {formatNumber(critici)}
                  </span>{" "}
                  di gravità critica
                </>
              ) : (
                <>nessuno di gravità critica</>
              )}
              {geoPoints.length > 0 ? (
                <>
                  {" · "}
                  {formatNumber(geoPoints.length)}{" "}
                  {geoPoints.length === 1
                    ? "riguarda una zona precisa"
                    : "riguardano una zona precisa"}
                </>
              ) : null}
              {past.length > 0 ? (
                <>
                  {" · "}
                  {formatNumber(past.length)}{" "}
                  {past.length === 1 ? "concluso" : "conclusi"} di recente
                </>
              ) : null}
              .
            </p>
          </Card>

          <div className="space-y-4 stagger">
            {active.map((n) => (
              <NoticeCard key={n.id} n={n} />
            ))}
          </div>
        </>
      )}

      {geoPoints.length > 0 ? (
        <Card className="overflow-hidden p-0">
          <MapCanvas points={geoPoints} className="h-56 w-full" />
          <p className="px-4 py-2.5 text-xs text-muted-2">
            Gli avvisi con una zona precisa sono anche sulla{" "}
            <Link href="/mappa?layer=avvisi" className="font-semibold text-teal hover:underline">
              mappa della città
            </Link>
            .
          </p>
        </Card>
      ) : null}

      {past.length > 0 ? (
        <section aria-labelledby="avvisi-conclusi">
          <h2
            id="avvisi-conclusi"
            className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2"
          >
            Conclusi di recente
          </h2>
          <div className="mt-3 space-y-4">
            {past.map((n) => (
              <NoticeCard key={n.id} n={n} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
