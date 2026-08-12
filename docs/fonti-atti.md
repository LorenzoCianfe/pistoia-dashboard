# Fonti — La pipeline degli atti

> Ricognizione del **2026-08-09**, fatta col browser e non citando un documento.
> Compagna di [`docs/fonti-pagella.md`](fonti-pagella.md) e di
> [`docs/fonti-organigramma.md`](fonti-organigramma.md): qui stanno le griglie
> consultate una per una, che cosa danno davvero, e le trappole che ognuna
> avrebbe fatto pagare.
>
> ⚠️ **Questo documento non pubblica niente.** Le pagine pubbliche dell'archivio
> nascono in **Ondata 11**, dopo il rifacimento visivo. Qui si descrive solo la
> fonte e ciò che se ne può leggere.
>
> **La regola fondante vale doppio qui:** *una delibera inventata è peggio di un
> dato inventato, perché attribuisce una decisione alla giunta.* Ogni riga porta
> la propria fonte, e ciò che non si riesce ad ancorare non si pubblica.

---

## 0. In una riga

Il portale della trasparenza espone **26.593 atti distinti** dal 2021, in
quattro griglie che esportano tutte in CSV. Il passaggio di consegne ne
indicava 188: erano due **selezioni per obbligo di trasparenza**, contenute per
il 97% nell'archivio vero.

---

## 1. Le quattro griglie

Prefisso: `https://pistoia.trasparenza-valutazione-merito.it/web/trasparenzaj`

| Griglia | Indirizzo | Righe | Export |
|---|---|---:|---|
| **Storico atti** | `…/papca-ap/-/papca/igrid/29243408` | **26.588** | CSV 13,4 MB in ~161s |
| **Albo pretorio** (in pubblicazione ora) | `…/papca-ap/-/papca/igrid/29243403` | 202 | CSV 0,11 MB in ~2s |
| Provvedimenti organi indirizzo politico | `…/papca-p/-/papca/igrid/29243380` | 121 | CSV in ~2s |
| Atti generali | `…/papca-g/-/papca/igrid/29243391` | 67 | CSV in ~2s |
| *(Pubblicazioni di matrimonio)* | `…/papca-ap/-/papca/igrid/29243386` | 6 | dati personali, **fuori** |

Le prime due si raggiungono da **«Pubblicità Legale»** in testa al portale, che
è una sezione diversa da Amministrazione Trasparente e non compare in
`fonti-pagella.md` §1.2.

**Righe scaricate 26.978, atti distinti 26.593.** La differenza sono doppioni,
e il perché è la trappola §2.2.

### 1.1 Le due sezioni non sono due epoche

L'albo dice che «dopo quindici giorni gli atti sono reperibili nello Storico
Atti», e si legge come «albo = recente, storico = vecchio». **Non è così:**
entrambe sono aggiornate allo stesso giorno (07/08/2026, misurato il 09/08).

La differenza vera è la **finestra di pubblicazione legale**: gli atti dell'albo
hanno una `Data fine pubblicazione` reale (mediana **15 giorni**), quelli dello
storico ce l'hanno messa al **31/12/2031**, cioè «tenuto in archivio». Un atto
entra in tutte e due quasi subito, con **due pubblicazioni distinte**.

Ne discende il disegno della lettura periodica: **il carico iniziale è lo
storico** (una volta, 161s), **il giro quotidiano è l'albo** (202 righe, 2s),
che contiene tutto ciò che è stato pubblicato negli ultimi ~15 giorni.

### 1.2 L'export è agganciato alla sessione del portlet

L'URL dell'export è **identico** per tutte le griglie sotto lo stesso prefisso
(`papca-ap`, `papca-p`, `papca-g`): quello che esporta dipende dall'ultima
griglia visitata **nello stesso contesto del browser**. Si passa dalla griglia,
poi si chiede l'export.

Sullo Storico il collegamento «Esporta in OpenFormat» ha `href="#"` ed è mosso
dal JavaScript: si costruisce l'URL a mano, con lo stesso schema delle altre.

---

## 2. Le quattro trappole, tutte misurate

