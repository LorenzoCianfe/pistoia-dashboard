# Prompt per la sessione successiva

> Aggiornata il **2026-08-12**, a valle della discussione di prodotto
> dell'11-12/08. È la consegna completa: lavori, debiti con le loro
> condizioni, problemi noti d'ambiente e di prodotto, regole e metodo.
>
> **Fidati di questa, non di quello che ricordi.**

---

## Il prompt da incollare

```
Pistoia.app (già «Pistoia Dashboard»). Riprendiamo dopo la SVOLTA DI PRODOTTO
dell'11-12/08: da demo del Comune a piattaforma civica indipendente.

LEGGI PRIMA, in quest'ordine:
- docs/prossima-sessione.md — è questa: la consegna completa.
- docs/direzione-prodotto.md — 🔴 LA CARTA DEL PRODOTTO, vincolante. Sedici
  sezioni decise con Lorenzo a giri di domande: visione e nome (Pistoia.app),
  prima pagina, perimetro v1, motore e telemetria, economia, persone,
  relazione col Comune, identità in piazza, gusto e processo del design
  (§1.1–1.16), più il CONTO DEL LANCIO (§2) e il piano (§3). Nessuna scelta
  di prodotto si prende senza averla letta.
- AGENTS.md — vincolante. §3 ha 51 trappole già pagate; §5 dice cosa
  significa «fatto»; §8 il server, il disco, il deploy.
- DESIGN.md — vincolante per i VINCOLI (contrasti, 44px, contenimento,
  motion), MA ⚠️ §1 dice ancora «è il Comune che parla»: si riscrive durante
  il battesimo, non prima e non in silenzio.
- docs/pipeline-atti-schedulata.md e docs/fonti-atti.md — per tutto ciò che
  tocca gli atti.

COMINCIA DA, in quest'ordine:

1. ALLINEA ROADMAP.md alla direzione (direzione-prodotto §3): O10 = battesimo
   di Pistoia.app e viene SUBITO; O11-archivio entra nel perimetro del
   lancio; O9 si trasforma («chi siamo» e changelog al lancio; roadmap
   pubblica e voto dopo, quando c'è un pubblico); le tre maturità ex-O8
   (scorciatoie «?», OG image, alto contrasto) si spostano DENTRO/DOPO il
   battesimo — deciso da Lorenzo il 12/08: le OG image col marchio vecchio
   sarebbero da fare due volte.

2. APRI O10 — IL BATTESIMO, col processo deciso (Lorenzo GIUDICE A OGNI
   TAPPA):
   a. La RICOGNIZIONE VISIVA (direzione-prodotto §1.10): riferimenti
      professionali raccolti col browser (Dribbble/Behance; Pinterest ha
      muri di login), pattern estratti e documentati in un doc stile
      fonti-atti. Il filtro del gusto è DICHIARATO da Lorenzo: minimal di
      lusso + glassmorphism + tech — scuola Apple, non Linear (chiaro
      canonico che accoglie; lo scuro può essere il momento «Linear»).
      Requisito NON NEGOZIABILE: mai una UI da template. Onestà scritta:
      il gusto spontaneo dell'esecutore converge al canonico — la
      ricognizione e l'occhio di Lorenzo sono il contrappeso strutturale.
   b. 2–3 DIREZIONI ESTETICHE montate su pagine vere e fotografate; Lorenzo
      sceglie e si itera.
   c. Dentro il vestito scelto, in quest'ordine di dipendenza: il REBRANDING
      (marchio «Pistoia.app» con «.app» nel rosso della città + segno;
      censimento e sostituzione di «Comune di Pistoia»/«Dashboard di
      Pistoia» hardcoded in testate, footer, metadata, manifest, email,
      README; via lo stemma come identità — resta dove si PARLA del Comune);
      la PRIMA PAGINA pubblica su `/` (fatto del giorno dagli atti +
      numero-monumento + didascalie della redazione — oggi quella rotta non
      è una prima pagina); il RIORDINO delle sezioni (lettura prima, sezione
      «Il Comune» raccontata da fuori); il LOGO (decide la ricognizione);
      i BADGE di ruolo verificati (tanti, colorati, animati — istituzionali
      sobri); la PAGINA ATTO pubblica (doppio titolo onesto + contesto).

I LAVORI DOPO IL BATTESIMO (ordine da decidere con Lorenzo):
- Il CONTO DEL LANCIO, voce per voce (direzione-prodotto §2): PWA
  installabile + notifiche push (due canali, interruttori separati);
  telemetria DICHIARATA (pagina «che cosa misuriamo», Umami c'è già +
  eventi per-utente con opt-in); seed partecipativo FUORI dal percorso
  pubblico (mai cittadini finti in produzione); «chi siamo»; privacy/GDPR
  veri; moderazione con presidio; «Domande alla città» (trasformazione del
  question time: il contatore dell'attesa è la pressione); pseudonimo
  attivabile nelle impostazioni (default resta «Nome C.»); Vetrina delle
  attività con abbonamento (OrganizationProfile esiste già).
- Il BILANCIO SU DATI VERI: prima la RICOGNIZIONE delle fonti
  (BDAP/OpenBilanci) — la regola degli atti vale anche qui: si misura se la
  fonte si lascia leggere PRIMA di promettere.
- Le maturità ex-O8: scorciatoie col pannello «?», OG image (dopo il
  rebrand), alto contrasto + font grande.

PROBLEMI NOTI DA RISOLVERE (nessuno bloccante, tutti scritti):
- Gli E2E completi a macchina carica fanno cadere ~2 test per volta, sempre
  diversi, sempre per ATTESA, mai contenuti sbagliati. Il metodo per
  distinguere ambiente da regressione è in AGENTS §3 (2026-08-11): git
  stash + stessi test su HEAD + ripasso con la modifica. Non lanciare due
  cose pesanti insieme.
- `comando | tail` restituisce l'exit code di tail: un cancello rosso si
  legge verde. Redirigere su file e leggere $? (AGENTS §3).
- DESIGN.md §1 e il carattere «è il Comune che parla»: da riscrivere in O10
  (identità nuova, vetro alzato ad Apple-grade, rosso da dosare con prove).
- «Dashboard di Pistoia» e «Comune di Pistoia» sono hardcoded in molti punti:
  serve un censimento (grep) prima del rebranding, non sostituzioni alla
  cieca.
- prato.app è GIÀ registrato: il pattern multi-città si verifica città per
  città, quando servirà.
- e2e.db ha zero Atto per disegno: i test della futura prima pagina «fatto
  del giorno» dovranno seminare atti di prova propri (il seed non deve mai
  riempire Atto — regola esistente).
- Il rosso «quanto e dove» non è deciso: prove di palette dentro la
  ricognizione. Vincolo: resta anche il colore d'errore, la semantica non
  si confonde.

COSE CHE ASPETTANO LORENZO, NON TE:
- REGISTRARE pistoia.app (al 12/08 non risolve: quasi certamente libero).
- ACCENDERE IL SERVER (spento: ping sì, nessuna porta aperta). Poi, in
  ordine: attivare lo Scheduled Task della lettura atti
  (pipeline-atti-schedulata §2 — finché non c'è, l'archivio in produzione
  resta VUOTO e il monitor dice «Mai letto», che è la verità); impostare
  APP_ORIGIN su Coolify (unica cosa di sicurezza aperta); l'eventuale
  deploy — produzione indietro di DICIOTTO commit (misura con
  `git rev-list --count 67a94fb..main`), e PRIMA:
  `ssh homeserver "df -h /"` perché ogni deploy costa 2,82GB su 40.
- Il PARERE LEGALE sull'uso del toponimo nel nome, prima del lancio.
- Le LINEE ROSSE economiche complete: da scrivere PRIMA del primo sponsor.
- Dove affiggere i QR FISICI (valuta lui; la via senza sanzioni è la rete
  dei «luoghi amici»).

COME LAVORIAMO (invariato, più il processo O10):
- La forma su MOCKUP INIETTATI sull'applicazione vera e fotografati, mai su
  una domanda astratta. ⚠️ Nei mockup, classi non presenti nel sorgente =
  stili in linea (Tailwind non le compila).
- Opzioni SEPARABILI, una domanda per volta, la raccomandata per prima con
  l'argomento onesto — e Lorenzo spesso compone la quinta: dopo la risposta,
  dichiara cosa hai dedotto.
- PRIMA DI DECIDERE, MISURA — col browser e col database, non citando un
  numero da un documento.
- Un cancello che non ha mai visto un rosso non è provato: si rompe di
  proposito (è così che il 11/08 è emerso che paginaDiBlocco non
  riconosceva la pagina del WAF).
- «Fatto» = AGENTS §5: typecheck, lint, unit (317), rotte (66, 0 problemi),
  E2E, shots nei due regimi (le opzioni a node, MAI a npm).
- Non fare commit o push se Lorenzo non lo chiede. MAI il deploy senza
  chiedere. Commit a nome di Lorenzo Cianferoni, niente Co-Authored-By.
- Per O10: Lorenzo è giudice a ogni tappa.

STATO: main pushato con tutto il lavoro dell'11-12/08 (0.47.0 tema «Sociale
e casa» + 0.48.0 pipeline senza browser + la direzione di prodotto), albero
pulito. 317 unit · 66 rotte 0 problemi · 165 E2E (vedi nota flakiness) ·
shots 0 nei due regimi. 26.644 atti veri in dev.db (940 col tema «sociale»),
zero in e2e.db per disegno. Dev spento, porte libere. Versione 0.48.0.
```

