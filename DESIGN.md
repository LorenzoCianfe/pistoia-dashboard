# Design — Pistoia.app

> Direzione estetica e linguaggio visivo della piattaforma. Questo documento è
> la fonte di verità per ogni decisione di design: se una scelta visiva non è
> coerente con quanto scritto qui, o si corregge la scelta o si aggiorna
> (consapevolmente) questo documento.
>
> Ultime revisioni: **2026-08-12** (il battesimo: **§1 riscritta** — non è più
> «il Comune che parla» ma un osservatore indipendente, con la distinzione
> dall'ente promossa a quarto carattere e il divieto di araldica come
> identità; **§4** la regola misurata del rosso minuto, che non regge AA sulla
> tela; più le due note della ricognizione — la questione aperta del vetro sul
> contenuto in §6, che le direzioni scioglieranno, e l'avvertenza sul lime
> diventato moda in §4) ·
> **2026-08-09** (§11.7 *nessun controllo esce dal proprio
> contenitore*: da trappola trovata guardando a **vincolo con un cancello suo**,
> con la distinzione fra ciò che è fuori vista e ciò che è fuori portata) ·
> **2026-08-07** (§6 *una coda è una lista, e il lavoro è una
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

> **Riscritta il 2026-08-12, dentro il battesimo di O10.** Questo paragrafo
> diceva «è il Comune che parla», e non è più vero: Pistoia.app è una
> piattaforma civica **indipendente** che parla *di* Pistoia usando dati
> pubblici (`docs/direzione-prodotto.md` §1.4). La differenza non è di tono, è
> di legittimità: presentarsi come l'istituzione senza esserlo brucia la
> fiducia che tiene in piedi tutto il resto.

Pistoia.app **osserva** un'istituzione, non la rappresenta. Il suo design deve
trasmettere quattro cose, in quest'ordine:

1. **Credibilità** — non ci si crede sulla parola: ogni numero porta la sua
   fonte, ogni testo ufficiale resta leggibile com'è scritto, e ciò che è
   dimostrativo lo dichiara. È l'affidabilità di prima, spostata dall'autorità
   di chi parla alla verificabilità di ciò che dice.
2. **Vicinanza** — è dei cittadini, non sopra di loro: toni caldi, linguaggio
   umano, forme morbide. Il registro è quello del Post (P18): spiegare senza
   gridare, domandare senza accusare.
3. **Cura** — una piattaforma curata comunica che la città è curata: ogni
   dettaglio (stati vuoti, caricamenti, errori) è disegnato, mai lasciato al
   caso.
4. **Distinzione dall'ente** — 🆕 e non è una preferenza estetica: **mai
   araldica come identità**. Lo stemma e la scacchiera restano legittimi dove
   si *parla del* Comune (le fonti, le risposte ufficiali), e sono fuori da
   testate, marchio e firme. Il rosso della città radica; l'araldica
   travestirebbe.

**In una frase:** *la sobrietà di un giornale civico toscano, con la
leggibilità e la materia di un prodotto digitale moderno.*

Non è: un social network, una startup SaaS, un sito vetrina turistico, un
template Tailwind, **né un sito istituzionale**. Quando un pattern sembra "già
visto su dieci dashboard", è il segnale per ridisegnarlo — e la prova che lo
misura è il **test dell'intruso** (`docs/ricognizione-visiva.md` P21): ogni
schermata deve poter dire che cosa, in lei, esiste solo perché questa è
Pistoia.

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

## 3. I motivi identitari

Il design attinge a simboli reali di Pistoia. Sono il vocabolario decorativo
della piattaforma: ogni ornamento deve derivare da uno di questi, mai da pattern
generici — **e nessun ornamento è obbligatorio**: una superficie senza motivo è
una scelta legittima, spesso la migliore.

> 🔴 **Rivisto il 2026-08-12 col battesimo, in due tempi.**
>
> **Primo tempo:** la scacchiera **esce dal vocabolario identitario**. Evoca lo
> stemma, e §1 (riscritta lo stesso giorno) dice che l'araldica dell'ente su
> una piattaforma che l'ente non è sarebbe un travestimento —
> `direzione-prodotto.md` §1.9 lo scrive alla lettera: «i *colori* della città
> sì, lo *stemma* e la scacchiera che lo evoca no». Resta dentro `Crest`, cioè
> **dove si raffigura lo stemma perché si parla del Comune**. Al suo posto era
> subentrato un filo sfumato nel rosso della città.
>
> **Secondo tempo, la sera stessa.** Lorenzo: «mi piaceva la scacchiera». Il
> rilievo era fondato — quel motivo aveva una cifra — quindi si è fatto ciò
> che questo progetto fa sempre: **quattro varianti montate sulla card vera e
> fotografate** (la scacchiera com'era, il filo sfumato, due versioni a moduli
> monocromi che tenevano il ritmo senza l'alternanza araldica). Verdetto:
> **«mi fanno tutti pena, non metterci niente».**
>
> ✅ **Deciso: in cima alle superfici-firma non va nessun motivo.** È la
> lezione che vale oltre il caso: quel filo non risolveva un problema,
> riempiva un'abitudine — e §12 dice «**un** momento memorabile per pagina»,
> non «un ornamento per card». Una decorazione di cui nessuna variante
> convince è una decorazione che non serve. Le superfici-firma si distinguono
> per ciò che dicono e per come sono composte.

| Motivo | Origine | Uso nella UI |
|---|---|---|
| **Le fasce romaniche** | Il marmo a fasce di San Giovanni Fuorcivitas | Ritmo orizzontale: separatori (`.divider-bande`), pattern tenui negli hero e negli stati vuoti (`.bande-romaniche`). Sempre a contrasto minimo. ⚠️ **Non reggono sopra una superficie mesh**: al 3,5% lì si leggono come un blocco di caricamento (misurato sul pannello del login) |
| **La città verde** | Pistoia capitale europea dei vivai | Il verde-acqua `--color-accent` è il colore «vivo» della piattaforma: azioni, progressi, dati che crescono |
| **Il rosso della città** | Il rosso dello stemma, **senza la sua forma** | Marca (il «.app» del marchio), pastiglia del tema sopra i titoli, errore e urgenza. Il colore radica; la forma araldica travestirebbe. ⚠️ Come **testo minuto** si usa `--red-ink` (§4) |
| ~~La scacchiera~~ | Lo stemma comunale | **Fuori dall'identità dal 2026-08-12.** Sopravvive solo dentro `Crest`, dove lo stemma è il soggetto e non la firma |
| ~~Il filo in cima alle card~~ | — | **Mai adottato.** Provato in quattro varianti e scartato: nessun motivo sopra le superfici-firma |
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

> ⚠️ **2026-08-12, dalla ricognizione di O10** (`docs/ricognizione-visiva.md`
> §2-ter): il lime è diventato **l'accento di moda di mezzo mestiere** — tre
> apparizioni in cima a ricerche generiche in un giorno. Non si toglie, ma
> **non si promuove mai a colore d'identità**: «lime su grigio caldo» oggi è
> un template, non una firma. L'identità la portano il rosso della città e i
> motivi veri.

### Il rosso come testo minuto non vive sulla tela (misurato 2026-08-12)

Montando D1 e D2 ([`docs/montaggio-d1-d2.md`](docs/montaggio-d1-d2.md) §2) è
emerso che il **kicker editoriale rosso** — la parola-tema sopra un titolo, il
precedente FT — nel tema chiaro sta sotto AA appena esce da una superficie
piena:

| Dove | `--red` | `--red-ink` |
|---|---|---|
| Sulla tela `#E8E7E4` | **3,69:1** ❌ | **4,48:1** ❌ |
| Su card piena | 4,56:1 ✅ | 5,54:1 ✅ |
| Sul vetro (card al 72%) | **4,31:1** ❌ | 5,23:1 ✅ |
| Nella pastiglia `--red-soft` | 3,72:1 ❌ | **4,52:1** ✅ |

Nel tema scuro passano tutti. La regola che ne discende, e che non dipende da
quale direzione vince: **il rosso minuto sta su superficie piena o dentro la
pastiglia `--red-soft` con `--red-ink`.** È §8 («il testo minuto non va sul
mesh») estesa dal *testo* al *colore del testo*: anche un colore appena sopra
soglia perde il margine appena il fondo si schiarisce.

> **Corollario, pagato lo stesso giorno sul marchio.** La stessa tinta cambia
> norma con la **taglia**: il «.app» a 19px in peso 800 è *testo grande*
> (soglia 3:1) e fa 4,56 — a 13,5px nel footer la soglia diventa 4,5:1 e lo
> stesso colore fa **4,3:1**. Venti pagine rosse sul cancello axe, per un
> colore che era stato misurato e trovato a norma. Da qui `--color-red-ink`
> come utility (`text-red-ink`, prima esisteva solo la variabile) e la regola:
> **quando un componente ha più taglie, ogni taglia è un caso di contrasto
> suo.**

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

  > ✅ **CHIUSA il 2026-08-12, da Lorenzo, sui mockup.** La ricognizione
  > (`docs/ricognizione-visiva.md` §1) aveva letto il canone Apple per intero,
  > e sul punto che conta dice l'opposto: *«Don't use Liquid Glass in the
  > content layer»* — il vetro sul telaio, il contenuto su materiali pieni.
  >
  > **La decisione: il vetro resta sulle card, con una regola in più che lo
  > rende difendibile.**
  >
  > > **Il dato minuto vive sempre su una superficie OPACA, dentro il vetro.**
  >
  > È il pattern P2 della ricognizione («il payload si legge sul pieno»), che
  > combacia con la variante *regular* della HIG: il vetro fa cornice e
  > atmosfera, la lettura avviene su pieno. Nei mockup è ciò che ha reso il
  > monumento leggibile in D2 (barre e didascalia su superficie opaca dentro il
  > vetro), ed è la stessa regola che ha salvato il marchio sopra il mesh del
  > login (§4-bis di `docs/montaggio-d1-d2.md`).
  >
  > **La deroga al canone è quindi consapevole e circoscritta**: si tiene il
  > vetro dove Apple non lo metterebbe, ma si adotta la disciplina che lo rende
  > leggibile. Il costo dichiarato: il confine col «template di vetro» resta
  > sottile, e la difesa è il test dell'intruso (§1).

  La *saturazione* non è un vezzo: sfocare rende il fondo indistinto ma lo
  sbiadisce, e il boost restituisce il colore che la sfocatura toglie. È il
  dettaglio che separa il vetro vero dal "bianco trasparente".

  Il vetro ha bisogno di **materia da sfocare**: la tela porta una grana
  finissima (`--canvas-grain-opacity: 0.045`) proprio per questo. Senza,
  `backdrop-filter` non ha nulla su cui lavorare e la card translucida è
  indistinguibile da un pannello opaco.

  Contrasto verificato: **16,8:1 (chiaro) e 16,0:1 (scuro)** — AAA in entrambi.
  Il vetro non costa leggibilità perché è denso e la tela è di tono vicino.

  > 🔁 **Rivisto il 2026-08-14, da Lorenzo, sui riferimenti (`refs/` — `4.jpg`
  > e i ritagli).** «Niente ombre diffuse» resta, ma va precisato: vietava
  > l'**alone colorato ATTORNO** alla card (il vecchio bottone teal ne aveva
  > uno), non la **proiezione direzionale SOTTO**. Un alone circonda; una
  > proiezione cade da una parte sola perché c'è una sorgente di luce in alto.
  > La prima è decorazione, la seconda è fisica.
  >
  > **Il modello di luce completo ha tre strati** (`--elev-rest` in
  > `globals.css`), non uno: il **filo** in cima (`inset 0 1px 0`, c'era già),
  > il **sottosquadro** in basso (`inset 0 -1px 0`, dà spessore) e la
  > **proiezione** morbida e spostata in basso (`0 10px 24px -10px`). Con solo
  > il filo la card legge come *ritagliata dentro* la tela; coi tre strati come
  > *appoggiata sopra* — ed è la differenza fra «piatto» e «premium» che tre
  > giri di ritocchi non avevano risolto.
  >
  > Da qui due quote nuove: `--elev-capsula` (le superfici che galleggiano
  > *sopra* il contenuto: la striscia dei dati, la barra) e `--elev-premuto`
  > (il rilievo che **si inverte** alla pressione — la luce va sotto, l'ombra
  > entra — al posto del vecchio `scale(0.98)` che rimpiccioliva e basta). ⚠️
  > Il sottosquadro **non** va sul pieno (bottone primario): un inset scuro
  > dentro una tinta satura legge come sporco.

- 🆕 **La scena dietro il vetro** (2026-08-14). Il vetro ha bisogno di **materia
  da sfocare**, e la grana della tela non bastava a farlo leggere come premium.
  La prima pagina (gruppo `(vetrina)`) mette **una fotografia di Pistoia** dietro
  l'apertura — di giorno in tema chiaro, di notte in tema scuro (`brand/scena.tsx`,
  due `<picture>` in AVIF/WebP a tre misure, ~90 KB scaricati). Adesso
  `backdrop-filter` ha una città da sfocare, e le card leggono come vetro vero.
  ⚠️ Il vetro sopra la foto è **più denso** (88%) di quello sopra la tela: sotto
  c'è un cielo quasi bianco e dei tetti, e a opacità normale il contrasto del
  testo ballerebbe. È §6 applicata al caso peggiore.
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

  🔴 **Pagata una terza volta il 2026-08-12, e questa volta non era una
  variante ma un'UNITÀ.** La cifra display si dimensionava con
  `clamp(3rem, 7vw, 5.5rem)`: `vw` è la larghezza del *viewport*, cioè la
  stessa cosa che `sm:`/`lg:` guardano. Nella colonna da **343px** del
  numero-monumento della prima pagina dava 88px, e «689.724» a quella taglia
  misura **369px** — **55px fuori dalla card**, con `overflow: visible`, quindi
  sbordava sulla tela invece di essere ritagliato.

  **Nessuno dei quattro cancelli poteva vederlo**, ed è la parte che vale oltre
  il caso: `shots` misura il traboccamento *della pagina* (zero, perché il
  numero sborda dalla card e non dal documento), `contenimento` guarda i
  *controlli* (una cifra non lo è), `bersagli` le *dimensioni*, e axe non ha
  una regola per «non ci sta». L'ha trovato l'occhio, guardando la schermata.

  Ora è `22cqw`, e il coefficiente è scelto perché **nulla cambi dove oggi
  funziona**: il tetto di 5,5rem si raggiunge già a ~400px di colonna, quindi
  `/bilancio` (398px → 87,5px) e `/trasparenza/costo-amministrazione` (803px →
  88px) restano identici al pixel, e solo le colonne strette scendono quanto
  serve a starci dentro. **La regola: se una misura deve adattarsi allo spazio
  di un componente, l'unità è `cqw`, mai `vw`** — è `@container` applicato a
  una lunghezza invece che a una soglia.

- **La larghezza del guscio: 1.680px, e una definizione sola** (decisa da
  Lorenzo il 2026-08-12 guardando tre varianti montate sulla prima pagina
  vera). Era `max-w-6xl` — 1.152px — ripetuto in **cinque punti**: le due
  testate, il guscio, il footer e il layout pubblico. Adesso è
  `--container-guscio` in `globals.css`, e l'utility è `max-w-guscio`.

  **Il fatto che ha deciso:** a 1.700px di finestra il vecchio tetto lasciava
  **624px di margine morto** e la colonna di lettura restava congelata a 852px
  — cioè **il 50,1% dello schermo era vuoto**, e a 2.560px sarebbe stato il
  67%. La colonna non cresceva mai, perché il tetto era assoluto.

  ⚠️ **Cinque copie, e il disallineamento si vedrebbe**: la testata deve
  incolonnarsi col contenuto sotto, quindi cambiarne quattro su cinque sposta
  il marchio rispetto al titolo. È la regola di §3 sugli indicatori applicata a
  una misura.

  🔴 **E il tetto del guscio NON è la misura di lettura.** È la conseguenza che
  conta, ed è emersa misurando: a 1.680 l'oggetto ufficiale di un atto passava
  a **95 caratteri per riga** (era 54), oltre la soglia in cui l'occhio trova
  il ritorno a capo. La regola che ne esce:

  > **Il guscio dà lo spazio, il testo si dà la misura** — in `ch`, che conta
  > caratteri, e non in `px`.

  Oggi: oggetto ufficiale `80ch` (esatto al carattere, è monospaziato),
  didascalie e sommari `68ch`, il footer i suoi 850px. **Il titolo no**: un
  tetto sul titolo lasciava mezza card bianca a destra, e in prima pagina il
  titolo occupa la colonna che ha — si stringe ciò che si legge riga per riga,
  non ciò che si scandisce a colpo d'occhio.

  E dove la larghezza è un guadagno vero, la si usa: il fiume degli atti passa
  a **due colonne** da `lg` in su, che riporta la riga da 108 a **53
  caratteri** *e* riempie lo spazio invece di lasciarlo bianco.

- **L'isola** (P4): l'unica superficie **scura e opaca** di una pagina chiara.
  Nasce sul numero-monumento della prima pagina, e l'opacità non è gusto —
  `DESIGN.md` §6 vuole il dato minuto su superficie piena, e l'isola porta nove
  importi e tre barre; una `.card` sarebbe vetro, e sfocare la tela sotto una
  superficie scura la schiarirebbe di quel tanto che basta a togliere il
  contrasto. Nel tema scuro **sale invece di scendere**: una card più nera
  della tela near-black sparirebbe, quindi la gerarchia la fa un gradino di
  luminanza (§10). Contrasti misurati: inchiostro **16,3:1** nel chiaro e
  **13,8:1** nello scuro, testo attenuato 7,1:1 e 6,0:1.

  ⚠️ **Resta aperto se sia una regola di sistema («una isola per pagina») o il
  gesto della sola prima pagina.** Oggi è il secondo, e finché non lo decide
  Lorenzo non si generalizza: i token (`--isola*`) e la classe esistono, il
  vincolo «una per pagina» no.

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
| **Indicatori vivi** | 🆕 Un indicatore può **deformarsi sulla propria velocità** (la goccia della barra laterale). Reattivo — passaggio, fuoco, cambio pagina — e **fermo a riposo**: vedi sotto |
| **Dati** | I numeri contano da 0 una volta; i grafici si disegnano una volta sola |
| **Reduced motion** | `prefers-reduced-motion` annulla tutto. Non negoziabile. **Si applica in CSS o nella durata, mai in un ramo del markup** — vedi sotto |

**Librerie.** Motion per tutto ciò che è React. Anime.js solo per lavoro
nativamente SVG. Nessun GSAP, nessuno sfondo WebGL — vedi `REFERENCES.md` §6.

### Il grado sale sulla prima pagina, con quattro strumenti nuovi (2026-08-14)

Lorenzo ha chiesto la prima pagina «molto più dinamica, moderna, premium».
Il livello resta 3 su 5 nel resto del prodotto; **sulla vetrina (`(vetrina)`)
sale, e le regole qui sopra si precisano invece di rovesciarsi.**

- **Molle vere, in CSS puro** (`--molla-*`, generate da `scripts/molle.mjs`).
  Sono l'equazione della molla campionata in `linear()`: **zero byte**, non una
  libreria. Vanno **solo su ciò che si tocca** (bottoni, tessere, interruttori);
  gli ingressi e le card grandi restano su `--ease-out-civic`, perché su una
  distanza lunga il sorpasso diventa ondeggiamento. La molla di sistema è la
  **tattile** (2% di sorpasso: si legge come «ha risposto», non come rimbalzo).
  ⚠️ «Mai bounce» resta: il **rimbalzo** (16%) è riservato ai tre momenti di
  festa, non è la curva di default.
- **L'ingresso in tre movimenti**, non cinque passi uguali: *il dato* (la
  striscia, corta e veloce), *la voce* (titolo + sommario insieme), *la materia*
  (le superfici, più lente e da più lontano). L'ordine si legge come gerarchia,
  non come coda. Resta **una sola orchestrazione per pagina**.
