import { expect, test } from "@playwright/test";
import { ADMIN, MODERATORE, login } from "./helpers";

/*
  Le superfici riservate hanno una PORTA, e ci si arriva CLICCANDO.

  Nasce da un difetto trovato guardando le pagine una per una il 2026-08-07:
  `/redazione` **non era raggiungibile da nessun collegamento**. Zero `href` in
  tutta l'applicazione — solo il prefisso nel proxy e tre `revalidatePath` —
  quindi il moderatore doveva digitare l'indirizzo per aprire la propria unica
  superficie di lavoro, e una volta lì la barra laterale non aveva nessuna voce
  attiva. L'admin, sulla stessa barra, aveva «Area Comune» da sempre.

  **Perché nessun cancello lo vedeva, ed è il punto che vale oltre questo caso.**
  `rotte.mjs`, `accessibilita.spec.ts` e `bersagli.spec.ts` aprono `/redazione`
  tutti allo stesso modo: `goto("/redazione")`. Tutti e tre erano verdi, e lo
  sarebbero rimasti anche se la pagina fosse stata irraggiungibile per chiunque
  non conoscesse l'indirizzo a memoria. È la stessa famiglia della trappola di
  `AGENTS.md` §3 (Fase A/B, 4): `shots` non vedeva le rotte annidate rotte
  perché ci arrivava cliccando, e `rotte` è nato per aprirle per indirizzo.
  Qui la mancanza è **esattamente specchiata** — nessuno ci arrivava cliccando —
  e si chiude nell'altro verso.

  Il cancello è generale di proposito: prova la REGOLA («ogni ruolo con una
  superficie riservata ha una voce che ce lo porta»), non le due rotte di oggi.
  Una superficie di staff aggiunta domani entra in questa tabella, o resta
  senza porta come ci è restata la Redazione.
*/

const PORTE = [
  { ruolo: "Comune (admin)", conto: ADMIN, voce: "Area Comune", url: "/admin" },
  { ruolo: "Redazione (moderatore)", conto: MODERATORE, voce: "Redazione", url: "/redazione" },
];

for (const { ruolo, conto, voce, url } of PORTE) {
  test(`${ruolo}: dalla barra laterale si arriva a ${url} cliccando`, async ({ page }) => {
    await login(page, conto);

    // La barra laterale esiste da `lg` in su: il viewport di default
    // (Desktop Chrome, 1280) ce l'ha. Sotto quella soglia la porta è un'altra,
    // e questo cancello non la copre — vedi la nota in fondo.
    const barra = page.getByRole("navigation").first();
    const porta = barra.getByRole("link", { name: voce, exact: true });

    await expect(
      porta,
      `nessuna voce «${voce}» nella barra: la superficie esiste ma non ha una porta, ` +
        `e si raggiunge solo digitando l'indirizzo`,
    ).toBeVisible();

    await porta.click();
    await expect(page).toHaveURL(new RegExp(`${url}$`));

    /*
      E la voce dev'essere ATTIVA una volta arrivati. Non è un vezzo: è la metà
      del difetto del 2026-08-07 che si vedeva a schermo — il moderatore stava
      sulla propria pagina con una barra che non sapeva indicargliela.

      «Attiva» si legge da `aria-current` e non dalla goccia, ed è voluto: la
      goccia va a *visitare* la voce sorvolata, quindi come prova di «dove
      sono» mentirebbe. `aria-current` è anche ciò che sente chi la goccia non
      la vede.
    */
    await expect(
      barra.getByRole("link", { name: voce, exact: true }),
      `la voce «${voce}» non risulta attiva: la barra non sa dire dove sei`,
    ).toHaveAttribute("aria-current", "page");
  });

  /*
    E la stessa porta A 375px, dove la barra laterale NON ESISTE.

    Non è una ripetizione: è l'altra metà del difetto, e la prima stesura di
    questo cancello non l'avrebbe vista. La barra laterale è `lg:block`, la
    barra in basso porta solo le cinque destinazioni pubbliche — quindi su
    telefono l'unica porta possibile è il menu del profilo. Corollario che vale
    oltre questo caso: **una voce di navigazione non è «aggiunta» finché non si
    dichiara a quali larghezze esiste.**
  */
  test(`${ruolo}: a 375px la porta è nel menu del profilo`, async ({ page }) => {
    await login(page, conto);
    await page.setViewportSize({ width: 375, height: 800 });
    await page.reload();

    await expect(page.getByRole("navigation").first().getByRole("link", { name: voce, exact: true })).toBeHidden();

    await page.getByRole("button", { name: /^Menu del profilo di / }).click();
    const porta = page.getByRole("link", { name: voce, exact: true });
    await expect(
      porta,
      `a 375px «${voce}» non è raggiungibile: la barra laterale non esiste a ` +
        `questa larghezza, quindi qui il menu del profilo è l'unica porta`,
    ).toBeVisible();

    await porta.click();
    await expect(page).toHaveURL(new RegExp(`${url}$`));
  });
}

