import "server-only";
import { prisma } from "@/lib/db";
import { reportCategory, reportStatus, proposalStatus, eventCategory } from "@/lib/community";
import {
  decisionOutcome,
  decisionKind,
  commitmentStatus,
  noticeKind,
  faqCategory,
} from "@/lib/transparency";
import { operaStatus } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import type { SearchResult } from "@/lib/search-types";

// Ricerca globale (Cmd+K). Interroga i contenuti pubblici della piattaforma
// con semplici LIKE: alla scala mock è istantanea e senza dipendenze.
// NB: niente cache condivisa — il risultato è pubblico ma la query è libera.

const PER_TYPE = 4;

export async function globalSearch(raw: string): Promise<SearchResult[]> {
  const q = raw.trim();
  if (q.length < 2 || q.length > 80) return [];
  const like = { contains: q };

  const [reports, proposals, opere, events, polls, neighborhoods, decisions, commitments, notices, faqs] = await Promise.all([
    prisma.report.findMany({
      where: { OR: [{ title: like }, { description: like }, { location: like }] },
      select: { id: true, title: true, category: true, status: true },
      orderBy: { createdAt: "desc" },
      take: PER_TYPE,
    }),
    prisma.proposal.findMany({
      where: { OR: [{ title: like }, { description: like }] },
      select: { id: true, title: true, status: true },
      orderBy: { createdAt: "desc" },
      take: PER_TYPE,
    }),
    prisma.opera.findMany({
      where: { OR: [{ name: like }, { description: like }, { location: like }] },
      select: { id: true, name: true, status: true },
      orderBy: { createdAt: "desc" },
      take: PER_TYPE,
    }),
    prisma.event.findMany({
      where: {
        status: "published",
        OR: [{ title: like }, { description: like }, { location: like }],
      },
      select: { id: true, title: true, category: true, startAt: true },
      orderBy: { startAt: "desc" },
      take: PER_TYPE,
    }),
    prisma.poll.findMany({
      where: { OR: [{ question: like }, { description: like }] },
      select: { id: true, question: true, active: true },
      orderBy: { createdAt: "desc" },
      take: PER_TYPE,
    }),
    prisma.neighborhood.findMany({
      where: { name: like },
      select: { id: true, name: true, slug: true, kind: true },
      take: PER_TYPE,
    }),
    // Trasparenza (O3): decisioni, promesse, avvisi e FAQ entrano in Ctrl+K.
    prisma.decision.findMany({
      where: { OR: [{ title: like }, { summary: like }, { reason: like }] },
      select: { id: true, title: true, kind: true, outcome: true },
      orderBy: { decidedAt: "desc" },
      take: PER_TYPE,
    }),
    prisma.commitment.findMany({
      where: { OR: [{ title: like }, { description: like }] },
      select: { id: true, title: true, status: true },
      orderBy: { promisedAt: "desc" },
      take: PER_TYPE,
    }),
    prisma.notice.findMany({
      where: { OR: [{ title: like }, { body: like }, { location: like }] },
      select: { id: true, title: true, kind: true, active: true },
      orderBy: { startsAt: "desc" },
      take: PER_TYPE,
    }),
    prisma.cityFaq.findMany({
      where: { OR: [{ question: like }, { answer: like }] },
      select: { id: true, question: true, category: true },
      take: PER_TYPE,
    }),
  ]);

  return [
    ...reports.map<SearchResult>((r) => ({
      type: "report",
      id: r.id,
      title: r.title,
      subtitle: `${reportCategory(r.category).label} · ${reportStatus(r.status).label}`,
      href: `/segnalazioni/${r.id}`,
    })),
    ...proposals.map<SearchResult>((p) => ({
      type: "proposal",
      id: p.id,
      title: p.title,
      subtitle: proposalStatus(p.status).label,
      href: `/proposte/${p.id}`,
    })),
    ...opere.map<SearchResult>((o) => ({
      type: "opera",
      id: o.id,
      title: o.name,
      subtitle: operaStatus(o.status).label,
      href: `/opere/${o.id}`,
    })),
    ...events.map<SearchResult>((e) => ({
      type: "event",
      id: e.id,
      title: e.title,
      subtitle: `${eventCategory(e.category).label} · ${formatDate(e.startAt)}`,
      href: "/eventi",
    })),
    ...polls.map<SearchResult>((p) => ({
      type: "poll",
      id: p.id,
      title: p.question,
      subtitle: p.active ? "Aperto" : "Concluso",
      href: "/sondaggi",
    })),
    ...neighborhoods.map<SearchResult>((n) => ({
      type: "neighborhood",
      id: n.id,
      title: n.name,
      subtitle: n.kind === "frazione" ? "Frazione" : "Quartiere",
      href: `/quartieri/${n.slug}`,
    })),
    ...decisions.map<SearchResult>((d) => ({
      type: "decision",
      id: d.id,
      title: d.title,
      subtitle: `${decisionKind(d.kind)} · ${decisionOutcome(d.outcome).label}`,
      href: "/decisioni",
    })),
    ...commitments.map<SearchResult>((c) => ({
      type: "commitment",
      id: c.id,
      title: c.title,
      subtitle: commitmentStatus(c.status).label,
      href: "/promesse",
    })),
    ...notices.map<SearchResult>((n) => ({
      type: "notice",
      id: n.id,
      title: n.title,
      subtitle: `${noticeKind(n.kind).label} · ${n.active ? "Attivo" : "Concluso"}`,
      href: "/avvisi",
    })),
    ...faqs.map<SearchResult>((f) => ({
      type: "faq",
      id: f.id,
      title: f.question,
      subtitle: faqCategory(f.category),
      href: "/faq",
    })),
  ];
}
