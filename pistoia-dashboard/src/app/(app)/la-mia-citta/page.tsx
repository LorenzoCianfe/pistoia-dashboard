import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Megaphone,
  Lightbulb,
  Vote,
  MessagesSquare,
  Wallet,
  Bell,
  ArrowRight,
} from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getMyCity } from "@/lib/data/mycity";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { reportCategory, reportStatus, proposalStatus } from "@/lib/community";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "La mia città" };

const SHORTCUTS = [
  { href: "/segnalazioni", label: "Segnalazioni", icon: Megaphone, color: "amber" },
  { href: "/proposte", label: "Proposte", icon: Lightbulb, color: "green" },
  { href: "/sondaggi", label: "Sondaggi", icon: Vote, color: "viola" },
  { href: "/comunita", label: "Comunità", icon: MessagesSquare, color: "teal" },
  { href: "/bilancio", label: "Bilancio", icon: Wallet, color: "teal" },
];

export default async function MyCityPage() {
  const user = await requireUser();
  const city = await getMyCity(user);
  const firstName = (user.publicName ?? user.name).split(" ")[0];

  return (
    <div className="space-y-5">
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

      {/* Shortcuts */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {SHORTCUTS.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card hover className="flex flex-col items-center gap-2 p-4 text-center">
              <s.icon size={22} className="text-teal" />
              <span className="text-xs font-semibold">{s.label}</span>
            </Card>
          </Link>
        ))}
      </div>

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
