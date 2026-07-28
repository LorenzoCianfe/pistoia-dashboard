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
import { getNeighborhoodDiary } from "@/lib/data/territorio";
import { pactStatus } from "@/lib/territorio";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { FollowButton } from "@/components/app/follow-button";
import {
  reportCategory,
  reportStatus,
  proposalStatus,
  eventCategory,
} from "@/lib/community";
import { operaStatus } from "@/lib/labels";
import { MeshSurface, toneFromPercent } from "@/components/signature/mesh-surface";
import { tassoGiudicabile } from "@/lib/citystats";
import { formatNumber, formatDateShort } from "@/lib/format";
import { CONDIVISO, NOME_CONDIVISO } from "@/lib/view-transitions";

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
  const diary = await getNeighborhoodDiary(data.neighborhood.id);

  const {
    neighborhood: n,
    reports,
    posts,
    proposals,
    opere,
    events,
    following,
    followerCount,
    counts,
    segnalazioni,
  } = data;
  const tasso = segnalazioni.tassoRisoluzione;
  // Stessa soglia della lista: sotto il campione minimo il tasso non tinge.
  const giudicabile = tassoGiudicabile(segnalazioni.conteggiabili);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href="/quartieri"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Tutti i quartieri
      </Link>

      {/* Il gemello della transizione: stessa anatomia della card della lista —
          fascia mesh col nome, poi il vetro coi numeri — così il morph ha
          qualcosa da interpolare invece di due forme estranee. */}
      <Card
        className="overflow-hidden p-0"
        style={{ viewTransitionName: NOME_CONDIVISO }}
        {...{ [CONDIVISO.quartiere.attr]: "" }}
      >
        <MeshSurface
          tone={tasso === null || !giudicabile ? "cool" : toneFromPercent(tasso)}
          className="flex min-h-[132px] items-end p-5 sm:p-6"
        >
          {/* Solo testo grande sul mesh (DESIGN.md §8): qui è il titolo. */}
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
            {n.name}
          </h1>
        </MeshSurface>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={n.kind === "frazione" ? "viola" : "teal"} soft className="bg-surface-2">
              {n.kind === "frazione" ? "Frazione" : "Quartiere"}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-2">
              <Users size={12} />
              {formatNumber(followerCount)} cittadini lo seguono
            </span>
          </div>

          {/* La frase di spiegazione del mesh sta sulla tela, non sopra la
              superficie: a questo corpo di testo servirebbe 4,5:1 e il tono
              `bad` ne offre 3,3. */}
          <p className="text-sm text-muted">
            {tasso === null
              ? "Nessuna segnalazione ancora da contare in quest'area: la scheda resta senza giudizio."
              : giudicabile
                ? `${tasso}% delle segnalazioni di quest'area è stato risolto — ${formatNumber(segnalazioni.risolte)} su ${formatNumber(segnalazioni.conteggiabili)}, esclusi duplicati e casi non di competenza del Comune.`
                : `${formatNumber(segnalazioni.risolte)} segnalazioni risolte su ${formatNumber(segnalazioni.conteggiabili)}: troppo poche perché una percentuale dica qualcosa, quindi la scheda resta senza giudizio.`}
          </p>

          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Segnalazioni aperte" value={formatNumber(counts.openReports)} />
            <Stat label="Opere" value={formatNumber(counts.opere)} />
            <Stat label="Proposte" value={formatNumber(counts.proposals)} />
            <Stat label="Eventi" value={formatNumber(counts.events)} />
          </div>

          <div className="border-t border-border pt-4">
            <FollowButton targetType="neighborhood" targetId={n.id} following={following} />
          </div>
        </div>
      </Card>

      {/* Diario del quartiere (A1 §9, O4): la settimana raccontata dai dati. */}
      <Card>
        <h2 className="text-base font-semibold">Questa settimana a {n.name}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-green-soft px-3 py-1.5 text-xs font-semibold text-green">
            ✓ {diary.resolvedReports} {diary.resolvedReports === 1 ? "segnalazione risolta" : "segnalazioni risolte"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-amber-soft px-3 py-1.5 text-xs font-semibold text-amber">
            + {diary.newReports} {diary.newReports === 1 ? "nuova segnalazione" : "nuove segnalazioni"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-viola-soft px-3 py-1.5 text-xs font-semibold text-viola">
            💬 {diary.newPosts} {diary.newPosts === 1 ? "nuova conversazione" : "nuove conversazioni"}
          </span>
        </div>
        {diary.operaUpdates.length > 0 ? (
          <ul className="mt-3 space-y-2 border-t border-border pt-3">
            {diary.operaUpdates.map((u, i) => (
              <li key={`${u.operaId}-${i}`} className="text-sm">
                <Link href={`/opere/${u.operaId}`} className="font-semibold hover:text-teal">
                  {u.operaName}
                </Link>
                <span className="text-muted"> — {u.note}</span>
                <span className="ml-1.5 text-xs tabular-nums text-muted-2">({u.progress}%)</span>
              </li>
            ))}
          </ul>
        ) : null}
        {diary.pacts.length > 0 ? (
          <ul className="mt-3 space-y-2 border-t border-border pt-3">
            {diary.pacts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                <Link href="/patti" className="min-w-0 truncate font-medium hover:text-teal">
                  🤝 {p.title}
                </Link>
                <span className="flex shrink-0 items-center gap-2">
                  <Badge color={pactStatus(p.status).color} className="px-2 py-0.5 text-[11px]">
                    {pactStatus(p.status).label}
                  </Badge>
                  <span className="text-xs tabular-nums text-muted-2">{p.progress}%</span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-3 text-xs text-muted-2">
          Riepilogo degli ultimi 7 giorni, calcolato dai dati della piattaforma.
        </p>
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
