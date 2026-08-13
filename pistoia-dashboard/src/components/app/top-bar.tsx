import Link from "next/link";
import { Bell } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { PreviewBadge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ProfileMenu } from "./profile-menu";
import { CommandPalette } from "./command-palette";
import type { CurrentUser } from "@/lib/auth/dal";

export function TopBar({
  user,
  unread,
}: {
  user: CurrentUser;
  unread: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-lg print:hidden">
      {/* `max-w-guscio`: la stessa misura del contenuto sotto, definita una
          volta sola in `globals.css`. Se le due divergono, il marchio si
          scolla dal titolo della pagina — e si vede. */}
      <div className="mx-auto flex h-16 max-w-guscio items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/la-mia-citta" className="flex items-center gap-2.5">
          {/* Sotto `sm` resta il solo segno: è la ragione per cui il segno
              esiste separato dal logotipo. */}
          <Wordmark logotipoClassName="hidden sm:inline" />
          <PreviewBadge className="hidden md:inline-flex" />
        </Link>

        <div className="flex items-center gap-2">
          <CommandPalette />
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
