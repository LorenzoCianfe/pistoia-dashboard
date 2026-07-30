# FEATURES.md — funzionalità implementate

> Documento **vivo**: si aggiorna a ogni funzionalità aggiunta, non a fine
> ondata. Se una funzionalità esiste nel codice e non è qui, il documento è in
> debito.
>
> Legenda: ✅ completa · 🚧 in corso · 🔒 richiede verifica · 👤 richiede login
>
> Aggiornato: 2026-07-25 (ondata 7)

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
| **Organigramma** | `/organigramma` | ✅ | Sindaco e giunta ad albero, follow degli assessori |

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
| **Pagella mensile** | `/pagella` | 🚧 | Impalcatura della prima pagina di giudizio dell'osservatorio civico (Fase C). Porta la **dichiarazione di chi pubblica**; **nessun voto è calcolato** |

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
| `/organigramma` | Le righe sono vere ma **nessun numero regge**: le aree di delega coincidono col numero di schede (tautologico), i contattabili sono 1 su 7 perché nel seed solo il sindaco ha un'email — a 88px si leggerebbe «il Comune non si fa contattare», una conclusione tratta da un dato mancante — e follower e preferenze sono numeri su una persona sola. Apre invece sull'indice delle deleghe |
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
| Grafo di conoscenza del codice | ✅ `graphify-out/` |

---

## 7. Non ancora fatto

| Elemento | Perché |
|---|---|
| ~~Architettura dell'informazione delle 30+ rotte~~ | ✅ **Fatto** — Fase A, 2026-07-26: 25 voci → 5 destinazioni, identiche su desktop e telefono. Vedi `docs/audit-consolidamento.md` |
| Primitive sui *componenti* Astryx | **Valutato e scartato con motivo** (vedi `ROADMAP.md` ondata 5): `TextInput` è controllato per contratto, `Button` non offre un gancio per i link, `Banner` è troppo pesante inline, `ProgressBar` perde lo stagger. Astryx resta la sorgente dei token |
| ~~26 rotte non ancora ridisegnate~~ | ✅ **Fase B chiusa** — 2026-07-29, in tre scaglioni: i tre hub, poi `UTILITY_NAV`, poi tutto il resto. Restano fuori solo `/mappa` (è una vista, non una composizione), `/digest` (già composto) e `/admin` (console di lavoro, riscritta dalla C-1) |
| I voti della pagella | Servono la metodologia versionata (`/metodologia`, ancora da scrivere) e i dati reali. Il posto del voto resta vuoto e dichiara perché: un voto calcolato su dati dimostrativi non è una pagella, è una messa in scena |
| `/metodologia` | Definizione, fonte, peso e soglia di ogni indicatore, versionati e con registro delle modifiche. Ogni pagella va timbrata con la versione che l'ha calcolata, o una pagella vecchia diventa incontestabile |
| Terzo stadio del sankey (entrate per fonte) | Il modello dati non ha la scomposizione: servirebbe un `BudgetRevenue`, o l'ETL della Fase 2. Il sankey si ferma a due stadi invece di inventare |
| Dichiarazione di accessibilità | Dovuta per legge a un ente pubblico italiano, ma il contenuto dipende da un audit vero: pubblicarla non verificata sarebbe peggio che non averla |
| Test automatici di accessibilità | `axe-core` negli E2E resta da impostare. I contrasti dell'ondata 6 sono misurati a mano |
| Verifica con screen reader | NVDA non è mai stato provato: il codice è scritto a specifica |
| Dati reali da fonti aperte | In pausa: vedi `ROADMAP.md` §8 |
| Identità reale (SPID/CIE) | Fuori portata dichiarata: `SECURITY.md` §8 |
