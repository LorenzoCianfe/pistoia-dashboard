import { expect, test } from "@playwright/test";
import { login, ADMIN } from "./helpers";

/*
  Le due letture operative del cruscotto (Ondata 8).

  IL CANCELLO È IL SECONDO TEST: le segnalazioni senza ufficio stanno FUORI
  dall'elenco degli uffici. È la regola che ha deciso la forma — sul seed sono
  6 aperte e 0 chiuse, quindi dentro la classifica sarebbero la riga più lenta
  e più rossa della pagina, attribuita a un ufficio che non esiste.

  Gli unit provano l'aggregazione (`tests/unit/analitiche.test.ts`); qui si
  prova che la pagina la RENDE, perché fra le due cose ci sta un componente.
*/

test.beforeEach(async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin");
});

test("il cruscotto mostra il carico degli uffici e dove si accumula", async ({
  page,
}) => {
  const carico = page.locator("div", { has: page.getByRole("heading", { name: "Il carico degli uffici" }) }).last();
  await expect(carico.getByRole("heading", { name: "Il carico degli uffici" })).toBeVisible();

  // Gli uffici del seed, col loro tempo mediano accanto.
  await expect(carico.getByText("Ufficio Igiene Urbana")).toBeVisible();
  await expect(carico.getByText(/giorni/).first()).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Dove si accumula" }),
  ).toBeVisible();
});

test("le segnalazioni senza ufficio stanno fuori dall'elenco degli uffici", async ({
  page,
}) => {
  const senzaUfficio = page.getByText(/segnalazioni senza ufficio/);
  await expect(senzaUfficio).toBeVisible();

  // Non è una voce dell'elenco: l'elenco è fatto di <li>, questa no.
  const dentroLaLista = page.locator("li", { hasText: /senza ufficio/ });
  await expect(dentroLaLista).toHaveCount(0);

  // E la pagina dice perché, invece di lasciar leggere «ufficio lentissimo».
  await expect(
    page.getByText("Non è un ufficio lento: è chi non le ha ancora prese in carico."),
  ).toBeVisible();
});

test("le categorie sotto la soglia non si mostrano, ma si dichiarano", async ({
  page,
}) => {
  /*
    Tacere le categorie scarse senza dirlo farebbe credere che la città non le
    abbia; mostrarle accanto a quelle piene le farebbe leggere come
    confrontabili. La pagina fa la terza cosa: le conta e lo scrive.
  */
  await expect(
    page.getByText(/Altre \d+ categorie hanno meno di \d+ casi/),
  ).toBeVisible();
});

test("il monitor degli atti dice la verità su una base dati mai letta", async ({
  page,
}) => {
  /*
    Il database degli E2E nasce dal seed e NON contiene atti — per disegno: il
    seed non deve mai riempire l'archivio, perché una delibera inventata
    attribuisce alla giunta una decisione che non ha preso. Quindi ciò che
    questo test può provare è lo stato onesto del vuoto: la card c'è, dichiara
    «Mai letto», e dice COME si esce da quello stato. Un monitor che a
    pipeline mai lanciata mostrasse «0 atti, tutto bene» sarebbe il difetto
    classico del cancello che non distingue «verificato» da «non verificato».
  */
  const monitor = page
    .locator("div.card", { has: page.getByRole("heading", { name: "Archivio degli atti" }) })
    .last();
  await expect(monitor.getByRole("heading", { name: "Archivio degli atti" })).toBeVisible();
  await expect(monitor.getByText("Mai letto")).toBeVisible();
  await expect(monitor.getByText(/la lettura dal portale della trasparenza non/)).toBeVisible();
});
