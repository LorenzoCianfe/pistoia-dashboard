import { expect, test, type Page } from "@playwright/test";
import { login } from "./helpers";

/*
  R-4 — risposte e moderazione. IL CANCELLO DELLA FASE è il primo test: un
  account del COMUNE non può rimuovere una valutazione. `ADMIN` qui è il
  super-account del Comune (SECURITY.md §4), quindi la porta della Redazione
  lo respinge — e il predicato che ogni azione di rimozione usa è provato
  negli unit (tests/unit/redazione.test.ts).
*/

const COMUNE = { email: "comune@pistoia.it", password: "Comune2026!" };
const MODERATORE = { email: "moderatore@pistoia.it", password: "Pistoia2026" };

/** Vota dal QR (nessun account richiesto): la via più corta a una recensione. */
async function votaDalQr(page: Page, testo: string, email: string) {
  await page.goto("/v/pt-anagrafe-01");
  await page
    .getByRole("radio", { name: /^2 stell/ })
    .check({ force: true });
  await page.getByLabel(/Racconta com'è andata/).fill(testo);
  await page.getByLabel("La tua email").fill(email);
  await page.getByRole("button", { name: "Invia il voto" }).click();
  await expect(page.getByText("Il tuo voto è nel conteggio.")).toBeVisible();
}

async function cambiaUtente(page: Page, chi: { email: string; password: string }) {
  await page.context().clearCookies();
  await login(page, chi);
}

test("IL CANCELLO: l'account del Comune non entra dove si rimuove; la redazione sì", async ({
  page,
}) => {
  // L'ADMIN — che È il Comune — viene respinto dalla porta della Redazione.
  await login(page, COMUNE);
  await page.goto("/redazione");
  await expect(page).toHaveURL(/\/la-mia-citta/);
  await expect(page.getByText("Riservato alla redazione")).toHaveCount(0);

  // Il moderatore — la Redazione — entra, e la pagina dichiara chi firma.
  await cambiaUtente(page, MODERATORE);
  await page.goto("/redazione");
  await expect(page).toHaveURL(/\/redazione/);
  await expect(page.getByRole("heading", { name: "Redazione" })).toBeVisible();
  await expect(
    page.getByText("«Redazione della Dashboard di Pistoia»"),
  ).toBeVisible();
});

test("il Comune segnala, la redazione rimuove: il testo sparisce e il registro firma", async ({
  page,
}) => {
  const testo = `Recensione da moderare ${Date.now()}`;
  await votaDalQr(page, testo, `e2e-moderazione-${Date.now()}@example.com`);

  // Il Comune CONTESTA dalla scheda: segnala con un motivo, non cancella.
  await cambiaUtente(page, COMUNE);
  await page.goto("/valutazioni/anagrafe");
  const recensione = page.locator("li", { hasText: testo }).first();
  await recensione.getByRole("button", { name: "Segnala alla redazione" }).click();
  await recensione
    .getByLabel("Motivo della segnalazione")
    .fill("Contiene il nome di una dipendente (test).");
  await recensione.getByRole("button", { name: "Segnala", exact: true }).click();
  await expect(recensione.getByText("Segnalata alla redazione")).toBeVisible();

  // La coda della Redazione mostra ciò che i lettori vedono, più il motivo.
  await cambiaUtente(page, MODERATORE);
  await page.goto("/redazione");
  await expect(page.getByText(testo)).toBeVisible();
  await expect(
    page.getByText("Contiene il nome di una dipendente (test)."),
  ).toBeVisible();

  // La rimozione vuole un motivo PUBBLICO: finisce nel registro della scheda.
  await page
    .getByLabel("Motivo pubblico della rimozione")
    .fill("Conteneva dati personali di un terzo.");
  await page
    .getByRole("button", { name: "Rimuovi — azzera il testo, la riga resta" })
    .click();
  // La conferma è la coda che si svuota: `revalidatePath` toglie l'elemento.
  await expect(page.getByText(testo)).toHaveCount(0);
  await expect(page.getByText("nessuna segnalazione del Comune")).toBeVisible();

  // Sulla scheda: il testo non c'è più, la riga del registro sì — firmata.
  await page.goto("/valutazioni/anagrafe");
  await expect(page.getByText(testo)).toHaveCount(0);
  await expect(
    page.getByText("Conteneva dati personali di un terzo."),
  ).toBeVisible();
  await expect(
    page.getByText("Redazione della Dashboard di Pistoia").first(),
  ).toBeVisible();
});

test("il Comune risponde al quadro e alla singola, firmato «Comune di Pistoia»", async ({
  page,
}) => {
  const testo = `Recensione con risposta ${Date.now()}`;
  await votaDalQr(page, testo, `e2e-risposta-${Date.now()}@example.com`);

  await cambiaUtente(page, COMUNE);
  await page.goto("/valutazioni/anagrafe");

  // Al quadro del mese: l'eyebrow porta servizio e periodo, la firma è il
  // nome PUBBLICO dell'account generico — mai il nome interno.
  await page.getByRole("button", { name: /Rispondi al quadro di/ }).click();
  await page
    .getByLabel(/Risposta al quadro di/)
    .fill("Grazie per le valutazioni di questo mese: gli orari dello sportello sono stati estesi.");
  await page.getByRole("button", { name: "Pubblica la risposta" }).click();
  await expect(page.getByText(/Risposta del Comune · quadro di/)).toBeVisible();

  // Alla singola: la risposta compare ANNIDATA sotto la recensione.
  const recensione = page.locator("li", { hasText: testo }).first();
  await recensione.getByRole("button", { name: "Rispondi", exact: true }).click();
  await recensione
    .getByLabel("Testo della risposta")
    .fill("Il disservizio segnalato è stato verificato: la coda di martedì dipendeva da un guasto, risolto.");
  await recensione.getByRole("button", { name: "Pubblica la risposta" }).click();
  await expect(recensione.getByText("Risposta del Comune")).toBeVisible();
  await expect(
    recensione.getByText("Comune di Pistoia").first(),
  ).toBeVisible();
});
