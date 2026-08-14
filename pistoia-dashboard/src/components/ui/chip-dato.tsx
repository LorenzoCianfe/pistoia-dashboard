import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

/**
 * IL CHIP-DATO — un numero dentro un oggetto suo.
 *
 * Viene dai riferimenti scelti da Lorenzo il 2026-08-14: la riga dei conteggi
 * non è una frase ma una **fila di pastiglie**, e dentro ciascuna il numero è
 * grande e leggero mentre la parola è minuta e muta. È l'inversione di peso
 * della cifra display (`DESIGN.md` §8) portata alla scala del chip.
 *
 * ⚠️ **Il valore è un numero, non una stringa già formattata.** Formattare qui
 * dentro con `formatNumber` è ciò che tiene `tabular-nums` sensato e impedisce
 * che due chip nella stessa fila usino separatori diversi — che è il modo in
 * cui una fila di numeri smette di sembrare uno strumento.
 */
export function ChipDato({
  valore,
  etichetta,
  delta,
  className,
}: {
  valore: number;
  etichetta: string;
  /**
   * La variazione, resa in apice accanto al numero.
   *
   * ⚠️ **Muto di colore, e non è una svista.** Nei riferimenti il delta è
   * verde o rosso perché lì «di più» ha un verso morale. Qui quasi mai: «+53
   * atti negli ultimi 7 giorni» non è né buono né cattivo, e tingerlo sarebbe
   * un giudizio travestito da colore — esattamente ciò che
   * `direzione-prodotto.md` §1.7 vieta col «numeri caldi, tono freddo».
   */
  delta?: number;
  className?: string;
}) {
  return (
    <span className={cn("chip-dato", className)}>
      <span className="chip-dato__n">
        {formatNumber(valore)}
        {delta !== undefined && delta !== 0 ? (
          <span className="delta-apice">
            {delta > 0 ? "+" : "−"}
            {formatNumber(Math.abs(delta))}
          </span>
        ) : null}
      </span>
      <span className="chip-dato__l">{etichetta}</span>
    </span>
  );
}
