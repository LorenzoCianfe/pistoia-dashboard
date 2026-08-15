"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
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
 * ## Due filmati, entrambi in AVANTI e a VELOCITÀ ORIGINALE
 *
 * 🔴 Un tentativo precedente riproduceva il girato **all'indietro** guidando
 * `currentTime` a ritroso: i browser non sanno riprodurre a ritroso, e il
 * risultato era a scatti. Lorenzo ha fornito il **girato già montato al
 * contrario**, quindi sono due file, e **tutti e due si riproducono in avanti**:
 *
 * - **verso la notte** (chiaro → scuro): `pistoia-timelapse.mp4`
 * - **verso il giorno** (scuro → chiaro): `pistoia-timelapse-reverse.mp4`
 *
 * ⚠️ **`playbackRate` resta 1** (2026-08-15). Prima erano accelerati a ~4× per
 * stare in 1,25s: a quel ritmo il decodificatore salta fotogrammi, `ended` non
 * arriva sempre — il codice di allora aveva già una «rete di sicurezza» per
 * questo — e la corsa del sole diventava una scattata. I file durano **5,04s**
 * ciascuno, quindi **la transizione dura 5,04s** e l'interruttore resta chiuso
 * per tutto quel tempo. Se un giorno fosse troppo, la leva è **rimontare i
 * sorgenti più corti**: qui la velocità è quella vera, e non si tocca.
 *
 * ## IL FILMATO È L'OROLOGIO, e l'orologio è un numero solo
 *
 * A ogni fotogramma questo modulo scrive su `<html>` una variabile,
 * **`--tema-t`**, che vale `currentTime / duration` del filmato: 0 = pieno
 * giorno, 1 = piena notte. In `globals.css` **ogni token del tema è una
 * miscela** fra il proprio valore diurno e il proprio valore notturno presa a
 * quel punto. Non c'è nessun'altra sincronia da mantenere: a metà filmato
 * l'interfaccia è a metà perché è **letteralmente lo stesso numero**.
 *
 * ⚠️ È una sincronia ad **anello chiuso**: il tempo non viene da un cronometro
 * partito insieme al filmato, viene dal filmato. Se la decodifica rallenta,
 * rallentano anche i colori; se si ferma, si fermano. Non possono scollarsi.
 *
 * ### 🔴 Perché NON è una transizione CSS (difetto pagato il 2026-08-15)
 *
 * La stesura precedente stendeva `transition-property: … color …` su `*`.
 * Sfondi, bordi e ombre arrivavano puntuali; **il testo no**: `color` è una
 * proprietà **ereditata**, e se un antenato la sta transendo, la transizione
 * del figlio viene ribersagliata a ogni fotogramma e decade in
 * un'esponenziale che non arriva mai. Misurato sulla prima pagina: a filmato
 * finito il titolo era al **62%** del percorso, e ci arrivava di scatto solo
 * quando l'attributo veniva tolto — cioè lo stacco finale che si voleva
 * togliere. La spiegazione per esteso, e la prova in laboratorio, stanno in
 * `globals.css` sopra `html[data-transizione-tema]`.
 *
 * ## Perché un REGISTRO di modulo e non più un evento sul window
 *
 * Il bottone vive nella **testata**, il filmato dentro la **scena**: due rami
 * diversi dell'albero (il filmato messo in testata finirebbe sopra le tessere,
 * perché la testata ha un contesto di impilamento suo). Prima si parlavano con
 * un `CustomEvent`, che però va in **una direzione sola** — e adesso il bottone
 * deve sapere **quando la corsa è finita**, per riaprirsi. Quindi le due metà
 * condividono un piccolo stato di modulo: sono nello stesso file, quindi nello
 * stesso chunk, quindi è letteralmente la stessa variabile. Un contesto React
 * per due componenti sarebbe più impalcatura che sostanza.
 *
 * ⚠️ **La regia della corsa sta nel MODULO, non dentro un componente.** Se
 * vivesse in un `useEffect`, navigare via da `/` a metà transizione smonterebbe
 * tutto lasciando `data-transizione-tema` appeso a `<html>` per sempre — cioè
 * il tema congelato su un'ora intermedia, per il resto della visita. Così
 * invece il `finally` di `passaLOra` chiude comunque.
 *
 * ## Le tre regole che lo tengono onesto
 *
 * 1. 🔴 **Non si scarica finché non serve.** Il `<video>` nasce senza sorgente:
 *    l'indirizzo arriva al primo passaggio del mouse sull'interruttore o al
 *    primo fuoco da tastiera — non su ogni visita.
 * 2. 🔴 **Se non è pronto, il tema cambia lo stesso.** Il filmato è un di più:
 *    non si aspetta, non si blocca niente, e chi ha una connessione lenta vede
 *    la stessa transizione guidata da un cronometro di `RIPIEGO` millisecondi.
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

