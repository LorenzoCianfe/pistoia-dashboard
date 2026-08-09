import { Card } from "@/components/ui/card";
import type { AnaliticheOperative, VoceAnalitica } from "@/lib/analitiche";

/*
  LE DUE LETTURE OPERATIVE DEL CRUSCOTTO (Ondata 8, forma B).

  Forma scelta da Lorenzo il 2026-08-09 sui tre mockup iniettati
  sull'applicazione vera. Le altezze misurate prima di decidere: la coppia
  aggiunge 700px a 1280 e 821 a 360, dentro il tetto dell'area — che a 360 è
  3.327px (`/admin/valutazioni`), non i 1.894 che avevo citato a memoria.

  ⚠️ **Nessuna barra, e non è una semplificazione.** Una barra del tempo
  mediano avrebbe come massimo «il peggiore osservato», cioè una scala a tacche
  senza un traguardo fissato — proprio ciò che `DESIGN.md` vieta e che ha fatto
  togliere la scala da `/promesse`. Qui il numero è il dato, e non gli serve un
  fondale per essere letto.

  ⚠️ **Le due card hanno altezza costante.** Gli uffici sono cinque e restano
  cinque; le categorie mostrate sono solo quelle sopra la soglia e le altre
  diventano una riga sola. È la stessa proprietà che ha reso giusto
  lista + dettaglio: ciò che conta non è l'altezza, è la derivata.
*/

/** Una riga: nome a sinistra, il lavoro e il tempo a destra. */
function Riga({ voce, capitalizza }: { voce: VoceAnalitica; capitalizza?: boolean }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-t border-border py-2.5">
      <span className={`text-sm font-medium${capitalizza ? " capitalize" : ""}`}>
        {voce.chiave}
      </span>
      <span className="shrink-0 text-sm tabular-nums">
        <span className="text-xs text-muted-2">
          {voce.aperte} apert{voce.aperte === 1 ? "a" : "e"}
        </span>{" "}
        ·{" "}
        {voce.medianaGiorni === null ? (
          <span className="text-xs text-muted-2">nessuna chiusa</span>
        ) : (
          <>
            <strong>{voce.medianaGiorni.toLocaleString("it-IT")}</strong>{" "}
            <span className="text-xs text-muted-2">giorni</span>
          </>
        )}
      </span>
    </li>
  );
}

export function AnaliticheOperativeCards({ dati }: { dati: AnaliticheOperative }) {
  return (
    <>
      <Card>
        <h2 className="text-base font-semibold">Il carico degli uffici</h2>
        <p className="mt-1 text-sm text-muted">
          Chi ha in mano che cosa, e in quanti giorni chiude. Mediana sulle
          chiuse, non media: una sola pratica ferma da mesi sposterebbe la media
          e racconterebbe una lentezza che l&apos;ufficio non ha.
        </p>

        <ul className="mt-3">
          {dati.uffici.map((u) => (
            <Riga key={u.chiave} voce={u} />
          ))}
        </ul>

        {/*
          Fuori dall'elenco, e con parole sue: non è un ufficio lento, è
          l'assenza di un ufficio. Dentro la classifica sarebbe la riga più
          rossa della pagina, attribuita a nessuno.
        */}
        {dati.senzaUfficio.aperte > 0 ? (
          <div className="mt-3 border-t border-border pt-3">
            {/*
              `--red-ink`, non `--red`. Il rosso dello stemma è identità prima
              che colore e resta intatto dove significa, ma su testo da 14px
              fa **4,3:1** contro il fondo della card — sotto il 4,5 di AA.
              Misurato dal cancello axe, che l'ha fatto rosso al primo giro:
              `--red-ink` esiste esattamente per questo caso (globals.css).
            */}
            <p className="text-sm font-semibold text-[var(--red-ink)]">
              {dati.senzaUfficio.aperte} segnalazion
              {dati.senzaUfficio.aperte === 1 ? "e" : "i"} senza ufficio,{" "}
              {dati.senzaUfficio.chiuse === 0
                ? "nessuna chiusa"
                : `${dati.senzaUfficio.chiuse} chiuse`}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Non è un ufficio lento: è chi non le ha ancora prese in carico.
            </p>
          </div>
        ) : null}
      </Card>

      <Card>
        <h2 className="text-base font-semibold">Dove si accumula</h2>
        <p className="mt-1 text-sm text-muted">
          Le categorie con abbastanza casi da dire qualcosa.
        </p>

        <ul className="mt-3">
          {dati.categorie.map((c) => (
            <Riga key={c.chiave} voce={c} capitalizza />
          ))}
        </ul>

        {/*
          L'omissione si dichiara. Mostrare una categoria da un caso accanto a
          una da sette le farebbe leggere come confrontabili, e tacerne
          l'esistenza farebbe credere che la città non abbia quelle categorie.
        */}
        {dati.categorieMute > 0 ? (
          <p className="mt-3 border-t border-border pt-3 text-xs text-muted">
            Altre {dati.categorieMute} categorie hanno meno di {dati.soglia} casi:
            troppo poche perché un numero significhi qualcosa, quindi non
            compaiono.
          </p>
        ) : null}
      </Card>
    </>
  );
}
