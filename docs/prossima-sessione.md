# Prompt per la sessione successiva

> Scritta il **2026-08-09**, riscritta da capo — non è un aggiornamento della
> precedente. È la consegna completa: lavori, debiti con le loro condizioni,
> problemi noti d'ambiente e di prodotto, regole e metodo.
>
> **Fidati di questa, non di quello che ricordi.**

---

## Il prompt da incollare

```
Pistoia Dashboard. Riprendiamo dall'Ondata 8.

LEGGI PRIMA, in quest'ordine:
- docs/prossima-sessione.md — è questa: la consegna completa.
- AGENTS.md — vincolante. §3 ha quarantasei trappole già pagate; §5 dice cosa
  significa "fatto"; §8 contiene il disco pieno del server.
- DESIGN.md — vincolante prima di qualunque lavoro visivo.
- docs/fonti-atti.md — la mappa del portale degli atti, che serve al primo
  lavoro e a tutto ciò che tocca l'archivio.

COMINCIA DA: i due buchi del tema civico degli atti. 970 atti di sociale/casa
e 373 di urbanistica restano senza tema perché CIVIC_TOPICS non ha né
«sociale» né «urbanistica». NON è una decisione tecnica: aggiungere un tema
cambia il selettore che vede il cittadino e il feed «Per te». Misura prima,
poi portami le opzioni.

STATO: main pushato, CI verde. 310 unit · 66 rotte, 0 problemi · 165/165 E2E ·
shots 0 in entrambi i regimi. Versione 0.46.0. Dev spento, porte libere,
albero pulito. 26.591 atti veri in dev.db.

COME LAVORIAMO:
- La forma si porta su MOCKUP INIETTATI SULL'APPLICAZIONE VERA e fotografati,
  mai su una domanda astratta. Opzioni separabili, una domanda per volta, la
  raccomandata per prima con l'argomento onesto.
- E PRIMA DI DECIDERE, MISURA — col browser, non citando un numero da un
  documento.
- Non fare commit o push se non te lo chiedo. E NON lanciare il deploy senza
  chiedere.
- Commit solo a nome di Lorenzo Cianferoni, niente Co-Authored-By.

DUE COSE CHE ASPETTANO ME, NON TE:
- APP_ORIGIN non è impostata su Coolify. È l'unica cosa di sicurezza rimasta
  aperta.
- La produzione è indietro di quindici commit (misura con
  `git rev-list --count 67a94fb..main`). Ogni deploy costa 2,82GB su un disco
  da 40: `ssh homeserver "df -h /"` prima.
```

---

## Stato al 2026-08-09

| | |
|---|---|
| Versione | **0.46.0** |
| Branch | `main`, pushato, **CI verde** |
| Unit | **310** |
| Rotte | **66**, 0 con problemi |
| E2E | **165/165** |
| `shots` | 0 in entrambi i regimi (normale e semplice a 360) |
| Ambiente | dev spento, porte 3000/3939 libere, albero pulito |
| Archivio atti | **26.591 atti veri** in `dev.db` (vuoto in `e2e.db`, per disegno) |
| Produzione | **indietro di 15 commit** |

---

## Che cosa è stato fatto il 2026-08-09

Tre commit, in tre versioni.

### 0.44.0 — La pipeline degli atti (Ondata 8)

Era la metà rischiosa di «Delibere», e il rischio non stava nel disegno ma nel
sapere **se quel portale si lascia leggere**. Si lascia leggere, e dà molto più
del previsto.

**Il passaggio di consegne indicava 188 atti in due griglie. Erano selezioni per
obbligo di trasparenza, contenute per il 97% nell'archivio vero.** Sotto
«Pubblicità Legale» ci sono **Storico atti (26.588)** e **Albo pretorio (202)**.
Atti distinti: **26.591**, dal 2021, ~4.800 l'anno, 374 negli ultimi 30 giorni.

La ricognizione completa è in [`docs/fonti-atti.md`](fonti-atti.md). Le quattro
trappole misurate sono in `AGENTS.md` §3, e la più costosa merita di stare anche
qui:

> **`Url atto` è pieno e distinto al 100% su tutte le 26.978 righe — ed è la
> chiave che chiunque sceglierebbe. Identifica la PUBBLICAZIONE, non l'atto**:
> lo stesso atto sta su albo e storico con **due id consecutivi**. Sarebbero
> stati 385 doppioni, cioè la stessa delibera mostrata due volte.

