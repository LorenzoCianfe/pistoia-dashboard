# Prompt per la sessione successiva

> Aggiornata il **2026-08-12 (sera)**, a chiusura della sessione che ha
> allineato il piano alla svolta di prodotto e fatto la ricognizione visiva
> di O10 — tre giri, giudicati da Lorenzo: **si montano D1 e D2**.
>
> **Fidati di questa, non di quello che ricordi.**

---

## Il prompt da incollare

```
Pistoia.app (già «Pistoia Dashboard»). O10 — IL BATTESIMO — è APERTA: la
ricognizione visiva è fatta e giudicata (12/08). Lorenzo ha deciso: SI
MONTANO LE DIREZIONI D1 E D2 SU PAGINE VERE. Questa sessione è la tappa b.

LEGGI PRIMA, in quest'ordine:
- docs/prossima-sessione.md — è questa: la consegna completa.
- docs/direzione-prodotto.md — 🔴 LA CARTA DEL PRODOTTO, vincolante (visione,
  nome Pistoia.app, prima pagina, perimetro v1, economia, §2 conto del
  lancio, §3 piano).
- docs/ricognizione-visiva.md — 🔴 IL LAVORO DELLA SCORSA SESSIONE, vincolante
  per O10: 21 pattern (P1–P21), le fonti coi link, le direzioni D1/D2/D3 in
  §6, il test dell'intruso (P21), l'avvertenza sul lime. Le 21 schermate dei
  riferimenti sono in refs-o10/ (fuori da git).
- AGENTS.md — vincolante. §3 ha 54 trappole già pagate (le ultime tre sono
  del browser, 2026-08-12); §5 dice cosa significa «fatto»; §8 server/deploy.
- DESIGN.md — vincolante per i VINCOLI, con TRE avvisi datati 12/08: §1 («è
  il Comune che parla») è SUPERATO e si riscrive dentro O10; §6 ha la
  QUESTIONE APERTA del vetro (il canone HIG dice «mai vetro sul contenuto»,
  il nostro sta sulle card — la sciolgono D1 vs D2); §4 ha l'avvertenza lime.
- ROADMAP.md, Ondata 10 — il processo del battesimo e l'ordine di dipendenza.
- docs/pipeline-atti-schedulata.md e docs/fonti-atti.md — se tocchi gli atti.

IL LAVORO DI QUESTA SESSIONE — montare D1 e D2 (Lorenzo GIUDICE):

Le due direzioni (ricognizione §6, da smontare e ricombinare — Lorenzo
spesso compone la quinta):
- D1 «La piazza di giorno»: grammatica Apple piena — contenuto su superfici
  PIENE calde, vetro solo sul telaio (testata, barre, palette, menu), luce
  ambientale sulla tela (P3), UN'isola scura per pagina (P4).
- D2 «Vetro di città»: il vetro resta sulle card ma sale di grado — due
  materiali dichiarati regular/clear (P9), payload SEMPRE su pieno (P2),
  profondità ambientale dietro (mesh/scena).
- D3 «Il terminale di notte» (tesi condivisa, non alternativa): lo scuro di
  entrambe — vetro scuro sopra la città, gradini di luminanza, UN accento
  caldo. Flighty è la pezza d'appoggio.

Su TRE pagine vere, fotografate nei due temi (e almeno la prima pagina anche
a 360 semplice):
1. la futura PRIMA PAGINA su `/` — fatto del giorno dagli atti (usa un atto
   VERO di dev.db per il mockup) + numero-monumento con la grammatica del
   tabellone (P12, Apple Sports) + didascalia della redazione DENTRO la card
   (P13) + tinta dal tema civico (P12);
2. una PAGINA ATTO pubblica — doppio titolo onesto (umano sopra in registro
   Il Post P18, oggetto ufficiale sempre visibile sotto) + contesto;
3. una pagina DI LAVORO (cruscotto admin o segnalazioni) — dove la densità
   mette alla prova la direzione.

METODO, non negoziabile:
- Mockup INIETTATI sull'applicazione vera e fotografati (mai tele astratte).
  ⚠️ Classi non presenti nel sorgente = stili in linea (Tailwind v4 non le
  compila). Dev server; per fotografare vedi AGENTS §3 (2026-08-12): il
  pannello Browser non composita senza schermo, si usa il DevTools MCP con
  filePath.
- TEST DELL'INTRUSO su ogni proposta (P21): «che cosa, qui, esiste SOLO
  perché questa è Pistoia?» — se potrebbe stare in un portfolio Shakuro
  senza farsi notare, è rossa.
- Il rosso: dentro le proposte prova le TRE DOSI (ricognizione §4): solo
  marchio+errore · +kicker editoriali (precedente FT) · +accenti diffusi.
  Vincolo fermo: resta il colore d'errore, la semantica non si confonde.
- Il lime resta COMPRIMARIO (mai identità: è l'accento di moda del mestiere,
  DESIGN §4).
- Le foto a Lorenzo, opzioni separabili, la raccomandata per prima con
  l'argomento onesto; dopo la risposta dichiara cosa hai dedotto.

DOPO LA SCELTA DI LORENZO (dentro il vestito scelto, ordine di dipendenza in
ROADMAP O10):
- il REBRANDING: censimento PRIMA (grep di «Comune di Pistoia» e «Dashboard
  di Pistoia»: testate, footer, metadata, manifest, email, README — mai
  sostituzioni alla cieca); marchio «Pistoia.app» con «.app» nel rosso; via
  lo stemma come identità (resta dove si PARLA del Comune);
- la PRIMA PAGINA vera su `/`; il RIORDINO delle sezioni (lettura prima,
  «Il Comune» da fuori, registro gov.uk);
- il LOGO (P11: segno da griglia geometrica, fasce romaniche/verde dei
  vivai, MAI araldica — Helsinki e Porto sono il metodo; su testata + icona
  home + favicon);
- i BADGE (P14: tanti e colorati per la comunità, istituzionali sobri);
- DESIGN.md §1 e §6 si RISCRIVONO consapevolmente con la direzione scelta;
- le maturità ex-O8 dentro/dopo: scorciatoie «?», OG image (SOLO dopo il
  rebrand), alto contrasto + font grande (misurato sulla palette nuova).

PROBLEMI NOTI (nessuno bloccante, tutti scritti):
- OGGI (12/08) NESSUN CODICE È STATO TOCCATO: solo documenti. I cancelli non
  sono stati rilanciati; l'ultimo verde completo è dell'11-12/08 (317 unit ·
  66 rotte 0 problemi · 165 E2E · shots 0 nei due regimi). Alla prima
  modifica di codice, i cancelli ripartono da AGENTS §5.
- Gli E2E completi a macchina carica fanno cadere ~2 test per volta, sempre
  per ATTESA: metodo per distinguere ambiente da regressione in AGENTS §3
  (2026-08-11). Non lanciare due cose pesanti insieme.
- `comando | tail` restituisce l'exit code di tail: un cancello rosso si
  legge verde. Redirigere su file e leggere $? (AGENTS §3).
- e2e.db ha ZERO Atto per disegno: i test della prima pagina «fatto del
  giorno» seminano atti di prova propri (il seed non riempie mai Atto).
- «Dashboard di Pistoia»/«Comune di Pistoia» hardcoded in molti punti: il
  censimento è il primo passo del rebranding, non è ancora stato fatto.
- prato.app è GIÀ registrato: il multi-città si verifica città per città.
- Browser da agente: pannello Browser senza schermo non fotografa (DevTools
  MCP + filePath); banner consensi anche in shadow DOM, sempre l'opzione più
  riservata; muri «accetta o paga» (Guardian) si saltano e si dichiara;
  «Human Verification» di Dribbble si risolve da sola (AGENTS §3).
- Lo scratchpad muore con la sessione: ciò che deve sopravvivere va in una
  cartella del progetto fuori da git (refs-o10/ è il precedente).

COSE CHE ASPETTANO LORENZO, NON TE:
- PUSH dei due commit del 12/08 (sono SOLO locali: allineamento del piano +
  ricognizione). Finché non pusha, CI non li ha visti.
- REGISTRARE pistoia.app (al 12/08 non risolveva: quasi certamente libero).
- ACCENDERE IL SERVER (spento: ping sì, porte no). Poi in ordine: Scheduled
  Task della lettura atti (pipeline-atti-schedulata §2 — finché non c'è,
  l'archivio in produzione resta VUOTO e il monitor dice «Mai letto», che è
  la verità); APP_ORIGIN su Coolify (unica cosa di sicurezza aperta);
  l'eventuale deploy — produzione indietro (misura con
  `git rev-list --count 67a94fb..main`), e PRIMA:
  `ssh homeserver "df -h /"` perché ogni deploy costa 2,82GB su 40.
- PARERE LEGALE sul toponimo nel nome, prima del lancio.
- LINEE ROSSE economiche complete, PRIMA del primo sponsor.
- Dove affiggere i QR fisici (la via senza sanzioni: «luoghi amici»).

COME LAVORIAMO (invariato):
- Lorenzo è GIUDICE A OGNI TAPPA di O10. Opzioni separabili, una domanda per
  volta, la raccomandata per prima con l'argomento onesto.
- PRIMA DI DECIDERE, MISURA — col browser e col database, non citando un
  numero da un documento.
- Un cancello che non ha mai visto un rosso non è provato: si rompe di
  proposito.
- «Fatto» = AGENTS §5: typecheck, lint, unit, rotte (0 problemi), E2E, shots
  nei due regimi (le opzioni a node, MAI a npm).
- Non fare commit o push se Lorenzo non lo chiede. MAI il deploy senza
  chiedere. Commit a nome di Lorenzo Cianferoni, niente Co-Authored-By.
- Aggiorna i documenti vivi MENTRE lavori; `graphify update .` a fine
  modifica del codice.

STATO: versione 0.48.0. Due commit del 12/08 LOCALI E NON PUSHATI (docs:
allineamento piano + ricognizione O10); albero pulito dopo di essi. Nessun
codice toccato il 12/08: ultimo verde completo dell'11-12/08 (317 unit · 66
rotte 0 problemi · 165 E2E con nota flakiness · shots 0 nei due regimi).
26.644 atti veri in dev.db (940 «sociale»), zero in e2e.db per disegno.
Server spento, dev spento, porte libere. Le 21 schermate dei riferimenti in
refs-o10/ (fuori da git).
```

