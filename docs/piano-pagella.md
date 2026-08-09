# Piano — «La pagella della giunta»

> Piano della prima superficie di giudizio dell'osservatorio civico
> (`ROADMAP.md` §6). Redatto il **2026-08-05** al termine della sessione di
> scoperta con Lorenzo: quattro assi più due dettagli, sei decisioni, tutte
> registrate in §1. La forma è stata composta su facsimili in contesto (barra
> in alto e stemma veri) e due giri di domande — il metodo di R-4, R-5 e R-6.
>
> Il nome perde «mensile» (decisione C1): la cadenza è trimestrale, le
> edizioni sono datate.

---

## 0. In una riga

**Il voto della pagella è un conteggio che si può rifare a mano: dove nessuna
norma fissa il traguardo, il voto non esiste.**

È la scala a tacche di `/promesse` letta al contrario: lì l'intervallo
0→totale non era il traguardo di nessuno e la scala è stata tolta; qui il
traguardo lo fissa la legge (il D.Lgs 33/2013 dice *che cosa* va pubblicato ed
*entro quando*), e un 1–10 diventa aritmetica ricontabile invece che
un'opinione travestita.

---

## 1. Le decisioni prese (2026-08-05)

Non si riaprono. Composizione di Lorenzo sui facsimili delle tre forme.

| # | Asse | Decisione |
|---|---|---|
| 1 | Materie | **M1 — sei materie, due regimi**: tutte e sei dichiarate; il voto compare solo dove il traguardo è di legge (oggi Trasparenza e Spesa), Promesse va **a fatti**, Sicurezza · Decoro · Ascolto dichiarano che cosa le accenderebbe |
| 2 | Forma del giudizio | **V1 — voto 1–10 ricontabile**: mappatura pubblicata da una lista di controlli con traguardo normativo; ogni punto perso è una riga con fonte e data. Dove il traguardo non c'è, il voto non c'è |
| 3 | Cadenza | **C1 — trimestrale**: l'indicatore di tempestività è trimestrale per legge, le fonti vere non si muovono più spesso, sono 4 ricognizioni l'anno. Il titolo perde «mensile» |
| 4 | Valutazioni dei cittadini | **R1 — accostate, mai nel voto**: riquadro «La voce dei cittadini» con stelle e campione come contesto; finché i voti sono di semina porta la dichiarazione dei dati dimostrativi |
| 5 | La scala | **1 + 9 × quota dei controlli superati**, arrotondato: zero superati = 1, tutti = 10. Formula unica, nessun peso per controllo. Cambiarla è un bump di versione |
| 6 | Ampiezza | **Tutto ora**: metodologia v1.1 + `lib/pagella.ts` + `/pagella` in forma A **senza alcuna edizione**; la ricognizione vera e la prima edizione dopo il 27/08, col Lavoro C |

### 1.1 Le regole derivate, dichiarate nel giro e non contestate

1. **Nessun voto d'insieme della giunta.** Le materie non si sommano: sarebbe
   la prima cifra citata fuori contesto — l'argomento che ha rinominato
   «Pistoia Index».
2. **Nessun seed per la pagella.** Un'edizione inventata su una giunta vera
   non è un dato dimostrativo (`AGENTS.md`, regola fondante). `EDIZIONI`
   nasce vuoto e un test lo fa da guardiano.
3. **Prima edizione non prima del 27/08/2026** — il termine dell'art. 14 per
   la giunta proclamata il 27/05/2026. Il Lavoro C (la verifica alla
   scadenza) diventa la prima riga di Trasparenza.
4. **La metodologia della pagella è il capitolo 2 di `/metodologia`** (regole
   13–20), stessa versione unica **v1.1**, voce nel registro, costanti
   interpolate da `lib/pagella.ts`, timbro condiviso. Il primo voto nascerà
   già timbrato (`EdizionePagella.versioneMetodologia`).
5. **La replica in demo dichiara «non ancora richiesta».** Chiedere una
   replica vera al Comune è un'azione verso l'esterno: non parte senza una
   decisione esplicita di Lorenzo.
6. **Un voto si pubblica solo intero**: se anche un solo controllo della
   materia è senza riga pubblicabile (fonte con URL e data), il voto
   dell'intera materia non esce e la pagina dice perché. Togliere righe dal
   denominatore gonfierebbe il voto in silenzio.

---

## 2. Cosa la pagella NON fa

