# Prompt per la sessione successiva

> Aggiornata il **2026-08-12 (sera)**, a chiusura della sessione che ha
> costruito **la prima pagina** e **il guscio nuovo**: due versioni (0.50.0 e
> 0.51.0), sei difetti chiusi, e un debito di verifica dichiarato.
>
> **Fidati di questa, non di quello che ricordi.**

---

## Il prompt da incollare

```
Pistoia.app (già «Dashboard di Pistoia»). O10 — IL BATTESIMO — è APERTA e ha
fatto TRE passi nel codice: il marchio (v0.49.0), LA PRIMA PAGINA (v0.50.0) e
IL GUSCIO NUOVO (v0.51.0). Tutto è committato e pushato su `main`.

🔴 PRIMA DI TOCCARE QUALSIASI COSA, IL DEBITO DI VERIFICA:
La suite E2E completa NON è stata rilanciata sull'ultimo stato del codice.
L'ultimo giro ha dato 177 passati e 2 rossi, e il secondo è stato riscritto
ma MAI ESEGUITO (decisione di Lorenzo: committare senza il giro di verifica).
Il primo comando della sessione è:
    npx playwright test tests/e2e/porte.spec.ts
e poi, a macchina scarica, `npm run test:e2e` intero.
I due rossi, per non ridiagnosticarli da zero:
1. accessibilita.spec.ts → «redazione (moderatore)»: login in TIMEOUT su
   /login. È la firma dell'AMBIENTE di AGENTS §3 (2026-08-11) — rosso
   d'attesa, non di merito, su una suite girata a macchina carica (22,3 min
   contro 18,3). Non riprodotto in isolamento.
2. porte.spec.ts → la goccia con prefers-reduced-motion: rosso MIO e
   legittimo. Leggeva la goccia 50ms dopo il fuoco: una soglia in
   millisecondi è una scommessa sulla velocità della macchina. Riscritto per
   campionare fotogramma per fotogramma e pretendere al massimo DUE posizioni
   distinte. Da eseguire.

LEGGI PRIMA, in quest'ordine:
- docs/prossima-sessione.md — è questa: la consegna completa.
- docs/direzione-prodotto.md — 🔴 LA CARTA DEL PRODOTTO, vincolante. §1.6-bis
  (la prima pagina), §1.10 (il carattere visivo), §1.11 (struttura e
  telefono), §1.12 (il fatto del giorno curato e il monumento coi nomi).
- AGENTS.md — vincolante. §3 ha 58 trappole già pagate; le ultime sette sono
  di questa sessione. §5 dice cosa significa «fatto»; §8 server/deploy.
- DESIGN.md — vincolante. §6 ha DUE regole nuove: **il guscio dà lo spazio, il
  testo si dà la misura** (in `ch`) e **`cqw` invece di `vw`**; più l'ISOLA.
  §7 ha la goccia (reattiva, mai ambientale). §8 la live region di
  DisplayNumber (P24).
- docs/montaggio-d1-d2.md — i TRE GIRI di domande con le risposte di Lorenzo.
- docs/ricognizione-visiva.md — 27 pattern (P1–P27) con le fonti.
- ROADMAP.md, Ondata 10.

IL BRIEF DI LORENZO, testuale e vincolante (12/08): migliorare l'interfaccia
ESISTENTE rendendola più professionale, curata e visivamente convincente —
SENZA ricostruirla da zero e senza stravolgere contenuti e funzionalità.
Lavorare su: qualità e armonia del layout, spaziature, allineamenti, gerarchia
dei contenuti, leggibilità, proporzioni, coerenza fra colori/font/componenti,
aspetto dei pulsanti e delle interazioni, ordine e chiarezza della pagina,
adattamento a desktop/tablet/mobile. Aggiungere micro-interazioni e animazioni
ELEGANTI e funzionali — mai effetti esagerati, bagliori, gradienti casuali o
decorazioni senza funzione. Prima di chiudere: rivedere il sito e correggere
ciò che appare generico, disordinato, sproporzionato, incoerente, vuoto,
affollato, poco leggibile, poco professionale o da template.
⚠️ Lorenzo si aspetta «un bel lavoro di design» e sa che MOLTO È ANCORA DA FARE.

CHE COSA C'È GIÀ, e non si rifà:
- LA PRIMA PAGINA su `/`: pubblica e uguale per tutti, gruppo `(pubblico)`.
  Striscia dei dati · fatto del giorno curato col doppio titolo onesto · isola
  scura del monumento · fiume del giorno a due colonne · tre porte. DUE
  composizioni complete: con la cura e senza.
- LA SUPERFICIE REDAZIONALE su `/redazione` (MODERATOR, non il Comune) per
  curare il fatto del giorno, con le tre righe di guida del registro Il Post.
- IL GUSCIO a 1.680px (`--container-guscio`, utility `max-w-guscio`) e la
  BARRA LATERALE come isola di vetro flottante con la goccia.
- Il marchio Pistoia.app in testata, col segno «P» PLACEHOLDER.

DECISO, non si rimette in discussione:
- IL ROSSO: dose 2 — la pastiglia del tema sopra i titoli. Resta anche colore
  d'errore: la semantica non si confonde.
- LA STRISCIA DI DATI in cima. I contatori si chiedono al DATABASE, mai
  contando le righe mostrate.
- IL VETRO resta sulle card, col dato minuto SEMPRE su superficie opaca.
- NESSUN ORNAMENTO in cima alle superfici-firma.
- IL FATTO DEL GIORNO ESISTE SOLO SE CURATO, e senza cura la home NON finge
  un'apertura. Generare il titolo è VIETATO. Nessun ripiego sul giorno prima.
- IL MONUMENTO: tre righe coi NOMI e COME SI ARRIVA ALLA CARICA. MAI IL
  PARTITO, ed è misurato (fonti-organigramma §2.2).
- LA GOCCIA È REATTIVA, MAI AMBIENTALE. La richiesta originale diceva «si
  muovono anche senza selezionarle»: contraddiceva DESIGN §7 e AGENTS §2, è
  stata portata alla decisione di Lorenzo, e lui ha scelto reattivo. Non si
  riapre da soli.
- IL GUSCIO È 1.680px, scelto guardando tre varianti fotografate.
- §1.10: «se qualcosa è bello si copia» — la LICENZA decide cosa si prende
  alla lettera, e ciò che entra va ricondotto AI NOSTRI TOKEN. Il metro resta
  il test dell'intruso (P21).

IL LAVORO DI QUESTA SESSIONE, in ordine di dipendenza (ROADMAP O10):
0. IL DEBITO DI VERIFICA qui sopra. Prima di tutto.
1. LA PAGINA ATTO PUBBLICA — oggi NON esiste come rotta, ed è il primo
   anello: la prima pagina ci punterebbe già. Adesso il fatto del giorno manda
   al portale del Comune e il fiume non ha link affatto, perché l'URL
   dell'albo SCADE in ~15 giorni (misurato, lib/atti.ts). Doppio titolo
   onesto + il contesto che spiega (direzione §1.12.2).
2. IL RIORDINO delle sezioni: lettura davanti (atti, soldi, pagella,
   quartieri), «Partecipa» e «Comunità» dopo; la sezione «Il Comune»
   raccontata da fuori, col registro gov.uk (P17).
   ⚠️ Qui cade il LUCCHETTO delle tre porte della home: `/quartieri` e
   `/pagella` chiedono un account per RESIDENZA nel gruppo `(app)`, non per
   decisione — e §1.6-bis.1 dice che si legge tutto senza registrarsi.
3. IL RAFFINAMENTO delle superfici esistenti col brief + le micro-interazioni.
   ⚠️ Tutte le pagine ora vivono a 1.380px di colonna invece di 852: sono
   state guardate (`/la-mia-citta`, `/admin`, `/bilancio`) e reggono, ma
   nessuna è stata RIDISEGNATA per quella larghezza. È lì che sta la maggior
   parte del brief.
4. IL LOGO (P11) e con lui favicon e icona home; i BADGE (P14).
5. Le maturità ex-O8: scorciatoie «?», OG image (dopo il rebrand), alto
   contrasto + font grande.

METODO, non negoziabile:
- PRIMA DI DECIDERE, MISURA — col browser e col database. In questa sessione
  la misura ha trovato SEI difetti che guardando non si vedevano o che
  l'occhio da solo non avrebbe quantificato.
- TEST DELL'INTRUSO su ogni schermata (P21).
- I mockup si iniettano sull'applicazione vera; classi non nel sorgente =
  stili in linea (Tailwind v4 non le compila).
- «Fatto» = AGENTS §5: typecheck, lint, unit, rotte (0 problemi), E2E, shots
  nei due regimi (le opzioni a node, MAI a npm).
  ⚠️ Quando aggiungi una superficie, mettila nelle TRE liste: `rotte.mjs`,
  `tests/e2e/pagine-cancello.ts`, `scripts/shots.mjs`. La home ne era fuori
  in due su tre, e nessuno se n'era accorto per mesi.
- NON committare e NON pushare se Lorenzo non lo chiede. MAI il deploy senza
  chiedere. Commit a nome di Lorenzo Cianferoni, niente Co-Authored-By.
- Aggiorna i documenti vivi MENTRE lavori; `graphify update .` a fine
  modifica del codice.

PROBLEMI NOTI — DA SISTEMARE:
1. 🔴 IL DEBITO DI VERIFICA in cima a questo prompt.
2. ⚠️ NEL `dev.db` C'È UN FATTO DEL GIORNO SCRITTO DALL'ESECUTORE, non dalla
   redazione: il titolo «La scuola «Raffaello» avrà un involucro nuovo, per
   consumare meno» sulla determinazione 1692. Serviva a far vedere a Lorenzo
   la composizione piena, ed è reversibile in un clic da /redazione («Togli la
   cura»). Va riscritto o tolto da chi fa davvero la redazione.
3. ⚠️ IL FAVICON è ancora quello di `create-next-app`. Si chiude col logo (P11).
4. ⚠️ IL SEGNO «P» del marchio è un PLACEHOLDER dichiarato in wordmark.tsx.
5. ⚠️ `public/` è VUOTA (i cinque SVG del template sono usciti).
6. L'ISOLA SCURA (quella del monumento, non la barra) è costruita ma la sua
   GENERALIZZAZIONE è aperta: regola di sistema («una per pagina») o gesto
   della sola prima pagina? Oggi il secondo, e non si generalizza da sé.
7. LE PAGINE NON SONO STATE RIDISEGNATE per 1.380px di colonna: reggono, ma
   usano la larghezza nuova senza sfruttarla. Vedi punto 3 del lavoro.
8. GLI E2E completi costano ~19-23 minuti. NON lanciare due cose pesanti
   insieme, e NON toccare il codice mentre una suite gira (invalida il giro).
9. `comando | tail` restituisce l'exit code di tail: redirigere su file.
10. e2e.db ha ZERO Atto per disegno, e un test ci CONTA (analitiche.spec:
    «il monitor dice la verità su una base dati mai letta»). Gli atti di prova
    li semina e li disfa `prima-pagina.spec.ts`, non `global-setup`.
11. Il pannello Browser non composita senza schermo → DevTools MCP. E non
    scende sotto ~500px: i 360px si provano SOLO con
    `node scripts/shots.mjs --simple --width=360`.
12. prato.app è GIÀ registrato: il multi-città si verifica città per città.

COSE CHE ASPETTANO LORENZO, NON TE:
- REGISTRARE pistoia.app (al 12/08 non risolveva: quasi certamente libero).
- ACCENDERE IL SERVER (spento). Poi in ordine: Scheduled Task della lettura
  atti (finché non c'è, in produzione l'archivio resta VUOTO e la prima pagina
  apre col suo stato vuoto dichiarato, che è la verità); APP_ORIGIN su
  Coolify; l'eventuale deploy — e PRIMA `ssh homeserver "df -h /"`.
- PARERE LEGALE sul toponimo nel nome, prima del lancio.
- LINEE ROSSE economiche complete, PRIMA del primo sponsor.
- Dove affiggere i QR fisici («luoghi amici»).
```