---

## Stato al 2026-08-12 (sera)

| | |
|---|---|
| Versione | **0.48.0** (nessun codice toccato oggi: solo documenti) |
| Branch | `main`, **due commit locali NON pushati** (12/08: piano + ricognizione) |
| Cancelli | non rilanciati oggi; ultimo verde completo 11-12/08: 317 unit · 66 rotte 0 problemi · 165 E2E (flakiness da carico: AGENTS §3) · shots 0 nei due regimi |
| Archivio atti | **26.644 atti veri** in `dev.db` (940 «sociale») · zero in `e2e.db` per disegno |
| Produzione | indietro di 18+ commit (misura con `git rev-list --count 67a94fb..main`), archivio là sopra VUOTO finché il task non è attivo |
| Server | 🔴 **spento** (ping sì, nessuna porta) |
| O10 | **APERTA**: ricognizione ✅ giudicata · prossima tappa: **montare D1 e D2** |
| Riferimenti | `docs/ricognizione-visiva.md` (21 pattern) + 21 schermate in `refs-o10/` (fuori da git) |

---

## Che cosa è stato fatto il 2026-08-12 (questa sessione)

Tutto di documenti e ricognizione — **zero codice**, quindi zero cancelli da
rilanciare.

### 1. Il piano allineato alla svolta (commit 1)

