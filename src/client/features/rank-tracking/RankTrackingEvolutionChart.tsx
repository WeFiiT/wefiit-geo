import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  KeywordCategory,
  PositionHistoryPoint,
} from "@/types/schemas/rank-tracking";
import { KEYWORD_CATEGORY_LABELS } from "@/shared/keyword-categories";

const CATEGORY_COLORS: Record<KeywordCategory | "global", string> = {
  product_management: "#0284c7",
  product_ia: "#7c3aed",
  product_data: "#059669",
  product_marketing: "#c026d3",
  product_ops: "#d97706",
  product_quality: "#e11d48",
  formation: "#65a30d",
  global: "#f98f03",
};

export function RankTrackingEvolutionChart({
  history,
  selectedCategories,
}: {
  history: PositionHistoryPoint[];
  selectedCategories: (KeywordCategory | "uncategorized")[];
}) {
  if (history.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300 p-4 flex h-56 items-center justify-center text-sm text-base-content/60">
        Pas encore assez de données pour afficher l'évolution.
      </div>
    );
  }

  const seriesKeys: (KeywordCategory | "global")[] =
    selectedCategories.length === 0
      ? ["global"]
      : selectedCategories.filter(
          (c): c is KeywordCategory => c !== "uncategorized",
        );

  const data = history.map((point) => ({
    date: new Date(point.checkedAt).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
    fullDate: point.checkedAt,
    ...point.averageByCategory,
  }));

  const maxPosition = Math.max(
    1,
    ...history.flatMap((point) =>
      Object.values(point.averageByCategory).filter(
        (v): v is number => v !== undefined,
      ),
    ),
  );

  return (
    <div className="card bg-base-100 border border-base-300 p-4 space-y-3">
      <p className="text-sm font-semibold">Évolution de la position moyenne</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              opacity={0.12}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "#888" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#888" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              domain={[1, Math.ceil(maxPosition)]}
              reversed
              tickFormatter={(v: number) => `#${v}`}
            />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }}
              labelFormatter={(label) => `Semaine du ${label}`}
              formatter={(value: number | string | undefined) => [
                typeof value === "number" ? `#${value.toFixed(1)}` : "",
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {seriesKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={
                  key === "global" ? "Global" : KEYWORD_CATEGORY_LABELS[key]
                }
                stroke={CATEGORY_COLORS[key]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
