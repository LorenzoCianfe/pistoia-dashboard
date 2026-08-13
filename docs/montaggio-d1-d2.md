# Il montaggio di D1 e D2 — O10, tappa b

> Fatto il **2026-08-12 (sera)**, subito dopo la ricognizione. Le due direzioni
> di [`ricognizione-visiva.md`](ricognizione-visiva.md) §6 montate su **tre
> pagine vere** dell'applicazione e fotografate nei due temi.
>
> Le sedici schermate vivono in **`mockups-o10/`** (fuori da git, come
> `refs-o10/`): sono materiale di decisione, non artefatti del prodotto. Ciò
> che sopravvive alla scelta è **questo documento** e la riscrittura di
> `DESIGN.md` §1 e §6.
>
> ⚠️ **Nessun codice del prodotto è stato toccato.** I mockup sono iniezioni a
> runtime sull'applicazione vera (dev server + DevTools MCP), con stili in
> linea per tutto ciò che non è già nel sorgente — la trappola di `AGENTS.md`
> §3 («Tailwind v4 compila solo le classi che trova nel SORGENTE»).

---

## 1. Che cosa è stato montato

| Pagina | Rotta vera | Che cosa mette alla prova |
|---|---|---|
| **La prima pagina** | `/` (anonima, contesto isolato) | Il fatto del giorno + il numero-monumento + la didascalia della redazione |
| **La pagina dell'atto** | tela `/metodologia` | Il doppio titolo onesto e il contesto che spiega |
| **La pagina di lavoro** | `/admin/segnalazioni/[id]` **vera, coi dati veri** | La densità: lista + dettaglio, moduli, code |

Sedici schermate: le tre pagine × D1/D2 × chiaro/scuro, più le **tre dosi di
rosso** sulla prima pagina e le due prove a **360px in modalità semplice**.

**Tutti i contenuti della prima pagina e della pagina atto sono fatti veri**,
presi da `dev.db` con una lettura di sola lettura:

