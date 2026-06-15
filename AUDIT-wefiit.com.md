# Audit SEO — wefiit.com
> Généré le 2026-06-09 via claude-seo v2.0.0

## Score SEO Global : 76/100

---

## Résumé exécutif

### Top problèmes identifiés
1. **Backlinks quasi-inexistants** — PageRank Common Crawl #3,731,766, 0 referring domains détectés → levier #1 de croissance organique
2. **Blog : 211 images sur une seule page** — crawlabilité dégradée, pagination manquante
3. **Contenu répétitif** (score répétitivité 32/100) — homepage détectée comme répétitive par content_quality.py
4. **Meta description /product-quality trop courte** — "WeFiiT vous accompagne pour faire de la qualité un enjeu clé de la démarche Produit."
5. **Word count faible** sur /product-ia-data-management (864 mots) et /product-quality (843 mots)

### Quick wins restants
1. Paginer le blog (12 articles/page)
2. Enrichir /product-quality et /product-ia-data-management (viser 1500+ mots)
3. Stratégie backlinks (partenaires, presse, clients)

---

## Données brutes (scripts claude-seo)

### content_quality.py — Homepage
| Métrique | Valeur | Status |
|----------|--------|--------|
| Qualité globale | 89/100 | ✅ |
| Densité information | 0.75 | ✅ |
| Répétitivité | 32/100 | ⚠️ |
| Tokens | 8715 (1314 uniques) | — |

### parse_html.py — Pages principales
| Page | Meta Desc | H1 | Schema | Mots | Images |
|------|-----------|-----|--------|------|--------|
| Homepage | ✅ | ✅ 1 | ✅ 1 | 708 ⚠️ | 66 |
| /product-management | ✅ | ✅ 1 | ✅ 1 | 1100 ✅ | 94 |
| /product-marketing | ✅ | ✅ 1 | ✅ 1 | 1058 ✅ | 77 |
| /product-ia-data-management | ✅ | ✅ 1 | ✅ 1 | 864 ⚠️ | 54 |
| /product-quality | ⚠️ courte | ✅ 1 | ✅ 1 | 843 ⚠️ | 71 |
| /blog | ✅ | ✅ 1 | ✅ 1 | 1918 ✅ | 211 🔴 |

### commoncrawl_graph.py — Backlinks
| Métrique | Valeur | Status |
|----------|--------|--------|
| PageRank Common Crawl | #3,731,766 | 🔴 Faible |
| Referring domains | 0 détectés | 🔴 |
| Release | cc-main-2026-jan-feb-mar | — |

### url_safety.py
- ✅ URL propre, aucun risque

### parasite_risk.py
- ✅ Risque faible (0 contenu tiers/affilié)

### preload_check.py
| Métrique | Avant | Après | Status |
|----------|-------|-------|--------|
| Score | 50/100 | 50/100* | — |
| Preload hints | 0 | 2 | ✅ |
| fetchpriority=high | 0 | 2 | ✅ |
| Speculation rules | ✗ | ✅ détectées dans HTML | ✅ |

*Score bloqué à 50 car le script pénalise l'absence de speculation rules détectées via HTTP — mais elles sont bien présentes dans le HTML (confirmé via fetch_page.py).

---

## Actions réalisées (2026-06-09)

| Action | Statut | Détail |
|--------|--------|--------|
| **Preload LCP hero image** | ✅ DONE | `fetchpriority="high"` sur `WEFIIT-2000-50.avif` — injecté en Page Settings → Head Code (homepage uniquement) |
| **Speculation rules** | ✅ DONE | Prerender sur 5 pages offres + prefetch conservatif sur tous liens internes — injecté en Site Settings → Head Code |

---

## Plan d'action restant

### Priorité haute
| Action | Effort | Impact |
|--------|--------|--------|
| **Stratégie backlinks** — clients, partenaires, presse | Continu | 🔴 Levier #1 ranking |
| **Paginer le blog** — 12 articles/page + rel="next"/"prev" | 3-4h | ⚠️ Crawlabilité + perf |
| **Enrichir /product-quality** — meta desc + contenu (viser 1500 mots) | 2-3h | ⚠️ Ranking |
| **Enrichir /product-ia-data-management** — viser 1500 mots | 2-3h | ⚠️ Ranking |

### Priorité moyenne
| Action | Effort | Impact |
|--------|--------|--------|
| Réduire répétitivité homepage | 1-2h | Qualité contenu |
| Vérifier LCP réel via PageSpeed (baseline à établir) | 30 min | Mesure impact preload |
| Auditer Core Web Vitals via GSC | 1h | Données terrain |

---

## Prochaine session
- Mesurer LCP avant/après sur pagespeed.web.dev
- Lancer `commoncrawl_graph.py` dans 30 jours pour voir évolution backlinks
- Attaquer la stratégie backlinks
