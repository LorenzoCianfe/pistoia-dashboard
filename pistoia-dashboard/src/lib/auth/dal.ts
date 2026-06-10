import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { validateSession } from "./session";
import { isStaff, canModerate, type Role, type AccountType } from "@/lib/community";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  publicName: string | null;
  role: Role;
  accountType: AccountType;
  /** null when not verified; else IDENTITY | RESIDENCY | MUNICIPAL_STAFF | ASSOCIATION | BUSINESS. */
  verifiedType: string | null;
  avatarColor: string;
  bio: string | null;
  quartiere: string | null;
  neighborhoodId: string | null;
  emailVerified: boolean;
  geoConsent: boolean;
  createdAt: Date;
};

const ROLES: Role[] = ["CITIZEN", "MODERATOR", "MUNICIPAL_STAFF", "ADMIN"];
const ACCOUNT_TYPES: AccountType[] = ["CITIZEN", "ASSOCIATION", "BUSINESS", "MUNICIPAL"];

/**
 * Returns the authenticated user as a DTO (never the password hash), or null.
 * Memoised per-request with React.cache so repeated calls hit the DB once.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await validateSession();
  if (!session) return null;
  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    publicName: u.publicName,
    role: (ROLES as string[]).includes(u.role) ? (u.role as Role) : "CITIZEN",
    accountType: (ACCOUNT_TYPES as string[]).includes(u.accountType)
      ? (u.accountType as AccountType)
      : "CITIZEN",
    verifiedType: u.verifiedType,
    avatarColor: u.avatarColor,
    bio: u.bio,
    quartiere: u.quartiere,
    neighborhoodId: u.neighborhoodId,
    emailVerified: u.emailVerified,
    geoConsent: u.geoConsent,
    createdAt: u.createdAt,
  };
});

/** True when the user has an approved verification of any type. */
export function isVerified(user: Pick<CurrentUser, "verifiedType">) {
  return !!user.verifiedType;
}

/** Redirects to /login when there is no valid session. */
export const requireUser = cache(async (): Promise<CurrentUser> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});

/** Comune super-account (ADMIN) only. */
export const requireAdmin = cache(async (): Promise<CurrentUser> => {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/la-mia-citta");
  return user;
});

/** Comune-side staff (ADMIN or MUNICIPAL_STAFF): review, answer, triage. */
export const requireStaff = cache(async (): Promise<CurrentUser> => {
  const user = await requireUser();
  if (!isStaff(user.role)) redirect("/la-mia-citta");
  return user;
});

/** Moderators (ADMIN or MODERATOR): hide/remove community content. */
export const requireModerator = cache(async (): Promise<CurrentUser> => {
  const user = await requireUser();
  if (!canModerate(user.role)) redirect("/la-mia-citta");
  return user;
});

/** Verified citizens only (consultations, supporting proposals, participatory budget). */
export const requireVerified = cache(async (): Promise<CurrentUser> => {
  const user = await requireUser();
  if (!isVerified(user)) redirect("/profilo?verifica=richiesta");
  return user;
});
