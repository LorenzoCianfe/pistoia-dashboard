# Prompt per la sessione successiva

> Scritto il **2026-08-05** a fine sessione (C-2, qualità continua).
> Copia tutto il blocco qui sotto nella conversazione nuova.

---

Pistoia Dashboard — **Lavoro D: rifiniture e decisioni aperte**. La C-2 è
chiusa; il Lavoro C (art. 14 + P-3 della pagella) **non può partire prima del
27/08/2026** — se oggi è il 27/08/2026 o dopo, C prende la precedenza su tutto.

Leggi prima, in quest'ordine:

- **AGENTS.md** — regole vincolanti. §3 ora ha **VENTIDUE trappole** (la 22 è
  nuova: uccidere `npm run dev` NON uccide `next dev`, e il superstite contende
  `.next` agli E2E — 5 test su 25 caduti in specifiche scorrelate, tutti per
  timeout, con l'aria di una regressione. Pretendi le porte 3000 e 3939 libere
  prima di lanciare la suite). §4 comandi (ora ci sono `npm run a11y` e
  `npm run lighthouse`) e le trappole sulle fonti. §5 non negoziabile, e ha una
  riga nuova: **se aggiungi un colore, misura la coppia colore/`-soft`**. §8
  deploy, con la nota nuova su perché un agente non può lanciarlo.
- **DESIGN.md** — vincolante prima di qualunque lavoro visivo. §4 ha la tabella
  **prima/dopo della tavolozza**, cambiata il 2026-08-05.
- **SECURITY.md §7** — dipendenze a **zero avvisi**, e il debito della CSP di
  sviluppo con la condizione che lo chiude.
- **docs/piano-pagella.md** — tutto il piano della pagella (serve per C).
- **ROADMAP.md §6** e la traccia «Qualità continua».

## Stato

`main`, commit **`d93eaf0`**, pushato su GitHub **e deployato su Coolify**.

- typecheck · lint · **247 unit** · **`rotte` 56, 0 con problemi** (tre passate)
  · **41/41 E2E** (25 di merito + **16 di accessibilità**) · shots nei due temi
  e `--simple --width=360` senza traboccamenti · **`npm audit`: 0
  vulnerabilità**.
- Stack: **Next 16.3.0**, **Prisma 7.9.1**, React 19.2.4.
- Dev server SPENTO. Seed **riseminato** a fine sessione: campagna e pop-up di
  Giulia (`cittadino@`) e Lorenzo (`lorenzo@`) di nuovo armati, Marco in
  silenzio.

**La produzione è allineata e — per la prima volta — si monta davvero in un
browser.** Verificato: `/metodologia` rende 17.140 caratteri, `/valutazioni`
1.826, zero risorse chieste in https, zero script senza nonce, `'strict-dynamic'`
intatto in produzione.

**E ci si resta autenticati**: verificato contro il sito vero — login, poi
`/bilancio`, `/segnalazioni`, `/profilo`, `/pagella`, `/opere` restano tutte
dove devono, con contenuto vero, e il cookie di sessione viene conservato
(`httpOnly` intatto).

Il deploy si lancia **via API** (AGENTS §8 ha i dettagli): il wrapper
`C:\Users\loren\.homelab\cf.sh` legge il token dal file accanto a sé e non lo
stampa mai; l'UUID dell'applicazione è `w148lovopnak9eshxuy13b1i`.

```bash
sh "C:\Users\loren\.homelab\cf.sh" GET "/deploy?uuid=w148lovopnak9eshxuy13b1i&force=false"
sh "C:\Users\loren\.homelab\cf.sh" GET "/deployments/<deployment_uuid>"   # finché non dà "finished"
```

E **dopo ogni deploy, guarda che la pagina si MONTI**, non solo che risponda —
è la lezione del 2026-08-05:

```bash
B=http://pistoia.192.168.50.173.sslip.io
for c in $(curl -s $B/login | grep -oE '/_next/static/[^"]+\.css' | sort -u); do curl -s $B$c | grep -oE '0e9f92|0a756b'; done | sort | uniq -c
```