`ROADMAP.md` riallineata alla direzione (era il primo atto chiesto da
`direzione-prodotto.md` §3): **O10 = battesimo di Pistoia.app, subito**;
**O11 nel perimetro del lancio**; **O9 spezzata in due tempi** («chi siamo» e
changelog al lancio; roadmap pubblica, voto e «idee e problemi» quando c'è un
pubblico); **le tre maturità ex-O8 dentro/dopo il battesimo** (OG image DOPO
il rebrand — l'argomento di Lorenzo: col marchio vecchio si farebbero due
volte). Più: visione §1 riscritta (sintesi della direzione), la «decisione
strategica 2026-06-11» dichiarata superata a tappe, tre regole di prodotto
nuove (n.10 numeri caldi/tono freddo · n.11 mai cittadini finti nel percorso
pubblico · n.12 si traccia tanto ma dichiarato), PWA e Vetrina ricollocate
nel conto del lancio, «Domande alla città» a catalogo, righe stantie
allineate (Analytics ✅, Moderazione ✅, Alert parcheggiato) e una **sezione
duplicata rimossa** in §6. In `direzione-prodotto.md` aggiornata
consapevolmente la riga §3 sulle maturità (diceva «restano com'erano»).

### 2. La ricognizione visiva di O10 (commit 2) — tre giri, giudicati

[`docs/ricognizione-visiva.md`](ricognizione-visiva.md): **21 pattern
(P1–P21)**, ogni fonte con link e regola d'uso, 21 schermate conservate in
`refs-o10/`.

- **Giro 1 (mirato)**: Dribbble/Behance per temi + il canone — **Apple HIG
  «Materials»** letta per intero. La scoperta che pesa: *«Don't use Liquid
  Glass in the content layer»* — il vetro Apple sta sul TELAIO, il contenuto
  su materiali pieni; il nostro vetro sta sulle card. **Tensione dichiarata
  in DESIGN §6**, la sciolgono le direzioni.
- **Giro 2 (prodotti veri, chiesto da Lorenzo)**: Apple Sports (il colore è
  il contesto, P12), Flighty (la spiegazione accanto al dato, P13), Copilot
  (pastiglie giocose su tela seria, P14), Family, **Helsinki** (il civico
  premium ESISTE ed è raro — corregge la tesi; il metodo: patrimonio
  astratto in geometria, mai araldica), gov.uk (la sobrietà per «Il
  Comune»), Citymapper (la città a filo, P16), **FixMyStreet** (l'antenato:
  «We send it to the council on your behalf» — meccaniche × materia Apple è
  la casella vuota che occupiamo, P17), Il Post (il titolo-domanda italiano,
  P18). Guardian saltato: muro «accetta o paga», dichiarato.
- **Giro 3 (polso generico, chiesto da Lorenzo)**: popolari + ricerche
  larghe. Il «ben fatto canonico» a 1M di visualizzazioni (Shakuro,
  Phenomenon) → **il test dell'intruso (P21)**; ⚠️ **il lime è l'accento di
  moda del mestiere** (tre apparizioni in cima a ricerche generiche in un
  giorno) → resta comprimario, mai identità (nota in DESIGN §4); il
  viola-scuro-ambient e gli anelli/donut come cifre del generico da evitare;
  due trovate: la pagina-città di tubik (P20) e il collage editoriale per il
  racconto (P19).

**Il giudizio di Lorenzo (fine giornata):** ricognizione accolta; **si
montano D1 e D2** (+ D3 notte) su tre pagine vere; due commit separati;
schermate conservate in `refs-o10/` fuori da git.

### 3. Documenti tenuti d'accordo

`DESIGN.md`: questione del vetro dichiarata in §6, avvertenza lime in §4,
avviso in testata che §1 è superato e si riscrive in O10. `AGENTS.md` §3: tre
trappole nuove del browser (pannello che non composita → DevTools MCP +
filePath; consensi in shadow DOM; muri «accetta o paga»). `.gitignore`:
`refs-o10/` con la motivazione. ROADMAP O10: tappa a ✅, decisione tappa b
scritta.

---

## Debiti aperti, ognuno con la condizione che lo chiude

Invariati dall'11/08 — il dettaglio completo con le condizioni sta nella
versione precedente di questo file (git) e nei documenti citati; qui
l'elenco vivo:

0. **Urbanistica resta fuori dai temi civici** (370 atti senza tema).
   Condizione: una tassonomia di contenuto con categoria urbanistica, o il
   bisogno del filtro davanti alla pagina archivio (O11).
0b. **La suite E2E completa è intermittente sotto carico** (~2 per volta,
   sempre attesa). Condizione: alzare i tempi dei punti fragili uno per uno,
   o dichiarare che la suite si lancia a macchina scarica.
1. **Scheduled Task degli atti da attivare su Coolify** (vuole il server
   acceso): finché non c'è, l'archivio in produzione resta vuoto.
2. **L'importo degli atti NON esiste nella fonte** (`Spesa prevista` = 0,00
   ovunque). Condizione: leggere gli allegati, con la regola dell'ancoraggio.
