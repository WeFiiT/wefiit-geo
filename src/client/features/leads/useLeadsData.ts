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
};

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
    if (q) {
      const cible = `${l.entreprise ?? ""} ${l.email ?? ""} ${l.message ?? ""}`.toLowerCase();
      if (!cible.includes(q)) return false;
    }
    return true;
  });
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
    return { leads: null, generatedAt: null, compteurs: null, isLoading, isError };
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
    isLoading,
    isError,
  };
}
