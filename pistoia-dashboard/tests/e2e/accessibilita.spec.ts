import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { apriDettaglio, login, posata, pretendiAtterraggio } from "./helpers";
import { PAGINE_ANONIME, PAGINE_AUTENTICATE, PAGINE_STAFF } from "./pagine-cancello";

/*
  Cancello di accessibilità automatico (traccia «Qualità continua», ROADMAP).

  Perché esiste: `DESIGN.md` §11 mette l'accessibilità fra i **vincoli**, non
  fra le preferenze, e `AGENTS.md` §2 dice che non si regredisce. Finora i
  contrasti erano stati misurati **a mano**, una volta, sull'ondata 6: una
  misura a mano non difende dalla regressione di domani.

  Che cosa NON fa: axe non sostituisce la prova a occhio né quella da tastiera.
  Copre ~30–40% delle barriere reali — le meccaniche (ruoli, nomi accessibili,
  contrasto calcolato, ordine dei titoli). Il resto resta nella lista di §5.

  I due temi ci sono entrambi perché **metà delle regole di axe dipendono dal
  colore calcolato**: un contrasto giusto nel tema chiaro può essere sbagliato
  in quello scuro, ed è il difetto che `DESIGN.md` §10 dice di non scoprire mai
  «poi» — ogni componente nasce nei due temi insieme.
*/

/*
  Questi test durano più dei 30s di default, e non per lentezza dell'app:
  ogni caso fa accesso, aspetta che la pagina si posi (~2,2s di ingresso) e poi
  fa attraversare ad axe l'intero albero — su `/bilancio`, che porta quattro
  grafici, la sola analisi supera i 20s. Col tetto di default quei due casi
  fallivano per **timeout**, cioè con un rosso che non parla di accessibilità.
*/
test.describe.configure({ timeout: 90_000 });

/**
 * Le regole che DESIGN.md §11 dichiara vincolanti: AA, non AAA.
 *
 * **`wcag22a`/`wcag22aa` aggiunti il 2026-08-06**, dopo averli misurati e non
 * prima: su tutte e otto le pagine, nei due temi, escono **zero violazioni**,
 * e `target-size` non è inattivo — passa su **345 nodi**. Il costo di tenerli
 * è nullo, il guadagno è che la prossima regressione 2.2 diventa rossa.
 *
 * ⚠️ **Ma questo non è il cancello dei 44px, e non va scambiato per tale.**
 * `DESIGN.md` §11.6 chiede bersagli da ≥44px; WCAG 2.5.8 si accontenta di 24
 * **e ha quattro eccezioni** (spaziatura, inline, equivalente, essenziale).
 * I link del footer erano alti **16px** e sarebbero passati lo stesso, perché
 * ben spaziati: il difetto trovato il 2026-08-05 l'ha visto una misura a mano,
 * non axe, e non lo vedrebbe nemmeno adesso. Misurando gli elementi
 * interattivi con un metro crudo (nessuna eccezione applicata) ne escono
 * **246** sotto i 44px sulle stesse otto pagine — quasi tutti legittimi:
 * link dentro la prosa, che a 44px spaccherebbero il testo. La regola §11.6
 * come è scritta oggi **non è trasformabile in un cancello**: prima le
 * servono le eccezioni.
 *
 * **Chiuso il 2026-08-07**: le eccezioni ci sono, e il cancello dei 44px è
 * `bersagli.spec.ts`. Questa nota resta perché la distinzione vale ancora —
 * `target-size` qui dentro difende i 24, non i 44.
 */
const REGOLE = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

/**
 * next-themes legge da `localStorage`, e va impostato PRIMA della navigazione:
 * dopo, la pagina è già dipinta col tema di default e axe misurerebbe i colori
 * sbagliati. Stessa tecnica di `scripts/shots.mjs`.
 */
async function conTema(page: Page, tema: "light" | "dark") {
  await page.addInitScript((t) => {
    localStorage.setItem("theme", t);
  }, tema);
  /*
    `reducedMotion: reduce` non è un dettaglio di comodo: è **lo stato che si
    deve misurare**.

    `DESIGN.md` §11.8 dice che nessun contenuto può restare invisibile perché
    un'animazione non è partita, e §8 che con `prefers-reduced-motion` la
    sezione narrata dallo scroll diventa statica **con tutti i passaggi
    visibili**. Senza questa riga axe legge i passaggi ancora smorzati — sono
    legati alla ScrollTimeline, quindi tornano scuri appena si risale — e
    dichiara 1,49:1 su testo che a schermo è nero.

    In più è la resa che vede davvero chi ha attivato la riduzione del moto:
    misurarla è più utile che misurare quella animata.
  */
  await page.emulateMedia({ colorScheme: tema, reducedMotion: "reduce" });
}

/** Rende leggibile il fallimento: senza questo il messaggio è un oggetto axe. */
function raccontaViolazioni(
  violazioni: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
): string {
  return violazioni
    .map((v) => {
      const dove = v.nodes
        .slice(0, 3)
        .map((n) => `        ${n.target.join(" ")}`)
        .join("\n");
      const altri =
        v.nodes.length > 3 ? `\n        …e altri ${v.nodes.length - 3}` : "";
      return `  [${v.impact}] ${v.id} — ${v.help}\n${dove}${altri}\n        ${v.helpUrl}`;
    })
    .join("\n\n");
}

async function analizza(page: Page) {
  return new AxeBuilder({ page }).withTags(REGOLE).analyze();
}

for (const tema of ["light", "dark"] as const) {
  test.describe(`accessibilità · tema ${tema}`, () => {
    for (const { nome, url } of PAGINE_ANONIME) {
      test(`${nome} non ha violazioni WCAG AA`, async ({ page }) => {
        await conTema(page, tema);
        await page.goto(url);
        await posata(page);
        const esito = await analizza(page);
        expect(
          esito.violations,
          `${url} (${tema}):\n${raccontaViolazioni(esito.violations)}`,
        ).toEqual([]);
      });
    }

    for (const { nome, url } of PAGINE_AUTENTICATE) {
      test(`${nome} non ha violazioni WCAG AA`, async ({ page }) => {
        await conTema(page, tema);
        await login(page);
        await page.goto(url);
        await pretendiAtterraggio(page, url);
        await posata(page);
        const esito = await analizza(page);
        expect(
          esito.violations,
          `${url} (${tema}):\n${raccontaViolazioni(esito.violations)}`,
        ).toEqual([]);
      });
    }

    for (const { nome, url, conto, apriPrima } of PAGINE_STAFF) {
      test(`${nome} non ha violazioni WCAG AA`, async ({ page }) => {
        await conTema(page, tema);
        await login(page, conto);
        await page.goto(url);
        await pretendiAtterraggio(page, url);
        // Le rotte di dettaglio non hanno un indirizzo fisso: ci si arriva
        // cliccando la prima riga della lista (`pagine-cancello.ts`).
        if (apriPrima) await apriDettaglio(page, apriPrima);
        await posata(page);
        const esito = await analizza(page);
        expect(
          esito.violations,
          `${url} (${tema}):\n${raccontaViolazioni(esito.violations)}`,
        ).toEqual([]);
      });
    }
  });
}
