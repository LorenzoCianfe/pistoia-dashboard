# Roadmap — Dashboard di Pistoia

> Documento vivo. Traccia tutto: ciò che è stato fatto, ciò che è in corso, le prossime mosse e le idee future.
> Ultimo aggiornamento: 2026-06-11

---

## ✅ Completate

### v1 — Piattaforma base `2026-06-08`

**Obiettivo:** prototipo funzionante end-to-end con dati mockup.

| # | Attività | Completata |
|---|---|---|
| 1 | Setup progetto: Next.js 16, React 19, Prisma 7 + SQLite, Tailwind v4, TypeScript | ✅ |
| 2 | Autenticazione reale: Argon2id, sessioni server-side opache (HMAC), cookie HttpOnly | ✅ |
| 3 | Sezione **Bilancio**: 142 mln, anelli animati, grafico mensile, spesa per missione | ✅ |
| 4 | Sezione **Opere**: griglia cantieri, KPI, avanzamento, aggiornamenti | ✅ |
| 5 | Sezione **Sondaggi**: voto ottimistico, percentuali largest-remainder, consultazioni ufficiali | ✅ |
| 6 | Sezione **Organigramma**: sindaco + giunta, follow/unfollow, follower count | ✅ |
| 7 | **Profilo**: dati, modifica, cambio password, logout globale | ✅ |
| 8 | **Notifiche**: centro notifiche, badge TopBar, segna-come-letta | ✅ |
| 9 | **Impostazioni**: preferenze notifiche, tema chiaro/scuro, sicurezza account | ✅ |
| 10 | **Area Comune** (admin): coda verifiche, gestione sondaggi, broadcast | ✅ |
| 11 | Design: mobile-first, colori di Pistoia (teal/viola/ambra), animazioni Motion, `prefers-reduced-motion` | ✅ |
| 12 | Script `start.bat` / `stop.bat`, `.env.example`, seed dati mockup | ✅ |

---

### Review sicurezza e qualità `2026-06-08`

**Obiettivo:** analisi multi-agente → 18 finding confermati e corretti.

