import { describe, it, expect } from "vitest";
import {
  IN_BREVE,
  IN_BREVE_PAGELLA,
  REGISTRO_MODIFICHE,
  REGOLE,
  REGOLE_PAGELLA,
  TIMBRO_METODOLOGIA,
  VERSIONE_METODOLOGIA,
  regolaMetodologia,
} from "@/lib/metodologia";
import {
  MATERIE_PAGELLA,
  SCADENZA_ART14,
  VOTO_MAX,
  VOTO_MIN,
  controlliDi,
  dataItaliana,
  materieDi,
} from "@/lib/pagella";
import {
  CONSERVAZIONE_IP_GIORNI,
  FINESTRA_CONDIZIONE_GIORNI,
  RICHIESTA_SILENZIO_GIORNI,
  SERVIZI,
  STELLE_MAX,
  STELLE_MIN,
} from "@/lib/valutazioni";
import { SILENZIO_POPUP_CHIUSO_GIORNI } from "@/lib/sollecitazioni";
import { CAMPIONE_MINIMO_PER_GIUDIZIO } from "@/lib/citystats";

/*
  IL CANCELLO DELLA FASE (R-6, piano §7): cambiare una costante in un posto
  solo deve cambiare pagina E documento. Questi test lo provano al contrario:
  se qualcuno riscrivesse un numero a mano dentro un testo della metodologia,
  il testo smetterebbe di seguire la costante e il test cadrebbe.
*/

const regola = (id: string) => {
  const r = regolaMetodologia(id);
  expect(r, `la regola «${id}» deve esistere`).not.toBeNull();
  return r!;
};