---

## Stato al 2026-08-11

| | |
|---|---|
| Versione | **0.48.0** |
| Branch | `main`, **albero SPORCO**: il lavoro dell'11/08 non è committato |
| Unit | **317** (erano 310) |
| Rotte | **66**, 0 con problemi |
| E2E | **165 test, tutti verdi** — ma vedi la nota qui sotto |
| `shots` | 0 in entrambi i regimi (normale e semplice a 360) |
| Ambiente | dev spento, porte 3000/3939 libere |
| Archivio atti | **26.644 atti veri** in `dev.db` (vuoto in `e2e.db`, per disegno) |
| Produzione | **indietro di 16 commit**, e l'archivio là sopra è ancora VUOTO |
| Server | 🔴 **spento** |

⚠️ **Sugli E2E, detto con onestà.** Tutti e 165 passano, ma **la suite completa
in un colpo solo ne fa cadere circa due per volta quando la macchina è carica**
— sempre per *attesa* (timeout, `element is not stable`, `ERR_ABORTED`), mai
affermando un contenuto sbagliato, e con l'insieme dei caduti **diverso a ogni
esecuzione**. Rilanciati da soli passano tutti, in pochi secondi. Il metodo per
distinguerlo da una regressione vera sta in `AGENTS.md` §3 (2026-08-11): si
mette la modifica da parte con `git stash`, si rilanciano *gli stessi* test, e
se passano su HEAD pulito **e** ripassano con la modifica rimessa, era
l'ambiente. Fatto due volte l'11/08, con quell'esito.

