# Dashboard di Pistoia — Documentazione

> Documento vivo. Viene aggiornato a ogni cambiamento rilevante del progetto.
> Ultimo aggiornamento: 2026-08-07 (cancello dei 44px · riordino del backlog)

---

## Indice

| § | Sezione | Cosa trovi |
|---|---|---|
| [§1](#1-cosè) | **Cos'è** | Descrizione del progetto, vision, link al repository GitHub |
| [§2](#2-stack-tecnico) | **Stack tecnico** | Framework, DB, auth, mappe, icone, animazioni |
| [§3](#3-come-avviare-il-progetto) | **Come avviare il progetto** | Istruzioni rapide (start.bat) e manuali, script npm, variabili d'ambiente, account di test |
| [§3.1](#script-npm-utili) | ↳ Script npm | Tabella completa comandi disponibili |
| [§3.2](#variabili-dambiente-env) | ↳ Variabili d'ambiente | `DATABASE_URL`, `SESSION_SECRET` |
| [§3.3](#account-dimostrativi-creati-dal-seed) | ↳ Account dimostrativi | Email e password dei 7 profili creati dal seed |
| [§4](#4-architettura) | **Architettura** | Struttura cartelle, routing, pattern dati (Server Components + Actions) |
| [§4.1](#struttura-cartelle) | ↳ Struttura cartelle | Albero `pistoia-dashboard/` annotato |
| [§4.2](#routing--layout) | ↳ Routing & layout | Gruppi `(auth)` e `(app)`, rotte protette |
| [§4.3](#pattern-dati) | ↳ Pattern dati | DAL → Server Component → Client Component + `useOptimistic` |
| [§5](#5-modello-di-sicurezza-auth) | **Modello di sicurezza** | Argon2id, sessioni opache HMAC, rate-limit multi-livello, CSRF, Zod |
| [§5.1](#ruoli-verifica-e-livelli-di-accesso-fase-community) | ↳ Ruoli e verifica | Ruoli, tipi di profilo, gating, moderazione, privacy |
| [§6](#6-modello-dati-prisma) | **Modello dati (Prisma)** | Tabella di tutti i modelli con descrizione; migrazioni applicate |
| [§7](#7-sezioni-e-funzionalità) | **Sezioni e funzionalità** | Tabella completa: 16 sezioni con stato e note |
| [§8](#8-design) | **Design** | Palette colori, tipografia, animazioni, dark mode |
| [§9](#9-deploy--hosting) | **Deploy / hosting** | Vercel + Neon (consigliato) vs Render/Railway/Fly.io |
| [§10](#10-decisioni-e-changelog) | **Decisioni e changelog** | Cronologia delle sessioni di sviluppo con finding e scelte tecniche |
| [§11](#11-roadmap) | **Roadmap** | Link a `ROADMAP.md` (completate, in corso, prossime, idee) |

---

## 1. Cos'è

La **Dashboard di Pistoia** è una piattaforma civica che trasforma i dati pubblici del Comune di
Pistoia in qualcosa che un cittadino possa davvero leggere, capire e usare. Sezioni principali —
**Bilancio, Opere, Sondaggi, Comunità, Segnalazioni, Proposte** — più una **home personalizzata "La
mia città"**, profilo (con **verifica simulata** e badge), impostazioni, notifiche, organigramma e
un'**area Comune** per verifiche, moderazione e gestione.

Dalla **fase 2** (community civica) la piattaforma non è più solo informativa: è un punto di contatto
**Comune ↔ cittadino** basato su fiducia (profili verificati che sbloccano funzioni), tracciabilità
(segnalazioni e proposte con stato pubblico), territorialità (quartieri/frazioni) e moderazione.
Vision community: [`pistoia-community-proposal.md`](./pistoia-community-proposal.md).

Vision e concept originali: vedi [`pistoia-dashboard-concept.txt`](./pistoia-dashboard-concept.txt).

**Repository GitHub:** <https://github.com/LorenzoCianfe/pistoia-dashboard> (pubblico).

> **Stato attuale:** prototipo **funzionante e completo** con **dati mockup** (seed nel database).
> Nessun collegamento a fonti dati esterne/reali. L'autenticazione e tutta la logica community
> (verifiche, segnalazioni, proposte, moderazione) sono **reali**; la sola "simulazione" è che la
> **verifica d'identità** è concessa dall'admin invece che via SPID/CIE (vedi roadmap §11, fase 4).

---

## 2. Stack tecnico

| Ambito | Scelta |
|---|---|
| Framework | **Next.js 16** (App Router) + React 19 + TypeScript |
| Styling | **Tailwind CSS v4** + design tokens custom (colori di Pistoia) |
| Database | **SQLite** via **Prisma 7** (driver adapter `better-sqlite3`) |
| Auth | Sessioni server-side in DB, password con **Argon2id** (`@node-rs/argon2`), cookie HttpOnly |
| Validazione | **Zod v4** |
| Animazioni | **Motion** (`motion/react`) |
| Tema chiaro/scuro | **next-themes** (classe su `<html>`) |
| Icone | **lucide-react** |
| Grafici | Componenti **SVG custom** animati (anelli, linee morbide, barre) — con alternativa testuale `sr-only` (WCAG 1.1.1) |
| Mappe | **Leaflet** (tile OSM, marker vettoriali, caricato via dynamic import client-only) |
| Test | **Vitest** (unit, `tests/unit/`) + **Playwright** (E2E, `tests/e2e/`) |
| CI | **GitHub Actions** (`.github/workflows/ci.yml`): lint → typecheck → unit → drift migrazioni → build (+ job E2E) |

L'app vive nella sottocartella [`pistoia-dashboard/`](./pistoia-dashboard/).

> Nota: questa è Next.js **16** (Turbopack di default; `middleware` → `proxy`; `cookies()`/`headers()`/
> `params` asincroni). Prisma **7** usa il query compiler Wasm + driver adapter (niente engine Rust).

---

## 3. Come avviare il progetto

**Windows (rapido):** doppio click su `start.bat` nella cartella del progetto — crea il `.env` (con un
`SESSION_SECRET` casuale), installa le dipendenze, prepara il DB con i dati di esempio, avvia il
server su <http://localhost:3000> e apre il browser. Per fermare: `stop.bat`.

**Manuale**, dalla cartella `pistoia-dashboard/`:

```bash
# 1. Installa le dipendenze (genera anche il client Prisma via postinstall)
npm install

# 2. Crea il database SQLite + applica le migrazioni
npm run db:migrate        # oppure: npm run setup (migrate + seed in un colpo)

# 3. Popola il database con i dati mockup
npm run db:seed

# 4. Avvia in sviluppo
npm run dev
```

Poi apri http://localhost:3000.

### Script npm utili
| Script | Cosa fa |
|---|---|
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` / `npm start` | Build di produzione / avvio |
| `npm run db:migrate` | Applica le migrazioni Prisma |
| `npm run db:seed` | Inserisce i dati mockup |
| `npm run db:reset` | Reset DB + reseed |
| `npm run db:studio` | Apre Prisma Studio |
| `npm run setup` | `migrate` + `seed` |
| `npm test` / `npm run test:watch` | Unit test Vitest (one-shot / watch) |
| `npm run test:e2e` | E2E Playwright (avvia da solo il dev server sulla porta 3939) |
| `npm run a11y` | Solo il cancello di accessibilità (axe-core, 8 pagine × 2 temi) |
| `npm run lighthouse` | Lighthouse CI sulla build di produzione — **misura, non giudica** (nessuna soglia finché non ne esiste una misurata) |
| `npm run typecheck` | `tsc --noEmit` |

### Variabili d'ambiente (`.env`)

Tutte le variabili sono **validate all'avvio** da [`src/lib/env.ts`](./pistoia-dashboard/src/lib/env.ts)
(Zod, caricato da `instrumentation.ts`): valori mancanti o malformati **bloccano il boot** con un
messaggio esplicito.

| Variabile | Descrizione |
|---|---|
| `DATABASE_URL` | Percorso SQLite, default `file:./prisma/dev.db` |
| `SESSION_SECRET` | Segreto per l'HMAC dei token di sessione. **In produzione: obbligatorio, ≥32 caratteri** |
| `DEMO_MODE` | `true`/`false` — attiva i baseline finti del seed (default: `true` in dev, `false` in prod) |
| `DATA_MODE_BILANCIO` / `DATA_MODE_OPERE` | `mock` (default) o `real` quando l'ETL di Fase 2 alimenta la sezione |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Opzionali, insieme: rate-limit distribuito su Upstash Redis (REST); altrimenti store in memoria |
| `SENTRY_DSN` | Opzionale: error tracking (hook già pronto in `instrumentation.ts`) |
| `SERVER_ACTIONS_ALLOWED_ORIGINS` | Opzionale: host extra ammessi per le Server Actions dietro reverse proxy |

Template: [`pistoia-dashboard/.env.example`](./pistoia-dashboard/.env.example).

### Account dimostrativi (creati dal seed)
| Ruolo / profilo | Email | Password |
|---|---|---|
| Cittadina (residente verificata) | `cittadino@pistoia.it` | `Pistoia2026` |
| Comune (admin) | `comune@pistoia.it` | `Comune2026!` |
| Cittadino verificato (identità) | `lorenzo@pistoia.it` | `Pistoia2026` |
| Cittadino **non** verificato | `marco@pistoia.it` | `Pistoia2026` |
| Moderatore civico — **è «la Redazione»** delle Valutazioni (R-4): entra su `/redazione`, dove gli account del Comune non entrano | `moderatore@pistoia.it` | `Pistoia2026` |
| Associazione verificata | `associazione@pistoia.it` | `Pistoia2026` |
| Attività locale verificata | `attivita@pistoia.it` | `Pistoia2026` |

---

## 4. Architettura

### Struttura cartelle
```
pistoia-dashboard/
├─ prisma/
│  ├─ schema.prisma        # modello dati (+ campi di provenienza source*/lastSyncedAt)
│  ├─ migrations/          # migrazioni SQL
│  └─ seed.ts              # dati mockup
├─ prisma.config.ts        # config Prisma 7 (schema, migrazioni, datasource)
├─ vitest.config.ts        # unit test (alias @ e stub server-only)
├─ playwright.config.ts    # E2E (avvia il dev server su :3939)
├─ tests/
│  ├─ unit/                # percent, safeNext, rate-limit, validation, colors, word-filter, env
│  └─ e2e/                 # auth, voto, segnalazione (Chromium)
├─ src/
│  ├─ proxy.ts             # guard ottimistico rotte protette + CSP con nonce per-request
│  ├─ instrumentation.ts   # boot: valida env (fail-fast) + onRequestError (log strutturato)
│  ├─ app/
│  │  ├─ layout.tsx        # root: font, ThemeProvider (+ nonce CSP), metadata
│  │  ├─ page.tsx          # landing pubblica
│  │  ├─ global-error.tsx, not-found.tsx   # boundary globali
│  │  ├─ (auth)/           # login, registrati (+ error.tsx)
│  │  ├─ (app)/            # area protetta (+ error/not-found/loading + loading per sezione)
│  │  └─ actions/          # Server Actions (auth, polls, community, ...)
│  ├─ components/
│  │  ├─ ui/               # primitivi (Card, Button, Badge, SourceBadge, ...)
│  │  ├─ charts/           # RingGauge, LineChart (SVG animati + tabella sr-only)
│  │  ├─ brand/            # Crest (stemma di Pistoia)
│  │  ├─ app/              # TopBar, SideNav, BottomNav, Footer (badge demo)
│  │  └─ <sezione>/        # componenti client per sondaggi, comunità, admin, ...
│  ├─ lib/
│  │  ├─ env.ts            # validazione Zod delle variabili d'ambiente (fail-fast)
│  │  ├─ db.ts             # singleton PrismaClient (+ adapter sqlite, guard anti-Postgres)
│  │  ├─ cache.ts          # cache a tag per letture condivise (unstable_cache + reviveDates)
│  │  ├─ limits.ts         # budget anti-abuso per-utente delle write action
│  │  ├─ demo.ts           # DEMO_MODE: azzera i baseline finti fuori dalla demo
│  │  ├─ sources.ts        # provenienza dati + DATA_MODE + contratti ETL (Fase 2)
│  │  ├─ pistoia.config.ts # costanti istituzionali (ISTAT 047014, Belfiore G713, ...)
│  │  ├─ word-filter.ts    # matcher puro parole bloccate (testabile)
│  │  ├─ auth/             # password, session, dal, rate-limit (store memoria/Upstash), redirect, validation
│  │  ├─ data/             # query per ogni sezione (DTO)
│  │  ├─ colors.ts, format.ts, labels.ts, utils.ts
│  └─ generated/prisma/    # client Prisma generato (gitignored)
└─ ...
```

### Routing & layout
- `/` → landing pubblica (redirect a `/bilancio` se già loggato).
- Gruppo `(auth)` → `/login`, `/registrati` (layout split brandizzato).
- Gruppo `(app)` → area protetta con TopBar + SideNav (desktop) + BottomNav (mobile) e
  transizioni animate (`(app)/template.tsx`). Rotte: `/bilancio`, `/opere`, `/sondaggi`,
  `/comunita`, `/organigramma`, `/notifiche`, `/profilo`, `/impostazioni`, `/admin`.

### Pattern dati
- **Server Components** leggono i dati tramite `src/lib/data/*` (ritornano DTO).
- **Server Actions** (`src/app/actions/*`) gestiscono le mutazioni (voto, like, commento, follow,
  notifiche, profilo, admin) con `requireUser`/`requireAdmin` + `revalidatePath`. Ogni write action
  citizen-facing passa anche da **`limitWrite()`** (anti-abuso) e, per i contenuti testuali, dal
  guard di moderazione (`checkContribution`).
- **Cache a tag** (`src/lib/cache.ts`): le letture **condivise** tra tutti gli utenti — bilancio,
  lista opere, eventi pubblicati, quartieri — passano da `cachedShared()` (`unstable_cache` + tag
  `budget`/`opere`/`eventi`/`quartieri` + TTL). Le action che mutano quei dati chiamano
  `revalidateTag(tag, "max")`. Regola: **mai dati per-utente nella cache condivisa** (lo stato di
  follow/voto viene letto fuori dalla cache e ricomposto dopo). `reviveDates` riconverte le date
  (la cache serializza in JSON).
- **DEMO_MODE** (`src/lib/demo.ts`): i baseline finti (`baseVotes`, `baseLikes`, `baseSupports`,
  `baseConfirmations`, recensioni servizi, KPI mock) contano **solo** in demo; fuori, i numeri
  partono da zero e la UI mostra zero-state onesti.
- **Provenienza dati** (`src/lib/sources.ts` + campi `sourceName`/`sourceUrl`/`externalId`/
  `lastSyncedAt` su `BudgetYear`/`Opera`): ogni sezione dichiara la fonte via `<SourceBadge/>`;
  finché `DATA_MODE_* = mock` l'etichetta dice esplicitamente "dati dimostrativi".
- **Client Components** usano `useActionState` / `useOptimistic` / `useTransition` per UI reattiva.

---

## 5. Modello di sicurezza (auth)

- Password con **Argon2id** (OWASP: m=19 MiB, t=2, p=1). Mai salvate in chiaro.
- **Sessioni opache server-side**: il cookie contiene un token casuale da 32 byte; in DB si salva
  solo il suo **HMAC-SHA256** (chiave = `SESSION_SECRET`). Un leak del DB non permette di forgiare
  un cookie valido.
- Cookie `pistoia_session`: `HttpOnly`, `SameSite=Lax`, `Secure` in produzione, durata 30 giorni.
- `SESSION_SECRET` **obbligatorio in produzione** (≥32 caratteri): la validazione vive in
  `src/lib/env.ts` e blocca il boot (fail-fast via `instrumentation.ts`).
- **Content-Security-Policy con nonce per-request** (`src/proxy.ts`): `script-src 'self' 'nonce-…'
  'strict-dynamic'`, `frame-ancestors 'none'`, `form-action 'self'`, tile OSM in `img-src`. Il nonce
  arriva al root layout via header `x-nonce` (per lo script inline di next-themes). **Header statici**
  in `next.config.ts`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (solo `geolocation=(self)`),
  `Strict-Transport-Security`; più `serverActions.allowedOrigins` da env per i reverse proxy.
- **Rate-limiting** a più livelli sul login: per coppia IP+email (5/15min), **per-account
  indipendente dall'IP** (10/15min, vera difesa anti-brute-force anche con IP spoofato) e per-IP
  (40/15min, difesa in profondità); registrazione 8/ora per IP.
- **Rate-limit su tutte le write action** (`src/lib/limits.ts`): budget per-utente per post (10/h),
  commenti (30/h), segnalazioni (6/h), proposte (4/giorno), voti, follow, like, feedback, flag,
  richieste di verifica, export dati, ecc. Chiave = userId (stabile), non IP (spoofabile).
- **Store del rate-limiter intercambiabile** (`src/lib/auth/rate-limit.ts`): in memoria (default,
  per-istanza) oppure **Upstash Redis via REST** quando `UPSTASH_REDIS_REST_URL/TOKEN` sono impostati
  (pipeline atomica `INCR`+`PEXPIRE NX`+`PTTL`, timeout 3s, fallback in memoria se Redis è giù).
- Redirect post-login con parametro `next` validato (solo path locali, niente open-redirect).
- **Equalizzazione dei tempi** sul login (verify contro un hash fittizio) anti user-enumeration.
- **CSRF**: protezione integrata delle Server Actions (controllo Origin/Host) + cookie `SameSite=Lax`.
- **Validazione** input con Zod (client e server); policy password (min 10, lettera + numero).
- **DAL** (`src/lib/auth/dal.ts`): `getCurrentUser` (DTO senza hash), `requireUser`, `requireAdmin`,
  memoizzati con `React.cache`. Il `proxy.ts` fa solo un check ottimistico sulla presenza del cookie;
  la verifica reale (DB) avviene nella DAL, vicino ai dati. **`requireRedazione`** (R-4) vive in un
  file proprio, `src/lib/auth/redazione.ts`, che COMPONE `requireUser` senza toccare la DAL: lascia
  passare solo il ruolo `MODERATOR` — non è `requireModerator`, che accetterebbe anche `ADMIN`, cioè
  il super-account del Comune. Spostabile in `dal.ts` con l'ok esplicito di Lorenzo.
- "Cambia password" e "Esci da tutti i dispositivi" invalidano tutte le sessioni esistenti.

### Ruoli, verifica e livelli di accesso (fase community)
- **Ruoli** (`User.role`): `CITIZEN`, `MODERATOR`, `MUNICIPAL_STAFF`, `ADMIN`. Helper DAL:
  `requireUser`, `requireVerified`, `requireStaff` (ADMIN/MUNICIPAL_STAFF), `requireModerator`
  (ADMIN/MODERATOR), `requireAdmin`.
- **Tipi di profilo** (`User.accountType`): `CITIZEN`, `ASSOCIATION`, `BUSINESS`, `MUNICIPAL`.
- **Verifica** (`ProfileVerification` + `User.verifiedType`): il cittadino/organizzazione **richiede**
  una verifica (identità, residenza, associazione, attività); il Comune **approva/rifiuta** da una coda
  nell'area admin. All'approvazione viene impostato `verifiedType`, assegnato un `CitizenBadge` e
  inviata una notifica. **In questa fase la verifica è simulata** (no SPID/CIE) ed è etichettata come
  tale nella UI — coerente con l'ethos di trasparenza.
- **Gating** (tabella §5 del proposal): commentare / aprire segnalazioni / votare sondaggi aperti →
  **registrato**; votare **consultazioni ufficiali** (`Poll.requiresVerified`) e **sostenere proposte**
  → **verificato**. Il gating è applicato lato server nelle action.
- **Moderazione & audit**: ogni azione del Comune/moderatore (verifica, cambio stato, risposta,
  nascondi post, broadcast) è registrata in `ModerationAction` — un log append-only che funge anche da
  audit trail. I moderatori possono nascondere post (`CommunityPost.hidden`, soft-hide).
- **Privacy**: ogni utente ha un **nome pubblico abbreviato** (`publicName`, es. "Lorenzo C.") usato
  nei contenuti pubblici; il nome completo resta interno.

---

## 6. Modello dati (Prisma)

| Entità | Descrizione |
|---|---|
| `User` | Cittadino o admin (`role`), avatar color, bio, quartiere, hash password |
| `Session` | Sessione server-side (id = HMAC del token), scadenza |
| `BudgetYear` / `BudgetMonth` / `BudgetCategory` | Bilancio: totali, serie mensile, spesa per missione |
| `Opera` / `OperaUpdate` | Cantieri: stato, % avanzamento, investimento, aggiornamenti |
| `Poll` / `PollOption` / `Vote` | Sondaggi: opzioni con voti base + voti reali (1 voto/utente) |
| `Assessore` / `AssessoreFollow` | **Ancora d'identità per i «Segui», non una scheda anagrafica**: i fatti sulla giunta stanno in `lib/giunta.ts` con la fonte di ognuno. L'`id` è lo slug del modulo, così un «Segui» sopravvive a un riseed |
| `CommunityPost` / `OfficialAnswer` / `PostComment` / `PostLike` | Feed "la città risponde" |
| `Servizio` / `Valutazione` / `RispostaServizio` / `CodiceQr` | Valutazioni dei servizi: catalogo (ancora d'identità, i fatti stanno in `lib/valutazioni.ts`), stelle e recensioni dei cittadini, risposte del Comune e note della redazione, codici stampati che portano servizio e luogo a `/v/[codice]`. Sostituisce `ServiceReview`, che portava quattro medie **inventate** |
| `Notification` / `NotificationPreference` | Centro notifiche per utente + preferenze per canale |
| `Neighborhood` | Quartieri e frazioni di Pistoia (territorialità, "Vicino a te") |
| `ProfileVerification` | Richieste di verifica con coda di approvazione admin |
| `CitizenBadge` | Badge assegnati (verifica + reputazione civica) |
| `OrganizationProfile` | Profilo verificato di associazione / attività locale |
| `Report` / `ReportConfirmation` / `ReportStatusHistory` | Segnalazioni: workflow di stato, "Anche io", storico ufficiale, **foto** (`photoData`), **geo** (`latitude`/`longitude`), **anonime** (`anonymous`), **merge** (`mergedIntoId`) |
| `Proposal` / `ProposalSupport` | Proposte cittadine con sostegni e soglie (50/200/500) |
| `Follow` | "Segui" generico (quartieri, opere, segnalazioni, proposte, **eventi**, **organizzazioni**) |
| `ModerationAction` | Log append-only di azioni admin/moderatore (audit) |
| `Opera` (+ `OperaPhoto` / `OperaFaq` / `OperaComment`) | Opere arricchite: `rup`, `fundingSource`, `neighborhoodId`, geo, foto prima/durante/dopo, FAQ, commenti cittadini |
| `Event` | Eventi: pubblicati dal Comune o **proposti dalle associazioni verificate** e approvati (workflow `proposed→published/rejected`) |
| `AnswerFeedback` | "Questa risposta ti è stata utile?" sulle risposte ufficiali (post/proposte/segnalazioni) |
| `CommentReport` / `BlockedWord` | Moderazione avanzata: segnalazione commenti + filtro parole bloccate |
| `Decision` | Archivio decisioni (O3): esito, motivo in linguaggio semplice, `simpleText`, link a proposta/segnalazione/opera (`linkedType`/`linkedId`) |
| `Commitment` | "Promesse e risultati" (O3): stato promesso/in_corso/completato/rimandato/non_fattibile, origine, scadenza comunicata, nota di aggiornamento |
| `Notice` | Bacheca avvisi urgenti (O3): tipo, severità info/attenzione/critico, geo opzionale, `whatChanges` (JSON array "cosa cambia per me") |
| `CityFaq` | FAQ della città (O3): domanda/risposta ufficiale, categoria, ordine redazionale |

Enum modellati come stringhe (SQLite non ha enum nativi). Estensioni a entità esistenti: `User`
(`publicName`, `role`, `accountType`, `verifiedType`, `neighborhoodId`, **`geoConsent`**, **`banned`**,
**`suspendedUntil`**), `CommunityPost` (`kind`, `neighborhoodId`, `hidden`), `PostComment` (**`hidden`**),
`OfficialAnswer` (`department`, `authorId`, `updatedAt`), `Poll` (`kind`, `requiresVerified`,
`neighborhoodId`). **Provenienza** (migrazione `provenance`): `BudgetYear` e `Opera` hanno
`sourceName`/`sourceUrl`/`externalId`/`lastSyncedAt`, valorizzati dall'ETL di Fase 2 (null = dato
dimostrativo del seed). **Ondata 3**: `Opera.impactNotes`/`Opera.simpleText` (impatto pratico +
linguaggio semplice) e `Proposal.rejectionReasons` (motivi del rifiuto, JSON array). Migrazioni
applicate: `community_mvp`, `community_v2`, **`provenance`**, `ondata2_semplicita_profilo`,
`ondata1_segnalazioni2`, `ondata3_trasparenza`.

---

## 7. Sezioni e funzionalità

| Sezione | Stato | Note |
|---|---|---|
| La mia città | ✅ | Home personalizzata: saluto, quartiere, KPI ("vicino a te"), segnalazioni vicine, proposte in evidenza, scorciatoie; **banner avvisi attivi** + **hero "Stato della città"** con sparkline (O3). È il redirect post-login |
| Bilancio | ✅ | 142 mln (contatore animato), 3 anelli (riscossione/impegni/PNRR), grafico a linee mensile, spesa per missione |
| Opere | ✅ | 318 censiti, cantieri in evidenza, griglia, KPI; **follow** per cantiere; **pagina dettaglio `/opere/[id]`** (fonte finanziamento, RUP, foto prima/durante/dopo, FAQ, commenti cittadini, mini-mappa, **"Cosa cambia per me"** + **"Spiegamelo semplice"** O3) |
| Mappa | ✅ | **Mappa interattiva `/mappa`** (Leaflet + tile OSM): layer attivabili (opere, segnalazioni, eventi, **avvisi urgenti** O3, uffici, scuole, verde, servizi), pin per categoria, popup con link |
| Sondaggi | ✅ | Voto ottimistico; **consultazioni ufficiali** e **voti territoriali** riservati ai verificati (`requiresVerified`) |
| Comunità | ✅ | Composer con **tipo post** e **quartiere**; feed con badge autore, like/commenti ottimistici, risposte ufficiali con **ufficio** + **"questa risposta è utile?"**; **segnala commento**; moderazione (nascondi) |
| Segnalazioni | ✅ | Lista con filtri + KPI, creazione con **foto reale** (upload) e **geolocalizzazione precisa**, **invio anonimo**, **workflow di stato**, **"Anche io"**, dettaglio con timeline ufficiale, **mappa reale**, follow |
| Eventi | ✅ | **Calendario `/eventi`** per mese; **pubblicazione dal Comune** e **proposta dalle associazioni verificate** con **approvazione** del Comune/moderatori; follow evento/associazione |
| Quartieri | ✅ | **Indice `/quartieri`** + **pagina per area `/quartieri/[slug]`** che aggrega segnalazioni, opere, eventi, proposte e discussioni; follow del quartiere |
| Proposte | ✅ | Lista + creazione, **soglie di sostegno** (50/200/500), **sostegno gated ai verificati**, risposta ufficiale + **"questa risposta è utile?"**, dettaglio con **"Perché non si può fare?"** sulle respinte (O3) |
| Organigramma | ✅ | Sindaco + giunta, follower, follow/unfollow |
| Notifiche | ✅ | Lista per tipo (incl. segnalazione/proposta/verifica/evento), segna-come-letta, badge nel TopBar |
| Profilo | ✅ | Dati, **badge** e stato verifica, **richiesta verifica**, statistiche, nome pubblico |
| Impostazioni | ✅ | Preferenze notifiche, tema, cambio password, logout globale; **Privacy e dati** (consenso geo, **export JSON**, **cancellazione account**, link a privacy/cookie/regole) |
| Area Comune | ✅ | **Sette rotte dal 2026-08-07** (`docs/piano-admin.md`): cruscotto + `valutazioni`, `proposte`, `domande`, `segnalazioni`, `cittadini` (verifiche **+** moderazione), `pubblica` (i tre strumenti). Coda verifiche, triage segnalazioni, revisione proposte, risposte, broadcast, registro azioni; **moderazione community** (commenti segnalati, ban/sospensione, parole bloccate, **unione duplicati**); **approvazione eventi**. Contatore su ogni coda, `count` sul database; gli strumenti non ne hanno, e il tipo lo impedisce |
| Decisioni | ✅ | **Archivio decisioni `/decisioni`** (O3): esito + motivo in semplice, "perché non si può fare" evidenziato sulle respinte, link al percorso |
| Promesse | ✅ | **Tracker `/promesse`** (O3): impegni per stato con riepilogo a pill, origine, scadenza comunicata e nota di aggiornamento |
| Avvisi urgenti | ✅ | **Bacheca `/avvisi`** (O3): severità, "cosa cambia per me" a punti, mini-mappa dei geolocalizzati, archivio conclusi; **banner in home** e **layer dedicato su /mappa** |
| FAQ della città | ✅ | **`/faq`** (O3): domande raggruppate per tema, badge 🏛️ "Risposta ufficiale", rimando alla Comunità |
| Report del mese | ✅ | **Civic digest `/digest`** (O3): riepilogo 30 giorni calcolato dai dati (segnalazioni, opere, proposte, decisioni, eventi) + **export PDF** via print stylesheet |
| Glossario | ✅ | **`/glossario`** (O3): termini amministrativi in linguaggio semplice (statico in `lib/glossary.ts`) + tooltip **`GlossaryTip`** nel bilancio |
| Pagine legali | ✅ | `/privacy`, `/cookie`, `/note-comunita` (pubbliche) — atterraggio dell'informativa linkata dal modulo di voto del QR, dove non c'è un account |
| Footer | ✅ | **Scheda di vetro** appoggiata sulla tela (ridisegnato 2026-08-05, Lavoro D §1). Due colonne col titolo visibile: «La città» (avvisi, organigramma, FAQ, glossario — chiedono un account) e «Il progetto» (metodologia, privacy, cookie, regole community — pubbliche). Bersagli da **44px**; a chi non ha sessione una pastiglia dichiara il patto **una volta sola**, invece di offrire quattro porte chiuse. Prop `autenticato`, predefinita `false` perché l'errore muto è il peggiore. **Non si impagina da sé**: decide il contenitore |
| Tema chiaro/scuro | ✅ | next-themes, colori di Pistoia mantenuti |

---

## 8. Design

La direzione estetica completa (carattere, motivi identitari, tipografia, colore, motion, data-viz,
tema scuro, accessibilità) è formalizzata in **[`DESIGN.md`](./DESIGN.md)** (Ondata 0, 2026-06-12).

In sintesi: istituzionale toscano contemporaneo, mobile-first. Sfondo quasi bianco con bagliori di
**teal (verde acqua)** e **viola** agli angoli (più intensi nel tema scuro); badge **ambra**; il
rosso dello **stemma a scacchi** riservato a brand e urgenza. Tre motivi identitari come unico
vocabolario decorativo: **scacchiera** dello stemma, **fasce romaniche** (San Giovanni Fuorcivitas),
**città verde** (vivai). Tipografia a voce unica (revisione Ondata 4, 2026-06-13): **Montserrat**
(sans geometrico) per tutto; i titoli si distinguono per **peso e tracking**, non per famiglia
(sostituisce la coppia Fraunces + Plus Jakarta Sans; `--font-display` resta come registro display).
Motion sobrio: View Transitions sulle rotte,
ingresso di pagina con scivolamento, utility `.stagger`/`.pulse-civico`, easing
`--ease-out-civic`. Rispetta `prefers-reduced-motion`.

---

## 9. Deploy / hosting

L'app **non** può stare su GitHub Pages (che serve solo siti statici): qui serve un server in
esecuzione (Server Actions, sessioni, database). Opzioni gratuite valide:

| Opzione | Note |
|---|---|
| **Vercel** (Hobby, gratis) | Casa naturale di Next.js. È serverless ⇒ va sostituito SQLite con un **Postgres gestito** (es. **Neon**, gratis): cambiare il `provider` Prisma in `postgresql`, usare l'adapter `@prisma/adapter-pg`, lanciare migrazioni + seed sul DB remoto. Sempre attivo, veloce. **Consigliato.** |
| **Render / Railway / Fly.io** | Eseguono un container Node persistente ⇒ si può **mantenere SQLite** (i dati si resettano a ogni redeploy, va bene per un mock). Tier free con sospensione su inattività. |

> Promemoria sicurezza per il deploy: impostare `SESSION_SECRET` (≥32 caratteri — l'app in produzione
> rifiuta di avviarsi senza), servire in HTTPS (il cookie diventa `Secure`), leggere l'IP del client
> da un reverse proxy fidato per il rate-limiting e impostare `UPSTASH_REDIS_REST_URL/TOKEN` se ci
> sono più istanze (altrimenti il limite è per-istanza). Dietro reverse proxy con host diverso:
> `SERVER_ACTIONS_ALLOWED_ORIGINS`.

### Migrazione a Postgres (procedura, Fase 1→2)

Il client Prisma 7 è **dialect-specific**: il passaggio SQLite → PostgreSQL/Neon non è uno switch a
runtime ma una migrazione una-tantum, da fare **mentre i dati sono ancora mock** (zero rischio):

1. `npm i @prisma/adapter-pg pg` e in `prisma/schema.prisma`: `datasource db { provider = "postgresql" }`.
2. Rigenerare la baseline delle migrazioni (le SQL sono dialect-specific):
   svuotare `prisma/migrations/`, poi `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql` e `npx prisma migrate resolve --applied 0_init` sul DB nuovo (o semplicemente `npx prisma migrate dev --name init` puntando al Postgres vuoto).
3. In `src/lib/db.ts`: sostituire `PrismaBetterSqlite3` con `PrismaPg` (`new PrismaPg({ connectionString: url })`) e rimuovere il guard anti-Postgres.
4. `DATABASE_URL=postgres://…` in `.env`, poi `npx prisma generate`, `migrate deploy`, `db:seed`.
5. Aggiornare la CI (servizio Postgres o Neon branch) e rimuovere `better-sqlite3` dalle dipendenze.

## 10. Decisioni e changelog

- **2026-06-08** — Progetto completato end-to-end (mockup). Stack: Next.js 16, React 19, Prisma 7 +
  SQLite (adapter better-sqlite3), Argon2id, Zod 4, Motion, next-themes. Auth reale e sicura; tutte
  le 4 sezioni + profilo/impostazioni/notifiche/organigramma/area admin implementate. Dati mockup
  via seed. Design moderno/minimal con i colori di Pistoia e linee morbide. Verificato in browser
  (login, voto, dark mode), `next build` pulito.
- **2026-06-08 (review)** — Revisione multi-agente (sicurezza, correttezza, Next16/React19, a11y):
  18 finding confermati e risolti. Principali: rate-limit per-account anti-brute-force + guard
  `SESSION_SECRET` in produzione + redirect `next` anti open-redirect; contrasto WCAG AA del testo
  secondario in entrambi i temi; stato cantieri preservato in admin; percentuali sondaggi che sommano
  a 100 (largest-remainder); fix mismatch di hydration sui tempi relativi; label/aria su form, nav e
  toast; skip-to-content; `authorId` sui commenti. Migrazione `comment_author` applicata.
- **2026-06-09 (analisi next-phase)** — Analisi multi-agente esaustiva (7 specialisti: architettura,
  sicurezza, dati reali, funzionalità, testing/CI, UX/a11y/perf, modello dati) → 67 finding e una
  **roadmap a 5 fasi** (vedi §11). Scoperta chiave: il portale open-data del Comune di Pistoia
  (`cloud.ldpgis.it/pistoiaopen`) pubblica **0 dataset**, quindi la strategia dati deve essere
  **"national-first"** (BDAP, OpenCUP, ReGiS/PNRR, ANAC filtrati per Pistoia, ISTAT 047014). Nessuna
  modifica al codice in questa sessione: solo pianificazione.
- **2026-06-09 (Community MVP — fase 2)** — Implementata la **community civica** dal
  [`pistoia-community-proposal.md`](./pistoia-community-proposal.md), branch `feat/community-mvp`.
  **Profili verificati** (identità/residenza/associazione/attività) con **coda di approvazione admin**
  (verifica simulata, no SPID), **badge** e ruoli (cittadino/moderatore/staff/admin); **Segnalazioni**
  con workflow di stato + **"Anche io"** + storico ufficiale; **Proposte** con soglie di sostegno e
  risposta del Comune; **quartieri/frazioni** + home **"La mia città"** ("vicino a te"); feed Comunità
  potenziato (tipo post, quartiere, badge, ufficio nella risposta, moderazione); **gating** per
  consultazioni/sostegni riservati ai verificati; **preferenze notifiche**; **registro azioni/audit**
  (`ModerationAction`). 10 nuovi modelli Prisma (migrazione `community_mvp`), 6 action, ~30 file.
  Verificato: `next build` pulito + smoke test browser (login→La mia città, segnalazioni, proposte,
  feed, approvazione verifica admin end-to-end). Tutto ancora **dati mockup**.

---

- **2026-06-10 (Community v2 — estensione fase partecipativa)** — Implementati 9 blocchi del
  [`pistoia-community-proposal.md`](./pistoia-community-proposal.md) in una migrazione unica
  **`community_v2`** (7 nuovi modelli: `Event`, `OperaPhoto`/`OperaFaq`/`OperaComment`,
  `AnswerFeedback`, `CommentReport`, `BlockedWord`; campi nuovi su `User`/`Report`/`Opera`/`PostComment`):
  **§10 mappa interattiva** (Leaflet + tile OSM, layer attivabili, `/mappa` + mini-mappe su segnalazione
  e opera); **§9 foto reali** (upload con downscale client→data-URL in DB) + **geolocalizzazione precisa**
  + **segnalazioni anonime**; **§18 dettaglio opere** ricco (`/opere/[id]`: fonte, RUP, foto
  prima/durante/dopo, FAQ, commenti); **§17 calendario eventi** (`/eventi`) con pubblicazione delle
  associazioni verificate e approvazione del Comune; **§14 moderazione avanzata** (segnala commento,
  ban/sospensione con logout forzato dei bannati, parole bloccate, unione segnalazioni duplicate);
  **§23 privacy** (consenso geo, export dati JSON, cancellazione account, pagine `/privacy` `/cookie`
  `/note-comunita` + footer); **§8 "questa risposta ti è stata utile?"** su risposte ufficiali;
  **§21 follow** esteso a opere/quartieri/eventi/associazioni; **§6 pagine per quartiere** che aggregano
  i contenuti dell'area. Guard di moderazione (`lib/moderation.ts`) applicato a tutte le write action
  community. Verificato: `next build` pulito (24 rotte), `tsc` pulito, seed aggiornato. Ancora **dati mockup**.

- **2026-06-11 (Fase 0 Hardening + Fase 1 Abilitatori)** — Implementate le prime due fasi della
  roadmap (senza mailer, rinviato). **Fase 0:** CSP con **nonce per-request** + `strict-dynamic` nel
  proxy e security headers statici (`X-Frame-Options`, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, HSTS) in `next.config.ts`; **`env.ts`** con validazione Zod fail-fast
  (caricato da `instrumentation.ts`, che aggiunge anche `onRequestError` con log strutturato);
  **rate-limit su tutte le write action** (`lib/limits.ts`, ~12 action, chiave per-utente);
  **`DEMO_MODE`** che azzera i baseline finti (voti/like/sostegni/conferme base, recensioni servizi,
  KPI mock) con zero-state onesti e badge "demo" nel footer; `error.tsx`/`loading.tsx`/`not-found.tsx`
  (boundary globali + per gruppo + skeleton per bilancio/opere/comunità); **grafici SVG accessibili**
  (tabella `sr-only` + `role="img"`); empty state cittadini (via "esegui il seed");
  **`pistoia.config.ts`** (ISTAT `047014`, Belfiore `G713`); **Vitest** (32 unit test: largest-
  remainder, anti open-redirect, rate-limiter, validazione, colori, word-filter, env) + **CI GitHub
  Actions** (lint→typecheck→test→drift migrazioni→build + job E2E). **Fase 1:** rate-limiter con
  **store intercambiabile** (memoria / **Upstash Redis REST** senza dipendenze npm, fallback sicuro);
  **cache a tag** per le letture condivise (`lib/cache.ts`: `unstable_cache` + `revalidateTag(tag,"max")`
  + revival delle date) su bilancio/opere/eventi/quartieri; **schema di provenienza dati** (migrazione
  `provenance`: `sourceName`/`sourceUrl`/`externalId`/`lastSyncedAt` su `BudgetYear`/`Opera`) +
  `lib/sources.ts` (DATA_MODE per sezione + contratti `BudgetSource`/`OpereSource` per l'ETL) +
  `<SourceBadge/>` in UI; **E2E Playwright** (5 test: redirect protetto, login errato/valido, voto,
  segnalazione end-to-end); **procedura Postgres documentata** (§9) con guard esplicito in `db.ts`.
  Fix collaterali: guard moderazione **mancante sulle proposte**, hydration mismatch del ThemeToggle
  (`useSyncExternalStore`) e del template Motion, 3 errori lint preesistenti, `safeNext` e word-filter
  estratti in moduli puri testabili. Verificato: `tsc` pulito, eslint 0 problemi, Vitest 32/32,
  Playwright 5/5, `next build` pulito, header e CSP verificati live nel browser (nessuna violazione).
- **2026-06-11 (review multi-agente + ideazione)** — Review adversariale delle modifiche Fase 0/1:
  la lente **a11y/UX** ha confermato 8 finding, **tutti corretti**: (1) errori del rate-limit mai
  mostrati nelle component ottimistiche → nuovo `<ActionError/>` (live region sempre montata) +
  gestione `res.error` in poll/post/confirm/follow/support, col testo del commento ripristinato se
  rifiutato; (2) skeleton con `role="status"` + testo `sr-only` (prima: `aria-label` su div generico,
  mai annunciato); (3) focus programmatico sull'`h1` nei 3 error boundary + digest/log uniformati;
  (4) tabella sr-only del LineChart localizzata it-IT (`formatValue`); (5) `aria-disabled` + guard al
  posto di `disabled={pending}` (perdita focus da tastiera); (6) live region del toast voto resa
  persistente; (7) avviso sr-only "nuova scheda" sul link fonte; (8) aria-label del RingGauge
  localizzato + etichetta `aria-hidden`. Le lenti sicurezza/cache/idiomi-Next della review e le lenti
  cybersecurity/performance dell'ideazione sono saltate per limiti di sessione (tracciate in roadmap
  come code residue). L'ideazione ha prodotto **16 idee nuove** (8 partecipazione + 8 open data),
  catalogate in `ROADMAP.md` con impatto/sforzo/fase. Riverificato dopo i fix: eslint, `tsc`,
  32/32 unit, 5/5 E2E, `next build` — tutto pulito.
- **2026-06-11 (Ondata 2 — Semplicità & profilo civico)** — Prima ondata del piano mock-first
  (ROADMAP §3), 7 funzioni dagli addenda. **Ricerca globale Ctrl/Cmd+K**: palette accessibile
  (combobox + listbox, focus trap, live region) montata nella top bar, con azioni rapide, pagine e
  contenuti via `/api/search` (route handler autenticato su `lib/data/search.ts`, LIKE su
  segnalazioni/proposte/opere/eventi/sondaggi/quartieri). **Percorsi guidati** (`A1 §23`): home
  "La mia città" ridisegnata con hero "Cosa vuoi fare?" (6 azioni in `GUIDED_ACTIONS`, condivise con
  la palette). **Preferenze civiche** (`A2 §3`): 12 temi in `lib/civic-topics.ts` (mappati su
  categorie di segnalazioni/proposte/eventi/opere), campo `User.civicInterests`, form a chips in
  impostazioni (`#temi-civici`), onboarding in home e **feed "Per te"** (`getForYou`, etichetta
  "perché lo vedi" col tema che combacia). **Civic ID Card** (`A2 §2`) nel profilo (intestazione a
  gradiente "Carta civica", interessi, 4 contatori) + **"Il mio impatto civico"** (esiti in frasi:
  risolte/risposte/voti/sostegni, `getCivicImpact`, zero migrazioni). **Modalità semplice** (`A1 §19`):
  cookie `pst-simple` letto dal root layout (classe `simple-mode`, font 115%), home ridotta a 4 azioni
  grandi + numeri utili + uscita rapida; toggle in impostazioni. **Wizard proposte** (`A1 §14`):
  5 passi (problema→dove→beneficiari→proposta→riepilogo) con progress bar, focus sul titolo del passo,
  Invio=avanti; nuovi campi `Proposal.problem` + `affectedGroups` (9 gruppi `A2 §26`, chips nel
  dettaglio "Porta beneficio a"). **Valutazione sintetica** (`A1 §15` + `A2 §10`): campi
  `estimatedImpact/Cost/Time/feasibility/assessedAt` compilabili dallo staff nella review admin
  (select facoltativi, vuoto=non modifica), card dedicata nel dettaglio con disclaimer "indicativa"
  e riga compatta "€€ · Impatto alto" nelle card elenco. Migrazione `ondata2_semplicita_profilo`,
  seed arricchito (interessi per Giulia/Lorenzo, problem/gruppi/valutazioni su 3 proposte), fix
  `db:reset` (Prisma 7 ha rimosso `--skip-seed`). Verificato: `tsc` pulito, eslint 0 problemi,
  Vitest **47/47** (15 nuovi su taxonomy/parse/matchTopic), Playwright 5/5, `next build` pulito.
  Tutto ancora **dati mockup**.

- **2026-06-12 (Ondata 0 — Fondamenta visive & design system)** — Direzione estetica formalizzata in
  **`DESIGN.md`** (carattere istituzionale toscano, 3 motivi identitari, regole di colore/motion/
  data-viz, "Sì/No"); ROADMAP.md riscritto come documento professionale (visione / obiettivi OB-1…OB-5 /
  ondate / catalogo con tag di livello FE·DES·UX·BE·ENG·SEC·A11Y·AI; regole nuove n. 8 design e n. 9
  sponsor; feature "Vetrina aziende & sponsorizzazioni" pianificata in O5). Implementazione:
  **token estesi** in `globals.css` (`--font-display` Fraunces via next/font, `--ease-out-civic`,
  `--glow-alpha` con boost serale, `color-scheme`) + utility identitarie (`.bande-romaniche`,
  `.scacchiera`, `.divider-bande`) e motion (`.page-enter`, `.stagger`, `.pulse-civico`);
  **View Transitions** (`experimental.viewTransition` + `<ViewTransition>` nel template, tipi
  `react/canary` in `src/types/react-canary.d.ts`); **EmptyState** illustrato (arco romanico +
  scacchiera, `ui/empty-state.tsx`) adottato in segnalazioni/proposte/eventi/comunità/notifiche;
  **centro notifiche 2.0** (filtri per tema, bucket Oggi/Settimana/Più vecchie, azione inline "segna
  letta", `Date.now` spostato in state initializer per la regola react-hooks/purity);
  **command palette 2.0** (tipo `Item.run`: comandi "tema chiaro/scuro" e "avvia presentazione",
  evento `TOUR_START_EVENT`); **tour demo** in 9 passi (`app/demo-tour.tsx`, scheda non modale nel
  layout, naviga tra le rotte, Esc chiude, tacche di avanzamento); **treemap squarified** del
  bilancio (`charts/treemap.tsx`, server-only, celle %, etichette adattive, elenco testuale in
  `<details>`); titoli e numeri protagonisti in Fraunces (SectionHeader, Stat, hero bilancio).
  Verificato: `tsc` pulito, eslint 0 problemi, Vitest 47/47, Playwright 5/5, `next build` pulito.
  Nota ambiente: il dev server manuale è morto in OOM di sistema durante un check visivo
  (irrilevante per il codice: build e E2E verdi). Tutto ancora **dati mockup**.

- **2026-06-12 (Ondata 1 — Segnalazioni 2.0)** — Il ciclo di vita della segnalazione si chiude
  (ROADMAP OB-1). **Schema** (migrazione `ondata1_segnalazioni2`): `Report.urgency`
  (null|richiesta|confermata|respinta), `Report.resolutionFeedback(At)` (null|confermata|riaperta),
  nuovo modello **`ReportPhoto`** (fase prima/durante/dopo, photoData o imageSeed, official).
  **Timeline pubblica** (`A1 §3`): sezione "La storia di questa segnalazione" con connettore
  verticale, autore per voce (pill rossa se Comune), data+tempo relativo. **Conferma cittadino**
  (`A1 §5`): card "È davvero risolta?" per il solo autore su risolta/chiusa
  (`confirmResolutionAction`, una sola volta); "no" riapre → status in_lavorazione + resolvedAt
  null + nota pubblica non ufficiale. **Foto per fase** (`A1 §4`): `PhasePhotos` nel dettaglio
  (prima = photoData del cittadino; placeholder "In attesa" se mancano fasi), upload staff dal
  triage (`addReportPhotoAction`, riuso `downscaleImage` estratta in `lib/images.ts`). **Ufficio
  competente** (`A1 §6`) e **tempi medi** (`A1 §7`): blocco dl nel dettaglio; `getCategoryAvgDays`
  media i casi realmente risolti e integra una baseline demo pesata 3 campioni sotto i 3 casi —
  etichetta "dato storico indicativo, non una promessa". **Urgenza** (`A1 §8`): checkbox nel
  composer ("pericolo immediato"), `validateUrgencyAction` per moderatori+staff dal triage (banner
  rosso, richieste in cima via sort), badge "Urgente" pubblico solo se confermata, notifica
  all'autore, audit ModerationAction. **Anti-duplicati** (`A1 §2`): route `GET
  /api/segnalazioni/simili` su `findSimilarReports` (stessi categoria+zona, aperte, 90 giorni,
  top 4); pannello `SimilarReports` nel composer e nel flusso rapido con "Anche io" inline
  (pattern chiave-derivata per evitare setState-in-effect, regola react-hooks). **Segnala in 30
  secondi** (`A2 §4`): overlay `QuickReport` full-screen mobile in 3 passi (foto con
  `capture=environment` → posizione → categoria a chips), `createReportAction` con `mode=rapida` e
  titolo generato (`quickReportTitle`, max 120). **Mock vivo**: seed con hash deterministico del
  giorno (`vary()`, segnalazione "fresca di oggi" a rotazione su 3 template), nuovi casi seed
  (urgenza confermata + richiesta pendente, riaperta dal cittadino, 2 risolte extra per i tempi
  medi, gallerie fasi con `photoSvg`). Verificato: `tsc` pulito, eslint 0 problemi, Vitest
  **56/56** (9 nuovi su quickReportTitle/urgenza/fasi), Playwright 5/5, `next build` pulito.
  Tutto ancora **dati mockup**.

- **2026-06-12 (Ondata 3 — Trasparenza che chiude il cerchio)** — Cosa succede *dopo* la
  partecipazione (ROADMAP OB-1, OB-3). **Schema** (migrazione `ondata3_trasparenza`): nuovi modelli
  `Decision`, `Commitment`, `Notice`, `CityFaq` + `Opera.impactNotes`/`simpleText` e
  `Proposal.rejectionReasons` (JSON array, parse sicuro `parseStringArray`). **Archivio decisioni**
  (`A1 §12`, `/decisioni`): esito (approvata/in parte/respinta/rinviata), motivo in semplice, riquadro
  "perché non si può fare" sulle respinte, link al percorso (proposta/segnalazione). **"Perché non si
  può fare?"** (`A1 §13`): card a punti sul dettaglio della proposta respinta. **Promesse e
  risultati** (`A1 §30`, `/promesse`): tracker per stato con riepilogo a pill, origine
  (`sourceLabel`), scadenza comunicata (`dueLabel`), nota di aggiornamento. **Bacheca avvisi**
  (`A1 §21`, `/avvisi`): severità info/attenzione/critico, "Cosa cambia per me" (`A1 §24`) a punti,
  mini-mappa dei geolocalizzati, archivio conclusi; **banner in home** (`NoticeBanner`, i critici
  con `.pulse-civico`) e **layer "avvisi"** su `/mappa` (`MapLayerKey` esteso). **Impatto cantieri**
  (`A2 §30`): "Cosa cambia per me" + **"Spiegamelo semplice"** (`A2 §11`, componente
  `SimpleExplainer`, redazionale con disclaimer "fa fede il testo ufficiale") sul dettaglio opera.
  **FAQ della città** (`A1 §11`, `/faq`): gruppi per categoria (Map, niente chiavi duplicate),
  badge "Risposta ufficiale". **Report civico del mese** (`A2 §19`, `/digest`): `getMonthlyDigest`
  calcola 30 giorni dai dati reali (groupBy categorie, top proposte con baseline demo, decisioni,
  eventi futuri); **export PDF** = print stylesheet con variant Tailwind `print:` (testata con
  stemma solo in stampa; top bar/nav/footer/tour `print:hidden` globali) + `PrintButton`
  (`window.print()`), zero dipendenze. **Glossario** (`A2 §27`, `/glossario`): 12 voci statiche in
  `lib/glossary.ts` + tooltip accessibile `GlossaryTip` (disclosure button, Esc/click-fuori) su
  riscossione/impegni/PNRR/avanzo nel bilancio. **Hero "Stato della città"** (🆕, home): 4
  indicatori (risolte 8 settimane con **sparkline** SVG server-rendered, cantieri + avanzamento
  medio, proposte attive, avvisi attivi), helper puro `weeklyBuckets` in `lib/citystats.ts`.
  **Integrazioni**: sezione "Trasparenza" nella side-nav (6 voci), 4 nuovi tipi nella ricerca
  globale e nella palette (decision/commitment/notice/faq), nuovo passo del tour demo. Tassonomie
  pure in `lib/transparency.ts`. Seed: 5 decisioni, 6 impegni, 4 avvisi, 8 FAQ, proposta respinta
  "Navetta serale" con 3 motivi, impatto su 3 opere, notifica avviso critico. Verificato: `tsc`
  pulito, eslint 0 problemi, Vitest **69/69** (13 nuovi), Playwright **8/8** (3 nuovi), `next build`
  pulito. Versione **0.9.0**. Tutto ancora **dati mockup**.

- **2026-06-13 (Ondata 4 — Territorio & partecipazione)** — Vita di quartiere e dialogo strutturato
  (ROADMAP OB-1, OB-3). **Schema** (migrazione `ondata4_territorio`): `QuestionTime`/`QtQuestion`/
  `QtVote`, `PriorityRound`/`PriorityItem`/`PriorityVote`, `Initiative`/`InitiativeJoin`,
  `AdoptedPlace`, `NeighborhoodPact`/`PactUpdate`, `CivicProject` (+ `Report.civicProjectId`),
  `CommunityPost.topic`, `Poll.docTitle/docSummary/docUrl`, `User.tourCompletedAt`/
  `onboardingDismissedAt`. **Question time** (`A2 §22`, `/question-time`): tema aperto, domande votate
  (voto/nuova domanda con stato ottimistico, `askQuestionAction`/`toggleQtVoteAction`), risposte
  ufficiali archiviate. **Vota la priorità** (`A2 §9`, `/priorita`): `requireVerified`, un voto per
  tornata spostabile (`votePriorityAction`), classifica live con `toPercents`, esito raccontato.
  **Volontariato** (`A2 §14`, `/iniziative`): bacheca con adesione ottimistica e posti contati
  (`toggleInitiativeJoinAction`, limiti `join`/`question` in `lib/limits.ts`). **Patti e luoghi**
  (`A2 §31` + `A2 §16`, `/patti`): patti di quartiere con avanzamento + adozioni con ultima nota.
  **Da segnalazione a progetto** (`A2 §8` + `A2 §7`, `/progetti`): cluster → progetto, segnalazioni
  collegate, banner reciproco sul dettaglio segnalazione, "radar" dei problemi ricorrenti (helper puro
  `groupRecurring`). **Stanze tematiche** (`A1 §17`, `/comunita/stanze[/topic]`): feed per tema
  civico, composer che eredita il `topic`. **Diario del quartiere** (`A1 §9`): "Questa settimana a …"
  computato (7 giorni) sul dettaglio quartiere. **Mappa del disagio** (`A2 §6`): heatmap overlay su
  `/mappa` (helper puro `bucketHeat` + `L.circle` per cella; deep-link `?layer=disagio`).
  **Consultazioni con documento** (`A2 §23`): documento + sintesi semplice sul poll-card. **Onboarding
  "primi passi in città"** (`/la-mia-citta`): checklist progressiva di 5 passi che si spuntano dai dati
  reali (`getOnboardingState`, helper puro `buildOnboardingSteps`), `OnboardingChecklist` + invito al
  tour `TourOffer` per i nuovi account; il **tour demo** persiste il completamento (`completeTourAction`
  sull'ultimo passo). **Tipografia**: **Montserrat** voce unica (sostituisce Fraunces + Jakarta).
  **Integrazioni**: sezione "Partecipazione" in side-nav (5 voci), 3 nuovi tipi in ricerca/palette
  (questiontime/initiative/project), nuovo passo del tour. Tassonomie pure in `lib/territorio.ts`,
  dati in `lib/data/territorio.ts`. Seed: 2 question time, 2 tornate priorità, 5 iniziative, 4 luoghi,
  3 patti, 2 progetti con segnalazioni collegate, consultazione con documento, account demo con
  onboarding già concluso. Verificato: `tsc` pulito, eslint 0 problemi, Vitest **80/80** (11 nuovi),
  Playwright **11/11** (3 nuovi), `next build` pulito. Versione **0.10.0**. Tutto ancora **dati mockup**.

---

> ⚠️ **Questa sezione è ferma all'ondata 4 (2026-06-13).** Le ondate 5–8, la Fase A
> e la Fase B sono registrate in **[`CHANGELOG.md`](./CHANGELOG.md)**, che è il
> registro vivo: quando i due divergono, vale il changelog. Dichiararlo qui è
> preferibile a colmare il vuoto a posteriori, che significherebbe ricostruire a
> memoria decisioni prese in sessioni diverse.

- **2026-07-30 (Fase C — la dichiarazione di chi pubblica)** — Chiuso il prerequisito 1
  dell'osservatorio civico nella terza forma, dopo due marchi separati respinti: **lo stemma
  del Comune resta** e l'equivoco di attribuzione si scioglie dicendolo.
  `components/osservatorio/chi-pubblica.tsx` porta un **cartiglio** (separa *chi scrive il
  giudizio* da *chi fornisce i numeri*, e chiude sul diritto di replica) più un **filo
  persistente** agganciato sotto la barra in alto. Il filo non è una scelta di forma ma di
  **durata**: la barra è `sticky`, quindi lo stemma resta per tutta la lettura mentre una
  dichiarazione in cima sparisce al primo scorrimento — chi legge a metà pagina vedrebbe solo
  lo stemma sopra un giudizio sulla giunta. Le due parti **non sono esportate separatamente**:
  la metà che si dimentica è sempre il filo, perché il difetto che copre non si vede finché non
  si scorre. Nuova rotta `/pagella` (impalcatura, **nessun voto calcolato**), aggiunta a
  `rotte.mjs` e `shots.mjs` nello stesso momento (43 → **44 rotte**). `npm run test:e2e`
  cancella ora `.next` da sé (`pretest:e2e`): toglie un falso rosso che aveva già prodotto due
  diagnosi sbagliate. Ricognizione delle fonti reali per «Il costo dell'amministrazione» in
  `ROADMAP.md` §6. Verificato: `typecheck`, `lint`, **96/96** unitari, **11/11** E2E,
  **`rotte` 44/44**, `shots --simple --width=360` senza traboccamenti.

- **0.18.0 — «Il costo dell'amministrazione» sui dati reali** (2026-07-31). La prima pagina
  costruita interamente su fonti primarie: `/trasparenza/costo-amministrazione`, con
  `lib/costo-amministrazione.ts` dove `rigaPubblicabile()` scarta le righe senza URL **e il
  totale applica lo stesso filtro** — una voce esclusa dall'elenco ma lasciata nella somma
  sopravvivrebbe dentro la cifra display, dove nessuno la vede. Corretto il **vicesindaco al
  75%** (art. 4 c. 5 del D.M. 119/2000, non il c. 4): la fascia «50.001–100.000» in
  quell'articolo non esiste. E la «riprova indipendente» del 5.313 **non era una riprova** —
  entrambi i percorsi passavano dal 55%, cioè un solo percorso contato due volte. Fonti in
  `docs/fonti-costo-amministrazione.md`. **115/115** unitari, **`rotte` 45/45**.

- **0.19.0 — `/organigramma` smette di contraddire `/trasparenza`** (2026-08-03). La pagina
  dava Marco Ferrari sindaco mentre `/trasparenza/costo-amministrazione`, a un clic di
  distanza, dava Giovanni Capecchi: due risposte diverse alla stessa domanda dentro la stessa
  applicazione. Le nove persone vivono ora in `src/lib/giunta.ts`, ognuna con la propria
  `Riga` di fonte, e un test confronta i due moduli perché non tornino a divergere.
  **`votesElected` è stato rimosso dal modello, non riempito con numeri veri**: per cinque
  persone su nove quel numero non esiste in nessuna fonte — un candidato sindaco non riceve
  preferenze, e quattro assessori su otto non erano candidati in nessuna lista. Al suo posto:
  *come* ciascuno è arrivato alla carica. `Assessore` diventa un'ancora per i «Segui».
  Indice delle **57 deleghe** vere. Fonti in `docs/fonti-organigramma.md`; quattro trappole
  nuove in `AGENTS.md` §4. **133/133** unitari, **11/11** E2E, **`rotte` 45/45**.

- **0.20.0 — «Valutazioni dei servizi», fondamenta e lettura** (2026-08-03). La quinta funzione
  dell'osservatorio, sbloccata da una scoperta e non da un dato: *cosa mostra la pagina finché
  i voti non esistono?* La risposta — **il dato duro dal primo giorno**, preso da `Report` —
  è la forma generale del difetto che aveva già tolto la cifra da `/organigramma`. Due rotte
  nuove (`/valutazioni`, `/valutazioni/[servizio]`), **due tabelloni che non si fondono mai in
  una classifica sola**, media solo sopra soglia con la composizione del campione accanto,
  registro pubblico delle rimozioni. Fuori `ServiceReview` con le sue quattro medie inventate;
  **il seed non contiene nessuna valutazione**, e da qui il vincolo che le pagine reggano a
  zero. Corretto un difetto visto dal vivo: la colonna dura presentava **una mediana su due
  casi**. Piano in `docs/piano-rating-servizi.md`. **175/175** unitari, **14/14** E2E,
  **`rotte` 47/47**, `shots --simple --width=360` senza traboccamenti.

- **0.21.0 — «Valutazioni dei servizi», R-3: il voto** (2026-08-03). La funzione diventa viva:
  si vota dalle schede e dai QR. **Tre scelte sulle email, di Lorenzo**: zero dipendenze (in
  produzione sarà `fetch` verso l'API HTTP di un provider), provider **col dominio** (EU
  preferita, andrà su `/privacy` come responsabile), e in locale ogni messaggio è un **file**
  in `.email/` — l'E2E lo legge per «ricevere» la conferma, e in produzione l'invio si rifiuta.
  Azione del voto aperta ai senza-account (rate limit IP+email best-effort, filtro parole,
  regola mensile da `puoVotare()`); revoca che **cancella davvero** riga, email e token;
  `/v/[codice]` e `/v/conferma/[token]` sotto il prefisso pubblico `/v/` (il proxy protegge
  `/valutazioni`, e chi clicca dalla posta non ha una sessione); fogli stampabili da
  `/admin/codici-qr` con **`uqr`**, unica dipendenza nuova; IP azzerati oltre i 180 giorni a
  ogni voto, dichiarato su `/privacy`. **181/181** unitari, **17/17** E2E (il cancello:
  vota-riceve-revoca), **`rotte` 50/50**, shots nei due temi e a 360px puliti.

- **0.21.1 — il seed che dimostra** (2026-08-03). Solo dati, nessun codice di prodotto: **32
  segnalazioni dimostrative** (24 chiuse, 8 aperte) sulle categorie delle cinque condizioni,
  persone inventate e luoghi veri, così ogni condizione guadagna la propria mediana dei tempi
  di chiusura (pulizia **5** · illuminazione **8** · verde **12** · trasporti **25** ·
  sicurezza **9** giorni) — prima, con 1–2 casi per categoria, le schede dicevano per sempre
  «troppo poche risultano chiuse». Il tasso in home passa da 33% a **66%** e la mesh da
  «In affanno» ad **«A rilento»**: metà scala è una scelta, un seed tutto verde racconterebbe
  una città senza attriti. **Nessuna valutazione nel seed**, sempre. Nella stessa sessione la
  **forma di R-4** è stata proposta in sei decisioni separabili (A–F), mostrate in contesto
  sulla scheda vera, e composta da Lorenzo con domande interattive.

- **0.22.0 — «Valutazioni dei servizi», R-4: risposte e moderazione** (2026-08-03). La
  composizione di Lorenzo (A1+A2 · B1 · C3 · D1 · E2 · F riservata), tutta implementata.
  **Il cancello della fase**: un account del Comune non può rimuovere — e `ADMIN` è il
  super-account del COMUNE, quindi la porta respinge anche lui; «la Redazione» è il ruolo
  `MODERATOR` (`requireRedazione`, file proprio che compone la DAL senza toccarla). Il Comune
  risponde **dalla scheda** (quadro del mese e singola **annidata**, timbro della carica
  agganciato per email da `lib/giunta.ts` e scattato alla scrittura) e **segnala** con motivo
  (`segnalataMotivo`, migrazione dedicata) — senza segni pubblici finché la Redazione non
  decide. `/redazione` porta coda, rimozione **con motivo pubblico** (azzera il testo, la
  riga resta) e Nota della Redazione con fonte rifiutata tre volte (azione, scrittura, resa).
  Registro come **elenco documentale** firmato; la firma vive in `lib/redazione.ts` e
  `ChiPubblica` la importa. `comune@pistoia.it` si chiama «Comune di Pistoia» anche
  internamente. `rotte.mjs` impara la **seconda passata da moderatore** con controllo
  d'atterraggio. **195/195** unitari, **20/20** E2E, **`rotte` 51/51**, shots nei due temi e
  a 360px puliti.

- **0.23.0 — «Valutazioni dei servizi», R-5: i sei ingressi e la lettura pubblica**
  (2026-08-04). La composizione di Lorenzo su mockup in contesto e due giri di domande:
  **A1** (invito effimero nel ringraziamento di «è davvero risolta?», contestuale via
  `condizionePerCategoria` — 7 categorie su 12, le altre non hanno una casella e quindi non
  hanno un invito) · **B su tutti i canali** (card in home, notifica al primo accesso del
  mese, email opt-in `PromemoriaRinnovo` con invio opportunistico e disiscrizione via form
  su `/v/promemoria/[token]` — e il pop-up **veste il rinnovo** quando c'è) · **C1** (nel
  digest prima il dato, dalle stesse `getScheda` delle schede, poi l'invito `print:hidden`)
  · **D1** (pop-up armato solo dai voti espressi via `lib/completamenti.ts`; «Non ora» =
  finestra, X = 180 giorni). **Il cancello della fase è il contatore unico**: tabella
  `Sollecitazione` append-only (schema S2), regole pure in `lib/sollecitazioni.ts` provate
  a DATE FISSE (18 unit): al massimo una sollecitazione per 30 giorni, contata al centro;
  un voto chiude la finestra; menu, QR e digest non contano; l'ancora è l'account. **E il
  login-wall si è deciso (W1)**: `/valutazioni` e le schede a lettura pubblica nel gruppo
  `(pubblico)` — `AppShell` estratto e condiviso, `TopBarAnonima` separata dalla barra
  protetta, modulo degradato a invito con `?next` sull'ancora, proxy alleggerito col via
  esplicito. `rotte.mjs` guadagna la **terza passata anonima** con controllo d'atterraggio;
  `shots.mjs` fotografa i due regimi; 3 E2E nuovi (lettura, degrado, e il muro che non si è
  mosso altrove). Il digest, entrato in shots con la sua card, ha rivelato un traboccamento
  **preesistente** a 360px (griglia `lg:grid-cols-2` senza base — AGENTS §3, ondata 7),
  corretto con `grid-cols-1`. **213/213** unitari, **23/23** E2E, **`rotte` 54/54**, shots
  nei due temi e a 360px puliti; pop-up e campagna provati anche dal vivo (voto retrodatato
  nel solo db di sviluppo, poi riseminato).

- **0.24.0 — «Valutazioni dei servizi», R-6: la metodologia. E il seme dimostrativo**
  (2026-08-05). La composizione di Lorenzo su mockup in contesto e due giri di domande:
  **A1+A3+A4** (documento a dodici regole — la regola · il perché · la verifica · la riga
  «Nel codice» — col sommario «In breve») · **C1** (pubblica, gruppo `(pubblico)`: le schede
  che chiunque legge citano quelle regole) · **nessuna soglia** (la quinta opzione di
  Lorenzo alla domanda sul valore: vedi sotto) · **B2** (timbro da colophon, mai in
  testata). **Il cancello della fase**: i testi di `lib/metodologia.ts` interpolano le
  costanti di dominio — `FINESTRA_CONDIZIONE_GIORNI`, `RICHIESTA_SILENZIO_GIORNI`,
  `SILENZIO_POPUP_CHIUSO_GIORNI`, `CONSERVAZIONE_IP_GIORNI`, `CAMPIONE_MINIMO_PER_GIUDIZIO`,
  `STELLE_MIN/MAX`, il catalogo — e `tests/unit/metodologia.test.ts` prova costante per
  costante che cambiare un valore cambia pagina E documento. **La soglia è sciolta**:
  `SOGLIA_PUBBLICAZIONE_VOTO` (20, provvisoria) e il flag `SOGLIA_PROVVISORIA` rimossi;
  `media()` pubblica dal primo voto (il tipo `Media` perde `mancanti` e `pubblicabile`),
  `quartiereSbloccato()` si accende col primo voto, e la decisione vale OVUNQUE la soglia
  mordeva (andamento e quartiere compresi, senza eccezioni). Il campione minimo della
  mediana (5, `citystats`) resta, con un test-guardiano nuovo sulla coesistenza. Superfici:
  l'attesa della scheda esiste solo a zero voti, la panoramica perde «N su 20», il digest
  perde il ramo «nessuna casella è sopra la soglia»; `TimbroMetodologia` («metodologia
  v1.0» + firma della Redazione) in calce a scheda, panoramica e digest, vivo anche in
  stampa; «Come funziona» sull'invito anonimo. **Il seme** (decisione §8.7, numeri
  approvati sul tabellone del giro): 72 voti a distribuzioni fisse (mai `vary()`) su 24
  persone inventate + 3 account demo — la gradazione dei campioni al posto del vecchio
  «sopra/sotto soglia»: Pulizia 34 = 3,3 (andamento 3,2 → 3,4 → 3,3 su bucket ancorati al
  calendario con `meseFa`), Verde 3,9, Sicurezza 2,8, Illuminazione 2,8, Anagrafe 4,1,
  Tributi 2,5, Prenotazioni 4,3, **Trasporti e tre sportelli a zero**; Giulia e Lorenzo
  votano ≥30 giorni fa (campagna e pop-up armati oggi), Marco 2 giorni fa (scaglionamento
  dal vivo); 3 `Sollecitazione` seguite, nessun promemoria (solo su richiesta), 2 codici QR
  nuovi (`pt-pulizia-01/02`), quadro del Comune su Pulizia · luglio (account generico,
  testo senza fatti inventati). Le due E2E dell'assenza ripuntate su
  `/valutazioni/trasporti`; la scheda pubblica prova la media vera. **224** unitari
  (212+12), **25/25** E2E, **`rotte` 56, 0 con problemi** (tre passate, `/metodologia`
  anche nell'anonima), shots nei due temi e `--simple --width=360`.

- **0.25.0 — «La pagella della giunta»: la scoperta, la metodologia v1.1 e la forma A**
  (2026-08-05). La scoperta prima del codice: **le sei materie non sono ugualmente
  misurabili, e il voto onesto esiste solo dove qualcuno ha fissato il traguardo** — per
  una giunta, la legge. Composizione di Lorenzo su facsimili in contesto e due giri di
  domande: **M1** (sei materie a due regimi: voto solo dove il traguardo è normativo —
  Trasparenza e Spesa; Promesse a fatti; Sicurezza · Decoro · Ascolto dichiarano che cosa
  le accenderebbe) · **V1** (voto 1–10 **ricontabile**: mappatura pubblicata da controlli
  con traguardo di legge) · **C1** (trimestrale — il titolo perde «mensile») · **R1**
  (stelle dei cittadini accostate col campione, mai dentro un voto) · scala **1 + 9 ×
  quota** · ampiezza piena. Piano e regole derivate (nessun voto d'insieme, nessun seed,
  prima edizione dopo il **27/08/2026**, replica «non ancora richiesta», voto solo intero)
  in `docs/piano-pagella.md`. **Il codice**: `lib/pagella.ts` (6 materie, 10 controlli
  ancorati a D.Lgs 33/2013 · TUEL · D.Lgs 231/2002, `votoPagella()`, `votoMateria()` che
  fa `null` se una sola riga manca, `esitiPubblicabili()` sul modello `Riga`,
  `EDIZIONI = []` col test-guardiano); metodologia **v1.0 → v1.1** col **capitolo 2**
  (regole 13–20, «In breve» proprio, numeri interpolati, registro append-only che
  conserva la v1.0 — provato); `/metodologia` a due capitoli col titolo «La metodologia
  dell'osservatorio»; `/pagella` riscritta in **forma A senza edizione** (controlli
  elencati come promessa verificabile, card «Prima edizione», replica in stato anteprima,
  «La voce dei cittadini» con badge dei voti dimostrativi, colophon, ancore conservate).
  Due E2E aggiornate insieme alla modifica (titolo pagina; timbro version-agnostic).
  **247** unitari (224 → 247), **25/25** E2E, **`rotte` 56, 0 con problemi** (tre
  passate), shots nei due temi e `--simple --width=360`.
- **2026-08-05 (Fase C — «Qualità continua», C-2)** — La traccia trasversale aperta
  nell'ordine deciso con Lorenzo: **audit → Next → axe → Lighthouse**.
  **`npm audit` da 12 vulnerabilità a ZERO**, in tre passate: patch delle foglie di
  sviluppo col **solo lockfile** (12 → 8; i 129 pacchetti annunciati da npm erano
  binari opzionali per altre piattaforme), **`next` 16.3.0** (8 → 5, e porta
  `postcss` 8.5.23 e `sharp` 0.35.3), **`prisma` 7.9.1** con client e adapter
  allineati (5 → 0). **Cancelli nuovi**: `tests/e2e/accessibilita.spec.ts` con
  **axe-core** (8 pagine × 2 temi, WCAG **AA**, nessuna esclusione,
  `@axe-core/playwright`) e `lighthouserc.js` + job CI **non bloccante** sulla build
  di produzione — con `@lhci/cli` eseguito via `npx` **pinnato** e non installato,
  perché costava 285 pacchetti e cinque avvisi che il `Dockerfile`
  (`npm ci --include=dev`) avrebbe portato in produzione. Più il passo `npm audit`
  in CI, `npm run a11y` e `npm run lighthouse`.
  **Il prezzo di Next 16.3**: da quella versione il server di sviluppo mette
  nell'HTML un `<script>` **senza nonce** con dentro codice dell'applicazione;
  `'strict-dynamic'` disattiva l'allowlist per host, quindi il file viene rifiutato
  e **ogni pagina si apre col corpo vuoto**. Misurato che non è una nostra
  configurazione sbagliata (`required-scripts.js` e il manifest client identici a
  16.2.7), che **in produzione non accade** e che è identico su 16.3.1-canary.3.
  Decisione di Lorenzo: **togliere `'strict-dynamic'` dal solo ramo di sviluppo** di
  `buildCsp()`; in produzione resta. Da rimettere quando Next rimetterà il nonce.
  **Il debito che axe ha trovato, e chiuso**: violazioni **preesistenti** — mai
  misurate perché i contrasti dell'ondata 6 erano stati verificati a mano una volta
  sola — contro quanto `DESIGN.md` §4 dichiarava. `button-name` sul menu del profilo
  (nessun nome accessibile, ogni pagina autenticata), `link-in-text-block` (link
  nella prosa distinti solo per colore) e `color-contrast` sulla **tavolozza
  chiara**: teal `#0E9F92`→`#0A756B`, `--muted-2`→`#65686c`,
  `--color-text-secondary`→`#5A5D61`, viola→`#675cb4`, ambra→`#965a19`,
  success→`#187A4D`, più `--red-ink` per il solo chip rosso — **il rosso dello
  stemma e il tema scuro non sono stati toccati**.
  **Nuova trappola in `AGENTS.md` §3 (22)**: uccidere `npm run dev` non uccide
  `next dev`, e il superstite avvelena gli E2E con **timeout** che sembrano
  regressioni.

- **2026-08-07 (Fase C — «Qualità continua», il cancello dei 44px)** — Scritto
  `tests/e2e/bersagli.spec.ts`: **11 pagine × 2 viewport** (1280 e 360),
  **bloccante**, esenzioni «essenziali» **vuote**. La suite E2E passa da 48 a
  **70**. Il metro applica le quattro eccezioni di `DESIGN.md` §11.6 una per
  una e non è sostituibile con `target-size` di axe, che applica le stesse
  eccezioni **a 24px**.

  **Il metodo, prima del codice**: misurare e portare il numero. Il metro crudo
  dava **436** elementi sotto i 44px su 11 pagine; applicando le eccezioni ne
  restavano **158** a 1280 e **147** a 360 — ma erano **sette componenti**, non
  158 problemi, e cinque stavano a 4–8px dalla soglia. Con quel numero in mano
  la decisione (di Lorenzo) è stata: chiuderli tutti, poi bloccante.

  Tre scelte di metro, tutte scritte nel file: due bersagli **sovrapposti** non
  sono mai «isolati» (WCAG dà la geometria per bersagli affiancati, e senza
  quella riga uno `<span>` da 16px *dentro* un pulsante da 34 risultava
  isolato); i bersagli in `position: fixed` stanno in un **piano a parte**,
  altrimenti la barra inferiore risulta vicina a qualunque cosa le scorra sotto
  e il cancello dice cose diverse a ogni passata; l'etichetta di un controllo
  `sr-only` è il bersaglio vero e va misurata al posto suo.

  **Tre difetti trovati che non erano di dimensione.** (1) Motion mette
  `tabindex="0"` su qualunque elemento con `whileTap`: in `ConfirmButton`,
  `SupportButton` e `PostCard` è un'icona *dentro* il pulsante, cioè **42
  fermate di tabulazione senza nome su `/segnalazioni`**, invisibili ad axe e
  assenti dal sorgente. (2) e (3) Facendo aprire a `posata()` tutti i
  `<details>` prima di misurare, il **cancello axe** ha guadagnato copertura e
  ha trovato due violazioni `serious` **preesistenti** dentro «Vedi le
  proporzioni e l'elenco» del bilancio: sei `ProgressBar` senza nome
  accessibile — chiusa rendendo `etichetta` una prop **obbligatoria**, così
  anche le altre tre chiamate hanno smesso di essere mute — e la percentuale
  del treemap in `text-muted-2` sotto l'AA su cella tinta.

  **Nuove trappole in `AGENTS.md` §3 (26, 27, 28)**: gli attributi che una
  libreria di animazione aggiunge da sé; un `<details>` chiuso è un pezzo di
  pagina che nessun cancello misura; **aggiungere test che fanno l'accesso può
  sfondare il tetto di 40 tentativi per IP** — l'unico dei tre limiti di
  `loginAction` che non si azzera al successo. Quindici test caduti insieme,
  tutti dopo il quarantesimo, tutti con «resto su /login». Risolto **non**
  alzando il tetto ma facendo riusare la sessione a `login()`: accessi reali
  per esecuzione da ~45 a **4**, e la suite dura un minuto e venti in meno.

- **2026-08-07 (riordino del backlog e piano fino all'Ondata 11)** — Nessun
  codice: una ricognizione di tutte le voci non chiuse, un criterio scritto e
  quattro decisioni prese prima di riscrivere il piano (in `DISCOVERY.md`,
  P1–P4).

  **Il criterio**: una voce entra nell'ondata corrente se è **definita**,
  **fattibile** e **onesta** — quest'ultima intesa come «non chiede di
  inventare fatti su persone o enti reali», ed è la prova che ha escluso
  *modalità turista* e *servizi quotidiani*.

  **Il piano**: **O8** «Il Comune che legge la città» (analytics operative,
  alert su trend anomali, moderazione assistita, sette voci recuperate dal
  limbo e la pipeline degli atti) · **O9** i quattro strumenti con cui il
  progetto si racconta, in `/progetto/*` a firma della Redazione · **O10** il
  rifacimento visivo, col perimetro e **i limiti che sono già cancelli** ·
  **O11** l'archivio pubblico delle delibere.

  **Delibere scongelata**, unica eccezione alle tre categorie tenute ferme.
  Misurata la fonte prima di pianificare: l'albo di Pistoia gira su un Liferay
  di terze parti senza API né RSS, e **risponde 403** a chi non sembra un
  browser — da cui la scelta di spezzarla, pipeline in O8 e superfici in O11.

  Nuovo stato **🅿️ parcheggio** nel piano: dodici voci rinviate, ognuna con la
  ragione scritta accanto. E cinque righe riallineate ai fatti, trovate durante
  la ricognizione (Lighthouse e `npm audit` erano dati per «da impostare»
  mentre sono bloccanti dal 6; R-6 risultava aperta ed era chiusa dal 5; il
  catalogo portava etichette `O5` di quando le ondate erano cinque).

- **2026-08-07 (il cancello sulla produzione)** — `npm run produzione`
  (`scripts/produzione.mjs`): il primo cancello che apre il **sito deployato**
  invece di `localhost`. Ultima voce aperta della traccia «Qualità continua».

  **Il buco che colma è vecchio quanto il progetto.** `rotte` e `shots` girano
  contro lo sviluppo, quindi dodici cancelli verdi non dicevano niente su ciò
  che vede chi apre l'indirizzo pubblico: il 2026-08-05 la demo rispondeva 200
  e serviva l'HTML giusto, ma nessun browser riusciva a montarla —
  `upgrade-insecure-requests` promuoveva ogni script a `https://` su un sito in
  HTTP — e ci era rimasta **dalla Fase 0**.

  **Misurato prima di scegliere le soglie**, e la misura ha cambiato il piano
  due volte. Primo: `main` su `/login` dà **228 caratteri anche da sana**
  (perché è solo il modulo), quindi una soglia unica per tutte le pagine
  dovrebbe stare sotto quel valore e non distinguerebbe più niente — le soglie
  sono **per pagina**, ciascuna alla metà del valore misurato
  (`/metodologia` 17.140 → 8.000, `/valutazioni` 1.826 → 900, `/bilancio`
  2.695 → 1.300, `/segnalazioni` 10.121 → 5.000), e `/login` è fuori dal
  conteggio: lì si chiede che **il modulo ci sia**. Secondo: una pagina sana
  produce fino a **26 richieste fallite** — sono prelievi RSC annullati
  (`net::ERR_ABORTED`) — quindi «zero richieste fallite» andava scritto
  escludendoli, o il cancello sarebbe nato rosso.

  **All'accesso seguono due rotte protette**, non una: il guasto del cookie
  `Secure` su un sito in HTTP si vedeva solo alla navigazione successiva.

  **Non è in CI**, e il file lo dichiara invece di tacerlo: l'indirizzo è un IP
  privato in rete locale, che i runner di GitHub non raggiungono. Un job che ci
  provasse fallirebbe sempre, o verrebbe scritto tollerante — cioè diventerebbe
  un cancello che non guarda niente.

  **Provato rosso prima di dichiararlo verde**: host irraggiungibile 7 rossi su
  7, sito sbagliato 7 su 7, accesso fallito 3 su 7, tutti con uscita 1. Un
  accesso mancato conta le pagine protette come rosse **invece di saltarle**.

- **2026-08-07 (il marcatore della versione)** — Il limite dichiarato la sera
  prima — «il cancello non dice *quale* versione è in produzione» — **ha morso
  al primo uso vero**, poche ore dopo: cancello verde, previsione sul conteggio
  dei caratteri smentita, e per sapere se il deploy avesse preso sono servite
  **tre sonde a mano** (nome del chunk CSS, `.btn-sm` a 44px, fermate di
  tabulazione a zero). Chiuso nella stessa giornata.

  **Come**: si chiede al server quale immagine sta eseguendo il **container
  vivo** (`ssh homeserver` + `sudo -n docker ps`), e il tag di quell'immagine
  *è* lo SHA del commit — `docker build -t <uuid>:<sha>`, lo mette Coolify. È un
  fatto sul processo in esecuzione, non una dichiarazione di chi ha lanciato il
  deploy, e **non dipende da come il deploy è stato lanciato**: vale identico
  dall'interfaccia di Coolify e dall'API. Requisito esplicito di Lorenzo, e ha
  escluso da solo la soluzione più ovvia.

  **Tre strade scartate, misurate invece che immaginate** (in `AGENTS.md` §8,
  perché nessuno le riprovi): lo SHA come argomento di build — **Coolify non lo
  passa**, gli unici sono `COOLIFY_URL`, `COOLIFY_FQDN`, `COOLIFY_BRANCH`,
  `COOLIFY_RESOURCE_UUID` e le variabili dell'app; calcolarlo nel build da
  `.git` — il contesto è `/artifacts/<deploy>/pistoia-dashboard` e `.git` sta un
  livello sopra; scriverlo in una variabile di Coolify da un comando di deploy —
  regge finché ogni deploy passa da quel comando, e al primo lancio
  dall'interfaccia **il marcatore mente**, che è peggio di non averlo.

  Quando non combacia, dice di **quanti commit** la produzione è indietro. Se
  `ssh` non risponde dice «versione NON verificata» ed è **rosso**: mai verde
  per omissione. Provato rosso su tutte e cinque le strade.

  **Il limite che resta, dichiarato**: si verifica il *tag* dell'immagine viva,
  e chi lo assegna è Coolify al checkout. Se Coolify prendesse un commit e ne
  scrivesse un altro, il marcatore ripeterebbe il suo errore.

- **2026-08-07 (la Redazione aveva una stanza e nessuna porta)** — Prima
  revisione di `/admin` e `/redazione` **una per una**: non era mai stata fatta.

  **`/redazione` non era raggiungibile da nessun collegamento**: zero `href` in
  tutta l'applicazione, solo il prefisso nel proxy e tre `revalidatePath`. Il
  moderatore doveva digitare l'indirizzo per aprire la propria unica superficie
  di lavoro, e una volta lì la barra laterale non aveva nessuna voce attiva —
  mentre l'admin, sulla stessa barra, aveva «Area Comune» da sempre.

  **Perché tre cancelli verdi non lo vedevano**, ed è il punto che vale oltre il
  caso: `rotte.mjs`, `accessibilita.spec.ts` e `bersagli.spec.ts` aprono le
  pagine **tutti per indirizzo**, con `goto()`. «La pagina risponde» e «si può
  arrivare alla pagina» sono due domande diverse, e ne misuravamo una sola. È lo
  specchio della trappola 4 della Fase A/B, dove `shots` non vedeva le rotte
  annidate rotte *perché ci arrivava cliccando*.

  **Chiuso su due larghezze, e la seconda è emersa implementando**: la barra
  laterale è `lg:block`, quindi una voce messa solo lì avrebbe lasciato il
  telefono com'era. La porta mobile è il menu del profilo — dove l'admin aveva
  già la sua, ed è la ragione per cui l'asimmetria non si era mai vista.
  Corollario: **una voce di navigazione non è «aggiunta» finché non dichiari a
  quali larghezze esiste.**

  **Modellazione**: `SideNav` riceve il **ruolo** e non più `isAdmin: boolean` —
  quel booleano è metà della ragione del difetto, perché un secondo booleano
  accanto avrebbe lasciato scrivibile «admin e moderatore insieme», che per
  disegno non esiste (R-4). `staffNav(ruolo)` è l'unica lista di superfici
  riservate, e la tinta dell'icona vive sul `NavItem` perché il menu del profilo
  non ne diventi una seconda.

  **Una lezione ripagata** (`AGENTS.md` §3, ondata 7, 1): la prima stesura
  passava il `NavItem` da `AppShell` (Server Component) a `SideNav` (client),
  cioè `icon` — un componente React — attraverso il confine RSC. Typecheck e
  lint verdi tutti e due, pagina sull'error boundary, `render: function PenLine`
  nel messaggio.

  Nuovo cancello: `tests/e2e/porte.spec.ts`, quattro casi. Suite da 70 a **74**.

- **2026-08-07 (il resto della revisione di `/admin`)** — Nella stessa passata,
  altri tre esiti.

  **Il footer aveva 446px di vuoto** a ~1100px, la larghezza a cui è arrivato il
  2026-08-06 uscendo da `<main>` e a cui **non era mai stato guardato**. Chiuso
  con un tetto di **850px alle righe interne** — la colonna di `main` dentro
  `AppShell`, cioè la larghezza a cui era stato disegnato — lasciando la scheda
  a tutta larghezza come deciso. Da 446 a **258px**, verificato nei tre contesti
  in cui il footer vive più la viewport minima, traboccamento zero.

  **In «Proposte cittadine» la gerarchia era rovesciata**: pastiglia e conteggio
  in cima, il titolo della proposta sotto a `text-sm`, più piccolo dei controlli
  del modulo. E lo stato era detto **tre volte** (pastiglia, coda «· risposta
  pubblicata», valore del `<select>`). Titolo primo e a `text-base`; la coda solo
  quando la pastiglia non lo dice già.

  **`.btn-ghost` non aveva segno a riposo** — solo `color: var(--muted)` — quindi
  un pulsante *ghost* fermo era indistinguibile da del testo, e l'affordance
  arrivava con l'`:hover`, che **su un telefono non esiste**. 13 controlli su
  `/admin`, tutti **già alti 44px**: non era dimensione, era riconoscibilità, ed
  è una categoria che nessun cancello automatico misura. Bordo tenue a riposo:
  da 13 a **1**, e quella che resta è «Ignora», che deve pesare meno che
  «Banna». Raggio misurato prima di toccare: `ghost` è usata in sei punti.

  **Il taglio di `/admin` in sette pagine è deciso e scritto**
  ([`docs/piano-admin.md`](docs/piano-admin.md)), esecuzione da fare. Le misure
  hanno deciso il taglio — «Proposte» da sola fa 1.710px, quindi dieci pagine
  non sono meglio di sette — e ne è uscita una regola vincolante in `DESIGN.md`
  §6: *una coda una pagina · gli strumenti insieme · le letture sul cruscotto ·
  il registro è una lettura anche lui*.

  **E una trappola dell'ambiente**: il record di un deploy Coolify può passare da
  `in_progress` a `{"message":"Server Error"}` **senza mai dire `finished`**,
  mentre il deploy è riuscito. Intermittente. La domanda giusta si fa al processo
  vivo — il tag dell'immagine che il container esegue — cioè al controllo 0 di
  `npm run produzione`.

- **2026-08-07 (`/admin` spezzata in sette)** — Eseguito il piano deciso poche
  ore prima ([`docs/piano-admin.md`](docs/piano-admin.md), consuntivo in §7). Il
  taglio non si è ridiscusso: le sette pagine erano già state scelte dalle
  misure.

  **Il dato prima della forma.** `getAdminData()` era un `Promise.all` unico con
  dieci query: senza spezzarlo ogni sottopagina le avrebbe pagate tutte per
  mostrarne una. Adesso una funzione per superficie, le condizioni di filtro in
  costanti condivise — la lista e il contatore della stessa coda **devono** porre
  la stessa domanda al database — e i contatori con `count`, mai contando le
  righe che una pagina mostra.

  **La navigazione sta dentro ogni pagina, non in un `layout.tsx`**, e la ragione
  è tecnica e non stilistica: nell'App Router un layout condiviso **non si
  ri-renderizza** navigando fra due sue figlie, quindi i contatori resterebbero
  quelli del primo caricamento. Stessa famiglia il rinfresco dopo un'azione: le
  23 `revalidatePath("/admin")` diventano `rivalidaAreaComune()`, cioè
  `revalidatePath("/admin", "layout")`, perché i contatori delle code si vedono
  da **ogni** pagina dell'area.

  **«Uno strumento non ha un pallino» è ora un vincolo di tipo.**
  `SuperficieAdmin` è un'unione discriminata: la chiave del contatore esiste solo
  sul ramo `natura: "coda"`. La regola di `DESIGN.md` §6 smette di essere una
  convenzione da ricordare alla prossima pagina.

  **Le misure, e le due correzioni che hanno prodotto.** Il massimo passa da
  **7.558px a 1.894** (`/admin/proposte`), il cruscotto fa **822**, e ogni pagina
  paga ~190px di testata e navigazione che prima esistevano una volta sola.
  Misurando: (1) il riquadro che scorre dentro «Segnalazioni» **doveva restare** —
  toglierlo, con l'argomento «adesso a scorrere è la pagina», faceva **5.000px**
  con le 14 segnalazioni del seed; (2) il contatore ha rivelato che «Valutazioni»
  mostra **6** recensioni mentre ne aspettano **32**, buco preesistente che
  nessuno vedeva perché nessuno contava. Entrambi hanno lo stesso rimedio —
  lista + dettaglio — che il piano tiene fuori di proposito, e **la condizione
  che lo apre (una coda oltre le ~10 voci) è già soddisfatta**.

  **I cancelli**: `rotte` da 56 a **62**, 0 con problemi · `shots` +6 pagine per
  regime, zero traboccamento a 360px · `pagine-cancello` da 11 a **17**, quindi
  a11y e bersagli **34 casi** ciascuno — le sei entrano *tutte*, perché sono i
  componenti che quei cancelli già misuravano dentro l'unica `/admin`, e
  sceglierne due «rappresentative» avrebbe **tolto copertura esistente** ·
  `porte.spec.ts` guadagna due casi che leggono le sei porte **dal cruscotto
  stesso**, senza una seconda lista da tenere allineata.

  **E un cancello riparato per strada: `shots` fotografava una 404 e usciva 0.**
  Il controllo che difende le pagine per ruolo confronta l'**indirizzo**, e una
  404 di Next *sta* sull'indirizzo chiesto — quindi passava. Visto dal vivo su
  `admin-domande`, catturata come «Errore 404 · Pagina non trovata» con la
  revisione visiva dichiarata riuscita. ⚠️ Il momento in cui capita è quello
  **standard**: `npm run test:e2e` cancella `.next`, il server di Playwright la
  ricostruisce sulla 3939, e il primo `npm run dev` successivo riparte in
  ricostruzione incrementale — lo stato in cui le rotte **annidate** rispondono
  404. Portato in `shots.mjs` il controllo che `rotte.mjs` ha da sempre: si
  guarda se il **testo d'errore è in pagina**, e il messaggio dice cosa fare
  invece di lasciar cercare nel diff. È §3 (Fase A/B, 3) da una terza porta —
  *un cancello deve distinguere «verificato e a posto» da «non verificato»*.

- **2026-08-07 (lista + dettaglio sulle code)** — Chiuso il debito che il taglio
  di `/admin` aveva lasciato aperto poche ore prima ([`docs/piano-admin.md`](docs/piano-admin.md)
  §6, consuntivo in §8). La condizione — *una coda oltre le ~10 voci* — era
  **già soddisfatta nel momento in cui è stata scritta**: 14 segnalazioni, 32
  valutazioni.

  **La forma l'ha scelta Lorenzo su mockup iniettati sull'applicazione vera** —
  tre candidate misurate a 1280 e 375 con i dati del seed: riga espandibile
  (1.823px), pagina di dettaglio (lista 1.426 + dettaglio 836), pagina di
  dettaglio **più due colonne su desktop** (889). Ha preso la terza, che è la
  seconda più un layout: sotto ~1024px le due colonne non esistono e la pagina
  di dettaglio resta quella.

  **La misura che decide non è un'altezza ma una derivata.** Il dettaglio fa
  **656–913px** con quattordici voci in coda o con quattrocento; prima il massimo
  era **1.894** e cresceva di ~320px per ogni voce in più. La riga di lista è
  **69px** contro i 323 del modulo di lavoro. `/admin/proposte` passa da 1.894 a
  **656**, `/admin/domande` da 1.492 a **656**.

  **Due pagine crescono, ed è il prezzo dichiarato.** `/admin/segnalazioni` va da
  896 a **1.416px** — ma gli 896 erano un riquadro da 576px su 4.680 di
  contenuto, cioè **12 voci su 14 fuori vista** — e `/admin/valutazioni` da 1.114
  a **2.539**, mostrando però **32 recensioni invece di 6**. Il riquadro che
  scorre non è sparito: limita **la lista** nella colonna del dettaglio, mai il
  lavoro.

  **La ragione vera non era l'altezza.** La `description` della segnalazione era
  **caricata e mai mostrata** — quattordici volte, una per voce, e non compariva
  nemmeno nel tipo `Item` di `ReportTriage`: il Comune sceglieva lo stato,
  assegnava l'ufficio e scriveva una **nota ufficiale visibile al cittadino**
  avendo davanti il solo titolo. Vale identico per il testo della proposta, che
  non era nemmeno caricato.

  **Il dettaglio si prende per id, non dalla coda**, ed è la trappola principale
  di questa forma: ogni azione riuscita toglie la voce dalla propria coda, quindi
  un dettaglio filtrato risponderebbe **404 subito dopo un'azione andata a buon
  fine**. La pagina resta e dichiara che la voce è uscita (`FuoriDallaCoda`).

  **`@container`, non `sm:`/`lg:`**: la stessa riga vive a **804px** sull'indice e
  a **304** nella colonna del dettaglio. È il caso del footer del 05/08, e la
  regola sta in `DESIGN.md` §6.

  **Un difetto preesistente chiuso per strada:** i due pulsanti dell'urgenza
  affiancati fanno **301px** contro i 239 del proprio riquadro, e a 375px la card
  ritagliava «Flusso ordinario» — 62px fuori. Nessun cancello poteva vederlo:
  `shots` misura il traboccamento *della pagina* (zero), `bersagli` la
  *dimensione* (a norma), axe non ha una regola per «tagliato».

  **E uno strumento che mentiva:** la prima stesura dei mockup usava
  `lg:grid-cols-[…]` e `max-h-[34rem]` iniettate a runtime. Tailwind v4 compila
  solo le classi che trova nel **sorgente**: nessun CSS, nessun avviso, e la
  variante a due colonne è stata fotografata **impilata** — cioè la schermata su
  cui si stava per decidere mostrava un'altra cosa.

  **I cancelli**: `rotte` da 62 a **66**, 0 con problemi · `shots` +4 pagine per
  regime · `pagine-cancello` da 17 a **21**, quindi a11y e bersagli **42 casi**
  ciascuno ed E2E **116**. Tutti e quattro i dettagli e non uno
  «rappresentativo»: i moduli che quei cancelli misuravano ieri sulle liste
  vivono adesso lì, e sono quattro moduli diversi. Ci si arriva **cliccando** la
  prima riga, perché l'id viene dal seed — `apriPrima` entra anche in
  `pagine-cancello.ts`, con `apriDettaglio()` in `helpers.ts`.

- **2026-08-08 (la preferenza di movimento non si legge in fase di render)** —
  `/bilancio` stampava **due errori di idratazione a ogni caricamento**, ma solo
  con `prefers-reduced-motion` attivo: `useReducedMotion()` è `null` sul server —
  che non ha media query — e `true` sul browser di chi ce l'ha, quindi ogni ramo
  del **markup** su quel valore serve un HTML diverso da quello idratato.

  Il secondo errore — «Target ref is defined but not hydrated» — non era un
  difetto suo ma una **cascata** del primo: `ScrollStep` chiamava
  `useScroll({ target: ref })` sempre, e con la preferenza attiva tornava presto
  su un `<div>` semplice che quel `ref` non lo montava mai.

  **I punti erano sei, non due**, in cinque componenti — `scroll-told`,
  `sankey-flow`, `dot-scatter-timeline`, `line-chart`, `display-number`,
  `cronoprogramma-chart` — tutti nella forma `initial={reduce ? false : {…}}`.
  `initial` è markup: Motion lo scrive nello style servito. React riporta **un
  solo** mismatch per albero, quindi ognuno era invisibile finché non si
  chiudeva quello sopra: il modo di lavorare che ne esce è **rimisurare dopo
  ogni correzione**, non fidarsi del conto iniziale.

  Le due leve sicure sono **la durata** (`transition`, che nel DOM servito non
  compare) e **il CSS**: la regola su `[data-motion-reveal]` in `globals.css`
  passa da `@media print` a `@media print, (prefers-reduced-motion: reduce)`,
  perché il problema è lo stesso — una rivelazione che non può o non deve
  avvenire — e l'esito voluto è identico. L'eccezione dichiarata resta
  `app/(app)/template.tsx`, che il mismatch se lo tiene e lo dice con
  `suppressHydrationWarning`.

  **Perché nessun cancello lo vedeva:** `accessibilita.spec.ts` e
  `bersagli.spec.ts` girano già con `reducedMotion: reduce` e li scrivevano nel
  proprio log **quattro volte** — ma nessun test guarda la console, e `rotte`,
  `shots` e `produzione` non emulano la preferenza. È il buco che riscrive il
  debito 8 di `docs/prossima-sessione.md`, la cui premessa («`produzione` non
  apre `/bilancio`») era falsa: la apre da `d5b8a43`.

  **Misura:** `/bilancio` da 2 errori a **0**; sonda su **16 rotte** che rendono
  i componenti toccati, **0 con errori**.

- **2026-08-08 (la review «lenti mancanti»)** — Saltata l'11/06 e mai ripresa,
  era l'ultima voce mai passata della traccia «Qualità continua». Tre lenti:
  sicurezza, correttezza della cache, idiomi Next 16.

  **La cosa più grossa non era dove ci si aspettava.** Gli argomenti di una
  Server Action sono **input non fidato**: l'azione è un endpoint HTTP pubblico
  — il suo id sta nel bundle client — e la firma TypeScript non vale al confine
  di rete. Next cifra gli argomenti *legati* con `.bind()`, ma l'azione resta
  invocabile per conto proprio.

  Da sola sarebbe una nota da manuale. Diventa un difetto perché si incrocia con
  Prisma, che **lascia cadere i campi indefiniti** da un `where`. Misurato sul
  database di sviluppo in una transazione ribaltata:
  `deleteMany({ where: { token: "non-esiste" } })` cancella 0 righe,
  `deleteMany({ where: { token: undefined } })` ne cancella **3 su 3** — senza
  errore e senza traccia. `rimuoviPromemoriaAction` è **senza sessione**, come
  tutte le azioni a token: bastava invocarla senza argomenti.
  ⚠️ `findUnique` con `undefined` invece **rifiuta**
  (`PrismaClientValidationError`): chi provasse la famiglia partendo da lì
  concluderebbe che Prisma si difende da sé. Chiuso con `src/lib/token.ts`
  (`tokenValido`, `idValido`) messo **prima** delle query, su sei chiamanti.

  **Seconda lente, sempre sicurezza: l'origine dei link nelle mail.**
  `baseUrl()` leggeva `X-Forwarded-Host`/`Host`, che li scrive chi chiama. La
  valutazione è l'unica scrittura aperta a chi non ha un account e l'email è un
  campo libero del modulo: chi votasse con l'indirizzo di un'altra persona e un
  host forgiato le farebbe arrivare una mail vera, dal mittente vero, col link
  di conferma puntato al proprio server — e quel link porta il token che
  conferma o cancella la valutazione. Leva: **`APP_ORIGIN`**, opzionale di
  proposito (in sviluppo l'host cambia), quindi il debito resta finché non è
  impostata in produzione.

  **Terza, sulla cache.** Misurato: le pagine ricevono da Next
  `no-cache, must-revalidate`, le due rotte API **niente** — e una risposta 200
  senza istruzioni può essere conservata da una cache intermedia con la propria
  euristica. `/api/segnalazioni/simili` è **per-utente**. Ora
  `private, no-store` più `Vary: Cookie`.

  **Il resto ha retto, ed è metà del risultato di una review.** 69 Server Action
  censite una per una con uno script: tutte guardate tranne le 7 dichiaratamente
  pubbliche (3 di autenticazione, 4 a token). Nessun `try/catch` nelle azioni che
  possa ingoiare il `redirect()` di una guardia. **66 rotte tutte dinamiche**
  nella tabella del build, quindi nessun dato per-utente prerenderizzabile.
  `cachedShared` non porta dati per-utente in nessuno dei quattro usi. Idiomi
  Next 16 già a posto: `revalidateTag` è già a due argomenti, `middleware`→
  `proxy` è fatto, le API di richiesta sono tutte attese, nessuna API deprecata,
  nessun `next/image` e nessuna rotta parallela da adeguare. Resta
  `unstable_cache`, che la 16 dichiara sostituito da `use cache`: cambio
  architetturale (Cache Components), scritto fra i debiti con la sua condizione.

- **2026-08-09 (Ondata 8 — il cruscotto dice chi ha in mano che cosa)** — Le
  prime due letture operative dell'Area Comune: «Il carico degli uffici»
  (aperte e giorni mediani per ufficio) e «Dove si accumula» (le categorie con
  abbastanza casi). Fra i quattro numeri e le sei porte, perché sono una
  lettura e non una destinazione.

  **La misura ha deciso metà del disegno, e l'ha fatto prima del disegno.** Su
  42 segnalazioni: l'**ufficio è l'unico asse dove ogni cella regge il
  campione** (5 su 5), categoria e quartiere ne hanno **metà sotto la soglia**
  (5 su 10 ciascuno), e l'urgenza non è un asse — 40 righe su 42 non ce l'hanno.
  Da lì la forma: un asse solido, uno dichiaratamente parziale, e nessun terzo.

  **Tre scelte che vengono dalle regole già pagate**, non dal gusto:

  1. **Le segnalazioni senza ufficio stanno fuori dall'elenco**, per costruzione.
     Sono 6 aperte e 0 chiuse: dentro la classifica sarebbero la riga più lenta
     e più rossa della pagina, **attribuita a un ufficio che non esiste**. È la
     trappola dell'ondata 7 («una percentuale su un campione minuscolo, tinta a
     colori, è un'accusa») aggravata dal fatto che qui non c'è nessuno da
     accusare. Il numero resta e dice un'altra cosa, con la frase che lo spiega.
  2. **Mediana, mai media.** Una pratica ferma da un anno fra quattro svelte
     porta la media a 75 giorni contro una mediana di 3. Un unit lo prova con
     quei due numeri accanto.
  3. **Nessuna barra.** Una barra del tempo mediano avrebbe come massimo «il
     peggiore osservato», cioè una scala a tacche senza traguardo fissato — ciò
     che `DESIGN.md` vieta e che ha già fatto togliere la scala da `/promesse`.

  **La soglia si importa, non si riscrive**: `CAMPIONE_MINIMO_PER_GIUDIZIO` sta
  in `citystats.ts` e `analitiche.ts` la prende da lì, con un test che lo
  verifica — due soglie diverse per lo stesso giudizio sono peggio di nessuna.

  ⚠️ **Una correzione mia, e vale più della funzione.** Avevo raccomandato la
  forma piccola perché quella grande «sfondava il tetto di 1.894px» — ma 1.894
  è la coda peggiore *prima* di lista + dettaglio, un numero **citato da un
  documento invece che misurato**. Misurato col browser, il tetto a 360px è
  **3.327px** (`/admin/valutazioni`), e le due card portano `/admin` a 2.379:
  quasi mille pixel di margine. Lorenzo ha scelto la forma grande contro la mia
  raccomandazione, e aveva ragione lui.

  **Cancelli**: unit da 253 a **263**, E2E da 116 a **119** — nessuna rotta
  nuova, quindi `rotte` resta 66 e `/admin` era già dentro a11y e bersagli, dove
  le due card sono entrate da sole.

- **2026-08-09 (Ondata 8 — la moderazione assistita, riscritta dalle misure)** —
  Delle tre euristiche che la ROADMAP prevedeva — spam, duplicati, suggerimento
  di categoria — ne è sopravvissuta una, e non dove doveva stare.

  **I duplicati per somiglianza del testo: zero veri positivi.** Sopra il 50%
  nessuna coppia; la sola sopra il 40% è «Lampione a intermittenza in Via
  Dalmazia» contro «…in Via Bonellina» — due lampioni, due strade, due
  quartieri. ⚠️ Il motivo vale oltre il seed: le segnalazioni comunali sono
  **formulari**, quindi il testo si somiglia **proprio quando il luogo cambia**,
  e il luogo è il segnale che distingue. Una somiglianza testuale tratta come
  rumore l'unica cosa che conta, e l'azione che ne discende
  (`mergeReportsAction`) fonde davvero.

  Al triage è arrivata invece la lente che **esisteva già** e che era già
  quella giusta: «altre N aperte, stessa categoria e stesso quartiere» — la
  stessa di `findSimilarReports`, che il cittadino vedeva mentre scrive e il
  moderatore no. **È un fatto, non una stima**, quindi non ha niente da tarare
  né da dichiarare incerto.

  **Il suggerimento di categoria è finito sul modulo del CITTADINO**, non su
  quello del Comune. Il triage cambia stato, ufficio e nota; **la categoria la
  sceglie il cittadino e nessuna superficie del Comune la modifica**. Sul triage
  il blocco avrebbe mostrato una discrepanza che l'operatore non poteva
  risolvere — da cui la regola in `AGENTS.md` §3: *un consiglio che non si può
  seguire è peggio del silenzio*. Il sintomo, però, non somigliava alla causa:
  si presentava come «il suggerimento non compare mai».

  **Le quattro difese**, tutte negli unit: tace se non trova parole, tace se due
  categorie pareggiano, tace se conferma la scelta già fatta, e **non
  pre-seleziona niente** — la tendina cambia solo premendo «Usa «…»». Le prove
  a schermo sono **le parole della persona** e non i token del codice: mostrare
  «cassonett» invece di «cassonetto» è onesto e somiglia a un refuso, e su una
  superficie pubblica un artefatto che pare un errore mina la fiducia che il
  blocco vuole costruire. ⚠️ Correggendolo è entrato un difetto nuovo, trovato
  **dal test**: `\p{L}\p{N}` non comprende i segni combinanti (`\p{M}`), quindi
  un accento decomposto spezzava la parola e «velocità» usciva «velocita».

  **Lo spam resta fuori** perché il seed non ne contiene: non c'è niente su cui
  tarare, e un'euristica tarata sul nulla è una promessa.

- **2026-08-09 (Ondata 8 — la pipeline degli atti: l'archivio vero è 140 volte
  più grande)** — La metà rischiosa dell'ondata, e la misura ha riscritto la
  premessa prima del disegno: il piano indicava due griglie da **188** atti, e
  sotto «Pubblicità Legale» il portale espone **26.588 atti nello «Storico
  atti»** più 202 sull'albo corrente, tutti con export CSV (13,4 MB in ~161s;
  l'albo in 2s). Le due griglie piccole sono selezioni per obbligo di
  trasparenza, contenute al 97% nell'archivio vero. Ricognizione completa in
  `docs/fonti-atti.md`; Lorenzo ha scelto di leggere **tutto l'archivio**.

  **Le quattro trappole misurate** (ora in `AGENTS.md` §3): `Url atto` è
  l'identità della *pubblicazione* e non dell'atto (385 doppioni con due id
  consecutivi per lo stesso atto; l'identità è `(tipo, anno, numero)` con due
  ripieghi, e il terzo livello salva due delibere reali del 2024 che altrimenti
  collassano); il **WAF blocca sullo user-agent** e risponde 500 «Web Page
  Blocked» a `HeadlessChrome` mentre a un UA di Chrome vero risponde 200; le
  griglie hanno **24 e 25 colonne** (in mezzo `Spesa prevista`), quindi si
  mappa per nome; l'export grande dichiara `text/html` e manda CSV, quindi si
  guarda il corpo. E due assunti della consegna non reggono: `Assessore
  descrizione` è vuota ovunque, e **l'importo non esiste nella fonte**
  (`Spesa prevista` = `0,00` su 26.588 righe) — il campo promesso dalla ROADMAP
  non si può riempire da qui, e rientra solo leggendo gli allegati.

  **Costruito:** modelli `Atto`/`LetturaAtti` (26.591 atti reali; il seed non
  li tocca né li riempie, per il divieto fondante); `npm run atti` (giro
  quotidiano sull'albo — un atto vi resta ~15 giorni, quindi 2s/giorno
  intercettano tutto; idempotenza verificata: seconda passata = 1 nuovo, un
  decreto recuperato, 0 doppioni); `npm run atti:freschezza` (7 controlli,
  «bloccata dal WAF» distinta da «fuori servizio», **provato rosso** con una
  lettura bloccata iniettata; soglia di 10 giorni = doppio del buco più lungo
  in 5,5 anni, che è 5, Ferragosto compreso); la **categoria civica dedotta
  dall'ufficio proponente** (69% misurato; la `Classifica` del portale provata
  e scartata: titolario di protocollo con «VARIE ES. CENTRO GIOVANI» che si
  mangia la Cultura; regola del segmento di testa, senza cui 395 atti di
  lavori pubblici finivano in Sport; fermo di 102 uffici nei test); il
  **monitor sul cruscotto** (forma C scelta sui tre mockup iniettati e
  misurati; stato con le stesse soglie del cancello via `statoArchivio`; i
  temi dichiarati «dedotti dall'ufficio», perché il conteggio è un fatto e la
  sintesi è un giudizio; a base dati mai letta dice «Mai letto» e come
  uscirne, provato dall'E2E — il database dimostrativo e quello degli E2E non
  hanno atti per disegno).

  **Fuori con le condizioni** (`docs/fonti-atti.md` §5): i legami a
  opera/bilancio sarebbero **disonesti oggi** — atti reali su opere
  dimostrative è il divieto fondante al contrario — e si aprono quando quei
  dati saranno reali; il legame a quartiere è misurato (888 atti nominano un
  quartiere vero, Bottegone 442) e si costruisce davanti alle pagine di O11,
  con la resa «atti che nominano», mai «atti su».

- **2026-08-09 (nessun controllo esce dal proprio contenitore)** —
  `tests/e2e/contenimento.spec.ts` (`npm run contenimento`), 21 pagine × 2
  viewport, bloccante, eccezioni vuote. Chiude l'ultima categoria che «si
  trovava solo guardando»: un controllo che sporge dal proprio riquadro e viene
  **ritagliato**. Nessuno dei tre cancelli esistenti poteva vederlo — `shots`
  misura il traboccamento della *pagina*, che resta zero proprio perché la card
  ha `overflow` nascosto; `bersagli` misura la *dimensione*; axe non ha una
  regola per «tagliato». La regola che lo tiene silenzioso sui casi legittimi:
  **un contenitore che scorre non ritaglia**, quindi il rosso scatta solo dove
  l'antenato ha `overflow: hidden`/`clip` sull'asse su cui il controllo sporge —
  la parte fuori è irraggiungibile. Si risale tutta la catena degli antenati.
  Prima accensione 0 rossi su 42 (il difetto dei 62px era chiuso dal 07/08);
  **provato rosso nei due versi** — un pulsante ritagliato lo becca a 62px, due
  dentro un `overflow-y: auto` no.

- **2026-08-09 (il cancello che legge la console)** — `npm run rotte` ora
  ascolta `pageerror` e `console.error` su ogni rotta che apre (avvisi e
  informazioni esclusi: un cancello rumoroso smette di essere letto), con
  `prefers-reduced-motion: reduce` emulata su tutte e tre le passate — lo
  stato in cui i sei errori di idratazione di `/bilancio` sono vissuti mesi
  scritti nel log di E2E verdi. Prima accensione: **66 rotte, 0 errori**,
  nessuna rossa di nascita. **Provato rosso** con un `console.error` iniettato
  su `/glossario`: 1 rossa, uscita 1, messaggio in riga (2 eventi: StrictMode
  monta due volte in sviluppo), poi rimosso e due passate pulite. Limite
  dichiarato: un errore arrivato dopo lo snapshot di una rotta si attribuisce
  alla successiva — meglio della rotta accanto che perso, e il testo dice da
  quale componente viene. Gli errori della preparazione (login, scoperta dei
  dettagli) si scartano dichiaratamente.

## 11. Roadmap

La roadmap completa è in **[`ROADMAP.md`](./ROADMAP.md)**.

**Svolta strategica (2026-06-11):** il progetto resta una **demo mock** (locale + GitHub, nessun dato
reale) e si evolve su tre direttrici — funzionalità, semplicità d'uso, estetica. I due addenda
(`pistoia-community-addendum-ulteriori-proposte.md` e `pistoia-community-addendum-2-funzioni-evolutive.md`,
~60 proposte) sono stati analizzati, deduplicati e integrati nella roadmap con riferimenti `A1 §n`/`A2 §n`.
L'ex "Fase 2 dati reali" e l'ex "Fase 4 fiducia istituzionale" sono **in pausa**, conservate integralmente.

**Riscrittura professionale (2026-06-11/12):** ROADMAP.md è ora diviso tra visione e piano, con tag
di livello (FE·DES·UX·BE·ENG·SEC·A11Y·AI) su ogni idea e 18 proposte nuove (🆕). Struttura:
- **§0 Come leggere** — legende di stato e di livello
- **§1 Visione** — north star, "cosa è / cosa non è", tre direttrici, decisione mock
- **§2 Obiettivi** — OB-1…OB-5 verificabili (ciclo civico chiuso, design distintivo, semplicità radicale, demo autoesplicativa, qualità continua)
- **§3 Completato** — …, **Ondata 2 Semplicità & profilo (2026-06-11)**, **Ondata 0 Fondamenta visive (2026-06-12)**, **Ondata 1 Segnalazioni 2.0 (2026-06-12)**, **Ondata 3 Trasparenza (2026-06-12)**, **Ondata 4 Territorio & partecipazione (2026-06-13)**
- **§4 Piano a ondate** — ~~O0 Fondamenta visive~~ ✅ → ~~O1 Segnalazioni 2.0~~ ✅ → ~~O3 Trasparenza~~ ✅ → ~~O4 Territorio & partecipazione~~ ✅ → O5 Admin & nuovi pubblici (prossima, con **Vetrina aziende & sponsor**) + traccia "Qualità continua"
- **§5 Nuove proposte (revisione 2026-06-11)** — le 🆕 con motivazione e destinazione
- **§6 Catalogo delle idee per tema** — tutte le idee deduplicate con livello, fonte e stato (✅/🔜/📋/💡/🧊)
- **§7 Regole di prodotto** — 9 vincoli trasversali (…, n. 8 "il design è progettato, non generato" → `DESIGN.md`, n. 9 "gli sponsor sono ospiti, non padroni")
- **§8–9 In pausa** — dati reali (fonti + ETL) e fiducia istituzionale (SPID, GDPR, AgID…)
- **§10 Rischi** — aggiunto il design debt, mitigato da O0 + token
