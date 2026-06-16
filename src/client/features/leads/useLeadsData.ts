import { useQuery } from "@tanstack/react-query";

export type Lead = {
  id: string;
  date: string | null;
  type: "Business" | "Candidat";
  typeLead: "demande de contact" | "réservation booking";
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

export type LeadsFiltres = {
  type: "" | "Business" | "Candidat";
  typeLead: "" | "demande de contact" | "réservation booking";
};

export type LeadsCompteurs = {
  Business: number;
  Candidat: number;
};

function filtrer(leads: Lead[], filtres: LeadsFiltres): Lead[] {
  return leads.filter((l) => {
    if (filtres.type && l.type !== filtres.type) return false;
    if (filtres.typeLead && l.typeLead !== filtres.typeLead) return false;
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

      const leads: Lead[] = data.leads.map((l) => {
        const e = enrichissement.enrichissements[l.id] ?? {};
        return {
          ...l,
          besoinsBoond: e.besoinsBoond ?? null,
          source: e.source ?? null,
        };
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

  // Compteurs calculés sur la liste COMPLÈTE (pas la filtrée) : sinon l'onglet
  // inactif afficherait toujours 0.
  const compteurs = {
    Business: brut.leads.filter((l) => l.type === "Business").length,
    Candidat: brut.leads.filter((l) => l.type === "Candidat").length,
  };

  return {
    leads: leadsFiltres,
    generatedAt: brut.generatedAt,
    compteurs,
    isLoading,
    isError,
  };
}
