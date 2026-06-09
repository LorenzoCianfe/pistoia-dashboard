# Dashboard di Pistoia — Documentazione

> Documento vivo. Viene aggiornato a ogni cambiamento rilevante del progetto.
> Ultimo aggiornamento: 2026-06-09

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
| `Report` / `ReportConfirmation` / `ReportStatusHistory` | Segnalazioni: workflow di stato, "Anche io", storico ufficiale |
| `Proposal` / `ProposalSupport` | Proposte cittadine con sostegni e soglie (50/200/500) |
| `Follow` | "Segui" generico (quartieri, opere, segnalazioni, proposte) |
| `ModerationAction` | Log append-only di azioni admin/moderatore (audit) |

Enum modellati come stringhe (SQLite non ha enum nativi). Estensioni a entità esistenti: `User`
(`publicName`, `role`, `accountType`, `verifiedType`, `neighborhoodId`), `CommunityPost`
(`kind`, `neighborhoodId`, `hidden`), `OfficialAnswer` (`department`, `authorId`, `updatedAt`),
`Poll` (`kind`, `requiresVerified`, `neighborhoodId`). Migrazione `community_mvp` applicata.

---

## 7. Sezioni e funzionalità

| Sezione | Stato | Note |
|---|---|---|
| La mia città | ✅ | Home personalizzata: saluto, quartiere, KPI ("vicino a te"), segnalazioni vicine, proposte in evidenza, scorciatoie. È il redirect post-login |
| Bilancio | ✅ | 142 mln (contatore animato), 3 anelli (riscossione/impegni/PNRR), grafico a linee mensile, spesa per missione |
| Opere | ✅ | 318 censiti, cantieri in evidenza con barre animate, griglia di tutti i cantieri, KPI aggregati |
| Sondaggi | ✅ | Voto ottimistico; **consultazioni ufficiali** e **voti territoriali** riservati ai verificati (`requiresVerified`) |
| Comunità | ✅ | Composer con **tipo post** (domanda/idea/avviso…) e **quartiere**; feed con badge di verifica autore, like/commenti ottimistici, risposte ufficiali con **ufficio**; moderazione (nascondi) |
| Segnalazioni | ✅ | Lista con filtri + KPI, creazione, **workflow di stato** (stepper), **"Anche io"** (conferme anti-doppione), dettaglio con timeline ufficiale, follow, mappa placeholder |
| Proposte | ✅ | Lista + creazione, **soglie di sostegno** (50/200/500) con barra, **sostegno gated ai verificati**, risposta ufficiale del Comune, dettaglio |
| Organigramma | ✅ | Sindaco + giunta, follower, follow/unfollow |
| Notifiche | ✅ | Lista per tipo (incl. segnalazione/proposta/verifica), segna-come-letta, badge nel TopBar |
| Profilo | ✅ | Dati, **badge** e stato verifica, **richiesta verifica**, statistiche (segnalazioni/proposte/voti/segui), nome pubblico |
| Impostazioni | ✅ | **Preferenze notifiche** per canale, tema chiaro/scuro/sistema, cambio password, logout globale |
| Area Comune | ✅ | **Coda verifiche** (approva/rifiuta), **triage segnalazioni** (stato/ufficio/nota), **revisione proposte**, risposte ufficiali, broadcast, **registro azioni** |
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

## 11. Roadmap — dalla fase mock alla fase prodotto

> Definita il 2026-06-09 a partire dall'analisi multi-agente. Obiettivo: portare il progetto da
> "demo che sembra vera" a "prodotto che **è** vero", su due binari paralleli — **abilitatori
> infrastrutturali** (DB/Redis, test+CI, astrazione delle fonti dati con provenienza, mailer) e
> **credibilità** (ingestione di dati pubblici reali + funzioni partecipative).
> Ethos non negoziabile: **"la trasparenza reale non abbellisce"** — ogni dato porta la sua fonte e
> la data di aggiornamento; cantieri fermi/sospesi etichettati onestamente; baseline finti
> (`baseVotes`/`baseLikes`/stelle 4.6/risposte "verified" di default) azzerati prima di ogni lancio.
> Regola di sequenza: gli abilitatori arrivano **prima** delle funzioni che ne dipendono.