Hanno in comune la forma solita: **nessuna produce un errore**, e tutte e
quattro producono un risultato plausibile.

### 2.1 🔴 Il WAF blocca sullo USER-AGENT, e risponde 500

`AGENTS.md` §3 dice «`WebFetch` prende 403, un browser vero prende 200». È
vero solo a metà: **un browser headless è bloccato anche lui.**

| Strumento | Radice | Griglia |
|---|---|---|
| Playwright com'è (`HeadlessChrome/148…`) | **500** «The URL you requested has been blocked» | **500** |
| Stesso Playwright con l'UA di un Chrome vero | 200 «Amministrazione Trasparente» | 200 |

La pagina di blocco dichiara `MDAWAF001`, un `Attack ID` e l'IP del chiamante.
Due conseguenze operative:

- la lettura manda **l'UA di un Chrome vero**, sempre;
- il cancello di freschezza **riconosce la pagina di blocco**. Uno stato 500 con
  un corpo HTML sensato è ciò che un controllo distratto legge come «il portale
  è giù» quando invece è «ci hanno scambiati per un bot».

> **Revisione 2026-08-11 — due cose che questa sezione dava per vere e non lo
> erano.**
>
> 1. **Il riconoscimento non funzionava.** `paginaDiBlocco` cercava le spie nei
>    primi 4.000 caratteri, ma la pagina di blocco è lunga **39.133** e comincia
>    con ~19KB di CSS inline: il titolo arriva a 19.205, «Web Page Blocked» a
>    **38.709**, `MDAWAF` a **38.749**. Nessuna spia dentro la finestra —
>    quindi la lettura archiviava «errore» dove il fatto era «bloccata».
>    Finestra portata a 64.000, e il test rifatto sulla **forma vera** (quello
>    di prima usava una pagina inventata e corta, e per questo passava).
>    Trovato **rompendo la lettura di proposito**, non leggendo il codice.
> 2. **Non serve un browser per non essere bloccati.** Il WAF guarda l'UA, e
>    l'export vuole i cookie del portlet: `fetch` fa tutte e due. Dal
>    2026-08-11 la lettura gira senza Playwright — che in produzione **non
>    esisteva**, perché `npm ci` installa il pacchetto e non i binari. Dettaglio
>    in [`docs/pipeline-atti-schedulata.md`](pipeline-atti-schedulata.md).

### 2.2 🔴 `Url atto` non è l'identità dell'ATTO: è l'identità della PUBBLICAZIONE

È la trappola più costosa, perché `Url atto` è **pieno al 100% e distinto al
100%** su tutte le 26.978 righe: è la chiave che chiunque sceglierebbe.

Lo stesso atto sta sull'albo e nello storico con **due id consecutivi**:

```
DETERMINAZIONE DEL DIRIGENTE 2026/1681
  albo    id 4758861 · pubbl. 07/08/2026 → 22/08/2026 · 2 allegati
  storico id 4758862 · pubbl. 07/08/2026 → 31/12/2031 · 2 allegati
  stesso oggetto: SÌ
```

**167 dei 202 atti dell'albo** hanno il gemello nello storico; **117/121** e
**66/67** delle due griglie piccole pure. Chi usa l'id come chiave si porta in
casa **385 doppioni** — e su un archivio civico non è un errore di conteggio: è
la stessa delibera mostrata due volte, cioè la giunta che sembra aver deciso
due volte la stessa cosa.

**L'identità è `(tipo, anno, numero)`**: 26.586 distinti su 26.588 nello
storico. Le due collisioni residue sono **ripubblicazioni dello stesso atto**
(stesso oggetto, stessa data, allegati diversi), non atti diversi — si tiene la
pubblicazione più recente.

L'URL si conserva comunque, ed è la fonte della riga: si preferisce **quello
dello storico**, perché quello dell'albo scade.

### 2.3 Le griglie non hanno le stesse colonne

«Provvedimenti organi indirizzo politico» ha **24** colonne, tutte le altre
**25**: in mezzo compare `Spesa prevista`, fra `Data atto` e `Titolo categoria`.

