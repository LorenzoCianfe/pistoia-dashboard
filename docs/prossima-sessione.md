# Prompt per la sessione successiva

> Riscritta il **2026-08-15 (sera)**, a chiusura della sessione che ha aperto il
> **rework architetturale** e chiuso la **Fase 0** (baseline verde) più la
> correzione isolata della CI.
>
> **Fidati di questa, non di quello che ricordi.** La consegna precedente
> parlava dell'Ondata 10 e di un debito di verifica: entrambi superati.

---

## Il prompt da incollare

```
Pistoia.app — REWORK ARCHITETTURALE. La Fase 0 è CHIUSA e pushata su `main`.
Riprendi dalla FASE 1.

LEGGI PRIMA, in quest'ordine:
- docs/prossima-sessione.md — è questa: la fonte principale.
- AGENTS.md §2 e §3 — le regole permanenti e le trappole già pagate.
- DESIGN.md — vincolante per qualunque lavoro visivo.
- docs/direzione-prodotto.md — la carta del prodotto.

⚠️ AGENTS.md, ARCHITECTURE.md e REFERENCES.md descrivono ancora Astryx come
sorgente dei token e il vecchio stack: sono VERI OGGI ma diventeranno falsi
durante il rework. Si consolidano in FASE 13, non prima e non a pezzi.

La prossima azione è la FASE 1 — la potatura. È a rischio zero e non tocca
nessun file di prodotto. Il cancello è `npm run impronta:confronta`: deve
restare verde, cioè nessuno dei 213 token deve muoversi.

NON iniziare nessun'altra fase senza chiudere la 1.
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
| `globals.css` | **2.894 righe** — è il vero design system |
| `components/ui/` | 19 primitive, quasi tutte di sola resa |
| Dipendenze | 19 runtime · 15 sviluppo · 767 nel lockfile |

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
| **1** | **Potatura**: via l'import di `astryx.css` (−127 KB), via `theme-neutral`, `cli` → `devDependencies` | ⏭️ **PROSSIMA** |
| **2a** | Versione pnpm fissata (`packageManager`) → si osserva quali dipendenze vengono davvero bloccate sugli script di install → si configura il meccanismo corretto **per quella versione**, sui soli pacchetti che lo richiedono | |
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

## 7. Che cosa ha fatto questa sessione

### I tre commit

| | |
|---|---|
| `b9341e5` | `fix(fase-0): la baseline torna verde, e la build di misura si pulisce da sola` |
| `6476b16` | `fix(ci): un cancello rosso non può più nasconderne altri due` |
| `2b0f4ae` | `fix(e2e): gli atti finivano nel database sbagliato, e solo la CI poteva dirlo` |

### La CI dopo il push

La ristrutturazione **funziona**: `controlli` e `build` partono in parallelo, e
`e2e` e `lighthouse` partono appena `build` finisce. **Lighthouse è verde in CI
per la prima volta dal 13/08.**

La prima passata ha però scoperto un difetto **preesistente** che i cancelli
saltati tenevano nascosto: `prima-pagina.spec.ts` **non è mai passato in CI**.
`semina-atti.ts` risolve `process.env.DATABASE_URL ?? "file:./prisma/e2e.db"`, e
in CI il workflow dichiara quella variabile verso `dev.db`: gli atti finivano lì
mentre il server di Playwright legge `e2e.db`. Corretto in `2b0f4ae` con un `env`
esplicito, come già fa `global-setup.ts`.

⚠️ **La prova locale non discrimina**: il `dev.db` di sviluppo contiene già
l'archivio vero (26.644 atti, incluso quello curato), quindi senza la correzione
il test passa comunque — dal database sbagliato. In CI `dev.db` nasce vuoto e la
differenza si vede. Il giudice è stata la passata di CI, ed è stata netta.

**Esito finale (run `31903180029`, commit `2b0f4ae`): tutti e quattro i job
verdi.** `main` è verde per la prima volta dal **12/08**.

| Job | Esito |
|---|---|
| Lint · Typecheck · Test · Audit | ✅ |
| Build di produzione | ✅ |
| E2E (Playwright) | ✅ |
| Lighthouse (soglie misurate) | ✅ |

### File toccati nella Fase 0 — **zero file di prodotto**

```
M  package.json                    4 script (pretest:e2e e lighthouse ricablati, 2 nuovi)
M  package-lock.json               nanoid 3.3.17 → 3.3.18 (advisory high)
M  scripts/shots.mjs               registro delle eccezioni al traboccamento
M  tests/e2e/porte.spec.ts         il selettore della goccia
M  tests/e2e/prima-pagina.spec.ts  riallineamento + nuovo caso su /atti
A  scripts/misura.mjs              NUOVO
A  scripts/impronta.mjs            NUOVO
A  tests/impronta/token.json       NUOVO — la baseline dei token
```

### I due strumenti nuovi

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

### Le baseline

| | |
|---|---|
| **E2E** | **192 test verdi** (Playwright) |
| **Unit** | 339 test su 28 file |
| **Lighthouse** | `/login` 100 · `/valutazioni` 99 · `/valutazioni/pulizia` 92 · `/metodologia` 92 — soglia 0,90 |
| **Token** | **213 token**, 93 dei quali cambiano col tema · `tests/impronta/token.json` |
| **Audit** | 0 vulnerabilità |

---

## 8. Il debito dichiarato, e dove si chiude

| Cosa | Dove |
|---|---|
| **`/home-1b` trabocca di 35px** a 360px in modalità semplice (il bottone «Esplora la città in 3D» non si stringe). Registrato in `shots.mjs` come **eccezione misurata** con tetto 35px: un peggioramento lo fa tornare rosso, e i tollerati si stampano anche a esito verde | **Zona congelata.** Sparisce quando la variante viene scelta (si corregge) o scartata (si cancella con la rotta) |
| **`monumento.tsx`, `porte-citta.tsx`, `striscia-dati.tsx`** — ~450 righe non montate da nessuna parte dopo il ridisegno | **Fase 6**, con il loro CSS, nello stesso intervento. Riverificare prima che non siano usati da home, vetrine congelate o altri percorsi |
| **`ATTI_TOTALI`** in `tests/e2e/costanti-atti.ts` — senza consumatori da quando la striscia dati è uscita dalla home | **Fase 6**, stessa rimozione |
| **CLS 0,165** — lo scheletro di `(pubblico)/loading.tsx` viene sostituito e il footer salta (`FOOTER.card 785→0`). **Preesistente** alla baseline verde del 06/08, sopra il «buono» di 0,1 ma sotto soglia | **Fase 12** |
| **33 `.md`** con istruzioni che diventeranno false: `AGENTS.md` §0/§3/§4/§8, `ARCHITECTURE.md` §1/§2/§3/§6/§7, `REFERENCES.md` §1/§6, `ROADMAP.md` ondata 5, `DOCUMENTATION.md` §2/§4/§8, `README.md`, `FEATURES.md` §5, `SECURITY.md` §7 | **Fase 13** |
| ⚠️ **DISCREPANZA NOTA, da non correggere di slancio**: `package.json` dichiara `0.52.0`, `CHANGELOG.md` è arrivato a `0.54.1`. Lo scarto è **preesistente** — il lockfile era fermo a `0.48.0` fino al 2026-08-15 — e non è stato toccato di proposito | Si chiude quando Lorenzo determina **la fonte canonica della versione** e la **politica di versionamento** (chi la alza, quando, e se il `CHANGELOG` può correre avanti). Finché quella decisione non c'è, allineare i numeri sarebbe scegliere al posto suo |

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

### FASE 1 — la potatura

**Cosa deve fare**, e nient'altro:

1. Rimuovere l'`@import "@astryxdesign/core/astryx.css"` da `src/app/globals.css`
   (riga 26). Verificato in questa sessione: **zero token usati dall'app sono
   dichiarati solo lì**. Sono 127 KB / 1.524 classi per ~160 componenti mai
   importati.
2. Disinstallare `@astryxdesign/theme-neutral` — zero riferimenti in tutto il
   repository, l'unica occorrenza è la riga di `package.json`.
3. Spostare `@astryxdesign/cli` da `dependencies` a `devDependencies`.

**Cosa NON deve fare:**

- ❌ non toccare `@astryxdesign/core`: serve ancora a `defineTheme` (Fase 5) e la
  decisione sui suoi componenti è di Fase 7b;
- ❌ non toccare `src/themes/pistoia.ts` né `generated/pistoia.css`;
- ❌ non toccare `@astryxdesign/core/reset.css` — muove la tipografia, ed è Fase 5;
- ❌ nessun file di prodotto;
- ❌ non passare a pnpm (è la Fase 2, e va isolata).

**Il cancello:**

```bash
npm run impronta:confronta   # deve restare VERDE: nessuno dei 213 token si muove
npm run lint && npm run typecheck && npm test
npm run shots                # schermate identiche
```

Se un solo token si muove, la rimozione non era neutra: fermarsi e capire quale
e perché, prima di proseguire.
