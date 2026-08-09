# Fonti — «La pagella della giunta»

> Ricognizione **preparatoria** del 2026-08-08. Compagno di
> [`docs/piano-pagella.md`](piano-pagella.md), sul modello di
> [`docs/fonti-organigramma.md`](fonti-organigramma.md): qui stanno le fonti
> consultate una per una, con l'indirizzo e la data, e ciò che **non** si è
> trovato — che in una ricognizione vale quanto ciò che si è trovato.
>
> ⚠️ **Questo documento non è un'edizione, e non ne contiene una.**
> `EDIZIONI` in `lib/pagella.ts` resta vuoto, e resta vuoto per disegno fino
> al **27 agosto 2026** (`piano-pagella.md` §1.1, regola 3). Qui non c'è
> nessun voto, nessun esito, nessun controllo dichiarato superato o fallito.

---

## 0. Perché questo documento esiste, e perché oggi

Il Lavoro 3 chiedeva «il P-3 della pagella e il censimento delle linee
programmatiche». **P-3 per intero non è possibile oggi** e non per una
difficoltà pratica: il piano lo vieta. La prima edizione non nasce prima del
termine dell'art. 14 — il 27/08/2026 — perché prima di quella data un'assenza
sul portale è ancora dentro i termini di legge, e contarla come punto perso
sarebbe un'accusa tratta da un dato mancante.

Quello che si poteva fare oggi, e che è stato fatto, è la **ricognizione
preparatoria**: aprire tutte le fonti che i dieci controlli citano, verificare
che siano raggiungibili, e prendere l'indirizzo esatto di ciascuna. Più il
censimento della materia Promesse, che non dipende dall'art. 14.

Il risultato più utile è §1: **la mappa**. Senza, ogni ricognizione futura
ricomincia a cercare cliccando.

---

## 1. La mappa del portale Amministrazione Trasparente

**Consultato il 2026-08-08.** Radice:
<https://pistoia.trasparenza-valutazione-merito.it/>

### 1.1 Il portale è una SPA travestita, e gli indirizzi veri stanno nel JavaScript