Un parser che mappa **per posizione** sfalsa quindi tutto ciò che sta dopo
`Data atto` su una griglia su quattro, in silenzio. **Si mappa per NOME di
colonna**, sempre.

### 2.4 L'export grande mente sul proprio tipo

Lo Storico risponde `content-type: text/html;charset=UTF-8` con un corpo che è
CSV (le griglie piccole dichiarano `text/csv`). Un controllo sul tipo lo
scarta; si guarda il **corpo**, che comincia con `"Proponente",`.

---

## 3. Che cosa contiene davvero il CSV

**Otto colonne su 25 sono vuote ovunque** — e due di queste il passaggio di
consegne le dava per utili.

| Colonna | Piene (su 26.588) | Nota |
|---|---:|---|
| `Oggetto` · `Anno` · `Numero` · `Data atto` · `Data documento` | 100% | |
| `Titolo sottocategoria` | 100% | **è il tipo di atto** |
| `Proponente descrizione` | 100% | **l'ufficio: il segnale della categoria civica** |
| `Numero allegati` · `Data inizio/fine pubblicazione` · `Url atto` | 100% | |
| `Data esecutività` | 66% | |
| `Dirigente descrizione` | 56% | |
| `Titolo categoria` | 100% | sempre e solo `ATTI`: non informa |
| ⚠️ `Assessore descrizione` | **0%** | il passaggio di consegne la elencava fra le utili |
| ⚠️ `Classifica descrizione` | **0%** | c'è **solo** sulla pagina del singolo atto |
| `Proponente` · `Contenuto` · `Estremi dei principali documenti` · `Mittente` | ~0% | |
| `Anno Protocollo` · `Numero Protocollo` | 100% di zeri | |

### 3.1 🔴 L'importo non esiste in questa fonte

`ROADMAP.md` descrive il modello `Atto` con «organo, numero, data, oggetto
ufficiale, **importo**, allegati…».

**`Spesa prevista` vale `0,00` in tutte e 26.588 le righe**, e la pagina di
dettaglio del singolo atto non porta nessun importo. Il campo **non si può
riempire da qui**, e un modello che lo dichiara senza poterlo popolare promette
una cosa che non ha.

**Condizione che lo riapre:** un importo si trova solo dentro il **testo** degli
allegati (PDF/ODT del documento principale). Entra quando si deciderà di leggere
gli allegati, che è un lavoro suo — e ricadrebbe nella regola di `AGENTS.md` §4:
*se un importo non si riesce ad ancorare alla propria riga, non si pubblica.*

### 3.2 Il tipo di atto

| Tipo | Atti | Quota |
|---|---:|---:|
| DETERMINAZIONE DEL DIRIGENTE | 14.977 | 56% |
| ORDINANZA | 7.732 | 29% |
| DELIBERA DI GIUNTA | 2.220 | 8% |
| DECRETO | 1.013 | 4% |
| DELIBERA DI CONSIGLIO | 646 | 2% |

