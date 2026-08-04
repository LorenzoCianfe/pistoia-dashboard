import "server-only";
import { prisma } from "@/lib/db";
import { SERVIZI, periodoDi, servizio as trovaServizio } from "@/lib/valutazioni";
import {
  inPubblicoCampagna,
  periodoPrecedente,
  puoSollecitare,
  type StatoSollecitazioni,
} from "@/lib/sollecitazioni";

/*
  Le letture del contatore unico (R-5). Le REGOLE stanno in
  `lib/sollecitazioni.ts` (pure, provate a date fisse); qui solo le query che
  le alimentano. L'identità di chi vota è l'email, l'ancora del contatore è
  l'account: per «l'ultimo voto» valgono entrambe le strade — un voto lasciato
  dal QR con l'email dell'account è pur sempre una risposta già data.
*/

const ID_CONDIZIONI = SERVIZI.filter((s) => s.famiglia === "condizione").map(
  (s) => s.id,
);

export type PersonaContatore = { id: string; email: string };

export async function getStatoSollecitazioni(
  persona: PersonaContatore,
): Promise<StatoSollecitazioni & { popupChiusoIl: Date | null }> {
  const [ultima, voto, popupChiusa] = await Promise.all([
    prisma.sollecitazione.findFirst({
      where: { userId: persona.id },
      orderBy: { mostrataIl: "desc" },
      select: { mostrataIl: true },
    }),
    prisma.valutazione.findFirst({
      where: {
        OR: [{ userId: persona.id }, { email: persona.email }],
        rimossaIl: null,
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.sollecitazione.findFirst({
      where: { userId: persona.id, canale: "popup", esito: "chiusa" },
      orderBy: { mostrataIl: "desc" },
      select: { esitoIl: true, mostrataIl: true },
    }),
  ]);
  return {
    ultimaSollecitazione: ultima?.mostrataIl ?? null,
    ultimoVoto: voto?.createdAt ?? null,
    popupChiusoIl: popupChiusa ? (popupChiusa.esitoIl ?? popupChiusa.mostrataIl) : null,
  };
}

/** I periodi (`AAAA-MM`) in cui la persona ha valutato una condizione. */
export async function getPeriodiVotoCondizioni(
  persona: PersonaContatore,
  periodi: string[],
): Promise<{ periodo: string; servizioId: string }[]> {
  return prisma.valutazione.findMany({
    where: {
      OR: [{ userId: persona.id }, { email: persona.email }],
      rimossaIl: null,
      servizioId: { in: ID_CONDIZIONI },
      periodo: { in: periodi },
    },
    select: { periodo: true, servizioId: true },
    distinct: ["periodo", "servizioId"],
  });
}

/** Vero se la persona ha già valutato quel servizio in quel periodo. */
export async function haVotatoNelPeriodo(
  persona: PersonaContatore,
  servizioId: string,
  periodo: string,
): Promise<boolean> {
  const v = await prisma.valutazione.findFirst({
    where: {
      OR: [{ userId: persona.id }, { email: persona.email }],
      servizioId,
      periodo,
      rimossaIl: null,
    },
    select: { id: true },
  });
  return v != null;
}

export type CampagnaPersona = {
  /** La card in home si mostra (pubblico giusto, nessun esito, finestra ok). */
  mostra: boolean;
  /** Vero quando la mostra è NUOVA: il beacon del client deve registrarla. */
  daRegistrare: boolean;
  /** I nomi delle condizioni votate il mese scorso e non ancora rinnovate. */
  serviziRinnovabili: string[];
};

/**
 * La campagna mensile per questa persona (ingresso B).
 *
 * La card resta a schermo finché non riceve un esito — è la stessa domanda
 * ancora aperta, non una nuova — quindi qui la finestra si controlla solo
 * per la PRIMA mostra del mese; dopo, comanda l'esito della riga.
 */
export async function getCampagnaPersona(
  persona: PersonaContatore,
  oggi: Date,
): Promise<CampagnaPersona> {
  const corrente = periodoDi(oggi);
  const precedente = periodoPrecedente(corrente);
  const voti = await getPeriodiVotoCondizioni(persona, [corrente, precedente]);

  const periodi = [...new Set(voti.map((v) => v.periodo))];
  if (!inPubblicoCampagna(oggi, periodi)) {
    return { mostra: false, daRegistrare: false, serviziRinnovabili: [] };
  }

  const rinnovate = new Set(
    voti.filter((v) => v.periodo === corrente).map((v) => v.servizioId),
  );
  const serviziRinnovabili = voti
    .filter((v) => v.periodo === precedente && !rinnovate.has(v.servizioId))
    .map((v) => trovaServizio(v.servizioId)?.nome)
    .filter((n): n is string => n != null);

  const inizioMese = new Date(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth(), 1));
  const rigaDelMese = await prisma.sollecitazione.findFirst({
    where: { userId: persona.id, canale: "campagna", mostrataIl: { gte: inizioMese } },
    orderBy: { mostrataIl: "desc" },
    select: { esito: true },
  });

  if (rigaDelMese) {
    return {
      mostra: rigaDelMese.esito == null,
      daRegistrare: false,
      serviziRinnovabili,
    };
  }

  const stato = await getStatoSollecitazioni(persona);
  const libera = puoSollecitare(oggi, stato);
  return { mostra: libera, daRegistrare: libera, serviziRinnovabili };
}
