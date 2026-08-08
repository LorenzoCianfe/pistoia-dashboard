# Design — Dashboard di Pistoia

> Direzione estetica e linguaggio visivo della piattaforma. Questo documento è
> la fonte di verità per ogni decisione di design: se una scelta visiva non è
> coerente con quanto scritto qui, o si corregge la scelta o si aggiorna
> (consapevolmente) questo documento.
>
> Ultime revisioni: **2026-08-07** (§6 *una coda è una lista, e il lavoro è una
> pagina*: la riga compatta è 69px contro i 323 del modulo, e il dettaglio è
> costante) · **2026-08-07** (§6 le quattro nature messe alla prova
> eseguendo il taglio di `/admin`: il cruscotto non ripete la navigazione delle
> figlie, e una riga che va a capo costa 96px a 1280 e 200 a 375) · **2026-08-07**
> (§11.6 **diventa un cancello bloccante** e
> corregge la propria motivazione misurandola) · **2026-08-06** (§4 corollario
> dei tre centesimi, §6 la chiusura è un oggetto, §11.6 riscritta con le
> quattro eccezioni) · **2026-08-05** (§4 tavolozza chiara scurita per AA).
>
> **Revisione 2026-07-25 — direzione ibrida.** Struttura visiva dai riferimenti
> in `refs/`, significato dall'identità civica di Pistoia. Le decisioni sono
> tracciate in `DISCOVERY.md`; le fonti in `REFERENCES.md`.
>
> I token vivono in `pistoia-dashboard/src/themes/pistoia.ts` (sistema) e in
> `src/app/globals.css` (estensioni Pistoia).

---

## 1. Carattere: civica, toscana, contemporanea

La Dashboard di Pistoia rappresenta un'istituzione. Il suo design deve
trasmettere tre cose, in quest'ordine:

1. **Affidabilità** — è il Comune che parla: ordine, gerarchia chiara, niente
   effetti gratuiti.
2. **Vicinanza** — è al servizio dei cittadini, non sopra di loro: toni caldi,
   linguaggio umano, forme morbide.
3. **Cura** — una piattaforma curata comunica che la città è curata: ogni
   dettaglio (stati vuoti, caricamenti, errori) è disegnato, mai lasciato al caso.

**In una frase:** *l'eleganza sobria di un palazzo comunale toscano, con la
leggibilità di un prodotto digitale moderno.*

Non è: un social network, una startup SaaS, un sito vetrina turistico, un
template Tailwind. Quando un pattern sembra "già visto su dieci dashboard", è il
segnale per ridisegnarlo.

---

## 2. La direzione ibrida

Due sistemi convivono, con ruoli separati e non intercambiabili.

| | Da `refs/` | Da Pistoia |
|---|---|---|
| **Porta** | la forma | il significato |
| Tela grigio-calda | ✅ | |
| Superfici chiare a squircle | ✅ | rese a vetro, non a pannello |
| Un solo accento, usato pochissimo | ✅ | |
| Cifre display sovradimensionate | ✅ | |
| Gradienti mesh con grana | ✅ | la tinta codifica un dato |
| Rosso dello stemma | | ✅ brand e urgenza |
| Semantica dei colori di stato | | ✅ |
| Scacchiera, fasce romaniche, verde dei vivai | | ✅ |
| Lingua e registro civico | | ✅ |

**Perché ibrida e non pura.** La sola forma dei riferimenti darebbe
un'interfaccia bella e anonima: potrebbe essere di qualunque città, o di
nessuna. La sola identità precedente darebbe una piattaforma riconoscibile ma
datata. La regola operativa: **i riferimenti decidono come appare, Pistoia
decide cosa significa.**

---

## 3. I tre motivi identitari

Il design attinge a tre simboli reali di Pistoia. Sono il vocabolario decorativo
della piattaforma: ogni ornamento deve derivare da uno di questi, mai da pattern
generici.

| Motivo | Origine | Uso nella UI |
|---|---|---|
| **La scacchiera** | Lo stemma comunale, bianco e rosso scaccato | Momenti di brand: crest, favicon, Civic ID Card. Il rosso `--color-error` è *il* rosso dello stemma: riservato a brand ed errore/urgenza, mai decorativo |
| **Le fasce romaniche** | Il marmo a fasce di San Giovanni Fuorcivitas | Ritmo orizzontale: separatori, pattern tenui negli hero e negli empty state. Sempre a contrasto minimo (`.bande-romaniche`) |
| **La città verde** | Pistoia capitale europea dei vivai | Il verde-acqua `--color-accent` è il colore "vivo" della piattaforma: azioni, progressi, dati che crescono |

---

## 4. Colore

La tela è **grigio-calda**, le superfici sono **bianche**. È l'inversione
rispetto alla versione precedente (fondo quasi-bianco) ed è la scelta
strutturale che porta tutto il resto: su un fondo grigio le card bianche si
leggono come oggetti appoggiati, non come "il foglio".

