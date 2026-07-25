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
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.SHOTS_BASE_URL ?? "http://localhost:3000";
const arg = (n, d) =>
  process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1] ?? d;

const OUT = arg("out", "screenshots/wave");
const ONLY = arg("only", "")
  .split(",")
  .filter(Boolean);

/** Pagine sotto revisione. `auth: false` = raggiungibile da disconnessi. */
const PAGES = [
  { name: "login", url: "/login", auth: false },
  { name: "la-mia-citta", url: "/la-mia-citta" },
  { name: "bilancio", url: "/bilancio" },
  { name: "segnalazioni", url: "/segnalazioni" },
  { name: "opere", url: "/opere" },
  { name: "proposte", url: "/proposte" },
];

const CREDENTIALS = {
  email: process.env.SHOTS_EMAIL ?? "cittadino@pistoia.it",
  password: process.env.SHOTS_PASSWORD ?? "Pistoia2026",
};

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"]', CREDENTIALS.email);
  await page.fill('input[name="password"]', CREDENTIALS.password);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 20_000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function capture(ctx, theme) {
  const page = await ctx.newPage();
  // next-themes legge da localStorage: impostarlo prima di ogni navigazione
  // evita il flash e rende la cattura deterministica.
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("theme", t);
    } catch {}
  }, theme);

  let authed = false;
  try {
    await login(page);
    authed = true;
  } catch (e) {
    console.warn(`  ⚠ login non riuscito: ${e.message.split("\n")[0]}`);
  }

  for (const p of PAGES) {
    if (ONLY.length && !ONLY.includes(p.name)) continue;
    if (p.auth !== false && !authed) {
      console.warn(`  – salto ${p.name} (richiede sessione)`);
      continue;
    }
    try {
      await page.goto(`${BASE}${p.url}`, {
        waitUntil: "domcontentloaded",
        timeout: 25_000,
      });
      // Scorre tutta la pagina e torna su: i grafici e le sezioni narrate
      // entrano allo scroll, quindi senza questo passaggio verrebbero
      // fotografati vuoti (opacità 0) invece che animati.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });

      // Lascia concludere TUTTE le animazioni d'ingresso prima dello scatto.
      // Il grafico ad andamento è il più lento: disegno del tratto 1,6s più
      // 0,6s di ritardo sul riempimento dell'area = ~2,2s. Sotto questa soglia
      // si fotografa il grafico a metà tracciato e sembra un bug di rendering.
      await page.waitForTimeout(2600);
      const file = path.join(OUT, `${p.name}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`  ✓ ${file}`);
    } catch (e) {
      console.warn(`  ✗ ${p.name}: ${e.message.split("\n")[0]}`);
    }
  }
  await page.close();
}

const browser = await chromium.launch();
fs.mkdirSync(OUT, { recursive: true });

for (const theme of ["light", "dark"]) {
  console.log(`\n${theme}:`);
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
    locale: "it-IT",
    colorScheme: theme,
  });
  await capture(ctx, theme);
  await ctx.close();
}

await browser.close();
console.log(`\nFatto → ${OUT}`);
