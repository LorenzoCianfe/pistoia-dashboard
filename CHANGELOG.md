# Changelog — Dashboard di Pistoia

> Tutte le modifiche rilevanti del progetto, in ordine cronologico inverso.
> Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/); le versioni seguono
> [SemVer](https://semver.org/lang/it/) in fase 0.x (demo mock, nessuna API pubblica stabile).
> Il dettaglio tecnico di ogni voce è in [DOCUMENTATION.md §10](DOCUMENTATION.md); il piano è in [ROADMAP.md](ROADMAP.md).

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
