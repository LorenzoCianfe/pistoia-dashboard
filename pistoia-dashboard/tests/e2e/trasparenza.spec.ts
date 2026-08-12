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
  // Asseriva sulla pastiglia «1 su 6 completati», tolta nella Fase B perché
  // ripeteva a 12px il numero della cifra display. Il fatto è lo stesso e sta
  // ancora in pagina, nella frase sotto la cifra.
  await page.goto("/promesse");
  await expect(page.getByRole("heading", { name: "Promesse e risultati" })).toBeVisible();
  await expect(page.getByText("su 6 impegni tracciati")).toBeVisible();
  await expect(page.getByText("Portati a termine")).toBeVisible();

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
  // Il termine si cerca dentro la sua àncora, non a testo libero: dalla Fase B
  // la pagina apre con un indice, quindi ogni termine compare due volte — una
  // nel chip e una nella definizione — e un getByText nudo è ambiguo.
  await expect(
    page.locator("#avanzo").getByText("Avanzo di bilancio"),
  ).toBeVisible();
  // L'indice punta all'àncora: è la stessa che usa <GlossaryTip> dalle altre
  // pagine, quindi romperla romperebbe anche i tooltip contestuali.
  await expect(
    page.getByRole("link", { name: "Avanzo di bilancio" }),
  ).toHaveAttribute("href", "#avanzo");
});

test("una proposta respinta spiega perché non si può fare", async ({ page }) => {
  await login(page);
  await page.goto("/proposte");
  await page.getByText("Navetta gratuita serale per le frazioni").first().click();
  // Si pretende l'ARRIVO prima di leggere. Senza, il test cerca l'intestazione
  // mentre è ancora sulla lista e rinuncia dopo i 5s di `expect`: caduto così
  // il 2026-08-11 con la macchina occupata, e lo snapshot del fallimento
  // mostrava la lista con dentro il link appena cliccato — cioè «non era
  // ancora arrivato», non «manca». Stessa correzione di `porte.spec.ts`, e non
  // ammorbidisce niente: se il dettaglio non si apre, il test scade lo stesso.
  await page.waitForURL(/\/proposte\/[^/]+$/, { timeout: 20_000 });
  await expect(
    page.getByRole("heading", { name: "Perché non si può fare?" }),
  ).toBeVisible();
  await expect(page.getByText(/180\.000 €/)).toBeVisible();
});
