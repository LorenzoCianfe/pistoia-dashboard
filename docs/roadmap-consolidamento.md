# Roadmap ristrutturata — Consolidamento prima di tutto

> Sostituisce l'ordine di lavoro di `ROADMAP.md` §4 **senza cancellarne nulla**.
> L'ondata 8 e l'intero catalogo delle idee non sono annullati: diventano la
> **Fase C**, da costruire su una struttura pulita.
>
> Base: [`audit-consolidamento.md`](./audit-consolidamento.md)
> Redatto: 2026-07-26

---

## 0. Il principio che regge tutto il piano

**Cinque destinazioni, perché cinque sono gli slot di una barra in basso.**

L'architettura dell'informazione non è stata scelta a tavolino e poi adattata
al telefono: è **derivata dal vincolo più stretto**. Le 5 destinazioni della
Fase A entrano esattamente in una barra di navigazione mobile, senza menu a
panino, senza "altro", senza voci che spariscono.

Da qui una conseguenza precisa: **il mobile smette di essere un desktop
degradato**. Oggi il telefono vede 9 destinazioni su 25 e il desktop 25 su 25.
Dopo la Fase A vedono **le stesse cinque**. La barra laterale non è più un
elenco più lungo: è la stessa struttura con più respiro.

Vincolo non negoziabile per tutta la Fase A: **zero funzioni perse, zero
pagine cancellate, ogni indirizzo continua a rispondere.**

---

## Fase A — Consolidamento ✅ *(chiusa il 2026-07-26)*

*Struttura e navigazione. Nessuna funzionalità nuova, nessun ridisegno visivo.*

> Consuntivo dettagliato in [`piano-esecuzione-fase-a.md`](./piano-esecuzione-fase-a.md) §Consuntivo.
> Le due voci rimaste aperte sono chiuse: **A-5.1** (rinomina di
> `components/community/`) e l'esecuzione E2E verde end-to-end — **11/11 in
> 50,3s** sul database isolato, con Playwright che avvia il proprio server.

### A-0 · Igiene preliminare

Una sola voce, e leggera. **Non c'è nessuna riparazione bloccante**: l'audit
§5 documenta un falso allarme rientrato — le cifre display funzionano
(`/bilancio` rende 142 mln € e gli anelli 92% / 86% / 71%, verificato con
`npm run shots`).

| # | Azione | Esito atteso |
|---|---|---|
| A-0.1 | Ripulire i residui E2E dal DB dimostrativo e isolare il DB dei test | Nessun «Lampione spento E2E 178…» in home |

> **Regola di verifica per tutta la Fase A**, ereditata dall'audit §5: ciò che
> dipende da `IntersectionObserver`, `requestAnimationFrame` o ScrollTimeline —
> cioè i componenti-firma e ogni rivelazione allo scroll — **si verifica solo
> con `npm run shots`**, mai leggendo il DOM da uno strumento che non compone
> fotogrammi. Una pagina nascosta non anima, e restituisce zeri plausibili.

### A-1 · Il modello di navigazione

Il cuore della fase. Oggi `nav-items.ts` espone 4 array piatti (25 voci);
diventa una struttura a due livelli con 5 destinazioni.

| # | Azione | Cosa tocca |
|---|---|---|
| A-1.1 | Ridefinire `nav-items.ts`: 5 destinazioni, ciascuna con le proprie sezioni | `components/app/nav-items.ts` |
| A-1.2 | **Costruire la navigazione mobile che oggi non esiste**: 5 schede = 5 destinazioni | `bottom-nav.tsx` |
| A-1.3 | Riscrivere la barra laterale come le stesse 5 destinazioni + sezioni | `side-nav.tsx` |
| A-1.4 | Etichettare **ogni** gruppo (oggi 2 su 4) | `side-nav.tsx` |
| A-1.5 | Togliere notifiche/profilo/impostazioni dal menu: esistono già in alto | `nav-items.ts` (`SECONDARY_NAV`) |

**Prima → dopo**

```
PRIMA (25 voci, 3 gruppi di cui 1 senza nome, sotto 1024px: sparisce)
├── (senza etichetta) 11 voci
├── PARTECIPAZIONE     5 voci
├── TRASPARENZA        6 voci
└── (filo)             3 voci  ← già presenti nella barra in alto

DOPO (5 destinazioni, identiche su desktop e telefono)
├── La mia città
├── Partecipa          → segnalazioni · proposte · sondaggi · priorità
│                        question time · patti · progetti · volontariato
├── Come va la città   → bilancio · opere · decisioni · promesse · report
├── Territorio         → mappa · quartieri · eventi
└── Comunità           → stanze tematiche
```

