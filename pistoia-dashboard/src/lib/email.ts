import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Invio email — l'unico canale della piattaforma verso una casella di posta.
 *
 * **Zero dipendenze, per decisione** (Lorenzo, 2026-08-03, fase R-3 delle
 * Valutazioni). Le tre scelte, prese separatamente:
 *
 * 1. **Il trasporto di produzione sarà `fetch` verso l'API HTTP di un
 *    provider** — configurazione, non codice: nessun SDK, nessun pacchetto
 *    SMTP. Su un servizio pubblico ogni pacchetto è superficie di manutenzione
 *    (`AGENTS.md` §2), e qui non comprerebbe niente.
 * 2. **Il provider si sceglie quando il progetto avrà un dominio.** Senza un
 *    dominio con SPF/DKIM nessun provider consegna in modo affidabile, quindi
 *    scegliere oggi vincolerebbe senza abilitare. Quando accadrà: residenza EU
 *    preferita, e il provider va dichiarato su `/privacy` come responsabile
 *    del trattamento. Fino ad allora questo modulo NON ha un ramo di
 *    produzione: {@link sendEmail} in produzione rifiuta, forte e chiaro.
 * 3. **In sviluppo e nei test ogni messaggio è un file** in `.email/`
 *    ({@link EMAIL_DIR}). Non è un ripiego: è ciò che rende la mail
 *    verificabile — l'E2E la «riceve» leggendo il file, la demo la mostra
 *    aprendolo — senza che nulla lasci la macchina. Il percorso è replicato
 *    alla lettera in `tests/e2e/global-setup.ts` (che svuota la cartella) e
 *    negli spec E2E, che non possono importare questo modulo per via di
 *    `server-only`.
 */

export type EmailDaInviare = {
  to: string;
  subject: string;
  /** Testo semplice. Niente HTML: una mail di conferma non ne ha bisogno. */
  text: string;
};

/** La cassetta d'uscita di sviluppo, relativa alla radice dell'app. */
export const EMAIL_DIR = ".email";

/**
 * Vero quando un invio può andare a buon fine. Le azioni lo controllano PRIMA
 * di scrivere il voto: meglio rifiutare subito che lasciare mezzo flusso —
 * voto registrato, mail mai partita.
 */
export function emailConfigurata(): boolean {
  return process.env.NODE_ENV !== "production";
}

export async function sendEmail(msg: EmailDaInviare): Promise<void> {
  if (!emailConfigurata()) {
    // Non è un TODO dimenticato: è la guardia della decisione 2026-08-03.
    // Il ramo di produzione si scrive quando esiste il dominio e il provider.
    throw new Error(
      "Invio email non configurato in produzione: il trasporto si sceglie " +
        "insieme al dominio (docs/piano-rating-servizi.md §8).",
    );
  }
  await scriviSuFile(msg, path.join(process.cwd(), EMAIL_DIR));
}

/**
 * Il trasporto file, separato e con la cartella esplicita perché i test
 * unitari possano puntarlo su una directory temporanea.
 */
export async function scriviSuFile(
  msg: EmailDaInviare,
  dir: string,
): Promise<string> {
  await fs.mkdir(dir, { recursive: true });
  // Il timestamp ordina, il suffisso casuale evita la collisione di due invii
  // nello stesso millisecondo (visto negli E2E, dove i voti sono ravvicinati).
  const nome = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}.json`;
  const file = path.join(dir, nome);
  await fs.writeFile(
    file,
    JSON.stringify({ ...msg, sentAt: new Date().toISOString() }, null, 2),
    "utf8",
  );
  console.log(`[email] → ${msg.to} · «${msg.subject}» · ${path.join(dir, nome)}`);
  return file;
}