1. **Non vota una persona.** Il voto vive al livello della giunta
   (`ROADMAP.md` §6, prerequisito 4). Vale anche per il dossier di domani.
2. **Non somma le materie.** Nessuna media della giunta, mai.
3. **Non calcola su dati dimostrativi.** Le segnalazioni e i voti seminati
   non entrano in nessun voto: riguarderebbero persone vere.
4. **Non fonde l'umore negli adempimenti.** Le stelle dei cittadini sono
   contesto accostato col proprio campione, mai un addendo.
5. **Non decora le assenze.** Una materia senza fonte dice che cosa la
   accenderebbe; una materia senza edizione dice quando arriverà.
6. **Non inventa traguardi.** Nessuna soglia editoriale: se la norma non
   fissa il termine, si contano i fatti e non si vota.

---

## 3. Le sei materie e i due regimi

Inventario delle fonti fatto in scoperta (2026-08-05):

| Materia | Regime v1.1 | Fonte reale | Il traguardo lo fissa |
|---|---|---|---|
| Trasparenza | **voto** | Amministrazione trasparente (art. 14 e art. 33 D.Lgs 33/2013) | La legge |
| Spesa | **voto** | Delibere di bilancio (termini TUEL) · indicatore di tempestività dei pagamenti | La legge |
| Promesse | **fatti** | Linee programmatiche di mandato (TUEL art. 46) — *da censire in ricognizione* | Nessuno, salvo gli impegni che dichiarano una data propria: quelli si contano uno a uno |
| Sicurezza | senza fonte | ISTAT delitti: provinciale, annuale, ~2 anni di ritardo → inservibile per giudicare una giunta | — |
| Decoro | senza fonte | Solo segnalazioni della piattaforma → dimostrative | — |
| Ascolto | senza fonte | Nessun dato pubblicato; servirebbero richieste di accesso civico **vere** (azione esterna, decisione a parte) | — |

⚠️ **La materia «Promesse» non è il tracker `/promesse`**: quello vive sul
seed dimostrativo (`Commitment`), la materia si ancora alle linee
programmatiche reali. Se e come collegarli si decide alla prima ricognizione,
non prima.

---

## 4. I controlli della v1.1

Definiti dalle norme, non dal portale: la ricognizione ne verifica lo stato,
non inventa la lista. Vivono in `CONTROLLI` (`src/lib/pagella.ts`).

**Trasparenza (7):** atto di nomina e durata (art. 14 c.1 lett. a) ·
curriculum (lett. b) · compensi connessi alla carica (lett. c) · altre
cariche e incarichi (lett. d–e) · situazione patrimoniale e reddituale
(lett. f) · **tutto nei termini** (art. 14 c.2: tre mesi dalla proclamazione
→ 27/08/2026) · indicatore trimestrale di tempestività dei pagamenti
pubblicato (art. 33).

