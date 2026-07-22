import type { KeywordCategory } from "@/types/schemas/rank-tracking";
import { tagChipClass, tagDotClass, type TagColorKey } from "./tag-colors";

export const KEYWORD_CATEGORY_LABELS: Record<KeywordCategory, string> = {
  product_management: "Product Management",
  product_ia: "Product IA",
  product_data: "Product Data",
  product_marketing: "Product Marketing",
  product_ops: "Product Ops",
  product_quality: "Product Quality",
  informational: "Contenu informationnel",
};

export const KEYWORD_CATEGORY_COLORS: Record<KeywordCategory, TagColorKey> = {
  product_management: "sky",
  product_ia: "violet",
  product_data: "emerald",
  product_marketing: "fuchsia",
  product_ops: "amber",
  product_quality: "rose",
  informational: "slate",
};

export const KEYWORD_CATEGORY_ORDER: KeywordCategory[] = [
  "product_management",
  "product_ia",
  "product_data",
  "product_marketing",
  "product_ops",
  "product_quality",
  "informational",
];

export function keywordCategoryLabel(
  category: KeywordCategory | null,
): string {
  if (!category) return "Non classé";
  return KEYWORD_CATEGORY_LABELS[category];
}

export function keywordCategoryChipClass(
  category: KeywordCategory | null,
): string {
  if (!category) return tagChipClass("slate");
  return tagChipClass(KEYWORD_CATEGORY_COLORS[category]);
}

export function keywordCategoryDotClass(
  category: KeywordCategory | null,
): string {
  if (!category) return tagDotClass("slate");
  return tagDotClass(KEYWORD_CATEGORY_COLORS[category]);
}
