import type { Metadata } from "next";
import { Users, BadgeCheck, ShieldAlert } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import {
  getContatoriAdmin,
  getModerationData,
  getSegnalazioniPerUnione,
  getVerifichePendenti,
} from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import { VerificationQueue } from "@/components/admin/verification-queue";
import { ModerationPanel } from "@/components/admin/moderation-panel";

export const metadata: Metadata = { title: "Cittadini · Area Comune" };

/*
  L'UNICA PAGINA CHE FONDE DUE CODE, e la scelta è dichiarata nel piano
  (`docs/piano-admin.md` §4): verifiche e moderazione stanno insieme perché
  sono lo stesso mestiere — tenere sana la comunità — e chi fa una fa l'altra.

  Se un giorno la regola pura dovesse vincere, diventano otto pagine e non
  cambia nient'altro: le due sezioni qui sotto sono già separate, e i loro dati
  arrivano da due funzioni distinte.

  Le **impostazioni della moderazione** (le parole bloccate) stanno qui e non in
  un `/admin/impostazioni`: è il primo corollario della regola — un cassetto
  delle impostazioni è il modo classico in cui il cassetto si riforma altrove.
*/
export default async function CittadiniAdminPage() {
  await requireAdmin();
  const [contatori, verifiche, moderazione, segnalazioni] = await Promise.all([
    getContatoriAdmin(),
    getVerifichePendenti(),
    getModerationData(),
    getSegnalazioniPerUnione(),
  ]);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Riservato al Comune"
        title="Cittadini e community"
        description="Chi chiede di essere verificato e ciò che la community segnala: due code, un mestiere solo."
        icon={<Users size={22} className="text-teal" />}
      />

      <NavAdmin contatori={contatori} />

      <Card>
        <div className="flex items-center gap-2">
          <BadgeCheck size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Richieste di verifica</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Approva o rifiuta le richieste dei cittadini e delle organizzazioni.
        </p>
        <div className="mt-4">
          <VerificationQueue items={verifiche} />
        </div>
      </Card>

      {/* Moderazione community (§14) */}
      <Card>
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-[var(--red)]" />
          <h2 className="text-base font-semibold">Moderazione community</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Commenti segnalati, ban e sospensioni, parole bloccate e unione di
          segnalazioni duplicate.
        </p>
        <div className="mt-4">
          <ModerationPanel
            flaggedComments={moderazione.flaggedComments}
            blockedWords={moderazione.blockedWords}
            sanctioned={moderazione.sanctioned}
            openReports={segnalazioni}
          />
        </div>
      </Card>
    </div>
  );
}