### Ruoli (non negoziabili)

| Token | Significato | Esempi |
|---|---|---|
| `--color-accent` `#0A756B` | **Azione e vita**: il colore primario | CTA, link, focus, progressi |
| `--highlight` `#D9F312` | **Evidenza decorativa** | Chip, pallini "live", maniglie. **Mai testo, mai icone** |
| `--color-error` `#D63A57` | **Brand e urgenza** (rosso dello stemma) | Crest, errori, segnalazioni urgenti |
| `--color-success` | **Risolto / completato** | Esiti positivi, segnalazioni chiuse |
| `--amber` | **Attenzione e attesa** | "In valutazione", avvisi non critici |
| `--viola` | **Partecipazione e comunità** | Proposte, sondaggi, badge civici |

### La regola del lime

Il lime è l'elemento più riconoscibile dei riferimenti ed è anche il più facile
da usare male. Su bianco fa **1,1:1**: come testo o icona è illeggibile.

- ✅ sfondo di chip, con `--highlight-ink` sopra (15,8:1)
- ✅ pallini di stato, maniglie di slider, punti in un grafico
- ❌ testo, icone, bordi, link — in nessun tema

Per costruzione esiste `bg-highlight` ma **non** `text-highlight`.

### Altre regole

- **Un colore dominante per schermata.** Le pagine non sono arcobaleni.
- I colori `-soft` sono gli unici ammessi come sfondi di badge/chip; il colore
  pieno va su testo/icone/bordi.
- **Contrasto WCAG AA ovunque, AAA sul body.** Verificato **da una macchina**,
  a ogni esecuzione degli E2E (`tests/e2e/accessibilita.spec.ts`, axe-core sulle
  regole `wcag2aa`/`wcag21aa` **e `wcag22aa`**, undici pagine in entrambi i temi
  — comprese le superfici di lavoro dello staff, entrate il 2026-08-06).

> **Revisione del 2026-08-05 — la tavolozza chiara è stata scurita, e perché.**
> Questa riga diceva «già verificato: non si regredisce». La verifica era stata
> fatta **a mano, una volta**, e **non reggeva**: alla prima misura automatica
> il tema chiaro falliva AA in quattro punti, tutti di tavolozza e non di
> pagina.
>
> | Token | Prima | Dopo | Che cosa non passava |
> |---|---|---|---|
> | teal (`--color-accent`) | `#0E9F92` | **`#0A756B`** | 2,66:1 come testo sulla tela (**i link**) e 3,28:1 col bianco sopra (**il pulsante primario**) → 4,50:1 e 5,57:1 |
> | `--muted-2` | `#85888c` | **`#65686c`** | 2,88:1 sulla tela — il grigio più usato, e il difetto più diffuso → 4,53:1 |
> | `--color-text-secondary` | `#6B6E72` | **`#5A5D61`** | 4,14:1, appena sotto → 5,35:1 (e lascia spazio al livello sotto) |
> | `--viola` | `#8a7bf0` | **`#675cb4`** | 2,43:1 sul proprio chip `-soft` → 4,61:1 |
> | `--amber` | `#d98324` | **`#965a19`** | 2,48:1 sul proprio chip `-soft` (la pastiglia «Anteprima», 11px) → 4,75:1 |
>
> Ogni valore nuovo è **il più chiaro** che superi 4,5:1: la tinta resta quella,
> cambia la profondità. **Il rosso dello stemma e il verde non sono stati
> toccati**: la misura non li ha segnalati, e il rosso è identità prima che
> colore. Il **tema scuro non è stato toccato**: lì il contrasto passava già —
> il debito era tutto del chiaro.
>
> Ne discende una regola: **i `-soft` come sfondo di chip funzionano solo se il
> colore pieno è abbastanza profondo.** La coppia colore/`-soft` va misurata
> quando si aggiunge una tinta, non dopo.
>
> **Corollario, pagato il 2026-08-05 ridisegnando il footer.** I valori nuovi
> sono per costruzione *il più chiaro che superi 4,5:1*, quindi alcuni passano
> per pochissimo: `--muted-2` sulla tela fa **4,53:1**, tre centesimi sopra la
> soglia. Una proposta di footer col motivo delle fasce romaniche al 3,5%
> portava la tela da `#E8E7E4` a `#E1E0DD` — una tinta che a occhio non
> esiste — e con essa `--muted-2` a **4,24:1**: sotto soglia intestazioni,
> dichiarazione e colophon insieme. **Un token che passa per tre centesimi non
> sopravvive a nessuno sfondo tinto**: sopra un motivo, anche tenue, il testo
> secondario sale di un grado (`--color-text-secondary`, 5,01:1 sulla stessa
> banda). All'opposto il vetro *aiuta*: sulla superficie delle card
> `--muted-2` risale a 5,28:1.

