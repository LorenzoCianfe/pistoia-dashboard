/*
  Lighthouse CI — traccia «Qualità continua» (ROADMAP).

  **Questo file MISURA e non giudica, ed è voluto.** Non c'è nessuna soglia
  perché non ne abbiamo ancora una misurata: una soglia inventata prima del
  primo numero è la scala a tacche di `/promesse` applicata alla performance —
  un intervallo che nessuno ha fissato, che però si legge come una promessa.
  Le soglie si scrivono qui sotto (`assert`) dopo aver guardato le prime
  passate, e solo allora il job in CI diventa bloccante. È lo stesso percorso
  del job E2E, nato `continue-on-error` «finché non rodato».

  **`@lhci/cli` non è una dipendenza del progetto**, e non è una dimenticanza:
  installarlo costa **285 pacchetti** e cinque avvisi propri (`tmp` è high), e
  il `Dockerfile` fa `npm ci --include=dev` — quindi finirebbero tutti
  nell'immagine di produzione di un servizio pubblico. Si esegue con `npx` a
  **versione pinnata** (`npm run lighthouse`, o il job in CI): senza pin, `npx`
  scaricherebbe l'ultima versione, cioè codice che nessuno ha deciso.

  Quattro scelte che non sono ovvie:

  1. **Si misura la build di PRODUZIONE** (`npm start`), mai `next dev`: in
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
      startServerCommand: "npm start",
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
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
