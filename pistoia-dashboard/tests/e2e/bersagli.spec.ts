import { expect, test, type Page } from "@playwright/test";

import { apriDettaglio, login, posata, pretendiAtterraggio } from "./helpers";
import { PAGINE_ANONIME, PAGINE_AUTENTICATE, PAGINE_STAFF } from "./pagine-cancello";

/*
  IL CANCELLO DEI 44px (traccia «Qualità continua», ROADMAP).

  Perché esiste, e perché axe non basta. `DESIGN.md` §11.6 pretende bersagli da
  **≥44px**; la regola `target-size` di axe — nel cancello dal 2026-08-06 col
  tag `wcag22aa` — applica le stesse quattro eccezioni ma alla soglia di **24**.
  I link del footer sono stati alti **16px su ogni pagina della piattaforma per
  mesi**, e sarebbero passati anche adesso, perché erano ben spaziati. Un
  cancello copre le regole che gli hai chiesto, non la promessa che hai scritto
  in un documento: quella promessa la misura questo file.

  COME SI LEGGE UN ROSSO. Il messaggio elenca ogni bersaglio con la misura, il
  nome e *chi gli sta addosso*. Quasi sempre la correzione è una classe
  (`min-h-11`, `size-11`, `h-11`) sull'elemento che porta il testo — mai su un
  contenitore che conta di passarla per eredità (AGENTS.md §3, Fase C, 3).

  QUANTO COPRE. Undici pagine × due viewport. Non copre gli stati che il seed
  non produce: un pannello che appare solo dopo un'azione non viene misurato.
  I `<details>` invece sì — `posata()` li apre tutti prima di misurare.
*/

/** I 44px di `DESIGN.md` §11.6. Non è la soglia di WCAG 2.5.8, che è 24. */
const SOGLIA = 44;

/*
  I DUE VIEWPORT, e nessuno dei due contiene l'altro.

  A 1280 esiste la barra laterale, che a 360 è sostituita da quella inferiore:
  ventuno bersagli che l'altra passata non vede mai. A 360 i moduli si
  impilano e compaiono controlli che a 1280 stanno larghi. Misurata la
  differenza il 2026-08-07: 158 rossi a 1280 contro 147 a 360, e le liste non
  si sovrappongono.
*/
const VIEWPORT = {
  "scrivania (1280)": { width: 1280, height: 720 },
  "telefono (360)": { width: 360, height: 780 },
};

/**
 * Le esenzioni «essenziali» — la quarta eccezione di §11.6, l'unica che una
 * misura non può decidere da sola.
 *
 * **È vuota, ed è una notizia**: al 2026-08-07 nessun bersaglio della
 * piattaforma ha bisogno di essere più piccolo di 44px. Se un giorno ne
 * servisse uno, si scrive qui — con il *perché* e con la **condizione che lo
 * chiude**, che è la forma che questo progetto dà a ciò che resta aperto. Una
 * riga senza condizione è un'eccezione permanente travestita da nota.
 */
const ESSENZIALI: {
  selettore: string;
  perche: string;
  condizioneCheLaChiude: string;
}[] = [];

type Bersaglio = {
  desc: string;
  nome: string;
  w: number;
  h: number;
  inline: boolean;
  spaziatura: boolean;
  equivalente: boolean;
  essenziale: boolean;
  bloccanti: string[];
};

type Esito = { totale: number; sotto: Bersaglio[] };

/* ------------------------------------------------------------------ */
/*  Il metro, dentro la pagina.                                       */
/* ------------------------------------------------------------------ */

