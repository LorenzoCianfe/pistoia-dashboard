# Prompt per la sessione successiva

> Scritto il **2026-08-08** a fine sessione (lista + dettaglio sulle code).
> Copia tutto il blocco qui sotto nella conversazione nuova.
>
> Il lavoro è pensato per essere lanciato con **`/loop`**: vedi «IL LAVORO».

---

Pistoia Dashboard — ieri si è chiuso **il taglio di `/admin` in sette pagine**,
oggi **lista + dettaglio sulle quattro code**, cioè il debito che quel taglio
aveva lasciato aperto poche ore prima. Il lavoro che ti aspetta è
**sgomberare la pista e poi entrare nell'Ondata 8**, in quest'ordine, e Lorenzo
vuole lanciarlo con `/loop`.

Il **Lavoro C** (art. 14 + P-3 della pagella) **non può partire prima del
27/08/2026**: se oggi è il 27/08 o dopo, C prende la precedenza su tutto.

Leggi prima, in quest'ordine:

- **AGENTS.md** — regole vincolanti. §3 ha ora **trentotto trappole**: le tre
  nuove sono di «lista + dettaglio», e la prima è quella che ti farebbe
  sbagliare per prima (*un dettaglio che interroga la propria coda risponde 404
  quando l'azione RIESCE*). §5 ha i numeri aggiornati: rotte **66**, a11y e
  bersagli **21 pagine / 42 casi**, **116** E2E. §8 contiene **il disco pieno**,
  che è la cosa che più probabilmente ti farà perdere ore.
- **DESIGN.md** — vincolante prima di qualunque lavoro visivo. §6 ha ora due
  regole sulle superfici di lavoro: *una coda una pagina* (07/08) e ***una coda
  è una lista, e il lavoro è una pagina*** (08/08), tutte e due misurate.
- **docs/piano-admin.md §7 e §8** — i due consuntivi: il taglio e le code.
- **ROADMAP.md §4** — piano O8 → O9 → O10 → O11.
- **DISCOVERY.md** — le quattro decisioni P1–P4.

## Stato

`main` pushato, **CI verde su tre job bloccanti**. Il commit del lavoro è
**`22ce8ab`**; quelli dopo sono di sola documentazione, e la testa la dice
`git log --oneline -1` — scritta così perché questa riga non invecchi a ogni
commit, come ha già fatto due volte.

- typecheck · lint · **253 unit** · **`rotte` 66, 0 con problemi** ·
  **116/116 E2E** (26 di merito + **42 a11y** + **42 bersagli** + 6 di porte) ·
  `npm audit` 0 vulnerabilità · Lighthouse con soglie, bloccante.
- `shots` **0 in tutti e due i regimi** (normale e `--simple --width=360`),
  **61 pagine per regime**.
- Stack: **Next 16.3.0**, **Prisma 7.9.1**, React 19.2.4.
- Dev server **spento**, porte 3000/3939 libere, seed **riseminato**,
  `graphify` aggiornato, albero **pulito**.
- **`package.json` allineato al CHANGELOG: 0.41.0.** Si muovono insieme.

**PRODUZIONE: `67a94fb`, indietro di QUATTRO commit** — due di lavoro
(`22ce8ab` le code, `e589d67` il taglio) e due di sola documentazione.
Misurato con `git rev-list --count 67a94fb..main`; il cancello dirà «indietro
di 4» ed è corretto. ⚠️ Ogni deploy costa **2,82GB di disco** e il disco è da
40GB: prima di lanciarlo, `ssh homeserver "df -h /"`.
**Il deploy lo lancia Lorenzo, e non si lancia senza chiederglielo.**

## Che cosa è stato fatto oggi

**Le quattro code dell'Area Comune sono liste, e il lavoro è una pagina.**
`/admin/{segnalazioni,proposte,domande,valutazioni}/[id]`, con la lista che su
desktop resta a fianco (due colonne, `@3xl`) e sotto ~1024px sparisce lasciando
il solo lavoro col ritorno alla coda.

| Rotta | prima | dopo |
|---|---:|---:|
| `/admin/proposte` | 1.894 | **656** |
| `/admin/domande` | 1.492 | **656** |
| `/admin/segnalazioni` | 896 | **1.416** |
| `/admin/valutazioni` | 1.114 | **2.539** |
| i quattro `/[id]` | — | **656 · 864 · 864 · 913** |

**Il numero che conta è una derivata, non un'altezza:** le ultime quattro **non
cambiano col numero di voci in coda**. Prima il massimo cresceva di ~320px per
voce. La riga di lista è **69px** contro i **323** del modulo di lavoro.

Le due che crescono sono il prezzo dichiarato: gli 896 di «Segnalazioni» erano
un riquadro da 576px su **4.680** di contenuto (12 voci su 14 fuori vista), e i
1.114 di «Valutazioni» mostravano **6 recensioni su 32**. Adesso ne mostra 32.

**Ma la ragione vera non era l'altezza.** La `description` della segnalazione
era **caricata e mai mostrata** — quattordici volte, una per voce, e non
compariva nemmeno nel tipo `Item` di `ReportTriage`: il Comune sceglieva lo
stato, assegnava l'ufficio e scriveva una **nota ufficiale visibile al
cittadino** avendo davanti il solo titolo. Idem il testo della proposta, che non
era neanche caricato.

Tre decisioni tecniche che valgono oltre questo lavoro, tutte in AGENTS §3:

1. **Il dettaglio si prende per id e senza filtro.** Ogni azione riuscita toglie
   la voce dalla propria coda: un dettaglio filtrato risponderebbe **404 subito
   dopo un'azione andata a buon fine**.
2. **«È ancora in coda?» si chiede alla lista che la pagina ha già**
   (`coda.some(v => v.id === id)`), mai a una seconda copia della condizione: la
   versione riscritta a mano su «Domande» aveva già dimenticato `hidden`.
3. **`@container` e non `sm:`/`lg:`**: la stessa riga vive a **804px**
   sull'indice e a **304** nella colonna del dettaglio.

**Due difetti preesistenti chiusi per strada**, invisibili a ogni cancello
perché non producono traboccamento e sono a norma di dimensione: «Flusso
ordinario» sporgeva di **62px** dal proprio riquadro a 375 (era il Lavoro 0-B),
e le quattro tendine della valutazione sintetica leggevano «Impatto: Med…»,
«Fattibilità: Da…» a 360.

## IL LAVORO — da lanciare con `/loop`

Deciso da Lorenzo il 2026-08-08: **sgombera la pista, poi comincia O8**, in
quest'ordine. Auto-ritmato (`/loop` senza intervallo): ci si risveglia quando un
lavoro finisce, non a orologio.

### 1. I due errori di idratazione di `/bilancio` — ✅ CHIUSO il 2026-08-08

Erano **sei punti in cinque componenti**, non due, e il primo mismatch teneva
nascosti gli altri: React ne riporta uno solo per albero. Causa unica: **la
preferenza di movimento letta in fase di render.** `useReducedMotion()` è `null`
sul server e `true` sul browser di chi ce l'ha attiva, quindi ogni ramo del
markup su quel valore serve un HTML diverso da quello idratato. Dettaglio in
`AGENTS.md` §3 e `DESIGN.md` §7; misura: `/bilancio` da 2 errori a **0**, e 16
rotte sondate con la preferenza attiva, **0 con errori**.

Il sintomo si vedeva **solo con `prefers-reduced-motion` attivo**. Il debito 8
qui sotto è stato riscritto: la sua premessa era falsa.

### 2. La review «lenti mancanti» — ✅ CHIUSA il 2026-08-08

Tre lenti, e la più grossa non era dove ci si aspettava: **gli argomenti di una
Server Action sono input non fidato**, perché l'azione è un endpoint HTTP
pubblico e la firma TypeScript non vale al confine di rete. Incrociato con
Prisma, che lascia cadere i campi indefiniti da un `where`, diventava
`deleteMany({ where: { token: undefined } })` = **cancella tutto** (misurato: 3
righe su 3, senza errore) su un'azione **senza sessione**. Dettaglio in
`AGENTS.md` §3 e `SECURITY.md` §3; chiuso con `lib/token.ts` davanti alle query.

Le altre due: l'origine dei link nelle mail veniva dagli header (debito 12 qui
sotto) e le due rotte API non dicevano nulla sulla propria conservabilità
(chiuso: `private, no-store` più `Vary: Cookie`).

