import { defineConfig, devices } from "@playwright/test";

// E2E sui flussi critici (Fase 1): login, voto, segnalazione.
// Girano contro il dev server con il database seedato (npm run db:reset
// per ripartire puliti). I test creano dati con titoli univoci, quindi
// possono girare più volte sullo stesso DB.
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
        webServer: {
          command: "npm run dev",
          url: "http://localhost:3939/login",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: { PORT: "3939" },
        },
      }),
});
