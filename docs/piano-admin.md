# Piano — spezzare `/admin` in sotto-rotte

> Deciso con Lorenzo il **2026-08-07**. Questo documento esiste perché la
> prossima sessione **esegua** invece di ridecidere: la scelta del taglio è già
> stata fatta, e il ragionamento che ci ha portati è qui sotto.
>
> Stato: **✅ eseguito il 2026-08-07**, e il debito che aveva lasciato aperto
> (§6, lista + dettaglio) **chiuso lo stesso giorno**. Due consuntivi: §7 il
> taglio, §8 le code.

---

## 1. Il difetto da cui nasce

`/admin` è alta **7.300px** con **dieci mestieri diversi** in una colonna sola,
senza indice né ancore. Il costo lo paga chi ci lavora: per arrivare a
«Moderazione community» si scorrono 6.000px del lavoro di qualcun altro.

Trovato il 2026-08-07 rivedendo `/admin` e `/redazione` **una schermata per
volta** — cosa che non era mai stata fatta. Nella stessa revisione sono usciti
altri tre difetti, già chiusi: la Redazione senza porta, i 446px di vuoto nel
footer, la gerarchia rovesciata in «Proposte cittadine».

**Il criterio non è l'altezza.** L'altezza massima conta solo per non ricreare
un secondo `/admin` dentro una pagina nuova.

## 2. Le misure, che hanno deciso il taglio

| Sezione | px | Natura |
|---|---:|---|
| Proposte cittadine | 1.710 | coda |
| Domande senza risposta | 1.308 | coda |
| Valutazioni dei servizi | 865 | coda |
| Richieste di verifica | 710 | coda |
| Segnalazioni aperte | 710 | coda |
| Moderazione community | 580 | coda + le proprie impostazioni |
| Aggiorna un cantiere | 546 | strumento |
| Crea un sondaggio | 546 | strumento |
| Invia una notifica | 416 | strumento |
| Registro delle azioni | 167 | lettura |
| **Totale** | **7.558** | |

**Il fatto che ha deciso:** «Proposte cittadine» da sola fa 1.710px, quindi il
taglio più fine possibile **non scende sotto quel numero**. Da qui la
conseguenza che ha scartato l'opzione a dieci pagine: *dieci pagine non sono
meglio di sette* — stesso massimo, tre rotte in più e quattro pagine da un
modulo solo.

E ha scartato anche il taglio «per verbo» in tre pagine, che era il più vicino
a come si lavora davvero: «rispondi» avrebbe fatto **4.593px**, cioè meno della
metà del problema risolto.

## 3. LA REGOLA (vale d'ora in poi, non solo per questo taglio)

> **Una coda, una pagina · gli strumenti insieme · le letture sul cruscotto,
> finché ci stanno · il registro è una lettura anche lui.**

Le quattro nature, e perché la distinzione ha conseguenze pratiche:

- **Coda** — il lavoro *arriva* e tu lo smaltisci. Vuole un **contatore** e vuole
  essere controllata.
- **Strumento** — non arriva niente, sei tu che decidi di usarlo. Vuole essere
  **trovato** quando serve, e non deve **mai** avere un pallino.
- **Lettura** — non produce e non smaltisce. Sta sul cruscotto **finché ci sta**;
  quando cresce oltre lo schermo, esce e prende una rotta sua.
- **Registro** — una lettura anche lui.

Mettere code e strumenti sulla stessa pagina è il motivo per cui oggi `/admin`
non sa dirti se c'è qualcosa da fare.

**La quarta natura è stata aggiunta provando la regola contro l'Ondata 8**, non
per completezza teorica: *alert su trend anomali* è una coda, *moderazione
assistita* modifica una coda esistente e non aggiunge una pagina, ma **analytics
operative** e il **monitor della pipeline degli atti** non sono né code né
strumenti. Senza la quarta natura sarebbero finite «dove capita», che è come
`/admin` è diventata un cassetto la prima volta.

### Due corollari, e sono la parte che rende la regola a prova di futuro

