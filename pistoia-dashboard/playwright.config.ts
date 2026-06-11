import { defineConfig, devices } from "@playwright/test";

// E2E sui flussi critici (Fase 1): login, voto, segnalazione.
// Girano contro il dev server con il database seedato (npm run db:reset
// per ripartire puliti). I test creano dati con titoli univoci, quindi
// possono girare più volte sullo stesso DB.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false, // condividono lo stesso DB SQLite seedato
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3939",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3939/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { PORT: "3939" },
  },
});
