import { expect, test, type Page } from "@playwright/test";

import { apriDettaglio, login, posata, pretendiAtterraggio } from "./helpers";
import { PAGINE_ANONIME, PAGINE_AUTENTICATE, PAGINE_STAFF } from "./pagine-cancello";

/*
  IL CANCELLO DEL CONTENIMENTO — *nessun controllo esce dal proprio contenitore*
  (traccia «Qualità continua», ROADMAP; la trappola sta in `AGENTS.md` §3,
  «lista + dettaglio», 3).

  PERCHÉ NESSUN ALTRO CANCELLO LO VEDE. Il 2026-08-07, sul dettaglio di una
  segnalazione, i due pulsanti dell'urgenza affiancati misuravano **301px**
  dentro il riquadro da **239** che li ospita: «Flusso ordinario» sporgeva di
  62px e la card lo **ritagliava**. Tre cancelli verdi sopra:

  - `shots` misura il traboccamento **della pagina**, che resta **zero** proprio
    perché la card ha `overflow` nascosto — il difetto si nasconde dentro la
    stessa proprietà che lo produce;
  - `bersagli` misura la **dimensione**, e quei pulsanti sono a norma (44px):
    un bersaglio tagliato a metà resta alto 44;
  - axe non ha una regola per «tagliato».

  Era «una categoria che si trova solo guardando». Adesso si misura.

  COSA CONTA COME DIFETTO, e cosa no. Un contenitore che **scorre** non ritaglia
  niente: il contenuto oltre il bordo si raggiunge, ed è il mestiere del riquadro
  del triage. Il difetto è il contenuto reso **irraggiungibile** — un antenato
  con `overflow: hidden` o `clip` sull'asse su cui il controllo sporge. È la
  stessa distinzione di §3 (Fase A/B, 3) applicata allo spazio invece che al
  tempo: *fuori vista* e *fuori portata* non sono la stessa cosa.

  QUANTO COSTA. Ventuno pagine × due viewport, come `bersagli`, e paga la
  propria navigazione invece di appoggiarsi a quella: è la stessa scelta che
  tiene separati `bersagli` e `accessibilita`, che pure condividono la lista di
  `pagine-cancello.ts`. Un rosso deve poter dire da solo quale promessa ha
  rotto.
*/

/** Sotto il pixel non è un ritaglio: è arrotondamento del motore di layout. */
const TOLLERANZA = 1;

const VIEWPORT = {
  "scrivania (1280)": { width: 1280, height: 720 },
  "telefono (360)": { width: 360, height: 780 },
};

/**
 * I controlli che possono uscire dal proprio contenitore senza che sia un
 * difetto — e non ne esiste nessuno.
 *
 * **È vuota, come l'elenco gemello di `bersagli.spec.ts`, e per la stessa
 * ragione**: se un giorno servisse una riga, si scrive con il *perché* e con la
 * **condizione che la chiude**. Una riga senza condizione è un'eccezione
 * permanente travestita da nota.
 */
const AMMESSI: {
  selettore: string;
  perche: string;
  condizioneCheLaChiude: string;
}[] = [];

type Tagliato = {
  desc: string;
  nome: string;
  lati: string;
  quanto: number;
  contenitore: string;
  misure: string;
};

type Esito = { totale: number; tagliati: Tagliato[] };

/* ------------------------------------------------------------------ */
/*  Il metro, dentro la pagina.                                       */
/* ------------------------------------------------------------------ */

