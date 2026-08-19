# Prompt per la sessione successiva

> Riscritta il **2026-08-18**. **Fidati di questa, non di quello che ricordi.**
>
> ✅ **FASE 2b CHIUSA — npm → pnpm, validata dalla CI vera.**
> Prima esecuzione su GitHub Actions **verde su tutti e quattro i job**
> ([run 32138836321](https://github.com/LorenzoCianfe/pistoia-dashboard/actions/runs/32138836321)),
> con `package-lock.json` ancora presente. Questo commit lo **rimuove
> definitivamente**, e la seconda esecuzione sulla stessa PR lo conferma senza.
>
> Il lavoro vive sul branch `chore/pnpm-migration-phase-2b`
> ([PR #3, draft](https://github.com/LorenzoCianfe/pistoia-dashboard/pull/3)),
> **non ancora unita a `main`**. Il checkpoint temporaneo
> `docs/rework/SESSION_HANDOFF_PHASE_2B.md` è stato cancellato: il suo
> contenuto vive qui, in §7b e §7c.
>
> ⚠️ **Il rollback non è «ripristinare `package-lock.json`».** Sarebbe
> insufficiente: CI, `Dockerfile`, `docker-entrypoint.sh`, `start.bat`, gli
> script e i test sono convertiti a pnpm, e un lockfile npm da solo non li fa
> tornare indietro. **Il punto di ritorno è il commit** `5e1f151`.
>
> ⚠️ E lo strumento della deriva **non è più eseguibile**: gli serviva
> `package-lock.json` come secondo termine. Il suo referto resta in §7b.
>
> ✅ **Fase 1 chiusa, committata e pushata: `6621e07`** (+ `cc33cbd`, la
> finalizzazione di questa consegna).
> CI verde su tutti e quattro i job su **entrambi** i commit —
> [`31937260780`](https://github.com/LorenzoCianfe/pistoia-dashboard/actions/runs/31937260780)
> e [`31938356339`](https://github.com/LorenzoCianfe/pistoia-dashboard/actions/runs/31938356339),
> quest'ultima **attesa e verificata**, non data per verde perché toccava solo
> un `.md`. `main` è verde.
>
> ⚠️ E qui la catena si ferma: l'esito di un commit di documentazione **non
> genera un altro commit di documentazione**.
>
> ⚠️ **La versione di pnpm non si aggiorna «e basta».** È fissata con l'hash di
> integrità in `packageManager`; cambiare il numero senza cambiare l'hash fa
> fallire corepack con «Mismatch hashes». Si rigenerano insieme.

---

## Il prompt da incollare

```
Pistoia.app — REWORK ARCHITETTURALE. Le Fasi 0, 0b, 1, 2a e 2b sono CHIUSE.
La 2b (npm → pnpm) è validata dalla CI vera, due esecuzioni verdi.

⚠️ IL LAVORO NON È SU `main`: vive sul branch
   `chore/pnpm-migration-phase-2b`, PR #3 in bozza, NON unita. Il merge
   lo decide Lorenzo. Guarda `git branch --show-current` e `git log`
   prima di dare per scontato dove ti trovi.

Il gestore è pnpm e si invoca `corepack pnpm …`, MAI `pnpm` nudo.

LEGGI PRIMA, in quest'ordine:
- docs/prossima-sessione.md — è questa: la fonte principale.
- AGENTS.md §2 e §3 — le regole permanenti e le trappole già pagate.
- DESIGN.md — vincolante per qualunque lavoro visivo.
- docs/direzione-prodotto.md — la carta del prodotto.

⚠️ AGENTS.md, ARCHITECTURE.md e REFERENCES.md descrivono ancora Astryx come
sorgente dei token e il vecchio stack: sono VERI OGGI. Il consolidamento
generale dei 33 .md è la FASE 13 — ma una riga che una fase rende FALSA si
corregge subito, minima e senza riorganizzare. La Fase 13 non è l'alibi per
lasciare in giro documentazione operativa che descrive uno stato che non
esiste più.

La prossima azione è la FASE 3: Docker multi-stage — togliere le
devDependencies dall'immagine di esecuzione, che oggi pesa 2,82GB e costa
quel disco a ogni deploy (AGENTS.md §8). È un'attività SEPARATA da pnpm:
la 2b ha già portato il Dockerfile su pnpm e l'immagine è stata costruita,
avviata e provata a runtime.

⚠️ Il gestore è pnpm e si invoca `corepack pnpm …`, MAI `pnpm` nudo: su
questa macchina `corepack enable` fallisce con EPERM (vuole i permessi di
amministratore) e pnpm nel PATH dei propri script mette node_modules/.bin,
non sé stesso. AGENTS.md §3 «Cinque trappole del cambio di gestore» lo
spiega, e §4 porta la forma corrente di ogni comando.

Fermati e chiedi nei punti di ritorno elencati in questa consegna.
```

---

## 1. L'obiettivo

Non «sostituire Astryx con shadcn». Portare Pistoia.app a una codebase dove:

```
Pistoia.app → architettura propria → design system proprio
           → astrazioni stabili → librerie esterne sostituibili
```

Moderna, modulare, type-safe, accessibile, performante, documentata, testabile,
non accoppiata a vendor.

## 2. Il principio che governa ogni decisione

```
problema reale → responsabilità → tecnologia approvata → implementazione → misura
```

Mai `tecnologia nello stack → installazione → ricerca di un utilizzo`. Lo stack
target è un insieme di tecnologie **approvate e disponibili**, non una lista
della spesa. Vale per Zustand, TanStack Query, React Hook Form, GSAP, Three.js,
deck.gl, Storybook, Better Auth, Redis, NestJS e tutto il resto.

## 3. Lo stato dell'architettura, oggi

Un'app Next.js sola (non un monorepo), in `pistoia-dashboard/`.

| | |
|---|---|
| File `.ts`/`.tsx` in `src/` (escluso il generato) | 333 · 46.365 righe |
| Rotte | 65 `page.tsx` · 9 layout · 2 route handler |
| `"use client"` | 99 file su 333 |
| Server Actions | 25 moduli |
| Prisma | 61 modelli · 18 migrazioni · SQLite |
| Test | 339 unit (Vitest) · 192 E2E (Playwright) |
| `globals.css` | **2.912 righe** — è il vero design system |
| `components/ui/` | 19 primitive, quasi tutte di sola resa |
| Dipendenze | 17 runtime · 16 sviluppo · 765 nel lockfile *(dopo la Fase 1)* |
| CSS servito | **135.332 byte** — era 259.388 prima della Fase 1 |

**L'architettura è già RSC-first e disciplinata**: i Server Components leggono
via `lib/data/*` e restituiscono DTO, le Server Actions scrivono con
`requireUser` + rate-limit + moderazione, la cache è a tag, la CSP ha un nonce
per-request. Non c'è nessuno state manager, nessun data-fetching client, nessuna
form library, nessun secondo CSS framework, nessun secondo motore di animazione.
**Non c'è dependency bloat da smontare.**

I problemi veri sono tre: `globals.css` monolitico, lo strato delle primitive
interattive assente (niente Dialog, Select, Tabs, Tooltip, Menu — fatti a mano
una volta ciascuno), e Astryx da togliere.

## 4. L'architettura target, e le gerarchie

### La UI — ordine vincolante

```
Pistoia Design System        ← token, tema, convenzioni, architettura
        ↓
componenti open-code generati/adattati da shadcn   ← entrano nel repo e
        ↓                                            DIVENTANO codice Pistoia
Base UI (@base-ui/react)     ← dipendenza runtime sotto le primitive che la usano
        ↓
Astryx                       ← SOLO eccezione isolata, dietro wrapper Pistoia
```

shadcn **non è una libreria runtime**: è un meccanismo di generazione. Il codice
che produce è nostro e si modifica.

### 🔴 La regola precisa su Astryx

Astryx **non è vietato** e **non deve essere «dimostrabilmente migliore»** di
shadcn/Base UI per essere usato. Lorenzo può sceglierne un componente perché gli
piace, per il suo design, per un'interazione, o perché lo ritiene più adatto.
Questa scelta **non va sottoposta a un criterio di superiorità tecnica deciso
dall'agente**: si segnalano costi e dipendenze, non si pone il veto.

Astryx non deve però tornare a possedere: Design System, token globali, tema,
convenzioni, architettura, scelta automatica delle primitive.

> **Pistoia possiede Astryx, Astryx non possiede Pistoia.**

Condizione di ammissione: *singoli componenti selezionati deliberatamente per
scelta di design o di prodotto; mai come Design System globale*.

### Grafici — la linea di confine

| **ECharts** — strutturate, complesse o interattive | **Pistoia DS** — micro-visualizzazioni proprietarie |
|---|---|
| `line-chart.tsx` (248) | `sparkline.tsx` (53) — mini trend |
| `sankey-flow.tsx` (395) | `display-number.tsx` (209) — KPI tipografico |
| `treemap.tsx` (186) | `ring-gauge.tsx` (99) — indicatore |
| `dot-scatter-timeline.tsx` (245) | |

`DotScatterTimeline` migra **preservando esattamente** API pubblica, identità
visiva, interazioni (frecce) e accessibilità (`<table>` in `sr-only`,
`aria-live`), dietro un wrapper Pistoia. Non istanziare ECharts per uniformità
tecnica quando non porta un vantaggio concreto.

### Mappe

```
MapLibre GL 6 + react-map-gl 8
     ↓  protocollo PMTiles client-side (percorso preferenziale)
.pmtiles via HTTP Range  —  estratto Pistoia/Toscana, non il globale
     ↓
nostra origin/storage: vector tiles · style · glyphs · sprites
```

Nessun provider cartografico terzo come dipendenza runtime. Un endpoint nostro
`z/x/y` si valuta **solo** se emerge una necessità concreta: un percorso solo,
non due. La posizione fisica del `.pmtiles` si decide **dopo** aver misurato
l'estratto (volume persistente vs object storage). Da verificare in Fase 10:
requisiti CSP di worker/`blob:`/risorse mappa, supporto `Range` sugli statici,
dimensione, caching e banda, workflow di aggiornamento automatizzabile.
**Non dichiarare CSP o `/privacy` invariate prima di quelle verifiche.**

### Ciò che NON cambia

- **SQLite resta.** L'astrazione Prisma c'è già e `lib/db.ts` documenta la riga
  esatta da cambiare. È un problema di hosting, non di codice.
- **L'auth resta.** ~800 righe, Argon2id, sessioni opache, coperta dagli E2E.
  Better Auth è *consigliato in futuro*, mai obbligatorio: entra solo per OAuth,
  passkey, 2FA o SSO. Leggere `SECURITY.md` prima di toccarla.
- **pnpm è obbligatorio** (Fase 2), non opzionale.

## 5. Le quattro classi di dipendenza

**CURRENT CORE** — l'architettura *prima* della migrazione
TypeScript · React 19 · Next.js 16 App Router · **npm** · Tailwind v4 · token via
Astryx · clsx · tailwind-merge · Lucide · next-themes · Motion 12 · Zod · Prisma
7 · SQLite · auth Argon2id propria · **Leaflet** · grafici SVG a mano · Vitest ·
Playwright · axe · ESLint · Docker · GitHub Actions

**TARGET CORE** — a piano concluso *(diventerà il Current Core documentato; il
vecchio stato con npm/Leaflet/Astryx esce dalle istruzioni operative e resta
solo in `CHANGELOG.md` e nella documentazione storica)*
- *runtime applicativo*: TS · React 19 · Next 16 · Tailwind v4 · **token Pistoia
  propri** · clsx · tailwind-merge · Lucide · next-themes · Motion 12 ·
  **`@base-ui/react`** · **echarts** · **maplibre-gl + react-map-gl + layer
  PMTiles** · Zod · Prisma · SQLite · auth propria
- *sviluppo e test*: Vitest · **React Testing Library** · Playwright · axe ·
  ESLint · **Prettier**
- *tooling e codegen*: **pnpm** · **shadcn CLI** · Docker · GitHub Actions · lhci

**APPROVED WHEN NEEDED** — con la condizione scritta
CVA *(se l'audit 7a mostra una matrice vera → passa al Target Core)* · **Astryx,
singoli componenti per scelta di design** · Sonner · Storybook · Sentry ·
OpenTelemetry · Better Auth · PostgreSQL · Redis · S3/R2 · Three.js · R3F · Drei
· Postprocessing · deck.gl · Turf · Zustand · TanStack Query · React Hook Form ·
GSAP · ScrollTrigger · Lenis · Motion 13

**NOT CURRENTLY NEEDED** — la condizione non è ancora definibile, **non sono
vietate**
NestJS · Turborepo · Terraform · Meilisearch/OpenSearch · Socket.IO/WebSocket

### WebGL

Il divieto generale è **caduto** (decisione 2026-08-15): WebGL/3D è ammesso
quando serve a una funzionalità **dichiarata** (città 3D, mappe avanzate,
visualizzazioni), vietato per decorazioni ottenibili con CSS/Motion. `AGENTS.md`
§2 e `REFERENCES.md` §6 dicono ancora il contrario e vanno riscritti in Fase 13.

---

## 6. Il piano — sequenza definitiva

| # | Fase | Stato |
|---|---|---|
| **0** | Baseline verificabile | ✅ **CHIUSA** |
| **0b** | Correzione CI (commit isolato) | ✅ **CHIUSA** |
| **1** | **Potatura**: via l'import di `astryx.css` (−124.056 byte di CSS servito), via `theme-neutral`, `cli` → `devDependencies` | ✅ **CHIUSA** · `6621e07` · CI verde |
| **2a** | Versione pnpm fissata (`pnpm@11.22.0`) · inventario e comportamento reale misurati · politica degli script determinata (**una voce a `true`**) · falso bloccante Vitest smontato fino alla causa | ✅ **CHIUSA** |
| **2b** | **pnpm**, da sola. CI · `start.bat` · `docker-entrypoint.sh` · `Dockerfile` · `package.json` · `playwright.config.ts` · `global-setup.ts` · `misura.mjs` · `lighthouserc.js` + la documentazione operativa triata. `package-lock.json` rimosso | ✅ **CHIUSA** · CI verde ([run 32138836321](https://github.com/LorenzoCianfe/pistoia-dashboard/actions/runs/32138836321)) · §7b e §7c |
| **3** | Docker multi-stage (attività separata da pnpm) | |
| **4** | Prettier + `prettier-plugin-tailwindcss`, reformat meccanico isolato in un commit suo, `.prettierignore` + `.git-blame-ignore-revs`. **Commenti non toccati nel contenuto né nella struttura semantica** | |
| **5** | Token propri: `styles/tokens/*.ts` + generatore · via `defineTheme` · reset proprio. ⚠️ il reset muove la tipografia: diff visivo obbligatorio | |
| **6** | `globals.css`: **prima si classifica, poi si colloca**. Globale = reset/base, token, tipografia fondamentale, `@theme`, materiali e pattern davvero condivisi. Specifico = vicino a rotta/feature/componente (anche CSS Modules dove porta isolamento reale, **senza** migrazione obbligatoria). Qui si rimuovono anche gli orfani. Cancello: **peso del CSS globale misurato prima/dopo** | |
| **7a** | **Audit delle 19 primitive**, 9 criteri: dipendenze Astryx · vecchi token · styling legacy · accessibilità · API pubblica · confine Server/Client · compatibilità form nativi + Server Actions · coerenza col nuovo DS · pattern obsoleti. Verdetto scritto per ciascuna | |
| **7b** | **Audit delle interazioni reali**, poi le primitive che servono da shadcn + Base UI. Ogni interazione prende la primitiva semanticamente giusta — niente accorpamenti per ridurre il numero, e **nessun elenco fisso**. Poi si decide se `@astryxdesign/core` esce | |
| **8** | CVA **dove 7a mostra una matrice vera** · i 76 `[11px]` **classificati semanticamente prima** (token solo per i ruoli che coincidono davvero) · idem colori, spacing, raggi | |
| **9** | **ECharts 6** sui quattro strutturati. Renderer SVG/Canvas **scelto per grafico** su prestazioni — **non** come requisito di accessibilità. L'accessibilità si garantisce a prescindere: equivalenti testuali, `<table>`/`<caption>` `sr-only`, tastiera, `aria-live`, struttura semantica, fuoco, axe, `prefers-reduced-motion` | |
| **10** | **MapLibre + react-map-gl + PMTiles** (§4). `/mappa` entra nei gate prestazionali **con la soglia comune 0,90** | |
| **11** | `/design-system` **analizzato, non presunto**: se è legacy si ricostruisce sul nuovo sistema. **React Testing Library**. Ogni test protegge *un comportamento, contratto o regressione concreta e significativa*; `red → green` per il nuovo, i characterization test possono passare subito — **non rompere il prodotto per dimostrare che un test sa diventare rosso** | |
| **12** | **Audit** dei confini Server/Client e del caching: 99 `"use client"` · data fetching · rendering · caching · riduzione del JS client. `use cache` **solo dove il beneficio è concreto e misurabile**. Il modello RSC-first si preserva. Qui anche il CLS dello skeleton | |
| **13** | **Documentazione**: audit dei 33 `.md` → consolidamento. `AGENTS.md` molto più corto e prescrittivo; le trappole valide si sintetizzano o si spostano, **mai si perdono**. `CHANGELOG.md` **append-only** | |
| **14** | Validazione finale: `graphify update` · **`pnpm audit`** · shots vs Fase 0 · E2E · Lighthouse | |
| *dopo* | Storybook — condizione: primitive in `components/ui/` e `/design-system` ricostruito | |

---

## 7. Che cosa ha fatto questa sessione — la FASE 1

### I file toccati — **zero file di prodotto** · commit `6621e07`

```
M  pistoia-dashboard/src/app/globals.css   via l'import di astryx.css + il layer astryx-base
M  pistoia-dashboard/package.json          via theme-neutral · cli → devDependencies
M  pistoia-dashboard/package-lock.json     la voce di theme-neutral, tolta a mano (vedi sotto)
M  ARCHITECTURE.md                         una riga: l'ordine dei layer
M  REFERENCES.md                           quattro righe: il costo servito di astryx.css è zero
M  CHANGELOG.md                            voce [0.54.2]
M  docs/prossima-sessione.md               questa
```

### Il guadagno, misurato

Il foglio servito passa da **259.388 a 135.332 byte: −124.056, cioè −47,8%.**
Il blocco che sparisce vestiva **1.524 classi atomiche StyleX**, e nessuna delle
1.524 compare nei 6,7 MB di sorgente.

### La prova che il design non si è mosso — tre misure indipendenti

1. **`npm run impronta:confronta`: 213 token invariati** nei due temi. Verde
   **anche sulla rimozione da sola**, prima di ogni compensazione.
2. **Il CSS compilato è identico regola per regola, ordine compreso**, in tutti
   e tre i chunk: 0 regole comparse, 0 spostate, 0 sparite oltre il blocco
   `@layer astryx-base{…}`. L'ordine dei layer emessi resta
   `properties → reset → theme → base → astryx-theme → pistoia → components →
   utilities`.
3. **Zero occorrenze** delle 1.524 classi nel sorgente.

### 🔴 Due trappole pagate qui — vanno in `AGENTS.md` §3 alla Fase 13

1. **La scala dei pesi è passata da Astryx a Tailwind senza che nulla lo
   dicesse.** `--font-weight-normal|medium|semibold` erano dichiarati **solo**
   in `astryx.css`, e il tema compilato li **consuma senza dichiararli**
   (`:where(h1…h6)`, `:where(p)`, `:where(small)`, undici token
   `--text-*-weight`). L'analisi statica prevedeva **11 token rossi**; la misura
   ne ha dati **zero**, perché `tailwindcss/theme.css` dichiara gli stessi nomi
   con gli stessi numeri (400 · 500 · 600 · 700).
   *La regola, in due metà che non si sostituiscono a vicenda:*
   - **Chi POSSIEDE un token** — provenienza, proprietà semantica, chi lo
     dichiara — si stabilisce dal **grafo delle sorgenti e delle dipendenze**,
     `node_modules` compreso. La previsione ha sbagliato non perché fosse
     statica, ma perché era **incompleta**: guardava le sorgenti del repository
     e non quelle installate.
   - **Quale VALORE un token risolve davvero** lo dice solo il **runtime**, e
     l'impronta è il giudice di quello.

   L'impronta ha detto il vero sul comportamento — zero token mossi — e **non
   dice niente** su chi possieda quei tre nomi: che oggi li dichiari Tailwind è
   una scoperta dell'analisi, non della misura. Un'impronta verde su un token
   di cui non si sa la provenienza è un comportamento verificato e una proprietà
   ignota. Servono tutte e due le domande.

   La dipendenza è **in prestito** ed è scritta accanto all'import, con la fase
   che la chiude (la 5, i token Pistoia).
2. **`npm` non disinstalla un peer opzionale che ha già installato.** Tolto
   `@astryxdesign/theme-neutral` da `package.json`, **sia `npm install` sia
   `npm uninstall` l'hanno lasciato nel lockfile** — marcato `dev`, `optional`,
   `peer` del CLI — mentre una risoluzione da zero (provata in una cartella
   pulita) non lo include affatto. **E il lockfile è ciò che `npm ci` esegue in
   CI e nel `Dockerfile`**: sarebbe rimasto nell'immagine senza che niente lo
   dicesse. Chiuso togliendo la voce a mano e **validando con `npm ci`**, che
   fallisce rumorosamente se lockfile e `package.json` divergono.

### Uno strumento NON promosso, e perché — da riprendere in Fase 6

La prova nº2 qui sopra è stata ottenuta con uno script usa-e-getta che spezza
due build del CSS compilato in regole di primo livello e le confronta **come
sequenze, chunk per chunk**. Ha funzionato ed è stato **cancellato di
proposito**: leggeva due percorsi scritti a mano, richiedeva di catturare le due
build a mano e non aveva né baseline né codice d'uscita. Era un'impalcatura, non
un cancello — e promuoverla adesso sarebbe stato *tecnologia in cerca di un
utilizzo*, cioè il verso vietato dal principio in §2.

⚠️ **Ma la Fase 6 dichiara esattamente quel cancello** («peso del CSS globale
misurato prima/dopo»), e ora si sa che cosa deve fare per essere utile: non solo
pesare i byte — **il peso da solo non distingue una regola spostata da una
persa** — ma confrontare la sequenza delle regole. In Fase 1 è ciò che ha
permesso di dire «0 comparse, 0 spostate, 0 sparite oltre il blocco atteso»
invece del solo «−47,8%».

### I due strumenti (dalla Fase 0, restano il manuale operativo)

**`scripts/misura.mjs`** — l'**unico** posto del repository che cancella `.next`,
e l'unica strada per produrre un artefatto da misurare. Ci passano `lighthouse`,
`impronta`, `impronta:confronta` e `pretest:e2e` (`--solo-pulizia`).
🔴 Esiste perché una build fatta sopra un `.next` sporco produce
**contemporaneamente** metriche false (CLS 0,938 invece di 0,165, con varianza
zero su tre passate) **e CSS mutilo** (62 token mancanti). Nessun errore, da
nessuna parte.

**`scripts/impronta.mjs`** — legge ogni custom property *come il browser la
risolve*, nei due temi. Leggere le variabili non basta: `--bg` vale
`light-dark(…)` in entrambi. Il tema si sceglie dal negozio di next-themes e si
**pretende** con `waitForFunction` (scriverlo su `<html>` non funziona:
next-themes lo riscrive). Si rifiuta di scrivere l'impronta se i due temi
risultano identici.

```bash
npm run impronta            # cattura la baseline
npm run impronta:confronta  # esce 1 se un solo valore si è mosso
```

### Le baseline, e come stanno dopo la Fase 1

| | |
|---|---|
| **Token** | **213 token**, 93 dei quali cambiano col tema · `tests/impronta/token.json` — ✅ invariati |
| **Unit** | 339 test su 28 file — ✅ 339/339 |
| **Lint · Typecheck** | ✅ · ✅ |
| **Rotte** | **68 rotte, 0 con problemi** (tre passate: admin, moderatore, anonima) |
| **Shots** | ✅ nei due regimi (1440 e 360 semplice). L'unico traboccamento è quello **già registrato**: `/home-1b` ≤ 35px, rotta congelata |
| **E2E** | ✅ **192/192 in 20,4 min** — rilanciata dopo un `node_modules` ricostruito da zero, comprende a11y (42 casi), bersagli (42) e contenimento (42) |
| **Lighthouse** | ✅ **in CI**, identico alla baseline: `/login` 100 · `/valutazioni` 99 · `/valutazioni/pulizia` 92 · `/metodologia` 92 — soglia 0,90. Accessibilità **100 su tutte e quattro** |
| **Audit** | 0 vulnerabilità · `npm ci` 636 pacchetti |
| **CI** | run [`31937260780`](https://github.com/LorenzoCianfe/pistoia-dashboard/actions/runs/31937260780) — ✅ Controlli · ✅ Build · ✅ E2E · ✅ Lighthouse |

---

## 7b. Che cosa ha fatto questa sessione — la FASE 2b

**Migrazione `npm` → `pnpm`, e nient'altro.** Nessun upgrade di dipendenza,
nessun refactor: cambia il *gestore*.

### Le decisioni, tutte già approvate e nessuna rimessa in discussione

| | |
|---|---|
| Gestore | **`pnpm@11.22.0`** in `packageManager`, **con l'hash di integrità** |
| Node | `engines.node ">=22.13"`, reso vincolante da `engineStrict: true` |
| Layout | **`isolated`**, quello predefinito. `nodeLinker` non toccato |
| MAX_PATH | `virtualStoreDirMaxLength: 40` — protezione *preventiva* |
| Script di build | politica `allowBuilds` a tre stati, `better-sqlite3` unico a `true` |
| Deriva | **due convergenze transitive approvate**, tutto il resto zero |
| Audit | risk acceptance nominata su `GHSA-ggr8-5vv4-36mx` |

### I cancelli, con l'esito reale

| Cancello | Esito |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ 0 |
| lint · typecheck | ✅ 0 · 0 |
| unit (Vitest) | ✅ **339/339** |
| build di produzione | ✅ 0 |
| impronta | ✅ **213 token invariati**, due temi |
| audit `--audit-level=high` | ✅ 0 — «1 high (1 ignored)», la deroga nominata |
| deriva versioni | ✅ **0 non approvate**; 725 pacchetti in entrambi i lockfile, 0 in uno solo |
| **E2E completa** | ✅ **192/192 in 23,0 min** |
| `rotte` | ✅ **68 rotte, 0 con problemi** (tre passate) |
| `shots` 1440 | ✅ 0 |
| `shots --simple --width=360` | ✅ 0 — unico traboccamento l'eccezione già registrata `/home-1b` ≤35px |
| Lighthouse | ✅ 0 — `/login` 100 · `/valutazioni` 99 · `/valutazioni/pulizia` 92 · `/metodologia` 92; **accessibilità 100 su tutte e quattro**. Identico alla baseline della Fase 1 |
| **immagine Docker** | ✅ costruita (`--no-cache`) **e avviata** |
| **moduli nativi su glibc** | ✅ better-sqlite3 (scrittura vera) · Prisma (**query vera**: 8 utenti, 42 segnalazioni) · @node-rs/argon2 (**verifica dell'hash reale del seed**, nei due versi) |
| **accesso reale via HTTP** | ✅ login vero nel container + **seconda rotta protetta** (il difetto del cookie `Secure` si vedeva solo lì) |
| `docker-entrypoint.sh` | ✅ **eseguito**: migrate deploy + seed + `next start` |
| `start.bat` | ✅ **eseguito**: guardia corepack, migrazioni, `corepack pnpm dev`, HTTP 200 |
| **CI su GitHub Actions** | ✅ **verde su tutti e quattro i job** — [run 32138836321](https://github.com/LorenzoCianfe/pistoia-dashboard/actions/runs/32138836321), trigger `pull_request` sulla PR #3. Dettaglio in **§7c** |

### Le tre cose trovate misurando, che il checkpoint non sapeva

1. 🔴 **`pnpm` non è nel PATH, e non basta lanciare le cose *attraverso* pnpm.**
   `corepack enable` su Windows vuole i permessi di amministratore (misurato:
   `EPERM`, uscita 1), e pnpm nel PATH dei propri script mette
   `node_modules/.bin` — **non sé stesso**. Il checkpoint l'aveva chiuso solo
   in `misura.mjs`; erano **quattro** i punti, e gli altri tre —
   `playwright.config.ts`, `tests/e2e/global-setup.ts`, `lighthouserc.js` —
   sarebbero caduti al primo lancio. `global-setup` avrebbe fatto cadere
   **l'intera suite E2E**, che è esattamente il cancello mai eseguito.
2. **`pnpm x -- --flag` passa il `--` alla lettera** (`["--","--tutte"]`),
   mentre npm se lo mangia. Ogni conversione meccanica dell'idioma npm
   consegnava un argomento in più — compreso il testo mostrato all'operatore in
   `/admin`.
3. **La policy `allowBuilds` è IDENTICA su Linux e su Windows: 7 pacchetti.**
   Letta dentro l'immagine, quindi non serve nessuna scelta Windows/Linux. ⚠️ La
   prima lettura diceva **4** perché il glob non vedeva i pacchetti con scope:
   il numero sbagliato era plausibile, ed è stato il glob a essere corretto, non
   la policy.

### `@prisma/config` nel runtime distribuito: da *probabile* a *dimostrato*

Il checkpoint lo dava per probabile. Adesso:

- **74 `*.nft.json`**, 15.338 voci tracciate, `next-server.js.nft.json`
  compreso: **zero** occorrenze di `deepmerge-ts`, `deepmerge`,
  `@prisma/config`, `c12`, `prisma`. La sonda è stata provata **anche al
  contrario** — trova `@prisma/client`, `better-sqlite3`, `@node-rs/argon2`,
  cioè il runtime vero;
- `.next/standalone` **non esiste** (non è configurato);
- nell'immagine la catena c'è fisicamente (arriva col `prisma` di sviluppo, che
  resta per scelta) ma `.next/server` e `.next/static` non la nominano mai;
- 🔴 **la prova che chiude la questione**: **cancellati** `deepmerge-ts`,
  `@prisma/config` e `c12` dall'immagine, il container serve **tutto** —
  pagine pubbliche, accesso reale, rotte protette, zero errori JavaScript.

---

## 7c. La CI: perché è stata rifatta, e come

Il primo tentativo usava **due `setup-node`** e `cache: pnpm`, con
`corepack enable pnpm` in mezzo. Non regge, e la ragione è precisa:

🔴 **`actions/setup-node` è un'azione JavaScript, quindi
`defaults.run.working-directory` NON la tocca.** Con `cache: pnpm`
interrogherebbe `pnpm store path` dalla **radice del repository**, dove non c'è
`package.json` — quindi corepack non troverebbe il pin `packageManager` del
sottoprogetto e userebbe una versione propria.

⚠️ E `COREPACK_ENABLE_DOWNLOAD_PROMPT=0` **non è la cura**: toglie soltanto la
domanda interattiva di conferma al primo scaricamento. Non garantisce affatto
che lo store interrogato sia quello di `pnpm@11.22.0`. La riga resta nel
workflow, ma per quello che è.

**La forma adottata** — decisa da Lorenzo, e senza azioni di terze parti:

| | |
|---|---|
| `actions/checkout` | **`3d3c42e5aac5ba805825da76410c181273ba90b1`** — v7.0.1 |
| `actions/setup-node` | **`820762786026740c76f36085b0efc47a31fe5020`** — v7.0.0, con `package-manager-cache: false` esplicito |
| `actions/cache` | **`55cc8345863c7cc4c66a329aec7e433d2d1c52a9`** — v6.1.0 |
| Percorso dello store | un passo `run` con `working-directory: pistoia-dashboard` che scrive `corepack pnpm store path --silent` in `GITHUB_OUTPUT` |
| Chiave | `pnpm-<os>-<hashFiles('pistoia-dashboard/pnpm-lock.yaml')>` |
| Fallback | `restore-keys: pnpm-<os>-` — riusa lo store precedente quando il lockfile cambia |
| Installazione | `corepack pnpm install --frozen-lockfile` dentro `pistoia-dashboard` |

**Le tre azioni sono ufficiali, alle versioni stabili correnti, e pinnate allo
SHA completo** — mai al tag: un tag si può rispostare, uno SHA no. Gli SHA sono
stati recuperati e verificati dai repository ufficiali: il tag esiste, il commit
esiste, e il tag punta esattamente lì.

⚠️ Tutte e tre girano su runtime **`node24`**, che pretende un runner
**≥ 2.327.1**. Qui i quattro job sono su `ubuntu-latest` e il repository non ha
**nessun** runner self-hosted registrato (verificato): sono GitHub-hosted, che
si aggiornano da soli.

⚠️ Il runtime dell'azione **non è** la versione Node del progetto:
`node-version: 22` resta invariata, ed è quella con cui girano build e test.

Applicata **identica ai quattro job**, senza astrazioni: nessuna action
composita, nessun workflow riusabile. Sono quattro copie di dodici righe, ed è
voluto — a questa scala la ripetizione si legge meglio di un'indirezione.

**La rinuncia alla cache interna è ESPLICITA, non per omissione.**
`package-manager-cache: false` esiste da setup-node **v5** (verificato
leggendo `action.yml`: v4.4.0 non lo dichiara, v7.0.0 sì), e sulla v7 lo si
scrive per nome. `cache: pnpm` **non** va reintrodotto: l'unico meccanismo di
cache è `actions/cache`.

**`corepack enable` è sparito da tutti i job**: ogni invocazione è
`corepack pnpm …`, la forma canonica del progetto. Un motivo in meno perché la
CI dipenda da uno shim nel PATH.

### Che cosa è stato validato, e che cosa no

✅ Il YAML si analizza · quattro job · un solo `setup-node` per job, pinnato ·
nessun `cache:` interno · un solo `actions/cache` per job, pinnato · ordine
`store → cache → install` in tutti e quattro · **nessun `pnpm` nudo** in
nessun `run` · i due SHA **esistono** e i rispettivi tag puntano esattamente
lì · i path citati esistono.

🔴 **Non validato: il comportamento reale.** Nessuna di queste verifiche prova
che il passo della cache funzioni su un runner. Solo l'esecuzione lo dice.

---

## 8. Il debito dichiarato, e dove si chiude

| Cosa | Dove |
|---|---|
| **`/home-1b` trabocca di 35px** a 360px in modalità semplice (il bottone «Esplora la città in 3D» non si stringe). Registrato in `shots.mjs` come **eccezione misurata** con tetto 35px: un peggioramento lo fa tornare rosso, e i tollerati si stampano anche a esito verde | **Zona congelata.** Sparisce quando la variante viene scelta (si corregge) o scartata (si cancella con la rotta) |
| **`monumento.tsx`, `porte-citta.tsx`, `striscia-dati.tsx`** — ~450 righe non montate da nessuna parte dopo il ridisegno | **Fase 6**, con il loro CSS, nello stesso intervento. Riverificare prima che non siano usati da home, vetrine congelate o altri percorsi |
| **`ATTI_TOTALI`** in `tests/e2e/costanti-atti.ts` — senza consumatori da quando la striscia dati è uscita dalla home | **Fase 6**, stessa rimozione |
| **CLS 0,165** — lo scheletro di `(pubblico)/loading.tsx` viene sostituito e il footer salta (`FOOTER.card 785→0`). **Preesistente** alla baseline verde del 06/08, sopra il «buono» di 0,1 ma sotto soglia | **Fase 12** |
| **33 `.md`** con istruzioni che diventeranno false: `AGENTS.md` §0/§3/§4/§8, `ARCHITECTURE.md` §1/§2/§3/§6/§7, `REFERENCES.md` §1/§6, `ROADMAP.md` ondata 5, `DOCUMENTATION.md` §2/§4/§8, `README.md`, `FEATURES.md` §5, `SECURITY.md` §7 | **Fase 13** |
| ✅ **Due righe che la Fase 1 aveva reso false — CORRETTE il 2026-08-16**: `ARCHITECTURE.md` §«Ordine dei layer» (via `astryx-base` dalla lista) e `REFERENCES.md` §«Costo reale, misurato» (il costo servito di `astryx.css` è **zero**). Correzioni minime, nessuna riorganizzazione | **Chiuso.** 🔴 E fissa la regola per le fasi che seguono: **la documentazione operativa non resta a descrivere uno stato che non esiste più.** La Fase 13 è il consolidamento generale dei 33 `.md`, non l'alibi per lasciare in giro istruzioni false nel frattempo |
| **La scala dei pesi tipografici arriva da `tailwindcss/theme.css`**, non più da una sorgente nostra. Nessun effetto oggi (stessi nomi, stessi numeri), ma è una dipendenza **in prestito**: se il tema di Tailwind viene azzerato, `:where(h1…h6)` e `:where(p)` perdono il peso **senza un errore** | **Fase 5**, che porta i token in casa. Nota scritta accanto all'import in `globals.css` |
| ⚠️ **DISCREPANZA NOTA, da non correggere di slancio**: `package.json` dichiara `0.52.0`, `CHANGELOG.md` è arrivato a `0.54.2`. Lo scarto è **preesistente** — il lockfile era fermo a `0.48.0` fino al 2026-08-15 — e non è stato toccato di proposito | Si chiude quando Lorenzo determina **la fonte canonica della versione** e la **politica di versionamento** (chi la alza, quando, e se il `CHANGELOG` può correre avanti). Finché quella decisione non c'è, allineare i numeri sarebbe scegliere al posto suo |
| ✅ **La CI con pnpm è stata eseguita e verde** — era l'ultimo cancello previsto della 2b, ed è ciò che l'ha chiusa | **Chiuso.** Due esecuzioni verdi sulla PR #3: la prima con `package-lock.json` ancora presente, la seconda dopo averlo rimosso |
| **Lo Scheduled Task di Coolify dice ancora `npm run atti`.** Vive nell'interfaccia di Coolify, **fuori dal repository**: cambiare `docs/pipeline-atti-schedulata.md` non lo cambia. Misurato che **non è urgente**: dentro l'immagine `npm run <script>` funziona anche su un albero installato da pnpm (provato con `npm run db:generate`, uscita 0) | Si aggiorna a mano in Coolify, quando Lorenzo apre l'interfaccia. ⚠️ Ciò che **non** va più fatto lì è `npm ci` (fallirà: il lockfile npm non c'è più) o `npm install` (ne scriverebbe uno nuovo, scavalcando pnpm) |
| **`pistoia-dashboard/README.md` è ancora lo scheletro di `create-next-app`** al netto del comando corretto in 2b | **Fase 13**, col consolidamento dei `.md` |

---

## 9. 🔴 I punti di ritorno — fermati e chiedi

Fuori da questi, **non fermarti** per decisioni implementative ordinarie già
determinate dal piano.

1. **Una decisione di prodotto** (forma, ambito, testo, identità).
2. **Una scelta architetturale non coperta da questa consegna.**
3. **Una regressione o un rischio importante.**
4. **`ring-gauge`** — resta custom *in via provvisoria*. Se l'audit di Fase 9
   mostra che gestisce dataset, serie, tooltip o interazioni da chart vero,
   **chiedere prima di migrarlo**.
5. **Soglia di `/mappa`** — entra nei gate con la soglia comune **0,90**. Se dopo
   l'ottimizzazione non la regge, **proporre** una soglia motivata dai dati e
   **farla approvare**. Mai abbassarla in anticipo.
6. **Percorso runtime PMTiles** — si procede sul protocollo client-side. Se
   l'audit mostra che non regge, chiedere prima di introdurre l'endpoint `z/x/y`.
7. **Lo scheletro/loading state** (Fase 12) — se la cura richiede una scelta di
   prodotto, fermarsi prima di modificarlo.
8. **Le tre vetrine** (`(vetrina)`, `(vetrina-1b)`, `(vetrina-2)`) sono
   **congelate**: WIP, non si toccano finché Lorenzo non sceglie.
9. **`nodeLinker` sotto pnpm — CHIUSO, e non era una decisione.** Sembrava un
   compromesso fra rigidità delle dipendenze e test funzionanti; era il
   MAX_PATH di Windows, e il banco di prova che lo superava. Si resta sul
   layout **isolato**. Resta a Lorenzo la sola scelta se aggiungere
   `virtualStoreDirMaxLength` (§10 punto 9): non ripara niente di rotto, allarga
   un margine da 26 a 46 caratteri.

**Regole permanenti che valgono comunque**: niente commit o push senza richiesta
esplicita · niente dipendenze nuove senza chiedere · i commit portano solo il suo
nome (niente `Co-Authored-By`) · il deploy lo lancia lui.

---

## 10. La prossima azione, esatta

### Il punto di partenza

`main` è ancora a **`5e1f151`** (Fase 2a): la Fase 2b vive sul branch
`chore/pnpm-migration-phase-2b`, **non unita**. `pnpm-lock.yaml` e
`pnpm-workspace.yaml` creati, `package-lock.json` **rimosso**.

Per rifare la misura da sé — e `corepack pnpm`, mai `pnpm` nudo (§7b):

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm impronta:confronta   # 213 token, deve dire «invariata»
corepack pnpm lint && corepack pnpm typecheck && corepack pnpm test
corepack pnpm rotte                # 68 rotte, 0 con problemi
```

🔴 **Se serve tornare indietro, il punto di ritorno è il COMMIT, non il
lockfile.** Ripristinare `package-lock.json` da solo non riporterebbe indietro
niente: CI, `Dockerfile`, `docker-entrypoint.sh`, `start.bat`, gli script e i
test sono convertiti a pnpm, e un lockfile npm accanto a loro non li fa tornare
npm. Il rollback vero è `5e1f151` — e finché la PR #3 non è unita, `main` **è**
già quel punto.

### FASE 2a — CHIUSA. Tutto misurato fuori dal repository

> 📌 **Quanto segue (punti 1–13) è il REFERTO dell'analisi 2a, e resta come
> registro.** Tutti i suoi punti sono stati **eseguiti nella 2b**; dove la
> misura successiva ha smentito una previsione, la 2b l'ha corretta e §7b lo
> dice. Le due correzioni che contano: la policy `allowBuilds` è risultata
> **identica su Linux** (nessuna scelta da fare), e il vero ostacolo non era
> nessuno di quelli previsti ma **`pnpm` assente dal PATH** in quattro punti.
> Le frasi al futuro («la 2b aggiunga…», «la 2b deve rivalidare…») vanno lette
> come *fatto*, non come *da fare*.

Nel repository la 2a ha lasciato **una riga sola**: `packageManager` in
`package.json`. Niente `pnpm-lock.yaml`, `package-lock.json` intatto, CI/Docker/
script/documentazione non toccati. Il resto è stato provato in tre banchi nello
scratchpad, costruiti con `git archive HEAD:pistoia-dashboard` — cioè
esattamente i file da cui costruiscono CI e Docker.

**1 · Versione proposta: `pnpm@11.22.0`.** Motivazione:

- Il meccanismo di autorizzazione **cambia con la versione**, e la scelta va
  fatta prima di configurarlo: fino a 10.25 era `onlyBuiltDependencies` (una
  lista), da **10.26** è **`allowBuilds`** (una mappa, con pinning per versione).
- Da **pnpm 11 le impostazioni NON si leggono più dal campo `pnpm` di
  `package.json`**: vanno in `pnpm-workspace.yaml`, anche in un progetto che non
  è un workspace. Adottare la 10 significherebbe pagare quella migrazione dopo.
- Con pnpm 11 un'installazione che ignora build script **esce 1**
  (`ERR_PNPM_IGNORED_BUILDS`) — misurato. Il modo di fallire che questo progetto
  teme di più, l'install «riuscito a metà e silenzioso», **non si verifica**.
- Il bloccante del punto 9 **non dipende dalla versione**: pnpm 10.34.5 si
  comporta identico. Quindi non c'è ragione di restare indietro.

**2 · Compatibilità Node.** pnpm 11 pretende **Node ≥ 22.13** (la 10 si accontenta
di 18.12). Il progetto è su Node 22 ovunque: locale **22.17.0**, CI
`node-version: 22`, Docker `node:22-bookworm-slim`. Nessun costo.
⚠️ Ma quelle due sono **etichette mobili**: oggi risolvono sopra 22.13, e nulla
lo garantisce. La 2b aggiunga `engines.node: ">=22.13"`, così un Node più vecchio
fallisce dicendolo invece di morire ai piedi di pnpm.

**3 · Inventario reale (ciò che npm registra).** Nove pacchetti con
`hasInstallScript`, più la radice: `@astryxdesign/cli`, `@astryxdesign/core`,
`@prisma/engines`, `better-sqlite3`, `esbuild`, `fsevents`,
`playwright/…/fsevents`, `prisma`, `unrs-resolver`.

**4 · Comportamento osservato in installazione pulita** (pnpm 11.22.0, nessuna
configurazione): risolve 767, aggiunge 625, **esce 1** con
`ERR_PNPM_IGNORED_BUILDS` e l'elenco dei bloccati. Il `postinstall` **della
radice gira** — `prisma generate` ha scritto il client: pnpm blocca gli script
delle *dipendenze*, non i propri.
⚠️ **E segnala una deprecazione che npm non diceva**: `prebuild-install@7.1.3`.

**5 · Pacchetti effettivamente bloccati: SETTE, non nove.**

```
@astryxdesign/cli   @astryxdesign/core   @prisma/engines   better-sqlite3
esbuild             prisma               unrs-resolver
```

🔴 I due `fsevents` **non compaiono perché sono solo macOS**: la lista dipende
dalla piattaforma. Questa è stata letta **su Windows**; CI e Docker sono Linux,
e su macOS sarebbero nove. **La 2b rilegga l'elenco sulla piattaforma di CI
prima di fissare la configurazione.**

**6 · Chi ha davvero bisogno dell'autorizzazione: UNO.** Provato negando tutti e
sette e guardando che cosa si rompe:

| | |
|---|---|
| `better-sqlite3` | 🔴 **serve** — senza: «Could not locate the bindings file» |
| `@astryxdesign/cli` · `@astryxdesign/core` · `@prisma/engines` · `esbuild` · `prisma` · `unrs-resolver` | ✅ **negati, e tutto passa**: lint · typecheck · **build di produzione** |

`esbuild` funziona lo stesso (`--version` → 0.28.2) perché il binario arriva dal
pacchetto per piattaforma, non dal `postinstall`. Il `preinstall` di `prisma` è
un controllo d'ambiente. E `prisma generate` **riesce** con `@prisma/engines`
negato.

**7 · Configurazione minima proposta** — `pnpm-workspace.yaml`, dove ogni script
è **revisionato**, non solo permesso:

```yaml
allowBuilds:
  better-sqlite3: true
  '@astryxdesign/cli': false
  '@astryxdesign/core': false
  '@prisma/engines': false
  esbuild: false
  prisma: false
  unrs-resolver: false
```

🔴 **Non è un'allowlist: è una POLITICA degli script di build**, e i tre stati
sono distinti apposta:

| stato | significato | effetto |
|---|---|---|
| `true` | serve, e lo si è visto rompersi senza | lo script gira |
| `false` | **revisionato e giudicato non necessario** | non gira, e l'install prosegue |
| non elencato | **non revisionato** | **l'install si ferma** |

Elencarli tutti e sette è quindi il punto, non la forma: un pacchetto che domani
introduce uno script **non passa in silenzio**, rompe e chiede una decisione. È
§3 applicata alle dipendenze — *un cancello deve distinguere «verificato e a
posto» da «non verificato»*.

⚠️ **Questa politica NON è definitiva.** I sette sono ciò che è stato osservato
**su Windows**; i nove `hasInstallScript` restano solo l'inventario iniziale di
npm. La 2b deve **rivalidarla**, e almeno su questi tre fronti:

1. **l'ambiente Linux della CI** — dove i due `fsevents` non ci sono e l'elenco
   dei bloccati può differire;
2. **la build Docker di destinazione** — `npm ci --include=dev` diventa un
   comando pnpm, e l'immagine è l'unico posto dove i binari girano su glibc;
3. **i moduli nativi**, uno per uno: `better-sqlite3`, `@node-rs/argon2` e
   Prisma/`@prisma/engines`. Per l'argon2 il test è **l'accesso reale**, non la
   build; per Prisma è una **query vera**, non `generate`.

La politica si congela **lì**, non qui.

**8 · Moduli nativi e dipendenze per piattaforma.** Provati a runtime, non
dedotti dal manifesto:

| | |
|---|---|
| `better-sqlite3` | ✅ con la sua voce a `true`: `select 1+1` → 2 |
| `@node-rs/argon2` | ✅ **hash e verify reali, senza alcuno script** |

`@node-rs/argon2` **non presenta un install script e non è quindi un candidato
diretto all'allowlist per quel motivo**. Questo non lo mette al riparo dalla
migrazione: dipendenze optional/per-piattaforma, risoluzione, layout di
`node_modules` e caricamento dei binari nativi possono comportarsi diversamente
sotto pnpm. **Resta obbligatoria la validazione runtime dopo la migrazione**, e
per questo pacchetto il test è **l'accesso reale**, non la build. La prova fatta
qui vale per **Windows/x64**: va ripetuta su Linux e dentro l'immagine.

**9 · 🔴 IL FALSO BLOCCANTE — MAX_PATH, e il banco che se l'era procurato**

Il primo referto di questa fase diceva: «sotto il layout isolato di pnpm Vitest
non parte, serve `nodeLinker: hoisted`». **Era sbagliato**, e vale la pena di
sapere perché ha resistito a quattro controlli.

Il sintomo:

```
TypeError [ERR_PACKAGE_IMPORT_NOT_DEFINED]:
Package import specifier "#module-evaluator" is not defined
  imported from …/vitest/dist/chunks/cli-api.….js
```

Quattro spiegazioni escluse misurandole — **e tutte e quattro sbagliavano
bersaglio, perché condividevano lo stesso banco**: non è la versione di vitest
(4.1.8, la stessa di npm, fallisce identico), non è lo shim di `.bin` (fallisce
anche per percorso reale), non è un manifesto rovinato (`imports` è presente e
identico a quello che vede npm), non è la versione di pnpm (10.34.5 identico).

**La causa vera.** Per risolvere un `#import` Node esegue `LOOKUP_PACKAGE_SCOPE`:
risale dal file importante finché trova un `package.json`, e ci cerca la chiave
`imports`. Quella lettura passa per una chiamata soggetta al **MAX_PATH di
Windows**. Se il percorso del `package.json` supera il limite, la lettura non
riesce — e **Node non riporta un errore di I/O: riporta che il pacchetto non
dichiara quell'import.** Il messaggio accusa il manifesto di una mancanza che
non ha.

La soglia, isolata con una riproduzione minima e bisezionata al carattere:

| percorso del `package.json` | esito |
|---|---|
| 259 caratteri | ✓ risolto |
| **260 caratteri** | ✗ `ERR_PACKAGE_IMPORT_NOT_DEFINED` |

🔴 **Conta il `package.json`, NON il file che importa.** La prova: con
`virtualStoreDirMaxLength: 40` il chunk che importa resta a **273** caratteri —
sopra soglia — e i test **passano**, perché il `package.json` scende da **272 a
252**. Chi guardasse il file citato nel messaggio d'errore cercherebbe nel posto
sbagliato.

**Che cosa c'entra pnpm.** Il layout isolato inserisce
`.pnpm/<nome>@<versione>_<peer>_<hash a 32 cifre>/node_modules/<nome>/` davanti a
ogni pacchetto: **~90 caratteri in più** per ogni `package.json` rispetto al
`node_modules` piatto di npm. Non rompe niente da solo: **avvicina al limite**.

**E il limite l'avevo superato io.** Il banco stava nello scratchpad, radice
**159** caratteri; il progetto vero ne ha **68**. Novantuno di differenza, cioè
esattamente il margine che mancava.

⚠️ `LongPathsEnabled` vale **1** su questa macchina: il supporto ai percorsi
lunghi è attivo e **non salva** questa lettura. Le `fs.*` leggono senza problemi
file a 288 caratteri; il resolver ESM no.

**Alla lunghezza reale del progetto (radice 68), pnpm ISOLATO passa tutto:**

| | |
|---|---|
| `pnpm install` | ✅ |
| lint · typecheck | ✅ · ✅ |
| **test** | ✅ **339/339** |
| build di produzione | ✅ |
| `package.json` più lungo | **233** caratteri · **0** oltre soglia |
| quello di vitest | **181** (nel banco era 272) |

**`nodeLinker: hoisted` non serve.** Funzionava solo perché accorciava i
percorsi: barattava l'intero modello di rigidità delle dipendenze per un problema
di lunghezza.

**Il margine, però, è la cosa da tenere d'occhio: 26 caratteri.** Tanto può
crescere la radice del checkout prima che il primo `package.json` sfori.

### ✅ Deciso (2026-08-16): il layout resta `isolated`

`nodeLinker` **non si tocca**. Nessuna ulteriore indagine: la questione è chiusa.

Approvata invece, **per la Fase 2b**, una riga in `pnpm-workspace.yaml`:

```yaml
virtualStoreDirMaxLength: 40
```

🔴 **Come va descritta, e come NON va descritta.** Non è un «workaround Vitest» e
non ripara niente di rotto: **il progetto reale passa già con il default**. È una
**protezione preventiva contro il MAX_PATH di Windows nei package scope del
virtual store di pnpm**, motivata dal difetto riprodotto qui sopra e dal margine
relativamente ridotto del checkout attuale. Misurata nel banco a lunghezza reale:
`package.json` più lungo da **233 a 213**, margine **da 26 a 46**, install verde,
**339/339**.

**10 · I test che la 2b deve superare** — non basta la build:

1. `pnpm install --frozen-lockfile` da zero, su **Linux**, con l'elenco dei
   bloccati riletto lì.
2. `lint` · `typecheck` · `test` (339) · `build`.
3. **Runtime, non compilazione**: `npm run rotte` (68 rotte, tre passate) e la
   suite E2E completa — è l'unica che prova **l'accesso reale**, cioè
   `@node-rs/argon2`, e le scritture, cioè `better-sqlite3`.
4. **Avvio vero**: `docker-entrypoint.sh` fa `prisma migrate deploy`, `db:seed`
   e `next start`; `start.bat` fa install, migrate, seed e `dev`. Vanno eseguiti,
   non letti.
5. Immagine Docker **costruita e avviata**, perché è l'unico posto dove i binari
   nativi girano su Linux/glibc.

**11 · La superficie esatta della 2b** — ricontata il 2026-08-16
(`npm `/`npx `/`package-lock`):

| Superficie | Occorrenze |
|---|---|
| `.github/workflows/ci.yml` | **26** |
| `start.bat` | **6** (install · migrate · seed · dev) |
| `pistoia-dashboard/docker-entrypoint.sh` | **3** (`npx prisma migrate deploy`, `npm run db:seed`, `npx next start`) |
| `pistoia-dashboard/Dockerfile` | **2** (`npm ci --include=dev`, `npm run build`) |
| `pistoia-dashboard/package.json` | gli script che invocano `npx` |
| `stop.bat` | **0** — non va toccato |
| **18 file `.md`** | **204 occorrenze, da triare**: quelle dentro un racconto storico (`CHANGELOG`, le trappole di `AGENTS.md`) **restano**, perché riferiscono ciò che accadde allora |

Cancello della 2b: CI con `--frozen-lockfile`, `package-lock.json` rimosso
**solo a validazione fatta**, e i punti 3–5 qui sopra eseguiti davvero.

**12 · Il `pnpm-workspace.yaml` approvato** — da creare **in 2b**, non prima,
in `pistoia-dashboard/`:

```yaml
# Protezione preventiva contro il MAX_PATH di Windows nei package scope del
# virtual store di pnpm. NON ripara un difetto attuale: il progetto passa già
# col default. Accorcia i nomi delle cartelle di `.pnpm/`, che il layout
# isolato antepone a ogni package.json (~90 caratteri). Misurato: package.json
# più lungo 233 → 213, margine dalla soglia 26 → 46 caratteri.
# Il layout resta ISOLATO: `nodeLinker` non si tocca.
virtualStoreDirMaxLength: 40

# POLITICA degli script di build, non una semplice allowlist.
#   true      = revisionato e NECESSARIO (visto rompersi senza)
#   false     = revisionato e deliberatamente NEGATO
#   assente   = NON revisionato → l'installazione si ferma
# ⚠️ Osservata su Windows. Va rivalidata in 2b su Linux/CI, sulla build Docker
# di destinazione e sui moduli nativi, e congelata lì.
allowBuilds:
  better-sqlite3: true
  '@astryxdesign/cli': false
  '@astryxdesign/core': false
  '@prisma/engines': false
  esbuild: false
  prisma: false
  unrs-resolver: false
```

**13 · Il piano operativo della 2b, in ordine**

1. `pnpm import` da `package-lock.json` → `pnpm-lock.yaml`, **preservando le
   versioni risolte**. ⚠️ Un `pnpm install` dai range le rialza tutte: nel banco
   aveva alzato `@node-rs/argon2`, `better-sqlite3`, `lucide-react`,
   `@playwright/test` e altre. La 2b cambia gestore, **non versioni**.
2. Creare `pnpm-workspace.yaml` col contenuto del punto 12.
3. `engines.node: ">=22.13"` in `package.json` — pnpm 11 lo pretende, e oggi ci
   affidiamo a due etichette mobili (`node-version: 22`, `node:22-bookworm-slim`).
4. Rileggere l'elenco dei bloccati **su Linux** e correggere la politica.
5. Convertire le superfici del punto 11, in quest'ordine: `package.json` → CI →
   `Dockerfile` → `docker-entrypoint.sh` → `start.bat`. I `.md` per ultimi, e
   **triati**.
6. Eseguire i test del punto 10 — compresa l'immagine Docker costruita e avviata.
7. **Solo a quel punto** rimuovere `package-lock.json`.
