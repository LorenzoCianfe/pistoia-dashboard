"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

// «Siamo sul client?» senza setState-in-effect, come `ThemeToggle`: sul server
// false, al primo render client true. Il lint del progetto vieta lo setState in
// un effetto, e questa è la via che il resto del codice ha già scelto.
const useMontato = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

/**
 * IL CAMBIO DI TEMA COME UN'ORA DEL GIORNO.
 *
 * Premendo l'interruttore non scatta un tema: **passa il tempo su Pistoia**. Un
 * time-lapse copre la fotografia mentre l'interfaccia cambia colore sotto, e
 * finisce esattamente sul fotogramma che È la fotografia nuova — quindi fra il
 * filmato e ciò che resta non c'è nessuno stacco.
 *
 * ## Due filmati, entrambi in AVANTI e a piena qualità (2026-08-14)
 *
 * 🔴 Un tentativo precedente riproduceva il girato **all'indietro** guidando
 * `currentTime` a ritroso: i browser non sanno riprodurre a ritroso, e il
 * risultato era a scatti. Lorenzo ha fornito il **girato già montato al
 * contrario**, quindi ora sono due file, e **tutti e due si riproducono in
 * avanti** — cioè nativamente, fluidi:
 *
 * - **verso la notte** (chiaro → scuro): `pistoia-timelapse.mp4` (day→night).
 * - **verso il giorno** (scuro → chiaro): `pistoia-timelapse-reverse.mp4`
 *   (night→day), che è lo stesso girato rovesciato.
 *
 * Entrambi accelerati per stare in ~1,2s. La sorgente si scambia in base al
 * verso; l'ultimo fotogramma di ciascuno È la fotografia che resta, quindi non
 * c'è stacco fra filmato e immagine.
 *
 * ⚠️ I file sono pesanti (~13 MB in due): tenuti così **per la revisione**,
 * dove conta la qualità. La versione leggera per la produzione è un passo dopo.
 *
 * ## Perché due componenti e un evento
 *
 * Il bottone vive nella **testata**, il filmato dentro la **scena**: due rami
 * diversi dell'albero. Il filmato messo nella testata finirebbe sopra le
 * tessere, perché la testata ha un contesto di impilamento suo. Un contesto
 * React per due componenti sarebbe più impalcatura che sostanza: basta un
 * evento sul `window`. Il bottone lo lancia, la scena lo ascolta, e se la scena
 * non c'è (qualunque altra pagina) il tema cambia lo stesso.
 *
 * ## Tre regole che lo tengono onesto
 *
 * 1. 🔴 **Non si scarica finché non serve.** Il `<video>` nasce senza sorgente:
 *    l'indirizzo arriva al primo passaggio del mouse sull'interruttore o al
 *    primo fuoco da tastiera — non su ogni visita.
 * 2. 🔴 **Se non è pronto, il tema cambia lo stesso.** Il filmato è un di più:
 *    non si aspetta, non si blocca niente, e chi ha una connessione lenta vede
 *    la dissolvenza dei colori e basta.
 * 3. 🔴 **Con `prefers-reduced-motion` non parte affatto** — e la preferenza si
 *    legge in un effetto, mai durante il render: un ramo del JSX su quel valore
 *    servirebbe un HTML diverso da quello idratato (`AGENTS.md` §3, 2026-08-08).
 */

/** `avanti` = verso la notte; `indietro` = verso il giorno. */
type Verso = "avanti" | "indietro";

const FILM: Record<Verso, string> = {
  avanti: "/citta/pistoia-timelapse.mp4",
  indietro: "/citta/pistoia-timelapse-reverse.mp4",
};

/** Quanto dura la transizione: la corsa del filmato e l'accompagnamento colori. */
const DURATA = 1250;

const INTENTO = "pistoia:tema-intento";
const CAMBIO = "pistoia:tema-cambio";

/* ============================================================================
   IL BOTTONE — sta nella testata
   ========================================================================== */
