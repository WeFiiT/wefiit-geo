import {
  Bookmark,
  Bot,
  ClipboardCheck,
  Globe,
  Link2,
  Mail,
  MessageSquare,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { linkOptions } from "@tanstack/react-router";

const projectNavItems = [
  {
    to: "/p/$projectId/keywords" as const,
    label: "Recherche de mots-clés",
    icon: Search,
    matchSegment: "/keywords",
  },
  {
    to: "/p/$projectId/saved" as const,
    label: "Mots-clés sauvegardés",
    icon: Bookmark,
    matchSegment: "/saved",
  },
  {
    to: "/p/$projectId/rank-tracking" as const,
    label: "Suivi de positions",
    icon: TrendingUp,
    matchSegment: "/rank-tracking",
  },
  {
    to: "/p/$projectId/domain" as const,
    label: "Vue d'ensemble domaine",
    icon: Globe,
    matchSegment: "/domain",
  },
  {
    to: "/p/$projectId/backlinks" as const,
    label: "Backlinks",
    icon: Link2,
    matchSegment: "/backlinks",
  },
  {
    to: "/p/$projectId/audit" as const,
    label: "Audit de site",
    icon: ClipboardCheck,
    matchSegment: "/audit",
  },
  {
    to: "/p/$projectId/brand-lookup" as const,
    label: "Recherche de marque",
    icon: Sparkles,
    matchSegment: "/brand-lookup",
  },
  {
    to: "/p/$projectId/prompt-explorer" as const,
    label: "Explorateur de prompts",
    icon: MessageSquare,
    matchSegment: "/prompt-explorer",
  },
  {
    to: "/p/$projectId/geo" as const,
    label: "GEO",
    icon: Sparkles,
    matchSegment: "/geo",
  },
] as const;

const _aiNavItem = linkOptions({
  to: "/ai" as const,
  label: "IA & MCP",
  icon: Bot,
  matchSegment: "/ai",
});

function getProjectNavItems(projectId: string) {
  return linkOptions(
    projectNavItems.map((item) => ({
      ...item,
      params: { projectId },
      search: {},
    })),
  );
}

export function getProjectNavGroups(projectId: string) {
  const geoItem = linkOptions({
    to: "/p/$projectId/geo" as const,
    label: "GEO",
    icon: Sparkles,
    matchSegment: "/geo",
    params: { projectId },
    search: {},
  });

  const leadsItem = linkOptions({
    to: "/p/$projectId/leads" as const,
    label: "Leads",
    icon: Mail,
    matchSegment: "/leads",
    params: { projectId },
    search: {},
  });

  // "SEO" dans la nav principale pointe directement sur Suivi de positions.
  // Les autres vues SEO sont accessibles via les sous-onglets de la page
  // (voir getSeoTabs et SeoTabs.tsx).
  const seoItem = linkOptions({
    to: "/p/$projectId/rank-tracking" as const,
    label: "SEO",
    icon: Search,
    // matchSegment couvre toutes les vues SEO pour garder "SEO" actif
    // quelle que soit la vue sous-onglet ouverte.
    matchSegment: "/rank-tracking",
    params: { projectId },
    search: {},
  });

  return [
    {
      type: "standalone" as const,
      item: seoItem,
    },
    {
      type: "standalone" as const,
      item: geoItem,
    },
    {
      type: "standalone" as const,
      item: leadsItem,
    },
  ];
}

// Sous-onglets affichés en haut des pages SEO (Suivi de positions, etc.).
export function getSeoTabs(projectId: string) {
  const all = getProjectNavItems(projectId);
  const bySegment = (seg: string) => all.find((i) => i.matchSegment === seg)!;

  const domainItem = linkOptions({
    to: "/p/$projectId/domain" as const,
    label: "Vue d'ensemble domaine",
    icon: Globe,
    matchSegment: "/domain",
    params: { projectId },
    search: { domain: "wefiit.com" },
  });

  return [
    bySegment("/rank-tracking"),
    bySegment("/keywords"),
    bySegment("/audit"),
    domainItem,
  ];
}

export const dataforseoHelpLinkOptions = linkOptions({
  to: "/help/dataforseo-api-key",
});
