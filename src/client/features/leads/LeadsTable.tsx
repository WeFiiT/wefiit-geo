import { useMemo, useState } from "react";
import type React from "react";
import type { LeadAffiche, LeadCategorie } from "./useLeadsData";

type Props = { leads: LeadAffiche[] };

const COLOR_CATEGORIE: Record<LeadCategorie, string> = {
  "Leads Business": "text-primary",
  "Leads Talent": "text-info",
  "Livre blanc PMM": "text-success",
  "Guide IA": "text-secondary",
  Autre: "text-base-content/50",
};

// Colonnes triables : clé de tri + libellé.
type ColonneTri = "date" | "entreprise" | "categorie" | "email";

function formatDate(iso: string | null): React.ReactNode {
  if (!iso) return <span className="text-base-content/30">—</span>;
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function LeadModal({
  lead,
  onClose,
}: {
  lead: LeadAffiche;
  onClose: () => void;
}) {
  return (
    <dialog className="modal modal-open" onClick={onClose}>
      <div className="modal-box max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="mb-4 flex items-center gap-2">
          <span className={`text-xs font-semibold ${COLOR_CATEGORIE[lead.categorie]}`}>
            {lead.categorie}
          </span>
        </div>
        <h3 className="mb-1 text-base font-semibold">
          {lead.entreprise ?? (
            <span className="text-base-content/40">Entreprise inconnue</span>
          )}
        </h3>
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="link link-hover mb-3 block text-sm text-base-content/60"
          >
            {lead.email}
          </a>
        )}
        <div className="divider my-3" />
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-base-content">
          {lead.message ?? (
            <span className="text-base-content/40">Aucun message</span>
          )}
        </p>
        <div className="mt-4 text-right text-xs text-base-content/40">
          {formatDate(lead.date)}
        </div>
      </div>
    </dialog>
  );
}

// En-tête de colonne cliquable : bascule asc/desc et affiche la flèche active.
function EnteteTri({
  colonne,
  label,
  triCle,
  triAsc,
  onTri,
}: {
  colonne: ColonneTri;
  label: string;
  triCle: ColonneTri;
  triAsc: boolean;
  onTri: (c: ColonneTri) => void;
}) {
  const actif = triCle === colonne;
  return (
    <th>
      <button
        type="button"
        className="flex items-center gap-1 hover:text-base-content"
        onClick={() => onTri(colonne)}
      >
        {label}
        <span className={actif ? "text-primary" : "text-base-content/20"}>
          {actif ? (triAsc ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

export function LeadsTable({ leads }: Props) {
  const [leadSelectionne, setLeadSelectionne] = useState<LeadAffiche | null>(
    null,
  );
  const [triCle, setTriCle] = useState<ColonneTri>("date");
  const [triAsc, setTriAsc] = useState(false);

  function changerTri(colonne: ColonneTri) {
    if (colonne === triCle) {
      setTriAsc((v) => !v);
    } else {
      setTriCle(colonne);
      setTriAsc(false);
    }
  }

  const leadsTries = useMemo(() => {
    const copie = [...leads];
    copie.sort((a, b) => {
      let va = "";
      let vb = "";
      if (triCle === "date") {
        va = a.date ?? "";
        vb = b.date ?? "";
      } else if (triCle === "entreprise") {
        va = (a.entreprise ?? "").toLowerCase();
        vb = (b.entreprise ?? "").toLowerCase();
      } else if (triCle === "categorie") {
        va = a.categorie;
        vb = b.categorie;
      } else {
        va = (a.email ?? "").toLowerCase();
        vb = (b.email ?? "").toLowerCase();
      }
      const cmp = va.localeCompare(vb);
      return triAsc ? cmp : -cmp;
    });
    return copie;
  }, [leads, triCle, triAsc]);

  if (leads.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-box border border-base-200 bg-base-100">
        <p className="text-sm text-base-content/40">Aucun lead pour ces filtres.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-box border border-base-200">
        <table className="table table-sm bg-base-100">
          <thead>
            <tr className="text-xs text-base-content/50">
              <EnteteTri colonne="date" label="Date" triCle={triCle} triAsc={triAsc} onTri={changerTri} />
              <EnteteTri colonne="entreprise" label="Entreprise" triCle={triCle} triAsc={triAsc} onTri={changerTri} />
              <EnteteTri colonne="categorie" label="Type" triCle={triCle} triAsc={triAsc} onTri={changerTri} />
              <EnteteTri colonne="email" label="Email" triCle={triCle} triAsc={triAsc} onTri={changerTri} />
              <th>Message</th>
              <th title="Besoins remontés dans Boond">Boond</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {leadsTries.map((lead) => (
              <tr
                key={lead.id}
                className="cursor-pointer hover:bg-base-200"
                onClick={() => setLeadSelectionne(lead)}
              >
                <td className="whitespace-nowrap text-xs text-base-content/70">
                  {formatDate(lead.date)}
                </td>
                <td className="max-w-[160px] truncate text-sm font-medium">
                  {lead.entreprise ?? <span className="text-base-content/30">—</span>}
                </td>
                <td>
                  <span className={`text-xs ${COLOR_CATEGORIE[lead.categorie]}`}>
                    {lead.categorie}
                  </span>
                </td>
                <td className="max-w-[180px]">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="link link-hover text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-base-content/30 text-xs">—</span>
                  )}
                </td>
                <td className="max-w-[240px]">
                  {lead.message ? (
                    <span className="block truncate text-xs text-base-content/60">
                      {lead.message}
                    </span>
                  ) : (
                    <span className="text-base-content/30 text-xs">—</span>
                  )}
                </td>
                <td className="text-center text-xs">
                  {lead.besoinsBoond !== null ? (
                    <span className="font-semibold text-primary">{lead.besoinsBoond}</span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>
                <td className="max-w-[160px]">
                  {lead.source ? (
                    <span className="block truncate text-xs text-base-content/60" title={lead.source}>
                      {lead.source}
                    </span>
                  ) : (
                    <span className="text-base-content/30 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leadSelectionne && (
        <LeadModal lead={leadSelectionne} onClose={() => setLeadSelectionne(null)} />
      )}
    </>
  );
}
