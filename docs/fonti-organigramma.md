# Fonti — `/organigramma`

> Ogni nome, ogni delega e ogni recapito della rotta `/organigramma` si àncora a
> una riga di questo documento. Il renderer **rifiuta** chi non porta una fonte
> (`componentiPubblicabili()` in `src/lib/giunta.ts`).
>
> Ricognizione: **2026-08-03**. Tutte le fonti sotto sono state scaricate e
> lette, non citate di seconda mano.
>
> Compagno di `fonti-costo-amministrazione.md`, che copre gli **importi**. Qui
> ci sono le **persone**. Le due pagine devono dire le stesse nove: un test lo
> verifica (`tests/unit/giunta.test.ts`).

---

## 0. Perché questo documento esiste

Fino al 2026-08-03 `/organigramma` mostrava una giunta inventata dal seed —
Marco Ferrari sindaco, Elena Bartolini vicesindaca — mentre
`/trasparenza/costo-amministrazione`, **a un clic di distanza**, dava Giovanni
Capecchi e Stefania Nesi. Due risposte diverse alla stessa domanda dentro la
stessa applicazione, nate dall'aver dato dati veri a una sola delle due pagine.

La correzione non era «copiare i nomi». Mettere nomi **veri** accanto a numeri
**inventati** è peggio del punto di partenza: «24.180 preferenze» su Marco
Ferrari è un dettaglio innocuo di una persona che non esiste, la stessa cifra su
Giovanni Capecchi è un'affermazione falsa su una persona reale.

---

## 1. Le nove persone

Ogni riga cita la **scheda personale**, non la notizia di presentazione della
giunta del 10 giugno 2026. Due ragioni: la notizia dà la carica ma non le
deleghe enumerate, e **due schede sono state aggiornate dopo** — Nesi il 28
luglio, Giusti il 21 luglio. Citare la notizia dichiarerebbe una data più
vecchia del fatto mostrato.

| Persona | Carica come la scrive il Comune | Deleghe | Recapito | Scheda aggiornata |
|---|---|---:|---|---|
| **Giovanni Capecchi** | Sindaco | 6 competenze (TUEL, non deleghe) | `sindaco@comune.pistoia.it` | 15/06/2026 |
| **Stefania Nesi** | Vicesindaca, Assessora a Politiche strategiche di area vasta, Attività produttive, Progettazione europea | 4 | `s.nesi@` | 28/07/2026 |
| **Olimpia Banci** | Assessora a Commercio, Turismo, Sicurezza urbana | 7 | `o.banci@` | 15/06/2026 |
| **Sandro Giannessi** | Assessore a Sociale, Salute, Politiche per la casa | 4 | `s.giannessi@` | 18/06/2026 |
| **Matteo Giusti** | Assessore a Lavori pubblici, Mobilità, Sport, Periferie e Decentramento, Politiche per la collina e la montagna | 12 | `m.giusti@` | 21/07/2026 |
| **Mattia Nesti** | Assessore a Bilancio, Partecipate, Patrimonio, Ambiente | 9 | `m.nesti@` | 18/06/2026 |
| **Marica Setaro** | Assessora a Cultura, Università e Tradizioni | 6 | `m.setaro@` | 15/06/2026 |
| **Elena Sinimberghi** | Assessora a Servizi educativi, Politiche del personale, Politiche giovanili e Pari opportunità | 7 | `e.sinimberghi@` | 19/06/2026 |
| **Riccardo Trallori** | Assessore a Urbanistica, Rigenerazione urbana, Verde pubblico | 8 | `r.trallori@` | 15/06/2026 |

Schede: `https://www.comune.pistoia.it/it/person/<slug>` — gli slug esatti stanno
in `src/lib/giunta.ts`. Il sindaco sta invece su
<https://www.comune.pistoia.it/it/unita_organizzative/sindaco>.

