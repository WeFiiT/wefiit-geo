import { CATEGORIES, type LeadCategorie } from "./useLeadsData";

type Props = {
  compteurs: Record<LeadCategorie, number> | null;
};

// Couleur d'accent par catégorie (alignée sur COLOR_CATEGORIE de LeadsTable).
const ACCENT: Record<LeadCategorie, string> = {
  "Leads Business": "text-primary",
  "Leads Talent": "text-info",
  "Livre blanc PMM": "text-success",
  "Guide IA": "text-secondary",
  Autre: "text-base-content/50",
};

export function LeadsKpiCards({ compteurs }: Props) {
  const total = compteurs
    ? CATEGORIES.reduce((acc, c) => acc + compteurs[c], 0)
    : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {/* Carte Total */}
      <div className="rounded-2xl border border-base-200 bg-base-100 px-4 py-3 shadow-sm">
        <p className="text-xs font-medium text-base-content/50">Total</p>
        <p className="mt-1 text-2xl font-semibold">{total}</p>
      </div>

      {/* Une carte par catégorie */}
      {CATEGORIES.map((c) => (
        <div
          key={c}
          className="rounded-2xl border border-base-200 bg-base-100 px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-medium text-base-content/50">{c}</p>
          <p className={`mt-1 text-2xl font-semibold ${ACCENT[c]}`}>
            {compteurs ? compteurs[c] : "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