- **Un link dentro la prosa non si distingue solo per il colore** (WCAG 1.4.1).
  Dentro un `<p>` i link sono **sottolineati sempre**, non solo al passaggio del
  mouse — che non esiste per chi naviga da tocco o da tastiera. La regola vive
  in `globals.css`, layer `pistoia`, a specificità zero. **Solo nella prosa**:
  nelle liste ogni riga è un link a tutta scheda, e sottolinearla la farebbe
  sembrare testo invece che un oggetto da toccare.
- Il gradiente teal→viola resta ammesso in **un** momento per pagina al massimo.

---

## 5. Tipografia

| Ruolo | Font | Uso |
|---|---|---|
| **Voce** | **Schibsted Grotesk** | Tutta la piattaforma. Grottesco di matrice editoriale, disegnato per la lettura di interesse pubblico |
| **Dati tecnici** | **JetBrains Mono** | Protocolli, coordinate, timestamp, importi tabellari |
| **Display** | Schibsted Grotesk, peso 300–400, tracking stretto | Numeri protagonisti e titoli di pagina |

Sostituisce Montserrat (revisione 2026-07-25): le forme geometriche larghe di
Montserrat erano il motivo principale per cui l'interfaccia si leggeva come un
template.

**La regola del contrasto.** La gerarchia si afferma con la **dimensione**, non
con il peso: label 11px in `600` uppercase contro display 80px in `300`. È
l'opposto della regola precedente ed è voluto.

- Scala modulare nei token (`--text-*`, base 15px, ratio 1,25). Niente
  `font-size` arbitrari nelle pagine.
- `font-variant-numeric: tabular-nums` ovunque le cifre si confrontino.
- Lingua: italiano, registro del "tu" civico — diretto ma mai confidenziale
  ("Segnala un problema", non "Dicci cosa non va!").

---

## 6. Spazio, forma, elevazione

- **Raggio.** Scala Astryx, base 6 × moltiplicatore 1,75:
  `--radius-inner` 10,5px (campi interni) · `--radius-element` 21px ·
  `--radius-container` **32px** (card) · `--radius-full` (bottoni, chip).
  Mai spigoli vivi, mai raggi misti nella stessa gerarchia.
- **Elevazione = vetro, non alone** (revisione 2026-07-25). Le card sono
  **materiali in stile Apple**: superficie translucida (72% chiaro / 76% scuro),
  `backdrop-filter: blur(24px) saturate(180%)`, filo di luce interno sul bordo
  superiore, bordo capello. **Niente ombre diffuse**: l'elevazione si comunica
  con la translucenza e col filo, non con un bagliore attorno alla card.

  La *saturazione* non è un vezzo: sfocare rende il fondo indistinto ma lo
  sbiadisce, e il boost restituisce il colore che la sfocatura toglie. È il
  dettaglio che separa il vetro vero dal "bianco trasparente".

  Il vetro ha bisogno di **materia da sfocare**: la tela porta una grana
  finissima (`--canvas-grain-opacity: 0.045`) proprio per questo. Senza,
  `backdrop-filter` non ha nulla su cui lavorare e la card translucida è
  indistinguibile da un pannello opaco.

  Contrasto verificato: **16,8:1 (chiaro) e 16,0:1 (scuro)** — AAA in entrambi.
  Il vetro non costa leggibilità perché è denso e la tela è di tono vicino.
- **Densità.** Aria generosa di default; **la densità aumenta solo nelle viste
  dati** (bilancio, admin). I riferimenti sono ariosi perché mostrano ~10 dati
  per schermata: il bilancio ne ha centinaia, e copiare l'ariosità lì sarebbe
  copiare la forma ignorando il contenuto.
- **Modalità semplice.** Tutto scala al 115%: ogni layout deve sopravvivere a
  quel test.
