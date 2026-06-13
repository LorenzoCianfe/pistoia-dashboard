import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Building2, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getReport, getCategoryAvgDays } from "@/lib/data/reports";
import { getProjectOfReport } from "@/lib/data/territorio";
import { projectStatus } from "@/lib/territorio";
import { isFollowing } from "@/lib/data/follow";
import { getAnswerFeedback } from "@/lib/data/feedback";
import { FolderKanban, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/community/confirm-button";
import { FollowButton } from "@/components/community/follow-button";
import { AnswerFeedback } from "@/components/community/answer-feedback";
import { MapCanvas } from "@/components/mappa/map-canvas";
import { ReportStatusTrack } from "@/components/community/report-status-track";
import { PhasePhotos } from "@/components/community/phase-photos";
import { ResolutionConfirm } from "@/components/community/resolution-confirm";
import {
  reportCategory,
  reportStatus,
  reportUrgency,
  RESOLUTION_FEEDBACK,
} from "@/lib/community";
import { accent } from "@/lib/colors";
import { formatDate, formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Segnalazione" };

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const report = await getReport(id, user.id);
  if (!report) notFound();

  const following = await isFollowing(user.id, "report", report.id);
  const project = await getProjectOfReport(report.id);
  const cat = reportCategory(report.category);
  const urgency = reportUrgency(report.urgency);
  const avg = await getCategoryAvgDays(report.category);
  const hasOfficial = report.updates.some((u) => u.official);
  const fb = hasOfficial
    ? await getAnswerFeedback("report", report.id, user.id)
    : null;
  const isResolved = report.status === "risolta" || report.status === "chiusa";
  const feedback = report.resolutionFeedback
    ? RESOLUTION_FEEDBACK[report.resolutionFeedback]
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href="/segnalazioni"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Tutte le segnalazioni
      </Link>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={cat.color}>{cat.label}</Badge>
          <Badge color={reportStatus(report.status).color}>
            {reportStatus(report.status).label}
          </Badge>
          {urgency ? <Badge color={urgency.color}>{urgency.label}</Badge> : null}
          {feedback ? <Badge color={feedback.color}>{feedback.label}</Badge> : null}
        </div>

        <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>

        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-2">
          <span>Segnalato da {report.authorName}</span>
          {report.neighborhoodName ? (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {report.neighborhoodName}
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <Clock size={12} />
            <span suppressHydrationWarning>{formatRelativeTime(report.createdAt)}</span>
          </span>
          {report.assignedDepartment ? (
            <span className="flex items-center gap-1">
              <Building2 size={12} />
              {report.assignedDepartment}
            </span>
          ) : null}
        </p>

        <p className="text-[15px] leading-relaxed">{report.description}</p>

        {/* Location map (§10) */}
        {report.latitude != null && report.longitude != null ? (
          <div className="overflow-hidden rounded-[var(--radius-sm)] border border-border">
            <MapCanvas
              points={[
                {
                  id: report.id,
                  layer: "segnalazioni",
                  lat: report.latitude,
                  lng: report.longitude,
                  title: report.title,
                  subtitle: report.location,
                  color: cat.color,
                },
              ]}
              className="h-56 w-full"
            />
          </div>
        ) : (
          <div
            className="grid h-32 place-items-center rounded-[var(--radius-sm)] text-center text-xs text-muted-2"
            style={{
              background: `linear-gradient(120deg, ${accent(cat.color).soft}, ${accent("teal").soft})`,
            }}
          >
            <span className="flex items-center gap-1.5">
              <MapPin size={16} />
              {report.location ?? "Posizione non specificata"}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <ConfirmButton
            reportId={report.id}
            confirmed={report.confirmedByMe}
            count={report.confirmations}
          />
          <FollowButton targetType="report" targetId={report.id} following={following} />
        </div>
      </Card>

      {/* "Da segnalazione a progetto" (A2 §8, O4): se questa segnalazione fa
          parte di un cluster diventato progetto, lo dichiariamo e ci si collega. */}
      {project ? (
        <Link href="/progetti">
          <Card hover className="flex items-center gap-3 border-teal/30 bg-teal-soft/20">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-soft text-teal" aria-hidden>
              <FolderKanban size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-2">Parte di un progetto pubblico</p>
              <p className="truncate text-sm font-semibold">{project.title}</p>
            </div>
            <Badge color={projectStatus(project.status).color}>
              {projectStatus(project.status).label}
            </Badge>
            <ArrowRight size={16} className="shrink-0 text-muted-2" aria-hidden />
          </Card>
        </Link>
      ) : null}

      {/* Foto per fase (A1 §4): prima dal cittadino, durante/dopo dal Comune */}
      {report.photoData || report.photos.length > 0 ? (
        <Card>
          <PhasePhotos
            reportTitle={report.title}
            citizenPhoto={report.photoData}
            citizenName={report.authorName}
            photos={report.photos}
          />
        </Card>
      ) : null}

      {/* Lifecycle */}
      <Card>
        <h2 className="text-base font-semibold">Stato dell’intervento</h2>
        <div className="mt-4">
          <ReportStatusTrack status={report.status} />
        </div>

        {/* Ufficio competente sempre visibile (A1 §6) + tempi medi (A1 §7) */}
        <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Building2 size={16} className="mt-0.5 shrink-0 text-muted-2" aria-hidden />
            <div>
              <dt className="text-xs font-medium text-muted-2">Ufficio competente</dt>
              <dd className="font-medium">
                {report.assignedDepartment ?? "In attesa di assegnazione"}
              </dd>
            </div>
          </div>
          {avg ? (
            <div className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 shrink-0 text-muted-2" aria-hidden />
              <div>
                <dt className="text-xs font-medium text-muted-2">
                  Tempo medio per «{cat.label}»
                </dt>
                <dd className="font-medium">
                  ~{avg.days} {avg.days === 1 ? "giorno" : "giorni"}
                  <span className="ml-1.5 text-xs font-normal text-muted-2">
                    dato storico indicativo, non una promessa
                  </span>
                </dd>
              </div>
            </div>
          ) : null}
        </dl>

        {/* Conferma del cittadino dopo la risoluzione (A1 §5) */}
        {report.isMine && isResolved && !report.resolutionFeedback ? (
          <div className="mt-5 rounded-[var(--radius-sm)] border border-[color-mix(in_oklab,var(--green)_30%,transparent)] bg-[var(--green-soft)]/40 p-4">
            <ResolutionConfirm reportId={report.id} />
          </div>
        ) : null}
        {feedback ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: accent(feedback.color).fg }}
              aria-hidden
            />
            {feedback.label}
            {report.resolutionFeedbackAt ? (
              <span className="text-xs text-muted-2" suppressHydrationWarning>
                · {formatDate(report.resolutionFeedbackAt)}
              </span>
            ) : null}
          </p>
        ) : null}
      </Card>

      {/* Timeline pubblica (A1 §3): la cronologia completa, visibile a tutti */}
      <Card>
        <h2 className="text-base font-semibold">La storia di questa segnalazione</h2>
        <p className="text-sm text-muted">
          Ogni passaggio è pubblico: chi ha fatto cosa, e quando.
        </p>
        <ol className="mt-5 space-y-0">
          {report.updates.map((u, i) => {
            const st = reportStatus(u.status);
            const last = i === report.updates.length - 1;
            return (
              <li key={u.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                {/* Connettore verticale */}
                {!last ? (
                  <span
                    className="absolute left-[7px] top-5 h-full w-0.5 bg-border"
                    aria-hidden
                  />
                ) : null}
                <span
                  className="relative mt-1 grid size-4 shrink-0 place-items-center"
                  aria-hidden
                >
                  <span
                    className="size-2.5 rounded-full ring-4 ring-[var(--surface)]"
                    style={{ backgroundColor: accent(st.color).fg }}
                  />
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {st.label}
                    <span
                      className={
                        u.official
                          ? "rounded-pill bg-[var(--red-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--red)]"
                          : "rounded-pill bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted"
                      }
                    >
                      {u.authorName ?? (u.official ? "Comune di Pistoia" : "Cittadino")}
                    </span>
                  </p>
                  {u.note ? <p className="mt-0.5 text-sm text-muted">{u.note}</p> : null}
                  <p className="mt-0.5 text-xs text-muted-2" suppressHydrationWarning>
                    {formatDate(u.createdAt)} · {formatRelativeTime(u.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        {fb ? (
          <div className="mt-4 border-t border-border pt-3">
            <AnswerFeedback
              targetType="report"
              targetId={report.id}
              helpfulCount={fb.helpfulCount}
              myVote={fb.myVote}
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}
