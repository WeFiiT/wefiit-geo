# SPECS — open-seo : Module GEO Visibility

_Dernière mise à jour : 2026-05-19_

---

## Objectif du module

Afficher la **visibilité de WeFiiT dans les réponses des IA génératives** (ChatGPT, Gemini) directement dans open-seo, sur la route `/p/:projectId/geo`.

Les données sont produites par le script externe `geo-monitoring/geo-track.mjs` et consommées ici en lecture seule via un fichier JSON statique.

---

## Flux de données

```
geo-monitoring/geo-track.mjs
  └── exécute 3 runs/requête × 2 modèles
  └── archive dans geo-monitoring/historique.json
  └── copie automatique → open-seo/public/historique.json

open-seo (client)
  └── useGeoData.ts fetch("/historique.json")
  └── filtre() + transforme() → GeoData
  └── GeoPage affiche les 5 composants
```

Le fichier est servi statiquement par Cloudflare Workers depuis `public/`.
Aucun backend, aucune base D1 impliquée pour le GEO.

---

## Structure de `historique.json`

Objet JSON avec une clé par requête monitorée.

```json
{
  "pm-general": {
    "libelle": "meilleur cabinet conseil product management",
    "runs": [
      {
        "date": "2026-05-19",
        "model": "chatgpt",
        "runsOk": 3,
        "wefiit": {
          "citations": 2,
          "previews": ["ligne exacte avec WeFiiT (≤200 chars)"],
          "reponsesChemins": ["responses/pm-general-2026-05-19-chatgpt-run1.txt"]
        },
        "verbatims": ["500 chars run 1", "500 chars run 2", "500 chars run 3"],
        "concurrents": { "Thiga": 3, "Wivoo": 2 },
        "rang": 3,
        "totalCabinets": 8
      }
    ]
  }
}
```

### Rétrocompatibilité (entrées avant 2026-05-11)

Les anciennes entrées ont les verbatims dans `wefiit.verbatims` (et non à la racine).
Le hook gère les deux via : `run.verbatims ?? run.wefiit.verbatims ?? []`.

| Champ | Format ancien (≤ 2026-05-10) | Format actuel (≥ 2026-05-11) |
|-------|------------------------------|-------------------------------|
| verbatims | `run.wefiit.verbatims[]` | `run.verbatims[]` |
| previews | absent | `run.wefiit.previews[]` |
| model | absent (→ implicitement `"chatgpt"`) | `"chatgpt"` ou `"gemini"` |

---

## Requêtes monitorées

| ID | Libellé | Persona |
|----|---------|---------|
| `pm-general` | meilleur cabinet conseil product management | PM |
| `pm-paris` | top 5 agences product management Paris | PM |
| `pm-ia-cabinet` | cabinet spécialisé product management ia | PM / Data-IA |
| `pm-data` | cabinet spécialisé data product management | Data-IA |
| `pmm-general` | cabinet conseil product marketing management | PMM |
| `pm-formation` | je cherche un partenaire pour former mes équipes au product management | Formation |

---

## Concepts métier

### Citation WeFiiT

Un run **cite WeFiiT** si la réponse contient un des patterns :
`/wefiit/i`, `/we\s*fiit/i`, `/wefiit\.com/i`, `/cabinet\s+wefiit/i`

### Run

Une exécution d'une requête sur un modèle = 1 run. Par défaut : **3 runs par requête par modèle**.

Statuts possibles : `ok` / `timeout` / `erreur` / `login-wall`.
Seuls les runs `ok` produisent des données exploitables (`runsOk`).

### Verbatim

Les **500 premiers caractères** de la réponse nettoyée, capturés pour tous les runs `ok` — qu'il y ait citation WeFiiT ou non. Stocké à la racine du run (`run.verbatims[]`).

### Preview

La **ligne exacte** de la réponse contenant la première mention WeFiiT, tronquée à 200 chars. `null` si WeFiiT absent. Stocké dans `run.wefiit.previews[]`.

### Score

Score normalisé 0–3 par requête × modèle :
`score = Math.min(3, Math.round((citations / runsOk) * 3))`

- 0 = jamais cité
- 1 = cité rarement (rouge)
- 2 = cité partiellement (orange)
- 3 = cité systématiquement (vert)

### Score global

Moyenne des scores sur toutes les requêtes × modèles filtrés.

### Taux de présence

`(citations / runsOk) * 100` — pourcentage de runs où WeFiiT est cité.

---

## Filtres disponibles

| Filtre | Options | Valeur par défaut |
|--------|---------|-------------------|
| Requête | Toutes / une requête spécifique | Toutes |
| Modèle | Tous / ChatGPT / Gemini | Tous |
| Période | 7j / 30j / 90j / Tout l'historique | 30 derniers jours |

La période filtre par `run.date >= dateMin` (comparaison ISO string).

