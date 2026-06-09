import "server-only";
import { prisma } from "@/lib/db";

export type NotifPrefs = {
  neighborhood: boolean;
  followedItems: boolean;
  polls: boolean;
  proposals: boolean;
  generalDiscussions: boolean;
  urgent: boolean;
};

export async function getNotifPrefs(userId: string): Promise<NotifPrefs> {
  const p = await prisma.notificationPreference.findUnique({ where: { userId } });
  return {
    neighborhood: p?.neighborhood ?? true,
    followedItems: p?.followedItems ?? true,
    polls: p?.polls ?? true,
    proposals: p?.proposals ?? true,
    generalDiscussions: p?.generalDiscussions ?? false,
    urgent: p?.urgent ?? true,
  };
}