- **Anche la chiusura è un oggetto** (revisione 2026-08-05). Il footer era
  l'unico punto in cui la pagina *finiva*, con un filo da 1px: adesso è una
  `card` appoggiata sulla tela come ogni altra superficie. La scelta è di
  materiale e non di ornamento — è §4 applicata al fondo pagina, e ha un
  effetto misurabile sulla leggibilità: sul vetro il testo secondario guadagna
  quasi un punto di contrasto rispetto alla tela.

  Da qui una regola di innesto: **la scheda non si centra e non si impagina da
  sé.** Decide il contenitore che la ospita — in `(legal)` un involucro
  apposta. Rimetterci dentro un `mx-auto max-w-6xl px-4` raddoppierebbe il
  padding degli antenati.

  **Il contenuto invece ha un tetto di 850px, deciso il 2026-08-07 e misurato.**
  Portando il footer fuori da `<main>` (2026-08-06, forma «a tutta larghezza»)
  la scheda è passata a ~1100px dentro `AppShell`: una larghezza a cui il
  footer **non era mai stato guardato**, e a cui `justify-between` apriva
  **446px di vuoto** fra l'identità — tetto di 320px, che è la misura di
  lettura scelta il 05/08 — e le colonne dei link appese al bordo destro. Su
  ogni pagina della piattaforma.

  850px non è scelto a occhio: è **la colonna di `main` dentro `AppShell`**,
  cioè la larghezza a cui questo footer è stato disegnato e verificato quando
  ci viveva dentro. Il tetto sta sulle due righe interne e non sulla scheda,
  così il vetro resta a tutta larghezza come deciso e la composizione torna
  dove funzionava: vuoto da 446 a **258px**, e sulle pagine legali (640px) non
  cambia nulla, perché il tetto è più largo del contenitore.

  **La regola generale, che è costata due volte in tre giorni:** quando si
  cambia *dove* vive un componente, cambia la sua larghezza — e le larghezze a
  cui è stato verificato non valgono più. `@container` risolve il *come* si
  adatta, non il *se* qualcuno l'ha guardato a quella misura.

- **Il `:hover` non è un canale, è un rinforzo** (2026-08-07). Tutto ciò che dice
  «questo si può premere» deve esserci **a riposo**: su un telefono il passaggio
  del mouse non avviene mai. `.btn-ghost` era il solo `color: var(--muted)`,
  cioè indistinguibile da del testo muto — **13 controlli su `/admin`**, fra cui
  le due azioni principali della lista delle valutazioni, tutti **già alti 44px**.
  Non era dimensione, era riconoscibilità: una categoria che nessun cancello
  automatico misura, e che si trova solo guardando.

  La scala delle varianti resta a **tre gradini** — primary pieno · secondary
  superficie + `--border-strong` · ghost trasparente + `--border` — perché
  alzarne uno non deve far collassare quello sopra. È la stessa lezione di
  `.btn-sm` salito a 44px, applicata alle varianti invece che alle taglie.

- **Le quattro nature di una superficie di lavoro** (decisa 2026-08-07, piano in
  [`docs/piano-admin.md`](docs/piano-admin.md)). `/admin` era diventata un
  cassetto — **dieci mestieri, 7.300px, nessun indice** — e la regola che lo
  impedisce d'ora in poi è:

  > **Una coda, una pagina · gli strumenti insieme · le letture sul cruscotto,
  > finché ci stanno · il registro è una lettura anche lui.**

  Non è una tassonomia per il gusto di averla: **una coda** (il lavoro arriva e
  tu lo smaltisci) vuole un **contatore** e vuole essere controllata; **uno
  strumento** (sei tu che decidi di usarlo) vuole essere **trovato**, e non deve
  mai avere un pallino. Metterli sulla stessa pagina è il motivo per cui `/admin`
  non sapeva dire se ci fosse qualcosa da fare.

  La quarta natura — **le letture** — è nata provando la regola contro l'Ondata
  8, non per completezza: *analytics operative* e il *monitor della pipeline*
  non sono né code né strumenti, e senza una casa dichiarata sarebbero finiti
  «dove capita», che è come il cassetto si era formato la prima volta.

  Due corollari vincolanti: **le impostazioni di una coda stanno sulla pagina di
  quella coda** (un `/admin/impostazioni` riforma il cassetto altrove), e **il
  contatore si chiede al database**, mai contando le righe che la pagina mostra
  (`AGENTS.md` §3, ondata 7, 2).

  **Eseguita il 2026-08-07**, e la resa ha aggiunto due regole misurate.

  *Il cruscotto non ripete la navigazione delle sue figlie.* Sulle sei
  sottopagine la navigazione è una riga di pastiglie; sul cruscotto **sono le
  sei schede**, con la descrizione e il contatore. Metterci anche le pastiglie
  sarebbe stato due elenchi della stessa cosa nella stessa schermata, e il
  secondo non avrebbe aggiunto una destinazione.

  *Una riga che va a capo costa, e il costo si dichiara* (decisione di Lorenzo,
  2026-08-07, presa sulle schermate). Sette pastiglie da ~120px non stanno negli
  852 della colonna di `main`: **96px su due righe** a 1280, **200px su quattro**
  a 375, **sette righe** a 360 in modalità semplice. Togliere le icone non basta
  a guadagnare una riga (859px contro 852, misurato) — è il numero di voci, non
  l'ornamento.

  Si paga, e la ragione non è la rinuncia: su telefono quei 200px **non sono solo
  navigazione**. I cinque contatori si leggono tutti insieme senza scorrere,
  quindi la riga è anche il riepilogo di quanto lavoro c'è — che su una
  superficie di lavoro è metà dell'informazione. Le due alternative misurate e
  scartate, perché nessuno le riproponga: una **striscia che scorre di lato**
  (44px invece di 200, ma due o tre destinazioni fuori schermo *coi loro
  contatori*), e **togliere «Cruscotto» dalle pastiglie** portandolo a un
  «← Area Comune» sopra il titolo (da 200 a 148px, cioè poco per una porta in
  meno).