L'insieme — che siano **nove** e non dieci — lo dichiara la pagina della giunta,
ed è una riga a parte: da una scheda alla volta il numero non si ricava, e un
elenco troncato che si presenta come completo è un dato inventato per omissione.
· <https://www.comune.pistoia.it/it/unita_organizzative/giunta-comunale>

### 1.1 Le due versioni delle deleghe non erano una contraddizione

La ricognizione precedente aveva trovato **due versioni** delle deleghe di
Stefania Nesi e per questo le aveva omesse tutte da
`/trasparenza/costo-amministrazione`. La scelta era prudente e la diagnosi
sbagliata: ogni scheda porta **due cose distinte**, non due versioni.

| | Che cos'è | Per Stefania Nesi |
|---|---|---|
| **Carica** | il sommario, che è anche il titolo della scheda | «Vicesindaca, Assessora a Politiche strategiche di area vasta, Attività produttive, Progettazione europea» |
| **Deleghe** | il portafoglio enumerato, sotto l'intestazione `Deleghe:` | Politiche strategiche di area vasta · Attività produttive, **vivaismo e sviluppo economico sostenibile** · Progettazione europea · **Rapporti con il Consiglio Comunale** |

Le due voci in grassetto sono ciò che faceva sembrare le versioni discordanti:
una delega che nel titolo non compare, e un'altra che nel titolo compare
abbreviata. **Il titolo è il sommario, l'elenco è il portafoglio.** Vale come
regola: quando due estrazioni della stessa pagina divergono, prima di scegliere
quale sia giusta si guarda se stanno descrivendo due cose diverse.

