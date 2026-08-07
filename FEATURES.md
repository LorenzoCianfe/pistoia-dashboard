# FEATURES.md — funzionalità implementate

> Documento **vivo**: si aggiorna a ogni funzionalità aggiunta, non a fine
> ondata. Se una funzionalità esiste nel codice e non è qui, il documento è in
> debito.
>
> Legenda: ✅ completa · 🚧 in corso · 🔒 richiede verifica · 👤 richiede login ·
> 🔗 **dati reali, ogni riga con la propria fonte** (non dimostrativi)
>
> Aggiornato: 2026-08-07 (Fase C · cancello dei 44px)

---

## 0. Navigazione (Fase A — consolidamento, 2026-07-26)

Cinque destinazioni, **le stesse su desktop e su telefono**, perché cinque sono
gli slot di una barra di navigazione mobile. Ogni sezione resta una pagina
propria al suo indirizzo: è cambiato da dove ci si arriva, non cosa c'è.

| Destinazione | Rotta | Contiene |
|---|---|---|
| **La mia città** | `/la-mia-citta` | Home personalizzata |
| **Partecipa** | `/partecipa` | segnalazioni · proposte · sondaggi · priorità · question time · volontariato · patti · progetti |
| **Trasparenza** | `/trasparenza` | bilancio · opere · decisioni · promesse · report del mese |
| **Territorio** | `/territorio` | mappa · quartieri · eventi |
| **Comunità** | `/comunita` | stanze tematiche |

Fuori dal menu, con casa dichiarata: avvisi (banner in home + footer),
organigramma, FAQ e glossario nel footer; notifiche, profilo e impostazioni
nella barra in alto; area Comune nel menu avatar per i soli ADMIN.

**`/pagella` sta sotto Trasparenza, e la porta si apre da sé** (2026-08-06):
la voce compare quando `EDIZIONI` smette di essere vuoto — finché lo è, un menu
manderebbe un cittadino su una pagina che dichiara di non avere ancora niente da
dire, e il giorno della prima edizione nessuno deve ricordarsene.

**Il footer** (ridisegnato il 2026-08-05) è una **scheda di vetro** appoggiata
sulla tela, non un'area sotto una linea. Due colonne col titolo **visibile**:
«La città» (avvisi, organigramma, FAQ, glossario) e «Il progetto» (metodologia,
privacy, cookie, regole community) — la divisione non è di comodo, è che la
seconda è tutta a lettura pubblica e la prima chiede un account. **A chi non ha
una sessione** una pastiglia in fondo lo dice una volta sola, invece di offrire
quattro porte che si chiudono in faccia; chi è dentro non la incontra affatto.
Ogni voce è un bersaglio da **44px** (prima erano 16). Dal 2026-08-06 sta
**fuori da `<main>`**, quindi è un `contentinfo` saltabile da chi naviga a punti
di riferimento — prima non lo era su nessuna pagina.

**E i 44px valgono ovunque, non solo qui.** Dal 2026-08-07 un cancello li
misura a ogni esecuzione dei test, su undici pagine e a due larghezze di
schermo — così la regola non dipende più dal fatto che qualcuno se ne ricordi.
Nel metterla in regola si sono alzati i comandi dei moduli del Comune, i filtri
delle segnalazioni, il mostra-password, e le voci del **menu laterale**, che
adesso sono righe più alte e un po' più distanti: la colonna si allunga, e su
uno schermo basso può scorrere.

**La porta d'ingresso `/`** ha una riga sua con le pagine che si aprono davvero a
chiunque (valutazioni, metodologia, privacy, cookie, regole): non il footer
intero, perché quello porta anche le voci col lucchetto e la prima cosa che la
città dice a un visitatore non deve essere «per queste ti serve entrare».

## 1. Sezioni civiche