/*
  LE PORTE INTERNE DELL'AREA COMUNE (2026-08-07, taglio di `/admin` in sette).

  Stessa domanda delle porte qui sopra, un livello più in basso: `rotte.mjs`
  aprirà le sei sottopagine **per indirizzo** e le troverà sane anche il giorno
  in cui nessun collegamento ci porta più. È la metà che nessun altro cancello
  misura.

  ⚠️ **Nessuna seconda lista.** Le sei si leggono dal cruscotto stesso: il
  cancello prova la REGOLA — *ogni porta del cruscotto si apre cliccando, dice
  dove sei, e riporta indietro* — quindi una superficie aggiunta domani entra
  in questo cancello da sé, invece di doverci essere ricopiata. Una tabella qui
  sarebbe la seconda definizione di `superfici.ts`, e due liste divergono al
  primo inserimento (`AGENTS.md` §3, ondata 7, nota finale).
*/
const CRUSCOTTO = "Le aree di lavoro del Comune";
const AREE = "Aree del Comune";

test("Comune: ogni porta del cruscotto si apre cliccando, e riporta indietro", async ({
  page,
}) => {
  /*
    Tre navigazioni per porta — apri, controlla, torna — e le porte sono sei:
    **12,3s misurati** su un server già caldo, cioè il 41% dei 30s di default.
    Un runner di CI è più lento e le rotte annidate possono compilare a freddo,
    e in questo repository i rossi da compilazione a freddo hanno già prodotto
    due diagnosi sbagliate (`AGENTS.md` §3). `test.slow()` triplica il tetto:
    costa nulla quando va bene, e toglie un rosso che non verrebbe dal codice.
  */
  test.slow();
  await login(page, ADMIN);
  await page.goto("/admin");

  const porte = page.getByRole("navigation", { name: CRUSCOTTO }).getByRole("link");

  /*
    ⚠️ `evaluateAll` NON aspetta: risolve con ciò che combacia in quell'istante,
    e su una lista vuota restituisce `[]` senza lamentarsi. Senza questa attesa
    il test misura il cruscotto **prima** che il contenuto sia arrivato e
    dichiara «nessuna porta» su una pagina che le ha tutte.

    Non è teoria: è successo il 2026-08-09. Il cruscotto ha guadagnato una
    quarta interrogazione al database (il monitor degli atti) e questo test è
    diventato rosso — mentre lo snapshot che Playwright salva **dopo** il
    fallimento mostrava la navigazione al completo, con le sue sei porte. La
    corsa c'era da sempre; una pagina un po' più lenta l'ha solo resa visibile.

    L'attesa non ammorbidisce il cancello: se le porte non arrivano davvero,
    qui si scade e il test fallisce lo stesso.
  */
  await porte.first().waitFor({ state: "visible" });

  const indirizzi = await porte.evaluateAll((links) =>
    links.map((l) => l.getAttribute("href") ?? ""),
  );

  expect(
    indirizzi.length,
    "il cruscotto non offre nessuna porta: le sei aree esistono ma ci si arriva " +
      "solo digitando l'indirizzo",
  ).toBeGreaterThan(0);

  for (const href of indirizzi) {
    await page.goto("/admin");
    await page.getByRole("navigation", { name: CRUSCOTTO }).locator(`a[href="${href}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));

    // Arrivati, la navigazione dell'area deve sapere DOVE siamo — è la metà
    // del difetto del 2026-08-07 che si vedeva a schermo, e `aria-current` è
    // anche ciò che sente chi la pastiglia non la vede.
    const aree = page.getByRole("navigation", { name: AREE });
    await expect(
      aree.locator(`a[href="${href}"]`),
      `su ${href} la navigazione dell'area non segna la pagina corrente`,
    ).toHaveAttribute("aria-current", "page");

    // E si torna al cruscotto senza il tasto indietro del browser.
    await aree.getByRole("link", { name: "Cruscotto", exact: true }).click();
    await expect(page).toHaveURL(/\/admin$/);
  }
});

