# Proposal — Evoluzione Community per “Dashboard di Pistoia”

**Progetto:** Dashboard di Pistoia / Pistoia Civic Community  
**Obiettivo:** trasformare la dashboard civica in una piattaforma community Comune ↔ cittadino, basata su fiducia, partecipazione, trasparenza e servizi digitali semplici.  
**Repository:** https://github.com/LorenzoCianfe/pistoia-dashboard  
**Concept:** https://github.com/LorenzoCianfe/pistoia-dashboard/blob/main/pistoia-dashboard-concept.txt  
**Data:** 09/06/2026

---

## 1. Executive Summary

La piattaforma attuale nasce come dashboard civica per rendere più leggibili dati pubblici, bilancio, opere, sondaggi e community. L’evoluzione proposta è trasformarla in una vera **community civica digitale** per il Comune di Pistoia, dove cittadini, Comune, associazioni e attività locali possano interagire in modo ordinato, verificato e utile.

L’obiettivo non è creare un social generico, ma un **punto unico di contatto digitale** dove il cittadino può:

- leggere informazioni pubbliche in modo semplice;
- segnalare problemi sul territorio;
- seguire lo stato delle opere pubbliche;
- partecipare a sondaggi e consultazioni;
- proporre idee per la città;
- ricevere risposte ufficiali dal Comune;
- interagire con altri cittadini in modo moderato e costruttivo.

La feature chiave proposta è il **profilo verificato**, non come semplice badge estetico, ma come sistema di fiducia che abilita funzioni civiche avanzate.

---

## 2. Posizionamento del prodotto

**Pistoia Dashboard** dovrebbe diventare:

> Il punto unico dove cittadini e Comune leggono, segnalano, propongono e seguono cosa cambia nella città.

La piattaforma non deve competere con i social network tradizionali, ma offrire qualcosa che oggi spesso manca nei canali pubblici: ordine, tracciabilità, verifica, risposte ufficiali e visione territoriale.

### Valore principale

- Più trasparenza per il cittadino.
- Meno dispersione tra gruppi Facebook, email, telefonate e moduli separati.
- Maggiore fiducia grazie a profili e risposte verificate.
- Maggiore partecipazione locale tramite quartieri, sondaggi e proposte.
- Maggiore efficienza per il Comune grazie a segnalazioni strutturate e meno duplicati.

---

## 3. Principi guida

### 3.1 Fiducia

Ogni contenuto deve rendere chiaro chi sta parlando: cittadino, residente verificato, Comune, associazione, attività locale o moderatore.

### 3.2 Semplicità

Il cittadino non deve leggere dati tecnici o burocratici. Le informazioni devono essere leggibili, visuali e comprensibili.

### 3.3 Tracciabilità

Ogni segnalazione, proposta o risposta ufficiale deve avere uno stato chiaro e aggiornabile.

### 3.4 Territorialità

La piattaforma deve funzionare per tutta Pistoia, ma anche per quartieri e frazioni.

### 3.5 Moderazione

La community deve essere civica, utile e rispettosa. Non deve diventare un social disordinato o polemico.

---

## 4. Profilo cittadino verificato

La funzione “verificato” è una delle più importanti per una community civica. Non dovrebbe essere un semplice check blu, ma un sistema di badge che comunica il livello di affidabilità dell’utente.

### 4.1 Tipologie di verifica

- **Identità verificata**  
  L’utente ha confermato la propria identità.

- **Residente verificato**  
  L’utente risulta residente nel Comune di Pistoia o in una specifica area/frazione.

- **Account ufficiale Comune**  
  Account istituzionale abilitato a pubblicare risposte ufficiali.

- **Associazione verificata**  
  Profilo legato a un’associazione locale riconosciuta.

- **Attività locale verificata**  
  Profilo legato a un negozio, impresa o attività del territorio.

- **Moderatore civico**  
  Utente con permessi di moderazione.

### 4.2 Badge proposti