### Quick win (alto valore / basso costo — da fare subito)
1. **Security headers + CSP + `serverActions.allowedOrigins`** in `next.config.ts` (oggi assenti).
2. **`error.tsx` / `loading.tsx` / `not-found.tsx`** per rotta (usa la classe `.skeleton` già esistente ma mai usata).
3. **Azzerare i baseline finti** dietro un flag `DEMO_MODE` (default off in prod).
4. **Test unitari ad alto valore** (Vitest): `toPercents` (largest-remainder), `safeNext`, rate-limiter, `validation`, `colors`.
5. **`pistoia.config.ts`** con gli identificativi reali del Comune (ISTAT 047014, codice ente BDAP, P.IVA).
6. **Alternative testuali ai grafici** SVG (`role=img` + tabella sr-only) — fallimento WCAG 1.1.1 oggi.
7. **Fix integrità voto**: verificare `option.pollId === pollId` in `voteAction` (buco cross-poll).
8. **Empty state per cittadini** (sostituire "Esegui il seed del database" e aggiungere zero-state a feed/sondaggi/commenti).

### Fasi

**Fase 0 — Hardening & Onestà (≈3-5 settimane).** Rendere il prototipo attuale sicuro, osservabile,
testato e legalmente presentabile **senza cambiare la fonte dati**. Security headers/CSP/CSRF esplicito;
error/loading boundary + `result` helper + logger + Sentry + `env.ts` (Zod); harness Vitest + CI
(GitHub Actions: lint, typecheck, test, build, migration-drift) + Husky + Dependabot; honesty hygiene
(flag `DEMO_MODE`, `OfficialAnswer.verified` legato all'admin reale); scaffolding a11y/legale
(alt grafici, contrasto light-theme, footer istituzionale + `/accessibilita` `/privacy` `/note-legali`,
menu profilo accessibile); fix integrità dati (voto, transazioni, rate-limit su **tutte** le write action).

**Fase 1 — Abilitatori di piattaforma (≈4-6 settimane).** Le migrazioni da fare **mentre i dati sono
ancora mock** (rischio zero). SQLite → **Postgres/Neon** (`@prisma/adapter-pg`) + **Redis/Upstash** per
il rate-limit; **astrazione delle fonti dati + schema di provenienza** (interfacce `BudgetSource`/
`OpereSource`; campi `externalId`/`sourceUrl`/`sourceName`/`lastSyncedAt`; modelli `DataSource` +
`ImportRun`; flag `DATA_MODE` per-sezione, default mock); **mailer transazionale** (verifica email +
"password dimenticata", oggi impossibili — nessun mailer); schema pronto per geo/audit
(`latitude`/`longitude` su `Opera`, modello `Quartiere`, soft-delete, `AuditLog`, indici sui filtri caldi,
revalidation a tag); layer test integration + E2E (Playwright).

**Fase 2 — Dati reali: prima Bilancio, poi Opere (≈8-12 settimane).** Il salto concept→prodotto.
*2a Bilancio → BDAP/OpenBDAP* (fonte unica, pulita, canonica per legge — d.lgs 33/2013 art. 9-bis):
`totale entrate/spese/avanzo → BudgetYear`, missioni armonizzate → 6 categorie display; gestire il gap
mensile **onestamente** (SIOPE+ per i flussi mensili reali, oppure ri-etichettare `BudgetMonth` come
curva derivata); + switch anno e confronto anno-su-anno + glossario "spiega in parole semplici".
*2b Opere → OpenCUP + ReGiS/PNRR + ANAC* (fusione multi-fonte, XL): base record da OpenCUP, avanzamento
reale dai lavori PNRR via ReGiS, appalti da ANAC; status derivato da regola; geocoding per la mappa;
etichette di freschezza oneste; pagine dettaglio `/opere/[id]`. *ETL come job schedulato separato*
(mai nel request path): download → filtro Pistoia → upsert idempotente; monitor sul portale comunale
(oggi vuoto); pagina "Fonti dei dati" + badge di attribuzione (CC-BY OpenCUP, ODbL PNRR).

**Fase 3 — Prodotto partecipativo (≈8-12 settimane).** Le funzioni first-party che chiudono il loop
cittadino↔amministrazione (non sono ETL: diventano reali quando i cittadini le usano). **Segnalazioni**
(modello + lifecycle `ricevuta→presa_in_carico→in_lavorazione→risolta|non_accolta` + coda di triage
admin + notifica a ogni cambio stato) — feature di punta; **mappa interattiva** (MapLibre/Leaflet, tile
OSM, pin per categoria, "vicino a te" su `quartiere`); **ricerca globale** (cmd-k) + **open-data-out**
(export CSV/JSON, API read-only) + **home personalizzata** "La mia Pistoia" (Follow generico); **digest
email** (cron, usa il mailer della Fase 1).

**Fase 4 — Fiducia istituzionale & layer decisionale (≈10-16 settimane).** Ciò che rende la piattaforma
un servizio comunale adottabile ufficialmente. **SPID/CIE** (identità verificata, OIDC/SAML — palo
lungo); **hardening account** (lockout persistente, check password compromesse via HIBP, 2FA TOTP
obbligatorio per admin, IP da hop fidato, rotazione `SESSION_SECRET`); **conformità GDPR/AgID completa**
(consenso cookie, privacy/retention, export + diritto all'oblio, dichiarazione di accessibilità formale,
audit WCAG 2.1 AA); **Delibere + documenti** (modello `Delibera` + `Attachment`, calendario sedute,
snapshot di bilancio versionati) per completare la narrazione decisione→soldi→opera.

### Rischi principali (con mitigazione)
- **Disponibilità dati asimmetrica/assente** → design national-first; reclassificare Sondaggi/Comunità/
  Segnalazioni come first-party, non ETL; monitor sul portale comunale.
- **Qualità/freschezza dati** vs ethos → rendere l'onestà una feature (badge provenienza, stati
  "dato non disponibile dalla fonte"); lo schema di provenienza (Fase 1) precede ogni flip a dati reali.