---

## Che cosa è stato fatto il 2026-08-11

Due lavori, entrambi decisi **misurando prima**, e non committati.

### 0.47.0 — «Sociale e casa» entra nei temi civici, «Urbanistica» no

I due buchi del tema civico erano una decisione **di prodotto**: `CIVIC_TOPICS`
pilota il selettore del cittadino, il feed «Per te», le stanze della comunità e
il Question Time. La misura che ha deciso: **quanti contenuti esistenti** ogni
candidato coprirebbe.

- **`sociale` è entrato** (🏠, viola, categorie **condivise** con `giovani` e
  `accessibilita`, quindi nessun comportamento esistente cambia). Non esisteva
  solo per gli atti: tre agganci già nei selettori del cittadino, e **940 atti
  veri** riclassificati con un ricalcolo una tantum — esattamente 940 cambi,
  zero altrove. Copertura del tema civico: **72,3%** (era 68,8%).
- **`urbanistica` NON è entrato**: **zero agganci in tutte e quattro le
  tassonomie**, cioè una chip che non filtrerebbe mai niente e una stanza che
  nasce vuota. I 370 atti restano senza tema, che è un fatto. **Condizione che
  lo riapre: quando una tassonomia di contenuto avrà una categoria urbanistica,
  o quando la pagina dell'archivio (O11) mostrerà il bisogno del filtro.**

