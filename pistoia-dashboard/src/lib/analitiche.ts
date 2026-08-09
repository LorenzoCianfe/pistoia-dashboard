// Helper puri delle analitiche operative dell'Area Comune (Ondata 8).
// Separati dal data layer (server-only + Prisma) per essere unit-testabili,
// come `citystats.ts` — da cui questo modulo IMPORTA la soglia del campione
// invece di riscriverla: due soglie diverse per lo stesso giudizio sono
// peggio di nessuna soglia (`AGENTS.md` §3).

import {
  CAMPIONE_MINIMO_PER_GIUDIZIO,
  STATI_FUORI_CONTEGGIO,
  STATI_RISOLTI,
  campioneSufficiente,
} from "@/lib/citystats";

const GIORNO_MS = 24 * 60 * 60 * 1000;

/** Il minimo che serve sapere di una segnalazione per aggregarla. */
export type RigaAnalitica = {
  status: string;
  category: string;
  assignedDepartment: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
};

/**
 * La mediana, non la media.
 *
 * Una sola segnalazione ferma da mesi sposta la media di un ufficio di
 * settimane e racconta una lentezza che quell'ufficio non ha. La mediana dice
 * «la metà delle volte ci mette meno di così», che è la frase che un operatore
 * può usare. `null` con zero casi: con nessuna chiusa il tempo di chiusura non
 * è «0 giorni», non esiste — la stessa regola di `tassoRisoluzione`.
 */
export function medianaGiorni(durate: number[]): number | null {
  if (durate.length === 0) return null;
  const s = [...durate].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  const g = s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  return Math.round(g * 10) / 10;
}

const risolta = (r: RigaAnalitica) => (STATI_RISOLTI as readonly string[]).includes(r.status);
const conteggiabile = (r: RigaAnalitica) =>
  !(STATI_FUORI_CONTEGGIO as readonly string[]).includes(r.status);

/** Una voce dell'aggregazione: un ufficio, oppure una categoria. */
export type VoceAnalitica = {
  chiave: string;
  /** Non chiuse: il lavoro che quella voce ha davanti adesso. */
  aperte: number;
  /** Chiuse con una data di chiusura, cioè quelle su cui la mediana poggia. */
  chiuse: number;
  /** Giorni mediani fra apertura e chiusura, o `null` se non ce ne sono. */
  medianaGiorni: number | null;
  /** Vero se il campione regge un giudizio (`citystats`, soglia unica). */
  giudicabile: boolean;
};

function aggrega(righe: RigaAnalitica[], chiave: (r: RigaAnalitica) => string | null) {
  const per = new Map<string, RigaAnalitica[]>();
  for (const r of righe) {
    const k = chiave(r);
    if (k === null) continue;
    const gruppo = per.get(k);
    if (gruppo) gruppo.push(r);
    else per.set(k, [r]);
  }
  const voci: VoceAnalitica[] = [];
  for (const [chiaveVoce, gruppo] of per) {
    const durate = gruppo
      .filter((r) => risolta(r) && r.resolvedAt)
      .map((r) => (r.resolvedAt!.getTime() - r.createdAt.getTime()) / GIORNO_MS);
    voci.push({
      chiave: chiaveVoce,
      aperte: gruppo.filter((r) => conteggiabile(r) && !risolta(r)).length,
      chiuse: durate.length,
      medianaGiorni: medianaGiorni(durate),
      giudicabile: campioneSufficiente(gruppo.filter(conteggiabile).length),
    });
  }
  return voci;
}

export type AnaliticheOperative = {
  /** Gli uffici veri, dal più veloce al più lento. */
  uffici: VoceAnalitica[];
  /**
   * Le segnalazioni che nessun ufficio ha preso in carico.
   *
   * ⚠️ **Fuori dalla classifica per costruzione, non per convenzione.** Sul
   * seed sono 6 aperte e 0 chiuse: messe fra gli uffici diventerebbero la riga
   * più lenta e più rossa della pagina, attribuita a un ufficio **che non
   * esiste**. È la trappola dell'ondata 7 («una percentuale su un campione
   * minuscolo, tinta a colori, è un'accusa»), aggravata dal fatto che qui non
   * c'è nessuno da accusare. Il numero resta, e dice un'altra cosa: quante
   * segnalazioni non sono di nessuno.
   */
  senzaUfficio: { aperte: number; chiuse: number };
  /** Solo le categorie il cui campione regge: le altre si dichiarano, non si mostrano. */
  categorie: VoceAnalitica[];
  /** Quante categorie sono state omesse perché sotto la soglia. */
  categorieMute: number;
  /** La soglia, per poterla nominare in pagina invece di lasciarla implicita. */
  soglia: number;
};

/**
 * Le due letture del cruscotto, da tutte le segnalazioni.
 *
 * ⚠️ Vuole **tutte** le righe, mai un `take`: è l'aggregazione che le riduce,
 * e un troncamento a monte produrrebbe numeri plausibili e sbagliati — la
 * trappola 2 dell'ondata 7, dove un conteggio ricavato da `findMany({ take: 6 })`
 * non poteva superare sei e nessuno se ne accorgeva.
 */
export function analiticheOperative(righe: RigaAnalitica[]): AnaliticheOperative {
  const uffici = aggrega(righe, (r) => r.assignedDepartment).sort(
    (a, b) => (a.medianaGiorni ?? Infinity) - (b.medianaGiorni ?? Infinity),
  );

  const orfane = righe.filter((r) => !r.assignedDepartment && conteggiabile(r));

  const tutteLeCategorie = aggrega(righe, (r) => r.category);
  const categorie = tutteLeCategorie
    .filter((c) => c.giudicabile)
    .sort((a, b) => (a.medianaGiorni ?? Infinity) - (b.medianaGiorni ?? Infinity));

  return {
    uffici,
    senzaUfficio: {
      aperte: orfane.filter((r) => !risolta(r)).length,
      chiuse: orfane.filter(risolta).length,
    },
    categorie,
    categorieMute: tutteLeCategorie.length - categorie.length,
    soglia: CAMPIONE_MINIMO_PER_GIUDIZIO,
  };
}
