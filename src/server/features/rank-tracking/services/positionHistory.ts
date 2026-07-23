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

  // Bucket by checkedAt, then average non-null positions per category
  // (plus one "global" series across every keyword regardless of category).
  const byDate = new Map<
    string,
    { global: number[] } & Partial<Record<string, number[]>>
  >();

  for (const row of rows) {
    if (row.position === null) continue;

    const bucket = byDate.get(row.checkedAt) ?? { global: [] };
    bucket.global.push(row.position);
    if (row.category) {
      const positions = bucket[row.category] ?? [];
      positions.push(row.position);
      bucket[row.category] = positions;
    }
    byDate.set(row.checkedAt, bucket);
  }

  const average = (values: number[]) =>
    values.reduce((sum, v) => sum + v, 0) / values.length;

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([checkedAt, bucket]) => {
      const averageByCategory: PositionHistoryPoint["averageByCategory"] = {
        global: average(bucket.global),
      };
      for (const [category, positions] of Object.entries(bucket)) {
        if (category === "global" || !positions) continue;
        averageByCategory[category as keyof typeof averageByCategory] =
          average(positions);
      }
      return { checkedAt, averageByCategory };
    });
}
