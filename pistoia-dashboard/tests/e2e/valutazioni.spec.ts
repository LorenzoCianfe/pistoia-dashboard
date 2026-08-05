import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// «Valutazioni dei servizi» (Fase C). Dal 2026-08-05 il seed semina un MESE
// DIMOSTRATIVO dichiarato (piano §8.7): Pulizia ha 34 voti e la media 3,3,
// Trasporti resta a ZERO di proposito — l'assenza è parte del contratto della
// pagina, e si prova lì. Le medie del seed sono fisse: questi numeri non
// ballano fra risemine.

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

test("a zero valutazioni nessuna media compare, e l'assenza non si decora", async ({
  page,
}) => {
  await login(page);
  await page.goto("/valutazioni/trasporti");

  await expect(page.getByRole("heading", { name: "Trasporti" })).toBeVisible();
  await expect(page.getByText("Nessun voto, ancora")).toBeVisible();
  // «Nessuna soglia» (R-6): l'attesa non conta più i voti mancanti — dichiara
  // che la media esiste dal primo voto, col suo campione.
  await expect(page.getByText("La media compare col primo voto")).toBeVisible();

  // La colonna dura c'è dal primo giorno: è la ragione per cui la scheda non è
  // vuota pur non avendo un solo voto.
  await expect(page.getByText("Cosa dicono le segnalazioni")).toBeVisible();

  // Il registro delle rimozioni compare ANCHE quando è vuoto: una pagina che
  // lo mostrasse solo a rimozione avvenuta farebbe del registro un allarme.
  await expect(page.getByText("Rimuove la redazione, mai il Comune")).toBeVisible();
});

test("la media compare dal primo voto, col campione dichiarato accanto", async ({
  page,
}) => {
  await login(page);
  await page.goto("/valutazioni/pulizia");

  // Le distribuzioni del seed sono fisse: 3,3 è un numero del contratto, non
  // un caso. `.first()` perché la stessa cifra può ricomparire nella tabella
  // accessibile dell'andamento.
  await expect(page.getByRole("heading", { name: "Pulizia" })).toBeVisible();
  await expect(page.getByText("3,3").first()).toBeVisible();

  // La composizione è PORTANTE (regola 7): totale, confermate e QR accanto
  // alla media, mai in un tooltip.
  await expect(page.getByText(/34 valutazioni negli ultimi tre mesi/)).toBeVisible();
  await expect(page.getByText(/22.*da email confermata/)).toBeVisible();
  await expect(page.getByText(/6.*da QR in loco/)).toBeVisible();

  // L'andamento ha un punto al mese, e il seed ne semina tre.
  await expect(page.getByText("Un punto al mese")).toBeVisible();

  // Il timbro B2 in calce: la versione che ha calcolato ciò che si è letto.
  // Quale versione sia lo pinza il test unitario: qui basta che il timbro
  // esista e sia versionato, così un bump non rompe un E2E che non lo prova.
  await expect(
    page.getByRole("link", { name: /metodologia v\d+\.\d+/ }),
  ).toBeVisible();
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