- **Una coda è una lista, e il lavoro è una pagina** (decisa 2026-08-07 da
  Lorenzo sui mockup, eseguita lo stesso giorno). È la seconda metà della regola
  qui sopra: *una coda una pagina* dice **dove** sta una coda, questa dice **di
  che cosa è fatta**.

  > **La riga porta alla voce, e il lavoro sta sulla pagina della voce.
  > Su desktop la lista resta a fianco; sotto ~1024px c'è solo il lavoro, col
  > ritorno alla coda.**

  La ragione è una misura, non un gusto: una coda fatta di **moduli di lavoro
  impilati** cresce di ~320px per ogni voce — il triage faceva **4.680px** con
  le quattordici segnalazioni del seed — mentre la **riga compatta è 69px**, e
  soprattutto **il dettaglio è costante**: 864px con quattordici voci in coda o
  con quattrocento. È l'unica altezza dell'area che non dipende da quanto lavoro
  c'è.

  Il riquadro che scorre non sparisce, cambia mestiere: limita **la lista**, mai
  il lavoro. Nel triage limitava i moduli, cioè teneva 12 voci su 14 fuori vista
  facendo sembrare corta una pagina che non lo era.

  **Due prezzi, dichiarati.** L'indice di una coda lunga *cresce*: le
  segnalazioni passano da 896 a 1.416px e le valutazioni da 1.114 a 2.539 — ma
  gli 896 nascondevano dodici voci e i 1.114 ne mostravano **6 su 32**. Una
  lista lunga dice la verità sulla coda; un riquadro che scorre la nasconde.

  Il corollario tecnico, che è già costato due volte: **la riga vive a due
  larghezze** — ~804px sull'indice e **304** nella colonna del dettaglio —
  quindi si adatta con `@container`, mai con `sm:`/`lg:`. È lo stesso caso del
  footer (2026-08-05), e la regola generale è tre paragrafi più su: quando
  cambia *dove* vive un componente, le larghezze a cui è stato verificato non
  valgono più.

---

## 7. Motion

Il movimento comunica che la città è viva — ma è un'istituzione che si muove:
sobria, mai giocosa. **Livello 3 su 5**: sicura e orchestrata, mai ambientale.

| Principio | Regola |
|---|---|
| **Durate** | 150ms micro · 250ms standard · 400ms scena. Mai oltre 500ms |
| **Easing** | `cubic-bezier(0.22, 1, 0.36, 1)` per gli ingressi. Mai bounce, mai elastic |
| **Ingresso pagina** | Una sola orchestrazione: titolo → contenuto → dettagli, stagger 40–60ms |
| **Transizioni di rotta** | Elemento condiviso per lista → dettaglio; cross-fade altrove. **View Transitions native**, non `layoutId` — vedi sotto |
| **Scroll** | Rivelazione una tantum. **Una sola** sezione narrata per pagina. Nessun parallax |
| **Micro-interazioni** | Tre soli momenti di festa: invio segnalazione, firma proposta, segnalazione risolta |
| **Dati** | I numeri contano da 0 una volta; i grafici si disegnano una volta sola |
| **Reduced motion** | `prefers-reduced-motion` annulla tutto. Non negoziabile |

**Librerie.** Motion per tutto ciò che è React. Anime.js solo per lavoro
nativamente SVG. Nessun GSAP, nessuno sfondo WebGL — vedi `REFERENCES.md` §6.

### L'elemento condiviso non si fa con `layoutId` (revisione 2026-07-25)

Questo documento prescriveva `layoutId` di Motion. **Non funziona qui**, e la
ragione è architetturale: nell'App Router la lista si smonta prima che il
dettaglio monti, quindi i due elementi non stanno mai nello stesso albero React
e `layoutId` non ha nulla da interpolare.

`<ViewTransition>` di React copre l'altro mestiere — il **cross-fade** fra
pagina vecchia e nuova — ed è quello che avvolge `(app)/template.tsx`. Non sa
però fare il morph di un elemento che cambia rotta, per la stessa ragione
architetturale di sopra: quando arriva il gemello, l'originale non esiste più.

> **Aggiornato il 2026-08-05 (Next 16.3.0).** Questo paragrafo diceva che
> `<ViewTransition>` «non è disponibile» perché in Next 16.2.7 il flag
> `experimental.viewTransition` non commutava React sul canale experimental.
> **Il flag non esiste più**: da 16.3 l'integrazione dell'App Router è attiva di
> default ed è uscito dallo schema di configurazione — rimetterlo in
> `next.config.ts` fa fallire il typecheck. Verificato anche che
> `needsExperimentalReact()` non ha **mai** guardato quel flag (in 16.3 aggiunge
> `blockingSSR` a `taint`, `transitionIndicator`, `gestureTransition`): il
> componente arriva dalla build canary che l'App Router usa da sé, coi tipi in
> `src/types/react-canary.d.ts`.