3. **Atti ↔ quartiere misurato ma non costruito** (888 atti nominano un
   quartiere). Condizione: le pagine di O11, resa «atti che nominano».
4. **Atti ↔ opera/bilancio sarebbero disonesti oggi** (opere/bilancio
   dimostrativi). Condizione: dati veri.
5. **`Classifica` solo sulla pagina del singolo atto** (26.591 aperture se
   servisse dal CSV).
6. **`test-results/` resta sporca dopo un rosso** (si svuota al giro dopo).
7. **Immagine Docker 2,82GB** (multi-stage quando il disco torna sopra 80%).
8. **`upgrade-insecure-requests` fuori dalla CSP** (si rimette con l'HTTPS
   vero — che il TLD `.app` renderà obbligatorio).
9. **`'strict-dynamic'` in sviluppo** quando Next rimetterà il nonce.
10. **`@lhci/cli` pinnato in due posti** (si aggiornano insieme).
11. **Soglie Lighthouse cinque punti sotto il minimo osservato** (si alzano,
    mai si tolgono).
12. **Il cancello della produzione scrive nel db dimostrativo** (conto suo
    quando il db smetterà di essere dimostrativo).
13. **`getRecensioniRecenti()` è codice morto** (si rimuove, o si scrive
    quale superficie la chiede).
