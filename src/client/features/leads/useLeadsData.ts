import { useQuery } from "@tanstack/react-query";

export type Lead = {
  id: string;
  date: string | null;
  type: "Business" | "Candidat" | "Téléchargement";
  typeLead:
    | "demande de contact"
    | "réservation booking"
    | "téléchargement contenu premium";
  email: string | null;
  entreprise: string | null;
  message: string | null;
  besoinsBoond: number | null;
  source: string | null;
};

type LeadsJson = {
  generatedAt: string;
  leads: Omit<Lead, "besoinsBoond" | "source">[];
};

type EnrichissementJson = {
  enrichissements: Record<string, { besoinsBoond?: number; source?: string }>;
};

// Catégorie métier affichée et filtrée dans le tableau. Dérivée du type du lead
// (Business / Candidat) et, pour les téléchargements, du contenu du message.
export type LeadCategorie =
  | "Leads Business"
  | "Leads Talent"
  | "Livre blanc PMM"
  | "Guide IA"
  | "Autre";

export const CATEGORIES: LeadCategorie[] = [
  "Leads Business",
  "Leads Talent",
  "Livre blanc PMM",
  "Guide IA",
];

// Lead enrichi d'une catégorie calculée, manipulé côté UI.
export type LeadAffiche = Lead & { categorie: LeadCategorie };

export type LeadsFiltres = {
  categorie: "" | LeadCategorie;
  recherche: string;
  // "" = tous. mois sur 1-12, annee sur 4 chiffres (string pour les <select>).
  mois: string;
  annee: string;
};

// Libellés des 12 mois pour le <select> (index 0 = Janvier).
export const MOIS_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// Déduit la catégorie métier d'un lead : les téléchargements sont éclatés par
// contenu, les autres leads suivent leur type (Business / Candidat → Talent).
function deriverCategorie(lead: Lead): LeadCategorie {
  if (lead.typeLead === "téléchargement contenu premium") {
    const m = (lead.message ?? "").toLowerCase();
    if (m.includes("livre blanc pmm")) return "Livre blanc PMM";
    if (m.includes("guide ia")) return "Guide IA";
  }
  if (lead.type === "Business") return "Leads Business";
  if (lead.type === "Candidat") return "Leads Talent";
  return "Autre";
}

function filtrer(leads: LeadAffiche[], filtres: LeadsFiltres): LeadAffiche[] {
  const q = filtres.recherche.trim().toLowerCase();
  return leads.filter((l) => {
    if (filtres.categorie && l.categorie !== filtres.categorie) return false;
    if (filtres.mois || filtres.annee) {
      if (!l.date) return false;
      const d = new Date(l.date);
      // getMonth() est 0-indexé → +1 pour comparer à la valeur 1-12 du select.
      if (filtres.mois && String(d.getMonth() + 1) !== filtres.mois) return false;
      if (filtres.annee && String(d.getFullYear()) !== filtres.annee) return false;
    }
    if (q) {
      const cible = `${l.entreprise ?? ""} ${l.email ?? ""} ${l.message ?? ""}`.toLowerCase();
      if (!cible.includes(q)) return false;
    }
    return true;
  });
}

// Années présentes dans les leads, triées décroissant (pour le <select>).
function anneesDisponibles(leads: LeadAffiche[]): string[] {
  const set = new Set<string>();
  for (const l of leads) {
    if (l.date) set.add(String(new Date(l.date).getFullYear()));
  }
  return [...set].sort((a, b) => Number(b) - Number(a));
}

export function useLeadsData(filtres: LeadsFiltres) {
  const query = useQuery({
    queryKey: ["leads-json"],
    queryFn: async () => {
      const [leadsRes, enrichRes] = await Promise.all([
        fetch(`/leads.json?v=${Date.now()}`),
        fetch(`/leads-enrichissement.json?v=${Date.now()}`),
      ]);
      if (!leadsRes.ok) throw new Error(`Erreur fetch leads.json : ${leadsRes.status}`);
      const data: LeadsJson = await leadsRes.json();
      const enrichissement: EnrichissementJson = enrichRes.ok
        ? await enrichRes.json()
        : { enrichissements: {} };

      const leads: LeadAffiche[] = data.leads.map((l) => {
        const e = enrichissement.enrichissements[l.id] ?? {};
        const enrichi: Lead = {
          ...l,
          besoinsBoond: e.besoinsBoond ?? null,
          source: e.source ?? null,
        };
        return { ...enrichi, categorie: deriverCategorie(enrichi) };
      });

      return { generatedAt: data.generatedAt, leads };
    },
    staleTime: 0,
  });

  const { data: brut, isLoading, isError } = query;

  if (!brut) {
    return {
      leads: null,
      generatedAt: null,
      compteurs: null,
      annees: [],
      isLoading,
      isError,
    };
  }

  const leadsFiltres = filtrer(brut.leads, filtres);

  // Compteurs par catégorie, calculés sur la liste COMPLÈTE.
  const compteurs = Object.fromEntries(
    CATEGORIES.map((c) => [c, brut.leads.filter((l) => l.categorie === c).length]),
  ) as Record<LeadCategorie, number>;

  return {
    leads: leadsFiltres,
    generatedAt: brut.generatedAt,
    compteurs,
    annees: anneesDisponibles(brut.leads),
    isLoading,
    isError,
  };
}
