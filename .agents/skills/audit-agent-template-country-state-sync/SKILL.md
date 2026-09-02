---
name: audit-agent-template-country-state-sync
description: Comprehensive deep-dive schema and state synchronization auditor for CountryTemplate, StateTemplate, CountryEditor, and StateEditor.
---

# Agent 16: Regional Country & State Multi-Tenant Template Sync Auditor (Deep-Dive Edition)

## 1. Objective & Scope
The primary mission of Agent 16 is to audit regional hierarchy, multi-tenant state isolation, and data contract adherence for national and regional landing pages: `CountryTemplate.tsx`, `StateTemplate.tsx`, `CountryEditor.tsx`, and `StateEditor.tsx`.

Agent 16 ensures that regional pages maintain strict data isolation, avoiding unintentional global homepage data bleeding, and guarantees that regional services, licensing bodies, regulatory disclosures, state contractor networks, and localized emergency hotlines are synchronized flawlessly between the CMS dashboard and public frontend pages.

---

## 2. Comprehensive Country Template Schema Contract (`CountryTemplate.tsx`)

### 2.1. National Hero & Overview
- **Admin Editor State Path:** `data.hero` or top-level `data`
- **Frontend Target:** `src/components/templates/CountryTemplate.tsx` (Hero block)
- **Field-by-Field Contract:**
  - `countryName` *(string)*: Country name (e.g., `"United States"`, `"United Kingdom"`, `"Canada"`).
  - `countryCode` *(string)*: ISO 2-letter code (e.g., `"US"`, `"GB"`, `"CA"`).
  - `badge` *(string)*: National badge (e.g., `"Nationwide Commercial & Residential Services"`).
  - `title` *(string)*: Country headline.
  - `subtitle` *(string)*: National scope summary.
  - `emergencyHotline` *(string)*: Country-wide toll-free telephone number.
  - `backgroundImage` *(string)*: National hero banner image URL.

### 2.2. State & Regional Subdivision Catalog
- **Admin Editor State Path:** `data.states` / `data.provinces` / `data.regions`
- **Frontend Target:** States Directory Grid
- **Field-by-Field Contract:**
  - `title` *(string)*: Section header (e.g., `"Explore Services by State / Province"`).
  - `subtitle` *(string)*: Overview of territorial coverage.
  - `statesList` *(Array<{ name: string; code: string; slug: string; cityCount?: number; active?: boolean }>)*: Direct navigation links to state child pages.

### 2.3. National Capabilities & Featured Services
- **Admin Editor State Path:** `data.featuredServices` / `data.nationalServices`
- **Frontend Target:** National Services Grid
- **Field-by-Field Contract:**
  - `title` *(string)*: Section title.
  - `services` *(Array<{ title: string; description: string; icon: string; link?: string }>)*.

### 2.4. National Compliance & Warranties
- **Admin Editor State Path:** `data.warranties` / `data.compliance`
- **Frontend Target:** Compliance & Warranty Highlights
- **Field-by-Field Contract:**
  - `warrantyTitle` *(string)*: Standard nationwide warranty guarantees.
  - `complianceStandards` *(Array<string>)*: National building codes and certifications.

---

## 3. Comprehensive State Template Schema Contract (`StateTemplate.tsx`)

### 3.1. State Hero & Local Authority Badges
- **Admin Editor State Path:** `data.hero` or top-level `data`
- **Frontend Target:** `src/components/templates/StateTemplate.tsx` (Hero block)
- **Field-by-Field Contract:**
  - `stateName` *(string)*: State/Province name (e.g., `"California"`, `"Florida"`, `"Texas"`).
  - `stateCode` *(string)*: State abbreviation (e.g., `"CA"`, `"FL"`, `"TX"`).
  - `countryRef` *(string)*: Parent country reference (e.g., `"US"`).
  - `badge` *(string)*: State licensing badge (e.g., `"Fully Licensed & Insured Texas Contractor"`).
  - `title` *(string)*: Main state headline.
  - `subtitle` *(string)*: State-wide climate, architectural, and service overview.
  - `licenseNumber` *(string)*: State contractor license number.
  - `phone` *(string)*: State dispatch telephone number.

### 3.2. Municipalities & Major Cities Directory
- **Admin Editor State Path:** `data.cities` / `data.municipalities`
- **Frontend Target:** Cities & Metropolitan Areas Grid
- **Field-by-Field Contract:**
  - `title` *(string)*: Section heading (e.g., `"Cities We Serve Across Texas"`).
  - `citiesList` *(Array<{ name: string; slug: string; isMajorHub?: boolean; serviceRadius?: string }>)*: Links to city-level location pages.

### 3.3. State Specific Regulations & Environmental Considerations
- **Admin Editor State Path:** `data.regulations` / `data.climateSpecs`
- **Frontend Target:** Local Regulations & Materials Specs
- **Field-by-Field Contract:**
  - `title` *(string)*: Local building codes & climate considerations.
  - `content` *(string | RichText)*: Building requirements (e.g., hurricane wind-load ratings for Florida, seismic codes for California).

---

## 4. Step-by-Step Audit Execution Protocol

### Step 1: Content Provider Isolation Audit
1. Inspect `src/components/templates/TemplateRegistry.tsx` lines 57-75.
2. Verify that `isIsolatedTemplate` includes both `'country'` and `'state'`.
3. Confirm that `providerData` for these templates isolates state content completely, preventing global homepage sections (`hero`, `aboutOwner`, `brandStore`) from bleeding into national or state pages.

### Step 2: Editor State Bindings & Default Fallbacks
1. Inspect `src/components/admin/editors/CountryEditor.tsx` and `StateEditor.tsx`.
2. Verify that empty state/city lists do not render blank gaps or throw undefined map errors.
3. Check that state abbreviation codes convert automatically to uppercase.

### Step 3: URL Slugs & Hierarchical Routing
1. Confirm that state and country pages correctly resolve through `src/app/[...slug]/page.tsx` for paths like `/country/us` or `/state/tx` or `/united-states/texas`.
