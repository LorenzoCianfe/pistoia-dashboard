import { dataConPreposizione, formatNumber } from "@/lib/format";
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
 * ⚠️ **È ferma per disegno.** Il repertorio ha la barra «breaking news» a
 * marquee (`ricognizione-visiva.md` §2-quater): movimento continuo e
 * automatico, che `DESIGN.md` §7 non concede — tre soli momenti di festa e
 * nessuna animazione ambientale.
 */
/*
  La riga, in un posto solo: la striscia ha due forme — coi conteggi e senza —
  e due copie della stessa classe divergono al primo ritocco.

  `text-muted` e non `text-muted-2`, ed è una misura non un gusto: `--muted-2`
  sulla tela fa **4,53:1**, tre centesimi sopra AA (`DESIGN.md` §4, corollario
  del 2026-08-05). Regge, ma questa è la riga più scandita della pagina, in
  maiuscoletto spaziato a 11,5px — la combinazione meno leggibile che ci sia —
  e vive sulla tela nuda, dove quel margine non ha niente che lo protegga.
  `--muted` fa 5,35:1 e resta altrettanto silenzioso.
*/
const RIGA =
  "flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11.5px] uppercase tracking-[0.1em] text-muted";

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
    <p className={RIGA}>
      {/* Il lime è ammesso QUI e solo così: pallino, mai testo né icona —
          su bianco fa 1,1:1 (`DESIGN.md` §4). Il pallino non porta
          informazione da solo: la porta la frase accanto. */}
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full bg-highlight"
      />
      <span>
        Aggiornato{" "}
        <span className="font-semibold text-foreground">
          {dataConPreposizione(giorno, "al")}
        </span>
      </span>
      {voci.map((v) => (
        <span key={v.etichetta} className="flex items-center gap-2">
          <span aria-hidden className="text-border-strong">
            ·
          </span>
          {v.etichetta}{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {formatNumber(v.valore)}
          </span>
        </span>
      ))}
      {/*
        «fermo» si dichiara, non si nasconde. La soglia è misurata
        (`lib/atti.ts`: dieci giorni, il doppio del buco più lungo mai visto in
        cinque anni e mezzo), quindi quando compare è un fatto e non un
        allarme tarato male.
      */}
      {stato === "fermo" ? (
        <span className="flex items-center gap-2">
          <span aria-hidden className="text-border-strong">
            ·
          </span>
          <span className="rounded-pill bg-amber-soft px-2 py-0.5 text-[var(--amber)] normal-case tracking-normal">
            lettura ferma
          </span>
        </span>
      ) : null}
    </p>
  );
}
