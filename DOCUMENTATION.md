# Dashboard di Pistoia — Documentazione

> Documento vivo. Viene aggiornato a ogni cambiamento rilevante del progetto.
> Ultimo aggiornamento: 2026-06-08

---

## 1. Cos'è

La **Dashboard di Pistoia** è una piattaforma civica che trasforma i dati pubblici del Comune di
Pistoia in qualcosa che un cittadino possa davvero leggere, capire e usare. Quattro sezioni
principali — **Bilancio, Opere, Sondaggi, Comunità** — più una serie di funzioni da "piattaforma
completa": profilo, impostazioni, notifiche, organigramma e un'area admin riservata al Comune.

Vision e concept completi: vedi [`pistoia-dashboard-concept.txt`](./pistoia-dashboard-concept.txt).

**Repository GitHub:** <https://github.com/LorenzoCianfe/pistoia-dashboard> (pubblico).

> **Stato attuale:** prototipo **funzionante e completo** con **dati mockup** (seed nel database).
> Nessun collegamento a fonti dati esterne/reali. L'autenticazione invece è **reale e sicura**.

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
| Ruolo | Email | Password |
|---|---|---|
| Cittadino | `cittadino@pistoia.it` | `Pistoia2026` |
| Comune (admin) | `comune@pistoia.it` | `Comune2026!` |

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
| `Notification` | Centro notifiche per utente |

Enum modellati come stringhe (SQLite non ha enum nativi).

---

## 7. Sezioni e funzionalità

| Sezione | Stato | Note |
|---|---|---|
| Bilancio | ✅ | 142 mln (contatore animato), 3 anelli (riscossione/impegni/PNRR), grafico a linee mensile, spesa per missione |
| Opere | ✅ | 318 censiti, cantieri in evidenza con barre animate, griglia di tutti i cantieri, KPI aggregati |
| Sondaggi | ✅ | Voto ottimistico in tempo reale, assessore di riferimento con follow, gauge soddisfazione |
| Comunità | ✅ | Composer, feed con like/commenti ottimistici, risposte ufficiali verificate, recensioni servizi |
| Organigramma | ✅ | Sindaco + giunta, follower, follow/unfollow |
| Notifiche | ✅ | Lista per tipo, segna-come-letta, badge nel TopBar |
| Profilo | ✅ | Dati, statistiche attività, modifica (nome/quartiere/bio/colore avatar) |
| Impostazioni | ✅ | Tema chiaro/scuro/sistema, cambio password, logout globale |
| Area admin | ✅ | Rispondi alle domande, aggiorna cantieri, crea sondaggi, invia notifiche broadcast |
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