const ROVESCIO: Record<Verso, Verso> = {
  avanti: "indietro",
  indietro: "avanti",
};

/**
 * Quanto dura la transizione quando il filmato NON è utilizzabile (non pronto,
 * riproduzione rifiutata, scena assente). È il caso di `/atti` o `/bilancio`,
 * dove la scena non c'è affatto: i colori si muovono lo stesso, solo guidati da
 * un cronometro invece che dal sole.
 */
const RIPIEGO = 520;

/**
 * Quanto ci mette il velo a sparire una volta che il filmato è finito. Lo
 * stesso numero sta in `globals.css` su `.transizione-scena`.
 *
 * ⚠️ Non è tempo perso e non si vede: l'ultimo fotogramma del filmato È la
 * fotografia nuova. Serve a coprire lo scarto di ritaglio fra `<video>` e
 * `<img>`, che a pixel non è mai identico.
 */
const USCITA = 260;

/** `HTMLMediaElement.HAVE_FUTURE_DATA`: c'è il fotogramma corrente e almeno il
 *  successivo. Sotto questa soglia non si parte. */
const PRONTO = 3;

/* ============================================================================
   LO STATO CONDIVISO — un modulo, non un contesto
   ========================================================================== */

/** Una corsa del filmato: dove siamo, e quando è finita. */
type Corsa = {
  /** Avanzamento del filmato, da 0 a 1. È l'unico orologio della transizione. */
  avanzamento(): number;
  fine: Promise<void>;
};

/** Ciò che la scena mette a disposizione del bottone. */
type Regia = {
  /** Mette la sorgente al filmato di quel verso, una volta sola. */
  prepara(verso: Verso): void;
  /** Scopre il velo e fa partire il filmato. `null` se non è utilizzabile. */
  avvia(verso: Verso): Promise<Corsa | null>;
  /** Sfuma via il velo e riavvolge. */
  chiudi(): void;
};

let regia: Regia | null = null;
let occupato = false;
const ascoltatori = new Set<() => void>();

const segnala = () => {
  for (const a of ascoltatori) a();
};

const iscriviti = (a: () => void) => {
  ascoltatori.add(a);
  return () => void ascoltatori.delete(a);
};

/** Il bottone si disabilita da qui. Sul server sempre libero. */
const useOccupato = () =>
  useSyncExternalStore(
    iscriviti,
    () => occupato,
    () => false,
  );

const attesa = (ms: number) =>
  new Promise<void>((ok) => void window.setTimeout(ok, ms));

/** Smoothstep: serve SOLO al ripiego a cronometro, per non partire e non
 *  fermarsi di scatto. Quando c'è il filmato l'avanzamento resta grezzo —
 *  addolcirlo vorrebbe dire scollarlo dal sole, che è tutto il punto. */
const ammorbidisci = (a: number) => a * a * (3 - 2 * a);