`0a756b` = tavolozza nuova viva. Ma il 200 e il CSS giusto **non bastano**:
apri `/metodologia` in un browser vero e pretendi che `main` abbia migliaia di
caratteri, non 183.

## Che cosa è successo nella sessione precedente (C-2)

Serve saperlo perché tocca la tavolozza, che è la cosa più condivisa.

- **`npm audit` da 12 a 0**: patch delle foglie col solo lockfile, `next`
  16.2.7→16.3.0, `prisma` 7.8.0→7.9.1 (client e adapter allineati).
  `@lhci/cli` **non** è una dipendenza: costa 285 pacchetti e cinque avvisi, e
  il `Dockerfile` (`npm ci --include=dev`) li porterebbe in produzione — gira
  con `npx` a versione pinnata.
- **`src/proxy.ts`: in SVILUPPO la CSP non ha più `'strict-dynamic'`.** Da Next
  16.3 il server di sviluppo mette nell'HTML uno `<script>` senza nonce con
  dentro codice dell'applicazione, e `'strict-dynamic'` — che disattiva
  l'allowlist per host — lo fa rifiutare, lasciando **ogni pagina col corpo
  vuoto**. In **produzione è intatto**. Decisione esplicita di Lorenzo.
- **La tavolozza chiara è stata scurita per rispettare AA**: teal
  `#0E9F92`→`#0A756B`, `--muted-2`→`#65686c`, `--color-text-secondary`→`#5A5D61`,
  `--viola`→`#675cb4`, `--amber`→`#965a19`, `--color-success`→`#187A4D`, più
  `--red-ink` per il solo chip rosso. **Il rosso dello stemma non è stato
  toccato** (identità prima che colore) e **il tema scuro nemmeno** (passava
  già). Ogni valore è **il più chiaro** che superi 4,5:1.
- **Due cancelli nuovi**: `tests/e2e/accessibilita.spec.ts` (axe, 8 pagine × 2
  temi, WCAG AA, nessuna regola esclusa) e `lighthouserc.js` + job CI che
  **misura e non giudica**.

## Due difetti dello stesso ceppo, trovati e chiusi col deploy

Meritano di essere letti perché **la lezione vale oltre i due casi**: il codice
assumeva HTTPS in produzione, il deploy è in HTTP, e **nessun cancello poteva
accorgersene** — `rotte` e `shots` girano contro lo sviluppo, dove `NODE_ENV`
non è `production` e la CSP è quella di sviluppo.

| Difetto | Che cosa succedeva | Chiuso con |
|---|---|---|
| `upgrade-insecure-requests` nella CSP | Promuoveva a `https://` ogni script; fallivano tutti con `ERR_CERT_AUTHORITY_INVALID` e **la demo si apriva col corpo vuoto** — dalla Fase 0, mai vista da nessuno | Tolta (decisione di Lorenzo). Torna col certificato: `ROADMAP.md` ha la condizione |
| `secure: NODE_ENV === "production"` sul cookie di sessione | Un browser **non conserva un cookie `Secure` arrivato su HTTP**: il login riusciva ma **ogni navigazione tornava al login**, per sempre | `Secure` deciso da `x-forwarded-proto`. Ripiego conservativo: si rinuncia solo se il proxy dichiara *positivamente* il chiaro. Col certificato si riaccende da solo |

**Se trovi un terzo punto con la stessa assunzione, è della stessa famiglia.**
Cercalo prima di cercare altrove.

## IL LAVORO — D: rifiniture e decisioni aperte

Le prime quattro **aspettano una scelta di Lorenzo**, non un permesso: portale
con opzioni separabili su facsimili in contesto (barra in alto e stemma veri,
mai fondo neutro), e chiudi con `AskUserQuestion`.

