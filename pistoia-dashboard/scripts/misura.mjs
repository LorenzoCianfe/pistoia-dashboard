/**
 * MISURARE LA PRODUZIONE, PARTENDO PULITI.
 *
 * L'unico posto in cui questo repository cancella `.next`, e l'unico modo
 * previsto per produrre l'artefatto su cui si misura. Chi misura non deve
 * ricordarsi di pulire: non può sbagliare, perché non ha la possibilità.
 *
 * Uso:
 *   node scripts/misura.mjs --solo-pulizia          # cancella .next e basta
 *   node scripts/misura.mjs -- <comando…>           # build pulita, poi il comando
 *   node scripts/misura.mjs --server -- <comando…>  # …e tiene su `next start`
 *
 * `--porta=3000` cambia la porta del server; `--base=http://…` la usa per
 * l'attesa di prontezza (serve ai comandi che leggono un indirizzo).
 *
 * ## 🔴 Perché esiste (il 2026-08-15, pagato in una sessione intera)
 *
 * `npm run build` lanciato sopra un `.next` che conteneva la build di SVILUPPO
 * lasciata dagli E2E produce un artefatto **ibrido**, e non lo dichiara: il
 * comando esce 0, il sito si apre, le schermate sembrano giuste. Quello che
 * cambia è tutto ciò che si misura sopra:
 *
 * - **Lighthouse** ha dato `CLS 0,938` con varianza zero su tre passate — un
 *   numero credibilissimo, che è costato una bisezione su quattro commit per
 *   scoprire che il codice non c'entrava. Con `.next` pulito: **0,165**, su
 *   ogni commit, compreso lo stesso HEAD.
 * - **Il foglio di stile era mutilo**: mancavano **62 token** del design
 *   system — l'intera riga di `@theme inline`, `--color-bg`, `--font-sans`,
 *   `--molla-*`, `--radius-DEFAULT`. Se ne è accorta soltanto
 *   `scripts/impronta.mjs`, perché è l'unico strumento che guarda i token uno
 *   per uno; nessun test, nessun cancello, nessuna schermata li vedeva.
 *
 * La trappola era già scritta in `AGENTS.md` §3 (2026-08-14) come nota da
 * ricordare. Ricordarsela non è bastato — quindi adesso non è più una nota:
 * è la sola strada.
 *
 * ⚠️ `pretest:e2e` usa `--solo-pulizia`: gli E2E girano sul server di
 * SVILUPPO, quindi vogliono la pulizia ma non la build di produzione.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const richiedi = createRequire(import.meta.url);

const argv = process.argv.slice(2);
const sep = argv.indexOf("--");
const opzioni = sep === -1 ? argv : argv.slice(0, sep);
const comando = sep === -1 ? [] : argv.slice(sep + 1);

const flag = (n) => opzioni.includes(`--${n}`);
const arg = (n, d) =>
  opzioni.find((a) => a.startsWith(`--${n}=`))?.split("=")[1] ?? d;

const PORTA = arg("porta", "3000");
const BASE = arg("base", `http://localhost:${PORTA}`);

/** L'unica cancellazione di `.next` del repository. */
export function pulisciNext() {
  const dir = path.join(RADICE, ".next");
  fs.rmSync(dir, { recursive: true, force: true });
  return dir;
}

/*
  `shell: true` resta il predefinito perché il comando DA MISURARE arriva dalla
  riga di `package.json` e può essere qualunque cosa (`corepack pnpm dlx …`,
  `taskkill`), cioè nomi che senza shell non si risolvono su Windows. Non c'è
  superficie di iniezione: gli argomenti vengono dagli script, non da un input.

  Chi invoca un binario di `node_modules` passa invece `shell: false` — vedi
  `eseguiNode` qui sotto.

  ⚠️ L'esito è propagato FEDELMENTE. Un processo ucciso da un segnale esce con
  `code === null` e `signal` valorizzato: schiacciarlo su 1 confonderebbe «la
  build ha fallito» con «la build è stata uccisa», e la seconda non è un difetto
  del codice. Si usa la convenzione POSIX 128+n, che è anche ciò che una shell
  riporterebbe.
*/
const esitoDa = (code, signal) => {
  if (code !== null && code !== undefined) return code;
  if (signal) return 128 + (os.constants.signals[signal] ?? 0);
  return 1;
};

