# Prompt per la sessione successiva

> Riscritta il **2026-08-16**, a chiusura della **Fase 1** (la potatura).
> La Fase 0 e la correzione di CI erano già chiuse e pushate.
>
> **Fidati di questa, non di quello che ricordi.**
>
> ✅ **Fase 1 chiusa, committata e pushata: `6621e07`.**
> CI [`31937260780`](https://github.com/LorenzoCianfe/pistoia-dashboard/actions/runs/31937260780)
> **verde su tutti e quattro i job.** `main` è verde.

---

## Il prompt da incollare

```
Pistoia.app — REWORK ARCHITETTURALE. Le Fasi 0, 0b e 1 sono CHIUSE.
Riprendi dalla FASE 2a.

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

La prossima azione è la FASE 2a — fissare la versione di pnpm e OSSERVARE
quali dipendenze vengono davvero bloccate sugli script di install. È una
fase di misura: non si migra ancora niente. La 2b (pnpm vera) viene dopo,
da sola.

NON iniziare nessun'altra fase senza chiudere la 2a.
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
| **2a** | Versione pnpm fissata (`packageManager`) → si osserva quali dipendenze vengono davvero bloccate sugli script di install → si configura il meccanismo corretto **per quella versione**, sui soli pacchetti che lo richiedono | ⏭️ **PROSSIMA** |
| **2b** | **pnpm**, da sola. Superficie: `start.bat` (4 chiamate) · CI (17) · `Dockerfile` (2) · `docker-entrypoint.sh` (3) · `package.json` · 193 occorrenze nei `.md` su 18 file, **da triare**. Cancello: CI `--frozen-lockfile`, `package-lock.json` rimosso a validazione fatta, **avvio e runtime reali provati** | |
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

**Regole permanenti che valgono comunque**: niente commit o push senza richiesta
esplicita · niente dipendenze nuove senza chiedere · i commit portano solo il suo
nome (niente `Co-Authored-By`) · il deploy lo lancia lui.

---

## 10. La prossima azione, esatta

### Il punto di partenza

`main` è a **`6621e07`**, CI verde su tutti e quattro i job, albero pulito.
Non c'è niente da recuperare. Per rifare la misura da sé:

```bash
npm run impronta:confronta   # 213 token, deve dire «invariata»
npm run lint && npm run typecheck && npm test
npm run rotte                # 68 rotte, 0 con problemi
```

### FASE 2a — misurare pnpm prima di adottarlo

È una fase di **osservazione**, non di migrazione: alla fine `npm` è ancora il
gestore. Serve a non arrivare alla 2b indovinando.

**Cosa deve fare:**

1. Fissare la versione con il campo `packageManager` in `package.json`
   (`pnpm@<versione>`). ⚠️ **La versione va decisa e scritta**, perché il
   meccanismo del punto 3 cambia da una minore all'altra: configurarlo «in
   generale» significa configurarlo per una versione che non è quella in uso.
2. Fare un'installazione di prova **in una cartella fuori dal repository** (o in
   un worktree usa-e-getta) e **leggere che cosa pnpm blocca**. Non dedurlo:
   pnpm stampa l'elenco dei pacchetti a cui ha rifiutato lo script di install.
3. Configurare il meccanismo corretto per quella versione **sui soli pacchetti
   che lo richiedono davvero**, uno per uno, non con un permesso generale.

**Il punto di partenza, già misurato in questa sessione.** I pacchetti con
`hasInstallScript` nel lockfile sono **nove**, più la radice:

```
@astryxdesign/cli   @astryxdesign/core   @prisma/engines   better-sqlite3
esbuild             fsevents             playwright/…/fsevents
prisma              unrs-resolver
```

⚠️ **Questo elenco è ciò che npm registra, non ciò che pnpm bloccherà**: è la
lista da cui partire per leggere l'output vero, non la risposta. I tre che fanno
male se restano a metà sono `better-sqlite3` (binario nativo — è la ragione per
cui il `Dockerfile` sta su Debian e non su Alpine) e `@prisma/engines` + `prisma`
(scrivono il client in `src/generated/prisma`). Un install «riuscito» con quegli
script saltati **non dà errore e rompe l'avvio**.

Nota per non sbagliare diagnosi: `@node-rs/argon2` — l'altro pacchetto con
binari nativi, e quello dell'autenticazione — **non** ha script di install, li
distribuisce come dipendenze opzionali per piattaforma. Se sotto pnpm l'accesso
si rompe, la causa non è lì.

**Cosa NON deve fare:**

- ❌ non convertire ancora `start.bat`, la CI, il `Dockerfile`, l'entrypoint né i
  `.md` — è tutta Fase 2b, e va isolata in un intervento suo;
- ❌ non rimuovere `package-lock.json`: esce solo a validazione fatta, nella 2b;
- ❌ nessun file di prodotto.

**Il cancello della 2a:** un'installazione pnpm che arriva in fondo **con
l'elenco dei bloccati letto e la configurazione scritta**, e `npm` ancora
funzionante nel repository. Se pnpm blocca qualcosa che non sta nell'elenco
qui sopra, **quello è il risultato della fase**: si scrive e si tiene.

### Poi la FASE 2b — pnpm davvero

Superficie da convertire, già contata: `start.bat` (4 chiamate) · CI (17) ·
`Dockerfile` (2) · `docker-entrypoint.sh` (3) · `package.json` · **193
occorrenze nei `.md` su 18 file, da triare** (non tutte vanno cambiate: quelle
dentro un racconto storico restano). Cancello: CI con `--frozen-lockfile`,
`package-lock.json` rimosso a validazione fatta, **avvio e runtime reali
provati** — non solo la build.
