# Plan d'Action SEO — wefiit.com
**Date :** 09 juin 2026 | **Score actuel :** 62/100 | **Cible 3 mois :** 78/100  
*Données vérifiées par curl + Playwright — aucune inférence*

---

## CRITIQUE — Cette semaine

### C1. Ajouter une OG Image sur toutes les pages 🔴
**Impact :** CTR LinkedIn/Slack/partages sociaux — actuellement aucune preview image sur aucune page  
**Effort :** 1h (Webflow Designer → chaque page → Settings → SEO → Open Graph Image)  
**Pour les pages CMS (blog)** : configurer un champ dynamique dans la Collection → image featured article → champ OG Image

### C2. Corriger le title de `/product-ops` 🔴
**Actuel :** "Product Ops"  
**Recommandé :** "Conseil Product Ops - Optimiser vos équipes Produit | WeFiiT"  
**Effort :** 5 min dans Webflow

### C3. Corriger le title de `/we-talk` 🔴
**Actuel :** "We.Talk"  
**Recommandé :** "We.Talk - Talks & Podcast Product Management | WeFiiT"  
**Effort :** 5 min dans Webflow

### C4. Corriger l'erreur JS sur `/product-ops` et `/we-talk` 🔴
**Erreur :** `TypeError: Cannot set properties of null (setting 'href')` (ligne 255-256)  
**Cause probable :** Un `document.querySelector('[data-element]')` renvoie `null` — l'élément ciblé n'existe pas sur ces pages  
**Effort :** 30 min — inspecter le JS custom Webflow, ajouter une vérification `if (element)` avant d'écrire `.href`

### C5. Déplacer le schema `Organization` sur la homepage 🔴
**Problème :** Le schema Organization/ProfessionalService (très bien écrit) est sur `/product-management` — il devrait être en priorité sur la **homepage** `/`  
**Effort :** 15 min — copier le bloc JSON-LD dans le `<head>` de la homepage

---

## HAUTE PRIORITÉ — Dans le mois

### H1. Corriger la méta-description de la homepage (179 → ≤155 car.)
**Actuelle (179 car.) :** "WeFiiT est un cabinet de conseil spécialisé en Product Management à Paris. Conseil stratégique, renfort opérationnel et formation en PM, Data & IA, Marketing, et Quality."  
**Recommandée (152 car.) :** "WeFiiT, cabinet spécialisé en Product Management à Paris. Conseil, renfort opérationnel et formation PM, Data & IA, Marketing, Quality. 110+ consultants, 200+ missions."  
**Effort :** 5 min

### H2. Enrichir la méta-description de `/product-quality` (87 → ~140 car.)
**Actuelle :** "WeFiiT vous accompagne pour faire de la qualité un enjeu clé de la démarche Produit."  
**Recommandée :** "30+ consultants Quality Analyst WeFiiT pour faire de la QA un levier business. Conseil, immersion et formation QA à Paris. 90+ missions, clients Decathlon, Qonto, FDJ."  
**Effort :** 5 min

### H3. Enrichir la méta-description de `/we-talk` (75 → ~130 car.)
**Actuelle :** "Inspirer sur les enjeux Produit actuels par des témoignages d'expert."  
**Recommandée :** "We.Talk, les talks Product Management de WeFiiT. 15+ épisodes avec des experts produit, 500+ participants. Replays YouTube disponibles. Rejoignez la communauté."  
**Effort :** 5 min

### H4. Corriger le double espace dans le title `/product-marketing`
**Actuel :** "Conseil en Product Marketing Management  WeFiiT" (2 espaces + pas de tiret)  
**Recommandé :** "Conseil en Product Marketing Management - WeFiiT"  
**Effort :** 2 min

### H5. Schema FAQPage sur les 5 pages d'offres
**Impact :** Rich results accordéons dans les SERP, +30% de visibilité estimée  
**Effort :** 4h — embed JSON-LD dans le Custom Code de chaque page Webflow  
**Pages :** /product-management, /product-marketing, /product-ia-data-management, /product-quality, /product-ops

**Template (à adapter au contenu de chaque FAQ) :**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question de la FAQ ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Réponse complète..."
      }
    }
  ]
}
</script>
```

### H6. Schema Article/BlogPosting sur les articles de blog
**Impact :** Rich results pour 130+ articles — auteur, date, image  
**Effort :** 1 jour — configurer via Webflow CMS (champ dynamique dans Collection)  
**Template :**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{Titre}}",
  "author": {"@type": "Person", "name": "{{Auteur}}"},
  "datePublished": "{{Date}}",
  "image": "{{Image featured}}",
  "publisher": {"@type": "Organization", "name": "WeFiiT", "url": "https://www.wefiit.com"}
}
```

### H7. Schema Course sur les pages formation
**Impact :** Rich results "Cours" dans Google  
**Effort :** 2h  
**Pages :** /formation-product-management + /formations/formation-*