/**
 * ACCOMPAGNA I COLORI: scrive `--tema-t` a ogni fotogramma.
 *
 * `verso` decide il senso di marcia: verso la notte si va da 0 a 1, verso il
 * giorno da 1 a 0. Le miscele in `globals.css` sono le stesse nei due sensi —
 * è solo il numero che cammina all'indietro.
 */
function accompagna(verso: Verso, corsa: Corsa | null) {
  const root = document.documentElement;
  const inizio = performance.now();
  let vivo = true;

  const scrivi = (avanzamento: number) =>
    root.style.setProperty(
      "--tema-t",
      (verso === "avanti" ? avanzamento : 1 - avanzamento).toFixed(4),
    );

  const giro = () => {
    if (!vivo) return;
    scrivi(
      corsa
        ? corsa.avanzamento()
        : ammorbidisci(Math.min(1, (performance.now() - inizio) / RIPIEGO)),
    );
    requestAnimationFrame(giro);
  };
  requestAnimationFrame(giro);

  return async () => {
    await (corsa ? corsa.fine : attesa(RIPIEGO));
    vivo = false;
    /*
      🔴 L'ARRIVO ESATTO, scritto a mano e non lasciato all'ultimo fotogramma.
      In una scheda in secondo piano `requestAnimationFrame` non viene mai
      chiamato (`AGENTS.md` §3, Fase A/B, trappola 1): senza questa riga il tema
      resterebbe congelato sull'ora in cui la scheda è passata dietro, e si
      vedrebbe tornando. Con questa riga, al peggio, il cambio è istantaneo.
    */
    scrivi(1);
  };
}

/**
 * LA CORSA COMPLETA: filmato, colori e lucchetto.
 *
 * ⚠️ Il lucchetto è **il primo controllo e l'ultimo rilascio**, e non è una
 * finezza: senza, due clic ravvicinati facevano tre danni insieme — il secondo
 * `setTimeout` toglieva l'attributo dei colori a metà della corsa nuova (stacco
 * secco), il filmato del primo verso restava in riproduzione **sotto** quello
 * nuovo, e il suo `ended` spegneva il velo del filmato che stava correndo. Da
 * fuori si vedeva «il tema salta e la città sparisce a metà», che non somiglia
 * per niente alla sua causa.
 */
async function passaLOra(
  verso: Verso,
  applicaTema: () => void,
  menoMoto: boolean,
) {
  // Chi ha chiesto meno movimento non ha né filmato né dissolvenza: il tema
  // cambia e basta, quindi non c'è nemmeno niente da chiudere a chiave.
  if (menoMoto) {
    applicaTema();
    return;
  }

  if (occupato) return;
  occupato = true;
  segnala();

  const root = document.documentElement;
  try {
    // ① Il filmato parte per primo. `avvia` si scioglie quando il primo
    //    fotogramma è in corsa: è da lì che comincia a passare l'ora.
    const corsa = (await regia?.avvia(verso).catch(() => null)) ?? null;

    // ② L'ora di partenza PRIMA dell'attributo: quando le miscele entrano in
    //    vigore devono già valere il colore di adesso, altrimenti il primo
    //    fotogramma della transizione è un lampo dell'altro tema.
    root.style.setProperty("--tema-t", verso === "avanti" ? "0" : "1");
    root.dataset.transizioneTema = "";

    // ③ Il tema vero cambia adesso. Sotto le miscele non si vede — serve a
    //    `color-scheme`, alla fotografia della scena (che il velo copre) e a
    //    lasciare `resolvedTheme` coerente con l'icona del bottone.
    const attendiFine = accompagna(verso, corsa);
    applicaTema();
    await attendiFine();

    // ④ Il velo se ne va sull'ultimo fotogramma, che è già la fotografia nuova.
    //    Senza filmato non c'è nessun velo da togliere: aspettare la sua
    //    dissolvenza terrebbe l'interruttore chiuso un quarto di secondo per
    //    niente.
    if (corsa) {
      regia?.chiudi();
      await attesa(USCITA);
    }
  } finally {
    /*
      🔴 PRIMA l'attributo, POI la variabile. All'incontrario, per un istante le
      miscele resterebbero in vigore senza il loro numero e ripiegherebbero
      sullo 0 del `var(--tema-t, 0)`: un lampo di pieno giorno in chiusura.
    */
    root.removeAttribute("data-transizione-tema");
    root.style.removeProperty("--tema-t");
    occupato = false;
    segnala();
  }
}