| # | Attività | Completata |
|---|---|---|
| 1 | Rate-limit **per-account** anti-brute-force (indipendente dall'IP) | ✅ |
| 2 | Guard `SESSION_SECRET` obbligatorio in produzione (app rifiuta di avviarsi) | ✅ |
| 3 | Redirect `?next=` con validazione anti open-redirect | ✅ |
| 4 | Contrasto WCAG AA su testo secondario in entrambi i temi | ✅ |
| 5 | Percentuali sondaggi sempre sommanti a 100 (largest-remainder) | ✅ |
| 6 | Fix hydration mismatch sui tempi relativi (SSR vs client) | ✅ |
| 7 | Label/aria su form, nav e toast; skip-to-content | ✅ |
| 8 | `authorId` sui commenti; stato cantieri preservato in admin | ✅ |
| 9 | Migrazione `comment_author` applicata | ✅ |

---

### Community MVP — fase partecipativa `2026-06-09`

**Obiettivo:** trasformare la piattaforma da informativa a bidirezionale (Comune ↔ cittadino).

| # | Attività | Completata |
|---|---|---|
| 1 | **Profili verificati**: identità/residenza/associazione/attività + coda approvazione admin | ✅ |
| 2 | **Badge** e ruoli: CITIZEN / MODERATOR / MUNICIPAL_STAFF / ADMIN | ✅ |
| 3 | **Segnalazioni**: workflow di stato + "Anche io" + storico ufficiale | ✅ |
| 4 | **Proposte civiche**: soglie di sostegno (50/200/500) + risposta del Comune | ✅ |
| 5 | **Home "La mia città"**: saluto, KPI "vicino a te", segnalazioni vicine, proposte in evidenza | ✅ |
| 6 | Feed **Comunità** potenziato: tipo post, quartiere, badge autore, risposta ufficiale con ufficio | ✅ |
| 7 | **Gating** per consultazioni/sostegni riservati ai verificati | ✅ |
| 8 | **Preferenze notifiche** per canale (segnalazione/proposta/verifica/evento) | ✅ |
| 9 | **Registro azioni/audit** (`ModerationAction`) append-only | ✅ |
| 10 | Migrazione `community_mvp` (10 nuovi modelli Prisma) | ✅ |

---

### Community v2 — estensione partecipativa `2026-06-10`

**Obiettivo:** implementare i 9 blocchi rimanenti del proposal comunitario (§6, §8, §9, §10, §14, §17, §18, §21, §23).

| # | Proposta | Descrizione | Completata |
|---|---|---|---|
| §10 | **Mappa interattiva multilivello** | `/mappa` con Leaflet + tile OSM; layer attivabili per opere/segnalazioni/eventi/uffici/scuole/verde; pin vettoriali per categoria; popup con link; mini-mappa su segnalazione e opera; `map-canvas.tsx` client-only via dynamic import | ✅ |
| §9 | **Foto reali + geolocalizzazione** | Upload foto con downscale client-side (`<canvas>` → JPEG data-URL in DB); `navigator.geolocation`; anteprima con rimozione; visualizzazione `<figure>` nella scheda segnalazione | ✅ |
| §18 | **Pagina dettaglio opere ricca** | `/opere/[id]`: fonte finanziamento, RUP, foto prima/durante/dopo (griglia per fase), FAQ `<details>`, commenti cittadini, mini-mappa Leaflet, follow | ✅ |
| §17 | **Calendario eventi + pubblicazione associazioni** | `/eventi` raggruppato per mese; pubblicazione diretta dal Comune; proposta dalle associazioni verificate con approvazione (workflow `proposed→published/rejected`); coda moderatori | ✅ |
| §14 | **Moderazione avanzata** | Segnala commento; ban/sospensione con logout forzato; parole bloccate (cache 60s TTL); unione segnalazioni duplicate (`mergedIntoId`); pannello `ModerationPanel` in area admin | ✅ |
| §23 | **Privacy completa** | Consenso geolocalizzazione (`geoConsent`); export dati JSON dell'utente; cancellazione account con distruzione sessioni; pagine `/privacy`, `/cookie`, `/note-comunita`; footer istituzionale | ✅ |
| §8 | **"Questa risposta ti è stata utile?"** | `AnswerFeedback` su risposte ufficiali di post/proposte/segnalazioni; toggle Sì/No con `useOptimistic`; contatori visibili | ✅ |
| §21 | **Follow esteso** | Follow attivato su opere, quartieri, eventi, organizzazioni (oltre a segnalazioni e proposte già esistenti) | ✅ |
| §6 | **Pagine dedicate per quartiere** | `/quartieri` indice con attività e follow; `/quartieri/[slug]` aggrega segnalazioni, opere, eventi, proposte e discussioni dell'area | ✅ |
| — | Guard moderazione globale | `lib/moderation.ts` applicato a tutte le write action community (ban/sospensione + filtro parole bloccate) | ✅ |
| — | Licenza proprietaria full-copyright | `LICENSE` (IT + EN), `"license": "UNLICENSED"` in `package.json` | ✅ |
| — | Migrazione `community_v2` (7 nuovi modelli Prisma) | `Event`, `OperaPhoto`, `OperaFaq`, `OperaComment`, `AnswerFeedback`, `CommentReport`, `BlockedWord` | ✅ |

---

### Fase 0 — Hardening & Onestà `2026-06-11`

**Obiettivo:** prototipo sicuro, osservabile, testato e presentabile senza cambiare la fonte dati mockup.

| # | Attività | Esito | Completata |
|---|---|---|---|
| 1 | **Security headers + CSP** | CSP con **nonce per-request** + `strict-dynamic` in `proxy.ts` (il nonce arriva a next-themes via root layout); header statici in `next.config.ts` (XFO, nosniff, Referrer-Policy, Permissions-Policy, HSTS) + `serverActions.allowedOrigins` da env. Verificata live nel browser: zero violazioni | ✅ |
| 2 | **`env.ts` con validazione Zod** | Fail-fast al boot via `instrumentation.ts`; messaggi espliciti per variabile; `SESSION_SECRET` ≥32 char obbligatorio in prod | ✅ |
| 3 | **Rate-limit su write action** | `lib/limits.ts`: budget per-utente su ~12 action (post 10/h, commenti 30/h, segnalazioni 6/h, proposte 4/g, voti, follow, like, feedback, flag, verifica, export…) | ✅ |
| 4 | **Fix integrità voto cross-poll** | Già presente nel codice (`option.pollId !== pollId` in `voteAction`) — la voce di roadmap era stantia; verificato | ✅ |
| 5 | **`error.tsx` / `loading.tsx` / `not-found.tsx`** | `global-error` + `not-found` root, `error`/`not-found` per gruppo `(app)`/`(auth)`, skeleton generico + dedicati (bilancio/opere/comunità) con la classe `.skeleton` | ✅ |
| 6 | **`DEMO_MODE` flag** | `lib/demo.ts`: baseline finti azzerati fuori demo (voti/like/sostegni/conferme, recensioni 4.6★, KPI mock), zero-state onesti, badge "demo" nel footer | ✅ |
| 7 | **Vitest unit test** | 32 test: `toPercents`, `safeNext`, rate-limiter, validazione Zod, `colors`, word-filter, `env` — tutti verdi | ✅ |
| 8 | **CI GitHub Actions** | `.github/workflows/ci.yml`: lint → typecheck → unit → **drift migrazioni** → build; job E2E separato (non bloccante finché non rodato in CI) | ✅ |
| 9 | **Alternative testuali ai grafici SVG** | `LineChart`: `role="img"` + tabella `sr-only`; `RingGauge`: `aria-label` con valore | ✅ |
| 10 | **Error tracking** | `instrumentation.ts` con `onRequestError` (log strutturato JSON 1-riga, pronto per un collector); SDK Sentry rinviato a quando ci sarà un DSN (`SENTRY_DSN` già in env) | ✅ (senza SDK) |
| 11 | **Empty state per cittadini** | "Esegui il seed del database" rimosso dal Bilancio; zero-state onesti su bilancio/recensioni | ✅ |
| 12 | **`pistoia.config.ts`** | ISTAT `047014`, Belfiore `G713`, sito istituzionale, centro mappa; codice BDAP e P.IVA lasciati `null` **da censire dalle anagrafiche ufficiali** (mai inventare dati) | ✅ |
| — | Fix collaterali | Guard moderazione **mancante sulle proposte**; hydration mismatch ThemeToggle (`useSyncExternalStore`) e template Motion; 3 errori lint preesistenti; `safeNext` e word-filter estratti in moduli puri testabili | ✅ |

---

### Fase 1 — Abilitatori di piattaforma `2026-06-11`

**Obiettivo:** infrastruttura pronta per i dati reali, **mentre i dati sono ancora mock** (rischio zero). Mailer escluso su richiesta.

| # | Attività | Esito | Completata |
|---|---|---|---|
| 1 | **Redis/Upstash per rate-limit** | Store astratto in `lib/auth/rate-limit.ts`: memoria (default) o **Upstash REST** (pipeline atomica `INCR`+`PEXPIRE NX`+`PTTL`, zero dipendenze npm, timeout 3s, fallback in memoria); si attiva con le env `UPSTASH_*` | ✅ |
| 2 | **Revalidation a tag** | `lib/cache.ts`: `cachedShared()` (`unstable_cache` + tag + TTL + revival date) sulle letture **condivise** (bilancio, lista opere, eventi pubblicati, quartieri); `revalidateTag(tag, "max")` nelle action che mutano. Le letture per-utente restano fuori dalla cache per design (niente leak cross-utente) | ✅ |
| 3 | **Schema di provenienza dei dati** | Migrazione `provenance`: `sourceName`/`sourceUrl`/`externalId`/`lastSyncedAt` su `BudgetYear`/`Opera`; `lib/sources.ts` con `DATA_MODE_BILANCIO/OPERE` e contratti `BudgetSource`/`OpereSource` per l'ETL di Fase 2; `<SourceBadge/>` visibile su bilancio e opere | ✅ |
| 4 | **Integration test + E2E Playwright** | 5 E2E verdi: redirect rotte protette, login errato/valido, voto ottimistico, segnalazione end-to-end (fino al dettaglio) | ✅ |
| 5 | **SQLite → PostgreSQL/Neon** | **Predisposto, switch non eseguito** (serve un Postgres reale): procedura completa documentata in `DOCUMENTATION.md` §9, guard esplicito in `db.ts` se `DATABASE_URL` è Postgres. Da eseguire prima del deploy Vercel | 🔶 predisposto |
| 6 | **Mailer transazionale** | **Rinviato su richiesta** — resta il prerequisito per verifica email e "password dimenticata" | ⏸ rinviato |

---

### Review a11y/UX post-Fase 0–1 `2026-06-11`

**Obiettivo:** review multi-agente delle modifiche Fase 0/1 (lente a11y/UX completata; 8 finding confermati, 8 corretti).

| # | Finding (severità) | Fix | Completata |
|---|---|---|---|
| 1 | Errori del rate-limit mai mostrati nelle component ottimistiche (**alta**) | Nuovo `<ActionError/>` (live region sempre montata) + gestione `res.error` in poll-card, post-card (like/commento, col testo del commento **ripristinato** in caso di rifiuto), confirm-, follow- (×2) e support-button | ✅ |
| 2 | Skeleton: `aria-label` su div generico, caricamento mai annunciato (media) | `role="status"` + testo `sr-only` dedicato; blocchi skeleton `aria-hidden` (×4 loading.tsx) | ✅ |
| 3 | Error boundary senza gestione focus né annuncio (media) | Focus programmatico sull'`h1` (`tabIndex=-1` + ref) nei 3 boundary; log e codice `digest` anche in `(auth)` e `global-error` | ✅ |
| 4 | Tabella sr-only del LineChart con numeri grezzi non localizzati (media) | Prop `formatValue` con default `Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 })` | ✅ |
| 5 | `disabled={pending}` → perdita del focus da tastiera durante le transition (media) | `aria-disabled` + guard nell'handler al posto di `disabled` su tutti i bottoni ottimistici | ✅ |
| 6 | Toast "Voto registrato" montato insieme alla live region → spesso non annunciato (bassa) | Live region persistente `sr-only` nella card; toast visivo `aria-hidden` | ✅ |
| 7 | Link fonte (SourceBadge) si apre in nuova scheda senza avviso (bassa) | `sr-only` "(si apre in una nuova scheda)" | ✅ |
| 8 | RingGauge: valore non localizzato nell'aria-label + etichetta letta due volte (bassa) | `Intl.NumberFormat("it-IT")` nell'aria-label; etichetta visibile `aria-hidden` | ✅ |

Verificato dopo i fix: eslint pulito, `tsc` pulito, 32/32 unit, 5/5 E2E, `next build` ok.

---

## 🔄 In corso

Nessuna attività in corso al momento.

---

## 🔜 Prossime attività — Fase 2: Dati reali (Bilancio → Opere)

> Il salto da "demo che sembra vera" a "piattaforma che usa dati pubblici reali".

| Fonte | Alimenta | Note |
|---|---|---|
| **OpenBDAP/BDAP** (RGS-MEF) | Bilancio annuale (`BudgetYear`, missioni) | Solo granularità annuale; canonica per legge (d.lgs 33/2013 art. 9-bis) |
| **SIOPE+** (Banca d'Italia) | Bilancio mensile (`BudgetMonth`) | Unica fonte a cadenza mensile per pagamenti/incassi |
| **OpenCUP** | Opere (record base) | API/CSV · CC-BY; ~1.7 GB nazionale, filtrare per Pistoia ISTAT `047014` |
| **ReGiS/Italia Domani + OpenPNRR** | Opere (avanzamento PNRR) | Solo opere PNRR; CSV/JSON · ODbL 1.0 |
| **ANAC** | Opere (appalti/contratti) | CSV/JSON/OCDS; cadenza mensile; matching non banale |
| **ETL schedulato** | Tutte le fonti | Job separato (mai nel request path): download → filtro → upsert idempotente; scrive `sourceName`/`lastSyncedAt` e invalida i tag cache (`revalidateTag`) — l'infrastruttura è già pronta dalla Fase 1 |
| **Pagina "Fonti dei dati"** | Trasparenza | Badge di attribuzione per ogni fonte; date di aggiornamento visibili |

### Code residue di Fase 1 (da chiudere con la Fase 2)

| Attività | Dettaglio |
|---|---|
| **Switch effettivo SQLite → Postgres/Neon** | Procedura già documentata (`DOCUMENTATION.md` §9); da eseguire quando si sceglie l'hosting, **prima** di caricare dati reali |
| **Mailer transazionale** | Verifica email + "password dimenticata" (era escluso su richiesta dalla sessione 2026-06-11) |
| **Censimento codici ente** | Codice BDAP e P.IVA del Comune in `pistoia.config.ts` (oggi `null`): prenderli dalle anagrafiche ufficiali |
| **Completare la review multi-agente** | La review 2026-06-11 ha chiuso la lente a11y/UX (8/8 fix); le lenti **sicurezza**, **correttezza cache** e **idiomi Next 16** erano saltate per limiti di sessione — da ripassare |

---

## 💡 Idee e fasi future

### Idee nuove — sessione di ideazione multi-agente `2026-06-11`

> 16 proposte da due lenti (partecipazione civica; open data reali). Impatto/sforzo stimati.
> Coerenza richiesta con l'ethos: ogni dato porta fonte e freschezza, mai inventare.

**Partecipazione e prodotto**

| Idea | Cosa | Impatto / Sforzo | Fase suggerita |
|---|---|---|---|
| **Promessa → Fatto** | Tracker pubblico degli impegni del Comune: modello `Impegno` agganciato a risposte ufficiali/proposte/segnalazioni, scadenza + stato (in tempo / in ritardo / completato) sempre visibile. Chiude il loop dell'accountability; riusa pattern `ReportStatusHistory`, notifiche e cache a tag | alto / basso | 3 |
| **Il mio impatto civico** | Diario personale degli esiti nel profilo ("3 delle tue 5 segnalazioni risolte"); niente classifiche, solo efficacia personale. Query aggregate su modelli già esistenti, zero migrazioni | medio / basso | 3 |
| **PWA + offline + Web Push** | App installabile; coda offline per segnalazioni (IndexedDB → sync al ritorno della rete, utile nelle frazioni collinari); Web Push (VAPID) sui canali notifica esistenti | alto / medio | 3 |
| **Avvisi città geolocalizzati** | Chiusure strade, interruzioni idriche, allerte: banner in home, layer sulla mappa, notifica ai follower del quartiere | alto / medio | 2–3 |
| **Patti di collaborazione / adozioni civiche** | Cittadini e associazioni verificate adottano aiuole/parchi/spazi con workflow di approvazione (pattern eventi) + foto prima/dopo (pattern OperaPhoto) | alto / medio | nuova |
| **QR territoriali "Inquadra e segui"** | QR stampabili su cantieri/bacheche → scheda opera/quartiere con CTA follow; modalità totem a caratteri grandi per URP e biblioteche | medio / basso | 3 |
| **Servizi quotidiani** | `/servizi`: farmacie di turno, calendario raccolta rifiuti (Alia), mense scolastiche — il contenuto che crea l'abitudine d'uso settimanale | alto / medio | 2 |
| **Pistoia Facile** | Multilingua (EN, AL, RO, ZH, UK), easy-to-read, glossario contestuale dei termini burocratici nelle risposte ufficiali | medio / medio | 4 |

**Dati reali aggiuntivi (open data, oltre a BDAP/OpenCUP/ReGiS/ANAC già in Fase 2)**

| Idea | Fonte | Impatto / Sforzo | Fase suggerita |
|---|---|---|---|
| **Allerte meteo-idro** | DPC `pcm-dpc/DPC-Bollettini-Criticita` (CC-BY) + CFR Toscana; banner colore-coded + push; "nessuna allerta in corso" esplicito | alto / basso | 2 |
| **Aria oggi a Pistoia** | ARPAT via CKAN `dati.toscana.it` (PM10/PM2.5/NO₂/O₃, centraline Signorelli/Montale) + contatore superamenti annui vs limite di legge | alto / medio | 2 |
| **Pistoia in numeri (ISTAT)** | IstatData SDMX, codice 047014: piramide d'età, trend; abilita la spesa **pro-capite** e il confronto con comuni simili (Lucca, Arezzo, Massa) | alto / basso | 2 |
| **Scuole reali sulla mappa** | Anagrafe MIM `dati.istruzione.it` (codice meccanografico = `externalId`): sostituisce il layer mock; **primo candidato per rodare la pipeline ETL** | medio / basso | 2 |
| **Farmacie e presidi** | Ministero della Salute `dati.salute.gov.it` (lat/long); "farmacia più vicina" col consenso geo esistente; turni solo se esiste fonte affidabile | medio / basso | 2 |
| **Bus sulla mappa (GTFS)** | GTFS Autolinee Toscane via `dati.toscana.it`: fermate/linee sulla mappa, "come ci arrivo" su eventi e quartieri; dichiarare "orari programmati, non realtime" | alto / alto | nuova |
| **Connettività BUL** | AGCOM Broadband Map + Infratel: % copertura FTTH/FWA vs media toscana — digital divide delle frazioni | medio / medio | nuova |
| **Incidenti ACI-ISTAT** | Mappa dei punti critici di incidentalità sovrapposta alle segnalazioni viabilità: "dove i cittadini segnalano vs dove ci si fa male davvero"; alimenta Pistoia Pulse (§22) | medio / medio | nuova |

> Lenti **cybersecurity** e **performance** dell'ideazione: saltate per limiti di sessione — da rifare insieme alla review mancante (vedi "Code residue").

### Idee dal proposal comunitario (non ancora pianificate)

| § | Idea | Descrizione |
|---|---|---|
| §19 | **Bilancio partecipativo** | Simulatore interattivo: "come spenderesti 100.000€ sui progetti del Comune?". Input slider per categoria → confronto con la spesa reale. Richiede: dati reali BDAP (Fase 2). |
| §20 | **AI civica** | Assistente virtuale del Comune: risponde a FAQ sui servizi (orari anagrafe, documenti necessari, come fare una segnalazione, ecc.). Richiede: integrazione LLM + corpus dati Comune. |
| §22 | **Pistoia Pulse** | Radar civico: temi trending nelle discussioni, segnalazioni più confermate, mappa del calore della partecipazione per quartiere, confronto mese su mese. |

---

### Fase 3 — Completamento prodotto partecipativo

> Feature first-party che completano il loop cittadino ↔ amministrazione.

| Attività | Dettaglio |
|---|---|
| **Ricerca globale (Cmd+K)** | Ricerca full-text su opere, segnalazioni, proposte, eventi, post |
| **Open data out** | Endpoint CSV/JSON pubblici per i dati della piattaforma (API read-only) |
| **Digest email settimanale** | Cron: riepilogo segnalazioni vicine, nuovi eventi nel quartiere, proposte in scadenza |

---

### Fase 4 — Fiducia istituzionale

> Ciò che rende la piattaforma adottabile ufficialmente dal Comune.

| Attività | Dettaglio |
|---|---|
| **SPID/CIE login** | Identità verificata (OIDC/SAML) — sostituisce la verifica simulata attuale |
| **2FA TOTP** | Obbligatorio per ruoli admin/moderatore |
| **HIBP password check** | Verifica password compromesse (have i been pwned) alla registrazione e al cambio |
| **GDPR completo** | Consenso cookie granulare, registro dei trattamenti, retention policy, diritto all'oblio |
| **Dichiarazione di accessibilità formale** | Audit WCAG 2.1 AA completo; dichiarazione AgID pubblicata su `/accessibilita` |
| **Sezione Delibere e documenti** | Modello `Delibera` + `Attachment`; calendario sedute; snapshot di bilancio versionati |
| **Rotazione `SESSION_SECRET`** | Supporto a secret multipli per rotazione senza logout forzato di tutti gli utenti |

---

## Rischi principali

| Rischio | Mitigazione |
|---|---|
| **Portale open-data Comune vuoto** (`pistoiaopen` ha 0 dataset) | Strategia national-first (BDAP, OpenCUP, ReGiS, ANAC filtrati per Pistoia); monitor sul portale |
| **Qualità/freschezza dati vs ethos** | Ogni dato porta fonte + data aggiornamento; stati "dato non disponibile" onesti; no baseline finti in prod |
| **Non conformità legale/GDPR/a11y** | Fix economici fatti in Fase 0 (CSP, a11y grafici, boundary); layer completo (AgID, GDPR pieno) prima del lancio pubblico |
| **SQLite + rate-limit in-memory** | Rate-limit: store Upstash pronto (si attiva con le env). DB: switch Postgres predisposto e documentato, da eseguire prima del deploy |
| **Regressioni su codice security-critical** | ✅ Harness attivo: Vitest 32 test + 5 E2E + CI con drift-check delle migrazioni |
| **Scope sprawl (~67 finding)** | Gating rigido per fasi; sezioni non ancora "reali" restano mock dietro `DATA_MODE` |