function misura({
  soglia,
  essenziali,
}: {
  soglia: number;
  essenziali: string[];
}): Esito {
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
    /*
      Un `<label>` entra solo quando il suo controllo è NASCOSTO: è il caso
      dell'`<input type=file>` messo `sr-only`, dove il bersaglio vero è
      l'etichetta e il controllo non si tocca mai. Quando il controllo si
      vede, l'etichetta viene scartata — sarebbe un doppio conteggio, e per
      checkbox e radio l'etichetta è già unita al quadratino.
    */
    "label[for]",
  ].join(",");

  const r = soglia / 2;
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

  type Voce = {
    el: Element;
    desc: string;
    nome: string;
    href: string;
    x: number;
    y: number;
    w: number;
    h: number;
    inline: boolean;
    essenziale: boolean;
    fisso: boolean;
    cx: number;
    cy: number;
  };
  const bersagli: Voce[] = [];

  for (const el of document.querySelectorAll(SEL)) {
    // Il DOM del dev server tiene una seconda copia `inert` del contenuto di
    // rotta (AGENTS.md §3, Fase C, 1): contarla raddoppia tutto.
    if (el.closest("[inert]") || el.closest('[aria-hidden="true"]')) continue;

    const form = el as HTMLInputElement;
    if (form.disabled || el.getAttribute("aria-disabled") === "true") continue;
    if (form.type === "hidden") continue;

    // L'etichetta di un controllo VISIBILE non è un bersaglio a sé: il
    // controllo è già in lista, e per checkbox e radio le due misure si
    // uniscono più sotto.
    if (el.tagName === "LABEL") {
      const c = (el as HTMLLabelElement).control;
      if (!c) continue;
      const cr = c.getBoundingClientRect();
      if (visibile(c) && cr.width > 2 && cr.height > 2) continue;
    }

    if (!visibile(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.pointerEvents === "none") continue;

    const box = el.getBoundingClientRect();
    // `sr-only`: 1×1 ritagliato. Non è un bersaglio per il puntatore finché
    // non prende fuoco, e da fuoco non è più questa geometria.
    const ritagliato =
      cs.clip === "rect(0px, 0px, 0px, 0px)" || cs.clipPath === "inset(50%)";
    if (ritagliato && box.width <= 2 && box.height <= 2) continue;
    if (box.width === 0 || box.height === 0) continue;

    let { x, y, width: w, height: h } = box;

    // Su checkbox e radio il bersaglio VERO comprende l'etichetta: cliccare il
    // testo spunta la casella, quindi misurare il solo quadratino
    // descriverebbe un bersaglio che nessuno usa. Ed è anche la ragione per
    // cui il quadratino da 16px non va ingrossato — si allarga la riga.
    if (form.type === "checkbox" || form.type === "radio") {
      for (const l of form.labels ?? []) {
        if (!visibile(l)) continue;
        const lb = l.getBoundingClientRect();
        if (lb.width === 0 || lb.height === 0) continue;
        const x2 = Math.max(x + w, lb.x + lb.width);
        const y2 = Math.max(y + h, lb.y + lb.height);
        x = Math.min(x, lb.x);
        y = Math.min(y, lb.y);
        w = x2 - x;
        h = y2 - y;
      }
    }

    // «Inline»: è dentro una frase, e la sua altezza la decide l'interlinea
    // del testo attorno. Serve che sia `display: inline` **e** che il blocco
    // che lo contiene porti altro testo oltre al suo — un link da solo in un
    // paragrafo non è «in una frase», è un blocco travestito.
    const righe = [...el.getClientRects()].filter((q) => q.width > 0 && q.height > 0).length;
    let blocco = el.parentElement;
    while (blocco && getComputedStyle(blocco).display.startsWith("inline")) {
      blocco = blocco.parentElement;
    }
    const testoProprio = (el.textContent || "").trim().length;
    const testoIntorno = blocco ? (blocco.textContent || "").trim().length : 0;
    const inline =
      cs.display === "inline" && (testoIntorno > testoProprio + 1 || righe > 1);

    /*
      La barra fissa sta in un PIANO A PARTE, e tenerne conto non è un
      dettaglio: `position: fixed` non scorre, quindi il contenuto le passa
      sotto e a ogni scorrimento le sta accanto qualcos'altro. Misurando a
      scroll 0, la barra inferiore a 360px risultava «vicina» ai filtri delle
      segnalazioni — che a scroll 200 sono altrove. Un cancello costruito su
      quell'adiacenza direbbe cose diverse a ogni passata.
    */
    let fisso = false;
    for (let a: Element | null = el; a; a = a.parentElement) {
      if (getComputedStyle(a).position === "fixed") {
        fisso = true;
        break;
      }
    }

    bersagli.push({
      el,
      desc: descrivi(el),
      nome: nomeDi(el),
      href: el.tagName === "A" ? (el as HTMLAnchorElement).href : "",
      x: x + scrollX,
      y: y + scrollY,
      w: Math.round(w * 10) / 10,
      h: Math.round(h * 10) / 10,
      inline,
      essenziale: essenziali.some((s) => el.matches(s)),
      fisso,
      cx: x + scrollX + w / 2,
      cy: y + scrollY + h / 2,
    });
  }

  const passa = (b: Voce) => b.w >= soglia - 0.5 && b.h >= soglia - 0.5;

  /* Geometria della SPAZIATURA, la prima eccezione. */
  const cerchioTocca = (b: Voce, o: Voce) => {
    const nx = Math.max(o.x, Math.min(b.cx, o.x + o.w));
    const ny = Math.max(o.y, Math.min(b.cy, o.y + o.h));
    const dx = b.cx - nx;
    const dy = b.cy - ny;
    return dx * dx + dy * dy < r * r - 0.01;
  };
  const cerchiToccano = (a: Voce, b: Voce) => {
    const dx = a.cx - b.cx;
    const dy = a.cy - b.cy;
    return dx * dx + dy * dy < (2 * r) ** 2 - 0.01;
  };
  /*
    WCAG dà la geometria per bersagli AFFIANCATI e non dice niente di quelli
    che si sovrappongono, perché due bersagli sovrapposti sono già un difetto.
    Senza questa riga la regola dà una risposta senza senso: uno `<span>` da
    16px **dentro** un pulsante da 34 risulta «isolato», perché i due centri
    distano 45px e i cerchi non si toccano. Era il caso vero di
    `ConfirmButton`, dove Motion metteva `tabindex` sull'icona.
  */
  const siSovrappongono = (a: Voce, o: Voce) =>
    a.x < o.x + o.w && o.x < a.x + a.w && a.y < o.y + o.h && o.y < a.y + a.h;

  /* L'EQUIVALENTE: la stessa azione, raggiungibile da un comando che passa. */
  const passanti = new Set<string>();
  for (const b of bersagli) {
    if (!passa(b)) continue;
    if (b.href || b.nome) passanti.add(b.href ? `h:${b.href}` : `n:${b.nome}`);
  }

  const sotto: Bersaglio[] = [];
  for (const b of bersagli) {
    if (passa(b)) continue;
    const bloccanti: string[] = [];
    for (const o of bersagli) {
      if (o === b || o.fisso !== b.fisso) continue;
      const tocca = passa(o) ? cerchioTocca(b, o) : cerchiToccano(b, o);
      if (tocca || siSovrappongono(b, o)) {
        if (bloccanti.length < 3) {
          const annidato = b.el.contains(o.el) || o.el.contains(b.el);
          bloccanti.push(`${o.desc.slice(0, 46)}${annidato ? " (annidato)" : ""}`);
        } else {
          bloccanti.push("…");
          break;
        }
      }
    }
    sotto.push({
      desc: b.desc,
      nome: b.nome,
      w: b.w,
      h: b.h,
      inline: b.inline,
      spaziatura: bloccanti.length === 0,
      equivalente:
        !!(b.href || b.nome) && passanti.has(b.href ? `h:${b.href}` : `n:${b.nome}`),
      essenziale: b.essenziale,
      bloccanti,
    });
  }

  return { totale: bersagli.length, sotto };
}

