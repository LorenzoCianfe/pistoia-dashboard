import { cn } from "@/lib/utils";

/**
 * Il marchio della piattaforma: **Pistoia.app**.
 *
 * Sostituisce lo stemma come identità (`direzione-prodotto.md` §1.4): questa
 * non è una superficie del Comune e presentarsi come l'istituzione senza
 * esserlo non è un dettaglio grafico. Lo stemma (`Crest`) resta legittimo e
 * in uso dove si **parla del** Comune — le fonti della giunta, il badge
 * dell'account ufficiale, la pagella: uso informativo, non identitario.
 *
 * Una decisione e una conseguenza:
 *
 * 1. **«.app» porta il rosso della città** — scelta di Lorenzo sui mockup del
 *    2026-08-12 («i colori del Comune, non verde»). Nel design system il rosso
 *    dello stemma è già dichiarato «brand e urgenza» (`DESIGN.md` §4), quindi
 *    il marchio è l'uso previsto del token e non uno strappo alla semantica. I
 *    *colori* della città sì, l'*araldica* no: il rosso radica, la scacchiera
 *    travestirebbe.
 * 2. **Il segno è un quadrato pieno con la «P»**, e non è una scelta ma un
 *    **placeholder dichiarato**: il marchio disegnato — segno da griglia
 *    geometrica, derivato dalle fasce romaniche e dal verde dei vivai, mai
 *    araldico — è ancora da fare (`ricognizione-visiva.md` P11). Finché non
 *    esiste, un quadrato onesto è meglio di un'araldica presa in prestito.
 *
 * ⚠️ Il segno inverte col tema invece di portare una tinta propria: sul chiaro
 * è quasi-nero con la lettera bianca, sullo scuro l'opposto. Un segno colorato
 * competerebbe col rosso del logotipo, che è la sola cosa che deve spiccare.
 */
export function Wordmark({
  className,
  size = "md",
  segno = true,
  logotipoClassName,
}: {
  className?: string;
  /** `sm` per il footer e le superfici minute, `md` per le testate. */
  size?: "sm" | "md";
  /** A falso resta il solo logotipo: per i posti dove il segno è già accanto. */
  segno?: boolean;
  /**
   * Classi sul solo logotipo, per le testate strette che tengono il segno e
   * nascondono il testo (`hidden sm:inline`). È una prop invece di un
   * selettore arbitrario dall'esterno perché la struttura interna del marchio
   * non deve diventare un'interfaccia pubblica.
   */
  logotipoClassName?: string;
}) {
  const sm = size === "sm";
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {segno ? (
        <span
          aria-hidden
          className={cn(
            "grid shrink-0 place-items-center rounded-[9px] bg-foreground font-extrabold leading-none text-bg",
            sm ? "size-7 text-[13px]" : "size-[34px] text-[17px]",
          )}
        >
          P
        </span>
      ) : null}
      <span
        className={cn(
          "font-extrabold tracking-tight",
          sm ? "text-[13.5px]" : "text-[19px]",
          logotipoClassName,
        )}
      >
        {/* Il rosso cambia con la TAGLIA, e non è un vezzo: a 19px in peso 800
            il marchio è «testo grande» (soglia 3:1) e `--red` fa 4,56:1; a
            13,5px la soglia sale a 4,5:1 e lo stesso rosso fa **4,3:1** — sotto
            norma. L'ha trovato il cancello axe sul footer, non l'occhio. Per il
            minuto esiste `--red-ink`, che è nel sistema esattamente per questo
            (`DESIGN.md` §4). */}
        Pistoia<span className={sm ? "text-red-ink" : "text-red"}>.app</span>
      </span>
    </span>
  );
}
