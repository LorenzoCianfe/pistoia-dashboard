/**
 * Cattura schermate delle pagine chiave, in tema chiaro e scuro.
 *
 * Serve alla revisione visiva di fine ondata (ROADMAP.md): ogni ondata si
 * chiude guardando le pagine, non solo facendo passare i test.
 *
 * Uso:
 *   npm run dev            # in un altro terminale
 *   npm run shots          # → screenshots/wave/
 *   npm run shots -- --out=/tmp/x --only=bilancio,opere
 *   npm run shots -- --simple --width=360   # modalità semplice, viewport minima
 *
 * `--simple` attiva la modalità semplice (`html.simple-mode`, scala 115%), che
 * `AGENTS.md` §5 elenca fra le condizioni perché una modifica sia "fatta".
 * Finché la verifica si faceva a mano con script usa-e-getta non era
 * ripetibile, ed è così che a 360px è passato inosservato un traboccamento
 * orizzontale di 139px sul bilancio.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.SHOTS_BASE_URL ?? "http://localhost:3000";
const arg = (n, d) =>
  process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1] ?? d;
const flag = (n) => process.argv.includes(`--${n}`);

const SIMPLE = flag("simple");
const OUT = arg("out", SIMPLE ? "screenshots/wave-semplice" : "screenshots/wave");
const ONLY = arg("only", "")
  .split(",")
  .filter(Boolean);

/** Ripristinato dopo ogni scatto: durante la cattura il viewport si allarga. */
const VIEWPORT = { width: Number(arg("width", 1440)), height: 1000 };

/** Cookie della modalità semplice — deve restare allineato a `lib/ui-prefs.ts`. */
const SIMPLE_COOKIE = "pst-simple";

/** Pagine che scorrono di lato. Fa uscire lo script con codice 1. */
let problemi = 0;
/** Pagine che non si sono nemmeno aperte: non verificate, quindi non promosse. */
let falliti = 0;
/**
 * Pagine saltate perché l'accesso non è riuscito.
 *
 * Stessa famiglia del difetto di `falliti` (AGENTS.md §3, ondata 7, trappola 4),
 * ma da un'altra porta: lì la cattura falliva, qui non viene nemmeno tentata.
 * Quando `login()` non va a buon fine — server ancora in compilazione,
 * rate-limit, credenziali cambiate — TUTTE le pagine autenticate finiscono qui
 * e lo script usciva **0**, cioè dichiarava verde una revisione visiva in cui
 * aveva fotografato il solo `/login`. Visto succedere il 2026-07-26.
 */
let saltati = 0;

