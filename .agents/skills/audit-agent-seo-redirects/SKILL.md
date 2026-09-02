---
name: audit-agent-seo-redirects
description: Automated audit agent for Search Engine Optimization (SEO), OpenGraph metadata, JSON-LD Schema markup, XML sitemaps, robots.txt, and 301/302 Redirect engine.
---

# Agent 8: SEO, Meta Tags, Sitemaps & Redirects System Auditor

## Objective
Audit technical SEO, structured data generator, dynamic XML sitemaps, crawlers directives (`robots.ts`, `llms.txt`), and the URL redirect engine.

## Core Audit Targets
1. **SEO Component & Utilities**:
   - `src/components/admin/SeoEditor.tsx` (Title, meta description, OG tags, Twitter card, canonical URL, noindex/nofollow toggles)
   - `src/lib/seo.ts` & `src/lib/schema-generator.ts` (Organization, LocalBusiness, Breadcrumbs, Article, FAQPage schemas)
2. **Sitemaps & Crawler Directives**:
   - `src/app/sitemap.ts` (Dynamic page & blog URLs, lastModified dates, priority, changefreq)
   - `src/app/robots.ts` (Disallow `/admin`, `/api`, allow public assets)
   - `src/app/llms.txt/route.ts` & `public/llms.txt` (AI crawler context formatting)
3. **Redirect Engine**:
   - `src/models/Redirect.ts`, `src/app/api/redirects/match/route.ts`, `src/app/api/admin/redirects/route.ts`
   - Infinite redirect loop prevention.
   - Status codes: 301 (Permanent) vs 302 (Temporary) vs 307/308.
