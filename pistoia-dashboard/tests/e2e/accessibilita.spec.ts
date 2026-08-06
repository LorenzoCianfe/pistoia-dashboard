import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { ADMIN, MODERATORE, login } from "./helpers";

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
 * servono le eccezioni. Decisione aperta in `ROADMAP.md`.
 */
const REGOLE = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

/**
 * Le pagine sono scelte per **famiglia di composizione**, non per importanza:
 * una per ciascun impianto visivo, così una regressione di sistema si vede
 * almeno una volta. Aggiungerne una qui costa ~4s per tema.
 */
const PAGINE_ANONIME = [
  { nome: "login", url: "/login" },
  { nome: "valutazioni (barra anonima)", url: "/valutazioni" },
  { nome: "metodologia (documento lungo)", url: "/metodologia" },
];

const PAGINE_AUTENTICATE = [
  { nome: "la mia città (hero + mesh)", url: "/la-mia-citta" },
  { nome: "bilancio (dati e grafici)", url: "/bilancio" },
  { nome: "segnalazioni (lista)", url: "/segnalazioni" },
  { nome: "quartieri (mesh coropletica)", url: "/quartieri" },
  { nome: "pagella (osservatorio)", url: "/pagella" },
];

/**
 * **Le superfici di lavoro dello staff, entrate il 2026-08-06** (Lavoro D §4).
 *
 * Erano fuori, e dichiarate: `login()` entra come cittadino, che su quelle
 * rotte **viene reindirizzato** — `requireAdmin()` non risponde 403, manda a
 * /la-mia-citta con stato 200 — quindi il cancello avrebbe misurato la home
 * col nome della pagina admin. Adesso ognuna entra col proprio ruolo, e la
 * trappola è chiusa da `pretendiAtterraggio()`: se il redirect ci porta
 * altrove il test fallisce invece di analizzare la pagina sbagliata.
 *
 * `/redazione` vuole MODERATORE e non admin, per disegno (R-4): il Comune non
 * modera ciò che lo riguarda.
 */
const PAGINE_STAFF = [
  { nome: "area Comune (admin)", url: "/admin", conto: ADMIN },
  { nome: "codici QR (admin, da stampare)", url: "/admin/codici-qr", conto: ADMIN },
  { nome: "redazione (moderatore)", url: "/redazione", conto: MODERATORE },
];

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

/**
 * **Si misura solo a pagina POSATA, e non è un dettaglio.** L'ingresso di
 * `(app)/template.tsx` parte da `opacity: 0` e dura fino a ~2,2s (`AGENTS.md`
 * §5): axe interrogato prima legge colori a metà transizione e restituisce
 * rapporti impossibili — la prima stesura di questo file dichiarava 1,07:1 nel
 * tema scuro, cioè testo invisibile, su pagine che le schermate mostrano
 * perfettamente leggibili. Numeri plausibili e sbagliati: la categoria di
 * difetti che qui costa di più.
 */
async function posata(page: Page) {
  /*
    Attesa **fissa**, e due strade più furbe scartate perché non funzionavano:

    - *sondare l'opacità di ogni nodo sotto `<main>`* finché non sono fermi:
      su `/bilancio` quel giro costa più dell'analisi di axe, e i due casi
      pesanti morivano per timeout a 90s;
    - *`waitForLoadState("networkidle")`*: sul dev server la connessione di
      HMR tiene la rete occupata, quindi l'attesa non finisce mai — la stessa
      trappola per cui Playwright sconsiglia quello stato.

    Il tetto delle animazioni d'ingresso lo dichiara già `AGENTS.md` §5 —
    ~2,2s — e aspettarlo e basta è deterministico, gratis e leggibile.
  */
  await page.waitForTimeout(2_500);

  /*
    E poi si SCORRE tutta la pagina, come fa `scripts/shots.mjs`.

    Le rivelazioni allo scroll (`[data-motion-reveal]`, la sezione narrata del
    bilancio) partono smorzate e si accendono quando entrano nel viewport. Chi
    misura senza scorrere legge il colore a metà dissolvenza: su `/bilancio`
    axe dichiarava `#b5b5b5` su `#f9f8f7`, cioè 1,93:1, su un testo che a
    schermo è nero. È la trappola di `AGENTS.md` §3 (Fase A, 1) — ciò che
    dipende da IntersectionObserver non si giudica leggendo il DOM fermo.
  */
  await page.evaluate(async () => {
    const passo = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += passo) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  // Tornati in cima, le rivelazioni appena innescate hanno la loro durata:
  // con un'attesa più corta axe leggeva ancora la cifra display a metà
  // dissolvenza (`#b5b5b5` a 36px, cioè 1,93:1 su un numero che è nero).
  await page.waitForTimeout(2_500);
}

async function analizza(page: Page) {
  return new AxeBuilder({ page }).withTags(REGOLE).analyze();
}

/**
 * Pretende di essere ATTERRATI dove si voleva andare.
 *
 * Serve solo alle rotte per ruolo, ma il costo è nullo e la ragione vale
 * ovunque: i guard di questo progetto **reindirizzano**, non rifiutano. Una
 * pagina aperta col ruolo sbagliato risponde 200 con contenuto valido — e un
 * cancello che analizza quel contenuto dichiara accessibile una superficie che
 * non ha mai visto. È la stessa trappola per cui `shots` fotografava la home
 * chiamandola `/admin/codici-qr` (AGENTS.md §4).
 */
async function pretendiAtterraggio(page: Page, url: string) {
  const dove = new URL(page.url()).pathname;
  expect(
    dove,
    `atterrata su ${dove} invece che su ${url}: il ruolo non basta per questa ` +
      `rotta, e analizzare la pagina d'arrivo certificherebbe qualcos'altro`,
  ).toBe(url);
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

    for (const { nome, url, conto } of PAGINE_STAFF) {
      test(`${nome} non ha violazioni WCAG AA`, async ({ page }) => {
        await conTema(page, tema);
        await login(page, conto);
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
  });
}
