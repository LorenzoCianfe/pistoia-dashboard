import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Megaphone,
  HardHat,
  Lightbulb,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getNeighborhoodDetail, getNeighborhoodBySlug } from "@/lib/data/neighborhoods";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { FollowButton } from "@/components/community/follow-button";
import {
  reportCategory,
  reportStatus,
  proposalStatus,
  eventCategory,
} from "@/lib/community";
import { operaStatus } from "@/lib/labels";
import { formatNumber, formatDateShort } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const n = await getNeighborhoodBySlug(slug);
  return { title: n?.name ?? "Quartiere" };
}

export default async function NeighborhoodDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();
  const data = await getNeighborhoodDetail(slug, user.id);
  if (!data) notFound();

  const { neighborhood: n, reports, posts, proposals, opere, events, following, followerCount, counts } =
    data;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href="/quartieri"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Tutti i quartieri
      </Link>

      {/* Header */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={n.kind === "frazione" ? "viola" : "teal"} soft className="bg-surface-2">
            {n.kind === "frazione" ? "Frazione" : "Quartiere"}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-2">
            <Users size={12} />
            {formatNumber(followerCount)} cittadini lo seguono
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{n.name}</h1>

        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Segnalazioni aperte" value={formatNumber(counts.openReports)} />
          <Stat label="Opere" value={formatNumber(counts.opere)} />
          <Stat label="Proposte" value={formatNumber(counts.proposals)} />
          <Stat label="Eventi" value={formatNumber(counts.events)} />
        </div>

        <div className="border-t border-border pt-4">
          <FollowButton targetType="neighborhood" targetId={n.id} following={following} />
        </div>
      </Card>

      {/* Events */}
      {events.length > 0 ? (
        <Card>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <CalendarDays size={18} />
            Prossimi eventi
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {events.map((e) => {
              const ec = eventCategory(e.category);
              return (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.title}</p>
                    <p className="text-xs text-muted-2">{formatDateShort(e.startAt)}</p>
                  </div>
                  <Badge color={ec.color}>{ec.label}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      {/* Reports */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Megaphone size={18} />
            Segnalazioni
          </h2>
          <Link href="/segnalazioni" className="text-xs font-medium text-teal hover:underline">
            Tutte
          </Link>
        </div>
        {reports.length > 0 ? (
          <ul className="mt-3 divide-y divide-border">
            {reports.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/segnalazioni/${r.id}`} className="min-w-0 hover:text-teal">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="text-xs text-muted-2">{reportCategory(r.category).label}</p>
                </Link>
                <Badge color={reportStatus(r.status).color}>{reportStatus(r.status).label}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-2">Nessuna segnalazione in questa zona.</p>
        )}
      </Card>

      {/* Opere */}
      {opere.length > 0 ? (
        <Card>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <HardHat size={18} />
            Opere e cantieri
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {opere.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/opere/${o.id}`} className="min-w-0 hover:text-teal">
                  <p className="truncate font-medium">{o.name}</p>
                  <p className="text-xs text-muted-2">{o.progress}% completato</p>
                </Link>
                <Badge color={operaStatus(o.status).color}>{operaStatus(o.status).label}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Proposals */}
      {proposals.length > 0 ? (
        <Card>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Lightbulb size={18} />
            Proposte
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {proposals.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/proposte/${p.id}`} className="min-w-0 hover:text-teal">
                  <p className="truncate font-medium">{p.title}</p>
                </Link>
                <Badge color={proposalStatus(p.status).color}>{proposalStatus(p.status).label}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Discussioni */}
      {posts.length > 0 ? (
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <MapPin size={18} />
              Discussioni di quartiere
            </h2>
            <Link href="/comunita" className="text-xs font-medium text-teal hover:underline">
              Vai alla community
            </Link>
          </div>
          <ul className="mt-3 space-y-2.5">
            {posts.map((p) => (
              <li key={p.id} className="rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2">
                <p className="text-xs font-semibold">{p.authorName}</p>
                <p className="line-clamp-2 text-sm">{p.content}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
