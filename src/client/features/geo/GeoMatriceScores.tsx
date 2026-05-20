import type { GeoData } from "./useGeoData";

type Props = {
  requetes: GeoData["requetes"];
  matriceScores: GeoData["matriceScores"];
  modele: string;
};

function classeScore(score: number) {
  if (score === 0) return "bg-base-200 text-base-content/40";
  if (score === 1) return "bg-error/20 text-error";
  if (score === 2) return "bg-warning/20 text-warning";
  return "bg-success/20 text-success";
}

export function GeoMatriceScores({ requetes, matriceScores, modele }: Props) {
  const MODELES = modele ? [modele] : ["chatgpt", "gemini"];
  return (
    <div className="card bg-base-100 border border-base-200 p-4 space-y-3">
      <p className="text-sm font-semibold">Matrice de visibilité</p>
      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr>
              <th className="text-xs font-normal text-base-content/60">Requête</th>
              {MODELES.map((m) => (
                <th key={m} className="text-xs font-normal text-base-content/60 text-center capitalize">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requetes.map(({ id, libelle }) => (
              <tr key={id}>
                <td className="text-xs max-w-[200px] truncate" title={libelle}>{libelle}</td>
                {MODELES.map((modele) => {
                  const score = matriceScores[id]?.[modele] ?? 0;
                  return (
                    <td key={modele} className="text-center">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${classeScore(score)}`}>
                        {score}/3
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