```text
✅ Identità verificata
🏠 Residente verificato
🏛️ Account ufficiale Comune
🤝 Associazione verificata
🛍️ Attività locale verificata
🛡️ Moderatore civico
```

### 4.3 Privacy del profilo

Il cittadino potrebbe essere verificato internamente, ma apparire pubblicamente con un nome abbreviato.

Esempio:

```text
Lorenzo C.
✅ Cittadino verificato
📍 Quartiere: Centro
```

Questo permette di mantenere fiducia senza esporre dati personali completi.

---

## 5. Livelli di accesso

La piattaforma dovrebbe prevedere tre livelli principali.

| Funzione | Non loggato | Registrato | Verificato |
|---|---:|---:|---:|
| Vedere bilancio e opere | ✅ | ✅ | ✅ |
| Vedere eventi e avvisi | ✅ | ✅ | ✅ |
| Commentare | ❌ | ✅ | ✅ |
| Aprire segnalazioni | ❌ | ✅ | ✅ |
| Votare sondaggi aperti | ❌ | ✅ | ✅ |
| Votare consultazioni ufficiali | ❌ | ❌ | ✅ |
| Supportare proposte ufficiali | ❌ | ❌ | ✅ |
| Ricevere notifiche personalizzate | ❌ | ✅ | ✅ |
| Partecipare al bilancio partecipativo | ❌ | ❌ | ✅ |

Il profilo verificato deve quindi sbloccare funzioni reali, non essere solo decorativo.

---

## 6. Community per quartieri e frazioni

Una community unica per tutta la città rischia di diventare dispersiva. È consigliabile strutturare la piattaforma anche per aree territoriali.

### 6.1 Aree possibili

- Pistoia Centro
- Sant’Agostino
- Bottegone
- Bonelle
- Candeglia
- Pontenuovo
- Le Fornaci
- Vergine
- Ramini
- Collina e frazioni montane

### 6.2 Contenuti per area

Ogni quartiere/frazione potrebbe avere:

- segnalazioni locali;
- eventi;
- sondaggi dedicati;
- cantieri e opere vicine;
- discussioni di quartiere;
- proposte territoriali;
- avvisi del Comune filtrati per zona.

### 6.3 Sezione “Vicino a te”

La home del cittadino verificato potrebbe mostrare una sezione personalizzata:

```text
Cosa succede vicino a te
- 2 cantieri aggiornati nel tuo quartiere
- 4 segnalazioni aperte
- 1 sondaggio attivo
- 3 eventi questa settimana
```

---

## 7. Feed community civico

La community dovrebbe avere un feed pubblico, ma strutturato. Ogni contenuto deve avere una categoria e uno stato.

### 7.1 Tipologie di post

- Domanda al Comune
- Proposta
- Segnalazione
- Discussione di quartiere
- Evento locale
- Avviso utile
- Richiesta informazioni
- Idea per la città

### 7.2 Elementi del post

Ogni post dovrebbe mostrare:

- autore;
- badge autore;
- quartiere/frazione;
- categoria;
- data pubblicazione;
- stato;
- numero di cittadini interessati;
- eventuale risposta ufficiale;
- commenti;
- azioni disponibili.

### 7.3 Esempio UI

```text
[Proposta] Più rastrelliere bici in centro
📍 Centro storico
👤 Lorenzo C. · ✅ Cittadino verificato
👥 126 cittadini interessati
🏛️ Risposta Comune: in valutazione
```

---

## 8. Risposte ufficiali del Comune

Le risposte ufficiali devono essere visivamente distinguibili dai commenti normali.

### 8.1 Badge risposta ufficiale

```text
🏛️ Risposta ufficiale del Comune di Pistoia
```

### 8.2 Informazioni da mostrare

Ogni risposta ufficiale dovrebbe includere:

- ufficio o dipartimento responsabile;
- autore istituzionale;
- data risposta;
- ultimo aggiornamento;
- stato collegato;
- eventuale link a documento o pagina ufficiale;
- pulsante “questa risposta ti è stata utile?”.

### 8.3 Obiettivo

