# Ricognizione visiva — O10, il battesimo di Pistoia.app

> **Aggiornata il 2026-08-12 (notte)** con §2-quater — CodeFronts, portato da
> Lorenzo: una libreria CSS invece di un portfolio, e quindi una fonte con
> regole d'uso diverse. Tre pattern nuovi (P22–P24), fra cui un **buco di
> accessibilità nostro** trovato guardando com'è fatto un contatore altrui.

> La ricognizione che apre l'Ondata 10, come `fonti-atti.md` ha aperto la
> pipeline: prima si guarda che cosa fanno i professionisti, poi si disegna.
> Condotta il **2026-08-12** col browser in **due giri**: il primo su
> Dribbble/Behance più tre prodotti vivi (Apple HIG, FT, Linear); il secondo —
> chiesto da Lorenzo, «cerca altri riferimenti» — **sui prodotti veri**, dove
> il metro è più alto: Apple Sports, Flighty, Copilot, Family, Helsinki,
> gov.uk, Citymapper, FixMyStreet, Il Post (§2-bis). Ogni fonte chiude con la
> riga che conta: **che cosa se ne prende, e che cosa no.**
>
> **Le fonti sono ispirazione e metro di qualità** (§1.10). ✏️ Il «mai da
> copiare» è **caduto il 2026-08-12 per decisione di Lorenzo**: se qualcosa è
> bello si copia. Restano due distinzioni scritte in §1.10: la **licenza**
> decide che cosa si può prendere alla lettera (il CSS MIT sì, uno screenshot
> altrui no), e ciò che entra va **ricondotto ai nostri token** — un
> componente incollato con le sue tinte e i suoi raggi porta dentro un altro
> design system. Il metro resta il **test dell'intruso** (P21). Questa è la
> seconda ricognizione del progetto: la prima (2026-07-25, `REFERENCES.md` e
> `refs/`) resta valida per i token e le librerie; questa la allarga con
> Pistoia.app in testa.

---

## 0. Il filtro, dichiarato prima di guardare

**Il gusto di Lorenzo, testuale (2026-08-12): minimal di lusso ·
glassmorphism · tech — scuola Apple, non Linear.** La faccia canonica è
CHIARA (una tela calda che accoglie: un giornale civico si legge di giorno e
da tutte le età); lo scuro può essere il momento «Linear» — il terminale
della città di notte. Requisito **non negoziabile: mai una UI generica,
standardizzata o da template.**

**L'onestà, scritta prima di cominciare.** Il gusto spontaneo di chi esegue
converge al «ben fatto canonico»: senza contrappeso, questa ricognizione
produrrebbe una bella dashboard qualunque. I contrappesi strutturali sono
due — i riferimenti raccolti QUI (che alzano il metro) e **l'occhio di
Lorenzo, giudice a ogni tappa** (che rifiuta il canonico). Nessuno dei due è
una cortesia.

### I vincoli dentro cui l'eccellenza si cerca

Un riferimento bellissimo ma inaccessibile **si rielabora, non si copia**
(§1.10.2). Questi sono cancelli, non preferenze:

| Vincolo | Dove è misurato |
|---|---|
| Contrasto AA nei due temi, AAA sul body, zero violazioni axe | `accessibilita.spec.ts`, 21 pagine × 2 temi |
| Ogni bersaglio ≥ 44px — anche un badge animato è un bersaglio | `bersagli.spec.ts`, 21 pagine × 2 viewport |
| Nessun controllo esce dal proprio contenitore | `contenimento.spec.ts` |
| Nessun traboccamento a 360px in modalità semplice | `shots --simple --width=360` |
| Niente WebGL, cursori animati, parallax — telefoni Android vecchi | `AGENTS.md` §2 · `REFERENCES.md` §6 |
| `prefers-reduced-motion` è uno stato di prima classe | cancello console + CSS su `[data-motion-reveal]` |
| Lighthouse bloccante (perf ≥ 0,90) | `.github/workflows/ci.yml` |
| Il rosso resta anche colore d'errore: la semantica non si confonde | `DESIGN.md` §4 |

### Il metodo, e i suoi limiti dichiarati

- **Primo giro** — ricerche su **Dribbble** (`glassmorphism dashboard`,
  `liquid glass ui`, `news app editorial`, `verified badge profile`,
  `city app icon minimal`) e **Behance** (`civic city government app`,
  identità di città); più tre **prodotti veri** aperti dal vivo: Apple HIG
  (Materials), FT.com, Linear.app. Pinterest è fuori: muro di login (già
  noto dalla consegna).
- **Secondo giro** (stesso giorno, su richiesta di Lorenzo) — otto prodotti
  veri: Apple Sports, Flighty e Copilot (le pagine App Store mostrano le
  schermate reali), Family, Helsinki, gov.uk, Citymapper, FixMyStreet,
  Il Post. The Guardian saltato: muro «accetta tutto o abbonati».
- **Terzo giro** (stesso giorno, su richiesta di Lorenzo: «cerca anche
  design generici») — il polso largo di Dribbble: i **popolari** senza
  filtro, più le ricerche `ui ux design`, `web design`,
  `mobile app design`. Serve a due cose: nominare le tendenze correnti e
  vedere in faccia il «ben fatto canonico» da cui distinguersi (§2-ter).
- **Le schermate NON entrano nel repository**: la repo è pubblica e le
  immagini sono lavoro altrui — ridistribuirle non è nostro diritto. Le 21
  schermate raccolte vivono in **`refs-o10/`** (ignorata da git, come
  `refs/`, deciso da Lorenzo il 12/08); **il registro permanente sono i
  link** qui sotto. (La prima ricognizione ha `refs/*.jpg` committati: no —
  sono ignorati anche loro, dalla stessa regola.)
- Su Dribbble la prima richiesta è passata da una pagina «Human
  Verification» che si è **risolta da sola** (nessun CAPTCHA affrontato:
  fosse rimasta, la fonte sarebbe stata scartata).

---

## 1. Il canone: Apple, «Materials» (Human Interface Guidelines)

`developer.apple.com/design/human-interface-guidelines/materials` — il metro
dell'«Apple-grade» che il filtro nomina. Letta per intero, tre regole
cambiano il modo in cui pensiamo il nostro vetro:

1. **«Don't use Liquid Glass in the content layer.»** Il vetro liquido è il
   **livello funzionale** — barre, navigazione, controlli — che *galleggia
   sopra* il contenuto; il contenuto sta su materiali standard, più pieni.
   L'eccezione: controlli transitori dentro il contenuto (slider, toggle)
   che prendono il vetro **quando si attivano**.