function misura({ tolleranza, ammessi }: { tolleranza: number; ammessi: string[] }): Esito {
  // La stessa famiglia di selettori di `bersagli.spec.ts`: si misurano i
  // CONTROLLI, perché è lì che un ritaglio toglie una funzione. Il testo che
  // va a capo è un altro problema e ha un'altra risposta.
  const SEL = [
    "a[href]",
    "button",
    "input",
    "select",
    "textarea",
    "summary",
    "[role=button]",
    "[role=link]",
    "[role=checkbox]",
    "[role=radio]",
    "[role=switch]",
    "[role=tab]",
    "[role=menuitem]",
    "[role=menuitemcheckbox]",
    "[role=menuitemradio]",
    "[role=option]",
    "[contenteditable=true]",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  const visibile = (el: Element) =>
    el.checkVisibility({
      checkOpacity: true,
      opacityProperty: true,
      checkVisibilityCSS: true,
      visibilityProperty: true,
      contentVisibilityAuto: true,
    });

  const descrivi = (el: Element) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += `#${el.id}`;
    const cls = (el.getAttribute("class") || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 4)
      .join(".");
    if (cls) s += `.${cls}`;
    return s;
  };
  const nomeDi = (el: Element) =>
    (el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60);

  /** Un antenato ritaglia su un asse quando NON si può scorrere su quell'asse. */
  const ritagliaSu = (v: string) => v === "hidden" || v === "clip";

  const tagliati: Tagliato[] = [];
  let totale = 0;

  for (const el of document.querySelectorAll(SEL)) {
    // La seconda copia `inert` del contenuto di rotta che il dev server tiene
    // in pagina (AGENTS.md §3, Fase C, 1) raddoppierebbe tutto.
    if (el.closest("[inert]") || el.closest('[aria-hidden="true"]')) continue;

    const form = el as HTMLInputElement;
    if (form.disabled || el.getAttribute("aria-disabled") === "true") continue;
    if (form.type === "hidden") continue;
    if (!visibile(el)) continue;

    const cs = getComputedStyle(el);
    // `sr-only`: 1×1 ritagliato di proposito. Non è un controllo tagliato, è un
    // equivalente testuale — e da fuoco non ha più questa geometria.
    const nascostoAiVedenti =
      cs.clip === "rect(0px, 0px, 0px, 0px)" || cs.clipPath === "inset(50%)";
    const box = el.getBoundingClientRect();
    if (nascostoAiVedenti && box.width <= 2 && box.height <= 2) continue;
    if (box.width === 0 || box.height === 0) continue;
    if (ammessi.some((s) => el.matches(s))) continue;

    /*
      Un elemento `fixed` non è ritagliato dagli antenati: il suo blocco
      contenitore è il viewport. Resta fuori — e non resta scoperto, perché il
      traboccamento della pagina lo misura già `shots`.
    */
    let fisso = false;
    for (let a: Element | null = el; a; a = a.parentElement) {
      if (getComputedStyle(a).position === "fixed") {
        fisso = true;
        break;
      }
    }
    if (fisso) continue;

    totale += 1;

    // Si risale TUTTA la catena: un controllo può stare dentro il proprio
    // riquadro e sporgere da quello del nonno.
    let peggio: Tagliato | null = null;
    for (let a = el.parentElement; a; a = a.parentElement) {
      const acs = getComputedStyle(a);
      const clipX = ritagliaSu(acs.overflowX);
      const clipY = ritagliaSu(acs.overflowY);
      if (!clipX && !clipY) continue;

      // Il riquadro di ritaglio è il *padding box*: i bordi non mostrano
      // contenuto. `clientWidth/Height` lo danno già al netto delle barre.
      const ar = a.getBoundingClientRect();
      const sinistra = ar.left + a.clientLeft;
      const alto = ar.top + a.clientTop;
      const destra = sinistra + a.clientWidth;
      const basso = alto + a.clientHeight;

      const lati: string[] = [];
      let quanto = 0;
      if (clipX) {
        const oltreDx = box.right - destra;
        const oltreSx = sinistra - box.left;
        if (oltreDx > tolleranza) {
          lati.push(`destra ${Math.round(oltreDx)}px`);
          quanto = Math.max(quanto, oltreDx);
        }
        if (oltreSx > tolleranza) {
          lati.push(`sinistra ${Math.round(oltreSx)}px`);
          quanto = Math.max(quanto, oltreSx);
        }
      }
      if (clipY) {
        const oltreGiu = box.bottom - basso;
        const oltreSu = alto - box.top;
        if (oltreGiu > tolleranza) {
          lati.push(`sotto ${Math.round(oltreGiu)}px`);
          quanto = Math.max(quanto, oltreGiu);
        }
        if (oltreSu > tolleranza) {
          lati.push(`sopra ${Math.round(oltreSu)}px`);
          quanto = Math.max(quanto, oltreSu);
        }
      }
      if (lati.length === 0) continue;

      if (!peggio || quanto > peggio.quanto) {
        peggio = {
          desc: descrivi(el),
          nome: nomeDi(el),
          lati: lati.join(" · "),
          quanto: Math.round(quanto * 10) / 10,
          contenitore: descrivi(a),
          misure:
            `controllo ${Math.round(box.width)}×${Math.round(box.height)} ` +
            `dentro ${a.clientWidth}×${a.clientHeight}`,
        };
      }
    }
    if (peggio) tagliati.push(peggio);
  }

  return { totale, tagliati };
}

