import { describe, it, expect } from "vitest";
import {
  GIUNTA,
  RIGA_GIUNTA,
  RIGA_INCOMPATIBILITA,
  assessori,
  componentiPubblicabili,
  delegheIndicizzate,
  sindaco,
  type Componente,
} from "@/lib/giunta";
import { VOCI } from "@/lib/costo-amministrazione";
import { rigaPubblicabile } from "@/lib/costo-amministrazione";

describe("la giunta è quella vera", () => {
  it("conta nove persone: sindaco, vicesindaca e sette assessori", () => {
    expect(GIUNTA).toHaveLength(9);
    expect(GIUNTA.filter((c) => c.ruolo === "sindaco")).toHaveLength(1);
    expect(GIUNTA.filter((c) => c.ruolo === "vicesindaca")).toHaveLength(1);
    expect(GIUNTA.filter((c) => c.ruolo === "assessore")).toHaveLength(7);
  });

  it("non contiene più i nomi inventati dal seed", () => {
    // /organigramma dava Marco Ferrari sindaco ed Elena Bartolini vicesindaca
    // mentre /trasparenza/costo-amministrazione, a un clic di distanza, dava i
    // nomi veri. Due risposte diverse alla stessa domanda dentro la stessa
    // applicazione: questo test esiste perché non torni.
    const inventati = [
      "Marco Ferrari",
      "Elena Bartolini",
      "Chiara Belli",
      "Davide Innocenti",
      "Sara Niccolai",
      "Francesca Lippi",
      "Tommaso Vannini",
    ];
    for (const nome of inventati) {
      expect(GIUNTA.map((c) => c.nome)).not.toContain(nome);
    }
  });

  it("dice le stesse persone che dice «Il costo dell'amministrazione»", () => {
    // Le due pagine si contraddicevano, ed è il difetto che questa sessione
    // chiude. Il confronto è sui nomi perché è ciò che il lettore vede: se una
    // giunta cambia e si aggiorna un solo modulo, qui diventa rosso.
    const quiSenzaSindaco = new Set(assessori().map((c) => c.nome));
    const laDaCosto = new Set(
      VOCI.filter((v) => v.inGiunta && v.ruolo !== "sindaco").map((v) => v.persona),
    );
    expect([...quiSenzaSindaco].sort()).toEqual([...laDaCosto].sort());
    expect(sindaco()?.nome).toBe(
      VOCI.find((v) => v.ruolo === "sindaco")?.persona,
    );
  });

  it("la vicesindaca è Stefania Nesi e non un'assessora qualunque", () => {
    const vice = GIUNTA.find((c) => c.ruolo === "vicesindaca");
    expect(vice?.nome).toBe("Stefania Nesi");
    // La carica è riprodotta alla lettera, genere compreso: è la formula del
    // Comune per quella persona, non una stringa da ricostruire da un flag.
    expect(vice?.carica).toContain("Vicesindaca");
  });
});

describe("nessun numero di preferenze accanto a una persona reale", () => {
  it("nessun componente porta un conteggio di voti", () => {
    // `votesElected` è stato rimosso dal modello, non riempito con numeri veri:
    // il sindaco non riceve preferenze (è votato sulla scheda del sindaco) e
    // quattro assessori su otto non erano candidati in nessuna lista. Dare il
    // numero agli altri quattro e lasciare vuoto a loro si legge «questi non li
    // ha votati nessuno», che è falso.
    for (const c of GIUNTA) {
      expect(c).not.toHaveProperty("votesElected");
      expect(c).not.toHaveProperty("preferenze");
    }
  });

  it("al suo posto ogni persona dichiara come è arrivata alla carica", () => {
    // È il fatto che sostituisce il numero: vero per tutti e nove, da una
    // fonte sola, e risponde alla domanda che le preferenze fingevano di
    // rispondere.
    for (const c of GIUNTA) {
      expect(c.insediamento.trim().length).toBeGreaterThan(0);
    }
    expect(sindaco()?.insediamento).toContain("27 maggio");
    expect(
      assessori().every((c) => /^Nominat[ao] dal sindaco$/.test(c.insediamento)),
    ).toBe(true);
  });

  it("porta l'atto che spiega perché quel numero non si può mostrare", () => {
    // TUEL art. 64: chi accetta la nomina ad assessore cessa dalla carica di
    // consigliere. Senza questa riga, l'assenza del numero sembra una scelta
    // editoriale invece che un fatto.
    expect(rigaPubblicabile(RIGA_INCOMPATIBILITA)).toBe(true);
    expect(RIGA_INCOMPATIBILITA.urlFonte).toContain("normattiva.it");
  });
});

