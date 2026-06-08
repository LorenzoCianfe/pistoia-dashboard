import "server-only";
import { prisma } from "@/lib/db";

export async function getBudgetYear(year = 2026) {
  return prisma.budgetYear.findUnique({
    where: { year },
    include: {
      months: { orderBy: { month: "asc" } },
      categories: { orderBy: { order: "asc" } },
    },
  });
}

export type BudgetYearData = NonNullable<
  Awaited<ReturnType<typeof getBudgetYear>>
>;
