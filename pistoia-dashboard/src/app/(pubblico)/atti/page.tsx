import type { Metadata } from "next";

import { getPrimaPagina } from "@/lib/data/atti";
import { FattoDelGiorno } from "@/components/prima-pagina/fatto-del-giorno";
import { FiumeAtti } from "@/components/prima-pagina/fiume-atti";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Gli atti del Comune",
  description:
    "Le decisioni del Comune di Pistoia lette ogni giorno dall'albo pretorio: delibere e determine, con l'oggetto ufficiale integrale.",
};

/*
  GLI ATTI — dove è andato a vivere il fiume (2026-08-14).

  🔴 **Questa pagina è la conseguenza della prima pagina a schermata unica.**
  La home nuova mostra i numeri e apre; il contenuto che si LEGGE — il fatto
  del giorno per esteso, il fiume delle decisioni, l'oggetto ufficiale
  integrale — è finito qui. Non è una pagina nuova nel senso di una funzione
  in più: è il posto dove ha traslocato ciò che la home ha smesso di portare,
  e senza di lei il pulsante «Esplora gli atti» punterebbe nel vuoto.

  Vive in `(pubblico)`: si legge senza account, che è la regola del progetto —
  l'account serve solo per *agire* (§1.6-bis.1).

  ⚠️ **Non è ancora l'archivio.** I 26.644 atti in archivio non si navigano da
  qui: l'archivio con ricerca, filtri e raggruppamento per anno è l'Ondata 11
  (P22 e P25 della ricognizione). Questa pagina mostra il giorno più recente e
  lo dichiara, invece di far credere che ci sia tutto.
*/
export default async function Atti() {
  const { apertura, fiume, attiDelGiorno, giorno } = await getPrimaPagina();

  return (
    <div className="stagger space-y-8 pb-4">
      <header>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-red-ink">
          Dall&apos;albo pretorio
        </p>
        <h1 className="mt-3 text-pretty text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-[2.4rem]">
          Gli atti del Comune
        </h1>
        <p className="mt-3 max-w-[68ch] text-lg leading-relaxed text-muted">
          Ogni delibera e ogni determina che il Comune pubblica, con{" "}
          <span className="font-semibold text-foreground">
            l&apos;oggetto ufficiale come è scritto
          </span>{" "}
          — mai riscritto e mai troncato.
        </p>
      </header>

      {giorno === null ? (
        /* Lo stato della produzione finché la lettura schedulata non esiste
           (`docs/pipeline-atti-schedulata.md` §2). Si dichiara il vuoto invece
           di mostrare zeri, che presenterebbero un'assenza come un dato. */
        <Card className="max-w-2xl">
          <h2 className="text-base font-semibold">
            L&apos;archivio degli atti non è ancora stato letto
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            La lettura automatica dell&apos;albo pretorio non ha ancora girato
            su questo sito, quindi qui non c&apos;è nessun atto da mostrare. Non
            è un errore ed è preferibile al contrario: un archivio che si
            dichiara pieno quando è vuoto sarebbe la sola cosa che questo
            progetto non può permettersi.
          </p>
        </Card>
      ) : (
        <>
          {apertura ? <FattoDelGiorno atto={apertura} /> : null}
          <FiumeAtti
            atti={fiume}
            attiDelGiorno={attiDelGiorno}
            giorno={giorno}
          />
        </>
      )}
    </div>
  );
}
