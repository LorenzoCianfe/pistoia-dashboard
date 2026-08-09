import { expect, test } from "@playwright/test";
import { login } from "./helpers";

/*
  Il suggerimento di categoria sul modulo del cittadino (Ondata 8).

  IL CANCELLO È IL SECONDO TEST: il suggerimento **non applica niente da sé**.
  È la difesa contro l'ancoraggio — la tendina resta su ciò che la persona ha
  scelto, e la proposta è un pulsante che va premuto. Gli unit provano i
  quattro silenzi (`tests/unit/moderazione-assistita.test.ts`); qui si prova
  che fra il modulo e la persona non si mette nessuno.
*/

test.beforeEach(async ({ page }) => {
  await login(page);
  await page.goto("/segnalazioni");
  // Il modulo vive in un <details> chiuso, come su tutte le superfici lunghe.
  await page.evaluate(() =>
    document.querySelectorAll("details").forEach((d) => (d.open = true)),
  );
});

test("propone una categoria dal titolo, con le parole che l'hanno prodotta", async ({
  page,
}) => {
  await page.getByLabel("Titolo").fill("Cassonetto ribaltato dopo il mercato");

  await expect(page.getByText(/Dal testo sembra/)).toBeVisible();
  // Le prove sono le parole del testo, non le spie troncate del codice.
  await expect(page.getByText(/Parole trovate:.*cassonetto/)).toBeVisible();
});

test("non applica niente da sé: la categoria cambia solo se la premi", async ({
  page,
}) => {
  const categoria = page.locator("#category");
  await page.getByLabel("Titolo").fill("Lampione spento in Via Ciliegiole");

  // Il suggerimento c'è, ma la tendina è ancora vuota.
  await expect(page.getByRole("button", { name: /^Usa «/ })).toBeVisible();
  await expect(categoria).toHaveValue("");

  await page.getByRole("button", { name: /^Usa «/ }).click();
  await expect(categoria).toHaveValue("illuminazione");

  // E una volta accolto tace, perché confermare non è informare.
  await expect(page.getByRole("button", { name: /^Usa «/ })).toHaveCount(0);
});

test("tace quando non sa e quando pareggia", async ({ page }) => {
  const titolo = page.getByLabel("Titolo");

  await titolo.fill("Buongiorno, volevo scrivere una cosa");
  await expect(page.getByText(/Dal testo sembra/)).toHaveCount(0);

  // «lampione» e «panchina» valgono una prova ciascuna: non sa scegliere.
  await titolo.fill("Lampione e panchina");
  await expect(page.getByText(/Dal testo sembra/)).toHaveCount(0);
});
