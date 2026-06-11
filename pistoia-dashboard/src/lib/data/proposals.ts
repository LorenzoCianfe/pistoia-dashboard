import "server-only";
import { prisma } from "@/lib/db";
import { demoBaseline } from "@/lib/demo";
import type { Prisma } from "@/generated/prisma/client";

export type ProposalFilter = {
  neighborhoodId?: string;
  status?: string;
  mine?: boolean;
};

function buildWhere(userId: string, f?: ProposalFilter): Prisma.ProposalWhereInput {
  const where: Prisma.ProposalWhereInput = {};
  if (f?.neighborhoodId) where.neighborhoodId = f.neighborhoodId;
  if (f?.status) where.status = f.status;
  if (f?.mine) where.authorId = userId;
  return where;
}

type RawProposal = Prisma.ProposalGetPayload<{
  include: {
    neighborhood: { select: { name: true; slug: true } };
    _count: { select: { supports: true } };
    supports: { select: { id: true } };
  };
}>;

function mapProposal(p: RawProposal, userId: string) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    status: p.status,
    imageSeed: p.imageSeed,
    neighborhoodName: p.neighborhood?.name ?? null,
    authorName: p.authorName,
    authorInitials: p.authorInitials,
    authorColor: p.authorColor,
    officialReply: p.officialReply,
    officialReplyAt: p.officialReplyAt,
    supports: demoBaseline(p.baseSupports) + p._count.supports,
    supportedByMe: p.supports.length > 0,
    isMine: p.authorId === userId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function getProposals(userId: string, filter?: ProposalFilter) {
  const proposals = await prisma.proposal.findMany({
    where: buildWhere(userId, filter),
    orderBy: [{ createdAt: "desc" }],
    include: {
      neighborhood: { select: { name: true, slug: true } },
      _count: { select: { supports: true } },
      supports: { where: { userId }, select: { id: true } },
    },
  });
  // Surface the most-supported proposals first within the recency ordering is
  // handled in the UI; keep DB ordering by recency for stable pagination later.
  return proposals.map((p) => mapProposal(p, userId));
}

export type ProposalListItem = Awaited<ReturnType<typeof getProposals>>[number];

export async function getProposal(id: string, userId: string) {
  const p = await prisma.proposal.findUnique({
    where: { id },
    include: {
      neighborhood: { select: { name: true, slug: true } },
      _count: { select: { supports: true } },
      supports: { where: { userId }, select: { id: true } },
    },
  });
  if (!p) return null;
  return mapProposal(p, userId);
}

export type ProposalDetail = NonNullable<Awaited<ReturnType<typeof getProposal>>>;
