/**
 * Tema Pistoia — direzione "ibrida" (DESIGN.md §2).
 *
 * Struttura visiva derivata dai riferimenti in `refs/` (tela grigio-calda,
 * superfici bianche a squircle, un solo accento, cifre display sovradimensionate);
 * significato semantico derivato dall'identità civica di Pistoia (rosso dello
 * stemma, verde-acqua dei vivai, viola della partecipazione).
 *
 * Cosa vive QUI: i token del sistema Astryx (nomi vincolati da `TokenName`).
 * Cosa vive in `globals.css`: i token di estensione Pistoia che Astryx non
 * modella — lime decorativo, stop dei gradienti mesh, griglia dot-matrix.
 * Astryx v0.1.8 non accetta nomi di token custom in `tokens`: è un vincolo
 * del tipo, non una scelta stilistica.
 *
 * Build: `corepack pnpm theme:build` → pistoia.css + pistoia.js (SSR-safe).
 * L'iniezione a runtime NON è utilizzabile qui: la CSP con nonce del proxy
 * bloccherebbe il tag <style> generato al momento dell'hydration.
 */
import { defineTheme } from '@astryxdesign/core/theme';

/* -------------------------------------------------------------------------
 * Palette sorgente
 * ---------------------------------------------------------------------- */

/**
 * Verde-acqua dei vivai: il colore dell'azione (DESIGN.md §4).
 *
 * **Scurito il 2026-08-05 da `#0E9F92` per rispettare il contrasto AA**, che
 * `DESIGN.md` §4 dichiara non negoziabile e che la prima misura automatica
 * (axe) ha smentito. Il vecchio valore faceva 2,66:1 come testo sulla tela e
 * 3,28:1 col bianco sopra — sotto il 4,5:1 richiesto: fallivano insieme **i
 * link** e **il pulsante primario**, cioè i due usi principali del colore.
 * `#0A756B` è il valore più chiaro che li porta entrambi sopra la soglia
 * (4,50:1 come testo, 5,57:1 col bianco sopra), quindi è il più fedele
 * possibile alla tinta di prima. Il tema scuro non è stato toccato: lì il
 * contrasto passava già.
 */
const TEAL = '#0A756B';
const TEAL_DARK = '#2FD0BD';

/** Rosso dello stemma scaccato: brand e urgenza. Mai decorativo. */
const CREST = '#D63A57';
const CREST_DARK = '#F06A82';

/**
 * Tela grigio-calda dei riferimenti. È ciò che fa leggere le card bianche
 * come oggetti appoggiati, invece che come "il foglio".
 */
const CANVAS = '#E8E7E4';
const CANVAS_DARK = '#131211';