- **Il titolo che si compone** parola per parola (`signature/titolo-composto.tsx`):
  gesto editoriale, **uno per schermata** come la cifra display. Il testo resta
  testo — la maschera è sul contenitore della parola, non un duplicato nascosto.
- 🆕 **Il cambio di tema è un'ora del giorno che passa** (`brand/transizione-scena.tsx`):
  premendo l'interruttore, un time-lapse di Pistoia copre la scena mentre i
  colori si accompagnano sotto. **Due video nativi**, uno per verso
  (giorno→notte e il suo rovescio) — *non* un solo elemento con la sorgente che
  si scambia, che si resetta a metà: sono due `<video>` stabili. Scarica solo
  sull'intenzione (passaggio del mouse), non parte con `prefers-reduced-motion`,
  e se non è pronto il tema cambia lo stesso (dissolvenza di 520ms).

  **Il filmato è l'orologio, e l'orologio è un numero solo** (2026-08-15). I due
  file girano a `playbackRate` **1** — velocità originale, **5,04s** — e a ogni
  fotogramma il modulo scrive su `<html>` la variabile `--tema-t`
  (`currentTime / duration`, 0 = giorno, 1 = notte). In `globals.css` **ogni
  token del tema è una miscela** fra il proprio valore diurno e il proprio
  valore notturno presa a quel punto: a metà filmato l'interfaccia è a metà
  perché è **letteralmente lo stesso numero**. Sincronia ad anello *chiuso* — il
  tempo non viene da un cronometro partito insieme, viene dal filmato: se la
  decodifica rallenta, rallentano i colori.

  Ne discendono tre regole:

  1. **L'interruttore si chiude a chiave per tutta la corsa** (`aria-disabled`,
     più un lucchetto vero nel modulo) e si riapre solo a filmato finito e velo
     sfumato. Clic ripetuti non sovrappongono né riavviano niente.
  2. **La durata NON si accorcia accelerando il filmato.** Se 5s fossero troppi,
     la leva è rimontare i sorgenti più corti: `--tema-t` li segue da sé.
  3. 🔴 **Non è una transizione CSS, e non può esserlo.** `color` è una proprietà
     *ereditata*: se un antenato la transisce, la transizione del figlio viene
     ribersagliata a ogni fotogramma e non arriva mai (misurato: il titolo al 62%
     a filmato finito, poi uno scatto). Vedi `AGENTS.md` §3.

  ⚠️ **Il crepuscolo costa contrasto, ed è inevitabile.** Inchiostro e carta si
  scambiano di posto, quindi a metà corsa passano per la stessa luminanza: per
  circa un secondo il testo sulle superfici è poco leggibile. Non è un difetto
  dell'implementazione, è la geometria di un incrocio; le uniche leve sono
  attraversarlo più in fretta (una curva a S su `--tema-t`, che però allenta il
  «a metà video, a metà tema») o far passare l'inchiostro per una tinta invece
  che per il grigio. **Al 2026-08-15 la decisione è aperta.**