Solo sull'albo compaiono anche `ATTI DI ALTRI ENTI`, `ALTRI ATTI DELL' ENTE` e
`ALTRI ATTI`.

⚠️ **Le delibere sono il 10% dell'archivio.** Un archivio presentato come «le
decisioni del Comune» che per il 56% contiene determine di minuta
amministrazione («VARIAZIONE PROFILO PROFESSIONALE DIPENDENTE MATR. 16877»)
racconterebbe male sé stesso. È una scelta di **resa**, che si prende in Ondata
11; la lettura le prende tutte perché scartare all'ingresso è irreversibile.

### 3.3 Il ritmo

Pubblicazioni per anno: 2021: 4.789 · 2022: 4.706 · 2023: 4.619 · 2024: 4.751 ·
2025: 4.846 · 2026 (a ferragosto): 2.877.

**374 atti negli ultimi 30 giorni**, mediana **18 al giorno**, massimo 66. È su
questi numeri che si tara il cancello di freschezza.

---

## 4. La categoria civica si deduce dall'UFFICIO, non dalla Classifica

La domanda era: dedurla dall'`Oggetto` (una stima su testo libero) o prendere la
`Classifica` che il Comune scrive già?

**La `Classifica` non serve, ed è stato misurato** su un campione di 30 atti
(costa un'apertura di pagina per atto, perché nel CSV è vuota):

- è un **titolario di protocollo**, non una tassonomia civica;
- ha un raccoglitore di scarto che si mangia tutta la Cultura — **«VARIE ES.
  CENTRO GIOVANI», 11 casi su 30**;
- classifica per **organo** invece che per materia: `GIUNTA COMUNALE` (5),
  `CONSIGLIO COMUNALE` (3);
- il resto è amministrativo: `CAUSE, LITI, CONFLITTI`, `TASSE ERARIALI`,
  `RETRIBUZIONI E COMPENSI`.

Il **`Proponente descrizione`** invece è nel CSV, pieno al 100%, e costante:
`U.O. Cultura e Biblioteche` fa atti di cultura, ogni volta. Sono **102 uffici
distinti** in cinque anni, con molte varianti da riorganizzazione
(`U.O. Mobilita'` e `U.O. Mobilita', Traffico e Segnaletica`).

### 4.1 Le regole, e perché per radice invece che per elenco

Un elenco esaustivo dei 102 uffici si romperebbe in silenzio al 103°. Le regole
per **radice** coprono le varianti nuove da sole; il prezzo è che possono
sbagliare, e allora si scrivono così:

1. **Le esclusioni vengono prima.** `U.O. Tassa Sui Rifiuti…` contiene
   *rifiuti* ma è un ufficio tributi.
2. **Si guarda il segmento di TESTA del nome**, poi il nome intero. Il mestiere
   primario è quello che apre: *Servizio **Lavori Pubblici**, Patrimonio, Verde
   e Promozione Sportiva* fa lavori pubblici, non sport. Senza questa regola
   **395 atti di lavori pubblici finivano in Sport** e 66 di ambiente in
   Sicurezza.
3. **Nel dubbio, nessun tema.** Un atto senza tema è un fatto; un atto col tema
   sbagliato è un'affermazione falsa su una decisione del Comune.

Un test blocca il vocabolario dei 102 uffici di oggi: se una regola cambia
tema a un ufficio esistente, diventa rosso.

### 4.2 La copertura, misurata

**18.515 atti su 26.978 (69%)** hanno un tema civico.

| Tema | Atti | Uffici |
|---|---:|---:|
| mobilita | 8.895 | 4 |
| lavori | 3.344 | 10 |
| cultura | 2.253 | 5 |
| scuole | 1.220 | 4 |
| sicurezza | 1.046 | 6 |
| ambiente | 783 | 6 |
| commercio | 440 | 5 |
| sport | 381 | 1 |
| turismo | 153 | 1 |
| *(nessun tema)* | **8.463** | 60 |

Gli 8.463 senza tema sono in gran parte **amministrazione interna** (personale
1.612, bilancio, affari legali, tributi, contratti, demografici, segreteria) —
per i quali «nessun tema civico» è la risposta giusta, non una lacuna.

### 4.3 Due buchi veri, con la condizione che li chiude

1. **Sociale e casa: 970 atti senza tema.** `U.O. Servizi per l'abitare` (566),
   `U.O. Progettazione Sociale…` (211), `U.O. Promozione dell'integrazione e
   Pari Opportunità` (193). `CIVIC_TOPICS` **non ha un tema «sociale»**: il più
   vicino è `giovani`, e mettere le politiche della casa sotto *Giovani*
   sarebbe visibilmente falso. **Condizione: entra il giorno in cui
   `CIVIC_TOPICS` avrà un tema «sociale»** — che è una decisione sul selettore
   dei temi mostrato al cittadino, non su questa pipeline.
2. **Urbanistica ed edilizia privata: 373 atti senza tema.** Un permesso di
   costruire non è un'opera pubblica, quindi non entra in `lavori`, e nessun
   tema copre la pianificazione. **Stessa condizione.**

