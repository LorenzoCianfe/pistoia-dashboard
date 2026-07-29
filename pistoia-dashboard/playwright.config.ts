import { defineConfig, devices } from "@playwright/test";

// E2E sui flussi critici (Fase 1): login, voto, segnalazione.
//
// Il database è DEDICATO e ricreato a ogni esecuzione (`tests/e2e/global-setup.ts`).
// Prima era quello di sviluppo, e i test non ripulivano: i residui finivano in
// home e, votando ogni volta una domanda del question time senza mai
// disfarlo, la suite aveva esaurito la sessione aperta e non poteva più
// passare. Non basta creare dati con titoli univoci: le AZIONI si accumulano.
/*
  `E2E_BASE_URL` punta i test a un server GIÀ IN ASCOLTO e disattiva l'avvio
  automatico.

  Serve perché Next rifiuta due dev server sulla stessa directory: con un
  `npm run dev` aperto, il `webServer` qui sotto fallisce sempre — e la risposta
  giusta non è spegnere il server di chi sta lavorando, è girargli contro.

      E2E_BASE_URL=http://localhost:3000 npx playwright test
*/
const BASE_ESTERNA = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false, // condividono lo stesso DB SQLite seedato
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_ESTERNA ?? "http://localhost:3939",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(BASE_ESTERNA
    ? {}
    : {
        /*
          ⚠ Questo server è un processo separato ma usa la **stessa cartella
          `.next`** del dev server di sviluppo, e la ricostruzione incrementale
          di Turbopack rompe periodicamente le rotte annidate (AGENTS.md §3,
          Fase A/B, trappola 4). Sintomo: tre test falliscono con «Errore 404 ·
          Pagina non trovata» sul dettaglio segnalazione, su /comunita/stanze e
          sul dettaglio proposta — e sembra una regressione appena introdotta.
          Prima di cercare nel diff: cancella `.next` e rilancia.
        */
        webServer: {
          command: "npm run dev",
          url: "http://localhost:3939/login",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          // Il database dei test, non quello di sviluppo: è ciò che impedisce
          // ai residui di finire nella demo.
          env: { PORT: "3939", DATABASE_URL: "file:./prisma/e2e.db" },
        },
      }),
});