| Sezione | Rotta | Stato | Cosa fa |
|---|---|---|---|
| **La mia città** | `/la-mia-citta` | ✅ | Home personalizzata: saluto, quartiere, KPI "vicino a te", segnalazioni vicine, proposte in evidenza, banner avvisi attivi. "Stato della città" **a bento**: cifra display del tasso di risoluzione e superficie `MeshSurface` la cui tinta deriva da quello stesso dato. Redirect post-login |
| **Bilancio** | `/bilancio` | ✅ | Apertura a bento con la **cifra display** (142 mln) e i tre anelli; **sankey a due stadi** "dove scorrono i soldi" (entrate → spesa/avanzo → 6 missioni), preceduto dall'unica **sezione narrata** della piattaforma; andamento mensile, treemap e elenco come lettura alternativa, glossario contestuale |
| **Opere** | `/opere` · `/opere/[id]` | ✅ | **Cifra display** sull'investimento nei cantieri aperti e `MeshSurface` la cui tinta è la quota di cantieri che rispettano il calendario. **Cronoprogramma**: per ogni cantiere il lavoro fatto contro il tempo passato, col marcatore di dove i tempi previsti direbbero di essere. Dettaglio: stessa lettura in una riga, fonte di finanziamento, RUP, foto prima/durante/dopo, FAQ, commenti, mini-mappa, "Cosa cambia per me", "Spiegamelo semplice". **Transizione a elemento condiviso** lista → dettaglio |
| **Mappa** | `/mappa` | ✅ | Leaflet + tile OSM, layer attivabili (opere, segnalazioni, eventi, avvisi urgenti, uffici, scuole, verde, servizi) |
| **Segnalazioni** | `/segnalazioni` · `/[id]` | ✅ 👤 | Filtri + KPI, **timeline a punti** dell'andamento (altezza = arrivate, diametro = chiuse, colore = settimana in pari), foto reale, geolocalizzazione, **invio anonimo**, workflow di stato, "Anche io", timeline ufficiale, follow. **Transizione a elemento condiviso** lista → dettaglio |
| **Sondaggi** | `/sondaggi` | ✅ 👤🔒 | Voto ottimistico. Consultazioni ufficiali e voti territoriali riservati ai verificati |
| **Proposte** | `/proposte` · `/[id]` | ✅ 👤🔒 | Cifra display sui sostegni raccolti in tutto. Dettaglio: **scala a tacche** sull'intervallo reale 0→500 e i tre gradini 50/200/500 con cosa scatta a ciascuno. Sostegno riservato ai verificati, risposta ufficiale, "Perché non si può fare?" sulle respinte. **Transizione a elemento condiviso** |
| **Comunità** | `/comunita` | ✅ 👤 | Cifra display sulla quota di **domande con risposta ufficiale** (contata sulle sole domande). Stanze tematiche a griglia col numero di conversazioni. Composer con tipo post e quartiere, feed con badge autore, like/commenti ottimistici, risposte ufficiali con ufficio, "questa risposta è utile?", segnala commento |
| **Eventi** | `/eventi` | ✅ | Calendario mensile, pubblicazione dal Comune, proposta dalle associazioni verificate con approvazione |
| **Quartieri** | `/quartieri` · `/[slug]` | ✅ | Ogni scheda porta una fascia `MeshSurface` la cui tinta è il **tasso di risoluzione di quell'area** — lo slot dove una fotografia entrerà (`DISCOVERY` D7). Sotto il campione minimo la scheda resta neutra e lo dichiara. Il dettaglio aggrega segnalazioni, opere, eventi, proposte, discussioni; follow. **Transizione a elemento condiviso** |
| **Organigramma** | `/organigramma` | ✅ 🔗 | **Le nove persone reali della giunta**, ognuna con la scheda del Comune che la dichiara e la data in cui è stata aggiornata. Apre sull'indice delle **57 deleghe** in ordine alfabetico, ognuna col nome di chi la tiene, **con un filtro sopra** (2026-08-06) che cerca fra materie *e* nomi e annuncia l'esito in una live region — chi non scrive nulla vede l'indice intero. Recapiti letti dalle schede, mai dedotti. Nessun numero di preferenze: per cinque persone su nove non esiste in nessuna fonte (`docs/fonti-organigramma.md`). Follow degli assessori |

## 2. Trasparenza