Le deleghe pubblicate sono **57**, tutte dagli elenchi enumerati. Nessuna è
assegnata a due persone (c'è un test).

---

## 2. Perché non c'è nessun numero di preferenze

`votesElected` è stato **rimosso dal modello**, non riempito con numeri veri.
Non è prudenza: per cinque persone su nove il numero non esiste in nessuna
fonte, e per la nona è ambiguo.

Fonte dei dati elettorali: portale del Comune (Eleweb), che serve gli scrutini
come JSON statico — 12 liste, 357 candidati, preferenze una per una.
· <https://elezioni.comune.pistoia.it/amministrative/voti_raggruppamento.html?cdele=N1>
· dati: `https://elezioni.comune.pistoia.it/static_json/online/<cartella>/1/voti_candi_0.json`
· pagina del Comune sui risultati · <https://www.comune.pistoia.it/it/news/i-risultati-delle-elezioni-amministrative-2026>

### 2.1 Un candidato sindaco non riceve preferenze

È votato sulla **scheda del sindaco**; le preferenze sono i voti personali ai
candidati di lista. Nell'elenco dei 357 candidati «Giovanni Capecchi» **non
compare affatto** — compaiono Fabio, Francesca e Tommaso Capecchi, che sono
altre tre persone. Il seed attribuiva 24.180 «preferenze» a una carica che
quelle preferenze non le riceve.

### 2.2 Quattro assessori su otto non erano candidati

**Banci, Setaro, Sinimberghi, Trallori** non compaiono in nessuna delle dodici
liste. È normale e legittimo: gli assessori li nomina il sindaco (TUEL art. 46
c. 2), non li elegge il corpo elettorale.

Conseguenza vincolante: dare il numero ai quattro che ce l'hanno e lasciare
vuoto agli altri quattro **non è neutro**. Quel vuoto si legge «questi non li ha
votati nessuno», che è falso. È la famiglia di `AGENTS.md` §3 (ondata 7, 3): un
dato mancante messo accanto a un dato presente diventa un giudizio.

### 2.3 Chi le ha, ha lasciato il seggio che descrivono

| Persona | Preferenze | Lista |
|---|---:|---|
| Stefania Nesi | 1.776 | Partito Democratico – Capecchi Sindaco |
| Matteo Giusti | 670 | Partito Democratico – Capecchi Sindaco |
| Mattia Nesti | 463 | Alleanza Verdi Sinistra – Sinistra Civica Ecologista |
| Sandro Giannessi | 368 | Capecchi Sindaco |

Tutti e quattro eletti consiglieri e tutti e quattro **decaduti il giorno della
nomina**:

> «La carica di assessore è incompatibile con la carica di consigliere comunale
> e provinciale.» … «Qualora un consigliere comunale o provinciale assuma la
> carica di assessore nella rispettiva giunta, **cessa dalla carica di
> consigliere all'atto dell'accettazione della nomina**, ed al suo posto subentra
> il primo dei non eletti.»

TUEL (D.Lgs. 267/2000) **art. 64 commi 1 e 2**, testo vigente. Il comma 3 esclude
i comuni fino a 15.000 abitanti: Pistoia ne ha ~89.000, quindi si applica.
· <https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2000-08-18;267~art64>

Scrivere «eletto con 670 preferenze» sulla scheda di un assessore descrive una
carica che quella persona **non ha più**.

### 2.4 E il numero del sindaco è ambiguo quattro volte

Il portale dichiara in testa **«DATI NON UFFICIALI»**, e dallo stesso file si
ricavano tre letture del risultato di Capecchi:

| Lettura | Valore |
|---|---:|
| voti al candidato sindaco (`voti`) | **22.512** |
| al netto dei voti al solo sindaco (`voti − voti_nona`) | **21.478** |
| somma delle liste della sua coalizione | **21.572** |
| *pubblicata dalla stampa* | *21.709* |

Le percentuali coincidono tutte (~54,3%), gli assoluti no. Quattro numeri
plausibili per la stessa persona: è la categoria di difetti che qui costa di più
(`AGENTS.md` §4). Anche volendo tenere il campo per il solo sindaco, non ci
sarebbe un numero da scrivere.

### 2.5 Che cosa lo sostituisce

`insediamento`: **come** ciascuno è arrivato alla carica.

- Sindaco — «Eletto alle comunali del 24 e 25 maggio 2026, proclamato il 27
  maggio», dalla sua scheda: *«Il 27 maggio 2026 è stato proclamato sindaco di
  Pistoia Giovanni Capecchi, eletto alle consultazioni amministrative del 24 e
  25 maggio.»*
- Gli altri otto — «Nominato/Nominata dal sindaco», che è la competenza che la
  stessa scheda gli attribuisce: *«nomina e revoca gli assessori a cui delega
  competenze e attribuzioni»*.

È vero per tutti e nove, viene da una fonte sola, e risponde alla domanda che il
numero fingeva di rispondere.

---

## 3. I recapiti — letti, mai dedotti

Tutti e nove pubblicati come `mailto:` sulla propria scheda.

Gli otto assessori seguono `iniziale.cognome@comune.pistoia.it` — uno schema così
regolare da invitare a dedurlo. **Il sindaco è `sindaco@comune.pistoia.it`, non
`g.capecchi@`.** Chi avesse dedotto dallo schema avrebbe sbagliato proprio la
persona più in vista della pagina, e un recapito inventato che rimbalza è
peggio di nessun recapito. C'è un test che blocca la scorciatoia.

---

## 4. Ciò che la pagina non dice

1. **Nessun voto, nessuna classifica.** `/organigramma` non giudica: elenca chi
   ha la responsabilità di che cosa. Per questo non porta la dichiarazione di
   chi pubblica (`ROADMAP.md` §6, prerequisito 1) — che serve alle pagine che
   danno un giudizio.
2. **Nessuna cifra display.** Le due candidate rimaste sono tautologiche: «8
   assessori» e «9 contattabili su 9» contano schede che il lettore ha già
   davanti. Dettaglio in `FEATURES.md` §5.
3. **I «follower» non sono un consenso.** Il conteggio viene dai «Segui» degli
   utenti dimostrativi ed è una funzione dell'applicazione, non un dato sulla
   persona. Dal 2026-08-03 non è più promesso nella descrizione della pagina.
4. **Le competenze del sindaco non sono deleghe.** Gliele attribuisce il TUEL,
   non un decreto di delega: stanno sulla sua scheda e restano fuori
   dall'indice delle deleghe.