---

## Composants UI

### `GeoPage.tsx`

Conteneur principal. Gère l'état des filtres via `useState<GeoFiltres>`.
Appelle `useGeoDonneesFiltrees(filtres)` et passe les données aux enfants.

### `GeoKpiCards.tsx`

4 cartes KPI :
- **Citations totales** — avec delta vs run précédent (▲ vert / ▼ rouge / → neutre)
- **Taux de présence** — % de runs citant WeFiiT
- **Sessions analysées** — nombre total de runs
- **Score global /3** — avec label de la meilleure requête

### `GeoEvolutionChart.tsx`

Courbe d'évolution dans le temps (recharts `LineChart`).
Un point = une date. Deux séries : ChatGPT et Gemini.
Si filtre modèle actif, n'affiche que la série correspondante.

### `GeoMatriceScores.tsx`

Table requêtes × modèles.
Chaque cellule affiche le score (0–3) avec couleur :
- 0 → gris, 1 → rouge (`error`), 2 → orange (`warning`), 3 → vert (`success`)

### `GeoConcurrents.tsx`

Barres horizontales des concurrents les plus cités.
Fréquence = `(total / runsOk) * 100`.
WeFiiT mis en évidence en couleur `warning`.

### `GeoVerbatims.tsx`

Grille 2 colonnes de cartes verbatims.
Chaque carte : texte tronqué à 200 chars (expandable), badge modèle, requête, date.
Verbatims triés du plus récent au plus ancien.
Lit `run.verbatims ?? run.wefiit.verbatims` (rétrocompat).

**Règles d'affichage (specs geo-monitoring) :**
- Limite : **9 items affichés**
- Fond vert pâle (`#f0faf4`) si WeFiiT est cité dans le verbatim
- Fond gris (`#f8f9fa`, opacité réduite) si WeFiiT absent
- Runs avec `runsOk: 0` → non affichés
- Bouton "Voir la réponse complète" si le fichier `.txt` correspondant existe


---

## Hook `useGeoData.ts`

```typescript
// Fetch + cache (5 min staleTime)
useGeoData() → Historique brut

// Filtre + transforme (synchrone, pas de loading)
useGeoDonneesFiltrees(filtres) → GeoData | null
```

**Pipeline de transformation :**
1. `filtre(data, filtres)` — filtre par requête, modèle, dateMin
2. `transforme(data)` — calcule KPIs, matrice, évolution, concurrents, verbatims
3. Retourne `GeoData` complet

**Types clés :**
```typescript
type RunEntry = {
  date: string;
  model: "chatgpt" | "gemini";
  runsOk: number;
  wefiit: { citations: number; verbatims?: string[]; previews?: string[] };
  verbatims?: string[];        // format actuel (≥ 2026-05-11)
  concurrents: Record<string, number>;
};

type GeoFiltres = {
  requeteId: string;   // "" = toutes
  modele: string;      // "" = tous
  jours: number;       // 0 = tout l'historique
};
```

---

## Route

- **Chemin :** `/_project/p/$projectId/geo`
- **Fichier :** `src/routes/_project/p/$projectId/geo.tsx`
- Lazy loading via TanStack Router
- `projectId` passé en prop à `GeoPage` (non utilisé actuellement — données globales WeFiiT)

---

## Règles importantes

- Ne pas modifier `historique.json` à la main (sauf supprimer entrées `runsOk: 0`)
- Le filtrage se fait **côté client** sur le JSON statique — pas de requête serveur
- Pas de pagination côté serveur — le fichier est chargé en entier (272 KB, acceptable)
- Si un run a `runsOk: 0`, il ne doit pas apparaître dans les verbatims ni le taux de présence

---

## État d'avancement (2026-05-19)

| Étape | Statut |
|-------|--------|
| Route + navigation | ✅ Fait |
| Hook useGeoData | ✅ Fait |
| Filtres (requête, modèle, période) | ✅ Fait |
| 5 composants (KPI, Chart, Matrice, Concurrents, Verbatims) | ✅ Fait |
| Sync auto geo-monitoring → open-seo | ✅ Fait (dans geo-track.mjs) |
| Fix rétrocompat verbatims (racine vs wefiit) | ✅ Fait (2026-05-19) |
| Bug encodage UTF-8 verbatims mai | ⚠️ Connu, non traité |
| Déploiement Cloudflare | 🔲 À faire |

---

## Problèmes connus

### Encodage UTF-8 cassé (verbatims de mai 2026)

Les verbatims de mai s'affichent avec des caractères corrompus (`Ã©` au lieu de `é`).
Cause : problème d'encodage dans le script `geo-track.mjs` lors de l'écriture ou la lecture des fichiers `.txt` de réponses.
**Non bloquant** — les données sont lisibles avec effort. À corriger dans `geo-track.mjs`.
