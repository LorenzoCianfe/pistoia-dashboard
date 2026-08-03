# AGENTS.md — regole operative permanenti

> Questo file esiste perché Lorenzo non debba ripetere le stesse istruzioni a
> ogni sessione. Vale per qualunque agente (Claude Code o altro) lavori su
> questo repository.
>
> **Leggilo per intero all'inizio di ogni sessione, prima di toccare codice.**
>
> Aggiornato: 2026-08-03 (Fase C)

---

## 0. In trenta secondi

Piattaforma civica per il Comune di Pistoia: bilancio, opere, segnalazioni,
partecipazione. **Next.js 16** (App Router) · React 19 · TypeScript · Tailwind
v4 · **Astryx** (design system Meta) · Prisma 7 + SQLite · Motion 12.
Interfaccia e documentazione **in italiano**. Dati dimostrativi, autenticazione
reale.

L'app vive in `pistoia-dashboard/`. La documentazione vive nella radice.

---

## 1. Cosa fare a ogni sessione

1. **Orientati col grafo, non col grep.** Esiste `graphify-out/`. Per domande
   sul codice usa `graphify query "<domanda>"`, `graphify path "<A>" "<B>"`,
   `graphify explain "<concetto>"`. Restituiscono un sottografo mirato, molto
   più piccolo di una lettura a tappeto.
2. **Leggi `DESIGN.md` prima di qualunque lavoro visivo.** È vincolante. Se una
   scelta lo contraddice, o cambi la scelta o cambi il documento — mai lasciarli
   in disaccordo in silenzio.
3. **Aggiorna i documenti vivi mentre lavori**, non alla fine: `FEATURES.md` a
   ogni funzionalità, `ROADMAP.md` a ogni ondata chiusa, `CHANGELOG.md` a ogni
   commit sostanziale.
4. **A fine modifica del codice**: `graphify update .` (solo AST, nessun costo
   di API).

---

## 2. Cosa NON fare mai

- **Non fare commit o push** se non richiesto esplicitamente.
- **Non introdurre dipendenze** senza chiedere. Vale anche per le "piccole":
  ogni pacchetto è superficie di manutenzione e di sicurezza su un servizio
  pubblico.
- **Non usare `--no-verify`**, non aggirare hook, non disattivare regole di lint
  per far passare qualcosa.
- **Non inventare dati.** I dati sono dimostrativi e devono restare dichiarati
  come tali (`SourceBadge`, banner "Anteprima").
- **Non toccare l'autenticazione** senza leggere prima `SECURITY.md`. È l'unica
  parte reale e non negoziabile del progetto.
- **Non regredire l'accessibilità.** Contrasto AA ovunque, AAA sul body: già
  verificato, non si torna indietro.
- **Non aggiungere sfondi WebGL, cursori animati o parallax.** Il servizio deve
  girare su telefoni Android vecchi. (Vedi `REFERENCES.md` §6.)

---

## 3. Design system — le regole che si sbagliano più spesso

> §3 raccoglie **diciannove trappole già pagate**. Sono raggruppate per ondata
> solo perché è così che sono emerse: leggile tutte, valgono tutte ancora.

**Prima di tutto: Astryx è la sorgente dei TOKEN, non lo strato di primitive.**
Le primitive in `components/ui/` restano Pistoia, e non è pigrizia: ogni caso è
stato valutato e la motivazione è scritta in testa al file
(`TextInput` è controllato per contratto, `Button` non veste i link, `Banner` è
troppo pesante inline, `ProgressBar` perde lo stagger). Non "sistemarle"
migrandole ad Astryx senza aver letto quei commenti e `ROADMAP.md` ondata 5.

Per un componente **nuovo**, invece, guarda prima se Astryx ce l'ha:
`npm run astryx component <Nome>`.



1. **I token di sistema stanno in `src/themes/pistoia.ts`**, non in
   `globals.css`. Dopo averlo modificato: `npm run theme:build`. Il CSS
   compilato in `src/themes/generated/` è generato — non modificarlo a mano.
2. **I token che Astryx non modella** (lime `--highlight`, stop dei mesh,
   griglia dot-matrix) stanno in `globals.css`, nel layer `pistoia`. Astryx
   rifiuta nomi di token custom: è un vincolo di tipo, non una preferenza.
