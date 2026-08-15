import { execFileSync } from "node:child_process";
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import { CITTADINO, MODERATORE, login, posata, pretendiAtterraggio } from "./helpers";
import {
  ATTI_DEL_GIORNO,
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
    /*
      🔴 **`DATABASE_URL` ESPLICITO, e senza questa riga il file non passa in CI**
      (trovato il 2026-08-15, alla prima passata in cui gli E2E hanno girato
      davvero dopo tre commit in cui erano stati *saltati*).

      `semina-atti.ts` risolve `process.env.DATABASE_URL ?? "file:./prisma/e2e.db"`.
      In locale nessuno esporta quella variabile, quindi il ripiego è giusto e
      tutto passa. **In CI il workflow la dichiara a livello di job** — punta a
      `dev.db`, che serve a `migrate deploy` e al seed generale — e il processo
      figlio la eredita: gli atti finiscono in `dev.db` mentre il server di
      Playwright legge `e2e.db`, che `playwright.config.ts` gli passa a parte.

      Il sintomo non nomina mai il database: i test cadono su elementi mancanti
      («In prima pagina adesso» assente su `/redazione`), cioè sembrano una
      regressione dell'interfaccia. È lo stesso schema che `global-setup.ts` già
      risolve costruendo un `env` esplicito per i propri figli; qui mancava.
    */
    env: { ...process.env, DATABASE_URL: "file:./prisma/e2e.db" },
  });
}

test.beforeAll(() => atti("semina"));
test.afterAll(() => atti("pulisci"));

test.describe("la prima pagina, pubblica", () => {
  /*
    ⚠️ **RIALLINEATO IL 2026-08-15, e non è una manutenzione: è un cambio di
    CONTRATTO della home.**

    Fra il 13 e il 15 agosto la prima pagina è stata rifatta (`2ecf1ff`,
    `1050938`). Il fatto del giorno **per intero** — didascalia e oggetto
    ufficiale — è migrato su `/atti`, dove `FattoDelGiorno` vive adesso; sulla
    home ne resta il solo titolo curato dentro la tessera «L'atto del giorno»,
    che è un richiamo. Anche il fiume è su `/atti`.

    Le asserzioni sul contenuto migrato **non sono state cancellate**: sono nel
    test «l'atto per intero vive su /atti» qui sotto. Sono invece uscite quelle
    su ciò che il prodotto non promette più — la striscia dei dati col totale
    d'archivio e le tre porte, i cui componenti sono rimasti orfani. Un cancello
    che pretende ciò che il prodotto non promette non protegge niente: blocca.

    🔴 Il difetto vero che questo rosso nascondeva **non era nel prodotto**: la
    home funziona. Era che i quattro test sono rimasti fermi al 13/08 e la CI è
    rossa da allora — quattro commit spinte sopra un cancello bloccante.
  */
  test("apre con la tessera dell'atto del giorno, e coi numeri della giunta", async ({
    page,
  }) => {
    await page.goto("/");

    // La voce dell'anno c'è, ma il suo NUMERO non si fissa qui: il conteggio è
    // «dal 1º gennaio», quindi in un giro dei primi giorni di gennaio gli atti
    // seminati tre giorni fa cadono nell'anno prima e il totale non combacia.
    // Un test che fallisce una volta l'anno è peggio di uno che afferma meno.
    await expect(page.getByText(/Atti nel \d{4}/i)).toBeVisible();

    /*
      L'ATTO DEL GIORNO — la tessera c'è, e porta il titolo scritto dalla
      redazione.

      ⚠️ `getByText` e non `getByRole("heading")` per il titolo curato: nella
      composizione nuova l'intestazione della tessera è la sua ETICHETTA, e il
      titolo è il contenuto (`.tessera__frase`, un `<p>`). Pretenderlo come
      intestazione è ciò che teneva rosso questo test — e il rango giusto per
      quel titolo è una scelta di prodotto, decisa il 2026-08-15: resta un `<p>`,
      perché l'atto con la sua intestazione vive su `/atti`.
    */
    await expect(
      page.getByRole("heading", { name: "L'atto del giorno" }),
    ).toBeVisible();
    await expect(page.getByText(TITOLO_CURATO)).toBeVisible();
    // Il numero VERO del giorno, che viene da un `count` e non dalla lista.
    await expect(
      page.getByText(new RegExp(`${ATTI_DEL_GIORNO} atti pubblicati`)),
    ).toBeVisible();

    // Le due tessere alte: quanto costa la giunta, e chi è il sindaco. Il nome
    // e il modo in cui si arriva alla carica vengono dallo stesso dato.
    await expect(page.getByText("Costo della giunta").first()).toBeVisible();
    await expect(page.getByText("Giovanni Capecchi")).toBeVisible();
    await expect(page.getByText("eletto dai cittadini")).toBeVisible();

    // 🔴 Mai il partito: la ragione è misurata in fonti-organigramma §2.2.
    const testo = (await page.locator("main").innerText()).toLowerCase();
    expect(testo).not.toContain("partito democratico");
  });

  test("l'atto per intero vive su /atti: titolo, didascalia e oggetto ufficiale", async ({
    page,
  }) => {
    /*
      Ciò che la home ha smesso di portare non ha smesso di essere un impegno:
      si è spostato. `/atti` monta `FattoDelGiorno` e `FiumeAtti`, cioè
      esattamente i due componenti usciti dalla prima pagina, e le asserzioni
      che li riguardavano sono queste — trasferite, non riscritte.
    */
    await page.goto("/atti");

    // Qui il titolo curato È un'intestazione: `FattoDelGiorno` lo rende in `<h2>`.
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

    // Il fiume, con il numero VERO del giorno accanto a una lista troncata.
    await expect(
      page.getByRole("heading", { name: "Il giorno in città" }),
    ).toBeVisible();
    await expect(
      page.getByText(new RegExp(`${ATTI_DEL_GIORNO} atti pubblicati`)),
    ).toBeVisible();
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
    // Non basta essere su `/`: la pagina deve aver reso il suo contenuto, non
    // uno scheletro. Il titolo curato è il segno che l'ha fatto.
    await expect(page.getByText(TITOLO_CURATO)).toBeVisible();
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
  test("senza cura la home NON finge un'apertura: la tessera torna al conteggio", async ({
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

    /*
      🔴 Senza cura la home NON mostra un'apertura vuota: la tessera cambia
      mestiere. L'etichetta passa da «L'atto del giorno» a «Il giorno in città»
      e il contenuto diventa il conteggio — un fatto, invece di un buco vestito
      da titolo.

      È la stessa promessa di prima («la home non finge»), misurata sul markup
      di adesso: prima la teneva il fiume, che da `1050938` sta su `/atti`.
    */
    await page.goto("/");
    await expect(page.getByText(TITOLO_CURATO)).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "L'atto del giorno" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Il giorno in città" }),
    ).toBeVisible();
    // Il costo della giunta resta: senza cura la home ha comunque cose da dire.
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
    await expect(page.getByText(TITOLO_CURATO)).toBeVisible();
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
    await expect(page.getByText(TITOLO_CURATO)).toBeVisible();
  });
});
