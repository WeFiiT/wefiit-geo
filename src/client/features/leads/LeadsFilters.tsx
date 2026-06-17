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
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-base-200 bg-base-100 px-4 py-3 shadow-sm">
      {/* Segmented control Type — onglets bien visibles */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-base-content/50">Type</span>
        <div
          role="tablist"
          className="inline-flex gap-1 rounded-xl bg-base-200 p-1"
        >
          {ONGLETS_TYPE.map((onglet) => {
            const actif = filtres.type === onglet.valeur;
            const nombre = compteurs?.[onglet.valeur];
            return (
              <button
                key={onglet.valeur}
                type="button"
                role="tab"
                aria-selected={actif}
                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm transition-all ${
                  actif
                    ? "bg-base-100 font-semibold text-primary shadow-sm"
                    : "text-base-content/60 hover:text-base-content"
                }`}
                onClick={() => onChange({ ...filtres, type: onglet.valeur })}
              >
                {onglet.label}
                {nombre !== undefined && (
                  <span
                    className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium ${
                      actif
                        ? "bg-primary text-primary-content"
                        : "bg-base-300 text-base-content/60"
                    }`}
                  >
                    {nombre}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-6 w-px bg-base-200" />

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-base-content/50">Canal</span>
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
