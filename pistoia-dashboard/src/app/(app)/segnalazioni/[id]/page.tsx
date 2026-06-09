import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Building2, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getReport } from "@/lib/data/reports";
import { isFollowing } from "@/lib/data/follow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/community/confirm-button";
import { FollowButton } from "@/components/community/follow-button";
import { ReportStatusTrack } from "@/components/community/report-status-track";
import { reportCategory, reportStatus } from "@/lib/community";
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
  const cat = reportCategory(report.category);

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

        {/* Map placeholder */}
        <div
          className="grid h-32 place-items-center rounded-[var(--radius-sm)] text-center text-xs text-muted-2"
          style={{
            background: `linear-gradient(120deg, ${accent(cat.color).soft}, ${accent("teal").soft})`,
          }}
        >
          <span className="flex items-center gap-1.5">
            <MapPin size={16} />
            {report.location ?? "Posizione non specificata"} · mappa in arrivo
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <ConfirmButton
            reportId={report.id}
            confirmed={report.confirmedByMe}
            count={report.confirmations}
          />
          <FollowButton targetType="report" targetId={report.id} following={following} />
        </div>
      </Card>

      {/* Lifecycle */}
      <Card>
        <h2 className="text-base font-semibold">Stato dell’intervento</h2>
        <div className="mt-4">
          <ReportStatusTrack status={report.status} />
        </div>
      </Card>

      {/* Official updates timeline */}
      <Card>
        <h2 className="text-base font-semibold">Aggiornamenti</h2>
        <ol className="mt-4 space-y-4">
          {report.updates.map((u) => {
            const st = reportStatus(u.status);
            return (
              <li key={u.id} className="flex gap-3">
                <span
                  className="mt-1 size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: accent(st.color).fg }}
                />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {st.label}
                    {u.official ? (
                      <span className="rounded-pill bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                        {u.authorName ?? "Comune di Pistoia"}
                      </span>
                    ) : null}
                  </p>
                  {u.note ? <p className="mt-0.5 text-sm text-muted">{u.note}</p> : null}
                  <p className="mt-0.5 text-xs text-muted-2" suppressHydrationWarning>
                    {formatDate(u.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