describe("i recapiti sono letti, non dedotti", () => {
  it("il sindaco non segue lo schema degli assessori", () => {
    // Tutti e otto gli assessori sono `iniziale.cognome@comune.pistoia.it`, il
    // sindaco no. Chi avesse dedotto dallo schema avrebbe sbagliato proprio la
    // persona più in vista della pagina: questo test blocca la scorciatoia.
    expect(sindaco()?.email).toBe("sindaco@comune.pistoia.it");
    expect(sindaco()?.email).not.toBe("g.capecchi@comune.pistoia.it");
  });

  it("ogni persona ha un recapito del dominio del Comune", () => {
    for (const c of GIUNTA) {
      expect(c.email).toMatch(/^[a-z.]+@comune\.pistoia\.it$/);
    }
  });

  it("nessun recapito è ripetuto su due persone", () => {
    const mail = GIUNTA.map((c) => c.email);
    expect(new Set(mail).size).toBe(mail.length);
  });
});

describe("le deleghe vengono dalle schede, una per una", () => {
  it("ogni componente ne dichiara almeno una", () => {
    for (const c of GIUNTA) {
      expect(c.deleghe.length).toBeGreaterThan(0);
    }
  });

  it("l'indice raccoglie le 57 deleghe degli assessori, non quelle del sindaco", () => {
    // I poteri del sindaco glieli attribuisce il TUEL, non un decreto di
    // delega: mescolarli farebbe cercare «Ordinanze» accanto a «Trasporto
    // pubblico locale».
    const indice = delegheIndicizzate();
    expect(indice).toHaveLength(57);
    expect(indice.map((v) => v.componente.ruolo)).not.toContain("sindaco");
    expect(indice).toHaveLength(
      assessori().reduce((n, c) => n + c.deleghe.length, 0),
    );
  });

  it("l'indice è ordinato alfabeticamente e ogni voce sa di chi è", () => {
    const indice = delegheIndicizzate();
    const ordinato = [...indice].sort((a, b) =>
      a.delega.localeCompare(b.delega, "it"),
    );
    expect(indice.map((v) => v.delega)).toEqual(ordinato.map((v) => v.delega));
    for (const v of indice) {
      expect(v.componente.deleghe).toContain(v.delega);
    }
  });

  it("nessuna delega è assegnata a due persone", () => {
    // Due assessori sulla stessa materia sarebbero un errore di trascrizione,
    // e a schermo diventerebbero due risposte alla domanda «chi se ne occupa?».
    const deleghe = delegheIndicizzate().map((v) => v.delega);
    expect(new Set(deleghe).size).toBe(deleghe.length);
  });
});

describe("il rifiuto di chi non porta una fonte", () => {
  it("tutte e nove le persone pubblicate oggi passano il controllo", () => {
    expect(componentiPubblicabili()).toHaveLength(GIUNTA.length);
    expect(rigaPubblicabile(RIGA_GIUNTA)).toBe(true);
  });

  it("ognuno cita la propria scheda, non la notizia collettiva", () => {
    // La notizia del 10 giugno dà la carica ma non le deleghe enumerate, e due
    // schede sono state aggiornate dopo (Nesi il 28 luglio, Giusti il 21). Chi
    // citasse la notizia dichiarerebbe una data di aggiornamento più vecchia
    // del fatto che sta mostrando.
    for (const c of GIUNTA) {
      expect(c.riga.urlFonte).toContain("comune.pistoia.it");
      expect(c.riga.urlFonte).not.toContain("/news/");
      expect(c.aggiornamentoScheda).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("chi perde la fonte sparisce dall'elenco, dall'indice e dal sindaco", () => {
    // La metà che si dimentica: togliere la persona dalla lista ma lasciarne le
    // deleghe nell'indice la farebbe sopravvivere lì, dove nessuno la collega
    // più a una fonte.
    const rotto: Componente = {
      ...GIUNTA[1],
      id: "senza-fonte",
      nome: "Persona Senza Fonte",
      riga: { ...GIUNTA[1].riga, urlFonte: "#" },
    };
    const conRotto = [rotto, ...GIUNTA];
    expect(componentiPubblicabili(conRotto)).toHaveLength(GIUNTA.length);
    expect(delegheIndicizzate(conRotto)).toHaveLength(delegheIndicizzate().length);
    expect(
      delegheIndicizzate(conRotto).map((v) => v.componente.nome),
    ).not.toContain("Persona Senza Fonte");

    const senzaSindaco = [
      { ...GIUNTA[0], riga: { ...GIUNTA[0].riga, urlFonte: "" } },
      ...GIUNTA.slice(1),
    ];
    expect(sindaco(senzaSindaco)).toBeNull();
  });

  it("gli id sono slug stabili e unici: ci si appoggiano i «Segui»", () => {
    // L'id è la chiave della riga `Assessore`. Se cambiasse a ogni riseed —
    // com'era con `@default(cuid())` — ogni «Segui» punterebbe a una riga che
    // non esiste più, e il conteggio tornerebbe a zero senza un errore.
    const ids = GIUNTA.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z]+(-[a-z]+)+$/);
    }
  });
});
