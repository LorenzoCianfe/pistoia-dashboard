import type { Metadata } from "next";
import { Coins, CalendarClock, ExternalLink, Scale } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { DisplayNumber } from "@/components/signature/display-number";
import { formatEuro, formatNumber } from "@/lib/format";
import {
  BASE_MENSILE,
  INDENNITA_SINDACO,
  MENSILITA,
  POPOLAZIONE,
  RIGA_ART14,
  RIGHE_CATENA,
  RIGHE_PERSONE,
  TETTO_CONSIGLIERE,
  costoAnnuoGiunta,
  costoMensileGiunta,
  statoPubblicazione,
  vociPubblicabili,
  type Riga,
  type Voce,
} from "@/lib/costo-amministrazione";

export const metadata: Metadata = {
  title: "Il costo dell'amministrazione",
  description:
    "Quanto prevede la legge per il sindaco, la giunta e il consiglio di Pistoia — con l'atto da cui viene ogni cifra.",
};

/*
  «Il costo dell'amministrazione» (ROADMAP.md §6, Fase C).

  Sta sotto lo stemma del Comune senza la dichiarazione di chi pubblica, e la
  ragione è che qui non c'è nessun giudizio: sono cifre che la legge impone di
  rendere pubbliche (D.Lgs 33/2013 art. 14), e renderle leggibili è trasparenza
  dovuta, non autocritica. La dichiarazione serve alle pagine che danno un voto
  a chi governa — pagella, dossier, audit.

  Due scelte che reggono tutta la pagina:

  1. **Apre su quanto la legge prevede, non su «dato non pubblicato».** Il
     Comune non ha ancora pubblicato i compensi, ma è dentro i tre mesi che
     l'art. 14 gli concede. Un'assenza nei termini presentata come vuoto è
     un'accusa tratta da un dato mancante — il difetto che ha già tolto la
     cifra da /organigramma e la scala a tacche da /promesse. Qui l'assenza si
     dichiara con la sua scadenza accanto.

  2. **Nessuna scala a tacche.** L'intervallo 0 → costo della giunta è vero in
     aritmetica ma non è un traguardo che qualcuno abbia fissato.
*/

function LinkFonte({ riga }: { riga: Riga }) {
  return (
    <a
      href={riga.urlFonte}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 font-medium text-teal underline decoration-dotted underline-offset-2 hover:no-underline"
    >
      {riga.fonte}
      <ExternalLink size={12} aria-hidden />
      <span className="sr-only"> (si apre in una nuova scheda)</span>
    </a>
  );
}