3. **Non importare `@astryxdesign/core/tailwind-theme.css`.** Il ponte ufficiale
   mappa `--color-muted` su uno *sfondo*, mentre qui `text-muted` significa da
   sempre un *colore di testo*, usato in ~200 punti. Il motivo è spiegato in
   testa a `globals.css`: leggilo prima di "sistemare" quell'import.

4. **Non scrivere prefissi vendor a mano nel CSS.** Lightning CSS (il
   compilatore di Tailwind v4) li mette da solo in base a `browserslist`. Un
   `-webkit-backdrop-filter` scritto DOPO la proprietà standard **collassa le
   due dichiarazioni tenendo solo la `-webkit-`**: il vetro diventa un pannello
   opaco fuori da Safari e nulla segnala l'errore. Il `browserslist` in
   `package.json` è la fonte di verità della soglia di supporto — se non c'è,
   il compilatore fa scelte tutte sue.

Altre due che costano ore se ignorate:

- **Non usare il provider `<Theme>` di Astryx.** Applica `color-scheme` sul
  proprio wrapper e, appena diverge da `<html>`, ribalta tutte le `light-dark()`
  dei discendenti (sintomo: card bianche su tela nera). Il tema è già CSS
  compilato più attributi su `<html>`. Vedi `theme-provider.tsx`.
- **Il tema DEVE essere compilato**, mai a runtime: la CSP con nonce del proxy
  bloccherebbe il `<style>` iniettato all'hydration.

### Cinque trappole pagate portando il sistema sulle pagine (ondata 6)

Hanno in comune una cosa: **nessuna produce un errore**. Il codice compila, i
test passano, e il difetto si vede solo guardando o misurando.

1. **`pathLength` e `non-scaling-stroke` insieme accorciano il tracciato.**
   `pathLength="1"` normalizza le lunghezze in spazio *utente*,
   `vector-effect: non-scaling-stroke` calcola i trattini in spazio *schermo*:
   con un `preserveAspectRatio="none"` di mezzo il tratto disegnato copre
   `larghezzaViewBox / larghezzaResa`. Nel grafico dell'andamento faceva 79,8% —
   **mancavano due mesi su dodici**. Per rivelare una linea usa una tendina di
   ritaglio, non il disegno del tratto.
2. **`sr-only` non stringe una `<table>`.** Nel layout automatico delle tabelle
   `width: 1px` vale come minimo: la tabella resta larga quanto il contenuto e,
   essendo in posizione assoluta, spinge la pagina di lato. Metti `sr-only` sul
   `<div>` che la avvolge. Non toccare il `display` della tabella: perderesti la
   semantica, che è tutto il punto dell'equivalente testuale.
3. **Il reset di Astryx batte l'ereditarietà del colore.** Dichiara `color` su
   `:where(h1…h6)` e `:where(p)`: specificità zero, ma una dichiarazione che
   colpisce l'elemento vince su un valore ereditato dal genitore. Un titolo
   dentro una `MeshSurface` prendeva il colore del tema, cioè **bianco nel tema
   scuro**. Invisibile nel tema chiaro.
4. **Le View Transitions rigettano tre promesse, non una.** Saltare una
   transizione è un esito normale; `ready`, `finished` e `updateCallbackDone`
   rigettano tutte, e ognuna senza gestore diventa un errore in console.
