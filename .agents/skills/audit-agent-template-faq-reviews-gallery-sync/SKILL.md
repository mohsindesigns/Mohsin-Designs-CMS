---
name: audit-agent-template-faq-reviews-gallery-sync
description: Comprehensive deep-dive schema and state synchronization auditor for FAQTemplate, ReviewsTemplate, GalleryTemplate, TeamTemplate, and BlogTemplate.
---

# Agent 18: Social Proof, Media Gallery & Knowledge Hub Template Sync Auditor (Deep-Dive Edition)

## 1. Objective & Scope
The primary mission of Agent 18 is to perform an exhaustive synchronization and schema verification audit across the CMS knowledge base and social proof modules: `FAQTemplate.tsx`, `ReviewsTemplate.tsx`, `GalleryTemplate.tsx`, `TeamTemplate.tsx`, `BlogTemplate.tsx`, and their respective visual admin editors (`FAQEditor.tsx`, `ReviewsEditor.tsx`, `GalleryEditor.tsx`, `TeamEditor.tsx`, `BlogEditor.tsx`).

Agent 18 guarantees that categorized Q&A items, verified customer reviews, high-resolution before/after media galleries, staff credentials, and blog taxonomy collections preserve full schema integrity, search filtering, and JSON-LD structured data markups across all viewports.

---

## 2. Comprehensive FAQ Hub Schema Contract (`FAQTemplate.tsx`)

### 2.1. FAQ Hero & Search Configuration
- **Admin Editor State Path:** `data.hero` or top-level `data`
- **Frontend Target:** `src/components/templates/FAQTemplate.tsx` (Hero & Search Bar)
- **Field-by-Field Contract:**
  - `badge` *(string)*: Tag (e.g., `"Help Center & Knowledge Base"`).
  - `title` *(string)*: Primary headline (e.g., `"Frequently Asked Questions"`).
  - `subtitle` *(string)*: Search prompt and guidance paragraph.
  - `searchPlaceholder` *(string)*: Input field placeholder text.
  - `categories` *(Array<string>)*: Category tabs (General, Pricing, Delivery, Tech Support, Warranties).
  - `items` *(Array<{ id: string; category: string; question: string; answer: string | RichText; isPopular?: boolean }>)*: Accordion items.
  - `faqSchemaMarkup` *(string)*: JSON-LD structured data for Google Rich Results.

---

## 3. Comprehensive Customer Reviews & Social Proof Schema Contract (`ReviewsTemplate.tsx`)

### 3.1. Reviews Hero & Aggregate Rating Metrics
- **Admin Editor State Path:** `data.hero`, `data.aggregateRating`
- **Frontend Target:** `src/components/templates/ReviewsTemplate.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*, `title` *(string)*, `subtitle` *(string)*.
  - `averageRating` *(number)*: Numerical average (e.g., `4.9`).
  - `totalReviewsCount` *(number | string)*: Total review volume (e.g., `"500+"`).
  - `breakdown` *( { 5: number; 4: number; 3: number; 2: number; 1: number } )*: Star rating distribution bars.
  - `reviews` *(Array<{ id: string; author: string; role?: string; company?: string; location?: string; avatar?: string; rating: number; reviewTitle?: string; reviewText: string; date: string; verified: boolean; platform?: 'Google' | 'Clutch' | 'Trustpilot' | 'Direct'; projectType?: string }>)*.

---

## 4. Comprehensive Media & Project Gallery Schema Contract (`GalleryTemplate.tsx`)

### 4.1. Visual Showcase & Before/After Comparisons
- **Admin Editor State Path:** `data.hero`, `data.gallery`
- **Frontend Target:** `src/components/templates/GalleryTemplate.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*, `title` *(string)*, `subtitle` *(string)*.
  - `categories` *(Array<string>)*: Filter tabs (Commercial, Residential, Web Design, Branding).
  - `items` *(Array<{ id: string; title: string; category: string; beforeImage?: string; afterImage: string; description?: string; location?: string; year?: string; tags?: string[] }>)*: Gallery cards with modal lightbox support.

---

## 5. Comprehensive Team & Roster Schema Contract (`TeamTemplate.tsx`)

### 5.1. Staff Directory & Core Competencies
- **Admin Editor State Path:** `data.hero`, `data.team`
- **Frontend Target:** `src/components/templates/TeamTemplate.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*, `title` *(string)*, `subtitle` *(string)*.
  - `departments` *(Array<string>)*: Department filter tabs.
  - `members` *(Array<{ id: string; name: string; role: string; department: string; bio: string; image: string; email?: string; phone?: string; socialLinks?: { linkedin?: string; twitter?: string; github?: string } }>)*: Staff cards.

---

## 6. Comprehensive Blog Archive Schema Contract (`BlogTemplate.tsx`)

### 6.1. Publication Feed & Featured Articles
- **Admin Editor State Path:** `data.hero`, `data.featuredPost`
- **Frontend Target:** `src/components/templates/BlogTemplate.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*, `title` *(string)*, `subtitle` *(string)*.
  - `featuredPostId` *(string)*: ID of featured spotlight article.
  - `selectedCategories` *(Array<string>)*: Displayed category filters.
  - `postsPerPage` *(number)*: Pagination limit per page.

---

## 7. Step-by-Step Audit Execution Protocol

### Step 1: Editor State Extraction & Array Mutations
1. Inspect `FAQEditor.tsx`, `ReviewsEditor.tsx`, `GalleryEditor.tsx`, `TeamEditor.tsx`, `BlogEditor.tsx`.
2. Verify all modal dialogs and form handlers for item addition and item deletion.
3. Confirm that before/after image selectors in `GalleryEditor.tsx` store clean URLs.

### Step 2: Search Filtering & Real-Time Client-Side Querying
1. Verify that `FAQTemplate.tsx` live search filters `items` by both `question` and `answer` without lag.
2. Verify that `ReviewsTemplate.tsx` allows filtering by rating stars (e.g., 5-star only) and platforms (Google, Clutch).

### Step 3: JSON-LD Schema & Rich Results Validation
1. Verify that `FAQTemplate.tsx` and `ReviewsTemplate.tsx` generate valid JSON-LD schemas (`FAQPage` and `AggregateRating`) using `src/lib/schema-generator.ts`.
2. Confirm schema tags are injected into `<script type="application/ld+json">` without unescaped quotes breaking the parser.