**Il resto ha retto**: 69 azioni censite, 66 rotte tutte dinamiche, `cachedShared`
pulita, idiomi Next 16 già a posto tranne `unstable_cache` (debito 14).

### 3. Il P-3 della pagella e il censimento — ⚠️ FATTA LA PARTE POSSIBILE (2026-08-08)

**La riga «P-3 si può fare oggi» era sbagliata**, e il piano lo diceva già:
`piano-pagella.md` §1.1 regola 3 vieta la prima edizione prima del 27/08,
perché prima di quel termine un'assenza sul portale è **dentro i termini di
legge** e contarla come punto perso sarebbe un'accusa tratta da un dato
mancante. Fatto quindi ciò che non dipende dalla scadenza, in
`docs/fonti-pagella.md` (nuovo), e registrato come **P-3a** nel piano.

1. **La mappa del portale della trasparenza** — 94 voci foglia con
   l'indirizzo vero del proprio dato, e con esse la griglia esatta di ognuno
   dei dieci controlli. Serviva: il menu è guidato dal JavaScript e gli
   `href` puntano tutti alla radice, quindi un lettore automatico conclude
   che il portale ha una pagina sola. Ogni griglia esporta l'elenco **intero**
   in CSV.
2. **Il censimento delle linee programmatiche si ferma prima degli impegni.**
   L'ordine del giorno del 15/06/2026 dice «PRESENTAZIONE», due testate dicono
   «approvate 18 a 6», e **il testo non risulta pubblicato** in nessuna delle
   quattro fonti aperte (188 atti esportati, zero righe pertinenti). Zero
   impegni censiti, e nessuna delle due versioni entra in pagina.