È la trappola di `AGENTS.md` §4 («quando una pagina non ha il dato, cerca
l'endpoint che glielo serve»), incontrata di nuovo e in una forma nuova.

Il menu di Amministrazione Trasparente ha voci che sembrano link e non lo
sono: `href="#"` con `onclick="return false;"`, oppure `href` verso la
**radice del sito**. Un lettore automatico che raccogliesse gli `href`
concluderebbe che il portale ha una pagina sola.

L'indirizzo vero sta in un attributo `data-mainurl`:

```html
<a href="https://pistoia.trasparenza-valutazione-merito.it/"
   data-resource="Organizzazione - Titolari di incarichi politici…"
   data-mainurl="/web/trasparenzaj/papca-g/-/papca/igrid/29243389"
   data-isfoglia="true">
```

Da lì escono **94 voci foglia**, ognuna con la propria griglia di dati.

⚠️ E `WebFetch` sulla radice prende **403**, mentre un browser vero prende
200: la fonte non è irraggiungibile, è lo strumento sbagliato. Stessa
famiglia dei risultati elettorali di `fonti-organigramma.md` §1.

### 1.2 Gli indirizzi dei dieci controlli

Ogni controllo di `CONTROLLI` (`lib/pagella.ts`) con la griglia che lo
riguarda. **Raggiungibilità verificata il 2026-08-08; lo stato dei contenuti
NO** — quello è la ricognizione vera, e si fa dopo il 27/08.

| Controlli | Sezione del portale | Indirizzo |
|---|---|---|
| `art14-*` (cinque lettere + termini) | Organizzazione › Titolari di incarichi politici, di amministrazione, di direzione o di governo | `…/papca-g/-/papca/igrid/29243389` |
| — (contesto per gli `art14-*`) | Organizzazione › Organi di indirizzo politico | `…/papca-g/-/papca/igrid/29280675` |
| `art33-indicatore` | Pagamenti dell'amministrazione › Indicatore di tempestivita' dei pagamenti | `…/papca-g/-/papca/igrid/29243397` |
| `tuel-preventivo`, `tuel-rendiconto` | Bilanci › Bilancio preventivo e consuntivo | `…/papca-g/-/papca/igrid/29243416` |
| `pagamenti-termini` | Pagamenti dell'amministrazione › Indicatore di tempestivita' dei pagamenti | `…/papca-g/-/papca/igrid/29243397` |
| *(atti di indirizzo, per Promesse)* | Provvedimenti › Provvedimenti organi indirizzo politico | `…/papca-p/-/papca/igrid/29243380` |
| *(atti generali, per Promesse)* | Disposizioni generali › Atti generali | `…/papca-g/-/papca/igrid/29243391` |

Il prefisso è `https://pistoia.trasparenza-valutazione-merito.it/web/trasparenzaj`.

### 1.3 Ogni griglia esporta l'elenco intero, e va usato

In fondo a ogni griglia c'è **«Esporta in OpenFormat»** (CSV) e «Versione
Stampabile» (PDF). Il CSV dà **tutte** le righe in un colpo: 67 per «Atti
generali», 121 per «Provvedimenti organi indirizzo politico».

Si usa quello, e non si sfoglia: sfogliando quattro o sette pagine si perde
una riga senza accorgersene, ed è il modo in cui una ricognizione dichiara
un'assenza che non c'è. Il link dell'export è agganciato alla sessione del
portlet, quindi va chiesto **dopo** essere passati dalla griglia, nello
stesso contesto del browser.

---

## 2. Il censimento delle linee programmatiche — che cosa si è trovato

**Esito in una riga: le linee programmatiche di mandato sono state
PRESENTATE al Consiglio il 15/06/2026, e il testo non risulta pubblicato in
nessuna delle quattro fonti aperte. Nessun impegno è quindi censibile oggi.**

### 2.1 La fonte che regge: l'ordine del giorno

Comune di Pistoia — Archivio consiglio, «Ordine del Giorno del Consiglio
Comunale», consultato il 2026-08-08:
<https://archivioconsiglio.comune.pistoia.it/il-comune/consiglio-comunale/ordine-del-giorno-del-consiglio-comunale>

> Consiglio comunale di Lunedì 15/06/2026 dalle 14,00 in poi
> 1. ELEZIONI AMMINISTRATIVE DEL 24 E 25 MAGGIO 2026 – ESAME CONDIZIONE DEGLI ELETTI
> 2. NOMINA DEL PRESIDENTE DEL CONSIGLIO COMUNALE
> 3. NOMINA DEL VICE PRESIDENTE DEL CONSIGLIO COMUNALE
> 4. GIURAMENTO DEL SINDACO
> **5. LINEE PROGRAMMATICHE DI MANDATO – PRESENTAZIONE**
> 6. COMUNICAZIONE DEI NOMINATIVI DEI COMPONENTI DELLA GIUNTA
> 7. NOMINA DELLA COMMISSIONE ELETTORALE COMUNALE

La pagina è **testo**: nessun allegato, nessun PDF, nessun link al documento.

### 2.2 La data della seduta è confermata da un atto, non dalla stampa

Nella griglia «Provvedimenti organi indirizzo politico» del portale della
trasparenza c'è una **delibera di consiglio 2026 n. 53, seduta 15/06/2026**,
oggetto «NOMINA DELLA COMMISSIONE ELETTORALE COMUNALE» — che è il **punto 7**
dello stesso ordine del giorno.

Vale la pena scriverlo perché è il tipo di riprova che `AGENTS.md` §4 chiede:
i due percorsi — l'archivio del consiglio e l'albo degli atti — **non
condividono l'anello**, e portano alla stessa data.

### 2.3 ⚠️ La stampa dice «approvate», l'atto dice «presentazione»

Due testate locali riferiscono che le linee programmatiche sarebbero state
**approvate** con 18 voti favorevoli e 6 contrari:

- <https://www.reportpistoia.com/consiglio-comunale-il-programma-di-mandato-del-sindaco-capecchi/>
- <https://www.valdinievolenews.it/pistoia-si-insedia-il-nuovo-consiglio-comunale-paolo-tosi-presidente-capecchi-presenta-il-programma-di-mandato/>

L'ordine del giorno del Comune dice **«PRESENTAZIONE»**.

**Non sono la stessa cosa, e la differenza non è formale.** Il TUEL art. 46
c. 3 dice che il sindaco *presenta* le linee programmatiche al Consiglio;
se ci sia anche un voto, e su che cosa, lo decide lo statuto comunale. Una
votazione può esserci stata su un documento collegato senza che esista una
delibera di approvazione delle linee.

**La divergenza resta aperta**, e nessuna delle due versioni entra in una
pagina finché non è chiusa. Il rischio dichiarato è il peggiore che questo
progetto conosca: scrivere «delibera di approvazione delle linee
programmatiche del 15/06/2026» significherebbe **attribuire alla giunta una
decisione la cui esistenza non è provata**, che è la cosa che
`AGENTS.md` vieta per prima.

### 2.4 Dove il documento NON è stato trovato

Quattro fonti aperte il 2026-08-08. **Nessuna assenza qui è una conclusione**:
`AGENTS.md` §4 dice che l'assenza di un dato su una pagina non è l'assenza
del dato, e questa nota esiste per non farla diventare tale.

| Fonte | Righe esaminate | Esito |
|---|---:|---|
| Disposizioni generali › Atti generali (CSV intero) | 67 | nessuna riga sulle linee programmatiche |
| Provvedimenti › Provvedimenti organi indirizzo politico (CSV intero) | 121 | nessuna riga sulle linee programmatiche |
| Archivio consiglio › Ordine del Giorno | — | il punto c'è, il documento no |
| Portale del consiglio `pistoia.consiglicloud.it` | — | le sedute pubblicate cominciano dal **27/07/2026**: il 15/06 non c'è |

⚠️ L'unica riga che contiene «programmatic» in tutti e 188 gli atti esportati
riguarda una co-progettazione del terzo settore («direttive programmatiche»),
e **non** c'entra: è la trappola di chi cerca per parola invece che per atto.

### 2.5 Che cosa ne discende per la materia «Promesse»

Zero impegni censiti, quindi **la materia Promesse non ha ancora fatti da
mostrare** — e questo è coerente con quello che la pagina già dice, non una
regressione. `piano-pagella.md` §3 la dava «da censire in ricognizione»; la
ricognizione è stata fatta e ha trovato che **la fonte primaria non è
pubblicata**.

Da notare, per quando il documento salterà fuori: una testata riferisce che
il programma non fissa scadenze. Se fosse vero anche nel testo, la materia
resterebbe a **regime `fatti` senza nulla da contare** — cioè esattamente il
caso che il piano aveva previsto («nessuno fissa il traguardo, salvo gli
impegni che dichiarano una data propria»). Ma è un'affermazione di stampa su
un documento non letto, e finché il documento non si legge non vale niente.

---

## 3. Le condizioni che chiudono ciò che resta aperto

1. **Il testo delle linee programmatiche.** Condizione: si chiude quando il
   documento è raggiungibile con un indirizzo pubblico. Tre strade non ancora
   percorse, in ordine di costo: la seduta del 15/06/2026 sul portale
   `consiglicloud` **quando l'archivio arriverà indietro fino a giugno**; il
   verbale della seduta; una richiesta di **accesso civico** — che è
   un'azione verso il Comune, quindi una decisione di Lorenzo e non
   dell'agente (`piano-pagella.md` §7.3 dice lo stesso per la replica).
2. **«Presentate» o «approvate».** Condizione: si chiude leggendo il verbale
   della seduta del 15/06/2026, o l'eventuale delibera. Finché non è chiusa,
   la pagella **non nomina** né l'una né l'altra.
3. **Lo stato dei dieci controlli.** Condizione: **dopo il 27/08/2026**, sulle
   griglie di §1.2 — che ora hanno un indirizzo e non vanno più cercate.
4. **La griglia OIV/ANAC fra i controlli** (`piano-pagella.md` §7.1): resta da
   decidere alla prima ricognizione vera, non a questa preparatoria.

---

## 4. Che cosa questo documento NON autorizza

- **A pubblicare un'edizione**: `EDIZIONI` resta vuoto, e il test che lo fa da
  guardiano resta verde.
- **A dire che il Comune è inadempiente.** Le linee programmatiche non hanno
  un obbligo di pubblicazione nell'art. 14, e siamo **prima** del termine di
  quello che l'obbligo ce l'ha. Quattro fonti aperte non sono il portale
  intero.
- **A citare i giornali come fonte di un atto.** Le due testate stanno in §2.3
  perché documentano la **divergenza**, non perché provino un fatto.