### Due composizioni della prima pagina (2026-08-15)

Da qui convivono **due varianti** della stessa pagina, e la scelta fra loro è
aperta: `/` è **Homepage_1** (la griglia: colonna di testo più quattro tessere),
`/home-2` è **Homepage_2** (l'editoriale, da un riferimento portato da Lorenzo).

Non sono due temi della stessa cosa: cambia **la gerarchia**. Homepage_1 apre con
una frase e distribuisce quattro fatti in una griglia — è uno strumento.
Homepage_2 ha un protagonista solo, il **nome della città a scala di manifesto**,
e schiaccia tutto il resto al piede come l'indice di una copertina: nessuna card,
nessun contenitore, nessuna icona colorata. Solo tipografia sopra il vetro.

Le tre decisioni che la governano, prese da Lorenzo sul riferimento:

1. **Il marchio è spezzato in diagonale** dal bordo del vetro — «Pistoia» in alto
   dentro il pannello, «.app» in basso a destra sulla fotografia. Resta **un
   `<h1>` solo**: la diagonale è posizione, non contenuto, o un lettore di
   schermo sentirebbe due frammenti al posto di un nome.
2. **Il taglio è netto e verticale**, col filo di luce del modello a tre strati.
   Il pannello legge come appoggiato sopra la città, non ritagliato dentro.
3. **I dati istituzionali sono un indice numerato** (`01`, `02`), non delle
   tessere: è il vocabolario del riferimento portato su due fatti veri.

⚠️ **Ciò che le due varianti CONDIVIDONO deve restare condiviso**: marchio,
token, scena fotografica, filmati e tutto il meccanismo giorno↔notte. I dati
vengono dalle stesse due funzioni — due prime pagine che mostrassero due numeri
diversi della stessa città sarebbero peggio di una variante in meno (è la regola
di §3, ondata 7, applicata alle composizioni invece che agli indicatori). Ciò che
NON condividono sono i nomi di classe: `home2__*` non tocca `prima-pagina__*`, ed
è la condizione per poterne buttare via una senza toccare l'altra.

⚠️ **La scala del marchio si misura sulla COLONNA, non sulla finestra.** Il nome
vive in un pannello al 46%: `--home2-vetro` è un numero senza unità proprio
perché serve due volte — moltiplicato per `1%` fa la larghezza del pannello, per
`1vw` fa il corpo del testo. Cambiare il numero fa seguire la scritta. Scrivere
il corpo come una frazione di `vw` a occhio è la trappola già pagata (§3, Fase C,
5): `vw` è la finestra, non la colonna.

#### Il logotipo come testata, e il rosso come accento (2026-08-15)

Su Homepage_2 il marchio non è un titolo grande: è una **testata**. Quattro
mosse, e nessuna è un ornamento:

1. **Maiuscole**, con la spaziatura ottica corretta a −0,02em — meno negativa che
   sul tondo, perché le caps hanno contro-forme più larghe e a −0,045em «ST» e
   «OI» si toccano. ⚠️ Le maiuscole le fa il **CSS**: nel DOM resta «Pistoia»,
   così il nome accessibile è `Pistoia.app` e la ricerca in pagina lo trova.
2. **Il filo di testata**: una riga piena sopra il nome, larga quanto la colonna.
   È il segno che in edicola dice «qui comincia la pubblicazione».
3. **La riga di servizio**: sottotitolo a sinistra, anno a destra, monospaziato
   spaziato largo, allineati agli estremi del filo. Gerarchia da gabbia
   tipografica, non da pagina web.
4. **Il logotipo giustificato alla misura**: il corpo si ricava dividendo la
   colonna per la larghezza reale del nome in em (**4,43em** in caps, misurata a
   schermo, non stimata).

**Il rosso è l'accento, e ha tre presenze e non una di più**: il filo di testata,
il «.app» del marchio, l'azione principale. Le prime due sono §4 alla lettera —
il rosso dello stemma è «brand», e `wordmark.tsx` colora il «.app» da sempre. La
terza **estende** §4: il rosso non era mai stato il colore di un'azione. La
decisione è di Lorenzo (2026-08-15) e vale **su questa variante soltanto**: su
Homepage_1 l'azione resta il verde-acqua dei vivai. Portarla anche di là è stato
provato lo stesso giorno e ritirato — cambia identità, non stile, e va presa
apposta.

⚠️ E resta il **grado**: il rosso è l'inchiostro e il filo, non il pieno. Un velo
di tinta al 14% sotto `--red-ink`, non una superficie rossa: sul pulsante a 13px
la soglia è 4,5:1 e `--red` pieno ne farebbe 4,3.

⚠️ **Come testo su superficie vale `--red-ink`, non `--red`**: alla scala della
testata il marchio è testo grande (soglia 3:1) e `--red` basta, ma sul pulsante a
13px la soglia sale a 4,5:1 e `--red` ne fa 4,3. È la misura già pagata sul
footer, scritta in testa a `wordmark.tsx`.

⚠️ **Sulla fotografia il rosso vuole due ombre, non una.** I tetti di Pistoia
sono terracotta, cioè la tinta più vicina al rosso dello stemma che ci sia in
quella foto: una stretta che incide il contorno, una larga che abbassa il fondo.

**I controlli parlano come i dati** (`.ctrl`, famiglia di progetto): niente
ombre, vetro leggero, raggio piccolo, e **monospaziato maiuscolo** — che è la
mossa che fa leggere pulsanti, menu, interruttore e righe dell'indice come la
stessa famiglia. La gerarchia fra le due azioni la fa **la temperatura**, non il
pieno.

⚠️ **Quanto vetro serve dipende da che cosa c'è sotto** (`--ctrl-velo`): 26% dove
i controlli poggiano su un pannello, **62%** dove poggiano sulla fotografia. Un
numero solo non può servire due fondi diversi — col 26% sopra i tetti illuminati
l'azione principale era leggibile solo sapendo cosa c'era scritto. È il
compromesso del crepuscolo da un'altra porta: **la trasparenza costa contrasto**.

#### La goccia d'acqua: provata e tolta (2026-08-15)

Fra il 15 agosto e la sera dello stesso giorno i controlli hanno avuto un effetto
«goccia d'acqua»: rifrazione vera dello sfondo con un filtro SVG di spostamento
su `backdrop-filter`, calotta sferica calcolata per elemento, frangia cromatica a
tre passate, riflesso speculare, ombra di contatto e molle sullo spessore.
**Funzionava** — deformava davvero testo, card, fotografia e filmato — ed è stato
**tolto per intero** su richiesta di Lorenzo, che dopo tre giri di taratura non ci
ha riconosciuto l'acqua che aveva in mente.

Resta qui perché la prossima volta non si ricominci da zero:

1. 🔴 **WebGL non è la strada.** Un canvas non può leggere i pixel già disegnati
   dal browser: per rifrangere il testo di una card dovrebbe ridisegnare quella
   card. Saprebbe deformare solo ciò che gli si passa come texture — la
   fotografia e il filmato — lasciando fermo tutto il resto.
2. **La strada che funziona** è `backdrop-filter: url(#filtro)` con un
   `feDisplacementMap`: rifrange lo sfondo vero, vivo, senza ridisegnare niente.
   Chromium soltanto (Safari e Firefox non accettano `url()` lì dentro).
3. ⚠️ **`scale` di `feDisplacementMap` non è uno spostamento in pixel**: la
   formula è `P' = P + scale · (canale/255 − 0,5)`. Con una mappa che culmina a
   0,43, «9» vale 3,9 px. È l'errore che ha fatto sembrare l'effetto assente per
   un intero giro.
4. ⚠️ **La SDF corta del rettangolo arrotondato** (`raggio − hypot(q)`) vale solo
   negli angoli: nella fascia dritta si ferma a `raggio`, quindi su una card alta
   287px il centro dichiara 31px invece di 143 e la lente diventa una cornice.
   Serve il termine interno.
5. 🔴 **Il costo è il vero limite.** Otto gocce sopra il filmato della transizione
   giorno↔notte: **26 fps** mediani, 18 senza il rimedio della passata singola.
   Su una prima pagina che ha un time-lapse di cinque secondi come gesto
   principale, è il gesto principale a pagare.

E la lezione di metodo, che vale oltre questo caso: **la rifrazione da sola non
fa l'acqua.** L'acqua si riconosce da quattro segnali insieme — rifrazione,
riflesso speculare, ombra di contatto, frangia cromatica — e i primi due giri ne
avevano uno.

⚠️ **L'anello di fuoco resta teal**, ed è deliberato: `--ring` è un segnale di
sistema, uguale su tutta la piattaforma, e un anello rosso dove il rosso significa
anche «urgenza» si leggerebbe come uno stato d'errore.

⚠️ **L'unica deroga a «mai ambientale»: il pallino della striscia respira**
(3,4s), e *solo quando la lettura è viva*. Si guadagna il posto perché **il
movimento È il dato** — dice «la macchina gira», come gli «Online 4/6» dei
riferimenti — e la sua assenza (pallino ambra, fermo) è informazione quanto la
presenza. È l'eccezione che conferma la regola, non la sua fine.

### La goccia: come si fa «vivo» senza fare «ambientale» (2026-08-12)

Lorenzo ha chiesto una barra laterale «con un menu innovativo, animato, tipo
goccia di vetro o goccia d'acqua». La formulazione originale diceva anche
*«che si muovono anche senza selezionarle»*, e **quella parte è stata portata
alla sua decisione invece che eseguita**: contraddice la riga qui sopra («mai
ambientale») e `AGENTS.md` §2 (il servizio deve girare su Android vecchi).
Messo davanti ai tre gradi, ha scelto **reattivo**. La regola resta com'era, e
la barra è comunque viva.

**Che cosa la rende viva, e non è una durata più lunga.** La deformazione si
deriva dalla **velocità** dell'indicatore (`useVelocity` sulla posizione): si
allunga quando corre, si ricompone quando arriva, con `scaleX` all'inverso per
conservare il volume. Un salto corto la deforma appena, uno lungo la stira —
che è quel che fa una goccia d'acqua. Con `layoutId` non era ottenibile:
quello interpola e basta.

Le tre condizioni che la tengono dentro le regole, tutte e tre provate da
`porte.spec.ts`:

1. **A riposo è ferma.** Due letture a mezzo secondo di distanza devono essere
   identiche: è la prova che nessuna animazione sta girando.
2. **Con `prefers-reduced-motion` non anima e non si deforma**: si posiziona.
3. **La verità di «dove sono» non dipende da lei.** La goccia va a *visitare*
   la voce sorvolata, quindi la voce attiva porta un segno suo che non si
   sposta mai — `aria-current`, l'inchiostro pieno, la tacca teal. È §6 («il
   `:hover` non è un canale, è un rinforzo») applicata a un indicatore.

