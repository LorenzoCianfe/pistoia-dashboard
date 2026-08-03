# Piano — «Valutazioni dei servizi»

> Piano di implementazione della quinta funzione dell'osservatorio civico
> (`ROADMAP.md` §6). Redatto il **2026-08-03** al termine di una sessione di
> scoperta con Lorenzo: nove domande, nove decisioni, tutte registrate in §1.
>
> Sostituisce il nome di lavorazione «Rating dei servizi — Pistoia Index».
> Il perché sta in §9.

---

## 0. In una riga

**La valutazione non è mai un verdetto che la piattaforma emette: è la seconda
colonna accanto a un numero che la piattaforma aveva già.**

È questa frase che tiene la funzione lontana dalle sue due morti naturali — il
muro di lamentele e la sala d'attesa — ed è la ragione per cui la pagina si apre
su ciò che la città ha detto, non su un modulo.

---

## 1. Le decisioni prese

Non si riaprono. Ogni riga è una risposta di Lorenzo del 2026-08-03.

| # | Domanda | Decisione |
|---|---|---|
| 1 | Che cosa si valuta | **Tutt'e due le famiglie** — servizi allo sportello *e* condizioni della città — con **una sola interfaccia, due domande, mai una classifica sola** |
| 2 | Ogni quanto si vota | Sportelli **a episodio**, condizioni **ogni mese** |
| 3 | Chi vota | **Chiunque**, modello Trustpilot: nessun filtro, e la **composizione del campione dichiarata su ogni scheda** |
| 4 | Identità | **Nessun account richiesto** · email **sempre** obbligatoria (un campo, niente password) · IP tracciato · rimozione possibile |
| 5 | Email e conferma | Il voto **entra subito** nel conteggio; la conferma serve a revocare e a bloccare gli abusi a posteriori |
| 6 | Come compare chi scrive | **«Marco B.»** per tutti di default, **compreso chi ha un account verificato**; nome intero solo spuntando una casella |
| 7 | Granularità | **Grossa**: ~11 caselle. Un quartiere **si sblocca da solo** quando supera la propria soglia |
| 8 | Le risposte | Il Comune risponde **al quadro** *e* può rispondere **alla singola**. Account verificati: Comune, Redazione, e i singoli amministratori **finché in carica** |
| 9 | Chi firma una risposta | **L'account usato**: se personale compare la persona con la carica, se generico compare il Comune |
| 10 | Moderazione | **Modera la Redazione**, il Comune può solo segnalare, con **registro pubblico delle rimozioni** |
| 11 | Da dove si arriva | **Tutti e sei** gli ingressi: segnalazione risolta · destinazione propria · campagna mensile · report del mese · pop-up laterale · **QR stampati** |
| 12 | Giorno uno | **Il dato duro dal primo giorno**, le stelle dichiarate vuote |

### 1.1 Le regole che ho aggiunto io e che valgono come decisioni

Emerse durante la scoperta, non contestate. Se una non ti convince, va tolta qui
prima che entri nel codice.

1. **La media e l'andamento non stanno mai dentro un blocco attribuito a una
   persona.** Le risposte vivono nel flusso delle recensioni, sotto; la cifra
   sta nella testata. Senza questa regola la media di un servizio diventa la
   pagella di chi ci mette la faccia — che `ROADMAP.md` §6, prerequisito 4,
   esclude.
2. **La Redazione non occupa mai lo slot della risposta.** Un contributo della
   Redazione è una **«Nota della Redazione»**, blocco strutturalmente diverso,
   con `urlFonte` e `dataConsultazione`. Se la Redazione rispondesse dove
   risponde il servizio, il lettore capirebbe che è il servizio a parlare — cioè
   esattamente ciò che `ChiPubblica` esiste per impedire.
3. **Ogni risposta porta il timbro della carica al momento in cui è stata
   scritta** — «Assessore al Bilancio nel 2026», non «Assessore al Bilancio».
   `lib/giunta.ts` sa già chi ricopre cosa.
4. **La mail di conferma porta un «non sono stato io, rimuovi» a un tocco.** È
   la revoca chiesta, e rende autolesionista digitare l'indirizzo di un altro.
