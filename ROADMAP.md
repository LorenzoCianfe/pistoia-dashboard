# Roadmap — Dashboard di Pistoia

> Documento strategico e operativo del progetto: visione, obiettivi, piano a ondate e catalogo completo delle idee.
> **Ultimo aggiornamento:** 2026-06-11 · Il dettaglio tecnico di quanto già costruito è in [DOCUMENTATION.md](DOCUMENTATION.md).

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

> Già coperte dagli addenda e **fatte**: sistema fonti con freschezza (`A1 §25` → provenance + SourceBadge), modalità demo/ufficiale (`A1 §26` → DEMO_MODE), partecipazione aggregata senza esporre dati personali (`A1 §10` → contatori aggregati, ora regola di prodotto in [§7](#7-regole-di-prodotto)).

---

## 4. Piano operativo a ondate

> Ondate tematiche chiuse, tutte realizzabili in mock. Ogni ondata è un blocco coerente di funzioni **+ restyling delle pagine toccate**. Il dettaglio di ogni voce è nel [catalogo §6](#6-catalogo-delle-idee-per-tema). La numerazione storica è preservata: l'Ondata 2 è già completata ([§3](#3-completato)); la nuova ondata di fondazione visiva prende il numero **O0** perché è propedeutica a tutte.

### Ondata 0 — Fondamenta visive & design system ✅ *(completata 2026-06-12)*

**Obiettivo (→ OB-2, OB-4):** trasformare l'estetica da "curata" a "distintiva" e costruire la fondazione su cui ogni ondata successiva appoggia. La direzione estetica è formalizzata in [DESIGN.md](DESIGN.md); il dettaglio del consegnato è in [§3](#3-completato). La rifinitura "tutti gli stati su tutti i componenti" prosegue come lavoro trasversale a ogni ondata (regola di prodotto n. 8).

### Ondata 1 — Segnalazioni 2.0 ✅ *(completata 2026-06-12)*

**Obiettivo (→ OB-1):** completare il ciclo di vita della segnalazione, dal "segnala in 30 secondi" alla conferma del cittadino dopo la risoluzione. Dettaglio del consegnato in [§3](#3-completato).

### Ondata 2 — Semplicità & profilo civico ✅ *(completata 2026-06-11, dettagli in [§3](#3-completato))*

### Ondata 3 — Trasparenza che chiude il cerchio 🔜

**Obiettivo (→ OB-1, OB-3):** mostrare cosa succede *dopo* la partecipazione: decisioni, motivazioni, impegni, linguaggio semplice.

| Voce | Livello | Fonte |
|---|---|---|
| Archivio decisioni del Comune | `FE` `BE` | `A1 §12` |
| Sezione "Perché non si può fare?" sulle proposte respinte | `FE` `BE` `UX` | `A1 §13` |
| "Promesse e risultati": tracker pubblico degli impegni | `FE` `BE` | `A1 §30` + Promessa→Fatto |
| "Cosa cambia per me?" su opere/avvisi + impatto cantieri su attività locali | `FE` `BE` `UX` | `A1 §24` + `A2 §30` |
| Bacheca avvisi urgenti + avvisi geolocalizzati | `FE` `BE` | `A1 §21` + idea 2026-06-11 |
| FAQ della città con badge "risposta ufficiale" | `FE` `BE` | `A1 §11` |
| Civic digest pubblico mensile (+ export PDF 🆕) | `FE` `BE` | `A2 §19` |
| "Spiegamelo semplice" (versione redazionale sui contenuti seed; AI in futuro) | `FE` `UX` | `A2 §11` |
| Glossario dei termini amministrativi (quick win) | `FE` `A11Y` | `A2 §27` |
| "Stato della città": hero in home con indicatori sintetici e sparkline | `FE` `DES` | 🆕 |

### Ondata 4 — Territorio & partecipazione 🔜

**Obiettivo (→ OB-1, OB-3):** vita di quartiere e strumenti di dialogo strutturato tra cittadini e Comune.

| Voce | Livello | Fonte |
|---|---|---|
| Diario del quartiere: riepilogo periodico per zona | `FE` `BE` | `A1 §9` |
| Stanze tematiche (mobilità, ambiente, scuole…) | `FE` `BE` `UX` | `A1 §17` |
| Question time digitale con domande votate | `FE` `BE` | `A2 §22` |
| "Vota la priorità" su problemi validati | `FE` `BE` | `A2 §9` |
| Heatmap civica / mappa del disagio — estende la mappa Leaflet (merge con "Pistoia Pulse") | `FE` `DES` | `A2 §6` |
| Problemi ricorrenti: evidenza dei pattern per zona/categoria | `FE` `BE` | `A2 §7` |
| "Da segnalazione a progetto": cluster di segnalazioni → progetto pubblico | `FE` `BE` | `A2 §8` |
| Volontariato e iniziative | `FE` `BE` | `A2 §14` |
| "Adotta un luogo" (merge con "Patti di collaborazione civica") | `FE` `BE` | `A2 §16` |
| Patti digitali di quartiere: obiettivi condivisi | `FE` `BE` | `A2 §31` |
| Consultazioni strutturate con documenti allegati | `FE` `BE` | `A2 §23` |

### Ondata 5 — Admin intelligence & nuovi pubblici 🔜

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
| Test a11y automatici (axe-core dentro gli E2E Playwright) | `ENG` `A11Y` | 📋 da impostare (prossima ondata) |
| Lighthouse CI con performance budget | `ENG` | 📋 da impostare (prossima ondata) |
| Audit dipendenze in CI (`npm audit` / osv-scanner) | `SEC` `ENG` | 📋 da impostare (prossima ondata) |
| Estensione test Vitest/E2E a ogni ondata | `ENG` | regola fissa |

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
| **Export PDF del civic digest** | `BE` | Estensione naturale del digest (`A2 §19`), utile per comunicazione | 🔜 O3 |
| **"Stato della città" hero con indicatori** | `FE` `DES` | Colpo d'occhio immediato sulla salute della città appena si entra | 🔜 O3 |
| **Test a11y automatici (axe in E2E)** | `ENG` `A11Y` | L'a11y già raggiunta non deve regredire mai | ♾️ qualità continua |
| **Lighthouse CI + performance budget** | `ENG` | La percezione di qualità passa anche dalla velocità; il budget la difende | ♾️ qualità continua |
| **Audit dipendenze in CI** | `SEC` | Sicurezza della supply chain a costo quasi zero | ♾️ qualità continua |
| **Vetrina aziende & sponsorizzazioni** | `FE` `BE` | Le aziende di Pistoia si fanno conoscere e sostengono la piattaforma; `OrganizationProfile` esiste già. Sponsor sempre dichiarati (regola n. 9) | 🔜 O5 |
| **Onboarding "primi passi in città" (checklist progressiva)** | `UX` | Accompagna il nuovo utente alle prime tre azioni utili | 📋 |
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
| "Stato della città" hero | Indicatori sintetici con sparkline in home | `FE` `DES` | 🆕 | 🔜 O3 |
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

### 🏛️ Trasparenza & accountability

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Archivio decisioni | Esito di proposte/consultazioni con motivo e stato | `FE` `BE` | `A1 §12` | 🔜 O3 |
| "Perché non si può fare?" | Motivazioni semplici dei rifiuti | `FE` `BE` `UX` | `A1 §13` | 🔜 O3 |
| Promesse e risultati | Tracker impegni: promesso/in corso/completato/rimandato | `FE` `BE` | `A1 §30` + Promessa→Fatto | 🔜 O3 |
| "Cosa cambia per me?" + impatto cantieri | Impatto pratico di opere/ordinanze; accessi, parcheggi, durata | `FE` `BE` `UX` | `A1 §24` + `A2 §30` | 🔜 O3 |
| Bacheca avvisi urgenti | Allerte, chiusure, emergenze in evidenza + geolocalizzate | `FE` `BE` | `A1 §21` + idea 2026-06-11 | 🔜 O3 |
| FAQ della città | Domande ricorrenti → risposte ufficiali con badge | `FE` `BE` | `A1 §11` | 🔜 O3 |
| Civic digest pubblico mensile | Pagina-report mensile della città + export PDF 🆕 | `FE` `BE` | `A2 §19` | 🔜 O3 |
| "Spiegamelo semplice" | Traduzione in linguaggio cittadino di atti/voci di bilancio | `FE` `UX` | `A2 §11` | 🔜 O3 (redazionale) · 💡 versione AI |
| Sistema fonti + freschezza | Fonte, data aggiornamento, tipo dato su ogni numero | `BE` | `A1 §25` | ✅ Fase 1 |
| Modalità demo / ufficiale | Badge "dati non ufficiali" in demo | `FE` `BE` | `A1 §26` | ✅ Fase 0 |
| Open data out | Export CSV/JSON + API read-only dei dati piattaforma | `BE` | `A1 §31` + idea esistente | 📋 |

### 🗺️ Quartieri & territorio

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Diario del quartiere | "Questa settimana nel quartiere": risolte, cantieri, eventi | `FE` `BE` | `A1 §9` | 🔜 O4 |
| Heatmap civica / Pistoia Pulse | Layer mappa con densità segnalazioni + temi trending | `FE` `DES` | `A2 §6` + idea §22 | 🔜 O4 |
| Problemi ricorrenti | "12 segnalazioni illuminazione in zona X: problema strutturale?" | `FE` `BE` | `A2 §7` | 🔜 O4 |
| Da segnalazione a progetto | Cluster di segnalazioni → progetto pubblico tracciato | `FE` `BE` | `A2 §8` | 🔜 O4 |
| Adotta un luogo | Cittadini/associazioni si prendono cura di parchi, aiuole… | `FE` `BE` | `A2 §16` + Patti collaborazione | 🔜 O4 |
| Patti digitali di quartiere | Obiettivi condivisi per quartiere con aggiornamenti | `FE` `BE` | `A2 §31` | 🔜 O4 |
| QR territoriali | QR su cantieri/bacheche → scheda con CTA follow; modalità totem | `FE` | idea 2026-06-11 | 📋 |

### 🗳️ Partecipazione & dialogo

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Question time digitale | Il Comune apre un tema, domande votate, risposte archiviate | `FE` `BE` | `A2 §22` | 🔜 O4 |
| Vota la priorità | Voto dei verificati su interventi già validati | `FE` `BE` | `A2 §9` | 🔜 O4 |
| Consultazioni con documenti | Documento + sintesi + domande guidate + risultati | `FE` `BE` | `A2 §23` | 🔜 O4 |
| Volontariato e iniziative | Bacheca iniziative di Comune e associazioni, adesioni | `FE` `BE` | `A2 §14` | 🔜 O4 |
| Stanze tematiche | Community organizzata anche per tema, non solo per quartiere | `FE` `BE` `UX` | `A1 §17` | 🔜 O4 |
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
| Tour demo guidato | La piattaforma si presenta da sola, passo passo | `UX` | 🆕 | ✅ O0 (2026-06-12) |
| Modalità semplice / anziani | Menu ridotto, pulsanti grandi, flussi guidati | `FE` `UX` `A11Y` | `A1 §19` | ✅ O2 (2026-06-11) |
| Onboarding "primi passi in città" | Checklist progressiva delle prime azioni utili | `UX` | 🆕 | 📋 |
| Scorciatoie da tastiera + pannello "?" | Navigazione esperta scopribile | `UX` `A11Y` | 🆕 | 📋 |

### ♿ Accessibilità & inclusione

| Idea | Cosa fa | Livello | Fonte | Stato |
|---|---|---|---|---|
| Base a11y (ARIA, contrasto, tastiera) | Review fatte e verificate | `A11Y` | `A1 §18` (parte) | ✅ |
| Test a11y automatici | axe-core dentro gli E2E: l'a11y non regredisce | `ENG` `A11Y` | 🆕 | 📋 da impostare (prossima ondata) |
| Alto contrasto, font grande, lettura audio | Preferenze di visualizzazione avanzate | `FE` `A11Y` | `A1 §18` | 📋 |
| Glossario termini amministrativi | Tooltip/pagina dei termini burocratici | `FE` `A11Y` | `A2 §27` (parte) | 🔜 O3 |
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
| Mailer transazionale | Verifica email, password dimenticata; sblocca digest email | `BE` | residuo Fase 1 | 🧊 su richiesta |
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