/*
  E le stesse porte A 375px, dove la barra laterale non esiste.

  Non è una ripetizione della precedente: la navigazione dell'area è nel flusso
  della pagina, quindi *dovrebbe* esserci a ogni larghezza — ma «dovrebbe» è
  ciò che si diceva anche della voce «Redazione» prima del 2026-08-07. Qui il
  rischio concreto è una riga di pastiglie che a 375px va a capo male o esce
  dallo schermo: il traboccamento lo misura `shots`, la raggiungibilità la
  misura questo.
*/
test("Comune: a 375px la navigazione dell'area porta a un'altra coda", async ({ page }) => {
  await login(page, ADMIN);
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/admin/segnalazioni");

  const aree = page.getByRole("navigation", { name: AREE });
  // Il nome accessibile di una coda porta anche il proprio contatore
  // («Proposte 4 in attesa»), quindi qui si àncora all'inizio invece di
  // pretendere l'uguaglianza — che è ciò che il numero renderebbe fragile.
  const altra = aree.getByRole("link", { name: /^Proposte/ });

  await expect(
    altra,
    "a 375px non si passa da una coda all'altra: la barra laterale non esiste " +
      "a questa larghezza, quindi la navigazione dell'area è l'unica strada",
  ).toBeVisible();

  await altra.click();
  await expect(page).toHaveURL(/\/admin\/proposte$/);
});

/*
  LA GOCCIA DELLA BARRA LATERALE (Ondata 10, 2026-08-12).

  L'indicatore dell'isola di vetro si deforma sulla propria velocità, ed è ciò
  che lo fa leggere come liquido invece che come una pastiglia che scivola.
  Lorenzo l'ha scelto **reattivo e non ambientale**, fra tre gradi possibili:
  quindi il contratto ha due metà, e tutte e due sono invisibili ai quattro
  cancelli — axe non ha una regola per «si sta muovendo da solo».

  1. **A riposo NON si muove.** È `DESIGN.md` §7 («mai ambientale») e
     `AGENTS.md` §2 (deve girare su Android vecchi) applicati a un componente
     che sta su ogni pagina autenticata: un'animazione perpetua qui costerebbe
     batteria ovunque, per sempre.
  2. **Con `prefers-reduced-motion` non anima affatto**, e non si deforma: si
     posiziona e basta. È uno stato di prima classe (`DESIGN.md` §11.5).

  Perché serve un test e non basta averlo guardato: sono due proprietà che si
  perdono con una riga — una durata rimessa, una condizione tolta — e la
  regressione non produce nessun rosso altrove.
*/
const GOCCIA = "nav[aria-label='Navigazione principale'] > span[aria-hidden]";

/** Lo stato della goccia: dov'è, e quanto è deformata. */
async function leggiGoccia(page: import("@playwright/test").Page) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return { y: Math.round(m.m42), scaleY: +m.m22.toFixed(2) };
  }, GOCCIA);
}

test("la goccia sta FERMA quando nessuno tocca niente", async ({ page }) => {
  await login(page);
  await page.goto("/la-mia-citta");
  await page.waitForTimeout(2_500);

  const primo = await leggiGoccia(page);
  expect(primo, "la goccia non esiste nella barra laterale").not.toBeNull();
  // A riposo non è deformata: la deformazione viene dalla velocità, e a riposo
  // la velocità è zero.
  expect(primo!.scaleY).toBe(1);

  // E dopo mezzo secondo di nulla è esattamente dov'era. Due letture identiche
  // sono la prova che NESSUNA animazione sta girando: un respiro ambientale,
  // anche lentissimo, le farebbe divergere.
  await page.waitForTimeout(500);
  expect(
    await leggiGoccia(page),
    "la goccia si muove da sola: è un'animazione ambientale, che DESIGN.md §7 " +
      "non concede e che su un telefono modesto costa batteria su ogni pagina",
  ).toEqual(primo);
});

