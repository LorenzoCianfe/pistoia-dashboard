import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/dal";
import { getPrimaPagina } from "@/lib/data/atti";
import { StrisciaDati } from "@/components/prima-pagina/striscia-dati";
import { FattoDelGiorno } from "@/components/prima-pagina/fatto-del-giorno";
import { Monumento } from "@/components/prima-pagina/monumento";
import { FiumeAtti } from "@/components/prima-pagina/fiume-atti";
import { PorteCitta } from "@/components/prima-pagina/porte-citta";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  // `absolute`, altrimenti il template del layout radice (`%s · Pistoia.app`)
  // scrive «Pistoia.app — … · Pistoia.app»: il marchio due volte nella stessa
  // scheda del browser, che è il primo posto in cui un prodotto sembra sciatto.
  title: { absolute: "Pistoia.app — la città, letta dai suoi atti" },
  description:
    "Piattaforma civica indipendente: le decisioni del Comune di Pistoia lette ogni giorno dall'albo pretorio e rese leggibili, con i numeri della città e le loro fonti.",
};

/*
  LA PRIMA PAGINA (Ondata 10).

  Che cosa c'era prima, e perché non c'è più: una landing di presentazione che
  **reindirizzava gli autenticati** a `/la-mia-citta`, cioè una porta d'ingresso
  che a chi era già entrato non mostrava niente. La direzione l'ha superata
  (§1.6-bis.1): la prima pagina è **pubblica e uguale per tutti** — si legge
  tutto senza registrarsi, l'account serve solo per *agire*. «La mia città»
  resta, ma dopo il login.

  Vive nel gruppo `(pubblico)` e non più fuori da ogni gruppo, ed è la
  conseguenza tecnica della stessa decisione: quel layout ha già il contratto
  che serve — con una sessione rende l'`AppShell` intero, senza rende barra
  anonima e footer, con la riga che dichiara che cosa chiede un account.

  LE TRE COSE CHE QUESTA PAGINA DEVE DIRE, nell'ordine in cui le dice:

  1. **il sito è vivo** — la striscia dei dati, coi conteggi chiesti al
     database (P7, il precedente FT);
  2. **oggi è successo questo** — il fatto del giorno se la redazione l'ha
     curato, altrimenti il fiume degli atti. 🔴 Senza cura NON si finge
     un'apertura: la regola sta in `lib/prima-pagina.ts`;
  3. **ecco un numero che conta** — il monumento, un fatto e non un'accusa.

  ⚠️ Il test dell'intruso (P21), che è il metro di O10: che cosa, qui, esiste
  SOLO perché questa è Pistoia? L'oggetto ufficiale integrale di un atto vero
  del Comune, il costo di *questa* giunta con le nove persone e la catena di
  legge, il fiume di un giorno preciso. Nessun portfolio può mostrarli, perché
  nessun portfolio ha un archivio.
*/
export default async function PrimaPagina() {
  const [utente, dati] = await Promise.all([getCurrentUser(), getPrimaPagina()]);
  const autenticato = Boolean(utente);
  const { apertura, fiume, attiDelGiorno, giorno } = dati;

  return (
    // Una sola orchestrazione d'ingresso per pagina (`DESIGN.md` §7): lo
    // stagger sta QUI, sui blocchi di primo livello, e nessun figlio ne apre
    // una seconda. Con `prefers-reduced-motion` la regola globale di
    // `globals.css` azzera le durate — in CSS, mai in un ramo del markup.
    <div className="stagger space-y-8 pb-4">
      <StrisciaDati dati={dati} />

      {/* Il tetto sta sul SOMMARIO e non sul titolo: `h1` occupa la colonna
          che ha, come in prima pagina di un giornale. `ch` e non `max-w-2xl`
          perché una misura di lettura si conta in caratteri — senza, a 1.680px
          di guscio la riga arriverebbe a ~110. */}
      <header>
        <h1 className="text-pretty text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-[2.6rem]">
          Pistoia, letta dai suoi atti
        </h1>
        {/*
          La riga che dichiara CHI parla, e sta in prima pagina di proposito.

          `direzione-prodotto.md` §1.9 nomina il rischio del nome — «Pistoia.app
          può essere letta come la app istituzionale della città» — e dice che
          la condizione che rende il nome sostenibile è rendere la distinzione
          **visibile**. Una frase in fondo alla pagina «chi siamo» non la rende
          visibile: la rende disponibile a chi la cerca.
        */}
        <p className="mt-3 max-w-[68ch] text-lg leading-relaxed text-muted">
          Ogni giorno leggiamo le decisioni del Comune dall&apos;albo pretorio e
          le rendiamo leggibili.{" "}
          <span className="font-semibold text-foreground">
            Un progetto civico indipendente: non è il sito del Comune.
          </span>
        </p>
      </header>

      {giorno === null ? (
        /*
          L'ARCHIVIO VUOTO — uno stato disegnato, non un ramo dimenticato.

          È lo stato della PRODUZIONE finché la lettura schedulata non esiste
          (`docs/pipeline-atti-schedulata.md` §2), quindi è la prima cosa che
          vedrebbe chi aprisse il sito oggi. `DESIGN.md` §12: gli stati vuoti si
          disegnano. E si dichiara la verità — «non ancora letto» — invece di
          mostrare zeri, che presenterebbero un vuoto come un dato.
        */
        <Card className="max-w-2xl">
          <h2 className="text-base font-semibold">
            L&apos;archivio degli atti non è ancora stato letto
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            La lettura automatica dell&apos;albo pretorio non ha ancora
            girato su questo sito, quindi qui non c&apos;è nessun atto da
            mostrare. Non è un errore ed è preferibile al contrario: un archivio
            che si dichiara pieno quando è vuoto sarebbe la sola cosa che questo
            progetto non può permettersi.
          </p>
        </Card>
      ) : (
        <>
          {/*
            DUE COMPOSIZIONI, non una con un buco.

            Con l'apertura curata: il fatto del giorno prende la colonna larga,
            il monumento la stretta, e il fiume scorre sotto a tutta larghezza.
            Senza: **il fiume sale al posto d'onore** — è la seconda gamba della
            decisione del 12/08, e va reso come un'apertura vera, non come un
            avanzo. In nessuno dei due casi la pagina dice di avere qualcosa che
            non ha.
          */}
          {/*
            `items-start` e non lo stiramento di default: senza cura la colonna
            di sinistra è il fiume, che è molto più alto del monumento — e una
            card stirata a quell'altezza si apre dentro un vuoto di centinaia di
            pixel col link appeso in fondo. Ogni superficie prende l'altezza che
            le serve; il ritmo lo tiene la griglia, non lo stiramento.
          */}
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              {apertura ? (
                <FattoDelGiorno atto={apertura} />
              ) : (
                <FiumeAtti
                  atti={fiume}
                  attiDelGiorno={attiDelGiorno}
                  giorno={giorno}
                />
              )}
            </div>
            <div className="lg:col-span-5">
              <Monumento />
            </div>
          </div>

          {apertura ? (
            <div className="space-y-8">
              {/* Le fasce romaniche: uno dei due motivi identitari rimasti
                  (`DESIGN.md` §3). Separa due letture, non decora una card —
                  che è la differenza fra un motivo che serve e il filo tolto
                  il 12/08. */}
              <hr className="divider-bande" />
              <FiumeAtti
                atti={fiume}
                attiDelGiorno={attiDelGiorno}
                giorno={giorno}
              />
            </div>
          ) : null}
        </>
      )}

      <PorteCitta autenticato={autenticato} />
    </div>
  );
}
