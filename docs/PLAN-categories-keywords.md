# Plan — Catégories sur les mots-clés du Suivi de positions

## Objectif

Ajouter un filtre par catégorie métier sur l'écran "Suivi de positions" (`rank-tracking`), pour regrouper les ~90 mots-clés suivis par persona WeFiiT plutôt que de les lire en vrac.

## Décision d'architecture

Colonne `category` en **enum fixe** sur `rank_tracking_keywords` (pas le système de tags multi-valeurs `savedKeywordTags` existant, qui est réservé au module "Recherche de mots-clés"). Chaque mot-clé suivi appartient à **une seule** catégorie — décision validée avec Antoine : plus simple qu'un système de tags multiples, un mot-clé de rank tracking a un persona dominant unique.

7 valeurs, définitivement tranchées avec Antoine :

- `product_management`
- `product_ia`
- `product_data`
- `product_marketing`
- `product_ops`
- `product_quality`
- `informational` (contenu de notoriété, hors offre — ex: "okr", "gherkin", "definition of done")

## Fichiers à créer / modifier

1. `src/db/app.schema.ts` — ajouter la colonne `category` (text, enum, nullable) sur `rankTrackingKeywords`
2. `pnpm db:generate` → nouvelle migration dans `drizzle/`
3. `src/types/schemas/rank-tracking.ts` — ajouter `category` à `RankTrackingRow`, ajouter le schéma zod de l'enum, l'exposer dans `addKeywordsSchema` (catégorie optionnelle à l'ajout) et créer un nouveau schéma `updateKeywordCategorySchema`
4. `src/server/features/rank-tracking/repositories/RankTrackingRepository.ts` — inclure `category` dans `getKeywordsForConfig`, ajouter une méthode `updateKeywordCategory`
5. `src/server/features/rank-tracking/services/rankTrackingResults.ts` — propager `category` dans la construction de `RankTrackingRow` (ligne ~91)
6. `src/serverFunctions/rank-tracking.ts` — nouvelle server function `updateKeywordCategory` (bulk, comme `removeTrackingKeywords`)
7. `src/client/features/rank-tracking/RankTrackingColumns.tsx` — nouvelle colonne "Catégorie" (badge coloré, éditable via select inline ou menu contextuel)
8. `src/client/features/rank-tracking/RankTrackingFilters.tsx` — ajouter le filtre catégorie (multi-select comme `SavedKeywordsTagFilter`, ou simple select si on préfère plus léger) + logique dans `applyFilters`
9. `src/client/features/rank-tracking/RankTrackingTable.tsx` — action bulk "Assigner une catégorie" dans la barre d'actions groupées (comme "Remove")
10. Script one-off `scripts/seed-categories-rank-tracking.ts` — applique le mapping validé (liste ci-dessous) sur les mots-clés existants en prod, exécuté une fois puis supprimable

## Ce qui ne change PAS

- Le système de tags `savedKeywordTags` du module "Recherche de mots-clés" — aucune modification, aucun partage de code avec cette nouvelle colonne
- Le flux GEO et Leads (lecture seule, non concernés)
- Le format des exports CSV existants (`exportRankTrackingCsv`) — on ajoutera la colonne catégorie à l'export mais sans casser l'ordre des colonnes actuelles

## Mapping validé (à appliquer via le script de seed)

Liste des ~90 mots-clés actuellement suivis (après nettoyage manuel fait par Antoine dans l'UI : 7 suppressions de doublons inversés + ajout de "product builder"), catégorie par catégorie :

**product_management**
agence conseil product management, cabinet conseil product management, cabinet de conseil product management, conseil product management, consultant product management, discovery product management, product discovery, meilleur cabinet conseil product management, product management, coaching product manager, agence product management, meilleure agence product management, formation product management, formation product manager, product management coach, product management formation, consultant lead product manager, consultant product manager, consultant product owner, leader produit, leader product management, product management consulting, product manager formation, product manager manager, role product manager, discovery discipline, product growth, product strategy, stratégie produit, data product owner, feature team, impact team, roadmap produit

**product_ia**
ia product manager, product manager ia, ia product management formation, pm ia, ia product owner, product owner ia, formation product owner ia, product builder

**product_data**
data product manager, product manager data, product data manager, consultant data pm, product ia, data pm, pm data, consultant data product manager, consultant product data manager, product data manager, product data management, formation data product manager

**product_marketing**
cabinet de conseil product marketing, conseil product marketing, consultant product marketing, consultant product marketing manager, product marketing management, product marketing, formation product marketing, production manager marketing, product marketing manager, pmm formation

**product_ops**
product ops, formation product ops, consultant product operations, consultant product ops, product ops role

**product_quality**
quality analyst, consultant quality analyst, qa, lead quality analyst

**informational**
daily meeting, definition of done, definition of ready, gherkins, gherkin, bdd, feedback loop, impact mapping, epics, shape up, 3 amigos, lean canvas, okr, roadmap, tres amigos, user story, north star metric

> Note : cette liste n'est pas exhaustive à 100% des mots-clés réellement en base (lue depuis capture d'écran, pas requête SQL directe — l'accès direct à D1 prod était bloqué par une auth Cloudflare expirée). Le script de seed doit logguer les mots-clés non trouvés dans ce mapping pour qu'Antoine les classe manuellement dans l'UI après coup.

## Étapes d'exécution (baby steps)

1. Schéma + migration (colonne nullable, aucun risque de casser l'existant)
2. Backend (repository + service + server function)
3. Script de seed + exécution en prod (une fois la migration appliquée)
4. UI colonne + filtre
5. Vérification visuelle dans le dashboard + `pnpm build`

Demander confirmation après chaque étape, comme prévu par le CLAUDE.md du projet.
