# Fonti — «Il costo dell'amministrazione»

> Ogni cifra della rotta `/citta/costo-amministrazione` si àncora a una riga di
> questo documento. Il renderer **rifiuta** una riga senza fonte: se un importo
> non si riesce ad attribuire alla propria carica, non va a schermo.
>
> Ricognizione: **2026-07-31**. Tutte le fonti sotto sono state scaricate e
> lette, non citate di seconda mano.
>
> Regola che ha deciso più di una volta in questa ricognizione: **quando un PDF
> resiste, si cerca la versione HTML dello stesso atto.** Il PDF è quasi sempre
> la copia, non l'originale.

---

## 1. La catena di calcolo

Le indennità **non le decide il Comune**. Sono fissate a livello nazionale per
fascia demografica: il Comune non ha margine, e il dato comunale serve a
confermare la cifra, non a produrla. È la ragione per cui questa pagina può
esistere prima che il Comune pubblichi i propri compensi.

### 1.1 La base — 13.800 € lordi al mese

> «…è parametrata al trattamento economico complessivo dei presidenti delle
> regioni, come stabilito dalla Conferenza permanente per i rapporti tra lo
> Stato, le regioni e le province autonome di Trento e Bolzano, **il cui importo
> massimo è stato fissato in euro 13.800 mensili per dodici mensilità**, in
> relazione alla popolazione risultante dall'ultimo censimento ufficiale…»

Ministero dell'Interno, decreto 30 maggio 2022, **Allegato A — Nota
metodologica** · <https://dait.interno.gov.it/documenti/decreto-fl-30-05-2022-all-a.pdf>

Questa riga porta due cose, non una: il **numero** e le **dodici mensilità**.
La seconda decide l'annualizzazione, che altrimenti sarebbe un'ipotesi.

La determinazione a monte è della Conferenza permanente Stato-Regioni
(deliberazione del 30 ottobre 2012, rep. 215/CSR, poi integrata il 6 dicembre
2012), ai sensi dell'art. 2 c. 1 lett. b) del D.L. 174/2012. **L'atto della
Conferenza non è stato consultato direttamente**: l'archivio storico
(`archivio.statoregioni.it`) serve un certificato TLS non valido. La catena
regge lo stesso perché il numero è affermato dal Ministero in un proprio atto,
che è la fonte che il renderer cita.

### 1.2 La percentuale del sindaco — 70%

Le premesse del decreto interministeriale del 5 febbraio 2026 citano il comma
583 alla lettera:

> «a) 100 per cento per i sindaci metropolitani; b) 80 per cento per i sindaci
> dei comuni capoluogo di regione e per i sindaci dei comuni capoluogo di
> provincia con popolazione superiore a 100.000 abitanti; **c) 70 per cento per
> i sindaci dei comuni capoluogo di provincia con popolazione fino a 100.000
> abitanti**; …»

Decreto del Ministro dell'Interno di concerto con il Ministro dell'Economia e
delle Finanze, 5 febbraio 2026 (avviso in G.U. n. 75 del 31 marzo 2026)
· <https://dait.interno.gov.it/documenti/decreto-fl-05-02-2026.pdf>
· pagina · <https://dait.interno.gov.it/finanza-locale/documentazione/decreto-5-febbraio-2026>

Norma di riferimento: **L. 30 dicembre 2021, n. 234, art. 1 c. 583**.

> Questo decreto **non fissa la base**: ripartisce 220 milioni di euro fra i
> comuni a copertura del maggior onere. Serve qui perché riporta il comma 583
> nel testo e perché è l'atto più recente che lo applica.

### 1.3 Le percentuali di giunta — D.M. 119/2000, testo vigente

| Comma | Testo | Vale per Pistoia? |
|---|---|---|
| art. 4 c. 4 | vicesindaco di comuni **da 10.001 a 50.000** ab. → 55% | no |
| art. 4 c. 5 | vicesindaco di comuni **superiori a 50.000** ab. → **75%** | **sì** |
| art. 4 c. 9 | assessori di comuni **fra 50.000 e 250.000** ab. → **60%** | **sì** |
| art. 5 c. 3 | presidente del consiglio di comuni > 15.000 ab. → **come gli assessori** | **sì** |

