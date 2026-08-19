/**
 * L'IMPRONTA DEI TOKEN — la prova che il design non è cambiato.
 *
 * Legge OGNI custom property del design system come il browser la risolve
 * davvero, nei due temi, e la scrive in un file. Da lì in avanti ogni fase del
 * rework può dimostrare di non aver mosso niente: si rilancia e si confronta.
 *
 * Uso:
 *   corepack pnpm dev               # in un altro terminale
 *   node scripts/impronta.mjs                 # scrive la nuova impronta
 *   node scripts/impronta.mjs --confronta     # confronta con quella salvata
 *   node scripts/impronta.mjs --out=/tmp/x.json --url=/metodologia
 *
 * `--confronta` esce **1** se un solo valore risolto è cambiato: è la forma in
 * cui questo script diventa un cancello.
 *
 * ## Perché non basta leggere le variabili
 *
 * `getComputedStyle(html).getPropertyValue("--bg")` restituisce
 * `light-dark(#E8E7E4, #131211)` — **la stessa stringa nei due temi**, perché
 * `light-dark()` si risolve solo quando la variabile viene USATA in una
 * proprietà vera. Un'impronta presa così sarebbe cieca esattamente sul tema,
 * cioè sulla metà del sistema che il rework tocca di più.
 *
 * Quindi ogni token viene fatto passare per una proprietà reale, e si registra
 * ciò che il compositore calcola: `color-mix()`, `light-dark()` e `calc()`
 * collassano in un valore concreto. Tre canali, provati in ordine:
 *
 *   1. `color`        → i colori (il canale di gran lunga più popolato)
 *   2. `padding-left` → raggi, spessori, misure, durate espresse in lunghezza
 *   3. `box-shadow`   → le elevazioni composte (`--elev-*`)
 *
 * Il riconoscimento non è per nome: un token entra in un canale se quel canale
 * lo accetta. Il genitore della sonda porta un valore sentinella, così una
 * sostituzione non valida ricade su quello e si distingue da un valore vero —
 * senza dover indovinare in anticipo che tipo ha ciascun token.
 *
 * Ciò che nessun canale accetta (le molle `linear()`, la grana `url()`) viene
 * registrato grezzo: lì la stringa È il valore, e confrontarla basta.
 *
 * ## Due trappole pagate scrivendolo (2026-08-15)
 *
 * 1. 🔴 **Il tema NON si cambia scrivendo su `<html>`.** next-themes 0.4
 *    sorveglia gli attributi della radice e li **riscrive**: `data-theme="dark"`
 *    messo a mano torna `light` prima ancora della lettura successiva. La prima
 *    stesura fotografava così due volte il tema chiaro, e sembrava funzionare
 *    — differivano dodici valori, cioè quelli del blocco `.dark {}`, che
 *    dipende dalla CLASSE e non da `color-scheme`. Tutta la tavolozza
 *    `light-dark()` restava sul ramo chiaro. Il tema si sceglie dal suo
 *    NEGOZIO (`localStorage.theme`) prima del caricamento, ed è la forma che
 *    `prima-pagina.spec.ts` usa già. Qui poi si **pretende**, con una
 *    `waitForFunction`: uno strumento di misura che non verifica di aver
 *    misurato la cosa giusta è peggio di nessuno strumento.
 * 2. **Qualche token non vive sulla radice**, e va detto invece che registrato
 *    come stringa vuota: sono quelli dichiarati dentro uno scope
 *    (`--home2-*` in `.home2`, `--ctrl-velo` in `.ctrl`, i privati `--_*` del
 *    tema generato). Otto in tutto. Li segna `assente`, così non sembrano
 *    coperti: a loro pensano le schermate, non questo file.
 *
 * 3. 🔴 **Un `.next` sporco serve CSS INCOMPLETO, e lo si scopre solo così.**
 *    La prima impronta è stata presa dopo un `npm run build` fatto sopra la
 *    build di sviluppo lasciata dagli E2E (la trappola di `AGENTS.md` §3,
 *    2026-08-14). Risultato: **62 token semplicemente non c'erano** — tutta la
 *    riga di `@theme inline`, `--color-bg`, `--font-sans`, `--molla-*`,
 *    `--radius-DEFAULT` — e nessun errore da nessuna parte. La build passava,
 *    il sito si apriva, le schermate sembravano giuste.
 *
 *    Da qui la regola operativa: **prima di misurare la produzione si cancella
 *    `.next`**, esattamente come fa `pretest:e2e` per gli E2E. E questo
 *    strumento è il primo posto in cui quel difetto diventa visibile, perché è
 *    l'unico che guarda i token uno per uno.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.IMPRONTA_BASE_URL ?? "http://localhost:3000";
const arg = (n, d) =>
  process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1] ?? d;
const flag = (n) => process.argv.includes(`--${n}`);

const OUT = arg("out", "tests/impronta/token.json");
const URL_PAGINA = arg("url", "/login");
const CONFRONTA = flag("confronta");

/**
 * Le sorgenti da cui si ricavano i NOMI dei token.
 *
 * Derivare l'elenco invece di scriverlo a mano è ciò che rende l'impronta
 * onesta: un token aggiunto entra da solo, e — più importante — un token
 * **rimosso** sparisce dal confronto invece di restare a mentire.
 */
