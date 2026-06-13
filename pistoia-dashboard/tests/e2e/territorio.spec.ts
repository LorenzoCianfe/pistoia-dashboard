import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// Ondata 4 — Territorio & partecipazione: question time, vota la priorità,
// volontariato, patti e luoghi, progetti civici, stanze tematiche.

test("le pagine di partecipazione si aprono e mostrano i contenuti del seed", async ({
  page,
}) => {
  await login(page);

  // Question time: una sessione aperta con le domande ordinate per voto.
  await page.goto("/question-time");
  await expect(
    page.getByRole("heading", { name: "Question time digitale" }),
  ).toBeVisible();
  await expect(page.getByText("nuovo piano della sosta", { exact: false }).first()).toBeVisible();

  // Vota la priorità: una tornata aperta con gli interventi in classifica.
  await page.goto("/priorita");
  await expect(page.getByRole("heading", { name: "Vota la priorità" })).toBeVisible();
  await expect(page.getByText("voti totali", { exact: false }).first()).toBeVisible();

  // Volontariato: la bacheca delle iniziative.
  await page.goto("/iniziative");
  await expect(
    page.getByRole("heading", { name: "Volontariato e iniziative" }),
  ).toBeVisible();
  await expect(page.getByText("Puliamo l'Ombrone")).toBeVisible();

  // Patti e luoghi adottati.
  await page.goto("/patti");
  await expect(page.getByRole("heading", { name: "Patti e luoghi adottati" })).toBeVisible();
  await expect(page.getByText("Patto per il Parco di Monteoliveto")).toBeVisible();

  // Da segnalazione a progetto.
  await page.goto("/progetti");
  await expect(
    page.getByRole("heading", { name: "Da segnalazione a progetto" }),
  ).toBeVisible();
  await expect(page.getByText("Piano illuminazione Sant'Agostino")).toBeVisible();
});

test("le stanze tematiche filtrano la community per tema", async ({ page }) => {
  await login(page);

  await page.goto("/comunita/stanze");
  await expect(page.getByRole("heading", { name: "Stanze tematiche" })).toBeVisible();

  // Entrando nella stanza Mobilità il composer eredita il tema della stanza.
  await page.goto("/comunita/stanze/mobilita");
  await expect(page.getByRole("heading", { name: "Stanza Mobilità" })).toBeVisible();
});

test("votare una domanda del question time aggiorna il conteggio", async ({
  page,
}) => {
  await login(page);
  await page.goto("/question-time");

  // Il primo pulsante di voto (domanda più votata della sessione aperta).
  const voteButton = page.getByRole("button", { name: /vota questa domanda/i }).first();
  await expect(voteButton).toBeVisible();
  await voteButton.click();
  // Dopo il voto diventa "togli il voto" (aria-pressed).
  await expect(
    page.getByRole("button", { name: /togli il voto a questa domanda/i }).first(),
  ).toBeVisible();
});