⚠️ **E la goccia non porta `backdrop-filter`.** L'isola sì, perché è ferma e si
compone una volta; sfocare lo sfondo di un elemento **che si muove** obbliga il
compositore a rifare il lavoro a ogni fotogramma. Una superficie translucida
dentro un pannello già sfocato legge come vetro lo stesso, e costa solo
trasformazioni.

### La preferenza di movimento non si legge in fase di render (2026-08-08)

`useReducedMotion()` restituisce `null` sul server — che non ha media query — e
`true` sul browser di chi ha la preferenza attiva. Qualunque **ramo del JSX** su
quel valore fa quindi servire un HTML diverso da quello che verrà idratato, e
React lo dice come errore di idratazione. Su `/bilancio` erano **due errori a
ogni caricamento**, e nessun cancello li guardava.

Le due leve che restano, e bastano tutte e due insieme:

- **La durata** (`transition={{ duration: reduce ? 0 : 0.5 }}`): non finisce nel
  DOM servito, quindi è sempre sicura. È ciò che rende l'ingresso istantaneo.
- **Il CSS** (`@media (prefers-reduced-motion: reduce)`): il server serve la
  stessa regola a tutti ed è il browser a decidere se applicarla. In
  `globals.css` la regola su `[data-motion-reveal]` sta accanto a quella di
  stampa, perché il problema è lo stesso — una rivelazione che non può o non
  deve avvenire — e l'esito voluto è identico: fermo e a piena opacità.