### A-2 · Le pagine-contenitore

Ogni destinazione nuova ha bisogno di una pagina propria: senza, "Partecipa"
sarebbe solo un'etichetta che apre un sottomenu — cioè il problema di prima
con un nome nuovo.

| # | Azione | Nota |
|---|---|---|
| A-2.1 | `/partecipa` — hub degli 8 strumenti di partecipazione | Ogni strumento resta alla sua rotta |
| A-2.2 | `/citta` — hub di bilancio, opere, decisioni, promesse, report | |
| A-2.3 | `/territorio` — hub di mappa, quartieri, eventi | La mappa diventa una **vista** del territorio, non una voce di pari livello |
| A-2.4 | Ogni hub apre sullo stato reale, non su un elenco di link | Un hub che elenca soltanto sposta il clic, non lo elimina |

> **A-2.4 è la riga che distingue un consolidamento da un rinvio.** Se
> `/partecipa` è una griglia di 8 tessere, l'utente fa due clic dove prima ne
> faceva uno. L'hub deve mostrare *cosa sta succedendo adesso* — le proposte in
> raccolta firme, i sondaggi aperti, le priorità in votazione — e da lì portare
> al dettaglio.

### A-3 · Progressive disclosure

Le voci che escono dal menu principale, con la loro nuova casa dichiarata.

| Rotta | Nuova collocazione |
|---|---|
| `/avvisi` | Banner in home (già presente) + archivio raggiungibile dal banner |
| `/organigramma` | Utility — una sola esposizione al posto di tre |
| `/faq`, `/glossario` | Utility + il glossario resta contestuale (`GlossaryTip`) |
| `/notifiche`, `/profilo`, `/impostazioni` | Solo barra in alto (già ci sono) |
| `/admin` | Invariato: menu profilo, solo ruolo ADMIN |

### A-4 · Alleggerimento della home

`/la-mia-citta` è 432 righe e impila 8 sezioni. Non è protetta, quindi si può
intervenire sull'interno.

| # | Azione |
|---|---|
| A-4.1 | Portare in alto i due lavori primari: partecipare e stato della città |
| A-4.2 | **"Cosa vuoi fare?" promosso**, non sciolto — è protetto, ed è già la cosa migliore della navigazione |
| A-4.3 | Sezioni secondarie ("Per te", "Vicino a te", proposte in evidenza) sotto la piega, invariate |
| A-4.4 | Verificare la parità con la **modalità semplice** (protetta) |

### A-5 · Debito che il consolidamento tocca comunque

Solo ciò che il lavoro attraversa: nessuna rinomina di massa fuori contesto.

| # | Azione |
|---|---|
| A-5.1 | `community/` → `segnalazioni/` (9) + `proposte/` (6) + 3 file trasversali. Il nome inglese viola `AGENTS.md` §6 e collide con la sezione `comunita` |
| A-5.2 | Fondere `assessori/follow-button` nel `FollowButton` generico |
| A-5.3 | `/iniziative` → `/volontariato`, allineando rotta ed etichetta (con redirect) |

### Cancello di uscita dalla Fase A ✅ *(chiuso il 2026-07-26)*

- [x] Le 26 rotte rispondono ancora 200
- [x] Ogni funzione dell'inventario §1 è raggiungibile, telefono **e** desktop
- [x] Desktop e mobile espongono le **stesse** 5 destinazioni
- [x] Nessuna cifra display mostra 0 dove il dato esiste
- [x] `npm run typecheck`, `lint`, `test` (93), `test:e2e` (11/11) verdi
- [x] `node scripts/shots.mjs --simple --width=360` senza traboccamento
- [x] Modalità semplice e "Cosa vuoi fare?" invariate nel comportamento

---

## Fase B — Coerenza visiva ✅ *(chiusa il 2026-07-29)*

*Nessuna nuova struttura: si porta Astryx dove non è ancora arrivato.*

