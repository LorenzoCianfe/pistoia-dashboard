# Dashboard di Pistoia — Documentazione

> Documento vivo. Viene aggiornato a ogni cambiamento rilevante del progetto.
> Ultimo aggiornamento: 2026-06-12

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
| Moderatore civico | `moderatore@pistoia.it` | `Pistoia2026` |
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
  la verifica reale (DB) avviene nella DAL, vicino ai dati.
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
| `Assessore` / `AssessoreFollow` | Giunta (albero `parentId`) e follow dei cittadini |
| `CommunityPost` / `OfficialAnswer` / `PostComment` / `PostLike` | Feed "la città risponde" |
| `ServiceReview` | Recensioni a stelle dei servizi |
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
| Area Comune | ✅ | Coda verifiche, triage segnalazioni, revisione proposte, risposte, broadcast, registro azioni; **moderazione community** (commenti segnalati, ban/sospensione, parole bloccate, **unione duplicati**); **approvazione eventi** |
| Decisioni | ✅ | **Archivio decisioni `/decisioni`** (O3): esito + motivo in semplice, "perché non si può fare" evidenziato sulle respinte, link al percorso |
| Promesse | ✅ | **Tracker `/promesse`** (O3): impegni per stato con riepilogo a pill, origine, scadenza comunicata e nota di aggiornamento |
| Avvisi urgenti | ✅ | **Bacheca `/avvisi`** (O3): severità, "cosa cambia per me" a punti, mini-mappa dei geolocalizzati, archivio conclusi; **banner in home** e **layer dedicato su /mappa** |
| FAQ della città | ✅ | **`/faq`** (O3): domande raggruppate per tema, badge 🏛️ "Risposta ufficiale", rimando alla Comunità |
| Report del mese | ✅ | **Civic digest `/digest`** (O3): riepilogo 30 giorni calcolato dai dati (segnalazioni, opere, proposte, decisioni, eventi) + **export PDF** via print stylesheet |
| Glossario | ✅ | **`/glossario`** (O3): termini amministrativi in linguaggio semplice (statico in `lib/glossary.ts`) + tooltip **`GlossaryTip`** nel bilancio |
| Pagine legali | ✅ | `/privacy`, `/cookie`, `/note-comunita` (pubbliche) + **footer istituzionale** |
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
