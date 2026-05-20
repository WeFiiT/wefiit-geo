import { useQuery } from "@tanstack/react-query";

type RunEntry = {
  date: string;
  model: "chatgpt" | "gemini";
  runsOk: number;
  wefiit: { citations: number; verbatims?: string[]; previews?: string[]; reponsesChemins?: string[] };
  verbatims?: string[];
  concurrents: Record<string, number>;
};

export type Historique = Record<string, { libelle: string; runs: RunEntry[] }>;

export type GeoFiltres = {
  requeteId: string;   // "" = toutes
  modele: string;      // "" = tous
  jours: number;       // 0 = tout l'historique
};

export type GeoData = {
  kpis: {
    scoreGlobal: number;
    totalCitations: number;
    totalRuns: number;
    tauxPresence: number;        // citations / (runs * runsOk) en %
    deltaVsRunPrecedent: number | null;
    meilleureRequete: string;
    dernierRun: string;
  };
  matriceScores: Record<string, Record<string, number>>;
  requetes: Array<{ id: string; libelle: string }>;
  toutesRequetes: Array<{ id: string; libelle: string }>;
  evolutionParRun: Array<{ label: string; date: string; chatgpt: number | null; gemini: number | null }>;
  topConcurrents: Array<{ nom: string; total: number; freq: number }>;
  maxConcurrent: number;
  verbatims: Array<{ texte: string; modele: string; requete: string; date: string; wefiitCite: boolean; cheminReponse?: string }>;
};

function scoreNormalise(citations: number, runsOk: number): number {
  if (runsOk === 0) return 0;
  return Math.min(3, Math.round((citations / runsOk) * 3));
}

function filtre(data: Historique, filtres: GeoFiltres): Historique {
  const dateMin = filtres.jours > 0
    ? new Date(Date.now() - filtres.jours * 86400_000).toISOString().slice(0, 10)
    : null;

  const resultat: Historique = {};
  for (const [id, { libelle, runs }] of Object.entries(data)) {
    if (filtres.requeteId && id !== filtres.requeteId) continue;
    const runsFiltres = runs.filter((run) => {
      if (filtres.modele && run.model !== filtres.modele) return false;
      if (dateMin && run.date < dateMin) return false;
      return true;
    });
    if (runsFiltres.length > 0) {
      resultat[id] = { libelle, runs: runsFiltres };
    }
  }
  return resultat;
}

