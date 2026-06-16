import type { LeadsFiltres } from "./useLeadsData";

type Props = {
  filtres: LeadsFiltres;
  onChange: (f: LeadsFiltres) => void;
};

const ONGLETS_TYPE: { valeur: LeadsFiltres["type"]; label: string }[] = [
  { valeur: "Business", label: "Business" },
  { valeur: "Candidat", label: "Candidats" },
];

export function LeadsFilters({ filtres, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="tablist" className="tabs tabs-boxed tabs-sm bg-base-200">
        {ONGLETS_TYPE.map((onglet) => (
          <button
            key={onglet.valeur}
            type="button"
            role="tab"
            aria-selected={filtres.type === onglet.valeur}
            className={`tab text-xs ${
              filtres.type === onglet.valeur ? "tab-active font-medium" : ""
            }`}
            onClick={() => onChange({ ...filtres, type: onglet.valeur })}
          >
            {onglet.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-base-content/50">Canal</label>
        <select
          className="select select-sm select-bordered text-xs"
          value={filtres.typeLead}
          onChange={(e) =>
            onChange({
              ...filtres,
              typeLead: e.target.value as LeadsFiltres["typeLead"],
            })
          }
        >
          <option value="">Tous</option>
          <option value="demande de contact">Demande de contact</option>
          <option value="réservation booking">Réservation booking</option>
        </select>
      </div>
    </div>
  );
}