- il fatto del giorno è la **determinazione 1692/2026** dell'11 agosto
  (efficientamento dell'istituto «Raffaello», U.O. Amministrativa LLPP);
- il fiume del giorno sono quattro atti veri dello stesso giorno;
- la pagina atto è la **determinazione 1688/2026**, che nomina il Bottegone,
  e i tre atti correlati appartengono davvero allo stesso programma;
- i numeri della striscia: **2.923** atti nel 2026, **90** negli ultimi sette
  giorni, **26.644** in archivio;
- il numero-monumento è il **costo della giunta**, ricalcolato dalla catena di
  `lib/costo-amministrazione.ts`: 9.660 + 7.245 + 7×5.796 = **57.477 €/mese**,
  cioè **689.724 € l'anno**.

---

## 2. Il fatto misurato che decide una regola: il rosso e il contrasto

Misurato col browser sui colori veri del tema, non stimato. Nel **tema
chiaro** (il tema canonico), il rosso della città come **testo minuto**:

| Dove sta il kicker | `--red` pieno | `--red-ink` |
|---|---|---|
| Sulla **tela** (fuori dalle card) | **3,69:1** ❌ | **4,48:1** ❌ |
| Su **card piena** (D1) | 4,56:1 ✅ | 5,54:1 ✅ |
| Su **vetro** (D2, card al 72%) | **4,31:1** ❌ | 5,23:1 ✅ |
| Dentro la pastiglia `--red-soft` | 3,72:1 ❌ | **4,52:1** ✅ |

Nel tema scuro passano tutti (5,8–6,3:1): **il problema è solo del chiaro**, ed
è la stessa asimmetria del debito di tavolozza del 2026-08-05.

**Le tre conseguenze, che valgono qualunque direzione vinca:**

1. **Il rosso editoriale non vive sulla tela.** Il kicker «MOBILITÀ» sopra il
   titolo di un atto, in rosso su grigio caldo, è sotto AA — e nemmeno
   `--red-ink` lo salva (4,48, due centesimi sotto). Nei mockup è diventato una
   **pastiglia `--red-soft` + `--red-ink`**, che misura 4,52 ed è il pattern
   già di sistema.
2. **D1 regge la dose 2 con margine, D2 solo con `--red-ink`.** Sul vetro il
   rosso pieno fa 4,31. Non è un argomento decisivo contro D2, ma è un vincolo
   in più che D2 si porta dietro.
3. È la conferma pratica di P2 («il payload si legge sul pieno») da una porta
   che la ricognizione non aveva previsto: **non solo il testo minuto, anche il
   colore minuto** ha bisogno di una superficie piena sotto.

⚠️ **Un limite dei mockup, dichiarato:** i link testuali sono alti **25px**,
sotto i 44 di `DESIGN.md` §11.6. Nei mockup non conta (sono superfici di
giudizio), ma in produzione o diventano bersagli da 44px o vanno giustificati
con l'eccezione della spaziatura. Traboccamento orizzontale a 360px in
modalità semplice: **0** in entrambe le direzioni.

---

## 3. Le due direzioni, come sono state rese

### D1 — «La piazza di giorno»

- Il **vetro sale sul telaio**: testata appiccicata in alto, translucida e
  satura; le barre e le pastiglie di navigazione galleggiano.
- Il **contenuto sta su superfici piene** e calde: la card del fatto del
  giorno, il fiume, le porte. Niente `backdrop-filter` sotto il testo.
- **Luce ambientale sulla tela** (P3): un ambra caldissimo in alto a destra,
  un teal appena percettibile a sinistra. I componenti restano neutri.
- **Un'isola scura per pagina** (P4): il numero-monumento sulla prima pagina
  — e, sulla pagina di lavoro, **la voce di coda su cui si sta lavorando**,
  che dà la gerarchia senza usare colore.

### D2 — «Vetro di città»

- Il **vetro resta sulle card** e sale di grado: due materiali dichiarati —
  *regular* (le card, 72%) e *clear* (il monumento, 34% con blur minore).
- **Il payload sempre su pieno** (P2): dentro il monumento le barre e la
  didascalia stanno su una superficie opaca; nella pagina atto l'oggetto
  ufficiale è una targa piena dentro la card di vetro; nella pagina di lavoro
  i campi del modulo sono pieni.
- **Profondità ambientale dietro**: cinque pozze di colore più strette e più
  sature di D1 — il vetro ha bisogno di materia da sfocare, e una luce diffusa
  non basta a farlo leggere come materiale.

### D3 — lo scuro (tesi condivisa)

Entrambe di notte sono **vetro scuro sopra la città**: gradini di luminanza,
un solo accento caldo (ambra sul fondo), zero freddezza. In D1 l'isola scura
diventa un gradino più chiaro della tela (altrimenti sparirebbe); in D2 le
pozze restano visibili e fanno il lavoro della scena.

---

## 4. Il test dell'intruso (P21), pagina per pagina

> «Che cosa, qui, esiste SOLO perché questa è Pistoia?»

| Pagina | La risposta |
|---|---|
| **Prima pagina** | Il fatto del giorno **è un atto vero del Comune di Pistoia**, con l'oggetto ufficiale in chiaro sotto la didascalia: nessun portfolio può mostrarlo perché nessun portfolio ha un archivio. Il monumento è il costo della *nostra* giunta, con la catena di legge accanto. Le fasce romaniche fanno da separatore. |
| **Pagina atto** | Il doppio titolo — umano sopra, oggetto ufficiale integrale sotto — nasce da un vincolo che solo un archivio civico ha: *il testo ufficiale non si riscrive mai*. E «Dallo stesso programma» lega tre atti veri del **Bottegone**. |
| **Pagina di lavoro** | ⚠️ **La più esposta al test.** La coda con lista + dettaglio potrebbe stare in qualunque gestionale: ciò che la radica è la riga «urgenze da validare» e il fatto che le voci siano segnalazioni di strade di Pistoia. È la pagina su cui il rischio «intruso» resta più alto, e va detto. |

---

## 4-bis. Che cosa è successo dopo (2026-08-12, stessa sera)

Lorenzo ha risposto alle quattro domande **componendo**, come al solito:

- **Dose del rosso: 2** — la pastiglia del tema, il precedente FT. Deciso.
- **Striscia dei dati: opzione 1** — prima pagina *e* pagine di lavoro. Più una
  richiesta nuova: «accanto agli stipendi e alla posizione di sindaco,
  assessore ecc, scrivici i nomi e i partiti».
- **Direzione e isola scura: non scelte fra D1 e D2.** Al loro posto un brief:
  *migliorare l'interfaccia esistente* — layout, proporzioni, spaziature,
  allineamenti, gerarchia, leggibilità, coerenza, micro-interazioni — «senza
  ricostruirla da zero e senza stravolgere contenuti e funzionalità», evitando
  l'effetto template e il generico.

**Che cosa se ne deduce, dichiarato per essere corretto:** la biforcazione
D1/D2 non è la domanda che gli interessa. Il vestito nuovo non si sceglie come
un tema da applicare: si ottiene alzando la qualità esecutiva di ciò che c'è —
che è il perimetro tecnico di O10 già scritto in `ROADMAP.md` («spaziature,
allineamenti, proporzioni, contrasto, tipografia, ritmo visivo… micro-
interazioni intenzionali»). Le due direzioni restano un serbatoio di regole,
non un bivio: da D1 si prende ciò che serve alla leggibilità, da D2 la
continuità del materiale.

⚠️ **La tensione, dichiarata invece di indovinata:** «mantieni l'identità e la
logica del sito» convive con un rebranding già deciso (§1.4, §1.9) che *toglie*
l'identità attuale. L'ipotesi sotto cui si è proceduto: «identità» significa la
personalità visiva e la logica del prodotto, **non** lo stemma del Comune — che
Lorenzo stesso ha deciso di togliere il 12/08. Se l'ipotesi è sbagliata, il
rebranding si inverte con un `git revert`.

### La richiesta dei partiti, misurata prima di prometterla

I **nomi** ci sono già e hanno la loro fonte (`lib/costo-amministrazione.ts`,
la presentazione della giunta del 10 giugno 2026): entrano quando la prima
pagina esiste.

I **partiti no, e non è pigrizia** — la fonte non regge, ed è misurato in
[`fonti-organigramma.md`](fonti-organigramma.md) §2.2:

- **quattro assessori su otto non compaiono in nessuna delle dodici liste**,
  perché gli assessori li nomina il sindaco (TUEL art. 46 c. 2). Dare il
  partito a chi ce l'ha e lasciare vuoto agli altri **non è neutro**: quel
  vuoto si legge «questi non li ha votati nessuno», che è falso;
- la lista di *candidatura* non è l'appartenenza politica *attuale*, e per un
  assessore nominato non esiste un dato ufficiale che la dichiari;
- accostare il partito a uno stipendio cambia registro: `direzione-prodotto.md`
  §1.13.3 dice che la piattaforma non fa campagna, e «numeri caldi, tono
  freddo» è la riga che tiene.

**La proposta al posto suo**, che è più informativa ed è vera al 100%: accanto
a ogni voce, **come si arriva alla carica** — «eletto sindaco», «nominata dal
sindaco», «eletto in consiglio, poi nominato» — con la lista di elezione dove
c'è. Dice al cittadino la cosa che conta davvero: chi ha votato, e chi no.
Decide Lorenzo.

## 4-ter. Il secondo giro di domande (2026-08-12, notte)

| Domanda | Risposta di Lorenzo |
|---|---|
| Il filo rosso al posto della scacchiera | **«mi piaceva la scacchiera»** — non una delle opzioni: un rilievo. Vedi sotto |
| I partiti accanto agli stipendi | ✅ **«come si arriva alla carica»** — eletto sindaco · nominata dal sindaco · eletto in consiglio poi nominato |
| `DESIGN.md` §6, il vetro | ✅ **resta sulle card, con la disciplina del pieno** (il dato minuto su superficie opaca dentro il vetro). §6 riscritta |
| Da dove parte il rifacimento | ✅ **la prima pagina su `/`** |

### La scacchiera, e perché il rilievo è fondato

«Mi piaceva» non è un capriccio: quel motivo **aveva una cifra**, ed è
esattamente ciò che il test dell'intruso (P21) chiede a ogni schermata. Il
filo rosso che l'ha sostituita è più sicuro e meno riconoscibile: un
gradiente sottile potrebbe stare in qualunque prodotto.

Ma il divieto non è arbitrario e non è mio: `direzione-prodotto.md` §1.9,
scritto lo stesso giorno su decisione sua, dice «lo *stemma* e la scacchiera
che lo evoca no». La ragione è il rischio che il §1.9 stesso nomina — essere
letti come l'app istituzionale — e quel rischio si paga una volta sola, quando
è troppo tardi.

**La via che salva il gusto senza l'araldica**, da provare sui mockup e non a
parole: ciò che cita lo stemma non è il *ritmo modulare*, è **l'alternanza
bicolore a scacchi**. Un ritmo di moduli quadrati **monocromi** — rossi su
trasparente, a passo regolare, senza il gioco bianco/rosso alternato — tiene
la geometria che piaceva e lascia fuori la citazione. È anche più vicino alle
**fasce romaniche** viste da vicino, che sono patrimonio della città e non
insegna dell'ente.

Le varianti da fotografare affiancate sulla stessa superficie vera: il filo
sfumato (stato attuale del codice) · i moduli monocromi · la scacchiera com'era.
Decide Lorenzo guardando — e se sceglie la scacchiera, allora cambia
`direzione-prodotto.md` §1.9, consapevolmente, invece di lasciarlo in
disaccordo col codice.

## 4-quater. Il terzo giro di domande (2026-08-12, notte fonda)

| Domanda | Risposta di Lorenzo |
|---|---|
| Il filo in cima alle superfici-firma (4 varianti fotografate) | 🔴 **«onesto mi fanno tutti pena, non metterci niente»** → **nessun motivo** sopra le card. Applicato: `.filo-civico` rimosso da tutte e cinque le superfici e dal foglio di stile |
| Il titolo del fatto del giorno | ✅ **Campo redazionale, e senza cura niente apertura**: se nessuno ha curato l'atto del giorno, la home apre col fiume degli atti e col monumento |
| Le nove persone nel monumento | ✅ **Tre righe raggruppate coi nomi** (sindaco · vicesindaca · «7 assessori»), ognuna con *come si arriva alla carica* |
| I 30+ file di oggi | ✅ **Non committare**: il lavoro resta locale, lo guarda lui |

### La lezione del filo, che vale oltre il caso

Quel filo era nato per **rimpiazzare** la scacchiera, non per risolvere un
problema: una casella «qui ci va un motivo» che nessuno aveva mai messo in
discussione. Messo alla prova in quattro varianti sulla superficie vera, non
ne convinceva nessuna — ed è il segno che la casella era sbagliata, non le
varianti. `DESIGN.md` §12 ora lo dice: **nessun ornamento, quando non risolve
niente**, e una superficie senza motivo è una scelta legittima.

## 5. Che cosa resta aperto

Chiuse il 12/08: la **dose di rosso** (2) · la **striscia dei dati** (prima
pagina e pagine di lavoro) · il **rebranding** (fatto, v0.49.0) · **`DESIGN.md`
§1** (riscritta) · **§6 il vetro** (resta sulle card, con la disciplina del
pieno) · **§3 i motivi** (niente scacchiera, niente filo, nessun ornamento
obbligatorio) · **il titolo del fatto del giorno** (campo redazionale) · **il
monumento** (tre righe coi nomi e il modo di accesso alla carica) · **i
partiti** (fuori, con la resa alternativa al loro posto).

Restano:

1. **L'isola scura**: usata nei mockup, mai decisa. Diventa regola di sistema
   («una per pagina») o resta un gesto della sola prima pagina?
   ▶️ **Costruita il 12/08 come gesto della sola prima pagina**, coi token
   `--isola*` e la classe `.isola` (`DESIGN.md` §6): contrasti misurati 16,3:1
   nel chiaro e 13,8:1 nello scuro, dove sale invece di scendere perché una
   card più nera della tela near-black sparirebbe. **La generalizzazione resta
   aperta e non si fa da sé**: il vincolo «una per pagina» non è scritto da
   nessuna parte, e finché non lo decide Lorenzo l'isola non esce da `/`.
2. **Il logo vero** (P11): il segno «P» è un placeholder dichiarato. Con lui
   arrivano favicon e icona della schermata home.
3. **I badge di ruolo** (P14) e il **riordino delle sezioni**.
4. ~~**Il carattere del titolo del fatto del giorno**~~ ✅ **Fatto il 12/08.**
   Le tre righe di guida vivono accanto al campo, sulla superficie di
   `/redazione`: *spiega non gridare* · *niente punti esclamativi né giudizi* ·
   *se il titolo non si capisce senza l'atto, non è ancora un titolo*. Più un
   rifiuto che nessuna guida può sostituire: **il titolo non può essere
   l'oggetto ufficiale ricopiato**, perché sarebbe la barriera rimessa a mano
   in cima alla prima pagina.