const esegui = (cmd, args, opts = {}) =>
  new Promise((risolvi) => {
    const p = spawn(cmd, args, {
      cwd: RADICE,
      stdio: "inherit",
      shell: true,
      ...opts,
    });
    // Senza questo, uno spawn fallito (ENOENT) lascerebbe cadere un'eccezione
    // non gestita invece di diventare un esito rosso leggibile.
    p.on("error", (e) => {
      console.error(`✗ impossibile eseguire ${cmd}: ${e.message}`);
    });
    p.on("close", (code, signal) => risolvi(esitoDa(code, signal)));
  });

/**
 * Esegue un CLI di `node_modules` con QUESTO Node, senza shell.
 *
 * 🔴 Pagato in Fase 2b, in tre modi diversi prima di arrivarci.
 *
 * 1. `npx next build` (la forma originale) muore con npm.
 * 2. `pnpm exec next build` non regge: `pnpm` esiste solo dopo un
 *    `corepack enable`, che su Windows **vuole i permessi di amministratore**
 *    (`EPERM` su `C:\Program Files\nodejs`) — misurato, non supposto. E non
 *    basta invocare lo script *attraverso* pnpm: nel PATH degli script pnpm
 *    mette `node_modules/.bin`, **non sé stesso**. Verificato: da un figlio di
 *    pnpm, `pnpm --version` risponde «non è riconosciuto come comando».
 * 3. `node_modules/.bin/next` con `shell: true` funziona, ma resta appeso alla
 *    shell — e con `shell: true` il percorso non viene quotato, quindi un
 *    percorso assoluto si spezza sugli spazi di «Progetti - AI».
 *
 * La forma che non dipende da nulla di tutto ciò: `process.execPath` più il
 * modulo risolto da Node, con `shell: false`. Niente `.cmd`, niente PATH,
 * niente quoting — quindi il percorso può tornare ASSOLUTO senza rischi.
 * E chi misura non deve sapere quale gestore ha installato le dipendenze.
 */
const eseguiNode = (moduloCli, args, opts = {}) =>
  esegui(process.execPath, [moduloCli, ...args], { shell: false, ...opts });

async function aspettaProntezza(url, tentativi = 60) {
  for (let i = 0; i < tentativi; i++) {
    try {
      const r = await fetch(url, { redirect: "manual" });
      // Qualunque risposta HTTP va bene: il server risponde, ed è ciò che
      // stiamo aspettando. Un 307 verso il login è una risposta.
      if (r.status > 0) return true;
    } catch {
      /* non ancora in ascolto */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

/* ------------------------------------------------------------------------ */

const dir = pulisciNext();
console.log(`✓ ${path.relative(RADICE, dir)} cancellato`);

if (flag("solo-pulizia")) process.exit(0);

if (comando.length === 0) {
  console.error(
    "✗ nessun comando da misurare. Uso: node scripts/misura.mjs [--server] -- <comando…>",
  );
  process.exit(1);
}

/*
  `next/dist/bin/next` è il percorso dichiarato da `bin` nel manifesto di Next,
  e Node lo risolve: verificato che il suo `exports` non lo blocchi (non è
  scontato — `tsx/dist/cli.mjs` risponde `ERR_PACKAGE_PATH_NOT_EXPORTED`).
*/
const NEXT = richiedi.resolve("next/dist/bin/next");
const esitoBuild = await eseguiNode(NEXT, ["build"]);
if (esitoBuild !== 0) {
  console.error(`\n✗ la build è fallita (${esitoBuild}): non c'è niente da misurare.`);
  process.exit(esitoBuild);
}

let server = null;
if (flag("server")) {
  server = spawn(process.execPath, [NEXT, "start", "-p", PORTA], {
    cwd: RADICE,
    stdio: "ignore",
    shell: false,
    detached: false,
  });
  if (!(await aspettaProntezza(BASE))) {
    server.kill();
    console.error(`\n✗ il server non ha risposto su ${BASE} entro 60s.`);
    process.exit(1);
  }
  console.log(`✓ server di produzione su ${BASE}`);
}

const esito = await esegui(comando[0], comando.slice(1));

if (server) {
  // Su Windows `kill()` sul wrapper non ferma sempre il figlio: `taskkill /T`
  // chiude l'albero. Altrove basta il segnale.
  if (process.platform === "win32") {
    await esegui("taskkill", ["/PID", String(server.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else {
    server.kill("SIGTERM");
  }
  console.log("✓ server fermato");
}

process.exit(esito);
