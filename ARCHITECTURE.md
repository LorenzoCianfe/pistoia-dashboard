# ARCHITECTURE.md — architettura di sistema

> Come è fatta la piattaforma e perché. Il modello di sicurezza ha un documento
> proprio: `SECURITY.md`. Il linguaggio visivo: `DESIGN.md`.
>
> Aggiornato: 2026-07-25

---

## 1. Stack

| Livello | Scelta | Perché |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Server Components: i dati restano sul server, il client scarica meno |
| UI | **React 19** + TypeScript | — |
| Design system | **Astryx** `0.1.8` (Meta) | **Sorgente dei token** (CSS custom properties) e tema compilabile per SSR. I suoi ~160 componenti sono la libreria di riferimento per il nuovo, non lo strato di primitive: vedi `ROADMAP.md` ondata 5 |
| Stili | **Tailwind CSS v4** | Layout e utility, sopra i token di Astryx |
| Animazione | **Motion 12** | Unica libreria con scroll legato alla ScrollTimeline nativa |
| Dati | **Prisma 7** + **SQLite** | Zero infrastruttura: il progetto deve partire con un doppio clic |
| Validazione | **Zod 4** | Stesso schema su client e server |
| Auth | Argon2id + sessioni opache | Vedi `SECURITY.md` |
| Mappe | Leaflet | Tile OSM, nessun servizio a pagamento |
| Test | Vitest (unit) + Playwright (E2E) | — |

**SQLite è una scelta, non una scorciatoia**: rende il progetto eseguibile da
chiunque senza servizi esterni. Vincola però l'hosting — esclude la maggior
parte dei runtime serverless. Se un giorno servirà il deploy reale, è il primo
nodo da sciogliere.

---

## 2. Struttura

```
Pistoia - Dashboard/
├─ AGENTS.md ROADMAP.md ARCHITECTURE.md SECURITY.md    # documentazione
├─ FEATURES.md DESIGN.md REFERENCES.md DISCOVERY.md
├─ refs/                        # riferimenti visivi (immagini)
├─ graphify-out/                # grafo di conoscenza del codice
└─ pistoia-dashboard/
   ├─ prisma/                   # schema, migrazioni, seed
   ├─ scripts/shots.mjs         # schermate di revisione, temi chiaro e scuro
   └─ src/
      ├─ proxy.ts               # guard rotte + CSP con nonce per-request
      ├─ instrumentation.ts     # boot: valida env (fail-fast), log errori
      ├─ themes/
      │  ├─ pistoia.ts          # ← SORGENTE dei token (si modifica qui)
      │  └─ generated/          # ← CSS/JS compilati (non modificare a mano)
      ├─ app/
      │  ├─ layout.tsx          # font, attributi tema su <html>, provider
      │  ├─ globals.css         # layer, ponte token, estensioni Pistoia
      │  ├─ design-system/      # vetrina interna dei componenti
      │  ├─ (auth)/ (app)/ (legal)/
      │  ├─ actions/            # Server Actions
      │  └─ api/
      ├─ components/
      │  ├─ ui/                 # primitive
      │  ├─ signature/          # i quattro componenti-firma (DESIGN.md §8)
      │  ├─ charts/             # grafici SVG custom
      │  ├─ app/                # guscio: navigazione, transizione condivisa
      │  └─ <sezione>/          # componenti per sezione
      └─ lib/                   # env, db, cache, auth/, data/, limits, …
```

---

## 3. Il livello design system

Il punto più delicato dell'architettura, perché tre sistemi di stile convivono.

### Chi possiede cosa

| Sistema | Possiede | File |
|---|---|---|
| **Astryx** | Token di sistema: colore, spazio, raggio, tipo, moto, data-viz | `src/themes/pistoia.ts` → `generated/pistoia.css` |
| **globals.css** | Token che Astryx non modella + ponte storico | `src/app/globals.css` |
| **Tailwind** | Utility di layout e le classi cromatiche storiche | `@theme inline` in `globals.css` |

