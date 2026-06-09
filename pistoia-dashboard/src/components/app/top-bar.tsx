import Link from "next/link";
import { Bell } from "lucide-react";
import { Crest } from "@/components/brand/crest";
import { PreviewBadge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ProfileMenu } from "./profile-menu";
import type { CurrentUser } from "@/lib/auth/dal";

export function TopBar({
  user,
  unread,
}: {
  user: CurrentUser;
  unread: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/la-mia-citta" className="flex items-center gap-2.5">
          <Crest className="h-8 w-auto" />
          <span className="hidden font-bold tracking-tight sm:inline">
            Comune di Pistoia
          </span>
          <PreviewBadge className="hidden md:inline-flex" />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/notifiche"
            aria-label={`Notifiche${unread > 0 ? `, ${unread} non lette` : ""}`}
            className="relative grid size-9 place-items-center rounded-full border border-border bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Bell size={18} />
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[var(--red)] px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>
          <ProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