**Resta da fare, dopo il 27/08:** la ricognizione dei dieci controlli sulle
griglie già mappate, e il testo delle linee programmatiche — le condizioni che
chiudono le due aperture sono in `fonti-pagella.md` §3. Una di quelle strade è
l'**accesso civico**, che è un'azione verso il Comune: la decidi tu.

### 4. Poi l'Ondata 8 — Il Comune che legge la città

Analytics operative, alert su trend anomali, moderazione assistita; più le sette
voci recuperate dal limbo; più **la pipeline degli atti** (P-4: la pipeline in
O8, le superfici pubbliche in O11).

⚠️ **Le nuove superfici hanno già una casa dichiarata**, e la regola di
`DESIGN.md` §6 dice quale: *alert* è una coda → pagina sua **e, se cresce, lista
+ dettaglio come le altre quattro**; *analytics* e *monitor della pipeline* sono
letture → sul cruscotto finché ci stanno.

## Debiti aperti, ognuno con la condizione che lo chiude

*(Il debito «lista + dettaglio per le code lunghe» è chiuso: 2026-08-08.)*

1. **L'immagine Docker pesa 2,82GB** perché le devDependencies restano
   installate. Un build **multi-stage** le toglierebbe. **Condizione: quando
   `df -h /` tornerà sopra l'80% nonostante la potatura.**
2. **Rimettere `upgrade-insecure-requests` nella CSP.** Verifica:
   `curl -sI https://<dominio>/` → 200 con certificato valido.
3. **Rimettere `'strict-dynamic'` in sviluppo** quando Next rimetterà il nonce.
   Verifica: `curl -s localhost:3000/metodologia | grep '<script' | grep -vc nonce=`
   deve dare **0**. Punto: `src/proxy.ts`, `buildCsp()`, ramo `isDev`.
4. **`@lhci/cli` pinnato a `0.15.1` in due posti** (`package.json` e
   `.github/workflows/ci.yml`): si aggiornano insieme.
5. **Le soglie Lighthouse stanno cinque punti sotto il minimo osservato.** Se i
   numeri salgono, la leva è **alzarle**, mai toglierle.
6. ✅ **La review «lenti mancanti» è stata fatta** (2026-08-08, Lavoro 2 qui
   sopra). Ciò che ha lasciato aperto sono i debiti **12, 13 e 14**.
