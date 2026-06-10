# Roadmap — Dashboard di Pistoia

> Documento vivo. Traccia tutto: ciò che è stato fatto, ciò che è in corso, le prossime mosse e le idee future.
> Ultimo aggiornamento: 2026-06-10

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

## 🔄 In corso

Nessuna attività in corso al momento.

---

## 🔜 Prossime attività — Fase 0: Hardening & Onestà

> Rendere il prototipo sicuro, osservabile, testato e presentabile **senza cambiare la fonte dati mockup**.
> Priorità alta: tutte queste sono pre-requisiti per qualsiasi deploy reale.

| Priorità | Attività | Dettaglio |
|---|---|---|
| 🔴 Alta | **Security headers + CSP** | `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy`, `serverActions.allowedOrigins` |
| 🔴 Alta | **`env.ts` con validazione Zod** | Validazione delle variabili d'ambiente all'avvio; crash esplicito con messaggio chiaro se mancanti o malformate |
| 🔴 Alta | **Rate-limit su write action** | Estendere il rate-limit (oggi solo su login/registrazione) a tutte le write action community (post, commento, segnalazione, proposta, voto) |
| 🔴 Alta | **Fix integrità voto cross-poll** | Verificare `option.pollId === pollId` in `voteAction` — buco attuale: un voto può essere inserito su un'opzione di un altro sondaggio |
| 🟡 Media | **`error.tsx` / `loading.tsx` / `not-found.tsx`** | Per ogni rotta dell'app; usa la classe `.skeleton` già esistente ma mai usata per i loading state |
| 🟡 Media | **`DEMO_MODE` flag** | Flag in `.env` per azzerare i baseline finti (`baseVotes`, `baseLikes`, stelle 4.6, risposte "verified" di default) — off in produzione, on in sviluppo |
| 🟡 Media | **Vitest unit test** | Test ad alto valore: `toPercents` (largest-remainder), `safeNext`, rate-limiter, validazione Zod, `colors.ts` |
| 🟡 Media | **CI GitHub Actions** | Pipeline: lint → typecheck → test → build → migration-drift check |
| 🟡 Media | **Alternative testuali ai grafici SVG** | `role="img"` + tabella `sr-only` su tutti i grafici (oggi fallimento WCAG 1.1.1) |
| 🟢 Bassa | **Sentry error tracking** | Catch di errori runtime + segnalazione anomalie in produzione |
| 🟢 Bassa | **Empty state per cittadini** | Rimuovere "Esegui il seed del database" dalla UI; aggiungere zero-state reali a feed/sondaggi/commenti |
| 🟢 Bassa | **`pistoia.config.ts`** | Costanti istituzionali: ISTAT `047014`, codice ente BDAP, P.IVA Comune |

---

## 💡 Idee e fasi future

### Idee dal proposal comunitario (non ancora pianificate)

| § | Idea | Descrizione |
|---|---|---|
| §19 | **Bilancio partecipativo** | Simulatore interattivo: "come spenderesti 100.000€ sui progetti del Comune?". Input slider per categoria → confronto con la spesa reale. Richiede: dati reali BDAP (Fase 2). |
| §20 | **AI civica** | Assistente virtuale del Comune: risponde a FAQ sui servizi (orari anagrafe, documenti necessari, come fare una segnalazione, ecc.). Richiede: integrazione LLM + corpus dati Comune. |
| §22 | **Pistoia Pulse** | Radar civico: temi trending nelle discussioni, segnalazioni più confermate, mappa del calore della partecipazione per quartiere, confronto mese su mese. |

---

### Fase 1 — Abilitatori di piattaforma

> Migrazioni da fare **mentre i dati sono ancora mock** (rischio zero di perdita dati reali).

| Attività | Dettaglio |
|---|---|
| **SQLite → PostgreSQL/Neon** | Cambio provider Prisma + adapter `@prisma/adapter-pg`; prerequisito per Vercel e per la scalabilità |
| **Redis/Upstash per rate-limit** | Spostare il rate-limiter (oggi in-memory, per-istanza) su Redis; si azzera al riavvio oggi |
| **Mailer transazionale** | Verifica email alla registrazione + "password dimenticata" — oggi impossibili perché non c'è mailer |
| **Revalidation a tag** | Sostituire `revalidatePath` con `revalidateTag` per cache più granulare |
| **Schema di provenienza dei dati** | Interfacce `BudgetSource`/`OpereSource`; campi `externalId`/`sourceUrl`/`sourceName`/`lastSyncedAt`; flag `DATA_MODE` per-sezione |
| **Integration test + E2E Playwright** | Coverage dei flussi critici: login, voto, segnalazione, approvazione verifica |

---

### Fase 2 — Dati reali (Bilancio → Opere)

> Il salto da "demo che sembra vera" a "piattaforma che usa dati pubblici reali".

| Fonte | Alimenta | Note |
|---|---|---|
| **OpenBDAP/BDAP** (RGS-MEF) | Bilancio annuale (`BudgetYear`, missioni) | Solo granularità annuale; canonica per legge (d.lgs 33/2013 art. 9-bis) |
| **SIOPE+** (Banca d'Italia) | Bilancio mensile (`BudgetMonth`) | Unica fonte a cadenza mensile per pagamenti/incassi |
| **OpenCUP** | Opere (record base) | API/CSV · CC-BY; ~1.7 GB nazionale, filtrare per Pistoia ISTAT `047014` |
| **ReGiS/Italia Domani + OpenPNRR** | Opere (avanzamento PNRR) | Solo opere PNRR; CSV/JSON · ODbL 1.0 |
| **ANAC** | Opere (appalti/contratti) | CSV/JSON/OCDS; cadenza mensile; matching non banale |
| **ETL schedulato** | Tutte le fonti | Job separato (mai nel request path): download → filtro → upsert idempotente |
| **Pagina "Fonti dei dati"** | Trasparenza | Badge di attribuzione per ogni fonte; date di aggiornamento visibili |

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
| **Non conformità legale/GDPR/a11y** | Fix economici in Fase 0; layer completo prima del lancio pubblico |
| **SQLite + rate-limit in-memory** | Migrazione Postgres+Redis in Fase 1 mentre i dati sono ancora mock (rischio zero) |
| **Regressioni su codice security-critical** | Harness Vitest+CI in Fase 0 **prima** di qualsiasi refactor |
| **Scope sprawl (~67 finding)** | Gating rigido per fasi; sezioni non ancora "reali" restano mock dietro `DATA_MODE` |