Quello che **non** si fa è `initial={reduce ? false : {…}}`: `initial` è markup.

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

> 🔴 **E deve dire quando ha finito** (aggiunto il 2026-08-12, P24 di
> `docs/ricognizione-visiva.md`). Contando da zero la cifra muta il proprio
> testo fotogramma per fotogramma: chi usa un lettore di schermo e arriva
> mentre l'animazione gira sente un numero **intermedio**, e niente gli dice
> che non è quello definitivo. Era un buco nostro, e **nessuno dei quattro
> cancelli lo vede**: axe non ha una regola per «il testo sta ancora
> cambiando». Trovato guardando com'è fatto il contatore di qualcun altro.
>
> La prop `annuncio` accende una live region che **parla una volta sola**,
> quando il valore si assesta. Due precisazioni che la rendono difendibile:
> vuota finché il conteggio non finisce — una live region che seguisse
> l'animazione annuncerebbe decine di valori in un secondo — e **non è
> l'«equivalente nascosto» che questo stesso paragrafo vieta**: quello è un
> secondo testo permanente da tenere allineato a mano, questo è un annuncio a
> scatto singolo che prende il valore dallo stesso formattatore della cifra
> visibile. Omessa, non c'è nessuna live region: la regola «una cifra per
> schermata» non è imposta dal codice, e due regioni si calpesterebbero.

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
`prefers-reduced-motion` diventa statica e tutti i passaggi restano visibili —
per via del CSS su `[data-motion-reveal]`, non di un ramo del JSX (§7).

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
7. **Nessun controllo esce dal proprio contenitore** (2026-08-09). Un comando
   che sporge da un riquadro con `overflow` nascosto viene **ritagliato**, e la
   parte fuori non si raggiunge in nessun modo — né col dito, né col mouse.
   Nasce da un caso vero: i due pulsanti dell'urgenza affiancati misuravano
   **301px** dentro il riquadro da **239** che li ospita, e «Flusso ordinario»
   spariva per 62px.

   ⚠️ **Un contenitore che SCORRE non viola questa regola**: lì il contenuto
   oltre il bordo si raggiunge, ed è il mestiere del riquadro del triage. Il
   vincolo riguarda l'irraggiungibile, non il fuori vista.

   ✅ **Cancello**: `tests/e2e/contenimento.spec.ts`, 21 pagine × 2 viewport,
   bloccante, eccezioni **vuote**. Non lo sostituisce nessuno degli altri tre:
   `shots` misura il traboccamento *della pagina* — zero, proprio perché la
   card ritaglia —, `bersagli` la *dimensione* (un bersaglio tagliato a metà è
   ancora alto 44), e axe non ha una regola per «tagliato».
