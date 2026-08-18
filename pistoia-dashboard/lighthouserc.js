/*
  Lighthouse CI — traccia «Qualità continua» (ROADMAP).

  **Le soglie ci sono dal 2026-08-06, e sono misurate — non inventate.**

  Fino a quel giorno questo file diceva «misura e non giudica», in attesa di
  guardare le prime passate. **Le passate non si potevano guardare**, e per due
  difetti indipendenti scoperti insieme: `.lighthouseci` comincia con un punto,
  e `upload-artifact@v4` esclude i file nascosti per default — dodici referti
  scritti, zero caricati, job verde; e senza un blocco `assert` qui sotto,
  `lhci autorun` si ferma a `collect` e **non stampa nessuna tabella**. Il
  meccanismo per leggere i numeri era rotto da entrambe le parti, quindi la
  condizione «si scrivono dopo aver guardato» non poteva avverarsi da sola.

  Prima misura vera (CI, 2026-08-06, mediana di tre passate):

  | URL | perf | a11y | best | seo |
  |---|---|---|---|---|
  | `/login` | 100 | 100 | 96 | 100 |
  | `/valutazioni` | 100 | 100 | 100 | 100 |
  | `/valutazioni/pulizia` | **95** | 100 | 100 | 100 |
  | `/metodologia` | **95** | 100 | 100 | 100 |

  Le soglie stanno **cinque punti sotto il minimo osservato**, e il margine è
  la parte importante: una soglia messa a 95 perché 95 è il minimo misurato
  diventa rossa al primo rumore della macchina condivisa, e un cancello che
  lampeggia smette di essere letto — la stessa ragione per cui si fanno tre
  passate e si prende la mediana. Se un giorno si vorrà più stretto, **la leva
  è alzare il numero, non togliere la soglia.**

  Su `accessibility` la soglia è deliberatamente **bassa rispetto al reale**:
  il cancello vero dell'accessibilità è `tests/e2e/accessibilita.spec.ts`
  (axe-core, 11 pagine × 2 temi, WCAG AA), molto più severo di questa
  categoria. Qui serve solo ad accorgersi di un crollo.

  **`@lhci/cli` non è una dipendenza del progetto**, e non è una dimenticanza:
  installarlo costa **285 pacchetti** e cinque avvisi propri (`tmp` è high), e
  il `Dockerfile` installa anche le dipendenze di sviluppo
  (`pnpm install --frozen-lockfile`) — quindi finirebbero tutti nell'immagine di
  produzione di un servizio pubblico. Si esegue con `pnpm dlx` a **versione
  pinnata** (`corepack pnpm lighthouse`, o il job in CI): senza pin si
  scaricherebbe l'ultima versione, cioè codice che nessuno ha deciso.

  Quattro scelte che non sono ovvie:

  1. **Si misura la build di PRODUZIONE** (`corepack pnpm start`), mai `next dev`: in
     sviluppo il bundle non è minificato, c'è l'overlay degli strumenti e i
     numeri non somigliano a quelli di nessun cittadino.
  2. **Solo pagine pubbliche.** Lighthouse apre un browser senza sessione:
     su una rotta protetta misurerebbe il redirect al login, cioè la stessa
     pagina tre volte con tre nomi diversi. Le pagine dietro autenticazione
     restano scoperte — è un limite dichiarato, non una svista.
  3. **Il referto resta sul disco** (`filesystem`), non su
     `temporary-public-storage`: quel bersaglio pubblica il referto su un
     server pubblico, e pubblicare qualcosa fuori di qui è una decisione, non
     un default.

  Nota sui punteggi: il vetro, la grana e i gradienti mesh di `DESIGN.md` §6
  costano qualcosa in performance ed è una scelta presa consapevolmente. Se
  Lighthouse suggerirà di toglierli, la risposta è calibrare la soglia, non
  smontare il design.
*/
module.exports = {
  ci: {
    collect: {
      /*
        `corepack pnpm start`, non `pnpm start`: `lhci` viene lanciato da
        `pnpm dlx`, che nel PATH mette il proprio pacchetto temporaneo — non
        `pnpm` stesso — e su Windows senza `corepack enable` (che vuole i
        permessi di amministratore) `pnpm` non è comunque nel PATH. `corepack`
        arriva dentro Node ed è sempre raggiungibile; la versione la decide
        `packageManager` in package.json.
      */
      startServerCommand: "corepack pnpm start",
      startServerReadyPattern: "Ready in",
      url: [
        "http://localhost:3000/login",
        "http://localhost:3000/valutazioni",
        "http://localhost:3000/valutazioni/pulizia",
        "http://localhost:3000/metodologia",
      ],
      // Tre passate e mediana: una sola misura su una macchina condivisa
      // oscilla abbastanza da far sembrare regressione il rumore.
      numberOfRuns: 3,
      settings: { preset: "desktop" },
    },
    assert: {
      // Sulla MEDIANA delle tre passate, che è l'aggregazione predefinita di
      // `lhci`: asserire su ogni singola corsa vanificherebbe le tre passate.
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.95 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
