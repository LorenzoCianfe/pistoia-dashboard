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
import path from "node:path";
import { fileURLToPath } from "node:url";

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
  `shell: true` su Windows non è pigrizia: `next` e `npx` sono `.cmd`, e senza
  shell non si risolvono. È la stessa scelta già motivata in
  `tests/e2e/prima-pagina.spec.ts`, e resta senza superficie di iniezione
  perché gli argomenti arrivano dagli script di `package.json`, non da un input.
*/
const esegui = (cmd, args, opts = {}) =>
  new Promise((risolvi) => {
    const p = spawn(cmd, args, {
      cwd: RADICE,
      stdio: "inherit",
      shell: true,
      ...opts,
    });
    p.on("close", (code) => risolvi(code ?? 1));
  });

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

const esitoBuild = await esegui("npx", ["next", "build"]);
if (esitoBuild !== 0) {
  console.error(`\n✗ la build è fallita (${esitoBuild}): non c'è niente da misurare.`);
  process.exit(esitoBuild);
}

let server = null;
if (flag("server")) {
  server = spawn("npx", ["next", "start", "-p", PORTA], {
    cwd: RADICE,
    stdio: "ignore",
    shell: true,
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