1. **FOOTER PER GLI ANONIMI.** Sulla scheda pubblica i link del footer portano a
   pagine protette → login. Decisione mai presa: nascondere / dichiarare il
   destino / footer ridotto.
2. **`/pagella` NON HA UNA VOCE DI NAVIGAZIONE.** Esiste in `rotte.mjs` e
   `shots.mjs`, ma nessun menu ci porta (stato preesistente). Se serve una
   porta, è architettura dell'informazione: decisione sua.
3. **L'INDICE DELLE 57 DELEGHE** su `/organigramma`: 32% della pagina a 360px.
   Lorenzo lo sa e non ha deciso. La leva onesta è l'ordine.
4. **ONDATA 8 — le superfici staff.** `shots` non vede `/admin/*` né
   `/redazione` (esclusioni dichiarate), e ora nemmeno il cancello a11y le vede
   (esclusione dichiarata in testa a `accessibilita.spec.ts`): entrambe entrano
   quando gli script impareranno un passaggio da admin. Il debito visivo lì
   cresce a ogni giro.

## Debiti aperti dalla C-2, con la condizione che li chiude

Non sono «da rivedere»: ognuno ha un controllo che dice quando è ora.

1. **Rimettere `'strict-dynamic'` in sviluppo** quando Next rimetterà il nonce
   su quel tag. Verifica: a dev acceso,
   `curl -s localhost:3000/metodologia | grep '<script' | grep -vc nonce=`
   deve dare **0**. Al 2026-08-05 dà **1** su 16.3.0 e su 16.3.1-canary.3.
   Il punto è in `src/proxy.ts`, `buildCsp()`, ramo `isDev`.
2. **Fissare le soglie di Lighthouse** in `lighthouserc.js` (`assert`) dopo le
   prime passate in CI, e togliere `continue-on-error` dal job `lighthouse`.
   Oggi il file **non ha soglie di proposito**: una soglia inventata prima del
   primo numero è la scala a tacche applicata alla performance.
3. **Rendere bloccante `npm audit` in CI**: nel job `quality` il passo è
   `npm audit || true`. Diventa `npm audit --audit-level=high` quando lo zero
   avrà retto qualche settimana.
4. **`/admin/*` e `/redazione` dentro `shots` e dentro il cancello a11y**
   (è il punto 4 del Lavoro D).
5. **`@lhci/cli` è pinnato a `0.15.1`** in due posti (`package.json` e
   `.github/workflows/ci.yml`): se si aggiorna, vanno cambiati insieme.
6. **Rimettere `upgrade-insecure-requests` nella CSP** quando il deploy avrà un
   certificato valido. Tolta il 2026-08-05 da `src/proxy.ts` perché su un sito
   servito in **HTTP** promuoveva ogni script a `https://`, lo faceva fallire
   con `ERR_CERT_AUTHORITY_INVALID` e **apriva la demo col corpo vuoto** —
   difetto preesistente dalla Fase 0, non una regressione, e nessun cancello
   poteva vederlo. Verifica che sia ora: `curl -sI https://<dominio>/` risponde
   200 con certificato valido.
7. **Manca un cancello che guardi se la PRODUZIONE si monta.** `rotte` e `shots`
   girano solo contro lo sviluppo: è per questo che una demo cieca è rimasta
   cieca senza che nessuno lo sapesse. Il minimo utile: dopo ogni deploy,
   caricare una pagina pubblica in un browser vero e pretendere che `main` abbia
   più di N caratteri.

## Problemi noti, da non perdere

1. **FLAKE da compilazione a freddo.** `trasparenza.spec` «proposta respinta» e
   il **primo login** (`auth.spec:20`) cadono per timeout quando `.next` è
   appena stato cancellato: il primo login compila l'azione server e fa un
   verify Argon2id (m=19 MiB) contro un `toHaveURL` da 5s. Mai cercarlo nel
   diff; la suite si rilancia INTERA. Il segno: **sono tutti timeout**, nessuno
   afferma un contenuto sbagliato.