### Ordine dei layer

```css
@layer reset, theme, base, astryx-base, astryx-theme, pistoia, components, utilities;
```

L'ordine è vincolante: `pistoia` deve venire **dopo** `astryx-theme` perché il
ponte di retrocompatibilità sovrascriva i default, e **prima** di `utilities`
perché una utility Tailwind possa sempre avere l'ultima parola su un componente.

### Il ponte di retrocompatibilità

I nomi storici (`--teal`, `--surface`, `--foreground`…) **non sono stati
rimossi**: sono stati ricollegati ai token Astryx. Le ~1050 utility già scritte
nelle 30+ rotte (`text-muted`, `bg-surface-2`, `text-teal`…) hanno adottato il
nuovo sistema senza che una sola rotta venisse toccata.

È il motivo per cui il cambio di design system è stato incrementale invece che
un big bang.

### Tre vincoli non negoziabili

1. **Il tema DEVE essere compilato** (`npm run theme:build`). L'iniezione a
   runtime verrebbe bloccata dalla CSP con nonce.
2. **Niente provider `<Theme>` di Astryx**: applica `color-scheme` sul proprio
   wrapper e ribalta le `light-dark()` dei discendenti appena diverge da `<html>`.
3. **Niente `tailwind-theme.css` di Astryx**: collide con la semantica di
   `--color-muted` usata nell'app.

Le motivazioni estese sono in `AGENTS.md` §3 e nei commenti dei file.

### Un quarto vincolo, emerso usando il sistema (ondata 6)

Il reset di Astryx dichiara `color` **direttamente** su `:where(h1…h6)` e
`:where(p)`. La specificità è zero, ma non è quello il punto: una dichiarazione
che colpisce l'elemento vince comunque su un valore *ereditato* dal genitore.

Conseguenza pratica: **impostare `color` su un contenitore non basta** a colorare
i titoli e i paragrafi che contiene. Dove serve (le superfici `MeshSurface`, che
hanno un inchiostro proprio) va aggiunta la riga esplicita:

```css
.mesh-surface :is(h1, h2, h3, h4, h5, h6, p) { color: inherit; }
```

Vale per qualunque superficie futura con un inchiostro diverso da quello del
tema. Il difetto non si vede nel tema chiaro, dove il colore del tema è già
scuro e sembra tutto a posto.

### Flusso del tema

```
src/themes/pistoia.ts   (defineTheme: scale + token + override di componente)
        │  npm run theme:build
        ▼
src/themes/generated/pistoia.css   @scope([data-astryx-theme="pistoia"])
        │  @import in globals.css
        ▼
<html data-astryx-theme="pistoia" data-theme="light|dark">
        │  html[data-theme] → color-scheme → light-dark() risolve
        ▼
   token disponibili ovunque, nei due temi, già al primo paint
```

`data-astryx-theme` è scritto **lato server** in `layout.tsx`: senza, lo sfondo
del `<body>` non avrebbe i token al primo paint. `data-theme` e `class` sono
scritti da next-themes prima del paint (`attribute={["class","data-theme"]}`):
`data-theme` guida Astryx, `class` guida le variant `dark:` di Tailwind.

---

## 4. Flusso dei dati

```
Server Component ──► lib/data/*.ts ──► Prisma ──► SQLite
       │                  │
       │                  └─► cachedShared() per le letture condivise
       ▼
     DTO (mai entità Prisma grezze verso il client)
       │
       ▼
Client Component ──► Server Action ──► requireUser / limitWrite / moderazione
                                              │
                                              ▼
                                     Prisma write + revalidateTag
```

### Regole

- **Server Components leggono**, tramite `src/lib/data/*`, e restituiscono DTO.
- **Server Actions scrivono** (`src/app/actions/*`), sempre con
  `requireUser`/`requireAdmin`, `limitWrite()` anti-abuso e, per il testo, il
  guard di moderazione.