5. **Confermate e non confermate contano entrambe, ma la composizione le
   separa.** Così la conferma fa un lavoro visibile invece di restare nel
   database.
6. **Il pop-up non è a tempo e non compare all'arrivo**: solo dopo aver
   completato qualcosa, chiudibile, e silenzioso a lungo dopo la chiusura.
   Niente trappola del focus, e rispetta `prefers-reduced-motion`.
7. **Un solo contatore per le richieste.** Sei ingressi, ma una persona viene
   sollecitata **al massimo una volta per finestra**, contata al centro. Sei
   canali che chiedono ciascuno per sé fanno sembrare la piattaforma una
   questua.

---

## 2. Cosa la funzione NON fa

1. **Non calcola un indice unico.** Due tabelloni, mai fusi. Uno è una media di
   episodi, l'altro un umore: una classifica sola affermerebbe che sono
   confrontabili.
2. **Non mostra una media sotto soglia.** Sotto la soglia la scheda dichiara
   quanti voti mancano; non mostra un numero fragile tinto di colore, che è
   `AGENTS.md` §3 (ondata 7, 3).
3. **Non presenta l'assenza come un vuoto.** Il giorno uno la scheda porta il
   dato oggettivo che la piattaforma già possiede, e dichiara le stelle in
   attesa.
4. **Non dà un voto a una persona.** Le stelle stanno sul servizio; le risposte
   stanno sotto, in un blocco separato dalla cifra.
5. **Non pesa i voti.** Nessuna ponderazione fra verificati e non: una
   ponderazione è una scelta editoriale nascosta dentro un'aritmetica, e non si
   può spiegare a un cittadino. La trasparenza sta nella composizione.
6. **Non lascia cancellare al Comune ciò che lo riguarda.** Chi è giudicato
   segnala; rimuove la Redazione; ogni rimozione lascia una riga pubblica.

---

## 3. Le undici caselle

### 3.1 Servizi allo sportello (6)

Media **all-time**: una recensione di una visita del 2024 resta vera come
verbale di quella visita.

`anagrafe` · `tributi` · `edilizia` (SUE) · `prenotazioni-sanitarie` ·
`ztl-permessi` · `protocollo`

### 3.2 Condizioni della città (5)

Media su **finestra mobile di 90 giorni**: un voto sulla pulizia del 2024 è
scaduto, la strada è stata spazzata da allora.

| Casella | Colonna dura, da `Report` | Cautela |
|---|---|---|
| `pulizia` | categorie `rifiuti` + `decoro` | — |
| `illuminazione` | `illuminazione` | — |
| `verde` | `verde` + `parchi` | — |
| `trasporti` | `trasporto` | — |
| `sicurezza` | `sicurezza` | ⚠️ vedi sotto |

⚠️ **Su `sicurezza` la colonna dura mostra i tempi di chiusura, non il volume.**
Per la pulizia «tante segnalazioni e chiusure lente» si legge naturalmente come
«va peggio». Per la sicurezza no: **più segnalazioni può voler dire più
vigilanza, non più pericolo.** Una scheda che accostasse un volume in crescita a
due stelle suggerirebbe un nesso che il dato non contiene. Il volume resta
disponibile nel dettaglio, ma la frase di sintesi parla solo di quanto il Comune
ci mette a chiudere.

### 3.3 Lo sblocco del quartiere

Una condizione nasce **sulla città intera**. Un quartiere ottiene la propria
media solo quando le valutazioni di *quel* quartiere, in *quella* finestra,
superano la soglia da sole. Finché non accade, i suoi voti confluiscono nel dato
cittadino e la scheda lo dichiara.

È `campioneSufficiente()` applicato alla geografia: la mappa si accende un pezzo
alla volta, e ogni pezzo acceso è solido.

---

## 4. Le regole di dominio

Vivono in `src/lib/valutazioni.ts`, modulo **neutro** — lo importano le pagine
(Server Component), le azioni, il seed e i test.

