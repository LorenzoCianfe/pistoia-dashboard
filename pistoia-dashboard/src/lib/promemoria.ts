import "server-only";
import { prisma } from "@/lib/db";
import { emailConfigurata, sendEmail } from "@/lib/email";
import { periodoDi } from "@/lib/valutazioni";
import { promemoriaDovuto } from "@/lib/sollecitazioni";
import { etichettaPeriodo } from "@/lib/redazione";

/*
  L'invio dei promemoria mensili (R-5, ingresso B3).

  Una demo locale non ha un cron: l'invio è OPPORTUNISTICO, agganciato alle
  azioni del contatore (stessa scelta di `limiteConservazioneIp`, applicata a
  ogni voto). Chi ha chiesto il promemoria lo riceve la prima volta che
  qualcuno muove il contatore nel mese nuovo — in locale è un file in
  `.email/`, e in produzione senza trasporto configurato non parte niente:
  `ultimoInvio` resta indietro e l'invio resta dovuto, mai perso in silenzio.
*/

const MASSIMO_PER_PASSATA = 50;

export async function inviaPromemorieScadute(oggi: Date, base: string) {
  if (!emailConfigurata()) return;

  const corrente = periodoDi(oggi);
  const tutti = await prisma.promemoriaRinnovo.findMany({
    take: MASSIMO_PER_PASSATA,
    orderBy: { chiestoIl: "asc" },
  });

  for (const p of tutti) {
    if (!promemoriaDovuto(oggi, p.ultimoInvio)) continue;
    await sendEmail({
      to: p.email,
      subject: `Il voto di ${etichettaPeriodo(corrente)} si è aperto`,
      text: [
        `Le condizioni della città si valutano ogni mese, e un mese nuovo`,
        `è cominciato: se vuoi, il tuo voto si rinnova — conta fino alla`,
        `fine del mese.`,
        ``,
        `${base}/valutazioni`,
        ``,
        `Ricevi questo promemoria perché l'hai chiesto tu, dopo un voto.`,
        `Per non riceverlo più: ${base}/v/promemoria/${p.token}`,
        `(la pagina ha un pulsante: nessun link agisce da solo).`,
      ].join("\n"),
    });
    await prisma.promemoriaRinnovo.update({
      where: { id: p.id },
      data: { ultimoInvio: corrente },
    });
  }
}
