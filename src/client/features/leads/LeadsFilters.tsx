import type { LeadsFiltres, LeadsCompteurs } from "./useLeadsData";

type Props = {
  filtres: LeadsFiltres;
  onChange: (f: LeadsFiltres) => void;
  compteurs: LeadsCompteurs | null;
};

const ONGLETS_TYPE: {
  valeur: Exclude<LeadsFiltres["type"], "">;
  label: string;
}[] = [
  { valeur: "Business", label: "Business" },
  { valeur: "Candidat", label: "Candidats" },
];

export function LeadsFilters({ filtres, onChange, compteurs }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="tablist" className="tabs tabs-boxed tabs-sm bg-base-200">
        {ONGLETS_TYPE.map((onglet) => {
          const actif = filtres.type === onglet.valeur;
          const nombre = compteurs?.[onglet.valeur];
          return (
            <button
              key={onglet.valeur}
              type="button"
              role="tab"
              aria-selected={actif}
              className={`tab gap-1.5 text-xs ${actif ? "tab-active font-medium" : ""}`}
              onClick={() => onChange({ ...filtres, type: onglet.valeur })}
            >
              {onglet.label}
              {nombre !== undefined && (
                <span
                  className={`badge badge-xs ${actif ? "badge-primary" : "badge-ghost"}`}
                >
                  {nombre}
                </span>
              )}
            </button>
          );
        })}
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
