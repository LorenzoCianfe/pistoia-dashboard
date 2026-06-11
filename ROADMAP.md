# Roadmap — Dashboard di Pistoia

> Documento vivo. Traccia lo stato del progetto: fatto, in corso, prossimo, idee future.
> Ultimo aggiornamento: 2026-06-11

---

## ✅ Completate

| Fase | Data | Descrizione |
|---|---|---|
| **v1 — Piattaforma base** | 2026-06-08 | Prototipo funzionante end-to-end: Next.js 16, auth Argon2id, Bilancio/Opere/Sondaggi/Organigramma/Profilo/Notifiche/Impostazioni, Area Comune admin, design mobile-first Pistoia |
| **Security review** | 2026-06-08 | 18 finding corretti: rate-limit per-account, guard SESSION_SECRET, anti open-redirect, WCAG AA contrasto, percentuali sondaggi, hydration mismatch, ARIA |
| **Community MVP** | 2026-06-09 | Profili verificati, badge/ruoli, segnalazioni, proposte civiche, home "La mia città", feed Comunità, gating verificati, notifiche, audit log |
| **Community v2** | 2026-06-10 | Mappa Leaflet multilivello, foto + geolocalizzazione, dettaglio opere ricco, calendario eventi, moderazione avanzata, privacy completa, feedback risposte, follow esteso, pagine quartiere |
| **Fase 0 — Hardening** | 2026-06-11 | CSP+nonce, validazione Zod env, rate-limit write action, DEMO_MODE, error/loading/not-found, Vitest 32 test, CI GitHub Actions, aria grafici, error tracking, `pistoia.config.ts` |
| **Fase 1 — Abilitatori** | 2026-06-11 | Rate-limit Upstash-ready, cache a tag con `cachedShared()`, schema provenance dati, 5 E2E Playwright; Postgres predisposto (non eseguito); mailer rinviato |
| **Review a11y/UX** | 2026-06-11 | 8 finding corretti: ActionError su ottimistici, skeleton accessibili, focus sui boundary, numeri localizzati, aria-disabled, toast live region, SourceBadge nuova scheda, RingGauge |

> Il dettaglio di ogni fase è in [DOCUMENTATION.md](DOCUMENTATION.md).

---

## 🔄 In corso

Nessuna attività in corso.

---

## 🔜 Prossimo — Fase 2: Dati reali

> Passaggio da "demo che sembra vera" a "piattaforma con dati pubblici reali".
> Le integrazioni procedono nell'ordine: prima le fonti con API stabili e facile filtraggio per Pistoia (ISTAT 047014).

### Prerequisiti da chiudere (residui Fase 1)

| Attività | Dettaglio |
|---|---|
| **Switch SQLite → PostgreSQL/Neon** | Procedura documentata in `DOCUMENTATION.md` §9; da eseguire prima di caricare dati reali e prima del deploy Vercel |
| **Mailer transazionale** | Verifica email + "password dimenticata" — era escluso su richiesta dalla sessione 2026-06-11 |
| **Censimento codici ente** | Codice BDAP e P.IVA del Comune in `pistoia.config.ts` (oggi `null`): censire dalle anagrafiche ufficiali |
| **Review mancante** | La review 2026-06-11 ha chiuso solo a11y/UX — mancano le lenti **sicurezza**, **correttezza cache** e **idiomi Next 16** |

### Integrazioni open data

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

### ETL (infrastruttura già pronta dalla Fase 1)

- Job separato, mai nel request path: download → filtro → upsert idempotente
- Scrive `sourceName` / `lastSyncedAt`; invalida i tag cache con `revalidateTag`
- Pagina **"Fonti dei dati"**: badge di attribuzione + date di aggiornamento per ogni fonte

---

## 📋 Backlog

### Fase 3 — Prodotto partecipativo completo