/* ============================================================================
   IL BOTTONE — sta nella testata
   ========================================================================== */
export function CambioTema({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const montato = useMontato();
  const inCorso = useOccupato();
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

  const cambia = useCallback(() => {
    void passaLOra(
      verso,
      () => setTheme(scuro ? "light" : "dark"),
      menoMoto.current,
    );
  }, [verso, scuro, setTheme]);

  const intento = useCallback(() => regia?.prepara(verso), [verso]);

  return (
    <button
      type="button"
      onClick={cambia}
      onPointerEnter={intento}
      onFocus={intento}
      /*
        ⚠️ `aria-disabled` e non `disabled` vero. Un `disabled` messo su un
        elemento che ha il fuoco glielo TOGLIE, e chi naviga da tastiera si
        ritrova rimbalzato in cima al documento nel bel mezzo dell'animazione,
        senza aver fatto niente di sbagliato. `aria-disabled` dice la stessa
        cosa alle tecnologie assistive, lascia il fuoco dov'è, e `globals.css`
        lo veste già come uno spento (`.btn[aria-disabled="true"]`, che porta
        con sé `pointer-events: none`). Il divieto vero comunque non è qui: è
        il lucchetto di `passaLOra`, che è l'unica difesa che non si può
        aggirare.
      */
      aria-disabled={inCorso || undefined}
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

/** Riporta il filmato all'inizio aspettando che il salto sia davvero avvenuto.
 *  Senza l'attesa, scoprendo il velo si vedrebbe per un fotogramma la POSA
 *  FINALE della corsa precedente — cioè la notte, in cima a una transizione
 *  verso la notte. */
const riavvolgi = (v: HTMLVideoElement) =>
  v.currentTime === 0
    ? Promise.resolve()
    : new Promise<void>((ok) => {
        let rete = 0;
        const fatto = () => {
          v.removeEventListener("seeked", fatto);
          window.clearTimeout(rete);
          ok();
        };
        v.addEventListener("seeked", fatto);
        rete = window.setTimeout(fatto, 200);
        v.currentTime = 0;
      });

/** Si scioglie a filmato finito.
 *
 *  ⚠️ La rete di sicurezza non è pignoleria: in una scheda in secondo piano il
 *  browser può sospendere la decodifica e `ended` non arriva mai. Senza rete il
 *  lucchetto non si aprirebbe più e l'interruttore resterebbe spento per il
 *  resto della visita. */
const attendiFine = (v: HTMLVideoElement, durata: number) =>
  new Promise<void>((ok) => {
    let rete = 0;
    const finito = () => {
      v.removeEventListener("ended", finito);
      window.clearTimeout(rete);
      ok();
    };
    v.addEventListener("ended", finito);
    rete = window.setTimeout(finito, durata + 800);
  });

export function ScenaTransizione() {
  /*
    ⚠️ **DUE elementi `<video>`, uno per verso**, non uno con la sorgente che
    si scambia. Scambiare `src` su un solo elemento e chiamare `load()` lo
    resetta (currentTime a 0, readyState giù) in momenti che si accavallano coi
    due eventi del bottone (`pointerenter` e `focus`), e il verso di ritorno
    finiva per non partire. Due elementi stabili, ciascuno con la sua sorgente
    fissa, tolgono di mezzo tutta quella fragilità.

    `preload="none"` finché non c'è `src`: la sorgente si assegna al primo
    intento di QUEL verso, quindi chi non sfiora mai l'interruttore non scarica
    niente, e chi va solo verso la notte non scarica il filmato del giorno.
  */
  const avanti = useRef<HTMLVideoElement>(null);
  const indietro = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const di = (verso: Verso) =>
      verso === "avanti" ? avanti.current : indietro.current;

    const prepara = (verso: Verso) => {
      const v = di(verso);
      if (!v || v.src) return; // la sorgente si mette una volta sola
      // `auto` e non `metadata`: a velocità originale servono cinque secondi di
      // dati, e la soglia di partenza è HAVE_FUTURE_DATA.
      v.preload = "auto";
      v.src = FILM[verso];
      v.load();
    };

    /*
      ⚠️ Il velo si accende e si spegne scrivendo l'attributo **direttamente sul
      DOM**, non con uno stato React. Non è una scorciatoia: qui la sequenza è
      imperativa e a passi esatti — riavvolgi, scopri, riproduci, applica il
      tema — e uno `setState` la spezzerebbe in due render, cioè in due
      fotogrammi diversi, proprio nel punto in cui filmato e colori devono
      partire insieme. Questi due elementi non hanno stato: React non li
      ridisegna mai, quindi non c'è nessuna verità da contendere.
    */
    const mia: Regia = {
      prepara,

      async avvia(verso) {
        const v = di(verso);
        if (!v) return null;
        prepara(verso);

        // Non pronto (o metadati mancanti): si passa al ripiego a cronometro.
        if (v.readyState < PRONTO) return null;
        if (!Number.isFinite(v.duration) || v.duration <= 0) return null;

        // 🔴 L'altro verso non deve MAI restare in corsa sotto. Era il difetto
        //    che, al secondo cambio, faceva sparire il velo a metà: il vecchio
        //    filmato finiva e il suo `ended` spegneva la scena di quello nuovo.
        const altro = di(ROVESCIO[verso]);
        if (altro) {
          altro.pause();
          altro.removeAttribute("data-attiva");
          altro.currentTime = 0;
        }

        v.pause();
        v.playbackRate = 1; // 🔴 velocità originale, mai accelerata
        await riavvolgi(v);

        // Il velo si scopre di scatto (la regola `[data-attiva]` porta 0ms) e
        // mostra il primo fotogramma, che è la fotografia di adesso: nessuno
        // stacco all'inizio.
        v.dataset.attiva = "";

        try {
          await v.play();
        } catch {
          // Riproduzione rifiutata dalla politica del browser: si torna al
          // ripiego invece di lasciare un velo fermo sopra la città.
          v.removeAttribute("data-attiva");
          return null;
        }

        const durata = Math.max(0, v.duration - v.currentTime) * 1000;
        return {
          avanzamento: () =>
            Math.min(1, Math.max(0, v.currentTime / v.duration)),
          fine: attendiFine(v, durata),
        };
      },

      chiudi() {
        for (const v of [avanti.current, indietro.current]) {
          if (!v) continue;
          v.pause();
          v.removeAttribute("data-attiva");
        }
        // Il riavvolgimento aspetta la fine della dissolvenza: farlo subito
        // farebbe lampeggiare il primo fotogramma — cioè l'ora di partenza —
        // proprio mentre il velo sta sfumando via.
        window.setTimeout(() => {
          for (const v of [avanti.current, indietro.current]) {
            if (v && v.paused && !v.dataset.attiva) v.currentTime = 0;
          }
        }, USCITA + 40);
      },
    };

    regia = mia;
    // In sviluppo React monta due volte: si sgancia solo se il registro è
    // ancora il nostro, altrimenti la seconda regia verrebbe cancellata dalla
    // pulizia della prima.
    return () => {
      if (regia === mia) regia = null;
    };
  }, []);

  return (
    <>
      <video
        ref={avanti}
        className="transizione-scena"
        muted
        playsInline
        preload="none"
        aria-hidden
      />
      <video
        ref={indietro}
        className="transizione-scena"
        muted
        playsInline
        preload="none"
        aria-hidden
      />
    </>
  );
}
