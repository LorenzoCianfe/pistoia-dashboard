import type { Metadata } from "next";
import { Network, Users, Mail, ExternalLink, BadgeCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getOrg, type OrgMember } from "@/lib/data/organigramma";
import { Card, CardEyebrow } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "@/components/assessori/follow-button";
import { DataConsultazione, SchedaFonte } from "@/components/osservatorio/fonte";
import { GIUNTA, RIGA_GIUNTA, RIGA_INCOMPATIBILITA } from "@/lib/giunta";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Organigramma",
  description:
    "Chi ha la responsabilità di ogni delega nella giunta del Comune di Pistoia, con la scheda del Comune dietro ogni nome.",
};

/*
  Nove persone reali, e da qui discende tutto il resto della pagina.

  Fino al 2026-08-03 questa pagina mostrava una giunta inventata — Marco
  Ferrari sindaco, Elena Bartolini vicesindaca — mentre
  /trasparenza/costo-amministrazione, a un clic di distanza, dava i nomi veri.
  Due risposte diverse alla stessa domanda dentro la stessa applicazione.
  I fatti stanno ora in `lib/giunta.ts`, ognuno con la propria fonte.

  **Niente cifra display, e adesso per UN motivo solo invece di tre.** Dei tre
  della Fase B ne restano zero in piedi come erano scritti:

  - le preferenze elettorali sono sparite dal modello, perché per cinque
    persone su nove quel numero non esiste in nessuna fonte (spiegazione per
    esteso in testa a `lib/giunta.ts`);
  - «1 contattabile su 7» non è più vero: le nove schede del Comune pubblicano
    tutte un recapito, quindi i contattabili sono 9 su 9. Il difetto che quella
    riga denunciava — un rapporto minuscolo messo in evidenza si legge come
    un'accusa — è rientrato da sé;
  - resta il primo, e ora copre anche il secondo: **il numero sarebbe
    tautologico**. «9 su 9» e «8 aree di delega» sono due modi di contare le
    schede che il lettore ha già davanti. A 88px sarebbero decorazione.

  L'apertura la fa l'indice delle deleghe, che risponde alla domanda con cui si
  arriva qui — «di *questo* chi si occupa?» — meglio di qualunque totale. Da
  questa sessione le deleghe sono le 57 vere, non una etichetta per persona:
  chi cerca «Toponomastica» la trova senza aprire otto schede.

  **Il «Segui» resta ma esce di vetrina** (decisione di Lorenzo, 2026-08-03).
  Il bottone e il conteggio restano dove sono; la descrizione della pagina non
  promette più «quante persone segue ciascun assessore». Su nove politici in
  carica una metrica social messa in testa alla pagina orienta la lettura verso
  una classifica di popolarità, che non è ciò che questa pagina misura.
*/
export default async function OrganigrammaPage() {
  const user = await requireUser();
  const org = await getOrg(user.id);

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Chi governa la città"
        title="Organigramma"
        description="La giunta del Comune di Pistoia: chi ha la responsabilità di ogni delega, con la scheda del Comune dietro ogni nome."
        icon={<Network size={22} />}
      />

      {/*
        L'indice porta le deleghe **puntuali**, non le cariche: la carica è un
        sommario di tre parole («Cultura, Università e Tradizioni») e chi cerca
        «Toponomastica» dentro quel sommario non la trova. Il sindaco resta
        fuori — le sue non sono deleghe di materia ma i poteri che il TUEL gli
        attribuisce, e mescolarli farebbe cercare «Ordinanze» accanto a
        «Trasporto pubblico locale».
      */}
      {org.deleghe.length > 0 ? (
        <Card>
          <CardEyebrow>Cosa copre la giunta</CardEyebrow>
          {/*
            `grid-cols-1` accanto alle varianti con prefisso, e `min-w-0`
            sull'elemento: sotto la soglia `sm` la traccia implicita è `auto`,
            il cui minimo è il min-content, e l'elemento di griglia si ferma al
            proprio min-content anche quando la traccia è `minmax(0, 1fr)`.
            Qui il min-content è una delega lunga e inscindibile come
            «Attività produttive, vivaismo e sviluppo economico sostenibile»
            (AGENTS.md §3, ondata 7/5 e il suo corollario del 2026-07-29).
          */}
          <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3">
            {org.deleghe.map(({ delega, componente }) => (
              <li key={`${componente.id}-${delega}`} className="min-w-0">
                <a
                  href={`#assessore-${componente.id}`}
                  className="-mx-2 block rounded-inner px-2 py-1.5 transition-colors hover:bg-surface-2"
                >
                  <span className="block text-sm leading-snug">{delega}</span>
                  <span className="block text-xs text-muted-2">
                    {componente.nome}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
            {formatNumber(org.deleghe.length)} deleghe fra{" "}
            {formatNumber(org.members.length)} assessori, come le elenca il
            Comune. Scrivi a chi si occupa della materia: è la strada più breve.
          </p>
        </Card>
      ) : null}

      {/* Sindaco */}
      {org.sindaco ? (
        <Card className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 size-56 rounded-full bg-[var(--red-soft)] opacity-60 blur-2xl" />
          <div
            id={`assessore-${org.sindaco.id}`}
            className="relative scroll-mt-20"
          >
            <div className="flex flex-col items-center gap-4 py-2 text-center sm:flex-row sm:text-left">
              <Avatar
                initials={org.sindaco.iniziali}
                color={org.sindaco.colore}
                size="xl"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
                  {org.sindaco.carica}
                </p>
                <h2 className="text-2xl font-bold tracking-tight">
                  {org.sindaco.nome}
                </h2>
                <p className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted sm:justify-start">
                  <span className="flex items-center gap-1.5">
                    <BadgeCheck size={14} className="shrink-0" aria-hidden />
                    {org.sindaco.insediamento}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="shrink-0" aria-hidden />
                    {formatNumber(org.sindaco.followerCount)} follower
                  </span>
                </p>
              </div>
              <FollowButton
                assessoreId={org.sindaco.id}
                following={org.sindaco.followedByMe}
              />
            </div>

            {/*
              Le competenze del sindaco NON sono deleghe: gliele attribuisce il
              TUEL, non un decreto di delega. Stanno sulla sua scheda e non
              nell'indice sopra, per la ragione scritta lì.
            */}
            <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-1.5 border-t border-border pt-4 text-xs text-muted">
              {org.sindaco.deleghe.map((d) => (
                <li
                  key={d}
                  className="rounded-pill border border-border bg-surface-2/60 px-2.5 py-1"
                >
                  {d}
                </li>
              ))}
            </ul>
            <ContattoEFonte membro={org.sindaco} />
          </div>
        </Card>
      ) : null}

      {/* Connector */}
      <div className="flex justify-center" aria-hidden="true">
        <div className="h-6 w-px bg-border-strong" />
      </div>

      {/* Giunta */}
      <div>
        <h2 className="mb-3 px-1 text-base font-semibold">La giunta</h2>
        <div className="grid grid-cols-1 gap-4 stagger sm:grid-cols-2 lg:grid-cols-3">
          {org.members.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      </div>

      {/*
        Le fonti in fondo, una per persona più le due che valgono per tutti.
        Nove schede separate non dicono che la giunta sia composta da nove
        persone e non da dieci: quello lo dice la pagina della giunta, ed è una
        riga a parte. L'art. 64 del TUEL spiega perché su queste schede non
        compare nessun numero di preferenze.
      */}
      <section aria-labelledby="fonti">
        <h2
          id="fonti"
          className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2"
        >
          Da dove viene ogni nome
        </h2>
        <Card className="mt-3">
          <ul className="space-y-3">
            <SchedaFonte riga={RIGA_GIUNTA} />
            {GIUNTA.map((c) => (
              <SchedaFonte key={c.id} riga={c.riga} />
            ))}
            <SchedaFonte riga={RIGA_INCOMPATIBILITA} />
          </ul>
        </Card>
      </section>
    </div>
  );
}

/*
  Il recapito è **letto** dalla scheda, mai dedotto da uno schema. Tutti e otto
  gli assessori seguono `iniziale.cognome@comune.pistoia.it`, ma il sindaco è
  `sindaco@comune.pistoia.it`: chi avesse dedotto dal modello avrebbe sbagliato
  proprio la persona più in vista della pagina.

  `truncate` accorcia solo il testo — l'`href` resta intero, quindi a 360px il
  contatto si legge a metà ma funziona.
*/
function ContattoEFonte({ membro }: { membro: OrgMember }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-2">
      <a
        href={`mailto:${membro.email}`}
        className="flex min-w-0 items-center gap-1.5 hover:text-foreground"
      >
        <Mail size={13} className="shrink-0" aria-hidden />
        <span className="truncate">{membro.email}</span>
      </a>
      <a
        href={membro.riga.urlFonte}
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center gap-1 underline decoration-dotted underline-offset-2 hover:no-underline"
      >
        Scheda del Comune
        <ExternalLink size={11} aria-hidden />
        <span className="sr-only"> (si apre in una nuova scheda)</span>
      </a>
      <span>
        aggiornata il <DataConsultazione iso={membro.aggiornamentoScheda} />
      </span>
    </div>
  );
}

function MemberCard({ member }: { member: OrgMember }) {
  return (
    <Card
      hover
      id={`assessore-${member.id}`}
      className="flex scroll-mt-20 flex-col"
    >
      <div className="flex items-center gap-3">
        <Avatar initials={member.iniziali} color={member.colore} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{member.nome}</p>
          <p className="text-xs text-muted">{member.insediamento}</p>
        </div>
      </div>

      {/*
        La carica per esteso, alla lettera come la scrive il Comune — genere
        compreso. Le deleghe puntuali stanno nell'indice in cima: ripeterle qui
        metterebbe due volte la stessa informazione nella stessa pagina.
      */}
      <p className="mt-3 text-sm text-muted">{member.carica}</p>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-2">
        <Users size={13} className="shrink-0" aria-hidden />
        {formatNumber(member.followerCount)} follower
      </div>

      <ContattoEFonte membro={member} />

      {/*
        `mt-auto` e non `mt-4`: le schede della riga si stirano alla stessa
        altezza, ma senza questo il bottone segue la fine del testo e le nove
        carte hanno il «Segui» a nove altezze diverse. Le cariche vere sono
        lunghe da una a quattro righe — con i nomi inventati del seed erano
        tutte uguali, e il difetto non si vedeva.
      */}
      <div className="mt-auto pt-4">
        <FollowButton
          assessoreId={member.id}
          following={member.followedByMe}
          className="w-full justify-center"
        />
      </div>
    </Card>
  );
}