7. **Il cancello della produzione SCRIVE nel database dimostrativo**: accede
   come `cittadino@` e atterra su `/la-mia-citta`, dove `CampagnaHome` registra
   la sollecitazione al montaggio; in produzione il seed non si rilancia.
   Misurato: la card **resta a schermo** e il fatto registrato è **vero**.
   **Condizione: il giorno in cui quella base dati smetterà di essere
   dimostrativa, il cancello vuole un conto suo.**
8. ⚠️ **RISCRITTO il 2026-08-08: la premessa era falsa.** `npm run produzione`
   **apre** `/bilancio` da quando esiste (`d5b8a43`, in `PAGINE_AUTENTICATE`,
   `scripts/produzione.mjs` ~riga 135). Il buco vero è un altro e più largo:
   **nessun cancello guarda la console, e nessuno emula
   `prefers-reduced-motion`.** I due errori di idratazione del Lavoro 1 si
   vedevano *solo* con la preferenza attiva, e stavano scritti **quattro volte
   nel log degli E2E** — che giravano già in quello stato e uscivano verdi.
   **Condizione: il giorno in cui un cancello leggerà la console, il posto è
   `rotte.mjs`** — è l'unico che apre tutte e 66 le rotte per indirizzo — **e
   va aperto emulando `prefers-reduced-motion: reduce`**, che è lo stato che si
   rompe di più e si verifica di meno. Misura di partenza, 2026-08-08: 16 rotte
   sondate a mano, **0 con errori**. È un cancello nuovo, quindi lo decide
   Lorenzo insieme a quello di «nessun controllo esce dal proprio contenitore».
9. 🆕 **`getRecensioniRecenti()` è codice morto** (`src/lib/data/valutazioni.ts`,
   ~riga 328) da quando `/admin/valutazioni` mostra tutte e 32 le recensioni in
   attesa. Nessun test la copre; compare solo in due commenti storici.
   **Condizione: si rimuove, a meno che una superficie pubblica prevista non
   chieda «le ultime N recensioni» — e in quel caso si scrive QUALE nel commento.**
10. 🆕 **`/admin/cittadini` non è passata a lista + dettaglio.** È fuori per
    disegno: contatore **3**, e le sue due code sono azioni singole
    (approva/rifiuta), non superfici di lavoro. **Condizione: la stessa delle
    altre — quando una delle due supera le ~10 voci.**
11. 🆕 **Tre schermate stantie in `screenshots/wave-semplice/`**:
    `pagella-a-fascia`, `pagella-b-cartiglio`, `pagella-c-filo` sono mockup di
    una sessione passata, e `shots` non le rigenera più. Una revisione visiva che
    le apra guarderebbe una proposta morta. **Condizione: si cancellano al primo
    giro di revisione visiva della pagella.**
12. 🆕 **`APP_ORIGIN` non è impostata in produzione**, quindi i link delle mail
    si costruiscono ancora dagli header — `X-Forwarded-Host`, che scrive chi
    chiama. Chi votasse con l'indirizzo di un'altra persona e un host forgiato
    le farebbe arrivare una mail vera col link di conferma al proprio server.
    La leva è già in codice (`src/lib/env.ts`, `.env.example`), manca solo il
    valore. **Condizione: impostare `APP_ORIGIN` fra le variabili d'ambiente
    su Coolify. Verifica: lasciare una valutazione mandando a mano un
    `X-Forwarded-Host` inventato, e controllare che il link nella mail punti
    comunque al dominio vero.**
13. 🆕 **`MAX_PHOTO_CHARS` (1.500.000) sta sopra `bodySizeLimit` ("1mb").** Una
    foto fra i due valori viene respinta da Next con il proprio errore di
    dimensione prima che l'azione possa dare il messaggio cortese che ha già
    scritto. Non è un buco — fallisce dal lato sicuro — è un messaggio che non
    si vedrà mai. **Condizione: si allineano quando qualcuno incontra
    l'errore generico caricando una foto, e la leva è abbassare
    `MAX_PHOTO_CHARS`, non alzare il limite del corpo.**