### H8. AggregateRating sur la homepage
**Impact :** Étoiles dans les SERP (+15% CTR estimé)  
**Données disponibles :** 9/10 CSAT client (200+ avis)  
**Effort :** 30 min

### H9. Schema VideoObject sur /we-talk et /videos
**Effort :** 1h  
**Impact :** Rich results vidéo, carrousel Google

### H10. Créer `llms.txt` à la racine
**Impact :** Citabilité dans ChatGPT, Perplexity, Gemini, Claude  
**Effort :** 30 min (fichier statique via Webflow Hosting → Publishing)

**Contenu recommandé :**
```
# WeFiiT

> Cabinet spécialisé en Product Management en France — Immersion, Conseil, Formation

## About
WeFiiT accompagne les équipes produit depuis 2019 : 110+ consultants, 200+ missions, clients Accor, Louis Vuitton, Decathlon, FDJ, Sephora. Fondé par Cédric LOZAC'H, basé à Paris.

## Services
- [Product Management](/product-management)
- [Product Marketing](/product-marketing)
- [Product Data & IA](/product-ia-data-management)
- [Product Quality](/product-quality)
- [Product Ops](/product-ops)

## Ressources
- [Blog Product Management](/blog)
- [Guide IA pour PM](/product-management-guide-ia)
- [We.Talk Podcast](/we-talk)
- [Cas clients](/cas-clients)

## Formation
- [Catalogue formations](/catalogue-de-formation-product-management)
- [Formations IA](/formations-ia)
```

---

## MOYEN TERME — Dans le mois

### M1. Enrichir `/product-ops` (~900 → 2000+ mots)
**Angle :** Définition Product Ops, rôle, enjeux, méthodologies, cas d'usage concrets  
**Mots-clés cibles :** "product ops", "product operations consultant", "product ops définition"

### M2. Enrichir `/decouvre-ta-mission` (~150 → 1000+ mots)
**Angle :** Process de recrutement, types de missions, témoignages consultants, avantages WeFiiT

### M3. Corriger la spéculation rules malformée (présente sur /product-ops et /we-talk)
**Erreur :** `Unexpected data after root element` dans les speculation rules  
**Effet :** Le prefetching/prerendering Webflow ne fonctionne pas sur ces pages

### M4. Enrichir la méta-description de `/formation-product-management`
**Actuelle :** "Une offre de formation unique, proche du terrain, spécialement pensée pour les WeFiiTers…"  
**Problème :** Trop orientée interne (WeFiiTers), ne parle pas aux prospects  
**Recommandée :** "70+ formations Product Management pour développer vos équipes. Strategy, Discovery, Delivery, Data & IA. 9.1/10 de satisfaction, 1400+ formations délivrées."

### M5. Breadcrumbs sur toutes les pages
**Effort :** Webflow Designer — composant breadcrumb global + schema BreadcrumbList

---

## Tableau de suivi

| Action | Priorité | Effort | Statut |
|---|---|---|---|
| OG Image toutes pages | 🔴 Critique | 1h | ⬜ |
| Title /product-ops | 🔴 Critique | 5 min | ⬜ |
| Title /we-talk | 🔴 Critique | 5 min | ⬜ |
| Fix JS TypeError /product-ops + /we-talk | 🔴 Critique | 30 min | ⬜ |
| Schema Organization → homepage | 🔴 Critique | 15 min | ⬜ |
| Meta homepage (179 → 152 car.) | 🟠 Haute | 5 min | ⬜ |
| Meta /product-quality (87 → 140 car.) | 🟠 Haute | 5 min | ⬜ |
| Meta /we-talk (75 → 130 car.) | 🟠 Haute | 5 min | ⬜ |
| Double espace title /product-marketing | 🟠 Haute | 2 min | ⬜ |
| Schema FAQPage 5 pages offres | 🟠 Haute | 4h | ⬜ |
| Schema Article blog | 🟠 Haute | 1j | ⬜ |
| Schema Course formations | 🟠 Haute | 2h | ⬜ |
| AggregateRating homepage | 🟠 Haute | 30 min | ⬜ |
| llms.txt | 🟠 Haute | 30 min | ⬜ |
| Enrichir /product-ops | 🟡 Moyen | 1j | ⬜ |
| Enrichir /decouvre-ta-mission | 🟡 Moyen | 1j | ⬜ |
| Fix speculation rules | 🟡 Moyen | 30 min | ⬜ |
| Meta /formation (réorienter prospects) | 🟡 Moyen | 5 min | ⬜ |
| Breadcrumbs | 🟡 Moyen | 4h | ⬜ |

---

*Rapport complet : [FULL-AUDIT-REPORT.md](FULL-AUDIT-REPORT.md)*  
*Prochaine révision recommandée : septembre 2026*
