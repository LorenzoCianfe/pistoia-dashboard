import "server-only";
import { prisma } from "@/lib/db";

export async function getOrg(userId: string) {
  const all = await prisma.assessore.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { follows: true } },
      follows: { where: { userId }, select: { id: true } },
    },
  });

  const shape = (a: (typeof all)[number]) => ({
    id: a.id,
    name: a.name,
    role: a.role,
    area: a.area,
    initials: a.initials,
    color: a.color,
    votesElected: a.votesElected,
    email: a.email,
    parentId: a.parentId,
    followerCount: a._count.follows,
    followedByMe: a.follows.length > 0,
  });

  const sindaco = all.find((a) => !a.parentId) ?? null;
  const members = sindaco
    ? all.filter((a) => a.parentId === sindaco.id).map(shape)
    : [];

  return {
    sindaco: sindaco ? shape(sindaco) : null,
    members,
    totalFollowing: all.filter((a) => a.follows.length > 0).length,
  };
}

export type OrgData = Awaited<ReturnType<typeof getOrg>>;
export type OrgMember = OrgData["members"][number];
