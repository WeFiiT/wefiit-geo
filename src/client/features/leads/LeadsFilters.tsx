import {
  CATEGORIES,
  type LeadCategorie,
  type LeadsFiltres,
} from "./useLeadsData";

type Props = {
  filtres: LeadsFiltres;
  onChange: (f: LeadsFiltres) => void;
  compteurs: Record<LeadCategorie, number> | null;
};

export function LeadsFilters({ filtres, onChange, compteurs }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-base-200 bg-base-100 px-4 py-3 shadow-sm">
      {/* Filtre Type — un seul axe à 4 valeurs */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-base-content/50">Type</span>
        <select
          className="select select-sm select-bordered text-xs"
          value={filtres.categorie}
          onChange={(e) =>
            onChange({
              ...filtres,
              categorie: e.target.value as LeadsFiltres["categorie"],
            })
          }
        >
          <option value="">Tous</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
              {compteurs ? ` (${compteurs[c]})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="h-6 w-px bg-base-200" />

      {/* Recherche libre (entreprise / email / message) */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-base-content/50">
          Recherche
        </span>
        <input
          type="text"
          placeholder="Entreprise, email…"
          className="input input-sm input-bordered text-xs"
          value={filtres.recherche}
          onChange={(e) => onChange({ ...filtres, recherche: e.target.value })}
        />
      </div>
    </div>
  );
}