2. **Il dev server «spento» può non esserlo** (trappola 22): `TaskStop` uccide
   il wrapper npm, non `next dev`. Prima degli E2E pretendi le porte libere:
   `Get-NetTCPConnection -State Listen -LocalPort 3000,3939`.
3. **`prisma migrate reset` è bloccato** agli agenti. Riseminare:
   `npm run db:seed`.
4. **La campagna demo si arma dal ~3–4 del mese**; il pop-up è armato sempre.
   Voluto.
5. **Il beacon della campagna brucia la finestra**: la card in home REGISTRA la
   sollecitazione al montaggio, e `shots` naviga la home da `cittadino@`.
   **Dopo ogni giro di shots, risemina.**
6. **I bucket del seed sono ancorati al calendario**: nei primi giorni del mese
   il punto mensile può slittare fra risemine. Dichiarato nel seed.
7. **L'E2E «a zero valutazioni»** vive su `/valutazioni/trasporti`: se Trasporti
   riceverà voti nel seed, il test va ripuntato.
8. **`sicurezza`**: il volume delle segnalazioni MAI accanto alle stelle
   (`volumeAmbiguo`). Il campione dei VOTI invece si dichiara sempre.
9. **Risposta al quadro**: una per servizio+periodo, niente correzione.
10. **`requireRedazione` vive FUORI dalla DAL**: spostarlo solo con ok esplicito.
11. **La segnalazione «lasciata pubblicata»** lascia traccia SOLO nel log di
    audit: non inventare superfici pubbliche.
12. **B3 senza cron**: promemoria opportunistici sui beacon (`lib/promemoria.ts`).
13. **L'opt-in del promemoria vale 1 ORA dal voto.**
14. **`package.json` fermo a 0.10.0, CHANGELOG a 0.26.0**: mai allineati, prassi
    storica. Se dà fastidio, è una decisione.
15. **Rotte annidate che muoiono = `.next` stantio**: cancella e rilancia prima
    di cercare nel diff.
16. **Il quadro seminato risponde sempre al mese-1**: coerente da solo.
17. **LO SPAZIO JSX MANGIATO** (AGENTS §3): al confine `{espressione}`+testo lo
    spazio si scrive `{" "}`. Verifica sul DOM: `/\d[a-zà-ù]/` sulle fusioni
    cifra-lettera. **Ricontrollato su 16.3.0: zero fusioni su 14 pagine.**
18. **Il DOM del dev server tiene una SECONDA COPIA nascosta e `inert`** del
    contenuto di rotta: un `querySelectorAll` senza filtro di visibilità conta
    doppio.
19. **I comandi in background non ereditano la CWD**: `cd`/`Set-Location`
    esplicito dentro OGNI comando in background.
20. **`Select-Object -Last N` e le pipe con `tail` BUFFERIZZANO**: l'output
    interinale resta vuoto fino alla fine. Non diagnosticare dal silenzio — e
    non troncare l'output di Playwright con `| tail`, o perdi il dettaglio dei
    fallimenti (successo il 2026-08-05).
21. **Le E2E sul timbro sono version-agnostic** (`metodologia v\d+\.\d+`): il
    pin della versione vive SOLO in `metodologia.test.ts`.
22. **axe va interrogato a pagina POSATA, SCORSA e con `prefers-reduced-motion`.**
    Le tre stesure precedenti davano numeri plausibili e sbagliati: 1,07:1 su
    testo che a schermo è nero, 1,93:1 su una cifra display a metà dissolvenza.
    E il tetto di tempo dei casi autenticati va alzato: axe su `/bilancio`
    supera da solo i 30s di default.
23. **`flex-1` su un `<input>` NON basta**: l'input ha una larghezza intrinseca
    e in flex `min-width: auto` gli fa da pavimento. Serve `min-w-0` accanto —
    ha fatto traboccare `/opere/[id]` di 6px a 360px, e l'ha trovato il cancello
    delle schermate, non l'occhio.

## Regole che valgono per qualunque cosa costruisca