**Spesa (3):** bilancio di previsione approvato nei termini (TUEL art. 151) ·
rendiconto approvato nei termini (TUEL art. 227) · pagamenti entro i termini
di legge (l'indicatore di tempestività dentro i limiti del D.Lgs 231/2002).

**La formula:** `voto = 1 + round(9 × superati / totale)` — `votoPagella()`.
Il 10 significa «tutto ciò che era dovuto», non «bravissimi»; la metodologia
lo dice alla lettera.

Se la prima ricognizione mostrerà che un controllo è mal posto (es. la
griglia OIV meriterebbe una voce), la lista cambia **prima** della prima
edizione con bump e voce di registro — mai in silenzio.

---

## 5. Il modello

```
MateriaPagella   id · nome · regime(voto|fatti|senza-fonte)
                 · descrizione · cosaLaAccenderebbe?

ControlloPagella id · materiaId · controllo · traguardoDi (la norma)

EsitoControllo   controlloId · superato · riga { affermazione, fonte,
                 urlFonte, dataConsultazione }   ← il modello Riga di
                 lib/costo-amministrazione.ts, una definizione sola

EdizionePagella  periodo («2026-T3») · dataConsultazioni
                 · versioneMetodologia (il timbro, scattato alla scrittura)
                 · esiti · replicaRichiestaIl? · replicaRicevutaIl?
                 · replicaTesto?
```

Regole del modulo: `esitiPubblicabili()` scarta le righe senza `urlFonte`;
`votoMateria()` restituisce `null` se anche un solo controllo della materia
manca o non è pubblicabile (§1.1, regola 6); `EDIZIONI = []` finché la prima
ricognizione non esiste. Tutto senza database: le edizioni sono ricognizioni
manuali versionate nel repository, come `lib/costo-amministrazione.ts`.

---

## 6. Le fasi

### P-1 · La metodologia v1.1 ✅ *(2026-08-05)*
`lib/pagella.ts` (materie, controlli, formula, modello) · capitolo «La
pagella della giunta» in `lib/metodologia.ts` (regole 13–20, costanti
interpolate) · bump a v1.1 con voce di registro · `/metodologia` rende i due
capitoli.
**Cancello:** `tests/unit/metodologia.test.ts` esteso costante per costante
(cambia INSIEME alla versione) + `tests/unit/pagella.test.ts` (formula agli
estremi, rifiuto senza fonte, `EDIZIONI` vuoto come guardiano del seed).

### P-2 · La pagina in forma A, senza edizione ✅ *(2026-08-05)*
`/pagella` riscritta sui dati di `lib/pagella.ts`: sei materie nei due
regimi, **nessun voto** («prima edizione dopo il 27 agosto 2026»), i
controlli elencati come promessa verificabile, replica in stato anteprima,
riquadro «La voce dei cittadini» (R1) con dichiarazione dei dati
dimostrativi, colophon `TimbroMetodologia`. Le ancore `#metodologia` e
`#fonti` restano: `ChiPubblica` ci punta.
**Cancello:** la verifica intera (`AGENTS.md` §5).

### P-3 · La prima edizione *(dopo il 27/08/2026 — col Lavoro C)*
La ricognizione vera: ogni controllo → esito con riga (URL + data), il
censimento delle linee programmatiche per Promesse, l'edizione «2026-T3»
timbrata v1.1 (o successiva), l'archivio che nasce. La richiesta di replica
al Comune resta una decisione esplicita di Lorenzo.
**Cancello:** ogni riga pubblicata ha URL e data; il voto si riconta a mano
dalla pagina; verifica intera.

#### P-3a · La ricognizione preparatoria ✅ *(2026-08-08)*

Fatta oggi ciò che non dipende dal 27/08, in
[`docs/fonti-pagella.md`](fonti-pagella.md). Due risultati:

1. **La mappa del portale della trasparenza.** Il menu di Amministrazione
   Trasparente è guidato dal JavaScript — `href="#"` o verso la radice, e
   l'indirizzo vero in `data-mainurl` — quindi un lettore che raccolga gli
   `href` conclude che il portale ha una pagina sola. Estratte **94 voci
   foglia**, e con esse l'indirizzo esatto di ogni griglia che i dieci
   controlli citano. Ogni griglia esporta l'elenco **intero** in CSV: si usa
   quello, non si sfoglia. ⚠️ `WebFetch` sulla radice prende 403, un browser
   vero prende 200.

2. **Il censimento di Promesse si ferma prima degli impegni, e il perché
   conta più del risultato.** L'ordine del giorno del Consiglio del
   **15/06/2026** dice, al punto 5, «LINEE PROGRAMMATICHE DI MANDATO –
   **PRESENTAZIONE**»; due testate locali scrivono invece che sarebbero state
   **approvate** 18 a 6. Non è la stessa cosa: il TUEL art. 46 c. 3 fa
   *presentare* le linee, e se ci sia un voto lo dice lo statuto. Il testo del
   documento **non risulta pubblicato** in nessuna delle quattro fonti aperte
   (188 atti esportati e letti, zero righe pertinenti).

   Quindi **zero impegni censiti**, e nessuna delle due versioni entra in
   pagina: scrivere «delibera di approvazione del 15/06/2026» attribuirebbe
   alla giunta una decisione la cui esistenza non è provata — la cosa che
   `AGENTS.md` vieta per prima. Le condizioni che chiudono le due aperture
   sono in `fonti-pagella.md` §3.

**Nessuna edizione è nata**: `EDIZIONI` resta vuoto e il suo guardiano verde.

---

## 7. Cosa resta aperto

1. **La griglia OIV/ANAC nel set dei controlli** — si decide alla prima
   ricognizione (v1.2 se entra).
2. **Il rapporto fra la materia Promesse e il tracker demo `/promesse`** —
   alla prima ricognizione.
3. **La richiesta di replica vera al Comune** — decisione esplicita di
   Lorenzo, mai automatica.
4. **Il dossier persona** erediterà da qui la regola «nessun voto su un
   individuo» e il blocco replica; non è iniziato.
