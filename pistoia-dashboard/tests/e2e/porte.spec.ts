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
      sulla propria pagina con una barra che non sapeva indicargliela. La
      pastiglia è un solo elemento condiviso (`layoutId`), quindi «attiva» qui
      si legge da `aria-current`, che è anche ciò che sente chi non la vede.
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