| Costante | Valore proposto | Perché |
|---|---|---|
| `STELLE_MIN` / `STELLE_MAX` | 1 / 5 | Intervallo **fissato davvero**: 1 è pessimo, 5 è ottimo. Per questo le stelle sono ammesse dove la scala a tacche è stata tolta da `/promesse` — lì l'intervallo 0→totale non era un traguardo di nessuno |
| `SOGLIA_PUBBLICAZIONE_VOTO` | **20** | Vedi sotto |
| `FINESTRA_CONDIZIONE_GIORNI` | 90 | Fresco ma non isterico; con il rinnovo mensile una persona pesa al massimo 3 volte |
| `RICHIESTA_SILENZIO_GIORNI` | 30 | Il contatore unico delle sollecitazioni (§1.1, regola 7) |

**Perché 20 e non 5.** `CAMPIONE_MINIMO_PER_GIUDIZIO` vale 5 e resta dov'è: è la
soglia di un **tasso** calcolato su casi che arrivano da soli. Una media di
recensioni è un'altra cosa, e per una ragione che non è statistica ma di
selezione: **chi recensisce si autoseleziona**, e sui piccoli numeri si
autoseleziona verso gli estremi — si scrive quando si è furiosi o entusiasti.
Cinque recensioni non sono un campione rumoroso, sono un campione **storto**, e
alzare la soglia è l'unica correzione onesta disponibile. Le due soglie non sono
«due definizioni dello stesso indicatore» (`AGENTS.md` §3): misurano due cose
diverse, e il modulo lo dichiara in testa perché nessuno le unifichi per
simmetria.

⚠️ **Il 20 è una scelta editoriale e va pubblicata.** Una soglia che si muove in
silenzio è il modo in cui una media scomoda viene soppressa. Vedi §8.

---

## 5. Il modello dati

```
Servizio           id(slug) · famiglia(sportello|condizione) · nome · descrizione
                   · icona · ordine · categorieReport(csv) · attivo

Valutazione        id · servizioId · stelle(1..5) · testo?
                   · email · emailConfermata · confermaToken?
                   · nomeVisualizzato? · mostraNomeIntero
                   · userId? · quartiereId? · periodo(AAAA-MM)
                   · canale(web|qr|segnalazione|digest|popup) · qrLuogo?
                   · ip? · userAgent? · createdAt
                   · rimossaIl? · rimossaMotivo?

RispostaServizio   id · tipo(quadro|singola|nota-redazione)
                   · servizioId? · valutazioneId? · periodo?
                   · testo · autoreId · caricaAlMomento?
                   · urlFonte? · dataConsultazione? · createdAt
```

Tre note che il codice deve rispettare:

1. **`ServiceReview` sparisce**, con le sue quattro valutazioni inventate
   (Anagrafe 4,6 su 1.280 recensioni…) e il blocco che le rende su `/comunita`.
   Niente di vero può nascere accanto a quelle: chi ha visto «4,8 su 940» non
   legge «3 valutazioni» come un progresso, e chi scopre che il 4,6 era finto
   non crede più nemmeno al 3,1 vero che arriva dopo (`AGENTS.md` §2).
2. **La rimozione azzera `testo`** e riempie `rimossaIl` + `rimossaMotivo`. La
   riga resta per la tracciabilità dell'autore; il testo no, perché il motivo
   più frequente di rimozione sono i **dati di un terzo**, che vanno tolti
   davvero e non solo nascosti alla resa.
3. **`periodo` si scrive su ogni valutazione**, anche sugli sportelli. Sugli
   sportelli non entra nel calcolo, ma è ciò che rende possibile un andamento
   senza ricalcolare da `createdAt` a ogni richiesta.

---

## 6. Le rotte

| Rotta | Cosa | Fase |
|---|---|---|
| `/valutazioni` | La panoramica: due tabelloni, mai fusi | R-2 |
| `/valutazioni/[servizio]` | La scheda: media, composizione, andamento, colonna dura, recensioni, risposte, registro | R-2 |
| `/v/[codice]` | **La pagina del QR**: una schermata, stelle + email, niente navigazione | R-3 ✅ |
| `/v/conferma/[token]` | L'atterraggio della mail: conferma o «non sono stato io» come azioni, mai come GET | R-3 ✅ |
| `/admin/codici-qr` | Il generatore: ogni scheda è un foglio da stampare e appendere | R-3 ✅ |
| `/metodologia` | Soglia, media, finestra, versione — prerequisito 3 | R-6 |

