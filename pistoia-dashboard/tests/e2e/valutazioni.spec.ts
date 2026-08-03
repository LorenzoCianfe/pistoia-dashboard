import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// «Valutazioni dei servizi» (Fase C, R-2). Il seed non contiene NESSUNA
// valutazione di proposito, quindi questi test girano sullo stato del giorno
// uno — che è l'unico stato che la pagina vedrà davvero all'apertura, e quello
// in cui è più facile sbagliare.

test("la panoramica tiene i due tabelloni separati e non ne fonde le medie", async ({
  page,
}) => {
  await login(page);
  await page.goto("/valutazioni");

  await expect(
    page.getByRole("heading", { name: "Valutazioni dei servizi" }),
  ).toBeVisible();

  // I due tabelloni esistono entrambi e dichiarano CHE COSA misurano: è la
  // regola che regge la funzione, perché una classifica unica affermerebbe che
  // una media di episodi e un umore sono confrontabili.
  await expect(page.getByRole("heading", { name: "Servizi allo sportello" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Come sta la città" })).toBeVisible();
  await expect(page.getByText("Media di esperienze vere")).toBeVisible();

  // E non esiste da nessuna parte un voto unico della città.
  await expect(page.getByText("un unico voto della città non esiste")).toBeVisible();
});

test("a zero valutazioni nessuna media compare, e la pagina dice quante ne mancano", async ({
  page,
}) => {
  await login(page);
  await page.goto("/valutazioni/pulizia");

  await expect(page.getByRole("heading", { name: "Pulizia" })).toBeVisible();
  await expect(page.getByText("Nessun voto, ancora")).toBeVisible();
  await expect(page.getByText("La media compare da")).toBeVisible();

  // La colonna dura c'è dal primo giorno: è la ragione per cui la scheda non è
  // vuota pur non avendo un solo voto.
  await expect(page.getByText("Cosa dicono le segnalazioni")).toBeVisible();

  // Il registro delle rimozioni compare ANCHE quando è vuoto: una pagina che
  // lo mostrasse solo a rimozione avvenuta farebbe del registro un allarme.
  await expect(page.getByText("Rimuove la redazione, mai il Comune")).toBeVisible();
});

test("dalla panoramica si arriva alla scheda di un servizio", async ({ page }) => {
  await login(page);
  await page.goto("/valutazioni");
  await page.getByRole("link", { name: /Sportello unico edilizia/ }).click();
  await expect(
    page.getByRole("heading", { name: "Sportello unico edilizia" }),
  ).toBeVisible();
  await expect(page.getByText("Servizio allo sportello")).toBeVisible();
});
