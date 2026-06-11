import "server-only";
import { prisma } from "@/lib/db";
import { cachedShared, TAGS } from "@/lib/cache";

// Lettura condivisa (uguale per tutti gli utenti): cache a tag "budget".
// L'ETL di Fase 2 invaliderà con revalidateTag(TAGS.budget, "max") dopo il sync.
export const getBudgetYear = cachedShared(
  async (year: number = 2026) => {
    return prisma.budgetYear.findUnique({
      where: { year },
      include: {
        months: { orderBy: { month: "asc" } },
        categories: { orderBy: { order: "asc" } },
      },
    });
  },
  "budget-year",
  [TAGS.budget],
);

export type BudgetYearData = NonNullable<
  Awaited<ReturnType<typeof getBudgetYear>>
>;
