import "server-only";
import { prisma } from "@/lib/db";

export type NotifPrefKey =
  | "neighborhood"
  | "followedItems"
  | "polls"
  | "proposals"
  | "generalDiscussions"
  | "urgent";

/**
 * Create an in-app notification, honouring the user's notification preferences.
 * If `prefKey` is given and the user opted out of that channel, the notification
 * is skipped. Missing preference rows default to enabled (the schema defaults).
 */
export async function notify(
  userId: string,
  data: { type: string; title: string; body: string; href?: string | null },
  prefKey?: NotifPrefKey,
) {
  if (prefKey) {
    const pref = await prisma.notificationPreference.findUnique({
      where: { userId },
    });
    if (pref && pref[prefKey] === false) return;
  }
  await prisma.notification.create({
    data: {
      userId,
      type: data.type,
      title: data.title,
      body: data.body,
      href: data.href ?? null,
    },
  });
}