Il fermo dei 102 uffici dichiara ora **45 coperti** (erano 42).

### 0.48.0 — La pipeline degli atti gira da sola, e senza browser

Era il debito più grosso. La misura che ha ribaltato il piano: **in produzione
Playwright non c'era.** Il `Dockerfile` fa `npm ci`, che installa il pacchetto
ma **non i binari del browser** — quindi un cron dentro il container sarebbe
partito verso «Executable doesn't exist», e lo si sarebbe scoperto da un log
che nessuno guarda.

Il browser però non serviva: il WAF guarda lo **user-agent** e l'export vuole i
**cookie del portlet**, e `fetch` fa tutte e due. Misurato su tutte e quattro
le griglie (albo 2,6s · storico 13,47MB in 178s · le piccole ~1s), e il carico
da zero produce **la stessa identica distribuzione dei temi** del database
riempito col motore vecchio. L'alternativa costava **427MB per immagine**.

Tre cose che ne sono uscite, tutte trovate misurando o rompendo:

1. 🔴 **`paginaDiBlocco` non riconosceva la pagina di blocco vera** — guardava
   4.000 caratteri, le spie stanno a 38.709. La lettura archiviava «errore»
   dove il fatto era «bloccata». **Difetto preesistente**, non del motore
   nuovo; il test che lo copriva usava una pagina inventata e corta.
2. **Su un archivio vuoto il giro fa il carico completo, da sé** — leggere solo
   l'albo lascerebbe 220 atti su 26.644 col monitor che dice «Aggiornato». È lo
   stato della produzione, cioè dove il primo scatto sarebbe finito.
3. **Non si passa a WAL**, misurato: il carico iniziale tiene il database
   bloccato **1,23s in tutto** (mediana 21ms, massima 84ms) contro un
   `busy_timeout` di 5.000ms — margine 59×.

**Quello che manca è solo l'attivazione**, e vuole il server acceso: comando,
frequenza e ripiego stanno in [`docs/pipeline-atti-schedulata.md`](pipeline-atti-schedulata.md) §2.

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

> ✅ I due lavori che aprivano questa sezione — **i buchi del tema civico** e
> **la pipeline che non girava da sola** — sono stati fatti l'11/08. Il
> racconto sta più in alto; qui resta ciò che ne è avanzato.

### 0. Quello che resta della pipeline: **accendere il server e attivare il task**

Il codice c'è, misurato e provato rosso. Manca l'attivazione, che vuole il
server acceso ed è **tua**: comando, frequenza, fuso e ripiego stanno in
[`docs/pipeline-atti-schedulata.md`](pipeline-atti-schedulata.md) §2. Finché non
è attivo, **in produzione l'archivio resta vuoto** e il monitor dice «Mai
letto» — che è la verità, non un guasto.

### 1. Allineare ROADMAP.md, poi SUBITO O10 ⬅️ **si comincia da qui**

Deciso da Lorenzo il 12/08: prima il piano si riallinea alla direzione
(direzione-prodotto §3), poi si apre **il battesimo di Pistoia.app** con la
ricognizione visiva — il dettaglio operativo sta nel prompt qui sopra, punto 2.

### 2. Le maturità ex-O8, dentro/dopo il battesimo

