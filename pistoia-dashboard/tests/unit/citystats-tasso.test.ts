import { describe, it, expect } from "vitest";
import {
  STATI_CHIUSI,
  STATI_FUORI_CONTEGGIO,
  STATI_RISOLTI,
  tassoRisoluzione,
} from "@/lib/citystats";

describe("tasso di risoluzione — una definizione sola", () => {
  it("arrotonda all'intero", () => {
    expect(tassoRisoluzione(7, 10)).toBe(70);
    expect(tassoRisoluzione(1, 3)).toBe(33);
  });

  it("con denominatore a zero non è 0%: è un dato che non esiste", () => {
    expect(tassoRisoluzione(0, 0)).toBeNull();
    expect(tassoRisoluzione(0, 10)).toBe(0);
  });

  it("difende il denominatore da negativi", () => {
    expect(tassoRisoluzione(3, -1)).toBeNull();
  });

  it("gli stati fuori conteggio sono tutti anche stati chiusi", () => {
    // Se un giorno divergessero, una segnalazione potrebbe risultare aperta e
    // insieme esclusa dal denominatore: sparirebbe da entrambe le letture.
    for (const s of STATI_FUORI_CONTEGGIO) {
      expect(STATI_CHIUSI).toContain(s);
    }
  });

  it("uno stato risolto non può essere fuori conteggio", () => {
    for (const s of STATI_RISOLTI) {
      expect(STATI_FUORI_CONTEGGIO).not.toContain(s);
      expect(STATI_CHIUSI).toContain(s);
    }
  });
});
