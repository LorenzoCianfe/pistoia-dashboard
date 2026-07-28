# Piano di esecuzione — Fase A

> **Stato: eseguito e chiuso il 2026-07-26**, A-5.1 compresa.
> Riepilogo in fondo, §Consuntivo.
>
> Per ogni azione: **cosa cambia**, **perché**, **cosa tocca**, **prima → dopo**.
> Nessuna azione elimina una funzione. Nessuna cancella una pagina.
>
> Base: [`audit-consolidamento.md`](./audit-consolidamento.md) ·
> [`roadmap-consolidamento.md`](./roadmap-consolidamento.md)
> Redatto: 2026-07-26

---

## Nomi delle cinque destinazioni

| Rotta | Etichetta nel menu | Titolo della pagina |
|---|---|---|
| `/la-mia-citta` | La mia città | Ciao, {nome} |
| `/partecipa` | Partecipa | Partecipa alla vita della città |
| `/trasparenza` | Trasparenza | Come va la città |
| `/territorio` | Territorio | Il territorio di Pistoia |
| `/comunita` | Comunità | La comunità |

**Perché "Trasparenza" e non "Come va la città":** l'etichetta deve stare in
una scheda di ~75px a 375px di larghezza, e "Come va la città" non ci sta.
"Trasparenza" esiste già nel prodotto come nome di gruppo, quindi non introduce
vocabolario nuovo. La domanda in chiaro resta come **titolo della pagina**, dove
c'è spazio. ⚠️ *Decisione ribaltabile: è l'unico nome con un compromesso
dentro.*

---

## A-0 · Regola di verifica per tutta la fase

Prima delle azioni, la regola che le governa tutte.

**I componenti-firma non si verificano leggendo il DOM.** `DisplayNumber`,
`RingGauge`, `ScrollTold` e ogni rivelazione allo scroll dipendono da
`IntersectionObserver` e da `requestAnimationFrame`. In una pagina non
visibile — un pannello browser mai mostrato, una scheda in secondo piano —
Chrome non consegna quelle callback: l'animazione non parte e il DOM resta sul
valore iniziale, cioè **uno zero plausibile**.

È esattamente l'errore in cui è caduta la prima stesura dell'audit (§5): aveva
dichiarato rotto un componente che funziona.

> **La prova visiva di questo progetto è `npm run shots`**, che apre un browser
> reale, aspetta le animazioni e scorre la pagina. `AGENTS.md` §5 dice *«un
> typecheck verde non è una prova visiva»*: vale identico per una lettura del
> DOM.

Nessuna riparazione bloccante: si parte dalla struttura.

---

## A-0.1 · Ripulire i residui E2E

**Cosa cambia** — Il database dimostrativo torna a contenere solo dati
dimostrativi.

**Perché** — In home, "Vicino a te" mostra tre voci «Lampione spento E2E
1785015662790». Gli E2E scrivono nel DB di sviluppo e i residui finiscono in
vetrina, su un progetto il cui punto è *mostrarsi*.

**Cosa tocca** — `npm run db:reset`; configurazione Playwright per un DB
separato.

---

---

## A-1.1 · Ristrutturare `nav-items.ts`

**Cosa cambia** — Da 4 array piatti a una struttura a due livelli.

**Perché** — La struttura dati *è* l'architettura dell'informazione: finché il
menu è un elenco, ogni consumatore (laterale, in basso, palette) può solo
renderlo come elenco.

**Cosa tocca** — `components/app/nav-items.ts`; a cascata `side-nav.tsx`,
`bottom-nav.tsx`, `command-palette.tsx`.

**Prima → dopo**

```ts
// PRIMA — quattro elenchi paralleli, 25 voci
export const NAV_ITEMS: NavItem[]          // 11
export const PARTICIPATION_NAV: NavItem[]  //  5
export const TRANSPARENCY_NAV: NavItem[]   //  6
export const SECONDARY_NAV: NavItem[]      //  3

// DOPO — cinque destinazioni, ciascuna con le proprie sezioni
export type NavDestination = {
  href: string; label: string; icon: LucideIcon;
  sections: NavItem[];
};
export const DESTINATIONS: NavDestination[]  // 5
export const UTILITY_NAV: NavItem[]          // avvisi, organigramma, faq, glossario
```

`GUIDED_ACTIONS` resta **invariato**: è protetto.

⚠️ `NavItem.core` sparisce. Oggi decide chi entra nella barra in basso; dopo,
la barra in basso è esattamente `DESTINATIONS`, quindi il campo non ha più
significato — ed è proprio il campo che oggi rende diverso il telefono.

