/**
 * Cancello dell'inventario: ogni rotta risponde e rende contenuto?
 *
 * Nasce da una domanda diretta — «abbiamo perso funzionalità?» — a cui non si
 * poteva rispondere con una prova. Il cancello di uscita della Fase A ha «le 26
 * rotte rispondono ancora 200» come voce da spuntare a mano, e una voce a mano
 * non è una garanzia: nessuno la rispunta a ogni modifica.
 *
 * Perché serve accanto a `shots`, che pure apre delle pagine: `shots` copre 27
 * rotte su 43, e a quelle di dettaglio arriva *cliccando* dalla lista, mai
 * digitando l'indirizzo. Una rotta annidata irraggiungibile per URL — da un
 * link condiviso, da un segnalibro, da un semplice F5 — resta invisibile.
 *
 * Il 2026-07-29 il dev server ha risposto 404 su **tutte** le rotte annidate —
 * `/comunita/stanze` e i quattro dettagli — mentre le 38 a un solo segmento
 * stavano bene. Era `.next` stantio (AGENTS.md §3), non il codice, e si
 * ripresenta a ogni ciclo di modifiche. Il sintomo è indistinguibile da
 * «abbiamo cancellato metà applicazione» finché qualcuno non apre quelle rotte
 * una per una: questo script le apre tutte.
 *
 * Nota: gli E2E **non** sono immuni. `playwright.config.ts` avvia `npm run dev`
 * sulla 3939 — processo diverso, stessa cartella `.next` — quindi possono
 * fallire su tre test annidati senza che nulla sia rotto.
 *
 * Uso:
 *   npm run dev      # in un altro terminale
 *   npm run rotte
 */
import { chromium } from "@playwright/test";

const BASE = process.env.ROTTE_BASE_URL ?? "http://localhost:3000";

/**
 * Le rotte a percorso fisso. Quelle dinamiche si scoprono a runtime dalle
 * liste, perché gli id vengono dal seed e cambiano a ogni `db:reset`.
 */
const ROTTE = [
  "/", "/login", "/registrati",
  "/la-mia-citta",
  "/partecipa", "/segnalazioni", "/proposte", "/sondaggi", "/priorita",
  "/question-time", "/volontariato", "/patti", "/progetti",
  "/trasparenza", "/bilancio", "/opere", "/decisioni", "/promesse", "/digest",
  // Fase C: rotta ANNIDATA, quindi la prima a cadere quando `.next` è stantio.
  "/trasparenza/costo-amministrazione",
  "/territorio", "/mappa", "/quartieri", "/eventi",
  "/comunita", "/comunita/stanze",
  // Fase C, bozza in revisione: ospita la dichiarazione di chi pubblica.
  "/pagella",
  // Fase C, «Valutazioni dei servizi». La seconda è ANNIDATA, quindi fra le
  // prime a cadere quando `.next` è stantio.
  "/valutazioni", "/valutazioni/pulizia",
  // R-6: la metodologia — le regole pubblicate, col timbro di versione.
  "/metodologia",
  // R-3: la pagina del QR (pubblica, gruppo (voto)) aperta col codice
  // deterministico del seed, e l'atterraggio della mail con un token
  // inventato: deve rispondere con la pagina cortese «link non più valido»,
  // non con un errore. I percorsi con un token vero li prova l'E2E.
  "/v/pt-anagrafe-01", "/v/conferma/link-non-valido",
  // R-5: l'atterraggio del promemoria mensile, con token inventato — deve
  // rispondere con la pagina cortese, non con un errore (come /v/conferma).
  "/v/promemoria/link-non-valido",
  // R-3: il foglio dei QR da stampare, ANNIDATA sotto /admin.
  "/admin/codici-qr",
  // O7: le sei superfici in cui `/admin` è stata spezzata il 2026-08-07
  // (`docs/piano-admin.md`). Tutte ANNIDATE, quindi fra le prime a cadere
  // quando `.next` è stantio — che è esattamente ciò che questo script trova.
  "/admin/valutazioni", "/admin/proposte", "/admin/domande",
  "/admin/segnalazioni", "/admin/cittadini", "/admin/pubblica",
  "/avvisi", "/organigramma", "/faq", "/glossario",
  "/notifiche", "/profilo", "/impostazioni",
  "/admin",
  "/privacy", "/cookie", "/note-comunita",
  "/design-system",
  // Redirect storico: deve continuare a portare a /volontariato (A-5.3).
  "/iniziative",
];