2. **«Use Liquid Glass effects sparingly.»** Il vetro esiste per portare
   l'attenzione sul contenuto; spalmarlo ovunque distrae da ciò che dovrebbe
   servire. Si limita agli elementi funzionali più importanti.
3. **Due varianti**: *regular* (sfoca e regola la luminosità — per elementi
   con molto testo: barre laterali, alert, popover) e *clear* (molto
   trasparente — SOLO sopra sfondi ricchi tipo foto/video, con velo scurente
   al 35% se il fondo è chiaro). E i colori sopra i materiali sono i
   «vibrant», progettati per restare leggibili.

⚠️ **La tensione onesta col nostro sistema, da portare a Lorenzo.** Oggi
`DESIGN.md` §6 mette il vetro **sulle card di contenuto** (deciso il
2026-07-25, contrasto misurato 16,8:1) — la grammatica Apple lo mette **sul
telaio** e lascia il contenuto pieno. Non è un dettaglio: è la biforcazione
principale delle direzioni estetiche (§6 di questo doc). «Alzare il vetro ad
Apple-grade» può voler dire *spostarlo*, non solo rifinirlo.

> **Quando usarla:** ogni volta che si decide DOVE va il vetro e che grado di
> trasparenza ha. È il canone; le deroghe si scrivono, non si scivolano.

---

## 2. Le fonti guardate, una per una

### 2.1 Indah Rahma / Orphis Studio — Smart Home Monitoring Dashboard

`dribbble.com/shots/25904071` · vetro caldo sopra una fotografia vera
(interno beige/legno), pannelli translucidi, testo quasi-nero.

**Che cosa insegna:**
- **Il vetro prende la temperatura dalla scena dietro**, non da una tinta
  propria: il pannello è neutro, il calore è dell'ambiente sfocato. (È la
  nostra regola «il vetro ha bisogno di materia da sfocare», portata al
  grado successivo: la materia può portare il *clima*.)
- **Il payload si legge sul PIENO**: dentro il pannello di vetro, i dati che
  contano (avanzamento, notifiche) stanno su **mini-card bianche opache**.
  Vetro = atmosfera e cornice; bianco pieno = lettura. Combacia con la
  variante *regular* della HIG e con la nostra regola «testo minuto mai sul
  mesh».
- Un solo inchiostro + accenti minuscoli (toggle, chip AQI): la semantica
  non si disperde.

**Non si prende:** il contesto smart-home, i controlli-giocattolo.

### 2.2 Ghani Pradita / Paperpillar — HR Management Dashboard

`dribbble.com/shots/26001298` · la faccia chiara «di lusso che accoglie»
già dimostrata.

**Che cosa insegna:**
- **Il calore sta nell'AMBIENTE, non nei componenti**: una luce pesca/rosa
  lava la tela; le card restano bianche/translucide. È la strada per
  scaldare la nostra tela grigio-calda senza tingere i componenti (che
  romperebbe la semantica dei colori).
- **Un'isola scura per pagina**: fra card chiare, UNA card quasi-nera
  («Upcoming Meeting») dà profondità e gerarchia senza colore. Candidata
  naturale: il **numero-monumento** o il fatto del giorno della prima
  pagina.
- **Il lusso lo fa la tipografia**: titolo display enorme, cifra 63,89%
  protagonista, cromo silenzioso. (La nostra regola del contrasto
  dimensionale, confermata.)
- Rampa **sequenziale calda** sulle barre (pesca→arancio): una famiglia
  sola, zero arcobaleno.

**Non si prende:** la sciatteria dei dati dimostrativi (lo stesso 49.229
ripetuto tre volte nella fascia KPI — su Dribbble i numeri sono pittura;
da noi ogni numero è un fatto, ed è la differenza di mestiere).

### 2.3 Oleksandr Kosholap — Channel Analytics (vetro scuro)

`dribbble.com/shots/23626622` · la tesi per il tema scuro.

**Che cosa insegna:**
- **Lo scuro non è un vuoto nero: è vetro scuro sopra una scena ambientale**
  con UN accento caldo (arancio). «Il terminale della città di notte» ha già
  una forma: pannelli translucidi, scena dietro, accento dosato.
- Righe di lista con **sparkline in linea** — compatte, leggibili.
- Il giallo/lime vive solo come linea dati e cifra grande — vicino alla
  nostra regola del lime (da noi resta più stretta: mai testo).

**Non si prende:** la foto-modella da stock come hero (il nostro «hero» è la
città), la CTA promozionale.

### 2.4 L'onda «liquid glass» (post-WWDC 2025)

`dribbble.com/search/liquid-glass-ui` — la ricerca che mostra dove il
mestiere sta andando. Tre esempi guardati: Angel Zhelyazkov (menù di vetro
dimostrati su fondo chiaro E su fondo ricco — le due varianti HIG in un
colpo solo), Abdullah Al Mamun (chip e controlli di vetro che galleggiano su
una scena domestica), Denis Sevryugin (menù scuri su viola).

**Che cosa insegna:** il vetro dell'onda 2025-26 sta **sui controlli** —
menù, chip, pillole, player — non su intere card di contenuto. Conferma
indipendente della grammatica HIG (§1).

### 2.5 Nicolas Chapuy — Yahoo Rebranding, login

`dribbble.com/shots/26706632` · un dettaglio che vale da solo: il pannello
di **vetro cannettato** (reeded glass) accanto al modulo di accesso.

**Che cosa insegna:** il vetro premium **non è solo blur** — ha varianti
materiche (cannettato, smerigliato, chiaro) come un materiale vero. Il
nostro vetro oggi ha UN grado; può averne due o tre, dichiarati e usati per
gerarchia (es. cannettato solo nei momenti di marca, mai sul contenuto).

### 2.6 sleek.design — The Gazette (news app)

`dribbble.com/shots/27172292` · una prima pagina VERA in forma di app:
testata, pezzo forte, griglia secondaria, archivio.

**Che cosa insegna:** la **struttura** della prima pagina è un canone antico
che non si inventa — si eredita: gerarchia editoriale (apertura → spalla →
taglio basso), il kicker sopra il titolo, la rubrica laterale. Per la nostra
`/` (fatto del giorno + numero-monumento + didascalie) il modello è questo,
non una dashboard.

