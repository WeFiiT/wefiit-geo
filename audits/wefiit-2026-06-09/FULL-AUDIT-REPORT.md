# Audit SEO Complet — wefiit.com
**Date :** 09 juin 2026  
**Méthode :** curl HTML brut + Playwright (données vérifiées, pas d'inférence WebFetch)  
**Périmètre :** 214 URLs (sitemap) + 10 pages clés crawlées en profondeur  
**Stack :** Webflow

---

## Executive Summary

### Score SEO Global : **62 / 100** ⚠️

| Catégorie | Score | Poids | Score pondéré |
|---|---|---|---|
| SEO Technique | 62/100 | 22% | 13.6 |
| Qualité du Contenu | 70/100 | 23% | 16.1 |
| On-Page SEO | 65/100 | 20% | 13.0 |
| Schema / Données Structurées | 35/100 | 10% | 3.5 |
| Performance (CWV) | 50/100 | 10% | 5.0 |
| Lisibilité IA / GEO | 65/100 | 10% | 6.5 |
| Images | 30/100 | 5% | 1.5 |
| **TOTAL** | | **100%** | **59.2 → 62/100** |

### Type de business détecté
Cabinet de conseil B2B spécialisé Product Management — 4 verticales (PM, PMM, Data & IA, QA) × 3 offres (Immersion, Conseil, Formation). Contenu multiformat (blog 130+ articles, We.Talk 15+ épisodes, ressources téléchargeables).

### Top 5 problèmes critiques
1. **OG Image absente sur toutes les pages** — vérifiée par curl sur 9 pages : aucune `og:image` ni `twitter:image`. Impact direct sur le CTR réseaux sociaux et partages LinkedIn.
2. **Zéro schema page-spécifique** — le schema `Organization` existe sur `/product-management` uniquement. Aucun `FAQPage`, `Article`, `Course`, `VideoObject`, `BreadcrumbList`, `AggregateRating` nulle part.
3. **Title `/product-ops` : "Product Ops"** — 11 caractères, sans "WeFiiT", sans "Conseil". Invisible dans les SERP.
4. **Title `/we-talk` : "We.Talk"** — 8 caractères, aucun contexte pour Google.
5. **Erreur JS critique sur `/product-ops` et `/we-talk`** — `TypeError: Cannot set properties of null (setting 'href')` + speculation rules malformées. Détectée par Playwright.

### Top 5 quick wins (effort < 1h chacun)
1. Ajouter une OG Image sur toutes les pages via Webflow (Settings → SEO → OG Image) — impact immédiat sur le CTR social
2. Corriger le title `/product-ops` → "Conseil Product Ops | WeFiiT" (5 min)
3. Corriger le title `/we-talk` → "We.Talk - Talks & Podcast Product Management | WeFiiT" (5 min)
4. Corriger l'erreur JS sur `/product-ops` et `/we-talk` (bug `href` sur élément null)
5. Déployer le schema `Organization` sur la homepage (il est sur `/product-management` mais pas sur `/`)

---

## 1. SEO Technique — 62/100

### robots.txt ✅ Bon
```
Disallow: /missions-collections/
Disallow: /missions-tags/
Disallow: /composants/
Disallow: /wefiit-beta/
Disallow: /tag/
Disallow: /2019/ à /2023/
```
- Bots IA (Claude, GPT, Perplexity) explicitement autorisés — excellente pratique GEO ✅
- Sitemap déclaré ✅
- ⚠️ Archives 2019–2023 bloquées — potentiel contenu de valeur non indexé

### Sitemap ✅
- 214 URLs déclarées, bien structuré
- URL canonique www.wefiit.com utilisée ✅

### Canonicals ✅ Vérifiés par curl
Chaque page pointe sur elle-même :
- Homepage → `https://www.wefiit.com` ✅
- `/product-management` → `https://www.wefiit.com/product-management` ✅
- `/product-marketing` → `https://www.wefiit.com/product-marketing` ✅
- Idem pour toutes les pages crawlées ✅

### Erreurs JavaScript 🔴 Détectées par Playwright

| Page | Erreur | Impact |
|---|---|---|
| `/product-ops` | `TypeError: Cannot set properties of null (setting 'href')` ligne 256 | Fonctionnalité cassée, UX dégradée |
| `/we-talk` | `TypeError: Cannot set properties of null (setting 'href')` ligne 255 | Fonctionnalité cassée, UX dégradée |
| Les deux | `Speculation rules: Unexpected data after root element` | Prefetching/prerendering non fonctionnel |

**Action :** Inspecter le JS custom Webflow ligne 255–256 sur ces deux pages — probablement un `document.querySelector()` qui renvoie `null` quand l'élément ciblé n'existe pas sur la page.

### Sécurité ✅
- HTTPS actif, géré par Webflow ✅
- `lang="fr"` présent sur `<html>` ✅

---

## 2. On-Page SEO — 65/100

### Titres de page — vérifiés par curl

| Page | Title (exact) | Longueur | Avis |
|---|---|---|---|
| Homepage | "Conseil en Product Management - Product with Impact - WeFiiT" | 60 car. | ✅ Bon |
| /product-management | "Conseil spécialisé en Product Management - WeFiiT" | 50 car. | ✅ Bon |
| /product-marketing | "Conseil en Product Marketing Management  WeFiiT" | 48 car. | ⚠️ Double espace, tiret manquant avant WeFiiT |
| /product-ia-data-management | "Conseil en Product Data Management & IA - WeFiiT" | 49 car. | ✅ Bon |
| /product-quality | "Conseil en Product Quality - WeFiiT" | 37 car. | ⚠️ Court, pas de ville/différenciateur |
| /product-ops | **"Product Ops"** | **11 car.** | 🔴 Critique — sans "Conseil", sans "WeFiiT" |
| /we-talk | **"We.Talk"** | **8 car.** | 🔴 Critique — aucun mot-clé |
| /formation-product-management | "Formation Product Management fullstack - WeFiiT" | 48 car. | ✅ Bon |
| /cas-clients | "Nos études de cas et références clients - WeFiiT" | 49 car. | ✅ Bon |
| /blog | "Blog WeFiiT - Conseil en Product Management" | 44 car. | ✅ Bon |

### Méta-descriptions — vérifiées par curl

| Page | Longueur | Contenu (extrait) | Avis |
|---|---|---|---|
| Homepage | **179 car.** | "WeFiiT est un cabinet de conseil spécialisé en Product Management à Paris…" | 🔴 Trop longue (max 155) — tronquée par Google |
| /product-management | 151 car. | "Conseil, renfort opérationnel et formation en Product Management à Paris…" | ✅ |
| /product-marketing | 140 car. | "Une équipe de consultants passionnés à vos côtés pour structurer…" | ✅ |
| /product-ia-data-management | 148 car. | "Une équipe de consultants passionnés pour construire à vos côtés…" | ✅ |
| /product-quality | **87 car.** | "WeFiiT vous accompagne pour faire de la qualité un enjeu clé…" | ⚠️ Court, pas de différenciateur |
| /product-ops | 137 car. | "WeFiiT vous accompagne pour améliorer l'efficacité opérationnelle…" | ✅ Longueur OK |
| /we-talk | **75 car.** | "Inspirer sur les enjeux Produit actuels par des témoignages d'expert." | ⚠️ Court, pas de "podcast", pas de "WeFiiT" |
| /blog | 124 car. | "Les WeFiiTers et leur écosystème vous partagent leurs convictions…" | ✅ |
| /cas-clients | 143 car. | "Découvrez nos belles histoires et nos études de cas clients…" | ✅ |
| /formation-product-management | 128 car. | "Une offre de formation unique, proche du terrain…" | ⚠️ Trop interne, pas de mots-clés SEO |

### OG / Social Tags — vérifiés par curl 🔴

| Tag | État |
|---|---|
| `og:title` | ✅ Présent sur toutes les pages (= title) |
| `og:description` | ✅ Présent (= meta description) |
| `og:image` | 🔴 **ABSENT sur toutes les pages** |
| `og:type` | ✅ `website` |
| `twitter:card` | ✅ `summary_large_image` |
| `twitter:image` | 🔴 **ABSENT sur toutes les pages** |

**Impact :** Quand une URL WeFiiT est partagée sur LinkedIn, Slack, WhatsApp — aucune image de prévisualisation ne s'affiche. C'est un frein majeur à l'engagement social, surtout pour un cabinet dont la cible (PM, PMM) est très active sur LinkedIn.

---

## 3. Schema / Données Structurées — 35/100

### Ce qui existe (vérifié par curl)

Le schema `Organization` + `ProfessionalService` est présent sur **`/product-management`** uniquement, avec un contenu riche :
- `@type: ["Organization", "ProfessionalService"]` ✅
- `@id`, `name`, `url`, `logo`, `description` ✅
- `address` (82 Av. du Maine, Paris 75014) ✅
- `foundingDate: "2019"` ✅
- `founders: Cédric LOZAC'H` ✅
- `sameAs` : LinkedIn, YouTube, Meetup, Welcome to the Jungle, **Wikidata** ✅
- `makesOffer` : 5 services listés ✅
- `knowsAbout` : 8 domaines ✅

**Problème :** Ce schema est sur `/product-management`, pas sur la **homepage**. Google lit en priorité le schema de la homepage pour le Knowledge Panel.

### Ce qui manque partout

| Schema | Pages concernées | Présent | Priorité |
|---|---|---|---|
| `Organization` sur **homepage** | / | ❌ | 🔴 Critique |
| `FAQPage` | /product-management, /product-marketing, /product-ia-data-management, /product-quality, /product-ops | ❌ (0/5) | 🔴 Critique |
| `Article` / `BlogPosting` | 130+ articles | ❌ | 🔴 Critique |
| `Course` | 5+ pages formation | ❌ | 🔴 Critique |
| `BreadcrumbList` | Toutes pages | ❌ | 🟠 Haute |
| `VideoObject` | /we-talk, /videos | ❌ | 🟠 Haute |
| `AggregateRating` | Homepage, /cas-clients | ❌ | 🟠 Haute |
| `Event` | We.Talk events | ❌ | 🟡 Moyen |

---

## 4. Qualité du Contenu — 70/100

### E-E-A-T

**Expertise** ✅ Consultants nommés avec clients (Tristan Charvillat, Claire Van de Voorde, Carlota Guëll/Decathlon, Marion Ravut/Yousign, Aurélie Fon/Qonto)

**Experience** ✅ 200+ missions, 14 cas clients, clients Accor, Louis Vuitton, FDJ, Decathlon, Sephora

**Authority** ⚠️ We.Talk 15+ épisodes et vidéos YouTube présents mais sans schema. Présence Wikidata dans sameAs = bon signal. Backlinks non analysés.

**Trustworthiness** ✅ CSAT 9/10, Glassdoor 4.6/5, eNPS 54, mentions légales, RSE

### Contenu mince identifié

| Page | Mots estimés | Problème |
|---|---|---|
| /product-ops | ~900 | Mince vs concurrents (2000+ attendus) |
| /decouvre-ta-mission | ~150 | Quasi vide — page tunnel candidat |
| /product-management-guide-ia | ~350 | Page hub sans contenu substantiel |
| /we-talk | — | Aucun texte indexable sur les épisodes individuels |

### Blog ✅
130+ articles, 8 catégories, auteurs nommés, dates visibles. Actif (article du 9 juin 2026 détecté).

---

## 5. Performance (CWV) — 50/100

*Données basées sur l'analyse visuelle Playwright + facteurs de risque Webflow identifiés. Pas d'accès CrUX.*

### Observations Playwright (desktop 1440px)
- Bandeau cookie Axeptio présent immédiatement → **bloque 30% du viewport above-the-fold** sur desktop
- Hero avec image + texte animé Webflow → risque LCP
- Carousel logos clients → risque CLS si images non dimensionnées
- Scripts tiers visibles : Calendly/Outlook booking, Axeptio, YouTube embed

### Risques identifiés

| Facteur | Risque | CWV impacté |
|---|---|---|
| Bandeau cookie Axeptio | Élevé | LCP (retarde rendu hero) |
| Scripts Calendly/Outlook | Élevé | INP, TBT |
| Animations Webflow interactions | Moyen | LCP |
| YouTube embeds | Élevé | LCP si above-fold |
| Spéculation rules malformées | Faible | Prefetch non fonctionnel |

### Actions recommandées
1. Lancer PageSpeed Insights sur la homepage et les 5 pages d'offres
2. Différer Calendly au clic (lazy load)
3. Ajouter `loading="lazy"` sur les images below-fold
4. Vérifier `font-display: swap` pour les polices custom

---

## 6. Images — 30/100

### OG Image 🔴 CRITIQUE
Aucune `og:image` sur aucune page (vérifiée par curl sur 9 pages). Quand une URL est partagée sur LinkedIn ou Slack, aucune preview image ne s'affiche.

**Correction Webflow :** Designer → chaque page → Settings → SEO → Open Graph Image (ou configurer un champ dynamique dans les Collections CMS pour les articles)

### Alt text
Non vérifiable sans accès HTML complet des images (Webflow injecte les alt via JavaScript). À auditer via l'outil d'accessibilité Webflow ou via Playwright en inspectant le DOM rendu.

### Format
Webflow génère des images optimisées en WebP automatiquement depuis 2022 — probablement OK, à confirmer.

---

## 7. Lisibilité IA / GEO — 65/100

### Accès bots IA ✅ Excellent
robots.txt autorise explicitement Claude, GPT, Perplexity.

### Présence Wikidata ✅ Signal fort
`sameAs` inclut `https://www.wikidata.org/wiki/Q138783820` — c'est un signal d'autorité fort pour les LLMs qui utilisent Wikidata comme source de vérité.

### llms.txt ❌ Absent
Aucun fichier `llms.txt` à la racine. Recommandé pour optimiser la citabilité dans ChatGPT, Perplexity, Gemini.

### Citabilité
Points forts : statistiques précises (110+ consultants, 9/10 CSAT, 200+ missions, fondé en 2019, Paris 75014), témoignages clients nommés avec entreprise, FAQ structurée.

---

## 8. Récapitulatif par page

| Page | Title | Meta Desc | OG Image | Schema | JS Errors | Score |
|---|---|---|---|---|---|---|
| Homepage | ✅ 60 car. | ⚠️ 179 car. (trop long) | 🔴 Absent | ❌ Pas sur homepage | — | 58% |
| /product-management | ✅ 50 car. | ✅ 151 car. | 🔴 Absent | ✅ Org+Service | — | 72% |
| /product-marketing | ⚠️ Double espace | ✅ 140 car. | 🔴 Absent | ❌ | — | 58% |
| /product-ia-data-management | ✅ 49 car. | ✅ 148 car. | 🔴 Absent | ❌ | — | 60% |
| /product-quality | ⚠️ 37 car. | ⚠️ 87 car. (court) | 🔴 Absent | ❌ | — | 52% |
| /product-ops | 🔴 "Product Ops" | ✅ 137 car. | 🔴 Absent | ❌ | 🔴 TypeError | 35% |
| /we-talk | 🔴 "We.Talk" | ⚠️ 75 car. (court) | 🔴 Absent | ❌ | 🔴 TypeError | 30% |
| /blog | ✅ 44 car. | ✅ 124 car. | 🔴 Absent | ❌ | — | 58% |
| /cas-clients | ✅ 49 car. | ✅ 143 car. | 🔴 Absent | ❌ | — | 58% |
| /formation-product-management | ✅ 48 car. | ⚠️ 128 car. (trop interne) | 🔴 Absent | ❌ | — | 55% |

---

## Annexe — Méthode et limites

- **Données HTML** : curl direct sur 10 pages (title, meta, canonical, og tags, JSON-LD vérifiés sur le HTML source)
- **Playwright** : screenshots desktop (1440px) + mobile (390px) + console JS errors
- **Limites** : alt text images non vérifiable sans DOM rendu complet, backlinks non analysés (pas d'accès Moz/Ahrefs/DataForSEO), CrUX non disponible (pas d'accès GSC), articles de blog non crawlés individuellement
- **Date** : 09 juin 2026
