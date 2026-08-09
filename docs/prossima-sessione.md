# Prompt per la sessione successiva

> Scritto il **2026-08-09** a fine sessione (cinque lavori: idratazione, review
> di sicurezza, censimento della pagella, e le prime due voci dell'Ondata 8).
> Copia tutto il blocco qui sotto nella conversazione nuova.
>
> ⚠️ **Questa volta NON si lancia con `/loop`** (decisione di Lorenzo,
> 2026-08-09): conversazione normale, ci si ferma e si parla più spesso.

---

Pistoia Dashboard — ieri **l'Ondata 8 si è aperta**, con le analytics operative
sul cruscotto e la moderazione assistita. Il lavoro che ti aspetta comincia
dalla **pipeline degli atti**, che è la metà rischiosa di O8 e la cui domanda di
rischio ha **già una risposta misurata**.

Il **Lavoro C** (art. 14 + P-3 della pagella) **non può partire prima del
27/08/2026**: se oggi è il 27/08 o dopo, C prende la precedenza su tutto — e le
griglie da interrogare hanno già il loro indirizzo (`docs/fonti-pagella.md` §1.2).

Leggi prima, in quest'ordine:

- **AGENTS.md** — regole vincolanti. §3 ha ora **quarantuno trappole**. Le tre
  più recenti sono quelle che ti farebbero sbagliare per prime: *un consiglio
  che non si può seguire è peggio del silenzio*, *`undefined` in un `where` di
  Prisma non è «nessuna riga», è «nessun filtro»*, e *la preferenza di movimento
  non si legge in fase di render*. §5 ha i numeri: rotte **66**, a11y e bersagli
  **21 pagine / 42 casi**, **122** E2E. §8 contiene **il disco pieno**, che è la
  cosa che più probabilmente ti farà perdere ore.
- **DESIGN.md** — vincolante prima di qualunque lavoro visivo. §6 ha le due
  regole sulle superfici di lavoro; §7 quella nuova sul movimento: *la
  preferenza si applica in CSS o nella durata, mai in un ramo del markup*.
- **SECURITY.md §3** — le due voci nuove: *gli argomenti delle Server Action
  sono input non fidato* e *l'origine dei link nelle mail non si prende dagli
  header*.
- **docs/fonti-pagella.md** — la mappa del portale della trasparenza, che serve
  al PRIMO lavoro e non solo alla pagella.
- **ROADMAP.md §4** — piano O8 → O9 → O10 → O11.
- **DISCOVERY.md** — le quattro decisioni P1–P4.

## Stato

`main` pushato, **CI verde su tre job bloccanti**. La testa la dice
`git log --oneline -1` — scritta così perché questa riga non invecchi a ogni
commit, come ha già fatto due volte.

- typecheck · lint · **274 unit** · **`rotte` 66, 0 con problemi** ·
  **122/122 E2E** (32 di merito + **42 a11y** + **42 bersagli** + 6 di porte) ·
  `npm audit` 0 vulnerabilità · Lighthouse con soglie, bloccante.
- `shots` **0 in tutti e due i regimi** (normale e `--simple --width=360`),
  **61 pagine per regime**.
- Stack: **Next 16.3.0**, **Prisma 7.9.1**, React 19.2.4.
- Dev server **spento**, porte 3000/3939 libere, seed **riseminato**,
  `graphify` aggiornato, albero **pulito**.
- **`package.json` allineato al CHANGELOG: 0.43.0.** Si muovono insieme.

**PRODUZIONE: `67a94fb`, e la distanza NON si scrive qui** — invecchia a ogni
commit. Si misura:

```bash
git rev-list --count 67a94fb..main
```

Al 2026-08-09 erano **undici** commit. ⚠️ Ogni deploy costa **2,82GB di disco**
e il disco è da 40GB: prima di lanciarlo, `ssh homeserver "df -h /"`.
**Il deploy lo lancia Lorenzo, e non si lancia senza chiederglielo.**

## Che cosa è stato fatto il 2026-08-09

Cinque lavori. Il filo che li lega: **misurare ha smontato più di quanto abbia
costruito**, e tre volte ha detto che avevo torto io.

1. **I due errori di idratazione di `/bilancio` erano sei**, in cinque
   componenti — React ne riporta uno solo per albero, quindi ognuno era
   invisibile finché non si chiudeva quello sopra. Causa unica: la preferenza di
   movimento letta in fase di render.
2. **La review «lenti mancanti»**, saltata dall'11/06. La cosa più grossa non
   era un permesso mancante: **gli argomenti di una Server Action sono input non
   fidato**, e incrociati con Prisma (`undefined` = nessun filtro)
   `rimuoviPromemoriaAction` poteva svuotare una tabella intera.
3. **Il censimento delle linee programmatiche**: le linee sono state
   **PRESENTATE** (odg del 15/06/2026, punto 5), la stampa dice «approvate 18 a
   6», e il testo non risulta pubblicato in nessuna delle quattro fonti aperte.
   Zero impegni censiti, e nessuna delle due versioni entra in pagina.
4. **Le analytics operative** sul cruscotto: «Il carico degli uffici» e «Dove si
   accumula». La misura ha deciso metà del disegno prima del disegno.
5. **La moderazione assistita**: delle tre euristiche previste ne regge una, e
   il suggerimento di categoria è finito sul modulo del **cittadino** perché sul
   triage non aveva una leva.

Il dettaglio tecnico di tutti e cinque è in `DOCUMENTATION.md` §10 e in
`CHANGELOG.md` (0.40.1 → 0.43.0).

## IL LAVORO

Deciso da Lorenzo il 2026-08-09, in quest'ordine.

### 1. La pipeline degli atti (Ondata 8)

**La metà rischiosa di O8, e il rischio è già sciolto.** Il piano la anticipava
apposta perché «il rischio non sta nel disegno ma nel sapere se quel portale si
lascia leggere, e quella risposta costa poco se la si cerca presto». La risposta
è arrivata per caso censendo le linee programmatiche, ed è **sì**:

- Il portale è `https://pistoia.trasparenza-valutazione-merito.it/`, un Liferay
  `jcitygov`. ⚠️ **`WebFetch` prende 403; un browser vero prende 200.**
- Il menu è guidato dal JavaScript: gli `href` puntano tutti alla radice e
  l'indirizzo vero sta in **`data-mainurl`**. Chi raccogliesse gli `href`
  concluderebbe che il portale ha una pagina sola. **94 voci foglia mappate** in
  `docs/fonti-pagella.md` §1.
- **Ogni griglia esporta l'elenco INTERO in CSV** («Esporta in OpenFormat»), con
  **24 colonne**: `Oggetto · Anno · Numero · Data atto · Data esecutività ·
  Proponente · Dirigente · Assessore · Titolo categoria · Titolo sottocategoria ·
  Numero allegati · Data inizio/fine pubblicazione · **Url atto**`. Il link
  dell'export è agganciato alla sessione del portlet: va chiesto **dopo** essere
  passati dalla griglia, nello stesso contesto del browser.
- Le due griglie utili: **Provvedimenti organi indirizzo politico**
  (`…/papca-p/-/papca/igrid/29243380`, 121 atti) e **Atti generali**
  (`…/papca-g/-/papca/igrid/29243391`, 67 atti).

Quindi il modello `Atto` che la ROADMAP descrive — «organo, numero, data,
oggetto ufficiale, importo, allegati, categoria civica dedotta, legami a
quartiere/opera/bilancio» — arriva **per metà già strutturato**, `Url atto`
compreso. Resta da costruire: la lettura periodica, la **categoria civica
dedotta**, i legami, il **cancello di freschezza** e una superficie minima da
amministratore.

⚠️ **Le pagine pubbliche dell'archivio NON sono qui**: nascono in Ondata 11,
dopo il rifacimento visivo (P-4).

⚠️ **E la regola fondante vale doppio qui:** *una delibera inventata è peggio di
un dato inventato, perché attribuisce una decisione alla giunta.* Ogni riga
importata porta la propria fonte, e ciò che non si riesce ad ancorare non si
pubblica.

### 2. Il cancello che legge la console

Deciso il 2026-08-09. Oggi **nessun cancello guarda la console**, ed è per
questo che i due errori di idratazione di `/bilancio` sono vissuti mesi: erano
scritti **quattro volte nel log degli E2E**, che uscivano verdi.

- **Il posto è `rotte.mjs`**: è l'unico che apre tutte e 66 le rotte per
  indirizzo, ed è già la sede del principio «un cancello distingue *verificato e
  a posto* da *non verificato*».
- **Va aperto emulando `prefers-reduced-motion: reduce`**, che è lo stato che si
  rompe di più e si verifica di meno.
- **Misura di partenza (2026-08-08): 16 rotte sondate a mano, 0 con errori.**
  Se all'accensione ne escono di rosse su rotte che non hai toccato, sono
  **rosse di nascita** — vedi la regola dell'ondata 7.
- Definizione di «errore»: `pageerror` più `console.error`. Le informazioni e
  gli avvisi no, altrimenti il cancello nasce rumoroso e smette di essere letto.

### 3. Il cancello «nessun controllo esce dal proprio contenitore»

Deciso il 2026-08-09. **Tre difetti già pagati** che `shots` (misura il
traboccamento *della pagina*), `bersagli` (misura la *dimensione*) e axe (non ha
la regola) non possono vedere:

- l'affordance affidata all'`:hover` — 13 controlli su `/admin`;
- «Flusso ordinario» che sporgeva di **62px** dal proprio riquadro a 375;
- le quattro tendine della valutazione sintetica tagliate a metà parola a 360.

La forma non è decisa. Il candidato naturale è un test che, per ogni elemento
interattivo, confronti il proprio rettangolo con quello dell'antenato che ha
`overflow` nascosto. **Portalo su una proposta misurata prima di scriverlo**:
quanti falsi positivi produce oggi sulle 21 pagine dei cancelli?

### 4. Poi il resto dell'Ondata 8 — le sette maturità del backlog

Collegamento proposte ↔ opere ↔ bilancio · Open data out (CSV/JSON + API
read-only) · QR territoriali · Bilancio partecipativo simulato · Scorciatoie da
tastiera + pannello «?» · OG image dinamiche · Alto contrasto + font grande.
Sono voci definite e autoconsistenti: non chiedono di inventare niente.

⚠️ **Le superfici nuove hanno già una casa dichiarata** (`DESIGN.md` §6): una
coda → pagina sua, e se cresce lista + dettaglio; una lettura → sul cruscotto
**finché ci sta**. Quel «finché ci sta» è una misura: il tetto dell'area a 360px
è **3.327px** (`/admin/valutazioni`), e `/admin` oggi ne usa 2.379.

## Debiti aperti, ognuno con la condizione che lo chiude

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
6. **Il cancello della produzione SCRIVE nel database dimostrativo**: accede
   come `cittadino@` e atterra su `/la-mia-citta`, dove `CampagnaHome` registra
   la sollecitazione al montaggio. **Condizione: il giorno in cui quella base
   dati smetterà di essere dimostrativa, il cancello vuole un conto suo.**
7. **`getRecensioniRecenti()` è codice morto** (`src/lib/data/valutazioni.ts`,
   ~riga 328). **Condizione: si rimuove, a meno che una superficie pubblica
   prevista non chieda «le ultime N recensioni» — e in quel caso si scrive QUALE
   nel commento.**
8. **`/admin/cittadini` non è passata a lista + dettaglio.** Fuori per disegno:
   contatore **3**, e le sue due code sono azioni singole. **Condizione: la
   stessa delle altre — quando una delle due supera le ~10 voci.**
9. **Tre schermate stantie in `screenshots/wave-semplice/`**:
   `pagella-a-fascia`, `pagella-b-cartiglio`, `pagella-c-filo`, mockup di una
   sessione passata che `shots` non rigenera più. **Condizione: si cancellano al
   primo giro di revisione visiva della pagella.**
10. 🔴 **`APP_ORIGIN` non è impostata in produzione**, quindi i link delle mail
    si costruiscono dagli header — `X-Forwarded-Host`, che scrive chi chiama.
    Chi votasse con l'indirizzo di un'altra persona e un host forgiato le
    farebbe arrivare una **mail vera** col link di conferma al proprio server, e
    quel link porta il token che conferma o cancella la valutazione. La leva è
    già in codice (`src/lib/env.ts`, `.env.example`), **manca solo il valore**.
    **Condizione: impostarla fra le variabili d'ambiente su Coolify. Verifica:
    lasciare una valutazione mandando a mano un `X-Forwarded-Host` inventato, e
    controllare che il link nella mail punti comunque al dominio vero.**
11. **`MAX_PHOTO_CHARS` (1.500.000) sta sopra `bodySizeLimit` ("1mb").** Una
    foto fra i due valori viene respinta da Next con il proprio errore prima che
    l'azione dia il messaggio cortese che ha già scritto. Non è un buco —
    fallisce dal lato sicuro. **Condizione: si allineano quando qualcuno
    incontra l'errore generico, e la leva è abbassare `MAX_PHOTO_CHARS`.**
12. **`unstable_cache` è dichiarato sostituito da `use cache`** dal doc della
    versione installata. Quattro usi, tutti in `src/lib/cache.ts`, e funzionano
    — ma la migrazione vuole **Cache Components**. **Condizione: quando
    `use cache` uscirà dall'opt-in, o quando servirà una cache che
    `unstable_cache` non sa fare.**
13. 🆕 **Il duplicato per somiglianza del TESTO è fuori, e non per pigrizia.**
    Misurato il 2026-08-09: **zero veri positivi** sul corpus del seed, e in
    cima un falso positivo pericoloso — «Lampione a intermittenza in Via
    Dalmazia» contro «…in Via Bonellina», due lampioni in due strade diverse —
    su un'azione (`mergeReportsAction`) che fonde davvero. La ragione vale oltre
    il seed: le segnalazioni comunali sono **formulari**, quindi il testo si
    somiglia **proprio quando il luogo cambia**. **Condizione: si riapre solo su
    una serie che contenga duplicati veri.**
14. 🆕 **Lo spam è fuori: il seed non ne contiene.** Un'euristica tarata sul
    nulla è una promessa. **Condizione: quando ci sarà spam vero su cui tarare,
    cioè con la piattaforma in produzione.**
15. 🆕 **L'alert su trend anomalo è fuori.** Le ultime due settimane del seed
    fanno 6 e 9 contro una media di 2,8 e sembrano un picco da manuale, ma **i
    bucket del seed sono ancorati al calendario**: tararlo lì significa tararlo
    sulla semina. **Condizione: si scrive su una serie che non sia il seed.**
16. 🆕 **Il trend per quartiere è fuori dalle analytics.** Metà delle celle è
    sotto il campione minimo (5 quartieri su 10, e 5 categorie su 10), quindi la
    lettura sarebbe per metà muta. **Condizione: entra quando i quartieri sotto
    soglia saranno meno di un terzo.**

## Decisioni di forma lasciate aperte

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
- **La categoria di una segnalazione non è modificabile da nessuno dopo l'invio**
  — nemmeno dal Comune. È emerso costruendo la moderazione assistita e non è
  stato deciso: è così di fatto. Se un giorno il Comune dovesse poter
  riclassificare, è un atto verso il cittadino e va nel registro delle azioni.
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
   ogni volta.** La cura: **cancella `.next` e rilancia PRIMA di cercare nel diff.**
4. **MODIFICARE IL CODICE MENTRE GLI E2E GIRANO INVALIDA IL GIRO.** Il server di
   Playwright compila su richiesta, quindi una modifica a metà suite può essere
   raccolta da alcuni test e non da altri. ⚠️ **Vale anche per un commento**:
   pagato il 2026-08-08 rilanciando una suite intera per una riga di commento.
   **Mentre la suite gira si toccano solo i `.md` fuori da `pistoia-dashboard/`.**
5. **Fermare `npm run test:e2e` lascia la 3939 occupata e Chromium orfano.**
   Dopo uno stop: `Get-NetTCPConnection -State Listen -LocalPort 3000,3939` per
   trovare il superstite e `Get-Process chrome-headless-shell | Stop-Process -Force`
   (⚠️ **non** toccare `chrome.exe` in `Program Files`: è il Chrome di Lorenzo).
6. **Il pannello del browser dell'agente può non comporre**, e allora la
   navigazione fallisce con «denied or failed». Le **sonde Playwright in
   scratchpad** funzionano sempre, e sono comunque il metodo del progetto.
7. **Tailwind v4 compila solo le classi che trova nel SORGENTE.** Una classe
   arbitraria iniettata a runtime **non ha CSS e non dà errore**. Nei mockup
   iniettati, tutto ciò che non è già nel repository si scrive come **stile in
   linea**.
8. 🆕 **UN MOCKUP INIETTATO PUÒ ESSERE MISURATO E POI SPARIRE PRIMA DELLO
   SCATTO.** Pagato il 2026-08-09: `evaluate` inseriva il nodo e ne misurava
   l'altezza (+333px), poi React ri-renderizzava nei millisecondi d'attesa e la
   schermata usciva **senza la card**. **Reinietta subito prima di scattare, e
   verifica che il nodo ci sia** (`document.getElementById(...)`).
9. 🆕 **`insertBefore(nodo, undefined)` ACCODA in silenzio.** Stessa sessione: il
   mockup è finito in fondo alla pagina invece che sotto i quattro numeri,
   perché l'indice usato come ancora non esisteva. **Ancora un elemento per
   quello che è** (una griglia con quattro figli), non per posizione.
10. 🆕 **Le sonde devono aprire i `<details>`**, come fa `posata()` negli E2E:
    il modulo delle segnalazioni ci vive dentro, e un campo dentro un `details`
    chiuso **esiste nel DOM e non è visibile**. Una sonda che non lo apre
    dichiara «non c'è» una cosa che c'è.
11. 🆕 **`WebFetch` prende 403 o 410 dove un browser vero prende 200.** Il
    portale della trasparenza e alcune pagine del Comune. **Una fonte che
    resiste si legge con lo strumento giusto, non si dichiara assente.**
12. 🆕 **Uno script `.ts` in scratchpad non risolve i moduli del progetto**: usa
    `npx tsx` **dalla cartella del progetto** e importa con percorsi assoluti
    (anche `node_modules/...`), perché la risoluzione parte dalla cartella dello
    script e non dalla CWD.
13. **`shots` rilancia il browser a ogni passata**, ed è voluto.
14. **`shots` accetta `--only=` SOLO se passato a `node`**, mai a `npm`:
    `node scripts/shots.mjs --simple --width=360 --only=admin-proposta-dettaglio`.
15. **Il dev server «spento» può non esserlo**: `TaskStop` uccide il wrapper npm,
    non `next dev`. Pretendi le porte libere.
16. **Il dev server può morire da solo** durante un giro lungo.
17. **Riseminare invalida le sessioni aperte nel browser**: dopo `npm run db:seed`
    il cookie di prima porta al login. Rifai l'accesso, non cercare un bug.
18. **`perl -0pi -e` con escape `\x{…}` DISTRUGGE la codifica dell'intero file.**
    Usa lo strumento di modifica, o caratteri letterali, o `-CSD`. Dopo qualunque
    passaggio di `perl` o `python` su un `.md`: `grep -c 'Ã\|Â' <file>`.
    ⚠️ Vale anche per PowerShell: inserire righe in un file con
    `InsertRange`/`ReadAllLines` può appiattirle su una sola riga. Verifica
    sempre rileggendo.
19. **Le pipe con `tail` BUFFERIZZANO** e nascondono i fallimenti. ⚠️ E se metti
    `| tail -30` su un comando in background, **il file di uscita contiene solo
    quelle 30 righe**: redirigi su un file e leggilo, non incanalare.
20. **I comandi in background non ereditano la CWD**: `cd` esplicito dentro ogni
    comando in background.
21. **Uno script `.mjs` in scratchpad non risolve `@playwright/test`**: usa
    `createRequire` puntato al `package.json` del progetto.
22. **Chromium può smettere di partire del tutto** («Invalid file descriptor to
    ICU data received»). Si ripara con `npx playwright install chromium --force`.
    ⚠️ **Il binario risponde a `--version` anche in quello stato.**

## Problemi noti — prodotto

23. **FLAKE da compilazione a freddo.** Il segno: **sono tutti timeout**. Mai
    cercarlo nel diff; la suite si rilancia INTERA. ⚠️ Vale anche per `rotte`:
    il 2026-08-08 la prima passata dopo una modifica ha dato **1 rossa** e le
    due successive 0.
24. **Il tetto di 40 accessi per IP** (`loginAction`) non si azzera al successo.
    `login()` riusa la sessione; se aggiungi test che accedono davvero, ricontrolla.
25. **Il cancello dei bersagli non copre gli stati che il seed non produce.**
    I `<details>` sì (`posata()` li apre).
26. **`prisma migrate reset` è bloccato** agli agenti. Riseminare: `npm run db:seed`.
27. **La campagna demo si arma dal ~3–4 del mese**; il pop-up è armato sempre.
28. **Il beacon della campagna brucia la finestra**: la home REGISTRA la
    sollecitazione al montaggio. **Dopo ogni giro di shots o di sonde che
    accedono come `cittadino@`, risemina.**
29. **I bucket del seed sono ancorati al calendario.**
30. **L'E2E «a zero valutazioni»** vive su `/valutazioni/trasporti`.
31. **`sicurezza`**: il volume delle segnalazioni MAI accanto alle stelle.
32. **Risposta al quadro**: una per servizio+periodo, niente correzione.
33. **`requireRedazione` vive FUORI dalla DAL**: spostarlo solo con ok esplicito.
34. **La segnalazione «lasciata pubblicata»** lascia traccia SOLO nel log di audit.
35. **B3 senza cron**: promemoria opportunistici sui beacon.
36. **L'opt-in del promemoria vale 1 ORA dal voto.**
37. **Il quadro seminato risponde sempre al mese-1.**
38. **LO SPAZIO JSX MANGIATO**: al confine `{espressione}`+testo lo spazio si
    scrive `{" "}`. Verifica sul DOM: `/\d[a-zà-ù]/`.
39. **Il DOM del dev server tiene una SECONDA COPIA nascosta e `inert`.** Un
    conteggio di nodi senza filtro di visibilità conta doppio.
40. **Le E2E sul timbro sono version-agnostic**: il pin vive SOLO in
    `metodologia.test.ts`.
41. **Le misure responsive dal pannello del browser non sono affidabili.**
42. **Motion mette `tabindex="0"`** su qualunque elemento con `whileTap`.
43. **Un `NavItem` non attraversa il confine RSC**: contiene `icon`, che è un
    **componente**. Passa il ruolo, una stringa. Typecheck e lint restano verdi.
44. 🆕 **Solo 5 uffici e 14 segnalazioni aperte**: metà delle celle di categoria
    e quartiere sta sotto il campione minimo. Qualunque analitica nuova per quei
    due assi nasce per metà muta.

## Regole che valgono per qualunque cosa costruisca

- Un dato inventato su una PERSONA REALE non è un dato dimostrativo. **E una
  delibera inventata è peggio: attribuisce una decisione alla giunta.**
- Ogni cifra ancorata a un atto è `{ affermazione, urlFonte, dataConsultazione }`
  e il renderer RIFIUTA chi non ha fonte.
- **Il conteggio è un fatto, la sintesi è un giudizio.**
- **Il contatore si chiede al database con `count`, mai contando le righe che la
  pagina mostra.** E quando lo aggiungi a una superficie che mostra un `take`,
  **il primo numero che esce è una diagnosi**, non una conferma.
- 🆕 **Gli argomenti di una Server Action sono input non fidato.** L'azione è un
  endpoint HTTP pubblico e la firma TypeScript non vale al confine di rete. Si
  guardano **prima** della query (`lib/token.ts`), mai dentro.
- 🆕 **Un consiglio che non si può seguire è peggio del silenzio.** Prima di
  mettere un suggerimento su una superficie, chiediti **quale controllo lo rende
  seguibile**. Se non c'è, va dove il controllo è, oppure non va.
- 🆕 **Le prove di un suggerimento sono le parole della persona**, non i token
  del codice.
- 🆕 **La preferenza di movimento si applica in CSS o nella durata, mai in un
  ramo del markup**: il server non ha media query.
- **Una coda una pagina · gli strumenti insieme · le letture sul cruscotto,
  finché ci stanno · il registro è una lettura anche lui** (`DESIGN.md` §6).
- **Una coda è una lista, e il lavoro è una pagina** (`DESIGN.md` §6).
- **Un dettaglio non interroga la propria coda**: si prende per id, senza filtro.
- Un'assenza non si decora; una cifra display per schermata; **niente scala a
  tacche senza un traguardo fissato** — vale anche per le barre: il massimo «il
  peggiore osservato» è una scala inventata; le stelle 1–5 sì.
- La firma «Redazione della Dashboard di Pistoia» SI IMPORTA da `lib/redazione.ts`.
- **Ogni rotta nuova in `rotte.mjs` E `shots.mjs` E `tests/e2e/pagine-cancello.ts`
  nello STESSO momento**, dichiarando il `ruolo:`, **e con l'atterraggio
  preteso**. Se l'indirizzo non è fisso, ci si arriva **cliccando**.
- **«La pagina risponde» e «si può arrivare alla pagina» sono due domande
  diverse.** Il secondo cancello è `porte.spec.ts`.
- Ogni modifica alle regole editoriali passa da `lib/metodologia.ts`.
- Le preposizioni italiane non si derivano (`Servizio.materia`).
- **Se aggiungi un colore, misura la coppia colore/`-soft`.** ⚠️ E il rosso
  dello stemma su testo minuto vuole **`--red-ink`**, non `--red`: su 14px fa
  4,3:1 contro il 4,5 di AA, e il cancello axe lo prende.
- **Un componente reso in colonne di larghezza diversa usa `@container`**, non
  `sm:`/`lg:`.
- **La classe di dimensione va sull'elemento che porta il testo.**
- **Ogni bersaglio ≥ 44px.** `min-h-11`, `size-11`, `h-11` sull'elemento.
- **Il `:hover` non è un canale, è un rinforzo.**
- **Quando una libreria di animazione tocca un elemento, chiediti quali
  attributi ci mette lei.**
- **Un vincolo che si può scrivere nel TIPO smette di essere una convenzione da
  ricordare** (`SuperficieAdmin`).
- 🆕 **Una soglia condivisa si IMPORTA, non si riscrive**:
  `CAMPIONE_MINIMO_PER_GIUDIZIO` sta in `citystats.ts` e chi la usa la prende da
  lì, con un test che lo verifica.

**PROTETTI, non toccare senza chiedere:** «Cosa vuoi fare?», modalità semplice,
token e catena del tema, autenticazione (incluso `src/proxy.ts` e la DAL),
stemma, barra in alto (incluse `AppShell` e `TopBarAnonima`), `ChiPubblica`,
`lib/costo-amministrazione.ts`, `lib/giunta.ts`, `lib/valutazioni.ts`,
`lib/email.ts`, `lib/redazione.ts`, `src/lib/auth/redazione.ts`,
`lib/sollecitazioni.ts`, `lib/metodologia.ts`, `lib/pagella.ts` — coi loro test.

**METODO con Lorenzo** (confermato ~venti volte): porta la FORMA su mockup
**MOSTRATI IN CONTESTO** — e il modo migliore è **iniettarli sull'applicazione
vera** e fotografarli. Opzioni **SEPARABILI**, chiudi con `AskUserQuestion`,
**una domanda per volta**, la raccomandata per prima con l'argomento onesto.
**Lorenzo COMPONE**: risponde «1 e 2» o rifiuta l'asse della domanda.
**L'eccezione:** quando due opzioni stanno in rapporto di contenimento, **dillo
nel testo dell'opzione**.
**Non offrire «rimandiamo» come raccomandata**: ciò che resta si scrive **con la
condizione che lo chiude**, e la condizione migliore è un *fatto verificabile*.
**E prima di decidere, MISURA.**
🆕 **E misura col browser, non citando un documento.** Il 2026-08-09 ho
raccomandato la forma più piccola delle analytics perché «sfondava il tetto di
1.894px» — numero preso da un consuntivo invece che dal browser. Il tetto vero
era **3.327px**, e Lorenzo ha scelto la forma grande contro la raccomandazione,
avendo ragione.

**COMMIT: solo a nome di Lorenzo Cianferoni. Niente `Co-Authored-By: Claude`.**

**STRUMENTI:** `python scripts/pdftext.py` (`--griglia` per tabelle); Normattiva
via curl con cookie jar, testo VIGENTE; **le SPA si leggono dal JavaScript che
carica i dati**; le mail di sviluppo in `.email/`; risemina `npm run db:seed`;
account demo `cittadino@` e `lorenzo@`, `marco@` (in silenzio), `comune@`
(admin), `moderatore@`; credenziali nel riquadro del login.
Deploy: `sh "C:\Users\loren\.homelab\cf.sh"` (AGENTS §8), `ssh homeserver`.

**VERIFICA (AGENTS §5):** typecheck, lint, vitest (**274**), `npm run rotte` a
dev acceso («0 con problemi», **66**, TRE passate), `npm run test:e2e` a dev
SPENTO (mai `E2E_BASE_URL`; **122/122**), e
`node scripts/shots.mjs --simple --width=360` (le opzioni a `node`, MAI a `npm`).
⚠️ **Dopo gli E2E, cancella `.next` prima di rilanciare dev/`rotte`/`shots`.**
⚠️ **E non modificare il codice mentre la suite gira — nemmeno un commento.**
Cancelli singoli: `npm run a11y`, `npm run bersagli`.
**Dopo un deploy: `npm run produzione`.**
IntersectionObserver/rAF/ScrollTimeline solo con shots. `graphify update .` dopo
le modifiche. Aggiorna FEATURES/CHANGELOG/ROADMAP/DESIGN/DOCUMENTATION §10
**mentre** lavori.
**Non fare commit o push se non te lo chiedo. E NON lanciare il deploy senza
chiedere.**

Comincia dal **Lavoro 1 — la pipeline degli atti**, e la prima cosa da fare è
rileggere `docs/fonti-pagella.md` §1: la mappa del portale c'è già, e senza di
essa ricominceresti a cercare cliccando.