Costruito: modello `Atto` + `LetturaAtti`, `lib/atti.ts` (chiavi, tipi, CSV,
tema civico), `scripts/atti.ts` (la lettura), `scripts/atti-freschezza.ts` (il
cancello), `MonitorAttiCard` sul cruscotto (forma C, scelta sui mockup),
30 test unitari col fermo dei 102 uffici.

### 0.45.0 — Il cancello che legge la console

La falla che i sei errori di `/bilancio` avevano mostrato: **nessun cancello
guardava la console**, e quegli errori stavano scritti **quattro volte nel log
di E2E verdi**. Vive in `rotte.mjs`: `pageerror` + `console.error`, avvisi e
informazioni esclusi, `prefers-reduced-motion: reduce` su tutte e tre le
passate.

### 0.46.0 — Nessun controllo esce dal proprio contenitore

L'ultima categoria che «si trovava solo guardando». `contenimento.spec.ts`,
21 pagine × 2 viewport. La distinzione che lo rende usabile: **un contenitore
che scorre non ritaglia niente** — *fuori vista* e *fuori portata* non sono la
stessa cosa.

**Entrambi i cancelli sono stati provati ROSSI prima di essere dichiarati
verdi**, perché alla prima accensione erano verdi tutti e due e un cancello che
non ha mai visto un rosso non è provato.

---

## IL LAVORO

### 1. I due buchi del tema civico degli atti ⬅️ **si comincia da qui**

**Misurato, non stimato:** 18.515 atti su 26.978 (69%) hanno un tema civico. Dei
restanti, la gran parte è **amministrazione interna** (personale 1.612, bilancio,
affari legali, tributi, contratti, demografici) e per quelli «nessun tema» è la
risposta giusta. Ma due gruppi sono buchi veri:

| Buco | Atti | Uffici |
|---|---:|---|
| **Sociale e casa** | **970** | `U.O. Servizi per l'abitare` (566), `U.O. Progettazione Sociale…` (211), `U.O. Promozione dell'integrazione e Pari Opportunità` (193) |
| **Urbanistica ed edilizia privata** | **373** | `Servizio Urbanistica e Assetto del Territorio` (268), `U.O.C. Urbanistica` (29), `Regolamento Urbanistico` (45), `Paesaggistica e Città Storica` (14), `U.O.C. Edilizia Privata` (17) |

`CIVIC_TOPICS` (`src/lib/civic-topics.ts`) ha dodici temi e **non ha né
«sociale» né «urbanistica»**. Il più vicino al primo è `giovani`, e mettere le
politiche della casa sotto *Giovani* sarebbe visibilmente falso; un permesso di
costruire non è un'opera pubblica, quindi non entra in `lavori`.

⚠️ **Non è una decisione tecnica.** `CIVIC_TOPICS` pilota il **selettore dei
temi che il cittadino sceglie**, il feed «Per te» e le notifiche: aggiungere un
tema cambia una superficie pubblica. Quindi:

1. **Misura prima**: quanti contenuti *esistenti* (segnalazioni, proposte,
   eventi, opere) finirebbero nei temi nuovi? Un tema civico che esiste solo per
   gli atti è un tema che al cittadino non serve. `CivicTopic` ha
   `reportCats`/`proposalCats`/`eventCats`/`operaCats` proprio per questo.
2. **Porta le opzioni**, non la soluzione: aggiungere due temi, aggiungerne uno
   solo, o lasciare gli atti senza tema e dichiararlo in pagina.
3. Se si aggiungono, le regole stanno in `REGOLE_UFFICIO` (`src/lib/atti.ts`) e
   **il test dei 102 uffici va aggiornato** — è un fermo, non una verifica: se
   diventa rosso su un ufficio che non intendevi toccare, hai spostato altro.

### 2. 🔴 La pipeline non gira da sola, e in produzione non è mai girata

**È il debito più grosso lasciato aperto, e non è una svista: è che non è stato
deciso come.** `npm run atti` si lancia **a mano**. Ne discende:

- in **produzione l'archivio è VUOTO** — il modello c'è, il monitor dice «Mai
  letto», ma nessuno ha mai lanciato la lettura là sopra;