test("con prefers-reduced-motion la goccia si posiziona, non anima", async ({
  page,
}) => {
  await login(page);
  // `emulateMedia` e non `test.use({ reducedMotion })`: è la forma che
  // `accessibilita.spec.ts` usa già, e in questa versione di Playwright
  // l'opzione di test non è tipizzata. Si emula PRIMA di aprire la pagina.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/la-mia-citta");
  await page.waitForTimeout(2_500);

  const riposo = await leggiGoccia(page);
  expect(riposo).not.toBeNull();

  /*
    ⚠️ **Si campiona fotogramma per fotogramma, non a un istante scelto.**

    La prima stesura leggeva la goccia 50ms dopo il fuoco e pretendeva che
    fosse già arrivata. Ha fallito a macchina carica — 50ms possono non bastare
    a un solo fotogramma — cioè con un rosso che parlava di `reduced-motion`
    per un problema di scheduling. Una soglia in millisecondi è una scommessa
    sulla velocità della macchina, e questo repository ha già pagato due volte
    per rossi d'ambiente scambiati per regressioni (`AGENTS.md` §3, 2026-08-11).

    La proprietà vera non ha tempi dentro: **la goccia non deve passare da
    posizioni INTERMEDIE**. Posizionarsi significa avere due sole posizioni —
    quella di partenza e quella d'arrivo. Animare significa averne tante.
  */
  const campioni = await page.evaluate(
    async ([sel, quanti]) => {
      const el = document.querySelector(sel as string);
      const leggi = () => {
        const m = new DOMMatrix(getComputedStyle(el!).transform);
        return { y: Math.round(m.m42), scaleY: +m.m22.toFixed(2) };
      };
      const visti: { y: number; scaleY: number }[] = [leggi()];
      /*
        Il fuoco da TASTIERA: è anche il percorso che una goccia legata al solo
        mouse non coprirebbe.

        ⚠️ **Le voci si prendono dalla barra che possiede QUESTA goccia**, non
        da un selettore per `aria-label`, ed è un rosso già pagato (2026-08-15):
        `bottom-nav.tsx` e `side-nav.tsx` dichiarano **lo stesso**
        `aria-label="Navigazione principale"`, quindi il selettore raccoglieva i
        link di tutte e due. L'ultimo era della barra in basso, che da `lg` in su
        è `display: none` — e `focus()` su un elemento non renderizzato **non fa
        nulla, in silenzio**. La goccia restava ferma e il test accusava il
        prodotto di non seguire la tastiera, che invece la segue.
      */
      const barra = el!.closest("nav")!;
      // L'ULTIMA voce che non è già quella attiva: puntare l'attiva sarebbe un
      // non-movimento legittimo, e il test si autocertificherebbe.
      const voci = [...barra.querySelectorAll<HTMLElement>("a")].filter(
        (a) => !a.hasAttribute("data-attiva"),
      );
      const bersaglio = voci.at(-1) ?? null;
      bersaglio?.focus();
      for (let i = 0; i < (quanti as number); i++) {
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        visti.push(leggi());
      }
      return { visti, bersaglio: bersaglio?.textContent?.trim() ?? null };
    },
    [GOCCIA, 40] as const,
  );

  expect(
    campioni.bersaglio,
    "nella barra non c'è nessuna voce diversa dall'attiva: il test non prova niente",
  ).not.toBeNull();

  const posizioni = [...new Set(campioni.visti.map((c) => c.y))];
  expect(
    posizioni.length,
    `la goccia è passata da ${posizioni.length} posizioni (${posizioni.join(", ")}): ` +
      "con prefers-reduced-motion deve posizionarsi, non animare",
  ).toBeLessThanOrEqual(2);
  expect(
    campioni.visti.at(-1)!.y,
    `la goccia non si è mossa affatto: il fuoco da tastiera su «${campioni.bersaglio}» non la sposta`,
  ).not.toBe(riposo!.y);

  const deformazioni = [...new Set(campioni.visti.map((c) => c.scaleY))];
  expect(
    deformazioni,
    "la goccia si deforma anche con la preferenza attiva: lo schiacciamento " +
      "è movimento, e qui non deve avvenire",
  ).toEqual([1]);
});
