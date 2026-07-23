import { RotateCcw } from "lucide-react";
import type {
  KeywordCategory,
  RankTrackingRow,
} from "@/types/schemas/rank-tracking";
import {
  KEYWORD_CATEGORY_ORDER,
  keywordCategoryChipClass,
  keywordCategoryDotClass,
  keywordCategoryLabel,
} from "@/shared/keyword-categories";

export type Filters = {
  include: string;
  exclude: string;
  minDesktopPos: string;
  maxDesktopPos: string;
  minMobilePos: string;
  maxMobilePos: string;
  categories: (KeywordCategory | "uncategorized")[];
};

export const EMPTY_FILTERS: Filters = {
  include: "",
  exclude: "",
  minDesktopPos: "",
  maxDesktopPos: "",
  minMobilePos: "",
  maxMobilePos: "",
  categories: [],
};

export function FilterPanel({
  filters,
  setFilters,
  activeFilterCount,
  onReset,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  activeFilterCount: number;
  onReset: () => void;
}) {
  const update = (key: keyof Filters, value: string) =>
    setFilters({ ...filters, [key]: value });

  return (
    <div className="shrink-0 border-b border-base-300 bg-gradient-to-b from-base-100 to-base-200/30 px-4 py-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">Refine results</p>
          {activeFilterCount > 0 && (
            <span className="badge badge-xs badge-primary border-0 text-primary-content">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <button
          className="btn btn-xs btn-ghost gap-1"
          onClick={onReset}
          disabled={activeFilterCount === 0}
        >
          <RotateCcw className="size-3" />
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">
            Include
          </p>
          <input
            className="input input-bordered input-sm w-full bg-base-100"
            placeholder="e.g. seo, tool"
            value={filters.include}
            onChange={(e) => update("include", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">
            Exclude
          </p>
          <input
            className="input input-bordered input-sm w-full bg-base-100"
            placeholder="e.g. free, cheap"
            value={filters.exclude}
            onChange={(e) => update("exclude", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <RangeFilter
          title="Desktop position"
          minValue={filters.minDesktopPos}
          maxValue={filters.maxDesktopPos}
          onMinChange={(v) => update("minDesktopPos", v)}
          onMaxChange={(v) => update("maxDesktopPos", v)}
        />
        <RangeFilter
          title="Mobile position"
          minValue={filters.minMobilePos}
          maxValue={filters.maxMobilePos}
          onMinChange={(v) => update("minMobilePos", v)}
          onMaxChange={(v) => update("maxMobilePos", v)}
        />
      </div>
    </div>
  );
}

export function CategoryFilter({
  selected,
  onChange,
}: {
  selected: (KeywordCategory | "uncategorized")[];
  onChange: (categories: (KeywordCategory | "uncategorized")[]) => void;
}) {
  const options: (KeywordCategory | "uncategorized")[] = [
    ...KEYWORD_CATEGORY_ORDER,
  ];

  const toggle = (value: KeywordCategory | "uncategorized") => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  const allSelected = selected.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
          allSelected
            ? "bg-[#f98f03] border-[#f98f03] text-white"
            : "bg-white border-base-300 text-base-content/70 hover:border-[#f98f03]/50 hover:text-[#f98f03]"
        }`}
        onClick={() => onChange([])}
      >
        Global
      </button>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        const category = option === "uncategorized" ? null : option;
        return (
          <button
            key={option}
            type="button"
            className={`inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition ${
              isSelected
                ? `border-transparent ${keywordCategoryChipClass(category)}`
                : "border-base-300 bg-base-100 text-base-content/60 hover:border-base-content/30 hover:text-base-content"
            }`}
            onClick={() => toggle(option)}
          >
            <span
              className={`size-1.5 shrink-0 rounded-full ${isSelected ? keywordCategoryDotClass(category) : "bg-base-content/25"}`}
            />
            {keywordCategoryLabel(category)}
          </button>
        );
      })}
    </div>
  );
}

function RangeFilter({
  title,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: {
  title: string;
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-2.5 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <input
          className="input input-bordered input-xs bg-base-100"
          placeholder="Min"
          type="number"
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
        />
        <input
          className="input input-bordered input-xs bg-base-100"
          placeholder="Max"
          type="number"
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function applyFilters(
  rows: RankTrackingRow[],
  filters: Filters,
): RankTrackingRow[] {
  const includeTerms = filters.include
    ? filters.include
        .toLowerCase()
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const excludeTerms = filters.exclude
    ? filters.exclude
        .toLowerCase()
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return rows.filter((row) => {
    const kw = row.keyword.toLowerCase();

    if (includeTerms.length > 0 && !includeTerms.some((t) => kw.includes(t)))
      return false;

    if (excludeTerms.some((t) => kw.includes(t))) return false;

    if (
      !matchesPositionFilter(
        row.desktop.position,
        filters.minDesktopPos,
        filters.maxDesktopPos,
      )
    )
      return false;

    if (
      !matchesPositionFilter(
        row.mobile.position,
        filters.minMobilePos,
        filters.maxMobilePos,
      )
    )
      return false;

    if (filters.categories.length > 0) {
      const value = row.category ?? "uncategorized";
      if (!filters.categories.includes(value)) return false;
    }

    return true;
  });
}

export function matchesPositionFilter(
  position: number | null,
  minValue: string,
  maxValue: string,
): boolean {
  if (!minValue && !maxValue) return true;

  const max = maxValue === "" ? Infinity : Number(maxValue);
  if (max === 0) return position === null;

  if (position === null) return false;

  const min = minValue === "" ? 0 : Number(minValue);
  return position >= min && position <= max;
}

export function countActiveFilters(filters: Filters): number {
  let count = 0;
  if (filters.include) count++;
  if (filters.exclude) count++;
  if (filters.minDesktopPos || filters.maxDesktopPos) count++;
  if (filters.minMobilePos || filters.maxMobilePos) count++;
  if (filters.categories.length > 0) count++;
  return count;
}