Confermato in scoperta: **Astryx resta**. La Fase B è copertura, non ridisegno.
Alla partenza `FEATURES.md` §7 dichiarava **26 rotte non ancora ridisegnate**,
che avevano ereditato i token dal ponte di retrocompatibilità: coerenti nei
colori, non nella composizione, e nessuna usava i componenti-firma.
**Sono state coperte tutte**, salvo tre esclusioni dichiarate.

| # | Azione | Stato |
|---|---|---|
| B-1 | Applicare la composizione Astryx alle rotte assorbite dagli hub | ✅ 23 di 26 — le tre fuori sono dichiarate |
| B-2 | Portare i componenti-firma dove aggiungono senso — non ovunque per simmetria | 🚧 |
| B-3 | Gerarchia visiva coerente dentro ogni hub | 🚧 |
| B-4 | Passata di contrasto su tema chiaro **e** scuro (`AGENTS.md` §2: non si regredisce) | 📋 |
| B-5 | Verifica in modalità semplice a 360px su tutta la struttura nuova | 🚧 per rotta |

**Primo scaglione (2026-07-26), 8 rotte:** `/promesse`, `/decisioni`,
`/question-time`, `/priorita`, `/patti`, `/volontariato`, `/progetti`,
`/eventi`. Scelte come «le rotte che gli hub mettono più in vetrina», e
condividevano tutte lo stesso difetto: intestazione, poi subito l'elenco delle
schede, senza mai aprire su cosa dice l'insieme.

**Con questo scaglione i tre hub della Fase A sono coperti per intero.**

**Secondo scaglione (2026-07-28), 4 rotte:** `/avvisi`, `/organigramma`, `/faq`,
`/glossario` — cioè `UTILITY_NAV` per intero.

Il criterio non è la dimensione del difetto ma **il punto d'ingresso**, che è
poi lo stesso del primo scaglione portato avanti di un passo: la vetrina degli
hub era una misura di raggiungibilità, e la raggiungibilità continua anche dopo
che gli hub sono finiti. L'ordine è verificabile in `nav-items.ts` — banner in
home (`/avvisi`, la sola rotta promossa da un *evento* invece che da una voce di
menu), poi «Cosa vuoi fare?» che è protetto e promosso in A-4.2
(`/organigramma`), poi l'elenco di servizio, poi il menu avatar.

Il vantaggio sulla dimensione è che **chiude un livello intero**, che è la
proprietà che rendeva difendibile il primo scaglione; ordinare per righe
lascerebbe `/glossario` (63 righe) orfano molto più in basso.

**Due delle quattro non prendono la cifra display**, e per il motivo opposto a
quello atteso: le righe sono vere, ma il numero è o tautologico
(`/organigramma`: le aree di delega coincidono col numero di schede) o
un'accusa tratta da un buco del seed (1 contattabile su 7). Vedi `FEATURES.md`
§5. Conferma che B-1 e B-2 sono due lavori distinti: la composizione va
ovunque, i componenti-firma solo dove aggiungono senso.

**`/admin` è escluso** con tre motivi indipendenti: è dietro `requireAdmin()` e
quindi fuori dall'asse della raggiungibilità; la **C-1 lo riscrive per intero**,
quindi comporlo ora è pagarlo due volte — la trappola che questo documento si
chiude in fondo; ed è una console di lavoro, dove `DESIGN.md` §6 vuole densità e
non un protagonista.

**Terzo scaglione (2026-07-29), tutto il resto.** Le 14 rimaste erano tutte
fuori dai canali di navigazione principali e nessun asse le distingueva più fra
loro. La risposta a «serve un quarto criterio?» è stata **no: si finiscono** —
richiesta esplicita di Lorenzo, con l'usabilità come vincolo dichiarato.

Il vincolo ha cambiato il lavoro, non solo il tono: su pagine di servizio una
cifra a 88px è decorazione, non informazione. Quindi il terzo scaglione porta
**una sola** cifra display (`/sondaggi`) e per il resto composizione, indici e
una correzione di leggibilità sulle legali. Dettaglio in `FEATURES.md` §5.

**Il cancello ha fatto il suo mestiere.** Entrando nel cancello per la prima
volta, `/impostazioni` e `/comunita/stanze` hanno rivelato due traboccamenti
orizzontali che c'erano da sempre — 11px e 5px a 360px — più un bersaglio touch
da 33px sul selettore del tema, sotto il minimo di `DESIGN.md` §11. È la
conferma della regola già scritta: **il cancello misura solo le pagine che
apre.** Dettaglio in `CHANGELOG.md` 0.16.0.