**Non si prende:** la pelle rétro-seppia (carta invecchiata, serif
d'archivio): noi siamo contemporanei, il canone è strutturale.

### 2.7 FT.com — il prodotto vero (aperto dal vivo)

`ft.com` · il giornale dei numeri su carta calda, da un secolo e mezzo.

**Che cosa insegna:**
- **I numeri stanno in CIMA alla prima pagina**: la fascia dei mercati
  (S&P −0,32% · FTSE −0,14%…) vive SOPRA la testata. Il nostro «fatto del
  giorno + numero-monumento» ha un precedente di prodotto, non solo di
  concept.
- **Il kicker rosso su carta calda**: la parola-tema in rosso sopra il
  titolo serif («Tata Sons») — rosso editoriale, dosato, che non è mai
  allarme. È il precedente perfetto per il **rosso di Pistoia in prima
  pagina** senza scivolare nel tabloid (regola «numeri caldi, tono freddo»).
- La tela FT è **carta calda** (#fff1e5 di famiglia): un giornale che
  accoglie può essere autorevole.

**Non si prende:** il serif per il corpo (la nostra voce resta Schibsted
Grotesk), la densità da broadsheet.

### 2.8 Linear.app — il polo che NON siamo (di giorno)

`linear.app` · aperto dal vivo. Tela quasi-nera, display bianco gigante,
superfici che salgono per gradini di luminanza, filetti capello, colore solo
come micro-semafori di stato.

**Che cosa insegna (per il tema SCURO):** i gradini di luminanza al posto
delle ombre (già nostra regola §10), i filetti, il micro-colore semantico.
**Che cosa si rifiuta (per la faccia canonica):** la freddezza — zero
calore, zero accoglienza: è un attrezzo da professionisti, non una piazza.

### 2.9 Il civico su Behance — la scoperta è l'assenza

Cercato `civic city government app`: Civicpulse
(`behance.net/gallery/249299227`), Town Core, NeighborFix, OneCitizen
Bangladesh, Stuttgart (TTMS Design Lab, `behance.net/gallery/30069917`),
City Identity for Győr, Moscow 2030 (`behance.net/gallery/223147835`).

**La scoperta onesta: il civico fatto con eccellenza QUASI NON ESISTE nel
repertorio.** Case study con illustrazioni stock, UI da template, livello
studente. Due conseguenze:

1. **Lo spazio «civico premium» è vuoto** — la qualità visiva come
   attrattore (§1.6.4 della direzione) non ha concorrenti di categoria:
   l'eccellenza va importata da fintech/editoriale/product design.
2. **Le app ufficiali delle città usano l'araldica** (Stuttgart: il
   cavallino nero dello stemma, pieno schermo). È ESATTAMENTE l'aspetto da
   cui distinguerci: il rischio «Pistoia.app letta come app del Comune»
   (§1.9) si governa anche così — **mai araldica, mai scacchiera come
   identità** (§1.4); il rosso radica, lo stemma travestirebbe.

Moscow 2030 (allestimento, non prodotto): nota di linguaggio — un solo blu,
oggetti-icona morbidi, pixel-motivi. Non primario.

### 2.10 Il segno e l'icona (per il logo, §1.12.3)

*(integrata dal secondo giro: vedi anche Helsinki, §2-bis.5 — il metodo
«patrimonio → sistema astratto» dal vivo su una città vera)*

- **Roamify** (Panze / Ashfuq Hridoy, `dribbble.com/shots/26339637` e
  affini): la grammatica di costruzione contemporanea — **monogramma nato da
  una griglia geometrica visibile, un accento, declinazioni** su UI, icona,
  merch. Il processo, non la forma.
- **Porto.** (White Studio, `behance.net/gallery/20315389/New-identity-for-the-city-of-Porto`):
  il canone delle identità di città del decennio — un **sistema di icone
  geometriche** derivate dal patrimonio materiale (gli azulejos), che scala
  dal sigillo al pittogramma. Per Pistoia il patrimonio equivalente c'è già
  nei motivi identitari: **fasce romaniche, verde dei vivai** (la scacchiera
  no: è araldica, vedi 2.9).
- **Badge di ruolo**: il repertorio Dribbble è debole (flussi di verifica,
  non linguaggi di badge). I riferimenti veri sono PRODOTTI, da studiare al
  momento del disegno: **Discord** (il riferimento citato da Lorenzo: badge
  collezionabili sul profilo), **Duolingo** (gioia da collezione),
  **GitHub** (achievement sobri). Vincolo già deciso: istituzionali sobri,
  giocosità sui badge di comunità (§1.14.4).

---

## 2-bis. Il secondo giro: i prodotti veri (2026-08-12, pomeriggio)

> Chiesto da Lorenzo dopo il primo giro. I concept mostrano la pelle; i
> prodotti mostrano le decisioni che reggono l'uso. Otto fonti, tutte vive.

### 2-bis.1 Apple Sports — il colore È il contesto

`apps.apple.com/us/app/apple-sports/id6446788829` (App Store) · l'app-dati
di Apple, gratuita, disegnata dentro il linguaggio Liquid Glass.

**Che cosa insegna:**
- **Ogni schermata prende la tinta dai DATI, non dal marchio**: la partita è
  il gradiente dei colori delle due squadre, il campionato il suo verde. Il
  brand non colora niente — l'ambiente è informazione. Per noi la porta è
  già aperta: **i temi civici hanno colori propri**; la pagina di un tema (e
  la scena dietro il vetro) può prenderne la tinta.
- **La grammatica del tabellone**: punteggi giganteschi, tabellari, bianchi
  su tinta; etichette minuscole; statistiche a barrette sottili. È il
  «numero-monumento» a scala di prodotto.
- Live Activities sul blocco schermo: il dato che ti raggiunge — il modello
  per le nostre notifiche del «fatto del giorno» (PWA, conto del lancio).

**Non si prende:** nulla da scartare — è il riferimento più vicino al
filtro. Da rielaborare, mai da copiare (i gradienti bicolore delle squadre
sono SUOI).

### 2-bis.2 Flighty — lo scuro di prima classe, e la spiegazione accanto al dato

`apps.apple.com/us/app/flighty-live-flight-tracker/id1358823008` · Apple
Design Award 2023, «the flight tracker your pilot uses».

**Che cosa insegna:**
- **Righe di stato vive**: partenza→arrivo, orari, chip «On Time»/«A10» — la
  grammatica per i flussi civici vivi (atti di oggi, segnalazioni chiuse).
- 🔑 **La spiegazione accanto al dato**: «35m delay predicted **due to late
  arriving aircraft**» — il numero porta il suo perché, in una riga. È la
  nostra didascalia redazionale (§1.6-bis.3), fatta prodotto da anni.
- Lo scuro «prima classe»: quasi-nero caldo, rotte come fili luminosi,
  precisione tipografica — un'altra pezza d'appoggio per D3.

### 2-bis.3 Copilot Money — pastiglie giocose su tela seria

`apps.apple.com/us/app/copilot-track-budget-money/id1447330651` · Apple
Design Award finalist, Editor's Choice.

**Che cosa insegna:** su una tela scura serissima, le **categorie sono
pastiglie giocose** — icona + colore ciascuna — e il contrasto fra serietà
del fondo e gioia dei chip è voluto. È esattamente la miscela dei nostri
badge (§1.14.4): istituzionali sobri, comunità colorata e «catchy».

### 2-bis.4 Family — la gioia vive nel motion, non sulle superfici dei dati

`family.co` · il riferimento di settore per la delizia (portafoglio crypto,
ma il mestiere è il micro-motion).

**Che cosa insegna:** tela crema calda, display gigante; i personaggi e la
gioia stanno nel racconto e nelle micro-interazioni, **mai addosso ai
numeri**. Conferma la nostra regola dei «tre momenti di festa» (`DESIGN.md`
§7): la delizia è puntuale, il dato resta pulito.

### 2-bis.5 Helsinki (hel.fi) — il civico premium ESISTE, ed è raro

`hel.fi/en` · la città col design system pubblico (HDS) e un'identità
disegnata (Helsinki Grotesk, il riquadro-fumetto derivato dallo scudo, il
bordo a onda «koro»).

**Che cosa insegna:**
- ⚠️ **Corregge la tesi del primo giro (P10)**: il civico fatto con
  eccellenza esiste — tipografia propria, campi di colore pieni, fotografia
  vera della città, gerarchia da prodotto. Resta **rarissimo**, e infatti
  Helsinki è LO standard citato ovunque, da un decennio.
- **Il metodo del patrimonio astratto**: il logo è lo scudo dello stemma
  *ridotto a cornice-fumetto*; il bordo a onda viene dalle acque dello
  stemma. Il patrimonio diventa **sistema geometrico**, non citazione
  araldica. Per noi il materiale è già scelto: fasce romaniche e verde dei
  vivai — e la scacchiera resta fuori (noi non SIAMO la città-istituzione:
  Helsinki sì, ed è la differenza che ci separa anche da lei).
- **«Decision-making» è voce di primo livello** della navigazione: gli atti
  come sezione primaria di un sito-città non sono un'idea nostra strana — è
  lo standard di chi lo fa bene.

### 2-bis.6 gov.uk — il polo sobrio: la credibilità è chiarezza

`gov.uk` · il design system governativo più premiato del mondo.

**Che cosa insegna:** un blu, una grotesca, una dichiarazione gigante, una
ricerca. Zero ornamento, leggibilità come etica. **Non è la nostra faccia**
(noi dobbiamo anche attrarre), ma è il registro per la sezione «Il Comune»
raccontata da fuori (§1.11.2): dove si riferisce l'istituzione, la sobrietà
È il lusso.

### 2-bis.7 Citymapper — la città illustrata a filo

`citymapper.com` · «Making Cities Usable».

**Che cosa insegna:** la città come **illustrazione a filo sottile** (bus,
tram, biciclette in linea capello) — ornamento derivato dagli oggetti veri
della città, leggero, mai infantile. Una pista per stati vuoti e testate
leggere: la Pistoia disegnata a filo (mura, fasce, vasi dei vivai) al posto
di illustrazioni generiche.

### 2-bis.8 FixMyStreet — l'antenato, e la scommessa che ci lascia

`fixmystreet.com` · mySociety, dal 2007 — il precedente citato dalla
direzione (§1.1) come modello dell'indipendente diventato canale di fatto.

**Che cosa insegna:**
- Il **passo 4 della sua home**: «We send it to the council on your
  behalf» — il modello dell'intermediario attivo, scritto in una riga da
  diciott'anni. Il nostro inoltro ufficiale (§1.3) ha un antenato diretto.
- La **firma d'indipendenza** nell'angolo («A service from mySociety»): il
  nostro «chi pubblica», risolto con un badge.
- ⚠️ E la scommessa: giallo/nero utilitario, zero lusso. **Le meccaniche
  civiche esistono da vent'anni; l'eccellenza visiva nella categoria non è
  mai arrivata.** Pistoia.app = le meccaniche di FixMyStreet × la materia di
  Apple: è la combinazione vuota che il posizionamento occupa.

### 2-bis.9 Il Post — il tono italiano che spiega

`ilpost.it` · l'indipendente editoriale italiano, sostenuto dai lettori.

**Che cosa insegna:**
- 🔑 **Il titolo-domanda in italiano piano**: «Cosa ci fanno questi grossi
  mezzi blindati fuori dalle stazioni», e sotto la spiegazione onesta. È il
  registro per i **titoli umani degli atti** (§1.12.1) e per le didascalie:
  spiegare senza gridare, domandare senza accusare — «numeri caldi, tono
  freddo» ha una voce italiana già rodata.
- La fascia **«INTANTO»** coi timestamp: il fiume del giorno, compatto — una
  forma possibile per il ritmo quotidiano sotto il fatto del giorno.

*(The Guardian è stato aperto e SALTATO: muro «accetta tutto o abbonati» —
la via che rispetta la privacy era a pagamento. FT e Il Post coprono
l'editoriale.)*

---

## 2-ter. Il giro largo: che cosa fa il mestiere in generale (2026-08-12, sera)

> Chiesto da Lorenzo («cerca anche design generici, tipo ui ux design»).
> Il giro mirato trova ciò che si cerca; quello largo mostra **il mare in cui
> non bisogna somigliare a nessuno** — e le correnti buone che il mio imbuto
> aveva tagliato fuori.

### 2-ter.1 Le tendenze correnti, nominate (dai popolari)

Dal feed dei popolari e dalle ricerche larghe, le correnti del 2025-26 che
toccano il nostro tavolo:

| Tendenza | Vista in | Che cosa se ne fa Pistoia.app |
|---|---|---|
| **Luce ambientale calda** dietro UI neutre | strangehelix (fitness su pesca), Paperpillar (2.2) | Conferma P3 — è la corrente giusta per la tela calda che accoglie |
| **Cieli e paesaggi come ambiente** dietro un controllo | Lepisov, «Total Solar Eclipse» (`dribbble.com/shots/…toggle`) | La scena dietro il vetro può essere il CIELO della città (alba/giorno/notte): P5 esteso al chiaro |
| **Lime + grafite** da laboratorio | cryonex (`/shots/27270369`), Shakuro ACRU (`/shots/26816259`), Purrweb (`/shots/27640540`) | ⚠️ vedi l'avvertenza sotto: il nostro `--highlight` è in piena moda |
| **Grandi numeri con UNA tinta** su bianco | Purrweb («1.4 km» + rotta lime) | Conferma della grammatica DisplayNumber |
| **Sistemi di icone a peso coerente** come consegna a sé | tubik (`/shots/…icon set`) | Il perimetro O10 lo chiede testualmente: le icone si disegnano come SISTEMA, non a spizzichi |
| **Editoriale fotografico** («HOME WITH A POINT OF VIEW») | Korsa/Meridian (`/shots/27640150`) | La fotografia vera come apertura — per noi: la CITTÀ vera, quando avremo immagini con licenza (la mesh resta lo slot, `DESIGN.md` §8) |
| **Collage editoriale**: foto in pillole nel testo, scarabocchi, nastri | Akademia (Phenomenon), Zajno (`/shots/24257855`) | Registro umano per le superfici di RACCONTO («chi siamo», il progetto) — mai per i dati |
| **Anelli e donut ovunque** | OnPoint, stats app varie | La cifra del generico da telefono: il nostro DisplayNumber a tacche è più distintivo — non si regredisce all'anello |
| **Chips-azione morbide** con icona | Nixtio (`/shots/…document AI`) | Buona grammatica mobile per porte e percorsi guidati (44px facili) |
| **Viola/periwinkle ambient scuro** | ByteTown, Ramotion, HUSD | Il look «app scura generica» 2025: da evitare — il nostro scuro è caldo e ha una scena (P5) |

### 2-ter.2 Il «ben fatto canonico» a un milione di visualizzazioni

In cima a `ui ux design` e `web design` stanno gli studi grandi — Shakuro
(`/shots/26816259`, 1M visualizzazioni), Phenomenon (`/shots/27229691`,
368k), Ronas, QClay — con gestionali e landing **impeccabili e
intercambiabili**: griglie pulite, KPI card, un accento, zero luogo. È la
gravità contro cui la direzione ha scritto il requisito «mai una UI da
template», e ora ha una faccia precisa.

**La regola operativa che ne esce:** se una schermata di Pistoia.app
potrebbe stare in uno di questi portfolio **senza che nessuno noti
l'intruso**, è rossa — le manca il luogo. Il test è concreto: ogni proposta
di O10 deve rispondere «che cosa, qui, esiste SOLO perché questa è
Pistoia?» (la luce, il motivo, il numero civico, il tema, la lingua).

### 2-ter.3 La pagina-città di tubik («Chicago», `/shots/…Chicago`)

Un sito di outdoor advertising che apre con la CITTÀ: fotografia urbana,
«Chicago Highlights», e una **riga di statistiche** (91% · 270+ · 32mm ·
43%). Composizione direttamente utile alle **pagine quartiere** e alla
sezione «Il Comune»: la città fotografata + i suoi numeri in riga, senza
dashboard.

### ⚠️ L'avvertenza sul lime, scritta guardando

Il nostro `--highlight` lime (2026-07-25, dai riferimenti Superpower) è nel
2025-26 **il colore d'accento di mezzo mestiere**: tre apparizioni in cima a
ricerche generiche in un giorno solo. Non è un motivo per toglierlo — è un
motivo per **non promuoverlo mai a colore d'identità**: resta comprimario
decorativo con le regole che ha (mai testo, mai icone), e l'identità la
portano il rosso della città e i motivi veri. Le prove di palette di §4
devono tenerne conto: un'interfaccia «lime su grigio caldo» oggi è un
template, non una firma.

---

## 2-quater. CodeFronts, e la differenza fra una libreria e un riferimento (2026-08-12, notte)

> Portato da Lorenzo: «questo sito ha molti elementi web belli da copiare,
> analizzalo tutto nel dettaglio e se c'è qualcosa di utile prendilo» —
> `codefronts.com`. Analizzato col browser: consenso **rifiutato** (banner con
> 1731 partner, «REJECT ALL»), poi navigate le collezioni pertinenti.

**Che cos'è, misurato**: una libreria di **CSS a copia-incolla** — 139
collezioni, 2.789 demo, licenza MIT, costruita con Astro. Non è un portfolio
di design: è codice funzionante, con descrizioni tecniche che spiegano il
*perché* di ogni scelta. Dichiara lo stesso standard che pretendiamo noi
(«works at 320px, 600px, 1440px · keyboard-accessible · `prefers-reduced-motion`
respected»), e tiene fede: ogni collezione è marcata *Pure CSS* o *Light JS*.

⚠️ **La cosa da dire per prima, e non è una sottigliezza.** Una raccolta che
si intitola «51 CSS Buttons» **è il repertorio del generico**: è esattamente
il posto da cui viene la UI «già vista su dieci dashboard» che `DESIGN.md` §1
esclude e che il test dell'intruso (P21) condanna. Prendere di lì un bottone,
una card di vetro o un footer significa importare la media del mestiere. La
regola resta quella di §1.10: **le fonti sono ispirazione e metro, mai da
copiare** — e qui la tentazione è più forte perché il codice è pronto e la
licenza lo permette.

Detto questo, il sito ha **quattro cose che valgono davvero**, e sono tutte
tecniche o strutturali — non estetiche.

### Le quattro cose da prendere (rielaborate, non copiate)

1. 🔑 **L'archivio raggruppato per anno con le etichette che si appiccicano**
   («Blog Archive with Year Separators»). È la forma che l'**archivio degli
   atti** cerca: 26.644 decisioni in una colonna scorrevole, raggruppate per
   anno, con l'anno che resta a lato mentre scorri. Risolve il problema vero
   di O11 — sapere *dove sei* dentro un archivio profondo — senza paginazione
   e senza filtri. Entra come **P22**.
2. 🔑 **La barra di avanzamento della lettura senza listener di scroll**:
   `animation-timeline: scroll()` lega l'animazione alla posizione, gira fuori
   dal thread principale e costa zero. **Conferma indipendente della nostra
   scelta** (`ScrollTold` usa la ScrollTimeline nativa via Motion) e dà la
   forma a un elemento che le pagine lunghe — bilancio, pagina atto — oggi non
   hanno. Entra come **P23**.
3. **`subgrid` per allineare le card al pixel** nella griglia secondaria di una
   prima pagina editoriale. È il rimedio esatto al difetto che si vede quando
   quattro card hanno titoli di lunghezza diversa e i corpi non si allineano.
4. 🔑 **Il tile KPI che annuncia in live region quando il numero si è
   assestato.** Questo è un **miglioramento di accessibilità che ci manca**:
   `DisplayNumber` conta da zero e chi usa uno screen reader non ha modo di
   sapere quando il valore è definitivo. Entra come **P24**.

### Le cose da NON prendere, e perché

| Cosa | Perché no |
|---|---|
| **Il contatore in CSS puro** (`@property` + `counter()`) | Elegantissimo — e **vietato da `DESIGN.md` §8**: il numero deve essere **testo vero**, selezionabile, copiabile e leggibile dalle tecnologie assistive. `counter()` genera contenuto CSS: non si seleziona, non si copia, e non tutti i lettori di schermo lo annunciano. È il caso esemplare di una soluzione brillante che un nostro vincolo esclude |
| **La barra «breaking news» a marquee** | Movimento continuo e automatico: `DESIGN.md` §7 concede tre soli momenti di festa e nessuna animazione ambientale. La nostra striscia dei dati è ferma per disegno |
| **Il blocco scarsità dell'e-commerce** («solo N rimasti», barra che vira all'urgenza) | Meccanica persuasiva costruita per far decidere in fretta. Su un servizio civico è l'opposto del patto: `direzione-prodotto.md` §1.7, numeri caldi e **tono freddo** |
| **Le card glassmorphism della collezione** | È il «template glass» da cui il nostro vetro deve distinguersi (§2.4 e la questione di `DESIGN.md` §6). Il nostro ha una disciplina — payload sul pieno — che quelle non hanno |
| **Bottoni, footer, testimonial, ribbon** | Repertorio generico. Un footer preso di lì cancellerebbe le sei decisioni misurate che il nostro porta dentro |

**La nota sulla licenza:** MIT consente l'uso e la modifica, con l'obbligo di
conservare l'avviso di copyright. Dopo la correzione di §1.10 (2026-08-12,
«se qualcosa è bello si copia») **importare codice da qui è lecito e
ammesso**: quando succede, l'avviso resta nel file e la provenienza va
annotata in `REFERENCES.md`. Ciò che entra si riconduce ai **nostri token** —
un componente incollato con le sue tinte, i suoi raggi e le sue durate porta
dentro un secondo design system e litiga col nostro.

