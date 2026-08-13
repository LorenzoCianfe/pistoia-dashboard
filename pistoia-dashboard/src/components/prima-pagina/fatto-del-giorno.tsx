import { ExternalLink } from "lucide-react";
import { ETICHETTA_TIPO } from "@/lib/atti";
import { civicTopic } from "@/lib/civic-topics";
import { FIRMA_REDAZIONE } from "@/lib/redazione";
import { formatDate } from "@/lib/format";
import type { AttoInPrimaPagina } from "@/lib/data/atti";

/**
 * IL FATTO DEL GIORNO — l'apertura della prima pagina.
 *
 * 🔴 **Esiste solo se qualcuno l'ha curato** (decisione di Lorenzo,
 * 2026-08-12). Questo componente non si rende con un titolo generato né con
 * l'oggetto ufficiale promosso a titolo: se la redazione non ha scritto niente,
 * la prima pagina non lo chiama affatto e apre col fiume degli atti. La regola
 * di scelta sta in `lib/prima-pagina.ts`, provata dai test.
 *
 * Il **doppio titolo onesto** (`direzione-prodotto.md` §1.12.1) è la cosa che
 * questa card esiste per portare: sopra la frase umana, sotto **l'oggetto
 * ufficiale integrale, mai riscritto e mai troncato**. Chi legge capisce dal
 * primo, chi verifica trova il secondo a un millimetro — ed è anche la risposta
 * al test dell'intruso (P21): nessun portfolio può mostrare questo blocco,
 * perché nessun portfolio ha un archivio.
 */
export function FattoDelGiorno({ atto }: { atto: AttoInPrimaPagina }) {
  const tema = atto.temaCivico ? civicTopic(atto.temaCivico) : null;

  return (
    <article className="card flex flex-col p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {/*
          LA PASTIGLIA DEL TEMA — la «dose 2» del rosso, scelta da Lorenzo il
          2026-08-12 sul precedente FT: la parola-tema rossa sopra il titolo,
          voce editoriale e mai allarme.

          ⚠️ È una PASTIGLIA e non testo nudo, e la ragione è misurata: il
          rosso come testo minuto sulla tela fa **3,69:1** e nemmeno `--red-ink`
          lo salva (4,48, due centesimi sotto AA). Dentro `--red-soft` con
          `--red-ink` fa **4,52** (`DESIGN.md` §4). Il colore minuto, come il
          testo minuto, ha bisogno di una superficie piena sotto.

          Niente pastiglia quando il tema manca: un atto senza tema civico è un
          esito legittimo — il 31% ce l'ha — e riempire la casella col tipo
          d'atto farebbe leggere due cose diverse nello stesso posto.
        */}
        {tema ? (
          <span className="rounded-pill bg-red-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-red-ink">
            {tema.label}
          </span>
        ) : null}
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-2">
          {ETICHETTA_TIPO[atto.tipo]}
          {atto.numero > 0 ? ` n. ${atto.numero}` : ""} ·{" "}
          {formatDate(atto.inizioPubblicazione)}
        </p>
      </div>

      {/*
        ⚠️ **Il guscio dà lo spazio, il TESTO si dà la misura** (2026-08-12,
        col passaggio a 1.680px). Senza tetto, il corpo del testo cresce con la
        pagina e arriva a righe da 95 caratteri: l'occhio perde il ritorno a
        capo, e una prima pagina smette di essere leggibile proprio mentre
        guadagna spazio. I tetti sono in `ch` e non in `px` perché la misura di
        lettura si conta in CARATTERI — e sul monospaziato è esatta.

        ⚠️ **Il titolo però NON si stringe, ed è la differenza fra un giornale
        e un blog.** Un tetto sul titolo lasciava mezza card bianca a destra:
        la sproporzione che il brief chiama per nome. In prima pagina il titolo
        occupa la colonna che ha; sono la didascalia e l'oggetto ufficiale — il
        testo che si LEGGE riga per riga — a darsi una misura.
      */}
      <h2 className="mt-3 text-pretty text-2xl font-extrabold leading-[1.12] tracking-tight sm:text-[2rem]">
        {atto.titoloRedazionale}
      </h2>

      {/*
        LA DIDASCALIA DELLA REDAZIONE — «la spiegazione accanto al dato»
        (P13, da Flighty e Il Post). Una riga che dice perché l'atto conta, non
        un articolo: la redazione è una persona sola, e §1.6-bis.3 lo mette per
        iscritto.

        Firma l'entità collettiva, mai un nome proprio (`lib/redazione.ts`).
      */}
      {atto.sommarioRedazionale ? (
        <div className="mt-4 border-l-2 border-[var(--red)] pl-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {FIRMA_REDAZIONE}
          </p>
          <p className="mt-1 max-w-[68ch] text-[15px] leading-relaxed text-muted">
            {atto.sommarioRedazionale}
          </p>
        </div>
      ) : null}

      {/*
        L'OGGETTO UFFICIALE, INTEGRALE.

        ⚠️ Sta su una superficie OPACA dentro una card di vetro, e non è una
        preferenza: `DESIGN.md` §6 lo dichiara come la disciplina che rende
        difendibile il vetro sul contenuto — il dato minuto vive sempre sul
        pieno, il vetro fa cornice e atmosfera.

        E non è troncato. Sui 500 atti più recenti l'oggetto misura in mediana
        245 caratteri (p90 428, massimo 736): tagliarlo con dei puntini
        renderebbe più bella la composizione e **più debole la prova**, che è
        l'unica ragione per cui questo blocco esiste.
      */}
      <div className="mt-5 rounded-[var(--radius-sm)] bg-surface-2 p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
          L&apos;oggetto ufficiale, com&apos;è scritto
        </p>
        {/* `80ch` è esatto al carattere: su un monospaziato tutti i glifi
            hanno la stessa larghezza. Ottanta è la soglia oltre la quale un
            testo tecnico smette di essere scandibile — misurato a 1.680 senza
            tetto: **95 caratteri per riga**. */}
        <p className="mt-1.5 max-w-[80ch] font-mono text-[12.5px] leading-relaxed text-muted">
          {atto.oggetto}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
        {/*
          ⚠️ Il collegamento esce dal sito, e per ora non c'è alternativa: la
          **pagina pubblica dell'atto non esiste ancora come rotta** — è il
          passo successivo di O10, subito dopo questa pagina. Quando arriverà,
          questo `href` diventa interno e l'uscita resta come «fonte».

          ⚠️ E c'è un secondo motivo per non affrettarsi a mettere link esterni
          su OGNI riga: l'URL dell'albo **scade** dopo ~15 giorni (mediana
          misurata, `lib/atti.ts`), e gli atti dell'ultimo giorno vengono
          proprio dall'albo. Qui è UNO, sull'atto che la redazione ha appena
          curato, quindi è fresco; sul fiume sarebbero sei link che marciscono.
        */}
        <a
          href={atto.urlFonte}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-teal underline decoration-dotted underline-offset-4 hover:no-underline"
        >
          Leggi l&apos;atto sul portale del Comune
          <ExternalLink size={14} aria-hidden />
          <span className="sr-only">(si apre in una nuova scheda)</span>
        </a>
        <p className="text-xs text-muted-2">{atto.ufficio}</p>
      </div>
    </article>
  );
}
