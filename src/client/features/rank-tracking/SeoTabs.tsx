import { Link, useLocation } from "@tanstack/react-router";
import { getSeoTabs } from "@/client/navigation/items";

/**
 * Barre de sous-onglets affichée en haut des pages SEO.
 * Remplace l'ancien menu déroulant "SEO" de la nav principale :
 * "SEO" mène désormais directement à Suivi de positions, et les autres
 * vues SEO (mots-clés, audit, domaine) sont accessibles via ces onglets.
 */
export function SeoTabs({ projectId }: { projectId: string }) {
  const { pathname } = useLocation();
  const tabs = getSeoTabs(projectId);

  return (
    <div role="tablist" className="tabs tabs-bordered mb-6">
      {tabs.map((tab) => {
        const { icon: Icon, matchSegment, ...linkProps } = tab;
        const isActive = pathname.includes(matchSegment);
        return (
          <Link
            key={linkProps.to}
            {...linkProps}
            role="tab"
            className={`tab gap-2 ${
              isActive ? "tab-active font-medium text-primary" : ""
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