function transforme(data: Historique): Omit<GeoData, "toutesRequetes"> {
  const requetes = Object.entries(data).map(([id, val]) => ({ id, libelle: val.libelle }));

  // Matrice scores
  const matriceScores: Record<string, Record<string, number>> = {};
  for (const [id, { runs }] of Object.entries(data)) {
    matriceScores[id] = {};
    for (const run of runs) {
      const existant = matriceScores[id][run.model] ?? 0;
      matriceScores[id][run.model] = Math.max(existant, scoreNormalise(run.wefiit.citations, run.runsOk));
    }
  }

  // KPIs
  let totalCitations = 0;
  let totalRunsOk = 0;
  let totalRuns = 0;
  let dernierRun = "";
  let meilleurScore = -1;
  let meilleureRequete = "";

  // Pour delta : trier tous les runs par date et comparer les 2 derniers groupes
  const runsParDate: Record<string, number> = {};

  for (const [id, { libelle, runs }] of Object.entries(data)) {
    for (const run of runs) {
      totalCitations += run.wefiit.citations;
      totalRunsOk += run.runsOk;
      totalRuns += 1;
      if (!dernierRun || run.date > dernierRun) dernierRun = run.date;
      runsParDate[run.date] = (runsParDate[run.date] ?? 0) + run.wefiit.citations;
    }
    const scoreMoyen = Object.values(matriceScores[id] ?? {}).reduce((a, b) => a + b, 0);
    if (scoreMoyen > meilleurScore) {
      meilleurScore = scoreMoyen;
      meilleureRequete = libelle;
    }
  }

  const tauxPresence = totalRunsOk > 0 ? Math.round((totalCitations / totalRunsOk) * 100) : 0;

  const toutesLesScores = Object.values(matriceScores).flatMap((m) => Object.values(m));
  const scoreGlobal = toutesLesScores.length > 0
    ? Math.round(toutesLesScores.reduce((a, b) => a + b, 0) / toutesLesScores.length)
    : 0;

  // Delta vs run précédent (dernier jour vs avant-dernier jour)
  const datesTriees = Object.keys(runsParDate).sort();
  let deltaVsRunPrecedent: number | null = null;
  if (datesTriees.length >= 2) {
    const derniere = runsParDate[datesTriees[datesTriees.length - 1]];
    const avantDerniere = runsParDate[datesTriees[datesTriees.length - 2]];
    deltaVsRunPrecedent = derniere - avantDerniere;
  }

  // Évolution par run (un point = une date × modèle)
  const parDateModele: Record<string, { chatgpt: number | null; gemini: number | null }> = {};
  for (const { runs } of Object.values(data)) {
    for (const run of runs) {
      if (!parDateModele[run.date]) parDateModele[run.date] = { chatgpt: null, gemini: null };
      const key = run.model === "chatgpt" ? "chatgpt" : "gemini";
      parDateModele[run.date][key] = (parDateModele[run.date][key] ?? 0) + run.wefiit.citations;
    }
  }
  const evolutionParRun = Object.entries(parDateModele)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      label: date.slice(5), // MM-DD
      date,
      chatgpt: vals.chatgpt,
      gemini: vals.gemini,
    }));

  // Concurrents avec fréquence
  const totauxConcurrents: Record<string, number> = {};
  for (const { runs } of Object.values(data)) {
    for (const run of runs) {
      for (const [nom, count] of Object.entries(run.concurrents)) {
        totauxConcurrents[nom] = (totauxConcurrents[nom] ?? 0) + count;
      }
    }
  }
  const topConcurrents = Object.entries(totauxConcurrents)
    .map(([nom, total]) => ({ nom, total, freq: totalRunsOk > 0 ? Math.round((total / totalRunsOk) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);
  const maxConcurrent = topConcurrents[0]?.total ?? 1;

  // Verbatims
  const verbatims: GeoData["verbatims"] = [];
  for (const [, { libelle, runs }] of Object.entries(data)) {
    for (const run of runs) {
      const textes = run.verbatims ?? run.wefiit.verbatims ?? [];
      const chemins: string[] = run.wefiit?.reponsesChemins ?? [];
      textes.forEach((texte: string, i: number) => {
        verbatims.push({
          texte,
          modele: run.model,
          requete: libelle,
          date: run.date,
          wefiitCite: run.wefiit.citations > 0,
          cheminReponse: chemins[i],
        });
      });
    }
  }
  verbatims.sort((a, b) => b.date.localeCompare(a.date));

  return {
    kpis: { scoreGlobal, totalCitations, totalRuns, tauxPresence, deltaVsRunPrecedent, meilleureRequete, dernierRun },
    matriceScores,
    requetes,
    evolutionParRun,
    topConcurrents,
    maxConcurrent,
    verbatims,
  };
}

export function useGeoData() {
  return useQuery({
    queryKey: ["geo-historique"],
    queryFn: async () => {
      const res = await fetch("/historique.json");
      if (!res.ok) throw new Error(`Erreur fetch historique.json : ${res.status}`);
      const data: Historique = await res.json();
      return data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useGeoDonneesFiltrees(filtres: GeoFiltres) {
  const { data: brut, isLoading, isError } = useGeoData();
  if (!brut) return { data: null, isLoading, isError };

  const donneesFiltrees = filtre(brut, filtres);
  const data = transforme(donneesFiltrees);
  const toutesRequetes = Object.entries(brut).map(([id, val]) => ({ id, libelle: val.libelle }));

  return { data: { ...data, toutesRequetes }, isLoading, isError };
}