### Il giro sulle collezioni di `components` (30 collezioni)

Chiesto da Lorenzo: «guarda tutte le collezioni in components, scrolla bene».
Esaminate **otto collezioni per intero** — Liquid Glass Cards (21), Steppers
(12), Skeleton Loaders (12), Search Box (32), Progress Bars (12), Star
Ratings (22), più Blog Layouts (20) e Number Counters (25) del giro
precedente: **~156 demo**. L'elenco completo delle 30 collezioni è stato
letto; quelle **non aperte** sono dichiarate in fondo, con la ragione.

#### Quello che entra, superficie per superficie

| Da dove | Che cosa | Dove serve a noi |
|---|---|---|
| **Search Box** n.13 *Tagged Filter* | I **chip dei filtri attivi vivono dentro la barra di ricerca**, ognuno con la sua ×  | 🔑 L'**archivio atti** (O11): tipo, anno, tema, ufficio. Il filtro attivo si vede e si toglie dove si cerca, invece che in una colonna a parte |
| **Search Box** n.6 *Caret Highlight* | Al focus una linea attraversa il campo **una volta sola** — «senza movimento perpetuo» | I nostri campi: è il rinforzo del focus che `DESIGN.md` §11.2 chiede, senza violare §7 |
| **Search Box** n.14 *Recent Searches* + n.12 *⌘K* | Ricerche recenti al focus; il suggerimento della scorciatoia dentro il campo | La **palette comandi** ha già il `Ctrl K`; mancano le ricerche recenti |
| **Animated Cards** n.6 *Filter Re-Layout with FLIP* | Filtrando una griglia le card **viaggiano** alla nuova posizione invece di teletrasportarsi | 🔑 Di nuovo l'archivio: con 26.644 atti, un filtro che riordina di colpo disorienta |
| **Animated Cards** n.11 *Skeleton-to-Loaded* | Lo scheletro ha **la stessa geometria** della card vera e il contenuto entra in dissolvenza invece di scattare | I nostri caricamenti: `--color-skeleton` esiste già nel tema |
| **Skeleton Loaders** n.9 *Stat Tiles* e n.8 *Table Rows* | Scheletri per **tessere KPI** e **righe di tabella** | Il cruscotto dell'area Comune e le code |
| **Steppers** n.4 *Vertical Timeline* | Passi su una **spina verticale**, ognuno si apre nella sua scheda quando è attivo | 🔑 Il **percorso di una segnalazione** (ricevuta → validata → in lavorazione → risolta), che oggi è una pastiglia di stato e basta |
| **Star Ratings** n.5 *Accessible ARIA* | `fieldset`/`legend` semantici, `:focus-visible` e **live region che annuncia la selezione** | Le **valutazioni dei servizi**: è P24 su una seconda superficie |
| **Progress Bars** n.7 *Goal Tracker* | Avanzamento con **marcatori di traguardo** lungo la barra | I **cantieri**: il marcatore «dove dice il calendario» esiste già — i traguardi intermedi no |
| **Liquid Glass** n.8 (nota dell'autore) | «*il vetro ha bisogno di texture viva dietro*» | **Conferma indipendente** di `DESIGN.md` §6: la grana della tela non è decorazione, è ciò che dà al vetro qualcosa da sfocare |
| **Liquid Glass** n.1 e n.14 | Il vetro deforma **la griglia** del grafico ma la **serie e il KPI restano nitidi** | La disciplina del payload sul pieno, applicata ai grafici |
| **Animated Cards** n.4 *View Transitions morph* | La card si trasforma nel dettaglio invece di tagliare | **Conferma della nostra architettura**: `shared-element-link.tsx` fa già questo con le View Transitions native |

#### Due avvertenze che valgono più di un pattern

1. ⚠️ **Il loro «trucco di `pathLength`» per disegnare le sparkline è la
   nostra trappola pagata.** `AGENTS.md` §3 (ondata 6, 1): `pathLength` e
   `vector-effect: non-scaling-stroke` insieme **accorciano il tracciato** —
   nel grafico dell'andamento mancavano due mesi su dodici, e nessun errore lo
   segnalava. Se si prende quel codice, si prende senza `non-scaling-stroke`,
   o si rivela la linea con una tendina di ritaglio.
2. ⚠️ **`@starting-style` e `animation-timeline: scroll()` sono ottimi ma
   vanno misurati contro il nostro `browserslist`.** Tolgono JavaScript e
   girano fuori dal thread principale; il costo è che sotto la soglia di
   supporto degradano in silenzio — e `DESIGN.md` §11.9 vieta che un contenuto
   resti invisibile perché un'animazione non è partita.

#### Le collezioni non aperte, e perché

**Fuori perimetro**: Product Cards (Shopify), Pricing Tables, Testimonials,
NFT/crypto, Flip Cards, 3D Tilt (`AGENTS.md` §2 vieta il 3D pesante), Image
Slider (i caroselli sono ostili al tocco e nascondono contenuto), Play/Pause,
Close Buttons, Gradient e Glowing Buttons (il repertorio più generico).
**Da guardare quando servirà la superficie**: Modals, Calendars, Custom
Select, Toggles, Multi-Step Form, Floating Label Inputs, Radio, Checkboxes,
File Upload, Profile Cards, Range Sliders, Button Groups, Cards, Buttons,
Login Forms, Input Fields, Stacked Cards, Floating Buttons, Glassmorphism
Cards. Non è pigrizia: aprire una collezione senza avere davanti la
superficie che deve risolvere produce una lista di cose carine e nessuna
decisione.

## 3. I pattern estratti (la sintesi che vale)

Ognuno con la porta d'ingresso in Pistoia.app. Sono **materiale per le
direzioni**, non decisioni: decide Lorenzo sulle pagine vere.

| # | Pattern | Da dove | Come entra |
|---|---|---|---|
| P1 | **Il vetro è il livello funzionale, non il contenuto** | HIG §1 + onda 2.4 | La biforcazione delle direzioni: vetro su testata/barre/palette/menu, contenuto su superfici piene — oppure vetro sulle card come oggi, ma con la disciplina di P2 |
| P2 | **Il payload si legge sul pieno** | Orphis 2.1, HIG *regular* | Qualunque direzione vinca: il dato minuto vive su superficie opaca; il vetro fa cornice e atmosfera |
| P3 | **Il calore sta nell'ambiente, non nei componenti** | Paperpillar 2.2 | La tela calda può prendere una LUCE (gradiente ambientale tenue, grana): i componenti restano neutri, la semantica salva |
| P4 | **Un'isola scura per pagina** | Paperpillar 2.2 | Il numero-monumento o il fatto del giorno come unica card scura della prima pagina: gerarchia senza colore |
| P5 | **Lo scuro è vetro sulla città di notte** | Kosholap 2.3 + Linear 2.8 | Tema scuro: gradini di luminanza + UN accento caldo + scena ambientale dietro il vetro. Struttura da Linear, anima no |
| P6 | **La tipografia fa il lusso, il colore fa la semantica** | tutti; già nostro (§5) | Si alza il grado: display più coraggioso sulla prima pagina, cromo più silenzioso attorno |
| P7 | **I numeri in cima alla prima pagina** | FT 2.7 | La fascia-dati sopra la testata: il fatto del giorno ha un modello di prodotto vivo da decenni |
| P8 | **La prima pagina è un canone che si eredita** | Gazette 2.6 + FT | Apertura → spalla → taglio basso, kicker, rubrica: la `/` nuova si disegna da giornale, non da dashboard |
| P9 | **Il vetro premium ha varianti materiche** | Chapuy 2.5 + HIG | Due-tre gradi di vetro dichiarati (regular/clear; cannettato SOLO nei momenti di marca), non un blur unico |
| P10 | **Il civico premium è QUASI vuoto — l'eccezione (Helsinki) è lo standard mondiale, e l'ufficiale usa l'araldica** | Behance 2.9 · ⚠️ corretto da hel.fi (2-bis.5) | La tesi del posizionamento regge: la categoria è scoperta, e chi la occupa bene diventa IL riferimento. Confermato il divieto §1.4: mai stemma/scacchiera come identità (Helsinki può astrarre il proprio scudo perché È la città; noi no, ed è la distinzione) |
| P11 | **Il segno è un sistema nato da griglia, e il patrimonio si astrae in geometria** | Roamify + Porto 2.10 · Helsinki 2-bis.5 | Il logo: monogramma/segno su griglia geometrica, derivato dai motivi VERI (fasce romaniche, verde dei vivai — mai araldica), declinato su testata + icona home + favicon |
| P12 | **Il colore è il contesto: la tinta viene dai dati, non dal marchio** | Apple Sports 2-bis.1 | I temi civici hanno già colori propri: la pagina di tema (e la scena dietro il vetro) può prenderne la tinta; il marchio resta fermo |
| P13 | **La spiegazione accanto al dato** | Flighty 2-bis.2 · Il Post 2-bis.9 | La didascalia redazionale in una riga («perché questo numero conta») dentro la card del dato, non in un articolo altrove |
| P14 | **Pastiglie giocose su tela seria** | Copilot 2-bis.3 | I badge: fondo serio, chip di categoria/ruolo colorati e vivi — istituzionali sobri, comunità «catchy» (§1.14.4) |
| P15 | **La delizia è puntuale, il dato resta pulito** | Family 2-bis.4 | Conferma dei «tre momenti di festa» (`DESIGN.md` §7): il motion celebra gli atti civici, mai le superfici di lettura |
| P16 | **La città illustrata a filo** | Citymapper 2-bis.7 | Stati vuoti e testate leggere: Pistoia disegnata in linea capello (mura, fasce, vasi), mai illustrazioni stock |
| P17 | **Le meccaniche civiche esistono; l'eccellenza no — e la sobrietà è il registro dell'istituzionale** | FixMyStreet 2-bis.8 · gov.uk 2-bis.6 | La scommessa del posizionamento: meccaniche da FixMyStreet × materia Apple. E la sezione «Il Comune» si racconta col registro gov.uk: chiarezza radicale |
| P18 | **Il titolo-domanda in italiano piano** | Il Post 2-bis.9 | Il registro dei titoli umani degli atti e delle didascalie: spiegare senza gridare — la voce italiana di «numeri caldi, tono freddo» |
| P19 | **Il collage editoriale per il racconto, mai per i dati** | Akademia/Zajno 2-ter.1 | «Chi siamo» e le superfici del progetto possono essere umane e calde (foto in pillole, annotazioni); le superfici di lettura restano pulite |
| P20 | **La pagina-città: fotografia + riga di statistiche** | tubik «Chicago» 2-ter.3 | Le pagine quartiere e «Il Comune»: la città vista, poi i suoi numeri in riga — non una dashboard |
| P21 | **Il test dell'intruso** | 2-ter.2 | Ogni schermata di O10 deve rispondere: «che cosa, qui, esiste SOLO perché questa è Pistoia?» — se potrebbe stare in un portfolio Shakuro senza farsi notare, è rossa |
| P22 | **L'archivio profondo si naviga per anno, con l'etichetta che resta a lato** | CodeFronts 2-quater | L'archivio degli atti (O11): 26.644 decisioni in una colonna sola, raggruppate per anno, con l'anno appiccicato al bordo mentre scorri. Dice *dove sei* senza paginazione e senza filtri |
| P23 | **L'avanzamento della lettura si lega allo scroll, non a un listener** | CodeFronts 2-quater | `animation-timeline: scroll()` gira fuori dal thread principale: le pagine lunghe (bilancio, pagina atto) possono avere la barra di lettura a costo zero. Conferma la scelta già fatta in `ScrollTold` |
| P24 | **Un numero che si anima deve dire quando ha finito** | CodeFronts 2-quater | `DisplayNumber` conta da zero e chi usa uno screen reader non sa quando il valore è definitivo: serve una live region che annunci il valore assestato. È un buco di accessibilità nostro, trovato guardando un altro |
| P25 | **I filtri attivi vivono dentro la barra di ricerca, non accanto** | CodeFronts *Tagged Filter* | L'archivio atti: tipo, anno, tema e ufficio come chip removibili dentro il campo. Si vede che cosa si sta filtrando nel punto in cui si cerca |
| P26 | **Quando un filtro riordina una lista, le voci VIAGGIANO** | CodeFronts *FLIP re-layout* | Su 26.644 atti un riordino istantaneo disorienta: il movimento fra la posizione vecchia e la nuova è informazione, non ornamento |
| P27 | **Lo scheletro ha la geometria della cosa vera** | CodeFronts *Skeleton-to-Loaded* | I caricamenti: stesse misure della card finale e dissolvenza invece di scatto, così il contenuto «arriva» e la pagina non salta |

### Che cosa il filtro ha scartato, e perché

Il grosso di entrambe le ricerche: **gestionali blu/viola saturi, admin
template, crypto-dark generico, case study a illustrazioni stock.** Sono la
«UI da template» che il requisito esclude — utile averli visti, perché
definiscono il bordo: se una nostra schermata somiglia a quelli, è rossa.
(La regola di `DESIGN.md` §1 lo diceva già: «quando un pattern sembra "già
visto su dieci dashboard", è il segnale per ridisegnarlo».)

---

## 4. Il rosso: le prove da fare sul prodotto vero

Non deciso (per scelta, `prossima-sessione`): la quantità giusta si decide
con prove di palette montate sull'applicazione. Le tre dosi da provare,
adesso con un precedente ciascuna:

1. **Solo marchio + errore** (stato attuale): «.app» rosso in testata, rosso
   semantico intatto. Zero rischio, zero temperatura.
2. **+ kicker editoriali** (il precedente FT): la parola-tema rossa sopra i
   titoli della prima pagina e delle pagine atto. Il rosso diventa voce
   editoriale dosata, mai allarme. ← *l'ipotesi da cui partirebbe chi
   scrive, dichiarata come tale*
3. **+ accenti diffusi** (rosso come secondo colore d'azione accanto al
   teal): la più identitaria e la più rischiosa — il vincolo «resta il
   colore d'errore, la semantica non si confonde» va misurato caso per caso.

---

## 5. Dove questo incontra il sistema che c'è già

- La **direzione ibrida** (`DESIGN.md` §2) regge: i riferimenti danno la
  forma, Pistoia il significato. Questa ricognizione non la rovescia — la
  arma con pattern più precisi.
- **`DESIGN.md` §1 si riscrive dentro O10** («è il Comune che parla» non è
  più vero): con l'identità nuova, il carattere diventa «parliamo DI
  Pistoia» — indipendente, curato, mai istituzionale per travestimento.
- **P1 tocca `DESIGN.md` §6** (vetro sulle card): qualunque esito, la
  decisione va scritta lì consapevolmente, mai lasciata in disaccordo.
- I quattro componenti-firma (`DisplayNumber`, `MeshSurface`,
  `DotScatterTimeline`, `ScrollTold`) restano; P4 e P7 danno loro palchi
  nuovi sulla prima pagina.

---

## 6. Le direzioni da montare (proposta per il giudizio di Lorenzo)

Da portare su **pagine vere e fotografate** (mockup iniettati, stili in
linea per le classi non nel sorgente) al prossimo giro — non costruite qui.
Due direzioni per la faccia canonica + una tesi condivisa per la notte:

| | **D1 — «La piazza di giorno»** | **D2 — «Vetro di città»** |
|---|---|---|
| Tesi | Grammatica Apple piena: contenuto su superfici PIENE calde, vetro solo sul telaio (testata, barre, palette, menu), luce ambientale sulla tela (P3), un'isola scura per pagina (P4) | Il vetro resta sulle card (continuità con oggi) ma sale di grado: due materiali dichiarati (P9), payload su pieno (P2), profondità ambientale dietro (mesh/scena) |
| Forza | La più leggibile e la più «prodotto vero»; combacia col canone HIG; il lusso viene da luce+tipografia | La più riconoscibile e continua col sistema attuale; il «wow» del vetro resta protagonista |
| Rischio | Percepita come passo indietro sul vetro («meno glassmorphism») | Regge solo con disciplina P2 ferrea; il confine col «template glass» è più sottile |
| Costo | Tocca `DESIGN.md` §6 (vetro spostato) | Tocca meno il sistema, più le singole card |

**D3 — «Il terminale di notte» (tesi condivisa, non alternativa):** il tema
scuro di entrambe è vetro scuro sopra la città (P5) — gradini di luminanza,
un accento caldo, il momento «Linear» concesso dalla direzione. Flighty
(2-bis.2) è la pezza d'appoggio di prodotto: uno scuro «di prima classe» che
resta caldo e preciso.

**Pattern del secondo giro che entrano in ENTRAMBE le direzioni** (non
biforcano, arricchiscono): P12 la tinta dal tema civico sulle pagine di
tema · P13 la didascalia dentro la card del dato · P14 le pastiglie dei
badge · P16 la città a filo negli stati vuoti · P18 il titolo-domanda. Il
tabellone di Apple Sports (2-bis.1) è la grammatica del numero-monumento in
tutte e due.

*Raccomandazione di chi scrive, con l'argomento onesto:* **D1**, perché il
canone Apple mette il vetro dove non costa leggibilità e il nostro prodotto
vive di lettura (atti, numeri, didascalie) — e perché l'isola scura + la
luce ambientale danno il «lusso che accoglie» senza un pixel di rischio
AA. Ma D2 è la continuità del sistema costruito in tre mesi, e Lorenzo
spesso compone la quinta: le due direzioni sono fatte per essere smontate e
ricombinate.

---

## 7. Prossimi passi

1. **Il giudizio di Lorenzo su questa ricognizione** (tappa a): i pattern
   reggono? il filtro è quello giusto? mancano piste?
2. **Tappa b**: 2–3 direzioni montate su pagine vere — prima pagina `/`,
   una pagina di lettura (atto), una di lavoro — fotografate nei due temi.
3. Dentro il vestito scelto: rebranding (censimento grep prima), prima
   pagina, riordino, logo (P11), badge, pagina atto — l'ordine di dipendenza
   sta in `ROADMAP.md`, Ondata 10.
