import "server-only";
import { prisma } from "@/lib/db";
import { groupRecurring, type RecurringPattern } from "@/lib/territorio";

// Data layer dell'Ondata 4 "Territorio & partecipazione". Le liste includono
// i flag per-utente (ho votato? ho aderito?) — quindi niente cache condivisa.

// --- Question time (A2 §22) --------------------------------------------------

export type QtQuestionItem = {
  id: string;
  authorName: string;
  body: string;
  votes: number;
  voted: boolean;
  officialAnswer: string | null;
  answeredAt: Date | null;
  createdAt: Date;
};

export type QuestionTimeItem = {
  id: string;
  title: string;
  topic: string;
  description: string;
  department: string | null;
  status: string;
  opensAt: Date;
  closesAt: Date | null;
  questions: QtQuestionItem[];
};

export async function getQuestionTimes(userId: string): Promise<QuestionTimeItem[]> {
  const [sessions, myVotes] = await Promise.all([
    prisma.questionTime.findMany({
      orderBy: [{ opensAt: "desc" }],
      include: {
        questions: {
          include: { _count: { select: { votes: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.qtVote.findMany({
      where: { userId },
      select: { questionId: true },
    }),
  ]);
  const mine = new Set(myVotes.map((v) => v.questionId));

  return sessions
    .map((s) => ({
      id: s.id,
      title: s.title,
      topic: s.topic,
      description: s.description,
      department: s.department,
      status: s.status,
      opensAt: s.opensAt,
      closesAt: s.closesAt,
      questions: s.questions
        .map((q) => ({
          id: q.id,
          authorName: q.authorName,
          body: q.body,
          votes: q.baseVotes + q._count.votes,
          voted: mine.has(q.id),
          officialAnswer: q.officialAnswer,
          answeredAt: q.answeredAt,
          createdAt: q.createdAt,
        }))
        .sort((a, b) => b.votes - a.votes),
    }))
    .sort((a, b) => (a.status === "concluso" ? 1 : 0) - (b.status === "concluso" ? 1 : 0));
}

// --- "Vota la priorità" (A2 §9) ------------------------------------------------

export type PriorityItemRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  neighborhoodLabel: string | null;
  votes: number;
};

export type PriorityRoundItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  closesAt: Date | null;
  resultNote: string | null;
  totalVotes: number;
  myVoteItemId: string | null;
  items: PriorityItemRow[];
};

export async function getPriorityRounds(userId: string): Promise<PriorityRoundItem[]> {
  const [rounds, myVotes] = await Promise.all([
    prisma.priorityRound.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { _count: { select: { votes: true } } } },
      },
    }),
    prisma.priorityVote.findMany({
      where: { userId },
      select: { roundId: true, itemId: true },
    }),
  ]);
  const mine = new Map(myVotes.map((v) => [v.roundId, v.itemId]));

  return rounds.map((r) => {
    const items = r.items
      .map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        category: i.category,
        neighborhoodLabel: i.neighborhoodLabel,
        votes: i.baseVotes + i._count.votes,
      }))
      .sort((a, b) => b.votes - a.votes);
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      closesAt: r.closesAt,
      resultNote: r.resultNote,
      totalVotes: items.reduce((sum, i) => sum + i.votes, 0),
      myVoteItemId: mine.get(r.id) ?? null,
      items,
    };
  });
}

// --- Volontariato e iniziative (A2 §14) ----------------------------------------

export type InitiativeItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  organizerName: string;
  official: boolean;
  neighborhoodName: string | null;
  location: string | null;
  startAt: Date | null;
  spots: number | null;
  joins: number;
  joined: boolean;
  status: string;
};

export async function getInitiatives(userId: string): Promise<InitiativeItem[]> {
  const [rows, myJoins] = await Promise.all([
    prisma.initiative.findMany({
      orderBy: [{ startAt: "asc" }],
      include: {
        neighborhood: { select: { name: true } },
        _count: { select: { joins: true } },
      },
    }),
    prisma.initiativeJoin.findMany({
      where: { userId },
      select: { initiativeId: true },
    }),
  ]);
  const mine = new Set(myJoins.map((j) => j.initiativeId));

  return rows
    .map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      category: i.category,
      organizerName: i.organizerName,
      official: i.official,
      neighborhoodName: i.neighborhood?.name ?? null,
      location: i.location,
      startAt: i.startAt,
      spots: i.spots,
      joins: i.baseJoins + i._count.joins,
      joined: mine.has(i.id),
      status: i.status,
    }))
    .sort((a, b) => (a.status === "conclusa" ? 1 : 0) - (b.status === "conclusa" ? 1 : 0));
}

// --- "Adotta un luogo" (A2 §16) + Patti di quartiere (A2 §31) -------------------

export type AdoptedPlaceItem = {
  id: string;
  name: string;
  kind: string;
  description: string;
  adopterName: string;
  adopterType: string;
  neighborhoodName: string | null;
  location: string | null;
  status: string;
  since: Date;
  lastUpdate: string | null;
  lastUpdateAt: Date | null;
};

export async function getAdoptedPlaces(): Promise<AdoptedPlaceItem[]> {
  const rows = await prisma.adoptedPlace.findMany({
    orderBy: [{ since: "asc" }],
    include: { neighborhood: { select: { name: true } } },
  });
  return rows
    .map((p) => ({
      id: p.id,
      name: p.name,
      kind: p.kind,
      description: p.description,
      adopterName: p.adopterName,
      adopterType: p.adopterType,
      neighborhoodName: p.neighborhood?.name ?? null,
      location: p.location,
      status: p.status,
      since: p.since,
      lastUpdate: p.lastUpdate,
      lastUpdateAt: p.lastUpdateAt,
    }))
    .sort((a, b) => (a.status === "proposta" ? 1 : 0) - (b.status === "proposta" ? 1 : 0));
}