| Sezione | Rotta | Stato | Cosa fa |
|---|---|---|---|
| **Decisioni** | `/decisioni` | ✅ | Archivio con esito e motivo in linguaggio semplice |
| **Promesse** | `/promesse` | ✅ | Tracker degli impegni per stato, origine, scadenza, nota di aggiornamento |
| **Avvisi urgenti** | `/avvisi` | ✅ | Severità, "cosa cambia per me" a punti, mini-mappa, archivio |
| **FAQ della città** | `/faq` | ✅ | Domande per tema, badge "Risposta ufficiale" |
| **Report del mese** | `/digest` | ✅ | Riepilogo 30 giorni calcolato dai dati + export PDF via print stylesheet |
| **Glossario** | `/glossario` | ✅ | Termini amministrativi in linguaggio semplice + tooltip `GlossaryTip` |
| **Question time** | `/question-time` | ✅ | Domande dei cittadini con risposta istituzionale |
| **Patti, priorità, progetti, iniziative, volontariato** | varie | ✅ | Partecipazione civica |
| **La pagella della giunta** *(già «Pagella mensile»)* | `/pagella` | 🚧 | La prima pagina di giudizio dell'osservatorio (Fase C), nella **forma composta da Lorenzo il 2026-08-05** (piano in [`docs/piano-pagella.md`](docs/piano-pagella.md)): **sei materie a due regimi** — voto 1–10 **ricontabile** (1 + 9 × la quota dei controlli superati, ogni controllo con un traguardo fissato da una norma) solo su Trasparenza e Spesa; Promesse **a fatti** (le linee programmatiche, da censire); Sicurezza · Decoro · Ascolto dichiarano **che cosa le accenderebbe**. **Nessun voto d'insieme**, cadenza **trimestrale**, stelle dei cittadini **accostate e mai sommate** (riquadro «La voce dei cittadini», con la dichiarazione dei voti dimostrativi). Le regole sono il **capitolo 2 della metodologia** (regole 13–20, v1.1), pubblicate *prima* che il primo voto sia calcolato. **Nessun voto è calcolato**: la prima edizione nasce da una ricognizione reale dopo il **27/08/2026** (termine art. 14) — il seed non semina pagelle, e un test lo fa da guardiano. Porta la **dichiarazione di chi pubblica** e il timbro da colophon |
| **Valutazioni dei servizi** | `/valutazioni` · `/valutazioni/[servizio]` · `/metodologia` · `/v/[codice]` · `/v/conferma/[token]` · `/admin/codici-qr` | 🚧 | Stelle 1–5 e recensioni su **servizi allo sportello** e **condizioni della città**, in due tabelloni **mai fusi in una classifica sola**. Media **dal primo voto** — nessuna soglia (sciolta in R-6): la protezione è la composizione del campione, sempre accanto al numero — e risposta del Comune nella stessa scheda. Il giorno uno la scheda apre sul **dato duro da `Report`** con le stelle dichiarate vuote. **Da R-3 si vota**: dalle schede e dai QR (`/v/[codice]`, pubblica, una schermata), senza account e con email obbligatoria; il voto entra subito, la mail porta conferma e **«non sono stato io, rimuovi»** (in locale è un file in `.email/`, letto dall'E2E del cancello); i fogli QR si stampano da `/admin/codici-qr` (`uqr`); l'IP si azzera da solo dopo 180 giorni, dichiarato su `/privacy`. Dal 2026-08-03 il seed **dimostra la colonna dura**: mediane dei tempi di chiusura su tutte e cinque le condizioni (5 · 8 · 12 · 25 · 9 giorni); dal 2026-08-05 semina anche **il mese dimostrativo dichiarato** (piano §8.7) — 72 voti a distribuzioni fisse e persone inventate, la gradazione dei campioni da Pulizia (34 voti, 3,3, andamento 3,2 → 3,4 → 3,3) a Trasporti (zero: il bersaglio E2E dell'assenza), campagna e pop-up armati sugli account demo, il quadro del Comune su luglio. **Da R-4 il Comune risponde e la Redazione modera**: risposta al quadro e alla singola (annidata) con timbro della carica scattato alla scrittura, segnalazione del Comune senza segni pubblici finché la Redazione non decide, rimozione con motivo pubblico da `/redazione` (ruolo moderatore — **mai** account del Comune, ADMIN compreso: è il cancello della fase), registro documentale firmato «Redazione della Dashboard di Pistoia», Nota della Redazione con fonte obbligatoria. **Da R-5 i sei ingressi portano gente, con un contatore unico** (`Sollecitazione`, append-only; regole pure in `lib/sollecitazioni.ts` provate a date fisse — è il cancello della fase): invito contestuale nel ringraziamento di «è davvero risolta?» (A1, effimero, 7 categorie su 12), campagna mensile su card in home + notifica + email opt-in con disiscrizione via form su `/v/promemoria/[token]` (una sollecitazione sola), blocco «prima il dato» nel `/digest` (contenuto, non sollecitazione), pop-up laterale armato SOLO dai voti espressi (mai a tempo, mai all'arrivo; la X tace 180 giorni) che veste il rinnovo quando c'è. **E la lettura è pubblica** (decisione W1): panoramica e schede si aprono senza account nel gruppo `(pubblico)` — barra anonima con «Accedi», modulo degradato a invito con `?next` sull'ancora — mentre il voto web resta agli autenticati e il resto del muro non si muove (E2E lo prova). **Da R-6 la metodologia è pubblicata**: `/metodologia` (pubblica, forma C1) rende le **dodici regole** da `lib/metodologia.ts` — ogni numero interpolato dalle costanti di dominio, mai ricopiato: è il cancello della fase, provato costante per costante da `tests/unit/metodologia.test.ts` — con la regola nuova **«nessuna soglia minima»**, versione **v1.0**, registro delle modifiche append-only, e il timbro «metodologia v1.0» da colophon (B2) in calce a scheda, panoramica e digest; l'invito anonimo guadagna «Come funziona». Piano in [`docs/piano-rating-servizi.md`](docs/piano-rating-servizi.md) |
| **Il costo dell'amministrazione** | `/trasparenza/costo-amministrazione` | ✅ 🔗 | **La prima pagina su dati reali** (Fase C). Indennità di sindaco, giunta e presidente del consiglio calcolate dalla catena di legge, con l'atto primario dietro ogni cifra. Sta sotto lo stemma **senza** la dichiarazione di chi pubblica: non esprime un giudizio, rende leggibile ciò che il D.Lgs 33/2013 impone di pubblicare. Fonti in [`docs/fonti-costo-amministrazione.md`](docs/fonti-costo-amministrazione.md) |

**La dichiarazione di chi pubblica** (`components/osservatorio/chi-pubblica.tsx`,
approvata il 2026-07-30) è ciò che sostituisce il marchio separato dopo due
tentativi respinti: lo stemma del Comune resta, e l'equivoco di attribuzione si
scioglie dicendolo. Va in cima a ogni pagina che esprime un giudizio ed è **un
pezzo solo**, non due componibili:

- il **cartiglio** separa *chi scrive il giudizio* da *chi fornisce i numeri* —
  una frase sola direbbe metà del prerequisito — e chiude sul diritto di
  replica allo stesso corpo del giudizio;
- il **filo persistente** si aggancia sotto la barra in alto. La ragione è di
  durata, non di forma: la barra è `sticky`, quindi **lo stemma resta sullo
  schermo per tutta la lettura mentre una dichiarazione in cima sparisce al
  primo scorrimento**. Chi legge la terza materia vedrebbe solo lo stemma sopra
  un giudizio sulla giunta — cioè lo stato che la dichiarazione doveva
  correggere. Costa 64px, misurati a 360px in modalità semplice.

Esporre le due parti separatamente renderebbe possibile montarne metà, e la
metà che si dimentica è sempre il filo, perché il difetto che copre non si vede
finché non si scorre. Il viola è il marcatore della voce redazionale — l'unico
colore che `DESIGN.md` §4 assegna al lato cittadino — e vive su filo e pallino,
**mai su testo**: su superficie chiara fa ~3,3:1.

## 3. Utente

| Funzionalità | Stato | Note |
|---|---|---|
| Registrazione e accesso | ✅ | Argon2id, sessioni opache, rate-limit a tre livelli |
| Profilo | ✅ | Badge, stato verifica, richiesta verifica, statistiche, nome pubblico abbreviato |
| Notifiche | ✅ | Per tipo, segna-come-letta, badge nel TopBar |
| Impostazioni | ✅ | Preferenze notifiche, tema, cambio password, logout globale |
| Privacy e dati | ✅ | Consenso geo, **export JSON**, **cancellazione account** |
| Modalità semplice | ✅ | Scala tutto al 115%, target touch più ampi |
| Tema chiaro / scuro | ✅ | next-themes + `light-dark()` di Astryx |
| Ricerca globale | ✅ | Command palette (⌘K) |
| Tour dimostrativo | ✅ | Onboarding guidato |

## 4. Area Comune

| Funzionalità | Stato |
|---|---|
| Coda verifiche identità/associazione | ✅ |
| Triage segnalazioni e workflow di stato | ✅ |
| Revisione proposte e risposte ufficiali | ✅ |
| Broadcast e registro azioni (audit append-only) | ✅ |
| Moderazione: commenti segnalati, ban, sospensioni, parole bloccate | ✅ |
| Unione dei duplicati | ✅ |
| Approvazione eventi | ✅ |

---

## 5. Design system

> Ondata 5 — *Fondamenta Astryx & direzione ibrida* (2026-07-25)

| Elemento | Stato | Dove |
|---|---|---|
| **Tema Pistoia su Astryx** | ✅ | `src/themes/pistoia.ts` → 112 token, 6 override di componente |
| Build del tema per SSR | ✅ | `npm run theme:build` → `generated/pistoia.css` (2,2 KB gzip) |
| Tela grigio-calda + superfici squircle | ✅ | `--color-background-body` · `--radius-container` 32px |
| **Card a vetro in stile Apple** | ✅ | `backdrop-filter: blur(24px) saturate(180%)`, filo di luce interno, nessun alone. Contrasto misurato **16,8:1 / 16,0:1 → AAA** |
| Grana sulla tela come substrato del vetro | ✅ | `--canvas-grain-opacity: 0.045` — senza, il vetro non ha materia da sfocare |
| `browserslist` esplicito | ✅ | Chrome/Edge 123+, Firefox 120+, Safari 17.5+ — governa i prefissi di Lightning CSS |
| Tipografia Schibsted Grotesk + JetBrains Mono | ✅ | self-hosted via `next/font` |
| Accento teal + lime decorativo vincolato | ✅ | `--color-accent` · `--highlight` (solo sfondo) |
| Ponte di retrocompatibilità | ✅ | ~1050 utility storiche adottano i nuovi token senza toccare le rotte |
| Palette data-viz civica | ✅ | `--color-data-*` ritinti |
| Vetrina del design system | ✅ | `/design-system` (esclusa dall'indicizzazione) |
| Script di revisione visiva | ✅ | `npm run shots` — pagine chiave, temi chiaro e scuro |
| Bottoni come classi su token, condivise con i link | ✅ | `.btn` in `globals.css` · `Button` + `buttonClasses` |
| Rimosso ogni gradiente/alone residuo dai controlli | ✅ | bottone primario, barre di avanzamento, 3 bottoni fatti a mano |

### Componenti-firma

| Componente | Stato | Cosa fa |
|---|---|---|
| **`DisplayNumber`** | ✅ | Cifra display a scala estrema (88px/300 contro label 11px/600). Testo vero: selezionabile e accessibile senza equivalenti nascosti. Corredo opzionale: unità, scala a tacche, delta, sparkline |
| **`MeshSurface`** | ✅ | Gradiente mesh con grana; **la tinta codifica un dato** (`good`/`warn`/`bad`/`cool`) |
| **`DotScatterTimeline`** | ✅ | Attività nel tempo: posizione = valore, diametro = intensità, colore = stato. Attraversabile da tastiera, con tabella equivalente |
| **`ScrollTold` / `ScrollStep`** | ✅ | Sezione narrata dallo scroll su ScrollTimeline nativa; statica con `prefers-reduced-motion` |

Nessuno dei quattro introduce dipendenze: niente GSAP, niente WebGL.

### Il sistema sulle pagine

> Ondata 6 — *Il design system arriva sulle pagine* (2026-07-25)

| Elemento | Stato | Dove |
|---|---|---|
| **`SankeyFlow`** | ✅ | `charts/sankey-flow.tsx` — flusso a colonne sui token Pistoia, senza registry. Opacità come rampa sequenziale, tabella equivalente, attraversamento a frecce |
| Cifra display in uso | ✅ | Bilancio (spesa programmata) · La mia città (tasso di risoluzione) — una per schermata |
| `MeshSurface` con tinta che codifica un dato | ✅ | «Stato della città» (`toneFromPercent` del tasso di risoluzione) · pannello del login (tono `cool`, neutro) |
| `ScrollTold` in uso | ✅ | Bilancio, tre passaggi — l'unica sezione narrata della piattaforma |
| `DotScatterTimeline` in uso | ✅ | Segnalazioni: altezza = arrivate, diametro = chiuse, colore = settimana in pari |
| **Transizione a elemento condiviso** | ✅ | `segnalazioni/report-link.tsx` + `lib/view-transitions.ts` — View Transitions native, non `layoutId` (vedi `DESIGN.md` §7) |
| Inchiostro leggibile sopra il mesh | ✅ | `.mesh-surface` imposta `--highlight-ink`; contrasti misurati per tono in `DESIGN.md` §8 |
| Revisione visiva in modalità semplice | ✅ | `npm run shots -- --simple --width=360`, con misura del traboccamento orizzontale |

### La copertura oltre le pagine di punta

> Fase B, primo scaglione — *le rotte che gli hub mettono in vetrina* (2026-07-26)

| Rotta | Cifra display | Perché quella |
|---|---|---|
| `/promesse` | impegni **portati a termine** | La domanda di chi arriva è «di quello che avevate promesso, quanto avete fatto?». Conteggio e non percentuale: un tasso conterebbe come mancato anche un impegno assunto la settimana scorsa |
| `/decisioni` | decisioni **pubblicate con la loro motivazione** | Non il tasso di approvazione, che dice quanto l'amministrazione asseconda; questa pagina esiste per quanto rende conto. Le respinte stanno nella frase, non nascoste |
| `/question-time` | **risposte ufficiali** dagli assessorati | Contate su tutte le domande, con le sessioni ancora aperte dichiarate: le loro domande aspettano il termine, non sono senza risposta |
| `/priorita` | **interventi in votazione** adesso | Non i voti raccolti: `totalVotes` somma il `baseVotes` del seed, e un numero gonfiato a 88px è la cosa più grande e più falsa della pagina. Gli interventi sono righe vere |
| `/patti` | **patti di quartiere attivi** | Non l'avanzamento medio: un patto firmato il mese scorso sta al 10% perché è nuovo, non perché vada male — la stessa ragione per cui la mesh di Opere non prende l'avanzamento medio dei cantieri |
| `/volontariato` | **iniziative con le adesioni aperte** | Non i volontari: `joins` somma il `baseJoins` del seed. E chi arriva vuole sapere a cosa può aderire *adesso*, non quanti hanno aderito prima |
| `/progetti` | **progetti nati da segnalazioni ripetute** | È la tesi della pagina. Le segnalazioni dietro stanno nella frase e usano `reportCount`, lo stesso campo delle schede: sommare le righe vere darebbe un totale più basso di quello che il lettore vede sopra |
| `/eventi` | **eventi in arrivo o ancora in corso** | Eredita la definizione di `getPublishedEvents`, che separa sulla data di **fine** — un evento iniziato ieri e lungo tre giorni è ancora in corso — così coincide con la riga dell'hub `/territorio` |

> Fase B, secondo scaglione — *il punto d'ingresso, non più la vetrina* (2026-07-28)

Gli hub sono coperti, quindi la vetrina è esaurita. Il criterio che le succede è
lo stesso di prima portato avanti di un passo — **da dove ci si arriva** — ed è
verificabile in `nav-items.ts`: il banner in home, poi «Cosa vuoi fare?»
(protetto), poi l'elenco di servizio, poi il menu avatar. Prese tutte e quattro
insieme perché **chiudono `UTILITY_NAV` per intero**, che è la stessa proprietà
che rendeva difendibile il primo scaglione.

| Rotta | Cifra display | Perché quella |
|---|---|---|
| `/avvisi` | avvisi **in corso adesso** | È la domanda con cui si arriva: «mi riguarda qualcosa ora?». Righe vere di `Notice`, nessun `demoBaseline` e nessun `take` a monte. Un totale storico direbbe solo da quanto esiste la bacheca |
| `/faq` | **risposte ufficiali** del Comune | È la tesi della pagina — ogni risposta è del Comune, non un'ipotesi della community. Sui dati dimostrativi coincide col totale perché `official` ha default `true`, ma la definizione regge il giorno in cui una FAQ non lo sarà |

**Cinque esclusioni dichiarate**, per non far sembrare "dimenticate" delle scelte:

| Rotta | Perché niente cifra display |
|---|---|
| ~~`/sondaggi`~~ | **Esclusione ritirata (terzo scaglione).** Era scritta troppo larga: valeva per una cifra *sui voti*, che `getPolls` gonfia con `demoBaseline(baseVotes)`, non per qualunque cifra. I sondaggi **aperti** sono righe di `Poll` e non passano da nessun baseline — la stessa scelta già fatta su `/priorita`, dove si contano gli interventi in votazione e non i voti raccolti |
| `/mappa` | 41 righe di contenitore attorno a Leaflet. Non ha una composizione da portare: ha una vista |
| `/digest` | È già composto — griglia di `Stat`, testata di stampa, sezioni. Promuovere uno dei quattro numeri direbbe che quello è la notizia, e in un riepilogo mensile nessuno lo è |
| `/organigramma` | Le righe sono vere ma **nessun numero regge**: le aree di delega coincidono col numero di schede (tautologico), i contattabili sono 1 su 7 perché nel seed solo il sindaco ha un'email — a 88px si leggerebbe «il Comune non si fa contattare», una conclusione tratta da un dato mancante — e follower e preferenze sono numeri su una persona sola. Apre invece sull'indice delle deleghe. **Riscritta il 2026-08-03: due dei tre motivi sono decaduti, la conclusione no — vedi sotto** |
| `/glossario` | «13 termini spiegati» è vero e non è la ragione per cui qualcuno arriva qui: su un glossario si arriva con **una** parola in testa. Apre sull'indice dei termini, che è ciò che il contenuto dice nel suo insieme |

> Fase B, terzo scaglione — *tutto il resto* (2026-07-29)

Il criterio del punto d'ingresso era esaurito e non ne serve un quarto: si
finiscono. **La Fase B è chiusa** — restano solo `/mappa`, `/digest` e `/admin`,
esclusi con motivo.

| Rotta | Cifra display | Perché quella |
|---|---|---|
| `/sondaggi` | **sondaggi aperti adesso** | Chi arriva vuole sapere a cosa può rispondere ora, non quanta gente ha già risposto. `active` e `userOptionId` sono righe vere; i voti no, e restano fuori |

| Rotta | Composizione senza cifra | Perché |
|---|---|---|
| `/impostazioni` | indice delle sei sezioni | Sei riquadri di peso identico erano quattro schermate di scorrimento su telefono, e chi arriva sa *cosa* cerca ma non dove sia. Due si chiamavano «Cambia password» e «Sicurezza dell'account»: ora sono «Password» (l'azione) e «Accesso e dispositivi» (lo stato) |
| `/notifiche` | nessuna, già composta | «5 non lette» sta già nell'intestazione della lista, accanto al pulsante che le azzera: a 88px si staccherebbe dall'azione. E non è un elenco in cui si cerca una voce, è un flusso — ha già filtri per tema e raggruppamento temporale |
| `/profilo` | nessuna, già composta | La carta civica porta già i numeri di quella persona. Promuoverne uno a 88px trasformerebbe una scheda personale in una classifica |
| `/comunita/stanze/[topic]` | nessuna, già composta | Ritorno alle stanze, testata col tema, composer, stato vuoto: non aveva il difetto |
| `/privacy` · `/cookie` · `/note-comunita` | data di entrata in vigore | Un'informativa senza data non si può leggere: chi la consulta non sa se vale ancora, e chi contesta un trattamento non sa quale testo fosse in vigore quel giorno |

**`/admin` è fuori dalla Fase B**, e non per dimenticanza: è dietro
`requireAdmin()` quindi la raggiungibilità non la ordina, la Fase C-1 la
riscrive per intero («Dashboard admin con analytics operative»), e `DESIGN.md`
§6 la nomina come l'unico posto dove la densità *aumenta*. I suoi quattro
contatori sono già veri — `openReportsCount` viene da un `findMany` senza
`take`, quindi non è la trappola dell'ondata 7 — ma su una console di lavoro
nessuno dei quattro è *la* notizia. È l'argomento che ha escluso `/digest`.

**Nessuna delle tre porta la scala a tacche**, e la regola che ne è uscita vale
per la Fase C: l'intervallo 0→totale è aritmeticamente vero ma **non è un
traguardo** — nessuno ha promesso che tutti gli impegni fossero chiusi oggi, né
che ogni domanda ricevesse risposta. Una tacca a un sesto della scala si legge
come «non avete fatto quasi niente», che è una conclusione, non il dato.
La regola del campione minimo (`lib/citystats.ts`) resta e si generalizza in
`campioneSufficiente()`: sotto soglia la pagina **dichiara** che il conteggio
non regge una lettura d'insieme.

> Fase C — `/organigramma` sui dati veri (2026-08-03)

La pagina mostrava una giunta inventata (Marco Ferrari sindaco) mentre
`/trasparenza/costo-amministrazione`, a un clic di distanza, dava i nomi veri.
Ora legge le nove persone reali da `src/lib/giunta.ts`, dove ognuna porta la
propria fonte e il renderer scarta chi non ce l'ha.

**Due dei tre motivi dell'esclusione dalla cifra display sono decaduti, e la
conclusione regge lo stesso** — vale la pena scriverlo perché è il caso in cui
un argomento va riverificato invece che ereditato:

| Motivo del 2026-07-28 | Oggi |
|---|---|
| «preferenze e follower sono numeri su una persona sola» | Le **preferenze non esistono più**: `votesElected` è stato rimosso dal modello, perché per cinque persone su nove il numero non esiste in nessuna fonte (`docs/fonti-organigramma.md` §2) |
| «i contattabili sono 1 su 7, nel seed solo il sindaco ha un'email» | **Non è più vero**: le nove schede del Comune pubblicano tutte un recapito, quindi sono 9 su 9. Il difetto che la riga denunciava è rientrato da sé |
| «le aree di delega coincidono col numero di schede» | **Resta, e ora copre anche il secondo**: «9 su 9» e «8 assessori» sono due modi di contare le schede che il lettore ha già davanti. Tautologico |

Cambia invece **l'indice**, che era già l'apertura: da otto etichette (una per
persona) alle **57 deleghe vere**, in ordine alfabetico, ognuna col nome di chi
la tiene. Chi cerca «Toponomastica» la trova senza aprire otto schede — che è
letteralmente la domanda con cui si arriva su un organigramma.

Due conseguenze fuori pagina, entrambe della stessa famiglia («un dato inventato
su una persona reale non è un dato dimostrativo»):

- **`/sondaggi` perde la scheda «Assessore di riferimento»** e il seed non
  collega più `Poll` a `Assessore`. Diceva «Eletta con N preferenze» e reggeva
  finché la persona era inventata; sulla giunta vera diventava due affermazioni
  false — una consultazione che quella persona non ha mai aperto, e un numero
  che non esiste.
- **Il «Segui» resta ma esce di vetrina** (decisione di Lorenzo): bottone e
  conteggio dove sono, ma la descrizione della pagina non promette più «quante
  persone segue ciascun assessore». Su nove politici in carica una metrica
  social in testa alla pagina orienta la lettura verso una classifica di
  popolarità, che non è ciò che la pagina misura.

---

## 6. Piattaforma

| Elemento | Stato |
|---|---|
| CSP con nonce per-request | ✅ |
| Header di sicurezza statici | ✅ |
| Rate-limit su tutte le write action | ✅ |
| Store rate-limit intercambiabile (memoria / Upstash) | ✅ |
| Validazione env fail-fast al boot | ✅ |
| Cache a tag per letture condivise | ✅ |
| `DEMO_MODE` con zero-state onesti | ✅ |
| Provenienza dati dichiarata (`SourceBadge`) | ✅ |
| Test unitari (Vitest) + E2E (Playwright) | ✅ |
| **Cancello di accessibilità automatico** (axe-core negli E2E, **11 pagine × 2 temi**, regole WCAG **AA + 2.2**, nessuna esclusione) | ✅ 2026-08-05, esteso il 2026-08-06 — ha trovato un **debito di tavolozza preesistente** alla nascita, e altri **due difetti seri** quando `/admin/*` e `/redazione` vi sono entrate: `ROADMAP.md`, traccia «Qualità continua» |
| **Lighthouse CI** sulla build di produzione | 🚧 impostato il 2026-08-05 — **misura, non giudica**: le soglie si scrivono dopo le prime passate |
| **Audit dipendenze in CI** (`npm audit`) | ✅ 2026-08-05 — e `npm audit` riporta **zero vulnerabilità** (erano 12) |
| Grafo di conoscenza del codice | ✅ `graphify-out/` |

---

## 7. Non ancora fatto

| Elemento | Perché |
|---|---|
| ~~Architettura dell'informazione delle 30+ rotte~~ | ✅ **Fatto** — Fase A, 2026-07-26: 25 voci → 5 destinazioni, identiche su desktop e telefono. Vedi `docs/audit-consolidamento.md` |
| Primitive sui *componenti* Astryx | **Valutato e scartato con motivo** (vedi `ROADMAP.md` ondata 5): `TextInput` è controllato per contratto, `Button` non offre un gancio per i link, `Banner` è troppo pesante inline, `ProgressBar` perde lo stagger. Astryx resta la sorgente dei token |
| ~~26 rotte non ancora ridisegnate~~ | ✅ **Fase B chiusa** — 2026-07-29, in tre scaglioni: i tre hub, poi `UTILITY_NAV`, poi tutto il resto. Restano fuori solo `/mappa` (è una vista, non una composizione), `/digest` (già composto) e `/admin` (console di lavoro, riscritta dalla C-1) |
| I voti della pagella | ~~Serve la metodologia versionata~~ → ✅ **pubblicata il 2026-08-05** (capitolo 2 della v1.1, PRIMA del primo voto, come promesso in pagina). Restano i **dati reali**: la prima edizione nasce dalla prima ricognizione, dopo il termine dell'art. 14 (27/08/2026). Un voto su dati dimostrativi resta una messa in scena — `EDIZIONI` è vuoto e un test lo fa da guardiano |
| ~~`/metodologia` per la pagella~~ | ✅ **Fatto** — v1.1 del 2026-08-05: capitolo 2 (regole 13–20) con definizione, traguardo normativo e formula di ogni indicatore, registro append-only, timbro su ogni pagina che calcola. Il primo voto nascerà già timbrato (`EdizionePagella.versioneMetodologia`) |
| Terzo stadio del sankey (entrate per fonte) | Il modello dati non ha la scomposizione: servirebbe un `BudgetRevenue`, o l'ETL della Fase 2. Il sankey si ferma a due stadi invece di inventare |
| Dichiarazione di accessibilità | Dovuta per legge a un ente pubblico italiano, ma il contenuto dipende da un audit vero: pubblicarla non verificata sarebbe peggio che non averla. **Dal 2026-08-05 il terreno è più solido**: un cancello automatico (axe, WCAG AA, otto pagine nei due temi) gira a ogni esecuzione degli E2E, e il debito che ha trovato è stato chiuso. Resta che axe copre ~30–40% delle barriere reali: la parte da tastiera, da lettore di schermo e da persona vera non la misura nessuna macchina |
| Test automatici di accessibilità | `axe-core` negli E2E resta da impostare. I contrasti dell'ondata 6 sono misurati a mano |
| Verifica con screen reader | NVDA non è mai stato provato: il codice è scritto a specifica |
| Dati reali da fonti aperte | In pausa: vedi `ROADMAP.md` §8 |
| Identità reale (SPID/CIE) | Fuori portata dichiarata: `SECURITY.md` §8 |
