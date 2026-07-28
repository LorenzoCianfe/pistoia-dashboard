import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Clock, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getPublishedEvents, getPendingEvents, type EventItem } from "@/lib/data/events";
import { getNeighborhoods } from "@/lib/data/neighborhoods";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { DisplayNumber } from "@/components/signature/display-number";
import { FollowButton } from "@/components/app/follow-button";
import { EventComposer } from "@/components/eventi/event-composer";
import { EventReview } from "@/components/eventi/event-review";
import { isStaff, canModerate, eventCategory } from "@/lib/community";
import { formatDateShort, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Eventi" };

const monthFmt = new Intl.DateTimeFormat("it-IT", {
  month: "long",
  year: "numeric",
  timeZone: "Europe/Rome",
});
const monShortFmt = new Intl.DateTimeFormat("it-IT", { month: "short", timeZone: "Europe/Rome" });
const timeFmt = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Rome",
});

function groupByMonth(items: EventItem[]) {
  const map = new Map<string, { label: string; items: EventItem[] }>();
  for (const e of items) {
    const d = e.startAt;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map.has(key)) map.set(key, { label: monthFmt.format(d), items: [] });
    map.get(key)!.items.push(e);
  }
  return [...map.values()];
}

export default async function EventiPage() {
  const user = await requireUser();
  const [{ upcoming }, neighborhoods] = await Promise.all([
    getPublishedEvents(user.id),
    getNeighborhoods(),
  ]);

  const staff = isStaff(user.role);
  const isMod = staff || canModerate(user.role);
  const isVerifiedOrg =
    (user.accountType === "ASSOCIATION" || user.accountType === "BUSINESS") &&
    !!user.verifiedType;
  const canPropose = staff || isVerifiedOrg;
  const pending = isMod ? await getPendingEvents() : [];
  const groups = groupByMonth(upcoming);

  /*
    `getPublishedEvents` separa passato e futuro sulla data di FINE, non di
    inizio: un evento cominciato ieri e lungo tre giorni è ancora in corso, e
    conta fra quelli a cui si può andare. La cifra eredita quella definizione
    invece di rifarne una propria — è lo stesso conteggio che l'hub /territorio
    mostra come «N in arrivo», e i due devono coincidere.
  */
  const daAssociazioni = upcoming.filter((e) => e.isOrganization).length;
  const prossimo = upcoming[0] ?? null;

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Vita locale"
        title="Calendario eventi"
        description="Iniziative del Comune e delle associazioni del territorio. Segui un evento per non perderlo."
        icon={<CalendarDays size={22} />}
      />

      {upcoming.length > 0 ? (
        <Card>
          <DisplayNumber
            value={upcoming.length}
            unit={upcoming.length === 1 ? "evento" : "eventi"}
            label="In arrivo o ancora in corso"
          />
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
            {prossimo ? (
              <>
                il prossimo è{" "}
                <span className="font-semibold text-foreground">
                  {prossimo.title}
                </span>
                , <span suppressHydrationWarning>{formatDateShort(prossimo.startAt)}</span>
              </>
            ) : null}
            {daAssociazioni > 0 ? (
              <>
                {prossimo ? " · " : ""}
                <span className="font-semibold text-teal">
                  {formatNumber(daAssociazioni)}
                </span>{" "}
                {daAssociazioni === 1
                  ? "è organizzato da un'associazione del territorio"
                  : "sono organizzati da associazioni del territorio"}
              </>
            ) : null}
            .
          </p>
        </Card>
      ) : null}

      {canPropose ? (
        <Card>
          <EventComposer neighborhoods={neighborhoods} needsApproval={!staff} />
        </Card>
      ) : null}

      {/* Moderation queue */}
      {isMod && pending.length > 0 ? (
        <Card className="border-[var(--amber)]/30">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShieldCheck size={18} />
            Eventi da approvare
            <span className="text-sm font-normal text-muted-2">{pending.length}</span>
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {pending.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{e.title}</p>
                  <p className="text-xs text-muted-2">
                    {e.organizerName} · {formatDateShort(e.startAt)}
                    {e.neighborhood ? ` · ${e.neighborhood.name}` : ""}
                  </p>
                </div>
                <EventReview eventId={e.id} />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Calendar */}
      {groups.length === 0 ? (
        <EmptyState
          accent="amber"
          title="Nessun evento in programma"
          description="Il calendario si aggiorna con le iniziative del Comune e delle associazioni. Torna presto."
        />
      ) : (
        groups.map((g) => (
          <div key={g.label}>
            <h2 className="mb-3 px-1 text-base font-semibold capitalize">{g.label}</h2>
            <Card>
              <ul className="divide-y divide-border">
                {g.items.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </ul>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}

function EventRow({ event }: { event: EventItem }) {
  const ec = eventCategory(event.category);
  return (
    <li className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
      <div className="grid w-12 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-surface-2 py-2 text-center">
        <span className="text-xl font-bold leading-none tabular-nums">
          {event.startAt.getDate()}
        </span>
        <span className="text-[10px] uppercase text-muted-2">{monShortFmt.format(event.startAt)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={ec.color}>{ec.label}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-2">
            <Clock size={11} />
            {timeFmt.format(event.startAt)}
          </span>
        </div>
        <p className="mt-1 font-semibold leading-snug">{event.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-2">
          <span>{event.organizerName}</span>
          {event.location ? (
            <span className="flex items-center gap-0.5">
              · <MapPin size={11} /> {event.location}
            </span>
          ) : null}
          {event.neighborhood ? (
            <Link href={`/quartieri/${event.neighborhood.slug}`} className="hover:text-foreground">
              · {event.neighborhood.name}
            </Link>
          ) : null}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <FollowButton targetType="event" targetId={event.id} following={event.following} size="sm" />
        {event.isOrganization && event.organizerId ? (
          <FollowButton
            targetType="organization"
            targetId={event.organizerId}
            following={event.followingOrg}
            size="sm"
          />
        ) : null}
      </div>
    </li>
  );
}