/** Pagine sotto revisione. `auth: false` = raggiungibile da disconnessi. */
const PAGES = [
  { name: "login", url: "/login", auth: false },
  { name: "la-mia-citta", url: "/la-mia-citta" },
  // Le tre pagine-contenitore (Fase A): sono il primo livello della
  // navigazione, quindi vanno riviste a ogni ondata come le pagine di punta.
  { name: "partecipa", url: "/partecipa" },
  { name: "trasparenza", url: "/trasparenza" },
  { name: "territorio", url: "/territorio" },
  { name: "bilancio", url: "/bilancio" },
  { name: "segnalazioni", url: "/segnalazioni" },
  // Il dettaglio non ha un URL fisso: si arriva cliccando la prima card, che è
  // anche l'unico modo di esercitare la transizione a elemento condiviso.
  {
    name: "segnalazione-dettaglio",
    url: "/segnalazioni",
    apriPrima: "[data-report-card] a",
    attendiUrl: /\/segnalazioni\/[^/]+$/,
  },
  { name: "opere", url: "/opere" },
  {
    name: "opera-dettaglio",
    url: "/opere",
    apriPrima: "[data-opera-card] a",
    attendiUrl: /\/opere\/[^/]+$/,
  },
  { name: "proposte", url: "/proposte" },
  {
    name: "proposta-dettaglio",
    url: "/proposte",
    apriPrima: "[data-proposta-card] a",
    attendiUrl: /\/proposte\/[^/]+$/,
  },
  { name: "quartieri", url: "/quartieri" },
  {
    name: "quartiere-dettaglio",
    url: "/quartieri",
    apriPrima: "[data-quartiere-card] a",
    attendiUrl: /\/quartieri\/[^/]+$/,
  },
  { name: "comunita", url: "/comunita" },
  // Fase B, primo scaglione: le rotte che gli hub mettono in vetrina e che
  // fino a qui avevano solo ereditato i token. Entrano nella lista **insieme
  // alla modifica**, non dopo: il cancello del traboccamento orizzontale
  // misura solo le pagine che apre, quindi una rotta ridisegnata e non elencata
  // qui risulterebbe "verificata" senza essere mai stata aperta (AGENTS.md §3,
  // ondata 7, trappola 4).
  { name: "promesse", url: "/promesse" },
  // R-5: il report del mese guadagna il blocco delle Valutazioni (forma C1) —
  // entra qui INSIEME alla modifica, come da regola dell'ondata 7: una pagina
  // ridisegnata e non elencata risulterebbe verificata senza mai essere aperta.
  { name: "digest", url: "/digest" },
  { name: "decisioni", url: "/decisioni" },
  { name: "question-time", url: "/question-time" },
  { name: "priorita", url: "/priorita" },
  { name: "patti", url: "/patti" },
  { name: "volontariato", url: "/volontariato" },
  { name: "progetti", url: "/progetti" },
  { name: "eventi", url: "/eventi" },
  // Fase B, secondo scaglione: `UTILITY_NAV` per intero. Il criterio non è più
  // la vetrina degli hub — quella è esaurita — ma il punto d'ingresso: /avvisi
  // arriva dal banner in home, /organigramma da "Cosa vuoi fare?", le altre due
  // dall'elenco di servizio. Prese tutte e quattro insieme perché chiudono un
  // livello intero, come il primo scaglione aveva chiuso gli hub.
  { name: "avvisi", url: "/avvisi" },
  { name: "organigramma", url: "/organigramma" },
  // Fase C. Vanno fotografate ENTRAMBE: la panoramica e una scheda, perché la
  // scheda è l'unica che porta l'andamento e il registro delle rimozioni, e
  // perché a zero valutazioni le due pagine dicono cose diverse.
  { name: "valutazioni", url: "/valutazioni" },
  { name: "valutazione-servizio", url: "/valutazioni/pulizia" },
  // R-5, decisione W1: le stesse due pagine cambiano STATO con la sessione
  // (barra anonima, modulo degradato a invito). Una sola foto ne
  // certificherebbe metà: si fotografano in tutti e due i regimi.
  { name: "valutazioni-anonima", url: "/valutazioni", auth: false },
  { name: "valutazione-servizio-anonima", url: "/valutazioni/pulizia", auth: false },
  // R-6: la metodologia, nei due regimi come le schede che la citano.
  { name: "metodologia", url: "/metodologia" },
  { name: "metodologia-anonima", url: "/metodologia", auth: false },
  // R-3: la pagina del QR, pubblica e senza navigazione, aperta col codice
  // deterministico del seed; e l'atterraggio della mail nello stato «link non
  // più valido» — l'unico fotografabile senza un token vero. Gli stati con un
  // token vivo li copre l'E2E, che vota davvero e legge la mail dal file.
  { name: "voto-qr", url: "/v/pt-anagrafe-01" },
  { name: "valutazione-conferma", url: "/v/conferma/link-non-valido" },
  // R-5: l'atterraggio del promemoria mensile, nello stato «link non più
  // valido» — l'unico fotografabile senza un token vero, come la conferma.
  { name: "promemoria-stop", url: "/v/promemoria/link-non-valido" },
  /*
    LE SUPERFICI DELLO STAFF, entrate il 2026-08-06 (Lavoro D §4).

    Fino a ieri erano **esclusioni dichiarate**: questo script accedeva solo da
    cittadino, e `requireAdmin()` reindirizza a /la-mia-citta — la "schermata"
    prodotta sarebbe stata la home spacciata per il foglio dei QR, cioè un
    cancello che certifica una pagina mai vista (visto accadere il 2026-08-03).
    Il debito visivo lì cresceva a ogni giro, perché nessuno le guardava mai.

    Adesso lo script sa fare i passaggi di ruolo (vedi `RUOLI` più sotto), e la
    trappola è chiusa da un controllo esplicito: **si pretende l'ATTERRAGGIO**
    sull'indirizzo chiesto. Se un redirect ci porta altrove la cattura è un
    fallimento, non una foto — la stessa regola che `rotte.mjs` applica alle
    sue passate per ruolo.

    `/redazione` vuole MODERATORE e non admin, per disegno: il Comune non
    modera ciò che lo riguarda (R-4).
  */
  { name: "admin", url: "/admin", ruolo: "admin" },
  { name: "admin-codici-qr", url: "/admin/codici-qr", ruolo: "admin" },
  { name: "redazione", url: "/redazione", ruolo: "moderatore" },
  { name: "faq", url: "/faq" },
  { name: "glossario", url: "/glossario" },
  // Fase B, terzo scaglione: tutto il resto. Il criterio del punto d'ingresso
  // era esaurito e non ne serve un quarto — si finiscono.
  { name: "profilo", url: "/profilo" },
  { name: "impostazioni", url: "/impostazioni" },
  { name: "notifiche", url: "/notifiche" },
  { name: "sondaggi", url: "/sondaggi" },
  { name: "stanze", url: "/comunita/stanze" },
  {
    name: "stanza-dettaglio",
    url: "/comunita/stanze",
    apriPrima: 'a[href^="/comunita/stanze/"]',
    attendiUrl: /\/comunita\/stanze\/[^/]+$/,
  },
  // Fase C: la prima pagina di giudizio, e la sola che porta la dichiarazione
  // di chi pubblica. Il filo della dichiarazione è `sticky`, quindi qui la
  // schermata a piena pagina prova solo che c'è — che resti agganciato durante
  // lo scorrimento è una misura che va fatta a viewport fisso.
  { name: "pagella", url: "/pagella" },
  // Fase C: «Il costo dell'amministrazione». Sta sotto lo stemma SENZA la
  // dichiarazione di chi pubblica, perché non esprime un giudizio — sono cifre
  // che la legge impone di rendere pubbliche. Entra qui insieme alla modifica
  // e non dopo: la cifra display è a 88px su un numero di sette caratteri, ed è
  // esattamente il genere di riga che trabocca a 360px senza dare errore.
  { name: "costo-amministrazione", url: "/trasparenza/costo-amministrazione" },
  // Le tre legali sono anonime: stanno fuori dal layout autenticato e non
  // richiedono sessione, quindi vanno marcate o il primo passaggio le salta.
  { name: "privacy", url: "/privacy", auth: false },
  { name: "cookie", url: "/cookie", auth: false },
  { name: "note-comunita", url: "/note-comunita", auth: false },
];

