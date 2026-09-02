---
name: audit-agent-template-home-sync
description: Comprehensive deep-dive schema and state synchronization auditor for HomeTemplate and HomeEditor.
---

# Agent 11: Home & Portfolio Template Sync Auditor (Deep-Dive Edition)

## 1. Objective & Scope
The primary mission of Agent 11 is to guarantee 100% data contract synchronization between the visual CMS admin editor (`HomeEditor.tsx`), the underlying database records (`SiteContent.findOne({ key: 'complete_data' })` and `Page.findOne({ slug: '/' })`), and the public frontend template (`HomeTemplate.tsx`). 

Agent 11 verifies that when an admin modifies, reorders, deletes, or adds content in any homepage section within the CMS dashboard, the exact schema fields, types, and fallback mechanisms are preserved and accurately rendered on the public website without hydration errors, runtime exceptions, or missing visual elements.

---

## 2. Comprehensive Section Schema Contracts

### 2.1. Hero Section (`data.hero`)
- **Admin Editor State Path:** `data.hero`
- **Frontend Component:** `src/components/Hero.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*: Small pill tag above the main headline (e.g., `"Top Rated Web Design & SEO"`). Fallback: `"Award-Winning Digital Agency"`.
  - `title` *(string)*: Primary `<h1>` header text.
  - `highlightText` *(string)*: Gradient or highlighted phrase within or adjacent to the title.
  - `subtitle` *(string)*: Explanatory paragraph below the headline.
  - `cta1Text` *(string)* & `cta1Link` *(string)*: Primary action button text and destination URL.
  - `cta2Text` *(string)* & `cta2Link` *(string)*: Secondary action button text and destination URL.
  - `ratingText` *(string)* & `ratingCount` *(string | number)*: Social proof rating display.
  - `backgroundImage` *(string)*: Hero backdrop image URL.
  - `stats` *(Array<{ value: string; label: string; suffix?: string }>)*: Numeric counter items displayed at the bottom of the hero banner.

### 2.2. Trusted Brands / Client Trust Marquee (`data.trustedBrands` / `data.clientTrust`)
- **Admin Editor State Path:** `data.trustedBrands` or `data.clientTrust`
- **Frontend Component:** `src/components/sections/TrustedBrandsSection.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*: Section badge label.
  - `title` *(string)*: Section headline.
  - `description` *(string)*: Subtitle context.
  - `logos` *(Array<{ name: string; image: string; url?: string }>)*: Carousel brand logos list. Must verify image URL validity.

### 2.3. About Owner / Founder Section (`data.aboutOwner`)
- **Admin Editor State Path:** `data.aboutOwner`
- **Frontend Component:** `src/components/AboutOwner.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*: Tagline badge.
  - `title` *(string)*: Section header.
  - `ownerName` *(string)* & `ownerRole` *(string)*: Founder credentials.
  - `bio` *(string | RichText)*: Founder biography paragraphs.
  - `quote` *(string)*: Highlighted personal quote.
  - `achievements` *(Array<{ number: string; label: string; icon?: string }>)*: Key career milestones.
  - `ownerImage` *(string)*: Headshot image URL.
  - `signatureImage` *(string)*: Stylized signature asset URL.

### 2.4. Services Showcase Section (`data.services`)
- **Admin Editor State Path:** `data.services`
- **Frontend Component:** `src/components/Services.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*: Pill label.
  - `title` *(string)*: Section heading.
  - `description` *(string)*: Lead paragraph.
  - `services` *(Array<{ id: string; title: string; shortDesc: string; icon: string; link: string; features: string[]; isPopular?: boolean }>)*: Array of service offering cards.

### 2.5. Featured Comparison / Pros & Cons Table (`data.featuredComparison`)
- **Admin Editor State Path:** `data.featuredComparison`
- **Frontend Component:** `src/components/FeaturedComparison.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*: Comparison badge.
  - `title` *(string)*: Comparison headline.
  - `subtitle` *(string)*: Overview text.
  - `ourCompany` *(string)* & `competitors` *(string)*: Column header titles.
  - `features` *(Array<{ name: string; us: boolean | string; them: boolean | string; description?: string }>)*: Comparison rows.

### 2.6. How We Work / Process Timeline (`data.howWeWork`)
- **Admin Editor State Path:** `data.howWeWork`
- **Frontend Component:** `src/components/HowWeWork.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*: Process badge.
  - `title` *(string)*: Process heading.
  - `description` *(string)*: Process intro.
  - `steps` *(Array<{ stepNumber: number | string; title: string; description: string; icon?: string; deliverables?: string[] }>)*: Ordered workflow steps.

