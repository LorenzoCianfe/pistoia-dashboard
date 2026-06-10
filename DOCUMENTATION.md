# Dashboard di Pistoia — Documentazione

> Documento vivo. Viene aggiornato a ogni cambiamento rilevante del progetto.
> Ultimo aggiornamento: 2026-06-10

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
| Grafici | Componenti **SVG custom** animati (anelli, linee morbide, barre) |
| Mappe | **Leaflet** (tile OSM, marker vettoriali, caricato via dynamic import client-only) |

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

### Variabili d'ambiente (`.env`)
| Variabile | Descrizione |
|---|---|
| `DATABASE_URL` | Percorso SQLite, default `file:./prisma/dev.db` |
| `SESSION_SECRET` | Segreto per l'HMAC dei token di sessione (rigenerabile) |

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
│  ├─ schema.prisma        # modello dati
│  ├─ migrations/          # migrazioni SQL
│  └─ seed.ts              # dati mockup
├─ prisma.config.ts        # config Prisma 7 (schema, migrazioni, datasource)
├─ src/
│  ├─ proxy.ts             # ex-middleware: guard ottimistico delle rotte protette
│  ├─ app/
│  │  ├─ layout.tsx        # root: font, ThemeProvider, metadata
│  │  ├─ page.tsx          # landing pubblica
│  │  ├─ (auth)/           # login, registrati (+ layout brandizzato)
│  │  ├─ (app)/            # area protetta: le 4 sezioni + extra (+ layout con nav)
│  │  └─ actions/          # Server Actions (auth, polls, community, ...)
│  ├─ components/
│  │  ├─ ui/               # primitivi (Card, Button, Badge, Avatar, ...)
│  │  ├─ charts/           # RingGauge, LineChart (SVG animati)
│  │  ├─ brand/            # Crest (stemma di Pistoia)
│  │  ├─ app/              # TopBar, SideNav, BottomNav, ProfileMenu
│  │  └─ <sezione>/        # componenti client per sondaggi, comunità, admin, ...
│  ├─ lib/
│  │  ├─ db.ts             # singleton PrismaClient (+ adapter sqlite)
│  │  ├─ auth/             # password, session, dal, rate-limit, validation
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
  notifiche, profilo, admin) con `requireUser`/`requireAdmin` + `revalidatePath`.
- **Client Components** usano `useActionState` / `useOptimistic` / `useTransition` per UI reattiva.

---

## 5. Modello di sicurezza (auth)

- Password con **Argon2id** (OWASP: m=19 MiB, t=2, p=1). Mai salvate in chiaro.
- **Sessioni opache server-side**: il cookie contiene un token casuale da 32 byte; in DB si salva
  solo il suo **HMAC-SHA256** (chiave = `SESSION_SECRET`). Un leak del DB non permette di forgiare
  un cookie valido.
