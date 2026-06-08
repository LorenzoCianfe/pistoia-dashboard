import "server-only";
import { prisma } from "@/lib/db";

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export type NotificationItem = Awaited<
  ReturnType<typeof getNotifications>
>[number];
