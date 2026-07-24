import { useState } from "react";
import { useLeadsData, type LeadsFiltres } from "./useLeadsData";
import { LeadsFilters } from "./LeadsFilters";
import { LeadsKpiCards } from "./LeadsKpiCards";
import { LeadsTable } from "./LeadsTable";
import { PageTitle } from "@/client/components/PageTitle";

type Props = { projectId: string };

const FILTRES_DEFAUT: LeadsFiltres = {
  categorie: "",
  recherche: "",
  mois: "",
  annee: "",
};

export function LeadsPage({ projectId: _projectId }: Props) {
  const [filtres, setFiltres] = useState<LeadsFiltres>(FILTRES_DEFAUT);
  const { leads, generatedAt, compteurs, annees, isLoading, isError } =
    useLeadsData(filtres);

  return (
    <div className="py-4 md:py-6 pb-24 md:pb-8 overflow-auto">
      <div className="wefiit-pad-x mx-auto max-w-7xl space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <PageTitle>Leads notoriété</PageTitle>
            <p className="text-sm text-base-content/60">
              Centralisation des demandes de leads et des téléchargements de
              contenus premium
            </p>
          </div>
          {generatedAt && (
            <p className="text-xs text-base-content/40 self-end">
              Dernière sync :{" "}
              {new Date(generatedAt).toLocaleString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>

        {/* Filtres */}
        <LeadsFilters
          filtres={filtres}
          onChange={setFiltres}
          annees={annees}
        />

        {/* Compteurs par type */}
        <LeadsKpiCards compteurs={compteurs} />

        {/* États */}
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <span className="loading loading-spinner loading-md" />
          </div>
        )}

        {isError && (
          <div className="flex h-64 flex-col items-center justify-center gap-2">
            <p className="text-sm text-error">
              Impossible de charger les leads.
            </p>
            <p className="text-xs text-base-content/40">
              Lance{" "}
              <code className="bg-base-200 px-1 rounded">node scraper.mjs</code>{" "}
              dans le dossier <code className="bg-base-200 px-1 rounded">leads-scraper/</code> pour générer le fichier.
            </p>
          </div>
        )}

        {!isLoading && !isError && leads !== null && (
          <LeadsTable leads={leads} />
        )}
      </div>
    </div>
  );
}