1. **Le impostazioni di una coda stanno sulla pagina di quella coda.** Le parole
   bloccate vivono con la moderazione. Un `/admin/impostazioni` è il modo
   classico in cui il cassetto si riforma altrove.
2. **Ogni rotta nuova entra in `rotte.mjs`, `shots.mjs` e
   `tests/e2e/pagine-cancello.ts` nello STESSO momento**, dichiarando il
   `ruolo:` — e con l'**atterraggio preteso**. Qui i guard reindirizzano invece
   di rifiutare: senza quel controllo una pagina admin aperta col ruolo
   sbagliato risponde 200 con contenuto valido, e il cancello certifica una
   superficie mai vista (`AGENTS.md` §4).

## 4. Il taglio: sette pagine

| Rotta | Contenuto | px stimati |
|---|---|---:|
| `/admin` | I quattro numeri · il foglio QR · **Registro delle azioni** · le porte alle sei | ~500 |
| `/admin/valutazioni` | Valutazioni dei servizi | 865 |
| `/admin/proposte` | Proposte cittadine | 1.710 |
| `/admin/domande` | Domande senza risposta | 1.308 |
| `/admin/segnalazioni` | Segnalazioni aperte | 710 |
| `/admin/cittadini` | Richieste di verifica + Moderazione community | 1.290 |
| `/admin/pubblica` | Aggiorna un cantiere + Crea un sondaggio + Invia una notifica | 1.508 |

`/admin/codici-qr` esiste già e non si tocca.

**Il punto discutibile, dichiarato:** `cittadini` fonde **due** code. Stanno
insieme perché sono lo stesso mestiere — tenere sana la comunità — e chi fa una
fa l'altra. Se un giorno la regola pura dovesse vincere, diventano otto pagine e
non cambia nient'altro.

## 5. Il lavoro, nell'ordine

1. **Spezzare `getAdminData()`.** Oggi è **un `Promise.all` unico** con dieci
   query (`src/lib/data/admin.ts`): senza spezzarlo, ogni sottopagina pagherebbe
   tutte e dieci. Una funzione per rotta, e i **conteggi** per il cruscotto in
   una funzione a parte e leggera (`count`, non `findMany`) — vedi il corollario
   qui sotto.
2. **La navigazione interna di `/admin/*`**, con i contatori sulle code e
   **nessun pallino sugli strumenti** (è la regola, resa visibile).
3. **Le sette pagine**, ognuna con `requireAdmin()`.
4. **`/admin` diventa il cruscotto**: numeri, QR, registro, porte.
5. **I cancelli**: `rotte.mjs`, `shots.mjs` (col `ruolo:`), `pagine-cancello.ts`.
6. **Verifica** per intero (`AGENTS.md` §5), con `npm run rotte` a dev acceso e
   gli E2E a dev spento.
7. **Documenti vivi**: FEATURES, CHANGELOG, ROADMAP, DOCUMENTATION §10, DESIGN.

⚠️ **Il conteggio non si prende da una lista troncata** (`AGENTS.md` §3, ondata
7, 2): i contatori della navigazione si chiedono al database con `count`, non
contando le righe che la pagina mostra. È già costato una volta, su
`getNeighborhoodDetail`.

## 6. Il debito che resta, con la condizione che lo chiude

**Le code fatte di moduli impilati non reggono la crescita.** «Proposte» fa
1.710px perché sono **quattro moduli identici in colonna**, e «Domande» (1.308)
ha la stessa forma. Con quattro voci si scorre; **con quaranta fa 17.000px**.

La medicina è **lista + dettaglio**, e riguarda tutte e due — non è un rimedio
per una pagina.

> **Condizione che lo apre:** quando una coda dell'area del Comune supera le
> **~10 voci**. È un fatto verificabile dai dati, non una data.

Non si fa insieme al taglio: sono due lavori con due rischi diversi, e il taglio
è utile da solo.

