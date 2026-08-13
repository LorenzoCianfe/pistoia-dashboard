import { ETICHETTA_TIPO } from "@/lib/atti";
import { civicTopic } from "@/lib/civic-topics";
import { Badge } from "@/components/ui/badge";
import { dataConPreposizione, formatConteggio } from "@/lib/format";
import type { AttoInPrimaPagina } from "@/lib/data/atti";

/**
 * IL FIUME DEL GIORNO — che cosa ha deciso il Comune, quel giorno.
 *
 * È la **seconda gamba della decisione del 2026-08-12**: quando nessuno ha
 * curato il fatto del giorno, la prima pagina apre di qui invece di fingere
 * un'apertura. Perciò questo componente deve reggere da solo il posto d'onore,
 * non essere un riempitivo sotto la card grande.
 *
 * **Si legge per STRUTTURA, non per riscrittura** (ROADMAP Ondata 11: «nessuna
 * frase generata»). Ogni riga porta quattro fatti che il Comune scrive già —
 * tipo, numero, tema civico, ufficio — più l'oggetto ufficiale. Nessuno di
 * questi è un'interpretazione.
 *
 * ⚠️ **Le righe non sono link, e non è una dimenticanza.** Due ragioni
 * misurate: la pagina pubblica dell'atto non esiste ancora come rotta (è il
 * passo successivo di O10), e l'URL dell'albo — che è la fonte degli atti più
 * recenti, cioè proprio questi — **scade dopo ~15 giorni** (`lib/atti.ts`).
 * Sei link esterni che marciscono in due settimane sono peggio di nessun link:
 * quando la rotta interna esisterà, ogni riga diventa un bersaglio suo.
 */
export function FiumeAtti({
  atti,
  attiDelGiorno,
  giorno,
}: {
  atti: AttoInPrimaPagina[];
  attiDelGiorno: number;
  giorno: Date;
}) {
  return (
    <section aria-labelledby="fiume-titolo" className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="fiume-titolo" className="text-lg font-bold tracking-tight">
          Il giorno in città
        </h2>
        {/*
          Il numero VERO del giorno, accanto a una lista troncata.

          È la trappola di `AGENTS.md` §3 (ondata 7, 2) presa dal verso giusto:
          il conteggio non viene dalla lunghezza di `atti` — che è al massimo
          sei — ma da un `count` a parte. Dichiararlo è anche ciò che rende
          onesta la troncatura: l'11 agosto 2026 gli atti erano 31.
        */}
        <p className="font-mono text-[11.5px] uppercase tracking-[0.08em] text-muted-2">
          {formatConteggio(attiDelGiorno, "atto pubblicato", "atti pubblicati")}{" "}
          {dataConPreposizione(giorno)}
        </p>
      </div>

      {/*
        DUE COLONNE da `lg` in su, e non è vezzo: col guscio a 1.680px la card
        del fiume è larga 1.380, e in colonna sola le righe misuravano **108
        caratteri** — oltre la soglia di scansione. Le due colonne riportano la
        riga a ~52 caratteri E usano lo spazio invece di lasciarlo bianco, che
        è la ragione per cui il guscio è stato allargato.

        È anche l'impaginazione del «taglio basso» di un giornale (P8): sotto
        l'apertura, la colonna si spezza.

        ⚠️ `min-w-0` sulle celle: in una griglia l'elemento ha `min-width:auto`
        e si ferma al proprio min-content, quindi un codice di protocollo senza
        spazi allargherebbe la colonna oltre la traccia (`AGENTS.md` §3, ondata
        7, 5 e il suo corollario). `divide-y` è uscito con la colonna singola —
        fra due colonne disegnerebbe un filo dove non c'è confine.
      */}
      <ul className="mt-4 grid grid-cols-1 gap-x-8 lg:grid-cols-2">
        {atti.map((a) => {
          const tema = a.temaCivico ? civicTopic(a.temaCivico) : null;
          return (
            <li
              key={a.chiave}
              className="flex min-w-0 gap-3 border-t border-border py-3.5 first:border-t-0 lg:[&:nth-child(2)]:border-t-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  {tema ? (
                    <Badge color={tema.color} className="text-[11px]">
                      {tema.label}
                    </Badge>
                  ) : null}
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-2">
                    {ETICHETTA_TIPO[a.tipo]}
                    {a.numero > 0 ? ` n. ${a.numero}` : ""}
                  </p>
                </div>
                {/*
                  L'oggetto ufficiale, clampato a due righe. Qui il taglio è
                  legittimo dove sull'apertura non lo era: questa è la LISTA,
                  e l'atto che apre porta il proprio oggetto per intero. Il
                  testo resta comunque quello del Comune, mai riscritto.
                */}
                <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-foreground">
                  {a.oggetto}
                </p>
                <p className="mt-1 truncate text-xs text-muted-2">{a.ufficio}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {attiDelGiorno > atti.length ? (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-2">
          Qui ci sono i più recenti.{" "}
          {formatConteggio(attiDelGiorno - atti.length, "altro atto", "altri atti")}{" "}
          dello stesso giorno {attiDelGiorno - atti.length === 1 ? "è" : "sono"}{" "}
          in archivio: l&apos;elenco completo e la ricerca arrivano con
          l&apos;archivio pubblico.
        </p>
      ) : null}
    </section>
  );
}
