import type { Metadata } from "next";
import { Send, HardHat, Vote, Megaphone } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getContatoriAdmin, getOperePerAvanzamento } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import { OperaProgressForm } from "@/components/admin/opera-progress-form";
import { CreatePollForm } from "@/components/admin/create-poll-form";
import { BroadcastForm } from "@/components/admin/broadcast-form";

export const metadata: Metadata = { title: "Pubblica · Area Comune" };

/*
  GLI STRUMENTI, tutti e tre insieme.

  Non è una coda e **non ha un contatore**, per costruzione: qui non arriva
  niente: sei tu che decidi di aggiornare un cantiere, aprire un sondaggio,
  mandare una notifica. Uno strumento vuole essere *trovato* quando serve, non
  segnalare che c'è del lavoro (`DESIGN.md` §6) — e il tipo di `SuperficieAdmin`
  rende non scrivibile il contrario.

  Stanno su una pagina sola perché mescolarli alle code è esattamente ciò che
  impediva a `/admin` di dire se ci fosse qualcosa da fare.
*/
export default async function PubblicaAdminPage() {
  await requireAdmin();
  const [contatori, opere] = await Promise.all([
    getContatoriAdmin(),
    getOperePerAvanzamento(),
  ]);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Riservato al Comune"
        title="Pubblica"
        description="Gli strumenti con cui il Comune parla alla città: l'avanzamento di un cantiere, un sondaggio nuovo, una notifica a tutti."
        icon={<Send size={22} className="text-teal" />}
      />

      <NavAdmin contatori={contatori} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/*
          `grid-cols-1` accanto a `lg:grid-cols-2` non è ridondante: è la
          trappola 5 dell'ondata 7 (`AGENTS.md` §3). Sotto la soglia `lg` non
          esiste alcun `grid-template-columns`, quindi la traccia implicita è
          `auto` — e il minimo di `auto` è il **min-content**: la colonna non
          può stringersi sotto la larghezza minima della card più larga.
        */}
        <Card>
          <div className="flex items-center gap-2">
            <HardHat size={18} className="text-teal" />
            <h2 className="text-base font-semibold">Aggiorna un cantiere</h2>
          </div>
          <div className="mt-4">
            <OperaProgressForm opere={opere} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Vote size={18} className="text-teal" />
            <h2 className="text-base font-semibold">Crea un sondaggio</h2>
          </div>
          <div className="mt-4">
            <CreatePollForm />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2">
          <Megaphone size={18} className="text-teal" />
          <h2 className="text-base font-semibold">Invia una notifica</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Raggiunge tutti i cittadini registrati.
        </p>
        <div className="mt-4 max-w-md">
          <BroadcastForm />
        </div>
      </Card>
    </div>
  );
}