/* ------------------------------------------------------------------ */

const rossiDi = (e: Esito) =>
  e.sotto.filter(
    (s) => !s.inline && !s.spaziatura && !s.equivalente && !s.essenziale,
  );

function racconta(rossi: Bersaglio[], totale: number, url: string): string {
  const righe = rossi
    .map(
      (s) =>
        `  ${String(s.w)}×${String(s.h)}  ${s.desc}\n` +
        `        «${s.nome || "(senza nome accessibile)"}»\n` +
        `        gli sta addosso: ${s.bloccanti.join(", ") || "—"}`,
    )
    .join("\n\n");
  return (
    `${url}: ${rossi.length} bersagli sotto i ${SOGLIA}px su ${totale} misurati, ` +
    `e nessuna delle quattro eccezioni di DESIGN.md §11.6 li copre.\n\n${righe}`
  );
}

async function pretendiBersagli(page: Page, url: string) {
  const esito = await page.evaluate(misura, {
    soglia: SOGLIA,
    essenziali: ESSENZIALI.map((e) => e.selettore),
  });
  const rossi = rossiDi(esito);
  /*
    Un cancello deve distinguere «verificato e a posto» da «non verificato»
    (AGENTS.md §3, Fase A/B, 3). Zero bersagli misurati non è un successo: è
    una pagina che non si è aperta, o un metro che non ha trovato niente.
  */
  expect(esito.totale, `${url}: nessun bersaglio misurato`).toBeGreaterThan(0);
  expect(rossi, racconta(rossi, esito.totale, url)).toEqual([]);
}

for (const [dove, viewport] of Object.entries(VIEWPORT)) {
  test.describe(`bersagli ≥${SOGLIA}px · ${dove}`, () => {
    test.use({ viewport });

    // `reducedMotion` non è comodità: è lo stato in cui le rivelazioni sono
    // ferme. Con le animazioni vive, un elemento a metà dissolvenza risulta
    // invisibile e **non viene misurato**, cioè sfugge al cancello in
    // silenzio. Va messo prima della navigazione, come il tema in
    // `accessibilita.spec.ts`.
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
    });

    for (const { nome, url } of PAGINE_ANONIME) {
      test(`${nome} non ha bersagli sotto i ${SOGLIA}px`, async ({ page }) => {
        await page.goto(url);
        await posata(page);
        await pretendiBersagli(page, url);
      });
    }

    for (const { nome, url } of PAGINE_AUTENTICATE) {
      test(`${nome} non ha bersagli sotto i ${SOGLIA}px`, async ({ page }) => {
        await login(page);
        await page.goto(url);
        await pretendiAtterraggio(page, url);
        await posata(page);
        await pretendiBersagli(page, url);
      });
    }

    for (const { nome, url, conto, apriPrima } of PAGINE_STAFF) {
      test(`${nome} non ha bersagli sotto i ${SOGLIA}px`, async ({ page }) => {
        await login(page, conto);
        await page.goto(url);
        await pretendiAtterraggio(page, url);
        // Le rotte di dettaglio non hanno un indirizzo fisso: ci si arriva
        // cliccando la prima riga della lista (`pagine-cancello.ts`).
        if (apriPrima) await apriDettaglio(page, apriPrima);
        await posata(page);
        await pretendiBersagli(page, new URL(page.url()).pathname);
      });
    }
  });
}