5. **Le costanti condivise non stanno in un file `"use client"`.** Un Server
   Component che le importa riceve riferimenti client invece di stringhe:
   l'attributo sparisce dal DOM in silenzio. Mettile in un modulo neutro
   (`lib/view-transitions.ts` è l'esempio).

E una sullo strumento di revisione, non sul prodotto: **`npm run shots` non
fotografava il login**, perché faceva l'accesso prima di visitarlo e `/login`
reindirizza chi ha una sessione. La prima schermata di ogni dimostrazione non
era mai stata rivista. Se cambi lo script, verifica che le pagine anonime
restino anonime.

### Sei trappole del secondo scaglione di pagine (ondata 7)

Stessa famiglia delle precedenti: **nessuna produce un errore.**

1. **Una prop-funzione su un componente client non è usabile da un Server
   Component.** `DisplayNumber` accettava `format?: (n) => string`. Tutte le
   pagine che gli danno la cifra protagonista sono Server Component, e React
   rifiuta a runtime: «Functions cannot be passed directly to Client
   Components». Typecheck verde, lint verde, pagina sull'error boundary. La
   prop ora è `formatOptions?: Intl.NumberFormatOptions` — un oggetto, che
   attraversa il confine. **Quando aggiungi una prop a un componente
   `"use client"`, chiediti se è serializzabile.**
2. **Non contare da una lista troncata.** `getNeighborhoodDetail` ricavava
   `counts.openReports` da una `findMany({ take: 6 })`: il numero non poteva
   superare 6, e restava plausibile. Un quartiere con quaranta segnalazioni
   aperte ne dichiarava sei. Le liste servono a mostrare le ultime; i conteggi
   si chiedono al database.
3. **Una percentuale su un campione minuscolo, tinta a colori, è un'accusa.**
   «0% risolte» su due segnalazioni è aritmetica esatta e informazione nulla —
   ma una scheda rossa la fa leggere come una colpa di quel quartiere. Da qui
   `CAMPIONE_MINIMO_PER_GIUDIZIO` in `lib/citystats.ts`: sotto la soglia il
   tono resta `cool`. Vale ovunque un rapporto diventi colore.
4. **Il cancello delle schermate certificava pagine che non aveva visto.** Il
   traboccamento orizzontale si misura *dentro* il `try`: se la pagina non si
   apriva, la misura non veniva presa e lo script usciva comunque 0 — cioè
   dichiarava "nessuna pagina scorre di lato" proprio sulle rotte appena
   cambiate. Ora una cattura fallita è un problema e fa uscire 1.
5. **`sm:grid-cols-2` senza `grid-cols-1` fa scorrere la pagina di lato.**
   Sotto la soglia `sm` non esiste nessun `grid-template-columns`, quindi la
   traccia implicita è `auto` — e il minimo di `auto` è il **min-content**. Un
   solo figlio con `white-space: nowrap` (qui `truncate` su «1,1 mln € · fine
   prevista 22 lug 2026», 220px inscindibili) allarga la colonna oltre il
   viewport: 33px di traboccamento a 360px in modalità semplice, invisibili a
   1280. `grid-cols-1` compila in `repeat(1, minmax(0, 1fr))`, che si stringe.
   **Metti sempre la variante di base accanto a quella con prefisso.**

   Nota di contorno: `min-w-0` sull'elemento che trabocca **non** basta —
   toglie il pavimento alla dimensione usata, non riduce il contributo di
   min-content di un testo `nowrap`. La leva sta sulla traccia, non sul figlio.

   **Corollario, pagato il 2026-07-29 su `/comunita/stanze`.** Vale anche
   quando la traccia È `minmax(0, 1fr)`: `grid-cols-2` si stringe, ma
   l'*elemento* di griglia ha `min-width: auto` e si ferma al proprio
   min-content. Aggiungere `min-w-0` all'elemento toglie quel pavimento e la
   scheda si stringe davvero — **e la pagina trabocca lo stesso**, perché una
   parola lunga e non spezzabile («conversazioni», 85px) sporge dallo span
   ristretto e finisce nello `scrollWidth`. Restringere non è far entrare.

   Le tre uscite, in ordine di onestà: **allargare la colonna**
   (`grid-cols-1 sm:grid-cols-2`), troncare, spezzare la parola. Le ultime due
   risolvono la misura peggiorando la lettura, quindi si scelgono solo se la
   prima è impossibile. A 155px quella scheda era comunque stretta: la misura
   stava segnalando un problema di leggibilità, non solo di layout.

6. **`npm run shots -- --only=...` non funziona:** npm intercetta `--only` come
   propria configurazione (`npm warn invalid config only=...`). In PowerShell
   nemmeno `--simple` e `--width` arrivano, e il sintomo è muto: lo script gira
   in modalità normale e scrive in `screenshots/wave` invece che in
   `screenshots/wave-semplice`, così si crede di aver verificato la viewport
   minima senza averla mai aperta. Chiama `node scripts/shots.mjs --simple
   --width=360`.

E una settima che non è una trappola ma una regola imparata: **due definizioni
dello stesso indicatore sono peggio di nessun indicatore.** Il tasso di
risoluzione vive ora in un posto solo (`lib/citystats.ts`, `tassoRisoluzione` e
gli elenchi di stati) perché "Stato della città" e la pagina dei quartieri, a un
clic di distanza, avrebbero potuto mostrare due percentuali diverse della stessa
città.

### Cinque trappole del consolidamento (Fase A e B)

Le prime due riguardano la **verifica**, non il prodotto: hanno prodotto
diagnosi sbagliate con dati apparentemente solidi.

1. **Una pagina non visibile non anima, e restituisce zeri plausibili.** In una
   scheda o in un pannello browser mai visualizzato
   (`document.visibilityState === "hidden"`) Chrome non chiama
   `requestAnimationFrame` **e non consegna le callback di
   `IntersectionObserver`**. Quindi `useInView` non scatta mai, e ogni
   `DisplayNumber` resta sul suo valore iniziale: **0**. Un audit ha dichiarato
   `AnimatedNumber` rotto in tutta la piattaforma sulla base di quella lettura —
   `/bilancio` a «0 mln €» con «142.000.000 €» stampato sotto. Il componente
   stava benissimo.

   La regola: **ciò che dipende da IntersectionObserver, da rAF o da una
   ScrollTimeline non si verifica leggendo il DOM.** La prova visiva di questo
   progetto è `npm run shots`, che apre un browser vero e aspetta le
   animazioni. `AGENTS.md` §5 dice già che un typecheck verde non è una prova
   visiva; nemmeno una lettura del DOM lo è.

2. **Un test che scrive senza disfare esaurisce il proprio scenario.** Gli E2E
   giravano contro il database di sviluppo: ogni esecuzione votava una domanda
   del question time e non la ritirava. Dopo quattro esecuzioni il cittadino di
   test aveva votato **tutte e quattro** le domande della sessione aperta, e
   `territorio.spec.ts` cercava un pulsante «vota questa domanda» che non
   poteva più esistere. Non bastava che i test creassero dati con titoli
   univoci: **le azioni si accumulano anche quando i dati no.** Da qui
   `prisma/e2e.db`, ricreato da `tests/e2e/global-setup.ts` a ogni esecuzione.

   Corollario, stessa famiglia: il **rate-limit dell'accesso è una `Map` in
   memoria nel processo del server**. Contro un server di lunga durata
   (`E2E_BASE_URL`) i tentativi di login si sommano fra esecuzioni finché
   l'intera suite cade su «Troppi tentativi di accesso» — un sintomo che non
   somiglia per niente alla sua causa, e che sembra un difetto dell'app.
   L'avvio automatico di Playwright parte da un processo nuovo: contatore a
   zero e database al seed.

3. **Il cancello delle schermate usciva 0 se l'accesso non riusciva.** È la
   trappola 4 dell'ondata 7 da un'altra porta: lì la cattura *falliva* e non
   veniva contata, qui non veniva **nemmeno tentata**. Se `login()` non va a
   buon fine — server ancora in compilazione, rate-limit, credenziali cambiate
   — ogni pagina autenticata veniva saltata con un avviso, nessun contatore si
   muoveva, e lo script terminava con successo: una "revisione visiva" in cui
   l'unica pagina fotografata era `/login`. Visto dal vivo mentre si portavano
   tre rotte nuove: saltate tutte e tre, uscita 0.

   La regola generale, che vale oltre questo script: **un cancello deve
   distinguere "verificato e a posto" da "non verificato".** Se le due cose
   escono con lo stesso codice, il cancello non è un cancello. Ora i salti
   fanno uscire 1.

4. **`.next` stantio fa rispondere 404 a TUTTE le rotte annidate, e sembra che
   qualcuno abbia cancellato metà applicazione.** Visto il 2026-07-29:
   `/comunita/stanze` e i quattro dettagli davano 404 — sia digitando
   l'indirizzo sia cliccando — mentre le 38 rotte a un solo segmento
   rispondevano tutte.

   **Si ripresenta a ogni ciclo di modifiche, e non è casuale.** Cancellato
   `.next`, tutte e 43 le rotte tornano verdi; si modificano otto file (nessuno
   annidato) e le rotte annidate rimuoiono. Visto tre volte nella stessa
   sessione del 2026-07-29, con due diagnosi sbagliate prima di trovarlo. Non è
   il codice: è la ricostruzione incrementale del dev server.

   **Anche gli E2E lo prendevano in pieno.** `playwright.config.ts` avvia
   `npm run dev` sulla porta 3939: processo diverso, **stessa cartella
   `.next`**. Quindi una suite poteva fallire su tre test annidati senza che
   nulla fosse rotto, e il sintomo — «Errore 404 · Pagina non trovata» sul
   dettaglio segnalazione, su `/comunita/stanze`, sul dettaglio proposta —
   somiglia moltissimo a una regressione appena introdotta.

   **Da 2026-07-29 `npm run test:e2e` cancella `.next` da sé** (`pretest:e2e`
   in `package.json`). Costa una ricompilazione a ogni esecuzione; toglie un
   rosso che non veniva dal codice, e che aveva già prodotto **due diagnosi
   sbagliate**. Un cancello che diventa rosso per una ragione estranea alla
   modifica costa molto più dei secondi che fa risparmiare, perché il tempo lo
   si perde a cercare nel diff. **Fuori dagli E2E la regola resta a mano:
   prima di cercare nel diff, cancella `.next` e rilancia.**

   `npm run shots` invece non lo vedeva: apre una parte delle rotte, e a quelle
   di dettaglio arriva *cliccando* dalla lista, mai per indirizzo. Da qui
   `npm run rotte`, che le apre **tutte** e controlla tre cose insieme: stato
   < 400, presenza di un `<h1>`, e **assenza del testo d'errore in pagina** —
   perché una pagina finita sull'error boundary risponde 200, e la `not-found`
   di Next un `<h1>` ce l'ha comunque. Un cancello che si ferma al 200
   certifica come sana un'applicazione irraggiungibile.

   La regola generale: **quando un sintomo somiglia a "abbiamo perso una
   funzionalità", prima si misura l'inventario, poi si cerca nel codice.**

5. **Una voce di menu attiva insieme al suo genitore litiga sulla pastiglia.**
   La barra laterale evidenzia con un solo elemento condiviso
   (`layoutId="side-active"`). Su una sotto-rotta come `/comunita/stanze`
   combaciano sia la sezione sia la destinazione, e due voci attive insieme se
   lo contendono. `side-nav.tsx` calcola quindi **una sola** voce attiva in
   tutta la barra.

---

## 4. Comandi

```bash
npm run dev            # sviluppo
npm run typecheck      # tsc --noEmit — sempre prima di dire "fatto"
npm run lint
npm test               # vitest
npm run test:e2e       # playwright
npm run theme:build    # ricompila il tema dopo aver toccato pistoia.ts
npm run shots          # schermate delle pagine chiave, temi chiaro e scuro
node scripts/shots.mjs --simple --width=360   # modalità semplice, viewport minima
npm run rotte          # tutte le rotte rispondono e rendono contenuto? (47 al 2026-08-03)
npm run db:reset       # ricrea il DB e ripopola i dati dimostrativi

python scripts/pdftext.py documento.pdf              # testo di un PDF
python scripts/pdftext.py documento.pdf --griglia    # (x, y, testo), per le tabelle
```

**`pdftext.py` serve alla Fase C**, dove le fonti sono PDF di ministeri e
comuni. Sola libreria standard: nessuna dipendenza aggiunta, e non serve
poppler. Esiste perché i PDF della pubblica amministrazione sbagliano in tre
modi che **non producono un errore** — restituiscono testo plausibile e
sbagliato, che è la categoria di difetti che qui costa di più:

1. **Font sottoinsiemati.** I codici partono da `<01>` in *ogni* font: una mappa
   unica li confonde, e il testo esce scambiato invece che vuoto.
2. **Font compositi a due byte** (Type0/Identity-H). Iterare i byte uno per uno
   dà tutti caratteri di sostituzione — sintomo **identico a un PDF
   scansionato**, e ha già prodotto una diagnosi sbagliata sul decreto ANCI.
3. **Array `TJ` crenati.** `[(Il )-250(Sindaco)]TJ` è la forma normale del testo
   giustificato: cercare solo `Tj` lascia passare i frammenti isolati e produce
   un documento per tre quarti mancante che sembra completo.

Quando l'estrazione di una tabella larga scollega le colonne dalle righe, usa
`--griglia` e riallinea a mano. **E se un importo non si riesce ad ancorare alla
propria riga, non si pubblica**: attribuire la cifra sbagliata a una persona è
peggio che non mostrarne nessuna.

**Tre cose imparate sulle fonti nella Fase C (2026-07-31).** Nessuna delle tre
produce un errore, e tutte e tre producono un numero plausibile.

1. **Una riprova che condivide un anello con la catena non è una riprova.** Il
   vicesindaco era stato calcolato al 55% e «confermato» trovando 5.313 in una
   tabella ministeriale — ma entrambi i percorsi passavano dal 55%: era un solo
   percorso contato due volte, e suonava più convincente proprio perché era la
   stessa affermazione. Prima di chiamare riprova un riscontro, chiedersi *quale
   anello i due percorsi non hanno in comune*.
2. **L'assenza di un dato su UNA pagina di un sito non è l'assenza del dato.**
   Il vicesindaco di Pistoia non compare sulla scheda del sindaco e compare
   nella notizia di presentazione della giunta. Una ricognizione aveva concluso
   «il Comune non lo dichiara» avendo guardato solo la prima.
3. **I file ISTAT hanno una riga di totale con età `999`**, che passa per
   numerica. Sommare tutte le righe «numeriche» restituisce il doppio esatto
   della popolazione — 177.778 invece di 88.889 — senza alcun errore.

E una regola sugli strumenti che vale oltre i PDF: **quando un PDF resiste,
cerca la versione HTML dello stesso atto** (Gazzetta Ufficiale, Normattiva)
invece di migliorare l'estrattore. Il PDF è quasi sempre la copia, non
l'originale. Normattiva risponde a `curl` con un cookie jar e serve il **testo
vigente**, che è ciò che serve quando una norma del 2000 potrebbe essere stata
modificata.

**Quattro trappole in più sulle fonti, pagate portando `/organigramma` sui dati
veri (2026-08-03).** Come le altre, nessuna produce un errore.

1. **Il corollario del PDF vale anche per le SPA: quando una pagina non ha il
   dato, cerca l'endpoint che glielo serve.** I risultati elettorali del Comune
   (Eleweb) e di Eligendo sono applicazioni JavaScript: `curl` e i lettori di
   pagina prendono il guscio, e la conclusione naturale è «il dato non è
   pubblico». Lo è: `js/locator.js` costruisce gli URL di `static_json/…`, e
   `folder.js` dice quale cartella leggere. Da lì escono 12 liste e 357
   candidati con le preferenze una per una. **Prima di dichiarare un dato
   irraggiungibile, leggi il JavaScript che lo carica.**

2. **Un dato con quattro letture plausibili è un dato che non si pubblica.**
   Per i voti del sindaco lo stesso file dà 22.512 (voti al candidato), 21.478
   (al netto dei voti al solo sindaco) e 21.572 (somma delle liste della
   coalizione); la stampa ne pubblica una quarta, 21.709. **Le percentuali
   coincidono tutte (~54,3%) e gli assoluti no** — ed è la percentuale che ti
   convince di aver capito. Quando il portale dichiara in testa «DATI NON
   UFFICIALI», quella riga è un dato anche lei.

3. **L'assenza di una persona da un elenco è un fatto, non un buco.** Quattro
   assessori su otto non compaiono in nessuna lista: non è un'estrazione
   incompleta, è che gli assessori li nomina il sindaco. Ma ne discende una
   regola di resa: **dare il numero a chi ce l'ha e lasciare vuoto agli altri
   non è neutro.** Quel vuoto si legge «questi non li ha votati nessuno», che è
   falso. È §3 (ondata 7, 3) applicata a una colonna invece che a una
   percentuale — e la conseguenza è che il campo sparisce per tutti, non che si
   riempia a metà.

4. **Uno schema che regge per otto casi su nove è una trappola, non uno
   schema.** I recapiti degli otto assessori sono tutti
   `iniziale.cognome@comune.pistoia.it`; il sindaco è
   `sindaco@comune.pistoia.it`. Chi avesse dedotto dal modello avrebbe sbagliato
   **proprio la persona più in vista**. I recapiti si leggono dalla pagina che
   li pubblica, uno per uno, sempre.

E una che non è una trappola ma un modo di sbagliare diagnosi: **quando due
estrazioni della stessa pagina divergono, guarda prima se stanno descrivendo due
cose diverse.** Le «due versioni delle deleghe di Stefania Nesi» che avevano
fatto omettere l'intero elenco da `/trasparenza/costo-amministrazione` erano il
**titolo** della scheda e l'**elenco enumerato** sotto: il sommario e il
portafoglio, non due versioni in disaccordo. Dettaglio in
`docs/fonti-organigramma.md` §1.1.

**Le opzioni dello script delle schermate vanno passate a `node`, non a `npm`.**
In PowerShell `npm run shots -- --simple --width=360` non le fa arrivare (e
`--only` viene proprio intercettato da npm come sua configurazione: `npm warn
invalid config only=...`). Il sintomo è muto — lo script gira in modalità
normale e scrive in `screenshots/wave` invece che in `screenshots/wave-semplice`
— quindi si crede di aver verificato la viewport minima senza averla mai aperta.

**Gli E2E vogliono la directory libera.** Next rifiuta due dev server sullo
stesso progetto, quindi con un `npm run dev` aperto l'avvio automatico di
Playwright fallisce sempre. **Spegni il dev server** e lancia `npm run test:e2e`:
Playwright avvia il proprio processo contro `prisma/e2e.db`, ricreato e
riseminato da `tests/e2e/global-setup.ts`. Riferimento: 11/11 in ~50s.

Lo script cancella `.next` prima di partire (`pretest:e2e`), per la ragione
scritta in §3, trappola 4 della Fase A/B: la suite condivide quella cartella con
il dev server e la ricostruzione incrementale rompe le rotte annidate. Il conto
è ~40s di ricompilazione in più a esecuzione, e il primo `npm run dev`
successivo riparte anch'esso da freddo.

`E2E_BASE_URL` esiste ancora ma **non è la scorciatoia che sembra**: punta la
suite al server di sviluppo, quindi condivide il DB di sviluppo *e* il
rate-limit dell'accesso, che è una `Map` in memoria in quel processo. Sono le
due cause della trappola §3 (Fase A, 2): i voti si accumulano fino a esaurire lo
scenario, e i tentativi di login si sommano finché l'intera suite cade su
«Troppi tentativi di accesso». Usarlo per "aggirare" il conflitto di porta
significa riaprire esattamente il difetto che l'isolamento ha chiuso.

`npm run shots` **misura anche il traboccamento orizzontale** e esce con codice
1 se una pagina scorre di lato. È l'unico difetto di layout che una schermata a
piena pagina non mostra: il viewport si allarga fino a contenerlo e lo fa
sparire.

**`shots` accede da CITTADINO, `rotte` da ADMIN — e non è un dettaglio.** Una
rotta `/admin/*` aggiunta a `shots.mjs` non fallisce: `requireAdmin()`
reindirizza a `/la-mia-citta` e lo script fotografa **la home spacciandola per
la pagina admin** — un cancello che certifica una pagina mai vista (visto
accadere il 2026-08-03 con `/admin/codici-qr`). Le rotte admin si aggiungono a
`rotte.mjs` e si **escludono dichiarandolo** da `shots.mjs`, finché lo script
non imparerà un passaggio da admin (ondata 8).

**Tre cose di R-3 che valgono per qualunque lavoro futuro (2026-08-03):**

1. **`/v/` è il prefisso pubblico di ciò che arriva da fuori** (QR, link nelle
   email). `src/proxy.ts` protegge `/valutazioni` col cookie di sessione:
   un atterraggio di posta messo lì sotto finisce al login, perché chi clicca
   dalla propria casella una sessione non ce l'ha. Prima di aggiungere una
   rotta raggiunta da un link esterno, controlla `PROTECTED_PREFIXES`.
2. **In locale le email sono FILE in `.email/`** (`src/lib/email.ts`): l'E2E
   le legge per «riceverle», `tests/e2e/global-setup.ts` svuota la cassetta a
   ogni esecuzione (le azioni si accumulano anche quando i dati no), e in
   produzione l'invio **si rifiuta** finché non esistono dominio e provider
   (decisione 2026-08-03, `docs/piano-rating-servizi.md` §8). Non introdurre
   un mailer: la base c'è già.
3. **Conferma e revoca dai link delle mail sono azioni di form, MAI effetti
   del GET**: i filtri antispam aprono i link per ispezionarli, e un GET che
   muta agisce al posto della persona.

Se il dev server si comporta in modo assurdo (moduli non trovati, panic di
Turbopack, azioni server che falliscono in silenzio): **cancella `.next` e
riavvia**. Succede dopo un cambio di dipendenze ed è costato un'ora una volta.

---

## 5. Verifica — cosa significa "fatto"

Una modifica è finita quando **tutte** queste sono vere:

- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] I test esistenti passano
- [ ] `npm run rotte` è verde — **0 con problemi**, qualunque sia il totale
      (47 al 2026-08-03; il numero cresce a ogni rotta nuova, e va letto dallo
      script, non da qui). È l'unico cancello che risponde
      alla domanda «abbiamo perso una funzionalità?», e l'unico che apre le
      rotte annidate per indirizzo invece che cliccandole
