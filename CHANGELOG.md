# Changelog — Dashboard di Pistoia

> Tutte le modifiche rilevanti del progetto, in ordine cronologico inverso.
> Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/); le versioni seguono
> [SemVer](https://semver.org/lang/it/) in fase 0.x (demo mock, nessuna API pubblica stabile).
> Il dettaglio tecnico di ogni voce è in [DOCUMENTATION.md §10](DOCUMENTATION.md); il piano è in [ROADMAP.md](ROADMAP.md).

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