> ### ✅ CHIUSO il 2026-08-07, poche ore dopo
>
> La condizione era **già soddisfatta al momento di scriverla**: «Segnalazioni»
> 14 voci, «Valutazioni» 32. La forma l'ha scelta Lorenzo su tre mockup
> iniettati sull'applicazione vera — riga espandibile, pagina di dettaglio,
> pagina di dettaglio **più due colonne su desktop** — e ha preso la terza.
>
> Il consuntivo è in §8. La regola che ne è nata sta in `DESIGN.md` §6: *una
> coda è una lista, e il lavoro è una pagina.*

---

## 7. Consuntivo — che cosa è successo eseguendolo (2026-08-07)

### Le misure vere, a 1280px

| Rotta | Stimata | **Misurata** |
|---|---:|---:|
| `/admin` (cruscotto) | ~500 | **822** |
| `/admin/valutazioni` | 865 | **1.114** |
| `/admin/proposte` | 1.710 | **1.894** |
| `/admin/domande` | 1.308 | **1.492** |
| `/admin/segnalazioni` | 710 | **896** |
| `/admin/cittadini` | 1.290 | **1.457** |
| `/admin/pubblica` | 1.508 | **1.252** |

Ogni pagina paga ~190px di testata e navigazione che prima esistevano una volta
sola: è il costo del taglio, ed è dichiarato. **Il massimo passa da 7.558 a
1.894px**, cioè il quarto della pagina peggiore.

### Le due cose che il piano non aveva previsto

1. **Il riquadro che scorre dentro «Segnalazioni» doveva restare.** La prima
   stesura l'aveva tolto ragionando che «adesso a scorrere è la pagina».
   Misurato subito: **5.000px**, cioè una pagina più alta di quanto il piano
   preveda per l'intera area. Rimesso. Il rimedio vero è lista + dettaglio, e
   **la condizione che lo apre è già soddisfatta**: 14 segnalazioni aperte,
   oltre le ~10 di §6.

2. **«Valutazioni» mostra 6 recensioni e ne aspettano 32.** Il contatore lo ha
   rivelato al primo caricamento — la lista è troncata a sei da sempre, e
   nessuno lo sapeva perché nessuno contava. Le altre 26 non sono raggiungibili
   da quella pagina. Stesso rimedio, stessa condizione; nel frattempo la pagina
   **dichiara** di mostrare le più recenti invece di lasciar credere che siano
   tutte.

### Due decisioni tecniche che valgono oltre questo taglio

- **La navigazione sta dentro ogni pagina, non in un `layout.tsx`.** Nell'App
  Router un layout condiviso non si ri-renderizza navigando fra due sue figlie:
  i contatori resterebbero quelli del primo caricamento. Un contatore che mente
  è peggio di nessun contatore.
- **Le azioni rinfrescano tutto il sottoalbero** (`rivalidaAreaComune()`,
  `revalidatePath("/admin", "layout")`), perché i contatori delle code si vedono
  da ogni pagina dell'area. Elencare a mano quali rotte tocca ogni azione
  sarebbe una seconda mappa da tenere allineata.

### Un cancello riparato per strada

**`shots` fotografava una 404 e usciva 0.** Il controllo dell'atterraggio
confronta l'*indirizzo*, e una 404 di Next sta sull'indirizzo chiesto: la
schermata di `admin-domande` era la pagina d'errore, e la revisione visiva
risultava riuscita. Il momento in cui capita è quello standard — dopo gli E2E,
che cancellano `.next` — quindi valeva per qualunque rotta annidata, non solo
per queste. Chiuso portando in `shots.mjs` il controllo del testo d'errore che
`rotte.mjs` ha da sempre.

### I cancelli, dopo

`rotte` **62** (da 56), 0 con problemi · `shots` **+6 pagine** per regime, zero
traboccamento a 360px · `pagine-cancello` **17** (da 11), quindi a11y e bersagli
**34 casi** ciascuno · `porte.spec.ts` guadagna due casi che leggono le sei
porte **dal cruscotto stesso**, senza una seconda lista.

---

## 8. Consuntivo di «lista + dettaglio» (2026-08-07, stessa giornata)

### Le misure, a 1280px