---

## A-1.2 · Costruire la navigazione mobile

**Cosa cambia** — La barra in basso passa da 5 voci scelte a mano alle 5
destinazioni.

**Perché** — È la correzione dell'attrito principale dell'audit. Oggi
`bottom-nav.tsx:10` filtra `core: true` e ottiene segnalazioni, bilancio,
opere, comunità, la-mia-città: **i sette strumenti di partecipazione
strutturata restano fuori**, benché "partecipare" sia uno dei due compiti
primari dichiarati.

**Cosa tocca** — `components/app/bottom-nav.tsx`.

**Prima → dopo**

```
PRIMA   5 di 25 destinazioni · 16 senza alcun percorso navigabile
        [La mia città] [Bilancio] [Opere] [Comunità] [Segnalazioni]

DOPO    5 di 5 destinazioni · 0 senza percorso
        [La mia città] [Partecipa] [Trasparenza] [Territorio] [Comunità]
```

---

## A-1.3 · Riscrivere la barra laterale

**Cosa cambia** — Da elenco di 25 voci a 5 destinazioni con le sezioni della
destinazione attiva.

**Perché** — A 1280×720 il menu è alto 1191px contro 656px visibili: il 45% è
sotto la piega, incluso l'intero gruppo Trasparenza. E soprattutto: desktop e
telefono devono mostrare **la stessa** struttura.

**Cosa tocca** — `components/app/side-nav.tsx`, `(app)/layout.tsx:28`.

**Prima → dopo**

```
PRIMA  25 voci sempre tutte visibili, 1191px, metà sotto la piega
DOPO    5 destinazioni sempre visibili
        + le sezioni della destinazione attiva, espanse sotto di essa
        → ~9 righe al massimo, tutte sopra la piega
```

**Da non perdere:** l'indicatore attivo `layoutId="side-active"`
(`side-nav.tsx:28`) — la pastiglia che scorre tra le voci. È un dettaglio di
qualità già pagato.

---

## A-1.4 · Etichettare ogni gruppo

**Cosa cambia** — Ogni raggruppamento ha un titolo.

**Perché** — Oggi 2 gruppi su 4 sono etichettati. Un elenco di 11 voci senza
intestazione non si legge come gruppo: si legge come "tutto il resto".

**Cosa tocca** — `side-nav.tsx:54-65`.

---

## A-1.5 · Togliere le utility dal menu

**Cosa cambia** — Notifiche, profilo e impostazioni escono dal menu laterale.

**Perché** — Sono già nella barra in alto: la campanella
(`top-bar.tsx:31`) e il menu avatar (`profile-menu.tsx:39-43`). Occupano tre
slot di primo livello per una seconda copia dello stesso collegamento.

**Cosa tocca** — `nav-items.ts` (`SECONDARY_NAV`), `side-nav.tsx:67-69`.
Le tre pagine **restano** ai loro indirizzi.

---

## A-2 · Le pagine-contenitore

**Cosa cambia** — Tre pagine nuove: `/partecipa`, `/trasparenza`,
`/territorio`. `/comunita` esiste già e fa da modello.

**Perché** — Senza una pagina propria, una destinazione è solo un'etichetta che
apre un sottomenu: il problema di prima con un nome nuovo. E su telefono una
scheda in basso **deve** portare da qualche parte.

**Cosa tocca** — `app/(app)/partecipa/page.tsx`, `trasparenza/page.tsx`,
`territorio/page.tsx`. Le 16 pagine assorbite **non si spostano e non
cambiano**: restano ai loro indirizzi.

**La regola che distingue un consolidamento da un rinvio**

> Un hub che elenca soltanto sposta il clic, non lo elimina: l'utente ne fa due
> dove prima ne faceva uno. Ogni hub deve aprire su **cosa sta succedendo
> adesso** — le proposte in raccolta firme, i sondaggi aperti, le priorità in
> votazione — e da lì portare al dettaglio. I dati ci sono già: sono gli stessi
> che oggi alimentano le singole pagine.

**Prima → dopo (esempio: partecipazione)**

```
PRIMA  7 voci sparse tra il gruppo principale e "Partecipazione",
       nessuna raggiungibile su telefono
       /proposte  /sondaggi  /priorita  /question-time
       /patti  /progetti  /iniziative

DOPO   [Partecipa] → /partecipa
         ├── stato in apertura: cosa è aperto adesso e scade quando
         └── sezioni: Segnalazioni · Proposte · Sondaggi · Priorità
                      Question time · Patti · Progetti · Volontariato
       (ogni sezione resta la sua pagina, allo stesso indirizzo)
```