function SchedaFonte({ riga }: { riga: Riga }) {
  return (
    <li className="border-t border-border pt-3 first:border-t-0 first:pt-0">
      <p className="text-sm leading-relaxed">{riga.affermazione}</p>
      <p className="mt-1.5 text-xs text-muted-2">
        <LinkFonte riga={riga} /> · consultata il{" "}
        <time dateTime={riga.dataConsultazione}>
          {new Date(riga.dataConsultazione).toLocaleDateString("it-IT", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </p>
    </li>
  );
}

/*
  `min-w-0` sull'elemento di griglia, non solo `grid-cols-1`: la traccia
  `minmax(0, 1fr)` si stringe, ma l'ELEMENTO ha `min-width: auto` e si ferma al
  proprio min-content, che qui è un nome e cognome inscindibile (AGENTS.md §3,
  ondata 7/5 e il suo corollario del 2026-07-29).
*/
function VoceCarica({ voce }: { voce: Voce }) {
  return (
    <li className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-border py-3 first:border-t-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{voce.persona}</p>
        <p className="text-xs text-muted-2">
          {voce.carica} · {voce.calcolo}
        </p>
      </div>
      <p className="shrink-0 font-mono text-sm tabular-nums">
        {formatEuro(voce.importoMensile)}
        <span className="text-muted-2"> /mese</span>
      </p>
    </li>
  );
}

export default function CostoAmministrazionePage() {
  const voci = vociPubblicabili();
  const giunta = voci.filter((v) => v.inGiunta);
  const fuoriGiunta = voci.filter((v) => !v.inGiunta);
  const mensile = costoMensileGiunta();
  const annuo = costoAnnuoGiunta();
  const pubblicazione = statoPubblicazione();

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Trasparenza"
        title="Il costo dell'amministrazione"
        description="Quanto prevede la legge per il sindaco, la giunta e il consiglio comunale di Pistoia. Ogni cifra porta l'atto da cui viene."
        icon={<Coins size={26} />}
      />

      {/*
        La cifra protagonista è il costo ANNUO della giunta, e non il compenso
        del sindaco: quest'ultimo è il numero da cui discende tutto il resto, ma
        a 88px punterebbe una persona sola, che è la lettura più vicina a un
        giudizio individuale. Il totale è una spesa dell'istituzione.
      */}
      <Card>
        <DisplayNumber
          value={annuo}
          unit="€ all'anno"
          label="Quanto la legge prevede per la giunta"
        />
        <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted">
          <strong className="text-foreground">{formatEuro(mensile)} al mese</strong> per{" "}
          {formatNumber(giunta.length)} persone — sindaco, vicesindaca e{" "}
          {formatNumber(giunta.filter((v) => v.ruolo === "assessore").length)}{" "}
          assessori — su {MENSILITA} mensilità.
        </p>
      </Card>

      {/*
        Il chiarimento più importante della pagina, e sta subito sotto la cifra
        perché è la condizione per leggerla bene. Il TUEL dimezza l'indennità
        del lavoratore dipendente che non abbia chiesto l'aspettativa: chi dei
        nove sia in quella condizione è esattamente ciò che il Comune deve
        pubblicare. La cifra sopra è quindi un massimo di legge, e dirlo dopo
        averla mostrata sarebbe tardi.
      */}
      <Card className="bg-surface-2/40">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Scale size={16} className="text-teal" aria-hidden />
          Questi non sono i compensi percepiti
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Sono gli importi che la legge prevede. L&apos;indennità è{" "}
          <strong className="text-foreground">dimezzata</strong> per gli
          amministratori che siano lavoratori dipendenti e non abbiano chiesto
          l&apos;aspettativa, e ciascuno può rinunciarvi in tutto o in parte:
          quanto venga effettivamente corrisposto dipende dalla posizione di ogni
          persona.
        </p>
        {/*
          `items-start` e non `items-baseline` con `flex-wrap`: l'icona e il
          testo sono due elementi flex, e un testo lungo abbastanza da andare a
          capo spinge sé stesso sulla riga sotto lasciando l'icona sola in cima.
        */}
        <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted">
          <CalendarClock
            size={15}
            className="mt-0.5 shrink-0 text-muted-2"
            aria-hidden
          />
          {pubblicazione.stato === "attesa" ? (
            <span>
              Il Comune non li ha ancora pubblicati, ed è{" "}
              <strong className="text-foreground">nei termini</strong>: l&apos;art.
              14 del D.Lgs 33/2013 concede tre mesi dalla proclamazione del
              sindaco, avvenuta il 27 maggio 2026. Mancano{" "}
              <strong className="text-foreground">
                {formatNumber(pubblicazione.giorniAllaScadenza)} giorni
              </strong>{" "}
              alla scadenza del 27 agosto 2026.
            </span>
          ) : (
            <span>
              Il termine dell&apos;art. 14 del D.Lgs 33/2013 —{" "}
              <strong className="text-foreground">27 agosto 2026</strong>, tre
              mesi dalla proclamazione del sindaco — è scaduto e i compensi non
              risultano pubblicati.
            </span>
          )}
        </p>
      </Card>

      <section aria-labelledby="catena">
        <h2 id="catena" className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2">
          Come si arriva a questa cifra
        </h2>
        {/*
          Il punto che la pagina deve far passare per primo: le indennità NON le
          decide il Comune. Senza questa frase il lettore attribuisce al Comune
          una scelta che è del Parlamento, e ogni cifra sotto si legge come una
          decisione locale.
        */}
        <Card className="mt-3 space-y-3">
          <p className="text-sm leading-relaxed">
            Le indennità degli amministratori comunali{" "}
            <strong>non le decide il Comune</strong>: sono fissate per legge in
            percentuale su una base nazionale, secondo la fascia demografica del
            comune. Pistoia non ha margine di scelta, e per questo la cifra si
            può calcolare prima ancora che il Comune la pubblichi.
          </p>
          <ol className="space-y-2 text-sm leading-relaxed text-muted">
            <li>
              <strong className="text-foreground">{formatEuro(BASE_MENSILE)} al mese</strong>{" "}
              è la base: il trattamento dei presidenti di regione, su {MENSILITA}{" "}
              mensilità.
            </li>
            <li>
              Pistoia è <strong className="text-foreground">capoluogo di provincia</strong> con{" "}
              {formatNumber(POPOLAZIONE)} abitanti, cioè sotto i 100.000: al
              sindaco spetta il{" "}
              <strong className="text-foreground">70%</strong> della base,{" "}
              {formatEuro(INDENNITA_SINDACO)}.
            </li>
            <li>
              Le altre cariche sono percentuali{" "}
              <em>dell&apos;indennità del sindaco</em>: 75% la vicesindaca, 60%
              gli assessori e il presidente del consiglio.
            </li>
          </ol>
        </Card>
      </section>

      <section aria-labelledby="cariche">
        <h2 id="cariche" className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2">
          Carica per carica
        </h2>
        <Card className="mt-3">
          <ul>
            {giunta.map((v) => (
              <VoceCarica key={v.id} voce={v} />
            ))}
          </ul>
          <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-2">
            La vicesindaca è anche assessora, ma le indennità non si cumulano
            (TUEL art. 82): compare una volta sola, al 75%.
          </p>
        </Card>

        {fuoriGiunta.length > 0 ? (
          <Card className="mt-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-2">
              Fuori dalla giunta
            </p>
            <ul>
              {fuoriGiunta.map((v) => (
                <VoceCarica key={v.id} voce={v} />
              ))}
            </ul>
          </Card>
        ) : null}
      </section>

      {/*
        I consiglieri comunali: un TETTO, non un compenso. «In nessun caso
        l'ammontare percepito nell'ambito di un mese può superare» non è
        «percepisce», e moltiplicare 2.415 € per 32 consiglieri produrrebbe una
        cifra inventata con l'aria di essere calcolata — 927.360 € l'anno che
        nessuno riceve. L'importo vero dipende dalle sedute e dalla delibera
        comunale, e quello sì che il Comune deve pubblicare.
      */}
      <section aria-labelledby="consiglieri">
        <h2
          id="consiglieri"
          className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2"
        >
          I 32 consiglieri comunali
        </h2>
        <Card className="mt-3 space-y-2">
          <p className="text-sm leading-relaxed">
            I consiglieri non hanno un&apos;indennità mensile: prendono un{" "}
            <strong>gettone di presenza</strong> per ogni seduta. La legge ne
            fissa solo il tetto — al massimo{" "}
            <strong className="text-foreground">
              {formatEuro(TETTO_CONSIGLIERE)} al mese
            </strong>
            , cioè un quarto dell&apos;indennità del sindaco.
          </p>
          <p className="text-sm leading-relaxed text-muted">
            Quanto ciascuno percepisca davvero dipende dalle sedute a cui
            partecipa e dall&apos;importo del gettone deliberato dal Comune.
            Questa pagina non moltiplica il tetto per il numero dei consiglieri:
            darebbe una cifra che nessuno riceve.
          </p>
        </Card>
      </section>

      <section aria-labelledby="fonti">
        <h2 id="fonti" className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2">
          Da dove viene ogni cifra
        </h2>
        <Card className="mt-3">
          <ul className="space-y-3">
            {RIGHE_CATENA.map((r) => (
              <SchedaFonte key={r.urlFonte + r.affermazione.slice(0, 24)} riga={r} />
            ))}
            {RIGHE_PERSONE.map((r) => (
              <SchedaFonte key={r.urlFonte} riga={r} />
            ))}
            <SchedaFonte riga={RIGA_ART14} />
          </ul>
        </Card>
      </section>
    </div>
  );
}
