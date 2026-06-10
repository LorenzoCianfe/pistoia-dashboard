import "server-only";
import { prisma } from "@/lib/db";

const orgInclude = {
  neighborhood: { select: { name: true, slug: true } },
  organizer: { select: { accountType: true, verifiedType: true } },
} as const;

/** Published events split into upcoming and past, with the viewer's follow state (§17). */
export async function getPublishedEvents(userId?: string) {
  const now = new Date();
  const [events, followedEvents, followedOrgs] = await Promise.all([
    prisma.event.findMany({
      where: { status: "published" },
      orderBy: { startAt: "asc" },
      include: orgInclude,
    }),
    userId
      ? prisma.follow.findMany({
          where: { userId, targetType: "event" },
          select: { targetId: true },
        })
      : Promise.resolve([] as { targetId: string }[]),
    userId
      ? prisma.follow.findMany({
          where: { userId, targetType: "organization" },
          select: { targetId: true },
        })
      : Promise.resolve([] as { targetId: string }[]),
  ]);

  const followedEventSet = new Set(followedEvents.map((f) => f.targetId));
  const followedOrgSet = new Set(followedOrgs.map((f) => f.targetId));

  const decorate = (e: (typeof events)[number]) => ({
    ...e,
    following: followedEventSet.has(e.id),
    followingOrg: e.organizerId ? followedOrgSet.has(e.organizerId) : false,
    isOrganization:
      e.organizer?.accountType === "ASSOCIATION" || e.organizer?.accountType === "BUSINESS",
  });

  const end = (e: (typeof events)[number]) => (e.endAt ?? e.startAt).getTime();
  const upcoming = events.filter((e) => end(e) >= now.getTime()).map(decorate);
  const past = events
    .filter((e) => end(e) < now.getTime())
    .reverse()
    .map(decorate);

  return { upcoming, past };
}

export type EventItem = Awaited<ReturnType<typeof getPublishedEvents>>["upcoming"][number];

/** Events awaiting Comune/moderator approval (§17). */
export async function getPendingEvents() {
  return prisma.event.findMany({
    where: { status: "proposed" },
    orderBy: { createdAt: "asc" },
    include: { neighborhood: { select: { name: true } } },
  });
}

export type PendingEvent = Awaited<ReturnType<typeof getPendingEvents>>[number];