Per il morph si usa quindi **l'API nativa del browser, a mano** — `view-transition-name` più
`document.startViewTransition()` attorno alla navigazione. Le tre regole che ne
derivano:

1. **Un solo nome per volta.** Il `view-transition-name` si assegna alla card
   cliccata al momento del clic e si toglie a transizione finita. Nominare tutte
   le card della lista farebbe fotografare e animare venti elementi.

   Da qui discende che il nome è **uno solo per tutta l'applicazione**
   (`NOME_CONDIVISO`), non uno per entità: se non possono coesistere, non serve
   distinguerli. E c'è un motivo pratico più forte — `::view-transition-*` vuole
   il nome *letterale* e non accetta una variabile CSS, quindi un nome per
   entità obbligherebbe a elencarle tutte in `globals.css`. La prima che si
   dimenticasse di aggiungersi morferebbe con durata e curva di default: un
   difetto silenzioso, che è la categoria che qui costa di più. Resta per
   entità il solo **attributo del gemello**, perché è il segnale che dice alla
   transizione che è arrivato il dettaglio *giusto*.
2. **Saltare la transizione è normale.** L'oggetto `ViewTransition` rigetta
   *tutte e tre* le sue promesse (`ready`, `finished`, `updateCallbackDone`)
   quando il browser rinuncia: vanno gestite tutte, o diventano errori in
   console per un caso previsto.
3. **Degrada, non si rompe.** Le View Transitions same-document stanno sopra la
   soglia di `browserslist` (Safari 18+, Firefox 144+): sotto, la navigazione
   resta uno scambio istantaneo. Per questo la transizione non porta mai
   informazione.

Il meccanismo sta in `components/app/shared-element-link.tsx`, parametrico
sull'entità; i wrapper per segnalazioni, opere, proposte e quartieri aggiungono
solo la forma dell'URL. I nomi stanno in `lib/view-transitions.ts` — un modulo
**neutro** di proposito: in un file `"use client"`, un Server Component che li
importa riceve riferimenti client invece di stringhe, e l'aggancio sparisce dal
DOM senza un errore.

---

## 8. I quattro componenti-firma

Vivono in `src/components/signature/`. Nessuna dipendenza aggiuntiva.

### `DisplayNumber`
Cifra display. **Una sola per schermata** — se ce ne sono due, nessuna è
protagonista.

Il principio: la memorabilità viene dalla **scala**, non da un espediente
grafico. Label 11px in peso 600 contro cifra 88px in peso **300** — il peso va
nella direzione opposta a quella istintiva, ed è ciò che impedisce alla cifra di
sembrare uno slogan urlato e le dà il tono di un dato.

Il numero è **testo vero**: selezionabile, cercabile, copiabile, leggibile da
qualunque tecnologia assistiva, senza equivalenti nascosti da mantenere
allineati.

Corredo, tutto **opzionale** — va aggiunto solo quando dice qualcosa, perché un
numero circondato da quattro decorazioni non è più leggibile di uno nudo:
- **unità accanto**, non dentro ("129" è il dato, "mln €" è il contesto);
- **scala a tacche**, dove cade il valore in un intervallo *reale* (una scala
  inventata è peggio di nessuna scala). La tacca attiva è più alta e piena:
  si trova senza bisogno di colore, quindi funziona in scala di grigi;
- **delta** con freccia e periodo;
- **micro-sparkline** accanto.

Entra contando da zero (≤900ms, `tabular-nums` per non far ballare la
larghezza). Taglia `md` per le card di stato e le superfici mesh.

> *Sostituisce la cifra a matrice di punti (revisione 2026-07-25). La matrice
> era l'elemento più riconoscibile dei riferimenti ma andava contro il
> requisito primario di questa piattaforma: un importo di bilancio deve essere
> leggibile prima che memorabile.*

### `MeshSurface`
Superficie a gradiente mesh con grana. **La tinta codifica un dato**: `good` /
`warn` / `bad` derivano da una percentuale, `cool` è il neutro da usare quando la
superficie non rappresenta una salute — così il verde non viene letto come "va
tutto bene" per caso.

**Che cosa può starci sopra** (misurato, non stimato). L'inchiostro è il nero
caldo `--highlight-ink`, impostato dalla classe `.mesh-surface`: il bianco
sparisce sugli stop chiari — su `--mesh-cool-a` fa 1,8:1. Con quell'inchiostro:

| Tono | Contrasto (stop chiaro → scuro) | Cosa può ospitare |
|---|---|---|
| `cool` | 9,6:1 → 4,6:1 | anche testo corrente |
| `good` · `warn` | ~11:1 → ~5,7:1 | anche testo corrente |
| `bad` | 9,5:1 → **3,3:1** | **solo testo grande** (≥24px, o ≥18,7px in grassetto) |

