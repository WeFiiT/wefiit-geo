import type { GeoData } from "./useGeoData";

type Props = {
  requetes: GeoData["requetes"];
  matriceScores: GeoData["matriceScores"];
  modele: string;
};

function classeScore(taux: number) {
  if (taux === 0) return "bg-base-200 text-base-content/40";
  if (taux < 34) return "bg-error/20 text-error";
  if (taux < 67) return "bg-warning/20 text-warning";
  return "bg-success/20 text-success";
}

export function GeoMatriceScores({ requetes, matriceScores, modele }: Props) {
  const MODELES = modele ? [modele] : ["chatgpt", "gemini", "claude"];
  return (
    <div className="card bg-base-100 border border-base-200 p-4 space-y-3">
      <p className="text-sm font-semibold">Matrice de visibilité</p>
      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr>
              <th className="text-xs font-normal text-base-content/60">
                Requête
              </th>
              {MODELES.map((m) => (
                <th
                  key={m}
                  className="text-xs font-normal text-base-content/60 text-center capitalize"
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requetes.map(({ id, libelle }) => (
              <tr key={id}>
                <td className="text-xs max-w-[200px] truncate" title={libelle}>
                  {libelle}
                </td>
                {MODELES.map((m) => {
                  const taux = matriceScores[id]?.[m] ?? 0;
                  return (
                    <td key={m} className="text-center">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${classeScore(taux)}`}
                      >
                        {taux}%
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