describe("il documento: versione e registro", () => {
  it("ha una versione, e il timbro la stampa", () => {
    expect(VERSIONE_METODOLOGIA).toBe("1.1");
    expect(TIMBRO_METODOLOGIA).toBe(`metodologia v${VERSIONE_METODOLOGIA}`);
  });

  it("il registro apre sulla versione corrente, con una data vera", () => {
    expect(REGISTRO_MODIFICHE.length).toBeGreaterThan(0);
    const testa = REGISTRO_MODIFICHE[0];
    expect(testa.versione).toBe(VERSIONE_METODOLOGIA);
    expect(testa.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(testa.cosa).toContain("pagella");
  });

  it("il registro è append-only: la voce della v1.0 resta scritta", () => {
    const v10 = REGISTRO_MODIFICHE.find((v) => v.versione === "1.0");
    expect(v10).toBeDefined();
    expect(v10!.cosa).toContain("nessuna soglia");
  });
});

describe("le dodici regole", () => {
  it("sono dodici, con ancore uniche e i quattro campi pieni", () => {
    expect(REGOLE).toHaveLength(12);
    const ids = REGOLE.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of REGOLE) {
      expect(r.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
      for (const campo of [r.titolo, r.regola, r.perche, r.verifica, r.nelCodice]) {
        expect(campo.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("ogni riga «Nel codice» punta a un file, non a un'idea", () => {
    for (const r of REGOLE) expect(r.nelCodice).toMatch(/src\/lib\/[a-z-]+\.ts/);
  });
});

describe("il cancello: i numeri nei testi sono le costanti, non copie", () => {
  it("«che cosa si vota» conta le caselle dal catalogo", () => {
    expect(regola("cosa-si-vota").regola).toContain(`${SERVIZI.length} caselle`);
  });

  it("«la scala» stampa gli estremi veri", () => {
    const r = regola("le-stelle").regola;
    expect(r).toContain(`da ${STELLE_MIN} a ${STELLE_MAX}`);
  });

  it("«nessuna soglia» promette la media dal primo voto, senza numeri minimi", () => {
    const r = regola("nessuna-soglia");
    expect(r.regola).toContain("dal primo voto");
    expect(r.nelCodice).toContain("non esiste una costante di soglia");
  });

  it("«le due cadenze» stampa la finestra mobile", () => {
    expect(regola("le-due-cadenze").regola).toContain(
      `${FINESTRA_CONDIZIONE_GIORNI} giorni`,
    );
  });

  it("«la colonna dura» stampa il campione minimo della mediana", () => {
    expect(regola("la-colonna-dura").regola).toContain(
      `${CAMPIONE_MINIMO_PER_GIUDIZIO} casi chiusi`,
    );
  });

  it("«le sollecitazioni» stampa il contatore e la X del pop-up", () => {
    const r = regola("le-sollecitazioni").regola;
    expect(r).toContain(`${RICHIESTA_SILENZIO_GIORNI} giorni`);
    expect(r).toContain(`${SILENZIO_POPUP_CHIUSO_GIORNI} giorni`);
  });

  it("«le conservazioni» stampa la vita dell'IP", () => {
    expect(regola("le-conservazioni").regola).toContain(
      `${CONSERVAZIONE_IP_GIORNI} giorni`,
    );
  });

  it("anche «in breve» segue le costanti", () => {
    const testo = IN_BREVE.join(" ");
    expect(testo).toContain(`da ${STELLE_MIN} a ${STELLE_MAX}`);
    expect(testo).toContain(`${FINESTRA_CONDIZIONE_GIORNI} giorni`);
    expect(testo).toContain(`${RICHIESTA_SILENZIO_GIORNI} giorni`);
  });
});

describe("il capitolo 2: le otto regole della pagella (v1.1)", () => {
  it("sono otto, coi quattro campi pieni e ancore uniche in TUTTO il documento", () => {
    expect(REGOLE_PAGELLA).toHaveLength(8);
    const tutte = [...REGOLE, ...REGOLE_PAGELLA].map((r) => r.id);
    expect(new Set(tutte).size).toBe(tutte.length);
    for (const r of REGOLE_PAGELLA) {
      expect(r.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
      for (const campo of [r.titolo, r.regola, r.perche, r.verifica, r.nelCodice]) {
        expect(campo.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("ogni riga «Nel codice» punta a un file, non a un'idea", () => {
    for (const r of REGOLE_PAGELLA)
      expect(r.nelCodice).toMatch(/src\/lib\/[a-z-]+\.ts/);
  });

  it("regolaMetodologia trova le regole di entrambi i capitoli", () => {
    expect(regolaMetodologia("nessuna-soglia")).not.toBeNull();
    expect(regolaMetodologia("il-voto-ricontabile")).not.toBeNull();
  });
});

describe("il cancello del capitolo 2: i numeri sono le costanti della pagella", () => {
  it("«chi si giudica» conta materie e regimi dal catalogo", () => {
    const r = regola("chi-si-giudica").regola;
    expect(r).toContain(`${MATERIE_PAGELLA.length}`);
    expect(r).toContain(`${materieDi("voto").length} a voto`);
    expect(r).toContain(`${materieDi("fatti").length} a fatti`);
    expect(r).toContain(`${materieDi("senza-fonte").length} in attesa`);
  });

  it("«il voto si riconta» stampa la scala e i conteggi veri dei controlli", () => {
    const r = regola("il-voto-ricontabile").regola;
    expect(r).toContain(`da ${VOTO_MIN} a ${VOTO_MAX}`);
    expect(r).toContain(`${controlliDi("trasparenza").length} controlli`);
    expect(r).toContain(`${controlliDi("spesa").length} sulla Spesa`);
  });

  it("«la cadenza e il timbro» stampa il termine dell'art. 14 dalla costante", () => {
    expect(regola("la-cadenza-trimestrale").regola).toContain(
      dataItaliana(SCADENZA_ART14),
    );
  });

  it("anche l'«in breve» della pagella segue le costanti", () => {
    const testo = IN_BREVE_PAGELLA.join(" ");
    expect(testo).toContain(`da ${VOTO_MIN} a ${VOTO_MAX}`);
    expect(testo).toContain(dataItaliana(SCADENZA_ART14));
  });
});