8. **Ogni grafico ha un equivalente testuale** e, dove possibile, è
   attraversabile da tastiera.
9. Nessun contenuto può restare invisibile perché un'animazione non è partita
   (vedi la regola `@media print` in `globals.css`).

---

## 12. Sì / No

| ✅ Sì | ❌ No |
|---|---|
| Un momento memorabile per pagina | Dieci effetti che competono |
| **Nessun ornamento, quando non risolve niente** | Un fregio su ogni card «perché ci sta» |
| Ornamento derivato dai motivi identitari | Gradienti generici da template |
| Lime come sfondo di un chip | Lime come testo o icona |
| Mesh la cui tinta codifica un dato | Mesh scelto perché "sta bene" |
| Una cifra display per schermata, in peso leggero | Due numeri che si contendono il ruolo di protagonista |
| Corredo aggiunto solo quando dice qualcosa | Unità + scala + delta + sparkline "perché ci stanno" |
| Elevazione per translucenza e filo di luce | Aloni e ombre diffuse attorno alle card |
| Densità che cresce solo nelle viste dati | Tutto arioso indistintamente |
| Stati vuoti/errore/caricamento disegnati | `<p>Nessun risultato</p>` |
| Motion con un'unica orchestrazione | Animazioni ovunque, bounce, parallax |
| Il rosso dello stemma per brand e urgenza | Rosso decorativo |