---

## A-3 · Progressive disclosure

**Cosa cambia** — Quattro rotte escono dal menu principale verso una casa
dichiarata.

**Perché** — «Aggressively reduce tab count through merging and progressive
disclosure, **never by hiding functionality without a home**». Ogni riga qui
sotto ha la sua casa scritta.

| Rotta | Casa nuova | Perché |
|---|---|---|
| `/avvisi` | Banner in home + archivio dal banner | Oggi è al 17° posto, **sotto la piega**, per contenuti di severità "Critico". Il banner in home esiste già: quello è il canale |
| `/organigramma` | Utility, una sola esposizione | Oggi è in **tre** posti: menu, avatar, azione guidata |
| `/faq` | Utility | Aiuto, non contenuto civico |
| `/glossario` | Utility + `GlossaryTip` contestuale | 63 righe, e il canale vero è già il tooltip dentro le pagine |

---

## A-4 · Alleggerire la home

**Cosa cambia** — `/la-mia-citta` (432 righe, 8 sezioni impilate) mette in alto
i due lavori primari.

**Perché** — È la prima schermata dopo il login e deve dire *cos'è il
prodotto*. Oggi elenca tutto: avvisi, stato città, 6 azioni, 4 KPI personali,
feed "Per te", "Vicino a te", proposte in evidenza, notifiche.

**Cosa tocca** — `app/(app)/la-mia-citta/page.tsx`. Nessuna sezione viene
rimossa: cambia l'ordine e cosa sta sopra la piega.

**Prima → dopo**

```
PRIMA  1 avvisi · 2 stato città · 3 "Cosa vuoi fare?" · 4 KPI personali
       5 notifiche · 6 "Per te" · 7 "Vicino a te" · 8 proposte

DOPO   sopra la piega   avvisi (se attivi)
                        "Cosa vuoi fare?"   ← protetto, promosso
                        stato della città
       sotto            KPI personali · "Per te" · "Vicino a te" · proposte
                        (invariate)
```

**Vincoli protetti:** "Cosa vuoi fare?" non si scioglie; la **modalità
semplice** deve restare identica nel comportamento e va verificata a ogni
passo.

---

## A-5 · Debito attraversato dal lavoro

### A-5.1 · `community/` → `segnalazioni/` + `proposte/`

**Cosa cambia** — 18 file escono da `components/community/`.

**Perché** — `community/` **non contiene la Comunità**: contiene segnalazioni e
proposte (`report-card`, `proposal-card`, `report-composer`…). La vera Comunità
sta in `comunita/` (2 file). Il nome inglese viola `AGENTS.md` §6 —
*«italiano per il dominio civico»* — **e** collide con il nome di una sezione
diversa. È una trappola per chiunque apra il progetto.

**Cosa tocca** — 18 file + import. Meccanico, verificabile col typecheck.

**Come è finita** — due cartelle non bastavano: **tre file su diciotto non sono
né segnalazioni né proposte**, e infilarceli avrebbe spostato la bugia invece di
toglierla. La destinazione finale:

| Da `community/` | A | Quanti |
|---|---|---|
| `report-*`, `quick-report`, `confirm-button`, `resolution-confirm`, `similar-reports`, `phase-photos` | `segnalazioni/` | 9 |
| `proposal-*`, `support-button`, `threshold-bar` | `proposte/` | 6 |
| `follow-button`, `answer-feedback` | `app/` | 2 |
| `badges` → `civic-badges` | `ui/` | 1 |

I due che finiscono in `app/` sono **parametrici sull'entità** — `FollowTarget`
copre quartieri, opere, segnalazioni, proposte, sondaggi ed eventi;
`FeedbackTarget` copre comunità, segnalazioni e proposte — esattamente la forma
di `app/shared-element-link.tsx`, che sta lì per la stessa ragione.
`badges.tsx` è invece solo presentazionale (compone `ui/badge` e
`ui/verified-badge`) e parla di *chi è l'autore*, non di una sezione civica: va
in `ui/`, rinominato `civic-badges.tsx` perché `badges.tsx` accanto a `badge.tsx`
si distingue per una lettera.

Resta fuori portata `lib/community.ts`, che ha lo stesso problema di nome: è un
file diverso e A-5.1 riguarda la cartella dei componenti.

### A-5.2 · Un solo `FollowButton`

