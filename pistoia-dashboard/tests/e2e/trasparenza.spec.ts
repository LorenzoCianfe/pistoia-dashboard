import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// Ondata 3 — Trasparenza che chiude il cerchio: le pagine pubbliche
// dell'accountability (decisioni, promesse, avvisi, FAQ, digest, glossario)
// e l'hero "Stato della città" in home.

test("la home mostra lo Stato della città e gli avvisi urgenti", async ({
  page,
}) => {
  await login(page);
  await expect(page.getByRole("heading", { name: "Stato della città" })).toBeVisible();
  // Il banner degli avvisi attivi porta alla bacheca.
  await expect(page.getByRole("region", { name: "Avvisi urgenti" })).toBeVisible();
});

test("le pagine Trasparenza si aprono e raccontano il ciclo completo", async ({
  page,
}) => {
  await login(page);

  // Archivio decisioni: esiti + "perché non si può fare" sulla respinta.
  await page.goto("/decisioni");
  await expect(page.getByRole("heading", { name: "Archivio decisioni" })).toBeVisible();
  await expect(page.getByText("Perché non si può fare").first()).toBeVisible();

  // Promesse e risultati: il tracker raggruppato per stato.
  await page.goto("/promesse");
  await expect(page.getByRole("heading", { name: "Promesse e risultati" })).toBeVisible();
  await expect(page.getByText("su 6 completati")).toBeVisible();

  // Bacheca avvisi: severità + "cosa cambia per me".
  await page.goto("/avvisi");
  await expect(page.getByRole("heading", { name: "Avvisi urgenti" })).toBeVisible();
  await expect(page.getByText("Cosa cambia per me").first()).toBeVisible();

  // FAQ: la risposta ufficiale appare aprendo una domanda.
  await page.goto("/faq");
  await expect(page.getByRole("heading", { name: "FAQ della città" })).toBeVisible();
  await page.getByText("Come ottengo il permesso ZTL per i residenti?").click();
  await expect(page.getByText("Risposta ufficiale").first()).toBeVisible();

  // Digest mensile: numeri + bottone di export PDF.
  await page.goto("/digest");
  await expect(
    page.getByRole("heading", { name: "Report civico del mese" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Scarica PDF" })).toBeVisible();

  // Glossario: i termini in linguaggio semplice.
  await page.goto("/glossario");
  await expect(page.getByRole("heading", { name: "Glossario della città" })).toBeVisible();
  await expect(page.getByText("Avanzo di bilancio")).toBeVisible();
});

test("una proposta respinta spiega perché non si può fare", async ({ page }) => {
  await login(page);
  await page.goto("/proposte");
  await page.getByText("Navetta gratuita serale per le frazioni").first().click();
  await expect(
    page.getByRole("heading", { name: "Perché non si può fare?" }),
  ).toBeVisible();
  await expect(page.getByText(/180\.000 €/)).toBeVisible();
});