const SORGENTI = [
  "src/themes/generated/pistoia.css",
  "src/app/globals.css",
];

function nomiToken() {
  const visti = new Set();
  for (const file of SORGENTI) {
    if (!fs.existsSync(file)) {
      console.error(`✗ sorgente mancante: ${file}`);
      process.exit(1);
    }
    const css = fs.readFileSync(file, "utf8");
    // Solo le DICHIARAZIONI (`--x:`), non gli usi (`var(--x)`): l'impronta
    // descrive ciò che il sistema definisce, non ciò che consuma.
    for (const m of css.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)) visti.add(m[1]);
  }
  return [...visti].sort();
}

/** I due temi. `chiave` è ciò che si scrive nel negozio di next-themes. */
const TEMI = [
  { nome: "chiaro", chiave: "light" },
  { nome: "scuro", chiave: "dark" },
];

async function leggiTema(page, nomi) {
  return page.evaluate((elenco) => {
    const SENTINELLA = "rgb(1, 2, 3)";
    const genitore = document.createElement("div");
    const sonda = document.createElement("div");
    // Fuori dal flusso e invisibile: la sonda non deve poter spostare nulla né
    // comparire in una schermata presa nello stesso momento.
    genitore.style.cssText =
      "position:absolute;left:-9999px;top:0;color:" + SENTINELLA;
    genitore.appendChild(sonda);
    // Dentro <html> ma FUORI da <body>? No: dentro body, perché i token vivono
    // in un @scope agganciato a <html> e l'ereditarietà li porta comunque qui.
    document.body.appendChild(genitore);

    const out = {};
    for (const nome of elenco) {
      const grezzo = getComputedStyle(document.documentElement)
        .getPropertyValue(nome)
        .trim();

      // 1. colore
      sonda.style.cssText = "";
      sonda.style.color = `var(${nome})`;
      const c = getComputedStyle(sonda).color;
      if (c !== SENTINELLA) {
        out[nome] = { canale: "color", valore: c };
        continue;
      }

      // 2. lunghezza — `padding-left` invalido ricade su `0px`, quindi un
      //    valore vero si distingue da solo. Un token che vale davvero 0px
      //    resta 0px, ed è il valore giusto da registrare.
      sonda.style.cssText = "";
      sonda.style.paddingLeft = `var(${nome})`;
      const p = getComputedStyle(sonda).paddingLeft;
      if (p && p !== "0px") {
        out[nome] = { canale: "lunghezza", valore: p };
        continue;
      }

      // 3. ombra composta
      sonda.style.cssText = "";
      sonda.style.boxShadow = `var(${nome})`;
      const s = getComputedStyle(sonda).boxShadow;
      if (s && s !== "none") {
        out[nome] = { canale: "ombra", valore: s };
        continue;
      }

      // Nessun canale l'ha accettato E non esiste come variabile sulla radice:
      // è una chiave di `@theme inline` o un token dichiarato dentro uno scope.
      out[nome] = grezzo
        ? { canale: "grezzo", valore: grezzo }
        : { canale: "assente", valore: "" };
    }

    genitore.remove();
    return out;
  }, nomi);
}

const nomi = nomiToken();
const browser = await chromium.launch();

