/**
 * Generate a SQL file that assigns a business category to existing rank
 * tracking keywords, based on the mapping validated with Antoine (see
 * docs/PLAN-categories-keywords.md).
 *
 * Usage:
 *   pnpm tsx scripts/generate-keyword-categories-sql.ts <output.sql>
 *   wrangler d1 execute DB --local --file=<output.sql>
 *   wrangler d1 execute open-seo --remote --file=<output.sql>
 *
 * Keywords are matched by exact lowercase text against `rank_tracking_keywords.keyword`
 * across ALL configs — harmless if a keyword string doesn't exist yet (the
 * UPDATE just matches zero rows).
 */

import { writeFileSync } from "node:fs";
import process from "node:process";

const CATEGORY_MAP: Record<string, string[]> = {
  product_management: [
    "agence conseil product management",
    "cabinet conseil product management",
    "cabinet de conseil product management",
    "conseil product management",
    "consultant product management",
    "discovery product management",
    "product discovery",
    "meilleur cabinet conseil product management",
    "product management",
    "coaching product manager",
    "agence product management",
    "meilleure agence product management",
    "formation product management",
    "formation product manager",
    "product management coach",
    "product management formation",
    "consultant lead product manager",
    "consultant product manager",
    "consultant product owner",
    "leader produit",
    "leader product management",
    "product management consulting",
    "product manager formation",
    "product manager manager",
    "role product manager",
    "discovery discipline",
    "product growth",
    "product strategy",
    "stratégie produit",
    "data product owner",
    "feature team",
    "impact team",
    "roadmap produit",
  ],
  product_ia: [
    "ia product manager",
    "product manager ia",
    "ia product management formation",
    "pm ia",
    "ia product owner",
    "product owner ia",
    "formation product owner ia",
    "product builder",
  ],
  product_data: [
    "data product manager",
    "product manager data",
    "product data manager",
    "consultant data pm",
    "product ia",
    "data pm",
    "pm data",
    "consultant data product manager",
    "consultant product data manager",
    "product data management",
    "formation data product manager",
  ],
  product_marketing: [
    "cabinet de conseil product marketing",
    "conseil product marketing",
    "consultant product marketing",
    "consultant product marketing manager",
    "product marketing management",
    "product marketing",
    "formation product marketing",
    "production manager marketing",
    "product marketing manager",
    "pmm formation",
  ],
  product_ops: [
    "product ops",
    "formation product ops",
    "consultant product operations",
    "consultant product ops",
    "product ops role",
  ],
  product_quality: [
    "quality analyst",
    "consultant quality analyst",
    "qa",
    "lead quality analyst",
  ],
  informational: [
    "daily meeting",
    "definition of done",
    "definition of ready",
    "gherkins",
    "gherkin",
    "bdd",
    "feedback loop",
    "impact mapping",
    "epics",
    "shape up",
    "3 amigos",
    "lean canvas",
    "okr",
    "roadmap",
    "tres amigos",
    "user story",
    "north star metric",
  ],
};

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

const lines: string[] = [];
const seen = new Set<string>();
let duplicateCount = 0;

for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
  for (const keyword of keywords) {
    const normalized = keyword.trim().toLowerCase();
    if (seen.has(normalized)) {
      duplicateCount += 1;
      console.error(`Duplicate keyword across categories, skipped: ${normalized}`);
      continue;
    }
    seen.add(normalized);
    lines.push(
      `UPDATE rank_tracking_keywords SET category = '${category}' WHERE keyword = '${escapeSqlLiteral(normalized)}';`,
    );
  }
}

const outputPath = process.argv[2];
if (!outputPath) {
  console.error(
    "Usage: pnpm tsx scripts/generate-keyword-categories-sql.ts <output.sql>",
  );
  process.exit(1);
}

writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(
  `Wrote ${lines.length} UPDATE statements to ${outputPath} (${duplicateCount} duplicates skipped).`,
);
console.log(
  "Any keyword in the DB not covered by this mapping keeps category = NULL — check the UI filter's Uncategorized bucket after applying.",
);