Regola operativa: sotto una superficie mesh il testo minuto non ci va, e la
frase di spiegazione sta **fuori**, sulla tela. Vale anche per la cifra display,
che infatti su queste pagine vive sul vetro (16,8:1 chiaro / 16,0:1 scuro).

**La mesh è anche lo slot della fotografia** (risposta a DISCOVERY D7, ondata 7).
Sui Quartieri ogni scheda porta una fascia mesh dove una foto del quartiere
starebbe, con il solo nome sopra a 24px: la tinta è il tasso di risoluzione di
quell'area. Molte superfici sulla stessa pagina non violano «un colore dominante
per schermata» proprio perché lì il colore **è il dato** — è una mappa
coropletica, non una decorazione ripetuta (§9). Quando arriveranno immagini
reali e con licenza, entreranno in quella cornice senza rifare il resto; finché
non arrivano, l'astratto è l'unica scelta onesta, perché oggi ogni immagine
dell'app è un SVG generato dal seed.

E una controregola: **la mesh non si mette dove il dato non è una salute.**
L'avanzamento medio dei cantieri sembra una salute e non lo è — un cantiere al
18% appena aperto è nuovo, non malato — perciò su Opere la tinta viene dalla
quota di cantieri che rispettano il proprio calendario, che una salute lo è
davvero. Dove nessun dato regge quel ruolo, si usa `cool` o non si usa la mesh.

⚠️ Il reset di Astryx dichiara `color` direttamente su `:where(h1…h6)` e
`:where(p)`: specificità zero, ma una dichiarazione sull'elemento batte sempre
un valore *ereditato*. Senza la regola `.mesh-surface :is(h1…h6, p) { color:
inherit }` in `globals.css`, un titolo dentro una mesh prende il colore del tema
— e nel tema scuro diventa bianco su azzurro chiaro. Il guasto non si vede nel
tema chiaro.

### `DotScatterTimeline`
Attività nel tempo: posizione = valore, diametro = intensità, colore = stato.
Da preferire alla spezzata quando i dati sono eventi discreti, dove una linea
suggerirebbe una continuità che non c'è. Attraversabile da tastiera con le
frecce, con tabella equivalente sempre presente.

### `ScrollTold` / `ScrollStep`
Sezione narrata dallo scroll, **una per pagina**, solo dove c'è un ragionamento
da accompagnare (il bilancio). Usa la ScrollTimeline nativa via Motion. Con
`prefers-reduced-motion` diventa statica e tutti i passaggi restano visibili.

---

## 9. Data-viz

I dati sono il cuore civico della piattaforma: la visualizzazione è
informazione, non ornamento.

- Palette dati dai token `--color-data-*`, ritinti sulla palette civica: il teal
  porta le quantità, il rosso dello stemma solo gli scostamenti negativi.