### 2.7. Domain Expertise & Industries (`data.industries` / `data.domainExpertise`)
- **Admin Editor State Path:** `data.industries` or `data.domainExpertise`
- **Frontend Component:** `src/components/IndustriesSection.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*: Section badge.
  - `title` *(string)*: Section title.
  - `description` *(string)*: Subtitle.
  - `industriesList` *(Array<{ name: string; slug: string; icon: string; description: string; highlights: string[] }>)*: Grid cards.

### 2.8. Portfolio & Case Studies (`data.portfolio`)
- **Admin Editor State Path:** `data.portfolio`
- **Frontend Component:** `src/components/Portfolio.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*: Portfolio badge.
  - `title` *(string)*: Portfolio heading.
  - `description` *(string)*: Sub-description.
  - `categories` *(string[])*: Category filter tabs.
  - `projects` *(Array<{ id: string; title: string; category: string; image: string; client?: string; results?: string; link?: string }>)*: Project showcase cards.

### 2.9. Testimonials & Client Reviews (`data.testimonials`)
- **Admin Editor State Path:** `data.testimonials`
- **Frontend Component:** `src/components/Testimonials.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*: Testimonials badge.
  - `title` *(string)*: Testimonials headline.
  - `subtitle` *(string)*: Section context.
  - `reviews` *(Array<{ id: string; name: string; role: string; company?: string; avatar?: string; rating: number; text: string; verified?: boolean }>)*.

### 2.10. Geographic Service Area Coverage (`data.serviceArea`)
- **Admin Editor State Path:** `data.serviceArea`
- **Frontend Component:** `src/components/ServiceArea.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*: Location badge.
  - `title` *(string)*: Heading text.
  - `description` *(string)*: Coverage notes.
  - `cities` *(Array<{ name: string; slug?: string; state: string; isPrimary?: boolean }>)*: Geographic tags.

### 2.11. Inline FAQs & FAQ Schema Markup (`data.faqs`)
- **Admin Editor State Path:** `data.faqs`, `data.faqBadge`, `data.faqTitle`, `data.faqDescription`, `data.faqSchemaMarkup`
- **Frontend Component:** `src/components/PageInlineFaqs.tsx`
- **Field-by-Field Contract:**
  - `faqs` *(Array<{ question: string; answer: string }>)*: Accordion Q&A list.
  - `faqSchemaMarkup` *(string)*: Raw JSON-LD Schema string or generated markup.

---

## 3. Step-by-Step Audit Execution Protocol

### Step 1: State Extraction & Key Mapping Check
1. Read `src/components/admin/editors/HomeEditor.tsx`. Extract all `data.hero.*`, `data.services.*`, `data.portfolio.*`, `data.testimonials.*` setter bindings.
2. Read `src/components/templates/HomeTemplate.tsx` and all child components (`Hero.tsx`, `AboutOwner.tsx`, `Portfolio.tsx`, etc.).
3. Verify that every prop passed from `pageData.content` or `useContent()` matches the exact variable name in the editor state.

### Step 2: Fallback & Undefined Value Resilience
1. Test scenario where `pageData.content` is completely empty `{}`.
2. Verify that child components use default parameter values or optional chaining (`?.`) so the page renders without crashing `TypeError: Cannot read properties of undefined`.
3. Check that array `.map()` iterations are protected with `(items || []).map(...)`.

### Step 3: Real-Time Mutation & Persistence Verification
1. Verify that saving in `HomeEditor.tsx` dispatches `PATCH /api/admin/pages/[id]`.
2. Verify that `PATCH /api/admin/pages/[id]` synchronizes homepage updates into `SiteContent` (`key: 'complete_data'`) and triggers `revalidatePath('/')`.
3. Confirm that public visitors requesting `/` immediately receive the updated data.
