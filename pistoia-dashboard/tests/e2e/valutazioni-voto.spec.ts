import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { login } from "./helpers";

/*
  Il cancello di R-3: un E2E che vota, RICEVE la mail e revoca.

  «Riceve» è letterale: in sviluppo e nei test ogni email è un file in
  `.email/` (src/lib/email.ts — il percorso è replicato qui alla lettera
  perché `server-only` impedisce l'import). Il test legge la cassetta, trova
  il messaggio per il SUO destinatario ed estrae il link di conferma, come
  farebbe una persona nella propria posta. `global-setup.ts` svuota la
  cassetta a ogni esecuzione, così nessun test pesca la mail di ieri.
*/

const CASSETTA = path.resolve(process.cwd(), ".email");

type Mail = { to: string; subject: string; text: string; sentAt: string };

function mailPer(destinatario: string): Mail | null {
  if (!fs.existsSync(CASSETTA)) return null;
  const messaggi = fs
    .readdirSync(CASSETTA)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(CASSETTA, f), "utf8")) as Mail)
    .filter((m) => m.to === destinatario)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  return messaggi.at(-1) ?? null;
}

function linkConferma(mail: Mail): string {
  const m = mail.text.match(/https?:\/\/\S+\/v\/conferma\/\S+/);
  if (!m) throw new Error(`Nessun link di conferma nella mail:\n${mail.text}`);
  return m[0];
}

async function vota(
  page: Page,
  codice: string,
  opts: { stelle: number; email: string; testo?: string; nome?: string },
) {
  await page.goto(`/v/${codice}`);
  // I radio delle stelle sono `sr-only` (la resa è l'icona nella label):
  // `force` salta il check di visibilità, la semantica resta quella vera.
  await page
    .getByRole("radio", { name: new RegExp(`^${opts.stelle} stell`) })
    .check({ force: true });
  if (opts.testo) {
    await page
      .getByLabel(/Racconta com'è andata|Vuoi aggiungere due righe/)
      .fill(opts.testo);
  }
  if (opts.nome) {
    await page.getByLabel("Come vuoi comparire (facoltativo)").fill(opts.nome);
  }
  await page.getByLabel("La tua email").fill(opts.email);
  await page.getByRole("button", { name: "Invia il voto" }).click();
}

test("vota dal QR, riceve la mail e revoca: «non sono stato io»", async ({
  page,
}) => {
  const email = `e2e-revoca-${Date.now()}@example.com`;

  await vota(page, "pt-anagrafe-01", { stelle: 4, email });
  await expect(page.getByText("Il tuo voto è nel conteggio.")).toBeVisible();

  // La mail è un file: aspettiamo che compaia nella cassetta.
  await expect.poll(() => mailPer(email), { timeout: 5_000 }).not.toBeNull();
  const mail = mailPer(email)!;
  expect(mail.subject).toContain("Anagrafe");

  // L'atterraggio mostra la valutazione: «non sono stato io» si dice sapendo
  // di cosa si parla.
  await page.goto(linkConferma(mail));
  await expect(
    page.getByRole("heading", { name: "È tua questa valutazione?" }),
  ).toBeVisible();
  await expect(page.getByText("Anagrafe", { exact: true })).toBeVisible();
  await expect(page.getByText("Sportello anagrafe · Palazzo comunale")).toBeVisible();

  await page.getByRole("button", { name: "Non sono stato io: rimuovi" }).click();
  await expect(
    page.getByRole("heading", { name: "Valutazione rimossa" }),
  ).toBeVisible();

  // Il token è morto con la riga: riaprire il link non riporta niente in vita.
  await page.goto(linkConferma(mail));
  await expect(
    page.getByRole("heading", { name: "Questo link non è più valido" }),
  ).toBeVisible();
});

test("conferma dal link, e la scheda dichiara la composizione", async ({
  page,
}) => {
  const email = `e2e-conferma-${Date.now()}@example.com`;

  await vota(page, "pt-verde-01", {
    stelle: 5,
    email,
    testo: "Prato tagliato e giochi in ordine.",
    nome: "Vera Verdicchio",
  });
  await expect(page.getByText("Il tuo voto è nel conteggio.")).toBeVisible();

  await expect.poll(() => mailPer(email), { timeout: 5_000 }).not.toBeNull();
  await page.goto(linkConferma(mailPer(email)!));
  await page.getByRole("button", { name: "Sì, sono stato io" }).click();
  await expect(page.getByText(/Confermata/)).toBeVisible();

  // Sulla scheda (dietro accesso): il voto conta, la conferma è dichiarata
  // nella composizione, il nome compare abbreviato — «Marco B.» per tutti.
  await login(page);
  await page.goto("/valutazioni/verde");
  await expect(page.getByText("da email confermata").first()).toBeVisible();
  await expect(page.getByText("Vera V.")).toBeVisible();
  await expect(page.getByText("Prato tagliato e giochi in ordine.")).toBeVisible();
});

test("una condizione si vota una volta al mese per indirizzo", async ({
  page,
}) => {
  const email = `e2e-mensile-${Date.now()}@example.com`;

  await vota(page, "pt-verde-01", { stelle: 3, email });
  await expect(page.getByText("Il tuo voto è nel conteggio.")).toBeVisible();

  await vota(page, "pt-verde-01", { stelle: 4, email });
  await expect(page.getByText(/hai già valutato .* questo mese/)).toBeVisible();
});