- Ogni grafico ha: un titolo che dice la **conclusione** (non "Spesa per
  missione" ma "Dove vanno i soldi"), fonte e freschezza (`SourceBadge`), e un
  **equivalente testuale** accessibile.
- Interazione: tooltip e approfondimento progressivo. Niente brush (ostile al
  tocco).
- Mai: torte 3D, doppi assi non dichiarati, assi tagliati che drammatizzano,
  legende che richiedono memoria.

---

## 10. Tema scuro

Il tema scuro è una **seconda lettura dello stesso luogo, di sera** — non
un'inversione.

- Tela near-black calda `#131211`, superfici che salgono per gradini `#1C1B1A`.
- Gli accenti si schiariscono di un grado; la semantica resta identica.
- Le ombre quasi spariscono: l'elevazione si comunica con i gradini di superficie.
- **Ogni componente nasce nei due temi insieme**: non esiste "poi lo adattiamo
  al dark". Il meccanismo è `light-dark()` guidato da `html[data-theme]` —
  attenzione a non impostare `color-scheme` su elementi intermedi
  (vedi `AGENTS.md` §3).

---

## 11. Accessibilità (vincoli, non preferenze)

1. Contrasto AA ovunque, AAA sul body.
2. Tutto raggiungibile e usabile da tastiera; focus sempre visibile (`--ring`).
3. Stati comunicati anche senza colore (icona + testo, mai solo rosso/verde).
4. Live region per i cambi di stato asincroni.
5. La modalità semplice è un cittadino di prima classe: ogni feature nuova si
   verifica anche lì.
6. **Target touch ≥ 44px, con le quattro eccezioni di WCAG 2.5.8**
   (riscritta il 2026-08-06, decisione di Lorenzo).

   Un bersaglio dev'essere alto e largo **almeno 44px**, salvo che ricada in
   una di queste, che sono le stesse di WCAG 2.5.8 — si adotta l'elenco delle
   eccezioni, **non** la soglia, che qui resta 44 e non 24:

   | Eccezione | Quando vale |
   |---|---|
   | **Spaziatura** | Il bersaglio è più piccolo ma **isolato**: un cerchio da 44px centrato su di lui non tocca nessun altro bersaglio, né il cerchio di un altro bersaglio sottodimensionato. Due bersagli che si **sovrappongono** non sono mai isolati |
   | **Inline** | È dentro una frase, e la sua dimensione è vincolata dall'interlinea del testo attorno — un link nella prosa |
   | **Equivalente** | La stessa azione è raggiungibile da un altro comando sulla pagina che i 44px li rispetta |
   | **Essenziale** | La dimensione è imposta dalla natura di ciò che si tocca (un punto su una mappa, una parola dentro un testo legale) |

   **Perché la riscrittura.** Prima diceva «≥ 44px» e basta, e con quel metro
   sulle otto pagine del cancello risultavano **246 elementi fuori norma** —
   quasi tutti legittimi. Una regola violata 246 volte a ragione non è un
   vincolo, è un'aspirazione, e infatti i link del footer sono stati alti
   **16px** per mesi senza che nulla lo dicesse. Con le eccezioni la regola
   torna a descrivere ciò che davvero si pretende — **e diventa scrivibile come
   cancello**, che è il punto.

   ⚠️ **Una correzione a questa stessa nota, scritta misurando (2026-08-07).**
   Qui sopra c'era scritto che i 246 erano legittimi perché «link dentro la
   prosa, che a 44px spaccherebbero il testo». **Non è vero, ed è utile
   saperlo**: applicando le eccezioni una per una, l'inline ne salva **14 su
   436**. Quello che li salva quasi tutti è la **spaziatura** — 264 —, cioè
   l'isolamento, non la prosa. La conclusione regge, la ragione no; e la
   differenza conta, perché indica dove guardare quando un bersaglio piccolo
   diventa rosso: nove volte su dieci non è la sua dimensione, è che gli si è
   avvicinato qualcosa.

   ✅ **Il cancello esiste dal 2026-08-07**: `tests/e2e/bersagli.spec.ts`,
   undici pagine × due viewport (1280 e 360), **bloccante**, e con l'elenco
   delle esenzioni «essenziali» **vuoto** — nessun bersaglio della piattaforma
   ha bisogno di stare sotto i 44. Resta vero che il `target-size` di axe non
   lo sostituisce: applica le stesse eccezioni ma alla soglia di **24px**, e i
   16px del footer sarebbero passati anche lì, perché ben spaziati.

   **I due viewport, e perché nessuno dei due basta.** A 1280 esiste la barra
   laterale, che a 360 è sostituita da quella inferiore: ventuno bersagli che
   l'altra passata non vede mai. A 360 i moduli si impilano e vengono avanti
   controlli che a 1280 stanno larghi. Misurata la differenza: 158 rossi a 1280
   contro 147 a 360, e le due liste **non si contengono**.

   **Che cosa è costato metterla in regola** (i sette componenti che la
   violavano, chiusi tutti lo stesso giorno): la barra laterale ha allungato la
   colonna di ~95px, `.btn-sm` è salito a 44 e quindi «sm» vuol dire ormai
   *stretto* e non *basso*, i moduli di `/admin` sono tutti a `h-11`. E un
   difetto che non era di dimensione: Motion mette `tabindex="0"` su qualunque
   elemento con `whileTap`, e ne usciva una fermata di tabulazione senza nome
   dentro ogni pulsante «Anche io» — **42 su una sola pagina**.
7. **Ogni grafico ha un equivalente testuale** e, dove possibile, è
   attraversabile da tastiera.
8. Nessun contenuto può restare invisibile perché un'animazione non è partita
   (vedi la regola `@media print` in `globals.css`).

---

## 12. Sì / No

| ✅ Sì | ❌ No |
|---|---|
| Un momento memorabile per pagina | Dieci effetti che competono |
| Ornamento derivato dai tre motivi | Gradienti generici da template |
| Lime come sfondo di un chip | Lime come testo o icona |
| Mesh la cui tinta codifica un dato | Mesh scelto perché "sta bene" |
| Una cifra display per schermata, in peso leggero | Due numeri che si contendono il ruolo di protagonista |
| Corredo aggiunto solo quando dice qualcosa | Unità + scala + delta + sparkline "perché ci stanno" |
| Elevazione per translucenza e filo di luce | Aloni e ombre diffuse attorno alle card |
| Densità che cresce solo nelle viste dati | Tutto arioso indistintamente |
| Stati vuoti/errore/caricamento disegnati | `<p>Nessun risultato</p>` |
| Motion con un'unica orchestrazione | Animazioni ovunque, bounce, parallax |
| Il rosso dello stemma per brand e urgenza | Rosso decorativo |
