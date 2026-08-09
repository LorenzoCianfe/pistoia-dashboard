import { describe, expect, it } from "vitest";
import {
  analiticheOperative,
  medianaGiorni,
  type RigaAnalitica,
} from "@/lib/analitiche";
import { CAMPIONE_MINIMO_PER_GIUDIZIO } from "@/lib/citystats";

const GIORNO = 24 * 60 * 60 * 1000;
const BASE = new Date("2026-06-01T09:00:00Z");

function riga(p: Partial<RigaAnalitica> & { giorni?: number }): RigaAnalitica {
  const { giorni, ...resto } = p;
  return {
    status: "risolta",
    category: "buche",
    assignedDepartment: "Ufficio Strade",
    createdAt: BASE,
    resolvedAt: giorni === undefined ? null : new Date(BASE.getTime() + giorni * GIORNO),
    ...resto,
  };
}

describe("medianaGiorni", () => {
  it("con zero casi non è «0 giorni»: non esiste", () => {
    // Stessa regola di `tassoRisoluzione`: un'assenza non si decora con uno zero.
    expect(medianaGiorni([])).toBeNull();
  });

  it("è la mediana, non la media — ed è tutta la ragione per cui esiste", () => {
    // Quattro pratiche svelte e una ferma da un anno: la media direbbe 74
    // giorni, cioè racconterebbe una lentezza che quell'ufficio non ha.
    const durate = [1, 2, 3, 4, 365];
    expect(medianaGiorni(durate)).toBe(3);
    const media = durate.reduce((a, b) => a + b, 0) / durate.length;
    expect(Math.round(media)).toBe(75);
  });

  it("su un numero pari di casi sta in mezzo ai due centrali", () => {
    expect(medianaGiorni([2, 4])).toBe(3);
    expect(medianaGiorni([1, 2, 3, 10])).toBe(2.5);
  });

  it("arrotonda al decimo, perché in pagina si legge un decimale", () => {
    expect(medianaGiorni([1, 2, 2.26])).toBe(2);
    expect(medianaGiorni([3.33])).toBe(3.3);
  });
});

describe("analiticheOperative · gli uffici", () => {
  it("tiene le segnalazioni senza ufficio FUORI dalla classifica", () => {
    /*
      È la regola che ha deciso la forma. Sul seed erano 6 aperte e 0 chiuse:
      dentro l'elenco sarebbero state la riga più lenta e più rossa della
      pagina, attribuita a un ufficio che non esiste.
    */
    const righe = [
      riga({ assignedDepartment: "Ufficio Verde", giorni: 4 }),
      riga({ assignedDepartment: null, status: "ricevuta" }),
      riga({ assignedDepartment: null, status: "in_lavorazione" }),
    ];
    const a = analiticheOperative(righe);

    expect(a.uffici.map((u) => u.chiave)).toEqual(["Ufficio Verde"]);
    expect(a.senzaUfficio).toEqual({ aperte: 2, chiuse: 0 });
  });

  it("ordina dal più veloce al più lento, e chi non ha chiuse sta in fondo", () => {
    const righe = [
      riga({ assignedDepartment: "Lento", giorni: 25 }),
      riga({ assignedDepartment: "Svelto", giorni: 5 }),
      riga({ assignedDepartment: "Mai chiuso", status: "ricevuta" }),
    ];
    expect(analiticheOperative(righe).uffici.map((u) => u.chiave)).toEqual([
      "Svelto",
      "Lento",
      "Mai chiuso",
    ]);
  });

  it("non conta fra le aperte ciò che è uscito dal conteggio", () => {
    // Un duplicato non è lavoro che l'ufficio deve ancora fare.
    const righe = [
      riga({ assignedDepartment: "X", status: "duplicata" }),
      riga({ assignedDepartment: "X", status: "non_di_competenza" }),
      riga({ assignedDepartment: "X", status: "ricevuta" }),
    ];
    expect(analiticheOperative(righe).uffici[0].aperte).toBe(1);
  });
});

describe("analiticheOperative · le categorie", () => {
  it("mostra solo le categorie sopra la soglia, e dichiara quante ne tace", () => {
    const molte = Array.from({ length: CAMPIONE_MINIMO_PER_GIUDIZIO }, () =>
      riga({ category: "rifiuti", giorni: 3 }),
    );
    const poche = [riga({ category: "rumore", giorni: 2 })];
    const a = analiticheOperative([...molte, ...poche]);

    expect(a.categorie.map((c) => c.chiave)).toEqual(["rifiuti"]);
    expect(a.categorieMute).toBe(1);
    expect(a.soglia).toBe(CAMPIONE_MINIMO_PER_GIUDIZIO);
  });

  it("la soglia è quella di citystats, non una copia", () => {
    // Due soglie diverse per lo stesso giudizio sono peggio di nessuna soglia:
    // se `citystats` cambia, questa pagina cambia con lei.
    const alSoglia = Array.from({ length: CAMPIONE_MINIMO_PER_GIUDIZIO }, () =>
      riga({ category: "verde", giorni: 1 }),
    );
    expect(analiticheOperative(alSoglia).categorie).toHaveLength(1);
    expect(analiticheOperative(alSoglia.slice(1)).categorie).toHaveLength(0);
  });
});

describe("analiticheOperative · su nessuna segnalazione", () => {
  it("non inventa niente e non esplode", () => {
    const a = analiticheOperative([]);
    expect(a.uffici).toEqual([]);
    expect(a.categorie).toEqual([]);
    expect(a.categorieMute).toBe(0);
    expect(a.senzaUfficio).toEqual({ aperte: 0, chiuse: 0 });
  });
});
