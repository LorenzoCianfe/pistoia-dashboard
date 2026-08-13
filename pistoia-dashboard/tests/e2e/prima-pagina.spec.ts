import { execFileSync } from "node:child_process";
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import { CITTADINO, MODERATORE, login, posata, pretendiAtterraggio } from "./helpers";
import {
  ATTI_DEL_GIORNO,
  ATTI_TOTALI,
  OGGETTO_CORTO,
  OGGETTO_CURATO,
  OGGETTO_CURATO_FRAMMENTO,
  SOMMARIO_CURATO,
  TITOLO_CURATO,
} from "./costanti-atti";

/*
  LA PRIMA PAGINA (Ondata 10).

  🔴 **Gli atti li semina e li disfa QUESTO spec**, non `global-setup`. Il primo
  tentativo li seminava per tutta la suite e faceva cadere `analitiche.spec.ts`
  — «il monitor degli atti dice la verità su una base dati mai letta» — che
  esiste proprio perché `e2e.db` nasce vuoto, e quel vuoto è **lo stato della
  produzione**. Le ragioni per esteso in `semina-atti.ts`.

  Ne discende la divisione del lavoro fra i cancelli, che è deliberata:
  - la home **vuota** la misurano i tre cancelli condivisi (`/` è in
    `pagine-cancello.ts`), ed è lo stato che vedrebbe oggi chi aprisse la
    produzione;
  - la home **piena** — apertura curata, monumento, fiume — la misura l'analisi
    axe qui sotto, sui due temi, mentre gli atti ci sono.

  ⚠️ E i test toccano una cosa sola alla volta: quello che toglie la cura la
  rimette, così l'ordine dei casi non conta.
*/

const REGOLE = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

/**
 * La semina gira in un PROCESSO A PARTE, con `tsx`.
 *
 * ⚠️ Non è un giro largo per pigrizia: il client generato da Prisma è
 * TypeScript in forma CommonJS, e il caricatore di Playwright tratta i `.ts`
 * come ESM — importarlo da qui muore su «exports is not defined in ES module
 * scope», con lo stack che punta al file generato e sembra un guasto di Prisma.
 * `tsx` lo carica senza storie, ed è già come `global-setup.ts` lancia il seed.
 *
 * `execFileSync` con gli argomenti in un array: nessuna shell di mezzo, quindi
 * il comando non è una stringa da comporre. (Su Windows `npx` è un `.cmd`, che
 * senza shell non si risolverebbe: da qui `shell: true` — e resta senza
 * superficie di iniezione perché `azione` è un letterale di questo file, non
 * un input.)
 */
function atti(azione: "semina" | "pulisci") {
  execFileSync("npx", ["tsx", "tests/e2e/semina-atti.ts", azione], {
    stdio: "inherit",
    shell: true,
  });
}

test.beforeAll(() => atti("semina"));
test.afterAll(() => atti("pulisci"));

test.describe("la prima pagina, pubblica", () => {
  test("apre col fatto del giorno curato, e porta con sé l'oggetto ufficiale", async ({
    page,
  }) => {
    await page.goto("/");

    /*
      La striscia dei dati: i conteggi vengono dal database, non dalla lista.

      ⚠️ Il selettore guarda **etichetta e numero insieme**. Con la sola
      «In archivio» il test cadeva per *strict mode*: `getByText` cerca
      sottostringhe senza distinguere le maiuscole, e la nota in fondo al fiume
      dice «…sono in archivio: l'elenco completo…». Due elementi, un rosso che
      non parlava di conteggi.
    */
    await expect(
      page.getByText(new RegExp(`In archivio\\s*${ATTI_TOTALI}`, "i")),
    ).toBeVisible();
    // La voce dell'anno c'è, ma il suo NUMERO non si fissa qui: il conteggio è
    // «dal 1º gennaio», quindi in un giro dei primi giorni di gennaio gli atti
    // seminati tre giorni fa cadono nell'anno prima e il totale non combacia.
    // Un test che fallisce una volta l'anno è peggio di uno che afferma meno.
    await expect(page.getByText(/Atti nel \d{4}/i)).toBeVisible();

    // Il titolo umano, scritto dalla redazione.
    await expect(page.getByRole("heading", { name: TITOLO_CURATO })).toBeVisible();
    await expect(page.getByText(SOMMARIO_CURATO)).toBeVisible();

    /*
      🔴 IL DOPPIO TITOLO ONESTO: l'oggetto ufficiale è in pagina **per intero**,
      non riscritto e non troncato (`direzione-prodotto.md` §1.12.1). È il pezzo
      che uno strumento generativo toglie per primo perché «sporca» la
      composizione — ed è esattamente ciò che rende il prodotto credibile.

      ⚠️ `.first()` non è pigrizia: lo stesso atto compare **due volte** — per
      intero nella card e troncato nel fiume, dove `line-clamp` taglia la resa
      ma non il DOM. Il primo è quello della card.
    */
    const oggetto = page.getByText(OGGETTO_CURATO_FRAMMENTO).first();
    await expect(oggetto).toBeVisible();
    expect((await oggetto.textContent())?.trim()).toBe(OGGETTO_CURATO);

    // Il monumento: la cifra, i nomi, e il modo in cui si arriva alla carica.
    await expect(page.getByText("Costo della giunta").first()).toBeVisible();
    await expect(page.getByText("Giovanni Capecchi")).toBeVisible();
    await expect(page.getByText("Stefania Nesi")).toBeVisible();
    await expect(page.getByText("eletto dai cittadini")).toBeVisible();

    // 🔴 Mai il partito: la ragione è misurata in fonti-organigramma §2.2.
    const testo = (await page.locator("main").innerText()).toLowerCase();
    expect(testo).not.toContain("partito democratico");

    // Il fiume, con il numero VERO del giorno accanto a una lista troncata.
    await expect(page.getByRole("heading", { name: "Il giorno in città" })).toBeVisible();
    await expect(
      page.getByText(new RegExp(`${ATTI_DEL_GIORNO} atti pubblicati`)),
    ).toBeVisible();

    // Le tre porte.
    await expect(page.getByRole("link", { name: /Il tuo quartiere/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /La pagella della città/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Segnala un problema/ })).toBeVisible();
  });

  test("è la stessa pagina per chi ha un account: nessun reindirizzamento", async ({
    page,
  }) => {
    /*
      La vecchia landing mandava gli autenticati su `/la-mia-citta`, cioè non
      mostrava niente a chi era già entrato. La direzione l'ha superata
      (§1.6-bis.1): la prima pagina è **pubblica e uguale per tutti**, e
      l'account serve solo per *agire*. Questo test è il guardiano di quella
      decisione — è una riga di codice a rimetterla, e nessun altro cancello
      se ne accorgerebbe.
    */
    await login(page, CITTADINO);
    await page.goto("/");
    await pretendiAtterraggio(page, "/");
    await expect(page.getByRole("heading", { name: TITOLO_CURATO })).toBeVisible();
  });

  for (const tema of ["light", "dark"] as const) {
    test(`la composizione PIENA non ha violazioni WCAG AA · tema ${tema}`, async ({
      page,
    }) => {
      /*
        I tre cancelli condivisi misurano `/` con l'archivio VUOTO, che è lo
        stato della produzione. Qui si misura l'altro — apertura curata,
        monumento, fiume — perché è la composizione che porta quasi tutto il
        contenuto della pagina, e nessun altro cancello la vede mai.

        Stesse regole e stesso stato di `accessibilita.spec.ts`: due temi e
        `prefers-reduced-motion` attiva, che è la resa che vede davvero chi ha
        chiesto meno movimento.
      */
      await page.addInitScript((t) => localStorage.setItem("theme", t), tema);
      await page.emulateMedia({ colorScheme: tema, reducedMotion: "reduce" });
      await page.goto("/");
      await posata(page);

      const esito = await new AxeBuilder({ page }).withTags(REGOLE).analyze();
      expect(
        esito.violations,
        `/ con l'archivio pieno (${tema}):\n` +
          esito.violations
            .map((v) => `  [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} nodi)`)
            .join("\n"),
      ).toEqual([]);
    });
  }
});