| Idea | Dettaglio | Dipendenze |
|---|---|---|
| **Promessa → Fatto** | Tracker pubblico impegni del Comune: `Impegno` agganciato a risposte/proposte/segnalazioni, scadenza + stato visibile; chiude il loop accountability | — |
| **Il mio impatto civico** | Diario personale esiti nel profilo ("3 delle 5 tue segnalazioni risolte"); query aggregate su modelli esistenti, zero migrazioni | — |
| **PWA + offline + Web Push** | App installabile; coda offline segnalazioni (IndexedDB → sync); Web Push VAPID sui canali notifica | — |
| **Avvisi città geolocalizzati** | Chiusure strade, interruzioni idriche, allerte: banner home + layer mappa + notifica follower quartiere | Allerte meteo (Fase 2) |
| **Patti di collaborazione civica** | Adozione aiuole/parchi da cittadini/associazioni verificate; workflow approvazione + foto prima/dopo | — |
| **QR territoriali** | QR stampabili su cantieri/bacheche → scheda con CTA follow; modalità totem per URP/biblioteche | — |
| **Servizi quotidiani** | `/servizi`: farmacie di turno, calendario rifiuti Alia, mense scolastiche | Farmacie open data (Fase 2) |
| **Ricerca globale (Cmd+K)** | Full-text su opere, segnalazioni, proposte, eventi, post | — |
| **Open data out** | Endpoint CSV/JSON pubblici per i dati della piattaforma (API read-only) | — |
| **Digest email settimanale** | Cron: segnalazioni vicine, nuovi eventi, proposte in scadenza | Mailer (prerequisito Fase 1) |
| **Bus sulla mappa (GTFS)** | Fermate/linee Autolinee Toscane via `dati.toscana.it`; "come ci arrivo" su eventi/quartieri | — |
| **Bilancio partecipativo** (§19) | Simulatore "come spenderesti 100.000€": slider per categoria → confronto spesa reale | Dati reali BDAP (Fase 2) |
| **Pistoia Pulse** (§22) | Radar civico: temi trending, segnalazioni più confermate, mappa calore partecipazione per quartiere | — |

### Fase 4 — Fiducia istituzionale

| Attività | Dettaglio |
|---|---|
| **SPID/CIE login** | Identità verificata (OIDC/SAML) — sostituisce la verifica simulata attuale |
| **2FA TOTP** | Obbligatorio per ruoli admin/moderatore |
| **HIBP password check** | Verifica password compromesse alla registrazione e al cambio |
| **GDPR completo** | Consenso cookie granulare, registro trattamenti, retention policy, diritto all'oblio |
| **Dichiarazione di accessibilità formale** | Audit WCAG 2.1 AA; dichiarazione AgID su `/accessibilita` |
| **Sezione Delibere e documenti** | `Delibera` + `Attachment`; calendario sedute; snapshot bilancio versionati |
| **Rotazione `SESSION_SECRET`** | Supporto secret multipli per rotazione senza logout forzato |
| **Pistoia Facile** | Multilingua (EN, AL, RO, ZH, UK), easy-to-read, glossario termini burocratici |
| **AI civica** (§20) | Assistente FAQ sui servizi del Comune; richiede LLM + corpus dati Comune |
| **Connettività BUL** | AGCOM Broadband Map + Infratel: % copertura FTTH/FWA vs media toscana |
| **Incidenti ACI-ISTAT** | Punti critici di incidentalità sovrapposti alle segnalazioni viabilità |

---

## ⚠️ Rischi principali

| Rischio | Mitigazione |
|---|---|
| **Portale open-data Comune vuoto** (`pistoiaopen` ha 0 dataset) | Strategia national-first: BDAP, OpenCUP, ReGiS, ANAC filtrati per Pistoia; monitor sul portale |
| **Qualità/freschezza dati** | Ogni dato porta fonte + data aggiornamento; stati "dato non disponibile" onesti; no baseline finti in prod |
| **Non conformità legale/GDPR/a11y** | Fix economici in Fase 0 già fatti; layer completo (AgID, GDPR pieno) prima del lancio pubblico |
| **SQLite + rate-limit in-memory in produzione** | Rate-limit: store Upstash pronto (si attiva con le env `UPSTASH_*`). DB: switch Postgres predisposto e documentato |
| **Regressioni su codice security-critical** | Vitest 32 test + 5 E2E + CI con drift-check migrazioni |
| **Scope sprawl** | Gating rigido per fasi; sezioni non ancora "reali" restano mock dietro `DATA_MODE` |
