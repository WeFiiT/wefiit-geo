import { RankTrackingRepository } from "@/server/features/rank-tracking/repositories/RankTrackingRepository";
import { AppError } from "@/server/lib/errors";
import type { PositionHistoryPoint } from "@/types/schemas/rank-tracking";

export async function getPositionHistory(
  configId: string,
  projectId: string,
  device: "desktop" | "mobile",
): Promise<PositionHistoryPoint[]> {
  const config = await RankTrackingRepository.getConfigById({
    configId,
    projectId,
  });
  if (!config) {
    throw new AppError("INTERNAL_ERROR", "Rank tracking config not found");
  }

  const rows = await RankTrackingRepository.getPositionHistoryForConfig(
    configId,
    device,
  );

  // Bucket by ISO week (not exact check date) to smooth out day-to-day
  // noise, then average non-null positions per category (plus one "global"
  // series across every keyword regardless of category).
  const byWeek = new Map<
    string,
    { global: number[] } & Partial<Record<string, number[]>>
  >();

  for (const row of rows) {
    if (row.position === null) continue;

    const weekKey = isoWeekStart(row.checkedAt);
    const bucket = byWeek.get(weekKey) ?? { global: [] };
    bucket.global.push(row.position);
    if (row.category) {
      const positions = bucket[row.category] ?? [];
      positions.push(row.position);
      bucket[row.category] = positions;
    }
    byWeek.set(weekKey, bucket);
  }

  const average = (values: number[]) =>
    values.reduce((sum, v) => sum + v, 0) / values.length;

  return [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, bucket]) => {
      const averageByCategory: PositionHistoryPoint["averageByCategory"] = {
        global: average(bucket.global),
      };
      for (const [category, positions] of Object.entries(bucket)) {
        if (category === "global" || !positions) continue;
        averageByCategory[category as keyof typeof averageByCategory] =
          average(positions);
      }
      return { checkedAt: weekStart, averageByCategory };
    });
}

/** Monday (ISO week start) of the week containing this ISO date, as YYYY-MM-DD. */
function isoWeekStart(isoDate: string): string {
  const date = new Date(isoDate);
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setUTCDate(date.getUTCDate() + diffToMonday);
  return date.toISOString().slice(0, 10);
}