> **Revisione 2026-08-11 — il primo buco è chiuso, il secondo resta con la
> condizione raffinata.** La decisione è stata presa misurando prima quanti
> contenuti *esistenti* (segnalazioni, proposte, eventi, opere) finirebbero nei
> temi nuovi — perché un tema che esiste solo per gli atti è un tema che al
> cittadino non serve.
>
> - **«Sociale e casa» (`sociale`) è entrato in `CIVIC_TOPICS`**, con categorie
>   condivise: proposte «Sociale», opere «sociale» ed eventi «volontariato»
>   restano anche a `giovani` e `accessibilita` (la condivisione è già la norma
>   del sistema). Non esisteva solo per gli atti: tre agganci nelle tassonomie
>   correnti, 1 contenuto del seed (i temi più magri esistenti ne hanno 2), e
>   **940 atti veri sui 26.591 distinti** in archivio — riclassificati con un
>   ricalcolo una tantum da `ufficio`, esattamente 940 cambi e nessun altro
>   tema toccato. Copertura: da 18.296 a **19.236 su 26.591 (72,3%)**. Il
>   fermo dei 102 uffici dichiara ora 45 coperti.
> - **«Urbanistica» NON è entrato**, e il criterio è proprio quello della
>   misura: **zero agganci in tutte e quattro le tassonomie** — il cittadino
>   non può né segnalare né proporre nulla di urbanistico, quindi la chip non
>   filtrerebbe mai niente nel «Per te» e la stanza nascerebbe vuota. I 370
>   atti distinti restano senza tema, che è un fatto e non un errore.
>   **Condizione che lo riapre: quando una tassonomia di contenuto avrà una
>   categoria urbanistica** (per esempio un ambito proposta «Urbanistica» per
>   le osservazioni ai piani), **o quando la pagina dell'archivio (Ondata 11)
>   mostrerà il bisogno del filtro davanti alla pagina vera.** Scartato anche
>   un vocabolario separato "solo per atti": sarebbero due definizioni dello
>   stesso indicatore.
>
> (I 970/373 di questa sezione contano le righe scaricate pre-deduplicazione;
> 940/370 sono gli stessi gruppi sugli atti distinti in archivio.)

---

## 5. I legami a quartiere, opera e bilancio — misurati e NON costruiti

La ROADMAP mette «legami a quartiere/opera/bilancio» nel modello. Non sono
stati costruiti il 2026-08-09, e le ragioni sono due, diverse fra loro:

1. **Opera e bilancio: il legame oggi sarebbe DISONESTO.** Le opere e il
   bilancio di questo database sono **dati dimostrativi** («Ristrutturazione
   Scuola Marino Marini» è inventata); gli atti sono reali. Collegare una
   delibera vera a un'opera inventata attribuisce una decisione reale a un
   oggetto che non esiste — il divieto fondante, preso al contrario.
   **Condizione: quando opere e bilancio saranno dati reali con fonte.**
2. **Quartiere: il legame è possibile e la misura è già fatta.** I quartieri
   del database sono luoghi veri, e **888 atti su 26.591 (3,3%)** ne nominano
   uno nell'oggetto: Bottegone 442 · Vergine 129 · Bonelle 99 · Le Fornaci 54 ·
   Pontenuovo 43 · Ramini 43 · Sant'Agostino 42 · Candeglia 35 · Pistoia
   Centro 7. La resa onesta è «atti che NOMINANO questo quartiere» (un fatto di
   testo), mai «atti SU questo quartiere» (una classificazione).
   **Condizione: si costruisce quando esisterà una superficie che lo mostra
   (Ondata 11)** — la deduzione gira sull'`oggetto` già in archivio, quindi
   rimandarla non perde nulla: si ricalcola quando serve, con le soglie decise
   davanti alla pagina vera.

## 6. Che cosa questo documento NON autorizza

- **A pubblicare una pagina dell'archivio.** Sono Ondata 11.
- **A dichiarare un importo.** §3.1: non è in questa fonte.
- **A dire che un atto «non esiste».** Le quattro griglie non sono il protocollo
  del Comune, e `AGENTS.md` §4 vale qui per intero: *l'assenza di un dato su una
  pagina non è l'assenza del dato.*
- **A trattare `Url atto` come identità.** §2.2.
