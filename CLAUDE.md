# CLAUDE.md — open-seo

Outil SEO & GEO interne WeFiiT. Hébergé sur Cloudflare Workers.

---

## Qu'est-ce que c'est ?

**open-seo** est une plateforme d'analytics SEO full-stack construite sur Cloudflare Workers + React.
Elle agrège plusieurs outils : rank tracking, audit de site, recherche de mots-clés, backlinks, et un module **GEO Visibility** (suivi de la présence WeFiiT dans les IA génératives).

---

## Stack technique

| Couche | Techno |
|--------|--------|
| Framework client | React 19 + TanStack Start |
| Routing | TanStack Router v1 (file-based) |
| State / Data | TanStack Query (React Query) |
| UI | DaisyUI 5 + Tailwind CSS 4 |
| Graphiques | Recharts |
| Backend | Cloudflare Workers |
| Base de données | Drizzle ORM + D1 (SQLite) |
| Auth | Better Auth 1.5 (hosted) / Cloudflare Access / local_noauth |
| Build | Vite 7 + TypeScript 5.9 |
| Tests | Vitest 3 |
| Lint | Oxlint + Prettier |
| Package manager | pnpm 10 |

---

## Commandes essentielles

```bash
pnpm dev                   # Dev local (AUTH_MODE=local_noauth, port 3001)
pnpm build                 # Build Vite + typecheck
pnpm deploy                # Migration DB prod + build + wrangler deploy
pnpm test                  # Vitest
pnpm lint / lint:fix       # Oxlint
pnpm db:generate           # Générer migration Drizzle
pnpm db:migrate:local      # Appliquer migrations en local
pnpm db:migrate:prod       # Appliquer migrations en prod
```

---

## Structure clé

```
open-seo/
├── public/
│   └── historique.json         ← données GEO (copié depuis geo-monitoring/)
├── src/
│   ├── client/
│   │   └── features/geo/       ← MODULE GEO (voir SPECS.md)
│   │       ├── GeoPage.tsx
│   │       ├── GeoKpiCards.tsx
│   │       ├── GeoEvolutionChart.tsx
│   │       ├── GeoMatriceScores.tsx
│   │       ├── GeoConcurrents.tsx
│   │       ├── GeoVerbatims.tsx
│   │       └── useGeoData.ts
│   ├── routes/
│   │   └── _project/p/$projectId/geo.tsx   ← route /p/:id/geo
│   ├── server/                 ← handlers Cloudflare Workers
│   └── db/                     ← schémas Drizzle
├── docs/
│   ├── SPECS.md                ← specs métier (lire avant toute modif GEO)
│   └── PLAN-geo-integration.md ← plan d'intégration GEO (archivé)
├── drizzle/                    ← migrations (15 à ce jour)
├── wrangler.jsonc              ← config Cloudflare
└── adr/                        ← Architecture Decision Records
```

---

## Module GEO — Règles importantes

Le module GEO est **en lecture seule** côté open-seo : il consomme un fichier JSON statique produit par `geo-monitoring/geo-track.mjs`.

**Flux de données :**
```
geo-monitoring/geo-track.mjs
  → geo-monitoring/historique.json
  → (copie auto) open-seo/public/historique.json
  → fetch("/historique.json") par useGeoData.ts
  → dashboard GEO
```

**Structure historique.json** — deux formats coexistent (rétrocompat) :

| Champ | Entrées ≤ mai 2026-05-10 | Entrées ≥ 2026-05-11 |
|-------|--------------------------|----------------------|
| verbatims | `run.wefiit.verbatims[]` | `run.verbatims[]` (racine) |
| previews | absent | `run.wefiit.previews[]` |

Le hook `useGeoData.ts` gère les deux : `run.verbatims ?? run.wefiit.verbatims ?? []`.

**Ne jamais :**
- Modifier `historique.json` à la main (sauf supprimer des entrées vides `runsOk: 0`)
- Stocker des données GEO en base D1 — le JSON statique suffit
- Ajouter un backend API pour le GEO — ça reste statique

---

## Authentification

Trois modes configurables via `AUTH_MODE` :
- `local_noauth` — dev local, injecte `admin@localhost` (défaut `pnpm dev`)
- `cloudflare_access` — valide les JWTs CF Access (prod self-hosted)
- `hosted` — Better Auth email/password (prod SaaS)

---

## Déploiement

Cloudflare Workers via `wrangler.jsonc`. Ressources attachées :
- **D1** (base SQL SQLite) — `DB`
- **KV** — sessions, cache
- **R2** — fichiers statiques lourds
- **Cron** — `*/15 * * * *` (rank checks)

CI/CD : GitHub Actions sur PR + push `main` (lint → test → build → Docker image).

---

## Conventions de code

- Toujours `===`, jamais `==`
- `await` devant toutes les promesses
- `try/catch` sur tout appel API ou fetch
- Composants en `PascalCase`, hooks en `camelCase` préfixés `use`
- Pas de `console.log` oubliés
- Noms de variables en français pour le domaine métier WeFiiT

---

## Specs métier

→ Voir [docs/SPECS.md](docs/SPECS.md) pour la documentation complète du module GEO.
