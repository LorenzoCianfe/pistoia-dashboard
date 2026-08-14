import { dataConPreposizione } from "@/lib/format";
import { ChipDato } from "@/components/ui/chip-dato";
import type { PrimaPagina } from "@/lib/data/atti";

/**
 * LA STRISCIA DEI DATI, sopra tutto il resto.
 *
 * Il precedente è di prodotto, non di concept: su `ft.com` la fascia dei
 * mercati vive **sopra la testata** (`docs/ricognizione-visiva.md` P7). Dice
 * una cosa sola e la dice in una riga: *questo sito è vivo e si aggiorna da
 * solo.*
 *
 * ⚠️ **I numeri vengono da `count` sul database**, mai dalla lunghezza di una
 * lista mostrata (`AGENTS.md` §3, ondata 7, 2). Qui la tentazione sarebbe
 * concreta: la pagina ha già il fiume in mano, e contarne le righe darebbe un
 * numero plausibile e sbagliato.
 *
 * ⚠️ **Non è più una riga di testo sulla tela nuda: è una CAPSULA che
 * galleggia** (2026-08-14). È il pattern che tutti e nove i riferimenti hanno
 * e noi non avevamo — i dati vivi non stanno *nella* pagina, stanno *sopra*.
 * E risolve un problema misurabile: il numero più impressionante del sito —
 * 26.644 atti in archivio — era grigio a 11,5px e si leggeva come una nota a
 * piè di pagina.
 *
 * ⚠️ **Il marquee resta vietato.** Il repertorio ha la barra «breaking news»
 * scorrevole (`ricognizione-visiva.md` §2-quater): movimento continuo che non
 * porta nessuna informazione. Qui l'unica cosa che si muove è il pallino, e si
 * muove **solo quando la lettura è fresca** — vedi sotto.
 */
/*
  La riga, in un posto solo: la striscia ha due forme — coi conteggi e senza —
  e due copie della stessa classe divergono al primo ritocco.

  `text-muted` e non `text-muted-2`, ed è una misura non un gusto: `--muted-2`
  sulla tela fa **4,53:1**, tre centesimi sopra AA (`DESIGN.md` §4, corollario
  del 2026-08-05). Regge, ma questa è la riga più scandita della pagina, in
  maiuscoletto spaziato a 11,5px — la combinazione meno leggibile che ci sia.
  `--muted` fa 5,35:1 e resta altrettanto silenzioso.

  `w-fit`: la capsula abbraccia il proprio contenuto. A tutta larghezza
  sarebbe una barra, e una barra ruba la gerarchia all'`h1` che le sta sotto.
*/
const RIGA =
  "capsula flex w-fit max-w-full flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 font-mono text-[11.5px] uppercase tracking-[0.1em] text-muted";

export function StrisciaDati({ dati }: { dati: PrimaPagina }) {
  const { conteggi, giorno, stato } = dati;

  /*
    L'ARCHIVIO VUOTO NON È UN CASO DI SCUOLA: è lo stato della produzione
    finché la lettura schedulata non esiste (`docs/pipeline-atti-schedulata.md`
    §2). Una striscia che dicesse «IN ARCHIVIO 0» presenterebbe un vuoto come
    un dato; qui dice che cosa è successo davvero, che è la stessa scelta del
    monitor sul cruscotto — «Mai letto» è la verità.
  */
  if (stato === "mai-letto" || !giorno) {
    return (
      <p className={RIGA}>
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full bg-[var(--amber)]"
        />
        L&apos;archivio degli atti non è ancora stato letto
      </p>
    );
  }

  const voci = [
    { etichetta: `Atti nel ${conteggi.anno}`, valore: conteggi.nelAnno },
    { etichetta: "Ultimi 7 giorni", valore: conteggi.ultimiSetteGiorni },
    { etichetta: "In archivio", valore: conteggi.totale },
  ];

  return (
    /*
      UNA FILA DI OGGETTI, non una frase (2026-08-14).

      La freschezza resta una capsula — è un fatto in prosa, «aggiornato al…»
      — e i tre conteggi diventano tre chip, uno per numero. È il pannello di
      strumenti dei riferimenti applicato ai nostri dati, e la ragione è
      misurata: «26.644 in archivio» dentro una frase in maiuscoletto a 11,5px
      era il numero più impressionante del sito reso come nota a piè di pagina.

      ⚠️ Resta **un solo elemento** per la griglia che lo contiene: la pagina
      ha una sola orchestrazione d'ingresso e questo è il suo primo movimento,
      quindi i chip non possono essere figli diretti dello `.stagger`.
    */
    <div className="flex flex-wrap items-center gap-2">
      <p className={RIGA}>
        {/*
          Il lime è ammesso QUI e solo così: pallino, mai testo né icona — su
          bianco fa 1,1:1 (`DESIGN.md` §4). Il pallino non porta informazione
          da solo: la porta la frase accanto.

          🔴 **E RESPIRA, ma solo quando la lettura è viva** (2026-08-14). È
          l'unica animazione a riposo di tutta la piattaforma, e si guadagna il
          posto perché **il movimento È il dato**: dice «la macchina sta
          girando», come gli «Online 4/6» e gli «Updated 3 min ago» dei
          riferimenti. Nel ramo `fermo` il pallino è ambra e **non respira** —
          e quell'assenza è informazione quanto la presenza.

          Il ciclo è di 3,4 secondi, lentissimo di proposito: a un secondo
          sarebbe un allarme. Anima `opacity` e `box-shadow` su un elemento da
          6px, e si spegne da sé con `prefers-reduced-motion`.
        */}
        <span
          aria-hidden
          className={
            stato === "fermo"
              ? "size-1.5 shrink-0 rounded-full bg-[var(--amber)]"
              : "pallino-vivo size-1.5 shrink-0 rounded-full bg-highlight"
          }
        />
        <span>
          Aggiornato{" "}
          <span className="font-semibold text-foreground">
            {dataConPreposizione(giorno, "al")}
          </span>
        </span>
        {/*
          «fermo» si dichiara, non si nasconde. La soglia è misurata
          (`lib/atti.ts`: dieci giorni, il doppio del buco più lungo mai visto
          in cinque anni e mezzo), quindi quando compare è un fatto e non un
          allarme tarato male. Sta DENTRO la capsula della freschezza perché
          parla della freschezza, non dei conteggi.
        */}
        {stato === "fermo" ? (
          <span className="rounded-pill bg-amber-soft px-2 py-0.5 normal-case tracking-normal text-[var(--amber)]">
            lettura ferma
          </span>
        ) : null}
      </p>

      {voci.map((v) => (
        <ChipDato
          key={v.etichetta}
          valore={v.valore}
          etichetta={v.etichetta}
        />
      ))}
    </div>
  );
}
