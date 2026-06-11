import { expect, test } from "@playwright/test";
import { CITTADINO, login } from "./helpers";

test("le rotte protette redirigono al login con ?next=", async ({ page }) => {
  await page.goto("/bilancio");
  await expect(page).toHaveURL(/\/login\?next=%2Fbilancio|\/login\?next=\/bilancio/);
});

test("credenziali errate mostrano un errore e non fanno entrare", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(CITTADINO.email);
  await page.getByLabel("Password", { exact: true }).fill("password-sbagliata-1");
  await page.getByRole("button", { name: "Accedi" }).click();
  await expect(page.getByText("Email o password non corretti.")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("login valido → La mia città, logout → login", async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/\/la-mia-citta/);

  // La pagina richiesta prima del login viene rispettata via ?next=.
  await page.goto("/bilancio");
  await expect(
    page.getByRole("heading", { name: /Bilancio/ }),
  ).toBeVisible();
});
