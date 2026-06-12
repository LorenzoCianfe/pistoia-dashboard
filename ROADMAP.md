# Roadmap — Dashboard di Pistoia

> Documento vivo: strategia, piano operativo e catalogo completo delle idee.
> **Ultimo aggiornamento:** 2026-06-11 · Il dettaglio tecnico delle fasi concluse è in [DOCUMENTATION.md](DOCUMENTATION.md).
>
> **Fonti delle idee:** proposal iniziale · [Addendum 1 — ulteriori proposte](pistoia-community-addendum-ulteriori-proposte.md) (rif. `A1 §n`) · [Addendum 2 — funzioni evolutive](pistoia-community-addendum-2-funzioni-evolutive.md) (rif. `A2 §n`) · sessione di ideazione 2026-06-11.

**Legenda stato:** ✅ fatto · 🔜 O1…O5 pianificato (n. ondata) · 📋 backlog (utile, non ancora assegnato) · 💡 futuro/sperimentale · 🧊 in pausa (dipende da mailer, Postgres, dati reali o LLM)

**Indice:** [1. Strategia](#1-strategia-attuale) · [2. Completato](#2-completato) · [3. Piano a ondate](#3-piano-operativo-a-ondate) · [4. Catalogo idee](#4-catalogo-delle-idee-per-tema) · [5. Regole di prodotto](#5-regole-di-prodotto) · [6. Dati reali (pausa)](#6-in-pausa--dati-reali-ex-fase-2) · [7. Fiducia istituzionale (pausa)](#7-in-pausa--fiducia-istituzionale-ex-fase-4) · [8. Rischi](#8-rischi)

---

## 1. Strategia attuale

> Decisione del 2026-06-11.

Il progetto **resta una demo con dati mock**: nessuna importazione di dati reali, vive in locale e su GitHub. L'evoluzione procede su **tre direttrici**:

| Direttrice | Significato |
|---|---|
| **Funzionalità** | Implementare le migliori idee dei due addenda: la piattaforma deve fare tante cose utili |
| **Semplicità** | Tantissime funzioni ma uso semplicissimo: percorsi guidati, progressive disclosure, zero frizione |
| **Estetica** | Design moderno e curato: ogni ondata rifinisce graficamente le pagine che tocca |

Il passaggio ai dati pubblici reali (ex "Fase 2") è **in pausa, non cancellato**: tutta la ricerca su fonti e ETL è conservata in [§6](#6-in-pausa--dati-reali-ex-fase-2). L'infrastruttura già costruita (provenance, `DATA_MODE`, `DEMO_MODE`, cache a tag) rende la ripresa possibile in qualsiasi momento senza rifare nulla.

---

## 2. Completato

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

> Già coperte dagli addenda e **fatte**: sistema fonti con freschezza (`A1 §25` → provenance + SourceBadge), modalità demo/ufficiale (`A1 §26` → DEMO_MODE), partecipazione aggregata senza esporre dati personali (`A1 §10` → contatori aggregati, ora regola di prodotto in [§5](#5-regole-di-prodotto)).

---

## 3. Piano operativo a ondate

> Cinque ondate tematiche, tutte realizzabili in mock. Ogni ondata è un blocco coerente di funzioni **+ restyling grafico delle pagine toccate**. Il dettaglio di ogni voce è nel [catalogo §4](#4-catalogo-delle-idee-per-tema).

### Ondata 1 — Segnalazioni 2.0 🔜 *(proposta come prossima)*

**Obiettivo:** completare il ciclo di vita della segnalazione, dal "segnala in 30 secondi" alla conferma del cittadino dopo la risoluzione. È il cluster a maggior valore percepito di entrambi gli addenda.

- Timeline pubblica della segnalazione (`A1 §3` — lo storico stati esiste già nel modello, manca la UI)
- Conferma del cittadino dopo la risoluzione, con riapertura (`A1 §5`)
- Foto prima/durante/dopo (`A1 §4`)
- Ufficio competente visibile (`A1 §6`)
- Tempi medi indicativi per categoria (`A1 §7`)
- Segnalazione urgente con validazione del moderatore (`A1 §8`)
- Suggerimento anti-duplicati alla creazione (`A1 §2`)
- "Segnala in 30 secondi": flusso rapido mobile-first (`A2 §4`)

### Ondata 2 — Semplicità & profilo civico ✅ *(completata 2026-06-11)*

**Obiettivo:** la piattaforma diventa semplicissima da usare e personale. Include il ridisegno della home.

- Percorsi guidati "Cosa vuoi fare?" in home (`A1 §23`)
- Ricerca globale Cmd+K su opere/segnalazioni/proposte/eventi
- Preferenze civiche personali: temi di interesse + feed filtrato (`A2 §3`)
- Civic ID Card + "Il mio impatto civico" nel profilo (`A2 §2`)
- Modalità semplice / anziani (`A1 §19`)
- Creazione guidata delle proposte, a domande (`A1 §14`)
- Impatto stimato e budget impact semplificato + categorie di cittadini impattate (`A1 §15`, `A2 §10`, `A2 §26`)

### Ondata 3 — Trasparenza che chiude il cerchio

**Obiettivo:** mostrare cosa succede *dopo* la partecipazione: decisioni, motivazioni, impegni, linguaggio semplice.

- Archivio decisioni del Comune (`A1 §12`)
- Sezione "Perché non si può fare?" sulle proposte respinte (`A1 §13`)
- "Promesse e risultati": tracker pubblico degli impegni (`A1 §30` + idea "Promessa → Fatto")
- "Cosa cambia per me?" su opere/avvisi + impatto cantieri su attività locali (`A1 §24`, `A2 §30`)
- Bacheca avvisi urgenti + avvisi geolocalizzati (`A1 §21` + idea esistente)
- FAQ della città con badge "risposta ufficiale" (`A1 §11`)
- Civic digest pubblico mensile (`A2 §19`)
- "Spiegamelo semplice" (versione redazionale sui contenuti seed; AI in futuro) (`A2 §11`)
- Glossario dei termini amministrativi (`A2 §27`, quick win)

### Ondata 4 — Territorio & partecipazione

**Obiettivo:** vita di quartiere e strumenti di dialogo strutturato tra cittadini e Comune.

- Diario del quartiere: riepilogo periodico per zona (`A1 §9`)
- Stanze tematiche (mobilità, ambiente, scuole…) (`A1 §17`)
- Question time digitale con domande votate (`A2 §22`)
- "Vota la priorità" su problemi validati (`A2 §9`)
- Heatmap civica / mappa del disagio — estende la mappa Leaflet esistente (merge con "Pistoia Pulse") (`A2 §6`)
- Problemi ricorrenti: evidenza dei pattern per zona/categoria (`A2 §7`)
- "Da segnalazione a progetto": cluster di segnalazioni → progetto pubblico (`A2 §8`)
- Volontariato e iniziative (`A2 §14`)
- "Adotta un luogo" (merge con "Patti di collaborazione civica") (`A2 §16`)
- Patti digitali di quartiere: obiettivi condivisi (`A2 §31`)
- Consultazioni strutturate con documenti allegati (`A2 §23`)

### Ondata 5 — Admin intelligence & nuovi pubblici

**Obiettivo:** strumenti decisionali per il Comune e apertura a turisti, commercianti, scuole.

- Dashboard admin con analytics operative (KPI per categoria/quartiere/ufficio, trend) (`A1 §27`)
- Alert trend anomalo (euristiche, niente AI) (`A2 §21`)
- Sentiment civico per tema (mock/euristiche) (`A2 §20`)
- Moderazione assistita (euristiche: spam, duplicati, suggerimento categoria) (`A1 §28`)
- Modalità turista (`A2 §28`)
- Commercio locale — il modello `OrganizationProfile` esiste già (`A2 §29`)
- Storie della città + "Pistoia racconta" (`A2 §17`, `A2 §18`)
- Servizi quotidiani / scorciatoie ai servizi comunali, link mock (`A1 §22` + idea esistente)

---

## 4. Catalogo delle idee per tema

> Tutte le idee dei due addenda e delle sessioni precedenti, deduplicate. Le righe con ondata assegnata sono pianificate; 📋 e 💡 attendono priorità.

### 🛠️ Segnalazioni

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Timeline pubblica | Cronologia visibile: inviata → validata → assegnata → risolta | `A1 §3` | 🔜 O1 |
| Conferma del cittadino | "È davvero risolta?" sì/no, con riapertura | `A1 §5` | 🔜 O1 |
| Foto prima/durante/dopo | Confronto fotografico degli interventi | `A1 §4` | 🔜 O1 |
| Ufficio competente | Chi gestisce la pratica, sempre visibile | `A1 §6` | 🔜 O1 |
| Tempi medi / SLA informativi | Tempi storici medi per categoria (non promesse) | `A1 §7` | 🔜 O1 |
| Segnalazione urgente | Flag urgenza con validazione moderatore | `A1 §8` | 🔜 O1 |
| Anti-duplicati | Suggerisce segnalazioni simili → "Anche io" | `A1 §2` | 🔜 O1 |
| Segnala in 30 secondi | Foto → posizione → categoria → invia | `A2 §4` | 🔜 O1 |
| Categoria da foto (AI) | Suggerimento automatico della categoria | `A2 §5` | 💡 richiede LLM |

### 💡 Proposte

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Creazione guidata | Wizard a domande: problema, dove, chi beneficia | `A1 §14` | ✅ O2 (2026-06-11) |
| Impatto stimato + budget impact | Costo €€, impatto, fattibilità, tempo (badge sintetici) | `A1 §15` + `A2 §10` | ✅ O2 (2026-06-11) |
| Categorie di cittadini impattate | Residenti, studenti, commercianti, anziani… | `A2 §26` | ✅ O2 (2026-06-11) |
| Collegamento proposte ↔ opere ↔ bilancio | Link manuale a progetti/voci esistenti | `A1 §16` | 🔜 O3 |
| Co-firmatari | Cittadini, associazioni e attività firmano insieme | `A2 §25` | 💡 |
| Proposta collaborativa | Bozza pubblica → suggerimenti → versione finale | `A2 §24` | 💡 |

### 🏛️ Trasparenza & accountability

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Archivio decisioni | Esito di proposte/consultazioni con motivo e stato | `A1 §12` | 🔜 O3 |
| "Perché non si può fare?" | Motivazioni semplici dei rifiuti | `A1 §13` | 🔜 O3 |
| Promesse e risultati | Tracker impegni: promesso/in corso/completato/rimandato | `A1 §30` + Promessa→Fatto | 🔜 O3 |
| "Cosa cambia per me?" + impatto cantieri | Impatto pratico di opere/ordinanze; accessi, parcheggi, durata | `A1 §24` + `A2 §30` | 🔜 O3 |
| Bacheca avvisi urgenti | Allerte, chiusure, emergenze in evidenza + geolocalizzate | `A1 §21` + idea 2026-06-11 | 🔜 O3 |
| FAQ della città | Domande ricorrenti → risposte ufficiali con badge | `A1 §11` | 🔜 O3 |
| Civic digest pubblico mensile | Pagina-report mensile della città (poi PDF) | `A2 §19` | 🔜 O3 |
| "Spiegamelo semplice" | Traduzione in linguaggio cittadino di atti/voci di bilancio | `A2 §11` | 🔜 O3 (redazionale) · 💡 versione AI |
| Sistema fonti + freschezza | Fonte, data aggiornamento, tipo dato su ogni numero | `A1 §25` | ✅ Fase 1 |
| Modalità demo / ufficiale | Badge "dati non ufficiali" in demo | `A1 §26` | ✅ Fase 0 |
| Open data out | Export CSV/JSON + API read-only dei dati piattaforma | `A1 §31` + idea esistente | 📋 |

### 🗺️ Quartieri & territorio

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Diario del quartiere | "Questa settimana nel quartiere": risolte, cantieri, eventi | `A1 §9` | 🔜 O4 |
| Heatmap civica / Pistoia Pulse | Layer mappa con densità segnalazioni + temi trending | `A2 §6` + idea §22 | 🔜 O4 |
| Problemi ricorrenti | "12 segnalazioni illuminazione in zona X: problema strutturale?" | `A2 §7` | 🔜 O4 |
| Da segnalazione a progetto | Cluster di segnalazioni → progetto pubblico tracciato | `A2 §8` | 🔜 O4 |
| Adotta un luogo | Cittadini/associazioni si prendono cura di parchi, aiuole… | `A2 §16` + Patti collaborazione | 🔜 O4 |
| Patti digitali di quartiere | Obiettivi condivisi per quartiere con aggiornamenti | `A2 §31` | 🔜 O4 |
| QR territoriali | QR su cantieri/bacheche → scheda con CTA follow; modalità totem | idea 2026-06-11 | 📋 |

### 🗳️ Partecipazione & dialogo

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Question time digitale | Il Comune apre un tema, domande votate, risposte archiviate | `A2 §22` | 🔜 O4 |
| Vota la priorità | Voto dei verificati su interventi già validati | `A2 §9` | 🔜 O4 |
| Consultazioni con documenti | Documento + sintesi + domande guidate + risultati | `A2 §23` | 🔜 O4 |
| Volontariato e iniziative | Bacheca iniziative di Comune e associazioni, adesioni | `A2 §14` | 🔜 O4 |
| Stanze tematiche | Community organizzata anche per tema, non solo per quartiere | `A1 §17` | 🔜 O4 |
| Bilancio partecipativo simulato | "Come spenderesti 100.000 €": slider per categoria | idea §19 | 📋 (mock possibile) |
| Banca del tempo civica | Offro/cerco tempo e competenze; richiede moderazione forte | `A2 §15` | 💡 |
| Partecipazione aggregata, zero esposizione | Contatori aggregati, mai profili in vetrina | `A1 §10` | ✅ regola di prodotto |

### 👤 Personalizzazione & profilo

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Civic ID Card + impatto civico | Passaporto civico personale: zona, segnalazioni, esiti | `A2 §2` + Il mio impatto civico | ✅ O2 (2026-06-11) |
| Preferenze civiche | Temi preferiti all'onboarding → feed e notifiche mirate | `A2 §3` | ✅ O2 (2026-06-11) |
| Newsletter civica in-app | Riepilogo personale settimanale dentro la piattaforma | `A1 §20` | 📋 |
| Digest email settimanale | Stessa cosa via email (cron) | idea esistente | 🧊 richiede mailer |

### 🧭 UX & semplicità

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Percorsi guidati | Home a obiettivi: "Cosa vuoi fare?" | `A1 §23` | ✅ O2 (2026-06-11) |
| Ricerca globale (Cmd+K) | Full-text su opere, segnalazioni, proposte, eventi | idea esistente | ✅ O2 (2026-06-11) |
| Modalità semplice / anziani | Menu ridotto, pulsanti grandi, flussi guidati | `A1 §19` | ✅ O2 (2026-06-11) |
| Restyling continuo | Ogni ondata rifinisce le pagine toccate | direttrice Estetica | trasversale |

### ♿ Accessibilità & inclusione

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Base a11y (ARIA, contrasto, tastiera) | Review fatte e verificate | `A1 §18` (parte) | ✅ |
| Alto contrasto, font grande, lettura audio | Preferenze di visualizzazione avanzate | `A1 §18` | 📋 |
| Glossario termini amministrativi | Tooltip/pagina dei termini burocratici | `A2 §27` (parte) | 🔜 O3 |
| Multilingua + easy-to-read ("Pistoia Facile") | EN, AL, RO, ZH, UK + linguaggio facilitato | `A2 §27` + Fase 4 | 💡 pre-lancio |

### 📰 Contenuti & storytelling

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Storie della città | Memoria urbana: racconti, foto storiche, prima/dopo | `A2 §17` | 🔜 O5 |
| Pistoia racconta | Narrazione semplice di progetti e cambiamenti | `A2 §18` | 🔜 O5 |

### 🎯 Nuovi pubblici

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Modalità turista | Vista per visitatori: eventi, musei, ZTL, numeri utili | `A2 §28` | 🔜 O5 |
| Commercio locale | Sezione attività verificate: mercati, iniziative, cantieri | `A2 §29` | 🔜 O5 |
| Servizi quotidiani | Scorciatoie a certificati, tributi, mense (link mock) | `A1 §22` + idea esistente | 🔜 O5 |
| Spazio scuole | Mini-aree per scuola: avvisi, progetti, eventi | `A2 §13` | 💡 |
| Versione bambini / scuola | Sezione educativa: come funziona il Comune, quiz civici | `A2 §12` | 💡 |

### 🛡️ Admin & moderazione

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Analytics operative | KPI: per categoria/quartiere/ufficio, tempi, trend | `A1 §27` | 🔜 O5 |
| Alert trend anomalo | Avviso su picchi improvvisi di segnalazioni | `A2 §21` | 🔜 O5 (euristica) |
| Sentiment civico per tema | Segnale qualitativo del clima per tema | `A2 §20` | 🔜 O5 (mock) |
| Moderazione assistita | Spam, duplicati, suggerimento categoria (euristiche) | `A1 §28` | 🔜 O5 · 💡 versione AI |

### 🤖 AI civica *(tutte richiedono un LLM: restano 💡 finché il progetto è mock/locale)*

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Riassunto AI delle discussioni | Sintesi delle discussioni lunghe | `A1 §29` | 💡 |
| "Spiegamelo semplice" generativo | Semplificazione automatica con etichetta AI | `A2 §11` | 💡 |
| Categoria da foto | Vision sul caricamento immagine | `A2 §5` | 💡 |
| Assistente FAQ civico | Chatbot sui servizi del Comune | idea §20 | 💡 |
| Moderazione AI piena | Tossicità, bozze di risposta (sempre con revisione umana) | `A1 §28` | 💡 |

### ⚙️ Piattaforma

| Idea | Cosa fa | Fonte | Stato |
|---|---|---|---|
| Review lenti mancanti | Sicurezza, correttezza cache, idiomi Next 16 (saltate il 2026-06-11) | debito qualità | 📋 consigliata presto |
| PWA + offline + Web Push | App installabile, coda offline segnalazioni, push VAPID | idea esistente | 📋 |
| Mailer transazionale | Verifica email, password dimenticata; sblocca digest email | residuo Fase 1 | 🧊 su richiesta |
| Switch SQLite → Postgres/Neon | Necessario solo per deploy/dati reali; procedura documentata | residuo Fase 1 | 🧊 alla ripresa |

---

## 5. Regole di prodotto

Vincoli trasversali, validi per ogni funzione presente e futura:

1. **L'AI suggerisce, mai decide** — categoria, duplicati, sintesi: sempre conferma umana (`A1 §28`, `A2 §5`, `A2 §11`).
2. **Niente gamification competitiva** — la Civic ID Card è un passaporto, non una classifica (`A2 §2`).
3. **Privacy by default** — partecipazione mostrata in forma aggregata, mai esposizione dei singoli (`A1 §10`).
4. **Ogni dato dichiara fonte e freschezza** — e il mock resta dichiarato (`DEMO_MODE`) finché è mock (`A1 §25–26`).
5. **La semplicità non si negozia** — una funzione nuova non può aggiungere passi al percorso base: i dettagli arrivano dopo, facoltativi (progressive disclosure).
6. **Accessibilità come requisito** — non una feature: ogni ondata mantiene gli standard già raggiunti (`A1 §18`).
7. **Le mappe analizzano, non colpevolizzano** — heatmap e trend presentati come strumenti di priorità, mai come pagelle dei quartieri (`A2 §6`).

---

## 6. 🧊 In pausa — Dati reali (ex Fase 2)

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

## 7. 🧊 In pausa — Fiducia istituzionale (ex Fase 4)

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

## 8. Rischi

| Rischio | Mitigazione |
|---|---|
| **Scope sprawl** (60+ idee a catalogo) | Ondate chiuse e tematiche; il catalogo è l'unico backlog; niente lavori fuori ondata |
| **Complessità UX** (tante funzioni → confusione) | Direttrice Semplicità: percorsi guidati, modalità semplice, progressive disclosure, regola di prodotto n. 5 |
| **Divergenza mock → reale** | Le feature nuove usano gli stessi contratti dati di `lib/sources.ts`; provenance e `DATA_MODE` già attivi |
| **Regressioni su codice security-critical** | Vitest 32 test + 5 E2E + CI con drift-check migrazioni; estendere i test a ogni ondata |
| **Qualità/freschezza dati** (alla ripresa) | Ogni dato porta fonte + data; stati "non disponibile" onesti; no baseline finti in prod |
| **Portale open-data del Comune vuoto** (alla ripresa) | Strategia national-first (§6); monitor sul portale `pistoiaopen` |
| **SQLite + rate-limit in-memory in produzione** | Solo al deploy: store Upstash pronto (env `UPSTASH_*`), switch Postgres documentato |
| **Non conformità legale/GDPR/a11y** (al lancio) | Fix economici già fatti in Fase 0; layer completo in §7 prima del pubblico |