---

## Stato al 2026-08-12 (sera)

| | |
|---|---|
| Versione | **0.51.0** — la prima pagina e il guscio nuovo |
| Branch | `main`, **committato e pushato** (due commit: v0.50.0 e v0.51.0) |
| Cancelli | typecheck ✅ · lint ✅ · **334 unit** ✅ · **66 rotte, 0 problemi** ✅ · **shots verdi nei due regimi** ✅ · ⚠️ **E2E 177/179**, coi due rossi spiegati sopra e **un test riscritto mai eseguito** |
| O10 | ricognizione ✅ · direzioni giudicate ✅ · rebranding ✅ · **prima pagina ✅** · **guscio ✅** · prossimo: **la pagina atto**, poi il riordino |
| Archivio atti | 26.644 atti veri in `dev.db` · zero in `e2e.db` **per disegno**, e un test ci conta |
| Server | 🔴 **spento** |

## Che cosa è stato costruito

**v0.50.0 — la prima pagina.** Tre campi redazionali su `Atto` con migrazione;
`getPrimaPagina()`; la pagina pubblica su `/` nel gruppo `(pubblico)`; la
superficie di cura su `/redazione`; 17 unit e 6 E2E nuovi; e la rotta `/`
entrata nei cancelli in cui non era mai stata.