14. 🆕 **`unstable_cache` è dichiarato sostituito da `use cache`** dal doc della
    versione installata (Next 16.3). Sono quattro usi soli, tutti in
    `src/lib/cache.ts`, e funzionano — ma la migrazione vuole **Cache
    Components**, che è un cambio architetturale e non una riga.
    **Condizione: quando `use cache` uscirà dal regime di opt-in, o quando
    servirà una cache che `unstable_cache` non sa fare (per-segmento,
    `cacheLife` diversi nella stessa pagina).**

## Decisioni di forma lasciate aperte

- **Un cancello nuovo: «nessun controllo esce dal proprio contenitore».** Oggi è
  la **terza volta** che un difetto di questa famiglia sfugge a tutti e tre i
  cancelli — `shots` misura il traboccamento *della pagina*, `bersagli` la
  *dimensione*, axe non ha la regola. I tre casi pagati: l'affordance affidata
  all'`:hover`, «Flusso ordinario» tagliato di 62px, le quattro tendine tagliate
  a metà parola. Vale la pena scriverlo.
- **`.btn-sm` ha la stessa altezza di `.btn-md`** e si distingue solo per il
  respiro orizzontale. Se vuoi tre gradini distinti, la leva è **rinominare, non
  abbassare**.
- **`cittadini` fonde due code** (verifiche + moderazione). Se la regola pura
  dovesse vincere, diventano otto pagine e non cambia nient'altro.
- **La collisione «segnalazioni» vs «segnala un problema del sito»** (O9): la
  distinzione va fatta nel nome, non nella spiegazione.
- **Chi può votare le funzionalità e con quali difese** (O9): il precedente è
  `Sollecitazione` e il voto riservato ai verificati.
- **Il modello d'interazione della roadmap pubblica**: va su **mockup mostrati
  in contesto**, non su una domanda.
- **Sentiment civico** resta in parcheggio: *il conteggio è un fatto, la sintesi
  è un giudizio*.

## Problemi noti — ambiente (costano ore)

1. **🔴 IL DISCO DEL SERVER SI RIEMPIE, E BUTTA GIÙ COOLIFY.** Ogni deploy costa
   **2,82GB** e Coolify **non cancella** l'immagine vecchia; il disco è da 40GB.
   Quando si riempie: Postgres va in `PANIC … No space left on device`,
   `coolify` e `coolify-db` diventano **`unhealthy`**, e **ogni** endpoint
   dell'API risponde `Server Error`, `/deploy` compreso.
   **L'applicazione però continua a girare.** Si ripara liberando spazio e
   **si riprende da solo in ~20s**, senza riavvii.
   Primo controllo: `ssh homeserver "sudo -n docker ps --filter name=coolify --format '{{.Names}}|{{.Status}}'"` e `df -h /`.
   Prima cosa da liberare: `docker builder prune -a -f` — **su questo progetto è
   spazio buttato**, perché il build usa `--no-cache`. Poi le immagini vecchie
   **una per tag**, tenendo quella viva e la precedente per il rollback.
   ⚠️ **Mai `docker image prune -a`**: là vivono anche Umami, Homepage e Uptime Kuma.
2. **Il polling di un deploy può non dire mai `finished`.** Chiedi al **processo
   vivo**, non all'API: il tag dell'immagine che il container esegue. È il
   controllo 0 di `npm run produzione`.
3. **🔴 GLI E2E LASCIANO `.next` IN UNO STATO CHE FA 404 SULLE ROTTE ANNIDATE.**
   `pretest:e2e` cancella la cartella, il server di Playwright la ricostruisce
   sulla 3939, e il primo `npm run dev` successivo riparte in ricostruzione
   incrementale. **Chi lancia i cancelli nell'ordine naturale ci passa in mezzo
   ogni volta.** Da 07/08 `shots` lo dice invece di fotografare la 404; la cura
   resta: **cancella `.next` e rilancia PRIMA di cercare nel diff.**
4. 🆕 **MODIFICARE IL CODICE MENTRE GLI E2E GIRANO INVALIDA IL GIRO.** Il server
   di Playwright compila su richiesta, quindi una modifica a metà suite può
   essere raccolta da alcuni test e non da altri — e il risultato non descrive né
   il prima né il dopo. Pagato oggi: suite fermata a metà e rilanciata.
   **Mentre la suite gira si toccano solo i `.md` fuori da `pistoia-dashboard/`.**
