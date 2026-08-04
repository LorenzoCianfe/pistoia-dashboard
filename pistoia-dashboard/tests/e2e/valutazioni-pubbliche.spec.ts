import { expect, test } from "@playwright/test";

// R-5, decisione W1 (2026-08-04): /valutazioni e le schede si aprono in SOLA
// LETTURA a chi non ha un account. Questi test girano SENZA login — il
// contesto vergine è il soggetto del test, non una dimenticanza.

test("la panoramica si legge senza account, con la barra anonima", async ({
  page,
}) => {
  await page.goto("/valutazioni");

  // L'atterraggio è parte della prova: un redirect al login risponderebbe
  // 200 con un <h1> e un test più pigro passerebbe lo stesso.
  await expect(page).toHaveURL(/\/valutazioni$/);
  await expect(
    page.getByRole("heading", { name: "Valutazioni dei servizi" }),
  ).toBeVisible();

  // La barra anonima: stemma e «Accedi», niente campanello né profilo.
  await expect(page.getByRole("link", { name: "Accedi" })).toBeVisible();
  await expect(page.getByRole("link", { name: /notifiche/i })).toHaveCount(0);
});

test("la scheda si legge senza account e il modulo degrada a invito", async ({
  page,
}) => {
  await page.goto("/valutazioni/pulizia");

  await expect(page).toHaveURL(/\/valutazioni\/pulizia$/);
  await expect(page.getByRole("heading", { name: "Pulizia" })).toBeVisible();

  // La lettura è INTERA: media (o attesa), colonna dura e registro delle
  // rimozioni — le tre cose che rendono la funzione difendibile in pubblico.
  await expect(page.getByText("Nessun voto, ancora")).toBeVisible();
  await expect(page.getByText("Cosa dicono le segnalazioni")).toBeVisible();
  await expect(page.getByText("Registro delle rimozioni")).toBeVisible();

  // La scrittura no: niente stelle, l'invito al posto del modulo, e il
  // ritorno dopo il login riporta al modulo (`next` con l'ancora).
  await expect(page.getByRole("radio")).toHaveCount(0);
  const invito = page.getByRole("link", { name: "Accedi e vota" });
  await expect(invito).toBeVisible();
  await expect(invito).toHaveAttribute(
    "href",
    "/login?next=%2Fvalutazioni%2Fpulizia%23vota",
  );
});

test("il resto del muro non si è mosso: /segnalazioni senza sessione va al login", async ({
  page,
}) => {
  // Il contrario del primo test: aprire la lettura pubblica NON deve aver
  // aperto altro. Una rotta protetta qualunque deve ancora respingere.
  await page.goto("/segnalazioni");
  await expect(page).toHaveURL(/\/login\?next=%2Fsegnalazioni$/);
});
