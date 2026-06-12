import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  Sparkles,
  MapPin,
  Megaphone,
  Lightbulb,
  Bell,
  ArrowRight,
  CalendarDays,
  HardHat,
  Network,
  Phone,
  HeartHandshake,
  Pencil,
} from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getMyCity, getForYou, type ForYouItem } from "@/lib/data/mycity";
import { getUnreadCount } from "@/lib/data/notifiche";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { CivicInterestsForm } from "@/components/impostazioni/civic-interests-form";
import { SimpleModeExit } from "@/components/impostazioni/simple-mode-toggle";
import { GUIDED_ACTIONS } from "@/components/app/nav-items";
import { reportCategory, reportStatus, proposalStatus } from "@/lib/community";
import { CIVIC_TOPICS } from "@/lib/civic-topics";
import { SIMPLE_MODE_COOKIE } from "@/lib/ui-prefs";
import { accent } from "@/lib/colors";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import type { CurrentUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "La mia città" };

const FOR_YOU_KIND: Record<
  ForYouItem["kind"],
  { label: string; icon: typeof Megaphone }
> = {
  report: { label: "Segnalazione", icon: Megaphone },
  proposal: { label: "Proposta", icon: Lightbulb },
  event: { label: "Evento", icon: CalendarDays },
  opera: { label: "Opera pubblica", icon: HardHat },
};