- Un dato inventato su una PERSONA REALE non è un dato dimostrativo.
- Ogni cifra ancorata a un atto è `{ affermazione, urlFonte, dataConsultazione }`
  e il renderer RIFIUTA chi non ha fonte.
- **Il conteggio è un fatto, la sintesi è un giudizio.**
- Un'assenza non si decora; una cifra display per schermata; niente scala a
  tacche senza un traguardo fissato; le stelle 1–5 sì.
- La firma «Redazione della Dashboard di Pistoia» SI IMPORTA da
  `lib/redazione.ts`.
- Ogni rotta nuova in `rotte.mjs` E `shots.mjs` nello STESSO momento, nella
  passata giusta (o esclusione dichiarata). **E ora anche in
  `accessibilita.spec.ts`, se è una famiglia di composizione nuova.**
- Ogni modifica alle regole editoriali passa da `lib/metodologia.ts`: bump +
  registro + costanti interpolate (mai un numero ricopiato).
- Le preposizioni italiane non si derivano (`Servizio.materia`).
- **Se aggiungi un colore, misura la coppia colore/`-soft`**: è lì che il
  contrasto è caduto, e non si vede guardando.

**PROTETTI, non toccare senza chiedere:** «Cosa vuoi fare?», modalità semplice,
token e catena del tema, autenticazione (incluso `src/proxy.ts` e la DAL),
stemma, barra in alto (incluse `AppShell` e `TopBarAnonima`), `ChiPubblica`,
`lib/costo-amministrazione.ts`, `lib/giunta.ts`, `lib/valutazioni.ts`,
`lib/email.ts`, `lib/redazione.ts`, `src/lib/auth/redazione.ts`,
`lib/sollecitazioni.ts`, `lib/metodologia.ts`, `lib/pagella.ts` — coi loro test.

**METODO con Lorenzo** (confermato cinque volte: R-4, R-5, R-6, pagella, C-2):
porta la FORMA su mockup MOSTRATI IN CONTESTO (facsimile con la barra in alto e
lo stemma, mai su fondo neutro), opzioni SEPARABILI con lettere e numeri, chiudi
con `AskUserQuestion` (due giri al massimo, la raccomandata per prima con
l'argomento onesto). **Lorenzo COMPONE**: la quinta opzione può stare fuori
dallo spettro. E **non offrire «rimandiamo» come raccomandata**: se una cosa si
può chiudere, la proposta è chiuderla — e ciò che resta si scrive con la
condizione che lo chiude. Quando risponde con una domanda invece che con una
scelta, vuole il MECCANISMO misurato, non un'impressione.

**STRUMENTI:** `python scripts/pdftext.py` (`--griglia` per tabelle); Normattiva
via curl con cookie jar, testo VIGENTE; le SPA si leggono dal JavaScript che
carica i dati; le mail di sviluppo in `.email/`; risemina `npm run db:seed`;
account demo `cittadino@` e `lorenzo@` (campagna e pop-up armati), `marco@` (in
silenzio); credenziali nel riquadro del login.

**VERIFICA (AGENTS §5):** typecheck, lint, vitest (247), `npm run rotte` a dev
acceso («0 con problemi», 56 al 2026-08-05, TRE passate), `npm run test:e2e` a
dev SPENTO (mai `E2E_BASE_URL`; **41/41**, comprese le 16 di accessibilità), e
`node scripts/shots.mjs --simple --width=360` (le opzioni a `node`, MAI a
`npm`). IntersectionObserver/rAF/ScrollTimeline solo con shots.
`graphify update .` dopo le modifiche (se rifiuta per calo di nodi, `--force`).
Aggiorna FEATURES/CHANGELOG/ROADMAP/DOCUMENTATION §10/piani MENTRE lavori.
**Non fare commit o push se non te lo chiedo.**

Comincia dal punto 1 del Lavoro D — il footer per gli anonimi — portandomi le
opzioni su un facsimile in contesto prima di scrivere codice.