Tre cose emerse strada facendo:

- **Un'esclusione del primo scaglione era scritta male.** `/sondaggi` era stato
  escluso in blocco perché `getPolls` gonfia i voti con `demoBaseline`; ma
  quello escludeva una cifra *sui voti*, non qualunque cifra. I sondaggi aperti
  sono righe vere. Ritirata.
- **Due pagine non avevano nessun difetto** (`/notifiche`, `/profilo`) e una
  terza nemmeno (`/comunita/stanze/[topic]`). Dichiararlo è parte del lavoro:
  senza, sembrano dimenticate.

**Restano fuori tre rotte**, tutte con motivo già scritto: `/mappa`, `/digest`,
`/admin`.

Tre rotte in vetrina restano fuori, con motivo:

- **`/sondaggi`** — `getPolls` somma `demoBaseline(baseVotes)` ai voti veri:
  una cifra display su quel totale metterebbe un numero gonfiato a 88px. Avrà
  la composizione, non la cifra, finché il totale non è di sole righe reali.
- **`/mappa`** — 41 righe di contenitore attorno a Leaflet. Non ha una
  composizione da portare: ha una vista.
- **`/digest`** — è già composto (griglia di `Stat`, testata di stampa,
  sezioni). Promuovere uno dei quattro numeri direbbe che quello è la notizia,
  e in un riepilogo mensile nessuno lo è.

E la regola uscita da questo scaglione, che vincola la Fase C: **la scala a
tacche vuole un traguardo, non solo un intervallo.** Vedi `FEATURES.md` §5.

> Ordine deliberato: prima la struttura (A), poi la veste (B). Ridisegnare
> pagine che stanno per cambiare posto significa pagare il lavoro due volte —
> ed è precisamente ciò che è successo tra l'ondata 6 e la 7, dove il sistema è
> arrivato su 4 pagine di punta mentre 26 restavano indietro.

---

## Fase C — Tutto ciò che era pianificato

**Niente di quanto segue è cancellato.** Riprende dopo l'approvazione di A e B,
su fondamenta pulite.

### C-1 · Ondata 8 — Admin intelligence & nuovi pubblici

Trascritta da `ROADMAP.md` §4, invariata:

| Voce | Livello | Fonte |
|---|---|---|
| Dashboard admin con analytics operative (KPI per categoria/quartiere/ufficio, trend) | `FE` `BE` `DES` | `A1 §27` |
| Alert trend anomalo (euristiche, niente AI) | `BE` | `A2 §21` |
| Sentiment civico per tema (mock/euristiche) | `FE` `BE` | `A2 §20` |
| Moderazione assistita (spam, duplicati, suggerimento categoria) | `BE` | `A1 §28` |
| Modalità turista | `FE` `UX` | `A2 §28` |
| Commercio locale (`OrganizationProfile` esiste già) | `FE` `BE` | `A2 §29` |
| Vetrina aziende di Pistoia & sponsorizzazioni dichiarate | `FE` `BE` | richiesta 2026-06-11 |
| Storie della città + "Pistoia racconta" | `FE` `DES` | `A2 §17–18` |
| Servizi quotidiani / scorciatoie ai servizi comunali | `FE` `UX` | `A1 §22` |

### C-2 · Qualità continua

Traccia trasversale di `ROADMAP.md` §4, invariata: review "lenti mancanti"
(sicurezza, cache, idiomi Next 16), test a11y automatici con axe-core,
Lighthouse CI con performance budget, audit dipendenze in CI, estensione dei
test a ogni ondata.

> Il difetto §5 dell'audit è la prova che questa traccia serve prima di quanto
> sembrasse: nessuno dei cancelli esistenti lo ha intercettato.

### C-3 · Catalogo delle idee

`ROADMAP.md` §5 e §6 restano la fonte, per intero e senza modifiche: design ed
esperienza visiva, segnalazioni, proposte, trasparenza, quartieri,
partecipazione, personalizzazione, UX e semplicità, accessibilità, contenuti,
nuovi pubblici, admin, AI civica, piattaforma.

Alcune voci saranno **già soddisfatte** dalla Fase A e vanno spuntate lì, non
rifatte — in particolare in §6 «🧭 UX & semplicità».

### C-4 · Fasi in pausa