/* ------------------------------------------------------------------ */

function racconta(tagliati: Tagliato[], totale: number, url: string): string {
  const righe = tagliati
    .map(
      (t) =>
        `  esce di ${t.quanto}px (${t.lati})\n` +
        `        ${t.desc}\n` +
        `        «${t.nome || "(senza nome accessibile)"}»\n` +
        `        ritagliato da: ${t.contenitore}\n` +
        `        ${t.misure}`,
    )
    .join("\n\n");
  const quanti =
    tagliati.length === 1
      ? "1 controllo esce dal proprio contenitore e viene RITAGLIATO"
      : `${tagliati.length} controlli escono dal proprio contenitore e vengono RITAGLIATI`;
  return (
    `${url}: ${quanti}, su ${totale} misurati.\n\n` +
    `Il contenitore non scorre su quell'asse, quindi la parte fuori non si ` +
    `raggiunge in nessun modo.\n\n${righe}`
  );
}

async function pretendiContenimento(page: Page, url: string) {
  const esito = await page.evaluate(misura, {
    tolleranza: TOLLERANZA,
    ammessi: AMMESSI.map((a) => a.selettore),
  });
  /*
    Zero controlli misurati non è un successo: è una pagina che non si è aperta
    (AGENTS.md §3, Fase A/B, 3 — un cancello distingue «verificato e a posto»
    da «non verificato»).
  */
  expect(esito.totale, `${url}: nessun controllo misurato`).toBeGreaterThan(0);
  expect(esito.tagliati, racconta(esito.tagliati, esito.totale, url)).toEqual([]);
}

for (const [dove, viewport] of Object.entries(VIEWPORT)) {
  test.describe(`nessun controllo esce dal contenitore · ${dove}`, () => {
    test.use({ viewport });

    // Come in `bersagli`: con le animazioni vive un controllo a metà
    // dissolvenza risulta invisibile e non viene misurato, cioè sfugge al
    // cancello in silenzio. E una rivelazione a metà ha anche una geometria
    // che non è quella definitiva.
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
    });

    for (const { nome, url } of PAGINE_ANONIME) {
      test(`${nome}: nessun controllo ritagliato`, async ({ page }) => {
        await page.goto(url);
        await posata(page);
        await pretendiContenimento(page, url);
      });
    }

    for (const { nome, url } of PAGINE_AUTENTICATE) {
      test(`${nome}: nessun controllo ritagliato`, async ({ page }) => {
        await login(page);
        await page.goto(url);
        await pretendiAtterraggio(page, url);
        await posata(page);
        await pretendiContenimento(page, url);
      });
    }

    for (const { nome, url, conto, apriPrima } of PAGINE_STAFF) {
      test(`${nome}: nessun controllo ritagliato`, async ({ page }) => {
        await login(page, conto);
        await page.goto(url);
        await pretendiAtterraggio(page, url);
        if (apriPrima) await apriDettaglio(page, apriPrima);
        await posata(page);
        await pretendiContenimento(page, new URL(page.url()).pathname);
      });
    }
  });
}