/**
 * Rotte che vogliono il ruolo MODERATORE — cioè la Redazione (R-4).
 *
 * NON stanno in `ROTTE`: la passata principale entra da ADMIN, che qui è il
 * super-account del COMUNE, e `/redazione` lo respinge per disegno (il Comune
 * non modera ciò che lo riguarda). Aperta da admin risponderebbe 200 sulla
 * home dopo il redirect — un cancello che certifica una pagina mai vista, la
 * stessa trappola di shots su /admin (AGENTS.md §4). Per queste rotte si fa
 * una seconda passata con l'account moderatore, e si pretende anche
 * l'ATTERRAGGIO sull'indirizzo chiesto, non solo un 200 con un <h1>.
 */
const ROTTE_MODERATORE = ["/redazione"];

/**
 * Rotte a LETTURA PUBBLICA (R-5, decisione W1 del 2026-08-04): si aprono
 * SENZA alcun accesso. Anche qui il controllo pretende l'ATTERRAGGIO
 * sull'indirizzo chiesto: se il proxy o il layout rimandassero al login, la
 * risposta sarebbe comunque un 200 con un <h1> — e il cancello certificherebbe
 * un'apertura mai avvenuta, la stessa trappola della passata moderatore.
 */
const ROTTE_ANONIME = ["/valutazioni", "/valutazioni/pulizia", "/metodologia"];

/** Liste da cui pescare un indirizzo di dettaglio vero. */
const DETTAGLI = [
  ["/segnalazioni", "[data-report-card] a"],
  ["/opere", "[data-opera-card] a"],
  ["/proposte", "[data-proposta-card] a"],
  ["/quartieri", "[data-quartiere-card] a"],
  ["/comunita/stanze", 'a[href^="/comunita/stanze/"]'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ locale: "it-IT" });
const page = await ctx.newPage();

// Si entra come ADMIN: è l'unico ruolo che vede anche /admin, quindi una sola
// passata copre l'inventario intero invece di due.
await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill('input[name="email"]', process.env.ROTTE_EMAIL ?? "comune@pistoia.it");
await page.fill('input[name="password"]', process.env.ROTTE_PASSWORD ?? "Comune2026!");
await Promise.all([
  page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30_000 }),
  page.click('button[type="submit"]'),
]).catch(() => {});
if (new URL(page.url()).pathname.includes("/login")) {
  console.error(
    "✗ accesso non riuscito: senza sessione ogni rotta protetta rimanderebbe " +
      "al login e questa esecuzione non proverebbe nulla.",
  );
  await browser.close();
  process.exit(1);
}