5. 🆕 **Fermare `npm run test:e2e` lascia la 3939 occupata e Chromium orfano.**
   Dopo uno stop: `Get-NetTCPConnection -State Listen -LocalPort 3000,3939` per
   trovare il superstite e `Get-Process chrome-headless-shell | Stop-Process -Force`
   (⚠️ **non** toccare `chrome.exe` in `Program Files`: è il Chrome di Lorenzo).
   Senza, il rilancio fallisce o eredita `.next` da due processi.
6. 🆕 **Il pannello del browser dell'agente può non comporre**, e allora
   `screenshot` fallisce con «the Browser pane is not displayed». Le **sonde**
   (`javascript_tool`, `read_page`) funzionano lo stesso: per le immagini si usa
   uno script Playwright in scratchpad, che è comunque il metodo del progetto.
7. 🆕 **Tailwind v4 compila solo le classi che trova nel SORGENTE.** Una classe
   arbitraria iniettata a runtime — in un mockup o in una sonda — **non ha CSS e
   non dà errore**: oggi la variante a due colonne è stata fotografata
   *impilata*, cioè la schermata su cui si stava per decidere mostrava un'altra
   cosa. Nei mockup iniettati, tutto ciò che non è già nel repository si scrive
   come **stile in linea**.
8. **Chromium può smettere di partire del tutto** («Invalid file descriptor to
   ICU data received»). Si ripara con `npx playwright install chromium --force`.
   ⚠️ **Il binario risponde a `--version` anche in quello stato.**
9. **`shots` rilancia il browser a ogni passata**, ed è voluto.
10. **`shots` accetta `--only=` SOLO se passato a `node`**, mai a `npm`:
    `node scripts/shots.mjs --simple --width=360 --only=admin-proposta-dettaglio`.
    Utile per rifotografare poche pagine dopo una correzione.
11. **Il dev server «spento» può non esserlo**: `TaskStop` uccide il wrapper npm,
    non `next dev`. Pretendi le porte libere.
12. **Il dev server può morire da solo** durante un giro lungo.
13. **Riseminare invalida le sessioni aperte nel browser**: dopo `npm run db:seed`
    il cookie di prima porta al login. Rifai l'accesso, non cercare un bug.
14. **`perl -0pi -e` con escape `\x{…}` DISTRUGGE la codifica dell'intero file.**
    Usa lo strumento di modifica, o caratteri letterali, o `-CSD`. Dopo qualunque
    passaggio di `perl` o `python` su un `.md`: `grep -c 'Ã\|Â' <file>`.
15. **Le pipe con `tail` BUFFERIZZANO** e nascondono i fallimenti. ⚠️ E se metti
    `| tail -30` su un comando in background, **il file di uscita contiene solo
    quelle 30 righe**: redirigi su un file e leggilo, non incanalare.
16. **I comandi in background non ereditano la CWD**: `cd` esplicito dentro ogni
    comando in background.
17. **Uno script in scratchpad non risolve `@playwright/test`**: usa
    `createRequire` puntato al `package.json` del progetto.

## Problemi noti — prodotto

18. **FLAKE da compilazione a freddo.** Il segno: **sono tutti timeout**. Mai
    cercarlo nel diff; la suite si rilancia INTERA.
19. **Il tetto di 40 accessi per IP** (`loginAction`) non si azzera al successo.
    `login()` riusa la sessione; se aggiungi test che accedono davvero, ricontrolla.
20. **Il cancello dei bersagli non copre gli stati che il seed non produce.**
    I `<details>` sì (`posata()` li apre).
21. **Nessun cancello misura «sembra un controllo»**, e nessuno misura **«un
    controllo esce dal proprio contenitore»**. Tre difetti pagati su questa
    seconda categoria: vedi «Decisioni di forma lasciate aperte».
22. **`prisma migrate reset` è bloccato** agli agenti. Riseminare: `npm run db:seed`.
23. **La campagna demo si arma dal ~3–4 del mese**; il pop-up è armato sempre.
24. **Il beacon della campagna brucia la finestra**: la home REGISTRA la
    sollecitazione al montaggio. **Dopo ogni giro di shots o di sonde che
    accedono come `cittadino@`, risemina.**
