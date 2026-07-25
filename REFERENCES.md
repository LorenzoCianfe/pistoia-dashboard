# REFERENCES.md — le fonti del design system

> Cosa prendiamo da ciascuna fonte, quando preferirla, e cosa NON prendiamo.
>
> Una fonte senza una regola d'uso è solo una scheda salvata. Ogni sezione
> chiude con la riga che conta: **quando usarla**.
>
> Analisi condotta il 2026-07-25 · Astryx v0.1.8

---

## Indice

| Fonte | Ruolo nel progetto | Stato |
|---|---|---|
| [`refs/*.jpg`](#0-refsjpg--il-riferimento-visivo) | Direzione visiva | **Adottata** (ibrida) |
| [Astryx](#1-astryx--astryxatmetacom) | Libreria di componenti e token | **Adottata** |
| [Motion](#2-motion--motiondev) | Sistema di animazione React | **Adottata** |
| [Anime.js](#3-animejs--animejscom) | Animazione SVG e orchestrazione | Ammessa, mirata |
| [bklit](#4-bklit--bklitcom) | Data-viz | Valutata, non adottata |
| [Kokonut UI](#5-kokonut-ui--kokonutuicom) | Componenti Tailwind+Motion | Valutata, non adottata |
| [React Bits](#6-react-bits--reactbitsdev) | Componenti animati | Fonte di idee |
| [Refero Styles](#7-refero-styles--stylesreferodesign) | Ricerca e benchmark | Strumento di ricerca |
| [Uiverse](#8-uiverse--uiverseio) | Elementi CSS | Solo ispirazione |

---

## 0. `refs/*.jpg` — il riferimento visivo

Dieci immagini della dashboard "Superpower" di **Ron Design Lab**
(`@rondesignlab`). Sono la fonte primaria della direzione visiva.

**Cosa prendiamo — la logica, non la pelle:**

| Elemento | Come entra nel progetto |
|---|---|
| Tela grigio-calda, superfici bianche | `--color-background-body: #E8E7E4` · card `#FFFFFF` |
| Squircle ampi | `--radius-container: 32px` |
| Un solo accento, usato pochissimo | `--highlight` lime, ammesso solo come sfondo |
| Cifre display sovradimensionate | `DisplayNumber` — a scala estrema, non a matrice di punti (vedi sotto) |
| Card a gradiente mesh con grana | `MeshSurface` |
| Timeline a punti sparsi | `DotScatterTimeline` |
| Contrasto tipografico estremo | label 11px ↔ display 80px |
| Controlli a pillola | override `button`/`textinput` nel tema |

**Cosa NON prendiamo:** il marchio "Superpower", i testi, il posizionamento
prodotto, la palette sanitaria. Sono lavoro altrui pubblicato: la usiamo come
direzione, non la riproduciamo.

**Dove divergiamo, e perché.**

1. **Densità.** I riferimenti mostrano ~10 dati per schermata; il bilancio
   comunale ne ha centinaia. L'ariosità è adottata per le viste civiche e
   **ridotta** nelle viste dati (`DESIGN.md` §6).
2. **La tinta mesh codifica un dato.** Nei riferimenti decora; qui su una
   piattaforma pubblica un colore che sembra dire qualcosa deve dirlo davvero.
3. **Niente cifre a matrice di punti** (deciso il 2026-07-25). Erano l'elemento
   più riconoscibile dei riferimenti, ma andavano contro il requisito primario
   di questa piattaforma: un importo di bilancio deve essere leggibile prima che
   memorabile. Sostituite da `DisplayNumber`, che ottiene la stessa
   riconoscibilità con la **scala** invece che con un espediente.
4. **Superfici a vetro invece che a pannello.** I riferimenti usano bianco pieno
   su ombra diffusa; qui le card sono materiali translucidi in stile Apple, e
   l'elevazione si comunica con la translucenza invece che con un alone.

> **Quando usarla:** ogni volta che decidi forma, spazio o densità. È il
> riferimento visivo di default.

---

## 1. Astryx — `astryx.atmeta.com`

Design system open source di Meta (React + StyleX, ~160 componenti, in Beta).
**È la libreria di componenti e la sorgente dei token del progetto.**

### Perché regge il peso

- I temi sono **CSS custom properties**: StyleX non serve per usarlo.
- `defineTheme()` espone esattamente gli assi che ci servono: `color`
  (accent, neutralStyle, contrast), `typography.scale`, `radius`
  (base × moltiplicatore), `motion` (durate).
- `astryx theme build` produce **CSS statico**: unica strada sotto la CSP con
  nonce, e niente flash all'hydration.
- Token di data-viz inclusi (`--color-data-*`, categorici e rampe sequenziali).
- Tassonomia dei componenti di prim'ordine: Action · Chat · Container · Content ·
  Data Input · Feedback & Status · Layout · Navigation · Overlay · Table & List.
- CLI e MCP pensati per gli agenti (`astryx component <Nome>` documenta props,
  token e punti di theming).

### Le tre trappole, già pagate

1. **Il provider `<Theme>` rompe il tema scuro.** Applica `color-scheme` sul
   proprio wrapper; appena diverge da `<html>` tutte le `light-dark()` dei
   discendenti si risolvono sul ramo sbagliato. Non lo usiamo.
2. **Il ponte Tailwind ufficiale collide con la nomenclatura dell'app.**
   `--color-muted` è uno sfondo per Astryx, un colore di testo qui. Non lo
   importiamo; prendiamo i token a mano.
3. **`.astryx-button` & co. non esistono ancora in 0.1.8**, benché documentati.
   Per il CSS esterno restano solo le classi atomiche StyleX, instabili: usa gli
   override di componente in `defineTheme`, non selettori CSS.

### Costo reale, misurato

`astryx.css` 127 KB (22,6 KB gzip) + tema 11 KB (2,2 KB gzip) ≈ **25 KB gzip**
di CSS. StyleX è peer dependency obbligatoria ma non richiede plugin di build:
il `dist` è precompilato. Verificato: `next build` passa su tutte le rotte senza
alcuna configurazione di bundler.

> **Quando usarla:** per ogni primitiva di interfaccia (bottoni, campi, tabelle,
> overlay, navigazione) e per ogni token di sistema. Prima di scrivere un
> componente nuovo, controlla se Astryx ce l'ha già: `npm run astryx component`.

---

## 2. Motion — `motion.dev`

Già in progetto (v12). **È il sistema di animazione predefinito.**

- **L'unica libreria che porta le animazioni legate allo scroll sulla
  ScrollTimeline nativa** del browser: accelerazione hardware, nessun lavoro
  per frame sul thread principale. È la ragione tecnica per cui resta la scelta
  di default, non l'abitudine.
- `IntersectionObserver` in pool per `whileInView`: costo trascurabile anche con
  molti elementi.
- Molle di default sulle proprietà fisiche (`x`, `scale`), tween sulle visive
  (`opacity`).
- `layout` e `layoutId` per le transizioni a elemento condiviso (lista → dettaglio).
- `AnimatePresence` per le uscite.

**Attenzione**: `useInView` con `once: true` lascia il contenuto a `opacity: 0`
finché non entra in vista. In stampa non entra mai — per questo esiste la regola
`@media print` su `[data-motion-reveal]` in `globals.css`.

> **Quando usarla:** per tutto ciò che è React — ingressi, gesti, presenza,
> layout, scroll. È il default; le altre librerie di animazione vanno motivate.

---

## 3. Anime.js — `animejs.com`

v4, modulare, 24,5 KB completo (Timer 5,6 · Animation 5,2 · Draggable 6,4).
API: `animate()`, `createTimeline()`, `stagger()`, `createSpring()`,
`createDraggable()`, `onScroll()`, utility SVG, adattatore WAAPI.

**Non sostituisce Motion.** Fa cose che Motion non fa bene:

- **morphing SVG** e disegno di tracciati (`stroke-dashoffset`);
- **motion path** (seguire una traiettoria — utile per i percorsi sulla mappa);
- **stagger su griglia** con origine (`stagger(50, {grid, from: 'center'})`);
- fisica del drag.

Usi previsti e nessun altro: disegno dello stemma, morph delle celle del
treemap, animazione dei percorsi sulla mappa.

> **Quando usarla:** solo per lavoro nativamente SVG che Motion renderebbe
> contorto. Se stai animando un componente React, stai sbagliando libreria.

---

## 4. bklit — `bklit.com`

Registry shadcn di componenti di data-viz: 17 tipi di grafico (area, barre,
linea, torta, radar, anello, dispersione, candlestick, coropletica, composto,
imbuto, gauge, heatmap, **sankey**, sunburst, linea live, profit/loss) più
utility (legenda, griglia, tooltip, brush, assi, `useChart`) e uno **Studio**
visuale con export video.

**Non adottata**, e la ragione è puramente strutturale: `npx shadcn add
@bklit/...` presuppone shadcn/ui installato. Questo progetto ha scelto Astryx
come strato di primitive; montarci sopra shadcn significherebbe due sistemi di
token e due convenzioni di styling sullo stesso schermo.

**Resta la fonte di riferimento per il *repertorio*.** In particolare il
**sankey** è il candidato naturale per "dove scorrono i soldi" (entrate →
missioni → programmi), che un treemap non racconta. Se un giorno servirà, la
strada è portarlo a mano sui token Pistoia, non importare il registry.

> **Quando usarla:** come catalogo, quando devi scegliere *quale* grafico
> risponde a una domanda. Per l'implementazione, guarda prima Astryx e i
> componenti custom in `src/components/signature/`.

---

## 5. Kokonut UI — `kokonutui.com`

100+ componenti, registry shadcn (`npx shadcn add @kokonutui/<nome>`),
Tailwind + Motion + shadcn/ui, gratuito e open source. Estetica vetro,
gradienti, molto curata.

**Non adottata**, stessa ragione di bklit: dipende da shadcn/ui.

Resta utile come **campionario di micro-interazioni** — card che si girano,
barre di ricerca con azioni, filtri a vetro. Sono pattern replicabili con Motion
in poche righe, senza portarsi dietro un secondo design system.

> **Quando usarla:** quando cerchi *come si comporta* un componente
> (tempi, stati, feedback), non il suo codice.

---

## 6. React Bits — `reactbits.dev`

Catalogo molto ampio: ~23 animazioni di testo, ~30 animazioni, ~40 componenti,
~45 sfondi. Copia-incolla, con dipendenze **per componente**.

**Il punto che decide tutto: le dipendenze.**

| Famiglia | Dipendenza | Verdetto |
|---|---|---|
| Animazioni di testo (`SplitText`, `ScrollReveal`…) | **GSAP** + `@gsap/react` | ❌ duplicherebbe Motion |
| Sfondi (`Liquid Ether`, `Galaxy`, `Aurora`…) | **WebGL / OGL / three.js**, 100 KB+ | ❌ vietati |
| Componenti (`AnimatedList`, `SpotlightCard`…) | Motion, o nulla | ⚠️ da riscrivere, non incollare |

Il divieto sugli sfondi WebGL non è estetico: è un servizio pubblico che deve
funzionare su telefoni vecchi e con batteria bassa. Uno sfondo che gira a 60fps
sulla GPU è una tassa che il cittadino non ha scelto di pagare.

**Cosa abbiamo preso davvero:** l'*idea* di quattro componenti-firma, riscritti
da zero senza dipendenze — `DotMatrixNumber`, `MeshSurface`,
`DotScatterTimeline`, `ScrollTold`.

> **Quando usarla:** per l'ispirazione sui componenti-firma. Prima di
> incollare qualunque cosa, controlla la riga "Dependencies" del componente.

---

## 7. Refero Styles — `styles.refero.design`

Catalogo di 2.000+ design system leggibili da un agente, estratti da prodotti
reali: palette, tipografia, spaziature, linee guida dei componenti, ciascuno con
un `DESIGN.md` pronto da dare in pasto a uno strumento di codice.

Non è una dipendenza: è **strumento di ricerca**.

> **Quando usarla:** all'inizio di una nuova sezione, per vedere come tre o
> quattro prodotti seri hanno risolto lo stesso problema — prima di inventare.
> Non per copiare un sistema intero: quello di Pistoia esiste già ed è in
> `DESIGN.md`.

---

## 8. Uiverse — `uiverse.io`

Migliaia di elementi CSS/Tailwind di comunità (bottoni, card, input, loader,
tooltip, toggle), licenza MIT.

Qualità e autorialità **disomogenee**: ogni elemento ha convenzioni, unità e
palette proprie. Incollarne tre significa avere tre sistemi in miniatura dentro
il proprio.

> **Quando usarla:** solo come ispirazione, per sbloccarsi su un'interazione
> minuta. Mai incollata dentro il progetto: qualunque elemento va rifatto sui
> token di Pistoia.

---

## 9. La regola che tiene insieme tutto

Le fonti hanno un ordine di precedenza. In caso di conflitto vince la più alta:

1. **`DESIGN.md`** — il sistema di Pistoia
2. **`refs/*.jpg`** — la direzione visiva
3. **Astryx** — componenti e token
4. **Motion** — comportamento
5. Tutto il resto — idee, mai codice

E una domanda sola davanti a ogni componente animato o decorativo:

> *Questo aiuta un cittadino a capire i dati della sua città, o aiuta me a
> sembrare bravo?*

Se la risposta è la seconda, non entra.
