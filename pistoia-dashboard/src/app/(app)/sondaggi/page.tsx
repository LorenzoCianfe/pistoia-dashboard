import type { Metadata } from "next";
import { Vote, Smile } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getPolls, SODDISFAZIONE_DIGITALE } from "@/lib/data/sondaggi";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { DisplayNumber } from "@/components/signature/display-number";
import { RingGauge } from "@/components/charts/ring-gauge";
import { PollCard } from "@/components/sondaggi/poll-card";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Sondaggi" };

/*
  La scheda «Assessore di riferimento» è stata tolta il 2026-08-03, insieme al
  collegamento fra `Poll` e `Assessore` nel seed.

  Diceva «Eletta con N preferenze» accanto a una persona, e reggeva finché
  quella persona era inventata. Con la giunta vera diventava due affermazioni
  false su una persona reale: che avesse aperto una consultazione dimostrativa,
  e un numero di preferenze che per cinque dei nove non esiste in nessuna fonte
  (vedi `lib/giunta.ts`). Il referente si potrà rimettere quando un sondaggio
  sarà davvero di qualcuno.
*/
export default async function SondaggiPage() {
  const user = await requireUser();
  const polls = await getPolls(user.id);

  /*
    La cifra conta i sondaggi APERTI, mai i voti.

    Il primo scaglione della Fase B aveva escluso questa pagina in blocco
    perché `getPolls` somma `demoBaseline(baseVotes)` ai voti veri, e a 88px
    quel totale sarebbe il numero più grande e più gonfiato della pagina. Vero,
    ma l'esclusione era scritta troppo larga: valeva per una cifra *sui voti*,
    non per qualunque cifra. I sondaggi sono righe di `Poll`, e `active` e
    `userOptionId` non passano da nessun baseline.

    È esattamente la scelta già fatta su /priorita, dove per la stessa ragione
    si contano gli interventi in votazione e non i voti raccolti — e risponde
    alla domanda giusta: chi arriva qui vuole sapere a cosa può rispondere
    adesso, non quanta gente ha già risposto.
  */
  const aperti = polls.filter((p) => p.active);
  const gia = aperti.filter((p) => p.userOptionId !== null).length;
  const chiusi = polls.length - aperti.length;

  return (
    <div className="space-y-5 page-enter">
      <SectionHeader
        eyebrow="La voce dei cittadini"
        title="Sondaggi"
        description="Il Comune fa una domanda, tu rispondi. I risultati sono pubblici e in tempo reale."
        icon={<Vote size={22} />}
      />

      {aperti.length > 0 ? (
        <Card>
          <DisplayNumber
            value={aperti.length}
            unit={aperti.length === 1 ? "sondaggio" : "sondaggi"}
            label="Aperti adesso"
          />
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
            {gia === aperti.length
              ? "hai già risposto a tutti"
              : gia > 0
                ? `hai già risposto a ${formatNumber(gia)} su ${formatNumber(aperti.length)}`
                : "non hai ancora risposto"}
            {chiusi > 0 ? (
              <>
                {" · "}
                {formatNumber(chiusi)}{" "}
                {chiusi === 1 ? "chiuso" : "chiusi"}, con i risultati ancora
                pubblici
              </>
            ) : null}
            .
          </p>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Polls */}
        <div className="space-y-5">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>

        {/* Side column */}
        <div className="space-y-5">

          {/* Soddisfazione servizi digitali — KPI mock, visibile solo in DEMO_MODE */}
          {SODDISFAZIONE_DIGITALE != null ? (
            <Card>
              <div className="flex items-center gap-2">
                <Smile size={18} className="text-teal" />
                <h3 className="text-base font-semibold">Servizi digitali</h3>
              </div>
              <p className="mt-1 text-sm text-muted">
                Soddisfazione media dei cittadini.
              </p>
              <div className="mt-2 flex justify-center">
                <RingGauge
                  value={SODDISFAZIONE_DIGITALE}
                  color="green"
                  size={120}
                  label="Soddisfazione"
                />
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