25. **I bucket del seed sono ancorati al calendario.**
26. **L'E2E «a zero valutazioni»** vive su `/valutazioni/trasporti`.
27. **`sicurezza`**: il volume delle segnalazioni MAI accanto alle stelle.
28. **Risposta al quadro**: una per servizio+periodo, niente correzione.
29. **`requireRedazione` vive FUORI dalla DAL**: spostarlo solo con ok esplicito.
30. **La segnalazione «lasciata pubblicata»** lascia traccia SOLO nel log di audit.
31. **B3 senza cron**: promemoria opportunistici sui beacon.
32. **L'opt-in del promemoria vale 1 ORA dal voto.**
33. **Il quadro seminato risponde sempre al mese-1.**
34. **LO SPAZIO JSX MANGIATO**: al confine `{espressione}`+testo lo spazio si
    scrive `{" "}`. Verifica sul DOM: `/\d[a-zà-ù]/`.
35. **Il DOM del dev server tiene una SECONDA COPIA nascosta e `inert`.** Un
    conteggio di nodi senza filtro di visibilità conta doppio.
36. **Le E2E sul timbro sono version-agnostic**: il pin vive SOLO in
    `metodologia.test.ts`.
37. **Le misure responsive dal pannello del browser non sono affidabili.**
38. **Motion mette `tabindex="0"`** su qualunque elemento con `whileTap`.
39. **Un `NavItem` non attraversa il confine RSC**: contiene `icon`, che è un
    **componente**. Passa il ruolo, una stringa. Typecheck e lint restano verdi.

## Regole che valgono per qualunque cosa costruisca

- Un dato inventato su una PERSONA REALE non è un dato dimostrativo. **E una
  delibera inventata è peggio: attribuisce una decisione alla giunta.**
- Ogni cifra ancorata a un atto è `{ affermazione, urlFonte, dataConsultazione }`
  e il renderer RIFIUTA chi non ha fonte.
- **Il conteggio è un fatto, la sintesi è un giudizio.**
- **Il contatore si chiede al database con `count`, mai contando le righe che la
  pagina mostra.** E quando lo aggiungi a una superficie che mostra un `take`,
  **il primo numero che esce è una diagnosi**, non una conferma.
- **Una coda una pagina · gli strumenti insieme · le letture sul cruscotto,
  finché ci stanno · il registro è una lettura anche lui** (`DESIGN.md` §6).
- **Una coda è una lista, e il lavoro è una pagina** (`DESIGN.md` §6). Il
  riquadro che scorre limita **la lista**, mai il lavoro.
- **Un dettaglio non interroga la propria coda**: si prende per id, senza filtro.
  E «è ancora in coda?» si chiede alla lista che la pagina ha già.
- Un'assenza non si decora; una cifra display per schermata; niente scala a
  tacche senza un traguardo fissato; le stelle 1–5 sì.
- La firma «Redazione della Dashboard di Pistoia» SI IMPORTA da `lib/redazione.ts`.
- **Ogni rotta nuova in `rotte.mjs` E `shots.mjs` E `tests/e2e/pagine-cancello.ts`
  nello STESSO momento**, dichiarando il `ruolo:`, **e con l'atterraggio
  preteso**. Se l'indirizzo non è fisso, ci si arriva **cliccando**: `DETTAGLI`
  in `rotte.mjs`, `apriPrima` in `shots.mjs` e in `pagine-cancello.ts`.
- **«La pagina risponde» e «si può arrivare alla pagina» sono due domande
  diverse.** Il secondo cancello è `porte.spec.ts`.
- Ogni modifica alle regole editoriali passa da `lib/metodologia.ts`.
- Le preposizioni italiane non si derivano (`Servizio.materia`).
- **Se aggiungi un colore, misura la coppia colore/`-soft`.** E **se metti un
  bordo, misura contro il fondo su cui sta**: `--border` sulla tela fa **1,03:1**.
  Sulla tela si usa `--border-strong`; **su una superficie** va `--border`.
- **Un componente reso in colonne di larghezza diversa usa `@container`**, non
  `sm:`/`lg:`. **E se cambi DOVE vive, le larghezze a cui era verificato non
  valgono più.**