Ogni rotta nuova entra in `scripts/rotte.mjs` **e** in `scripts/shots.mjs` nello
stesso momento (`AGENTS.md` §5). Con R-3 il conteggio è a **50**.

---

## 7. Le fasi, con il proprio cancello

Ogni fase è verificabile da sola e lascia l'applicazione verde. Non si passa
alla successiva con la precedente rossa.

### R-1 · Fondamenta
Schema Prisma · `lib/valutazioni.ts` · seed delle 11 caselle a zero valutazioni ·
rimozione di `ServiceReview` e del blocco su `/comunita` · test unitari.
**Cancello:** typecheck · lint · vitest · `npm run rotte` verde (45 rotte, la
funzione non è ancora esposta).

### R-2 · Le due pagine di lettura
`/valutazioni` e `/valutazioni/[servizio]` · la colonna dura da `Report` · voce
in `nav-items.ts` · `rotte.mjs` e `shots.mjs`.
**Cancello:** il cancello completo, comprese le schermate in modalità semplice a
360px. Le pagine devono reggere **con zero valutazioni**, che è lo stato reale.

### R-3 · Il voto ✅ *(chiusa 2026-08-03)*
Azione server · validazione · email di conferma con revoca · il modulo a stelle ·
`/v/[codice]` per i QR · il generatore dei codici.
**Cancello:** un E2E che vota, riceve, revoca. La regola mensile e quella a
episodio provate con date fisse, come `statoPubblicazione()`.

> **Chiusa con il cancello pieno**: typecheck · lint · 181 unit · 17/17 E2E
> (i tre nuovi: vota-riceve-revoca, conferma-e-composizione, regola mensile) ·
> `rotte` 50/50 · shots nei due temi e a 360px. Le decisioni prese durante la
> fase (email e QR) sono registrate in §8. Due note d'attuazione:
>
> - **L'atterraggio della mail vive su `/v/conferma/[token]`, non sotto
>   `/valutazioni`**: `src/proxy.ts` protegge `/valutazioni` col cookie di
>   sessione, e chi clicca dalla posta una sessione non ce l'ha. `/v/` è il
>   prefisso pubblico di tutto ciò che arriva da fuori.
> - **La revoca cancella la riga per intero** (email e token compresi): non è
>   la rimozione redazionale di §5, che azzera il testo e lascia la riga nel
>   registro. Chi dice «non sono stato io» non deve restare in archivio.

### R-4 · Risposte e moderazione
Risposta al quadro e alla singola · attribuzione dall'account · timbro della
carica da `lib/giunta.ts` · Nota della Redazione con fonte · segnalazione da
parte del Comune · rimozione dalla Redazione · registro pubblico.
**Cancello:** un test che prova che un account del Comune **non** può rimuovere.

### R-5 · I sei ingressi
Aggancio a «è davvero risolta?» · campagna mensile · report del mese · pop-up ·
voce di menu · QR stampabili.
**Cancello:** il contatore unico delle sollecitazioni provato con date fisse.

### R-6 · Metodologia
`/metodologia` con soglia, media, finestra, registro delle modifiche, versione;
e il timbro di versione su ogni scheda.
**Cancello:** cambiare la soglia in un posto solo cambia pagina *e* documento.

---

## 8. Cosa resta aperto

Delle quattro cose che il piano non poteva decidere da sé, **due sono state
decise il 2026-08-03** e sono già nel codice. In coda (5–6) le due decisioni
arrivate con R-3, registrate qui perché questo resti l'unico posto da leggere.

1. ✅ **La conservazione dei dati.** **IP: 180 giorni.** **Email: finché la
   valutazione resta pubblicata**, poi sparisce con lei. Due dati con due scopi
   hanno due vite: l'IP serve a riconoscere un abuso, che si manifesta in giorni
   o settimane, e cancellarlo riduce ciò che una fuga esporrebbe — *chi ha
   criticato la polizia locale, da quale indirizzo*. L'email è invece la chiave
   d'identità che regge la regola mensile e la revoca. Il **telefono non si
   raccoglie**: non è proporzionato allo scopo e non fa nulla che l'email non
   faccia. Costante `CONSERVAZIONE_IP_GIORNI`; da dichiarare su `/privacy` in
   R-3.
