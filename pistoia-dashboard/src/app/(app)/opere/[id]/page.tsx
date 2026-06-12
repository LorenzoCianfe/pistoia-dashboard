import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Banknote,
  UserCog,
  HelpCircle,
  Images,
  Footprints,
} from "lucide-react";
import { getOperaById } from "@/lib/data/opere";
import { requireUser } from "@/lib/auth/dal";
import { isFollowing } from "@/lib/data/follow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FollowButton } from "@/components/community/follow-button";
import { OperaComments } from "@/components/opere/opera-comments";
import { MapCanvas } from "@/components/mappa/map-canvas";
import { SimpleExplainer } from "@/components/trasparenza/simple-explainer";
import { canModerate } from "@/lib/community";
import { parseStringArray } from "@/lib/transparency";
import { operaStatus, operaCategory } from "@/lib/labels";
import {
  formatEuroCompact,
  formatDate,
  formatDateShort,
} from "@/lib/format";
import { accent } from "@/lib/colors";

export const metadata: Metadata = { title: "Cantiere" };

const PHASES = [
  { key: "prima", label: "Prima" },
  { key: "durante", label: "Durante" },
  { key: "dopo", label: "Dopo" },
] as const;

export default async function OperaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const opera = await getOperaById(id);
  if (!opera) notFound();

  const following = await isFollowing(user.id, "opera", opera.id);
  const status = operaStatus(opera.status);
  const latest = opera.updates[0];
  const hasPhotos = opera.photos.length > 0;
  const impactNotes = parseStringArray(opera.impactNotes);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href="/opere"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Tutte le opere
      </Link>

      {/* Header */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="teal" soft className="bg-surface-2">
            {operaCategory(opera.category)}
          </Badge>
          <Badge color={status.color}>{status.label}</Badge>
          {opera.neighborhood ? (
            <Link
              href={`/quartieri/${opera.neighborhood.slug}`}
              className="flex items-center gap-1 text-xs text-muted-2 hover:text-foreground"
            >
              <MapPin size={11} />
              {opera.neighborhood.name}
            </Link>
          ) : null}
        </div>

        <h1 className="text-2xl font-bold tracking-tight">{opera.name}</h1>
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
          {opera.description}
        </p>

        {/* avanzamento */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted">
              <MapPin size={13} />
              {opera.location ?? "Pistoia"}
            </span>
            <span className="text-lg font-bold tabular-nums">{opera.progress}%</span>
          </div>
          <ProgressBar value={opera.progress} height={10} />
          {latest ? (
            <p className="mt-2 text-xs text-muted-2">
              Ultimo aggiornamento ({formatDateShort(latest.date)}): {latest.note}
            </p>
          ) : null}
        </div>

        {/* key facts */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            label="Investimento"
            value={formatEuroCompact(opera.investment)}
          />
          <Stat
            label="Fine prevista"
            value={opera.expectedEnd ? formatDateShort(opera.expectedEnd) : "—"}
          />
          <Stat
            label="Avvio lavori"
            value={opera.startedAt ? formatDateShort(opera.startedAt) : "—"}
          />
        </div>

        <dl className="grid gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-2/50 p-4 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Banknote size={16} className="mt-0.5 shrink-0 text-muted-2" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                Fonte di finanziamento
              </dt>
              <dd className="mt-0.5">{opera.fundingSource ?? "Non specificata"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <UserCog size={16} className="mt-0.5 shrink-0 text-muted-2" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                Responsabile del procedimento (RUP)
              </dt>
              <dd className="mt-0.5">{opera.rup ?? "Non specificato"}</dd>
            </div>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <FollowButton targetType="opera" targetId={opera.id} following={following} />
          {opera.latitude != null && opera.longitude != null ? (
            <Link
              href="/mappa?layer=opere"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:underline"
            >
              <MapPin size={15} />
              Vedi sulla mappa
            </Link>
          ) : null}
        </div>
      </Card>

      {/* "Spiegamelo semplice" (A2 §11, O3): l'opera in linguaggio cittadino. */}
      {opera.simpleText ? <SimpleExplainer text={opera.simpleText} /> : null}

      {/* "Cosa cambia per me?" (A1 §24 + A2 §30, O3): impatto pratico del
          cantiere su chi ci vive e ci lavora intorno. */}
      {impactNotes.length > 0 ? (
        <Card>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Footprints size={18} aria-hidden />
            Cosa cambia per me
          </h2>
          <ul className="mt-3 space-y-2.5">
            {impactNotes.map((note) => (
              <li key={note} className="flex gap-2.5 text-sm leading-relaxed">
                <span
                  className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[var(--teal)]"
                  aria-hidden
                />
                {note}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-2">
            Informazioni pratiche a cura del Comune · aggiornate con l&apos;avanzamento del cantiere
          </p>
        </Card>
      ) : null}

      {/* Location map (§10) */}
      {opera.latitude != null && opera.longitude != null ? (
        <Card className="overflow-hidden p-0">
          <MapCanvas
            points={[
              {
                id: opera.id,
                layer: "opere",
                lat: opera.latitude,
                lng: opera.longitude,
                title: opera.name,
                subtitle: opera.location,
                color: "teal",
              },
            ]}
            className="h-56 w-full"
          />
        </Card>
      ) : null}

      {/* Photos: before / during / after */}
      {hasPhotos ? (
        <Card>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Images size={18} />
            Foto del cantiere
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {PHASES.map((ph) => {
              const items = opera.photos.filter((p) => p.phase === ph.key);
              if (items.length === 0) return null;
              return (
                <div key={ph.key} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                    {ph.label}
                  </p>
                  {items.map((p) => (
                    <figure key={p.id} className="overflow-hidden rounded-[var(--radius-sm)] border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.data}
                        alt={p.caption ?? `${ph.label} — ${opera.name}`}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      {p.caption ? (
                        <figcaption className="px-2 py-1.5 text-xs text-muted-2">
                          {p.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {/* Updates timeline */}
      {opera.updates.length > 0 ? (
        <Card>
          <h2 className="text-base font-semibold">Cronologia avanzamento</h2>
          <ol className="mt-4 space-y-4">
            {opera.updates.map((u) => (
              <li key={u.id} className="flex gap-3">
                <span
                  className="mt-1 size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: accent(status.color).fg }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{u.progress}% — {u.note}</p>
                  <p className="mt-0.5 text-xs text-muted-2" suppressHydrationWarning>
                    {formatDate(u.date)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}

      {/* FAQ */}
      {opera.faqs.length > 0 ? (
        <Card>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <HelpCircle size={18} />
            Domande frequenti
          </h2>
          <div className="mt-3 divide-y divide-border">
            {opera.faqs.map((f) => (
              <details key={f.id} className="group py-3">
                <summary className="cursor-pointer list-none font-medium marker:hidden">
                  <span className="flex items-center justify-between gap-2">
                    {f.question}
                    <span className="text-muted-2 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.answer}</p>
              </details>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Comments */}
      <Card>
        <OperaComments
          operaId={opera.id}
          comments={opera.comments}
          currentUserName={user.publicName?.trim() || user.name}
          canComment
          canModerate={canModerate(user.role)}
        />
      </Card>
    </div>
  );
}
