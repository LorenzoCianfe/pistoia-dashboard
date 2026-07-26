# Audit di consolidamento — Fase 1

> **Documento storico: fotografa lo stato del 2026-07-26 *prima* della Fase A.**
> Non aggiornarlo per riflettere il presente — serve a spiegare perché la Fase A
> è stata fatta. Lo stato attuale sta in `FEATURES.md`; l'esito in
> [`piano-esecuzione-fase-a.md`](./piano-esecuzione-fase-a.md) §Consuntivo.
>
> Una parte è stata **smentita eseguendola**: la §5 lo racconta.
>
> Fotografia dello stato attuale prima di qualunque riorganizzazione.
> **Nessuna funzione viene eliminata**: questo documento decide *dove* ciascuna
> vive, non *se* vive.
>
> Metodo: scoperta interattiva (4 blocchi di domande) → lettura del codice →
> ispezione dell'applicazione in esecuzione su `localhost:3000`.
>
> Redatto: 2026-07-26 · Ondata di riferimento: 7 (`e246786`)

---

## 0. Sintesi esecutiva

Cinque conclusioni. Le prime due cambiano il piano di lavoro; la terza è un
difetto funzionale che va riparato a prescindere dal consolidamento.

1. **La barra laterale non è sopravvivibile su telefono.** 25 voci, e sotto i
   1024px sparisce del tutto senza sostituto: nessun menu a panino, nessun
   pannello. Restano 5 schede in basso. **16 destinazioni su 25 non hanno alcun
   percorso navigabile su mobile** — si raggiungono solo digitandone il nome
   nella ricerca. Con "mobile-first" come vincolo dichiarato, questo è il
   problema numero uno, e non si risolve accorciando la lista.

2. **Il primo livello è un elenco di funzionalità, non un modello di
   navigazione.** 22 destinazioni di contenuto in 3 gruppi, di cui **solo 2
   hanno un'etichetta**. A 1280×720 il menu è alto 1191px contro 656px
   visibili: **il 45% è sotto la piega**, incluso l'intero gruppo
   "Trasparenza". Il progetto se n'era già accorto — `FEATURES.md` §7:
   *«Architettura dell'informazione delle 30+ rotte — gerarchia troppo piatta,
   serve un passaggio dedicato»*.

3. **La struttura è sana: il problema è solo l'esposizione.** Tutte le 26 rotte
   rispondono 200, nessuna orfana, nessun vicolo cieco, e il design system
   rende correttamente (verificato con `npm run shots`: `/bilancio` mostra
   142 mln € e gli anelli 92% / 86% / 71%). Non c'è nulla da riparare prima di
   riorganizzare: il consolidamento parte da una base funzionante. Dettagli e
   una correzione importante in §5.

4. **La ridondanza è reale ma piccola e circoscritta** — non è la causa del
   disordine. Due `FollowButton` quasi identici, `/organigramma` esposto in
   tre posti, le stesse 6 "azioni rapide" ripetute in home + palette. Il
   disordine viene dalla *piattezza*, non dalla duplicazione.

5. **Non esistono tab annidate.** Nel codice non c'è un solo
   `role="tab"`/`tablist`. Ciò che sembra un secondo livello di tab sono
   filtri, chip e sezioni impilate dentro pagine lunghe. È una buona notizia:
   il consolidamento non deve smontare macchine a stati, deve raggruppare
   destinazioni.

**Conseguenza sul piano di lavoro:** il lavoro non è "ridurre le tab" ma
**sostituire il modello di navigazione**, che oggi non esiste su mobile. Non
c'è nessun difetto bloccante da riparare prima: si può partire dalla struttura.

---

## 1. Inventario completo

### 1.1 Come leggere la colonna «Verdetto»