2. ⏳ **Il numero della soglia resta PROVVISORIO.** 20 è nel codice e marcato
   come tale (`SOGLIA_PROVVISORIA`); il valore definitivo si sceglie scrivendo
   `/metodologia` in R-6, quando la soglia si vedrà accanto alle altre regole
   invece che da sola. **Fino ad allora non va citata come definitiva in nessuna
   pagina pubblica.**
3. ✅ **Chi modera davvero** (decisione di Lorenzo, 2026-08-03, chiusura R-3):
   **la Redazione, reale, che firma SOLO come entità collettiva** — «Redazione
   della Dashboard di Pistoia», la stessa firma di `ChiPubblica` — **mai con
   il nome di una persona**. Non è la finzione dichiarata («in demo la
   moderazione è simulata») né la firma personale: la moderazione avviene
   davvero, e la faccia pubblica è l'entità. Ne discende per R-4: registro,
   rimozioni e Note della Redazione portano quella firma; nessuna superficie
   di moderazione espone un nome proprio.
4. ✅ **Il nome.** «Rating dei servizi — Pistoia Index» prometteva un indice
   mensile pubblico, cioè la cosa che questo disegno rifiuta. Ora è
   **«Valutazioni dei servizi»**, e la parola «indice» non compare da nessuna
   parte.
5. ✅ **Come si mandano le email** (decisione di Lorenzo, 2026-08-03, R-3).
   Tre scelte separabili, prese separatamente: **zero dipendenze** — in
   produzione il trasporto sarà `fetch` verso l'API HTTP di un provider,
   configurazione e non codice; **il provider si sceglie insieme al dominio**
   (senza SPF/DKIM nessuno consegna; preferenza dichiarata per la residenza
   EU, e il provider andrà su `/privacy` come responsabile del trattamento);
   **in locale ogni messaggio è un file** in `.email/` (`src/lib/email.ts`) —
   l'E2E lo legge, la demo lo mostra, e in produzione l'invio si rifiuta
   finché il trasporto vero non esiste. Il congelato «Mailer transazionale»
   di `ROADMAP.md` (residuo Fase 1), quando si sbloccherà, parte da qui.
6. ✅ **L'immagine dei QR è `uqr`** (decisione di Lorenzo, 2026-08-03, R-3):
   pacchetto minimo, MIT, senza sotto-dipendenze, emette SVG. Scelto contro
   le alternative «vendorizzare qrcodegen» (zero pacchetti ma codice di terzi
   trascritto, scansione da verificare a mano) e «rimandare l'immagine».
   È l'unica dipendenza nuova dell'intera funzione.

---

## 9. Perché il nome cambia

«Pistoia Index» descriveva un numero unico che riassume la città. La scoperta ha
concluso che quel numero non deve esistere: fondere la media dell'anagrafe con
l'umore sulla sicurezza dichiara che le due cose sono commensurabili, e non lo
sono. Un nome che promette un indice costringe prima o poi qualcuno a
calcolarlo — e sarebbe la prima cosa citata fuori contesto.

---

## 10. Rapporto con i cinque prerequisiti

| Prerequisito | Stato per questa funzione |
|---|---|
| 1 · Identità di chi pubblica | **Non serve** `ChiPubblica`: si giudicano servizi, non persone (`ROADMAP.md` §6). Ma la Nota della Redazione applica la stessa logica in piccolo — dire chi parla |
| 2 · Dati reali con fonte | La colonna dura viene da `Report`, dati della piattaforma. La Nota della Redazione porta `urlFonte` e `dataConsultazione` come `lib/costo-amministrazione.ts` |
| 3 · Metodologia pubblica | **Necessario**, ed è R-6. Soglia, finestra e media sono scelte editoriali dentro un'aritmetica |
| 4 · Campione minimo esteso alle persone | Rispettato per costruzione: nessun voto su un individuo, e la cifra non convive mai con un volto |
| 5 · Diritto di replica | **È la funzione stessa**: la risposta del Comune sta nella stessa scheda, allo stesso peso, mai dietro un `<details>` |