export default async function MyCityPage() {
  const user = await requireUser();
  const simple = (await cookies()).get(SIMPLE_MODE_COOKIE)?.value === "1";
  if (simple) return <SimpleHome user={user} />;

  const [city, forYou] = await Promise.all([
    getMyCity(user),
    user.civicInterests.length > 0 ? getForYou(user.civicInterests) : Promise.resolve([]),
  ]);
  const firstName = (user.publicName ?? user.name).split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
          La mia città
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-[28px]">
          <Sparkles size={24} className="text-teal" />
          Ciao, {firstName}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <MapPin size={14} />
          {city.neighborhoodName
            ? `Cosa succede vicino a te, a ${city.neighborhoodName}`
            : "Imposta il tuo quartiere dal profilo per vedere cosa succede vicino a te"}
        </p>
      </div>

      {/* Percorsi guidati (A1 §23): la home parte dagli obiettivi, non dai menu */}
      <section aria-labelledby="cosa-vuoi-fare">
        <h2 id="cosa-vuoi-fare" className="text-base font-semibold">
          Cosa vuoi fare?
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {GUIDED_ACTIONS.map((a) => {
            const tokens = accent(a.color);
            return (
              <Link key={a.href} href={a.href}>
                <Card hover className="flex h-full items-start gap-3 p-4">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-sm)]"
                    style={{ backgroundColor: tokens.soft, color: tokens.fg }}
                    aria-hidden
                  >
                    <a.icon size={19} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">
                      {a.title}
                    </span>
                    <span className="mt-0.5 hidden text-xs leading-snug text-muted-2 sm:block">
                      {a.description}
                    </span>
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Segnalazioni aperte vicino" value={city.summary.nearbyOpenReports} />
        <Stat label="Le mie segnalazioni aperte" value={city.summary.myOpenReports} />
        <Stat label="Sondaggi attivi" value={city.summary.activePolls} />
        <Stat label="Proposte che sostengo" value={city.summary.proposalsSupported} />
      </div>

      {city.unread > 0 ? (
        <Link href="/notifiche">
          <Card hover className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-teal-soft text-teal">
              <Bell size={18} />
            </span>
            <p className="text-sm font-medium">
              Hai {city.unread} {city.unread === 1 ? "notifica non letta" : "notifiche non lette"}
            </p>
            <ArrowRight size={16} className="ml-auto text-muted-2" />
          </Card>
        </Link>
      ) : null}

      {/* Per te (A2 §3): onboarding o feed sui temi scelti */}
      {!user.hasChosenInterests ? (
        <Card className="border-teal/30">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full gradient-teal-viola text-white">
              <HeartHandshake size={18} />
            </span>
            <div>
              <h2 className="text-base font-semibold">Quali temi ti stanno a cuore?</h2>
              <p className="text-xs text-muted">
                Sceglili e la tua home mostrerà prima le novità che ti interessano.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <CivicInterestsForm interests={[]} submitLabel="Crea il mio feed" />
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <HeartHandshake size={18} className="text-teal" />
              Per te
            </h2>
            <Link
              href="/impostazioni#temi-civici"
              className="flex items-center gap-1 text-sm font-semibold text-teal hover:underline"
            >
              <Pencil size={13} aria-hidden />
              Cambia temi
            </Link>
          </div>
          {user.civicInterests.length > 0 ? (
            <p className="mt-1.5 flex flex-wrap gap-1.5">
              {user.civicInterests.map((k) => (
                <span
                  key={k}
                  className="rounded-pill bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted"
                >
                  <span aria-hidden>{CIVIC_TOPICS[k].emoji}</span> {CIVIC_TOPICS[k].label}
                </span>
              ))}
            </p>
          ) : null}
          {user.civicInterests.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Non hai temi attivi: aggiungine qualcuno per riempire questo spazio.
            </p>
          ) : forYou.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Per ora nessuna novità sui tuoi temi. Torna a trovarci presto.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {forYou.map((item) => {
                const kind = FOR_YOU_KIND[item.kind];
                const topic = CIVIC_TOPICS[item.topic];
                return (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 py-3 transition-colors hover:text-teal"
                    >
                      <span
                        className="grid size-8 shrink-0 place-items-center rounded-full"
                        style={{
                          backgroundColor: accent(topic.color).soft,
                          color: accent(topic.color).fg,
                        }}
                        aria-hidden
                      >
                        <kind.icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{item.title}</span>
                        <span className="mt-0.5 block text-xs text-muted-2">
                          {kind.label} · {formatRelativeTime(item.date)}
                        </span>
                      </span>
                      <Badge color={topic.color} className="hidden sm:inline-flex">
                        {topic.label}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Vicino a te */}
        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Megaphone size={18} className="text-teal" />
              Vicino a te
            </h2>
            <Link href="/segnalazioni" className="text-sm font-semibold text-teal hover:underline">
              Tutte →
            </Link>
          </div>
          {city.nearbyReports.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Nessuna segnalazione recente nella tua zona.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {city.nearbyReports.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/segnalazioni/${r.id}`}
                    className="flex items-center gap-3 py-3 transition-colors hover:text-teal"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-2">
                        <Badge color={reportCategory(r.category).color} className="px-2 py-0.5">
                          {reportCategory(r.category).label}
                        </Badge>
                        <span>· {formatNumber(r.confirmations)} conferme</span>
                      </p>
                    </div>
                    <Badge color={reportStatus(r.status).color}>{reportStatus(r.status).label}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Proposte in evidenza */}
        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Lightbulb size={18} className="text-teal" />
              Proposte in evidenza
            </h2>
            <Link href="/proposte" className="text-sm font-semibold text-teal hover:underline">
              Tutte →
            </Link>
          </div>
          {city.trending.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Ancora nessuna proposta.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {city.trending.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/proposte/${p.id}`}
                    className="flex items-center gap-3 py-3 transition-colors hover:text-teal"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <p className="mt-0.5 text-xs text-muted-2">
                        {formatNumber(p.supports)} sostegni
                        {p.supportedByMe ? " · sostieni" : ""}
                      </p>
                    </div>
                    <Badge color={proposalStatus(p.status).color}>
                      {proposalStatus(p.status).label}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home semplificata (A1 §19): quattro azioni essenziali, testo grande,
// numeri utili sempre in vista. Si attiva dalle Impostazioni.
// ---------------------------------------------------------------------------

const SIMPLE_ACTIONS = [
  {
    href: "/segnalazioni",
    title: "Segnalare un problema",
    description: "Buche, lampioni spenti, rifiuti",
    icon: Megaphone,
    color: "amber" as const,
  },
  {
    href: "/notifiche",
    title: "Leggere gli avvisi",
    description: "Le comunicazioni che ti riguardano",
    icon: Bell,
    color: "red" as const,
  },
  {
    href: "/eventi",
    title: "Vedere gli eventi",
    description: "Cosa succede in città",
    icon: CalendarDays,
    color: "viola" as const,
  },
  {
    href: "/organigramma",
    title: "Contattare il Comune",
    description: "Uffici e persone a cui rivolgersi",
    icon: Network,
    color: "teal" as const,
  },
];

async function SimpleHome({ user }: { user: CurrentUser }) {
  const unread = await getUnreadCount(user.id);
  const firstName = (user.publicName ?? user.name).split(" ")[0];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-[28px]">
          <Sparkles size={24} className="text-teal" />
          Ciao, {firstName}
        </h1>
        <p className="mt-1 text-base text-muted">Cosa vuoi fare oggi?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SIMPLE_ACTIONS.map((a) => {
          const tokens = accent(a.color);
          return (
            <Link key={a.href} href={a.href}>
              <Card hover className="flex h-full items-center gap-4 p-6">
                <span
                  className="relative grid size-14 shrink-0 place-items-center rounded-full"
                  style={{ backgroundColor: tokens.soft, color: tokens.fg }}
                  aria-hidden
                >
                  <a.icon size={26} />
                  {a.href === "/notifiche" && unread > 0 ? (
                    <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-[var(--red)] px-1.5 text-xs font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-bold leading-snug">{a.title}</span>
                  <span className="mt-1 block text-sm text-muted">{a.description}</span>
                </span>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Phone size={18} className="text-teal" />
          Numeri utili
        </h2>
        <dl className="mt-3 space-y-3 text-base">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Centralino del Comune</dt>
            <dd>
              <a href="tel:05733711" className="font-bold text-teal hover:underline">
                0573 3711
              </a>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Emergenze</dt>
            <dd>
              <a href="tel:112" className="font-bold text-teal hover:underline">
                112
              </a>
            </dd>
          </div>
        </dl>
      </Card>

      <div className="flex flex-col items-start gap-2">
        <SimpleModeExit />
        <p className="text-xs text-muted-2">
          La modalità semplice si attiva e disattiva anche dalle Impostazioni.
        </p>
      </div>
    </div>
  );
}