/**
 * I quattro regimi in cui l'applicazione si guarda, con le credenziali del
 * seed. `anonimo` non ne ha: è l'assenza di sessione.
 *
 * Ogni pagina dichiara il proprio con `ruolo:`; senza, vale `cittadino`, che
 * è il regime della stragrande maggioranza delle schermate. `auth: false`
 * resta come scorciatoia storica per `anonimo`.
 */
const RUOLI = {
  anonimo: null,
  cittadino: {
    email: process.env.SHOTS_EMAIL ?? "cittadino@pistoia.it",
    password: process.env.SHOTS_PASSWORD ?? "Pistoia2026",
  },
  admin: {
    email: process.env.SHOTS_ADMIN_EMAIL ?? "comune@pistoia.it",
    password: process.env.SHOTS_ADMIN_PASSWORD ?? "Comune2026!",
  },
  moderatore: {
    email: process.env.SHOTS_MOD_EMAIL ?? "moderatore@pistoia.it",
    password: process.env.SHOTS_MOD_PASSWORD ?? "Pistoia2026",
  },
};

/** Il regime di una pagina, con i due valori predefiniti. */
const ruoloDi = (p) => p.ruolo ?? (p.auth === false ? "anonimo" : "cittadino");

async function login(page, credenziali) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"]', credenziali.email);
  await page.fill('input[name="password"]', credenziali.password);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 20_000 }),
    page.click('button[type="submit"]'),
  ]);
}

