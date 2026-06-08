import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getNotifications } from "@/lib/data/notifiche";
import { SectionHeader } from "@/components/ui/section-header";
import { NotificationsList } from "@/components/notifiche/notifications-list";

export const metadata: Metadata = { title: "Notifiche" };

export default async function NotifichePage() {
  const user = await requireUser();
  const notifications = await getNotifications(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SectionHeader
        eyebrow="Aggiornamenti"
        title="Notifiche"
        description="Risposte del Comune, nuovi sondaggi e avanzamenti dei cantieri."
        icon={<Bell size={22} />}
      />
      <NotificationsList notifications={notifications} />
    </div>
  );
}