export function CambioTema({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const montato = useMontato();
  const menoMoto = useRef(false);

  useEffect(() => {
    // Solo scrittura di un ref: nessuno setState, quindi nessuna cascata.
    menoMoto.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const scuro = montato && resolvedTheme === "dark";
  // Da scuro si torna al giorno (indietro); da chiaro si va alla notte (avanti).
  const verso: Verso = scuro ? "indietro" : "avanti";

  const annuncia = useCallback(
    (nome: string, v: Verso) =>
      window.dispatchEvent(new CustomEvent(nome, { detail: v })),
    [],
  );

  const cambia = useCallback(() => {
    if (!menoMoto.current) {
      /*
        I colori si accompagnano solo QUI, per la durata del filmato. Una
        transizione permanente su ogni superficie renderebbe molle anche ogni
        passaggio del mouse.
      */
      const root = document.documentElement;
      root.dataset.transizioneTema = "";
      window.setTimeout(() => {
        delete root.dataset.transizioneTema;
      }, DURATA);
      annuncia(CAMBIO, verso);
    }
    setTheme(scuro ? "light" : "dark");
  }, [scuro, verso, setTheme, annuncia]);

  return (
    <button
      type="button"
      onClick={cambia}
      onPointerEnter={() => annuncia(INTENTO, verso)}
      onFocus={() => annuncia(INTENTO, verso)}
      aria-label={scuro ? "Passa al tema chiaro" : "Passa al tema scuro"}
      className={className}
    >
      {montato ? (
        scuro ? (
          <Sun size={17} aria-hidden />
        ) : (
          <Moon size={17} aria-hidden />
        )
      ) : (
        <span className="size-[17px]" />
      )}
    </button>
  );
}

/* ============================================================================
   IL FILMATO — sta dentro la scena
   ========================================================================== */
export function ScenaTransizione() {
  /*
    ⚠️ **DUE elementi `<video>`, uno per verso**, non uno con la sorgente che
    si scambia. Scambiare `src` su un solo elemento e chiamare `load()` lo
    resetta (currentTime a 0, readyState giù) in momenti che si accavallano coi
    due eventi del bottone (`pointerenter` e `focus`), e il verso di ritorno
    finiva per non partire. Due elementi stabili, ciascuno con la sua sorgente
    fissa, tolgono di mezzo tutta quella fragilità: si riproduce quello giusto,
    l'altro resta fermo.

    `preload="none"` finché non c'è `src`: la sorgente si assegna al primo
    intento di QUEL verso, quindi chi non sfiora mai l'interruttore non scarica
    niente, e chi va solo verso la notte non scarica il filmato del giorno.
  */
  const avanti = useRef<HTMLVideoElement>(null);
  const indietro = useRef<HTMLVideoElement>(null);
  const [attivo, setAttivo] = useState<Verso | null>(null);
  const timer = useRef(0);

  const elemento = useCallback(
    (verso: Verso) => (verso === "avanti" ? avanti.current : indietro.current),
    [],
  );

  const prepara = useCallback(
    (verso: Verso) => {
      const v = elemento(verso);
      if (!v || v.src) return; // la sorgente si mette una volta sola
      v.src = FILM[verso];
      v.load();
    },
    [elemento],
  );

  const ferma = useCallback(() => {
    window.clearTimeout(timer.current);
    setAttivo(null);
  }, []);

  useEffect(() => {
    const suIntento = (e: Event) => prepara((e as CustomEvent<Verso>).detail);

    const suCambio = (e: Event) => {
      const verso = (e as CustomEvent<Verso>).detail;
      prepara(verso);
      const v = elemento(verso);
      if (!v || v.readyState < 2) return; // non pronto: si cambia e basta

      // Entrambi i filmati si riproducono in AVANTI: il file «reverse» è già
      // montato al contrario. Accelerato per stare nella durata voluta.
      setAttivo(verso);
      v.currentTime = 0;
      v.playbackRate = Math.min(16, v.duration / (DURATA / 1000));
      void v.play().catch(ferma);

      // Rete di sicurezza: se `onEnded` non scatta (a rate alto capita), il
      // velo si toglie comunque poco dopo la fine prevista.
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(ferma, DURATA + 250);
    };

    window.addEventListener(INTENTO, suIntento);
    window.addEventListener(CAMBIO, suCambio);
    const t = timer;
    return () => {
      window.removeEventListener(INTENTO, suIntento);
      window.removeEventListener(CAMBIO, suCambio);
      window.clearTimeout(t.current);
    };
  }, [prepara, elemento, ferma]);

  return (
    <>
      <video
        ref={avanti}
        className="transizione-scena"
        data-attiva={attivo === "avanti" ? "" : undefined}
        muted
        playsInline
        preload="none"
        aria-hidden
        onEnded={ferma}
      />
      <video
        ref={indietro}
        className="transizione-scena"
        data-attiva={attivo === "indietro" ? "" : undefined}
        muted
        playsInline
        preload="none"
        aria-hidden
        onEnded={ferma}
      />
    </>
  );
}
