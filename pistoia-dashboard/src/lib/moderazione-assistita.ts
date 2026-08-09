// Helper puri della moderazione assistita (Ondata 8).
// Separati dal data layer per essere unit-testabili, come `citystats.ts` e
// `analitiche.ts`.

import { REPORT_CATEGORIES } from "@/lib/community";

/*
  IL SUGGERIMENTO DI CATEGORIA — e le quattro difese che lo tengono onesto.

  ⚠️ **Parole-spia dichiarate, mai apprese.** La ROADMAP dice «euristiche,
  niente AI», e la ragione non è il costo: un suggerimento che nessuno può
  ricontare è un'opinione con l'aria di un calcolo. Qui la regola è leggibile
  in questo file, e il componente MOSTRA quali parole ha trovato — così il
  moderatore lo verifica in un secondo invece di fidarsi.

  ⚠️ **Il numero che decide non è «quante ne indovina», è «quante ne sbaglia».**
  Misurato sul seed il 2026-08-09: su 42 segnalazioni ne azzecca 25 (60%), ne
  classifica diversamente **6** (14%), su 5 tace perché non trova parole e su 6
  tace perché due categorie pareggiano.

  ⚠️ **E i sei «errori» sono per lo più casi in cui la categoria giusta è
  discutibile** — «Panchina imbrattata ai giardini» è decoro o parchi, «Passaggio
  pedonale al buio» è sicurezza o illuminazione. Questo non assolve il
  suggerimento: lo rende più pericoloso, perché su un giudizio incerto una
  proposta della macchina pesa più di quanto merita e il moderatore ci si
  appoggia senza accorgersene. Da qui le difese: tacere quando non sa, tacere
  quando pareggia, mostrare le prove, e non pre-selezionare mai niente.
*/

/**
 * Le parole che fanno pensare a una categoria.
 *
 * Scritte guardando il dominio — come parla chi segnala — e non il seed: una
 * lista ricavata dai dati dimostrativi andrebbe benissimo su quei dati e male
 * ovunque. Si confrontano in minuscolo e senza accenti, e i troncamenti
 * (`rifiut`, `giardin`) tengono singolare e plurale insieme.
 */
export const PAROLE_SPIA: Record<string, string[]> = {
  buche: ["buca", "buche", "asfalto", "voragine", "avvallamento", "manto stradale"],
  illuminazione: ["lampione", "lampioni", "illuminazione", "lampada", "luce", "luci"],
  rifiuti: ["rifiut", "cassonett", "spazzatura", "immondizia", "discarica", "raccolta"],
  verde: ["sfalcio", "erba", "siepe", "potatura", "ramo", "albero", "alberi"],
  sicurezza: ["pericol", "dissuasor", "sicurezza", "incidente", "velocita"],
  rumore: ["rumore", "rumoros", "schiamazz"],
  trasporto: ["fermata", "autobus", "pensilina", "palina", "corsa", "orari"],
  barriere: ["carrozzina", "barriera", "barriere", "accessibil", "rampa"],
  scuole: ["scuola", "scuole", "scolastic", "asilo"],
  parchi: ["parco", "giardin", "altalena", "giochi", "fontanella", "panchina"],
  animali: ["cane", "cani", "gatto", "gatti", "animal", "deiezion"],
  decoro: ["manifest", "graffit", "degrado", "imbrattat", "abbandonat"],
};

export type SuggerimentoCategoria = {
  categoria: string;
  /**
   * Le prove, e sono **le parole che la persona ha scritto** — non le spie che
   * le hanno riconosciute.
   *
   * ⚠️ La differenza si vede solo a schermo: le spie sono troncate per tenere
   * insieme singolare e plurale (`cassonett`), e mostrare quel troncamento a un
   * cittadino somiglia a un refuso. Su una superficie pubblica un artefatto che
   * pare un errore mina esattamente la fiducia che questo blocco vuole
   * costruire. Quindi si risale alla parola intera del testo: `cassonetto`.
   */
  prove: string[];
};

/**
 * Da una spia troncata alla parola intera che l'ha fatta scattare.
 *
 * ⚠️ Si scorrono le PAROLE, non gli indici. La prima stesura cercava la spia
 * nel testo normalizzato e tagliava l'originale a quella posizione: funziona
 * solo finché le due stringhe hanno la stessa lunghezza, cioè finché gli
 * accenti arrivano precomposti. Con un accento già decomposto in ingresso gli
 * indici scivolano e a schermo finisce **la parola sbagliata** — una prova
 * plausibile e falsa, che è la categoria di difetto che qui costa di più.
 */
function parolaIntera(originale: string, spia: string): string {
  /*
    ⚠️ `\p{M}` accanto a `\p{L}\p{N}`: i segni combinanti sono **Mark**, non
    Letter, quindi senza di loro un accento decomposto vale da separatore e la
    parola si spezza — «velocità» usciva come «velocita», con l'accento
    rimasto fuori. Trovato dal test, non guardando il codice.
  */
  const parole = originale.split(/[^\p{L}\p{N}\p{M}]+/u).filter(Boolean);
  return parole.find((p) => normalizza(p).includes(spia))?.toLowerCase() ?? spia;
}

/** Minuscole e senza accenti: «Velocità» e «velocita» sono la stessa parola. */
function normalizza(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    // I segni diacritici si scrivono con l'escape e non letterali: in un
    // sorgente sarebbero caratteri invisibili, e un editor potrebbe mangiarli.
    .replace(/[\u0300-\u036f]/gu, "");
}

/**
 * La categoria che il testo suggerisce, oppure `null` — e il `null` è la
 * parte importante.
 *
 * Tace in tre casi su quattro in cui potrebbe sbagliare:
 * 1. nessuna parola-spia trovata;
 * 2. due categorie a pari merito in testa (non sa scegliere: non sceglie);
 * 3. la categoria suggerita è già quella scelta — un suggerimento che conferma
 *    non aggiunge niente e occupa spazio con l'aria di un'approvazione.
 */
export function suggerisciCategoria(
  testo: string,
  categoriaAttuale?: string | null,
): SuggerimentoCategoria | null {
  const t = normalizza(testo);

  const esiti = Object.entries(PAROLE_SPIA)
    .map(([categoria, parole]) => ({
      categoria,
      spie: parole.map(normalizza).filter((p) => t.includes(p)),
    }))
    .filter((e) => e.spie.length > 0)
    .sort((a, b) => b.spie.length - a.spie.length);

  if (esiti.length === 0) return null;
  if (esiti.length > 1 && esiti[0].spie.length === esiti[1].spie.length) return null;
  if (categoriaAttuale && esiti[0].categoria === categoriaAttuale) return null;
  // Una categoria fuori dall'elenco ufficiale non si propone.
  if (!REPORT_CATEGORIES.includes(esiti[0].categoria)) return null;

  // Le prove escono come parole intere del testo, e senza ripetizioni: due
  // spie possono cadere nella stessa parola.
  const prove = [...new Set(esiti[0].spie.map((s) => parolaIntera(testo, s)))];
  return { categoria: esiti[0].categoria, prove };
}
