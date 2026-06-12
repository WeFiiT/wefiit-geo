import type { WorkflowStep } from "cloudflare:workers";
import { RankTrackingRepository } from "@/server/features/rank-tracking/repositories/RankTrackingRepository";
import type { createDataforseoClient } from "@/server/lib/dataforseoClient";
import type { RankCheckResult } from "@/server/lib/dataforseo";
import type { RankTrackingConfig } from "@/types/schemas/rank-tracking";
import { KEYWORDS_PER_BATCH } from "@/shared/rank-tracking";

const SINGLE_ATTEMPT_STEP_CONFIG = {
  retries: { limit: 0, delay: "1 second" as const },
  timeout: "5 minutes" as const,
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

export async function runLiveCheck(
  step: WorkflowStep,
  ctx: CheckContext,
): Promise<{ totalFailed: number }> {
  const deviceList: Array<"desktop" | "mobile"> =
    ctx.devices === "both" ? ["desktop", "mobile"] : [ctx.devices];
  let checked = 0;
  let totalFailed = 0;

  // 1 step.do = 1 subrequest = 1 keyword+device combo
  // Each step.do gets a fresh subrequest budget (free plan: 50/invocation)
  for (let i = 0; i < ctx.keywords.length; i++) {
    const kw = ctx.keywords[i];

    for (const device of deviceList) {
      const result = await step.do(
        `kw-${ctx.runId}-${i}-${device}`,
        SINGLE_ATTEMPT_STEP_CONFIG,
        async () => {
          try {
            const r = await ctx.client.serp.rankCheck({
              keyword: kw.keyword,
              keywordId: kw.id,
              locationCode: ctx.locationCode,
              languageCode: ctx.languageCode,
              device,
              targetDomain: ctx.domain,
              depth: ctx.serpDepth,
            });
            await RankTrackingRepository.insertSnapshots(
              mapResultsToSnapshotRows(ctx.runId, [{ ...r, device }]),
            );
            return { ok: true };
          } catch (err) {
            console.error(`Rank check failed [${kw.keyword}/${device}]:`, err);
            return { ok: false };
          }
        },
      );

      if (!result.ok) totalFailed++;
    }

    checked++;
    if (checked % 10 === 0) {
      await RankTrackingRepository.updateRun(ctx.runId, { keywordsChecked: checked });
    }
  }

  await RankTrackingRepository.updateRun(ctx.runId, { keywordsChecked: checked });

  if (totalFailed > 0) {
    console.warn(`Rank check completed with ${totalFailed} failed keyword(s)`);
  }

  return { totalFailed };
}
