# Roadmap — Dashboard di Pistoia

> Documento strategico e operativo del progetto: visione, obiettivi, piano a ondate e catalogo completo delle idee.
> **Ultimo aggiornamento:** 2026-07-29 — **Fase A e Fase B chiuse**, il consolidamento è finito e la **Fase C è sbloccata**. Il piano delle due fasi è in [`docs/roadmap-consolidamento.md`](docs/roadmap-consolidamento.md); il dettaglio tecnico di quanto già costruito è in [DOCUMENTATION.md](DOCUMENTATION.md).

---

## 0. Come leggere questo documento

**Struttura.** La [§1 Visione](#1-visione) dice *perché* il progetto esiste e cosa vuole diventare; la [§2 Obiettivi](#2-obiettivi) traduce la visione in risultati verificabili; la [§4 Piano](#4-piano-operativo-a-ondate) dice *cosa si fa e in che ordine*; la [§6 Catalogo](#6-catalogo-delle-idee-per-tema) è l'inventario completo e deduplicato di ogni idea, pianificata o no. Le idee nuove di questa revisione sono raccolte in [§5](#5-nuove-proposte--revisione-2026-06-11) e marcate 🆕 ovunque.

**Fonti delle idee:** proposal iniziale · [Addendum 1 — ulteriori proposte](pistoia-community-addendum-ulteriori-proposte.md) (rif. `A1 §n`) · [Addendum 2 — funzioni evolutive](pistoia-community-addendum-2-funzioni-evolutive.md) (rif. `A2 §n`) · sessioni di ideazione interne (rif. data).

**Legenda stato**

| Simbolo | Significato |
|---|---|
| ✅ | Completato e verificato |
| 🔜 `O0…O5` | Pianificato nell'ondata indicata |
| 📋 | Backlog: utile, non ancora assegnato a un'ondata |
| 💡 | Futuro / sperimentale |
| 🧊 | In pausa: dipende da mailer, Postgres, dati reali o LLM |
| 🆕 | Nuova proposta della revisione 2026-06-11 |

**Legenda livello** — ogni idea dichiara su quali strati del prodotto incide:

| Tag | Area |
|---|---|
| `FE` | Front-end: componenti, pagine, interazioni |
| `DES` | Design visivo: estetica, identità, data-viz |
| `UX` | Esperienza d'uso: flussi, semplicità, information architecture |
| `BE` | Back-end: modello dati, server action, query, seed |
| `ENG` | Engineering: test, tooling, performance, CI, qualità del codice |
| `SEC` | Sicurezza |
| `A11Y` | Accessibilità e inclusione |
| `AI` | Richiede un LLM (resta 💡 finché il progetto è mock/locale) |

**Indice:** [1. Visione](#1-visione) · [2. Obiettivi](#2-obiettivi) · [3. Completato](#3-completato) · [4. Piano a ondate](#4-piano-operativo-a-ondate) · [5. Nuove proposte](#5-nuove-proposte--revisione-2026-06-11) · [6. Catalogo idee](#6-catalogo-delle-idee-per-tema) · [7. Regole di prodotto](#7-regole-di-prodotto) · [8. Dati reali (pausa)](#8--in-pausa--dati-reali-ex-fase-2) · [9. Fiducia istituzionale (pausa)](#9--in-pausa--fiducia-istituzionale-ex-fase-4) · [10. Rischi](#10-rischi)

---

## 1. Visione

**Dashboard di Pistoia è il sistema operativo civico della città: un unico luogo dove il cittadino capisce cosa succede, segnala, propone, partecipa — e vede che cosa la sua partecipazione produce.**

Non una vetrina istituzionale, non un social network locale: una piattaforma operativa che chiude il cerchio tra ascolto e azione, con un design distintivo e una semplicità d'uso radicale.

### Cosa è / cosa non è

| È | Non è |
|---|---|
| Uno strumento concreto: segnalare, proporre, capire il bilancio, seguire le opere | Un feed social con like e classifiche |
| Trasparenza bidirezionale: il Comune risponde, motiva, rendiconta | Una bacheca a senso unico |
| Un prodotto curato: design intenzionale, gerarchia visiva, motion sobrio | Un template generico o estetica "AI slop" |
| Una demo credibile con dati mock dichiarati | Un sistema con dati finti spacciati per veri |
| Semplice per chiunque: anziani, nuovi residenti, utenti esperti | Un portale burocratico che richiede istruzioni |

### Le tre direttrici

Ogni ondata di lavoro fa progredire tutte e tre, mai una sola:

| Direttrice | Significato |
|---|---|
| **Funzionalità** | Implementare le migliori idee dei due addenda: la piattaforma deve fare tante cose utili |
| **Semplicità** | Tantissime funzioni ma uso semplicissimo: percorsi guidati, progressive disclosure, zero frizione |
| **Estetica** | Design moderno, distintivo e coerente: ogni ondata rifinisce graficamente le pagine che tocca |

### Decisione strategica (2026-06-11)

Il progetto **resta una demo con dati mock**: nessuna importazione di dati reali, vive in locale e su GitHub. Il passaggio ai dati pubblici reali è **in pausa, non cancellato**: la ricerca su fonti e ETL è conservata in [§8](#8--in-pausa--dati-reali-ex-fase-2) e l'infrastruttura già costruita (provenance, `DATA_MODE`, `DEMO_MODE`, cache a tag) rende la ripresa possibile in qualsiasi momento senza rifare nulla. Conseguenza operativa: **tutto ciò che è pianificato nelle ondate deve essere realizzabile al 100 % in mock.**

---

## 2. Obiettivi

Gli obiettivi traducono la visione in risultati verificabili. Ogni ondata del piano serve almeno un obiettivo.

| # | Obiettivo | Cosa significa in pratica | Come si verifica |
|---|---|---|---|
| **OB-1** | **Il ciclo civico si chiude** | Una segnalazione si segue dalla creazione alla conferma del cittadino; una proposta dalla bozza alla decisione motivata del Comune | Percorribile end-to-end in demo senza punti morti (ondate O1, O3) |
| **OB-2** | **Design distintivo e coerente** | Identità visiva propria (token, componenti, motion, illustrazioni): ogni pagina sembra disegnata dalla stessa mano | Design system documentato; nessuna pagina "non ancora rifinita"; tema scuro completo (O0) |
| **OB-3** | **Semplicità radicale** | Le azioni base (segnalare, proporre, informarsi) richiedono il minimo di passi; tutto il resto è progressive disclosure | Regola di prodotto n. 5 rispettata su ogni nuova feature; modalità semplice sempre alla pari |
| **OB-4** | **La demo si racconta da sola** | Chiunque apra il progetto capisce cosa fa e perché è ben fatto, senza guida esterna | Tour demo guidato + dati mock "vivi" e credibili (O0, O1) |
| **OB-5** | **Qualità ingegneristica continua** | Test, accessibilità, performance e sicurezza non degradano mai mentre il prodotto cresce | CI verde con a11y automatica, Lighthouse budget, audit dipendenze; review periodiche |

---

## 3. Completato

| Fase | Data | Descrizione |
|---|---|---|
| **v1 — Piattaforma base** | 2026-06-08 | Prototipo end-to-end: Next.js 16, auth Argon2id, Bilancio/Opere/Sondaggi/Organigramma/Profilo/Notifiche/Impostazioni, Area Comune admin, design mobile-first Pistoia |
| **Security review** | 2026-06-08 | 18 finding corretti: rate-limit per-account, guard SESSION_SECRET, anti open-redirect, WCAG AA, percentuali sondaggi, hydration, ARIA |
| **Community MVP** | 2026-06-09 | Profili verificati, badge/ruoli, segnalazioni con storico stati, proposte civiche, home "La mia città", feed Comunità, gating verificati, audit log |
| **Community v2** | 2026-06-10 | Mappa Leaflet multilivello, foto + geolocalizzazione, dettaglio opere ricco, calendario eventi, moderazione avanzata, privacy completa, feedback risposte, follow esteso, pagine quartiere |
| **Fase 0 — Hardening** | 2026-06-11 | CSP+nonce, validazione Zod env, rate-limit su write action, DEMO_MODE, error/loading/not-found, Vitest 32 test, CI GitHub Actions, aria grafici, `pistoia.config.ts` |
| **Fase 1 — Abilitatori** | 2026-06-11 | Rate-limit Upstash-ready, cache a tag `cachedShared()`, schema provenance + SourceBadge, 5 E2E Playwright; Postgres predisposto (non eseguito); mailer rinviato |
| **Review a11y/UX** | 2026-06-11 | 8 finding corretti: ActionError live-region, skeleton accessibili, focus sui boundary, numeri it-IT, aria-disabled, toast live region, RingGauge |
| **Ondata 2 — Semplicità & profilo** | 2026-06-11 | Ricerca globale Ctrl+K, home a percorsi guidati, preferenze civiche + feed "Per te", Civic ID Card + impatto civico, modalità semplice, wizard proposte, valutazione sintetica del Comune |
| **Ondata 0 — Fondamenta visive & design system** | 2026-06-12 | [DESIGN.md](DESIGN.md) (direzione estetica istituzionale), token estesi (font display Fraunces, easing civico, color-scheme, glow serali), motivi identitari CSS (fasce romaniche, scacchiera), motion system (View Transitions + stagger + pulse civico), EmptyState illustrato, centro notifiche 2.0 (filtri, bucket temporali, azione inline), command palette 2.0 (comandi: tema, tour), treemap squarified del bilancio, tour demo guidato in 9 passi |
| **Ondata 1 — Segnalazioni 2.0** | 2026-06-12 | Timeline pubblica, conferma del cittadino con riapertura, foto prima/durante/dopo (upload staff dal triage), ufficio competente + tempi medi per categoria, urgenza con validazione moderatore, anti-duplicati con "Anche io" inline, "Segnala in 30 secondi" mobile-first, mock "vivo" (seed deterministico giornaliero). Schema: `urgency`, `resolutionFeedback`, `ReportPhoto` |
| **Ondata 3 — Trasparenza che chiude il cerchio** | 2026-06-12 | Archivio decisioni con motivo in linguaggio semplice, "Perché non si può fare?" sulle proposte respinte, tracker "Promesse e risultati", bacheca avvisi urgenti (+ layer mappa e banner in home) con "Cosa cambia per me?", impatto cantieri sul dettaglio opera, FAQ della città con badge risposta ufficiale, report civico mensile con export PDF (print stylesheet), "Spiegamelo semplice" redazionale, glossario + tooltip nel bilancio, hero "Stato della città" con sparkline in home, sezione Trasparenza in nav/ricerca/palette/tour. Schema: `Decision`, `Commitment`, `Notice`, `CityFaq`, `Opera.impactNotes/simpleText`, `Proposal.rejectionReasons` |
| **Ondata 4 — Territorio & partecipazione** | 2026-06-13 | Question time digitale con domande votate e risposta ufficiale, "Vota la priorità" (verificati, un voto per tornata) con esito raccontato, volontariato e iniziative con adesione, patti digitali di quartiere + "adotta un luogo", "da segnalazione a progetto" con cluster e radar dei problemi ricorrenti, stanze tematiche nella community, diario del quartiere (7 giorni computati), mappa del disagio (heatmap), consultazioni con documento + sintesi semplice. **Onboarding "primi passi in città"** (checklist progressiva) + tour demo persistito con invito ai nuovi account. **Tipografia a voce unica Montserrat**. Sezione Partecipazione in nav/ricerca/palette/tour. Schema: `QuestionTime`/`QtQuestion`/`QtVote`, `PriorityRound`/`PriorityItem`/`PriorityVote`, `Initiative`/`InitiativeJoin`, `AdoptedPlace`, `NeighborhoodPact`/`PactUpdate`, `CivicProject`, `CommunityPost.topic`, `Poll.doc*`, `User.tourCompletedAt/onboardingDismissedAt`, `Report.civicProjectId` |

> Già coperte dagli addenda e **fatte**: sistema fonti con freschezza (`A1 §25` → provenance + SourceBadge), modalità demo/ufficiale (`A1 §26` → DEMO_MODE), partecipazione aggregata senza esporre dati personali (`A1 §10` → contatori aggregati, ora regola di prodotto in [§7](#7-regole-di-prodotto)).

---

## 4. Piano operativo a ondate

> Ondate tematiche chiuse, tutte realizzabili in mock. Ogni ondata è un blocco coerente di funzioni **+ restyling delle pagine toccate**. Il dettaglio di ogni voce è nel [catalogo §6](#6-catalogo-delle-idee-per-tema). La numerazione storica è preservata: l'Ondata 2 è già completata ([§3](#3-completato)); la nuova ondata di fondazione visiva prende il numero **O0** perché è propedeutica a tutte.

### Ondata 0 — Fondamenta visive & design system ✅ *(completata 2026-06-12)*

**Obiettivo (→ OB-2, OB-4):** trasformare l'estetica da "curata" a "distintiva" e costruire la fondazione su cui ogni ondata successiva appoggia. La direzione estetica è formalizzata in [DESIGN.md](DESIGN.md); il dettaglio del consegnato è in [§3](#3-completato). La rifinitura "tutti gli stati su tutti i componenti" prosegue come lavoro trasversale a ogni ondata (regola di prodotto n. 8).

### Ondata 1 — Segnalazioni 2.0 ✅ *(completata 2026-06-12)*

**Obiettivo (→ OB-1):** completare il ciclo di vita della segnalazione, dal "segnala in 30 secondi" alla conferma del cittadino dopo la risoluzione. Dettaglio del consegnato in [§3](#3-completato).

### Ondata 2 — Semplicità & profilo civico ✅ *(completata 2026-06-11, dettagli in [§3](#3-completato))*

### Ondata 3 — Trasparenza che chiude il cerchio ✅ *(completata 2026-06-12)*

**Obiettivo (→ OB-1, OB-3):** mostrare cosa succede *dopo* la partecipazione: decisioni, motivazioni, impegni, linguaggio semplice. Tutte le dieci voci consegnate; dettaglio in [§3](#3-completato). La versione AI di "Spiegamelo semplice" resta un'idea 💡 (per ora il testo è redazionale dal seed).

### Ondata 4 — Territorio & partecipazione ✅ *(completata 2026-06-13)*

**Obiettivo (→ OB-1, OB-3):** vita di quartiere e strumenti di dialogo strutturato tra cittadini e Comune. Tutte le voci consegnate; dettaglio in [§3](#3-completato). In più, fuori lista: **onboarding "primi passi in città"** (checklist progressiva, dal backlog), **tour demo persistito** con invito ai nuovi account, e la **tipografia** portata a voce unica **Montserrat**.

| Voce | Livello | Fonte | Stato |
|---|---|---|---|
| Diario del quartiere: riepilogo periodico per zona | `FE` `BE` | `A1 §9` | ✅ |
| Stanze tematiche (mobilità, ambiente, scuole…) | `FE` `BE` `UX` | `A1 §17` | ✅ |
| Question time digitale con domande votate | `FE` `BE` | `A2 §22` | ✅ |
| "Vota la priorità" su problemi validati | `FE` `BE` | `A2 §9` | ✅ |
| Heatmap civica / mappa del disagio — estende la mappa Leaflet (merge con "Pistoia Pulse") | `FE` `DES` | `A2 §6` | ✅ |
| Problemi ricorrenti: evidenza dei pattern per zona/categoria | `FE` `BE` | `A2 §7` | ✅ |
| "Da segnalazione a progetto": cluster di segnalazioni → progetto pubblico | `FE` `BE` | `A2 §8` | ✅ |
| Volontariato e iniziative | `FE` `BE` | `A2 §14` | ✅ |
| "Adotta un luogo" (merge con "Patti di collaborazione civica") | `FE` `BE` | `A2 §16` | ✅ |
| Patti digitali di quartiere: obiettivi condivisi | `FE` `BE` | `A2 §31` | ✅ |
| Consultazioni strutturate con documenti allegati | `FE` `BE` | `A2 §23` | ✅ |

### Ondata 5 — Fondamenta Astryx & direzione ibrida ✅ *(completata 2026-07-25)*

**Obiettivo (→ OB-5):** rifondare il design system su una base solida e
riorientare il linguaggio visivo. Processo guidato dalla scoperta: ~90 domande
in [`DISCOVERY.md`](DISCOVERY.md), otto decisioni bloccanti prese prima di
scrivere codice. Fonti e regole d'uso in [`REFERENCES.md`](REFERENCES.md).

| Voce | Livello | Stato |
|---|---|---|
| Analisi delle 8 fonti di riferimento, con regola d'uso per ciascuna | `DES` | ✅ |
| Adozione di **Astryx** come strato di primitive e sorgente dei token | `FE` | ✅ |
| Tema Pistoia via `defineTheme` (112 token, 6 override di componente) | `DES` `FE` | ✅ |
| Build del tema in CSS statico — obbligatorio sotto CSP con nonce | `FE` | ✅ |
| Direzione ibrida: forma dai riferimenti, significato da Pistoia | `DES` | ✅ |
| Tela grigio-calda, superfici bianche squircle senza bordo | `DES` | ✅ |
| Tipografia Schibsted Grotesk + JetBrains Mono (sostituisce Montserrat) | `DES` | ✅ |
| Accento teal + lime decorativo vincolato ai soli ruoli non testuali | `DES` | ✅ |
| Ponte di retrocompatibilità: ~1050 utility adottano i nuovi token, zero rotte toccate | `FE` | ✅ |
| `DotMatrixNumber` · `MeshSurface` · `DotScatterTimeline` · `ScrollTold` | `FE` `DES` | ✅ |
| Vetrina `/design-system` | `FE` | ✅ |
| `npm run shots` — revisione visiva nei due temi | `QA` | ✅ |
| Documentazione: AGENTS · ARCHITECTURE · SECURITY · FEATURES · DESIGN · REFERENCES | `DOC` | ✅ |

**Lezioni pagate** (ora in `AGENTS.md` §3, per non ripagarle):
il provider `<Theme>` di Astryx rompe il tema scuro applicando `color-scheme` su
un wrapper discendente; il ponte Tailwind ufficiale collide con la semantica di
`--color-muted` dell'app; Turbopack va in panic dopo un cambio di dipendenze
finché non si cancella `.next`.

**Le primitive: esito diverso da quello previsto.** L'ondata prevedeva di
riscrivere le 16 primitive *sopra i componenti* Astryx. Alla prova dei fatti
**non conviene**, e la decisione è documentata invece che nascosta:

| Primitiva | Componente Astryx | Perché non si adotta |
|---|---|---|
| `Input` | `TextInput` | Richiede `value`: è **controllato per contratto**. Qui i form sono nativi e si inviano con le Server Actions leggendo `name`. Adottarlo significherebbe rendere controllato ogni campo e spostare `"use client"` verso l'alto: smontare l'architettura RSC per nulla di visibile |
| `Button` | `Button` | Serve un `<Link>` vestito da bottone (`buttonClasses`), e un componente React non può vestire un link. La 0.1.8 non emette il gancio stabile `.astryx-button` documentato: restano solo classi atomiche StyleX, instabili |
| `Alert` | `Banner` | `Banner` è una card con intestazione colorata; qui serve un feedback **inline e compatto** dentro i form. Sarebbe un peso visivo sbagliato |
| `ProgressBar` | `ProgressBar` | Quello di Astryx non espone ritardo né animazione d'ingresso: perderemmo lo stagger `delay={index * 0.12}` negli elenchi di cantieri |

**Cosa è stato fatto invece** — le primitive restano Pistoia, ma allineate al
nuovo sistema:

| Voce | Stato |
|---|---|
| Bottoni riscritti come classi su token, condivise fra `Button` e `buttonClasses` | ✅ |
| Rimossi gradiente teal→viola e **ombra colorata** dal bottone primario (ultimo bagliore rimasto) | ✅ |
| Tre bottoni fatti a mano nell'admin e nel tour ricondotti alle classi condivise | ✅ |
| Gradiente teal→viola non più default nelle barre di avanzamento (DESIGN.md §4 lo riserva a un momento per pagina; era su ogni cantiere in elenco) | ✅ |
| Motivazioni scritte nel codice, accanto a ogni scelta | ✅ |

Astryx resta la sorgente dei **token** e la libreria di riferimento per i
componenti nuovi; non diventa lo strato di primitive. È una correzione di rotta
basata sull'evidenza, non un ripensamento estetico.

### Ondata 6 — Il design system arriva sulle pagine ✅ *(completata 2026-07-25)*

**Obiettivo (→ OB-5):** l'ondata 5 aveva rifondato token e componenti-firma, ma
le 30+ rotte avevano **ereditato** il nuovo sistema tramite il ponte di
retrocompatibilità, non erano state ridisegnate. Qui il sistema entra davvero
nelle quattro pagine di punta. Quattro biforcazioni sciolte prima di scrivere
codice, in [`DISCOVERY.md`](DISCOVERY.md).

| Voce | Livello | Stato |
|---|---|---|
| **Bilancio** — `DisplayNumber` come cifra protagonista, apertura a bento | `FE` `DES` | ✅ |
| Sankey "dove scorrono i soldi" a **due stadi**, scritto a mano sui token | `FE` `DES` | ✅ |
| Prima sezione narrata della piattaforma (`ScrollTold`), tre passaggi | `FE` `DES` | ✅ |
| Treemap e anelli tolti dall'arcobaleno: rampa sequenziale dall'accento | `DES` | ✅ |
| **La mia città** — bento con `MeshSurface` la cui tinta È il tasso di risoluzione | `FE` `DES` | ✅ |
| **Segnalazioni** — transizione a elemento condiviso lista → dettaglio | `FE` `DES` | ✅ |
| `DotScatterTimeline` sull'andamento: altezza = arrivate, diametro = chiuse, colore = settimana in pari | `FE` `DES` | ✅ |
| **Login** — pannello di marca a `MeshSurface` + scacchiera; via gradiente e aloni | `FE` `DES` | ✅ |
| `npm run shots`: cattura deterministica, login davvero fotografato, dettaglio segnalazione aggiunto | `QA` | ✅ |

**Cinque difetti trovati usando il sistema** — non erano visibili finché i
componenti non sono entrati in una pagina vera:

| Difetto | Perché contava |
|---|---|
| `LineChart` disegnava **solo ~80% di ogni linea** | `pathLength="1"` normalizza in spazio utente, `vector-effect: non-scaling-stroke` calcola i trattini in spazio schermo: con viewBox 640 reso su 802px il tratto copriva 640/802 = 79,8%. Su una pagina di bilancio **mancavano gli ultimi due mesi**, in silenzio. Ora la rivelazione è una tendina |
| Le tabelle `sr-only` **spingevano la pagina di lato** | Su una `<table>` `width: 1px` vale come minimo, non come larghezza: la tabella restava larga 1095px. `sr-only` è passata sul `<div>` che la avvolge, in tutti e tre i grafici |
| Titoli **bianchi** sopra il mesh nel tema scuro | Il reset di Astryx dichiara `color` su `:where(h1…h6)`, e una dichiarazione sull'elemento batte l'ereditarietà. Invisibile nel tema chiaro |
| `ScrollStep` partiva da **opacità 0** | Chi apriva la pagina senza scorrere — o la stampava — trovava un buco al posto di un paragrafo. Ora il pavimento è 0,3 |
| `npm run shots` **non fotografava il login** | Lo script faceva l'accesso prima di visitarlo, e `/login` reindirizza chi ha una sessione: la prima schermata di ogni dimostrazione non era mai stata rivista |

**Verificato:** typecheck · lint · 80 unit · 11 E2E · schermate nei due temi ·
contrasti misurati sul mesh (4,55:1 il caso peggiore, AA) · zero traboccamenti
orizzontali a 360/768/1280px in modalità semplice · nessun errore in console.

### Ondata 7 — Il secondo scaglione di pagine ✅ *(completata 2026-07-25)*

**Obiettivo (→ OB-5):** l'ondata 6 aveva portato il sistema su quattro pagine di
punta; restavano 26 rotte che avevano solo **ereditato** i token. Qui entrano
davvero in Opere, Proposte, Quartieri e Comunità — le quattro destinazioni della
filiera civica, tutte già di primo livello nel menù.

**Sciolta prima di scrivere codice:** il passaggio di architettura
dell'informazione (`G1`, `G2`, `C3`) **resta rinviato**, e la verifica ha
cambiato la domanda. Aperte tutte e otto le rotte "sovrapposte", nessuna
condivide un modello dati: non c'è niente da fondere. Ciò che si sovrappone è
l'etichetta nel menù e la filiera invisibile fra le rotte. Vedi
[`DISCOVERY.md`](DISCOVERY.md) C3, D7, G1, G2.

| Voce | Livello | Stato |
|---|---|---|
| **Opere** — cifra display sull'investimento aperto, apertura a bento | `FE` `DES` | ✅ |
| **Cronoprogramma**: lavoro fatto contro tempo passato, derivato da `startedAt`/`expectedEnd`/`progress` | `FE` `DES` | ✅ |
| `MeshSurface` la cui tinta È la quota di cantieri che rispettano il calendario | `FE` `DES` | ✅ |
| **Proposte** — la scala a tacche di `DisplayNumber` sul suo unico intervallo reale (0→500) | `FE` `DES` | ✅ |
| I tre gradini 50/200/500 al posto della barra, sul dettaglio | `FE` `DES` | ✅ |
| **Quartieri** — fascia mesh per scheda: la tinta è il tasso di risoluzione dell'area | `FE` `DES` | ✅ |
| Soglia minima di campione prima di tingere un rapporto | `BE` `DES` `A11Y` | ✅ |
| **Comunità** — cifra display sulle domande con risposta ufficiale, stanze a griglia | `FE` `DES` | ✅ |
| Transizione a elemento condiviso **generalizzata** a quattro entità | `FE` `DES` | ✅ |
| `npm run shots`: aggiunte le sei nuove rotte, cattura fallita = uscita 1 | `QA` | ✅ |
| 13 test unitari nuovi su `cronoprogramma` e sul tasso di risoluzione | `ENG` | ✅ |

**Due scelte controcorrente, entrambe per non mentire:**

| Scelta | Perché |
|---|---|
| **Niente `DotScatterTimeline` sulle tappe dei cantieri**, benché fosse la richiesta | Nel seed ci sono **4 righe `OperaUpdate` in tutto** su 11 opere, e il componente distribuisce i punti a passo costante: quattro pallini non sono un grafico. Al suo posto il cronoprogramma, che usa campi già veri e risponde alla domanda che un cittadino si fa davvero — «è in pari?» |
| **`MeshSurface` non tinta dall'avanzamento medio** | Sembra una salute e non lo è: un cantiere al 18% aperto il mese scorso è nuovo, non malato. La tinta viene dalla quota di cantieri in pari col proprio calendario, che una salute lo è |

**Cinque difetti trovati portando il sistema su queste pagine** — e come i cinque
dell'ondata 6, nessuno produceva un errore:

| Difetto | Perché contava |
|---|---|
| `DisplayNumber.format` era una **funzione**, quindi inutilizzabile da un Server Component | Tutte le pagine che gli danno la cifra protagonista sono RSC. React rifiuta a runtime; typecheck e lint verdi, pagina sull'error boundary. Ora è `formatOptions`, un oggetto serializzabile |
| Il dettaglio quartiere **contava da liste troncate** | `counts.openReports` veniva da una `findMany({ take: 6 })`: non poteva superare 6 e restava plausibile. Un quartiere con quaranta segnalazioni aperte ne dichiarava sei |
| Un tasso su **due segnalazioni** tingeva una scheda di rosso | «0% risolte» su n=2 è esatto e non significa niente, ma il colore lo fa leggere come una colpa di quel quartiere. Da qui `CAMPIONE_MINIMO_PER_GIUDIZIO` |
| `npm run shots` **usciva 0 sulle pagine che non riusciva ad aprire** | Il traboccamento si misura dentro il `try`: il cancello certificava "nessuna pagina scorre di lato" proprio sulle rotte appena cambiate |
| Il tasso di risoluzione aveva **due definizioni** | Home e quartieri, a un clic di distanza, potevano mostrare due percentuali diverse della stessa città. Ora sta in `lib/citystats.ts` |

**Tolti due KPI inventati** dall'apertura di Opere — «318 cantieri censiti» e
«+4 nuovi questo mese»: un numero inventato accanto a numeri veri li fa sembrare
tutti inventati.

### Ondata 8 — Admin intelligence & nuovi pubblici ▶️ *(scongelata — 2026-07-29)*

> **Era congelata dal 2026-07-26**, perché prima di aggiungere altro la
> piattaforma andava riorganizzata: 25 voci di menu erano diventate una
> gerarchia piatta, e su telefono 16 destinazioni su 25 non avevano alcun
> percorso navigabile.
>
> **Il consolidamento è finito.** Fase A chiusa il 2026-07-26 (5 destinazioni,
> identiche su desktop e telefono), Fase B chiusa il 2026-07-29 (23 rotte su
> 26, tre esclusioni dichiarate). Il consuntivo è in
> [`docs/roadmap-consolidamento.md`](docs/roadmap-consolidamento.md).
> Questa ondata riprende integralmente come **Fase C**, su fondamenta pulite.
>
> Nota di sequenza: la prima voce qui sotto — la dashboard admin con analytics
> operative — è anche la ragione per cui `/admin` è stato **escluso** dalla
> Fase B. Comporlo prima di riscriverlo sarebbe stato pagarlo due volte.

**Obiettivo (→ OB-1, OB-4):** strumenti decisionali per il Comune e apertura a turisti, commercianti, scuole.

| Voce | Livello | Fonte |
|---|---|---|
| Dashboard admin con analytics operative (KPI per categoria/quartiere/ufficio, trend) | `FE` `BE` `DES` | `A1 §27` |
| Alert trend anomalo (euristiche, niente AI) | `BE` | `A2 §21` |
| Sentiment civico per tema (mock/euristiche) | `FE` `BE` | `A2 §20` |
| Moderazione assistita (euristiche: spam, duplicati, suggerimento categoria) | `BE` | `A1 §28` |
| Modalità turista | `FE` `UX` | `A2 §28` |
| Commercio locale — il modello `OrganizationProfile` esiste già | `FE` `BE` | `A2 §29` |
| Vetrina aziende di Pistoia & sponsorizzazioni: le attività verificate si presentano (profilo ricco, iniziative) e possono sponsorizzare in modo dichiarato spazi non civici della piattaforma | `FE` `BE` | 🆕 richiesta 2026-06-11 |
| Storie della città + "Pistoia racconta" | `FE` `DES` | `A2 §17–18` |
| Servizi quotidiani / scorciatoie ai servizi comunali (link mock) | `FE` `UX` | `A1 §22` + idea esistente |

### Traccia trasversale — Qualità continua ♾️

> Non è un'ondata: accompagna ogni ondata. Serve OB-5.

| Voce | Livello | Stato |
|---|---|---|
| Review "lenti mancanti": sicurezza, correttezza cache, idiomi Next 16 (saltate il 2026-06-11) | `SEC` `ENG` | 📋 consigliata presto |
| Test a11y automatici (axe-core dentro gli E2E Playwright) | `ENG` `A11Y` | ✅ **2026-08-05** — `tests/e2e/accessibilita.spec.ts`: 8 pagine × 2 temi, regole WCAG **AA**, **nessuna regola esclusa**. Ha trovato un **debito preesistente di tavolozza**, corretto nella stessa sessione: vedi sotto |
| Lighthouse CI con performance budget | `ENG` | 🚧 **impostato il 2026-08-05** (`lighthouserc.js` + job in CI): **misura, non giudica**. Le soglie si scrivono dopo le prime passate; solo allora il job smette di essere `continue-on-error`. **Zero dipendenze nuove**: `@lhci/cli` gira con `npx` pinnato — installarlo costava **+285 pacchetti** e 5 avvisi, e il `Dockerfile` (`npm ci --include=dev`) se li porterebbe in produzione |
| Audit dipendenze in CI (`npm audit` / osv-scanner) | `SEC` `ENG` | ✅ **2026-08-05** — passo informativo nel job `quality`. Non bloccante **e dichiarato**: restano 8 avvisi in attesa di due decisioni (`SECURITY.md` §7), e un cancello rosso per una cosa che si è scelto di non chiudere smette di essere letto |
| Estensione test Vitest/E2E a ogni ondata | `ENG` | regola fissa |

> **Il debito che axe ha trovato — e che è stato chiuso (2026-08-05).** Non
> erano falsi positivi e non erano regressioni: violazioni **preesistenti**, mai
> misurate perché i contrasti dell'ondata 6 erano stati verificati **a mano, una
> volta sola**. `DESIGN.md` §4 dichiarava «Contrasto WCAG AA ovunque, già
> verificato: non si regredisce», e **non era vero**.
>
> Tre regole, tre cause diverse:
>
> | Regola | Che cosa era | Come è stata chiusa |
> |---|---|---|
> | `button-name` (critical) | Il **menu del profilo** non aveva nome accessibile: dentro solo l'`Avatar`, che è `aria-hidden` di proposito, e un chevron. Su **ogni** pagina autenticata | `aria-label` sul pulsante |
> | `color-contrast` | La **tavolozza chiara**: bianco su accent 3,28:1 (il pulsante primario) · teal su tela 2,65:1 (i link) · viola e ambra sui propri chip 2,43:1 e 2,48:1 · i due grigi muti 2,88:1 e 4,14:1 · verde su chip 2,93:1 · rosso dello stemma su chip 3,72:1 | Token scuriti ai **valori più chiari** che superano 4,5:1 (tabella in `DESIGN.md` §4). Il **rosso dello stemma non è stato toccato**: ha un `--red-ink` per il solo caso in cui diventa testo minuto. Il **tema scuro nemmeno**: lì passava già |
> | `link-in-text-block` | I link nella prosa si distinguevano **solo per colore** | Sottolineatura permanente in `p`, `li`, `dd` (regola di sistema in `globals.css`, non venti ritocchi) |
>
> Quattro note d'attuazione, tutte della stessa famiglia — **numeri plausibili e
> sbagliati**: axe va interrogato a pagina **posata** (~2,2s d'ingresso, o
> dichiara 1,07:1 su testo nero), **scorsa** (le rivelazioni allo scroll partono
> smorzate) e con **`prefers-reduced-motion`** (la sezione narrata è legata alla
> ScrollTimeline: risalendo torna scura per disegno, ed è la resa ridotta quella
> che deve essere leggibile — `DESIGN.md` §8 e §11.8). E il tetto di tempo va
> alzato: axe su `/bilancio` supera da solo i 30s di default.

---

## 5. Nuove proposte — revisione 2026-06-11

> Idee introdotte da questa revisione (🆕 nel resto del documento). Tutte realizzabili in mock; le prime nove formano l'Ondata 0.

| Idea | Livello | Perché vale | Destinazione |
|---|---|---|---|
| **Design token + design system documentato** | `DES` `ENG` | Coerenza visiva garantita e restyling futuri quasi gratis: si cambia il token, non 40 pagine | ✅ O0 (2026-06-12) |
| **Libreria componenti con stati completi** | `FE` `DES` | La qualità percepita vive negli stati: vuoto, errore, caricamento, focus | ✅ O0 avviata · prosegue trasversale |
| **Tema scuro curato** | `FE` `DES` | Atteso da qualsiasi prodotto moderno; in demo fa colpo immediato | ✅ O0 (2026-06-12) |
| **Motion design (View Transitions, micro-interazioni)** | `FE` `UX` | La differenza tra "sito" e "prodotto" è il movimento sobrio e intenzionale | ✅ O0 (2026-06-12) |
| **Empty state e illustrazioni custom** | `DES` | Elimina l'effetto template; identità anche dove non ci sono dati | ✅ O0 (2026-06-12) |
| **Centro notifiche 2.0** | `FE` `UX` | Le notifiche raggruppate per tema/quartiere con azioni inline riducono rumore | ✅ O0 (2026-06-12) |
| **Command palette 2.0 (azioni, non solo ricerca)** | `FE` `UX` | Ctrl+K già esiste: estenderlo alle azioni è poco costo, molto valore | ✅ O0 (2026-06-12) |
| **Data-viz bilancio next-gen (treemap, confronti)** | `FE` `DES` | Il bilancio è la pagina più "istituzionale": una visualizzazione memorabile la trasforma | ✅ O0 (2026-06-12) |
| **Tour demo guidato / modalità presentazione** | `UX` | Il progetto è una demo: deve sapersi presentare da solo, passo passo | ✅ O0 (2026-06-12) |
| **Mock data "vivo" (seed temporale deterministico)** | `BE` `ENG` | Una demo dove "succedono cose" è infinitamente più credibile di una statica | ✅ O1 (2026-06-12) |
| **Export PDF del civic digest** | `BE` | Estensione naturale del digest (`A2 §19`), utile per comunicazione | ✅ O3 (2026-06-12) |
| **"Stato della città" hero con indicatori** | `FE` `DES` | Colpo d'occhio immediato sulla salute della città appena si entra | ✅ O3 (2026-06-12) |
| **Test a11y automatici (axe in E2E)** | `ENG` `A11Y` | L'a11y già raggiunta non deve regredire mai | ♾️ qualità continua |
| **Lighthouse CI + performance budget** | `ENG` | La percezione di qualità passa anche dalla velocità; il budget la difende | ♾️ qualità continua |
| **Audit dipendenze in CI** | `SEC` | Sicurezza della supply chain a costo quasi zero | ♾️ qualità continua |
| **Vetrina aziende & sponsorizzazioni** | `FE` `BE` | Le aziende di Pistoia si fanno conoscere e sostengono la piattaforma; `OrganizationProfile` esiste già. Sponsor sempre dichiarati (regola n. 9) | 🔜 O5 |
| **Onboarding "primi passi in città" (checklist progressiva)** | `UX` | Accompagna il nuovo utente alle prime azioni utili | ✅ O4 (2026-06-13) |
| **Scorciatoie da tastiera + pannello "?"** | `UX` `A11Y` | Produttività per utenti esperti, scopribilità per tutti | 📋 |
| **Open Graph image dinamiche** (condivisione di segnalazioni/proposte) | `FE` | Anche un link condiviso deve essere bello | 📋 |

---

## 6. Catalogo delle idee per tema

> Tutte le idee dei due addenda e delle sessioni di ideazione, deduplicate. Le righe con ondata assegnata sono pianificate; 📋 e 💡 attendono priorità. La colonna **Livello** indica gli strati toccati (legenda in [§0](#0-come-leggere-questo-documento)).

### 🎨 Design & esperienza visiva

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Design token + design system | Palette, tipografia, spacing, elevazioni come fonte unica di verità | `DES` `ENG` | 🆕 | ✅ O0 (2026-06-12) |
| Libreria componenti rifinita | Tutti gli stati di ogni componente, documentati | `FE` `DES` | 🆕 | ✅ O0 avviata · prosegue trasversale |
| Tema scuro | Dark mode progettata, non invertita | `FE` `DES` | 🆕 | ✅ O0 (2026-06-12) |
| Motion design | View Transitions, micro-interazioni, animazioni di stato | `FE` `UX` | 🆕 | ✅ O0 (2026-06-12) |
| Empty state & illustrazioni custom | Identità visiva anche dove non ci sono dati | `DES` | 🆕 | ✅ O0 (2026-06-12) |
| Data-viz bilancio next-gen | Treemap missioni, confronti leggibili anno su anno | `FE` `DES` | 🆕 | ✅ O0 (2026-06-12) |
| "Stato della città" hero | Indicatori sintetici con sparkline in home | `FE` `DES` | 🆕 | ✅ O3 (2026-06-12) |
| OG image dinamiche | Anteprima curata dei link condivisi | `FE` | 🆕 | 📋 |
| Restyling continuo | Ogni ondata rifinisce le pagine toccate | `DES` | direttrice Estetica | trasversale |

### 🛠️ Segnalazioni

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Timeline pubblica | Cronologia visibile: inviata → validata → assegnata → risolta | `FE` `UX` | `A1 §3` | ✅ O1 (2026-06-12) |
| Conferma del cittadino | "È davvero risolta?" sì/no, con riapertura | `FE` `BE` | `A1 §5` | ✅ O1 (2026-06-12) |
| Foto prima/durante/dopo | Confronto fotografico degli interventi | `FE` `BE` `DES` | `A1 §4` | ✅ O1 (2026-06-12) |
| Ufficio competente | Chi gestisce la pratica, sempre visibile | `FE` `BE` | `A1 §6` | ✅ O1 (2026-06-12) |
| Tempi medi / SLA informativi | Tempi storici medi per categoria (non promesse) | `FE` `BE` | `A1 §7` | ✅ O1 (2026-06-12) |
| Segnalazione urgente | Flag urgenza con validazione moderatore | `FE` `BE` | `A1 §8` | ✅ O1 (2026-06-12) |
| Anti-duplicati | Suggerisce segnalazioni simili → "Anche io" | `FE` `BE` `UX` | `A1 §2` | ✅ O1 (2026-06-12) |
| Segnala in 30 secondi | Foto → posizione → categoria → invia | `FE` `UX` | `A2 §4` | ✅ O1 (2026-06-12) |
| Categoria da foto (AI) | Suggerimento automatico della categoria | `AI` | `A2 §5` | 💡 richiede LLM |

### 💡 Proposte

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Creazione guidata | Wizard a domande: problema, dove, chi beneficia | `FE` `UX` | `A1 §14` | ✅ O2 (2026-06-11) |
| Impatto stimato + budget impact | Costo €€, impatto, fattibilità, tempo (badge sintetici) | `FE` `BE` | `A1 §15` + `A2 §10` | ✅ O2 (2026-06-11) |
| Categorie di cittadini impattate | Residenti, studenti, commercianti, anziani… | `FE` `BE` | `A2 §26` | ✅ O2 (2026-06-11) |
| Collegamento proposte ↔ opere ↔ bilancio | Link manuale a progetti/voci esistenti | `FE` `BE` | `A1 §16` | 🔜 O3 |
| Co-firmatari | Cittadini, associazioni e attività firmano insieme | `FE` `BE` | `A2 §25` | 💡 |
| Proposta collaborativa | Bozza pubblica → suggerimenti → versione finale | `FE` `BE` `UX` | `A2 §24` | 💡 |

### 🔍 Osservatorio civico *(richiesta 2026-07-26 — Fase C)*

> Cinque funzioni che spostano il prodotto da *piattaforma di servizio* a
> **osservatorio che giudica l'amministrazione**. È lavoro di accountability
> legittimo — la trasparenza amministrativa esiste per legge (D.Lgs 33/2013)
> proprio perché i cittadini possano farlo — ma cambia natura al progetto, e
> ha **cinque prerequisiti non negoziabili** elencati sotto la tabella.

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| **La pagella della giunta** *(già «Pagella mensile»)* | Voto 1–10 **alla giunta come organo collettivo** (mai a una persona) su sei materie **a due regimi**: ricontabile dove il traguardo è fissato per legge (Trasparenza, Spesa), a fatti dove non lo fissa nessuno (Promesse), assenza spiegata dove manca una fonte reale (Sicurezza, Decoro, Ascolto). Nessun voto d'insieme; edizioni trimestrali timbrate con la versione della metodologia | `FE` `BE` `DES` | richiesta 2026-07-26 · scoperta 2026-08-05 | 🚧 Fase C — **forma composta il 2026-08-05** (M1 · V1 · C1 · R1, scala 1 + 9 × quota) e **P-1/P-2 chiuse**: metodologia **v1.1** col capitolo 2 (regole 13–20, costanti interpolate da `lib/pagella.ts`), `/pagella` in forma A **senza alcuna edizione**. Prima edizione da ricognizione reale **dopo il 27/08/2026** (termine art. 14); il seed non semina pagelle. Piano in [`docs/piano-pagella.md`](docs/piano-pagella.md) |
| **Dossier persona** | Scheda pubblica per assessore: curriculum dichiarato, indennità dal portale trasparenza, esperienza nel settore di delega, dichiarazioni vs azioni | `FE` `BE` | richiesta 2026-07-26 | 💡 Fase C |
| **Audit cittadino** | PDF trimestrale di 5–6 pagine in forma di mini-audit: executive summary, 5 indicatori con trend, 3 promesse, 3 spese, 3 domande senza risposta | `FE` `BE` `DES` | richiesta 2026-07-26 | 💡 Fase C |
| **Il costo dell'amministrazione** | Quanto la legge prevede per sindaco, giunta e presidente del consiglio, con l'atto primario dietro ogni cifra | `FE` `BE` | richiesta 2026-07-26 | ✅ 2026-07-31 — `/trasparenza/costo-amministrazione` |
| **Valutazioni dei servizi** *(già «Rating dei servizi — Pistoia Index»)* | Stelle 1–5 e recensioni scritte su servizi allo sportello **e** condizioni della città, in due tabelloni mai fusi. Media solo sopra soglia, composizione del campione sempre dichiarata, risposta del Comune nella stessa scheda | `FE` `BE` `DES` | richiesta 2026-07-26 · scoperta 2026-08-03 | 🚧 Fase C — **R-1…R-5 chiuse** (lettura, voto, moderazione **e i sei ingressi**: schede, QR pubblici `/v/`, conferma/revoca via email su file, risposte del Comune col timbro della carica, coda della Redazione su `/redazione`, registro firmato; da R-5 l'invito contestuale post-risoluzione, la campagna mensile su tutti i canali, il blocco nel digest, il pop-up armato dai voti — tutti dietro il **contatore unico** `Sollecitazione`, provato a date fisse — e la **lettura pubblica** di panoramica e schede, decisione W1). Il seed **dimostra la colonna dura** (mediane su tutte e cinque le condizioni). Resta R-6. Piano in [`docs/piano-rating-servizi.md`](../docs/piano-rating-servizi.md) |

**Prerequisiti — nessuna delle cinque parte senza questi.**

1. **Identità separata dal Comune.** Oggi l'applicazione si presenta come
   «Comune di Pistoia» con lo stemma civico. Un osservatorio che pubblica
   pagelle sul sindaco **sotto lo stemma del Comune** fa credere al lettore
   che sia il Comune a farlo: non è una sfumatura di stile, è il lettore
   indotto in errore sulla fonte. Vale doppio per l'«Audit cittadino», il cui
   scopo dichiarato è essere citato dai giornali come fonte. Serve nome,
   stemma e dominio propri, e una riga che dichiari chi pubblica e con quali
   dati. **Senza questo le altre quattro non si fanno.**

   > **RISOLTO DIVERSAMENTE — decisione di Lorenzo, 2026-07-29.**
   > **Lo stemma del Comune resta**, e la strada del marchio separato è chiusa
   > dopo due tentativi. Non riproporla.
   >
   > - *Primo tentativo (2026-07-26), ritirato.* Ipotesi «marchio unico
   >   indipendente» col nome **Il Campanile** — silhouette dalle fasce
   >   romaniche, favicon, dichiarazione nel footer, stemma retrocesso ad
   >   attribuire i soli contenuti del Comune. Respinto: il marchio non
   >   convinceva. Tutto ripristinato.
   > - *Secondo tentativo (2026-07-29), non scelto.* Quattro direzioni con
   >   marchio disegnato — **La Misura** (fasce come scala), **Il Riscontro**
   >   (scacchiera come matrice di verifica), **Annali** (anelli di
   >   accrescimento, verde dei vivai), **Osservatorio Pistoia** (anti-marchio).
   >   Lorenzo: «avevo scelto lo stemma del comune».
   >
   > **La forma che sostituisce il marchio separato: una dichiarazione
   > esplicita di chi pubblica**, in cima alle pagine che esprimono un
   > giudizio. Lo stemma resta dov'è; il problema di attribuzione si risolve
   > dicendolo, non cambiando marca.
   >
   > ✅ **Disegnata e approvata il 2026-07-30** — quattro direzioni rese su una
   > bozza di `/pagella`, cioè sotto lo stemma vero e non su fondo neutro.
   > Scelta: **cartiglio + filo persistente**, in
   > `components/osservatorio/chi-pubblica.tsx`. Firma: «Redazione della
   > Dashboard di Pistoia».
   >
   > L'argomento che ha deciso fra le quattro non era estetico ma di **durata**:
   > la barra in alto è `sticky`, quindi lo stemma resta sullo schermo per tutta
   > la lettura mentre una dichiarazione in cima sparisce al primo scorrimento.
   > Una dichiarazione che non dura quanto l'affermazione che smentisce lascia
   > scoperto tutto il corpo della pagina — che su una pagella è quasi tutta la
   > pagella. Da qui il filo, che costa 64px a 360px in modalità semplice.
   >
   > Le due parti non sono esportate separatamente: chi non può usarne metà non
   > può dimenticarsi il filo, che è la metà il cui difetto non si vede finché
   > non si scorre. Dettaglio in `FEATURES.md` §2.
   >
   > **Conseguenza operativa: le cinque funzioni si dividono in due gruppi.**
   >
   > | Sotto lo stemma **ci stanno** | Perché |
   > |---|---|
   > | Il costo dell'amministrazione | ~20 cifre che il Comune è obbligato a pubblicare per legge (D.Lgs 33/2013 §14). Renderle leggibili è trasparenza, non autocritica |
   > | Rating dei servizi | I cittadini votano *pulizia, illuminazione, trasporti* — servizi, non persone |
   >
   > | Sotto lo stemma **non ci stanno** senza la dichiarazione | Perché |
   > |---|---|
   > | Pagella mensile · Dossier persona · Audit cittadino | Danno un voto a chi governa: sotto lo stemma il lettore capisce che è il Comune a darselo |
   >
   > Due cose imparate che restano valide:
   > - **Il difetto di attribuzione c'è già oggi, senza osservatorio.** La barra
   >   in alto rivendica il Comune con lo stemma vero e `authors` nei metadata
   >   lo attribuisce al Comune in forma leggibile da una macchina, mentre il
   >   footer della stessa pagina dice «progetto dimostrativo».
   > - **Il nome e il marchio erano la parte difficile, non il codice.** La
   >   sostituzione tecnica è meccanica (una dozzina di file, mezz'ora); a non
   >   reggere è stata due volte la proposta d'identità. Ed è il motivo per cui
   >   la terza strada non è un terzo marchio.
2. **Dati reali, con fonte per ogni numero.** Quattro su cinque sono inerti sui
   dati dimostrativi e dipendono dalla ripresa di [§8](#8--in-pausa--dati-reali-ex-fase-2).
   `SourceBadge` esiste già; qui diventa obbligatorio, con link all'atto o
   alla pagina di trasparenza da cui il numero proviene.

   **Il taglio minimo di dati reali è «Il costo dell'amministrazione»**, e non
   la pagella: sono ~20 cifre (indennità di sindaco, giunta e staff politico)
   che provengono tutte da una sola famiglia di fonti — *Amministrazione
   trasparente*, la cui pubblicazione è **obbligatoria per legge** (D.Lgs
   33/2013 §14) — più ISTAT per il confronto col reddito pistoiese. Non serve
   nessun peso, nessuna soglia, nessuna scelta editoriale: è aritmetica su
   numeri già pubblicati, ognuno con l'URL del documento. Ogni altra funzione
   ha bisogno di una metodologia *prima* di aver bisogno dei dati. **Si parte
   da lì.**

   > **Ricognizione delle fonti, 2026-07-30 — tre scoperte che cambiano il
   > piano.**
   >
   > 1. **Le cifre non sono sul portale del Comune, e probabilmente è
   >    legittimo.** *Amministrazione trasparente → Organizzazione → Titolari
   >    di incarichi politici* esiste ed è ben strutturata, ma **nessun importo
   >    in euro** compare sulle pagine del sindaco, della giunta o delle otto
   >    schede personali. Il PDF che il portale offre lì è pubblicato «ai sensi
   >    dell'**art. 13**» — schema organizzativo, competenze, uffici — non
   >    dell'art. 14, che è quello dei compensi. E il sindaco **Giovanni
   >    Capecchi è stato proclamato il 27 maggio 2026**: l'art. 14 c.2 dà tre
   >    mesi dall'elezione, quindi la finestra si chiude verso il 27 agosto
   >    2026. Oggi l'assenza non è opacità.
   >
   >    Conseguenza vincolante: **una pagina «Il costo dell'amministrazione»
   >    che si aprisse su "dato non pubblicato" sarebbe un'accusa tratta da un
   >    dato mancante** — lo stesso difetto che ha tolto la cifra da
   >    `/organigramma` e la scala a tacche da `/promesse`.
   >
   > 2. **Le indennità non le decide il Comune.** Sono fissate a livello
   >    nazionale per **fascia demografica**: D.M. 119/2000, poi la legge di
   >    bilancio 2022 (L. 234/2021) che le ha parametrate al trattamento dei
   >    presidenti di regione con applicazione progressiva (45% nel 2022, 68%
   >    nel 2023, piena dal 2024). Questo **sgancia la funzione dalla
   >    pubblicazione del Comune**: la cifra si ricava da legge più
   >    popolazione, e il dato comunale serve a confermarla, non a produrla.
   >
   > 3. **La catena di calcolo è chiusa** — chiusa davvero il 2026-07-31, con
   >    ogni anello ancorato al testo primario. Il dettaglio, con URL e date di
   >    consultazione, sta in
   >    [`docs/fonti-costo-amministrazione.md`](../docs/fonti-costo-amministrazione.md).
   >
   > | Anello | Valore | Fonte primaria |
   > |---|---|---|
   > | Base | trattamento dei presidenti di regione, **13.800 € lordi/mese, per dodici mensilità** | Ministero dell'Interno, D.M. 30/05/2022, Allegato A: «il cui importo massimo è stato fissato in euro 13.800 mensili per dodici mensilità» |
   > | Fascia di Pistoia | capoluogo di provincia fino a 100.000 ab. → **70%** | L. 234/2021 art. 1 c. 583 lett. c), citata alla lettera nelle premesse del D.M. Interno-MEF 05/02/2026 |
   > | Popolazione | **88.889 ab.** al 31/12/2024 (89.054 al 31/12/2023, la cifra usata dal Ministero) | ISTAT diretto, serie POSAS, comune 047014 |
   > | Vicesindaco | **75%** dell'indennità del sindaco | D.M. 119/2000 **art. 4 c. 5**, fascia *superiore a 50.000 ab.* — testo vigente su Normattiva |
   > | Assessori | **60%** | D.M. 119/2000 art. 4 c. 9, fascia 50.000–250.000 |
   > | Presidente del consiglio | equiparato agli assessori | D.M. 119/2000 art. 5 c. 3 |
   > | Consiglieri | gettone **≤ ¼** dell'indennità del sindaco — è un **tetto mensile**, non un compenso | TUEL art. 82 c. 2, testo in vigore dal 1-1-2020 |
   >
   > Ne discende: sindaco **9.660 €/mese**, vicesindaca **7.245**, assessore
   > **5.796**, presidente del consiglio 5.796, tetto del consigliere 2.415.
   > Giunta (sindaco + vicesindaca + 7 assessori) **57.477 €/mese**, cioè
   > **689.724 €/anno**.
   >
   > ⚠️ **Correzione del 2026-07-31: il vicesindaco è 75%, non 55%.** La riga
   > precedente citava «art. 4 c. 4, fascia 50.001–100.000». L'articolo era
   > giusto, il comma no: il c. 4 copre la fascia *10.001–50.000*, e la fascia
   > «50.001–100.000» **nell'art. 4 non esiste** — esiste nell'art. 3, che è la
   > promozione di classe dei capoluoghi e riguarda il *sindaco*. Da lì la
   > fascia è migrata sull'articolo sbagliato. Pistoia sta sopra i 50.000, e
   > quindi cade nel c. 5: **75%**.
   >
   > **E la «riprova indipendente» non lo era.** L'allegato A del D.M.
   > 30/05/2022 contiene davvero 5.313, ma quel numero non conferma niente:
   > entrambi i percorsi passavano dal 55%, quindi era un solo percorso contato
   > due volte. Una riprova che condivide un anello con la catena che dovrebbe
   > verificare non è una riprova — è la stessa affermazione detta due volte.
   >
   > La riprova vera stava nello stesso documento. Quell'allegato contiene
   > **9.660**, **7.245** e **5.796** — i tre valori della catena corretta — più
   > 115.920 (= 9.660 × 12) e la riga `70 · 9.660 · 115.920 · 125.580 · 52`,
   > dove **52** è il numero dei comuni capoluogo di provincia fino a 100.000
   > abitanti. Pistoia è uno di quei 52.
   >
   > **I tre anelli aperti sono chiusi**, e due si sono chiusi diversamente da
   > come erano posti:
   >
   > - *La base.* Il decreto interministeriale del **5 febbraio 2026** non era
   >   «sulla stessa materia»: è il **riparto di 220 milioni** ai comuni, non
   >   l'atto che fissa la base. Serve lo stesso, perché nelle premesse cita il
   >   comma 583 alla lettera. Il numero, scritto in parole, stava nell'allegato
   >   del decreto del 2022 — cioè in un documento che avevamo già in mano.
   > - *La popolazione.* Sostituita con ISTAT diretto. E la fascia non si
   >   àncora alla popolazione residente ma a quella **dell'ultimo censimento
   >   ufficiale** (comma 583; Corte dei conti Basilicata, delib. 11/2025:
   >   criterio «statico»). Il Ministero, per il riparto 2025, ha usato la
   >   popolazione ISTAT al 31/12/2023 da censimento permanente.
   > - *Il vicesindaco.* **Stefania Nesi**, e il sito del Comune lo dichiara —
   >   non nella scheda del sindaco, che era la pagina controllata prima, ma
   >   nella notizia di presentazione della giunta del 10/06/2026. Nessuna
   >   induzione. Nella stessa passata: presidente del consiglio comunale
   >   **Paolo Tosi**, 32 consiglieri.
   >
   > Nota di contorno, che vale come regola: **sulla composizione della giunta
   > la stampa sbagliava e il Comune no.** Le liste dei giornali mettono in
   > giunta Irene Bottacci, che è consigliera; l'ottava assessora è Elena
   > Sinimberghi.
   >
   > **Cosa resta fuori da una cifra a schermo**, e non per prudenza ma per
   > esattezza: questi non sono i compensi percepiti, sono gli importi che la
   > legge prevede. L'art. 82 c. 1 TUEL **dimezza** l'indennità del lavoratore
   > dipendente che non abbia chiesto l'aspettativa, e chi dei nove sia in
   > quella condizione è esattamente ciò che il Comune deve ancora pubblicare.
   >
   > Materiale reale già raccolto e utilizzabile subito: sindaco con data di
   > proclamazione, otto assessori con deleghe puntuali, dirigenti di
   > riferimento e recapiti. Non è un costo, ma è un «chi fa cosa» verificato —
   > dove oggi `/organigramma` mostra dati inventati.

   > ✅ **`/organigramma` è passato ai dati veri il 2026-08-03.** Le nove
   > persone stanno in `src/lib/giunta.ts` con la fonte di ognuna; le fonti in
   > [`docs/fonti-organigramma.md`](../docs/fonti-organigramma.md). Le due
   > pagine non si contraddicono più, e un test lo verifica confrontando i nomi
   > dei due moduli.
   >
   > **La scoperta che ha deciso il lavoro non era sui nomi ma sui numeri.**
   > `votesElected` non si è potuto ancorare e quindi è sparito dal modello:
   > per **cinque persone su nove** quel numero non esiste in nessuna fonte —
   > un candidato sindaco non riceve preferenze, e quattro assessori su otto
   > non erano candidati in nessuna lista. Per i quattro che ce l'hanno, il
   > numero descrive un seggio che il TUEL art. 64 fa perdere all'atto della
   > nomina. Al suo posto c'è **come** ciascuno è arrivato alla carica.
   >
   > Ne discende una regola che vale per pagella e dossier: **dare un numero a
   > chi ce l'ha e lasciare vuoto agli altri non è neutro.** Quel vuoto si
   > legge come un giudizio. O il campo si riempie per tutti, o sparisce per
   > tutti.
   >
   > E le **deleghe** sono state riprese: le «due versioni» che le avevano
   > fatte omettere dal costo dell'amministrazione erano il titolo della scheda
   > e l'elenco enumerato sotto — il sommario e il portafoglio, non un
   > conflitto. Sono 57 e aprono la pagina in ordine alfabetico.

   ⚠️ E una correzione a questo elenco: **il «Rating dei servizi» non dipende
   dal §8 affatto.** Non gli servono dati aperti, gli servono *utenti veri* che
   votino. È bloccato da un'altra cosa, e tenerlo in questa riga lo faceva
   sembrare in attesa di un lavoro che non lo sbloccherebbe.

   > ✅ **Sbloccato il 2026-08-03 da una scoperta, non da un dato.** Nove
   > domande a Lorenzo hanno prodotto dodici decisioni; il piano completo è in
   > [`docs/piano-rating-servizi.md`](../docs/piano-rating-servizi.md).
   >
   > **La chiave era la domanda «cosa mostra la pagina finché i voti non
   > esistono».** La risposta: *il dato duro dal primo giorno.* Pulizia,
   > illuminazione, verde, trasporti e sicurezza sono già categorie di
   > `Report`, con volumi e tempi di chiusura veri. La scheda apre su quelli e
   > dichiara le stelle in attesa accanto — quindi non è mai vuota e non è mai
   > finta, e l'accostamento è il prodotto vero: «le segnalazioni si chiudono in
   > 9 giorni, i cittadini danno 2,4 su 5» dice qualcosa che nessuno dei due
   > numeri dice da solo.
   >
   > **Due decisioni che vincolano anche le altre funzioni dell'osservatorio:**
   >
   > - **Niente indice unico.** Due tabelloni — servizi allo sportello e
   >   condizioni della città — che non si fondono mai in una classifica sola:
   >   uno è una media di episodi, l'altro un umore, e affiancarli in una
   >   graduatoria afferma che sono commensurabili. Da qui il **cambio di
   >   nome**: «Pistoia Index» prometteva esattamente il numero che il disegno
   >   rifiuta, e un nome che promette un indice costringe prima o poi qualcuno
   >   a calcolarlo.
   > - **La cifra non convive mai con un volto.** Le risposte del Comune stanno
   >   nel flusso delle recensioni, la media nella testata. Senza questa
   >   separazione la media di un servizio diventa la pagella dell'assessore che
   >   risponde — cioè il prerequisito 4 aggirato per disposizione grafica.
   >
   > La soglia di pubblicazione della media — 20, dichiaratamente provvisoria —
   > è stata **sciolta in «nessuna soglia»** scrivendo `/metodologia`
   > (decisione di Lorenzo, 2026-08-05): la media compare **dal primo voto**,
   > sempre col campione accanto, perché una soglia tace il dato proprio dove
   > i votanti sono pochi. `CAMPIONE_MINIMO_PER_GIUDIZIO` (5) **resta dov'è**:
   > la mediana della colonna dura si presenta come il lato solido della
   > pagina, e le due regole divergono per questa ragione — non per
   > dimenticanza (`/metodologia`, regola 9).
   >
   > Questa funzione **ha consumato il prerequisito 3**: le sue scelte
   > editoriali sono pubblicate su `/metodologia` (fase R-6, chiusa il
   > 2026-08-05) invece di restare un lavoro a parte.
3. **Metodologia pubblica e versionata.** «Non è la mia opinione, sono i
   dati» è vero solo a metà: *quali* indicatori, con *quali* pesi e *quali*
   soglie, è una scelta editoriale. Se la scelta è pubblicata e verificabile,
   la pagella regge a una contestazione; se resta implicita, il numero è
   un'opinione travestita da aritmetica ed è lì che si viene smontati.

   Forma proposta: un documento versionato nel repository, reso su
   `/metodologia`, con per ogni indicatore **definizione, fonte, peso e
   soglia** più un registro delle modifiche. E ogni pagella **timbrata con la
   versione che l'ha calcolata** («metodologia v1.2»): senza il timbro, una
   pagella vecchia diventa incontestabile perché nessuno sa più con quali
   regole fu prodotta.

   > **Consumato dalle Valutazioni il 2026-08-05** (R-6): il documento è
   > `lib/metodologia.ts` — dodici regole coi numeri **interpolati dalle
   > costanti di dominio**, provato da `tests/unit/metodologia.test.ts` — reso
   > su `/metodologia` (pubblica, v1.0, registro append-only) e timbrato in
   > calce a scheda, panoramica e digest (`TimbroMetodologia`). La pagella,
   > quando arriverà, timbrerà con la stessa versione.
   >
   > **E la pagella è arrivata lo stesso giorno**: dalla v1.1 le sue regole
   > sono il **capitolo 2** dello stesso documento (13–20, interpolate da
   > `lib/pagella.ts`), pubblicate PRIMA che il primo voto sia calcolato — e
   > `EdizionePagella.versioneMetodologia` è il timbro scattato alla
   > scrittura. Piano in [`docs/piano-pagella.md`](docs/piano-pagella.md).
4. **La regola del campione minimo, estesa alle persone** — e per le persone
   non basta alzare la soglia. `lib/citystats.ts` ha stabilito che una
   percentuale su pochi casi, tinta di rosso, è un'accusa e non un dato, e lo
   ha stabilito per un *quartiere*; la soglia è ora generale
   (`campioneSufficiente()`, 2026-07-26).

   Ma su una persona il difetto non è la numerosità: è che **un voto sintetico
   comprime un record incompleto in un numero che sembra completo**. Proposta:
   **nessun voto numerico su un individuo, mai.** Il dossier porta solo
   affermazioni puntuali con la loro fonte; il voto 1–10 vive al livello della
   *giunta*, dove il campione è più grande e la responsabilità è davvero
   collettiva. È anche ciò che rende il punto 6 verificabile invece che
   auspicabile.

   Precedente già in produzione: sulle rotte della Fase B la **scala a tacche**
   è stata tolta da `/promesse` e `/question-time` perché l'intervallo 0→totale
   è vero in aritmetica ma **non è un traguardo che qualcuno abbia fissato** —
   la tacca a un sesto si leggeva «non avete fatto quasi niente» mentre due
   impegni erano in corso. Vale identico per una pagella.
5. **Diritto di replica tracciabile.** Ogni scheda persona e ogni pagella
   ospita la risposta dell'interessato, allo stesso peso visivo del giudizio.
   È la differenza fra un osservatorio e un tribunale senza difesa — e nella
   pratica è anche la difesa migliore contro una richiesta di rettifica.

   «Stesso peso visivo» va preso alla lettera e reso non aggirabile: stessa
   scala tipografica, dentro la stessa scheda, **mai** dietro un
   `<details>` e mai a un corpo più piccolo. E quando la replica non c'è, lo
   spazio non sparisce: dichiara *«replica richiesta il X, nessuna risposta al
   Y»*. Un silenzio dichiarato è un'informazione; un silenzio nascosto sembra
   assenso.

**Una nota sul «Dossier persona».** Stipendi, indennità e curricula pubblicati
sono dati pubblici e riportarli è legittimo. Il punto delicato non è il dato:
è l'inferenza. «Zero esperienza in urbanistica» non è un dato — è una
conclusione tratta da un curriculum che potrebbe semplicemente non elencarla.
La forma difendibile è dichiarativa e verificabile: *«Nel curriculum
depositato non compaiono incarichi in materia urbanistica»*, con il link al
documento. Dice la stessa cosa a chi legge, e regge in tribunale.

### 🏛️ Trasparenza & accountability

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Archivio decisioni | Esito di proposte/consultazioni con motivo e stato | `FE` `BE` | `A1 §12` | ✅ O3 (2026-06-12) |
| "Perché non si può fare?" | Motivazioni semplici dei rifiuti | `FE` `BE` `UX` | `A1 §13` | ✅ O3 (2026-06-12) |
| Promesse e risultati | Tracker impegni: promesso/in corso/completato/rimandato | `FE` `BE` | `A1 §30` + Promessa→Fatto | ✅ O3 (2026-06-12) |
| "Cosa cambia per me?" + impatto cantieri | Impatto pratico di opere/ordinanze; accessi, parcheggi, durata | `FE` `BE` `UX` | `A1 §24` + `A2 §30` | ✅ O3 (2026-06-12) |
| Bacheca avvisi urgenti | Allerte, chiusure, emergenze in evidenza + geolocalizzate | `FE` `BE` | `A1 §21` + idea 2026-06-11 | ✅ O3 (2026-06-12) |
| FAQ della città | Domande ricorrenti → risposte ufficiali con badge | `FE` `BE` | `A1 §11` | ✅ O3 (2026-06-12) |
| Civic digest pubblico mensile | Pagina-report mensile della città + export PDF 🆕 | `FE` `BE` | `A2 §19` | ✅ O3 (2026-06-12) |
| "Spiegamelo semplice" | Traduzione in linguaggio cittadino di atti/voci di bilancio | `FE` `UX` | `A2 §11` | 🔜 O3 (redazionale) · 💡 versione AI |
| Sistema fonti + freschezza | Fonte, data aggiornamento, tipo dato su ogni numero | `BE` | `A1 §25` | ✅ Fase 1 |
| Modalità demo / ufficiale | Badge "dati non ufficiali" in demo | `FE` `BE` | `A1 §26` | ✅ Fase 0 |
| Open data out | Export CSV/JSON + API read-only dei dati piattaforma | `BE` | `A1 §31` + idea esistente | 📋 |

### 🗺️ Quartieri & territorio

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Diario del quartiere | "Questa settimana nel quartiere": risolte, cantieri, eventi | `FE` `BE` | `A1 §9` | ✅ O4 (2026-06-13) |
| Heatmap civica / Pistoia Pulse | Layer mappa con densità segnalazioni + temi trending | `FE` `DES` | `A2 §6` + idea §22 | ✅ O4 (2026-06-13) |
| Problemi ricorrenti | "12 segnalazioni illuminazione in zona X: problema strutturale?" | `FE` `BE` | `A2 §7` | ✅ O4 (2026-06-13) |
| Da segnalazione a progetto | Cluster di segnalazioni → progetto pubblico tracciato | `FE` `BE` | `A2 §8` | ✅ O4 (2026-06-13) |
| Adotta un luogo | Cittadini/associazioni si prendono cura di parchi, aiuole… | `FE` `BE` | `A2 §16` + Patti collaborazione | ✅ O4 (2026-06-13) |
| Patti digitali di quartiere | Obiettivi condivisi per quartiere con aggiornamenti | `FE` `BE` | `A2 §31` | ✅ O4 (2026-06-13) |
| QR territoriali | QR su cantieri/bacheche → scheda con CTA follow; modalità totem | `FE` | idea 2026-06-11 | 📋 |

### 🗳️ Partecipazione & dialogo

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Question time digitale | Il Comune apre un tema, domande votate, risposte archiviate | `FE` `BE` | `A2 §22` | ✅ O4 (2026-06-13) |
| Vota la priorità | Voto dei verificati su interventi già validati | `FE` `BE` | `A2 §9` | ✅ O4 (2026-06-13) |
| Consultazioni con documenti | Documento + sintesi + domande guidate + risultati | `FE` `BE` | `A2 §23` | ✅ O4 (2026-06-13) |
| Volontariato e iniziative | Bacheca iniziative di Comune e associazioni, adesioni | `FE` `BE` | `A2 §14` | ✅ O4 (2026-06-13) |
| Stanze tematiche | Community organizzata anche per tema, non solo per quartiere | `FE` `BE` `UX` | `A1 §17` | ✅ O4 (2026-06-13) |
| Bilancio partecipativo simulato | "Come spenderesti 100.000 €": slider per categoria | `FE` `UX` | idea §19 | 📋 (mock possibile) |
| Banca del tempo civica | Offro/cerco tempo e competenze; richiede moderazione forte | `FE` `BE` | `A2 §15` | 💡 |
| Partecipazione aggregata, zero esposizione | Contatori aggregati, mai profili in vetrina | `BE` | `A1 §10` | ✅ regola di prodotto |

### 👤 Personalizzazione & profilo

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Civic ID Card + impatto civico | Passaporto civico personale: zona, segnalazioni, esiti | `FE` `BE` | `A2 §2` + Il mio impatto civico | ✅ O2 (2026-06-11) |
| Preferenze civiche | Temi preferiti all'onboarding → feed e notifiche mirate | `FE` `BE` | `A2 §3` | ✅ O2 (2026-06-11) |
| Newsletter civica in-app | Riepilogo personale settimanale dentro la piattaforma | `FE` `BE` | `A1 §20` | 📋 |
| Digest email settimanale | Stessa cosa via email (cron) | `BE` | idea esistente | 🧊 richiede mailer |

### 🧭 UX & semplicità

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Percorsi guidati | Home a obiettivi: "Cosa vuoi fare?" | `UX` | `A1 §23` | ✅ O2 (2026-06-11) |
| Ricerca globale (Cmd+K) | Full-text su opere, segnalazioni, proposte, eventi | `FE` `UX` | idea esistente | ✅ O2 (2026-06-11) |
| Command palette 2.0 | Azioni dirette oltre la ricerca | `FE` `UX` | 🆕 | ✅ O0 (2026-06-12) |
| Centro notifiche 2.0 | Raggruppamento per tema/quartiere, azioni inline | `FE` `UX` | 🆕 | ✅ O0 (2026-06-12) |
| Tour demo guidato | La piattaforma si presenta da sola, passo passo | `UX` | 🆕 | ✅ O0 (2026-06-12), persistito O4 |
| Modalità semplice / anziani | Menu ridotto, pulsanti grandi, flussi guidati | `FE` `UX` `A11Y` | `A1 §19` | ✅ O2 (2026-06-11) |
| Onboarding "primi passi in città" | Checklist progressiva delle prime azioni utili | `UX` | 🆕 | ✅ O4 (2026-06-13) |
| Scorciatoie da tastiera + pannello "?" | Navigazione esperta scopribile | `UX` `A11Y` | 🆕 | 📋 |

### ♿ Accessibilità & inclusione

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Base a11y (ARIA, contrasto, tastiera) | Review fatte e verificate | `A11Y` | `A1 §18` (parte) | ✅ |
| Test a11y automatici | axe-core dentro gli E2E: l'a11y non regredisce | `ENG` `A11Y` | 🆕 | 📋 da impostare (prossima ondata) |
| Alto contrasto, font grande, lettura audio | Preferenze di visualizzazione avanzate | `FE` `A11Y` | `A1 §18` | 📋 |
| Glossario termini amministrativi | Tooltip/pagina dei termini burocratici | `FE` `A11Y` | `A2 §27` (parte) | ✅ O3 (2026-06-12) |
| Multilingua + easy-to-read ("Pistoia Facile") | EN, AL, RO, ZH, UK + linguaggio facilitato | `FE` `A11Y` | `A2 §27` + Fase 4 | 💡 pre-lancio |

### 📰 Contenuti & storytelling

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Storie della città | Memoria urbana: racconti, foto storiche, prima/dopo | `FE` `DES` | `A2 §17` | 🔜 O5 |
| Pistoia racconta | Narrazione semplice di progetti e cambiamenti | `FE` `DES` | `A2 §18` | 🔜 O5 |

### 🎯 Nuovi pubblici

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Modalità turista | Vista per visitatori: eventi, musei, ZTL, numeri utili | `FE` `UX` | `A2 §28` | 🔜 O5 |
| Commercio locale | Sezione attività verificate: mercati, iniziative, cantieri | `FE` `BE` | `A2 §29` | 🔜 O5 |
| Vetrina aziende & sponsor | Profili aziendali ricchi + sponsorizzazioni dichiarate di spazi non civici | `FE` `BE` | 🆕 richiesta 2026-06-11 | 🔜 O5 |
| Servizi quotidiani | Scorciatoie a certificati, tributi, mense (link mock) | `FE` `UX` | `A1 §22` + idea esistente | 🔜 O5 |
| Spazio scuole | Mini-aree per scuola: avvisi, progetti, eventi | `FE` `BE` | `A2 §13` | 💡 |
| Versione bambini / scuola | Sezione educativa: come funziona il Comune, quiz civici | `FE` `UX` | `A2 §12` | 💡 |

### 🛡️ Admin & moderazione

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Analytics operative | KPI: per categoria/quartiere/ufficio, tempi, trend | `FE` `BE` `DES` | `A1 §27` | 🔜 O5 |
| Alert trend anomalo | Avviso su picchi improvvisi di segnalazioni | `BE` | `A2 §21` | 🔜 O5 (euristica) |
| Sentiment civico per tema | Segnale qualitativo del clima per tema | `FE` `BE` | `A2 §20` | 🔜 O5 (mock) |
| Moderazione assistita | Spam, duplicati, suggerimento categoria (euristiche) | `BE` | `A1 §28` | 🔜 O5 · 💡 versione AI |

### 🤖 AI civica *(tutte richiedono un LLM: restano 💡 finché il progetto è mock/locale)*

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Riassunto AI delle discussioni | Sintesi delle discussioni lunghe | `AI` | `A1 §29` | 💡 |
| "Spiegamelo semplice" generativo | Semplificazione automatica con etichetta AI | `AI` | `A2 §11` | 💡 |
| Categoria da foto | Vision sul caricamento immagine | `AI` | `A2 §5` | 💡 |
| Assistente FAQ civico | Chatbot sui servizi del Comune | `AI` | idea §20 | 💡 |
| Moderazione AI piena | Tossicità, bozze di risposta (sempre con revisione umana) | `AI` | `A1 §28` | 💡 |

### ⚙️ Piattaforma & qualità

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Review lenti mancanti | Sicurezza, correttezza cache, idiomi Next 16 (saltate il 2026-06-11) | `SEC` `ENG` | debito qualità | 📋 consigliata presto |
| Mock data "vivo" | Seed temporale deterministico: la demo evolve nel tempo | `BE` `ENG` | 🆕 | ✅ O1 (2026-06-12) |
| Lighthouse CI + performance budget | La velocità percepita non degrada | `ENG` | 🆕 | 📋 da impostare (prossima ondata) |
| Audit dipendenze in CI | npm audit / osv-scanner sulla supply chain | `SEC` | 🆕 | 📋 da impostare (prossima ondata) |
| PWA + offline + Web Push | App installabile, coda offline segnalazioni, push VAPID | `FE` `ENG` | idea esistente | 📋 |
| Mailer transazionale | Verifica email, password dimenticata; sblocca digest email | `BE` | residuo Fase 1 | 🧊 su richiesta — la base d'invio esiste da R-3 (`src/lib/email.ts`: file in locale, `fetch` verso il provider quando ci sarà il dominio; decisione 2026-08-03 in [`docs/piano-rating-servizi.md`](docs/piano-rating-servizi.md) §8) |
| Switch SQLite → Postgres/Neon | Necessario solo per deploy/dati reali; procedura documentata | `BE` `ENG` | residuo Fase 1 | 🧊 alla ripresa |

---

## 7. Regole di prodotto

Vincoli trasversali, validi per ogni funzione presente e futura:

1. **L'AI suggerisce, mai decide** — categoria, duplicati, sintesi: sempre conferma umana (`A1 §28`, `A2 §5`, `A2 §11`).
2. **Niente gamification competitiva** — la Civic ID Card è un passaporto, non una classifica (`A2 §2`).
3. **Privacy by default** — partecipazione mostrata in forma aggregata, mai esposizione dei singoli (`A1 §10`).
4. **Ogni dato dichiara fonte e freschezza** — e il mock resta dichiarato (`DEMO_MODE`) finché è mock (`A1 §25–26`).
5. **La semplicità non si negozia** — una funzione nuova non può aggiungere passi al percorso base: i dettagli arrivano dopo, facoltativi (progressive disclosure).
6. **Accessibilità come requisito** — non una feature: ogni ondata mantiene gli standard già raggiunti (`A1 §18`).
7. **Le mappe analizzano, non colpevolizzano** — heatmap e trend presentati come strumenti di priorità, mai come pagelle dei quartieri (`A2 §6`).
8. **Il design è progettato, non generato** — ogni schermata ha gerarchia intenzionale, motion sobrio e componenti del design system: niente pattern generici, niente estetica da template. La direzione estetica è definita in [DESIGN.md](DESIGN.md). 🆕
9. **Gli sponsor sono ospiti, non padroni** — le sponsorizzazioni delle aziende sono sempre etichettate come tali, vivono in spazi dedicati e non toccano mai i contenuti civici (segnalazioni, proposte, dati di bilancio, decisioni). 🆕

---

## 8. 🧊 In pausa — Dati reali (ex Fase 2)

> Congelata per scelta (2026-06-11): il progetto resta mock. Ricerca conservata per la ripresa.
> Strategia "national-first": il portale open-data del Comune è vuoto, quindi fonti nazionali filtrate per Pistoia (ISTAT 047014).

### Prerequisiti alla ripresa

| Attività | Dettaglio |
|---|---|
| Switch SQLite → PostgreSQL/Neon | Procedura in `DOCUMENTATION.md` §9; prima dei dati reali e del deploy |
| Mailer transazionale | Verifica email + recupero password |
| Censimento codici ente | Codice BDAP e P.IVA del Comune in `pistoia.config.ts` (oggi `null`) |

### Fonti open data censite

| Fonte | Alimenta | Note |
|---|---|---|
| **ISTAT** (`IstatData SDMX`, cod. 047014) | Demografica, spesa pro-capite | Primo candidato: bassa complessità, alto impatto |
| **Scuole MIM** (`dati.istruzione.it`) | Layer mappa scuole | Primo candidato per rodare la pipeline ETL |
| **OpenBDAP/BDAP** (RGS-MEF) | `BudgetYear`, missioni bilancio annuale | Canonica per legge (d.lgs 33/2013 art. 9-bis) |
| **SIOPE+** (Banca d'Italia) | `BudgetMonth`, pagamenti/incassi mensili | Unica fonte a cadenza mensile |
| **OpenCUP** | Opere — record base | CSV/CC-BY; ~1.7 GB nazionale, filtrare per `047014` |
| **ReGiS / OpenPNRR** | Opere — avanzamento PNRR | Solo opere PNRR; CSV/JSON/ODbL 1.0 |
| **ANAC** | Opere — appalti e contratti | CSV/JSON/OCDS; cadenza mensile; matching non banale |
| **DPC + CFR Toscana** | Allerte meteo-idro | CC-BY; banner colore-coded + push |
| **ARPAT / CKAN Toscana** | Qualità aria (PM10/PM2.5/NO₂/O₃) | Centraline Signorelli/Montale |
| **Farmacie** (`dati.salute.gov.it`) | Layer mappa + "più vicina" | Turni solo se fonte affidabile |
| **GTFS Autolinee Toscane** (`dati.toscana.it`) | Bus sulla mappa, "come ci arrivo" | Per eventi/quartieri |
| **AGCOM Broadband Map + Infratel** | Connettività BUL: % FTTH/FWA vs media toscana | Ex Fase 4 |
| **ACI-ISTAT incidenti** | Punti critici incidentalità sulla mappa viabilità | Ex Fase 4 |

### ETL (infrastruttura già pronta dalla Fase 1)

- Job separato, mai nel request path: download → filtro → upsert idempotente
- Scrive `sourceName` / `lastSyncedAt`; invalida i tag cache con `revalidateTag`
- Pagina **"Fonti dei dati"**: badge di attribuzione + date di aggiornamento per ogni fonte

---

## 9. 🧊 In pausa — Fiducia istituzionale (ex Fase 4)

> Necessaria solo in vista di un lancio pubblico reale.

| Attività | Dettaglio |
|---|---|
| **SPID/CIE login** | Identità verificata (OIDC/SAML) — sostituisce la verifica simulata |
| **2FA TOTP** | Obbligatorio per ruoli admin/moderatore |
| **HIBP password check** | Verifica password compromesse a registrazione e cambio |
| **GDPR completo** | Consenso cookie granulare, registro trattamenti, retention, oblio |
| **Dichiarazione accessibilità AgID** | Audit WCAG 2.1 AA formale + pagina `/accessibilita` |
| **Sezione Delibere e documenti** | `Delibera` + `Attachment`; calendario sedute; snapshot bilancio |
| **Rotazione `SESSION_SECRET`** | Secret multipli per rotazione senza logout forzato |

---

## 10. Rischi

| Rischio | Mitigazione |
|---|---|
| **Scope sprawl** (70+ idee a catalogo) | Ondate chiuse e tematiche; il catalogo è l'unico backlog; niente lavori fuori ondata |
| **Complessità UX** (tante funzioni → confusione) | Direttrice Semplicità: percorsi guidati, modalità semplice, progressive disclosure, regola di prodotto n. 5 |
| **Design debt** (restyling pagina per pagina → incoerenza) | Ondata 0: design token e componenti come fonte unica; regola di prodotto n. 8 |
| **Divergenza mock → reale** | Le feature nuove usano gli stessi contratti dati di `lib/sources.ts`; provenance e `DATA_MODE` già attivi |
| **Regressioni su codice security-critical** | Vitest 32 test + 5 E2E + CI con drift-check migrazioni; axe + Lighthouse + audit dipendenze dalla O0 |
| **Qualità/freschezza dati** (alla ripresa) | Ogni dato porta fonte + data; stati "non disponibile" onesti; no baseline finti in prod |
| **Portale open-data del Comune vuoto** (alla ripresa) | Strategia national-first (§8); monitor sul portale `pistoiaopen` |
| **SQLite + rate-limit in-memory in produzione** | Solo al deploy: store Upstash pronto (env `UPSTASH_*`), switch Postgres documentato |
| **Non conformità legale/GDPR/a11y** (al lancio) | Fix economici già fatti in Fase 0; layer completo in §9 prima del pubblico |
