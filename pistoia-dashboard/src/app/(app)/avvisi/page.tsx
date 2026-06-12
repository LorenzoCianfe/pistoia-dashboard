import type { Metadata } from "next";
import Link from "next/link";
import { Siren, MapPin, CheckCircle2 } from "lucide-react";
import { getNotices, type NoticeItem } from "@/lib/data/transparency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { MapCanvas } from "@/components/mappa/map-canvas";
import { noticeKind, noticeSeverity } from "@/lib/transparency";
import { formatRelativeTime, formatDateShort } from "@/lib/format";

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
        <EmptyState
          title="Nessun avviso attivo"
          description="Buone notizie: al momento non ci sono emergenze o comunicazioni urgenti."
          accent="green"
        />
      ) : (
        <div className="space-y-4 stagger">
          {active.map((n) => (
            <NoticeCard key={n.id} n={n} />
          ))}
        </div>
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