/**
 * Cattura le pagine di UN solo regime (`ruolo`), in un contesto suo.
 *
 * I regimi non possono convivere in un contesto solo, e per due ragioni
 * diverse: `/login` reindirizza chi ha già una sessione — finché lo script
 * faceva l'accesso in cima e poi visitava tutte le pagine in fila, la
 * schermata "login" conteneva in realtà "La mia città", e la prima schermata
 * di ogni dimostrazione non era mai stata davvero fotografata — e un ruolo non
 * può disfare il proprio accesso per prenderne un altro senza tornare
 * sull'unica pagina che quel primo accesso rende irraggiungibile.
 */
async function capture(ctx, theme, ruolo) {
  const anonime = ruolo === "anonimo";
  const page = await ctx.newPage();
  // next-themes legge da localStorage: impostarlo prima di ogni navigazione
  // evita il flash e rende la cattura deterministica.
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("theme", t);
    } catch {}
  }, theme);

  let authed = false;
  if (!anonime) {
    try {
      await login(page, RUOLI[ruolo]);
      authed = true;
    } catch (e) {
      console.warn(
        `  ⚠ login ${ruolo} non riuscito: ${e.message.split("\n")[0]}`,
      );
    }
  }

  // Il cookie si mette DOPO l'accesso: prima non ci sarebbe un contesto a cui
  // attaccarlo, e la home semplificata è un'altra pagina, non la stessa scalata.
  if (SIMPLE) {
    await ctx.addCookies([{ name: SIMPLE_COOKIE, value: "1", url: BASE }]);
  }

  for (const p of PAGES) {
    if (ONLY.length && !ONLY.includes(p.name)) continue;
    if (ruoloDi(p) !== ruolo) continue;
    if (!anonime && !authed) {
      console.warn(`  – salto ${p.name} (richiede sessione ${ruolo})`);
      saltati += 1;
      continue;
    }
    try {
      await page.goto(`${BASE}${p.url}`, {
        waitUntil: "domcontentloaded",
        timeout: 25_000,
      });

      /*
        SI PRETENDE L'ATTERRAGGIO, e non è pedanteria: è la sola cosa che
        rende sicure le pagine per ruolo.

        `requireAdmin()` non risponde 403, **reindirizza**: aperta col ruolo
        sbagliato, /admin/codici-qr consegna /la-mia-citta con stato 200 e
        contenuto perfettamente valido. Lo script fotograferebbe la home
        chiamandola col nome della pagina admin — un cancello che certifica
        una superficie mai vista. È successo davvero il 2026-08-03, ed è la
        ragione per cui queste rotte sono rimaste escluse per tre mesi.

        Il controllo va PRIMA di `apriPrima`, che invece naviga apposta.
      */
      const atterrato = new URL(page.url()).pathname;
      const chiesto = new URL(p.url, BASE).pathname;
      if (atterrato !== chiesto) {
        throw new Error(
          `atterrata su ${atterrato} invece che su ${chiesto} — con ruolo ` +
            `«${ruolo}» la schermata sarebbe di un'altra pagina`,
        );
      }
      /*
        Allarga il viewport all'altezza dell'intera pagina PRIMA di aspettare.

        Prima si scorreva la pagina e si tornava su, poi si scattava con
        `fullPage: true`. Non funzionava, e in modo insidioso: `fullPage`
        ridimensiona il viewport per stitchare, e quel ridimensionamento è il
        momento in cui i grafici entrano in vista per la PRIMA volta. Le
        animazioni partivano quindi *durante* lo scatto e le linee finivano
        fotografate all'~85% del tracciato. Misurato a riposo, il tratto arriva
        a fondo scala (dashoffset 0): mentiva la schermata, non il grafico —
        ed è esattamente la trappola descritta in AGENTS.md §5.

        Con tutto già in vista, ogni IntersectionObserver ha già scattato quando
        comincia l'attesa, e lo scatto è deterministico.
      */
      // La pagina va misurata a contenuto reso: con `domcontentloaded` React
      // non ha ancora prodotto nulla e l'altezza sarebbe quella del viewport.
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(400);

      if (p.apriPrima) {
        await page.locator(p.apriPrima).first().click();
        await page.waitForURL(p.attendiUrl, { timeout: 15_000 });
        await page.waitForLoadState("networkidle").catch(() => {});
        await page.waitForTimeout(400);
      }

      // Il massimo fra le misure: a seconda del layout una sola di queste può
      // restare ferma all'altezza del viewport.
      const fullHeight = await page.evaluate(() =>
        Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight,
        ),
      );

      /*
        Traboccamento orizzontale: si misura qui, non a occhio.

        Una pagina che scorre di lato è un difetto, e a differenza di quasi
        tutto il resto NON si vede in una schermata a piena pagina — che si
        allarga fino a contenerlo e lo fa sparire. Sono stati trovati così un
        traboccamento di 160px causato dalle tabelle `sr-only` e uno di 139px
        dagli anelli senza `flex-wrap` a 360px.
      */
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      const { width } = page.viewportSize();
      await page.setViewportSize({
        width,
        // Oltre gli 8000px Chromium fatica e la resa non migliora.
        height: Math.min(Math.ceil(fullHeight), 8000),
      });

      // Ingressi orchestrati fino a ~2,2s (DESIGN.md §7); il tratto del grafico
      // ad andamento è il più lento con 1,6s più 0,3s di ritardo sull'ultima
      // serie. Il margine è volutamente largo.
      await page.waitForTimeout(3200);
      const file = path.join(OUT, `${p.name}-${theme}.png`);
      await page.screenshot({ path: file });
      await page.setViewportSize({ width, height: VIEWPORT.height });
      if (overflow > 1) {
        problemi += 1;
        console.log(`  ✓ ${file}  ⚠ trabocca di ${overflow}px in orizzontale`);
      } else {
        console.log(`  ✓ ${file}`);
      }
    } catch (e) {
      /*
        Una cattura fallita conta come problema, non come riga di avviso.

        Il traboccamento si misura DENTRO il `try`: se la pagina non si apre,
        quella misura non viene mai presa e lo script usciva 0 lo stesso. Il
        cancello dichiarava "nessuna pagina scorre di lato" su pagine che non
        aveva neanche visto — cioè proprio quelle appena cambiate, che sono le
        uniche che possono essersi rotte.
      */
      falliti += 1;
      console.warn(`  ✗ ${p.name}: ${e.message.split("\n")[0]}`);
    }
  }
  await page.close();
}

