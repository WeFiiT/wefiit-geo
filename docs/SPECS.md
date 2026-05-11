# SPECS — GEO Monitoring WeFiiT

_Dernière mise à jour : 2026-05-11_

---

## Objectif

Mesurer la **visibilité de WeFiiT dans les réponses des IA génératives** (ChatGPT, Gemini) sur des requêtes liées aux métiers produit. Suivre l'évolution dans le temps et comparer avec les concurrents.

---

## Concepts métier

### Citation WeFiiT

Un run **cite WeFiiT** si la réponse contient l'un de ces patterns :
- `/wefiit/i`
- `/we\s*fiit/i`
- `/wefiit\.com/i`
- `/cabinet\s+wefiit/i`

### Run

Une exécution d'une requête sur un modèle = 1 run. Par défaut : **3 runs par requête par modèle**.

Un run a un statut :
- `ok` : réponse reçue et exploitable (> 20 chars)
- `timeout` : pas de réponse dans le délai
- `erreur` : exception Playwright
- `login-wall` : mur de connexion détecté (Gemini)

Seuls les runs `ok` produisent des données exploitables.

### Verbatim

Les **500 premiers caractères** de la réponse nettoyée, capturés pour **tous les runs ok** — qu'il y ait citation WeFiiT ou non.

> Décision 2026-05-11 : on capture les verbatims indépendamment de la présence de WeFiiT, pour pouvoir lire ce que les IA disent même quand WeFiiT est absent.

### Preview

La **ligne exacte** de la réponse contenant la première mention WeFiiT, tronquée à 200 caractères. `null` si WeFiiT non cité.

> Décision 2026-05-11 : la preview cible uniquement la phrase WeFiiT (pas le contexte autour).

---

## Règles d'affichage dashboard

### Section "Verbatims récents"

- Affiche les verbatims des runs ok, du plus récent au plus ancien
- Limite : 9 items affichés
- **Fond vert pâle** (`#f0faf4`) si WeFiiT est cité dans le verbatim
- **Fond gris** (`#f8f9fa`, opacité réduite) si WeFiiT absent
- Runs avec `runsOk: 0` → **non affichés**
- Le bouton "Voir la réponse complète" s'affiche si le fichier `.txt` de la réponse existe

### Section concurrents

- Fréquence = nombre de runs (sur total `runsOk`) où le concurrent apparaît

---

## Structure `historique.json` (par run archivé)

```json
{
  "date": "2026-05-11",
  "model": "chatgpt",
  "runsOk": 3,
  "wefiit": {
    "citations": 2,
    "previews": ["ligne exacte avec WeFiiT (≤200 chars)"],
    "reponsesChemins": ["responses/pm-general-2026-05-11-chatgpt-run1.txt"]
  },
  "verbatims": ["500 chars run 1", "500 chars run 2", "500 chars run 3"],
  "concurrents": { "Thiga": 3, "Octo": 1 }
}
```

**Rétrocompatibilité** : entrées sans champ `model` → implicitement `"chatgpt"`.

---

## Règles de déduplication

- Un run du même **jour + même modèle** ne se relance pas si `runsOk > 0`
- Les entrées fantômes (`runsOk: 0`) sont ignorées par le duplicate-check → re-run autorisé

---

## Nettoyage des réponses

Avant tout traitement, les réponses passent par `nettoyerTexte()` qui supprime :
- Le préfixe "Gemini a dit"
- Les lignes vides
- Les parasites UI : Mapbox, instructions clavier, notes de notation collées (ex: `"Thiga5.0Delva3.8"`)
