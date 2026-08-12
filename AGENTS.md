# AGENTS.md — regole operative permanenti

> Questo file esiste perché Lorenzo non debba ripetere le stesse istruzioni a
> ogni sessione. Vale per qualunque agente (Claude Code o altro) lavori su
> questo repository.
>
> **Leggilo per intero all'inizio di ogni sessione, prima di toccare codice.**
>
> Aggiornato: 2026-08-12 (**la ricognizione col browser**: il pannello Browser
> non composita senza schermo — si fotografa col DevTools MCP e `filePath`; i
> banner dei consensi possono vivere in shadow DOM; i muri «accetta o paga» si
> saltano e si dichiara). Prima: 2026-08-11 (**il tema civico «Sociale e casa»**, deciso misurando
> quanti contenuti *esistenti* ogni tema candidato coprirebbe · **la pipeline
> degli atti che gira da sola**, senza browser — `npm ci` non installava i
> binari, quindi in produzione sarebbe morta al primo scatto · le cinque
> trappole nuove di §3: *`comando | tail` restituisce l'exit code di `tail`,
> quindi un cancello rosso si legge verde*, *a macchina carica gli E2E cadono e
> i rossi somigliano a una regressione*, *il pacchetto npm non è il browser*,
> *un riconoscitore tarato sulla forma immaginata di una risposta certifica sé
> stesso*, *un giro incrementale su un archivio vuoto si dichiara fresco*).
> Prima: 2026-08-09 (**la pipeline degli atti e i due cancelli mancanti** — console e contenimento, entrambi provati rossi prima di essere dichiarati verdi · le cinque trappole nuove di §3: *un id distinto al 100% può non essere un'identità*, *il WAF blocca sullo user-agent e risponde 500*, *due griglie dello stesso portale possono non avere le stesse colonne*, *il `content-type` può mentire*, *`evaluateAll` non aspetta e su una lista vuota tace*. Prima, lo stesso giorno: analytics operative e moderazione assistita · review «lenti mancanti»)

---

## 0. In trenta secondi

Piattaforma civica per il Comune di Pistoia: bilancio, opere, segnalazioni,
partecipazione. **Next.js 16** (App Router) · React 19 · TypeScript · Tailwind
v4 · **Astryx** (design system Meta) · Prisma 7 + SQLite · Motion 12.
Interfaccia e documentazione **in italiano**. Dati dimostrativi, autenticazione
reale.

L'app vive in `pistoia-dashboard/`. La documentazione vive nella radice.
**Il progetto è deployato su Coolify**, in rete locale: vedi §8.

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

> §3 raccoglie **cinquantuno trappole già pagate**. Sono raggruppate per ondata
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

   **Pagata di nuovo il 2026-08-04, e questa volta era VECCHIA**: la griglia
   due-colonne del `/digest` (`lg:grid-cols-2` senza base) traboccava a 360px
   da sempre — ma il digest non era mai stato in `shots`, quindi nessun
   cancello l'aveva misurata. È entrato in lista insieme alla card di R-5, e
   il difetto è emerso al primo giro. Corollario operativo: **quando una
   pagina entra per la prima volta in un cancello, i rossi possono essere
   suoi di nascita, non della modifica che ce l'ha portata.**

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

### Quattro trappole della Fase C (la pagella e la qualità continua 2026-08-05, il footer 2026-08-05)

1. **Il JSX di questo Next può mangiare lo spazio fra un'espressione e il
   testo che segue.** `da {VOTO_MIN} a {VOTO_MAX} ed è un conteggio…` è
   arrivato a schermo come **«da 1 a 10ed è»**: lo spazio dopo `{VOTO_MAX}`
   c'era nel sorgente (U+0020 verificato byte per byte), typecheck e lint
   verdi, e la stessa pagina rendeva bene giunzioni identiche a poche righe
   di distanza (`v{VERSIONE} con registro`, `{totale} hanno già voti`) —
   quindi **non è prevedibile dal pattern e non ci si può fidare della
   propria memoria di come funziona JSX**. La regola: al confine fra
   un'espressione e il testo, lo spazio si scrive esplicito — `{" "}` — che è
   la convenzione già usata in tutto il repository. La verifica che l'ha
   trovato è quella di §5 («l'hai guardata»); la conferma rapida sul DOM è
   una scansione delle fusioni cifra-lettera:
   `document.body.innerText.match(/\d[a-zà-ù]/g)`.

   Nota di contorno vista nella stessa sessione: nel DOM del dev server ogni
   rotta può avere una **seconda copia nascosta e `inert`** del proprio
   contenuto (fuori da `<main>`, framework, invisibile e fuori
   dall'accessibilità). Un controllo che conta i nodi (`querySelectorAll`)
   senza filtrare per visibilità conta doppio e sembra un bug che non c'è.

2. **Uccidere `npm run dev` non uccide `next dev`, e il superstite avvelena
   gli E2E.** Fermare il comando (dal gestore dei task o dallo strumento di
   un agente) termina il wrapper npm, ma il figlio —
   `node next/dist/server/lib/start-server.js` — **resta vivo e in ascolto
   sulla 3000**. Verificato il 2026-08-05: porta ancora occupata dopo lo
   stop, con quella riga di comando.

   Il danno non è la porta, è la **cartella `.next` condivisa**: il
   superstite continua a ricostruirla mentre `pretest:e2e` la cancella e il
   server di Playwright (3939) la riempie da capo. Risultato: **5 test su 25
   caduti in specifiche scorrelate** — login, moderazione, trasparenza,
   valutazioni — che somigliano a una regressione appena introdotta. Non lo
   erano: rilanciata la suite a porte libere, quelle cinque passano.

   Il segno che distingue questo caso da un guasto vero: **sono tutti
   timeout**. Nessuno afferma un contenuto sbagliato; il pulsante del login
   resta su «Accesso in corso…», i test lunghi sforano i 30s. Quando i rossi
   sono tutti d'attesa e mai di merito, il sospetto è l'ambiente, non il
   diff.

   Prima di lanciare `npm run test:e2e`, **pretendi le porte libere**:

   ```powershell
   Get-NetTCPConnection -State Listen -LocalPort 3000,3939 -ErrorAction SilentlyContinue
   ```

   È la stessa famiglia della trappola 4 della Fase A/B (`.next` stantio) e
   della regola di §4 «gli E2E vogliono la directory libera» — ma con una
   causa che non si vede: il dev server che credi spento.

3. **Il reset di Astryx batte l'ereditarietà anche per `font-size`, non solo
   per il colore.** La trappola 3 dell'ondata 6 diceva che una dichiarazione
   su `:where(p)` vince su un valore *ereditato* dal genitore, e la raccontava
   col colore. Vale identica per la dimensione: `themes/generated/pistoia.css`
   dichiara `font-size: var(--font-size-base)` su `:where(p)`, quindi

   ```html
   <div class="text-xs">     <!-- calcola 12px -->
     <p>Dashboard di Pistoia</p>   <!-- rende 15px -->
   </div>
   ```

   Il footer ci è vissuto dentro per mesi: il blocco d'identità rendeva a
   **15px** contro i 12px dei link accanto, cioè con la gerarchia rovesciata —
   il testo meno informativo era il più grande. Typecheck verde, lint verde, e
   a occhio sembra solo «un po' sbilanciato».

   La regola: **la classe di dimensione va sull'elemento che porta il testo,
   mai su un contenitore che conta di passarla per eredità.** Una classe
   sull'elemento ha specificità (0,1,0) e batte `:where(…)`; l'eredità no.
   Il controllo che lo trova, su una pagina qualunque:

   ```js
   [...document.querySelectorAll('p')].filter(p =>
     parseFloat(getComputedStyle(p).fontSize) >
     parseFloat(getComputedStyle(p.parentElement).fontSize) + 0.5)
   ```

4. **Il cancello axe NON copre la dimensione dei bersagli.**
   `accessibilita.spec.ts` gira sulle regole taggate `wcag2aa` e `wcag21aa`,
   e `target-size` è **WCAG 2.2**: resta fuori, in silenzio. I link del
   footer erano alti **16px** — contro i ≥44px che `DESIGN.md` §11.6 dichiara
   vincolanti e i 24 del minimo WCAG 2.2 — su **ogni pagina della
   piattaforma**, e nessun cancello ha mai avuto niente da ridire.

   La regola generale, che vale oltre questo caso: **un cancello automatico
   copre le regole che gli hai chiesto, non la promessa che hai scritto in un
   documento.** Quando `DESIGN.md` §11 dichiara un vincolo, chiediti da quale
   riga di quale script verrebbe misurato — e se la risposta è «nessuna»,
   quel vincolo si verifica a mano o non si verifica.

5. **Un componente che vive in colonne di larghezza diversa non può usare
   `sm:` e `lg:`**, perché quelle guardano la **finestra**, non lo spazio che
   ha davvero. Il footer sta in ~850px dentro `AppShell`, in **640px** sulle
   pagine legali (`max-w-2xl`): con `lg:flex-row` a 1440px di finestra la
   variante scattava **anche nella colonna stretta**, e lì i 640px si
   dividevano in 320 d'identità più due colonne da **~82px**. «FAQ della
   città» andava a capo, «IL PROGETTO» pure.

   La leva è `@container` (Tailwind v4 ce l'ha nativo: `@container` sul
   contenitore, poi `@sm:`, `@3xl:` sui figli), che misura la larghezza del
   componente. Misurato dopo: 263px per colonna invece di 82.

   **Il difetto non produce traboccamento**, quindi `shots` esce 0 e i test
   passano: il testo va a capo, non fuori. **L'ha trovato la casella «l'hai
   guardata» di §5**, aprendo `screenshots/wave/privacy-light.png`. Corollario:
   quando aggiungi un componente condiviso, chiediti in **quante larghezze
   diverse** viene reso — se sono due, le varianti di finestra sono già
   sbagliate.

   Nella stessa schermata, un secondo difetto della stessa natura: un'icona
   messa come **elemento flex accanto** a una frase lunga, in colonna stretta,
   finisce **da sola su una riga** e sembra un guasto. Dentro una frase le
   icone si scrivono `inline-block`, così scorrono come una parola.

### Tre trappole del cancello dei bersagli (2026-08-07)

Hanno in comune la stessa forma delle altre: **nessuna produce un errore**, e
tutte e tre riguardano ciò che un cancello verde *non* stava guardando.

1. **Motion mette `tabindex="0"` su qualunque elemento con `whileTap`**, perché
   il gesto possa partire anche da tastiera. Se quell'elemento è un'icona
   **dentro** un pulsante — come in `ConfirmButton`, `SupportButton` e
   `PostCard` — il risultato è una **fermata di tabulazione in più, senza nome
   accessibile**, per ogni scheda in lista: **42 su `/segnalazioni`**. Il
   sorgente non ha traccia di `tabIndex`, quindi cercarlo nel proprio codice
   non serve a niente; e axe non lo dice, perché uno `<span tabindex=0>` senza
   ruolo non viola nessuna sua regola. Si chiude scrivendo `tabIndex={-1}`
   esplicito: Motion lo rispetta.

   La regola generale: **quando una libreria di animazione tocca un elemento,
   chiediti quali attributi ci mette lei.** Il DOM reso non è il JSX scritto.

2. **Un `<details>` chiuso è un pezzo di pagina che nessun cancello misura.**
   Su `/admin` sono **42 bersagli su 222**; sul bilancio, dentro «Vedi le
   proporzioni e l'elenco», ci vivevano **due violazioni axe serious**
   preesistenti — sei barre di avanzamento senza nome accessibile e una
   percentuale sotto il contrasto AA — che il cancello a11y non aveva mai
   visto in tre mesi. Da qui `posata()` (in `tests/e2e/helpers.ts`) **apre
   tutti i `<details>` prima di misurare**, e i due cancelli ci hanno guadagnato
   copertura insieme.

   È la stessa famiglia del corollario dell'ondata 7: **quando una superficie
   entra per la prima volta in un cancello, i rossi possono essere suoi di
   nascita.** Vale per le pagine e vale, identico, per gli stati.

3. **Aggiungere test che fanno l'accesso può sfondare il tetto per IP, e il
   sintomo somiglia a un guasto dell'autenticazione.** `loginAction` ha tre
   limiti a finestra di 15 minuti; due si azzerano quando l'accesso riesce, ma
   il terzo — **40 tentativi per indirizzo IP** — no. Entrando i 22 casi di
   `bersagli.spec.ts`, la suite è passata da ~25 accessi a ~45 dallo stesso
   127.0.0.1: **quindici test sono caduti insieme**, tutti dopo il quarantesimo,
   tutti con «resto su /login».

   Il segno che lo distingue: i rossi sono **contigui nell'ordine di
   esecuzione** — moderazione e segnalazione passano, territorio in poi cade —
   e nessuno afferma un contenuto sbagliato. Un guasto vero non aspetta il
   quarantesimo accesso per manifestarsi.

   **La risposta non è alzare il tetto**: è una difesa vera, e §2 dice di non
   disattivare un controllo per far passare qualcosa. `login()` ora **riusa la
   sessione** già ottenuta per quel conto (una `Map` in `helpers.ts`, che vive
   quanto il worker); il percorso vero lo prova `auth.spec.ts` con
   `accediDalModulo()`, una volta. Accessi reali per esecuzione: **da ~45 a 4**.
   La suite ci ha anche guadagnato un minuto e venti.

### L'affordance affidata all'`:hover` (2026-08-07)

**Un controllo che si riconosce solo al passaggio del mouse, su un telefono non
si riconosce mai.** `.btn-ghost` era il solo `color: var(--muted)`: a riposo
identica a del testo muto, e il segnale che fosse un pulsante arrivava con
l'`:hover`. Su `/admin` erano **13 controlli**, fra cui «Rispondi» e «Segnala
alla redazione» — le due azioni principali della lista delle valutazioni.

**Nessun cancello lo misura, e nemmeno può.** Quei 13 erano **già alti 44px**:
il cancello dei bersagli li vedeva e li approvava, correttamente, perché misura
la *dimensione*. Axe non ha una regola per «sembra un controllo». È una
categoria che oggi si trova solo guardando — ed è stata trovata così.

La regola: **il `:hover` non è un canale, è un rinforzo.** Tutto ciò che dice
«questo si può premere» deve esserci a riposo. Il corollario di scala:
quando si alza un gradino (qui `ghost` prende un bordo tenue), si controlla
che non collassi su quello sopra — `secondary` tiene `--border-strong`, `ghost`
`--border`. Stessa lezione di `.btn-sm` salito a 44px, applicata alle varianti
invece che alle taglie.

### Due trappole delle porte (2026-08-07)

Trovate **guardando le pagine una per una**, non da un cancello — e la prima
spiega perché nessun cancello poteva trovarla.

1. **Tutti i cancelli arrivano alle pagine PER INDIRIZZO, nessuno cliccando.**
   `rotte.mjs` fa `goto()`, `accessibilita.spec.ts` e `bersagli.spec.ts` pure.
   Quindi `/redazione` è vissuta senza **nessun collegamento in tutta
   l'applicazione** — zero `href`, solo il prefisso nel proxy e tre
   `revalidatePath` — con tre cancelli verdi sopra. Il moderatore doveva
   digitare l'indirizzo per aprire la propria unica superficie di lavoro, e una
   volta lì la barra non aveva **nessuna voce attiva**.

   È lo specchio esatto della trappola 4 della Fase A/B: là `shots` non vedeva
   le rotte annidate rotte *perché ci arrivava cliccando*, e `rotte` è nato per
   aprirle per indirizzo. Qui mancava l'altro verso. Da qui
   `tests/e2e/porte.spec.ts`, che prova la **regola** — ogni ruolo con una
   superficie riservata ha una voce che ce lo porta — e non le due rotte di
   oggi.

   La regola generale: **«la pagina risponde» e «si può arrivare alla pagina»
   sono due domande diverse**, e finora ne misuravamo una sola.

2. **Una voce di navigazione non è «aggiunta» finché non dichiari a quali
   larghezze esiste.** La barra laterale è `lg:block`: sotto i 1024px non c'è, e
   la barra in basso porta solo le cinque destinazioni pubbliche. Una voce messa
   lì e basta lascia il telefono esattamente com'era. L'admin non se n'era
   accorto perché «Area Comune» sta **anche** nel menu del profilo, che vive
   nella barra in alto a ogni larghezza — ed è l'unica porta possibile a 375px.

### Quattro trappole del taglio di `/admin` (2026-08-07)

Tutte e quattro trovate **misurando o guardando dopo aver scritto il codice**,
non prima: nessuna produce un errore, e in due casi il ragionamento che le aveva
introdotte suonava giusto ad alta voce.

1. **Un contatore dentro un `layout.tsx` non si aggiorna, e mente.** Nell'App
   Router un layout condiviso **non si ri-renderizza** quando si naviga fra due
   sue figlie: il server manda solo i segmenti cambiati. Una navigazione con i
   contatori delle code messa nel layout di `/admin` mostrerebbe quindi i numeri
   del **primo** caricamento — «3 domande in attesa» ancora lì dopo averle chiuse
   tutte e tre — e il difetto non somiglia a un problema di cache: somiglia a un
   contatore sbagliato. Sta **dentro ogni pagina**, che è dinamica e si rifà a
   ogni navigazione. Il prezzo è una riga ripetuta in sette file, e si vede.

   Corollario sulle azioni: dopo il taglio, `revalidatePath("/admin")` è muto per
   sei rotte su sette. Serve **il sottoalbero** —
   `revalidatePath("/admin", "layout")`, incapsulato in `rivalidaAreaComune()` —
   perché i contatori si vedono da ogni pagina dell'area: elencare a mano quali
   rotte tocca ciascuna azione sarebbe una seconda mappa da tenere allineata a
   quella vera.

2. **Togliere un riquadro che scorre non sposta lo scorrimento: lo moltiplica.**
   Il triage delle segnalazioni viveva in un `max-h-[36rem] overflow-y-auto`, e
   la prima stesura del taglio l'ha tolto ragionando che «adesso la pagina è sua,
   e a scorrere è la pagina». Misurato subito dopo: **5.000px** con le 14
   segnalazioni aperte del seed, cioè quella pagina da sola più alta di quanto il
   piano prevedesse per l'intera area, e più del triplo della coda peggiore. Il
   riquadro è tornato. La regola generale: **un contenitore che limita l'altezza
   non è un ripiego da eliminare quando si guadagna spazio — è ciò che rende
   lineare una lista che cresce**, e va tolto solo insieme al rimedio vero
   (lista + dettaglio), mai da solo.

3. **Un contatore onesto rivela una lista troncata, ed è il suo secondo mestiere.**
   Il primo caricamento della pagina delle valutazioni ha detto **32** dove la
   lista ne mostra **6**: `getRecensioniRecenti()` tronca a sei da sempre, e le
   altre 26 non erano raggiungibili da lì. Nessuno lo sapeva perché **nessuno
   contava** — la stessa asimmetria della trappola 2 dell'ondata 7, presa
   dall'altro verso: là il conteggio veniva dalla lista e mentiva, qui il
   conteggio è vero e ha smascherato la lista. Quando si aggiunge un contatore a
   una superficie che mostra un `take`, **il primo numero che esce è una
   diagnosi**, non una conferma.

4. **`shots` fotografava una 404 e usciva 0**, perché l'atterraggio non la vede.
   Il controllo che difende le pagine per ruolo confronta l'**indirizzo**: una
   404 di Next però *sta* sull'indirizzo chiesto, quindi passava. Visto dal vivo
   subito dopo aver portato le sei sottopagine nella lista: `admin-domande` è
   stata catturata come «Errore 404 · Pagina non trovata», e lo script ha
   dichiarato la revisione visiva riuscita.

   ⚠️ **E il momento in cui capita non è raro: è quello standard.**
   `npm run test:e2e` **cancella `.next`** (`pretest:e2e`) e il server di
   Playwright la ricostruisce sulla 3939; il primo `npm run dev` successivo
   riparte in ricostruzione incrementale, ed è lo stato in cui le rotte
   **annidate** rispondono 404 (trappola 4 della Fase A/B). Chi lancia i
   cancelli nell'ordine naturale — E2E, poi dev, poi `shots` — ci passa in
   mezzo **ogni volta**.

   Chiuso portando in `shots.mjs` il controllo che `rotte.mjs` ha da sempre: non
   basta lo stato, non basta l'indirizzo — **si guarda se il testo d'errore è in
   pagina**. La regola generale è quella di §3 (Fase A/B, 3), che qui torna da
   una terza porta: *un cancello deve distinguere «verificato e a posto» da «non
   verificato»*. E il messaggio dice cosa fare, perché la diagnosi è sempre la
   stessa: cancella `.next` e rilancia **prima** di cercare nel diff.

### Tre trappole di «lista + dettaglio» (2026-08-07)

1. **Un dettaglio che interroga la propria coda risponde 404 quando l'azione
   RIESCE.** Ogni azione dell'area toglie la voce dalla coda — si risolve una
   segnalazione, si risponde a una domanda, si approva una proposta, si replica
   a una recensione — e `revalidatePath` ridisegna subito la pagina. Se
   `getSegnalazioneDaTriare(id)` filtrasse per «aperta», l'operatore vedrebbe
   una pagina d'errore **esattamente nel momento in cui ha fatto la cosa
   giusta**, con un sintomo che somiglia a un guasto e non a un successo. I
   dettagli si prendono **per id e senza filtro**; è la lista che filtra, e la
   pagina dice da sé che la voce è uscita (`FuoriDallaCoda`).

2. **Tailwind v4 compila solo le classi che trova nel SORGENTE, quindi un
   mockup iniettato a runtime può mentire senza un errore.** Portando le tre
   forme candidate sull'applicazione vera, `lg:grid-cols-[minmax(0,16rem)_…]` e
   `max-h-[34rem]` non esistevano in nessun file: nessun CSS generato, nessun
   avviso, e la variante a **due colonne è stata fotografata impilata** — cioè
   la schermata su cui si stava per decidere mostrava una cosa diversa da quella
   proposta. La regola: **nei mockup iniettati, tutto ciò che non è già nel
   repository si scrive come stile in linea.** Vale anche per le sonde: una
   classe arbitraria aggiunta da `javascript_tool` non ha effetto.

3. **Un controllo può uscire dal proprio contenitore senza che nessun cancello
   lo veda.** I due pulsanti dell'urgenza affiancati misurano **301px** contro i
   239 del riquadro rosso che li ospita: «Flusso ordinario» sporgeva di **62px**
   e la card lo ritagliava. `shots` misura il traboccamento **della pagina**, che
   resta zero perché la card ha `overflow` nascosto; `bersagli` misura la
   **dimensione**, e quei pulsanti sono a norma (44px); axe non ha una regola per
   «tagliato». È la stessa famiglia dell'affordance affidata all'`:hover`: una
   categoria che oggi si trova **solo guardando**, e che varrebbe un cancello suo
   — *nessun controllo esce dal proprio contenitore*.

   ✅ **Quel cancello esiste dal 2026-08-09**: `tests/e2e/contenimento.spec.ts`,
   21 pagine × 2 viewport, bloccante, elenco delle eccezioni **vuoto**. La
   distinzione che lo rende usabile invece che rumoroso: **un contenitore che
   scorre non ritaglia niente** — il rosso scatta solo quando l'antenato ha
   `overflow: hidden`/`clip` sull'asse su cui il controllo sporge, cioè quando
   la parte fuori è **irraggiungibile**. È §3 (Fase A/B, 3) applicata allo
   spazio invece che al tempo: *fuori vista* e *fuori portata* non sono la
   stessa cosa. Alla prima accensione **0 rossi su 42 casi** — il difetto dei
   62px era già stato chiuso — quindi è stato **provato rosso di proposito**,
   nei due versi: un pulsante ritagliato lo becca (62px, lo stesso numero del
   difetto vero), due pulsanti dentro un riquadro che scorre **no**.

### Un consiglio che non si può seguire è peggio del silenzio (2026-08-09)

Pagata costruendo la moderazione assistita. Il suggerimento di categoria era
finito sul **triage del Comune**, che è dove sembrava servire: chi decide è lì.
Ma quel modulo cambia **stato, ufficio e nota** — e basta: **la categoria la
sceglie il cittadino e nessuna superficie del Comune la modifica** (verificato
su `updateReportStatusAction` e su ogni azione che tocca `category`).

Il blocco avrebbe detto all'operatore «il testo somiglia a *parchi*» davanti a
un modulo dove *parchi* non si può scegliere: una discrepanza visibile e non
risolvibile, su una superficie di lavoro. **Peggio del silenzio**, perché il
silenzio non chiede niente.

⚠️ **Il sintomo non somigliava alla causa.** Il difetto si è manifestato come
«il suggerimento non compare mai» — che sembrava un problema dell'euristica, e
in parte lo era (tace quando conferma la scelta già fatta, quindi parla solo sul
14% dei casi). È stato aprendo il modulo per capire quel silenzio che è emersa
la cosa vera: non c'era la leva.

La regola generale: **prima di mettere un suggerimento su una superficie,
chiediti quale controllo lo rende seguibile.** Se non c'è, il suggerimento va
dove il controllo è — qui il modulo del cittadino, che la categoria la sceglie
davvero — oppure non va.

E il corollario che è venuto dalla stessa sessione: **le prove di un
suggerimento sono le parole della persona, non i token del codice.** Mostravamo
«cassonett», il troncamento con cui la spia tiene insieme singolare e plurale:
onesto e illeggibile, e su una superficie pubblica un artefatto che pare un
refuso mina proprio la fiducia che il suggerimento vuole costruire.
⚠️ Nel correggerlo è entrato un difetto nuovo, trovato **dal test e non
guardando il codice**: in `\p{L}\p{N}` non ci sono i segni combinanti (sono
`\p{M}`), quindi un accento **decomposto** vale da separatore e «velocità»
usciva «velocita», con l'accento tagliato via.

### `undefined` in un `where` di Prisma non è «nessuna riga»: è «nessun filtro» (2026-08-08)

Trovata dalla review «lenti mancanti». **Una Server Action è un endpoint HTTP
pubblico**: chi conosce il suo id — sta nel bundle client — può invocarla con
qualunque argomento, e la firma TypeScript non vale al confine di rete. Gli
argomenti *legati* con `.bind()` Next li cifra, ma l'azione resta invocabile
per conto proprio.

Da sola sarebbe una nota da manuale. Diventa una trappola perché si incrocia
con Prisma, che **lascia cadere i campi indefiniti** dal `where`. Misurato sul
database di sviluppo, in una transazione ribaltata:

```
deleteMany({ where: { token: "non-esiste" } })  → cancellate 0
deleteMany({ where: { token: undefined     } })  → cancellate 3 su 3
```

La seconda riga **non dà errore e non lascia traccia**. `rimuoviPromemoriaAction`
— senza sessione, come tutte le azioni a token — bastava invocarla senza
argomenti per svuotare l'intera tabella dei promemoria.

⚠️ **Le sorelle non si comportano allo stesso modo, e questo confonde la
diagnosi.** `findUnique({ where: { confermaToken: undefined } })` **rifiuta**
con `PrismaClientValidationError`: lì lo stesso difetto è un 500, non una
cancellazione. Chi provasse la famiglia partendo da `findUnique` concluderebbe
che Prisma si difende da sé.

La regola: **gli argomenti di una Server Action si guardano PRIMA della query,
non dentro** (`lib/token.ts`: `tokenValido`, `idValido`). Vale per i token,
per gli id nudi e per gli enum — `toggleFollowAction` accettava qualunque
stringa come `targetType` perché `FollowTarget` è un tipo, e un tipo non
attraversa la rete.

### La preferenza di movimento letta in fase di render (2026-08-08)

**`useReducedMotion()` è `null` sul server e `true` sul browser di chi ha la
preferenza attiva**, perché il server non ha media query. Qualunque ramo del
markup su quel valore serve quindi un HTML diverso da quello che verrà
idratato. Su `/bilancio` erano **due errori a ogni caricamento**:

1. Il **mismatch di idratazione** vero e proprio: `ScrollTold` rendeva la barra
   di avanzamento con `{!reduce ? … : null}`, quindi il server la metteva
   (`reduce` era `null`) e il browser no.
2. **«Target ref is defined but not hydrated»**, che è il primo per **cascata**
   e non per conto proprio: `ScrollStep` chiamava `useScroll({ target: ref })`
   sempre, ma con `reduce` vero tornava presto su un `<div>` semplice che il
   `ref` non lo montava. Motion aspetta un microtask, poi lancia.

⚠️ **Il sintomo si vede SOLO con la preferenza attiva**, ed è lo stato in cui
girano `accessibilita.spec.ts` e `bersagli.spec.ts` — che infatti li scrivevano
nel proprio log, quattro volte, mentre uscivano verdi: **nessun test guarda la
console**. Aprire `/bilancio` in un browser normale non mostra niente.

Le due leve sicure, e servono tutte e due:

- **La durata** (`transition={{ duration: reduce ? 0 : 0.5 }}`) non finisce nel
  DOM servito. Sempre lecita, ed è ciò che rende l'ingresso istantaneo.
- **Il CSS** (`@media (prefers-reduced-motion: reduce)`) lo serve identico a
  tutti, ed è il browser a decidere se applicarlo. In `globals.css` la regola su
  `[data-motion-reveal]` sta **accanto a quella di stampa**, perché il problema
  è lo stesso — una rivelazione che non può o non deve avvenire.

Ciò che non si fa è `initial={reduce ? false : {…}}`: **`initial` è markup.**
Motion lo scrive nello style servito, e il ramo lo fa divergere. Erano sei
punti in cinque componenti — `scroll-told`, `sankey-flow`,
`dot-scatter-timeline`, `line-chart`, `display-number`, `cronoprogramma-chart` —
e ognuno spegneva il successivo, perché React riporta **un solo** mismatch per
albero: fissarne uno faceva comparire quello sotto. Il modo di lavorare che ne
esce: quando chiudi un mismatch, **rimisura subito**, perché il secondo non era
visibile finché c'era il primo.

L'eccezione dichiarata è `app/(app)/template.tsx`, che il mismatch se lo tiene e
lo dice con `suppressHydrationWarning`: lì l'animazione d'ingresso può
completarsi prima dell'hydration, quindi lo style servito non coinciderebbe
comunque.

E una **ripagata**, che era già scritta qui sopra (ondata 7, 1): passare
`ADMIN_NAV`/`REDAZIONE_NAV` da `AppShell` (Server Component) a `SideNav`
(client) significa passare `icon`, che è **un componente React**, attraverso il
confine RSC. React rifiuta a runtime — «Functions cannot be passed directly to
Client Components», con `render: function PenLine` nel messaggio — mentre
**typecheck e lint restano verdi tutti e due**. Prima non capitava perché
`ADMIN_NAV` era importato *dentro* il componente client. Si passa il **ruolo**,
una stringa, e la superficie si ricava di là.

### Quattro trappole della pipeline degli atti (2026-08-09)

Pagate leggendo il portale della trasparenza. Come sempre: **nessuna produce un
errore**, e tutte e quattro producono un risultato plausibile. Il dettaglio
misurato sta in `docs/fonti-atti.md`.

1. 🔴 **Un id distinto al 100% può non essere un'identità.** `Url atto` è pieno
   e distinto su tutte le 26.978 righe scaricate: è la chiave che chiunque
   sceglierebbe. Ma identifica la **pubblicazione**, non l'atto — lo stesso
   atto sta sull'albo e nello storico con **due id consecutivi**
   (`4758861`/`4758862`), stesso oggetto e stessi allegati. Usarlo come chiave
   porta in casa **385 doppioni**, e su un archivio civico non è un errore di
   conteggio: è la stessa delibera mostrata due volte, cioè la giunta che
   sembra aver deciso due volte la stessa cosa. L'identità vera è
   `(tipo, anno, numero)`.

   La regola generale: **prima di prendere un campo per chiave, chiediti di
   quale ENTITÀ è la chiave.** «Distinto» e «identificante» non sono la stessa
   proprietà, e la prima si misura mentre la seconda si capisce.

   Corollario pagato subito dopo: i **ripieghi** di una chiave vanno guardati
   uno per uno. Con `anno`/`numero` a zero si ripiega sulla registrazione; ma
   tre righe hanno a zero **anche quella**, e due di esse sono delibere di
   giunta **diverse** — «Pistoia Blues Festival» e «Festa europea della
   musica». Senza un terzo ripiego una delle due sparisce, in silenzio.

2. 🔴 **Il WAF blocca sullo USER-AGENT, e risponde 500.** `AGENTS.md` diceva
   «`WebFetch` prende 403, un browser vero prende 200»: vero a metà, perché un
   browser **headless** è bloccato anche lui. Con l'UA di default di Playwright
   (`HeadlessChrome/148…`) il portale dà **500** e una pagina «Web Page
   Blocked»; con l'UA di un Chrome vero, 200.

   Il guaio è la **diagnosi**: uno stato 500 con un corpo HTML sensato si legge
   come «il portale è giù», e si aspetta che passi. Non passa. Un cancello che
   legge una fonte esterna deve quindi distinguere **«bloccato»** da
   **«fuori servizio»**, perché si riparano in modi diversi.

3. **Due griglie dello stesso portale possono non avere le stesse colonne.**
   «Provvedimenti organi indirizzo politico» ne ha **24**, le altre tre **25**:
   in mezzo compare `Spesa prevista`. Un parser posizionale sfalsa tutto ciò
   che segue `Data atto` su una griglia su quattro. **Si mappa per NOME.**

4. **Il `content-type` può mentire.** L'export grande dello storico dichiara
   `text/html;charset=UTF-8` e manda CSV (le griglie piccole dichiarano
   `text/csv`). Un controllo sul tipo lo scarta e conclude «l'export è rotto».
   Si guarda il **corpo**.

### `evaluateAll` non aspetta, e su una lista vuota tace (2026-08-09)

`locator.evaluateAll()` **non ha attesa automatica**: risolve con ciò che
combacia in quell'istante e, se non combacia niente, restituisce `[]` senza
lamentarsi. Tutti gli altri metodi di Playwright aspettano, quindi la memoria
di come funziona la libreria non aiuta — anzi inganna.

`porte.spec.ts` leggeva così le sei porte del cruscotto subito dopo `goto`. È
andato bene per giorni, poi `/admin` ha guadagnato **una quarta interrogazione
al database** (il monitor degli atti) ed è diventato rosso con «il cruscotto non
offre nessuna porta» — cioè il messaggio di un difetto di navigazione, per un
problema di tempi.

⚠️ **Il segno che lo distingue da un guasto vero, ed è generale:** lo snapshot
che Playwright salva **dopo** il fallimento (`test-results/…/error-context.md`)
mostrava la navigazione **al completo, con tutte e sei le porte**. Quando la
pagina fotografata al momento dell'errore contiene proprio ciò che il test dice
di non aver trovato, la diagnosi non è «manca», è «non era ancora arrivato».
Quel file si legge **prima** di cercare nel codice.

La corsa c'era da sempre; una pagina un po' più lenta l'ha solo resa visibile.
Si chiude con un `waitFor()` prima di leggere — che non ammorbidisce il
cancello, perché se le porte non arrivano davvero il test scade lo stesso.

E una che non è una trappola ma una regola di scarto: **quando una riga non si
riesce a leggere, guarda QUALE prima di decidere che è giusto scartarla.** La
prima stesura pretendeva `Data atto` e buttava via **una riga su 26.588** — un
decreto vero del Sindaco, con oggetto, fonte e data di pubblicazione, a cui
mancava solo quel campo. Il minimo per stare in archivio è *che cosa dice, da
dove viene, quando è stato pubblicato*; il resto è facoltativo, e un archivio
che perde un atto è peggio di uno con una data vuota.

### Due trappole del lanciare i cancelli (2026-08-11)

Pagate aggiungendo il tema civico «Sociale e casa». Nessuna delle due riguarda
il prodotto: riguardano **il modo in cui si legge l'esito di un cancello**, che
è la categoria che qui costa di più.

1. 🔴 **`comando | tail` restituisce l'exit code di `tail`, non del comando —
   quindi un cancello ROSSO si legge verde.** `npm run rotte 2>&1 | tail -12`
   è morto su un `TimeoutError` (il dev server era ancora in prima
   compilazione, che è lo stato *standard* dopo che gli E2E hanno cancellato
   `.next`), e la notifica del task ha riportato **exit code 0**: l'ultimo
   comando della pipe era `tail`, che era andato benissimo.

   È la regola di §3 (Fase A/B, 3) presa da una porta nuova — *un cancello
   deve distinguere «verificato e a posto» da «non verificato»* — con
   l'aggravante che qui il cancello **funzionava**: a mentire era il modo di
   invocarlo. La forma sicura, quando serve vedere solo la coda di un output
   lungo, è **redirigere su file** e leggere l'exit code prima del `tail`:

   ```bash
   npm run rotte > rotte.log 2>&1; echo "EXIT=$?"; tail -8 rotte.log
   ```

   ⚠️ Vale per **ogni** cancello lanciato in una pipe, non solo per `rotte`.

2. **A macchina carica gli E2E cadono, e i rossi somigliano a una
   regressione.** Con la suite completa in corsa insieme ad altro lavoro (CPU
   al 100%, 2,4GB liberi su 15,2), **4 test su 165** sono caduti in specifiche
   scorrelate — moderazione, segnalazione, suggerimento categoria, trasparenza.
   A macchina scarica: **165/165**, due volte di fila.

   È la stessa famiglia della trappola 2 della Fase C (il dev server
   superstite) ma con una causa che non si vede in nessun log: **la macchina**.
   I segni che la distinguono da un guasto vero sono gli stessi, e valgono la
   pena di essere elencati perché sono ciò che evita di cercare nel diff:
   sono tutti **timeout o instabilità** (`element is not stable`,
   `net::ERR_ABORTED; maybe frame was detached?`, `29 × unexpected value`) e
   **nessuno afferma un contenuto sbagliato**; l'insieme dei falliti **cambia a
   ogni esecuzione** (4, poi 6, poi 3 — con file diversi), mentre un guasto
   vero è deterministico.

   Il modo di lavorare che ne esce, e che ha risolto il dubbio in venti minuti
   invece che in un'ora: **si mette la modifica da parte** (`git stash`), si
   rilanciano *gli stessi* test — se passano su HEAD pulito **e** ripassano con
   la modifica rimessa, la causa era l'ambiente. Non basta rilanciare e vedere
   verde: quello dimostra solo che è intermittente, non di chi è la colpa.

   Corollario operativo: **non lanciare due cose pesanti insieme.** La suite
   completa costa ~22 minuti a macchina scarica e ~29 a macchina carica — cioè
   parallelizzare non fa nemmeno risparmiare tempo, e in cambio produce rossi
   da diagnosticare.

### Tre trappole della pipeline che gira da sola (2026-08-11)

Pagate rendendo automatica la lettura degli atti. Come sempre: **nessuna
produce un errore dove la si scrive**, e tutte e tre producono un risultato
plausibile. Il dettaglio sta in `docs/pipeline-atti-schedulata.md`.

1. 🔴 **`npm ci` installa il PACCHETTO di Playwright, non il browser.** I
   binari li scarica `npx playwright install`, che nel `Dockerfile` non c'è
   mai stato: quindi `npm run atti` funzionava benissimo qui e in produzione
   sarebbe morto su «Executable doesn't exist at
   /root/.cache/ms-playwright/…». **Un cron l'avrebbe scoperto scattando**, e
   il sintomo sarebbe arrivato dentro un log che nessuno guarda.

   La regola generale: **quando una dipendenza scarica risorse fuori da
   `node_modules`, `npm ci` non la installa davvero** — e la differenza si
   vede solo là dove nessuno ha ancora provato a eseguirla. Prima di
   schedulare uno script in un ambiente diverso da questo, chiediti *che cosa
   tocca oltre al proprio codice*: browser, binari, cache, font, certificati.

   Qui la risposta è stata togliere il browser invece di portarlo: il WAF
   voleva uno user-agent credibile e l'export i cookie del portlet, e `fetch`
   fa tutte e due. **Costo evitato: 427MB per immagine** su un disco che si è
   già riempito al 100% una volta, per fare due GET.

2. 🔴 **Un riconoscitore tarato sulla forma IMMAGINATA di una risposta
   certifica sé stesso.** `paginaDiBlocco` cercava le spie del WAF nei primi
   **4.000** caratteri. La pagina di blocco vera è lunga **39.133** e comincia
   con ~19KB di CSS inline: il titolo arriva a 19.205, «Web Page Blocked» a
   **38.709**. Nessuna spia dentro la finestra — quindi la funzione rispondeva
   `false` **proprio sul caso per cui esisteva**, e la lettura archiviava
   «errore» dove il fatto era «bloccata», cioè la distinzione che
   `docs/fonti-atti.md` §2.1 dichiara essenziale perché le due cose si
   riparano in modo diverso.

   Il test che la copriva passava, e non poteva vedere il difetto: usava una
   pagina **inventata e corta**, con le spie all'inizio. **La regola: un test
   su una risposta esterna si scrive sulla forma VERA — lunghezza e ordine
   compresi — non su un esempio abbreviato**, perché è proprio la taglia ciò
   che il codice sbaglia a indovinare.

   ⚠️ Il difetto era **preesistente** e non del motore nuovo: la funzione è la
   stessa che usava la lettura a browser. L'ha trovato **rompere di proposito**
   — mandare l'UA di un Chrome headless e guardare che cosa finiva in archivio.
   Senza quella prova sarebbe rimasto lì.

3. **Un giro incrementale su un archivio VUOTO riempie di poco e si dichiara
   fresco.** L'albo contiene ~220 atti: su un archivio a zero ne restano
   **220 su 26.644** — 120 volte più piccolo del vero — e il monitor dice
   «Aggiornato», perché la lettura è riuscita davvero. Non è un caso di
   scuola: **è lo stato della produzione**, dove l'archivio non è mai stato
   riempito, ed è dove il primo scatto del task sarebbe finito.

   Si chiude facendo accorgere il giro da sé (zero atti → si leggono tutte e
   quattro le griglie). La soglia è **zero** e non un numero scelto: *vuoto* è
   un fatto, *troppo pochi* sarebbe un giudizio da tarare. La regola generale:
   **quando un lavoro periodico ha un primo scatto diverso dagli altri, quel
   primo scatto va progettato — o capiterà in produzione senza che nessuno
   guardi.**

### Tre trappole della ricognizione col browser (2026-08-12)

Pagate raccogliendo i riferimenti visivi di O10. Valgono per qualunque
sessione che navighi il web da agente.

1. **Il pannello Browser (`mcp__Claude_Browser__*`) non composita se non è a
   schermo**: `screenshot` esce con «the Browser pane is not displayed» in
   qualunque sessione senza display. Per navigare E fotografare si usa il
   **DevTools MCP** (`mcp__plugin_chrome-devtools-mcp_*`), che gestisce un
   Chrome proprio: `take_screenshot` inline per guardare, con `filePath` per
   salvare. ⚠️ Le schermate salvate nello scratchpad **muoiono con la
   sessione**: ciò che deve sopravvivere si copia in una cartella del
   progetto ignorata da git (`refs-o10/` è il precedente, con la motivazione
   in `.gitignore`).
2. **I banner dei consensi possono vivere in shadow DOM** (hel.fi/HDS: il
   pulsante non esiste per `document.querySelectorAll`). Si cerca camminando
   gli `shadowRoot`; e la scelta è sempre la più riservata («solo necessari»,
   «rifiuta», «continua senza accettare»). I muri **«accetta tutto o paga»**
   (theguardian.com) si saltano e si dichiara nel documento: la via che
   rispetta la privacy non può essere comprare l'accesso.
3. **«Human Verification» su Dribbble si risolve da sola** dopo qualche
   secondo (interstitial, non CAPTCHA): si aspetta e si riprova una volta
   prima di scartare la fonte. Se resta un CAPTCHA vero, la fonte si scarta —
   mai aggirarlo.

---

## 4. Comandi

```bash
npm run dev            # sviluppo
npm run typecheck      # tsc --noEmit — sempre prima di dire "fatto"
npm run lint
npm test               # vitest
npm run test:e2e       # playwright (comprende il cancello di accessibilità)
npm run a11y           # SOLO il cancello a11y: axe, 21 pagine × 2 temi, WCAG AA + 2.2
npm run bersagli       # SOLO il cancello dei 44px: 21 pagine × 2 viewport (1280 e 360)
npm run contenimento   # SOLO il cancello del ritaglio: nessun controllo esce dal proprio contenitore
npm run lighthouse     # Lighthouse sulla build di produzione — misura, non giudica
npm run theme:build    # ricompila il tema dopo aver toccato pistoia.ts
npm run shots          # schermate delle pagine chiave, temi chiaro e scuro
node scripts/shots.mjs --simple --width=360   # modalità semplice, viewport minima
npm run rotte          # tutte le rotte rispondono, rendono contenuto E non scrivono errori in console? (66 al 2026-08-09)
npm run produzione     # il sito DEPLOYATO si monta davvero? — dopo ogni deploy, §8
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

**`perl -0pi -e` con gli escape `\x{…}` DISTRUGGE la codifica di tutto il
file.** Pagata il 2026-08-07 su `ROADMAP.md`: **1208 sequenze di caratteri
rovinate** in un colpo solo, accenti e trattini lunghi compresi, con un solo
`Wide character in print` come avviso. La causa: un `\x{2014}` nella stringa di
sostituzione fa passare Perl alla semantica dei *caratteri*, e senza il livello
`:utf8` in uscita il resto del file — che era UTF-8 valido — viene riletto come
latin-1 e ricodificato. **Doppia codifica su tutto, non solo sulla riga
toccata.**

Le vie d'uscita, in ordine: usa lo **strumento di modifica** invece di `perl`
per i file di testo; se proprio serve `perl`, scrivi i caratteri **letterali**
(`—`, non `\x{2014}`) e non usare escape numerici; oppure aggiungi
`-CSD`/`use open qw(:std :utf8)`.

Il danno **si inverte senza perdere il lavoro**: si legge il file come UTF-8 e
si riscrive carattere per carattere prendendo `bytes([ord(c)])` sotto 256 e
`c.encode('utf-8')` sopra — così i pezzi doppiamente codificati tornano ai byte
originali e quelli scritti bene passano intatti. Verificalo cercando `Ã` o `Â`
seguiti da un byte di continuazione: devono uscire **zero**.

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

**Il browser di `shots` si RILANCIA a ogni passata**, e non è pigrizia: con
quattro regimi invece di due, un solo processo Chromium moriva a metà giro
(uscita `0x80000003`, stack su `chromium.launch`) — chiudere un contesto **non
restituisce la memoria**, e una schermata a piena pagina di `/admin` è
2880×8000 a `deviceScaleFactor: 2`. Il primo sintomo era **un blocco senza
errore**: venti minuti senza una riga di log, che è il modo peggiore in cui un
cancello possa fallire.

**E se Chromium smette di partire del tutto** — «Invalid file descriptor to ICU
data received», lancio fallito in un secondo su qualunque script — non è il
codice e non è la memoria: è l'installazione. Si ripara con
`npx playwright install chromium --force`, ~2 minuti, e blocca `shots`, gli E2E
e il cancello a11y insieme finché non lo fai. Il binario risponde a
`--version` anche quando è in questo stato: non è una prova che sia sano.

**`shots` sa fare i passaggi di ruolo dal 2026-08-06** (Lavoro D §4). Ogni voce
di `PAGES` dichiara il proprio `ruolo:` — `anonimo`, `cittadino`, `admin`,
`moderatore` — e lo script fa una passata per regime, in contesti separati:
`/login` reindirizza chi ha già una sessione, quindi un ruolo non può disfare
il proprio accesso per prenderne un altro. Le credenziali stanno in `RUOLI`,
sovrascrivibili da `SHOTS_ADMIN_EMAIL` e simili.

**La cosa da non rompere è il controllo dell'ATTERRAGGIO.** I guard di questo
progetto **reindirizzano, non rifiutano**: `requireAdmin()` non risponde 403,
manda a `/la-mia-citta` con stato 200 e contenuto perfettamente valido. Senza
quel controllo lo script fotografa **la home spacciandola per la pagina admin**
— un cancello che certifica una superficie mai vista, visto accadere il
2026-08-03 con `/admin/codici-qr`, ed è la ragione per cui quelle rotte sono
rimaste escluse per tre mesi. Adesso un atterraggio diverso da quello chiesto è
un **fallimento**, non una foto. Stessa regola in `accessibilita.spec.ts`
(`pretendiAtterraggio`) e in `rotte.mjs` (passate moderatore e anonima).

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

**`pistoia-dashboard/AGENTS.md` si modifica da solo, e non sei stato tu.** Il
blocco fra `BEGIN:nextjs-agent-rules` e `END` lo scrive **`next dev`**
(`node_modules/next/dist/server/lib/generate-agent-files.js`): dopo un
aggiornamento di Next il file risulta modificato senza che nessuno l'abbia
aperto. Toglierlo dal diff non serve — si riscrive al primo avvio. Si committa
insieme al lavoro. (Visto il 2026-08-05 aggiornando a 16.3.0.)

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
      (66 al 2026-08-09; il numero cresce a ogni rotta nuova, e va letto dallo
      script, non da qui). È l'unico cancello che risponde
      alla domanda «abbiamo perso una funzionalità?», e l'unico che apre le
      rotte annidate per indirizzo invece che cliccandole. Da R-5 le passate
      sono TRE: admin, moderatore, e **anonima** (le rotte a lettura pubblica,
      con atterraggio preteso — un redirect al login risponderebbe 200).
      ⚠️ **Dal 2026-08-09 legge anche la CONSOLE**: `pageerror` +
      `console.error` (avvisi e informazioni no), con
      `prefers-reduced-motion: reduce` emulata su tutte e tre le passate — è lo
      stato in cui i sei errori di idratazione di `/bilancio` sono vissuti mesi
      sotto E2E verdi. Un errore in console è una rotta rossa, col testo in riga
- [ ] L'hai **guardata**: `npm run shots`, o il browser, in tema chiaro **e**
      scuro. Un typecheck verde non è una prova visiva.
- [ ] Funziona da tastiera e il focus è visibile. **Il cancello axe non basta**:
      da 2026-08-05 `npm run test:e2e` comprende `accessibilita.spec.ts` (WCAG
      AA e 2.2, **21 pagine × 2 temi = 42 casi**, su **165** E2E totali — comprese le sette
      superfici di `/admin/*`, i quattro dettagli delle code e `/redazione` — nessuna regola esclusa), ma axe copre ~30–40% delle
      barriere reali — le meccaniche. Ordine di lettura, trappole di focus e
      sensatezza degli annunci restano da provare a mano.
      ⚠️ Se aggiungi un colore, **misura la coppia colore/`-soft`**: è lì che il
      contrasto è caduto, e non si vede guardando
- [ ] I bersagli reggono i **44px** di `DESIGN.md` §11.6: dal 2026-08-07
      `npm run test:e2e` comprende `bersagli.spec.ts` (**21 pagine × 2
      viewport = 42 casi**), che è un cancello **diverso** da `target-size` di
      axe — quello difende i 24. L'elenco delle esenzioni «essenziali» è
      **vuoto**, e un'aggiunta va scritta con la condizione che la chiude.
      ⚠️ Le tre liste di pagine sono una sola: `tests/e2e/pagine-cancello.ts`
- [ ] **Nessun controllo esce dal proprio contenitore**: dal 2026-08-09
      `npm run test:e2e` comprende `contenimento.spec.ts` (**21 pagine × 2
      viewport = 42 casi**). È un cancello **diverso** dagli altri tre, e la
      differenza è il punto: `shots` misura il traboccamento *della pagina* —
      che resta zero proprio perché la card ha `overflow` nascosto —,
      `bersagli` misura la *dimensione* (un bersaglio tagliato a metà è ancora
      alto 44), e axe non ha una regola per «tagliato».
      ⚠️ Un contenitore che **scorre** non è un difetto: il rosso è solo dove
      la parte fuori è **irraggiungibile** (`overflow: hidden`/`clip`)
- [ ] Regge la **modalità semplice** — `npm run shots -- --simple --width=360`,
      che è anche il controllo del traboccamento orizzontale alla viewport minima
- [ ] `prefers-reduced-motion` non lascia contenuto invisibile o inaccessibile

Sulle schermate: le animazioni d'ingresso durano fino a ~2,2s e i grafici si
rivelano allo scroll. Uno screenshot troppo presto, o senza scorrere la pagina,
fotografa grafici a metà o vuoti e sembra un bug che non c'è. `scripts/shots.mjs`
gestisce già entrambe le cose.

**Tutte queste caselle parlano dello SVILUPPO, e nessuna della produzione.** Non
è una svista ma il confine del capitolo: una modifica è finita prima che il
deploy esista. Il difetto del 2026-08-05 — la demo che nessun browser riusciva
ad aprire — è vissuto per mesi sotto una fila di cancelli verdi proprio perché
tutti guardavano `localhost`. Il sito deployato ha il proprio cancello,
`npm run produzione`, e si lancia **dopo il deploy**: §8.

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

---

## 8. Deploy

Il progetto è **deployato su Coolify**, un'istanza self-hosted in rete locale —
non un hosting pubblico. Indirizzo: `http://pistoia.192.168.50.173.sslip.io`.

Il deploy parte dal branch `main` della repo pubblica su GitHub e costruisce il
`Dockerfile` che sta in `pistoia-dashboard/`. **Non c'è auto-deploy sul push**:
il server ha un indirizzo privato e i webhook di GitHub non lo raggiungono. Si
lancia a mano, dall'interfaccia di Coolify o via API.

> **Un agente PUÒ lanciarlo, via API** (2026-08-05). Gli accessi non stanno in
> questo repository ma in
> `~/Documents/Virtual Machines/Ubuntu 64-bit/documentazione/07-accessi.md`, che
> dice **dove** sono le credenziali senza contenerne i valori. Il wrapper
> `C:\Users\loren\.homelab\cf.sh` legge il token dal file accanto a sé e **non
> lo stampa mai**, quindi non finisce nei registri né nella cronologia: si usa
> quello, mai `curl` a mano con l'`Authorization` in chiaro.
>
> ```bash
> sh "C:\Users\loren\.homelab\cf.sh" GET /applications
> sh "C:\Users\loren\.homelab\cf.sh" GET "/deploy?uuid=w148lovopnak9eshxuy13b1i&force=false"
> sh "C:\Users\loren\.homelab\cf.sh" GET "/deployments/<deployment_uuid>"   # finché non dà "finished"
> ```
>
> `w148lovopnak9eshxuy13b1i` è l'UUID della Dashboard (gli altri sono in
> `02-applicazioni.md`). Esiste anche `ssh homeserver`, con la chiave dedicata
> in `~/.ssh/vm-coolify`.
>
> 🔴 **OGNI DEPLOY COSTA 2,82GB DI DISCO, E IL DISCO È DA 40GB.** È la causa
> vera dietro al paragrafo qui sotto, trovata il 2026-08-07 dopo essere partiti
> da una diagnosi sbagliata. Coolify **non cancella** l'immagine vecchia: dopo
> tre deploy in una giornata la Dashboard da sola occupava **5 × 2,82 = 14,1GB**,
> il disco è arrivato a `40G 38G 0 100%`, e Postgres è andato in
> `PANIC: could not write to file … No space left on device`.
>
> Da lì la catena: `coolify-db` in recovery a ciclo → `coolify` e `coolify-db`
> **`unhealthy`** → **ogni** endpoint dell'API risponde `Server Error`, `/deploy`
> compreso. Nessun deploy possibile, e le scritture del database dimostrativo a
> rischio (il volume sta sullo stesso disco).
>
> **Si ripara liberando spazio, e si riprende DA SOLO** — nessun riavvio: appena
> Postgres può scrivere finisce il recovery e in ~20s tutto torna `healthy`.
>
> ```bash
> ssh homeserver "sudo -n docker system df; df -h /"        # prima si misura
> ssh homeserver "sudo -n docker builder prune -a -f"        # 9,39GB, e qui è spazio BUTTATO
> ```
>
> La cache di build **su questo progetto non serve a niente**: Coolify costruisce
> con `--no-cache`. È quindi la prima cosa da liberare, ed è innocua.
>
> Se non basta, si tolgono le immagini vecchie **una per tag**, tenendo quella in
> esecuzione **e la precedente per il rollback**:
>
> ```bash
> ssh homeserver "sudo -n docker rmi w148lovopnak9eshxuy13b1i:<sha-vecchio>"
> ```
>
> ⚠️ **Mai `docker image prune -a`**: sullo stesso server vivono Umami, Homepage
> e Uptime Kuma. Il 2026-08-07 cache + tre immagini hanno riportato il disco da
> **100% a 66%** (13G liberi).
>
> **Il debito che resta, con la condizione che lo chiude:** l'immagine pesa
> 2,82GB perché le devDependencies restano installate (vincolo 2 qui sotto:
> `next build` le richiede e il seed gira con `tsx`). Un build **multi-stage** —
> costruire con le dev, copiare in un'immagine di esecuzione senza — le
> toglierebbe dal peso finale. Si valuta **quando il disco tornerà sopra l'80%
> nonostante la potatura**, che è un fatto misurabile con `df -h /`.
>
> ⚠️ **IL PIANO DI CONTROLLO PUÒ CADERE, E L'APPLICAZIONE RESTA IN PIEDI.**
> Visto il 2026-08-07: i container **`coolify` e `coolify-db` vanno
> `unhealthy`** e da quel momento **ogni** endpoint dell'API risponde
> `{"message":"Server Error"}` — `/applications`, `/deployments`, `/version`,
> `/teams` e anche `/deploy`. Non si può né lanciare un deploy né sapere com'è
> andato quello di prima.
>
> **La Dashboard però continua a girare**: il suo container non ha niente a che
> vedere con la salute di Coolify, il sito serve, e `npm run produzione` passa.
> Coolify malato è un problema di *deploy*, non di *servizio*.
>
> Il primo controllo, prima di qualunque diagnosi:
>
> ```bash
> ssh homeserver "sudo -n docker ps --filter name=coolify --format '{{.Names}}|{{.Status}}'"
> ```
>
> Il sintomo che inganna, e che il 2026-08-07 ha prodotto una diagnosi
> sbagliata: **la caduta si vede prima nel polling di un deploy in corso.** Il
> record risponde `in_progress` per un po' e poi comincia a dare `Server Error`
> **senza mai passare da `finished`**, mentre il deploy — che gira in un
> container suo — **arriva in fondo lo stesso**. Chi aspetta quella parola
> aspetta all'infinito, conclude «è appeso» e rilancia. La prima lettura fu «il
> record del deploy smette di rispondere»: era vero e troppo stretto.
>
> La domanda giusta non si fa mai al deployer ma al **processo vivo**.
>
> La domanda giusta non si fa al deployer ma al **processo vivo**:
>
> ```bash
> ssh homeserver "sudo -n docker ps --filter name=w148lovopnak9eshxuy13b1i --format '{{.Image}}|{{.Status}}'"
> ```
>
> Il tag di quell'immagine **è** lo SHA del commit. È lo stesso controllo che fa
> `npm run produzione` come controllo 0, quindi in pratica basta lanciare il
> cancello: se dice «è il commit che hai qui», il deploy è finito comunque
> l'API abbia deciso di raccontarlo.
>
> ⚠️ **Un deploy non è finito quando risponde 200.** Il 2026-08-05 la demo
> rispondeva 200 e serviva l'HTML giusto, ma **nessun browser riusciva a
> montarla**: `upgrade-insecure-requests` nella CSP promuoveva ogni script a
> `https://` su un sito servito in HTTP, e fallivano tutti con
> `ERR_CERT_AUTHORITY_INVALID`. Difetto **preesistente dalla Fase 0**, mai visto
> da nessun cancello perché `rotte` e `shots` girano contro lo sviluppo.
>
> Dopo ogni deploy, quindi, **un cancello**: `npm run produzione`.
>
> Fino al 2026-08-07 erano tre controlli da fare a mano, e una voce a mano non è
> una garanzia — nessuno la rispunta. Adesso `scripts/produzione.mjs` apre il
> sito deployato in un **browser vero** (è il punto: `curl` vedeva un sito sano),
> e ogni cosa che pretende difende un guasto già pagato:
>
> | Che cosa pretende | Il guasto che difende |
> |---|---|
> | **La VERSIONE giusta**, e viene per prima | «Ho lanciato il deploy e sto guardando la versione di prima». Si chiede al server quale immagine sta eseguendo il container vivo, e il tag di quell'immagine **è** lo SHA del commit: `docker build -t <uuid>:<sha>`, lo mette Coolify. Se non combacia, dice **di quanti commit** la produzione è indietro. È un fatto sul processo in esecuzione, non una dichiarazione di chi ha deployato — e **non dipende da come il deploy è stato lanciato** |
> | `main` sopra una soglia **per pagina**, su pagine di contenuto | La demo cieca: HTML giusto, `main` fermo a ~183 caratteri sul «Caricamento in corso». ⚠️ Su `/login` `main` ha **228** caratteri anche quando è sana (misurato), perché è solo il modulo: lì il cancello chiede invece che **il modulo ci sia** |
> | L'**atterraggio** sull'indirizzo chiesto | I guard qui reindirizzano invece di rifiutare: una pagina pubblica finita al login risponderebbe 200, con `<h1>` e `main` pieno |
> | Accesso, poi **due** rotte protette di seguito | Il cookie con `Secure` su un sito in HTTP: il login riusciva e ogni navigazione tornava al login. Un controllo che si ferma all'accesso non lo vede |
> | Zero errori JavaScript e zero richieste fallite | È la *causa* accanto al sintomo. I prelievi RSC annullati (`net::ERR_ABORTED`, fino a **26** su una pagina sana) sono esclusi, altrimenti il cancello nascerebbe rosso |
> | Il marcatore della **tavolozza** | «Ho lanciato il deploy e sto guardando la versione di prima». Le due tinte si leggono dal tema compilato, non sono cucite nello script |
>
> **Un accesso mancato non salta le pagine protette: le conta rosse.** Un
> cancello che esce 0 quando non ha verificato niente non è un cancello (§3,
> Fase A/B, 3) — ed è esattamente il difetto che `shots` aveva.
>
> ⚠️ **Il cancello SCRIVE nel database dimostrativo, ed è dichiarato.** Accede
> come `cittadino@` e atterra su `/la-mia-citta`, dove `CampagnaHome` registra
> la sollecitazione al montaggio — e in produzione `npm run db:seed` **non si
> può rilanciare** (`docker-entrypoint.sh` lo traccia con `/data/.seeded`).
> Misurato il 2026-08-07, ed è più piccolo di quanto sembri: la card **resta a
> schermo** (conta una volta sola finché non rispondi), quindi la dimostrazione
> non si degrada, e il fatto registrato — «la campagna è stata mostrata» — è
> **vero**: un browser vero l'ha mostrata davvero. Non vale un conto dedicato
> oggi. **La condizione che lo cambia:** il giorno in cui quella base dati
> smetterà di essere dimostrativa, il cancello vuole un conto suo.
>
> **Non è in CI, e non è una dimenticanza**: l'indirizzo è un IP privato in rete
> locale, che i runner di GitHub non raggiungono — la stessa ragione per cui non
> c'è auto-deploy sul push. Si lancia da questa macchina, dopo il deploy.
>
> **Serve `ssh homeserver`** (chiave in `~/.ssh/vm-coolify`) e `sudo -n docker`
> là sopra, che è configurato senza password. Se manca, il cancello dice
> **«versione NON verificata»** e va rosso: non è mai verde per omissione.
>
> **Tre strade scartate per portare lo SHA dentro l'immagine**, misurate il
> 2026-08-07 e scritte perché nessuno le riprovi:
>
> 1. *Come argomento di build.* **Coolify non lo passa**: gli unici build-arg
>    sono `COOLIFY_URL`, `COOLIFY_FQDN`, `COOLIFY_BRANCH`,
>    `COOLIFY_RESOURCE_UUID` e le variabili dell'applicazione.
> 2. *Calcolandolo nel build da `.git`.* Il contesto è
>    `/artifacts/<deploy>/pistoia-dashboard`; `.git` sta **un livello sopra**.
> 3. *Scrivendolo in una variabile di Coolify da un comando di deploy.* Regge
>    solo finché ogni deploy passa da quel comando: al primo lancio
>    dall'interfaccia la variabile resta indietro e **il marcatore mente**, che
>    è peggio di non averlo.
>
> **Il limite che resta, dichiarato:** si verifica il **tag** dell'immagine
> viva, e chi lo assegna è Coolify al checkout. Se Coolify prendesse un commit e
> ne scrivesse un altro, il marcatore ripeterebbe il suo errore. È molto più
> stretto del buco di prima e non si chiude dall'esterno.
>
> **Se il deploy fallisce con `exit code 137`, è l'OOM killer, non il codice.**
> Visto il 2026-08-05 su un commit di sola documentazione: `next build` non ci
> sta nei 5.360 MB della VM quando gli altri container sono al lavoro. Coolify
> tiene su la versione precedente (la produzione non cade), e **rilanciare
> basta** — al secondo tentativo è passato. Se diventasse frequente, la leva è
> la RAM della VM o meno container accesi durante il build, non il Dockerfile.

L'indirizzo incorpora l'IP del server (`sslip.io` risolve qualunque nome della
forma `<nome>.<ip>.sslip.io`). Comodo perché non richiede alcuna configurazione
DNS, ma **se la macchina cambia indirizzo va riscritto l'FQDN** dell'applicazione
in Coolify, altrimenti il sito diventa irraggiungibile.

### Quattro vincoli del container, da non rompere

1. **Immagine Debian, mai Alpine.** `better-sqlite3` e `@node-rs/argon2`
   distribuiscono binari precompilati solo per glibc. Su musl andrebbero
   ricompilati da sorgente, con toolchain e tempi di build molto maggiori.
2. **Le devDependencies restano installate.** `next build` le richiede e il seed
   gira con `tsx`: potarle rompe il build o il primo avvio.
3. **`prisma migrate deploy`, mai `migrate dev`.** Lo script `setup` usa la
   variante di sviluppo, che può generare migrazioni nuove o proporre un reset
   del database — in produzione è esattamente ciò che non si vuole.
4. **Il database vive su un volume persistente**, montato in `/data`. Senza,
   utenti, sessioni e voti sparirebbero a ogni redeploy. Il seed dimostrativo
   gira una volta sola: `docker-entrypoint.sh` lo traccia con `/data/.seeded`.

### Variabili d'ambiente

Vivono in Coolify, non nel repository: `DATABASE_URL`, `SESSION_SECRET`,
`DEMO_MODE`, `SERVER_ACTIONS_ALLOWED_ORIGINS`, `NODE_ENV`, `PORT`, `TZ`.

`SERVER_ACTIONS_ALLOWED_ORIGINS` merita attenzione particolare: dietro il
reverse proxy l'`Origin` che Next vede non coincide con il dominio pubblico, e
senza quella variabile allineata al dominio del deploy **login e voti falliscono**
con errori che non spiegano la causa. È la trappola più costosa di questo
setup — se qualcosa smette di funzionare dopo un cambio di dominio, guarda lì
per prima cosa.
