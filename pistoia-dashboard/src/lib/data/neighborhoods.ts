import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

/** All neighbourhoods/frazioni, ordered for menus and filters. */
export const getNeighborhoods = cache(async () => {
  return prisma.neighborhood.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, kind: true },
  });
});

export type NeighborhoodOption = Awaited<
  ReturnType<typeof getNeighborhoods>
>[number];

export const getNeighborhoodBySlug = cache(async (slug: string) => {
  return prisma.neighborhood.findUnique({ where: { slug } });
});