- **La classe di dimensione va sull'elemento che porta il testo.**
- **Ogni bersaglio ≥ 44px.** `min-h-11`, `size-11`, `h-11` sull'elemento.
- **Il `:hover` non è un canale, è un rinforzo.**
- **Quando una libreria di animazione tocca un elemento, chiediti quali
  attributi ci mette lei.**
- **Un vincolo che si può scrivere nel TIPO smette di essere una convenzione da
  ricordare** (`SuperficieAdmin`).

**PROTETTI, non toccare senza chiedere:** «Cosa vuoi fare?», modalità semplice,
token e catena del tema, autenticazione (incluso `src/proxy.ts` e la DAL),
stemma, barra in alto (incluse `AppShell` e `TopBarAnonima`), `ChiPubblica`,
`lib/costo-amministrazione.ts`, `lib/giunta.ts`, `lib/valutazioni.ts`,
`lib/email.ts`, `lib/redazione.ts`, `src/lib/auth/redazione.ts`,
`lib/sollecitazioni.ts`, `lib/metodologia.ts`, `lib/pagella.ts` — coi loro test.

**METODO con Lorenzo** (confermato ~quindici volte): porta la FORMA su mockup
**MOSTRATI IN CONTESTO** — e il modo migliore è **iniettarli sull'applicazione
vera** e fotografarli. Opzioni **SEPARABILI**, chiudi con `AskUserQuestion`,
**una domanda per volta**, la raccomandata per prima con l'argomento onesto.
**Lorenzo COMPONE**: risponde «1 e 2» o rifiuta l'asse della domanda.
🆕 **L'eccezione, e si costruisce:** l'8/08 ha preso la raccomandata **secca**,
perché le opzioni erano **annidate invece che alternative** («A», «A più un
layout», «B»). Quando due opzioni stanno in rapporto di contenimento, **dillo
nel testo dell'opzione**: così scegliere l'ampia è anche scegliere la stretta.
**Non offrire «rimandiamo» come raccomandata**: ciò che resta si scrive **con la
condizione che lo chiude**, e la condizione migliore è un *fatto verificabile*.
**E prima di decidere, MISURA.**

**COMMIT: solo a nome di Lorenzo Cianferoni. Niente `Co-Authored-By: Claude`.**

**STRUMENTI:** `python scripts/pdftext.py` (`--griglia` per tabelle); Normattiva
via curl con cookie jar, testo VIGENTE; **le SPA si leggono dal JavaScript che
carica i dati**; le mail di sviluppo in `.email/`; risemina `npm run db:seed`;
account demo `cittadino@` e `lorenzo@`, `marco@` (in silenzio), `comune@`
(admin), `moderatore@`; credenziali nel riquadro del login.
Deploy: `sh "C:\Users\loren\.homelab\cf.sh"` (AGENTS §8), `ssh homeserver`.

**VERIFICA (AGENTS §5):** typecheck, lint, vitest (253), `npm run rotte` a dev
acceso («0 con problemi», **66** al 2026-08-08, TRE passate), `npm run test:e2e`
a dev SPENTO (mai `E2E_BASE_URL`; **116/116**), e
`node scripts/shots.mjs --simple --width=360` (le opzioni a `node`, MAI a `npm`).
⚠️ **Dopo gli E2E, cancella `.next` prima di rilanciare dev/`rotte`/`shots`.**
⚠️ **E non modificare il codice mentre la suite gira.**
Cancelli singoli: `npm run a11y`, `npm run bersagli`.
**Dopo un deploy: `npm run produzione`.**
IntersectionObserver/rAF/ScrollTimeline solo con shots. `graphify update .` dopo
le modifiche. Aggiorna FEATURES/CHANGELOG/ROADMAP/DESIGN/DOCUMENTATION §10
**mentre** lavori.
**Non fare commit o push se non te lo chiedo. E NON lanciare il deploy senza
chiedere.**

I **Lavori 1, 2 e la parte possibile del 3 sono chiusi** (2026-08-08):
comincia dal **Lavoro 4 — l'Ondata 8, «Il Comune che legge la città»**. Del
Lavoro 3 resta solo ciò che il 27/08 sblocca, e le griglie da interrogare
hanno già il loro indirizzo (`docs/fonti-pagella.md` §1.2).