Normattiva, testo in vigore (art. 4 non è mai stato modificato: «Testo in vigore
dal 28-5-2000»)
· <https://www.normattiva.it/uri-res/N2Ls?urn:nir:ministero.interno:decreto:2000-04-04;119~art4>

Testo originale in Gazzetta Ufficiale n. 110 del 13 maggio 2000
· <https://www.gazzettaufficiale.it/eli/id/2000/05/13/000G0165/sg>

⚠️ **La fascia «50.001–100.000» nell'art. 4 non esiste.** Esiste nell'**art. 3**,
che è tutt'altra cosa: la promozione di classe dei comuni capoluogo, e riguarda
il *sindaco*. Confondere i due articoli porta il vicesindaco dal 75% al 55% —
è l'errore che questa ricognizione ha corretto (vedi `ROADMAP.md` §6).

Il 60% degli assessori è confermato una seconda volta dal Ministero: la nota
metodologica 2025 riporta il prospetto del presidente del consiglio comunale con
**60% per la classe 50.001–250.000**, e l'art. 5 c. 3 equipara le due figure.
· <https://dait.interno.gov.it/documenti/decreto-fl-05-02-2026-nota-metodologica-2025.pdf>

### 1.4 I consiglieri — un tetto, non un compenso

> «I consiglieri comunali e provinciali hanno diritto di percepire […] un gettone
> di presenza per la partecipazione a consigli e commissioni. **In nessun caso
> l'ammontare percepito nell'ambito di un mese da un consigliere può superare
> l'importo pari ad un quarto dell'indennità massima prevista per il rispettivo
> sindaco**…»

TUEL (D.Lgs. 267/2000) art. 82 c. 2, testo in vigore dal 1-1-2020
· <https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2000-08-18;267~art82>

**«Non può superare» non è «percepisce».** L'importo effettivo dipende dalle
sedute e dalla delibera comunale. Moltiplicare il tetto per 32 consiglieri
produrrebbe una cifra inventata con l'aria di essere calcolata.

### 1.5 Il dimezzamento che nessun calcolo può prevedere

> «Tale indennità è **dimezzata** per i lavoratori dipendenti che non abbiano
> richiesto l'aspettativa.»

TUEL art. 82 c. 1, ultimo periodo — stessa fonte di §1.4.

È la ragione per cui questa pagina dichiara **quanto la legge prevede**, non
quanto viene percepito: chi dei nove sia in quella condizione è esattamente
l'informazione che il Comune deve pubblicare e non ha ancora pubblicato.

---

## 2. La popolazione

La fascia demografica non si àncora alla popolazione residente corrente ma a
quella **risultante dall'ultimo censimento ufficiale** (comma 583). La Corte dei
conti, sezione regionale di controllo per la Basilicata, deliberazione n. 11 del
4 febbraio 2025, ha confermato il criterio **statico** contro il precedente
criterio dinamico.

Per il riparto 2025 il Ministero dichiara la propria scelta: «la popolazione
considerata è quella **ISTAT al 31 dicembre 2023 risultante dal censimento
permanente**» (nota metodologica citata in §1.3).

| Data | Abitanti | File ISTAT |
|---|---|---|
| 31/12/2023 (= 1° gen 2024) | **89.054** | `POSAS_2024_it_047_Pistoia` |
| 31/12/2024 (= 1° gen 2025) | **88.889** | `POSAS_2025_it_047_Pistoia` |
| 31/12/2025 (= 1° gen 2026) | 89.094 — **stima**, dichiarata nel titolo del file | `POSAS_2026_it_047_Pistoia` |

ISTAT, serie «Popolazione residente», comune **047014**
· <https://demo.istat.it/app/?i=POS>
· <https://demo.istat.it/data/posas/POSAS_2025_it_047_Pistoia.zip>

Verificato per tre vie che coincidono: somma delle età 0–100, riga totale,
maschi + femmine.

⚠️ **Trappola del file ISTAT.** La riga del totale ha età **`999`**, che passa
per numerica. Sommando tutte le righe «numeriche» si ottiene 177.778 — il doppio
esatto, plausibile e sbagliato, senza alcun errore. Filtrare `Età != 999`.

La fascia (sotto i 100.000) regge con qualunque delle tre date: **non dipende da
quale si sceglie**, ed è la ragione per cui era robusta anche prima che il
numero esatto lo fosse.

