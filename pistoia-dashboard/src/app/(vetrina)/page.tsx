import type { Metadata } from "next";
import Link from "next/link";
import { Box, FileText, Landmark, MessageSquarePlus, User, ArrowRight } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/dal";
import { getPrimaPagina } from "@/lib/data/atti";
import { costoAnnuoGiunta } from "@/lib/costo-amministrazione";
import { righeMonumento } from "@/lib/prima-pagina";
import { dataConPreposizione, formatNumber } from "@/lib/format";
import { ETICHETTA_TIPO } from "@/lib/atti";
import { civicTopic } from "@/lib/civic-topics";

import { Scena } from "@/components/brand/scena";
import { Tessera } from "@/components/prima-pagina/tessera";
import { TitoloComposto } from "@/components/signature/titolo-composto";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: { absolute: "Pistoia.app — la città, letta dai suoi atti" },
  description:
    "Piattaforma civica indipendente: le decisioni del Comune di Pistoia lette ogni giorno dall'albo pretorio e rese leggibili, con i numeri della città e le loro fonti.",
};

/*
  LA PRIMA PAGINA — una schermata sola, sopra la città (2026-08-14).

  Rifatta sul mockup scelto da Lorenzo (`refs/homepage/`), che ha risolto la
  cosa che tre giri di ritocchi non avevano risolto: la pagina non era piatta
  per mancanza di ombre o di animazioni, era piatta perché era **una pila di
  blocchi tutti uguali su una tela vuota**. Qui c'è una scena, una
  composizione asimmetrica e una griglia di tessere — cioè un luogo, una
  gerarchia e uno strumento.

  ## Che cosa ho cambiato del mockup, e perché non è un tradimento

  Il mockup è generato, e in due punti dice cose che questo progetto **non può
  dire**:

  1. 🔴 Firma «Piattaforma ufficiale del Comune di Pistoia» e usa lo stemma
     come marchio. È esattamente ciò che `direzione-prodotto.md` §1.9 e
     `DESIGN.md` §1.4 vietano: non siamo il Comune, e il nome «Pistoia.app» è
     sostenibile solo se la distinzione è **visibile**. Qui la riga di
     chiusura dice il contrario di quel mockup, ed è la riga più importante
     della pagina.
  2. La tessera «Il Sindaco» porta il volto di una persona reale. Al suo posto
     c'è **l'atto del giorno**, che è il contenuto che questo prodotto ha e
     nessun altro ha.

  Tutto il resto — proporzioni, griglia, vetro sulla foto, pastiglia in basso,
  riga di chiusura — è il mockup.

  ## Una schermata sola

  `h-dvh` e nessuno scorrimento (decisione di Lorenzo): la prima pagina smette
  di essere il posto dove si LEGGE e diventa il posto da cui si PARTE. Il
  fiume degli atti, il monumento per esteso e le porte vivono nelle loro
  pagine. Sotto `lg` la griglia si scioglie e la pagina torna a scorrere,
  perché su un telefono «una schermata sola» vorrebbe dire nascondere.
*/
export default async function PrimaPagina() {
  const [utente, dati] = await Promise.all([getCurrentUser(), getPrimaPagina()]);
  const { apertura, conteggi, giorno, attiDelGiorno } = dati;
  const annuo = costoAnnuoGiunta();
  const righe = righeMonumento();
  // La prima riga è sempre il sindaco: la funzione ordina per importo, e
  // l'indennità del sindaco è la base di legge da cui le altre si calcolano.
  const sindaco = righe[0];
  const autenticato = Boolean(utente);
  const temaApertura = apertura?.temaCivico
    ? civicTopic(apertura.temaCivico)
    : null;

  return (
    <div className="prima-pagina">
      <Scena />

      {/* Il contenuto sta SOPRA la scena e non ci convive: `relative` più un
          contesto di impilamento suo, altrimenti il velo della scena si
          intromette fra le tessere e il testo. */}
      <div className="prima-pagina__contenuto stagger">
        <div className="prima-pagina__griglia">
          {/* ---------------------------------------------------------------
              LA COLONNA DEL TESTO
              --------------------------------------------------------------- */}
          <div className="prima-pagina__voce">
            {/*
              IL CAPPELLO sta ATTACCATO al titolo, come nel mockup: è
              l'occhiello di un'apertura, e un occhiello staccato dal proprio
              titolo smette di essere un occhiello e diventa un'etichetta di
              pagina. Il rosso è la dose piena scelta il 2026-08-14 — voce
              editoriale, mai allarme.
            */}
            <p className="prima-pagina__kicker">La città, letta dai suoi atti</p>
            <h1 className="prima-pagina__titolo">
              <TitoloComposto
                testo="Pistoia, in un solo sguardo"
                /* Il punto colorato del mockup: l'unico segno decorativo della
                   pagina, e vale perché è UNO. Va passato come coda e non
                   messo accanto, o va a capo da solo. */
                coda={<span className="prima-pagina__punto">.</span>}
              />
            </h1>

            {/*
              Il sottotitolo, riscritto per incuriosire (2026-08-14, Lorenzo:
              «qualcosa di più catchy, che fa incuriosire»). Due domande
              concrete sul potere e sui soldi, e la promessa di una risposta
              in chiaro — tenuto corto perché resti sopra il cielo, dove il
              testo si legge senza velo.
            */}
            <p className="prima-pagina__sommario">
              Dove finiscono i soldi del Comune? Cosa si decide, ogni giorno,
              sulla tua città?{" "}
              <strong className="font-semibold text-foreground">
                Qui trovi le risposte, in chiaro.
              </strong>
            </p>

            <div className="prima-pagina__azioni">
              {/* L'ingresso unico: «Entra nella mia città» porta a
                  `/la-mia-citta`, che chiede l'account e quindi funge da porta.
                  Sostituisce sia il vecchio «Esplora gli atti» sia il pulsante
                  «Accedi» in testata, ora tolto. */}
              <Link href="/la-mia-citta" className="btn btn-primary btn-lg">
                Entra nella mia città
                <ArrowRight size={17} aria-hidden />
              </Link>
              {/*
                LA CITTÀ IN 3D — una feature futura, dichiarata come tale
                (2026-08-14). Non è un link: è un `button` con `aria-disabled`
                e la pastiglia «presto», così promette senza mentire. Al posto
                del vecchio «Come lavoriamo».
              */}
              <button
                type="button"
                aria-disabled="true"
                className="btn btn-secondary btn-lg cursor-default"
              >
                <Box size={17} aria-hidden />
                Esplora la città in 3D
                <span className="prima-pagina__presto">presto</span>
              </button>
            </div>
          </div>

          {/* ---------------------------------------------------------------
              LE QUATTRO TESSERE — la griglia del mockup.

              Riga alta: costo della giunta (con gli stipendi) e il sindaco.
              Riga bassa: gli atti dell'anno e l'atto del giorno.
              --------------------------------------------------------------- */}
          <div className="prima-pagina__tessere">
            {/*
              COSTO DELLA GIUNTA — con la ripartizione degli stipendi
              (2026-08-14). Il numero grande, poi le tre voci di legge:
              sindaco, vicesindaca, assessori. Un dato vero al posto della
              sparkline finta del mockup.
            */}
            <Tessera
              titolo="Costo della giunta"
              icona={Landmark}
              tinta="var(--red)"
              href="/trasparenza/costo-amministrazione"
              nota="Gli importi li fissa la legge, non il Comune"
              className="tessera--alta"
            >
              <p className="tessera__cifra">
                {formatNumber(annuo)}
                <span className="tessera__unita">€ all&apos;anno</span>
              </p>
              <dl className="tessera__voci">
                {righe.map((r) => (
                  <div key={r.chi} className="tessera__voce">
                    <dt>{r.carica.split(",")[0]}</dt>
                    <dd>
                      {formatNumber(r.importoMensile)}{" "}
                      <span className="tessera__mese">€/mese</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Tessera>

            {/*
              IL SINDACO — dal mockup, tornato al suo posto (2026-08-14).

              ⚠️ **Ritratto a iniziali, non una foto.** Non ho una fotografia
              del sindaco fra gli asset del progetto, e una faccia di persona
              reale non si scarica né si inventa: l'`Avatar` a iniziali è il
              modo in cui tutta la piattaforma rende una persona senza foto.
              Nome e carica vengono dallo STESSO dato del costo qui accanto
              (`righeMonumento`), così le due tessere non possono divergere.
            */}
            <Tessera
              titolo="Il sindaco"
              icona={User}
              tinta="var(--teal)"
              href="/trasparenza/costo-amministrazione"
              centrato
              className="tessera--alta tessera--sindaco"
            >
              <div className="tessera__persona">
                <Avatar name={sindaco.chi} size="xl" color="teal" />
                <p className="tessera__nome">{sindaco.chi}</p>
                <p className="tessera__ruolo">
                  {sindaco.carica.split(",")[0]} · {sindaco.accesso}
                </p>
              </div>
            </Tessera>

            {/* ATTI NEL 2026 — il numero e la sua variazione. */}
            <Tessera
              titolo={`Atti nel ${conteggi.anno}`}
              icona={FileText}
              tinta="var(--viola)"
              href="/atti"
              nota={`+${formatNumber(conteggi.ultimiSetteGiorni)} negli ultimi 7 giorni`}
            >
              <p className="tessera__cifra">{formatNumber(conteggi.nelAnno)}</p>
            </Tessera>

            {/*
              L'ATTO DEL GIORNO — accanto agli atti dell'anno (2026-08-14, al
              posto del totale d'archivio). L'occhiello dice il tema se l'atto
              ne ha uno, altrimenti il tipo: entrambi fatti che il Comune
              scrive già.
            */}
            <Tessera
              titolo={apertura ? "L'atto del giorno" : "Il giorno in città"}
              icona={FileText}
              tinta="var(--red)"
              href="/atti"
              nota={
                giorno
                  ? `${formatNumber(attiDelGiorno)} atti pubblicati ${dataConPreposizione(giorno)}`
                  : "La lettura dell'albo non ha ancora girato"
              }
            >
              {apertura ? (
                <div>
                  <p className="tessera__occhiello">
                    {temaApertura?.label ?? ETICHETTA_TIPO[apertura.tipo]}
                  </p>
                  <p className="tessera__frase">{apertura.titoloRedazionale}</p>
                </div>
              ) : (
                <p className="tessera__cifra">
                  {formatNumber(attiDelGiorno)}
                  <span className="tessera__unita">atti</span>
                </p>
              )}
            </Tessera>
          </div>
        </div>

        {/*
          LA PASTIGLIA — l'invito ad agire, in basso a sinistra come nel
          mockup. È l'unica cosa in pagina che chiede un account, e lo dice.
        */}
        <Link href="/segnalazioni" className="prima-pagina__invito capsula group">
          <span aria-hidden className="prima-pagina__invito-icona">
            <MessageSquarePlus size={17} />
          </span>
          <span className="text-sm">
            Hai un problema da segnalare o un&apos;idea per la tua città?
          </span>
          <span className="prima-pagina__invito-azione">
            {autenticato ? "Partecipa ora" : "Entra e partecipa"}
            <ArrowRight
              size={14}
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </span>
        </Link>

        {/*
          LA RIGA DI CHIUSURA — la firma del progetto (2026-08-14).

          Nel mockup diceva «Piattaforma ufficiale del Comune»: qui dice
          l'opposto, ma senza la negazione «non è il sito del Comune» e senza
          l'indicatore di lettura, che Lorenzo ha chiesto di togliere. Resta
          una riga sola, da testata: dichiara l'indipendenza col registro, non
          con un manifesto.
        */}
        <div className="prima-pagina__chiusura">
          <p>Informazione pubblica su Pistoia, curata in modo indipendente.</p>
        </div>
      </div>
    </div>
  );
}