- [ ] L'hai **guardata**: `npm run shots`, o il browser, in tema chiaro **e**
      scuro. Un typecheck verde non è una prova visiva.
- [ ] Funziona da tastiera e il focus è visibile
- [ ] Regge la **modalità semplice** — `npm run shots -- --simple --width=360`,
      che è anche il controllo del traboccamento orizzontale alla viewport minima
- [ ] `prefers-reduced-motion` non lascia contenuto invisibile o inaccessibile

Sulle schermate: le animazioni d'ingresso durano fino a ~2,2s e i grafici si
rivelano allo scroll. Uno screenshot troppo presto, o senza scorrere la pagina,
fotografa grafici a metà o vuoti e sembra un bug che non c'è. `scripts/shots.mjs`
gestisce già entrambe le cose.

---

## 6. Stile del codice

- **Commenti**: si spiega il *perché*, mai il *cosa*. In italiano, come il
  resto. Un commento che ripete il nome della funzione è rumore; un commento che
  spiega perché una scelta apparentemente strana è necessaria vale dieci righe
  di codice.
- **Nomi**: italiano per il dominio civico (`segnalazione`, `quartiere`,
  `opera`), inglese per l'infrastruttura (`ThemeProvider`, `useInView`).
- **Server Components di default.** `"use client"` il più in basso possibile
  nell'albero, mai sul layout.
- **Motion**: importa da `motion/react`. È già in progetto ed è l'unica libreria
  che porta le animazioni legate allo scroll sulla ScrollTimeline nativa.
- Rispetta le convenzioni del file che stai modificando prima delle tue.

---

## 7. Interazione con Lorenzo

- **Non dare per scontato: chiedi.** Il processo di questo progetto è
  esplicitamente guidato dalla scoperta (vedi `DISCOVERY.md`). Quando due
  letture di una richiesta portano a lavori diversi, chiedi prima di costruire.
- **Riporta con onestà.** Se un test fallisce, dillo con l'output. Se hai
  saltato una parte, dillo e spiega perché. Mai dichiarare finito ciò che non
  hai verificato.
- **Segnala i costi, poi procedi.** Se una richiesta ha un problema reale,
  dillo in una o due frasi e continua a costruire sotto ipotesi dichiarate.
  Ridurre l'ambito è una decisione sua, non tua.
- Le decisioni già prese non si rimettono in discussione: sono in `DISCOVERY.md`
  e in `DESIGN.md`.