| Verdetto | Significato |
|---|---|
| **MANTIENI** | Resta una destinazione di primo livello a sé stante |
| **UNISCI** | Diventa una sezione dentro una destinazione più grande — contenuto invariato |
| **RIPOSIZIONA** | Resta una pagina propria, ma esce dal menu principale (utility, contestuale, o ingresso da un'altra pagina) |
| **SEMPLIFICA** | Resta dov'è, ma la pagina va alleggerita |

Nessuna riga dice "elimina". Non ce ne sono.

### 1.2 Rotte civiche — gruppo principale (11 voci, senza etichetta)

| # | Rotta | Righe | In basso su mobile | Verdetto | Motivo |
|---|---|---|---|---|---|
| 1 | `/la-mia-citta` | 432 | ✅ | **MANTIENI** + **SEMPLIFICA** | È la home e il redirect post-login. Ma impila 8 sezioni: avvisi, stato città, 6 azioni guidate, 4 KPI personali, feed "Per te", "Vicino a te", proposte, notifiche. Troppo per i primi 5 secondi |
| 2 | `/bilancio` | 373 | ✅ | **MANTIENI** | Pagina di punta, sankey + ScrollTold. Nucleo del lavoro "come va la città" |
| 3 | `/opere` (+345 dettaglio) | 291 | ✅ | **MANTIENI** | Pagina di punta, cronoprogramma |
| 4 | `/mappa` | 41 | ❌ | **UNISCI** → Territorio | 41 righe: è un contenitore attorno al componente Leaflet. È una *vista* sui dati di altre sezioni, non una sezione |
| 5 | `/sondaggi` | 107 | ❌ | **UNISCI** → Partecipa | Strumento di partecipazione, oggi separato dagli altri strumenti di partecipazione |
| 6 | `/comunita` (+stanze 66 +topic 98) | 175 | ✅ | **MANTIENI** | Ha già una gerarchia interna sana (stanze tematiche) |
| 7 | `/segnalazioni` (+308 dett.) | 211 | ✅ | **MANTIENI** | Il compito civico più frequente |
| 8 | `/proposte` (+295 dett.) | 166 | ❌ | **UNISCI** → Partecipa | ⚠️ È uno dei due lavori primari dichiarati e **non è raggiungibile su mobile** |
| 9 | `/eventi` | 169 | ❌ | **UNISCI** → Territorio | Calendario cittadino: appartiene al "cosa succede", non a sé stante |
| 10 | `/quartieri` (+299 dett.) | 159 | ❌ | **UNISCI** → Territorio | Naturale coppia con la mappa: stessa domanda, due rappresentazioni |
| 11 | `/organigramma` | 113 | ❌ (sì da avatar) | **RIPOSIZIONA** → utility | Esposto in **3 posti** (menu laterale, menu profilo, azione guidata "Contatta il Comune"). Ne basta uno |

### 1.3 Gruppo «Partecipazione» (5 voci)

| # | Rotta | Righe | Etichetta nel menu | Verdetto |
|---|---|---|---|---|
| 12 | `/question-time` | 132 | Question time | **UNISCI** → Partecipa |
| 13 | `/priorita` | 96 | Vota la priorità | **UNISCI** → Partecipa |
| 14 | `/iniziative` | 150 | ⚠️ Volontariato | **UNISCI** → Partecipa |
| 15 | `/patti` | 170 | Patti e luoghi | **UNISCI** → Partecipa |
| 16 | `/progetti` | 149 | Progetti civici | **UNISCI** → Partecipa |

⚠️ **`/iniziative` si chiama "Volontariato" nel menu.** Rotta e etichetta non
coincidono: chi cerca l'indirizzo non lo indovina, e la ricerca per URL non
combacia con la parola che l'utente ha letto. Da allineare durante il
consolidamento (`/volontariato`, con redirect).

### 1.4 Gruppo «Trasparenza» (6 voci)

| # | Rotta | Righe | Verdetto | Motivo |
|---|---|---|---|---|
| 17 | `/avvisi` | 155 | **RIPOSIZIONA** | Contenuto urgente sepolto al 17° posto del menu, sotto la piega. Compare già come banner in home: quello è il suo posto, più un archivio |
| 18 | `/decisioni` | 103 | **UNISCI** → Come va la città | Chiude il cerchio con proposte e promesse |
| 19 | `/promesse` | 155 | **UNISCI** → Come va la città | Stessa domanda di `/decisioni`: cosa è stato fatto |
| 20 | `/digest` | 238 | **UNISCI** → Come va la città | È il riepilogo periodico degli stessi indicatori |
| 21 | `/faq` | 111 | **RIPOSIZIONA** → utility | Aiuto, non contenuto civico |
| 22 | `/glossario` | 63 | **RIPOSIZIONA** → utility | 63 righe, ed esiste già come tooltip contestuale (`GlossaryTip`) dentro le pagine. La pagina intera è l'indice, non il canale principale |

### 1.5 Utility e area riservata

| # | Rotta | Righe | Dove sta oggi | Verdetto |
|---|---|---|---|---|
| 23 | `/notifiche` | 25 | Menu + campanella | **RIPOSIZIONA** — fuori dal menu: la campanella basta |
| 24 | `/profilo` | 75 | Menu + avatar | **RIPOSIZIONA** — fuori dal menu: l'avatar basta |
| 25 | `/impostazioni` | 161 | Menu + avatar | **RIPOSIZIONA** — fuori dal menu: l'avatar basta |
| 26 | `/admin` | 221 | Solo admin | **MANTIENI** separato — non è superficie cittadino |

Le tre voci 23–25 occupano oggi uno slot nel menu principale **ed** esistono
già nella barra in alto. È duplicazione pura: −3 voci a costo zero.

### 1.6 Rotte fuori dal menu (nessuna orfana)

| Rotta | Stato |
|---|---|
| `/comunita/stanze`, `/comunita/stanze/[topic]` | Sotto-rotte raggiungibili da `/comunita` ✅ |
| `/opere/[id]`, `/segnalazioni/[id]`, `/proposte/[id]`, `/quartieri/[slug]` | Pagine di dettaglio ✅ |
| `/privacy`, `/cookie`, `/note-comunita` | Nel footer ✅ |
| `/login`, `/registrati` | Flusso anonimo ✅ |
| `/design-system` | Vetrina interna, esclusa dall'indicizzazione ✅ |

**Tutte le 26 rotte rispondono 200.** Nessuna pagina rotta, nessuna rotta
orfana, nessun vicolo cieco. La struttura è sana: è l'esposizione a non
funzionare.

---

## 2. Mappa di navigazione e punti di attrito

### 2.1 I quattro canali di navigazione

| Canale | Copre | Disponibile |
|---|---|---|
| Barra laterale | 25 voci | **Solo ≥1024px** |
| Barra in basso | 5 voci (`core: true`) | Solo <1024px |
| Barra in alto | Ricerca, tema, notifiche, avatar (→ profilo, organigramma, impostazioni, admin) | Sempre |
| Palette ⌘K | Tutte le pagine + 6 azioni + contenuti | Sempre (icona dedicata su mobile) |

### 2.2 Attrito 1 — il precipizio dei 1024px 🔴

`(app)/layout.tsx:28` — `hidden … lg:block`. Sotto i 1024px la barra laterale
non è collassata: **è rimossa**, e nulla la sostituisce. `top-bar.tsx` non ha
alcun pulsante di menu.

**Raggiungibili su telefono:** 5 (barra in basso) + notifiche (campanella) +
profilo, organigramma, impostazioni (avatar) = **9 su 25**.

**Le 16 destinazioni senza percorso navigabile su mobile:**

`/mappa` · `/sondaggi` · `/proposte` · `/eventi` · `/quartieri` ·
`/question-time` · `/priorita` · `/iniziative` · `/patti` · `/progetti` ·
`/avvisi` · `/decisioni` · `/promesse` · `/digest` · `/faq` · `/glossario`

Si raggiungono **solo** digitandone il nome nella palette — cioè solo se
l'utente già sa che esistono e come si chiamano. A palette aperta senza query
compaiono 6 azioni rapide, non queste 16 voci. **Per un cittadino su telefono,
due terzi della piattaforma non esistono.**

### 2.3 Attrito 2 — il lavoro primario è il più nascosto

I due compiti dichiarati sono *partecipare* e *vedere come va la città*.
Su telefono la barra in basso espone: `la-mia-citta`, `bilancio`, `opere`,
`comunita`, `segnalazioni`.

Gli strumenti di partecipazione strutturata — **proposte, sondaggi, priorità,
question time, patti, progetti, volontariato: 7 su 7** — non ci sono. Il
compito primario è servito, su mobile, dalle sole segnalazioni.

### 2.4 Attrito 3 — metà del menu è sotto la piega

Misurato a 1280×720 (risoluzione da portatile, non un caso limite):
altezza contenuto **1191px** contro **656px** visibili. Il 45% richiede
scorrimento *dentro* la barra laterale. Sotto la piega finisce l'intero gruppo
**Trasparenza**, cioè decisioni, promesse, report, FAQ, glossario — e gli
avvisi urgenti.

### 2.5 Attrito 4 — tre gruppi, una sola gerarchia leggibile

`side-nav.tsx` disegna 4 blocchi ma etichetta solo 2 (`Partecipazione`,
`Trasparenza`). Le prime 11 voci non hanno titolo, le ultime 3 sono separate
da un filo. Un elenco di 11 voci senza intestazione **non si legge come un
gruppo**: si legge come "tutto il resto", cioè come piattezza.

### 2.6 Percorso di un cittadino nuovo, oggi

```
Login → /la-mia-citta
   ├── 8 sezioni impilate, la prima cifra visibile dice "0%"
   ├── "Cosa vuoi fare?" → 6 azioni (buono: è il percorso che funziona)
   └── menu a 25 voci senza gerarchia leggibile, metà sotto la piega
        └── su telefono: il menu non c'è
```

Il blocco **"Cosa vuoi fare?"** è la cosa migliore della navigazione attuale:
è l'unico punto che parla per obiettivi anziché per nomi di sezione. Va
protetto e promosso, non consolidato via.

---

## 3. Problemi di interfaccia

| # | Problema | Dove | Perché conta |
|---|---|---|---|
| U1 | Sidebar assente sotto 1024px senza sostituto | `(app)/layout.tsx:28` | Bloccante per mobile-first |
| U2 | Home a 8 sezioni impilate | `/la-mia-citta` (432 righe) | Il primo schermo deve dire cos'è il prodotto; oggi elenca tutto |
| U3 | 3 gruppi su 4 senza etichetta | `side-nav.tsx:50-69` | Nessuna gerarchia percepibile |
| U4 | Densità disomogenea: 432 righe contro 41 | `/la-mia-citta` vs `/mappa` | Sette rotte sotto le 135 righe occupano uno slot di primo livello quanto il bilancio |
| U5 | Avvisi urgenti al 17° posto, sotto la piega | `TRANSPARENCY_NAV[0]` | Contenuto con severità "Critico" nel punto meno visibile |
| U6 | Etichetta ≠ rotta | `/iniziative` = "Volontariato" | Indirizzo non indovinabile |
| U7 | `/organigramma` in 3 posti | menu, avatar, azioni guidate | Ridondanza senza gerarchia |
| U8 | Notifiche/profilo/impostazioni duplicati menu+topbar | `SECONDARY_NAV` | 3 slot sprecati |

---

## 4. Debito tecnico

| # | Voce | Evidenza | Azione |
|---|---|---|---|
| T1 | **`community/` e `comunita/` convivono** | `community/` (18 file) contiene segnalazioni e proposte — **non** la Comunità; `comunita/` (2 file) contiene la Comunità vera | Il nome inglese viola `AGENTS.md` §6 *(«italiano per il dominio civico»)* **e** collide con il nome di una sezione diversa. Rinominare in `segnalazioni/` + `proposte/` |
| T2 | **Due `FollowButton`** | `assessori/follow-button.tsx` (66 righe) e `community/follow-button.tsx` (71): stessi import, stessi hook, stesse icone | Il secondo è generico (`targetType`/`targetId`) e assorbe il primo |
| T3 | Dati di test E2E nel DB dimostrativo | «Lampione spento E2E 1785015662790» ×3 in "Vicino a te" in home | Gli E2E scrivono nel DB di sviluppo e i residui finiscono in vetrina. `npm run db:reset` + isolamento del DB E2E |
| T4 | 20 cartelle di componenti con criteri misti | dominio (`opere`, `eventi`), lingua mista, ruolo (`ui`, `charts`, `signature`) | Riallineare durante la Fase A, senza rinomine di massa fuori contesto |
| T5 | Doppio nodo `.display-number` per cifra | 2 nodi con la stessa etichetta su `/bilancio` | Verificare se è un residuo di render o un equivalente accessibile |

---

## 5. Falso allarme rientrato: le cifre display funzionano

Una prima stesura di questo audit dichiarava `AnimatedNumber` rotto ovunque,
con `/bilancio` a «0 mln €» e `/la-mia-citta` a «0%». **Era sbagliato, ed è
stato l'errore di misura a produrlo, non il prodotto.** La correzione resta
scritta qui perché il modo in cui è nato l'errore è riutilizzabile.

### Cosa succedeva davvero

L'ispezione girava in un pannello browser **mai visualizzato**:
`document.visibilityState === "hidden"`, `requestAnimationFrame` mai chiamato.
In una pagina nascosta Chrome **non consegna le callback di
`IntersectionObserver`** — verificato: un osservatore di prova non scattava
nemmeno con opzioni vuote, su due elementi diversi.

Di conseguenza `useInView` non diventava mai vero, l'effetto di
`animated-number.tsx:34` usciva subito, e il DOM restava sul valore iniziale
`format(0)`. Uno zero perfettamente plausibile, prodotto dall'ambiente di
osservazione.

### La verifica corretta

`npm run shots` (Playwright, browser reale che compone i fotogrammi) su
`/bilancio`:

| Elemento | Reso |
|---|---|
| Spesa programmata 2026 | **142** mln € |
| Riscossione entrate | **92%** |
| Impegni di spesa | **86%** |
| Avanzamento PNRR | **71%** |

`DisplayNumber`, `RingGauge` e `AnimatedNumber` **funzionano**. Nessuna
riparazione necessaria, nessun blocco alla Fase A.

### La lezione, che vale oltre questo caso

Uno strumento di ispezione che non compone fotogrammi **non può verificare
nulla che dipenda da `IntersectionObserver`, da `requestAnimationFrame` o da
una ScrollTimeline.** In questo progetto è quasi tutto: i componenti-firma, le
rivelazioni allo scroll, `ScrollTold`. Lo zero non era un sintomo: era la
risposta corretta alla domanda sbagliata.

`AGENTS.md` §5 lo dice già — *«un typecheck verde non è una prova visiva»*.
Vale anche al contrario: **una lettura del DOM non è una prova visiva.** La
prova visiva di questo progetto è `npm run shots`, che aspetta le animazioni e
scorre la pagina apposta.

### L'unico residuo reale, minore

`animated-number.tsx:50` rende `{format(0)}` come figlio JSX iniziale: **l'HTML
servito contiene `0`** finché l'animazione non parte. Senza JavaScript, o su un
motore che non esegue l'osservatore, la pagina *afferma* zero invece di
mostrare il dato.

Non è il difetto critico descritto sopra — con JS attivo e pagina visibile il
valore compare sempre — ma su un servizio pubblico il degrado dovrebbe essere
onesto. **Voce di qualità, non blocco:** rendere il valore reale lato server e
lasciare che l'animazione parta da lì. Collocata in Fase C.

---

## 6. Cosa NON toccare

Il consolidamento deve preservare, non solo le funzioni, ma queste scelte:

| Elemento | Perché resta |
|---|---|
| **"Cosa vuoi fare?"** (`GUIDED_ACTIONS`) | L'unica navigazione per obiettivi già presente. Da promuovere, non da sciogliere |
| **Modalità semplice** | Progressive disclosure già funzionante e collaudata: precedente interno da riusare, non da reinventare |
| **Palette ⌘K** | Copre già tutte le pagine e i contenuti. Diventa la rete di sicurezza durante la migrazione |
| **Astryx e i token** | Confermato: si completa la copertura, non si ridisegna |
| **`citystats.ts`** | Definizione unica degli indicatori, con motivazione scritta. Modello da imitare |
| **Autenticazione** | `AGENTS.md` §2: non si tocca senza `SECURITY.md` |
| **Le 4 pagine di punta** | Bilancio, opere, segnalazioni, la-mia-citta hanno già i componenti-firma |

---

## 7. Ipotesi di destinazione (materiale per la Fase 2)

Non è ancora una proposta approvata: serve a rendere valutabili i verdetti
della §1.

**Da 25 voci a 4 destinazioni + home**, tutte compatibili con una barra in
basso su telefono:

| Destinazione | Assorbe | Serve il compito |
|---|---|---|
| **La mia città** (home) | — | Ingresso, orientamento |
| **Partecipa** | segnalazioni, proposte, sondaggi, priorità, question time, patti, progetti, volontariato | *Partecipare* |
| **Come va la città** | bilancio, opere, decisioni, promesse, report del mese | *Vedere come va la città* |
| **Territorio** | mappa, quartieri, eventi | Entrambi, in chiave geografica |
| **Comunità** | comunità e stanze tematiche | *Partecipare* (dialogo) |

Fuori dal menu principale: avvisi (banner + archivio), organigramma, FAQ,
glossario, notifiche, profilo, impostazioni, area Comune.

**Bilancio: 25 → 5 voci di primo livello, 0 funzioni perse.** Le 21 pagine
assorbite restano pagine, con il proprio indirizzo; cambia da dove ci si
arriva.

---

## 8. Verifiche richieste prima della Fase 2

1. L'inventario §1 è completo? Manca qualcosa che non compare nel menu né
   nelle rotte?
2. Quali funzioni sono **intoccabili** durante il consolidamento?
   → *Risposto: "Cosa vuoi fare?", modalità semplice, token e catena Astryx.*
3. L'ipotesi §7 regge, o ci sono accoppiamenti che non ho visto?
   → *Risposto: sì, cinque destinazioni.*
