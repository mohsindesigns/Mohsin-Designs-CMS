---
name: audit-agent-template-services-sync
description: Comprehensive deep-dive schema and state synchronization auditor for ServiceDetailTemplate, ServicesTemplate, ServiceDetailEditor, and ServicesEditor.
---

# Agent 12: Services & Service Detail Template Sync Auditor (Deep-Dive Edition)

## 1. Objective & Scope
The primary mission of Agent 12 is to ensure flawless two-way data contract alignment between the multi-tier Service CMS editors (`ServicesEditor.tsx`, `ServiceDetailEditor.tsx`) and the corresponding public service landing templates (`ServicesTemplate.tsx`, `ServiceDetailTemplate.tsx`).

Agent 12 validates that when an admin modifies service overviews, process workflows, deliverables, technical specifications, interactive pricing tiers, or service-specific FAQs, every single field key, type, array structure, and image reference is correctly saved in MongoDB (`Page.content`) and seamlessly consumed by the frontend templates without layout breaks or missing UI modules.

---

## 2. Comprehensive Service Detail Schema Contract (`ServiceDetailTemplate.tsx`)

### 2.1. Hero & Value Proposition Banner
- **Admin Editor State Path:** `data.hero` or top-level `data`
- **Frontend Target:** `src/components/templates/ServiceDetailTemplate.tsx` (Hero block)
- **Field-by-Field Contract:**
  - `title` *(string)*: Main service title (e.g., `"Commercial Roof Installation & Restoration"`).
  - `badge` *(string)*: Category pill (e.g., `"Enterprise Solutions"`).
  - `subtitle` *(string)*: Detailed service value proposition paragraph.
  - `ratingText` *(string)*: Trust indicator (e.g., `"Rated 4.9/5 by 350+ clients"`).
  - `ratingCount` *(number | string)*: Numeric star count (e.g., `5`).
  - `backgroundImage` *(string)*: Full-width hero background banner image.
  - `cta1Text` *(string)* & `cta1Link` *(string)*: Primary quote request button.
  - `cta2Text` *(string)* & `cta2Link` *(string)*: Secondary consultation button.

### 2.2. Service Overview & Key Capabilities
- **Admin Editor State Path:** `data.overview` / `data.serviceOverview`
- **Frontend Target:** Service Overview Component
- **Field-by-Field Contract:**
  - `title` *(string)*: Section headline (e.g., `"Comprehensive Engineering & Design Capabilities"`).
  - `subtitle` *(string)*: Secondary overview note.
  - `badge` *(string)*: Overview pill tag.
  - `content` *(string | RichText)*: In-depth paragraph detailing methodology and tools.
  - `bulletPoints` *(Array<string> | Array<{ text: string; icon?: string }>)*: Bullet list of specific capabilities.
  - `features` *(Array<{ title: string; description: string; icon?: string }>)*: Highlights grid.
  - `image` *(string)*: Supporting illustration or photographic asset.

### 2.3. Step-by-Step Execution Process
- **Admin Editor State Path:** `data.process` / `data.howItWorks`
- **Frontend Target:** Process Timeline Module
- **Field-by-Field Contract:**
  - `title` *(string)*: Section header (e.g., `"Our 4-Phase Delivery Process"`).
  - `subtitle` *(string)*: Intro describing timeline and milestones.
  - `badge` *(string)*: Timeline badge.
  - `steps` *(Array<{ stepNumber: string | number; title: string; description: string; icon?: string; deliverables?: string[]; duration?: string }>)*: Array of sequential work phases.

### 2.4. Tangible Client Benefits & ROI Metrics
- **Admin Editor State Path:** `data.benefits` / `data.whyChooseThisService`
- **Frontend Target:** Benefits Cards Grid
- **Field-by-Field Contract:**
  - `title` *(string)*: Headline (e.g., `"Why Industry Leaders Choose Our Service"`).
  - `subtitle` *(string)*: Explanatory subtitle.
  - `items` *(Array<{ title: string; description: string; icon?: string; metric?: string; metricLabel?: string }>)*: Benefit items with optional quantitative metrics.

### 2.5. Transparent Pricing & Package Tiers
- **Admin Editor State Path:** `data.pricing` / `data.pricingTiers`
- **Frontend Target:** Pricing Comparison Table
- **Field-by-Field Contract:**
  - `title` *(string)*: Section heading (e.g., `"Flexible Engagement Models"`).
  - `subtitle` *(string)*: Package notes and custom enterprise options.
  - `tiers` *(Array<{ name: string; price: string; period?: string; description: string; features: string[]; notIncluded?: string[]; isPopular?: boolean; ctaText: string; ctaLink: string }>)*: Pricing tiers array.

### 2.6. Technical Specifications & Deliverables Table
- **Admin Editor State Path:** `data.specifications` / `data.deliverables`
- **Frontend Target:** Technical Data Sheet Module
- **Field-by-Field Contract:**
  - `title` *(string)*: Technical specifications title.
  - `subtitle` *(string)*: Standard compliances.
  - `specs` *(Array<{ label: string; value: string; notes?: string }>)*: Key-value data matrix.

### 2.7. Service-Specific FAQs & Schema
- **Admin Editor State Path:** `data.faqs`, `data.faqSchemaMarkup`
- **Frontend Target:** `src/components/PageInlineFaqs.tsx`
- **Field-by-Field Contract:**
  - `faqs` *(Array<{ question: string; answer: string }>)*: Service specific FAQ questions.
  - `faqSchemaMarkup` *(string)*: JSON-LD FAQ schema.

---

## 3. Comprehensive Services Directory Schema Contract (`ServicesTemplate.tsx`)

### 3.1. Directory Hero & Category Filters
- **Admin Editor State Path:** `data.hero`, `data.categories`
- **Frontend Target:** `src/components/templates/ServicesTemplate.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*, `title` *(string)*, `subtitle` *(string)*.
  - `categories` *(Array<string>)*: Dynamic filtering tabs across all service lines.
  - `servicesList` *(Array<{ id: string; slug: string; title: string; shortDescription: string; icon: string; image?: string; features: string[]; isFeatured?: boolean }>)*: Catalog of offerings.

---

## 4. Step-by-Step Audit Execution Protocol

### Step 1: Editor State Extraction & Array Mutations
1. Inspect `src/components/admin/editors/ServiceDetailEditor.tsx`.
2. Verify all array handlers: `addStep`, `removeStep`, `addBenefit`, `removeBenefit`, `addTier`, `removeTier`, `addSpec`, `removeSpec`.
3. Confirm that array items maintain immutable state updating patterns `[...prev, newItem]` and do not cause state slicing bugs.

### Step 2: Slug Generation & Page Resolution Validation
1. Verify that when a service detail page is created or edited, its `slug` is properly prefixed or formatted (e.g., `services/commercial-roofing` or `commercial-roofing`).
2. Verify that dynamic routing in `src/app/[...slug]/page.tsx` properly matches nested service paths.

### Step 3: Hydration & SSR Safety Checks
1. Validate that empty nested arrays (`steps = []`, `tiers = []`, `specs = []`) do not throw `map of undefined` errors in `ServiceDetailTemplate.tsx`.
2. Verify that Lucide icon names passed in `step.icon` or `benefit.icon` resolve gracefully through `IconSelector` or display default fallbacks when invalid icon strings are provided.
