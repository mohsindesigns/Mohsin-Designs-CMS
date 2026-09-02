---
name: audit-agent-template-industry-sync
description: Comprehensive deep-dive schema and state synchronization auditor for IndustryTemplate and IndustryEditor.
---

# Agent 14: Industry & Vertical Solutions Template Sync Auditor (Deep-Dive Edition)

## 1. Objective & Scope
The primary mission of Agent 14 is to audit the vertical-specific solution engine across `IndustryEditor.tsx` (Admin CMS) and `IndustryTemplate.tsx` (Public Frontend).

Agent 14 verifies that industry-tailored pain points, custom engineering solutions, real-world case studies with quantifiable ROI, technical compliance specifications, and vertical-focused FAQs correctly save into the page content payload and render dynamically on the public pages with proper SEO metadata and interactive elements.

---

## 2. Comprehensive Industry Template Schema Contract

### 2.1. Vertical Hero Banner
- **Admin Editor State Path:** `data.hero`
- **Frontend Target:** `src/components/templates/IndustryTemplate.tsx` (Hero Header)
- **Field-by-Field Contract:**
  - `badge` *(string)*: Industry category tag (e.g., `"Healthcare & Life Sciences"`).
  - `title` *(string)*: High-impact vertical headline (e.g., `"HIPAA-Compliant Web Solutions & Patient Portals"`).
  - `highlightText` *(string)*: Emphasized phrase.
  - `subtitle` *(string)*: Detailed paragraph discussing industry trends, challenges, and our tailored approach.
  - `backgroundImage` *(string)*: Full-width industry hero image URL.
  - `cta1Text` *(string)* & `cta1Link` *(string)*: Primary consultation CTA button.
  - `cta2Text` *(string)* & `cta2Link` *(string)*: Secondary portfolio/case study CTA button.
  - `statBadges` *(Array<{ number: string; label: string }>)*: Quantitative trust badges.

### 2.2. Sector Challenges & Critical Pain Points
- **Admin Editor State Path:** `data.challenges` / `data.painPoints`
- **Frontend Target:** Industry Challenges Section
- **Field-by-Field Contract:**
  - `badge` *(string)*: Section badge (e.g., `"Industry Bottlenecks"`).
  - `title` *(string)*: Section header (e.g., `"Key Obstacles Modern Organizations Face"`).
  - `subtitle` *(string)*: Intro describing regulatory, security, or performance hurdles.
  - `items` *(Array<{ id: string; title: string; description: string; impact: string; icon?: string }>)*: List of industry-specific friction points.

### 2.3. Tailored Architectural Solutions
- **Admin Editor State Path:** `data.solutions` / `data.verticalSolutions`
- **Frontend Target:** Solutions Grid / Feature Highlights
- **Field-by-Field Contract:**
  - `badge` *(string)*: Solutions badge.
  - `title` *(string)*: Solutions headline.
  - `subtitle` *(string)*: High-level solution overview.
  - `items` *(Array<{ id: string; title: string; description: string; features: string[]; image?: string; icon: string; link?: string }>)*: Tailored technical and architectural solution cards.

### 2.4. Real-World Case Studies & Quantifiable ROI
- **Admin Editor State Path:** `data.caseStudies` / `data.results`
- **Frontend Target:** Case Study Showcase Module
- **Field-by-Field Contract:**
  - `badge` *(string)*: Proof badge.
  - `title` *(string)*: Case studies title (e.g., `"Proven Outcomes in the Field"`).
  - `subtitle` *(string)*: Context notes.
  - `studies` *(Array<{ client: string; industry: string; challenge: string; solution: string; metrics: Array<{ value: string; label: string }>; testimonialQuote?: string; testimonialAuthor?: string; image?: string }>)*: In-depth vertical project case studies.

### 2.5. Industry Standards, Compliance & Certifications
- **Admin Editor State Path:** `data.specifications` / `data.compliance`
- **Frontend Target:** Compliance & Standards Data Sheet
- **Field-by-Field Contract:**
  - `title` *(string)*: Section heading (e.g., `"Security, Privacy & Regulatory Compliance"`).
  - `subtitle` *(string)*: Regulatory framework description (ISO, SOC 2, HIPAA, GDPR).
  - `specs` *(Array<{ standard: string; description: string; status: string; badge?: string }>)*: Compliance grid.

### 2.6. Industry-Specific FAQs & FAQ Schema
- **Admin Editor State Path:** `data.faqs`, `data.faqSchemaMarkup`
- **Frontend Target:** `src/components/PageInlineFaqs.tsx`
- **Field-by-Field Contract:**
  - `faqs` *(Array<{ question: string; answer: string }>)*: Q&A array.
  - `faqSchemaMarkup` *(string)*: JSON-LD FAQ schema.

---

## 3. Step-by-Step Audit Execution Protocol

### Step 1: Editor State Extraction & Array Mutations
1. Read `src/components/admin/editors/IndustryEditor.tsx`.
2. Verify all array handlers: `addChallenge`, `removeChallenge`, `addSolution`, `removeSolution`, `addCaseStudy`, `removeCaseStudy`, `addSpec`, `removeSpec`.
3. Confirm that nested metric arrays within case studies (`study.metrics`) preserve immutability and do not lose state upon page save.

### Step 2: Template Mapping & Slug Resolving
1. Inspect `src/components/templates/TemplateRegistry.tsx`.
2. Confirm `'industry'` and `'industries'` map to `IndustryTemplate`.
3. Verify that dynamic routes (`src/app/[...slug]/page.tsx`) correctly load industry pages under `/industries/*` or custom vertical slugs.

### Step 3: Frontend Null-Safety & Fallback Rendering
1. Verify that `IndustryTemplate.tsx` gracefully renders when optional fields like `caseStudies` or `challenges` are omitted.
2. Confirm that all metric items display with proper typography and formatting even if string numbers contain symbols like `+`, `%`, or `$`.