- **Non conformità legale/GDPR/a11y** → anticipare i fix economici in Fase 0, completare il layer prima
  del lancio pubblico (gate su checklist di conformità).
- **Ceiling di scala** (SQLite + rate-limit in-memory single-instance) → migrazione Postgres+Redis in
  Fase 1 mentre i dati sono mock.
- **Regressioni su codice security-critical non testato** → harness test+CI in Fase 0 **prima** dei refactor.
- **Scope sprawl** (~67 finding) → gating rigido per fasi; ogni sezione non ancora "reale" resta mock
  dietro `DATA_MODE`.

### Fonti dati reali individuate (verificate)
| Fonte | Alimenta | Formato / Licenza | Caveat |
|---|---|---|---|
| **OpenBDAP/BDAP** (RGS-MEF) | Bilancio (`BudgetYear`/`Category`) | CSV/JSON/XML | Solo granularità annuale (no mensile); canonica per legge |
| **SIOPE+** (Banca d'Italia) | Bilancio `BudgetMonth` | dati pagamenti/incassi | Unica fonte a cadenza mensile |
| **OpenCUP** | Opere (record base) | API/CSV · **CC-BY** | No % fisica per opere non-PNRR; dataset nazionale ~1.7 GB |
| **ReGiS/Italia Domani + OpenPNRR** | Opere (avanzamento PNRR) | CSV/JSON · **ODbL 1.0** | Solo opere finanziate dal PNRR |
| **ANAC** | Opere (appalti/contratti) | CSV/JSON/OCDS | Cadenza mensile; matching non banale |
| **Comune di Pistoia** (`pistoiaopen` + SIT) | monitor + base map | CKAN / WMS-WFS | **Portale VUOTO (0 dataset)**; SIT solo cartografia base |
| **ISTAT 047014** | chiave di filtro Pistoia | CSV/JSON | Usato come join key |
| **Pagine Comune (giunta) / Albo Pretorio** | Organigramma / Delibere | HTML (curato a mano) | Nessun feed aperto; SPID/CIE è dipendenza identità, non dataset |