14. **`/admin/cittadini` non è lista+dettaglio** (quando una coda supera ~10).
15. **Tre schermate stantie in `screenshots/wave-semplice/`** (si cancellano
    al primo giro di revisione visiva della pagella).
16. 🔴 **`APP_ORIGIN` non impostata in produzione** (link delle mail
    forgiabili via `X-Forwarded-Host`): valore su Coolify + verifica con
    host inventato.
17. **`MAX_PHOTO_CHARS` sopra `bodySizeLimit`** (fallisce dal lato sicuro;
    si allineano al primo errore incontrato).
18. **`unstable_cache` dichiarato sostituito da `use cache`** (si migra
    quando esce dall'opt-in o quando serve ciò che non sa fare).
19–22. **Duplicati-testo, spam, alert trend, trend per quartiere: fuori con
    condizioni** (serie vere su cui tarare / campioni sopra soglia).

## Decisioni di forma lasciate aperte

- 🆕 **La questione del vetro** (DESIGN §6 vs canone HIG): la sciolgono D1/D2
  — quando Lorenzo sceglie, DESIGN §6 si riscrive.
- 🆕 **Il rosso, quanto e dove**: tre dosi da provare dentro le direzioni
  (solo marchio+errore · +kicker FT · +diffuso).
- **Che cosa MOSTRA l'archivio pubblico** (O11): determine 56%, delibere 10% —
  si decide davanti alla pagina vera.
- **`.btn-sm` ha la stessa altezza di `.btn-md`** (rinominare, non abbassare).
- **`cittadini` fonde due code** (otto pagine se la regola pura vince).
- **Collisione «segnalazioni» vs «segnala un problema del sito»** (O9): la
  distinzione va nel nome.
- **Chi vota le funzionalità e con quali difese** (O9, dopo il lancio).
- **Il modello d'interazione della roadmap pubblica** (mockup in contesto).
- **La categoria di una segnalazione non è modificabile dopo l'invio** (se
  cambierà, è un atto verso il cittadino e va nel registro).
- **Sentiment civico in parcheggio** (il conteggio è un fatto, la sintesi un
  giudizio).

## Problemi noti — ambiente (costano ore)

0. 🔴 **IL SERVER È SPENTO** (ping sì, nessuna porta: 22/80/443/8000 chiuse;
   il ping che risponde inganna). Finché è spento: niente disco, niente
   Coolify, niente task, niente deploy.