`ROADMAP.md` §8 (dati reali da fonti aperte) e §9 (fiducia istituzionale)
restano in pausa alle condizioni già scritte. Il consolidamento non le tocca e
non le sblocca.

### C-4-bis · Osservatorio civico *(richiesta 2026-07-26)*

Cinque funzioni nuove: **Pagella mensile**, **Dossier persona**, **Audit
cittadino** (PDF trimestrale), **Il costo dell'amministrazione**, **Rating dei
servizi**. Definite per esteso in `ROADMAP.md` §6 «🔍 Osservatorio civico»,
con i cinque prerequisiti.

Sono in Fase C per due ragioni indipendenti, e la seconda è la più vincolante:

1. Sono funzionalità nuove, e la Fase A/B viene prima per costruzione.
2. **Sono inerti sui dati dimostrativi.** Una pagella calcolata su dati
   inventati non è una pagella: è una messa in scena. Dipendono dalla ripresa
   di `ROADMAP.md` §8 (dati reali), oggi in pausa.

E una premessa che non è tecnica: **cambiano la natura del prodotto.** Oggi la
piattaforma è un servizio al cittadino che si presenta *come* il Comune —
stemma civico, «Comune di Pistoia» nella barra in alto. Queste cinque funzioni
la rendono un osservatorio **sul** Comune. Le due cose non possono convivere
sotto la stessa identità senza ingannare chi legge su chi stia parlando: una
pagella sul sindaco pubblicata sotto lo stemma del sindaco si legge come
autocritica dell'amministrazione, che non è. Prima riga di lavoro della C-4-bis,
prima di qualunque funzione: **identità propria** — nome, marchio, dominio, e
una dichiarazione di chi pubblica.

> **Aggiornamento 2026-07-29 — il prerequisito 1 è risolto diversamente.**
> Due tentativi di marchio separato sono stati respinti (*Il Campanile*, poi
> quattro direzioni disegnate) e Lorenzo ha confermato: **lo stemma del Comune
> resta.** La strada del marchio indipendente è chiusa, non riproporla.
>
> Al suo posto: una **dichiarazione esplicita di chi pubblica** in cima alle
> pagine di giudizio. Da disegnare e approvare prima di scrivere codice.
>
> Ne discende che le cinque funzioni si dividono: «Il costo
> dell'amministrazione» e «Rating dei servizi» stanno sotto lo stemma senza
> problemi (la prima è trasparenza dovuta per legge, la seconda giudica
> servizi e non persone); pagella, dossier e audit richiedono la
> dichiarazione. Dettaglio in `ROADMAP.md` §6, prerequisito 1.

### C-5 · Nuovo, emerso dall'audit

| Voce | Origine |
|---|---|
| Dichiarazione di accessibilità (dovuta per legge, richiede audit vero) | `FEATURES.md` §7 |
| Verifica con screen reader (NVDA mai provato) | `FEATURES.md` §7 |
| Terzo stadio del sankey (serve `BudgetRevenue` o l'ETL) | `FEATURES.md` §7 |
| Riordino completo delle 20 cartelle di componenti | Audit §4 T4 |
| Degrado onesto delle cifre display: l'HTML servito contiene `0` finché l'animazione non parte | Audit §5 |

---

## Ordine e dipendenze

```
A-1  modello di navigazione
      └─→ A-2  pagine-contenitore
            └─→ A-3 · A-4 · A-5   (parallelizzabili fra loro)
                  └─→ cancello A
                        └─→ Fase B
                              └─→ Fase C

A-0  igiene E2E   (indipendente, in qualunque momento)
```

**A-1 e A-2 sono il percorso critico.** A-3, A-4 e A-5 sono parallelizzabili
una volta chiuso A-2. A-0 non blocca nulla.

---

## Cosa resta protetto per tutta A e B

Dichiarato in scoperta, vincolante:

- **"Cosa vuoi fare?"** (`GUIDED_ACTIONS`) — si promuove, non si scioglie
- **Modalità semplice** — comportamento invariato, verificata a ogni passo
- **Astryx: token e catena del tema** — `src/themes/pistoia.ts` e il CSS
  compilato non si toccano; la Fase B estende la copertura, non ridisegna
- **Autenticazione** — `AGENTS.md` §2

Le quattro pagine di punta **non** sono state marcate come protette: i loro
interni sono modificabili, ed è ciò che rende possibile A-4.