**v0.51.0 — il guscio.** L'isola di vetro flottante con la goccia che si
deforma sulla velocità; il guscio a 1.680px con una definizione sola; i tetti
di lettura in `ch`; il fiume a due colonne.

## I sei difetti chiusi, e come sono stati trovati

| Difetto | Trovato da |
|---|---|
| La cifra display si misurava sulla **finestra** invece che sulla colonna: 55px fuori dalla card | guardando |
| Un **`<fieldset>`** non si stringe (`min-content` dal browser): 203px di pagina che scorre di lato | `shots --simple --width=360` |
| **«il 11 agosto»** invece di «l'11 agosto» | guardando |
| **`line-clamp` accanto a `block`** non tronca niente | guardando |
| **`DisplayNumber` non diceva quando aveva finito** di contare (P24) | dalla ricognizione |
| Allargare il guscio portava l'oggetto ufficiale a **95 caratteri per riga** e il fiume a 108 | misurando dopo il cambio |

## Le decisioni di forma ancora aperte

- **L'isola scura del monumento**: costruita, ma la generalizzazione no.
- **Il logo** (P11), e con lui favicon e icona della schermata home.
- **Che cosa MOSTRA l'archivio pubblico** (O11): determine 56%, delibere 10%.
- **`.btn-sm` ha la stessa altezza di `.btn-md`** (rinominare, non abbassare).
- **Collisione «segnalazioni» vs «segnala un problema del sito»** (O9).
