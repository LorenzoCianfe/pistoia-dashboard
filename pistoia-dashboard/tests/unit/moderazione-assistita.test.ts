import { describe, expect, it } from "vitest";
import { PAROLE_SPIA, suggerisciCategoria } from "@/lib/moderazione-assistita";
import { REPORT_CATEGORIES } from "@/lib/community";

/*
  Il suggerimento di categoria vale per quando TACE, non per quando parla: è
  una proposta su una superficie del Comune, e su un giudizio incerto pesa più
  di quanto merita. Questi test difendono i quattro silenzi.
*/

describe("suggerisciCategoria · i quattro silenzi", () => {
  it("tace se non trova nessuna parola-spia", () => {
    expect(suggerisciCategoria("Buongiorno, volevo scrivere una cosa")).toBeNull();
  });

  it("tace se due categorie pareggiano: non sa scegliere, non sceglie", () => {
    // «lampione» → illuminazione (1), «panchina» → parchi (1): pari merito.
    expect(suggerisciCategoria("Lampione e panchina")).toBeNull();
  });

  it("tace se propone la categoria già scelta: confermare non è informare", () => {
    const testo = "Lampione spento in Via Roma";
    expect(suggerisciCategoria(testo)?.categoria).toBe("illuminazione");
    expect(suggerisciCategoria(testo, "illuminazione")).toBeNull();
  });

  it("tace su una stringa vuota", () => {
    expect(suggerisciCategoria("")).toBeNull();
    expect(suggerisciCategoria("   ")).toBeNull();
  });
});

describe("suggerisciCategoria · quando parla, porta le prove", () => {
  it("mostra le PAROLE INTERE del testo, non le spie troncate", () => {
    /*
      Le spie sono troncate per tenere insieme singolare e plurale
      (`cassonett`, `rifiut`), ma quel troncamento a schermo somiglia a un
      refuso — e su una superficie pubblica un artefatto che pare un errore
      mina la fiducia che il blocco vuole costruire. Le prove sono le parole
      che la persona ha scritto.
    */
    const s = suggerisciCategoria("Cassonetto ribaltato, rifiuti ovunque", "verde");
    expect(s?.categoria).toBe("rifiuti");
    expect(s?.prove).toEqual(expect.arrayContaining(["cassonetto", "rifiuti"]));
    expect(s?.prove).not.toContain("cassonett");
  });

  it("non ripete la stessa parola se due spie ci cadono dentro", () => {
    const s = suggerisciCategoria("Lampione, lampioni e illuminazione", "verde");
    expect(new Set(s?.prove).size).toBe(s?.prove.length);
  });

  it("non si fa fermare dagli accenti, e restituisce la parola accentata", () => {
    const s = suggerisciCategoria("Segnalo eccesso di velocità sulla via", "verde");
    expect(s?.categoria).toBe("sicurezza");
    expect(s?.prove).toContain("velocità");
  });

  it("regge anche un accento DECOMPOSTO in ingresso", () => {
    /*
      «velocità» con l'accento già decomposto (a + U+0300) è più lunga di un
      carattere della sua forma normalizzata. Una ricerca per indice qui
      taglierebbe la parola sbagliata e mostrerebbe una prova falsa; scorrendo
      le parole il problema non esiste.
    */
    const precomposta = "Segnalo eccesso di velocità sulla via";
    const decomposta = precomposta.normalize("NFD");
    // La prova che le due stringhe sono davvero diverse: se un giorno lo
    // smettessero, questo test non proverebbe più niente.
    expect(decomposta.length).toBeGreaterThan(precomposta.length);

    const s = suggerisciCategoria(decomposta, "verde");
    expect(s?.categoria).toBe("sicurezza");
    expect(s?.prove[0].normalize("NFC")).toBe("velocità");
  });

  it("vince chi ha più prove, non chi viene prima nell'elenco", () => {
    const s = suggerisciCategoria(
      "Giardini con altalena e giochi rotti, e un lampione spento",
      "verde",
    );
    expect(s?.categoria).toBe("parchi");
  });
});

describe("PAROLE_SPIA", () => {
  it("non propone categorie che non esistono", () => {
    // Una spia su una categoria fuori elenco produrrebbe un suggerimento che
    // la tendina del modulo non può nemmeno accettare.
    for (const categoria of Object.keys(PAROLE_SPIA)) {
      expect(REPORT_CATEGORIES).toContain(categoria);
    }
  });

  it("non ha parole troppo corte, che pescherebbero dentro altre parole", () => {
    for (const [categoria, parole] of Object.entries(PAROLE_SPIA)) {
      for (const p of parole) {
        expect(p.length, `${categoria}: «${p}»`).toBeGreaterThanOrEqual(4);
      }
    }
  });
});
