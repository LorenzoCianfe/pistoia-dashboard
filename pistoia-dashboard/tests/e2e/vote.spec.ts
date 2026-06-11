import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("un cittadino può votare un sondaggio attivo (voto ottimistico)", async ({
  page,
}) => {
  await login(page);
  await page.goto("/sondaggi");

  // Primo sondaggio attivo: vota la prima opzione disponibile.
  const firstOption = page
    .locator("button[aria-pressed]")
    .first();
  await expect(firstOption).toBeVisible();
  await firstOption.click();

  await expect(page.getByText("Hai votato · puoi cambiare").first()).toBeVisible();
});