Ridurre confusione e distinguere chiaramente:

- opinioni dei cittadini;
- commenti generici;
- comunicazioni ufficiali;
- aggiornamenti operativi.

---

## 9. Segnalazioni cittadine evolute

Le segnalazioni dovrebbero diventare una delle aree centrali della piattaforma.

### 9.1 Categorie segnalazioni

- Buche e strade
- Illuminazione pubblica
- Rifiuti
- Verde pubblico
- Sicurezza urbana
- Rumore
- Trasporto pubblico
- Barriere architettoniche
- Manutenzione scuole
- Manutenzione parchi
- Animali
- Decoro urbano

### 9.2 Workflow segnalazione

```text
Nuova → Validata → Assegnata → In lavorazione → Risolta → Chiusa
```

Stati alternativi:

```text
Duplicata
Non di competenza
Richieste informazioni aggiuntive
Intervento programmato
```

### 9.3 Funzione “Anche io”

Per evitare duplicati, il cittadino dovrebbe poter confermare una segnalazione già esistente.

Esempio:

```text
48 cittadini confermano questa segnalazione
```

Questo aiuta il Comune a misurare la priorità reale senza ricevere decine di segnalazioni duplicate.

### 9.4 Dati utili per ogni segnalazione

- Titolo
- Descrizione
- Categoria
- Posizione/mappa
- Foto allegata
- Quartiere/frazione
- Stato
- Numero conferme
- Ufficio assegnato
- Storico aggiornamenti
- Risposta ufficiale

---

## 10. Mappa interattiva della città

La mappa dovrebbe diventare uno strumento centrale per visualizzare tutto ciò che accade sul territorio.

### 10.1 Layer mappa

- Cantieri
- Opere pubbliche
- Segnalazioni
- Eventi
- Chiusure strade
- Parcheggi
- Punti raccolta
- Uffici comunali
- Scuole
- Aree verdi
- Fontanelle
- Piste ciclabili
- Defibrillatori
- Zone ZTL

### 10.2 Filtri rapidi

```text
[Cantieri] [Segnalazioni] [Eventi] [Traffico] [Rifiuti] [Verde]
```

### 10.3 Valore per il cittadino

Il cittadino può capire rapidamente cosa sta succedendo vicino a casa, nel proprio quartiere o in tutta la città.

---

## 11. Sondaggi e consultazioni pubbliche

I sondaggi possono diventare uno strumento di partecipazione civica, non solo una feature accessoria.

### 11.1 Tipologie

#### Sondaggi leggeri

Domande semplici e veloci.

Esempio:

```text
Preferisci più alberi, parcheggi o piste ciclabili in questa zona?
```

#### Consultazioni ufficiali

Percorsi più strutturati.

Esempio:

```text
Piano mobilità centro storico — lascia il tuo contributo
```

#### Votazioni territoriali

Riservate ai residenti verificati di una determinata area.

Esempio:

```text
Quale area verde del quartiere vuoi riqualificare prima?
```

### 11.2 Accesso ai sondaggi

- Sondaggi pubblici: aperti anche agli utenti registrati.
- Consultazioni ufficiali: riservate ai verificati.
- Sondaggi territoriali: riservati ai verificati del quartiere/frazione.

---

## 12. Proposte cittadine

La piattaforma dovrebbe permettere ai cittadini di proporre idee concrete per la città.

### 12.1 Esempio proposta

```text
Installare una fontanella in Piazza della Resistenza
```

Gli altri cittadini possono:

- supportare;
- commentare;
- allegare foto;
- proporre modifiche;
- seguire l’evoluzione;
- ricevere notifiche.

### 12.2 Workflow proposta

```text
Bozza → Pubblicata → Raggiunta soglia supporto → Valutazione Comune → Risposta ufficiale → Eventuale progetto
```

### 12.3 Soglie proposte

Le soglie potrebbero essere configurabili.

Esempio:

```text
50 supporti → visibile in evidenza
200 supporti → richiesta risposta ufficiale
500 supporti → possibile consultazione pubblica
```

