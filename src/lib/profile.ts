import { db } from "@/lib/db";

/**
 * Returns the active portfolio ID for a user.
 * Falls back to their first portfolio if activeProfileId is not set,
 * and persists the fallback for future calls.
 */
export async function getActivePortfolioId(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { activeProfileId: true },
  });

  if (user?.activeProfileId) {
    // Verify the portfolio still exists (it could have been deleted)
    const exists = await db.portfolio.findUnique({
      where: { id: user.activeProfileId },
      select: { id: true },
    });
    if (exists) return exists.id;
  }

  // Fallback: find first portfolio and set it as active
  const first = await db.portfolio.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (first) {
    await db.user.update({
      where: { id: userId },
      data: { activeProfileId: first.id },
    });
    return first.id;
  }

  return null;
}
