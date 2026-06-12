import "server-only";
import { prisma } from "@/lib/db";
import { parseStringArray } from "@/lib/transparency";

// Letture per le pagine "Trasparenza" (O3): decisioni, promesse, avvisi, FAQ.
// Contenuto redazionale seminato dal seed: query semplici, nessuna cache —
// alla scala mock il costo è trascurabile e la freschezza è garantita.

// --- Archivio decisioni (A1 §12) -------------------------------------------

export async function getDecisions() {
  const rows = await prisma.decision.findMany({
    orderBy: { decidedAt: "desc" },
  });
  return rows.map((d) => ({
    ...d,
    // Link interno alla pagina dell'oggetto deciso, quando esiste davvero.
    href:
      d.linkedType === "proposal" && d.linkedId
        ? `/proposte/${d.linkedId}`
        : d.linkedType === "report" && d.linkedId
          ? `/segnalazioni/${d.linkedId}`
          : d.linkedType === "opera" && d.linkedId
            ? `/opere/${d.linkedId}`
            : null,
  }));
}

export type DecisionItem = Awaited<ReturnType<typeof getDecisions>>[number];

// --- Promesse e risultati (A1 §30) ------------------------------------------

export async function getCommitments() {
  const rows = await prisma.commitment.findMany({
    orderBy: { promisedAt: "desc" },
  });
  return rows.map((c) => ({
    ...c,
    href:
      c.linkedType === "opera" && c.linkedId
        ? `/opere/${c.linkedId}`
        : c.linkedType === "proposal" && c.linkedId
          ? `/proposte/${c.linkedId}`
          : null,
  }));
}

export type CommitmentItem = Awaited<ReturnType<typeof getCommitments>>[number];

// --- Bacheca avvisi (A1 §21 + §24) ------------------------------------------

export async function getNotices() {
  const rows = await prisma.notice.findMany({
    orderBy: [{ active: "desc" }, { startsAt: "desc" }],
  });
  return rows.map((n) => ({
    ...n,
    whatChanges: parseStringArray(n.whatChanges),
  }));
}

export type NoticeItem = Awaited<ReturnType<typeof getNotices>>[number];

/** Avvisi attivi per il banner in home: i critici prima. */
export async function getActiveNotices(take = 2) {
  const rows = await prisma.notice.findMany({
    where: { active: true },
    orderBy: { startsAt: "desc" },
    take: 10,
  });
  const weight = (s: string) => (s === "critico" ? 0 : s === "attenzione" ? 1 : 2);
  return rows
    .sort((a, b) => weight(a.severity) - weight(b.severity))
    .slice(0, take)
    .map((n) => ({ id: n.id, title: n.title, kind: n.kind, severity: n.severity }));
}

// --- FAQ della città (A1 §11) -----------------------------------------------

export async function getCityFaqs() {
  return prisma.cityFaq.findMany({
    orderBy: [{ order: "asc" }, { question: "asc" }],
  });
}

export type CityFaqItem = Awaited<ReturnType<typeof getCityFaqs>>[number];
