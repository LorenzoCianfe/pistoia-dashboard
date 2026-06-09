import "server-only";
import { prisma } from "@/lib/db";
import { BADGE, VERIFICATION } from "@/lib/community";

const VERIFICATION_BADGE_KEY: Record<string, string> = {
  IDENTITY: "identity",
  RESIDENCY: "residency",
  MUNICIPAL_STAFF: "municipal",
  ASSOCIATION: "association",
  BUSINESS: "business",
};

/** Award a soft civic-reputation badge (idempotent via the unique constraint). */
export async function awardBadge(userId: string, badgeType: string) {
  const meta = BADGE[badgeType];
  if (!meta) return;
  await prisma.citizenBadge.upsert({
    where: { userId_badgeType: { userId, badgeType } },
    create: { userId, badgeType, label: meta.label, icon: meta.emoji },
    update: {},
  });
}

/** Award the badge that corresponds to an approved verification type. */
export async function awardVerificationBadge(userId: string, type: string) {
  const badgeType = VERIFICATION_BADGE_KEY[type];
  const meta = VERIFICATION[type];
  if (!badgeType || !meta) return;
  await prisma.citizenBadge.upsert({
    where: { userId_badgeType: { userId, badgeType } },
    create: { userId, badgeType, label: meta.label, icon: meta.emoji },
    update: {},
  });
}
