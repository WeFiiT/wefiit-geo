# PLAN — Intégration dashboard GEO dans open-seo

**Objectif :** Ajouter un onglet "AI Visibility" dans open-seo qui affiche le dashboard GEO WeFiiT (visibilité de wefiit.com dans les IA : Gemini, ChatGPT, Perplexity, etc.)

**Statut :** En attente validation design

---

## Contexte

| Élément | Détail |
|---|---|
| Source données | `geo-monitoring/historique.json` (mis à jour par `geo-track.mjs`) |
| Dashboard source | `geo-monitoring/dashboard.html` (Chart.js, header `#1a1a2e`) |
| Cible | `open-seo/src/client/features/geo/` |
| Données dans open-seo | `open-seo/public/geo-historique.json` (copie statique) |
| Librairie graphiques | recharts (déjà dans les dépendances) |
| Design system | DaisyUI thème `openseo` (OKLCH) — voir `src/client/styles/app.css` |

---

## Lien entre les deux projets

Après chaque run de `geo-track.mjs`, copier automatiquement :
```
geo-monitoring/historique.json → open-seo/public/geo-historique.json
```

Ligne à ajouter en fin de `geo-track.mjs` :
```js
fs.copyFileSync('./historique.json', '../open-seo/public/geo-historique.json')
```

---

## Baby steps — Plan d'implémentation

### Étape 1 — Route + navigation
**Fichiers :** `src/client/navigation/items.ts`, `src/routeTree.gen.ts`, `src/client/routes/geo.tsx` (fichier route TanStack)
- Ajouter entrée "AI Visibility" dans le groupe navigation
- Créer la route `/geo` avec un composant placeholder
- Vérifier que le lien apparaît dans la sidebar

### Étape 2 — Lecture des données
**Fichiers :** `src/client/features/geo/useGeoData.ts`
- Hook `useGeoData()` qui fetch `/geo-historique.json`
- Typage TypeScript des entrées (date, modèle, requête, score, verbatim)
- Copier `historique.json` → `public/geo-historique.json` une première fois manuellement

### Étape 3 — Page principale + filtres
**Fichiers :** `src/client/features/geo/GeoPage.tsx`
- Sélecteur de modèle (Gemini / ChatGPT / Perplexity / Claude / tous)
- Sélecteur de période (7j / 30j / 90j / tout)
- Header avec compteur de runs et date du dernier update

### Étape 4 — 4 composants visuels
**Fichiers :** `src/client/features/geo/components/`
- `GeoStats.tsx` — 4 KPI cards : score moyen, nb mentions, nb modèles, tendance
- `GeoChart.tsx` — courbe score dans le temps (recharts LineChart)
- `GeoCompetitors.tsx` — tableau concurrents mentionnés avec WeFiiT
- `GeoVerbatims.tsx` — liste des dernières réponses brutes des IA

### Étape 5 — Sync automatique
**Fichier :** `geo-monitoring/geo-track.mjs`
- Ajouter la ligne de copie `historique.json` → `../open-seo/public/geo-historique.json`
- Tester que le dashboard open-seo se met à jour après un run

### Étape 6 — Déploiement Cloudflare Workers
- `pnpm run build` puis `pnpm run deploy`
- Vérifier que `/geo-historique.json` est bien servi en statique
- URL finale : https://open-seo.wefiit.workers.dev/geo (ou similaire)

---

## Design cible (à valider)

Identité visuelle à respecter :
- Header section : fond sombre `#1a1a2e`, texte blanc, badges colorés par modèle
- Couleurs modèles : Gemini `#4285F4`, ChatGPT `#10A37F`, Perplexity `#6366F1`, Claude `#D97706`
- S'intégrer dans le thème DaisyUI `openseo` existant (pas de styles inline globaux)
- Graphiques : recharts, couleurs cohérentes avec les badges modèles

---

## Décisions arrêtées

| Décision | Raison |
|---|---|
| open-seo comme base unique | Évite de maintenir deux apps séparées |
| Cloudflare Workers | Gratuit, accès multi-machines, déjà configuré |
| Fichier statique JSON | Simple, pas de backend supplémentaire, sync par copie de fichier |
| recharts | Déjà dans les dépendances, pas de nouvelle dépendance |
| Docker écarté | Non installé, non prévu |
| GitHub Pages écarté | Incompatible avec Cloudflare Workers |