- **Cache a tag** (`lib/cache.ts`): solo letture **condivise** (bilancio, opere,
  eventi, quartieri). Regola ferrea: **mai dati per-utente nella cache
  condivisa** — voto e follow si leggono fuori e si ricompongono dopo.
- **`DEMO_MODE`** (`lib/demo.ts`): i baseline finti contano solo in demo; fuori,
  i numeri partono da zero e la UI mostra zero-state onesti.
- **Provenienza** (`lib/sources.ts`): ogni sezione dichiara la fonte via
  `<SourceBadge/>`. Finché `DATA_MODE_* = mock` l'etichetta dice esplicitamente
  "dati dimostrativi". È una scelta etica prima che tecnica: una piattaforma
  sulla trasparenza non può essere opaca sulla provenienza dei propri numeri.
- **Client Components** usano `useActionState` / `useOptimistic` /
  `useTransition`.

---

## 5. Routing

- `/` — landing pubblica (redirect a `/bilancio` se già autenticato)
- `(auth)` — `/login`, `/registrati`
- `(app)` — area protetta: TopBar + SideNav (desktop) + BottomNav (mobile),
  con transizioni di rotta in `(app)/template.tsx`. ~30 rotte.
- `(legal)` — privacy, cookie, regole della comunità
- `/design-system` — vetrina interna, esclusa dall'indicizzazione

`proxy.ts` fa solo un **check ottimistico** sulla presenza del cookie; la
verifica reale contro il DB avviene nella DAL, vicino ai dati.

---

## 6. Prestazioni

- CSS del design system: **~25 KB gzip** (Astryx 22,6 + tema 2,2).
- Font self-hosted via `next/font`: nessuna richiesta esterna, nessun layout
  shift, compatibile con la CSP.
- Grana e gradienti mesh sono CSS + SVG inline: **nessun asset binario, nessun
  WebGL**. Deve girare su Android vecchi.
- Server Components di default; `"use client"` il più in basso possibile.

**Nota su Turbopack in sviluppo.** Dopo un cambio di dipendenze può andare in
panic con "Next.js package not found" e far fallire in silenzio le Server
Actions. La cura è cancellare `.next` e riavviare. La build di produzione non è
interessata.

---

## 7. Debito noto

| Tema | Stato |
|---|---|
| Primitive non basate sui componenti Astryx | **Deliberato**, con motivo per ciascuna (`ROADMAP.md` ondata 5). Da rivalutare quando Astryx esce dalla Beta ed emette le classi stabili `.astryx-*` |
| SQLite vincola l'hosting | Aperto, da affrontare prima di un deploy reale |
| Astryx è in Beta (0.1.8) | Le classi stabili `.astryx-*` sono documentate ma non ancora emesse |
| Snapshot Playwright | Da rigenerare dopo il cambio di design system |
| 30+ rotte, gerarchia piatta | Serve un passaggio di architettura dell'informazione. Rimandato dall'ondata 6 di proposito: cambiare la navigazione insieme al ridisegno di quattro pagine renderebbe impossibile capire quale dei due ha rotto cosa |
| **26 rotte ereditano ancora i token senza essere ridisegnate** | L'ondata 6 ha ridisegnato solo le quattro di punta. Le altre sono coerenti nei colori ma non nella composizione: nessuna usa i componenti-firma |
| **`<ViewTransition>` di React non è disponibile** | Il flag `experimental.viewTransition` non commuta React sul canale experimental in Next 16.2.7. L'elemento condiviso usa l'API nativa a mano; da rivalutare quando il componente arriva in React stabile |
| **Nessun dettaglio delle entrate di bilancio** | Il sankey si ferma a due stadi. Un terzo stadio richiede un modello `BudgetRevenue` con i titoli reali, oppure l'ETL della Fase 2 |
| Nessun test automatico di accessibilità | `axe-core` negli E2E resta da impostare (traccia "Qualità continua"). I contrasti dell'ondata 6 sono stati misurati a mano |