Scorciatoie da tastiera col pannello «?» (la command palette esiste
dall'ondata 0), OG image dinamiche (Next le fa nativamente — **dopo il
rebrand**, o nascono col marchio vecchio), alto contrasto + font grande
(catena del tema e modalità semplice già in piedi — **senza** la lettura
audio, che è un'altra funzione).

⚠️ Per l'alto contrasto vale `DESIGN.md` §4: **se aggiungi un colore, misura la
coppia colore/`-soft`** — è lì che il contrasto è caduto la prima volta, e non
si vede guardando.

### 3. Poi: l'ex-Ondata 9, trasformata dalla direzione

«Chi siamo» e changelog diventano **parte del lancio** (fiducia); roadmap
pubblica e voto alle funzionalità arrivano quando c'è un pubblico che vota.
Il footer ha già la colonna «Il progetto» dove attaccarle.

---

## Debiti aperti, ognuno con la condizione che lo chiude

### Nuovi, dal 2026-08-11

0. 🆕 **Il tema «urbanistica» resta fuori**, con i 370 atti senza tema. Non è
   una svista ma il criterio applicato: zero agganci nelle quattro tassonomie
   di contenuto, cioè una chip che non filtra niente e una stanza vuota.
   **Condizione: quando una tassonomia di contenuto avrà una categoria
   urbanistica — per esempio un ambito proposta «Urbanistica» per le
   osservazioni ai piani — o quando la pagina dell'archivio (O11) mostrerà il
   bisogno del filtro davanti alla pagina vera.**
0b. 🆕 **La suite E2E completa è intermittente sotto carico**: ~2 test per
   volta cadono per attesa, diversi ogni esecuzione, e passano tutti se
   rilanciati da soli. Non è una regressione, ed è documentato in `AGENTS.md`
   §3 col metodo per distinguerlo. **Condizione: si chiude alzando i tempi
   d'attesa dei punti fragili uno per uno — il primo è già chiuso
   (`trasparenza.spec.ts`, `waitForURL` sul dettaglio della proposta) — oppure
   dichiarando che la suite si lancia a macchina scarica.**

### Nuovi, dal 2026-08-09

1. ✅ ~~**La pipeline degli atti non ha uno scheduler**~~ — **chiusa a metà
   l'11/08.** Il codice gira da solo, senza browser, e sa fare da sé il carico
   iniziale su un archivio vuoto. **Resta l'attivazione dello Scheduled Task su
   Coolify, che vuole il server acceso** (`docs/pipeline-atti-schedulata.md`
   §2): finché non c'è, in produzione l'archivio resta vuoto.
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

- ✅ ~~**I due temi civici nuovi** (sociale, urbanistica)~~ — **decisi l'11/08
  sui mockup iniettati**: «Sociale e casa» è entrato con categorie condivise,
  «urbanistica» no e con la condizione che lo riapre (debito 0).
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

0. 🆕 🔴 **IL SERVER È SPENTO** (11/08). Risponde al **ping** ma non ha
   **nessuna porta aperta** (22, 80, 443, 8000), e sulla macchina non c'è
   nessun processo VMware in esecuzione. ⚠️ Il ping che risponde inganna: non è
   una prova che la VM sia viva. Finché è spento non si possono misurare il
   disco, lo stato di Coolify, la produzione — né attivare lo Scheduled Task.
0b. 🆕 **`comando | tail` restituisce l'exit code di `tail`**, quindi un
   cancello rosso si legge verde: `npm run rotte 2>&1 | tail -12` è morto su un
   timeout e la notifica ha riportato **exit 0**. Si redirige su file e si
   legge `$?` prima del `tail`. Dettaglio in `AGENTS.md` §3.
0c. 🆕 **A macchina carica gli E2E cadono**, ~2 per volta e sempre diversi,
   tutti per attesa. Non lanciare due cose pesanti insieme: la suite completa
   costa ~22 minuti a macchina scarica e ~29 a macchina carica, quindi
   parallelizzare non fa nemmeno risparmiare tempo.

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
