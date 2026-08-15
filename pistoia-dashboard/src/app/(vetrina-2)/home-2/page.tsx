import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Box } from "lucide-react";

import { getPrimaPagina } from "@/lib/data/atti";
import { costoAnnuoGiunta } from "@/lib/costo-amministrazione";
import { formatNumber } from "@/lib/format";
import { Scena } from "@/components/brand/scena";

export const metadata: Metadata = {
  title: { absolute: "Pistoia.app — la città, letta dai suoi atti" },
  description:
    "Piattaforma civica indipendente: le decisioni del Comune di Pistoia lette ogni giorno dall'albo pretorio e rese leggibili, con i numeri della città e le loro fonti.",
};

/*
  HOMEPAGE_2 — la variante editoriale (2026-08-15).

  Nasce dal riferimento portato da Lorenzo: una fotografia a tutta pagina, un
  **pannello di vetro a bordo netto** sulla sinistra, e il marchio **spezzato in
  diagonale** fra le due metà — il nome in alto dentro il vetro, il suffisso in
  basso a destra sulla fotografia.

  ## Che cosa la rende una variante VERA, e non un ritocco

  Homepage_1 è una **griglia**: una colonna di testo e quattro tessere, cioè uno
  strumento. Qui la gerarchia è rovesciata e ne resta una sola: **il nome della
  città a scala di manifesto**, e tutto il resto — azioni e dati — schiacciato al
  piede come l'indice di una copertina. Non ci sono contenitori: nessuna card,
  nessun riquadro, nessuna icona colorata. Solo tipografia sopra il vetro.

  ## Le tre decisioni che governano la composizione

  1. 🔴 **Il marchio è UN elemento solo, spezzato dal bordo.** `Pistoia` e `.app`
     sono due `<span>` dentro lo stesso `<h1>`: chi legge con un lettore di
     schermo sente «Pistoia.app», una parola sola, non due frammenti. La
     diagonale è **posizione**, non contenuto.
  2. **La scala si misura sul PANNELLO, non sulla finestra.** Il nome vive in una
     colonna del ~46%: dimensionarlo in `vw` lo farebbe traboccare a ogni
     larghezza, ed è la trappola già pagata (`AGENTS.md` §3, Fase C, 5). Da qui
     `container-type: inline-size` sul vetro e le misure in `cqw`.
  3. **I dati non sono tessere: sono un indice.** Il riferimento numera le sue
     voci (`01 ○ ○ ○`); qui `01` e `02` portano il costo della giunta e gli atti
     dell'anno, con la cifra grande e l'etichetta minuta, separati da un filetto.
     Restano **link veri** verso le pagine che li spiegano, e restano alti 44px.

  ## Che cosa NON cambia rispetto a Homepage_1

  Il marchio, i token, la scena fotografica e **tutto il meccanismo
  giorno↔notte**: `<Scena />` è lo stesso componente, quindi ci sono le stesse
  due fotografie e gli stessi due filmati, e `CambioTema` nella testata guida
  `--tema-t` esattamente come di là. Il vetro ci sta **sopra**, e con
  `backdrop-filter` sfoca la città che cambia ora: la transizione si vede anche
  attraverso il pannello, senza una riga di codice in più.

  ⚠️ **I dati sono gli stessi identici di Homepage_1**, presi dalle stesse due
  funzioni (`costoAnnuoGiunta`, `getPrimaPagina`). Due varianti della prima
  pagina che mostrassero due numeri diversi sarebbero peggio di una variante in
  meno — è la regola già scritta per il tasso di risoluzione (`AGENTS.md` §3,
  ondata 7).
*/
export default async function Homepage2() {
  const dati = await getPrimaPagina();
  const { conteggi } = dati;
  const annuo = costoAnnuoGiunta();

  const indice = [
    {
      n: "01",
      etichetta: "Costo della giunta",
      cifra: formatNumber(annuo),
      unita: "€ all'anno",
      nota: "Gli importi li fissa la legge, non il Comune",
      href: "/trasparenza/costo-amministrazione",
    },
    {
      n: "02",
      etichetta: `Atti nel ${conteggi.anno}`,
      cifra: formatNumber(conteggi.nelAnno),
      unita: "atti",
      nota: `+${formatNumber(conteggi.ultimiSetteGiorni)} negli ultimi 7 giorni`,
      href: "/atti",
    },
  ];

  return (
    <div className="home2">
      <Scena />

      {/*
        IL PANNELLO DI VETRO. Sta SOPRA la scena e sotto il contenuto, e il suo
        `backdrop-filter` sfoca la fotografia — e il filmato, quando corre.
        Il bordo destro è netto, con il filo di luce del modello a tre strati.
      */}
      <div className="home2__vetro" aria-hidden />

      <div className="home2__scena-contenuto">
        {/* ---------------------------------------------------------------
            LA TESTATA — filo, riga di servizio, logotipo.

            🔴 Il filo e l'anno sono DECORAZIONE e stanno fuori dall'`<h1>`:
            dentro finirebbero nel nome accessibile, e chi usa un lettore di
            schermo sentirebbe «2026 Pistoia.app».
            --------------------------------------------------------------- */}
        <div className="home2__testata">
          <span aria-hidden className="home2__filo" />
          <div className="home2__testata-riga">
            {/* Il sottotitolo di testata: era l'occhiello in fondo alla
                colonna, ed è salito qui. In una gabbia editoriale il
                sottotitolo sta ATTACCATO al nome — staccato diventa
                un'etichetta di pagina, che è l'opposto di una testata. */}
            <p className="home2__tagline">La città, letta dai suoi atti</p>
            <span aria-hidden className="home2__anno">
              {conteggi.anno}
            </span>
          </div>

          {/*
            IL MARCHIO SPEZZATO. Un `<h1>` solo: «Pistoia.app».

            ⚠️ Lo spazio fra i due `<span>` non esiste — sono attaccati nel DOM
            — altrimenti un lettore di schermo direbbe «Pistoia punto app» con
            una pausa in mezzo, cioè leggerebbe due cose dove ce n'è una.

            ⚠️ Le maiuscole le mette il CSS: nel markup resta «Pistoia», così il
            nome si sente e si cerca in pagina come il nome, non come un
            acronimo.
          */}
          <h1 className="home2__marchio">
            <span className="home2__nome">Pistoia</span>
            <span className="home2__suffisso">.app</span>
          </h1>
        </div>

        {/* ---------------------------------------------------------------
            IL PIEDE DEL VETRO — le due azioni e l'indice dei dati.
            --------------------------------------------------------------- */}
        <div className="home2__piede stagger">
          <div className="home2__azioni">
            {/* L'ingresso unico, come in Homepage_1: chiede l'account e quindi
                funge da porta. In rosso, che qui è il colore dell'identità —
                la gerarchia fra le due azioni la fa la temperatura, non il
                pieno. */}
            <Link
              href="/la-mia-citta"
              className="ctrl ctrl--rosso"
            >
              Esplora la città
              <ArrowRight size={15} aria-hidden />
            </Link>
            {/*
              LA CITTÀ IN 3D — feature futura, dichiarata come tale. Non è un
              link: è un `button` con `aria-disabled`, così promette senza
              mentire. La promessa è la stessa di Homepage_1 e non può cambiare
              tono fra due varianti; cambia solo l'ornamento, che qui non c'è.
            */}
            <button
              type="button"
              aria-disabled="true"
              className="ctrl ctrl--muto"
            >
              <Box size={15} aria-hidden />
              Esplora in 3D
              <span className="ctrl-nota">presto</span>
            </button>
          </div>

          {/*
            L'INDICE DEI DATI — il vocabolario del riferimento («01 ○ ○ ○»)
            portato su due fatti veri. `<ol>` e non `<div>`: è una lista
            numerata, e i numeri sono l'ordine, non un ornamento.
          */}
          <ol className="home2__indice">
            {indice.map((v) => (
              <li key={v.n}>
                <Link href={v.href} className="home2__voce group">
                  <span aria-hidden className="home2__voce-n">
                    {v.n}
                  </span>
                  <span className="home2__voce-corpo">
                    <span className="home2__voce-etichetta">{v.etichetta}</span>
                    <span className="home2__voce-cifra">
                      {v.cifra}
                      <span className="home2__voce-unita">{v.unita}</span>
                    </span>
                    <span className="home2__voce-nota">{v.nota}</span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    aria-hidden
                    className="home2__voce-freccia"
                  />
                </Link>
              </li>
            ))}
          </ol>

          {/* La firma: la stessa riga di Homepage_1, perché dichiara
              l'indipendenza del progetto e non è negoziabile fra varianti. */}
          <p className="home2__firma">
            Informazione pubblica su Pistoia, curata in modo indipendente.
          </p>
        </div>
      </div>
    </div>
  );
}
