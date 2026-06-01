import type { GeoData } from "./useGeoData";

type Props = { kpis: GeoData["kpis"] };

export function GeoKpiCards({ kpis }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card bg-base-100 border border-base-200 p-4">
        <p className="text-xs text-base-content/60">Taux de présence</p>
        <p className="mt-1 text-2xl font-bold">
          {kpis.tauxPresence}
          <span className="text-sm font-normal text-base-content/50">%</span>
        </p>
        <p className="mt-1 text-xs text-base-content/40">
          % des runs sur la période
        </p>
      </div>
      <div className="card bg-base-100 border border-base-200 p-4">
        <p className="text-xs text-base-content/60">Nb de runs</p>
        <p className="mt-1 text-2xl font-bold">{kpis.totalRuns}</p>
        <p className="mt-1 text-xs text-base-content/40">sessions analysées</p>
      </div>
    </div>
  );
}