- il **cancello di freschezza** (`npm run atti:freschezza`) misura una cosa che
  nessuno alimenta: oggi è verde perché la lettura l'ho lanciata io.

Le strade, in ordine di costo: un **cron sul server** (`ssh homeserver`, il
container ha già `tsx`); un **task schedulato** che lancia il comando; o
lasciarlo a mano e **dirlo nel monitor** invece di far sembrare l'archivio vivo.
⚠️ La lettura iniziale costa **161s e 13,4MB**; il giro quotidiano è l'albo,
**2 secondi**. Quindi il costo ricorrente è irrisorio: manca solo chi lo chiama.

### 3. Poi: le maturità del backlog di O8

Definite, fattibili, non chiedono di inventare niente: scorciatoie da tastiera
col pannello «?» (la command palette esiste dall'ondata 0), OG image dinamiche
(Next le fa nativamente), alto contrasto + font grande (catena del tema e
modalità semplice già in piedi — **senza** la lettura audio, che è un'altra
funzione).

### 4. Poi: Ondata 9 — il progetto si racconta

Le quattro superfici con cui il prodotto parla di sé, in `/progetto/*` a firma
della Redazione: roadmap pubblica, voto alle funzionalità, changelog, idee e
problemi. Il footer ha già la colonna «Il progetto» dove attaccarle.

---

## Debiti aperti, ognuno con la condizione che lo chiude

### Nuovi, dal 2026-08-09

1. 🆕 🔴 **La pipeline degli atti non ha uno scheduler** e in produzione non è
   mai girata. Vedi il Lavoro 2 qui sopra. **Condizione: si chiude quando
   qualcosa la chiama da sé, o quando il monitor dichiara che è a mano.**
2. 🆕 **L'importo degli atti NON esiste in questa fonte.** `Spesa prevista` vale
   `0,00` in **tutte** e 26.588 le righe, e la pagina del singolo atto non lo
   porta — la ROADMAP descriveva il modello `Atto` con «importo», e quel campo
   non è stato messo perché non si può riempire. **Condizione: si trova solo
   dentro il TESTO degli allegati (PDF/ODT), quindi entra il giorno in cui si
   deciderà di leggerli — e vale `AGENTS.md` §4: se un importo non si riesce ad
   ancorare alla propria riga, non si pubblica.**
3. 🆕 **Il legame atti ↔ quartiere è misurato ma non costruito**: 888 atti
   nominano un quartiere vero (Bottegone 442). **Condizione: si costruisce
   davanti alle pagine di Ondata 11, con la resa «atti che nominano», mai «atti
   su» — anticiparlo significa deciderne la forma senza la pagina che lo
   mostra.**
4. 🆕 **I legami atti ↔ opera e atti ↔ bilancio sarebbero DISONESTI oggi.** Atti
   reali agganciati a opere dimostrative è il divieto fondante al contrario.
   **Condizione: quando opere e bilancio saranno dati veri.**
5. 🆕 **`Classifica` esiste solo sulla pagina del singolo atto**, non nel CSV:
   costerebbe 26.591 aperture. Non serve (è un titolario di protocollo con un
   raccoglitore di scarto), ma se un giorno servisse, il costo è quello.
6. 🆕 **La cartella `test-results/` di Playwright resta sporca dopo un
   fallimento.** Contiene trace e snapshot dell'ultimo rosso. Non è tracciata da
   git; si svuota da sé al giro dopo.

### Che venivano da prima, e sono ancora aperti

7. **L'immagine Docker pesa 2,82GB** perché le devDependencies restano
   installate. Un build **multi-stage** le toglierebbe. **Condizione: quando
   `df -h /` tornerà sopra l'80% nonostante la potatura.**
8. **Rimettere `upgrade-insecure-requests` nella CSP.** Verifica:
   `curl -sI https://<dominio>/` → 200 con certificato valido.
9. **Rimettere `'strict-dynamic'` in sviluppo** quando Next rimetterà il nonce.
   Verifica: `curl -s localhost:3000/metodologia | grep '<script' | grep -vc nonce=`
   deve dare **0**. Punto: `src/proxy.ts`, `buildCsp()`, ramo `isDev`.
10. **`@lhci/cli` pinnato a `0.15.1` in due posti** (`package.json` e
    `.github/workflows/ci.yml`): si aggiornano insieme.
11. **Le soglie Lighthouse stanno cinque punti sotto il minimo osservato.** Se i
    numeri salgono, la leva è **alzarle**, mai toglierle.
12. **Il cancello della produzione SCRIVE nel database dimostrativo**: accede
    come `cittadino@` e atterra su `/la-mia-citta`, dove `CampagnaHome` registra
    la sollecitazione al montaggio. **Condizione: il giorno in cui quella base
    dati smetterà di essere dimostrativa, il cancello vuole un conto suo.**
13. **`getRecensioniRecenti()` è codice morto** (`src/lib/data/valutazioni.ts`,
    ~riga 328). **Condizione: si rimuove, a meno che una superficie pubblica
    prevista non chieda «le ultime N recensioni» — e in quel caso si scrive
    QUALE nel commento.**
14. **`/admin/cittadini` non è passata a lista + dettaglio.** Fuori per disegno:
    contatore **3**, e le sue due code sono azioni singole. **Condizione: quando
    una delle due supera le ~10 voci.**
15. **Tre schermate stantie in `screenshots/wave-semplice/`**:
    `pagella-a-fascia`, `pagella-b-cartiglio`, `pagella-c-filo`, mockup di una
    sessione passata che `shots` non rigenera più. **Condizione: si cancellano
    al primo giro di revisione visiva della pagella.**
16. 🔴 **`APP_ORIGIN` non è impostata in produzione**, quindi i link delle mail
    si costruiscono dagli header — `X-Forwarded-Host`, che scrive chi chiama.
    Chi votasse con l'indirizzo di un'altra persona e un host forgiato le
    farebbe arrivare una **mail vera** col link di conferma al proprio server, e
    quel link porta il token che conferma o cancella la valutazione. La leva è
    già in codice (`src/lib/env.ts`, `.env.example`), **manca solo il valore**.
    **Condizione: impostarla su Coolify. Verifica: lasciare una valutazione
    mandando a mano un `X-Forwarded-Host` inventato, e controllare che il link
    nella mail punti comunque al dominio vero.**
17. **`MAX_PHOTO_CHARS` (1.500.000) sta sopra `bodySizeLimit` ("1mb").** Una
    foto fra i due valori viene respinta da Next con il proprio errore prima che
    l'azione dia il messaggio cortese che ha già scritto. Non è un buco —
    fallisce dal lato sicuro. **Condizione: si allineano quando qualcuno
    incontra l'errore generico, e la leva è abbassare `MAX_PHOTO_CHARS`.**
18. **`unstable_cache` è dichiarato sostituito da `use cache`** dal doc della
    versione installata. Quattro usi, tutti in `src/lib/cache.ts`, e funzionano
    — ma la migrazione vuole **Cache Components**. **Condizione: quando
    `use cache` uscirà dall'opt-in, o quando servirà una cache che
    `unstable_cache` non sa fare.**
19. **Il duplicato per somiglianza del TESTO è fuori, e non per pigrizia.**
    Misurato: **zero veri positivi** sul corpus del seed, e in cima un falso
    positivo pericoloso — due lampioni in due strade diverse — su un'azione che
    fonde davvero. Le segnalazioni comunali sono **formulari**, quindi il testo
    si somiglia **proprio quando il luogo cambia**. **Condizione: si riapre solo
    su una serie che contenga duplicati veri.**
20. **Lo spam è fuori: il seed non ne contiene.** **Condizione: quando ci sarà
    spam vero su cui tarare.**
21. **L'alert su trend anomalo è fuori.** I bucket del seed sono ancorati al
    calendario: tararlo lì significa tararlo sulla semina. **Condizione: una
    serie che non sia il seed.**
22. **Il trend per quartiere è fuori dalle analytics.** Metà delle celle è sotto
    il campione minimo. **Condizione: quando i quartieri sotto soglia saranno
    meno di un terzo.**

---

## Decisioni di forma lasciate aperte

- **I due temi civici nuovi** (sociale, urbanistica): è il Lavoro 1, e la
  decisione è di prodotto, non tecnica.
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
  — nemmeno dal Comune. È così di fatto, non è stato deciso. Se un giorno il
  Comune dovesse poter riclassificare, è un atto verso il cittadino e va nel
  registro delle azioni.
- 🆕 **Che cosa mostra l'archivio pubblico degli atti** (Ondata 11). Le delibere
  sono il **10%**: determine 56%, ordinanze 29%. Un archivio presentato come «le
  decisioni del Comune» che per metà contiene determine di minuta
  amministrazione («VARIAZIONE PROFILO PROFESSIONALE DIPENDENTE MATR. 16877»)
  racconterebbe male sé stesso. **La lettura le prende tutte perché scartare
  all'ingresso è irreversibile; che cosa MOSTRARE si decide in O11.**
- **Sentiment civico** resta in parcheggio: *il conteggio è un fatto, la sintesi
  è un giudizio*.

---

## Problemi noti — ambiente (costano ore)

1. **🔴 IL DISCO DEL SERVER SI RIEMPIE, E BUTTA GIÙ COOLIFY.** Ogni deploy costa
   **2,82GB** su un disco da **40GB**, e Coolify non cancella l'immagine
   vecchia. Il 2026-08-07 il disco è arrivato al 100%, Postgres è andato in
   `PANIC`, e **ogni** endpoint dell'API ha risposto `Server Error` — `/deploy`
   compreso. **Prima di ogni deploy: `ssh homeserver "df -h /"`.** Si libera con
   `sudo -n docker builder prune -a -f` (9,39GB, ed è spazio buttato: Coolify
   costruisce con `--no-cache`). ⚠️ **Mai `docker image prune -a`**: sullo stesso
   server vivono Umami, Homepage e Uptime Kuma.
2. **Il piano di controllo può cadere e l'applicazione resta in piedi.** Se
   Coolify è `unhealthy`, il polling del deploy dà `Server Error` **senza mai
   passare da `finished`** mentre il deploy arriva in fondo lo stesso. La
   domanda giusta non si fa al deployer ma al **processo vivo** — e in pratica
   basta `npm run produzione`, che come controllo 0 chiede quale immagine sta
   eseguendo il container.
3. **Uccidere `npm run dev` non uccide `next dev`.** Il figlio resta in ascolto
   sulla 3000 e continua a ricostruire `.next` mentre gli E2E la cancellano:
   **5 test caduti in specifiche scorrelate**, tutti **timeout**. Prima di
   `npm run test:e2e`:
   `Get-NetTCPConnection -State Listen -LocalPort 3000,3939 -ErrorAction SilentlyContinue`
4. **`.next` stantio fa rispondere 404 a TUTTE le rotte annidate**, e sembra che
   qualcuno abbia cancellato metà applicazione. **Prima di cercare nel diff:
   cancella `.next` e rilancia.** `npm run test:e2e` lo fa da sé.
5. **Se Chromium smette di partire** («Invalid file descriptor to ICU data»):
   `npx playwright install chromium --force`, ~2 minuti.
6. **Le opzioni di `shots` vanno passate a `node`, non a `npm`**:
   `node scripts/shots.mjs --simple --width=360`. Con `npm run shots -- …` il
   sintomo è **muto** e si crede di aver verificato la viewport minima.
7. 🆕 **Il portale della trasparenza blocca sullo USER-AGENT.** Con quello di
   default di Playwright risponde **500** e una pagina «Web Page Blocked», che
   somiglia a un guasto del portale e non lo è. `scripts/atti.ts` manda già l'UA
   di un Chrome vero; qualunque sonda nuova deve fare lo stesso.
8. 🆕 **`prisma migrate dev` non rigenera sempre il client.** Visto due volte il
   2026-08-09: lo schema è applicato ma il client tipizzato è vecchio, e l'errore
   («Argument `dataAtto` must not be null») descrive il modello di prima. Se una
   query non torna con lo schema, **`npx prisma generate` prima di indagare**.
9. 🆕 **Node su Windows risolve `/tmp` come `C:\tmp`**, mentre la shell lo manda
   in `%TEMP%`. Uno script che scrive in `/tmp` da bash e lo rilegge da Node non
   trova niente. Usa la cartella di scratch con percorso assoluto.
10. 🆕 **Le here-string di PowerShell (`@'…'@`) non valgono in bash.** Per un
    messaggio di commit multilinea da bash si usa un heredoc con `git commit -F -`.

---

## Problemi noti — prodotto

1. 🆕 **`locator.evaluateAll()` non aspetta**, e su una lista vuota restituisce
   `[]` in silenzio — tutti gli altri metodi di Playwright aspettano, quindi la
   memoria di come funziona la libreria inganna. Ha fatto dichiarare a
   `porte.spec.ts` «il cruscotto non offre nessuna porta» su una pagina che le
   aveva tutte. **Il segno che lo smaschera, ed è generale: lo snapshot che
   Playwright salva DOPO il fallimento (`test-results/…/error-context.md`)
   mostrava la navigazione al completo.** Quando la pagina fotografata contiene
   proprio ciò che il test dice di non aver trovato, la diagnosi è «non era
   ancora arrivato», non «manca». Quel file si legge **prima** di cercare nel
   codice.
2. **Un cancello copre le regole che gli hai chiesto, non la promessa che hai
   scritto in un documento.** Quando `DESIGN.md` dichiara un vincolo, chiediti da
   quale riga di quale script verrebbe misurato — se la risposta è «nessuna»,
   quel vincolo si verifica a mano o non si verifica.
3. **Il `:hover` non è un canale, è un rinforzo.** Tutto ciò che dice «questo si
   può premere» deve esserci **a riposo**: su un telefono il passaggio del mouse
   non avviene mai.
4. **Un componente che vive in colonne di larghezza diversa non può usare `sm:`
   e `lg:`**, che guardano la finestra e non lo spazio che ha davvero. La leva è
   `@container`.
5. **Le prove di un suggerimento sono le parole della persona, non i token del
   codice.** E **prima di mettere un suggerimento su una superficie, chiediti
   quale controllo lo rende seguibile**: se non c'è, il suggerimento va dove il
   controllo è, oppure non va.
6. **`undefined` in un `where` di Prisma non è «nessuna riga»: è «nessun
   filtro».** Gli argomenti di una Server Action si guardano **prima** della
   query.
7. **La preferenza di movimento non si legge in fase di render.** Qualunque ramo
   del **markup** su `useReducedMotion()` serve un HTML diverso da quello
   idratato. Le due leve sicure sono **la durata** e **il CSS**.
8. 🆕 **Il monitor degli atti mostra «Mai letto» negli E2E, ed è giusto.**
   `e2e.db` nasce dal seed e il seed **non** riempie `Atto`: una delibera
   inventata attribuirebbe alla giunta una decisione che non ha preso. Se vedi
   quello stato in un test, non è un guasto.

---

## Regole che valgono per qualunque cosa costruisca

- **Prima di decidere, MISURA — col browser, non citando un numero da un
  documento.** Il 2026-08-09 una raccomandazione è stata sbagliata proprio così
  (1.894px citati a memoria contro i 3.327 veri), e lo stesso giorno una
  consegna ha descritto 188 atti dove ce n'erano 26.591.
- **La forma si porta su mockup INIETTATI sull'applicazione vera e
  fotografati**, mai su una domanda astratta. ⚠️ Tailwind v4 compila solo le
  classi che trova nel **sorgente**: nei mockup iniettati tutto ciò che non è
  già nel repository si scrive **in linea**.
- **Un cancello deve distinguere «verificato e a posto» da «non verificato».**
  Se le due cose escono con lo stesso codice, non è un cancello. E **un cancello
  che non ha mai visto un rosso non è provato**: si rompe di proposito, si
  guarda che diventi rosso, si rimette a posto.
- **Due definizioni dello stesso indicatore sono peggio di nessun indicatore.**
  Una soglia condivisa si **importa**, non si riscrive.
- **Il conteggio è un fatto, la sintesi è un giudizio.** E un contatore si chiede
  al database, mai contando le righe che la pagina mostra.
- **Nel dubbio, nessuna risposta.** Un atto senza tema è un fatto; un atto col
  tema sbagliato è un'affermazione falsa su una decisione del Comune.
- **Quando una superficie entra per la prima volta in un cancello, i rossi
  possono essere suoi di nascita**, non della modifica che ce l'ha portata.
- **Riporta con onestà.** Se un test fallisce, dillo con l'output. Se hai saltato
  una parte, dillo e spiega perché.
