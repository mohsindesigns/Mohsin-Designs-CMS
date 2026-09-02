---
name: audit-agent-template-location-sync
description: Comprehensive deep-dive schema and state synchronization auditor for LocationTemplate, ServiceAreaTemplate, LocationEditor, and ServiceAreaEditor.
---

# Agent 15: Geographic Location & Service Area Template Sync Auditor (Deep-Dive Edition)

## 1. Objective & Scope
The primary mission of Agent 15 is to perform a rigorous synchronization and data contract audit between the local SEO & geographic editors (`LocationEditor.tsx`, `ServiceAreaEditor.tsx`) and the corresponding frontend templates (`LocationTemplate.tsx`, `ServiceAreaTemplate.tsx`).

Agent 15 ensures that hyper-local landing pages contain accurate geographic coordinates, service radii, neighborhood landmarks, local client reviews, phone dispatch numbers, emergency hours, and interactive OpenStreetMap/Leaflet embeddings without hydration bugs, map crashes, or misplaced state data.

---

## 2. Comprehensive Location Landing Schema Contract (`LocationTemplate.tsx`)

### 2.1. Localized Hero & Quick Dispatch
- **Admin Editor State Path:** `data.hero` or top-level `data`
- **Frontend Target:** `src/components/templates/LocationTemplate.tsx` (Hero block)
- **Field-by-Field Contract:**
  - `cityName` *(string)*: Primary city/market (e.g., `"Austin"`, `"Dallas"`, `"Miami"`).
  - `stateName` *(string)*: State name or abbreviation (e.g., `"TX"`, `"Texas"`).
  - `badge` *(string)*: Local badge (e.g., `"#1 Rated Web & Roofing Experts in Austin"`).
  - `title` *(string)*: Primary headline with local keyword insertion.
  - `subtitle` *(string)*: Localized service pitch.
  - `phone` *(string)*: Local phone number or dispatcher hotline.
  - `emergencyService` *(boolean | string)*: 24/7 emergency dispatch availability toggle.
  - `backgroundImage` *(string)*: City skyline or local project banner.

### 2.2. Local Office Details & Service Radius
- **Admin Editor State Path:** `data.localDetails` / `data.contactInfo`
- **Frontend Target:** Local Contact & Radius Information Box
- **Field-by-Field Contract:**
  - `address` *(string)*: Physical office or dispatch address.
  - `serviceRadius` *(string | number)*: Service radius in miles/kilometers (e.g., `"45 miles"`).
  - `operatingHours` *(string)*: Weekly business hours.
  - `zipCodes` *(Array<string> | string)*: Covered zip codes list for local search indexing.
  - `coordinates` *( { lat: number; lng: number } )*: Exact latitude and longitude for map centering.

### 2.3. Local Services Catalog
- **Admin Editor State Path:** `data.localServices` / `data.services`
- **Frontend Target:** Localized Services Grid
- **Field-by-Field Contract:**
  - `title` *(string)*: Section header (e.g., `"Services We Provide in Austin, TX"`).
  - `subtitle` *(string)*: Intro describing localized requirements (weather conditions, building codes).
  - `services` *(Array<{ name: string; description: string; icon: string; link?: string; isPopular?: boolean }>)*.

### 2.4. Neighborhood Landmarks & Surrounding Areas
- **Admin Editor State Path:** `data.landmarks` / `data.neighborhoods`
- **Frontend Target:** Surrounding Communities & Landmarks List
- **Field-by-Field Contract:**
  - `title` *(string)*: Heading (e.g., `"Neighborhoods & Suburbs We Proudly Serve"`).
  - `items` *(Array<{ name: string; distance?: string; description?: string }>)*: Surrounding communities and local landmarks.

### 2.5. Localized Reviews & Social Proof
- **Admin Editor State Path:** `data.localTestimonials` / `data.reviews`
- **Frontend Target:** Local Testimonials Module
- **Field-by-Field Contract:**
  - `title` *(string)*: Header.
  - `reviews` *(Array<{ author: string; neighborhood?: string; rating: number; text: string; date?: string }>)*.

### 2.6. Interactive Map & Coverage Boundary
- **Admin Editor State Path:** `data.map` / `data.serviceAreaMap`
- **Frontend Target:** `src/components/RealWorldMap.tsx` / Leaflet Map Container
- **Field-by-Field Contract:**
  - `centerLat` *(number)* & `centerLng` *(number)*: Center coordinates.
  - `zoomLevel` *(number)*: Initial map zoom level.
  - `markers` *(Array<{ lat: number; lng: number; title: string; address?: string }>)*: Project pins on the map.

---

## 3. Comprehensive Service Area Directory Schema Contract (`ServiceAreaTemplate.tsx`)

### 3.1. Directory Overview & Regional Hubs
- **Admin Editor State Path:** `data.hero`, `data.regions`, `data.cities`
- **Frontend Target:** `src/components/templates/ServiceAreaTemplate.tsx`
- **Field-by-Field Contract:**
  - `title` *(string)*, `badge` *(string)*, `subtitle` *(string)*.
  - `regions` *(Array<{ regionName: string; cities: Array<{ name: string; slug: string; isHotspot?: boolean }> }>)*: Regional directory grid.

---

## 4. Step-by-Step Audit Execution Protocol

### Step 1: Editor State Extraction & Coordinate Validation
1. Inspect `src/components/admin/editors/LocationEditor.tsx` and `ServiceAreaEditor.tsx`.
2. Check that coordinate inputs parse values to `Number(val)` so they don't get saved as strings (`"30.2672"` instead of `30.2672`).
3. Verify that `zipCodes` entered as comma-separated text are cleanly split and trimmed into an array of strings.

### Step 2: Leaflet / OpenStreetMap Client-Only Guard Verification
1. Inspect `src/components/RealWorldMap.tsx`.
2. Verify that Leaflet is loaded with `typeof window !== 'undefined'` or `next/dynamic` with `{ ssr: false }` to prevent SSR window reference crashes.

### Step 3: Template Registry & Catch-All Routing Check
1. Confirm `'location'`, `'locations'`, and `'service-area'` properly resolve in `TemplateRegistry.tsx`.
2. Verify that local pages render cleanly under paths such as `/location/austin-tx` or `/locations/dallas`.
