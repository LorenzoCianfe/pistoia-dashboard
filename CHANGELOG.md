# Changelog — Dashboard di Pistoia

> Tutte le modifiche rilevanti del progetto, in ordine cronologico inverso.
> Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/); le versioni seguono
> [SemVer](https://semver.org/lang/it/) in fase 0.x (demo mock, nessuna API pubblica stabile).
> Il dettaglio tecnico di ogni voce è in [DOCUMENTATION.md §10](DOCUMENTATION.md); il piano è in [ROADMAP.md](ROADMAP.md).

## [0.44.0] — 2026-08-09 · L'archivio vero è 140 volte più grande (Ondata 8)

> La pipeline degli atti, cioè la metà rischiosa dell'ondata. La misura ha
> riscritto la premessa: il piano indicava due griglie da 188 atti, e il
> portale ne espone **26.593** sotto «Pubblicità Legale» — albo pretorio e
> storico atti, entrambe con l'export CSV. La ricognizione completa è in
> [`docs/fonti-atti.md`](docs/fonti-atti.md).

### Misurato — e quattro trappole pagate, ora in AGENTS.md §3
- 🔴 **`Url atto` non è l'identità dell'atto: è l'identità della PUBBLICAZIONE.** Lo stesso atto sta su albo e storico con due id consecutivi: usarlo come chiave produce **385 doppioni**, cioè la stessa delibera due volte. L'identità è `(tipo, anno, numero)` con due ripieghi misurati — e il terzo livello serve davvero: due delibere del 2024 senza numero né registrazione («Pistoia Blues» e «Festa della musica») altrimenti collassano.
- 🔴 **Il WAF blocca sullo USER-AGENT e risponde 500**: con `HeadlessChrome` una pagina «Web Page Blocked», con l'UA di un Chrome vero 200. Un cancello che legge fonti esterne deve distinguere «bloccato» da «fuori servizio»: si riparano in modi diversi.
- **Le griglie non hanno le stesse colonne** (24 vs 25: `Spesa prevista` in mezzo) → si mappa per nome, mai per posizione. **E il `content-type` mente**: l'export grande dichiara `text/html` e manda CSV → si guarda il corpo.
- **Due assunti del piano non reggono**: `Assessore descrizione` è vuota su 26.588 righe ovunque, e **l'importo non esiste in questa fonte** (`Spesa prevista` = `0,00` su tutte le righe; il modello `Atto` della ROADMAP lo prometteva). Rientra solo il giorno in cui si leggeranno gli allegati.
- **La freschezza è tarata sul misurato**: fra due giorni di pubblicazione il buco più lungo in 5,5 anni è **5 giorni** (Ferragosto compreso); la soglia del cancello è 10, il doppio del peggiore osservato.

### Aggiunto
- **Modelli `Atto` e `LetturaAtti`** — 26.591 atti reali dal 2021, ognuno con `urlFonte` (si preferisce lo storico: l'URL dell'albo scade in ~15 giorni). ⚠️ **Non sono dati dimostrativi**: il seed non li tocca e non li riempie mai — una delibera inventata attribuisce alla giunta una decisione che non ha preso.
- **`npm run atti`** — il giro quotidiano legge l'albo (202 righe, ~2s) e intercetta tutto perché ogni atto vi resta ~15 giorni; `--storico`/`--tutte` per il carico iniziale (~3 min). Idempotente, verificato: seconda passata = 1 nuovo (un decreto recuperato), 0 doppioni.
- **`npm run atti:freschezza`** — il cancello: 7 controlli, distingue «bloccata dal WAF» da «fuori servizio» e da «archivio fermo», e **provato rosso** con una lettura bloccata iniettata, non solo verde.
- **La categoria civica dedotta dall'UFFICIO proponente** (`temaCivicoDaUfficio`): copertura misurata **69%**; il resto è amministrazione interna, per cui «nessun tema» è la risposta giusta. La `Classifica` del portale è stata provata e scartata: è un titolario di protocollo («VARIE ES. CENTRO GIOVANI» si mangia tutta la Cultura). Un **fermo di 102 uffici** nei test fa diventare rossa ogni regola che cambi tema a un ufficio esistente.
- **Il monitor sul cruscotto** (`/admin`, forma C scelta da Lorenzo sui tre mockup iniettati e misurati: +445px a 1280, +585 a 360 dentro il tetto di 3.327). Stato con le **stesse soglie del cancello** (`statoArchivio`, importate non riscritte), conteggio per tipo nell'ordine canonico, e i temi dichiarati per ciò che sono: «dedotto dall'ufficio che li propone» — il conteggio è un fatto, la sintesi è un giudizio. A base dati mai letta dice «Mai letto» e come uscirne, provato dall'E2E.
- **36 unit e 1 E2E nuovi** (310 unit totali, 123 E2E).

### Note
- Gli avvisi di **altri enti** e le **pubblicazioni di matrimonio** restano fuori dall'archivio: i primi non sono atti del Comune, le seconde portano dati personali di cittadini.
- Due buchi dichiarati nella categoria civica, con la condizione che li chiude in `docs/fonti-atti.md` §4.3: sociale/casa (970 atti) e urbanistica (373) aspettano un tema in `CIVIC_TOPICS`, che è una decisione sul selettore dei temi, non su questa pipeline.

## [0.43.0] — 2026-08-09 · Un consiglio che non si può seguire è peggio del silenzio (Ondata 8)

> La seconda voce del nucleo: la moderazione assistita. **Le misure hanno smontato due delle tre euristiche previste**, e la terza è finita su un'altra superficie di quella per cui era stata scritta.

### Misurato — prima di costruire, e poi di nuovo
- **I duplicati per somiglianza del testo: zero veri positivi.** Sopra il 50% di somiglianza, **nessuna coppia**; la sola sopra il 40% è «Lampione a intermittenza in Via Dalmazia» contro «…in Via Bonellina» — due lampioni, due strade, due quartieri. ⚠️ Il motivo è strutturale e vale oltre il seed: le segnalazioni comunali sono **formulari**, quindi il testo si somiglia **proprio quando il luogo cambia**, e il luogo è il segnale che distingue. Una somiglianza testuale tratta come rumore l'unica cosa che conta — e `mergeReportsAction` fonde davvero.
- **Il suggerimento di categoria**: 60% azzeccate, **14% diverse dalla scelta umana** (6 su 42). Ma quei 6 sono per lo più casi in cui la categoria giusta è **discutibile** («Panchina imbrattata ai giardini» è decoro o parchi). Il che non assolve il suggerimento: lo rende più pesante, perché su un giudizio incerto una proposta della macchina si prende più spazio di quanto merita.

### Aggiunto
- **«Altre N aperte come questa» sul triage** — le altre segnalazioni aperte della stessa categoria e dello stesso quartiere. **È un fatto, non una stima**: la stessa lente di `findSimilarReports`, che il cittadino vedeva mentre scrive e il moderatore no. Compare 1 volta su 5 sul seed, ed è giusto: con 14 aperte su dieci categorie e dieci quartieri i vicini veri sono rari.
- **Il suggerimento di categoria sul modulo del CITTADINO** — con le parole che l'hanno prodotto, e un pulsante «Usa «…»» che è l'unico modo in cui la categoria cambia.
- **`src/lib/moderazione-assistita.ts`** (puro, parole-spia dichiarate e non apprese) e i suoi test.

### Corretto — due difetti miei, trovati costruendo
- ⚠️ **Il suggerimento era sul triage del Comune, dove non ha una leva.** Quel modulo cambia stato, ufficio e nota; **la categoria la sceglie il cittadino e nessuna superficie del Comune la modifica** — verificato su `updateReportStatusAction` e su tutte le azioni che toccano `category`. Avrebbe mostrato all'operatore una discrepanza che non poteva risolvere. Spostato dove la leva c'è. Ne esce una regola: **un consiglio che non si può seguire è peggio del silenzio.**
- **Le prove mostravano il troncamento interno** («cassonett») invece della parola scritta («cassonetto»): onesto, ma somiglia a un refuso — e su una superficie pubblica un artefatto che pare un errore mina la fiducia che il blocco vuole costruire. Nel correggerlo è entrato un secondo difetto, **trovato dal test e non guardando il codice**: `\p{L}` non comprende i segni combinanti, quindi un accento decomposto spezzava la parola e «velocità» usciva «velocita».

### Note
- **Le quattro difese del suggerimento**, tutte provate dagli unit: tace se non trova parole (5 casi su 42), tace se due categorie pareggiano (6), tace se conferma la scelta già fatta, e **non pre-seleziona mai niente**.
- **Fuori, con la condizione che lo riapre**: il duplicato per somiglianza del testo si riprende **solo su una serie che contenga duplicati veri** — sul seed il primo risultato è un falso positivo, e l'azione che ne discende è distruttiva.

## [0.42.0] — 2026-08-09 · Il cruscotto dice chi ha in mano che cosa (Ondata 8)

> La prima voce del nucleo dell'Ondata 8: le analytics operative. La forma l'ha scelta Lorenzo su **tre mockup iniettati sull'applicazione vera**, dopo che la misura aveva già deciso metà del disegno.

### Aggiunto
- **Due letture sul cruscotto dell'Area Comune**: «Il carico degli uffici» (aperte e giorni mediani per ufficio) e «Dove si accumula» (le categorie con abbastanza casi). Stanno fra i quattro numeri e le sei porte: sono una lettura, non una destinazione.
- **`src/lib/analitiche.ts`** — modulo puro e unit-testabile come `citystats.ts`, da cui **importa** la soglia del campione invece di riscriverla.
- **`tests/unit/analitiche.test.ts`** (10 casi) e **`tests/e2e/analitiche.spec.ts`** (3 casi).

### Misurato
- **Prima di disegnare, non dopo.** Su 42 segnalazioni: l'**ufficio è l'unico asse dove ogni cella regge il campione** (5 su 5), mentre categoria e quartiere ne hanno **metà sotto la soglia** (5 su 10 entrambe). L'urgenza non è un asse: 40 righe su 42 non ce l'hanno.
- **Il tetto dell'area, misurato col browser e non citato a memoria**: a 360px è **3.327px** (`/admin/valutazioni`). Avevo scritto 1.894 — la coda peggiore *prima* di lista + dettaglio — e su quel numero sbagliato avevo raccomandato la forma più piccola. Le due card portano `/admin` a **2.379px** a 360 e **1.595** a 1280: quasi mille pixel sotto il tetto.
- **Il mockup non ha mentito**: prevedeva 2.316px a 360, il costruito ne fa 2.379.

### Cambiato
- **Le segnalazioni senza ufficio stanno FUORI dall'elenco**, per costruzione e non per convenzione. Sono **6 aperte e 0 chiuse**: dentro la classifica sarebbero la riga più lenta e più rossa della pagina, **attribuita a un ufficio che non esiste**. Il numero resta e dice un'altra cosa — quante segnalazioni non sono di nessuno — con la frase che lo spiega accanto.
- **Mediana, mai media.** Una pratica ferma da un anno fra quattro svelte porterebbe la media a 75 giorni contro una mediana di 3: racconterebbe una lentezza che quell'ufficio non ha. Un test lo prova con quei due numeri.
- **Le categorie sotto la soglia non si mostrano, ma si dichiarano**: «Altre 5 categorie hanno meno di 5 casi». Tacerle farebbe credere che la città non le abbia; mostrarle accanto a quelle piene le farebbe leggere come confrontabili.

### Note
- ⚠️ **Nessuna barra, e non è una semplificazione.** Una barra del tempo mediano avrebbe come massimo «il peggiore osservato», cioè una scala a tacche senza un traguardo fissato — ciò che `DESIGN.md` vieta e che ha già fatto togliere la scala da `/promesse`.
- **Le due card hanno altezza costante**: gli uffici sono cinque e restano cinque, e le categorie mostrate sono solo quelle sopra soglia. È la proprietà che ha reso giusto lista + dettaglio — ciò che conta non è l'altezza, è la derivata.
- **Nessuna rotta nuova**, quindi niente da aggiungere a `rotte.mjs`/`shots.mjs`/`pagine-cancello.ts`: `/admin` è già dentro i cancelli a11y e bersagli, e le due card ci sono finite da sole.
- ⚠️ **Il cancello a11y ha fatto rosso al primo giro, e aveva ragione.** La riga «6 segnalazioni senza ufficio» usava `--red`, che su testo da **14px** fa **4,3:1** contro il fondo della card — sotto il 4,5 di AA. Il progetto aveva già la leva scritta: `--red-ink` esiste «per il solo caso in cui il rosso dello stemma diventa testo minuto». Un colore aggiunto senza misurare la coppia è la regola di `AGENTS.md` §5, e stavolta il cancello l'ha misurata al posto mio — che è esattamente il mestiere per cui è stato scritto.
- ⚠️ **L'alert su trend anomalo non è in questa versione, ed è una scelta.** Le ultime due settimane del seed fanno 6 e 9 contro una media di 2,8 — sembra un picco da manuale, ma **i bucket del seed sono ancorati al calendario**: quell'euristica va tarata su dati veri, non su una semina.

## [0.41.0] — 2026-08-08 · Gli argomenti di una Server Action sono input non fidato

> La review «lenti mancanti» — sicurezza, correttezza della cache, idiomi Next 16 — saltata l'11/06 e mai ripresa: era **l'ultima voce mai passata** della traccia «Qualità continua» ([`ROADMAP.md`](ROADMAP.md) §4). La cosa più grossa non era dove ci si aspettava.

### Corretto
- **`rimuoviPromemoriaAction` poteva svuotare l'intera tabella dei promemoria.** Una Server Action è un **endpoint HTTP pubblico** — il suo id sta nel bundle client — e la firma TypeScript non vale al confine di rete: Next cifra gli argomenti *legati* con `.bind()`, ma l'azione resta invocabile per conto proprio. Incrociato con Prisma, che **lascia cadere i campi indefiniti** da un `where`, `deleteMany({ where: { token: undefined } })` non cancella zero righe: **le cancella tutte**. E l'azione è **senza sessione**, come tutte quelle a token.
- **L'origine dei link nelle mail veniva dagli header.** `baseUrl()` leggeva `X-Forwarded-Host`/`Host`, che li scrive chi chiama. La valutazione è l'unica scrittura aperta a chi non ha un account e l'email è un campo libero: chi votasse con l'indirizzo di un'altra persona e un host forgiato le farebbe arrivare una **mail vera, dal mittente vero**, col link di conferma puntato al proprio server — e quel link porta il token che conferma o cancella la valutazione.
- **Le due rotte API non dicevano nulla sulla propria conservabilità.** Ora `Cache-Control: private, no-store` e `Vary: Cookie`. `/api/segnalazioni/simili` è **per-utente** (`findSimilarReports(user.id, …)`).
- **`toggleFollowAction` accettava qualunque stringa come `targetType`**, perché `FollowTarget` è un tipo e un tipo non attraversa la rete. Niente di privilegiato: righe di spazzatura in una tabella che si legge per capire chi segue cosa.

### Aggiunto
- **`src/lib/token.ts`** — `tokenValido` e `idValido`, da mettere **prima** della query e non dentro. Sei casi coperti: le quattro azioni pubbliche a token, `chiediPromemoriaAction` e `toggleFollowAction`. Con i propri test (**253**, da 247).
- **`APP_ORIGIN`** (`src/lib/env.ts`, `.env.example`): l'origine con cui il sito parla di sé nelle mail. Opzionale **di proposito** — in sviluppo l'host cambia (3000, 3939, la rete locale) e fissarla darebbe link che non si aprono.

### Misurato
- **`deleteMany` con `undefined`: 3 righe su 3**, in una transazione ribaltata sul database di sviluppo. Senza errore e senza traccia. ⚠️ `findUnique` con `undefined` invece **rifiuta** (`PrismaClientValidationError`): chi provasse la famiglia partendo da lì concluderebbe che Prisma si difende da sé.
- **Le intestazioni, prima e dopo**: le pagine ricevono da Next `no-cache, must-revalidate`; le due rotte API ricevevano **niente**. Ora `private, no-store` più `Vary: Cookie`, verificato sulle risposte vere.
- **69 Server Action censite una per una**: tutte guardate tranne le **7 dichiaratamente pubbliche** (3 di autenticazione, 4 a token). Nessun `try/catch` nelle azioni che possa ingoiare il `redirect()` di una guardia.
- **66 rotte, tutte dinamiche** (`ƒ` nella tabella del build): nessun dato per-utente può finire in un prerender.

### Note
- **Il resto ha retto, e vale scriverlo**: `cachedShared` non porta dati per-utente in nessuno dei quattro usi e non legge `cookies()`/`headers()` dentro uno scope di cache; sessioni a 256 bit con HMAC a riposo; il cambio password verifica la vecchia e riemette la sessione; un solo `dangerouslySetInnerHTML`, su geometria SVG, già commentato con la condizione che lo rimetterebbe in discussione.
- **Idiomi Next 16 già a posto**: `revalidateTag` è già nella forma a due argomenti che la 16 richiede, `middleware`→`proxy` è fatto, `params`/`searchParams`/`cookies()`/`headers()` tutti attesi, nessuna API deprecata, nessun `next/image` e nessuna rotta parallela da adeguare. Resta **`unstable_cache`**, che la 16 dichiara sostituito da `use cache`: è un cambio architetturale (Cache Components), non una riga — scritto fra i debiti con la sua condizione.

## [0.40.1] — 2026-08-08 · La preferenza di movimento non si legge in fase di render

> `/bilancio` stampava due errori di idratazione a ogni caricamento, ma **solo con `prefers-reduced-motion` attivo** — cioè esattamente nello stato in cui girano `accessibilita.spec.ts` e `bersagli.spec.ts`, che li scrivevano nel proprio log quattro volte mentre uscivano verdi. Aprire la pagina in un browser normale non mostrava niente.

### Corretto
- **Il mismatch di idratazione di `/bilancio`.** `useReducedMotion()` è `null` sul server — che non ha media query — e `true` sul browser di chi ha la preferenza attiva: `ScrollTold` rendeva la barra di avanzamento con `{!reduce ? … : null}`, quindi il server la metteva e il browser no.
- **«Target ref is defined but not hydrated».** Non era un secondo difetto ma il primo per **cascata**: `ScrollStep` chiamava `useScroll({ target: ref })` sempre, e con la preferenza attiva tornava su un `<div>` semplice che quel `ref` non lo montava mai. Ora l'elemento è uno solo e il `ref` è sempre agganciato.
- **Altri quattro punti della stessa famiglia**, che il primo mismatch teneva nascosti: `sankey-flow`, `dot-scatter-timeline`, `line-chart`, `display-number`, `cronoprogramma-chart` diramavano `initial` su `reduce` — e **`initial` è markup**, Motion lo scrive nello style servito. React riporta **un solo** mismatch per albero, quindi ognuno si vedeva solo dopo aver chiuso quello sopra.
- **Un ternario morto in `RingGauge`**: `strokeDashoffset: reduce ? offset : offset`. Leggeva come se la preferenza cambiasse il traguardo; cambia solo la durata.

### Cambiato
- **La preferenza di movimento si applica in CSS o nella durata, mai in un ramo del markup** (`DESIGN.md` §7, `AGENTS.md` §3). La regola su `[data-motion-reveal]` in `globals.css` passa da `@media print` a `@media print, (prefers-reduced-motion: reduce)`: il problema è lo stesso — una rivelazione che non può o non deve avvenire — e l'esito voluto è identico, fermo e a piena opacità. La barra di `ScrollTold` sparisce con `motion-reduce:hidden`, che è markup unico servito a tutti.

### Misurato
- **`/bilancio` con `prefers-reduced-motion: reduce`: da 2 errori a 0.** E la sonda su **16 rotte** che rendono i componenti toccati — bilancio, opere, segnalazioni, sondaggi, design-system, la-mia-citta, avvisi, comunità, decisioni, eventi, faq, patti, priorità, progetti, promesse, proposte — dà **0 con errori**.
- **Il difetto era in sei punti, non in due.** Il conto vero si è visto solo rimisurando dopo ogni correzione.

### Note
- ⚠️ **Il debito 8 era scritto su un fatto sbagliato.** `npm run produzione` **apre** `/bilancio` da quando esiste (`d5b8a43`, `PAGINE_AUTENTICATE`). Il buco vero è un altro, e più largo: il cancello non emula `prefers-reduced-motion`, quindi non avrebbe potuto vedere questi errori nemmeno aprendo la pagina — e **nessun cancello guarda la console**. Riscritto in `docs/prossima-sessione.md` con la condizione che lo chiude.
- L'eccezione dichiarata resta `app/(app)/template.tsx`, che il mismatch se lo tiene e lo dice con `suppressHydrationWarning`: lì l'animazione d'ingresso può completarsi prima dell'hydration.

## [0.40.0] — 2026-08-07 · Le code non reggevano la crescita, e una nascondeva 26 recensioni

> Il debito che il taglio di `/admin` aveva lasciato aperto poche ore prima ([`docs/piano-admin.md`](docs/piano-admin.md) §6), con la sua condizione già soddisfatta: «Segnalazioni» aveva **14** voci in coda e «Valutazioni» **32**, oltre le ~10 scritte nel piano. La forma l'ha scelta Lorenzo sui mockup iniettati sull'applicazione vera.

### Aggiunto
- **Quattro rotte di dettaglio** — `/admin/{segnalazioni,proposte,domande,valutazioni}/[id]` — e le quattro pagine indice diventano **liste**. Su desktop la lista resta a fianco del lavoro (due colonne); sotto ~1024px c'è solo il lavoro, col ritorno alla coda.
- **Il guscio condiviso** (`components/admin/coda.tsx`): `CodaConDettaglio`, `VoceCoda`, `ElencoCoda`, `TornaAllaCoda`, `FuoriDallaCoda`.

### Misurato
- **La superficie di lavoro non dipende più da quanta coda c'è.** Il dettaglio fa **864px** (segnalazione e recensione), **913** (proposta), **656** (domanda) — con quattordici voci in coda o con quattrocento. Prima il massimo era **1.894px** e cresceva di ~320px per ogni voce in più.
- **La riga di lista è 69px contro i 323 del modulo di lavoro**: 4,7 volte. `/admin/proposte` passa da 1.894 a **656**, `/admin/domande` da 1.492 a **656**.
- **Due pagine crescono, ed è il prezzo dichiarato.** `/admin/segnalazioni` va da 896 a **1.416px** — ma gli 896 di prima erano un riquadro da 576px su 4.680 di contenuto, cioè **12 segnalazioni su 14 fuori vista**. `/admin/valutazioni` va da 1.114 a **2.539**, e mostra **32 voci invece di 6**.
- **Le altre 26 recensioni adesso esistono.** La pagina chiamava `getRecensioniRecenti()`, che tronca a sei, mentre il contatore chiedeva al database: lista e contatore pongono ora **la stessa domanda** (`VALUTAZIONE_DA_ESAMINARE`), quindi non possono più divergere.

### Cambiato
- **La descrizione della segnalazione si vede, per la prima volta.** La coda la caricava — quattordici volte, una per voce — e `ReportTriage` non l'aveva nemmeno nel proprio tipo: il Comune sceglieva lo stato, assegnava l'ufficio e scriveva una **nota ufficiale visibile al cittadino** avendo davanti il solo titolo. Vale identico per il testo della proposta.
- **Il merito è tornato a essere reso dal server.** Titolo, descrizione, autore e pastiglie viaggiavano al browser dentro i componenti client, moltiplicati per il numero di voci in coda. Ora i tre moduli (`report-triage`, `proposal-review`, `answer-form`) portano **solo il modulo**.
- **Il dettaglio si prende per id, non dalla coda.** Ogni azione riuscita toglie la voce dalla propria coda: un dettaglio che interrogasse la coda risponderebbe **404 subito dopo un'azione riuscita**. La pagina resta, dice che la voce è uscita, e offre la strada di ritorno.

- **«È ancora in coda?» si chiede alla lista, non a una seconda copia della condizione.** La prima stesura ricalcolava in JavaScript i `where` del database — `d.answer === null && !d.hidden`, e quattro termini per le valutazioni — cioè due definizioni dello stesso indicatore in un file che esiste per evitarle. La pagina di dettaglio la lista **ce l'ha già** (le serve per la colonna di sinistra), quindi la risposta è `coda.some(v => v.id === id)`. Su «Domande» la versione riscritta a mano aveva già dimenticato un caso: `hidden`.

### Corretto
- **«Flusso ordinario» era tagliato a 375px.** I due pulsanti dell'urgenza affiancati misurano **301px** contro i 239 del proprio riquadro: il secondo sporgeva di **62px** e la card lo ritagliava — un controllo che esiste e non si può premere. Difetto preesistente, chiuso col `flex-wrap` mentre il file veniva ristrutturato. ⚠️ **Nessun cancello poteva vederlo**: `shots` misura il traboccamento *della pagina* (zero), `bersagli` la *dimensione* (a norma, 44px), e axe non ha una regola per «tagliato».
- **Le quattro tendine della valutazione sintetica erano tagliate a metà parola a 360px** — «Impatto: Med…», «Fattibilità: Da…»: il valore corrente, cioè l'unica cosa che un `<select>` comunica a riposo, illeggibile su tutte e quattro. Anche questo preesistente, anche questo invisibile ai cancelli (nessun traboccamento, dimensione a norma), anche questo trovato **guardando la schermata**. Adesso una colonna sola sotto i 384px di contenitore.
- **I due moduli usavano `sm:` dove intendevano `@container`.** Da quando vivono sulla pagina della voce sono larghi **479px** nella colonna del dettaglio e ~303 su telefono: la finestra non c'entra più. Oggi l'esito coincide; smetterebbe di coincidere al primo cambio di larghezza della colonna.

### Note
- **Le quattro rotte entrano nei cancelli insieme alla modifica**: `rotte` **66** (da 62), `shots` +4 pagine per regime, `pagine-cancello` **21** (da 17) — quindi a11y e bersagli **42 casi** ciascuno, E2E **116**. Tutte e quattro e non una «rappresentativa»: i moduli che quei cancelli misuravano ieri sulle liste vivono adesso lì, e sono quattro moduli diversi.
- **I cancelli ci arrivano cliccando**, perché l'id viene dal seed: `DETTAGLI` in `rotte.mjs`, `apriPrima` in `shots.mjs` e — nuovo — `apriPrima` in `pagine-cancello.ts` con `apriDettaglio()` in `helpers.ts`.
- **`@container` e non `sm:`/`lg:`**: la stessa riga vive a **804px** sull'indice e a **304** nella colonna del dettaglio, ed è il caso che `DESIGN.md` §6 descrive dal footer del 05/08.
- **La prima stesura dei mockup mentiva.** Tailwind v4 compila solo le classi che trova nel **sorgente**: `lg:grid-cols-[…]` e `max-h-[34rem]` iniettate a runtime non avevano CSS, e le due colonne sono uscite impilate senza un errore. I mockup a due colonne usano stili in linea.

## [0.39.0] — 2026-08-07 · `/admin` era un cassetto: dieci mestieri in una colonna sola

> L'esecuzione del piano deciso poche ore prima ([`docs/piano-admin.md`](docs/piano-admin.md)). Il taglio non si è ridiscusso: le sette pagine erano già state scelte dalle misure.

### Aggiunto
- **Sei rotte nuove sotto `/admin`** — `valutazioni`, `proposte`, `domande`, `segnalazioni`, `cittadini`, `pubblica` — e `/admin` diventa il **cruscotto**: i quattro numeri, le sei porte, il foglio dei QR, il registro delle azioni. `/admin/codici-qr` non è stata toccata.
- **La navigazione dell'area**, con **il contatore sulle code e nessun pallino sugli strumenti**. Non è una convenzione da ricordare: `SuperficieAdmin` è un'unione discriminata, e «uno strumento con un contatore» **non è scrivibile**.
- **Un cancello sulle porte interne** (`porte.spec.ts`, due casi in più): ogni porta del cruscotto si apre cliccando, la pagina di arrivo dice dove sei (`aria-current`), e si torna indietro senza il tasto del browser. Legge le sei **dal cruscotto stesso** — nessuna seconda lista da tenere allineata a `superfici.ts`.

### Cambiato
- **`getAdminData()` era un `Promise.all` unico con dieci query**: senza spezzarlo ogni sottopagina le avrebbe pagate tutte per mostrarne una. Adesso una funzione per superficie, e i **contatori con `count`** — mai contando le righe che una pagina mostra (`AGENTS.md` §3, ondata 7, 2).
- **Le 23 `revalidatePath("/admin")` diventano `rivalidaAreaComune()`**, che rinfresca tutto il sottoalbero: i contatori delle code si vedono da ogni pagina dell'area, quindi una mappa azione → rotta sarebbe una seconda mappa da tenere allineata a quella vera.

### Misurato
- **Il massimo passa da 7.558px a 1.894px** (`/admin/proposte`). Il cruscotto fa **822**. Ogni pagina paga ~190px di testata e navigazione che prima esistevano una volta sola: è il costo dichiarato del taglio.
- **Il riquadro che scorre dentro «Segnalazioni» doveva restare**, e la prima stesura l'aveva tolto ragionando che «adesso a scorrere è la pagina». Misurato subito dopo: **5.000px** con le 14 segnalazioni aperte del seed — da sola più alta di quanto il piano preveda per l'intera area. Rimesso.
- **La navigazione va dentro ogni pagina, non in un `layout.tsx`**: nell'App Router un layout condiviso **non si ri-renderizza** navigando fra due sue figlie, quindi i contatori resterebbero quelli del primo caricamento. «3 domande in attesa» ancora lì dopo averle chiuse tutte e tre — e un contatore che mente è peggio di nessun contatore.

### Corretto
- **`npm run shots` fotografava una 404 e usciva 0.** Il controllo che difende le pagine per ruolo confronta l'**indirizzo**, e una 404 di Next *sta* sull'indirizzo chiesto: `admin-domande` è stata catturata come «Errore 404 · Pagina non trovata» e la revisione visiva è stata dichiarata riuscita. ⚠️ Il momento in cui capita è quello **standard**: `npm run test:e2e` cancella `.next`, il server di Playwright la ricostruisce altrove, e il primo `npm run dev` successivo riparte in ricostruzione incrementale — lo stato in cui le rotte **annidate** rispondono 404. Chi lancia i cancelli nell'ordine naturale ci passa ogni volta. Portato in `shots.mjs` il controllo che `rotte.mjs` ha da sempre: si guarda se il **testo d'errore è in pagina**, e il messaggio dice cosa fare invece di lasciar cercare nel diff.

### Note
- **`package.json` sale da 0.10.0 a 0.39.0** (decisione di Lorenzo, 2026-08-07). Le due numerazioni non erano **mai** state allineate: il manifesto è rimasto a 0.10.0 mentre il CHANGELOG arrivava a 0.38, e il debito era registrato con la formula «se dà fastidio, è una decisione». Verificato prima di toccare: **nessuno legge quel numero** — né `Dockerfile`, né `docker-entrypoint.sh`, né uno script, né il codice. Non serve a nessuno oggi; serve il giorno di un tag o di un referto, ed è lì che due numeri diversi per la stessa cosa diventano il difetto che questo progetto chiama per nome. Da qui in avanti si muovono insieme.
- **Il contatore ha trovato un buco al primo caricamento**: «Valutazioni» mostra **6** recensioni e ne aspettano **32**. La lista è troncata a sei da sempre; nessuno lo sapeva perché nessuno contava, e le altre 26 non sono raggiungibili da lì. Il rimedio è lo stesso delle code lunghe — **lista + dettaglio** — che il piano tiene fuori di proposito; nel frattempo la pagina **dichiara** di mostrare le più recenti invece di lasciar credere che siano tutte.
- **La condizione che apre il debito delle code impilate è già soddisfatta**: «Segnalazioni» ne ha **14**, oltre le ~10 scritte nel piano.
- **Le sei sottopagine entrano tutte e sei nei cancelli a11y e dei bersagli** (11 pagine → 17, quindi 34 casi per cancello). Non è zelo: sono i componenti che quei cancelli già misuravano ieri dentro l'unica `/admin`. Sceglierne due «rappresentative» non avrebbe risparmiato una verifica nuova, avrebbe **tolto copertura che esiste**.

## [0.38.0] — 2026-08-07 · Un controllo che si riconosce solo al passaggio del mouse, su un telefono non si riconosce mai

### Corretto
- **`.btn-ghost` non aveva nessun segno a riposo.** Era il solo `color: var(--muted)`: un pulsante *ghost* fermo era **indistinguibile da del testo muto**, e l'unico segnale che fosse un controllo arrivava con l'`:hover` — che **su un telefono non esiste**. Misurato su `/admin`: **13 controlli** senza sfondo né bordo, fra cui «Rispondi» e «Segnala alla redazione», che sono le due azioni principali della lista delle valutazioni. Adesso `ghost` ha un bordo tenue a riposo: **da 13 a 1**, in tutti e due i temi, e la pagina non cresce di un pixel (7.300 prima e dopo).
- **L'unico rimasto senza bordo è «Ignora»**, e va bene così: congedare deve pesare meno che bannare, e lì accanto ci sono tre pulsanti contornati che danno il contesto.

### Note
- **Non era un problema di dimensione.** I 13 controlli erano **già alti 44px** — il cancello dei bersagli li vedeva e li approvava, giustamente. Erano invisibili *come controlli*, che è una categoria che nessun cancello automatico misura oggi.
- **La scala delle varianti resta a tre gradini**: primary pieno · secondary superficie + `--border-strong` · ghost trasparente + `--border`. È la lezione di `.btn-sm` di stamattina applicata alle varianti invece che alle taglie — alzare un gradino non deve far collassare quello sopra.
- **Raggio d'azione misurato prima di toccare**: `ghost` è usata in **sei punti**, cinque dei quali in `controlli-staff.tsx` (cioè proprio quelli del difetto) e uno in `proposal-wizard.tsx` («indietro» di un passo, dove un bordo tenue non disturba).
- **🔴 Il disco del server era pieno al 100%, ed è la causa vera.** `/dev/sda2 40G 38G 0 100%`. Postgres andava in `PANIC: could not write to file … No space left on device`, entrava in recovery a ciclo, e da lì tutta l'API di Coolify rispondeva `Server Error`. **Ogni deploy costa 2,82GB e Coolify non cancella l'immagine vecchia**: la sola Dashboard occupava 5 × 2,82 = **14,1GB**, di cui ~8,5 messi dai tre deploy di oggi. Liberati **13GB** — cache di build (9,39GB, e su questo progetto è spazio buttato perché il `Dockerfile` si costruisce con `--no-cache`) più le tre immagini più vecchie tolte **una per tag**, tenendo quella in esecuzione e la precedente per il rollback. Disco da **100% a 66%**, e Coolify è tornato `healthy` **da solo in ~20 secondi**, senza riavvii. ⚠️ Mai `docker image prune -a`: sullo stesso server vivono Umami, Homepage e Uptime Kuma. Debito registrato con la condizione che lo chiude: un build **multi-stage** toglierebbe le devDependencies dal peso finale, e si valuta quando `df -h /` tornerà sopra l'80% nonostante la potatura.
- **`AGENTS.md` §8 — il piano di controllo può cadere, e l'applicazione resta in piedi.** I container `coolify` e `coolify-db` sono andati **`unhealthy`**, e da lì **ogni** endpoint dell'API ha risposto `{"message":"Server Error"}`: `/applications`, `/deployments`, `/version`, `/teams` e anche `/deploy`. La Dashboard però ha continuato a girare senza accorgersene — il sito serve e `npm run produzione` passa. Coolify malato è un problema di *deploy*, non di *servizio*. ⚠️ Il sintomo che inganna: la caduta si vede **prima** nel polling di un deploy in corso, che passa da `in_progress` a `Server Error` senza mai dire `finished` mentre il deploy arriva in fondo lo stesso — e la conclusione naturale, «è appeso, rilancio», costa un deploy inutile. La prima lettura scritta oggi («il record del deploy smette di rispondere») era vera e **troppo stretta**: corretta nello stesso giorno.

## [0.37.0] — 2026-08-07 · In «Proposte cittadine» il macchinario pesava più del merito

> Due dei quattro difetti estetici trovati rivedendo `/admin` una schermata per volta. Gli altri due — la pagina da 7.300px e le azioni senza affordance — sono coppia e vanno decisi insieme.

### Corretto
- **La gerarchia era rovesciata.** Pastiglia e conteggio stavano in cima, e il **titolo della proposta** — la cosa che un cittadino ha scritto e che il Comune deve giudicare — sotto, a `text-sm`: più piccolo dei controlli del modulo che lo circondano. Adesso il titolo viene **primo** e a `text-base`, con lo stato sotto come metadato. Il macchinario non può pesare più del merito.
- **Lo stato era detto tre volte** sulla stessa scheda: la pastiglia («Risposta del Comune»), la coda «· risposta pubblicata» a due centimetri, e il valore del `<select>` sotto. La coda ora compare **solo quando la pastiglia non lo dice già** — negli altri stati non è una ripetizione ma un'informazione in più, perché una proposta ancora «Pubblicata» può avere già una risposta scritta. Restano due: il segnale da scorrere e il valore del controllo, che è funzionale e non si toglie.

## [0.36.0] — 2026-08-07 · Il footer a una larghezza che nessuno aveva guardato

### Corretto
- **446px di vuoto nel footer, su ogni pagina della piattaforma.** Portandolo fuori da `<main>` il 2026-08-06 — forma «a tutta larghezza», decisione presa allora — la scheda è passata da ~850px a **~1100** dentro `AppShell`: una larghezza a cui il footer **non era mai stato guardato**. Lì `@3xl:justify-between` spingeva le colonne dei link contro il bordo destro e apriva il vuoto. Chiuso con un **tetto di 850px alle due righe interne**, non alla scheda: il vetro resta a tutta larghezza come deciso, e la composizione torna dove funzionava. Vuoto da 446 a **258px**, misurato.
- **850px non è scelto a occhio**: è la colonna di `main` dentro `AppShell` (`max-w-6xl` meno padding, barra laterale e gap), cioè la larghezza a cui questo footer è stato disegnato e verificato quando ci viveva dentro.

### Note
- **Verificato nei tre contesti in cui il footer vive**, più la viewport minima: `AppShell` 1104px · pubblico 1104px · legale 640px · 360px. Sulle pagine legali non cambia nulla — il tetto è più largo del contenitore — e il traboccamento orizzontale è **zero** ovunque.
- **La regola che è costata due volte in tre giorni**: quando si cambia *dove* vive un componente, cambia la sua larghezza, e le larghezze a cui è stato verificato non valgono più. `@container` risolve il *come* si adatta, non il *se* qualcuno l'ha guardato a quella misura. La prima volta fu il 05/08 con `lg:` al posto di `@container`; questa è la stessa famiglia dall'altro lato.

## [0.35.0] — 2026-08-07 · La Redazione aveva una stanza e nessuna porta

> Trovato guardando `/admin` e `/redazione` una per una — cosa che non era mai stata fatta. Tre cancelli erano verdi sopra questo difetto.

### Corretto
- **`/redazione` non era raggiungibile da nessun collegamento.** Zero `href` in tutta l'applicazione: solo il prefisso nel proxy e tre `revalidatePath`. Il moderatore doveva **digitare l'indirizzo** per aprire la propria unica superficie di lavoro, e una volta lì la barra laterale non aveva nessuna voce attiva — mentre l'admin, sulla stessa barra, aveva «Area Comune» da sempre. Adesso la Redazione ha la sua voce, con la pastiglia attiva, **e la stessa voce nel menu del profilo**, che a 375px è l'unica porta possibile (la barra laterale è `lg:block`, e quella in basso porta solo le cinque destinazioni pubbliche).
- **`SideNav` riceve il RUOLO, non un booleano.** Era `isAdmin: boolean`, ed è metà della ragione per cui la Redazione è rimasta fuori: un secondo booleano accanto avrebbe lasciato scrivibile «admin e moderatore insieme», che per disegno non esiste (R-4). La superficie riservata si ricava da `staffNav(ruolo)`, in **un posto solo** — e la tinta dell'icona vive sul `NavItem`, così il menu del profilo non diventa una seconda lista di superfici di staff.

### Aggiunto
- **`tests/e2e/porte.spec.ts` — il cancello che mancava**, quattro casi: due ruoli × due larghezze (barra laterale a 1280, menu del profilo a 375). Prova la **regola** — ogni ruolo con una superficie riservata ha una voce che ce lo porta, ci si arriva **cliccando**, e la voce risulta attiva — non le due rotte di oggi. La suite passa da 70 a **74**.

### Note
- **Perché nessun cancello lo vedeva, e vale oltre questo caso.** `rotte.mjs`, `accessibilita.spec.ts` e `bersagli.spec.ts` aprono le pagine **tutti per indirizzo**, con `goto()`. «La pagina risponde» e «si può arrivare alla pagina» sono due domande diverse, e finora ne misuravamo una sola. È lo specchio della trappola 4 della Fase A/B, dove `shots` non vedeva le rotte annidate rotte *perché ci arrivava cliccando*.
- **Una lezione ripagata**, già in `AGENTS.md` §3 (ondata 7, 1): la prima stesura passava il `NavItem` da `AppShell` (Server Component) a `SideNav` (client), cioè `icon` — **un componente React** — attraverso il confine RSC. `render: function PenLine`, pagina sull'error boundary, **typecheck e lint verdi tutti e due**.
- **Una voce di navigazione non è «aggiunta» finché non dichiari a quali larghezze esiste.** La prima versione era desktop-only e lasciava il telefono com'era; il difetto si vedeva solo misurando a 375px.

## [0.34.0] — 2026-08-07 · Il cancello impara a dire QUALE versione sta girando

> Il limite dichiarato ieri sera ha morso stamattina, al primo uso vero. Ora è chiuso.

### Aggiunto
- **Il controllo della versione, per primo fra tutti** — perché se la versione è sbagliata, ogni altro controllo sta misurando un'altra applicazione. Si chiede al server **quale immagine sta eseguendo il container vivo** (`docker ps`), e il tag di quell'immagine **è** lo SHA del commit: `docker build -t <uuid>:<sha>`, lo mette Coolify. È un fatto sul processo in esecuzione, non una dichiarazione di chi ha lanciato il deploy — e **non dipende da come il deploy è stato lanciato**: vale identico dall'interfaccia di Coolify e dall'API.
- **Quando non combacia, dice di quanti commit la produzione è indietro** (`git merge-base --is-ancestor` + `rev-list --count`), e se lo SHA vivo non è un antenato del proprio `HEAD` lo dice invece di fingere una distanza.
- **Un avviso quando l'albero di lavoro è sporco**, e solo quando la versione è giusta: è lì che un verde si legge «la produzione ha ciò che sto guardando», ed è falso. Se la versione è già rossa, la stessa riga sarebbe rumore.

### Note
- **Tre strade scartate, misurate invece che immaginate.** *(a)* Lo SHA come argomento di build: **Coolify non lo passa** — gli unici sono `COOLIFY_URL`, `COOLIFY_FQDN`, `COOLIFY_BRANCH`, `COOLIFY_RESOURCE_UUID` e le variabili dell'app. *(b)* Calcolarlo nel build da `.git`: il contesto è `/artifacts/<deploy>/pistoia-dashboard` e `.git` sta un livello sopra. *(c)* Scriverlo in una variabile di Coolify da un comando di deploy: regge finché ogni deploy passa da quel comando, e al primo lancio dall'interfaccia **il marcatore mente** — peggio che non averlo. Sono in `AGENTS.md` §8 perché nessuno le riprovi.
- **`ssh` che non risponde è ROSSO, non «saltato»**: «versione NON verificata» è un problema contato, mai un verde per omissione. E si stampa lo stderr di `ssh` (`Could not resolve hostname`, `Permission denied`) invece del comando fallito, che non ha mai detto a nessuno perché.
- **Provato rosso su tutte e cinque le strade**: commit diverso e non antenato · tag che non è uno SHA (`0.0.21`) · nessun container col nome cercato · `ssh` irraggiungibile · e la distanza «indietro di N commit» verificata contro un antenato vero.
- **Il limite che resta, dichiarato**: si verifica il *tag* dell'immagine viva, e chi lo assegna è Coolify al checkout. Se Coolify prendesse un commit e ne scrivesse un altro, il marcatore ripeterebbe il suo errore.
- **Il cancello scrive nel database dimostrativo, ed è ora dichiarato in `AGENTS.md` §8.** Accede come `cittadino@` e atterra su `/la-mia-citta`, dove `CampagnaHome` registra la sollecitazione al montaggio — e in produzione il seed non si può rilanciare. Misurato: è più piccolo di quanto sembrasse. La card **resta a schermo** (conta una volta sola finché non rispondi), quindi la dimostrazione non si degrada, e il fatto registrato — «la campagna è stata mostrata» — è **vero**: un browser vero l'ha mostrata. Non vale un conto dedicato oggi; la condizione che lo cambia è scritta accanto — il giorno in cui quella base dati smetterà di essere dimostrativa.

## [0.33.0] — 2026-08-07 · Il cancello sulla produzione

> Il primo cancello che guarda il **sito deployato** invece di `localhost`. Era l'ultima voce aperta della traccia «Qualità continua» ([ROADMAP.md](ROADMAP.md) §4); il perché di ogni controllo è in [AGENTS.md](AGENTS.md) §8.

### Aggiunto
- **`npm run produzione` (`scripts/produzione.mjs`)** — un browser vero contro il sito deployato, **sette controlli**, da lanciare dopo ogni deploy. Colma un buco vecchio quanto il progetto: dodici cancelli verdi non dicevano niente su ciò che vede chi apre l'indirizzo pubblico, perché **`rotte` e `shots` girano contro lo sviluppo**. È il motivo per cui il 2026-08-05 una demo che nessun browser riusciva a montare — `upgrade-insecure-requests` faceva fallire ogni script su un sito servito in HTTP — è rimasta così **dalla Fase 0**, rispondendo 200 e servendo l'HTML giusto per mesi.
- **La soglia sui caratteri è per pagina, e scritta sotto il valore misurato.** `/metodologia` 17.140 → 8.000 · `/valutazioni` 1.826 → 900 · `/bilancio` 2.695 → 1.300 · `/segnalazioni` 10.121 → 5.000. Il margine è **la metà**, molto più largo dei cinque punti di Lighthouse, e la ragione è dichiarata nel file: il testo di una pagina cambia coi contenuti — la produzione può essere indietro di commit, il seed cresce, e il footer è uscito da `<main>` il 2026-08-06 — mentre il guasto che il cancello cerca porta `main` a ~183 caratteri, cioè a un ordine di grandezza da qualunque soglia.
- **`/login` è fuori dal conteggio, di proposito.** Misurato in produzione: `main` ha **228 caratteri anche quando è sana**, perché è solo il modulo. Una soglia che regga per `/login` non distinguerebbe una pagina sana da una ferma sul «Caricamento in corso». Lì il cancello chiede l'unica cosa che conta: **il modulo c'è e si può compilare**.
- **All'accesso seguono due rotte protette, non una.** Il 2026-08-05 il login riusciva e ogni navigazione successiva tornava al login, perché il cookie di sessione aveva `Secure` su un sito in HTTP: un controllo che si ferma all'accesso non lo vede.
- **Il marcatore della tavolozza si legge dal tema compilato**, non è cucito nello script: `--color-accent: light-dark(#0A756B, #2FD0BD)` deve comparire nei fogli serviti. Controllo debole e dichiarato tale — parla solo quando la tavolozza cambia — ma il caso in cui parla è quello grosso, «ho lanciato il deploy e sto guardando la versione di prima».

### Corretto
- **I tre controlli post-deploy di `AGENTS.md` §8 erano voci da spuntare a mano**, e una voce a mano non è una garanzia: nessuno la rispunta. Adesso sono un comando.

### Note
- **Non è in CI, e il file lo dichiara.** L'indirizzo del deploy è un IP privato in rete locale (`sslip.io`): i runner di GitHub non lo raggiungono — la stessa ragione per cui non c'è auto-deploy sul push. Un job che ci provasse fallirebbe sempre, o verrebbe scritto tollerante e diventerebbe un cancello che non guarda niente.
- **Provato rosso prima di dichiararlo verde**, che è l'unica prova che un cancello funzioni: host irraggiungibile (7 controlli su 7 rossi), sito sbagliato (7 su 7, con `stato 404 · nessun <main> in pagina`) e accesso fallito (3 su 7) escono tutti con codice **1**. Un accesso mancato **conta le pagine protette come rosse invece di saltarle**: uscire 0 senza aver verificato niente è il difetto che `shots` aveva, e che aveva prodotto una «revisione visiva» della sola pagina di login.
- **I prelievi RSC annullati non sono guasti.** Next preleva in anticipo le rotte vicine e annulla quando si naviga altrove: fino a **26** `net::ERR_ABORTED` su una pagina sana. Contarli avrebbe fatto nascere il cancello rosso, cioè inutile. Il guasto vero ha un'altra firma — `net::ERR_CERT_AUTHORITY_INVALID` — e passa.
- **Che cosa non prova, dichiarato**: *quale versione* sia in produzione. Un marcatore vero vorrebbe lo SHA del commit dentro l'immagine, che è una decisione di deploy e non di script.

## [0.32.0] — 2026-08-07 · Il backlog riordinato, e il piano fino all'Ondata 11

> Nessun codice: è un riordino del piano. Il dettaglio delle quattro decisioni che l'hanno guidato è in [DISCOVERY.md](DISCOVERY.md), il piano in [ROADMAP.md](ROADMAP.md) §4.

### Modificato
- **L'Ondata 8 aveva due tesi e metà voci acerbe.** Portava dentro «strumenti per il Comune» *e* «nuovi pubblici», con dentro modalità turista, servizi quotidiani, commercio locale, vetrina aziende, storie della città. Adesso ne tiene una: **l'intelligenza operativa** (analytics, alert su trend anomali, moderazione assistita — tutto su dati che il database ha già), più **le maturità del backlog** che erano rimaste senza ondata, più **la pipeline degli atti**.
- **Il criterio del riordino è scritto**, e vale d'ora in poi: una voce entra se è **definita** (so cosa costruire senza inventare la metà che manca), **fattibile** (i dati o la macchina esistono già) e **onesta** (non chiede di inventare fatti su persone o enti reali). È la terza prova ad aver escluso *modalità turista* e *servizi quotidiani*, che sembrano innocue e invece richiedono orari di musei veri e link a servizi veri.
- **Sette voci recuperate dal limbo**: `Collegamento proposte ↔ opere ↔ bilancio` era 🔜 su un'ondata chiusa da giugno; `Open data out`, `QR territoriali`, `Bilancio partecipativo simulato`, `Scorciatoie da tastiera`, `OG image dinamiche` e `Alto contrasto + font grande` erano 📋 senza ondata. Entrano tutte in O8. `Lettura audio` si separa dalle altre due preferenze: è una macchina diversa.
- **Nuovo stato 🅿️ «parcheggio»**, perché «rinviata» senza una ragione scritta accanto è solo un modo educato di dimenticare. Undici voci ci entrano, ognuna con la sua riga.

### Aggiunto
- **Ondata 9 — «Il progetto si racconta»**: roadmap pubblica, voto alle funzionalità, changelog, idee e problemi. Vivono in `/progetto/*` e portano la **firma della Redazione**, non quella del Comune — lettura pubblica, account per agire. Riusano più di quanto sembri: il voto è `Proposal` + sostegni + `ThresholdBar`, il feedback è `Report` con categorie, stati, triage e registro firmato.
- **Ondata 10 — il rifacimento visivo**, col perimetro chiesto da Lorenzo e, accanto, **i limiti che sono già cancelli**: niente WebGL o parallax (deve girare su Android vecchi), nessun contenuto invisibile perché un'animazione non è partita, `prefers-reduced-motion` come stato di prima classe, Lighthouse bloccante a perf ≥ 0,90, **ogni bersaglio ≥ 44px — anche un badge animato è un bersaglio**, contrasto AA nei due temi, zero traboccamenti a 360px.
- **Ondata 11 — l'archivio pubblico degli atti**, che nasce nel linguaggio visivo nuovo invece di essere disegnato due volte.
- **Delibere scongelata**, unica eccezione alle tre categorie tenute ferme, e in forma dichiarata: archivio **vero** (gli atti sono già pubblici per legge, D.Lgs 33/2013), lettura **tutta automatizzata**, comprensibilità **per struttura e non per riscrittura** — nessuna frase generata, ed è ciò che la tiene fuori dalla categoria LLM. Misurata la fonte prima di pianificarci sopra: l'albo di Pistoia gira su un Liferay di terze parti senza API, senza RSS e **con un firewall che risponde 403** a chi non sembra un browser. Da qui la scelta di **spezzarla** — pipeline e cancello di freschezza in O8, superfici in O11 — perché la domanda che pesa («il portale si lascia leggere?») costa poco se la si cerca presto.
- **Cinque righe del piano riallineate ai fatti**, trovate facendo la ricognizione: Lighthouse e l'audit delle dipendenze erano dati per «da impostare» mentre sono bloccanti dal 6, le valutazioni dei servizi dicevano «resta R-6» e R-6 è chiusa dal 5, e il catalogo portava ancora etichette `O5` di quando le ondate erano cinque.

## [0.31.0] — 2026-08-07 · Il cancello dei 44px, e i tre difetti che nessuno guardava

### Aggiunto
- **`tests/e2e/bersagli.spec.ts`: il cancello dei 44px, BLOCCANTE.** 11 pagine × **2 viewport** (1280 e 360) = 22 casi, dentro `npm run test:e2e` (che passa da 48 a **70**). Misura la promessa di `DESIGN.md` §11.6 applicando le quattro eccezioni una per una — spaziatura, inline, equivalente, essenziale — e l'elenco delle esenzioni «essenziali» nasce **vuoto**: nessun bersaglio della piattaforma ha bisogno di stare sotto i 44. Non sostituibile con `target-size` di axe, che applica le stesse eccezioni **a 24px**: i 16px del footer sarebbero passati anche lì, perché ben spaziati.
- **Due viewport e non uno**, perché nessuno dei due contiene l'altro: a 1280 esiste la barra laterale (21 bersagli che a 360 non esistono), a 360 i moduli si impilano e vengono avanti controlli che a 1280 stanno larghi. Misurato: **158 rossi a 1280 contro 147 a 360**, liste non sovrapposte.
- **`tests/e2e/pagine-cancello.ts`**: l'elenco delle undici pagine in un posto solo, condiviso dai due cancelli di accessibilità. Due copie sarebbero divergute al primo inserimento.
- **`npm run bersagli`**, per girare il solo cancello dei 44px.

### Corretto
- **Sette componenti sotto i 44px, chiusi tutti** (decisione di Lorenzo: nessuna esenzione, poi bloccante). La **barra laterale** — sottovoci a 31,5px e voci a 40 — è quella che costa: la colonna si allunga di ~95px, e con la sezione più lunga aperta sfiora i 744px, quindi su uno schermo da 720 scorre. Non c'era via più economica: perché l'eccezione della spaziatura salvasse righe da 31,5px servirebbe un passo di 44px, **cioè esattamente lo spazio che costa farle alte 44**. Poi: i `<select>` e gli input di `/admin` (40 e 36 → 44), il `<summary>` «Aggiungi foto» (**16px**), i chip dei filtri di `/segnalazioni` (34), «Mostra password» (32×32), le pastiglie di moderazione (26), il cursore di avanzamento (16 di scatola), le caselle di `report-composer` (la riga, non il quadratino).
- **`.btn-sm` da 36 a 44px**, e con esso il significato del gradino: «sm» vuol dire ormai **stretto** (1rem di respiro contro 1,25), non **basso**. Un bottone è un bersaglio, e la soglia non ha una deroga per i bottoni piccoli.
- **Le fermate di tabulazione che Motion aggiunge da sé.** `whileTap` mette `tabindex="0"` sull'elemento, e in `ConfirmButton`, `SupportButton` e `PostCard` quell'elemento è un'icona **dentro** il pulsante: **42 fermate senza nome accessibile su `/segnalazioni`**, altrettante su `/proposte` e `/comunita`. Il sorgente non aveva traccia di `tabIndex` e axe non ha una regola che lo dica. Chiuso con `tabIndex={-1}` esplicito.
- **Due violazioni axe `serious` sul bilancio, preesistenti e mai viste**, perché vivevano dentro il `<details>` «Vedi le proporzioni e l'elenco»: sei `ProgressBar` **senza nome accessibile** (`aria-progressbar-name`, WCAG 4.1.2 — chi legge lo schermo sentiva «indicatore di avanzamento, 62%» e non sapeva di cosa) e la percentuale del treemap in `text-muted-2` **sotto l'AA** su una cella tinta al 34% di accento. La prima è chiusa rendendo `etichetta` una prop **obbligatoria** di `ProgressBar`, così le altre tre chiamate — `/opere`, `/opere/[id]`, `ThresholdBar` — non potevano restare mute; la seconda portando la percentuale in `--foreground`, con la gerarchia affidata a dimensione e peso invece che al colore (è il corollario dei tre centesimi di `DESIGN.md` §4).

### Modificato
- **`posata()` apre tutti i `<details>` prima di misurare**, e i due cancelli di accessibilità ci guadagnano copertura insieme: su `/admin` sono **42 bersagli su 222** che prima nessuno guardava, e sul bilancio è lì che stavano le due violazioni qui sopra. Un pannello chiuso è un pezzo di pagina che un cancello verde dichiara sano senza averlo visto.
- **`login()` degli E2E riusa la sessione** invece di ricompilare il modulo a ogni test. Entrando i 22 casi nuovi, la suite è passata da ~25 a ~45 accessi dallo stesso IP e ha **sfondato il tetto di 40 per indirizzo** — l'unico dei tre limiti di `loginAction` che *non* si azzera quando l'accesso riesce: **quindici test caduti insieme**, tutti dopo il quarantesimo, tutti con «resto su /login». La risposta non è alzare il tetto (è una difesa vera): è smettere di provare quaranta volte la stessa cosa. Il percorso vero lo prova `auth.spec.ts` con `accediDalModulo()`. Accessi reali per esecuzione: **da ~45 a 4**, e la suite dura un minuto e venti in meno.
- **`DESIGN.md` §11.6 corregge la propria motivazione**, misurandola: diceva che i 246 fuori norma erano «quasi tutti link dentro la prosa». L'eccezione inline ne salva **14 su 436**; quella che li salva è la **spaziatura**, 264. La conclusione reggeva, la ragione no — e la differenza dice dove guardare quando un bersaglio diventa rosso: quasi mai è la sua dimensione, è che gli si è avvicinato qualcosa.

## [0.30.0] — 2026-08-06 · Chiusura del Lavoro D — l'ultimo cancello e la regola riscritta

### Modificato
- **Il job E2E in CI è BLOCCANTE.** Nasceva `continue-on-error` «finché la suite non è stata rodata in CI»: è rodata — 48 test verdi in locale, verde in CI su ogni passata da settimane. È l'ultimo della famiglia chiusa oggi insieme ad `npm audit` e Lighthouse: **un cancello dichiarato non bloccante «per ora» che ci era rimasto**, mentre è l'unico che prova i percorsi veri — login, voto, moderazione — e non poteva essere quello che valeva meno di tutti.
- **`DESIGN.md` §11.6 riscritta con le quattro eccezioni di WCAG 2.5.8** (decisione di Lorenzo): spaziatura, inline, equivalente, essenziale. Si adotta **l'elenco delle eccezioni, non la soglia** — resta 44px, non 24. Prima diceva «≥ 44px» e basta, e con quel metro sulle otto pagine del cancello risultavano **246 elementi fuori norma**, quasi tutti legittimi: link dentro la prosa, che a 44px spaccherebbero il testo. Una regola violata 246 volte a ragione **non è un vincolo, è un'aspirazione** — ed è per questo che i 16px del footer sono sopravvissuti per mesi. Con le eccezioni la regola torna a descrivere ciò che davvero si pretende, **e diventa scrivibile come cancello**.
- Le intestazioni di data dei documenti vivi (`FEATURES`, `DOCUMENTATION`, `SECURITY`, `ROADMAP`, `DESIGN`) tornano alla data vera: portavano giugno e luglio pur essendo state modificate oggi.

### Resta aperto, col lavoro che lo chiude
- **Il cancello dei 44px va scritto.** `target-size` di axe applica le stesse eccezioni ma con la soglia di **24px**: i 16px del footer sarebbero passati anche adesso, perché ben spaziati. Primo lavoro in coda.

---

## [0.29.0] — 2026-08-06 · Lavoro D — le quattro decisioni di forma

> Quattro domande che aspettavano una scelta di Lorenzo, portate su facsimile e
> chiuse tutte. Nessuna era tecnica: ognuna cambia cosa vede un cittadino.

### Aggiunto
- **La porta d'ingresso porta anche i link.** Da `/` — la prima pagina che vede chi arriva senza account — `/privacy`, `/cookie` e le regole della community **non erano raggiungibili**: c'era una riga di testo e zero collegamenti. Ora c'è una riga con le pagine che si aprono **davvero a chiunque**: valutazioni, metodologia, privacy, cookie, regole. **Non il footer intero**, e per una ragione: quello porta anche la colonna «La città», cioè quattro voci col lucchetto — e la prima cosa che la città dice a un visitatore non deve essere «per queste ti serve entrare».
- **`PROGETTO_NAV` in `nav-items.ts`**, condiviso fra footer e porta d'ingresso: due elenchi paralleli sarebbero due risposte diverse alla stessa domanda «cosa può leggere chi non è entrato».
- **Un filtro sopra l'indice delle 57 deleghe** (`/organigramma`). L'indice esiste per far trovare **una** materia fra 57, e scorrerle tutte è il modo più lento di cercarne una: il campo fa il mestiere che l'indice promette **senza togliere né riordinare niente** — chi non scrive nulla vede esattamente la pagina di prima. Cerca anche fra i **nomi**, perché «di cosa si occupa Nesti» è la stessa domanda letta dall'altro capo; il conteggio sta in una **live region**, o la lista si accorcerebbe in silenzio per chi usa uno screen reader; il campo è alto **44px**, che qui è la regola applicata senza discussione — è un bersaglio isolato e tattile, non un link nella prosa.
- **Una porta per `/pagella`, che si apre da sé.** Sta sotto **Trasparenza**, accanto a Promesse e Bilancio che sono le sue fonti — non sotto Partecipa, dove il gesto è del cittadino mentre qui è la Redazione che giudica. **La condizione non è una data ma un fatto**: la voce compare quando `EDIZIONI` smette di essere vuoto (`lib/pagella.ts`, con un test a guardia). Finché lo è, un menu manderebbe un cittadino su una pagina che dichiara di non avere ancora niente da dire — e il giorno della prima edizione la voce compare **senza che nessuno debba ricordarsene**.

### Modificato
- **Il footer esce da `<main>`** e diventa un vero `contentinfo`. Un `<footer>` discendente di `main` non è mappato a quel ruolo: per mesi chi naviga a punti di riferimento non ha avuto modo di saltarci, **su nessuna pagina**. Prezzo dichiarato: dentro `AppShell` il footer non è più allineato alla colonna di `main` ma parte da sinistra, sotto la barra laterale — l'alternativa allineata voleva un secondo contenitore che ripetesse a mano la geometria della barra, per sempre.
- **`shots.mjs` rilancia il browser a ogni passata.** Con quattro regimi invece di due, un solo processo Chromium **moriva a metà giro** — chiudere un contesto non restituisce la memoria, e una schermata a piena pagina di `/admin` è 2880×8000 a `deviceScaleFactor: 2`. Il primo sintomo è stato **un blocco senza errore**, venti minuti senza una riga di log.

### Note d'ambiente
- **Chromium ha smesso di partire del tutto**, a metà sessione: «Invalid file descriptor to ICU data received», lancio fallito in un secondo su qualunque script — e con esso `shots`, gli E2E e il cancello a11y insieme. Non era il codice né la memoria: era l'installazione, riparata con `npx playwright install chromium --force`. Annotato in `AGENTS.md` §4, con il dettaglio che rende la diagnosi difficile: **il binario risponde a `--version` anche in quello stato**.

---

## [0.28.0] — 2026-08-06 · Lavoro D — i cancelli guardano dove non guardavano

> Quattro voci della traccia «Qualità continua», chiuse insieme. Il filo che le
> lega non è tecnico: **ogni cancello copriva meno di quanto sembrasse**, e in
> tre casi su quattro nessuno poteva accorgersene leggendo il verde.

### Aggiunto
- **WCAG 2.2 nel cancello axe** (`wcag22a`/`wcag22aa`), aggiunti **dopo averli misurati** e non prima: zero violazioni su 8 pagine × 2 temi, e `target-size` passa su **345 nodi** — quindi lo zero è «pulito», non «la regola non gira». La distinzione è il punto: uno zero può voler dire che una regola non ha mai girato.
- **`/admin`, `/admin/codici-qr` e `/redazione` dentro `shots` e dentro il cancello a11y** (Lavoro D §4). Erano esclusioni dichiarate da tre mesi. `shots.mjs` ha ora **quattro regimi** — anonimo, cittadino, admin, moderatore — con un contesto per regime, perché `/login` reindirizza chi ha già una sessione. Il cancello a11y passa da **16 a 22 casi** (11 pagine × 2 temi).
- **Il controllo dell'ATTERRAGGIO**, che è ciò che rende sicure le rotte per ruolo: i guard di questo progetto **reindirizzano invece di rifiutare**, quindi col ruolo sbagliato `/admin/codici-qr` consegna la home con stato 200 e contenuto valido. Ora un atterraggio diverso da quello chiesto è un **fallimento**, non una foto — in `shots.mjs` e in `accessibilita.spec.ts` (`pretendiAtterraggio`).
- **I punteggi di Lighthouse nel log della CI**, mediana per URL letta dal manifest.

### Corretto — tre difetti trovati dai cancelli appena estesi
- **`aria-prohibited-attr`** (serious, 182 nodi): `StarRating` metteva `aria-label` su uno `<span>` **senza ruolo**, dove è un attributo proibito. L'etichetta veniva scartata in silenzio e il voto non era annunciato da nessuna tecnologia assistiva. Chiuso con `role="img"`.
- **`color-contrast`** (serious): l'`Avatar` usava `fg` sopra il proprio `-soft` — **3,72:1** per il rosso dello stemma. È esattamente il caso per cui la C-2 aveva creato `--red-ink`, applicato a `Badge` e al banner degli avvisi ma non qui. Non si era mai visto perché **il colore dell'avatar deriva dal nome**, e nessuna pagina misurata cadeva sul rosso: ci è cascato il super-account del Comune, entrato fra le pagine misurate solo adesso. **Un difetto che dipende dai dati si vede solo se fra i dati misurati c'è il caso che lo innesca.**
- **`/admin` traboccava di 125px** a 360px in modalità semplice, nei due temi: `grid gap-2 sm:grid-cols-2` **senza `grid-cols-1`**, con dentro due `<select>` il cui min-content è l'opzione più lunga («Giochi rotti al giardino di Via Pacini», 416px); più un `<input>` `flex-1` senza `min-w-0`. Sono le trappole 5 dell'ondata 7 e 23 della C-2, entrambe già documentate — e sopravvissute perché quella pagina non era in nessun cancello visivo.

### Modificato
- **`npm audit` è BLOCCANTE** (`--audit-level=high`, senza `|| true`). La condizione scritta diceva «quando lo zero avrà retto qualche settimana»: ha retto **un giorno** ed è stata scavalcata per decisione esplicita. `SECURITY.md` §7 dice perché l'argomento che la sosteneva era più debole di quanto sembrasse — nessuno rilegge `npm audit` a mano ogni settimana, ed è per non doverlo fare che esiste la CI. La soglia agisce sul **codice di uscita**, non sul referto: un `moderate` resta visibile nei log senza far cadere la pipeline.
- **Lighthouse ha soglie, e il job è bloccante.** Erano assenti «in attesa di guardare le prime passate» — ma **le passate non si potevano guardare**, per due difetti indipendenti scoperti insieme: `.lighthouseci` comincia con un punto e `upload-artifact@v4` esclude i file nascosti per default (dodici referti scritti, **zero caricati**, job verde, un `##[warning]` in un log da 400 righe); e senza `assert`, `lhci autorun` si ferma a `collect` e non stampa nessuna tabella. Il meccanismo per leggere i numeri era rotto da entrambe le parti, quindi la condizione non poteva avverarsi da sola. Prima misura vera: perf **100 · 100 · 95 · 95**, a11y 100 ovunque. Le soglie stanno **cinque punti sotto il minimo osservato**, perché una soglia appoggiata al minimo lampeggia al primo rumore.

### Documentazione
- **`AGENTS.md` §3, trappole 23–25** e §4 riscritta sui passaggi di ruolo.
- **`DESIGN.md` §11.6 dichiara la propria inapplicabilità**, ed è la scoperta più scomoda della giornata: WCAG 2.5.8 chiede 24px **con quattro eccezioni**, §11.6 chiede 44 **senza**. Col metro crudo, sulle otto pagine del cancello ci sono **246 elementi interattivi sotto i 44px**, quasi tutti legittimi (link dentro la prosa). La regola non funziona da vincolo, funziona da aspirazione — e infatti i 16px del footer sono sopravvissuti per mesi. **Decisione richiesta**, in `ROADMAP.md`.

---

## [0.27.0] — 2026-08-05 · Lavoro D, punto 1 — il footer per chi non ha un account

> La domanda di partenza era piccola: sulla scheda pubblica i link del footer
> portano a pagine protette, che si fa? Misurandola è venuto fuori che **quattro
> voci su sette** rispondono `307 → /login`, e che **tre di quelle quattro
> perdono anche la destinazione** — chi accede atterra altrove e deve ritrovarsi
> la pagina da sé. La differenza non era casuale: `/organigramma` è l'unica
> elencata in `PROTECTED_PREFIXES`, cioè protetta **per decisione**; le altre tre
> lo sono **per residenza**, perché stanno nel gruppo `(app)`, e la DAL fa
> `redirect("/login")` senza sapere da dove venissi.
>
> E le superfici anonime erano **due**, non una: oltre a `(pubblico)` c'è
> `(legal)`, dove atterra chi legge l'informativa dal modulo di voto del QR — che
> per decisione esplicita **un account non ce l'ha**.
>
> Ma la risposta di Lorenzo alle quattro forme proposte è stata che il problema
> era un altro: *«quelle sono delle scritte posizionate lì quasi a caso»*. Aveva
> ragione, e si può dimostrare — **sei difetti misurati**, nessuno di gusto.
> Il footer è stato rifatto.

### Modificato
- **`components/app/footer.tsx` — ridisegnato.** È una **scheda di vetro** appoggiata sulla tela (`.card`), non più un'area sotto un filo da 1px: risponde al difetto d'identità col **materiale** invece che con un ornamento, ed è `DESIGN.md` §4 applicata al fondo pagina. Due colonne col titolo **visibile** — «La città» e «Il progetto» — dove prima i due gruppi esistevano solo negli `aria-label` e si distinguevano per `#5A5D61`/500 contro `#65686C`/400, cioè per un capello. La divisione non è di comodo: la seconda colonna è tutta a lettura pubblica, la prima chiede un account.
- **`/metodologia` entra nel footer** (decisione di Lorenzo): è pubblica ed è il regolamento che le schede di `/valutazioni` citano già nel corpo.
- **`src/proxy.ts`: `/avvisi`, `/faq` e `/glossario` entrano in `PROTECTED_PREFIXES`.** Non cambia **chi** può leggerle — il guard vero resta la DAL — cambia che il redirect porta con sé il `?next=`, come già faceva `/organigramma`.
- **`(legal)/layout.tsx` diventa asincrono** e chiama `getCurrentUser()`: senza, la pastiglia per gli anonimi comparirebbe anche a chi è già dentro. `AppShell` passa `autenticato`. Il valore predefinito della prop è `false` **di proposito**: un innesto dimenticato mostra l'invito a chi è dentro (difetto visibile), non lo nasconde a chi ne ha bisogno (difetto muto).

### Corretto
- **I bersagli del footer erano alti 16px**, su **ogni pagina della piattaforma**, contro i **≥44px** che `DESIGN.md` §11.6 dichiara vincolanti (e i 24 del minimo WCAG 2.2). Ora ogni voce è una riga da 44px. Il footer cresce da 113px a ~348px sul desktop: è il prezzo giusto della regola. **Nessun cancello poteva vederlo** — `accessibilita.spec.ts` gira sui tag `wcag2aa`/`wcag21aa`, e `target-size` è WCAG 2.2. Il buco è ora in `ROADMAP.md`, traccia «Qualità continua».
- **Il blocco d'identità rendeva a 15px invece che a 12px.** `text-xs` stava sul contenitore, e il reset di Astryx dichiara `font-size` direttamente su `:where(p)`: una dichiarazione sull'elemento batte un valore *ereditato*. Risultato: il testo meno informativo del footer era il più grande di tutti, cioè la gerarchia rovesciata. È la trappola 3 dell'ondata 6 — documentata per il **colore** — che vale identica per la dimensione: adesso è scritta in `AGENTS.md` §3 come **trappola 23**, col controllo che la trova.

- **Il footer si strozzava sulle pagine legali.** Usava `lg:flex-row`, cioè una soglia sulla **finestra**, ma vive in due colonne molto diverse: ~850px dentro `AppShell` e **640px** in `(legal)` (`max-w-2xl`). A 1440px di finestra la variante scattava anche nella colonna stretta, e lì i 640px si dividevano in 320 d'identità più due colonne da **~82px**: «FAQ della città» a capo, «IL PROGETTO» a capo. Passato a **`@container`** (nativo in Tailwind v4): la soglia adesso è la larghezza del footer, che è la sola che conti. Misurato: 263px per colonna invece di 82. **Nessun cancello poteva vederlo** — il testo andava a capo, non fuori, quindi `shots` usciva 0: l'ha trovato la casella «l'hai guardata» di `AGENTS.md` §5, aprendo lo screenshot.
- **Il lucchetto della pastiglia restava orfano su una riga sua** in colonna stretta, perché era un elemento flex accanto alla frase invece che dentro. Ora è `inline-block` e scorre come una parola.

### Documentazione
- **`AGENTS.md` §3, trappole 23, 24 e 25**: il reset di Astryx batte l'ereditarietà anche per `font-size`; **un cancello automatico copre le regole che gli hai chiesto, non la promessa che hai scritto in un documento**; e **un componente che vive in colonne di larghezza diversa non può usare `sm:`/`lg:`** — se sono due larghezze, le varianti di finestra sono già sbagliate.
- **`DESIGN.md` §4** — corollario alla revisione della tavolozza: i valori nuovi sono per costruzione *il più chiaro che superi 4,5:1*, quindi alcuni passano per pochissimo. `--muted-2` sulla tela fa **4,53:1**; una proposta di footer col motivo delle fasce romaniche al 3,5% lo portava a **4,24:1**, sotto soglia — una tinta che a occhio non esiste. **Un token che passa per tre centesimi non sopravvive a nessuno sfondo tinto.** All'opposto il vetro aiuta: sulla card `--muted-2` risale a 5,28:1. §6 e §11.6 aggiornate insieme.

---

## [0.26.0] — 2026-08-05 · Fase C, «Qualità continua» (C-2) — zero avvisi, due cancelli nuovi e la tavolozza che non rispettava la propria promessa

> La traccia trasversale mai iniziata, aperta nell'ordine deciso con Lorenzo:
> **audit → Next → axe → Lighthouse**. Il risultato: `npm audit` passa da
> **12 vulnerabilità a ZERO**, e nascono i due cancelli che mancavano da tre
> ondate.
>
> Ma la cosa che conta di più l'ha detta una macchina a un documento:
> `DESIGN.md` §4 dichiarava «Contrasto WCAG AA ovunque, già verificato: non si
> regredisce». **Non era vero.** La verifica era stata fatta a mano, una volta,
> e alla prima misura automatica il tema chiaro falliva AA in cinque punti —
> tutti di **tavolozza**, non di pagina: i link, il pulsante primario, i chip,
> i due grigi. Corretto tutto, e il documento adesso dice come stanno le cose.
>
> E una lezione sui cancelli: Next 16.3 fa sparire il **corpo di ogni pagina**
> in sviluppo, e `rotte` passava 56/56 mentre `shots` usciva 0. L'ha trovato
> la casella «l'hai guardata» di `AGENTS.md` §5 — nessun controllo automatico
> guardava se il contenuto ci fosse.

### Aggiunto
- **`tests/e2e/accessibilita.spec.ts`** — il cancello di accessibilità automatico che la traccia chiedeva da tre ondate: **axe-core** su 8 pagine (una per famiglia di composizione) × 2 temi, con le regole **WCAG AA** che `DESIGN.md` §11 dichiara vincolanti. Il fallimento racconta regola, impatto, selettori e link alla spiegazione, invece di stampare un oggetto axe. Dipendenza nuova: **`@axe-core/playwright`** (MPL-2.0, una sola sotto-dipendenza).
- **`lighthouserc.js` + job `lighthouse` in CI** — sulla **build di produzione**, tre passate e mediana, referto **sul disco** e mai su `temporary-public-storage` (pubblicare è una decisione, non un default). **Misura e non giudica**: nessuna soglia finché non ne esiste una misurata, e il job resta `continue-on-error` — lo stesso percorso del job E2E alla nascita. **Nessuna dipendenza nuova**: `@lhci/cli` si esegue con `npx` a versione **pinnata**, perché installarlo costa **285 pacchetti** e cinque avvisi propri (`tmp` è high) — e il `Dockerfile` fa `npm ci --include=dev`, quindi finirebbero nell'immagine di produzione. Misurato e scartato: 597 → 881 pacchetti, 8 → 13 avvisi.
- **Passo `npm audit` in CI**, per ora informativo: diventerà bloccante quando lo zero avrà retto qualche settimana. Renderlo bloccante lo stesso giorno in cui lo si raggiunge significa scoprire da una CI rossa che è uscito un avviso nuovo, invece che da una lettura.
- **`--red-ink`**, l'inchiostro del chip rosso. `--color-error` **è** il rosso dello stemma (`DESIGN.md` §3): identità prima che colore, e resta intatto dove significa — crest, icone, bordi, tratti. Cambia solo dove diventa testo di 12px sopra il proprio `-soft`, che è l'unico punto in cui non raggiungeva AA (3,72:1 → 4,52:1). `lib/colors.ts` ha ora un terzo token, `ink`, e `Badge` usa quello.
- **La sottolineatura permanente dei link nella prosa** (`p`, `li`, `dd`), in `globals.css` a specificità zero: WCAG 1.4.1 — `hover:underline` non esiste per chi naviga da tocco o da tastiera.
- **`aria-label` sul menu del profilo**: conteneva solo l'`Avatar` (`aria-hidden` di proposito) e un chevron, quindi uno screen reader annunciava «pulsante» e basta. Violazione **critica**, presente su ogni pagina autenticata.
- `npm run a11y` e `npm run lighthouse` per lanciare i due cancelli da soli.
- **`AGENTS.md` §3, trappola 22**: uccidere `npm run dev` **non** uccide `next dev`. Il figlio resta in ascolto sulla 3000 e continua a ricostruire `.next` mentre `pretest:e2e` la cancella: **5 test su 25 caduti in specifiche scorrelate**, con l'aria della regressione appena introdotta. Il segno che smaschera il caso: sono **tutti timeout**, nessuno afferma un contenuto sbagliato.

### Modificato
- **`npm audit`: 12 → 0.** Tre passate: patch delle foglie di sviluppo col **solo lockfile** (12 → 8, `package.json` intatto — i 129 pacchetti che npm annunciava erano binari opzionali per altre piattaforme); **`next` 16.2.7 → 16.3.0** (8 → 5, e porta con sé `postcss` 8.5.23 e `sharp` 0.35.3); **`prisma` 7.8.0 → 7.9.1** con `@prisma/client` e l'adapter allineati (5 → **0**).
- **La tavolozza del tema CHIARO, per rispettare AA** — con i valori **più chiari** che superano 4,5:1, così la tinta resta e cambia solo la profondità: teal `#0E9F92` → **`#0A756B`** (i link erano 2,66:1, il pulsante primario 3,28:1) · `--muted-2` `#85888c` → **`#65686c`** (2,88:1: il grigio più usato, e il difetto più diffuso) · `--color-text-secondary` `#6B6E72` → **`#5A5D61`** · `--viola` → **`#675cb4`** e `--amber` → **`#965a19`** (2,43:1 e 2,48:1 sui propri chip) · `--color-success` → **`#187A4D`**. **Il rosso dello stemma non è stato toccato** (ha l'inchiostro), e **il tema scuro nemmeno**: lì il contrasto passava già.
- **`src/proxy.ts`: in sviluppo la CSP non ha più `'strict-dynamic'`** (decisione di Lorenzo). È ciò che sblocca Next 16.3: da quella versione il server di sviluppo mette nell'HTML un `<script>` **senza nonce** con dentro codice dell'applicazione, e `'strict-dynamic'` — che disattiva l'allowlist per host — lo fa rifiutare, lasciando **ogni pagina col corpo vuoto**. In produzione `'strict-dynamic'` è intatto. Misurato: non è una nostra configurazione sbagliata (`required-scripts.js` e il manifest client sono identici a 16.2.7), in produzione non accade, ed è identico su 16.3.1-canary.3.
- `DESIGN.md` §4 e §7, `SECURITY.md` §7, `ROADMAP.md`, `FEATURES.md`, `DOCUMENTATION.md` aggiornati insieme al lavoro — con la tabella prima/dopo di ogni token.

### Corretto — due difetti dello stesso ceppo, rivelati dal primo deploy verificato
Il codice assumeva **HTTPS in produzione**, il deploy su Coolify è in **HTTP**. Nessun cancello poteva vederli: `rotte` e `shots` girano contro lo sviluppo, dove `NODE_ENV` non è `production` e la CSP è quella di sviluppo. Da qui la regola nuova in `AGENTS.md` §8: **un deploy non è finito quando risponde 200** — va aperto in un browser vero, e da autenticati.
- **La demo si apriva col corpo vuoto.** `upgrade-insecure-requests` nella CSP promuoveva a `https://` ogni script, e l'HTTPS su quel nome dà 503 con certificato non valido: tutti fallivano con `ERR_CERT_AUTHORITY_INVALID`. **Difetto preesistente dalla Fase 0** (`bd2b812`): la demo rispondeva 200 e serviva l'HTML giusto, ma nessun browser è mai riuscito a montarla. Tolta per decisione di Lorenzo; torna col certificato, e `ROADMAP.md` ha la condizione verificabile.
- **Dopo il login, ogni navigazione tornava al login.** `secure: NODE_ENV === "production"` metteva `Secure` sul cookie di sessione, e un browser **non conserva un cookie `Secure` arrivato in chiaro**: l'accesso sembrava riuscire solo perché il redirect lo decide il server nella stessa risposta. Ora `Secure` si decide da **`x-forwarded-proto`**, col ripiego conservativo — si rinuncia solo se il proxy dichiara *positivamente* il chiaro — quindi **col certificato si riaccende da solo**. Verificato in produzione: cookie conservato, cinque rotte protette che restano dove devono.

### Corretto
- **`/opere/[id]` traboccava di 6px** a 360px in modalità semplice: il campo del commento è `flex-1` ma un `<input>` ha una larghezza intrinseca propria e in flex `min-width: auto` gli fa da pavimento, spingendo fuori il pulsante d'invio. Aggiunto `min-w-0` — è il corollario di `AGENTS.md` §3 (ondata 7, 5), e l'ha trovato il cancello delle schermate, non l'occhio.

### Quattro note d'attuazione, pagate scrivendo il cancello a11y
Hanno tutte la stessa forma: **numeri plausibili e sbagliati**, che è la categoria di difetti che qui costa di più.
- **axe si interroga a pagina POSATA.** L'ingresso dura ~2,2s e prima restituisce rapporti impossibili: la prima stesura dichiarava **1,07:1** nel tema scuro, cioè testo invisibile, su pagine che le schermate mostrano perfettamente leggibili.
- **E a pagina SCORSA.** Le rivelazioni allo scroll partono smorzate: senza scorrere, axe leggeva `#b5b5b5` su `#f9f8f7` (1,93:1) su una cifra che a schermo è nera. È `AGENTS.md` §3 (Fase A, 1) — ciò che dipende da IntersectionObserver non si giudica leggendo il DOM fermo.
- **L'attesa dev'essere fissa.** Sondare l'opacità di ogni nodo sotto `<main>` costa più dell'analisi di axe (timeout a 90s su `/bilancio`), e `waitForLoadState("networkidle")` non finisce mai perché la connessione HMR tiene la rete occupata.
- **Anche il tetto di tempo va alzato**: axe su `/bilancio` supera da solo i 30s di default, e il caso falliva con un rosso che non parlava di accessibilità.

### Da fare, scritto perché non si perda
- **Rimettere `'strict-dynamic'` in sviluppo** quando Next rimetterà il nonce su quel tag. Condizione verificabile: `curl -s localhost:3000/metodologia | grep '<script' | grep -vc nonce=` deve dare **0**. Oggi dà 1 su 16.3.0 e su 16.3.1-canary.3.
- **Fissare le soglie di Lighthouse** dopo le prime passate in CI, e togliere `continue-on-error` dal job.
- **Rendere bloccante `npm audit`** in CI (`--audit-level=high`, senza `|| true`) quando lo zero avrà retto.
- **`/admin/*` e `/redazione` restano fuori** sia da `shots` sia dal cancello a11y: sono le superfici staff dell'ondata 8, e il debito visivo lì cresce a ogni giro.

## [0.25.0] — 2026-08-05 · Fase C, «La pagella della giunta» — la scoperta, la metodologia v1.1 e la forma A

> La scoperta prima del codice, come per le valutazioni: **le sei materie non
> sono ugualmente misurabili, e il voto onesto esiste solo dove qualcuno ha
> fissato il traguardo** — per una giunta, la legge. La forma è la
> composizione di Lorenzo su facsimili in contesto e due giri di domande
> (**M1** sei materie a due regimi · **V1** voto 1–10 ricontabile · **C1**
> trimestrale · **R1** stelle accostate mai sommate · scala **1 + 9 ×
> quota** · ampiezza piena), registrata in
> [`docs/piano-pagella.md`](docs/piano-pagella.md). Il cancello: **le regole
> della pagella sono pubblicate PRIMA che il primo voto sia calcolato**, e il
> primo voto nascerà già timbrato.

### La scoperta che ha deciso la forma
- L'inventario delle fonti, materia per materia: **Trasparenza** e **Spesa** hanno traguardi fissati per legge (art. 14 e 33 del D.Lgs 33/2013, termini TUEL, D.Lgs 231/2002) → voto ricontabile; **Promesse** ha una fonte reale (le linee programmatiche, TUEL art. 46) ma nessun traguardo → **a fatti**; **Sicurezza · Decoro · Ascolto** oggi non hanno una fonte reale che regga un giudizio → dichiarano che cosa le accenderebbe. È la scala a tacche di `/promesse` letta al contrario: dove il traguardo lo fissa la legge, il 1–10 torna a essere un conteggio.
- **Regole derivate, dichiarate nel giro**: nessun voto d'insieme della giunta (l'argomento del «Pistoia Index»); nessun seed (un'edizione inventata su una giunta vera non è dimostrativa); prima edizione **dopo il 27/08/2026** (termine art. 14 — il Lavoro C diventa la prima riga di Trasparenza); la replica in demo dichiara «non ancora richiesta» (chiederla davvero è un'azione esterna, decisione a parte); un voto si pubblica **solo intero** (una riga senza fonte spegne il voto dell'intera materia).

### Aggiunto
- **`lib/pagella.ts`** — modulo neutro: le sei materie coi regimi, i **10 controlli** ancorati alle norme (7 Trasparenza, 3 Spesa), `votoPagella()` = 1 + 9 × quota (estremi provati: 0 superati = 1, tutti = 10), `esitiPubblicabili()` che scarta le righe senza URL (il modello è `Riga` di `lib/costo-amministrazione.ts` — una definizione sola), `votoMateria()` che restituisce `null` se anche un solo controllo manca, `EDIZIONI = []` col test-guardiano del seed, `SCADENZA_ART14`.
- **Il capitolo 2 della metodologia** (`lib/metodologia.ts`, **v1.0 → v1.1**): otto regole (13–20) — chi si giudica · il voto si riconta · ogni punto è una riga con fonte · dove il voto non c'è · nessun voto d'insieme · la cadenza e il timbro · la replica in ogni stato · le stelle accostate — con l'«In breve» proprio, i numeri interpolati da `lib/pagella.ts` e la voce nel **registro append-only** (la v1.0 resta scritta, e un test lo prova).
- **`/pagella` in forma A, senza edizione**: sei materie nei due regimi (le card a voto elencano i controlli che si conteranno, con la norma; le altre spiegano — mai un trattino muto), card «Prima edizione» col termine dell'art. 14, **diritto di replica in stato anteprima** («nessuna replica è stata richiesta»), riquadro **«La voce dei cittadini»** (medie e campioni veri da `getPanoramica`, badge «voti dimostrativi», mai dentro un voto), colophon `TimbroMetodologia`. Ancore `#metodologia` e `#fonti` conservate per `ChiPubblica`. Il titolo perde «mensile».
- **`tests/unit/pagella.test.ts`** — 16 test: formula, voto solo intero, guardiano del seed, integrità del catalogo (ogni controllo cita D.Lgs/TUEL), date.

### Modificato
- **`/metodologia` a due capitoli** («Capitolo 1 · Le valutazioni dei servizi», «Capitolo 2 · La pagella della giunta»), titolo **«La metodologia dell'osservatorio»**, numerazione continua 1–20, registro in coda con i rimandi a valutazioni E pagella. Le regole passano da `h2` a `h3` sotto i capitoli.
- `tests/unit/metodologia.test.ts` cambia **insieme alla versione** (il patto del cancello): v1.1, registro append-only provato, +7 test del capitolo 2 (224 → **247** unitari).
- Due asserzioni E2E aggiornate con la modifica che le riguarda: il titolo di `/metodologia`, e il **timbro reso version-agnostic** (`metodologia v\d+\.\d+` — quale versione sia lo pinza l'unit test, così un bump non rompe un E2E che non lo prova).

## [0.24.0] — 2026-08-05 · Fase C, «Valutazioni dei servizi» — R-6, la metodologia. E il seme dimostrativo

> La fase in cui le regole editoriali diventano un documento pubblico — e il
> cancello è che **cambiare una regola in un posto solo cambia pagina E
> documento**: i testi di `/metodologia` interpolano le costanti di dominio,
> mai un numero ricopiato, e `tests/unit/metodologia.test.ts` lo prova
> costante per costante. La forma è la composizione di Lorenzo su mockup in
> contesto e due giri di domande (A1+A3+A4 · C1 pubblica · **nessuna soglia**
> · B2 colophon), più i numeri del seme approvati sullo stesso tabellone.
> Cancello pieno: typecheck · lint · **224** unit · **25/25** E2E · `rotte`
> **56, 0 con problemi** (tre passate) · shots nei due temi e `--simple
> --width=360`.

### La decisione che scioglie la soglia
- **«Nessuna soglia»** (Lorenzo, 2026-08-05, davanti alle altre regole come il piano prometteva): la media compare **dal primo voto**, sempre col campione accanto — una soglia tace il dato proprio dove i votanti sono pochi, cioè in una città media quasi ovunque e quasi sempre. Vale **ovunque la soglia mordeva**: media, punto mensile dell'andamento, quartiere di domani. `SOGLIA_PUBBLICAZIONE_VOTO` e `SOGLIA_PROVVISORIA` non esistono più; `media()` perde il ramo e `Media` il campo `mancanti`; `quartiereSbloccato()` si accende col primo voto. Il **campione minimo della mediana** (5, `citystats`) resta — la colonna dura si presenta come il lato solido della pagina — e un test-guardiano nuovo protegge la coesistenza dall'«unificazione per simmetria» nella direzione opposta a prima.

### Aggiunto
- **`lib/metodologia.ts`** — il documento versionato nel repository (ROADMAP §6, prerequisito 3): **dodici regole** (la regola · il perché · la verifica · la riga «Nel codice» che nomina la definizione unica), sommario «In breve», `VERSIONE_METODOLOGIA` = **1.0**, `REGISTRO_MODIFICHE` append-only che apre registrando lo scioglimento della soglia. Ogni numero nei testi è interpolato dalle costanti (90 · 30 · 180 · 5 · 1–5 · 11 caselle).
- **`/metodologia`** — la resa, **pubblica** (gruppo `(pubblico)`, coerente con W1: le schede pubbliche citano quelle regole). In `rotte.mjs` anche nella passata anonima con atterraggio preteso (54 → **56**), in `shots.mjs` nei due regimi.
- **Il timbro B2** (`TimbroMetodologia`) — «metodologia v1.0» da **colophon**: in calce a scheda, panoramica e digest, con la firma della Redazione, mai in testata (che resta al dato e al suo campione). Nel digest sopravvive alla stampa: un report senza versione non è verificabile.
- **«Come funziona»** sull'invito anonimo della scheda → `/metodologia` (l'approdo rimandato da R-5 perché non esisteva).
- **Il mese dimostrativo nel seed** (decisione §8.7, numeri dal giro di forma): **72 voti** a distribuzioni fisse — mai `vary()`, medie identiche a ogni risemina — su persone inventate rese «Nome C.» o «Anonimo». Senza soglia la storia è la **gradazione dei campioni**: Pulizia 34 (3,3; andamento 3,2 → 3,4 → 3,3), Verde 8 (3,9), Sicurezza 6 (2,8), Illuminazione 5 (2,8), Anagrafe 12 (4,1), Tributi 4 (2,5), Prenotazioni 3 (4,3); **Trasporti e tre sportelli a zero** — l'assenza non si decora, e le E2E la provano su `/valutazioni/trasporti`. Giulia e Lorenzo votano ≥30 giorni fa (**campagna e pop-up armati oggi** sui loro account), Marco 2 giorni fa (finestra chiusa: lo scaglionamento dal vivo). Tre righe `Sollecitazione` (campagne seguite), **nessun promemoria** (nasce solo su richiesta), due codici QR nuovi per la pulizia (parco e biblioteca), e il **quadro del Comune** su Pulizia · luglio — account generico, testo di servizio senza fatti inventati.

### Modificato
- **Le superfici senza soglia**: sulla scheda l'attesa esiste solo a zero voti («la media compare col primo voto») e la tabella accessibile dice «nessun voto quel mese»; sulla panoramica spariscono «N su 20» e il paragrafo della soglia (ora racconta il patto del campione dichiarato); nel digest muore il ramo «nessuna casella è sopra la soglia» (se le entrate son tutte sugli sportelli, lo dice) e la coda diventa «le altre condizioni non hanno ancora voti».
- Le due E2E dell'assenza si ripuntano su `/valutazioni/trasporti`; la scheda pubblica di Pulizia ora prova la **media vera** (3,3, distribuzione fissa) e il timbro; +2 E2E nuove (23 → **25**).

## [0.23.0] — 2026-08-04 · Fase C, «Valutazioni dei servizi» — R-5, i sei ingressi e la lettura pubblica

> La fase in cui la piattaforma inizia a CHIEDERE i voti — e il cancello è il
> **contatore unico delle sollecitazioni**: sei ingressi, ma una persona è
> sollecitata al massimo una volta ogni 30 giorni, contata al centro
> (`RICHIESTA_SILENZIO_GIORNI`, provato a date fisse come
> `statoPubblicazione()`). La forma è la composizione di Lorenzo su mockup in
> contesto e due giri di domande: A1 · B su tutti i canali (col pop-up che
> veste il rinnovo) · C1 · D1 · schema S2 · login-wall W1. Dettaglio in
> `docs/piano-rating-servizi.md` §7 e §8 (decisione 8).

### Aggiunto
- **Il contatore unico** — modello `Sollecitazione` (append-only come `ModerationAction`: userId, canale, mostrataIl, esito) + modulo neutro **`lib/sollecitazioni.ts`** (`puoSollecitare`, `puoMostrarePopup`, `condizionePerCategoria`, `inPubblicoCampagna`, `promemoriaDovuto`) + 18 unit a date fisse. Regole decise: contano invito post-risoluzione, campagna e pop-up; menu, QR e blocco del digest no; **un voto chiude la finestra**; la X del pop-up tace **180 giorni** (`SILENZIO_POPUP_CHIUSO_GIORNI`).
- **Ingresso A (segnalazione risolta)** — il ringraziamento di «è davvero risolta?» porta l'invito contestuale (categoria → condizione, 7 su 12), effimero, solo alla conferma; la riga si scrive dentro l'azione, mai in un GET.
- **Ingresso B (campagna mensile)** — card in home nello slot dei richiami (si spegne con voto, X o fine mese) + notifica al primo accesso del mese (stessa sollecitazione: una riga) + **email opt-in** «Ricordamelo il mese prossimo» (`PromemoriaRinnovo`, invio opportunistico in `lib/promemoria.ts`, disiscrizione via form su **`/v/promemoria/[token]`**).
- **Ingresso C (report del mese)** — card «Valutazioni dei servizi» nel `/digest`: prima il dato (a zero voti le mediane della colonna dura, dalla STESSA fonte delle schede), poi l'invito, che in stampa sparisce.
- **Ingresso D (pop-up laterale)** — armato SOLO dai voti espressi (sondaggi, priorità, question time via `lib/completamenti.ts`); mai a tempo, mai all'arrivo, chiudibile, niente trappola del focus; a decidere è `chiediPopupAction` sul server; veste il rinnovo quando la persona è nel pubblico della campagna.
- **La lettura pubblica (decisione W1)** — `/valutazioni` e le schede escono dai `PROTECTED_PREFIXES` (via esplicito) e vivono nel gruppo **`(pubblico)`**: con sessione l'`AppShell` intero (estratto dal layout di `(app)`: una definizione, due porte), senza sessione **barra anonima** (componente separato, stemma + «Accedi») e **modulo degradato a invito** con `?next` sull'ancora. `rotte.mjs` guadagna la **terza passata, anonima** (54 rotte), `shots.mjs` fotografa le due pagine in entrambi i regimi, e 3 E2E nuovi provano lettura, degrado e che il resto del muro non si è mosso.
- Righe nuove su `/privacy` (promemoria e registro degli inviti) e in `SECURITY.md` §4/§6.

## [0.22.0] — 2026-08-03 · Fase C, «Valutazioni dei servizi» — R-4, risposte e moderazione

> La fase in cui il Comune risponde e la Redazione modera — e il cancello è il
> test che prova che **un account del Comune non può rimuovere**: nel modello
> dei ruoli `ADMIN` è il super-account del COMUNE (SECURITY §4), quindi la
> porta respinge anche lui. La forma è la composizione di Lorenzo su sei
> decisioni separabili mostrate in contesto (A1+A2 · B1 · C3 · D1 · E2 · F
> riservata): dettaglio in `docs/piano-rating-servizi.md` §7. Cancello pieno:
> typecheck · lint · **195** unit · **20/20** E2E · `rotte` **51/51** ·
> shots nei due temi e in modalità semplice a 360px.

### Aggiunto
- **`/redazione`** — la porta della Redazione (gate `requireRedazione`, ruolo `MODERATOR`): la coda delle segnalazioni del Comune (col motivo), la rimozione **con motivo pubblico** che finisce nel registro della scheda, il «lascia pubblicata», e il modulo della **Nota della Redazione** con fonte e data di consultazione obbligatorie. Tutto firma «Redazione della Dashboard di Pistoia», mai un nome proprio.
- **Il Comune risponde dalla scheda** (controlli inline solo per staff/admin): al **quadro** del mese (una risposta per servizio+periodo, la seconda non sovrascrive in silenzio) e alla **singola**, che compare **annidata** sotto la recensione. La firma è il nome pubblico dell'account; se l'email è di un componente della giunta, la risposta porta il **timbro della carica** — «Assessora a … nel 2026» — scattato alla scrittura (`timbroCarica`, `lib/redazione.ts`) e mai ricalcolato.
- **«Valutazioni dei servizi» in Area Comune**: le ultime recensioni con parole, con Rispondi/Segnala in loco — e la dichiarazione esplicita che rimuovere non si può da lì.
- **La segnalazione del Comune** (`segnalataIl` + `segnalataMotivo`, migrazione dedicata): contesta, non cancella, e **non ha segni pubblici** finché la Redazione non decide (decisione di Lorenzo) — la vede solo la Redazione. Ogni atto (segnala, rimuovi, lascia, risposta, nota) è registrato in `ModerationAction`, append-only.
- **`lib/redazione.ts`** — modulo neutro: `FIRMA_REDAZIONE` (ora importata anche da `ChiPubblica`: una definizione sola), `isRedazione`/`puoRimuovere` (il predicato del cancello), `timbroCarica`, `notaPubblicabile` (la nota senza fonte è rifiutata tre volte: azione, scrittura, resa), `etichettaPeriodo`. **`requireRedazione`** vive in `src/lib/auth/redazione.ts`, file NUOVO che compone la DAL senza toccarla.
- **Il registro delle rimozioni diventa un elenco documentale** (forma E2): eyebrow col pallino viola, una riga per rimozione (data — motivo), presente anche vuoto, firma collettiva in calce.
- **14 unit nuovi** (195) e **3 E2E nuovi** (20/20): il cancello alla porta (`/redazione` respinge l'ADMIN e accoglie il moderatore), il flusso segnala→coda→rimozione→registro, le risposte quadro+singola firmate «Comune di Pistoia».
- **`rotte.mjs` impara la seconda passata da moderatore** (51 rotte): `/redazione` aperta da admin risponderebbe 200 sulla home dopo il redirect — un cancello che certifica una pagina mai vista — quindi la passata dedicata pretende anche l'**atterraggio** sull'indirizzo chiesto. In `shots.mjs` la rotta è esclusa e dichiarata, come /admin.

### Cambiato
- **`comune@pistoia.it` si chiama «Comune di Pistoia» anche internamente** (era «Redazione Comune»): la parola «Redazione» appartiene solo all'entità che firma la moderazione, e il renderer delle risposte ora legge il nome **pubblico** dell'account.
- `/redazione` entra nei `PROTECTED_PREFIXES` di `src/proxy.ts` (ok esplicito di Lorenzo sul file protetto).

## [0.21.1] — 2026-08-03 · Fase C — il seed che dimostra, e la forma di R-4 sul tavolo

> Nessun codice di prodotto: cambia il **seed** (decisione di Lorenzo, chiusura
> R-3) e la **forma** di R-4 viene proposta in sei decisioni separabili,
> mostrate sulla scheda vera. Cancello pieno rieseguito: typecheck · lint ·
> **181** unit · **17/17** E2E (il flake noto di `trasparenza.spec` è caduto
> una volta ed è ripassato in suite piena, come documentato) · `rotte` 50/50 ·
> shots nei due temi e in modalità semplice a 360px, zero traboccamenti.

### Cambiato
- **Il seed dimostra la colonna dura**: 32 segnalazioni dimostrative (24 chiuse, 8 aperte) sulle categorie delle cinque condizioni, persone inventate e luoghi veri. Ogni condizione guadagna la propria mediana — pulizia **5** · illuminazione **8** · verde **12** · trasporti **25** · sicurezza **9** giorni — perché con 1–2 casi per categoria ogni scheda diceva per sempre «troppo poche risultano chiuse» e la funzione non si vedeva mai al lavoro (`CAMPIONE_MINIMO_PER_GIUDIZIO` = 5, contato sulle chiuse).
- **Il tasso di risoluzione in home passa da 33% a 66%** (27 risolte su 41) e la mesh dello «Stato della città» da «In affanno» ad **«A rilento»**. Metà scala è una scelta, non un caso: un seed tutto verde racconterebbe una città senza attriti.
- **Su `sicurezza` la resa regge il nuovo dato**: il riquadro ora ha una mediana (9 giorni) e la frase parla solo dei tempi di chiusura — il volume resta non accostabile alle stelle (piano §3.2).
- **Nessuna valutazione nel seed, sempre**: le schede continuano ad aprire su «Nessun voto, ancora», che è lo stato vero del giorno uno.

### In attesa (R-4)
- Le **proposte di forma** della moderazione — dove scrive il Comune, dove vive la coda della Redazione, la risposta firmata col timbro della carica, la Nota della Redazione, il registro firmato «Redazione della Dashboard di Pistoia», la visibilità della segnalazione — sono state mostrate **in contesto**, in sei decisioni separabili (A–F). Il codice di R-4 parte dalla composizione di Lorenzo; dettaglio in `docs/piano-rating-servizi.md` §7.

## [0.21.0] — 2026-08-03 · Fase C, «Valutazioni dei servizi» — R-3, il voto

> La fase che rende la funzione viva: si vota dalle schede e dai QR, la mail
> di conferma porta il «non sono stato io, rimuovi», e il cancello è l'E2E che
> **vota, riceve la mail e revoca**. Cancello pieno: typecheck · lint · **181**
> unit · **17/17** E2E · `rotte` 50/50 · shots nei due temi e in modalità
> semplice a 360px senza traboccamenti.

### Le tre scelte sulle email (di Lorenzo, non del piano)
- **Zero dipendenze**: niente SDK, niente SMTP. In produzione il trasporto sarà `fetch` verso l'API HTTP di un provider — configurazione, non codice.
- **Il provider si sceglie con il dominio.** Senza SPF/DKIM nessuno consegna davvero, quindi scegliere oggi vincolerebbe senza abilitare. Preferenza dichiarata: residenza EU, e il provider andrà su `/privacy` come responsabile del trattamento.
- **In locale ogni messaggio è un file** in `.email/` (`src/lib/email.ts`): l'E2E lo legge per «ricevere» la conferma, la demo lo mostra aprendolo, e in produzione l'invio **si rifiuta** finché il trasporto vero non esiste. La guardia sta *prima* della scrittura del voto: meglio nessun voto che un voto senza la mail che lo rende revocabile.

### Aggiunto
- **L'azione del voto** (`app/actions/valutazioni.ts`) — l'unica write action aperta a chi non ha un account: `getCurrentUser()` attribuisce quando può, il rate limit è per IP **ed** email (dichiaratamente best-effort), le parole vietate passano dal filtro della community, e la regola mensile delle condizioni riusa `puoVotare()` dal modulo di dominio.
- **Il modulo a stelle** (`components/valutazioni/modulo-voto.tsx`) — l'unico componente client della funzione: radio nativi (tastiera e invio senza JS gratis), stato React solo per la resa, ogni prop serializzabile (la trappola di `AGENTS.md` §3, ondata 7.1, evitata alla radice).
- **`/v/[codice]`** — la pagina del QR: una schermata, stelle + email, niente navigazione. Il codice porta servizio e luogo (`CodiceQr` nel seed: tre codici deterministici). **`/v/conferma/[token]`** — l'atterraggio della mail: mostra la valutazione così com'è e offre i due esiti come **azioni di form, mai effetti del GET** — i filtri antispam aprono i link, e un link che al passaggio rimuovesse cancellerebbe voti legittimi in silenzio.
- **La revoca cancella davvero**: riga, email e token spariscono. Non è la rimozione redazionale (che azzera il testo e lascia la riga nel registro pubblico): qui è il titolare dell'indirizzo che disconosce il voto, e conservargli dati sarebbe il contrario di ciò che ha appena chiesto.
- **Il generatore dei fogli QR** (`/admin/codici-qr`) — ogni scheda è il foglio da appendere: QR (**`uqr`**, l'unica dipendenza nuova di R-3, scelta esplicita: pacchetto minimo senza sotto-dipendenze), luogo, indirizzo breve, print stylesheet. I codici disattivati non si stampano.
- **Conservazione applicata, non solo dichiarata**: `limiteConservazioneIp()` (provata a date fisse) azzera gli IP più vecchi di 180 giorni **a ogni voto** — una demo locale non ha un cron, e una regola scritta su `/privacy` ma mai eseguita sarebbe peggio di nessuna regola. `/privacy` ora dichiara email, IP, telefono-mai e l'invio simulato in demo.
- **6 unit nuovi** (181) e **3 E2E nuovi** (17/17): vota-riceve-revoca, conferma-e-composizione, regola mensile. `global-setup` svuota la cassetta `.email/` come già ricrea il DB: le azioni si accumulano anche quando i dati no.
- Le tre rotte nuove entrano in `rotte.mjs` (47 → **50**) e in `shots.mjs` **nello stesso momento**.

### Imparato
- **`src/proxy.ts` protegge `/valutazioni` col cookie di sessione**, quindi l'atterraggio della mail non poteva viverci: chi clicca dalla posta non ha una sessione e finiva al login — visto accadere negli E2E, non previsto a tavolino. Da qui `/v/` come prefisso pubblico di tutto ciò che arriva da fuori (QR e mail), senza toccare il file dell'autenticazione.

## [0.20.0] — 2026-08-03 · Fase C, «Valutazioni dei servizi» — fondamenta e lettura

> La quinta e ultima funzione dell'osservatorio civico, sbloccata da una
> scoperta e non da un dato. Fasi **R-1** (fondamenta) e **R-2** (le due pagine
> di lettura) chiuse; R-3…R-6 pianificate. Piano completo, con le dodici
> decisioni che lo governano, in
> [`docs/piano-rating-servizi.md`](docs/piano-rating-servizi.md).

### La scoperta

La domanda che ha sbloccato la funzione non era sui dati ma sul vuoto: **cosa
mostra la pagina finché i voti non esistono?** La risposta — *il dato duro dal
primo giorno* — vale oltre questa funzione, ed è la forma generale del difetto
che aveva già tolto la cifra da `/organigramma` e la scala a tacche da
`/promesse`: **un'assenza non si decora e non si riempie; le si mette accanto
ciò che si sa già.**

### Aggiunto
- **`/valutazioni`** — la panoramica, con **due tabelloni che non si fondono mai in una classifica sola**: uno è una media di *episodi* (una pratica, una data, un ufficio), l'altro un *umore* su uno stato continuo. Metterli in graduatoria insieme affermerebbe che sono confrontabili.
- **`/valutazioni/[servizio]`** — la scheda: media (solo sopra soglia), composizione del campione accanto al numero, andamento con **un punto al mese**, colonna dura, recensioni, risposte del Comune, e il **registro pubblico delle rimozioni**.
- **`src/lib/valutazioni.ts`** — catalogo delle undici caselle e regole di dominio, modulo **neutro** (lo importano pagine, seed e test). **`src/lib/data/valutazioni.ts`** per le query.
- **Modelli `Servizio`, `Valutazione`, `RispostaServizio`.** `Servizio` è un'ancora d'identità, non un catalogo: i fatti stanno nel modulo, com'è per `Assessore`/`lib/giunta.ts`.
- 26 test unitari (**175** in totale) e **3 E2E** (**14/14**) che girano sullo stato del giorno uno, che è l'unico che la pagina vedrà davvero all'apertura.
- Le due rotte entrano in `rotte.mjs` (45 → **47**) e in `shots.mjs` **nello stesso momento**.

### Rimosso
- **`ServiceReview` e le sue quattro medie inventate** — «Anagrafe 4,6 su 1.280 recensioni», «Tributi online 4,8 su 940» — più il blocco che le rendeva su `/comunita`. Un voto inventato su un servizio pubblico non è un dato dimostrativo come una buca in via Roma: è un giudizio attribuito ai cittadini su un ufficio vero. E contamina all'indietro — chi scopre che il 4,6 era finto non crede più nemmeno al 3,1 vero che arriva dopo (`AGENTS.md` §2). **Il seed non contiene nessuna valutazione**, e da qui il vincolo che le pagine devono reggere a zero.

### Corretto
- **La colonna dura presentava una mediana su due casi.** Visto dal vivo: la pagina scriveva «2 segnalazioni quest'anno, chiuse in 7 giorni» come se fosse il dato solido su cui la scheda si appoggia — mentre il seed ha **dieci** segnalazioni in tutto. Sette giorni mediani su due casi non è una misura, è la stessa accusa su campione minuscolo che `CAMPIONE_MINIMO_PER_GIUDIZIO` esiste per fermare, e faceva più danno del solito perché colpiva proprio la metà della pagina che deve essere quella affidabile. Da qui la regola: **il conteggio è un fatto e si mostra sempre, la mediana è una sintesi e vuole il campione minimo** — e quando manca la pagina lo *dice*, altrimenti il lettore attribuisce l'assenza a un Comune che non chiude niente.
- **Una frase si rompeva su `sicurezza`.** Dove il volume non si accosta alle stelle e la mediana non c'è, il template produceva «Intanto dalle segnalazioni: chiuse». Nessun errore, solo una pagina che diceva una parola sola: ora la frase si compone a pezzi e il riquadro non si apre se non ha niente da dire.
- **`su ${nome.toLowerCase()}` produceva «2 segnalazioni su pulizia».** In italiano la preposizione dipende da genere, numero e iniziale: cinque stringhe dichiarate (`Servizio.materia`) costano meno di una regola che sbaglia.
- **Le stelle si riempiono con l'accento, non con l'ambra.** In `DESIGN.md` §4 `--amber` significa «attenzione e attesa»: una fila di stelle ambra usa il colore dell'allarme per dire che va bene. E la fila di stelle gialle è l'elemento più riconoscibilmente da template dell'intero web, cioè il caso in cui §1 dice di ridisegnare.

### Deciso in scoperta
- **Due famiglie, una sola interfaccia, mai una classifica sola.** Sportelli **a episodio**, condizioni **ogni mese**.
- **Chiunque vota** (modello Trustpilot): nessun filtro, e la **composizione del campione dichiarata su ogni scheda** — portante, mai sotto una piega.
- **Nessun account richiesto, email sempre obbligatoria**, e il voto entra **subito**: la conferma serve a revocare e a bloccare gli abusi a posteriori.
- **«Marco B.» per tutti di default**, account verificati compresi: il nome intero è un atto deliberato, non una conseguenza dell'essersi registrati.
- **Modera la Redazione, il Comune può solo segnalare**, con **registro pubblico** delle rimozioni. Chi è giudicato non controlla il proprio voto.
- **L'attribuzione di una risposta segue l'account** che la scrive; la media e l'andamento **non stanno mai dentro un blocco attribuito a una persona**, o la media del servizio diventa la pagella di chi risponde.
- **Soglia di pubblicazione 20**, e **non** è `CAMPIONE_MINIMO_PER_GIUDIZIO` (5): quella è la soglia di un *tasso* su casi che arrivano da soli. Chi recensisce si autoseleziona verso gli estremi — cinque recensioni non sono un campione rumoroso, sono un campione **storto**.
- **Il nome cambia**: «Rating dei servizi — Pistoia Index» prometteva un indice unico che il disegno rifiuta, e un nome che promette un indice costringe prima o poi qualcuno a calcolarlo.

## [0.19.0] — 2026-08-03 · Fase C, `/organigramma` smette di contraddire `/trasparenza`

> Due risposte diverse alla stessa domanda dentro la stessa applicazione:
> `/organigramma` dava Marco Ferrari sindaco, `/trasparenza/costo-amministrazione`
> dava Giovanni Capecchi. Il difetto era nato dall'aver dato dati veri a una
> sola delle due pagine.

### Aggiunto
- **`src/lib/giunta.ts`**: le nove persone reali della giunta, ognuna con la propria `Riga` di fonte. Modulo **neutro** (né `"use client"` né `server-only`): lo importano la pagina, il seed e i test. Importa `Riga` e `rigaPubblicabile` da `lib/costo-amministrazione.ts` invece di ridefinirli — due definizioni della stessa regola sono peggio di nessuna regola.
- **[`docs/fonti-organigramma.md`](docs/fonti-organigramma.md)**: nome per nome, delega per delega, recapito per recapito, con URL e data di consultazione.
- **L'indice delle 57 deleghe vere**, in ordine alfabetico, ognuna col nome di chi la tiene. Era l'apertura della pagina già dalla Fase B, ma con **una** etichetta per persona: chi cercava «Toponomastica» doveva aprire otto schede.
- **`components/osservatorio/fonte.tsx`**: `LinkFonte`, `SchedaFonte` e `DataConsultazione` estratti dalla pagina del costo, ora che le pagine che citano un atto sono due. Due copie della stessa citazione divergono in silenzio.
- 18 test su `tests/unit/giunta.test.ts` (**133 in totale**). Uno confronta le persone di `giunta.ts` con quelle di `costo-amministrazione.ts`: se una giunta cambia e si aggiorna un solo modulo, torna rosso.

### Corretto
- **`/organigramma` mostrava una giunta inventata.** Ora legge le nove persone reali, con la scheda del Comune che le dichiara e la data in cui è stata aggiornata.
- **Le deleghe sono riprese dalla fonte, non copiate.** `/trasparenza/costo-amministrazione` le aveva **omesse** perché la ricognizione ne dava «due versioni» per Stefania Nesi. Non erano due versioni: erano il **titolo** della scheda e l'**elenco enumerato** sotto — il sommario e il portafoglio. Le due voci che facevano sembrare il conflitto sono «Rapporti con il Consiglio Comunale», che nel titolo non c'è, e «Attività produttive», che nel titolo è abbreviata.

### Rimosso
- **`votesElected` sparisce dal modello `Assessore`**, e non viene riempito con numeri veri. Per **cinque persone su nove** quel numero non esiste in nessuna fonte: un candidato sindaco non riceve preferenze (è votato sulla scheda del sindaco, e «Giovanni Capecchi» non compare fra i 357 candidati), e quattro assessori su otto non erano candidati in nessuna delle dodici liste. Per i quattro che una preferenza ce l'hanno, il numero descrive **un seggio che hanno lasciato**: il TUEL art. 64 li fa decadere da consiglieri all'atto della nomina. E anche il numero del sindaco è ambiguo quattro volte — 22.512 / 21.478 / 21.572 dal portale che si dichiara «DATI NON UFFICIALI», 21.709 dalla stampa. Al suo posto: **come** ciascuno è arrivato alla carica, che è vero per tutti e nove.
- **`Assessore` smette di essere una scheda anagrafica** e resta l'ancora dei «Segui»: `id` (lo slug del modulo, non più un `cuid()`, così un «Segui» sopravvive a un riseed) e le due relazioni. I fatti sulle persone non stanno più nello stesso file delle segnalazioni inventate.
- **`/sondaggi` perde la scheda «Assessore di riferimento»** e il seed non collega più `Poll` a `Assessore`. Diceva «Eletta con N preferenze» e reggeva finché la persona era inventata; sulla giunta vera diventava una consultazione che quella persona non ha mai aperto.

### Modificato
- **Il «Segui» resta ma esce di vetrina** (decisione di Lorenzo). Bottone e conteggio dove sono; la descrizione della pagina non promette più «quante persone segue ciascun assessore».
- **`FEATURES.md` §5 riscritto sull'organigramma.** Dei tre motivi per cui la pagina non porta una cifra display ne restano zero come erano scritti — le preferenze non esistono più, i contattabili sono 9 su 9 e non 1 su 7 — ma **la conclusione regge**: «9 su 9» e «8 assessori» sono due modi di contare le schede che il lettore ha già davanti. Tautologico.

### Note di ricognizione
- **I risultati elettorali sono pubblici anche quando la pagina sembra vuota.** Eleweb ed Eligendo sono applicazioni JavaScript: `curl` prende il guscio. `js/locator.js` costruisce gli URL di `static_json/…` e `folder.js` dice quale cartella leggere — da lì escono 12 liste e 357 candidati con le preferenze una per una. È il corollario per le SPA della regola «quando un PDF resiste, cerca la versione HTML».
- **Uno schema che regge otto casi su nove è una trappola.** Gli otto assessori sono `iniziale.cognome@comune.pistoia.it`; il sindaco è `sindaco@comune.pistoia.it`. Dedurre dal modello avrebbe sbagliato la persona più in vista della pagina.
- **Due schede sono più fresche della notizia di presentazione**: Nesi aggiornata il 28 luglio, Giusti il 21 luglio, contro il 10 giugno della notizia. Ogni riga cita la scheda, non la notizia.
- Le quattro trappole sono in `AGENTS.md` §4.

## [0.18.0] — 2026-07-31 · Fase C, «Il costo dell'amministrazione» sui dati reali

> La prima pagina della piattaforma costruita interamente su fonti primarie.
> Ogni cifra è una riga con il proprio atto, e il renderer **rifiuta** quelle
> senza fonte.

### Aggiunto
- **`/trasparenza/costo-amministrazione`**: quanto la legge prevede per sindaco, giunta e presidente del consiglio di Pistoia. Cifra display sul **costo annuo della giunta (689.724 €)** — una somma di righe vere, non tautologica e non un'accusa. Sta sotto lo stemma **senza** `ChiPubblica`: non dà un voto a nessuno, rende leggibile ciò che il D.Lgs 33/2013 impone di pubblicare.
- **`lib/costo-amministrazione.ts`**: la catena di calcolo e le sue fonti, in un modulo **neutro** (né `"use client"` né `server-only`). `rigaPubblicabile()` scarta le righe senza URL http(s) e senza data — e `costoMensileGiunta()` applica lo **stesso filtro**, perché una voce esclusa dall'elenco ma lasciata nella somma sopravvivrebbe dentro la cifra display, dove nessuno la vede e nessuno la può contestare.
- **[`docs/fonti-costo-amministrazione.md`](docs/fonti-costo-amministrazione.md)**: le fonti con citazione alla lettera, URL e data di consultazione. Tutte scaricate e lette, nessuna di seconda mano.
- 19 test su `tests/unit/costo-amministrazione.test.ts` (115 in totale). Uno serve a sé stesso: `INDENNITA_VICESINDACO` non deve tornare 5.313.
- La rotta entra in `rotte.mjs` (44 → **45 rotte**) e in `shots.mjs` **nello stesso momento**.

### Corretto
- **Il vicesindaco è al 75%, non al 55%** (`ROADMAP.md` §6). L'art. 4 del D.M. 119/2000 era l'articolo giusto ma il comma sbagliato: il c. 4 copre la fascia *10.001–50.000*, e la fascia «50.001–100.000» **in quell'articolo non esiste** — sta nell'art. 3, che è la promozione di classe dei capoluoghi e riguarda il *sindaco*. Da lì la fascia era migrata sull'articolo sbagliato. Pistoia sta sopra i 50.000: **7.245 €/mese**, non 5.313.
- **La «riprova indipendente» del 5.313 non era una riprova.** Entrambi i percorsi passavano dal 55%: era un solo percorso contato due volte. Una riprova che condivide un anello con la catena che dovrebbe verificare non verifica niente — ed è più convincente proprio perché è la stessa affermazione. La riprova vera stava nello stesso documento: l'Allegato A del D.M. 30/05/2022 contiene **9.660**, **7.245** e **5.796**, più la riga `70 · 9.660 · 115.920 · 125.580 · 52`, dove 52 è il numero dei capoluoghi di provincia fino a 100.000 abitanti.
- **Gli importi a quattro cifre non prendevano il separatore.** Il default di `Intl` per l'italiano è `useGrouping: "min2"`, quindi la stessa pagina scriveva «13.800 €» due righe sopra «9660 €», sotto una cifra display che il separatore ce l'ha. Corretto **una volta sola** in `lib/format.ts` (`formatEuro` e `formatNumber`) e non con un formattatore locale nella pagina che ne aveva bisogno: due definizioni della stessa formattazione sono la versione tipografica del difetto che `AGENTS.md` §3 condanna sugli indicatori. Verificate tutte le chiamate: sono conteggi, nessuna passa un anno — «2.026» è ciò che il default evitava, ed è scritto nel commento perché non ci si ricada.
- **`scripts/pdftext.py --griglia` non arrivava in fondo su Windows.** `print` su stdout cp1252 usciva con `UnicodeEncodeError` al primo glifo fuori dalla codepage — cioè sui documenti larghi, che sono l'unica ragione per cui `--griglia` esiste. Ora scrive in byte, come già faceva la via normale.

### Note di ricognizione
- **La base di 13.800 € è confermata da un atto ministeriale**, non da una nota di associazione: l'Allegato A del D.M. 30/05/2022 scrive «il cui importo massimo è stato fissato in euro 13.800 mensili **per dodici mensilità**». La seconda metà della frase decide l'annualizzazione, che altrimenti sarebbe un'ipotesi — il fondo statale è ripartito su **tredici** mensilità perché comprende il fine mandato.
- **Il decreto del 5 febbraio 2026 non era «sulla stessa materia»**: è il riparto di 220 milioni ai comuni, non l'atto che fissa la base. Serve lo stesso, perché cita il comma 583 alla lettera.
- **Popolazione da ISTAT diretto** (serie POSAS, comune 047014): 88.889 al 31/12/2024. Trappola del file: la riga del totale ha età **`999`**, che passa per numerica — sommando tutto si ottiene 177.778, il doppio esatto, plausibile e senza errore.
- **Il vicesindaco lo dichiara il Comune**, solo non nella pagina che era stata controllata: la scheda del sindaco no, la notizia di presentazione della giunta sì. L'assenza di un dato su *una* pagina non è l'assenza del dato.
- **Sulla composizione della giunta la stampa sbagliava e il Comune no**: i giornali mettono in giunta una consigliera; l'ottava assessora è un'altra persona.

## [0.17.0] — 2026-07-30 · Fase C, la dichiarazione di chi pubblica

> Il prerequisito 1 dell'osservatorio civico chiuso nella terza forma: non un
> marchio separato — respinto due volte — ma **una dichiarazione esplicita di
> chi pubblica**, sotto lo stemma che resta.

### Aggiunto
- **`ChiPubblica`** (`components/osservatorio/chi-pubblica.tsx`): cartiglio più filo persistente, in cima a ogni pagina che esprime un giudizio. Il **cartiglio** separa *chi scrive il giudizio* da *chi fornisce i numeri*, che è la coppia che il prerequisito chiede di dichiarare — una frase sola ne direbbe metà — e chiude sul diritto di replica allo stesso corpo del giudizio. Il **filo** si aggancia sotto la barra in alto.
- **`/pagella`**, impalcatura della prima pagina di giudizio. Esiste già a metà perché la dichiarazione andava giudicata dove il difetto che corregge esiste davvero: sotto la barra in alto che porta lo stemma del Comune. Una proposta su fondo neutro non avrebbe detto cosa cambia. **Nessun voto è calcolato**: senza metodologia versionata e senza dati reali sarebbe inventato (`AGENTS.md` §2), quindi il posto del voto resta vuoto e dichiara perché.
- `/pagella` entra **in entrambi i cancelli nello stesso momento**: `rotte.mjs` (43 → **44 rotte**) e `shots.mjs`. Durante la revisione ha portato quattro voci in `shots.mjs`, una per direzione, perché una direzione non fotografata non è una direzione rivista; alla scelta sono collassate a una.

### Modificato
- **`npm run test:e2e` cancella `.next` da sé** (`pretest:e2e`). Decisione delegata da Lorenzo e chiusa così: un cancello che diventa rosso per una ragione estranea alla modifica costa molto più dei ~40s che fa risparmiare, perché il tempo si perde a cercare nel diff — e quel falso rosso aveva già prodotto **due diagnosi sbagliate**. Il conto vero include anche il primo `npm run dev` successivo, che riparte da freddo. Scritto in `AGENTS.md` §3 e §4.

### Deciso
- **La forma della dichiarazione, fra quattro rese in contesto.** L'argomento che ha deciso non è estetico ma di **durata**: la barra in alto è `sticky`, quindi lo stemma resta sullo schermo per tutta la lettura mentre una dichiarazione in cima sparisce al primo scorrimento. Chi legge la terza materia di una pagella vedrebbe solo lo stemma sopra un giudizio sulla giunta — cioè esattamente lo stato che la dichiarazione doveva correggere. Il filo costa 64px a 360px in modalità semplice, ed è il solo argomento contro.
- **Le due parti non si esportano separate.** Sarebbe possibile montarne metà, e la metà che si dimentica è sempre il filo, perché il difetto che copre non si vede finché non si scorre.
- **Il viola come marcatore della voce redazionale**, e non per gusto: è l'unico colore che `DESIGN.md` §4 assegna al lato cittadino. Vive su filo e pallino, **mai su testo** — su superficie chiara fa ~3,3:1, sotto la soglia AA.

### Corretto
- **Il pallino del filo galleggiava a metà del blocco.** A 360px in modalità semplice la frase va a tre righe e un pallino centrato verticalmente non ne marca più l'inizio: ora è allineato alla prima riga. Trovato guardando la schermata a viewport fisso — a piena pagina uno `sticky` non si può misurare, perché la cattura fotografa il documento steso.

### Ricerca — le fonti di «Il costo dell'amministrazione»
- **Il presupposto di partenza era sbagliato, e scoprirlo sblocca la funzione.** Non sono «~20 cifre da Amministrazione trasparente»: le indennità degli amministratori locali **non le decide il Comune**. Sono parametrate per legge al trattamento dei presidenti di regione, per fascia demografica (L. 234/2021 art. 1 c. 583, con applicazione progressiva 45%/68%/piena dal 2024), e ripartite fra le cariche dalle percentuali del D.M. 119/2000. La cifra si ricava da **legge più popolazione**; il dato comunale serve a confermarla, non a produrla.
- **Catena verificata per Pistoia**: capoluogo di provincia sotto i 100.000 abitanti → 70% della base; vicesindaco 55% e assessori 60% dell'indennità del sindaco; gettone dei consiglieri ≤ ¼ della stessa. Tabella completa e fonti in `ROADMAP.md` §6.
- **Una riprova indipendente vale più di un ricontrollo.** L'allegato A del decreto ministeriale 30/05/2022 è un foglio di calcolo largo, le cui colonne l'estrazione scollega dalle righe: da solo non proverebbe nulla. Ma fra i suoi importi compare **5.313**, che è esattamente il valore prodotto dalla catena per il vicesindaco partendo da tutt'altra strada.
- **Le cifre del Comune non ci sono, e quasi certamente è legittimo.** Nessun importo sulle pagine di sindaco, giunta e schede personali; il PDF che il portale offre lì è pubblicato «ai sensi dell'**art. 13**» — schema organizzativo — non dell'art. 14, che è quello dei compensi. Il sindaco è stato proclamato il 27 maggio 2026 e l'art. 14 c. 2 dà tre mesi. **Una pagina che oggi si aprisse su «dato non pubblicato» sarebbe un'accusa tratta da un dato mancante**, lo stesso difetto già pagato su `/organigramma` e `/promesse`.
- Tre anelli restano aperti prima che una cifra vada a schermo, ed è scritto quali: la conferma della base, la fonte ISTAT diretta per la popolazione, e chi dei nove è vicesindaco.

### Verificato
- `typecheck`, `lint`, **96 test unitari**, **11/11 E2E** a dev server spento, **`rotte` 44/44**, `shots --simple --width=360` sull'intera applicazione senza traboccamenti.

## [0.16.0] — 2026-07-29 · Fase B chiusa, terzo scaglione

> Tutto il resto. Il criterio del punto d'ingresso era esaurito e non ne serve
> un quarto: si finiscono. Vincolo dichiarato da Lorenzo — **usabilità prima di
> tutto**, che su pagine di servizio significa una cosa precisa: una cifra a
> 88px è decorazione, non informazione.

### Aggiunto
- **Indice delle sezioni su `/impostazioni`.** Sei riquadri di peso identico erano quattro schermate di scorrimento su telefono, senza un punto di riferimento — e chi arriva sa *cosa* cerca (la password, il tema, la geolocalizzazione) ma non ha modo di sapere dove sia. È lo stesso pattern di `/organigramma` e `/glossario` perché è la stessa situazione: un elenco in cui si cerca **una** voce, non un testo che si legge in ordine.
- **Cifra display su `/sondaggi`**: i sondaggi **aperti adesso**, con sotto quanti hai già risposto. Chi arriva vuole sapere a cosa può rispondere ora.
- **Data di entrata in vigore** su `/privacy`, `/cookie` e `/note-comunita`. Un'informativa senza data non si può leggere: chi la consulta non sa se vale ancora, e chi contesta un trattamento non sa quale testo fosse in vigore quel giorno. La data è quella dell'ultima modifica reale del documento (10 giugno 2026), non quella di oggi.
- Sette rotte nuove in `scripts/shots.mjs`, incluso il dettaglio di una stanza tematica. Le tre legali sono marcate `auth: false`: stanno fuori dal layout autenticato e senza quel flag il primo passaggio le saltava.

### Modificato
- **Due riquadri di `/impostazioni` si chiamavano «Cambia password» e «Sicurezza dell'account»**: nell'indice sarebbero state due voci indistinguibili. Ora sono «Password» (l'azione) e «Accesso e dispositivi» (lo stato), che è anche la differenza vera fra le due.
- **`/sondaggi` diceva «Eletta con N preferenze» al femminile fisso.** Su Davide Innocenti o Tommaso Vannini la frase era semplicemente sbagliata. Ora è «N preferenze alle elezioni»: vale per chiunque e non obbliga a portarsi un genere nel modello dati.

### Corretto
- **Ritirata un'esclusione del primo scaglione.** `/sondaggi` era stato escluso in blocco perché `getPolls` somma `demoBaseline(baseVotes)` ai voti veri — ma quello escludeva una cifra *sui voti*, non qualunque cifra. `active` e `userOptionId` sono righe di `Poll` e non passano da nessun baseline. È la stessa scelta già fatta su `/priorita`, dove per la stessa ragione si contano gli interventi in votazione e non i voti raccolti.
- **Tre pagine non avevano alcun difetto** — `/notifiche`, `/profilo`, `/comunita/stanze/[topic]` — e sono dichiarate tali nel codice e in `FEATURES.md` §5. Senza dirlo sembrano dimenticate; con l'usabilità come vincolo, aggiungere composizione dove non serve è il difetto, non la cura. `/notifiche` in particolare ha già filtri per tema, raggruppamento temporale, aggiornamento ottimistico e `aria-live`: «5 non lette» sta nell'intestazione accanto al pulsante che le azzera, e a 88px si staccherebbe dall'azione.

### Corretto (traboccamenti trovati dal cancello)
- **Il selettore del tema sfondava di 11px a 360px.** Era un `inline-flex` con tre pastiglie a larghezza propria: non si stringeva, e in modalità semplice (scala 115%) misurava 328px contro i 276 disponibili. Ora è a larghezza piena con i segmenti che si dividono lo spazio — la forma giusta di un segmented control sul telefono — e le icone spariscono sotto `sm`: sono decorative, e i 21px che liberano sono ciò che fa entrare «Sistema» senza troncarlo. In più `min-h-11` porta il bersaglio touch a 44px: era ~33px, **sotto il minimo dichiarato in `DESIGN.md` §11**. Nessuno dei due difetti si era mai visto, perché `/impostazioni` è entrata nel cancello solo adesso.
- **`/comunita/stanze` scorreva di lato da sempre** — 5px, mai misurati perché la rotta non era nel cancello. È la trappola `AGENTS.md` §3 (ondata 7, 5) da un terzo lato, ed è la parte nuova: la traccia `minmax(0, 1fr)` di `grid-cols-2` si stringe, ma l'*elemento* di griglia ha `min-width: auto` e si ferma al proprio min-content. Messo `min-w-0` sull'elemento, la scheda si stringe davvero — **e la pagina trabocca ancora**, perché «conversazioni» non si spezza e sporge dallo span ristretto finendo nello `scrollWidth`. **Restringere non è far entrare.** Risolto allargando la colonna (`grid-cols-1 sm:grid-cols-2`), che è l'unica delle tre uscite che non nasconde informazione: troncare il conteggio o spezzare la parola avrebbero sistemato la misura peggiorando la lettura. A 155px la scheda era comunque stretta — la misura segnalava un problema di leggibilità, non solo di layout.

### Verificato
- `typecheck`, `lint`, **96 test unitari**, **11/11 E2E** a dev server spento, **`rotte` 43/43**, `shots --simple --width=360` senza traboccamenti.

## [0.15.0] — 2026-07-28 · Fase B, secondo scaglione

> `UTILITY_NAV` per intero: `/avvisi`, `/organigramma`, `/faq`, `/glossario`.
> Il criterio cambia asse — non più «cosa gli hub mettono in vetrina», che è
> esaurito, ma **da dove ci si arriva**, che è la stessa misura di
> raggiungibilità portata avanti di un passo.

### Aggiunto
- **Apertura con cifra display su `/avvisi` e `/faq`.** Su `/avvisi` la cifra conta gli avvisi **in corso adesso** — righe vere di `Notice`, nessun `demoBaseline` e nessun `take` a monte — perché è la domanda con cui si arriva lì; un totale storico direbbe solo da quanto esiste la bacheca. Su `/faq` conta le **risposte ufficiali**, che è la tesi della pagina: ogni risposta è del Comune, non un'ipotesi della community.
- **Indice d'apertura su `/organigramma` e `/glossario`**, al posto della cifra. Sul primo sono le deleghe con il loro referente, sul secondo i termini: in entrambi i casi è la risposta alla domanda con cui si arriva sulla pagina («di questo chi si occupa?», «cosa vuol dire questa parola?»), che nessun totale poteva dare.
- Le quattro rotte entrano in `scripts/shots.mjs` **insieme alla modifica**, per la ragione di sempre: il cancello misura solo le pagine che apre.

### Modificato
- `scroll-mt-20` sulle àncore dei termini del glossario e sulle schede degli assessori. Le àncore dei termini esistevano già — sono quelle che usa `GlossaryTip` dalle altre pagine — ma senza margine di scorrimento finivano **sotto la barra in alto**, che è appiccicata: si arrivava sul termine giusto senza vederlo.
- `grid-cols-1` accanto a `sm:grid-cols-2 lg:grid-cols-3` sulla giunta (`AGENTS.md` §3, ondata 7, n.5). Le schede portano un'email in `truncate`: senza la variante di base la traccia implicita è `auto`, il cui minimo è il min-content, e a 360px la colonna sfonda il viewport.
- L'asserzione E2E sul glossario cerca il termine **dentro la sua àncora** invece che a testo libero: con l'indice ogni termine compare due volte e `getByText` nudo violava lo strict mode. Aggiunta un'asserzione sul `href` del chip, perché è la stessa àncora da cui dipendono i tooltip contestuali.

### Corretto
- **Due delle quattro rotte non prendono la cifra, e per il motivo opposto a quello atteso: le righe sono vere ma il numero non regge.** Su `/organigramma` le aree di delega coincidono col numero di schede (un numero che si ottiene guardando), i «contattabili» sono 1 su 7 perché nel seed solo il sindaco ha un'email — a 88px si leggerebbe «il Comune non si fa contattare», cioè una conclusione tratta da un dato mancante, che è la trappola §3 (ondata 7, n.3) — e follower e preferenze sono numeri su una persona sola, che il prerequisito (d) della Fase C esclude. Su `/glossario` «13 termini spiegati» è vero e non è la ragione per cui qualcuno ci arriva.
- **Su `/avvisi` lo stato vuoto sostituisce la cifra invece di affiancarla.** Zero avvisi attivi è la notizia migliore che la pagina possa dare, ma resa a 88px sarebbe uno «0» indistinguibile dal difetto §3 (Fase A, n.1), dove una pagina che non anima restituisce zeri plausibili: chi la vedesse non saprebbe se la città è tranquilla o se il conteggio è rotto.

### Aggiunto (cancello nuovo)
- **`npm run rotte`** — apre tutte e **43** le rotte dell'applicazione e controlla tre cose insieme: stato < 400, presenza di un `<h1>`, **assenza del testo d'errore in pagina**. Il terzo controllo non è pedanteria: una pagina finita sull'error boundary risponde 200, e la `not-found` di Next un `<h1>` ce l'ha comunque — un cancello che si ferma al 200 certifica come sana un'applicazione irraggiungibile. Il cancello di uscita della Fase A aveva «le 26 rotte rispondono ancora 200» come voce da spuntare a mano, e nessuno la rispuntava.
- **Perché serviva, in concreto.** Il dev server ha risposto **404 su tutte le rotte annidate** — `/comunita/stanze` e i quattro dettagli — mentre le 38 a un solo segmento rispondevano. Causa: `.next` stantio, il caso già descritto in `AGENTS.md` §4; il codice non c'entrava. `shots` non poteva vederlo, perché apre 27 rotte su 43 e ai dettagli arriva *cliccando* dalla lista, mai per indirizzo. Registrato come diciannovesima trappola in `AGENTS.md` §3, con la regola che ne esce: quando un sintomo somiglia a «abbiamo perso una funzionalità», prima si misura l'inventario e poi si cerca nel codice.
- **E si ripresenta a ogni ciclo di modifiche.** Cancellato `.next` le 43 rotte tornano verdi; si modificano otto file, nessuno annidato, e le annidate rimuoiono. Succede **anche agli E2E**: `playwright.config.ts` avvia `npm run dev` sulla 3939 — processo diverso, stessa cartella `.next` — quindi una suite può finire 8/11 con «Errore 404 · Pagina non trovata» su tre test annidati senza che nulla sia rotto. Avviso messo dove serve: in testa al `webServer` di `playwright.config.ts`.

### Verificato
- `typecheck`, `lint`, **96 test unitari**, **11/11 E2E** a dev server spento, `shots --simple --width=360`, **`rotte` 43/43**.
- **Tre esecuzioni E2E, e la lettura onesta è che le prime due diagnosi erano sbagliate.** La prima suite ha dato 8/11: una sola era una regressione vera (strict mode sul glossario, corretta). Gli altri due fallimenti li avevo attribuiti alla compilazione a freddo contro timeout da 5s, sulla base della durata — 3,2 min contro 1,3 min della seconda esecuzione. Quando lo stesso schema è tornato una terza volta, i contesti d'errore hanno mostrato la causa reale: **«Errore 404 · Pagina non trovata»**, cioè la trappola delle rotte annidate, non un timeout. La prova è diretta: cancellato `.next`, stessa suite e stesso codice, **11/11**.

## [0.14.0] — 2026-07-26 · Fase B, primo scaglione

> Copertura, non ridisegno: si porta la composizione Astryx dove finora erano
> arrivati solo i token. Si parte dalle rotte che i tre hub della Fase A mettono
> in vetrina.

### Aggiunto
- **Apertura con cifra display su `/promesse`, `/decisioni` e `/question-time`.** Tutte e tre partivano da un elenco di schede: la prima cosa che si leggeva era un caso singolo, mai la risposta alla domanda che porta lì. Ora ognuna apre sul proprio numero protagonista, con sotto la frase che rende conto del resto.
- `campioneSufficiente()` in `lib/citystats.ts`: la regola del campione minimo smette di essere legata al colore delle schede di quartiere e diventa generale. `tassoGiudicabile()` resta e vi delega — una soglia sola, non due. Tre test nuovi (96 unitari in totale).
- Le tre rotte entrano in `scripts/shots.mjs` **insieme alla modifica**: il cancello del traboccamento orizzontale misura solo le pagine che apre, quindi una rotta ridisegnata e non elencata risulterebbe "verificata" senza essere mai stata aperta.
- **`/priorita` e `/patti`** completano la copertura dell'hub Partecipa, che arriva a 5 sezioni su 8 (segnalazioni e proposte erano già coperte dall'ondata 6). La cifra di `/priorita` conta gli **interventi in votazione**, non i voti: `totalVotes` include il baseline del seed. Quella di `/patti` conta i **patti attivi**, non l'avanzamento medio, per la ragione già scritta su Opere — un patto nuovo sta al 10% perché è nuovo.
- **`/volontariato`, `/progetti` e `/eventi`**: con queste **i tre hub della Fase A sono coperti per intero**, salvo tre esclusioni dichiarate (`/sondaggi`, `/mappa`, `/digest` — motivi in `FEATURES.md` §5). Otto rotte su 26, le 18 restanti non sono in vetrina su nessun hub.

### Modificato
- `/promesse`: sparisce la pastiglia «1 su 6 completati», che ora sarebbe un secondo protagonista dello stesso numero a 12px. Le pastiglie restano la ripartizione per stato, che è un'altra informazione. L'asserzione E2E che ci puntava è stata aggiornata alla frase sotto la cifra, dove il fatto continua a stare.

### Corretto
- **Nessuna delle tre pagine porta la scala a tacche, e il motivo vale più della scala.** Era stata messa e poi tolta guardando lo screenshot: su `/promesse` la tacca attiva cadeva a un sesto dell'intervallo 0→6 e si leggeva «non avete fatto quasi niente» — mentre due impegni sono in corso e uno è appena stato assunto. L'intervallo è aritmeticamente vero ma **non è un traguardo**: nessuno ha promesso che tutti e sei fossero chiusi oggi. Stessa cosa sul question time, dove la regola dichiarata è che rispondono alle domande **più votate**, non a tutte. È la distinzione del «Dossier persona» (`ROADMAP.md` §6) arrivata con tre mesi d'anticipo: si riporta il record, non se ne inferisce un voto.
- **Il cancello delle schermate usciva 0 quando l'accesso non riusciva.** Se `login()` falliva — server ancora in compilazione, rate-limit, credenziali cambiate — *tutte* le pagine autenticate venivano saltate con un avviso, nessun contatore si muoveva e lo script terminava con successo: una «revisione visiva» in cui l'unica cosa fotografata era `/login`. È la trappola §3 (ondata 7, n.4) da un'altra porta — lì la cattura falliva, qui non veniva nemmeno tentata — e si è vista dal vivo il 2026-07-26, con tre rotte nuove saltate e uscita 0. Ora i salti sono un errore: con credenziali sbagliate lo script esce **1**, con quelle giuste **0** (verificato in entrambi i versi).
- **Quattro contatori del territorio contavano il seed anche fuori da `DEMO_MODE`.** `lib/data/territorio.ts` era l'unico modulo dati che non importava `demoBaseline()`, e sommava `baseVotes`/`baseJoins`/`baseReports` direttamente: voti del question time, voti delle tornate di priorità, adesioni alle iniziative e segnalazioni dietro un progetto civico. Sono esattamente i campi che `lib/demo.ts` dichiara in testa non debbano **mai** contare in produzione. Nessun effetto in sviluppo, dove `DEMO_MODE` è acceso e i numeri restano identici; in produzione erano quattro numeri gonfiati su una piattaforma il cui punto è non inventare dati.
- **L'hub `/partecipa` diceva «N patti attivi» contando anche i proposti**, mentre `/patti` i due stati li distingue: a un clic di distanza comparivano due numeri diversi dello stesso indicatore. Ora contano allo stesso modo.

### Verificato
- `typecheck`, `lint`, **96 test unitari**, `shots` in tema chiaro e scuro sulle cinque rotte nuove, `shots --simple --width=360` senza traboccamento orizzontale.

## [0.13.1] — 2026-07-26 · Fase A, chiusura

> Le due voci che la 0.13.0 aveva lasciato aperte. Nessuna funzionalità nuova.

### Modificato
- **`components/community/` non esiste più** (A-5.1). Conteneva segnalazioni e proposte — `report-card`, `proposal-card`, `report-composer` — mentre la Comunità vera sta in `comunita/`: un nome inglese che violava `AGENTS.md` §6 *e* rivendicava quello di una sezione diversa. I 18 file vanno in `segnalazioni/` (9) e `proposte/` (6); i **tre trasversali** no, perché infilarli in una delle due avrebbe spostato la bugia invece di toglierla. `follow-button` e `answer-feedback` sono parametrici sull'entità — `FollowTarget` copre sei tipi di bersaglio, `FeedbackTarget` tre — quindi vanno in `app/`, accanto a `shared-element-link.tsx` che sta lì per la stessa ragione. `badges.tsx` è solo presentazionale e parla di *chi è l'autore*: va in `ui/` come `civic-badges.tsx`, perché `badges.tsx` accanto a `badge.tsx` si distingue per una lettera.
- `AGENTS.md` §4 non consiglia più `E2E_BASE_URL` per aggirare il conflitto di porta: era in contraddizione con la trappola §3 che quella variabile l'ha prodotta. Ora dice di spegnere il dev server.

### Verificato
- **Prima esecuzione E2E verde end-to-end: 11/11 in 50,3s**, sul percorso isolato. Non era mai riuscita perché richiede la directory libera — Next rifiuta due dev server sullo stesso progetto — quindi finché uno era in ascolto l'avvio automatico di Playwright non partiva e l'isolamento non veniva mai esercitato davvero.
- Fra gli 11 passa `territorio.spec.ts:55`, «votare una domanda del question time aggiorna il conteggio»: è il test che contro il DB di sviluppo si esauriva da solo dopo quattro esecuzioni. Verde lì significa che l'isolamento fa quello per cui è stato introdotto, non solo che la suite è verde.
- `typecheck`, `lint`, 93 test unitari dopo la rinomina.

## [0.13.0] — 2026-07-26 · Fase A «Consolidamento»

> Le ondate sono congelate: prima di aggiungere altro, la piattaforma viene
> riorganizzata. Il piano sta in [`docs/roadmap-consolidamento.md`](docs/roadmap-consolidamento.md);
> l'ondata 8 e l'intero catalogo delle idee non sono cancellati, diventano la Fase C.

### Aggiunto
- **Tre pagine-contenitore**: `/partecipa`, `/trasparenza`, `/territorio`. Non sono griglie di link — un hub che elenca soltanto sposta il clic invece di eliminarlo — ma aprono sullo stato reale: quante segnalazioni sono aperte, quante proposte in raccolta firme, quanti voti in corso. I conteggi vengono da `getCityState()`, la stessa sorgente de "La mia città", così due pagine non possono dire due numeri diversi della stessa città.
- `components/app/hub.tsx` (`HubNow`, `HubSections`) e `components/ui/follow-toggle.tsx`.
- `formatConteggio()` in `lib/format.ts`: numero e forma accordati. «1 tornate aperte» si legge come un errore del programma.

### Modificato
- **La barra laterale passa da 25 voci a 5 destinazioni**, con le sezioni della sola destinazione aperta. Misurava 1191px contro 656px visibili a 1280×720: il 45% stava sotto la piega, gruppo "Trasparenza" e avvisi urgenti compresi.
- **La barra in basso passa da 5 voci su 25 a 5 su 5.** Sotto i 1024px la barra laterale non è collassata ma rimossa, e non c'era nulla a sostituirla: 16 destinazioni non avevano alcun percorso navigabile, fra cui **tutti e sette** gli strumenti di partecipazione strutturata — mentre "partecipare" è uno dei due compiti primari. Il campo `NavItem.core`, che decideva quali cinque sopravvivessero, è sparito con la ragione che lo rendeva necessario.
- **Desktop e telefono espongono ora le stesse cinque destinazioni.** L'architettura non è stata scelta e poi adattata: è derivata dal vincolo più stretto, gli slot di una barra in basso.
- `/la-mia-citta`: "Cosa vuoi fare?" sale sopra "Stato della città". Dei due compiti primari, è il solo che chiede un'azione, ed è l'unico punto della piattaforma che parla di cosa vuoi *fare* invece che di come si chiama la sezione.
- Avvisi urgenti, organigramma, FAQ e glossario escono dal menu e vanno nel footer: presente su ogni pagina, telefono compreso. Notifiche, profilo e impostazioni escono e basta — erano una seconda copia di quello che la barra in alto offre già.
- L'aspetto del pulsante "Segui" vive in `FollowToggle`. I due pulsanti restano due perché lo strato dati è diverso di proposito: gli assessori hanno una chiave esterna vera (`AssessoreFollow`), la tabella polimorfica `Follow` non può averla.

### Corretto
- **`/iniziative` → `/volontariato`**: la rotta portava un nome che l'interfaccia non usava. Il menu diceva "Volontariato" e l'indirizzo diceva altro, quindi non era indovinabile. Con redirect permanente.
- **Gli E2E avevano un database dedicato** (`prisma/e2e.db`, ricreato a ogni esecuzione da `tests/e2e/global-setup.ts`). Prima scrivevano in quello di sviluppo senza ripulire, e la suite si era avvelenata da sola: sei segnalazioni su sedici erano residui «… E2E 17850…» visibili in home, e soprattutto il cittadino di test aveva votato **tutte e quattro** le domande della sessione aperta di question time — quindi `territorio.spec.ts` cercava un pulsante «vota questa domanda» che non poteva più esistere. Non basta creare dati con titoli univoci: le **azioni** si accumulano.
- Nota sulla stessa riparazione: il rate-limit dell'accesso vive in una `Map` **in memoria**, cioè nel processo del server. Contro un server di lunga durata (`E2E_BASE_URL`) i tentativi di login si sommano fra esecuzioni finché l'intera suite cade su «Troppi tentativi di accesso» — un sintomo che non somiglia per niente alla sua causa. L'avvio automatico parte da un processo nuovo, quindi da contatore azzerato.

### Verificato
- `typecheck`, `lint`, 93 test unitari, `shots` in tema chiaro e scuro, e `shots --simple --width=360` senza traboccamento orizzontale.
- **Il falso allarme sulle cifre display.** Una prima stesura dell'audit dichiarava `AnimatedNumber` rotto ovunque, con `/bilancio` a «0 mln €». Era l'ambiente di misura: l'ispezione girava in un pannello browser mai visualizzato, dove Chrome non consegna le callback di `IntersectionObserver` — quindi `useInView` non scattava e il DOM restava sul valore iniziale, uno zero perfettamente plausibile. `npm run shots` mostra 142 mln € e gli anelli a 92/86/71%. **Ciò che dipende da IntersectionObserver o rAF non si verifica leggendo il DOM.**

## [0.12.0] — 2026-07-25 · Ondata 7 «Il secondo scaglione di pagine»

### Aggiunto
- **Cronoprogramma delle opere** (`lib/cronoprogramma.ts`, `components/opere/cronoprogramma-chart.tsx`): per ogni cantiere in corso, il lavoro realizzato contro la quota di calendario già consumata, con un marcatore che dice dove i tempi previsti direbbero di essere oggi. Derivato da `startedAt`, `expectedEnd` e `progress` — nessun campo nuovo, nessun dato inventato. Costruito in HTML e non in SVG per non incontrare lo scalamento non uniforme che aveva accorciato le linee del grafico d'andamento; l'equivalente testuale è **visibile** in ogni riga, non nascosto in una tabella da tenere allineata.
- **Opere**: cifra display sull'investimento nei cantieri aperti e `MeshSurface` la cui tinta è la quota di cantieri che rispettano il proprio calendario. Rimando di navigazione a `/progetti` — di sola navigazione, perché `CivicProject` non ha una relazione con `Opera`.
- **Proposte**: la **scala a tacche** di `DisplayNumber` sul suo unico intervallo davvero reale, 0 → 500 sostegni, dove gli estremi sono il nulla e la soglia della consultazione pubblica. Sul dettaglio i tre gradini 50/200/500 sostituiscono la barra, che ripeteva lo stesso intervallo della scala senza dire quali soglie fossero superate.
- **Quartieri**: ogni scheda porta una fascia `MeshSurface` — lo slot che una fotografia occuperà (`DISCOVERY` D7) — con la tinta pari al tasso di risoluzione di quell'area. Il dettaglio ha la stessa anatomia, così la transizione ha qualcosa da interpolare.
- **Comunità**: cifra display sulla quota di domande con risposta ufficiale (contata sulle sole domande: discussioni e idee non chiedono una risposta), e stanze tematiche a griglia con il numero di conversazioni, al posto della barra a scorrimento orizzontale.
- **Transizione a elemento condiviso generalizzata**: `components/app/shared-element-link.tsx` è parametrico sull'entità e serve segnalazioni, opere, proposte e quartieri. Il `view-transition-name` è **uno solo per tutta l'app**, perché una transizione è in volo per volta e un nome per entità obbligherebbe a elencarle tutte in `globals.css` — dove la prima dimenticata morferebbe con i valori di default, senza errori.
- `npm run shots` copre sei rotte nuove (dettaglio opera, proposte + dettaglio, quartieri + dettaglio, comunità); 13 test unitari su `cronoprogramma` e sul tasso di risoluzione.

### Modificato
- `DisplayNumber`: la prop `format` (una funzione) diventa `formatOptions` (`Intl.NumberFormatOptions`). Vedi *Corretto*.
- Il **tasso di risoluzione** ha una definizione sola, in `lib/citystats.ts` (`STATI_RISOLTI`, `STATI_FUORI_CONTEGGIO`, `STATI_CHIUSI`, `tassoRisoluzione`): la usano "Stato della città", la lista quartieri e il dettaglio quartiere.
- **Tolti due KPI inventati** dall'apertura di Opere: «318 cantieri censiti» e «+4 nuovi questo mese». Un numero inventato accanto a numeri veri li fa sembrare tutti inventati.
- `DESIGN.md` §7 (nome condiviso unico, nuova posizione del meccanismo) e §8 (la mesh come slot della fotografia; la controregola: non tingere ciò che non è una salute).

### Corretto
- **`DisplayNumber` andava sull'error boundary da qualunque Server Component che passasse `format`.** Una funzione non attraversa il confine RSC — «Functions cannot be passed directly to Client Components» — e tutte le pagine che gli danno la cifra protagonista sono Server Component. Typecheck e lint restavano verdi: il difetto si vedeva solo aprendo la pagina.
- **Il dettaglio quartiere contava da liste troncate.** `counts.openReports` veniva da una `findMany({ take: 6 })`, quindi non poteva superare 6 pur restando plausibile: un quartiere con quaranta segnalazioni aperte ne dichiarava sei. Ora i conteggi si chiedono al database; lo stesso valeva per opere, proposte, sondaggi ed eventi (`take: 5`).
- **Un rapporto su un campione minuscolo non tinge più una scheda.** «0% risolte» su due segnalazioni è aritmeticamente esatto e informativamente nullo, ma una scheda rossa lo fa leggere come una colpa di quel quartiere. Introdotta `CAMPIONE_MINIMO_PER_GIUDIZIO`: sotto la soglia il tono resta `cool` e la scheda dichiara «troppo poche segnalazioni per una media».
- **`npm run shots` usciva 0 sulle pagine che non riusciva ad aprire.** Il traboccamento orizzontale si misura dentro il `try`: una cattura fallita non veniva mai misurata e il cancello dichiarava "nessuna pagina scorre di lato" proprio sulle rotte appena cambiate. Ora una cattura fallita fa uscire 1.
- Il nome delle schede quartiere passa da 24px a 26px: per WCAG il "testo grande" parte da 18,5pt ≈ 24,7px se non è in grassetto, e `font-semibold` non conta come grassetto — sul tono `bad` (3,3:1) 24px cadeva appena sotto la soglia.

### Verificato
- `tsc` pulito · eslint 0 problemi · Vitest 93/93 (13 nuovi) · 24 schermate nei due temi, zero traboccamenti orizzontali · nessun errore in console.

## [0.11.0] — 2026-07-25 · Ondata 6 «Il design system arriva sulle pagine»

> L'ondata 5 (fondamenta Astryx e direzione ibrida, commit `132cdaf`) non ha una
> voce qui: il suo resoconto sta in [ROADMAP.md §4](ROADMAP.md). Questa voce
> riprende da lì.

### Aggiunto
- **Sankey del bilancio** (`components/charts/sankey-flow.tsx`): "dove scorrono i soldi" a due stadi — entrate → {spesa programmata, avanzo} → sei missioni. Scritto a mano sui token Pistoia, senza registry shadcn (vedi `REFERENCES.md` §4). Due stadi e non tre perché il modello dati non ha la scomposizione delle entrate per fonte: un terzo stadio andrebbe inventato. Tabella equivalente e attraversamento con le frecce.
- **Prima sezione narrata** della piattaforma: `ScrollTold` entra sul Bilancio con tre passaggi (entrate → spesa → avanzo) che precedono il sankey.
- **Cifra display** su Bilancio (spesa programmata) e su La mia città (tasso di risoluzione delle segnalazioni) — una sola per schermata.
- **Bento "Stato della città"** con `MeshSurface` la cui tinta deriva da `toneFromPercent(tasso di risoluzione)`: il colore codifica il numero che gli sta accanto.
- **Timeline a punti** sulle Segnalazioni: altezza = arrivate nella settimana, diametro = chiuse, colore = settimana chiusa in pari. `getReportActivity()` e `weeklyLabels()`.
- **Transizione a elemento condiviso** lista → dettaglio segnalazione, con le View Transitions native (`components/community/report-link.tsx`, `lib/view-transitions.ts`). Degrada allo scambio istantaneo dove l'API manca.
- `npm run shots` cattura anche il **dettaglio segnalazione**, raggiunto col clic.

### Modificato
- **Login**: il pannello di marca passa da gradiente teal→viola con due aloni sfocati a `MeshSurface` tono `cool` più scacchiera dello stemma. Toglie tre violazioni di `DESIGN.md` in una schermata sola.
- **Treemap e anelli del bilancio** non sono più un arcobaleno: rampa sequenziale dall'accento per le quantità, colori semantici solo per gli stati (`DESIGN.md` §9). L'importo nelle celle passa a `--foreground` (il teal su una sua tinta chiara faceva ~3,3:1, sotto l'AA).
- `LineChart`: il riempimento sotto la curva resta solo con **una** serie; con tre, tre veli al 18% si sommavano in una patina grigio-blu che sembrava un quarto dato.
- `ScrollStep` non parte più da opacità 0 ma da 0,3: chi non scorreva — o stampava — trovava un buco al posto di un paragrafo.
- `DESIGN.md` §7 riscritto: l'elemento condiviso **non** si fa con `layoutId`, e §8 documenta quali toni mesh reggono quale testo, con i contrasti misurati.

### Corretto
- **`LineChart` disegnava solo ~80% di ogni linea.** `pathLength="1"` normalizza le lunghezze in spazio utente, `vector-effect: non-scaling-stroke` calcola i trattini in spazio schermo: con il viewBox largo 640 reso su 802px il tratto copriva 640/802 = 79,8% della curva. Sulla pagina del bilancio mancavano **gli ultimi due mesi**, a fine animazione e senza alcun segnale. La rivelazione è ora una tendina di ritaglio, immune allo scalamento non uniforme.
- **Le tabelle `sr-only` degli equivalenti testuali spingevano la pagina in orizzontale** (160px sul bilancio in modalità semplice): su una `<table>` `width: 1px` vale come minimo, non come larghezza. `sr-only` è passata al `<div>` che le avvolge, in tutti e tre i grafici.
- **Titoli bianchi sopra le superfici mesh nel tema scuro**: il reset di Astryx dichiara `color` su `:where(h1…h6)`, e una dichiarazione sull'elemento batte il valore ereditato dal genitore. Aggiunta la regola `.mesh-surface :is(h1…h6, p) { color: inherit }`.
- **`npm run shots` non fotografava il login**: lo script faceva l'accesso prima di visitarlo e `/login` reindirizza chi ha una sessione. Le pagine anonime ora si catturano in un contesto separato. La cattura è anche diventata deterministica: si allarga il viewport all'altezza della pagina *prima* di attendere, perché `fullPage: true` faceva partire le animazioni durante lo scatto.
- Le promesse della transizione (`ready`, `finished`, `updateCallbackDone`) sono tutte gestite: saltare una transizione è un esito normale e non deve finire in console come errore.
- Anelli del bilancio: ripristinato `flex-wrap`, che a 360px faceva traboccare la pagina di 139px.

## [0.10.0] — 2026-06-13 · Ondata 4 «Territorio & partecipazione»

### Aggiunto
- **Question time digitale** `/question-time` (`A2 §22`): il Comune apre un tema, i cittadini fanno domande e le votano; le più votate ricevono risposta ufficiale, archiviata. Voto e nuova domanda con stato ottimistico.
- **"Vota la priorità"** `/priorita` (`A2 §9`): tornate di voto dei cittadini verificati su interventi già validati; un voto per tornata (spostabile), classifica in tempo reale, ogni tornata chiusa racconta cosa ha fatto il Comune con l'esito.
- **Volontariato e iniziative** `/iniziative` (`A2 §14`): bacheca di Comune e associazioni con adesione a un clic, posti contati e archivio delle iniziative concluse.
- **Patti e luoghi adottati** `/patti` (`A2 §31` + `A2 §16`): patti digitali di quartiere con obiettivo, firmatari e avanzamento; luoghi pubblici adottati da cittadini, scuole e associazioni con l'ultima nota di cura.
- **Da segnalazione a progetto** `/progetti` (`A2 §8` + `A2 §7`): i cluster di segnalazioni ricorrenti diventano progetti pubblici tracciati, con le segnalazioni d'origine collegate; "sul radar" i problemi che si ripetono ma non sono ancora progetto. Banner reciproco sul dettaglio segnalazione.
- **Stanze tematiche** `/comunita/stanze` (`A1 §17`): la community organizzata anche per tema civico; il composer della stanza pubblica già nel tema. Strisce d'accesso dalla pagina Comunità.
- **Diario del quartiere** (`A1 §9`): "Questa settimana a …" sul dettaglio quartiere — risolte, nuove segnalazioni, conversazioni, aggiornamenti dei cantieri e patti, calcolati dagli ultimi 7 giorni.
- **Mappa del disagio** (`A2 §6`): heatmap della densità delle segnalazioni aperte come overlay attivabile su `/mappa` (deep-link `?layer=disagio`).
- **Consultazioni con documento** (`A2 §23`): le consultazioni ufficiali mostrano il documento di riferimento con sintesi in linguaggio semplice e link.
- **Onboarding "primi passi in città"** (🆕 backlog → O4): checklist progressiva di 5 azioni utili in home, che si spuntano da sole usando la piattaforma e si nascondono quando ha finito; invito al tour per i nuovi account.
- **Tour demo** ora ricordato: l'ultimo passo segna `tourCompletedAt`, l'invito non si ripresenta; nuovo passo sulla partecipazione. Nuova sezione **Partecipazione** nella side-nav; le pagine entrano in ricerca globale e palette.

### Modificato
- Tipografia: **Montserrat** come voce unica (sostituisce Fraunces + Plus Jakarta Sans); i titoli si distinguono per peso e tracking. Aggiornati `globals.css`, `layout.tsx` e DESIGN.md §3.
- Schema: nuovi modelli `QuestionTime`/`QtQuestion`/`QtVote`, `PriorityRound`/`PriorityItem`/`PriorityVote`, `Initiative`/`InitiativeJoin`, `AdoptedPlace`, `NeighborhoodPact`/`PactUpdate`, `CivicProject`; campi `User.tourCompletedAt/onboardingDismissedAt`, `CommunityPost.topic`, `Poll.docTitle/docSummary/docUrl`, `Report.civicProjectId` (migrazione `ondata4_territorio`).
- Seed: 2 question time (1 aperto, 1 archiviato), 2 tornate di priorità, 5 iniziative, 4 luoghi adottati, 3 patti, 2 progetti civici con segnalazioni collegate, consultazione con documento, account demo "storici" con onboarding già concluso.

### Verificato
- `tsc` pulito · eslint 0 problemi · Vitest 80/80 (11 nuovi) · Playwright 11/11 (3 nuovi) · `next build` ok.

## [0.9.0] — 2026-06-12 · Ondata 3 «Trasparenza che chiude il cerchio»

### Aggiunto
- **Archivio decisioni** `/decisioni` (`A1 §12`): esito (approvata / in parte / respinta / rinviata), motivo in linguaggio semplice, ufficio responsabile e link al percorso (proposta, segnalazione, consultazione).
- **"Perché non si può fare?"** (`A1 §13`): le proposte respinte spiegano i motivi punto per punto (`Proposal.rejectionReasons`), nel dettaglio proposta e nell'archivio decisioni.
- **"Promesse e risultati"** `/promesse` (`A1 §30`): tracker degli impegni per stato (promesso / in corso / completato / rimandato / non fattibile) con origine, scadenza comunicata e nota di aggiornamento.
- **Bacheca avvisi urgenti** `/avvisi` (`A1 §21`): severità info/attenzione/critico, archivio dei conclusi, avvisi geolocalizzati su mini-mappa + nuovo layer "Avvisi urgenti" su `/mappa`; banner in home per gli avvisi attivi (i critici pulsano).
- **"Cosa cambia per me?"** (`A1 §24` + `A2 §30`): punti pratici su ogni avviso e sul dettaglio opera (`Opera.impactNotes`) — accessi, parcheggi, percorsi alternativi, durata.
- **FAQ della città** `/faq` (`A1 §11`): domande ricorrenti raggruppate per tema con badge 🏛️ "Risposta ufficiale" e rimando alla Comunità.
- **Report civico del mese** `/digest` (`A2 §19`): riepilogo degli ultimi 30 giorni calcolato dai dati reali della piattaforma (segnalazioni, opere, proposte, decisioni, eventi) + **export PDF** via print stylesheet curato (testata con stemma solo in stampa, zero dipendenze).
- **"Spiegamelo semplice"** (`A2 §11`, redazionale): blocco di traduzione in linguaggio cittadino su opere e decisioni (`Opera.simpleText`, `Decision.simpleText`); la versione AI resta 💡.
- **Glossario** `/glossario` (`A2 §27`): 12 termini amministrativi in linguaggio semplice + tooltip `GlossaryTip` inline nel bilancio (riscossione, impegni, PNRR, avanzo).
- **Hero "Stato della città"** in home (🆕): quattro indicatori con sparkline (risolte nelle 8 settimane, cantieri con avanzamento medio, proposte attive, avvisi attivi) sopra i percorsi guidati.
- Sezione **Trasparenza** nella side-nav; decisioni, promesse, avvisi e FAQ entrano nella **ricerca globale** e nella palette; nuovo passo del **tour demo**.

### Modificato
- Schema: nuovi modelli `Decision`, `Commitment`, `Notice`, `CityFaq` + campi `Opera.impactNotes/simpleText`, `Proposal.rejectionReasons` (migrazione `ondata3_trasparenza`).
- Seed: 5 decisioni, 6 impegni, 4 avvisi (3 attivi), 8 FAQ, proposta respinta con motivi, impatto pratico su 3 opere, notifica dell'avviso critico.
- Il telaio dell'app (top bar, nav, footer, tour) è nascosto in stampa (`print:hidden`) su tutte le pagine.

### Verificato
- `tsc` pulito · eslint 0 problemi · Vitest 69/69 (13 nuovi) · Playwright 8/8 (3 nuovi) · `next build` ok.

## [0.8.0] — 2026-06-12 · Ondata 1 «Segnalazioni 2.0»

### Aggiunto
- **Timeline pubblica** della segnalazione (`A1 §3`): cronologia completa con autori, note e connettore visivo — "La storia di questa segnalazione".
- **Conferma del cittadino** dopo la risoluzione (`A1 §5`): "È davvero risolta?" — sì chiude il cerchio, no **riapre la pratica** con nota pubblica.
- **Foto prima/durante/dopo** (`A1 §4`): galleria per fase nel dettaglio; lo staff carica durante/dopo dal triage admin.
- **Ufficio competente sempre visibile** (`A1 §6`) e **tempi medi indicativi per categoria** (`A1 §7`, dati storici + baseline demo, mai promesse).
- **Segnalazione urgente** (`A1 §8`): il cittadino la richiede, il moderatore la valida dal triage (badge "Urgente" solo se confermata).
- **Anti-duplicati** (`A1 §2`): mentre si compila, suggerimento delle segnalazioni aperte simili con "Anche io" inline (`/api/segnalazioni/simili`).
- **"Segnala in 30 secondi"** (`A2 §4`): flusso rapido mobile-first in 3 passi (foto → posizione → categoria), titolo e descrizione generati.
- **Mock "vivo"**: il seed varia in modo deterministico col giorno (contatori, segnalazione "fresca di oggi" a rotazione) — ogni ri-seed racconta una città leggermente diversa.

### Modificato
- Schema: campi `urgency`, `resolutionFeedback(At)` su `Report` + nuovo modello `ReportPhoto` (migrazione `ondata1_segnalazioni2`).
- `downscaleImage` estratta in `lib/images.ts` (condivisa da composer, flusso rapido e triage).
- Triage admin: richieste di urgenza in cima, validazione a due bottoni, upload foto per fase.

### Verificato
- `tsc` pulito · eslint 0 problemi · Vitest 56/56 (9 nuovi) · Playwright 5/5 · `next build` ok.

## [0.7.0] — 2026-06-12 · Ondata 0 «Fondamenta visive & design system»

### Aggiunto
- **DESIGN.md**: direzione estetica formalizzata (carattere istituzionale toscano, tre motivi identitari — scacchiera, fasce romaniche, città verde — tipografia a due voci, regole di colore/motion/data-viz, tema scuro, Sì/No).
- Tipografia display **Fraunces** (titoli e numeri protagonisti) accanto a Plus Jakarta Sans.
- Utility identitarie CSS: `.bande-romaniche`, `.scacchiera`, `.divider-bande`.
- Motion system: View Transitions sulle navigazioni, `.page-enter`, `.stagger`, `.pulse-civico`, easing `--ease-out-civic`.
- **EmptyState** illustrato (arco romanico + scacchiera) adottato in segnalazioni, proposte, eventi, comunità e notifiche.
- **Centro notifiche 2.0**: filtri per tema, raggruppamento Oggi / Questa settimana / Più vecchie, azione inline "segna come letta".
- **Command palette 2.0**: oltre la ricerca, comandi diretti (tema chiaro/scuro, avvio presentazione).
- **Tour demo guidato** in 9 passi: la piattaforma si presenta da sola (scheda non modale, naviga tra le pagine).
- **Treemap squarified** della spesa per missione nel bilancio, con elenco testuale alternativo.
- Roadmap riscritta come documento professionale: visione, obiettivi OB-1…OB-5, tag di livello su ogni idea, 18 proposte nuove, regole di prodotto n. 8 (design) e n. 9 (sponsor); pianificata «Vetrina aziende & sponsorizzazioni» (O5).

### Modificato
- Tema scuro rifinito: `color-scheme`, bagliori d'angolo più intensi di sera (`--glow-alpha`).
- Titoli di pagina (SectionHeader), statistiche (Stat) e hero del bilancio in Fraunces.

### Verificato
- `tsc` pulito · eslint 0 problemi · Vitest 47/47 · Playwright 5/5 · `next build` ok.

## [0.6.0] — 2026-06-11 · Ondata 2 «Semplicità & profilo civico»

### Aggiunto
- **Ricerca globale Ctrl/Cmd+K** (combobox accessibile) su segnalazioni, proposte, opere, eventi, sondaggi e quartieri.
- Home **"La mia città"** ridisegnata a percorsi guidati ("Cosa vuoi fare?").
- **Preferenze civiche**: 12 temi, feed personalizzato "Per te" con motivazione visibile.
- **Civic ID Card** e "Il mio impatto civico" nel profilo.
- **Modalità semplice** (cookie server-side, font 115 %, home a 4 azioni).
- **Wizard proposte** in 5 passi + gruppi di cittadini beneficiari.
- **Valutazione sintetica** delle proposte da parte dello staff (impatto, costo, tempi, fattibilità).

### Modificato
- Migrazione `ondata2_semplicita_profilo`; seed arricchito; fix `db:reset` (Prisma 7).

## [0.5.1] — 2026-06-11 · Review accessibilità & UX

### Corretto
- 8 finding: live region per ActionError e toast, skeleton accessibili, focus sugli error boundary, numeri in formato it-IT, `aria-disabled`, RingGauge.

## [0.5.0] — 2026-06-11 · Fase 1 «Abilitatori»

### Aggiunto
- Rate-limit pronto per Upstash Redis (multi-istanza).
- Cache a tag con `cachedShared()` (revive delle date, mai dati per-utente).
- Schema **provenance** (fonte + freschezza) + componente SourceBadge.
- 5 test E2E Playwright (auth, segnalazioni, voto).
- Predisposto switch Postgres/Neon (non eseguito); mailer rinviato.

## [0.4.0] — 2026-06-11 · Fase 0 «Hardening»

### Aggiunto
- CSP con nonce per-request + `strict-dynamic`; validazione Zod delle env; rate-limit su tutte le write action; `DEMO_MODE` con badge; pagine error/loading/not-found; 32 test Vitest; CI GitHub Actions con drift-check migrazioni; `pistoia.config.ts`.

## [0.3.0] — 2026-06-10 · Community v2

### Aggiunto
- Mappa Leaflet multilivello; foto e geolocalizzazione sulle segnalazioni; dettaglio opere ricco; calendario eventi; moderazione avanzata; privacy completa; feedback sulle risposte; follow esteso; pagine quartiere.

## [0.2.0] — 2026-06-09 · Community MVP

### Aggiunto
- Profili verificati (coda admin), badge e ruoli (cittadino/moderatore/staff/admin); quartieri; **segnalazioni** con storico stati e "Anche io"; **proposte civiche** con soglie 50/200/500; follow generico; audit log moderazione; home "La mia città"; feed Comunità.

## [0.1.1] — 2026-06-08 · Security review

### Corretto
- 18 finding: rate-limit per-account, guard `SESSION_SECRET`, anti open-redirect, contrasto WCAG AA, percentuali sondaggi, hydration, ARIA.

## [0.1.0] — 2026-06-08 · v1 «Piattaforma base»

### Aggiunto
- Prototipo end-to-end: Next.js 16 (App Router) + TypeScript + Tailwind 4 + Prisma 7/SQLite; auth Argon2id con sessioni DB; sezioni Bilancio, Opere, Sondaggi, Comunità, Organigramma; profilo, impostazioni, notifiche; Area Comune (admin); design mobile-first nei colori di Pistoia; tutto su **dati mock dichiarati**.
