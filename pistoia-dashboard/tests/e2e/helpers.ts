import { expect, type BrowserContext, type Page } from "@playwright/test";

// Credenziali del seed (prisma/seed.ts).
export const CITTADINO = {
  email: "cittadino@pistoia.it",
  password: "Pistoia2026",
};

/** Il super-account del Comune. Vede `/admin/*`, e **non** `/redazione`. */
export const ADMIN = {
  email: "comune@pistoia.it",
  password: "Comune2026!",
};

/**
 * La Redazione (R-4). `/redazione` respinge l'admin **per disegno** — il
 * Comune non modera ciò che lo riguarda — quindi è l'unico ruolo che la apre.
 */
export const MODERATORE = {
  email: "moderatore@pistoia.it",
  password: "Pistoia2026",
};

/** L'accesso VERO, dal modulo. Lo usa `login()` la prima volta, e `auth.spec`
 *  sempre — è il test dell'accesso, e non può fidarsi di una scorciatoia. */
export async function accediDalModulo(
  page: Page,
  { email, password } = CITTADINO,
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Accedi" }).click();
  await expect(page).toHaveURL(/\/la-mia-citta/);
}

/**
 * Le sessioni già ottenute, una per conto, per l'intera esecuzione.
 *
 * **Il modulo è caricato una volta sola** (`workers: 1` in
 * `playwright.config.ts`), quindi la mappa è condivisa da tutte le specifiche.
 */
type Biscotti = Awaited<ReturnType<BrowserContext["cookies"]>>;
const sessioni = new Map<string, Biscotti>();

/**
 * Entra come `conto`, riusando la sessione se c'è già.
 *
 * **Perché la cache, e perché non è una scorciatoia furba.** L'azione di
 * accesso ha tre limiti a finestra di 15 minuti (`app/actions/auth.ts`), e due
 * si azzerano quando l'accesso riesce — ma il terzo no: **40 tentativi per
 * indirizzo IP**, che è una difesa contro chi prova conti diversi dalla stessa
 * origine. Con un accesso per test la suite ne faceva ~45 dallo stesso
 * 127.0.0.1: il 2026-08-07, entrando i 22 casi di `bersagli.spec.ts`, il tetto
 * è stato sfondato a metà giro e **quindici test sono caduti insieme** —
 * territorio, trasparenza, valutazioni, voto — tutti con lo stesso sintomo,
 * «resto su /login», che somiglia moltissimo a un guasto dell'autenticazione
 * appena introdotto. Non lo era: era il limite che faceva il suo mestiere.
 *
 * La risposta giusta non è alzare il tetto — è una difesa vera, e
 * `AGENTS.md` §2 dice di non disattivare un controllo per far passare
 * qualcosa. È **smettere di fare quaranta accessi per provare quaranta volte
 * la stessa cosa**: il percorso vero lo prova `auth.spec.ts`, una volta, e
 * tutto il resto ha bisogno solo di *essere* autenticato.
 *
 * Il contratto resta identico a prima — dopo `login()` si è su
 * `/la-mia-citta`, autenticati — e se la sessione salvata non vale più si
 * rifà l'accesso davvero invece di proseguire su una pagina sbagliata.
 */
export async function login(page: Page, conto = CITTADINO) {
  const salvata = sessioni.get(conto.email);
  if (salvata) {
    await page.context().addCookies(salvata);
    await page.goto("/la-mia-citta");
    if (/\/la-mia-citta/.test(page.url())) return;
    sessioni.delete(conto.email);
  }
  await accediDalModulo(page, conto);
  sessioni.set(conto.email, await page.context().cookies());
}

/**
 * Pretende di essere ATTERRATI dove si voleva andare.
 *
 * Serve alle rotte per ruolo, ma il costo è nullo e la ragione vale ovunque: i
 * guard di questo progetto **reindirizzano**, non rifiutano. Una pagina aperta
 * col ruolo sbagliato risponde 200 con contenuto valido — e un cancello che
 * misura quel contenuto dichiara sana una superficie che non ha mai visto. È
 * la stessa trappola per cui `shots` fotografava la home chiamandola
 * `/admin/codici-qr` (AGENTS.md §4).
 */
export async function pretendiAtterraggio(page: Page, url: string) {
  const dove = new URL(page.url()).pathname;
  expect(
    dove,
    `atterrata su ${dove} invece che su ${url}: il ruolo non basta per questa ` +
      `rotta, e misurare la pagina d'arrivo certificherebbe qualcos'altro`,
  ).toBe(url);
}

/**
 * Apre una rotta di DETTAGLIO cliccando la prima riga della propria lista.
 *
 * Gli id vengono dal seed e cambiano a ogni riseminata, quindi l'indirizzo non
 * si può scrivere in `pagine-cancello.ts`. Si pretende comunque l'arrivo: senza
 * `waitForURL` il cancello misurerebbe la lista **col nome del dettaglio** —
 * la stessa famiglia di `pretendiAtterraggio` qui sopra.
 */
export async function apriDettaglio(
  page: Page,
  apriPrima: { selettore: string; attendi: RegExp },
) {
  const prima = page.locator(apriPrima.selettore).first();
  await expect(
    prima,
    `nessuna riga che corrisponda a ${apriPrima.selettore}: la lista è vuota ` +
      `o il selettore è invecchiato, e in tutti e due i casi il dettaglio non ` +
      `viene misurato`,
  ).toBeVisible({ timeout: 15_000 });
  await prima.click();
  await page.waitForURL(apriPrima.attendi, { timeout: 20_000 });
}

/**
 * **Si misura solo a pagina POSATA, e non è un dettaglio.**
 *
 * L'ingresso di `(app)/template.tsx` parte da `opacity: 0` e dura fino a ~2,2s
 * (`AGENTS.md` §5). Chi interroga prima legge numeri plausibili e sbagliati, e
 * i due cancelli li sbagliano in modo diverso: axe legge colori a metà
 * transizione — la prima stesura di `accessibilita.spec.ts` dichiarava 1,07:1
 * nel tema scuro, cioè testo invisibile, su pagine perfettamente leggibili — e
 * il cancello dei bersagli **non vede affatto** ciò che è ancora trasparente,
 * quindi misurerebbe metà pagina dicendo di averla misurata tutta.
 */
export async function posata(page: Page) {
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
    SI APRONO TUTTI I `<details>`, e non è un vezzo.

    Un pannello chiuso nasconde i propri controlli, e ciò che è nascosto non
    viene misurato: su `/admin` sono **42 bersagli** su 222, cioè quasi un
    quinto della pagina, e fra quelli c'era il `<summary>` da 16px che il
    cancello dei bersagli ha trovato al primo giro. Aprirli tutti insieme è
    uno stato che nessuno vedrà mai per intero, ma ogni singolo pannello
    aperto sì — ed è la differenza fra un cancello che copre quel che dichiara
    e uno che copre quel che si vede a colpo d'occhio.
  */
  await page.evaluate(() => {
    for (const d of document.querySelectorAll("details")) d.open = true;
  });

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
