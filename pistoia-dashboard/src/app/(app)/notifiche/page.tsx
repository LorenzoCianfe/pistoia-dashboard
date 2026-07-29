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
    /*
      Nessuna cifra display e nessun indice, ed è una scelta.

      «5 non lette» sta già nell'intestazione della lista, alla misura giusta e
      accanto al pulsante che le azzera: promuoverlo a 88px lo staccherebbe
      dall'azione. E l'indice qui non serve — /impostazioni e /glossario sono
      elenchi in cui si cerca UNA voce, questo è un flusso che si scorre, e ha
      già i filtri per tema e il raggruppamento temporale nel componente.
    */
    <div className="mx-auto max-w-2xl space-y-5 page-enter">
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
