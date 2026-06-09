import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { cn } from "@/lib/utils";
import { VERIFICATION, ACCOUNT_TYPE } from "@/lib/community";

/** Full verification badge: emoji + label on a soft tinted pill. */
export function VerificationBadge({
  type,
  className,
}: {
  type: string | null | undefined;
  className?: string;
}) {
  const v = type ? VERIFICATION[type] : null;
  if (!v) return null;
  return (
    <Badge color={v.color} className={className}>
      <span aria-hidden>{v.emoji}</span>
      {v.label}
    </Badge>
  );
}

/**
 * Compact verification marker shown inline next to an author's name in feeds.
 * A blue check for verified citizens; the type emoji for orgs / the Comune.
 */
export function AuthorVerification({
  type,
  size = 15,
}: {
  type: string | null | undefined;
  size?: number;
}) {
  if (!type) return null;
  const v = VERIFICATION[type];
  if (!v) return null;
  if (type === "IDENTITY" || type === "RESIDENCY") {
    return <VerifiedBadge size={size} />;
  }
  return (
    <span
      className="text-[13px] leading-none"
      title={v.label}
      aria-label={v.label}
    >
      {v.emoji}
    </span>
  );
}

/** A row of awarded civic badges (verification + reputation). */
export function BadgeList({
  badges,
  className,
}: {
  badges: { badgeType: string; label: string; icon: string | null }[];
  className?: string;
}) {
  if (badges.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((b) => (
        <span
          key={b.badgeType}
          className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground/80 ring-1 ring-border"
        >
          <span aria-hidden>{b.icon ?? "•"}</span>
          {b.label}
        </span>
      ))}
    </div>
  );
}

export function AccountTypeBadge({ accountType }: { accountType: string }) {
  if (accountType === "CITIZEN") return null;
  const a = ACCOUNT_TYPE[accountType];
  if (!a) return null;
  return <Badge color={a.color}>{a.label}</Badge>;
}
