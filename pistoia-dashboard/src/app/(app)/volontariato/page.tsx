import type { Metadata } from "next";
import { HeartHandshake, MapPin, CalendarDays, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getInitiatives } from "@/lib/data/territorio";
import { InitiativeJoinButton } from "@/components/territorio/initiative-join";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { DisplayNumber } from "@/components/signature/display-number";
import { initiativeCategory, initiativeStatus } from "@/lib/territorio";
import { formatDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Volontariato e iniziative",
  description:
    "La bacheca delle iniziative di Comune e associazioni: pulizie, piantumazioni, raccolte solidali. Aderisci con un clic.",
};

/*
  Volontariato e iniziative (A2 §14, O4): la città che si prende cura di sé.
  Adesione con un clic, posti contati onestamente, archivio di ciò che è stato.
*/

export default async function VolontariatoPage() {
  const user = await requireUser();
  const initiatives = await getInitiatives(user.id);
  const active = initiatives.filter((i) => i.status !== "conclusa");
  const past = initiatives.filter((i) => i.status === "conclusa");

  /*
    La cifra conta le iniziative con le adesioni ancora aperte, non i
    partecipanti: `getInitiatives` somma ai `joins` veri il `baseJoins` del
    seed, quindi un totale di volontari sarebbe gonfiato — accettabile nella
    riga «N partecipanti» di una scheda, non a 88px. Le iniziative invece sono
    righe vere.

    È anche la cifra giusta per il compito di questa pagina: chi arriva vuole
    sapere a cosa può aderire *adesso*, non quanta gente ha aderito prima.
  */
  const aperte = initiatives.filter((i) => i.status === "aperta").length;
  const esaurite = initiatives.filter((i) => i.status === "completa").length;
  const dalComune = active.filter((i) => i.official).length;

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Territorio"
        title="Volontariato e iniziative"
        description="Pulizie di quartiere, piantumazioni, raccolte solidali: le iniziative di Comune e associazioni in un'unica bacheca. Aderisci con un clic — i posti contano davvero."
        icon={<HeartHandshake size={26} />}
      />

      {initiatives.length > 0 ? (
        <Card>
          <DisplayNumber
            value={aperte}
            unit={aperte === 1 ? "iniziativa" : "iniziative"}
            label="Con le adesioni aperte"
          />
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
            su {formatNumber(initiatives.length)} in bacheca
            {esaurite > 0 ? (
              <>
                {" · "}
                {formatNumber(esaurite)}{" "}
                {esaurite === 1
                  ? "ha i posti esauriti"
                  : "hanno i posti esauriti"}
              </>
            ) : null}
            {past.length > 0 ? (
              <>
                {" · "}
                {formatNumber(past.length)} già{" "}
                {past.length === 1 ? "svolta" : "svolte"}
              </>
            ) : null}
            .
            {dalComune > 0 ? (
              <>
                {" "}
                <span className="font-semibold text-teal">
                  {formatNumber(dalComune)}
                </span>{" "}
                {dalComune === 1
                  ? "è organizzata dal Comune"
                  : "sono organizzate dal Comune"}
                , le altre da associazioni del territorio.
              </>
            ) : null}
          </p>
        </Card>
      ) : null}

      {initiatives.length === 0 ? (
        <EmptyState
          title="Nessuna iniziativa in bacheca"
          description="Quando Comune e associazioni organizzeranno qualcosa, qui potrai aderire con un clic."
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2 stagger">
            {active.map((i) => {
              const cat = initiativeCategory(i.category);
              const st = initiativeStatus(i.status);
              const full =
                i.spots !== null && i.joins >= i.spots && i.status !== "conclusa";
              return (
                <Card key={i.id} className="flex h-full flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color={cat.color}>
                      <span aria-hidden>{cat.emoji}</span> {cat.label}
                    </Badge>
                    <Badge color={st.color}>{st.label}</Badge>
                    {i.official ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--red)]">
                        <ShieldCheck size={13} aria-hidden /> Comune di Pistoia
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <h2 className="text-base font-bold tracking-tight">{i.title}</h2>
                    <p className="mt-1 text-xs text-muted-2">a cura di {i.organizerName}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">{i.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
                    {i.startAt ? (
                      <span className="inline-flex items-center gap-1.5" suppressHydrationWarning>
                        <CalendarDays size={13} aria-hidden />
                        {formatDate(i.startAt)}
                      </span>
                    ) : null}
                    {i.location ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} aria-hidden />
                        {i.location}
                        {i.neighborhoodName ? ` · ${i.neighborhoodName}` : ""}
                      </span>
                    ) : null}
                    {i.spots !== null ? (
                      <span className="tabular-nums">
                        {Math.min(i.joins, i.spots)}/{i.spots} posti
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-auto border-t border-border pt-3">
                    <InitiativeJoinButton
                      initiativeId={i.id}
                      joined={i.joined}
                      joins={i.joins}
                      open={i.status === "aperta"}
                      full={full}
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          {past.length > 0 ? (
            <section aria-labelledby="iniziative-passate">
              <h2
                id="iniziative-passate"
                className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2"
              >
                Già successe
              </h2>
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                {past.map((i) => {
                  const cat = initiativeCategory(i.category);
                  return (
                    <Card key={i.id} className="space-y-2 opacity-80">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge color={cat.color}>
                          <span aria-hidden>{cat.emoji}</span> {cat.label}
                        </Badge>
                        {i.startAt ? (
                          <span className="text-xs text-muted-2" suppressHydrationWarning>
                            {formatDate(i.startAt)}
                          </span>
                        ) : null}
                        <span className="ml-auto text-xs font-medium text-muted">
                          {i.joins} partecipanti
                        </span>
                      </div>
                      <h3 className="text-sm font-bold tracking-tight">{i.title}</h3>
                      <p className="text-sm leading-relaxed text-muted">{i.description}</p>
                    </Card>
                  );
                })}
              </div>
            </section>
          ) : null}
        </>
      )}

      <Card className="bg-surface-2/40">
        <p className="text-sm text-muted">
          Iniziative <strong>dimostrative</strong>: in una versione reale le
          associazioni verificate pubblicherebbero da sole, con approvazione del
          Comune — come già accade per gli eventi.
        </p>
      </Card>
    </div>
  );
}
