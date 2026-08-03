import "server-only";
import { prisma } from "@/lib/db";
import {
  assessori,
  componentiPubblicabili,
  delegheIndicizzate,
  sindaco,
  type Componente,
} from "@/lib/giunta";

/*
  Due sorgenti con due ruoli distinti, e non è un compromesso.

  I **fatti** sulle persone vengono da `lib/giunta.ts`, dove ognuno porta la
  propria fonte. Il **database** risponde a una domanda sola, che è l'unica di
  cui sappia qualcosa: chi segue chi.

  Se una riga `Assessore` mancasse — un riseed a metà, uno slug rinominato — la
  persona compare lo stesso, con zero follower. L'alternativa (leggere l'elenco
  dal database) farebbe sparire dalla pagina una persona in carica per un
  difetto di popolamento, che è il modo peggiore di sbagliare qui.
*/

export type OrgMember = Componente & {
  followerCount: number;
  followedByMe: boolean;
};

export async function getOrg(userId: string) {
  const [conteggi, miei] = await Promise.all([
    prisma.assessoreFollow.groupBy({
      by: ["assessoreId"],
      _count: { _all: true },
    }),
    prisma.assessoreFollow.findMany({
      where: { userId },
      select: { assessoreId: true },
    }),
  ]);

  const perId = new Map(conteggi.map((c) => [c.assessoreId, c._count._all]));
  const seguiti = new Set(miei.map((f) => f.assessoreId));

  const conFollow = (c: Componente): OrgMember => ({
    ...c,
    followerCount: perId.get(c.id) ?? 0,
    followedByMe: seguiti.has(c.id),
  });

  return {
    sindaco: (() => {
      const s = sindaco();
      return s ? conFollow(s) : null;
    })(),
    members: assessori().map(conFollow),
    deleghe: delegheIndicizzate(),
    totalFollowing: componentiPubblicabili().filter((c) => seguiti.has(c.id)).length,
  };
}

export type OrgData = Awaited<ReturnType<typeof getOrg>>;