- Cookie `pistoia_session`: `HttpOnly`, `SameSite=Lax`, `Secure` in produzione, durata 30 giorni.
- `SESSION_SECRET` **obbligatorio in produzione**: l'app rifiuta di avviarsi senza (nessun fallback insicuro).
- **Rate-limiting** in-memory a più livelli sul login: per coppia IP+email (5/15min), **per-account
  indipendente dall'IP** (10/15min, vera difesa anti-brute-force anche con IP spoofato) e per-IP
  (40/15min, difesa in profondità); registrazione 8/ora per IP. (In-memory ⇒ per-istanza, si azzera
  al riavvio; in produzione l'IP va letto da un reverse proxy fidato e il limiter spostato su Redis/DB.)
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

Enum modellati come stringhe (SQLite non ha enum nativi). Estensioni a entità esistenti: `User`
(`publicName`, `role`, `accountType`, `verifiedType`, `neighborhoodId`, **`geoConsent`**, **`banned`**,
**`suspendedUntil`**), `CommunityPost` (`kind`, `neighborhoodId`, `hidden`), `PostComment` (**`hidden`**),
`OfficialAnswer` (`department`, `authorId`, `updatedAt`), `Poll` (`kind`, `requiresVerified`,
`neighborhoodId`). Migrazioni `community_mvp` e **`community_v2`** applicate.

---

## 7. Sezioni e funzionalità

| Sezione | Stato | Note |
|---|---|---|
| La mia città | ✅ | Home personalizzata: saluto, quartiere, KPI ("vicino a te"), segnalazioni vicine, proposte in evidenza, scorciatoie. È il redirect post-login |
| Bilancio | ✅ | 142 mln (contatore animato), 3 anelli (riscossione/impegni/PNRR), grafico a linee mensile, spesa per missione |
| Opere | ✅ | 318 censiti, cantieri in evidenza, griglia, KPI; **follow** per cantiere; **pagina dettaglio `/opere/[id]`** (fonte finanziamento, RUP, foto prima/durante/dopo, FAQ, commenti cittadini, mini-mappa) |
| Mappa | ✅ | **Mappa interattiva `/mappa`** (Leaflet + tile OSM): layer attivabili (opere, segnalazioni, eventi, uffici, scuole, verde, servizi), pin per categoria, popup con link |
| Sondaggi | ✅ | Voto ottimistico; **consultazioni ufficiali** e **voti territoriali** riservati ai verificati (`requiresVerified`) |
| Comunità | ✅ | Composer con **tipo post** e **quartiere**; feed con badge autore, like/commenti ottimistici, risposte ufficiali con **ufficio** + **"questa risposta è utile?"**; **segnala commento**; moderazione (nascondi) |
| Segnalazioni | ✅ | Lista con filtri + KPI, creazione con **foto reale** (upload) e **geolocalizzazione precisa**, **invio anonimo**, **workflow di stato**, **"Anche io"**, dettaglio con timeline ufficiale, **mappa reale**, follow |
| Eventi | ✅ | **Calendario `/eventi`** per mese; **pubblicazione dal Comune** e **proposta dalle associazioni verificate** con **approvazione** del Comune/moderatori; follow evento/associazione |
| Quartieri | ✅ | **Indice `/quartieri`** + **pagina per area `/quartieri/[slug]`** che aggrega segnalazioni, opere, eventi, proposte e discussioni; follow del quartiere |
| Proposte | ✅ | Lista + creazione, **soglie di sostegno** (50/200/500), **sostegno gated ai verificati**, risposta ufficiale + **"questa risposta è utile?"**, dettaglio |
| Organigramma | ✅ | Sindaco + giunta, follower, follow/unfollow |
| Notifiche | ✅ | Lista per tipo (incl. segnalazione/proposta/verifica/evento), segna-come-letta, badge nel TopBar |
| Profilo | ✅ | Dati, **badge** e stato verifica, **richiesta verifica**, statistiche, nome pubblico |
| Impostazioni | ✅ | Preferenze notifiche, tema, cambio password, logout globale; **Privacy e dati** (consenso geo, **export JSON**, **cancellazione account**, link a privacy/cookie/regole) |
| Area Comune | ✅ | Coda verifiche, triage segnalazioni, revisione proposte, risposte, broadcast, registro azioni; **moderazione community** (commenti segnalati, ban/sospensione, parole bloccate, **unione duplicati**); **approvazione eventi** |
| Pagine legali | ✅ | `/privacy`, `/cookie`, `/note-comunita` (pubbliche) + **footer istituzionale** |
| Tema chiaro/scuro | ✅ | next-themes, colori di Pistoia mantenuti |

---

## 8. Design

Moderno e minimal, mobile-first. Sfondo quasi bianco con sfumature morbide di **teal (verde acqua)**
e **viola** agli angoli; badge **ambra**; il rosso dello **stemma a scacchi** di Pistoia. Linee
morbide (raggi generosi), ombre delicate, font **Plus Jakarta Sans**. Numeri, anelli, linee e barre
si animano all'ingresso ("i dati che arrivano in tempo reale"); ogni sezione entra con uno
scivolamento verso l'alto, come nelle app native. Rispetta `prefers-reduced-motion`.

---

## 9. Deploy / hosting

L'app **non** può stare su GitHub Pages (che serve solo siti statici): qui serve un server in
esecuzione (Server Actions, sessioni, database). Opzioni gratuite valide:

| Opzione | Note |
|---|---|
| **Vercel** (Hobby, gratis) | Casa naturale di Next.js. È serverless ⇒ va sostituito SQLite con un **Postgres gestito** (es. **Neon**, gratis): cambiare il `provider` Prisma in `postgresql`, usare l'adapter `@prisma/adapter-pg`, lanciare migrazioni + seed sul DB remoto. Sempre attivo, veloce. **Consigliato.** |
| **Render / Railway / Fly.io** | Eseguono un container Node persistente ⇒ si può **mantenere SQLite** (i dati si resettano a ogni redeploy, va bene per un mock). Tier free con sospensione su inattività. |

> Promemoria sicurezza per il deploy: impostare `SESSION_SECRET` (l'app in produzione rifiuta di
> avviarsi senza), servire in HTTPS (il cookie diventa `Secure`), e leggere l'IP del client da un
> reverse proxy fidato per il rate-limiting.

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

## 11. Roadmap

La roadmap completa è in **[`ROADMAP.md`](./ROADMAP.md)**.

Struttura del documento:
- **✅ Completate** — v1 base, review sicurezza, Community MVP, Community v2 (9 blocchi §6/§8/§9/§10/§14/§17/§18/§21/§23)
- **🔄 In corso** — nessuna attività al momento
- **🔜 Prossime attività** — Fase 0 Hardening (security headers, CSP, `env.ts` Zod, rate-limit write action, Vitest+CI, a11y, `DEMO_MODE`, Sentry)
- **💡 Idee future** — §19 Bilancio partecipativo, §20 AI civica, §22 Pistoia Pulse; Fase 1 (Postgres/Redis/mailer), Fase 2 (dati reali BDAP/OpenCUP/ReGiS/ANAC), Fase 3 (ricerca globale, open-data-out, digest email), Fase 4 (SPID/CIE, 2FA, GDPR, Delibere)
