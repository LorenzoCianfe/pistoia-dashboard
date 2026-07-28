import type { Metadata } from "next";
import {
  Megaphone,
  Lightbulb,
  Vote,
  ListOrdered,
  MessageCircleQuestion,
  Handshake,
  FolderKanban,
  HeartHandshake,
} from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getCityState } from "@/lib/data/citystate";
import { getPolls } from "@/lib/data/sondaggi";
import {
  getPriorityRounds,
  getQuestionTimes,
  getInitiatives,
  getPacts,
  getCivicProjects,
} from "@/lib/data/territorio";
import { SectionHeader } from "@/components/ui/section-header";
import { HubNow, HubSections, type HubSection } from "@/components/app/hub";
import { formatConteggio, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Partecipa",
  description:
    "Gli otto modi di incidere sulle scelte di Pistoia: segnalare, proporre, votare, chiedere conto, prendersi cura di un luogo.",
};

/*
  Pagina-contenitore della partecipazione (Fase A, A-2).

  Prima del consolidamento questi otto strumenti erano sparsi fra il gruppo
  principale della barra laterale e un gruppo "Partecipazione", e su telefono
  NESSUNO dei sette diversi dalle segnalazioni era raggiungibile: la barra in
  basso portava solo le cinque voci marcate `core`. Eppure "partecipare" è uno
  dei due compiti primari della piattaforma.

  I conteggi vengono da `getCityState()` e non da query locali: il numero di
  segnalazioni aperte e di proposte attive ha già una definizione sola, e
  due definizioni dello stesso indicatore sono peggio di nessun indicatore
  (AGENTS.md §3).
*/

export default async function PartecipaPage() {
  const user = await requireUser();

  const [state, polls, rounds, questions, initiatives, pacts, projects] =
    await Promise.all([
      getCityState(),
      getPolls(user.id),
      getPriorityRounds(user.id),
      getQuestionTimes(user.id),
      getInitiatives(user.id),
      getPacts(),
      getCivicProjects(),
    ]);

  const sondaggiAperti = polls.filter((p) => p.active).length;
  const tornateAperte = rounds.filter((r) => r.status === "aperta").length;
  const iniziativeAperte = initiatives.filter((i) => i.status === "aperta").length;
  // Contati per stato, non sul totale: la riga diceva «N patti attivi»
  // includendo anche i proposti, e cliccandola la pagina — che i due stati li
  // distingue — mostrava un numero più basso. Due definizioni dello stesso
  // indicatore a un clic di distanza (AGENTS.md §3).
  const pattiAttivi = pacts.filter((p) => p.status === "attivo").length;

  const sections: HubSection[] = [
    {
      href: "/segnalazioni",
      label: "Segnalazioni",
      description:
        "Buche, lampioni spenti, rifiuti abbandonati: avvisi il Comune e segui cosa succede dopo.",
      icon: Megaphone,
      status: `${formatConteggio(state.reports.open, "aperta", "aperte")} in città`,
    },
    {
      href: "/proposte",
      label: "Proposte",
      description:
        "Un'idea concreta per migliorare la città. Con abbastanza sostegni, il Comune deve rispondere.",
      icon: Lightbulb,
      status: `${formatNumber(state.proposals.active)} in raccolta firme o valutazione`,
    },
    {
      href: "/sondaggi",
      label: "Sondaggi",
      description:
        "Consultazioni ufficiali e voti territoriali: di' la tua sulle scelte che riguardano tutti.",
      icon: Vote,
      status:
        sondaggiAperti > 0
          ? formatConteggio(sondaggiAperti, "aperto", "aperti")
          : null,
    },
    {
      href: "/priorita",
      label: "Vota la priorità",
      description:
        "Interventi già validati dagli uffici: scegli quale fare prima. Il voto orienta il calendario.",
      icon: ListOrdered,
      status:
        tornateAperte > 0
          ? formatConteggio(tornateAperte, "tornata aperta", "tornate aperte")
          : null,
    },
    {
      href: "/question-time",
      label: "Question time",
      description:
        "Le domande dei cittadini agli amministratori, con la risposta istituzionale accanto.",
      icon: MessageCircleQuestion,
      status: formatConteggio(questions.length, "domanda", "domande"),
    },
    {
      href: "/volontariato",
      label: "Volontariato",
      description:
        "Pulizie di quartiere, piantumazioni, raccolte solidali: la città che si prende cura di sé.",
      icon: HeartHandshake,
      status:
        iniziativeAperte > 0
          ? formatConteggio(iniziativeAperte, "iniziativa aperta", "iniziative aperte")
          : null,
    },
    {
      href: "/patti",
      label: "Patti e luoghi",
      description:
        "Cittadini e associazioni adottano uno spazio pubblico e se ne prendono cura nel tempo.",
      icon: Handshake,
      status: formatConteggio(pattiAttivi, "patto attivo", "patti attivi"),
    },
    {
      href: "/progetti",
      label: "Progetti civici",
      description:
        "Le segnalazioni ricorrenti diventano un progetto: un problema strutturale, una risposta sola.",
      icon: FolderKanban,
      status: formatConteggio(projects.length, "progetto", "progetti"),
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Partecipazione"
        title="Partecipa alla vita della città"
        description="Otto modi di incidere sulle scelte di Pistoia. Ognuno ha un perimetro dichiarato: sai in partenza cosa succede a quello che scrivi."
        icon={<Megaphone size={26} />}
      />

      <HubNow
        stats={[
          {
            value: formatNumber(state.reports.open),
            label: "segnalazioni aperte",
            href: "/segnalazioni",
          },
          {
            value: formatNumber(state.proposals.active),
            label: "proposte attive",
            href: "/proposte",
          },
          {
            value: sondaggiAperti + tornateAperte,
            label: "voti aperti adesso",
            href: "/sondaggi",
          },
        ]}
      />

      <HubSections sections={sections} />
    </div>
  );
}