test.describe("la cura del fatto del giorno", () => {
  test("senza cura la home NON finge un'apertura: apre col fiume", async ({
    page,
  }) => {
    await login(page, MODERATORE);
    await page.goto("/redazione");
    await pretendiAtterraggio(page, "/redazione");

    // Lo strumento dice che cosa apre la home adesso.
    await expect(page.getByText("In prima pagina adesso")).toBeVisible();
    await expect(page.getByText(TITOLO_CURATO).first()).toBeVisible();

    await page.getByRole("button", { name: "Togli la cura" }).click();
    await expect(page.getByText("Nessun fatto del giorno")).toBeVisible();

    // 🔴 La home apre col fiume, e NON con un'apertura vuota.
    await page.goto("/");
    await expect(page.getByRole("heading", { name: TITOLO_CURATO })).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Il giorno in città" }),
    ).toBeVisible();
    // Il monumento resta: senza cura la home ha comunque due cose da dire.
    await expect(page.getByText("Costo della giunta").first()).toBeVisible();

    // Si rimette com'era: così l'ordine dei casi non conta.
    await page.goto("/redazione");
    await page
      .locator("label", { hasText: OGGETTO_CURATO_FRAMMENTO })
      .getByRole("radio")
      .check();
    await page.getByLabel(/Titolo umano/).fill(TITOLO_CURATO);
    await page.getByLabel(/Didascalia della redazione/).fill(SOMMARIO_CURATO);
    await page.getByRole("button", { name: "Metti in prima pagina" }).click();
    await expect(page.getByText("Fatto del giorno aggiornato")).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("heading", { name: TITOLO_CURATO })).toBeVisible();
  });

  test("rifiuta il titolo che è l'oggetto ufficiale ricopiato", async ({
    page,
  }) => {
    /*
      Il controllo che giustifica l'esistenza del campo: se il titolo umano è
      l'oggetto ricopiato, la barriera che si voleva togliere dalla cima della
      prima pagina è stata rimessa lì a mano. Generare il titolo è vietato,
      quindi l'unica difesa è questa.
    */
    await login(page, MODERATORE);
    await page.goto("/redazione");

    // Un atto dall'oggetto CORTO: con quello lungo il campo lo taglierebbe a
    // 120 caratteri, e il rifiuto arriverebbe dalla lunghezza invece che dalla
    // copiatura — cioè il test passerebbe per la ragione sbagliata.
    await page
      .locator("label", { hasText: OGGETTO_CORTO })
      .getByRole("radio")
      .check();
    await page.getByLabel(/Titolo umano/).fill(OGGETTO_CORTO);
    await page.getByRole("button", { name: "Metti in prima pagina" }).click();

    await expect(page.getByText(/ricopiato/)).toBeVisible();

    // E la prima pagina non è cambiata: il rifiuto non ha salvato niente.
    await page.goto("/");
    await expect(page.getByRole("heading", { name: TITOLO_CURATO })).toBeVisible();
  });
});
