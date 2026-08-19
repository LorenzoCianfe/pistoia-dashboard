import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

/*
  Database dedicato agli E2E (Fase A, A-0.1).

  Prima i test scrivevano nel database di SVILUPPO e non ripulivano mai. Due
  conseguenze, entrambe osservate:

  1. Sei segnalazioni su sedici erano residui con "E2E" nel titolo, e
     comparivano in home sotto «Vicino a te» — su un progetto il cui scopo è
     mostrarsi.
  2. Il cittadino di test aveva votato tutte e quattro le domande della
     sessione aperta di question time. `territorio.spec.ts` cerca un pulsante
     «vota questa domanda» che a quel punto non esisteva più su nessuna
     domanda: dopo quattro esecuzioni la suite si era avvelenata da sola e non
     poteva più passare.

  Il database dei test è quindi separato e ricreato da zero a ogni esecuzione.
  I test possono tornare a dare per scontato lo stato del seed.
*/

const DB_FILE = "prisma/e2e.db";

/*
  I CLI SI INVOCANO CON QUESTO NODE, non attraverso un gestore di pacchetti.

  🔴 Pagato in Fase 2b. La conversione ovvia di `npx prisma …` era
  `pnpm exec prisma …`, e non regge dove serve di più: `pnpm` esiste solo dopo
  `corepack enable`, che su Windows **vuole i permessi di amministratore**
  (`EPERM` su `C:\Program Files\nodejs`). Peggio: nel PATH degli script pnpm
  mette `node_modules/.bin`, **non sé stesso** — quindi nemmeno lanciare la
  suite con `pnpm test:e2e` rende `pnpm` visibile da qui. Misurato: da un figlio
  di pnpm, `pnpm --version` risponde «non è riconosciuto come comando».

  Il sintomo sarebbe stato un `globalSetup` rosso su un database mai migrato,
  cioè l'intera suite caduta per una ragione che non ha niente a che vedere coi
  test — la categoria di rossi che AGENTS.md §3 (2026-08-11) insegna a
  riconoscere e che costa più di tutte.

  Si legge il `bin` dal manifesto invece di comporre il percorso a mano perché
  la scorciatoia NON è generale: `prisma/build/index.js` si risolve,
  `tsx/dist/cli.mjs` no — il suo `exports` risponde
  `ERR_PACKAGE_PATH_NOT_EXPORTED`. Il manifesto è l'unica fonte che vale per
  tutti e due.

  `process.cwd()` come ancora: questo file lo usa già per il database, e
  Playwright gira dalla radice del progetto.
*/
const richiedi = createRequire(path.join(process.cwd(), "package.json"));

function cliDi(pacchetto: string): string {
  const manifesto = richiedi.resolve(`${pacchetto}/package.json`);
  const bin = richiedi(`${pacchetto}/package.json`).bin as
    | string
    | Record<string, string>;
  const relativo = typeof bin === "string" ? bin : bin[pacchetto];
  return path.join(path.dirname(manifesto), relativo);
}

export default function globalSetup() {
  // Con `E2E_BASE_URL` i test girano contro un server GIÀ IN ASCOLTO, e il
  // database lo ha scelto quel server all'avvio: da qui non è isolabile.
  // È il compromesso di quella modalità — comoda in sviluppo, e il motivo per
  // cui resta documentata in AGENTS.md §4.
  if (process.env.E2E_BASE_URL) {
    console.log(
      "[e2e] server esterno: i test useranno il SUO database, non quello isolato.",
    );
    return;
  }

  // Nota sul perché l'avvio automatico è la modalità buona: non è solo il
  // database. Il rate-limit dell'accesso vive in una `Map` in memoria, cioè
  // nel processo del server. Contro un server di lunga durata i tentativi di
  // login si sommano fra esecuzioni finché la suite intera cade su «Troppi
  // tentativi di accesso», che non somiglia affatto a un difetto di
  // rate-limit. Un processo nuovo a ogni esecuzione parte con il contatore a
  // zero, oltre che con il database al seed.

  for (const f of [DB_FILE, `${DB_FILE}-journal`]) {
    fs.rmSync(path.resolve(process.cwd(), f), { force: true });
  }

  // La cassetta d'uscita delle email (src/lib/email.ts scrive un file per
  // messaggio in `.email/`). Va svuotata per la stessa ragione del database:
  // un test che «riceve la mail» leggendo la cassetta non deve poter pescare
  // quella di un'esecuzione precedente — le azioni si accumulano anche quando
  // i dati no (AGENTS.md §3, Fase A, 2). Il percorso è replicato alla lettera
  // qui e negli spec perché `server-only` impedisce di importare il modulo.
  fs.rmSync(path.resolve(process.cwd(), ".email"), {
    recursive: true,
    force: true,
  });

  const env = { ...process.env, DATABASE_URL: `file:./${DB_FILE}` };
  // Niente shell: si passa il modulo a `node`, quindi non c'è nulla da
  // risolvere nel PATH e nulla da quotare — e il percorso di questo progetto
  // contiene spazi («Progetti - AI»), che con una shell di mezzo si spezzano.
  const opzioni = { stdio: "inherit", env } as const;
  execFileSync(process.execPath, [cliDi("prisma"), "migrate", "deploy"], opzioni);
  execFileSync(process.execPath, [cliDi("tsx"), "prisma/seed.ts"], opzioni);

  /*
    ⚠️ **Gli atti NON si seminano qui**, ed è una lezione pagata il 2026-08-12.

    Il primo tentativo li metteva in questo punto, per dare alla prima pagina un
    archivio vero sotto i cancelli. Ha fatto cadere `analitiche.spec.ts` → «il
    monitor degli atti dice la verità su una base dati mai letta», che esiste
    **proprio perché** `e2e.db` nasce vuoto — e quel vuoto non è un caso di
    laboratorio: è **lo stato della produzione** finché la lettura schedulata
    non esiste.

    La semina è quindi circoscritta a `prima-pagina.spec.ts`, che la fa e la
    disfa (`tests/e2e/semina-atti.ts`). La regola generale: **una copertura
    nuova non si compra spegnendo una copertura che c'è già.**
  */
}
