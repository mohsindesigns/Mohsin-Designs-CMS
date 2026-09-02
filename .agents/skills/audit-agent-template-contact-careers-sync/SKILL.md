---
name: audit-agent-template-contact-careers-sync
description: Comprehensive deep-dive schema and state synchronization auditor for ContactTemplate, CareersTemplate, ContactEditor, and CareersEditor.
---

# Agent 17: Contact, Lead Generation & Careers Template Sync Auditor (Deep-Dive Edition)

## 1. Objective & Scope
The primary mission of Agent 17 is to audit data contracts, form fields, career job listings, resume ingestion, and lead capture state synchronization between `ContactEditor.tsx` / `CareersEditor.tsx` and `ContactTemplate.tsx` / `CareersTemplate.tsx`.

Agent 17 ensures that contact methods (hotlines, physical headquarters, dispatch email, interactive map coordinates), lead capture configurations, open job positions, department filtering, benefit perks, and recruitment submission endpoints match 100% between the CMS admin interface and the public frontend landing pages.

---

## 2. Comprehensive Contact Landing Schema Contract (`ContactTemplate.tsx`)

### 2.1. Contact Hero & Direct Inquiries
- **Admin Editor State Path:** `data.hero` or top-level `data`
- **Frontend Target:** `src/components/templates/ContactTemplate.tsx` (Hero block)
- **Field-by-Field Contract:**
  - `badge` *(string)*: Small pill badge (e.g., `"Get in Touch"`).
  - `title` *(string)*: Main contact headline (e.g., `"Let's Build Something Exceptional Together"`).
  - `subtitle` *(string)*: In-depth paragraph detailing support hours, response times, and consultation options.
  - `phone` *(string)*: Primary customer support phone number.
  - `emergencyPhone` *(string)*: After-hours or emergency hotline.
  - `email` *(string)*: General inquiries email address.
  - `supportEmail` *(string)*: Dedicated technical/client support email.
  - `address` *(string)*: Corporate headquarters street address.
  - `officeHours` *(string)*: Weekly business hours (e.g., `"Mon - Fri: 8:00 AM - 6:00 PM EST"`).
  - `responsePromise` *(string)*: Response time commitment (e.g., `"Guaranteed response within 2 hours"`).

### 2.2. Interactive Contact Form Configuration
- **Admin Editor State Path:** `data.form` / `data.contactForm`
- **Frontend Target:** `src/components/ContactForm.tsx`
- **Field-by-Field Contract:**
  - `formTitle` *(string)*: Form header.
  - `formSubtitle` *(string)*: Sub-instruction text.
  - `servicesDropdown` *(Array<string>)*: Dynamic list of selectable services.
  - `budgetRanges` *(Array<string>)*: Selectable estimated project budgets.
  - `requirePhone` *(boolean)*: Toggle enforcing phone number input.
  - `turnstileEnabled` *(boolean)*: Cloudflare Turnstile anti-bot toggle.
  - `successMessage` *(string)*: Custom thank you notification text upon submission.

### 2.3. Multi-Location Offices & Directions
- **Admin Editor State Path:** `data.offices` / `data.locations`
- **Frontend Target:** Office Cards Grid
- **Field-by-Field Contract:**
  - `title` *(string)*: Section header.
  - `offices` *(Array<{ city: string; address: string; phone: string; email: string; coordinates?: { lat: number; lng: number }; isHQ?: boolean }>)*: Multi-location office cards.

---

## 3. Comprehensive Careers Landing Schema Contract (`CareersTemplate.tsx`)

### 3.1. Careers Hero & Employer Value Proposition
- **Admin Editor State Path:** `data.hero`
- **Frontend Target:** `src/components/templates/CareersTemplate.tsx` (Hero block)
- **Field-by-Field Contract:**
  - `badge` *(string)*: Careers pill (e.g., `"Join Our Team"`).
  - `title` *(string)*: Employer branding headline (e.g., `"Shape the Future of Web & Architectural Design"`).
  - `subtitle` *(string)*: Culture narrative and workplace philosophy.
  - `backgroundImage` *(string)*: Team workplace banner image URL.
  - `openPositionsCount` *(number | string)*: Live badge showing active openings.

### 3.2. Culture & Employee Benefits
- **Admin Editor State Path:** `data.benefits` / `data.perks`
- **Frontend Target:** Benefits & Perks Grid
- **Field-by-Field Contract:**
  - `title` *(string)*: Section heading (e.g., `"Why You'll Love Working With Us"`).
  - `subtitle` *(string)*: Overview of health, wellness, flexibility, and growth perks.
  - `perks` *(Array<{ title: string; description: string; icon: string; tag?: string }>)*: Perks list.

### 3.3. Open Positions Directory & Filtering
- **Admin Editor State Path:** `data.jobs` / `data.openings`
- **Frontend Target:** Job Listings Accordion / Application Cards
- **Field-by-Field Contract:**
  - `title` *(string)*: Section title (e.g., `"Current Career Opportunities"`).
  - `departments` *(Array<string>)*: Department filter tabs (Engineering, Design, Management, Sales).
  - `jobs` *(Array<{ id: string; title: string; department: string; location: string; type: string; salary?: string; experience: string; description: string; requirements: string[]; responsibilities: string[]; active: boolean }>)*: Job postings array.

---

## 4. Step-by-Step Audit Execution Protocol

### Step 1: Form Validation & Submission Route Check
1. Inspect `src/components/ContactForm.tsx` and `src/components/admin/editors/ContactEditor.tsx`.
2. Verify that field names (`name`, `email`, `phone`, `service`, `message`, `turnstileToken`) match the payload expected by `POST /api/send`.
3. Confirm that input sanitization (`src/lib/sanitizeInput.ts`) processes all incoming fields cleanly.

### Step 2: Job Status Filtering & Deprecated Positions
1. Verify that `CareersTemplate.tsx` filters out inactive positions (`job.active !== false`).
2. Ensure that empty job listings display a clean `"No current openings in this department, but feel free to submit a general application"` state.

### Step 3: Hydration & Responsive UI Verification
1. Verify that interactive accordion elements for job descriptions expand smoothly across mobile and desktop viewport sizes.
2. Ensure phone numbers format with clickable `tel:` links and email addresses format with `mailto:` links.
