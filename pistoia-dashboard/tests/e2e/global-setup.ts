import { execSync } from "node:child_process";
import fs from "node:fs";
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
  // `execSync` passa da una shell, ma qui i comandi sono costanti scritte a
  // mano: nessun input esterno viene interpolato, quindi non c'è superficie di
  // command injection. La shell serve davvero, perché su Windows `npx` è un
  // `.cmd` che `execFile` senza shell non saprebbe risolvere.
  execSync("npx prisma migrate deploy", { stdio: "inherit", env });
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env });

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
