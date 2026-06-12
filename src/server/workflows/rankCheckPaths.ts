import type { WorkflowStep } from "cloudflare:workers";
import { RankTrackingRepository } from "@/server/features/rank-tracking/repositories/RankTrackingRepository";
import type { createDataforseoClient } from "@/server/lib/dataforseoClient";
import type { RankTrackingConfig } from "@/types/schemas/rank-tracking";

const SINGLE_ATTEMPT_STEP_CONFIG = {
  retries: { limit: 0, delay: "1 second" as const },
  timeout: "5 minutes" as const,
};

type KeywordEntry = { id: string; keyword: string };

function mapResultsToSnapshotRows(
  runId: string,
  results: Array<{
    keywordId: string;
    keyword: string;
    position: number | null;
    url: string | null;
    serpFeatures: string[];
  }>,
  device: "desktop" | "mobile",
) {
  return results.map((r) => ({
    runId,
    trackingKeywordId: r.keywordId,
    keyword: r.keyword,
    device,
    position: r.position,
    url: r.url,
    serpFeatures: r.serpFeatures.length > 0 ? JSON.stringify(r.serpFeatures) : null,
  }));
}

interface CheckContext {
  client: ReturnType<typeof createDataforseoClient>;
  keywords: KeywordEntry[];
  devices: RankTrackingConfig["devices"];
  serpDepth: number;
  domain: string;
  locationCode: number;
  languageCode: string;
  runId: string;
}

/**
 * Check keywords via Live API batch — all keywords in 1 request per device.
 * Max 2 subrequests total (desktop + mobile), well under Cloudflare's 50/instance limit.
 */
export async function runLiveCheck(
  step: WorkflowStep,
  ctx: CheckContext,
): Promise<{ totalFailed: number }> {
  const deviceList: Array<"desktop" | "mobile"> =
    ctx.devices === "both" ? ["desktop", "mobile"] : [ctx.devices];

  let totalFailed = 0;

  for (const device of deviceList) {
    const results = await step.do(
      `batch-${device}-${ctx.runId}`,
      SINGLE_ATTEMPT_STEP_CONFIG,
      async () => {
        const data = await ctx.client.serp.rankCheckBatch({
          keywords: ctx.keywords,
          locationCode: ctx.locationCode,
          languageCode: ctx.languageCode,
          device,
          targetDomain: ctx.domain,
          depth: ctx.serpDepth,
        });

        const rows = mapResultsToSnapshotRows(ctx.runId, data, device);
        if (rows.length > 0) {
          await RankTrackingRepository.insertSnapshots(rows);
        }

        const failed = ctx.keywords.length - data.length;
        await RankTrackingRepository.updateRun(ctx.runId, {
          keywordsChecked: data.length,
        });

        return { failed };
      },
    );

    totalFailed += results.failed;
  }

  if (totalFailed > 0) {
    console.warn(`Rank check completed with ${totalFailed} failed keyword(s)`);
  }

  return { totalFailed };
}