---

## 3. Le persone

| Fatto | Fonte | Aggiornamento della pagina |
|---|---|---|
| **Giovanni Capecchi**, sindaco, proclamato il **27 maggio 2026** | <https://www.comune.pistoia.it/it/unita_organizzative/sindaco> | 15/06/2026 |
| **Stefania Nesi, vicesindaca** — «Vicesindaca, Assessora a Politiche strategiche di area vasta, Attività produttive, Progettazione europea» | <https://www.comune.pistoia.it/it/news/presentata-oggi-pomeriggio-dal-sindaco-giovanni-capecchi-la-giunta> | 10/06/2026 |
| Otto assessori: **Nesi, Banci, Giannessi, Giusti, Nesti, Setaro, Sinimberghi, Trallori** | stessa fonte | 10/06/2026 |
| **Paolo Tosi**, presidente del consiglio comunale · **32 consiglieri** | <https://www.comune.pistoia.it/it/unita_organizzative/consiglio-comunale> | 03/07/2026 |

**La scheda del sindaco non dichiara il vicesindaco; la notizia sì.** Una
ricognizione precedente aveva concluso «il sito del Comune non lo dichiara»
avendo guardato solo la prima. Vale come regola: l'assenza di un dato su *una*
pagina di un sito non è l'assenza del dato.

**Sulla composizione della giunta la stampa sbagliava e il Comune no.** Le liste
dei giornali mettono in giunta Irene Bottacci, che è consigliera comunale;
l'ottava assessora è Elena Sinimberghi. Su un fatto che il Comune pubblica, il
Comune è la fonte.

---

## 4. Gli importi

| Carica | Calcolo | € lordi/mese |
|---|---|---|
| Sindaco | 70% × 13.800 | **9.660** |
| Vicesindaca | 75% × 9.660 | **7.245** |
| Assessore (× 7) | 60% × 9.660 | **5.796** |
| Presidente del consiglio | = assessore | **5.796** |
| Consigliere | **tetto** ¼ × 9.660 | **≤ 2.415** |

**Giunta** (sindaco + vicesindaca + 7 assessori) = **57.477 €/mese** →
**689.724 €/anno** su dodici mensilità.

La vicesindaca è anche assessora, ma le indennità **non si cumulano** (TUEL
art. 82 c. 5): conta una volta, al 75%. Da qui «7 assessori» e non 8.

### La riprova indipendente

L'Allegato A del D.M. 30/05/2022 contiene, fra i propri importi, **9.660**,
**7.245** e **5.796** — i tre valori che la catena produce — più **115.920**
(= 9.660 × 12) e la riga `70 · 9.660 · 115.920 · 125.580 · 52`, dove **52** è il
numero dei comuni capoluogo di provincia fino a 100.000 abitanti. Pistoia è uno
di quei 52.

> **Che cosa rende una riprova una riprova.** La ricognizione precedente aveva
> trovato **5.313** nello stesso allegato e l'aveva presa come conferma del 55%.
> Non lo era: entrambi i percorsi passavano dal 55%, quindi era un solo percorso
> contato due volte. Una riprova che condivide un anello con la catena che
> dovrebbe verificare non verifica niente — è la stessa affermazione detta due
> volte, e suona più convincente proprio perché è la stessa.

---

## 5. Ciò che la pagina non può dire

1. **Non sono i compensi percepiti.** Sono gli importi che la legge prevede. Il
   dimezzamento dell'art. 82 c. 1 e le eventuali rinunce dipendono dalla
   posizione di ciascuno.
2. **L'assenza dei dati comunali non è opacità.** Il Comune non ha ancora
   pubblicato i compensi ai sensi dell'**art. 14 del D.Lgs. 33/2013**, ma il
   comma 2 dà **tre mesi dalla proclamazione**: dal 27 maggio 2026, la finestra
   si chiude verso il **27 agosto 2026**. Un'assenza dentro i termini presentata
   come vuoto è un'accusa tratta da un dato mancante. Se manca, si dichiara la
   scadenza accanto.
3. **Niente scala a tacche.** L'intervallo 0 → costo della giunta non è un
   traguardo che qualcuno abbia fissato.
4. **Niente moltiplicazione del tetto dei consiglieri** (vedi §1.4).
