# Plan — Graphique d'évolution des positions SEO par catégorie

## Objectif

Ajouter un graphique d'évolution sur l'écran "Suivi de positions" (rank-tracking), miroir du `GeoEvolutionChart` du dashboard GEO : une courbe par catégorie sélectionnée dans les chips, montrant la position moyenne du groupe dans le temps (axe Y inversé — position 1 en haut).

## Décisions validées avec Antoine

- Réagit aux mêmes chips catégorie déjà en place (Product Management, Product IA, etc. + "Global")
- 1 courbe = position **moyenne** de la catégorie sélectionnée, pas une courbe par mot-clé individuel (illisible à 30 mots-clés)
- Comparaison multi-catégories possible si plusieurs chips sont sélectionnés (comme ChatGPT/Gemini/Claude sur GEO)
- "Global" (aucune catégorie sélectionnée) = une seule courbe de la moyenne sur l'ensemble des mots-clés suivis

## Point ouvert à trancher avant de coder

**Device** : le rank tracking suit desktop ET mobile séparément (toggle déjà existant). Le graphique doit-il suivre le device actif du toggle (une seule courbe par catégorie, sur le device affiché), ou toujours se baser sur desktop peu importe le toggle ? → proposition : suivre le device actif, cohérent avec le reste de l'écran (tableau, colonnes).

## Données disponibles

- 30 runs `completed` en prod, 11 dates de check distinctes depuis le 2026-05-20 — largement suffisant pour une courbe lisible
- Table `rank_snapshots` : une ligne par mot-clé × device × run, avec `position` (null si hors top 20) et `checkedAt`
- Pas de requête existante qui retourne l'historique complet (toutes les dates) — les repositories actuels (`snapshotQueries.ts`) ne récupèrent qu'un seul snapshot (le plus récent, ou le plus proche d'une date) par mot-clé

## Fichiers à créer / modifier

1. `src/server/features/rank-tracking/repositories/snapshotQueries.ts` — nouvelle fonction `getPositionHistoryForConfig(configId, device)` : toutes les positions de tous les runs `completed`, jointes à `rankTrackingKeywords` pour récupérer `category`. Groupée par `(checkedAt, category)` avec moyenne des positions non-null.
2. `src/types/schemas/rank-tracking.ts` — nouveau schéma `getPositionHistorySchema` + type de retour `PositionHistoryPoint` (date, moyenne par catégorie)
3. `src/server/features/rank-tracking/services/rankTrackingResults.ts` ou nouveau fichier service — agrégation SQL → objet exploitable par Recharts (une ligne par date de check, une colonne par catégorie)
4. `src/serverFunctions/rank-tracking.ts` — nouvelle server function `getPositionHistory`
5. `src/client/features/rank-tracking/RankTrackingEvolutionChart.tsx` (nouveau, miroir de `GeoEvolutionChart.tsx`) — Recharts `LineChart`, axe Y inversé (`reversed` ou domaine `[maxPosition, 1]`), une `Line` par catégorie actuellement sélectionnée dans les chips (ou une seule ligne "Toutes" si `Global`)
6. `src/client/features/rank-tracking/RankTrackingDomainDetail.tsx` — brancher le nouveau graphique, probablement entre les chips catégorie et le tableau

## Ce qui ne change PAS

- Le tableau et ses filtres restent identiques — le graphique est un ajout, pas un remplacement
- `GeoEvolutionChart.tsx` n'est pas touché — nouveau composant dédié, pas de partage de code forcé entre GEO et SEO au-delà du pattern visuel

## Étapes d'exécution

1. Repository + requête d'agrégation SQL (vérifier la performance avec les vrais volumes : 88 mots-clés × 2 devices × ~15 runs = ~2600 lignes, largement gérable)
2. Types + service + server function
3. Composant graphique (UI seule, avec données mockées d'abord pour valider le rendu)
4. Branchement dans `RankTrackingDomainDetail.tsx`, connexion aux chips catégorie réels
5. Vérification visuelle + `pnpm build`

Demander confirmation après chaque étape.