const dinamiche = [];
for (const [lista, sel] of DETTAGLI) {
  await page.goto(`${BASE}${lista}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  const href = await page
    .locator(sel)
    .first()
    .getAttribute("href")
    .catch(() => null);
  if (href) dinamiche.push(href);
  else console.warn(`  ⚠ nessun dettaglio trovato da ${lista}`);
}

let rotti = 0;
for (const url of [...ROTTE, ...dinamiche]) {
  try {
    const r = await page.goto(`${BASE}${url}`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    await page.waitForLoadState("networkidle").catch(() => {});
    const status = r?.status() ?? 0;
    const finale = new URL(page.url()).pathname;
    const titoli = await page.locator("h1").count();
    /*
      Un 200 non basta, e nemmeno la presenza di un <h1>.

      Una pagina finita sull'error boundary risponde 200 con un messaggio
      d'errore, e la pagina `not-found` di Next un <h1> ce l'ha comunque: senza
      questo terzo controllo il cancello direbbe "tutto a posto" sopra mezza
      applicazione irraggiungibile. È la stessa famiglia dei difetti di
      AGENTS.md §3 — quelli che non producono nessun errore.
    */
    const testo = await page.locator("body").innerText();
    const erroreInPagina =
      /Pagina non trovata|Qualcosa è andato storto|Application error|Unhandled Runtime Error/i.test(
        testo,
      );

    const ok = status < 400 && titoli > 0 && !erroreInPagina;
    if (!ok) rotti += 1;
    const nota = erroreInPagina
      ? "  ← errore reso in pagina"
      : finale !== url
        ? `  → ${finale}`
        : "";
    console.log(`${ok ? "  ok " : "  ✗  "} ${String(status).padEnd(4)} ${url}${nota}`);
  } catch (e) {
    rotti += 1;
    console.log(`  ✗   ---  ${url}  ${e.message.split("\n")[0]}`);
  }
}

// Seconda passata: le rotte della Redazione, con l'account moderatore.
const ctxMod = await browser.newContext({ locale: "it-IT" });
const pageMod = await ctxMod.newPage();
await pageMod.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await pageMod.fill('input[name="email"]', process.env.ROTTE_MOD_EMAIL ?? "moderatore@pistoia.it");
await pageMod.fill('input[name="password"]', process.env.ROTTE_MOD_PASSWORD ?? "Pistoia2026");
await Promise.all([
  pageMod.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30_000 }),
  pageMod.click('button[type="submit"]'),
]).catch(() => {});
if (new URL(pageMod.url()).pathname.includes("/login")) {
  console.error("✗ accesso moderatore non riuscito: le rotte della redazione non sono verificabili.");
  rotti += ROTTE_MODERATORE.length;
} else {
  for (const url of ROTTE_MODERATORE) {
    try {
      const r = await pageMod.goto(`${BASE}${url}`, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      await pageMod.waitForLoadState("networkidle").catch(() => {});
      const status = r?.status() ?? 0;
      const finale = new URL(pageMod.url()).pathname;
      const titoli = await pageMod.locator("h1").count();
      const testo = await pageMod.locator("body").innerText();
      const erroreInPagina =
        /Pagina non trovata|Qualcosa è andato storto|Application error|Unhandled Runtime Error/i.test(
          testo,
        );
      // Qui `finale === url` è parte del cancello: un redirect silenzioso
      // verso la home passerebbe tutti gli altri controlli.
      const ok = status < 400 && titoli > 0 && !erroreInPagina && finale === url;
      if (!ok) rotti += 1;
      const nota = erroreInPagina
        ? "  ← errore reso in pagina"
        : finale !== url
          ? `  → ${finale} (atterraggio mancato)`
          : "";
      console.log(`${ok ? "  ok " : "  ✗  "} ${String(status).padEnd(4)} ${url}${nota}  [moderatore]`);
    } catch (e) {
      rotti += 1;
      console.log(`  ✗   ---  ${url}  ${e.message.split("\n")[0]}`);
    }
  }
}
await ctxMod.close();

// Terza passata: le rotte pubbliche, SENZA login — un contesto vergine.
const ctxAnon = await browser.newContext({ locale: "it-IT" });
const pageAnon = await ctxAnon.newPage();
for (const url of ROTTE_ANONIME) {
  try {
    const r = await pageAnon.goto(`${BASE}${url}`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    await pageAnon.waitForLoadState("networkidle").catch(() => {});
    const status = r?.status() ?? 0;
    const finale = new URL(pageAnon.url()).pathname;
    const titoli = await pageAnon.locator("h1").count();
    const testo = await pageAnon.locator("body").innerText();
    const erroreInPagina =
      /Pagina non trovata|Qualcosa è andato storto|Application error|Unhandled Runtime Error/i.test(
        testo,
      );
    // `finale === url` è parte del cancello: un redirect al login passerebbe
    // tutti gli altri controlli e la "lettura pubblica" resterebbe sulla carta.
    const ok = status < 400 && titoli > 0 && !erroreInPagina && finale === url;
    if (!ok) rotti += 1;
    const nota = erroreInPagina
      ? "  ← errore reso in pagina"
      : finale !== url
        ? `  → ${finale} (atterraggio mancato)`
        : "";
    console.log(`${ok ? "  ok " : "  ✗  "} ${String(status).padEnd(4)} ${url}${nota}  [anonimo]`);
  } catch (e) {
    rotti += 1;
    console.log(`  ✗   ---  ${url}  ${e.message.split("\n")[0]}`);
  }
}
await ctxAnon.close();

await browser.close();
const totale =
  ROTTE.length + dinamiche.length + ROTTE_MODERATORE.length + ROTTE_ANONIME.length;
console.log(`\n${totale} rotte controllate, ${rotti} con problemi.`);
if (rotti > 0) {
  console.error(
    `\n✗ ${rotti} rotte non rispondono o rendono un errore. Se sono tutte ` +
      `annidate, prima di cercare nel codice cancella .next e riavvia ` +
      `(AGENTS.md §4): il sintomo somiglia a una funzionalità persa e quasi ` +
      `mai lo è.`,
  );
  process.exitCode = 1;
}
