import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("creare una segnalazione porta alla sua pagina di dettaglio", async ({
  page,
}) => {
  await login(page);
  await page.goto("/segnalazioni");

  // Apri il composer (è dentro un <details>).
  await page.getByText("Nuova segnalazione", { exact: true }).click();

  const title = `Lampione spento E2E ${Date.now()}`;
  await page.getByLabel("Titolo").fill(title);
  await page.getByLabel("Categoria").selectOption({ index: 1 });
  await page
    .getByLabel("Descrizione")
    .fill("Segnalazione creata dal test end-to-end: lampione spento da tre giorni.");

  await page.getByRole("button", { name: "Invia segnalazione" }).click();

  // Successo → redirect al dettaglio con timeline "ricevuta".
  await expect(page).toHaveURL(/\/segnalazioni\/[a-z0-9]+/i, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
});