const browser = await chromium.launch();
fs.mkdirSync(OUT, { recursive: true });

for (const theme of ["light", "dark"]) {
  console.log(`\n${theme}:`);
  // Un contesto per regime, e non è ottimizzabile: la sessione dell'uno
  // renderebbe irraggiungibile il login dell'altro, perché /login reindirizza
  // chi ce l'ha già.
  for (const ruolo of ["anonimo", "cittadino", "admin", "moderatore"]) {
    if (!PAGES.some((p) => ruoloDi(p) === ruolo)) continue;
    const ctx = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
      locale: "it-IT",
      colorScheme: theme,
    });
    await capture(ctx, theme, ruolo);
    await ctx.close();
  }
}

await browser.close();
console.log(`\nFatto → ${OUT}`);
if (problemi > 0) {
  console.error(
    `\n✗ ${problemi} schermate traboccano in orizzontale. Una pagina che scorre ` +
      `di lato non è "fatta" (AGENTS.md §5).`,
  );
  process.exitCode = 1;
}
if (falliti > 0) {
  console.error(
    `\n✗ ${falliti} pagine non si sono aperte: non sono state misurate, quindi ` +
      `questa esecuzione non prova nulla su di loro.`,
  );
  process.exitCode = 1;
}
if (saltati > 0) {
  console.error(
    `\n✗ ${saltati} pagine saltate perché l'accesso non è riuscito. Non sono ` +
      `state fotografate né misurate: questa esecuzione NON è una revisione ` +
      `visiva. Controlla che il server risponda e che le credenziali in ` +
      `SHOTS_EMAIL / SHOTS_PASSWORD siano valide.`,
  );
  process.exitCode = 1;
}