---

## 13. Sistema reputazione civica

Una leggera gamification può incentivare contributi utili, purché non diventi una competizione tossica.

### 13.1 Badge possibili

- Primo contributo
- Segnalatore affidabile
- Cittadino attivo
- Proposte utili
- Quartiere attivo
- Volontario civico
- Partecipazione costante
- Feedback costruttivo

### 13.2 Cosa evitare

Evitare classifiche troppo aggressive tipo “top cittadini”, perché potrebbero spostare il focus dalla collaborazione alla competizione.

Meglio usare badge positivi e indicatori soft.

---

## 14. Moderazione e sicurezza community

La moderazione è fondamentale per evitare spam, flame, insulti o contenuti non pertinenti.

### 14.1 Funzioni di moderazione

- Segnalazione commenti
- Revisione contenuti sensibili
- Parole bloccate
- Ban temporanei
- Sospensione account
- Chiusura discussioni risolte
- Unione segnalazioni duplicate
- Storico azioni admin
- Motivazione intervento moderatore

### 14.2 Ruoli suggeriti

```text
USER
VERIFIED_CITIZEN
ASSOCIATION
BUSINESS
MUNICIPAL_STAFF
MODERATOR
ADMIN
SUPER_ADMIN
```

### 14.3 Obiettivo

Mantenere la community utile, leggibile e rispettosa.

---

## 15. Centro notifiche civico

Il centro notifiche dovrebbe diventare uno strumento personale per rimanere aggiornati.

### 15.1 Tipologie notifiche

- Risposta del Comune a una domanda
- Aggiornamento su una segnalazione
- Nuovo cantiere nel quartiere
- Sondaggio aperto nella zona
- Evento vicino
- Allerta meteo
- Modifica viabilità
- Scadenze comunali
- Raccolta rifiuti straordinaria
- Chiusura scuole o uffici

### 15.2 Preferenze utente

```text
✅ Notifiche sul mio quartiere
✅ Segnalazioni che seguo
✅ Sondaggi pubblici
❌ Discussioni generali
✅ Avvisi urgenti
```

---

## 16. Area “La mia città”

Una sezione personalizzata per ogni cittadino.

### 16.1 Contenuti

- Il mio quartiere
- Le mie segnalazioni
- Proposte che supporto
- Sondaggi votati
- Eventi salvati
- Cantieri vicino a me
- Notifiche importanti
- Documenti/servizi preferiti

### 16.2 Obiettivo

Trasformare la dashboard in uno spazio personale e utile, non solo informativo.

---

## 17. Calendario eventi e vita locale

Per rendere la piattaforma viva, è utile aggiungere una sezione eventi.

### 17.1 Tipologie eventi

- Eventi del Comune
- Eventi delle associazioni
- Mercati
- Mostre
- Teatro
- Sport
- Incontri pubblici
- Consigli comunali
- Assemblee di quartiere
- Giornate ecologiche
- Volontariato

### 17.2 Pubblicazione eventi

Le associazioni verificate potrebbero proporre eventi, con approvazione da parte del Comune o dei moderatori.

---

## 18. Trasparenza opere pubbliche

La sezione opere dovrebbe essere molto visuale e comprensibile.

### 18.1 Informazioni per opera

- Titolo
- Descrizione semplice
- Importo
- Fonte finanziamento
- Stato
- Avanzamento percentuale
- Data prevista fine lavori
- Quartiere/frazione
- Foto prima/durante/dopo
- Responsabile procedimento
- Aggiornamenti
- Commenti cittadini
- FAQ

### 18.2 Esempio visuale

```text
Cantiere: Riqualificazione Piazza X
Avanzamento: 64%
Ultimo aggiornamento: lavori su pavimentazione
Prossimo step: illuminazione
```

---

## 19. Bilancio partecipativo

La sezione bilancio può diventare interattiva e partecipativa.

### 19.1 Funzioni possibili

