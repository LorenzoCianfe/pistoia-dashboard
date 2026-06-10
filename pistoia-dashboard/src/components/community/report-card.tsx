import Link from "next/link";
import {
  Construction,
  Lightbulb,
  Trash2,
  Trees,
  ShieldAlert,
  Volume2,
  Bus,
  Accessibility,
  School,
  PawPrint,
  Sparkles,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/community/confirm-button";
import { reportCategory, reportStatus } from "@/lib/community";
import { accent } from "@/lib/colors";
import { formatRelativeTime } from "@/lib/format";
import type { ReportListItem } from "@/lib/data/reports";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  buche: Construction,
  illuminazione: Lightbulb,
  rifiuti: Trash2,
  verde: Trees,
  sicurezza: ShieldAlert,
  rumore: Volume2,
  trasporto: Bus,
  barriere: Accessibility,
  scuole: School,
  parchi: Trees,
  animali: PawPrint,
  decoro: Sparkles,
};

export function ReportCard({ report }: { report: ReportListItem }) {
  const cat = reportCategory(report.category);
  const st = reportStatus(report.status);
  const Icon = CATEGORY_ICON[report.category] ?? Sparkles;
  const a = accent(cat.color);

  return (
    <Card hover className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {report.photoData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.photoData}
            alt=""
            className="mt-0.5 size-10 shrink-0 rounded-[var(--radius-sm)] object-cover"
          />
        ) : (
          <span
            className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-[var(--radius-sm)]"
            style={{ backgroundColor: a.soft, color: a.fg }}
          >
            <Icon size={20} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={cat.color}>{cat.label}</Badge>
            <Badge color={st.color}>{st.label}</Badge>
          </div>
          <Link
            href={`/segnalazioni/${report.id}`}
            className="mt-1.5 block font-semibold leading-snug hover:text-teal"
          >
            {report.title}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {report.description}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-2">
            {report.neighborhoodName ? (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {report.neighborhoodName}
              </span>
            ) : null}
            <span suppressHydrationWarning>{formatRelativeTime(report.createdAt)}</span>
            {report.assignedDepartment ? <span>· {report.assignedDepartment}</span> : null}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <ConfirmButton
          reportId={report.id}
          confirmed={report.confirmedByMe}
          count={report.confirmations}
        />
        <Link
          href={`/segnalazioni/${report.id}`}
          className="text-sm font-semibold text-teal hover:underline"
        >
          Dettaglio →
        </Link>
      </div>
    </Card>
  );
}
