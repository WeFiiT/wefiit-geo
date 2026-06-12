import type { WorkflowStep } from "cloudflare:workers";
import { RankTrackingRepository } from "@/server/features/rank-tracking/repositories/RankTrackingRepository";
import type { createDataforseoClient } from "@/server/lib/dataforseoClient";
import type { RankCheckResult } from "@/server/lib/dataforseo";
import type { RankTrackingConfig } from "@/types/schemas/rank-tracking";

const SINGLE_ATTEMPT_STEP_CONFIG = {
  retries: { limit: 0, delay: "1 second" as const },
  timeout: "2 minutes" as const,
};

type KeywordEntry = { id: string; keyword: string };
type RankCheckResultWithDevice = RankCheckResult & {
  device: "desktop" | "mobile";
};

function mapResultsToSnapshotRows(
  runId: string,
  results: RankCheckResultWithDevice[],
) {
  return results.map((r) => ({
    runId,
    trackingKeywordId: r.keywordId,
    keyword: r.keyword,
    device: r.device,
    position: r.position,
    url: r.url,
    serpFeatures:
      r.serpFeatures.length > 0 ? JSON.stringify(r.serpFeatures) : null,
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
 * Check keywords via Live API, one keyword per step with devices in parallel.
 * Each keyword gets its own step so a timeout on one doesn't block the others.
 * DataForSEO rate limit (~2 req/s) is respected: max 2 simultaneous calls
 * per keyword (desktop + mobile), with a short sleep between keywords.
 */
export async function runLiveCheck(
  step: WorkflowStep,
  ctx: CheckContext,
): Promise<{ totalFailed: number }> {
  const deviceList: Array<"desktop" | "mobile"> =
    ctx.devices === "both" ? ["desktop", "mobile"] : [ctx.devices];
  let checked = 0;
  let totalFailed = 0;

  for (let i = 0; i < ctx.keywords.length; i++) {
    const kw = ctx.keywords[i];

    // 1 second between keywords to respect DataForSEO rate limit (~2 req/s)
    if (i > 0) {
      await step.sleep(`pause-${ctx.runId}-${i}`, "1 second");
    }

    const result = await step.do(
      `kw-${ctx.runId}-${i}`,
      SINGLE_ATTEMPT_STEP_CONFIG,
      async () => {
        const settled = await Promise.allSettled(
          deviceList.map((device) =>
            ctx.client.serp
              .rankCheck({
                keyword: kw.keyword,
                keywordId: kw.id,
                locationCode: ctx.locationCode,
                languageCode: ctx.languageCode,
                device,
                targetDomain: ctx.domain,
                depth: ctx.serpDepth,
              })
              .then((r) => ({ ...r, device })),
          ),
        );

        const results: RankCheckResultWithDevice[] = [];
        let failed = 0;
        for (const outcome of settled) {
          if (outcome.status === "fulfilled") {
            results.push(outcome.value);
          } else {
            failed++;
            console.error(`Rank check failed [${kw.keyword}]:`, outcome.reason);
          }
        }

        if (results.length > 0) {
          await RankTrackingRepository.insertSnapshots(
            mapResultsToSnapshotRows(ctx.runId, results),
          );
        }

        return { failed };
      },
    );

    checked++;
    totalFailed += result.failed;

    await RankTrackingRepository.updateRun(ctx.runId, {
      keywordsChecked: checked,
    });
  }

  if (totalFailed > 0) {
    console.warn(`Rank check completed with ${totalFailed} failed API call(s)`);
  }

  return { totalFailed };
}