| Rotta | Prima | **Dopo** | Che cosa mostra adesso |
|---|---:|---:|---|
| `/admin/segnalazioni` | 896 | **1.416** | 14 righe su 14 (prima: 2 su 14 dentro un riquadro) |
| `/admin/segnalazioni/[id]` | — | **864** | + la **descrizione**, che non si vedeva da nessuna parte |
| `/admin/proposte` | 1.894 | **656** | 4 righe |
| `/admin/proposte/[id]` | — | **913** | + il **problema** e il **testo** della proposta |
| `/admin/domande` | 1.492 | **656** | 4 righe |
| `/admin/domande/[id]` | — | **656** | la domanda per intero e il modulo |
| `/admin/valutazioni` | 1.114 | **2.539** | **32 righe su 32** (prima: 6 su 32) |
| `/admin/valutazioni/[id]` | — | **864** | la recensione e i due comandi |

**Il numero che conta non è nessuno di questi**: è che le colonne «dopo» dei
dettagli **non cambiano col numero di voci in coda**. Prima il massimo cresceva
di ~320px per ogni voce in più; adesso la superficie di lavoro è quella con
quattordici voci e con quattrocento. La riga di lista è **69px** contro i **323**
del modulo di lavoro: 4,7 volte.

### Le tre cose che il piano non aveva previsto

1. **Due pagine crescono, e vanno dichiarate.** Segnalazioni da 896 a 1.416,
   Valutazioni da 1.114 a 2.539. Non è una regressione: gli 896 erano un
   riquadro da 576px su 4.680 di contenuto — **12 voci su 14 fuori vista** — e i
   1.114 mostravano **6 recensioni su 32**. Una lista lunga dice la verità sulla
   coda; un riquadro che scorre la nasconde. Il riquadro resta, ma limita **la
   lista** nella colonna del dettaglio, mai il lavoro.

2. **Il merito mancava, e non era un problema di impaginazione.** La descrizione
   della segnalazione era **caricata e mai mostrata** — quattordici volte, una
   per voce — e il testo della proposta nemmeno caricato: il Comune sceglieva lo
   stato, assegnava l'ufficio e scriveva una nota ufficiale **visibile al
   cittadino** avendo davanti il solo titolo. È la ragione vera del dettaglio;
   l'altezza è la seconda.

3. **Il dettaglio non può interrogare la propria coda.** Ogni azione riuscita
   toglie la voce dalla coda, quindi un dettaglio filtrato risponderebbe **404
   subito dopo un'azione riuscita** — un errore proprio quando l'operatore ha
   fatto la cosa giusta. Si prende per id, senza filtro, e la pagina dice da sé
   che la voce è uscita.

### Due difetti preesistenti chiusi per strada, e sono la stessa categoria

**«Flusso ordinario» era tagliato a 375px**: i due pulsanti dell'urgenza
affiancati fanno 301px contro i 239 del proprio riquadro, e la card ritagliava
il secondo. **Le quattro tendine della valutazione sintetica erano tagliate a
metà parola a 360px**: «Impatto: Med…», «Fattibilità: Da…» — cioè il valore
corrente, che è l'unica cosa che un `<select>` comunica a riposo.

Nessuno dei due produce traboccamento, quindi `shots` esce 0; nessuno dei due è
sottodimensionato, quindi `bersagli` li approva; e axe non ha una regola per
«tagliato». Li ha trovati **guardare le schermate**, come l'affordance affidata
all'`:hover` due lavori fa. È la terza volta che una categoria di difetto si
rivela invisibile a tutti i cancelli, e adesso ha un nome: *un controllo esce
dal proprio contenitore, o il suo testo ci esce dentro*.

### I cancelli, dopo

`rotte` **66** (da 62), 0 con problemi · `shots` **+4 pagine** per regime ·
`pagine-cancello` **21** (da 17), quindi a11y e bersagli **42 casi** ciascuno,
E2E **116**. Ai quattro dettagli i cancelli arrivano **cliccando** la prima riga
della lista, perché l'id viene dal seed: `DETTAGLI` in `rotte.mjs`, `apriPrima`
in `shots.mjs` e — nuovo — `apriPrima` in `pagine-cancello.ts`, con
`apriDettaglio()` in `helpers.ts`.
