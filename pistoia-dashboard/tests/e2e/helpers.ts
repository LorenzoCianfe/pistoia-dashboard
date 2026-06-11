import { expect, type Page } from "@playwright/test";

// Credenziali del seed (prisma/seed.ts).
export const CITTADINO = {
  email: "cittadino@pistoia.it",
  password: "Pistoia2026",
};

export async function login(
  page: Page,
  { email, password } = CITTADINO,
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Accedi" }).click();
  await expect(page).toHaveURL(/\/la-mia-citta/);
}