0b. **`comando | tail` restituisce l'exit code di `tail`** → file + `$?`.
0c. **A macchina carica gli E2E cadono** (~2, sempre attesa, ~22' scarica /
   ~29' carica: parallelizzare non conviene).
1. 🔴 **Il disco del server si riempie e butta giù Coolify** (2,82GB a
   deploy su 40GB; `df -h /` PRIMA; `docker builder prune -a -f` libera
   9,39GB; MAI `docker image prune -a`: sul server vivono Umami, Homepage,
   Uptime Kuma).
2. **Il piano di controllo può cadere con l'app in piedi** (la domanda
   giusta è al processo vivo: `npm run produzione`, controllo 0).
3. **Uccidere `npm run dev` non uccide `next dev`** → porte 3000/3939 libere
   prima degli E2E (`Get-NetTCPConnection -State Listen -LocalPort 3000,3939`).
4. **`.next` stantio = 404 su TUTTE le rotte annidate** → cancella e
   rilancia PRIMA di cercare nel diff.
5. **Chromium che non parte** («Invalid file descriptor to ICU data») →
   `npx playwright install chromium --force`.
6. **Le opzioni di `shots` a `node`, MAI a `npm`**
   (`node scripts/shots.mjs --simple --width=360`).
7. **Il portale della trasparenza blocca sullo user-agent** (500 + «Web Page
   Blocked» non è un guasto: serve l'UA di un Chrome vero).
8. **`prisma migrate dev` non rigenera sempre il client** → `npx prisma
   generate` prima di indagare.
9. **Node su Windows risolve `/tmp` come `C:\tmp`** → scratchpad con
   percorso assoluto.
10. **Le here-string PowerShell non valgono in bash** → heredoc con
    `git commit -F -`.
11. 🆕 **Il pannello Browser non composita senza schermo** → DevTools MCP
    (`take_screenshot`, `filePath`). **Lo scratchpad muore con la sessione**
    → ciò che serve domani va in una cartella del progetto fuori da git.
12. 🆕 **Consensi in shadow DOM** (hel.fi) → si cammina gli `shadowRoot`;
    sempre l'opzione più riservata; «accetta o paga» si salta e si dichiara.

## Problemi noti — prodotto

1. **`locator.evaluateAll()` non aspetta** (lista vuota = `[]` in silenzio):
   leggere `error-context.md` PRIMA di cercare nel codice.
2. **Un cancello copre le regole che gli hai chiesto**, non la promessa nel
   documento (chiediti da quale riga verrebbe misurata).
3. **Il `:hover` non è un canale**: l'affordance dev'esserci a riposo.
4. **Colonne di larghezza diversa → `@container`**, mai `sm:`/`lg:`.
5. **Le prove di un suggerimento sono le parole della persona**, e prima di
   metterlo su una superficie chiediti quale controllo lo rende seguibile.
6. **`undefined` in un `where` Prisma = nessun filtro**: argomenti delle
   Server Action validati PRIMA della query.
7. **La preferenza di movimento non si legge in render**: durata o CSS, mai
   markup.
8. **Il monitor atti dice «Mai letto» negli E2E ed è giusto** (e2e.db non ha
   Atto per disegno).

## Regole che valgono per qualunque cosa costruisca

- **Prima di decidere, MISURA** — col browser e col database, non citando un
  numero da un documento.
- **La forma su mockup INIETTATI e fotografati**; classi non nel sorgente =
  stili in linea.
- **Un cancello deve distinguere «verificato e a posto» da «non
  verificato»**, e uno mai visto rosso non è provato.
- **Due definizioni dello stesso indicatore sono peggio di nessun
  indicatore**: le soglie si importano.
- **Il conteggio è un fatto, la sintesi è un giudizio**; i contatori si
  chiedono al database.
- **Nel dubbio, nessuna risposta** (un atto senza tema è un fatto; col tema
  sbagliato è un'affermazione falsa).
- **Quando una superficie entra per la prima volta in un cancello, i rossi
  possono essere suoi di nascita.**
- **Riporta con onestà**: se un test fallisce, dillo con l'output; se hai
  saltato una parte, dillo e spiega perché.
- 🆕 **Il test dell'intruso** (P21): ogni schermata di O10 deve poter dire
  che cosa, in lei, esiste solo perché questa è Pistoia.
