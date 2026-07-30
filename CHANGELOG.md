# Changelog — Dashboard di Pistoia

> Tutte le modifiche rilevanti del progetto, in ordine cronologico inverso.
> Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/); le versioni seguono
> [SemVer](https://semver.org/lang/it/) in fase 0.x (demo mock, nessuna API pubblica stabile).
> Il dettaglio tecnico di ogni voce è in [DOCUMENTATION.md §10](DOCUMENTATION.md); il piano è in [ROADMAP.md](ROADMAP.md).

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