**Cosa cambia** — `assessori/follow-button.tsx` (66 righe) sparisce dentro
`community/follow-button.tsx` (71 righe).

**Perché** — Stessi import, stessi hook, stesse icone, stessa struttura. Il
secondo è già generico (`targetType`/`targetId`) e assorbe il primo aggiungendo
un tipo bersaglio.

### A-5.3 · `/iniziative` → `/volontariato`

**Cosa cambia** — La rotta prende il nome della sua etichetta, con redirect.

**Perché** — Oggi l'etichetta dice "Volontariato" e l'indirizzo dice
`/iniziative`: chi cerca l'indirizzo non lo indovina. Il progetto è in sviluppo
locale, quindi il costo del cambio è **ora al minimo storico**.

---

## Ordine di lavoro

| Passo | Blocca | Parallelizzabile con |
|---|---|---|
| A-0.1 | niente | qualunque passo |
| A-1.1 | A-1.2 · A-1.3 · A-2 | — |
| A-1.2 · A-1.3 · A-1.4 · A-1.5 | A-2 | fra loro |
| A-2 | cancello | — |
| A-3 · A-4 · A-5 | cancello | fra loro |

---

## Verifica a ogni passo

Da `AGENTS.md` §5, senza sconti:

- [ ] `npm run typecheck` · `npm run lint` · `npm test`
- [ ] `npm run test:e2e` *(a dev server spento: la modalità isolata deve avviare il proprio processo)*
- [ ] Guardata davvero, tema chiaro **e** scuro
- [ ] `node scripts/shots.mjs --simple --width=360` — modalità semplice e traboccamento orizzontale
- [ ] Tastiera e focus visibile
- [ ] `prefers-reduced-motion` non lascia contenuto invisibile
- [ ] `graphify update .` a fine modifica

E il controllo specifico di questa fase, da rifare a ogni passo:

- [ ] **Ogni funzione dell'inventario §1 è ancora raggiungibile, su telefono e su desktop.**

---

## Consuntivo — 2026-07-26

| Azione | Stato |
|---|---|
| A-0.1 · database E2E isolato + `dev.db` ripulito | ✅ |
| A-1.1 → A-1.5 · modello di navigazione | ✅ |
| A-2 · tre pagine-contenitore | ✅ |
| A-3 · progressive disclosure (utility nel footer) | ✅ |
| A-4 · alleggerimento della home | ✅ |
| A-5.2 · `FollowToggle` condiviso | ✅ *(merge parziale — vedi sotto)* |
| A-5.3 · `/iniziative` → `/volontariato` | ✅ |
| **A-5.1 · rinomina di `components/community/`** | ✅ *(18 file in 4 destinazioni — vedi sopra)* |

**Verifiche passate:** `typecheck`, `lint`, 93 test unitari, **11/11 E2E**,
`shots` in tema chiaro e scuro, `shots --simple --width=360` senza traboccamento
orizzontale.

**L'esecuzione E2E, chiusa.** Serviva la directory libera: Next rifiuta due dev
server sullo stesso progetto, quindi finché uno era in ascolto l'avvio
automatico di Playwright non poteva partire e il percorso isolato non veniva mai
esercitato. A server spento, `npm run test:e2e` → **11 passed (50,3s)**, database
`prisma/e2e.db` ricreato e riseminato da `tests/e2e/global-setup.ts`.

Il dettaglio che conta: passa anche `territorio.spec.ts:55` — «votare una
domanda del question time aggiorna il conteggio» — cioè proprio il test che
contro il DB di sviluppo si esauriva da solo dopo quattro esecuzioni. È la prova
che l'isolamento fa quello per cui è stato introdotto, e non solo che la suite
è verde.

### Due correzioni al piano, emerse eseguendolo

1. **A-0.1 non era una riparazione di `AnimatedNumber`.** Il difetto descritto
   nella prima stesura dell'audit non esisteva: era l'ambiente di misura. Vedi
   `audit-consolidamento.md` §5 e `AGENTS.md` §3, trappola 1 della Fase A.
2. **A-5.2 non poteva essere una fusione completa.** I due `FollowButton`
   sembravano duplicati ma hanno strati dati diversi *di proposito*: gli
   assessori usano `AssessoreFollow`, con una chiave esterna vera verso
   `Assessore`, mentre il resto passa dalla tabella polimorfica `Follow`, che
   una chiave esterna non può averla. Fondere avrebbe barattato integrità
   referenziale per una riga di codice in meno. È stato condiviso l'**aspetto**
   (`components/ui/follow-toggle.tsx`), che era la duplicazione vera.
