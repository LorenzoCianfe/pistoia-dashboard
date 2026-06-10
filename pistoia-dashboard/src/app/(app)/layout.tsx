import { requireUser } from "@/lib/auth/dal";
import { getUnreadCount } from "@/lib/data/notifiche";
import { TopBar } from "@/components/app/top-bar";
import { SideNav } from "@/components/app/side-nav";
import { BottomNav } from "@/components/app/bottom-nav";
import { Footer } from "@/components/app/footer";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const unread = await getUnreadCount(user.id);

  return (
    <div className="min-h-dvh">
      <a
        href="#contenuto"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-pill focus-visible:bg-surface focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:shadow-lg"
      >
        Salta al contenuto
      </a>
      <TopBar user={user} unread={unread} />
      <div className="mx-auto flex max-w-6xl gap-7 px-4 sm:px-6">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-56 shrink-0 overflow-y-auto py-6 lg:block">
          <SideNav isAdmin={user.role === "ADMIN"} />
        </aside>
        <main
          id="contenuto"
          tabIndex={-1}
          className="min-w-0 flex-1 pb-28 pt-6 outline-none lg:pb-12"
        >
          {children}
          <Footer />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