export const pistoiaTheme = defineTheme({
  name: 'pistoia',

  /**
   * `neutralStyle: 'neutral'` = minimo sanguinamento della tinta d'accento nei
   * grigi. Con un seed teal, 'warm' avrebbe prodotto grigi virati verde-acqua:
   * l'opposto della tela calda che serve. I fondi sono poi fissati a mano sotto.
   */
  color: {
    accent: TEAL,
    neutralStyle: 'neutral',
    contrast: 'standard',
  },

  /**
   * Scala tipografica: base 15px, ratio 1.25.
   * Il contrasto estremo dei riferimenti (label 11px vs display 80px) è
   * ottenuto da questa scala più gli override display espliciti sotto.
   */
  typography: {
    scale: { base: 15, ratio: 1.25 },
  },

  /**
   * Raggi: base 6 × moltiplicatore 1.75 →
   *   inner 10.5px · element 21px · container 31.5px
   * `container` a ~32px è la misura delle card nei riferimenti.
   * `page` è sovrascritto sotto: 6×7×1.75 = 73.5px sarebbe eccessivo.
   */
  radius: { base: 6, multiplier: 1.75 },

  /**
   * Durate (DESIGN.md §6): 150ms micro · 250ms standard · 400ms scena.
   * `ratio` comprime gli estremi min/max attorno al valore nominale.
   */
  motion: { fast: 150, medium: 250, ratio: 0.8 },

  tokens: {
    /* --- Superfici -------------------------------------------------------
     * La tela è grigia, le superfici sono bianche. Questa inversione rispetto
     * al tema precedente (fondo quasi-bianco) è la scelta strutturale che porta
     * tutto il resto del linguaggio dei riferimenti.
     */
    '--color-background-body': [CANVAS, CANVAS_DARK],
    '--color-background-surface': ['#FFFFFF', '#1C1B1A'],
    '--color-background-card': ['#FFFFFF', '#1C1B1A'],
    '--color-background-popover': ['#FFFFFF', '#232221'],
    '--color-background-muted': ['#F2F1EF', '#232221'],
    '--color-background-inverted': ['#16181A', '#F5F4F2'],

    /* --- Testo ----------------------------------------------------------- */
    '--color-text-primary': ['#16181A', '#F5F4F2'],
    /* Scurito il 2026-08-05: `#6B6E72` faceva 4,14:1 sulla tela, appena sotto
       AA. `#5A5D61` fa 5,35:1 e lascia spazio al livello sotto (`--muted-2`)
       per restare distinguibile senza scendere anch'esso sotto la soglia. */
    '--color-text-secondary': ['#5A5D61', '#A3A19E'],
    '--color-text-disabled': ['#A8AAAD', '#66645F'],
    '--color-text-accent': [TEAL, TEAL_DARK],

    /* --- Accento e interazione ------------------------------------------- */
    '--color-accent': [TEAL, TEAL_DARK],
    '--color-on-accent': ['#FFFFFF', '#0A1F1D'],

    /* --- Bordi ------------------------------------------------------------
     * Nei riferimenti le card non hanno bordo: separano per ombra e per stacco
     * di superficie. Il bordo resta, tenue, per input e stati di focus.
     */
    '--color-border': ['#E4E3E0', '#2C2A28'],
    '--color-border-emphasized': ['#C9C7C3', '#3D3A37'],

    /* --- Stato (semantica invariata, DESIGN.md §4) ------------------------ */
    /* Scurito il 2026-08-05: `#1F9D63` faceva 2,93:1 sul proprio chip `-soft`
       e 3,14:1 come testo su una superficie chiara. `#187A4D` porta entrambi
       sopra AA restando inequivocabilmente il verde del «risolto». */
    '--color-success': ['#187A4D', '#45D089'],
    '--color-error': [CREST, CREST_DARK],
    '--color-on-error': ['#FFFFFF', '#2A0910'],
    '--color-on-success': ['#FFFFFF', '#062117'],

    /* --- Ombra ------------------------------------------------------------
     * Ombra diffusa e neutra: nei riferimenti l'elevazione è morbida e ampia,
     * mai una linea dura sotto la card.
     */
    '--color-shadow': ['rgba(28, 26, 24, 0.10)', 'rgba(0, 0, 0, 0.55)'],
    '--color-skeleton': ['#EDECEA', '#262422'],

    /* --- Tipografia -------------------------------------------------------
     * I font arrivano da next/font (self-hosted) come CSS variables: nessuna
     * richiesta esterna, compatibile con la CSP, zero layout shift.
     */
    '--font-family-body':
      'var(--font-schibsted), ui-sans-serif, system-ui, sans-serif',
    '--font-family-heading':
      'var(--font-schibsted), ui-sans-serif, system-ui, sans-serif',
    '--font-family-code':
      'var(--font-jetbrains), ui-monospace, SFMono-Regular, monospace',

    /* --- Display ----------------------------------------------------------
     * Il numero protagonista è leggero e strettissimo: nei riferimenti la
     * gerarchia si afferma con la DIMENSIONE, non con il peso. È l'opposto
     * della regola Montserrat precedente (peso ≥600) ed è voluto.
     */
    '--text-display-1-size': '5rem',
    '--text-display-1-weight': '300',
    '--text-display-1-leading': '0.92',
    '--text-display-2-size': '3.5rem',
    '--text-display-2-weight': '300',
    '--text-display-2-leading': '0.96',
    '--text-display-3-size': '2.5rem',
    '--text-display-3-weight': '400',
    '--text-display-3-leading': '1.0',

    /* --- Raggio di pagina --------------------------------------------------
     * Sovrascrive il 73.5px generato dalla scala: i contenitori di pagina
     * restano ampi ma non caricaturali.
     */
    '--radius-page': '40px',

    /* --- Data-viz ----------------------------------------------------------
     * Le rampe sequenziali sono ritinte sulla palette civica: il teal porta le
     * quantità, il rosso dello stemma solo gli scostamenti negativi.
     * I categorici restano distinguibili anche in scala di grigi.
     */
    '--color-data-categorical-teal': TEAL,
    '--color-data-categorical-purple': '#8A7BF0',
    '--color-data-categorical-orange': '#F5A623',
    '--color-data-categorical-red': CREST,
    '--color-data-categorical-green': '#1F9D63',
    '--color-data-neutral': ['#8B8985', '#7A7874'],

    '--color-data-teal-5': '#053E39',
    '--color-data-teal-4': '#0A6E65',
    '--color-data-teal-3': TEAL,
    '--color-data-teal-2': '#7FD8CF',
    '--color-data-teal-1': '#DFF3F0',
  },

  /**
   * Override di componente.
   * Si usano le chiavi semantiche (`variant:primary`) e non selettori CSS:
   * è il pipeline del tema a scegliere il selettore, così gli override
   * sopravvivono ai cambi interni di Astryx.
   */
  components: {
    /* Card borderless su ombra diffusa: la firma dei riferimenti. */
    card: {
      base: {
        borderRadius: 'var(--radius-container)',
        borderWidth: '0',
        boxShadow:
          '0 1px 2px rgba(28,26,24,0.04), 0 8px 24px -8px var(--color-shadow)',
      },
    },

    /* Bottoni a pillola: nei riferimenti ogni controllo d'azione è un pill. */
    button: {
      base: {
        borderRadius: 'var(--radius-full)',
        fontWeight: '500',
      },
    },

    /* Badge/chip a pillola compatta: il posto dove vive il lime. */
    badge: {
      base: {
        borderRadius: 'var(--radius-full)',
        fontWeight: '600',
        letterSpacing: '0.01em',
      },
    },

    /* Input a raggio pieno per allinearsi ai controlli pill dei riferimenti. */
    textinput: {
      base: {
        borderRadius: 'var(--radius-full)',
      },
    },
  },
});

export default pistoiaTheme;
