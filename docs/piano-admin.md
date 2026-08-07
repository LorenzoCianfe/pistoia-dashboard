# Piano — spezzare `/admin` in sotto-rotte

> Deciso con Lorenzo il **2026-08-07**. Questo documento esiste perché la
> prossima sessione **esegua** invece di ridecidere: la scelta del taglio è già
> stata fatta, e il ragionamento che ci ha portati è qui sotto.
>
> Stato: **piano scritto, esecuzione da fare.**

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
