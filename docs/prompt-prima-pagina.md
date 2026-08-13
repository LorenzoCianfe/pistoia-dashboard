# Prompt per generare la prima pagina — da dare a uno strumento di design

> Scritto il **2026-08-12** su richiesta di Lorenzo, per vedere che cosa
> produce uno strumento generativo sulla nostra prima pagina e confrontarlo
> coi mockup montati sull'applicazione vera (`mockups-o10/`).
>
> È **autoportante**: chi lo riceve non conosce il progetto. Contiene dati
> **veri** (atti dell'11 agosto 2026, costo della giunta calcolato dalla
> catena di legge) perché una prima pagina disegnata su testo finto mente
> sulle lunghezze, e le lunghezze sono metà del problema.
>
> ⚠️ Quello che esce va comunque passato al **test dell'intruso** (P21): se la
> schermata potrebbe stare in un portfolio qualunque, non ha preso il luogo.

---

```
Disegna la PRIMA PAGINA (home pubblica) di Pistoia.app.

## Che cos'è il prodotto

Pistoia.app è una piattaforma civica INDIPENDENTE che racconta la città di
Pistoia (Toscana, 89.000 abitanti) usando dati pubblici veri. NON è il sito
del Comune e non deve sembrarlo: osserva l'amministrazione, non la
rappresenta. Il suo magnete è un archivio di 26.644 atti amministrativi veri,
letti ogni giorno dall'albo pretorio e resi leggibili.

Il tono è quello di un giornale civico serio: numeri caldi, tono freddo. Si
spiega senza gridare, si domanda senza accusare. Mai allarmismo, mai
ammiccamento, mai linguaggio da startup.

Il pubblico è la persona normale fra i 30 e i 60 anni, non l'addetto ai
lavori. Zero gergo.

## Che cosa deve esserci nella schermata, nell'ordine

1. TESTATA appiccicata in alto, translucida (vetro leggero sul telaio).
   A sinistra: un segno quadrato scuro con la lettera «P» dentro, e accanto
   il logotipo «Pistoia.app» in grassetto stretto, dove «.app» è nel rosso
   della città. Accanto una pastiglia piccola «Anteprima» ambra.
   A destra: interruttore tema chiaro/scuro e un pulsante «Accedi» a pillola.

2. STRISCIA DI DATI sotto la testata, su una riga, in carattere monospaziato
   piccolo (11,5px), lettere spaziate, colore attenuato, con un pallino verde
   lime a sinistra:
   «AGGIORNATO L'11 AGOSTO · ATTI NEL 2026 2.923 · ULTIMI 7 GIORNI 90 ·
   IN ARCHIVIO 26.644»
   I numeri in grassetto e in colore pieno, le etichette attenuate.
   Serve a dire che il sito è vivo e si aggiorna da solo.

3. APERTURA a due colonne (7 e 5 su 12 circa).

   COLONNA SINISTRA — IL FATTO DEL GIORNO, dentro una card:
   - sopra il titolo, una pastiglia rosa tenue con dentro «LAVORI PUBBLICI»
     in rosso scuro, maiuscoletto; accanto, in grigio maiuscoletto:
     «DETERMINAZIONE N. 1692 · 11 AGOSTO 2026»
   - TITOLO UMANO, grande, in grassetto stretto, su due-tre righe:
     «La scuola «Raffaello» avrà un involucro nuovo, per consumare meno»
   - sotto, la didascalia della redazione: un filetto rosso verticale a
     sinistra, l'occhiello «LA REDAZIONE» minuscolo in maiuscoletto, e il
     testo: «Con questo atto parte la progettazione esecutiva; paga il
     programma europeo FESR della Toscana. È la scuola di via Pietro
     Calamandrei.»
   - sotto ancora, un riquadro con fondo pieno leggermente diverso dalla card,
     etichetta «L'OGGETTO UFFICIALE, COM'È SCRITTO» e, in monospaziato piccolo,
     l'oggetto vero troncato a due righe:
     «CUP C54D24001030006. "INTERVENTO DI EFFICIENTAMENTO DELL'INVOLUCRO
     EDILIZIO AI FINI DEL MIGLIORAMENTO ENERGETICO DELL'ISTITUTO COMPRENSIVO
     STATALE "RAFFAELLO" VIA PIETRO CALAMANDREI"…»
     ⚠️ Questo blocco è essenziale e non è decorazione: il testo ufficiale non
     si riscrive MAI, la leggibilità si costruisce attorno. Chi legge capisce
     dal titolo umano, chi verifica trova l'originale a un millimetro.
   - in fondo: «Leggi l'atto →» in teal, e accanto «Tutti i 31 atti dell'11
     agosto» in grigio.

   COLONNA DESTRA — IL NUMERO-MONUMENTO, una card SCURA (l'unica scura della
   pagina):
   - etichetta in alto: «COSTO DELLA GIUNTA · ALL'ANNO»
   - la cifra gigantesca, in peso LEGGERO (300) non grassetto, cifre a
     larghezza fissa: «689.724» con «€» piccolo accanto
   - sotto, tre righe con nome, carica, barra sottile e importo:
       Giovanni Capecchi · Sindaco · eletto ————————— 9.660 €/mese
       Stefania Nesi · Vicesindaca · nominata ———————  7.245
       7 assessori · nominati dal sindaco ————         5.796
     Le barre sono proporzionali (100%, 75%, 60%).
   - in fondo, una riga di contesto in piccolo:
     «Nove persone. Gli importi sono fissati dalla legge per fascia di
     popolazione: non li decide il Comune. Quattro assessori su otto non
     erano candidati — li nomina il sindaco.»
   ⚠️ Il numero è grande ma NON accusatorio: nessun rosso d'allarme, nessuna
   freccia, nessun punto esclamativo. È un fatto, con la sua fonte.

4. UN SEPARATORE orizzontale a trattini regolari (ritmo a bande), tenue.

5. IL GIORNO IN CITTÀ — una lista dentro una card, quattro righe.
   Ogni riga: data piccola in monospaziato · una pastiglia colorata del tema
   civico · il titolo umano dell'atto · una freccia a destra.
   Contenuti veri:
   - 11 ago · [Sport] · «Piscina "Raffaello": si cerca chi la gestirà»
   - 11 ago · [Scuole] · «Mense scolastiche: analisi e controlli affidati fino al 2029»
   - 11 ago · [Ambiente] · «Un contributo all'Enpa per il mantenimento dei cani»
   - 11 ago · [Mobilità] · «Via Provinciale Lucchese: senso unico alternato il 1º settembre»
   In alto a destra della sezione: «31 atti pubblicati l'11 agosto →».

6. TRE PORTE in fondo, tre card affiancate, ognuna con una piccola icona
   quadrata colorata, titolo, una riga di spiegazione e un link:
   - «Il tuo quartiere» — «888 atti nominano un quartiere preciso: trova il tuo.»
   - «La pagella della città» — «Come sta Pistoia — sanità, scuola, ambiente — su dati ministeriali.»
   - «Segnala un problema» — «Racconta cosa non va: la segnalazione è pubblica e il quartiere la conferma.»

## Il linguaggio visivo (vincolante)

TELA E SUPERFICI
- Tela di fondo grigio-calda #E8E7E4 (non bianca): fa leggere le card come
  oggetti appoggiati invece che come «il foglio».
- Card bianche traslucide (72% di opacità) con sfocatura dello sfondo e
  saturazione spinta — materiale in stile Apple. Bordo capello chiarissimo,
  filo di luce sul bordo superiore. NIENTE ombre diffuse, niente aloni.
- REGOLA FERRIA: il dato minuto (testo piccolo, cifre, tabelle) vive SEMPRE
  su una superficie OPACA, anche quando sta dentro una card di vetro. Il
  vetro fa cornice e atmosfera; la lettura avviene sul pieno.
- Una luce ambientale calda e larghissima in alto a destra sulla tela
  (ambra molto tenue), appena percettibile. I componenti restano neutri.
- Raggio delle card 32px. Bottoni e pastiglie a pillola piena.

COLORE
- Accento primario: verde-acqua #0A756B (link, azioni, focus).
- Rosso della città #D63A57: marchio, pastiglia del tema sopra i titoli,
  filetto della didascalia. Per testo piccolo usa #BE344D.
  ⚠️ Il rosso è ANCHE il colore d'errore: non deve mai diventare decorazione
  diffusa, o la semantica si confonde.
- Verde lime #D9F312 SOLO come pallino/sfondo di chip, MAI come testo o icona.
- Viola #675CB4 e ambra #965A19 per le pastiglie dei temi civici.
- Un solo colore dominante per schermata. Niente arcobaleni.
- Tema scuro: tela quasi-nera calda #131211, superfici #1C1B1A che salgono per
  gradini di luminanza, accenti schiariti di un grado. Non è un'inversione: è
  la stessa città, di sera.

TIPOGRAFIA
- Un solo carattere per l'interfaccia: una grottesca editoriale contemporanea
  (tipo Schibsted Grotesk). Per numeri tecnici, protocolli, date e importi
  tabellari: un monospaziato (tipo JetBrains Mono).
- La gerarchia si fa con la DIMENSIONE, non col peso: etichette 11px in peso
  600 maiuscoletto contro cifre display enormi in peso 300.
- Cifre a larghezza fissa ovunque i numeri si confrontino.

ACCESSIBILITÀ (non negoziabile)
- Contrasto WCAG AA ovunque, AAA sul corpo del testo.
- Ogni elemento toccabile alto almeno 44px.
- Nessuna informazione affidata al solo colore.
- Deve reggere a 360px di larghezza con tutto il testo ingrandito al 115%.

## Che cosa NON fare (importante)

- NIENTE stemmi, scudi, scacchiere, araldica o qualunque cosa evochi
  l'insegna del Comune: la piattaforma non è l'istituzione e non deve
  sembrarlo.
- Niente foto di persone da stock, niente cittadini sorridenti generici,
  niente illustrazioni di città generiche.
- Niente gradienti viola/blu ambient da «app scura generica», niente aloni,
  niente bagliori al neon, niente vetro iridescente o olografico.
- Niente anelli/donut di percentuale, niente grafici 3D, niente caroselli.
- Niente numeri con frecce d'allarme o colori d'urgenza: i dati sulla spesa
  pubblica si presentano freddi.
- Niente parole da marketing («rivoluziona», «scopri il potere di…»),
  niente punti esclamativi.
- Niente aria da dashboard SaaS: questa è una prima pagina di giornale, non
  un pannello di controllo. Il modello strutturale è la front page di un
  quotidiano (apertura, spalla, taglio basso), non una griglia di KPI.

## Il criterio con cui giudicherò il risultato

Guardando la schermata finita, deve essere possibile rispondere a questa
domanda: «che cosa, qui, esiste SOLO perché questa è Pistoia?»
Se la risposta è «niente — potrebbe essere di qualunque città o di qualunque
prodotto», il disegno ha fallito, per quanto sia bello.

## Formato

Dammi la schermata desktop a 1440px di larghezza, tema CHIARO (è la faccia
canonica). Poi, se puoi, la stessa schermata in tema scuro e una versione
mobile a 390px.
```

---

## Come leggere quello che uscirà

Tre domande, nell'ordine:

1. **Passa il test dell'intruso?** (P21) — c'è qualcosa che esiste solo
   perché è Pistoia, o è una bella pagina qualunque?
2. **L'oggetto ufficiale è rimasto?** È il pezzo che uno strumento generativo
   toglie per primo perché «sporca» la composizione — ed è esattamente ciò che
   rende il prodotto credibile.
3. **Il numero-monumento è freddo?** Se è diventato rosso, grande e con una
   freccia, lo strumento ha capito «dashboard» invece di «giornale civico».