- Simulatore budget
- Proposte finanziabili
- Voto cittadino
- Confronto tra aree
- Spiegazione semplice delle voci di bilancio
- Sezione “dove vanno i soldi”

### 19.2 Esempio esperienza

```text
Come spenderesti 100.000€ nel tuo quartiere?
```

Il cittadino può distribuire un budget virtuale tra verde, mobilità, scuole, decoro, cultura e sicurezza.

---

## 20. AI civica / assistente del Comune

Un assistente AI potrebbe aiutare il cittadino a trovare informazioni e servizi.

### 20.1 Esempi domande

- Dove posso richiedere un certificato?
- Come segnalo una buca?
- Quando passa la raccolta carta?
- Ci sono cantieri vicino a casa mia?
- Come funziona la ZTL?

### 20.2 Regole importanti

L’assistente deve distinguere chiaramente tra:

```text
Risposta informativa
Risposta basata su fonte comunale
Risposta ufficiale verificata
```

Non deve sembrare che l’AI parli ufficialmente per il Comune se non è supportata da fonti istituzionali.

---

## 21. Funzione “Segui”

L’utente dovrebbe poter seguire elementi specifici.

### 21.1 Elementi seguibili

- Quartieri
- Opere
- Segnalazioni
- Proposte
- Sondaggi
- Categorie
- Uffici comunali
- Associazioni
- Eventi

### 21.2 Valore

La piattaforma diventa personalizzata e riduce il rumore informativo.

---

## 22. Sezione “Pistoia Pulse”

Una sezione tipo radar civico della città.

### 22.1 Contenuti

- Temi più discussi
- Segnalazioni più confermate
- Quartieri più attivi
- Opere più seguite
- Sondaggi aperti
- Problemi emergenti
- Risposte ufficiali più recenti

### 22.2 Esempio

```text
Questa settimana a Pistoia:
- 42 segnalazioni su illuminazione
- 3 cantieri aggiornati
- 2 consultazioni aperte
- Tema più discusso: mobilità centro
```

L’obiettivo non è creare classifiche social, ma dare una visione sintetica dello stato della città.

---

## 23. Trust, Privacy & Safety

Una piattaforma civica deve essere solida anche lato privacy e sicurezza.

### 23.1 Funzioni consigliate

- Policy comportamento community
- Privacy policy chiara
- Nome pubblico abbreviabile
- Separazione tra identità verificata e nome visualizzato
- Consenso geolocalizzazione
- Log accessi admin
- Audit trail modifiche
- Export dati personali
- Cancellazione account
- Segnalazioni anonime o parzialmente anonime per casi sensibili

### 23.2 Esempio identità pubblica

```text
Nome pubblico: Lorenzo C.
Stato: cittadino verificato
Quartiere: Centro
Identità completa: visibile solo al sistema/autorizzati
```

---

## 24. Modello dati proposto

### 24.1 Entità principali

```ts
User
ProfileVerification
CitizenBadge
Neighborhood
CommunityPost
PostComment
OfficialReply
Report
ReportStatusHistory
Proposal
ProposalSupport
Poll
PollVote
Notification
ModerationAction
OrganizationProfile
Event
Follow
```

### 24.2 ProfileVerification

```ts
ProfileVerification {
  id
  userId
  type // IDENTITY, RESIDENCY, ASSOCIATION, BUSINESS, MUNICIPAL_STAFF
  status // PENDING, APPROVED, REJECTED, EXPIRED
  verifiedAt
  expiresAt
  verifiedBy
}
```

### 24.3 CitizenBadge

```ts
CitizenBadge {
  id
  userId
  badgeType
  label
  icon
  issuedAt
}
```

### 24.4 OfficialReply

```ts
OfficialReply {
  id
  postId
  authorId
  department
  content
  createdAt
  updatedAt
  isOfficial
}
```

### 24.5 Report

```ts
Report {
  id
  authorId
  title
  description
  category
  status
  neighborhoodId
  latitude
  longitude
  photoUrl
  confirmationsCount
  assignedDepartment
  createdAt
  updatedAt
}
```

