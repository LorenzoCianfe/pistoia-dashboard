import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/*
  IL CANCELLO DELLE MISCELE (2026-08-15).

  La transizione giorno↔notte della prima pagina non transisce le proprietà: fa
  camminare un numero, `--tema-t`, e in `globals.css` **ogni token del tema è
  una miscela** fra il proprio valore diurno e il proprio valore notturno. Il
  perché sta scritto sopra `html[data-transizione-tema]`: `color` è ereditata, e
  una transizione CSS su una proprietà ereditata viene ribersagliata a ogni
  fotogramma da quella dell'antenato — il testo non arrivava mai.

  🔴 Il prezzo di quella scelta è che **le coppie di colori sono ricopiate**, e
  metà nascono in un file GENERATO (`src/themes/generated/pistoia.css`, da
  `corepack pnpm theme:build`) che nessuno modifica a mano. Senza un cancello, il
  giorno in cui qualcuno ritocca un token in `pistoia.ts` la transizione
  continuerebbe a girare — convergendo però sul colore VECCHIO, e riscattando
  su quello nuovo solo alla fine. Un difetto che non produce nessun errore, che
  non si vede in una schermata ferma, e che si nota solo guardando la corsa: la
  famiglia di §3.

  Questo test rilegge le due sorgenti e pretende che il blocco delle miscele sia
  esattamente la loro immagine: stessi token, stessi due estremi.
*/

const RADICE = path.resolve(__dirname, "../..");
const GENERATO = path.join(RADICE, "src/themes/generated/pistoia.css");
const GLOBALS = path.join(RADICE, "src/app/globals.css");

/** Divide `a, b` sulla virgola di PRIMO livello: alcuni token hanno un
 *  `color-mix(in srgb, …, …)` dentro un ramo, e uno `split(",")` lo spezzerebbe
 *  nel posto sbagliato. */
function dueRami(dentro: string): [string, string] {
  let profondita = 0;
  for (let i = 0; i < dentro.length; i++) {
    const c = dentro[i];
    if (c === "(") profondita++;
    else if (c === ")") profondita--;
    else if (c === "," && profondita === 0)
      return [dentro.slice(0, i), dentro.slice(i + 1)];
  }
  throw new Error(`nessuna virgola di primo livello in: ${dentro}`);
}

const normalizza = (v: string) => v.trim().replace(/\s+/g, " ").toLowerCase();

/** `--x: light-dark(giorno, notte);` → mappa token → [giorno, notte]. */
function coppieAttese(testo: string) {
  const mappa = new Map<string, [string, string]>();
  // Niente flag `s`: la classe `[^;]*` attraversa già gli a capo da sé, e
  // `dotAll` non è disponibile col target di questo tsconfig.
  const re = /(--[a-z0-9-]+)\s*:\s*light-dark\(([^;]*)\)\s*;/g;
  for (const m of testo.matchAll(re)) {
    const [giorno, notte] = dueRami(m[2]);
    mappa.set(m[1], [normalizza(giorno), normalizza(notte)]);
  }
  return mappa;
}

/** Ritaglia il blocco che comincia con `apertura` fino alla graffa che lo chiude. */
function blocco(testo: string, apertura: string) {
  const inizio = testo.indexOf(apertura);
  expect(inizio, `blocco non trovato: ${apertura}`).toBeGreaterThan(-1);
  let profondita = 0;
  for (let i = testo.indexOf("{", inizio); i < testo.length; i++) {
    if (testo[i] === "{") profondita++;
    else if (testo[i] === "}" && --profondita === 0)
      return testo.slice(inizio, i + 1);
  }
  throw new Error(`blocco non chiuso: ${apertura}`);
}

/** `--x: color-mix(in oklab, notte calc(var(--tema-t, 0) * 100%), giorno);` */
function coppieDichiarate(blocco: string) {
  const mappa = new Map<string, [string, string]>();
  const re = /(--[a-z0-9-]+)\s*:\s*color-mix\(in oklab,\s*([^;]*)\)\s*;/g;
  for (const m of blocco.matchAll(re)) {
    const [ramoNotte, giorno] = dueRami(m[2]);
    const notte = ramoNotte.replace(/calc\(var\(--tema-t, 0\) \* 100%\)\s*$/, "");
    mappa.set(m[1], [normalizza(giorno), normalizza(notte)]);
  }
  return mappa;
}

const generato = fs.readFileSync(GENERATO, "utf8");
const globals = fs.readFileSync(GLOBALS, "utf8");

const miscele = blocco(globals, "html[data-transizione-tema] {");
const attese = new Map([...coppieAttese(generato), ...coppieAttese(globals)]);
const dichiarate = coppieDichiarate(miscele);

/**
 * L'ALTRA METÀ DEL TEMA SCURO: il blocco `.dark` di `globals.css`, che non usa
 * `light-dark()` perché quei valori non sono colori — sono opacità, saturazioni
 * e fili di luce. Restano fermi, il vetro e la grana scattano a metà di una
 * scena che scorre: nel blocco delle miscele ci sono con un `calc()` sulla
 * stessa `--tema-t`, e qui si pretende solo che ci SIANO.
 */
const scuriNonColore = [
  ...blocco(globals, ".dark {").matchAll(/(--[a-z0-9-]+)\s*:/g),
].map((m) => m[1]);

describe("le miscele della transizione giorno↔notte", () => {
  it("il blocco esiste e non è vuoto", () => {
    expect(attese.size).toBeGreaterThan(40);
    expect(dichiarate.size).toBeGreaterThan(40);
    expect(scuriNonColore.length).toBeGreaterThan(0);
  });

  it("ogni token light-dark() ha la sua miscela", () => {
    const mancanti = [...attese.keys()].filter((t) => !dichiarate.has(t));
    expect(
      mancanti,
      `token che cambiano col tema ma NON si accompagnano al filmato:\n  ${mancanti.join("\n  ")}\n` +
        "Aggiungili in globals.css, nel blocco html[data-transizione-tema].",
    ).toEqual([]);
  });

  it("anche ciò che il tema scuro cambia SENZA colori si accompagna", () => {
    const mancanti = scuriNonColore.filter(
      (t) => !new RegExp(`\\${t}\\s*:`).test(miscele),
    );
    expect(
      mancanti,
      `il blocco .dark li cambia, la transizione no — scatterebbero a metà scena:\n  ${mancanti.join("\n  ")}`,
    ).toEqual([]);
  });

  it("nessuna miscela sopravvive a un token che non esiste più", () => {
    const orfane = [...dichiarate.keys()].filter(
      (t) => !attese.has(t) && !scuriNonColore.includes(t),
    );
    expect(
      orfane,
      `miscele senza più un light-dark() corrispondente:\n  ${orfane.join("\n  ")}`,
    ).toEqual([]);
  });

  it("gli estremi combaciano, token per token", () => {
    const divergenti: string[] = [];
    for (const [token, [giorno, notte]] of attese) {
      const mia = dichiarate.get(token);
      if (!mia) continue; // già coperto dal caso sopra
      if (mia[0] !== giorno || mia[1] !== notte)
        divergenti.push(
          `${token}\n    atteso  giorno=${giorno}  notte=${notte}\n    trovato giorno=${mia[0]}  notte=${mia[1]}`,
        );
    }
    expect(
      divergenti,
      "la transizione converge su un colore diverso da quello del tema:\n  " +
        divergenti.join("\n  "),
    ).toEqual([]);
  });
});
