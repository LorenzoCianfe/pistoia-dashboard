/**
 * LA SCENA — Pistoia dietro la prima pagina, di giorno e di notte.
 *
 * Due fotografie della stessa inquadratura (il Duomo e i tetti visti dal
 * campanile), preparate da `scripts/sfondi.mjs` in AVIF e WebP a tre misure.
 *
 * ## Perché `<picture>` e non `next/image`
 *
 * Qui la scelta dell'immagine dipende dal **tema**, che con `next-themes` è una
 * CLASSE sul root e non una media query. `next/image` sa scegliere per
 * larghezza, non per classe: renderebbe due `<Image>` e il browser
 * scaricherebbe **entrambe le foto** — 170 KB buttati, sempre, per mostrarne
 * una.
 *
 * `<picture>` con `<source media="(prefers-color-scheme: dark)">` risolve il
 * caso di chi lascia il tema di sistema, che è la maggioranza, e per la scelta
 * esplicita c'è la seconda coppia sotto, mostrata dal CSS. Il browser scarica
 * solo la `<source>` che vince.
 *
 * ⚠️ **Il segnaposto sfocato non è un vezzo.** Sopra la foto ci vive del testo
 * bianco: nel momento fra il primo disegno e l'arrivo dell'immagine, senza uno
 * sfondo quel testo sarebbe illeggibile — bianco su bianco. Il segnaposto è un
 * WebP da 24px (132 byte) inline nel CSS, quindi c'è dal primo fotogramma.
 *
 * ⚠️ `fetchPriority="high"`: è l'elemento più grande della prima schermata, cioè
 * quasi certamente l'LCP. Senza, il browser la mette in coda dietro il resto.
 */
import { ScenaTransizione } from "./transizione-scena";

export function Scena() {
  return (
    <div className="scena" aria-hidden>
      {/* Il tema di SISTEMA (nessuna classe sul root): decide la media query. */}
      <picture className="scena-auto">
        <source
          media="(prefers-color-scheme: dark)"
          type="image/avif"
          srcSet="/citta/pistoia-notte-960.avif 960w, /citta/pistoia-notte-1440.avif 1440w, /citta/pistoia-notte-1920.avif 1920w"
          sizes="100vw"
        />
        <source
          media="(prefers-color-scheme: dark)"
          type="image/webp"
          srcSet="/citta/pistoia-notte-960.webp 960w, /citta/pistoia-notte-1440.webp 1440w, /citta/pistoia-notte-1920.webp 1920w"
          sizes="100vw"
        />
        <source
          type="image/avif"
          srcSet="/citta/pistoia-giorno-960.avif 960w, /citta/pistoia-giorno-1440.avif 1440w, /citta/pistoia-giorno-1920.avif 1920w"
          sizes="100vw"
        />
        <img
          src="/citta/pistoia-giorno-1440.webp"
          srcSet="/citta/pistoia-giorno-960.webp 960w, /citta/pistoia-giorno-1440.webp 1440w, /citta/pistoia-giorno-1920.webp 1920w"
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      {/*
        La scelta ESPLICITA del tema. Queste due coppie sono nascoste dal CSS
        finché il root non porta `.light` o `.dark`: `display: none` impedisce
        al browser di scaricarle, quindi il costo è zero finché non servono.
      */}
      <picture className="scena-chiara">
        <source
          type="image/avif"
          srcSet="/citta/pistoia-giorno-960.avif 960w, /citta/pistoia-giorno-1440.avif 1440w, /citta/pistoia-giorno-1920.avif 1920w"
          sizes="100vw"
        />
        <img
          src="/citta/pistoia-giorno-1440.webp"
          srcSet="/citta/pistoia-giorno-960.webp 960w, /citta/pistoia-giorno-1440.webp 1440w, /citta/pistoia-giorno-1920.webp 1920w"
          sizes="100vw"
          alt=""
          decoding="async"
        />
      </picture>

      <picture className="scena-scura">
        <source
          type="image/avif"
          srcSet="/citta/pistoia-notte-960.avif 960w, /citta/pistoia-notte-1440.avif 1440w, /citta/pistoia-notte-1920.avif 1920w"
          sizes="100vw"
        />
        <img
          src="/citta/pistoia-notte-1440.webp"
          srcSet="/citta/pistoia-notte-960.webp 960w, /citta/pistoia-notte-1440.webp 1440w, /citta/pistoia-notte-1920.webp 1920w"
          sizes="100vw"
          alt=""
          decoding="async"
        />
      </picture>

      {/*
        IL VELO. Senza, il testo non raggiunge AA su una fotografia: il cielo
        del giorno è quasi bianco e il titolo è scuro, i tetti della notte sono
        caldi e il titolo è chiaro. Due gradienti — uno da sinistra per la
        colonna del testo, uno dal basso per la riga di chiusura — invece di un
        velo uniforme, che spegnerebbe la foto ovunque per proteggere due zone.
      */}
      {/* Il filmato di transizione sta QUI, sopra le fotografie: è la scena
          che cambia ora, non un livello a parte.

          ⚠️ Nessun velo (2026-08-14, Lorenzo: «togli l'alone bianco intorno
          alla pagina»). La velatura verticale sfumava verso il grigio chiaro
          in alto e in basso, e in tema chiaro leggeva come una cornice
          biancastra. La leggibilità del testo la tiene la composizione — il
          titolo vive nella zona di cielo — non un velo sopra la foto. */}
      <ScenaTransizione />
    </div>
  );
}
