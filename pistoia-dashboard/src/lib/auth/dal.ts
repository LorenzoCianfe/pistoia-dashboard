import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { validateSession } from "./session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: "CITIZEN" | "ADMIN";
  avatarColor: string;
  bio: string | null;
  quartiere: string | null;
  emailVerified: boolean;
  createdAt: Date;
};

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
    role: u.role === "ADMIN" ? "ADMIN" : "CITIZEN",
    avatarColor: u.avatarColor,
    bio: u.bio,
    quartiere: u.quartiere,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
  };
});

/** Redirects to /login when there is no valid session. */
export const requireUser = cache(async (): Promise<CurrentUser> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});

/** Redirects non-admins away from admin-only areas. */
export const requireAdmin = cache(async (): Promise<CurrentUser> => {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/bilancio");
  return user;
});