export type PactItem = {
  id: string;
  neighborhoodName: string;
  title: string;
  goal: string;
  description: string;
  signedBy: string;
  status: string;
  progress: number;
  startedAt: Date;
  updates: { id: string; note: string; official: boolean; createdAt: Date }[];
};

export async function getPacts(): Promise<PactItem[]> {
  const rows = await prisma.neighborhoodPact.findMany({
    orderBy: { startedAt: "desc" },
    include: {
      neighborhood: { select: { name: true } },
      updates: { orderBy: { createdAt: "desc" } },
    },
  });
  return rows.map((p) => ({
    id: p.id,
    neighborhoodName: p.neighborhood.name,
    title: p.title,
    goal: p.goal,
    description: p.description,
    signedBy: p.signedBy,
    status: p.status,
    progress: p.progress,
    startedAt: p.startedAt,
    updates: p.updates.map((u) => ({
      id: u.id,
      note: u.note,
      official: u.official,
      createdAt: u.createdAt,
    })),
  }));
}

// --- "Da segnalazione a progetto" (A2 §8) ----------------------------------------

export type CivicProjectItem = {
  id: string;
  title: string;
  summary: string;
  status: string;
  category: string;
  department: string | null;
  neighborhoodName: string | null;
  reportCount: number;
  reports: { id: string; title: string; status: string }[];
  createdAt: Date;
};

export async function getCivicProjects(): Promise<CivicProjectItem[]> {
  const rows = await prisma.civicProject.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      neighborhood: { select: { name: true } },
      reports: {
        select: { id: true, title: true, status: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    summary: p.summary,
    status: p.status,
    category: p.category,
    department: p.department,
    neighborhoodName: p.neighborhood?.name ?? null,
    reportCount: p.baseReports + p.reports.length,
    reports: p.reports,
    createdAt: p.createdAt,
  }));
}

/** Il progetto di cui fa parte una segnalazione (per la pagina di dettaglio). */
export async function getProjectOfReport(reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      civicProject: {
        select: { id: true, title: true, status: true },
      },
    },
  });
  return report?.civicProject ?? null;
}

// --- Diario del quartiere (A1 §9) ---------------------------------------------------
// "Questa settimana nel quartiere": riepilogo computato dagli ultimi 7 giorni,
// nessun contenuto redazionale da mantenere.

export type NeighborhoodDiary = {
  resolvedReports: number;
  newReports: number;
  newPosts: number;
  operaUpdates: { operaId: string; operaName: string; note: string; progress: number; date: Date }[];
  pacts: { id: string; title: string; progress: number; status: string }[];
};

export async function getNeighborhoodDiary(neighborhoodId: string): Promise<NeighborhoodDiary> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [resolvedReports, newReports, newPosts, operaUpdates, pacts] = await Promise.all([
    prisma.report.count({
      where: { neighborhoodId, resolvedAt: { gte: weekAgo } },
    }),
    prisma.report.count({
      where: { neighborhoodId, createdAt: { gte: weekAgo } },
    }),
    prisma.communityPost.count({
      where: { neighborhoodId, hidden: false, createdAt: { gte: weekAgo } },
    }),
    prisma.operaUpdate.findMany({
      where: { opera: { neighborhoodId }, date: { gte: weekAgo } },
      orderBy: { date: "desc" },
      take: 3,
      select: {
        note: true,
        progress: true,
        date: true,
        opera: { select: { id: true, name: true } },
      },
    }),
    prisma.neighborhoodPact.findMany({
      where: { neighborhoodId },
      select: { id: true, title: true, progress: true, status: true },
    }),
  ]);

  return {
    resolvedReports,
    newReports,
    newPosts,
    operaUpdates: operaUpdates.map((u) => ({
      operaId: u.opera.id,
      operaName: u.opera.name,
      note: u.note,
      progress: u.progress,
      date: u.date,
    })),
    pacts,
  };
}

// --- Problemi ricorrenti (A2 §7) ---------------------------------------------------

export type RecurringPatternItem = RecurringPattern & {
  /** Progetto civico già aperto su questo pattern, se esiste. */
  projectId: string | null;
  projectTitle: string | null;
};

const OPEN_STATUSES = ["ricevuta", "validata", "presa_in_carico", "in_lavorazione"];

export async function getRecurringPatterns(): Promise<RecurringPatternItem[]> {
  const [reports, projects] = await Promise.all([
    prisma.report.findMany({
      where: { status: { in: OPEN_STATUSES } },
      select: {
        category: true,
        neighborhood: { select: { name: true } },
      },
    }),
    prisma.civicProject.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        neighborhood: { select: { name: true } },
      },
    }),
  ]);

  const patterns = groupRecurring(
    reports.map((r) => ({
      category: r.category,
      neighborhoodName: r.neighborhood?.name ?? null,
    })),
  );

  return patterns.map((p) => {
    const project = projects.find(
      (pr) =>
        pr.category === p.category &&
        (pr.neighborhood?.name ?? null) === p.neighborhoodName,
    );
    return {
      ...p,
      projectId: project?.id ?? null,
      projectTitle: project?.title ?? null,
    };
  });
}