### 24.6 Proposal

```ts
Proposal {
  id
  authorId
  title
  description
  neighborhoodId
  status
  supportsCount
  officialReplyId
  createdAt
  updatedAt
}
```

---

## 25. UX proposta

### 25.1 Card profilo

```text
Lorenzo C.
✅ Cittadino verificato
🏠 Residente verificato · Pistoia
📍 Quartiere: Centro
🤝 12 contributi utili
📣 3 segnalazioni risolte
🗳️ 5 sondaggi votati
```

### 25.2 Card segnalazione nel feed

```text
Lorenzo C. ✅ Cittadino verificato · Centro
Segnala: illuminazione non funzionante in Via X

48 cittadini confermano
Stato: Presa in carico
Risposta ufficiale Comune: intervento programmato
```

### 25.3 Card proposta

```text
[Proposta]
Più rastrelliere bici in centro

📍 Centro storico
👥 126 cittadini supportano
🏛️ Stato: in valutazione dal Comune
```

---

## 26. Roadmap consigliata

### 26.1 MVP Community

Priorità iniziali:

1. Profilo utente con badge verificato
2. Feed community con categorie
3. Domande al Comune
4. Risposte ufficiali verificate
5. Segnalazioni con stato
6. Funzione “Anche io”
7. Notifiche
8. Moderazione admin

### 26.2 Versione avanzata

Funzioni successive:

1. Quartieri/frazioni
2. Mappa interattiva
3. Proposte cittadine
4. Consultazioni pubbliche
5. Bilancio partecipativo
6. AI civica
7. Associazioni e attività locali verificate
8. Pistoia Pulse

---

## 27. Priorità funzionali

### Alta priorità

- Profilo verificato
- Ruoli utente
- Community feed
- Segnalazioni
- Stato segnalazioni
- Risposte ufficiali
- Moderazione
- Notifiche base

### Media priorità

- Quartieri/frazioni
- Proposte cittadine
- Sondaggi avanzati
- Eventi
- Funzione “segui”
- Reputazione civica

### Bassa priorità / futura evoluzione

- AI civica
- Bilancio partecipativo
- Pistoia Pulse
- Mappa avanzata multilayer
- Integrazione SPID/CIE
- Dashboard analytics per Comune

---

## 28. Rischi e mitigazioni

### 28.1 Rischio: community troppo caotica

**Mitigazione:** categorie chiare, moderazione, filtri, quartieri, regole di comportamento.

### 28.2 Rischio: troppe segnalazioni duplicate

**Mitigazione:** funzione “Anche io”, suggerimento automatico di segnalazioni simili, merge da parte dei moderatori.

### 28.3 Rischio: aspettative alte verso il Comune

**Mitigazione:** stati chiari, disclaimer, tempi indicativi, distinzione tra proposta e intervento approvato.

### 28.4 Rischio: privacy utenti

**Mitigazione:** profili pubblici abbreviati, consenso geolocalizzazione, identità completa non pubblica, gestione dati personali.

### 28.5 Rischio: abuso del badge verificato

**Mitigazione:** ruoli separati, verifiche con scadenza, audit log, revoca badge.

---

## 29. Conclusione

La direzione consigliata è trasformare **Pistoia Dashboard** da semplice piattaforma informativa a **community civica strutturata**.

Le cinque feature più distintive dovrebbero essere:

1. **Profilo cittadino verificato**
2. **Segnalazioni con stato pubblico**
3. **Risposte ufficiali del Comune**
4. **Community per quartiere**
5. **Proposte cittadine con supporto pubblico**

Il profilo verificato è la base per costruire fiducia, ma il vero valore nasce quando questo badge abilita funzioni concrete: votare consultazioni, supportare proposte ufficiali, ricevere notifiche territoriali e contribuire in modo riconoscibile alla vita della città.

La piattaforma dovrebbe essere pensata come un ecosistema civico: dati pubblici, partecipazione, segnalazioni, comunicazione istituzionale e community locale in un’unica esperienza digitale moderna.