const impronta = { url: URL_PAGINA, token: nomi.length, temi: {} };
for (const tema of TEMI) {
  // Un contesto per tema: il negozio va scritto PRIMA del caricamento, e
  // `colorScheme` allinea anche la preferenza di sistema, così `enableSystem`
  // non tira dalla parte opposta.
  const contesto = await browser.newContext({ colorScheme: tema.chiave });
  const page = await contesto.newPage();
  await page.addInitScript((t) => localStorage.setItem("theme", t), tema.chiave);

  const risposta = await page.goto(BASE + URL_PAGINA, { waitUntil: "load" });
  if (!risposta || !risposta.ok()) {
    console.error(
      `✗ ${URL_PAGINA} ha risposto ${risposta?.status() ?? "niente"} — il server è avviato su ${BASE}?`,
    );
    await browser.close();
    process.exit(1);
  }

  // Si PRETENDE il tema, non si assume: è il controllo che avrebbe smascherato
  // subito la prima stesura, che fotografava il chiaro due volte.
  try {
    await page.waitForFunction(
      (t) => document.documentElement.getAttribute("data-theme") === t,
      tema.chiave,
      { timeout: 5_000 },
    );
  } catch {
    console.error(
      `✗ il tema «${tema.nome}» non è stato applicato: <html data-theme> è ` +
        `«${await page.getAttribute("html", "data-theme")}». Senza questo, ` +
        `l'impronta fotograferebbe il tema sbagliato senza dirlo.`,
    );
    await browser.close();
    process.exit(1);
  }

  impronta.temi[tema.nome] = await leggiTema(page, nomi);
  await contesto.close();
}

await browser.close();

/* --------------------------------------------------------------------------
 * Scrittura, oppure confronto
 * ----------------------------------------------------------------------- */

const serializza = (o) => JSON.stringify(o, null, 2) + "\n";

/*
  IL CONTROLLO SULLO STRUMENTO, non sul prodotto.

  Se i due temi risultassero identici, l'impronta sarebbe stata presa due volte
  sullo stesso tema — che è **esattamente** il difetto della prima stesura, e
  non produceva nessun errore: il file veniva scritto, il conteggio era giusto,
  e la metà scura del sistema semplicemente non c'era.
*/
const traTemi = Object.keys(impronta.temi.chiaro).filter(
  (k) => impronta.temi.chiaro[k].valore !== impronta.temi.scuro[k].valore,
);
if (traTemi.length === 0) {
  console.error(
    "✗ chiaro e scuro sono IDENTICI: l'impronta è stata presa due volte sullo " +
      "stesso tema. Non la scrivo — un riferimento cieco sul tema è peggio di " +
      "nessun riferimento.",
  );
  process.exit(1);
}

if (!CONFRONTA) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, serializza(impronta));
  const perCanale = {};
  for (const t of Object.values(impronta.temi.chiaro))
    perCanale[t.canale] = (perCanale[t.canale] ?? 0) + 1;
  console.log(`✓ impronta di ${nomi.length} token → ${OUT}`);
  console.log(
    `  canali: ` +
      Object.entries(perCanale)
        .map(([k, v]) => `${k} ${v}`)
        .join(" · "),
  );
  console.log(`  differiscono fra chiaro e scuro: ${traTemi.length}`);
  process.exit(0);
}

if (!fs.existsSync(OUT)) {
  console.error(`✗ nessuna impronta salvata in ${OUT}: lanciala senza --confronta`);
  process.exit(1);
}

const salvata = JSON.parse(fs.readFileSync(OUT, "utf8"));
const differenze = [];
for (const tema of TEMI.map((t) => t.nome)) {
  const prima = salvata.temi?.[tema] ?? {};
  const dopo = impronta.temi[tema];
  for (const nome of new Set([...Object.keys(prima), ...Object.keys(dopo)])) {
    const a = prima[nome];
    const b = dopo[nome];
    if (!a) differenze.push(`+ ${tema} ${nome} = ${b.valore}`);
    else if (!b) differenze.push(`− ${tema} ${nome} (era ${a.valore})`);
    else if (a.valore !== b.valore)
      differenze.push(`~ ${tema} ${nome}: ${a.valore} → ${b.valore}`);
  }
}

if (differenze.length === 0) {
  console.log(`✓ impronta invariata — ${nomi.length} token, due temi`);
  process.exit(0);
}

console.error(`✗ ${differenze.length} token cambiati rispetto a ${OUT}:\n`);
console.error(differenze.map((d) => "  " + d).join("\n"));
console.error(
  "\nSe il cambiamento è VOLUTO, rilancia senza --confronta per aggiornare l'impronta.",
);
process.exit(1);
