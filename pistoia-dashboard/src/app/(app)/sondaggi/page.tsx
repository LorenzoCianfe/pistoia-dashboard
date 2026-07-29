import type { Metadata } from "next";
import { Vote, Smile } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getPolls, SODDISFAZIONE_DIGITALE } from "@/lib/data/sondaggi";
import { getOrg } from "@/lib/data/organigramma";
import { Card, CardEyebrow } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { DisplayNumber } from "@/components/signature/display-number";
import { RingGauge } from "@/components/charts/ring-gauge";
import { PollCard } from "@/components/sondaggi/poll-card";
import { FollowButton } from "@/components/assessori/follow-button";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Sondaggi" };

export default async function SondaggiPage() {
  const user = await requireUser();
  const [polls, org] = await Promise.all([
    getPolls(user.id),
    getOrg(user.id),
  ]);

  const followMap = new Map(
    [org.sindaco, ...org.members]
      .filter(Boolean)
      .map((m) => [m!.id, m!.followedByMe]),
  );

  const mainPoll = polls.find((p) => p.active) ?? polls[0];
  const referente = mainPoll?.assessore;

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
          {referente ? (
            <Card>
              <CardEyebrow>Assessore di riferimento</CardEyebrow>
              <div className="mt-3 flex items-center gap-3">
                <Avatar
                  initials={referente.initials}
                  color={referente.color}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">{referente.name}</p>
                  <p className="text-sm text-muted">{referente.role}</p>
                </div>
              </div>
              {/*
                Era «Eletta con N preferenze», al femminile fisso: su Davide
                Innocenti o Tommaso Vannini la frase era semplicemente
                sbagliata. La forma senza participio vale per chiunque e non
                obbliga a portarsi dietro un genere nel modello dati.
              */}
              <p className="mt-3 text-sm text-muted">
                <span className="font-semibold text-foreground">
                  {formatNumber(referente.votesElected)}
                </span>{" "}
                preferenze alle elezioni.
              </p>
              <div className="mt-4">
                <FollowButton
                  assessoreId={referente.id}
                  following={followMap.get(referente.id) ?? false}
                />
              </div>
            </Card>
          ) : null}

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
