---
name: audit-agent-template-about-sync
description: Comprehensive deep-dive schema and state synchronization auditor for AboutTemplate, NewAboutTemplate, AboutEditor, and NewAboutEditor.
---

# Agent 13: About, Mission & Brand Story Template Sync Auditor (Deep-Dive Edition)

## 1. Objective & Scope
The primary mission of Agent 13 is to perform an exhaustive data schema and UI synchronization audit across the company storytelling components: `NewAboutTemplate.tsx`, `AboutTemplate.tsx`, `NewAboutEditor.tsx`, and `AboutEditor.tsx`.

Agent 13 ensures that the company origin story, foundational mission and vision statements, core organizational values, interactive milestone timelines, leadership team profiles, and quantitative achievement statistics stay 100% in sync between the CMS dashboard and public frontend pages.

---

## 2. Comprehensive About Page Schema Contract

### 2.1. Hero & Brand Narrative Header
- **Admin Editor State Path:** `data.hero`
- **Frontend Target:** Hero Header Component in `NewAboutTemplate.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*: Small pill tag (e.g., `"Our Story & Purpose"`).
  - `title` *(string)*: Main narrative heading (e.g., `"Crafting Exceptional Digital Realities Since 2018"`).
  - `highlightText` *(string)*: Gradient or emphasized phrase.
  - `subtitle` *(string)*: In-depth introduction paragraph explaining the agency philosophy.
  - `backgroundImage` *(string)*: Hero banner backdrop image URL.
  - `foundedYear` *(string | number)*: Year established (e.g., `"2018"`).
  - `headquarters` *(string)*: Physical office location.

### 2.2. Company Story & Origin Narrative
- **Admin Editor State Path:** `data.story` / `data.origin`
- **Frontend Target:** Story Grid Section
- **Field-by-Field Contract:**
  - `badge` *(string)*: Section badge (e.g., `"The Journey"`).
  - `title` *(string)*: Section title.
  - `content` *(string | RichText)*: Multi-paragraph founding story.
  - `highlightQuote` *(string)*: Pull-quote from the founder.
  - `image1` *(string)*: Primary narrative image (office, team collaboration, workshop).
  - `image2` *(string)*: Secondary supporting image.
  - `keyStats` *(Array<{ value: string; label: string; suffix?: string }>)*: Story stats counters.

### 2.3. Core Mission & Vision Directives
- **Admin Editor State Path:** `data.missionVision` or `data.mission` & `data.vision`
- **Frontend Target:** Mission & Vision Dual Cards
- **Field-by-Field Contract:**
  - `missionTitle` *(string)*: Heading for mission (e.g., `"Our Mission"`).
  - `missionDescription` *(string)*: Actionable mission statement.
  - `missionPoints` *(Array<string>)*: Key tenets of the mission.
  - `missionIcon` *(string)*: Lucide icon name.
  - `visionTitle` *(string)*: Heading for vision (e.g., `"Our Vision"`).
  - `visionDescription` *(string)*: Long-term aspirational vision.
  - `visionPoints` *(Array<string>)*: Pillars supporting future growth.
  - `visionIcon` *(string)*: Lucide icon name.

### 2.4. Organizational Core Values
- **Admin Editor State Path:** `data.values` / `data.coreValues`
- **Frontend Target:** `src/components/TeamValues.tsx` or Values Grid
- **Field-by-Field Contract:**
  - `badge` *(string)*: Values pill.
  - `title` *(string)*: Section header (e.g., `"Principles That Guide Every Decision"`).
  - `subtitle` *(string)*: Intro context.
  - `items` *(Array<{ id: string; title: string; description: string; icon: string; tag?: string }>)*: Values cards.

### 2.5. Interactive Milestone Timeline
- **Admin Editor State Path:** `data.timeline` / `data.milestones`
- **Frontend Target:** Vertical or Horizontal Milestone Timeline
- **Field-by-Field Contract:**
  - `badge` *(string)*: Timeline badge.
  - `title` *(string)*: Timeline title (e.g., `"Our Evolution Over the Years"`).
  - `subtitle` *(string)*: Overview of milestones.
  - `milestones` *(Array<{ year: string | number; title: string; description: string; icon?: string; badge?: string; image?: string }>)*: Chronological milestone events.

### 2.6. Executive Leadership & Key Personnel
- **Admin Editor State Path:** `data.leadership` / `data.team`
- **Frontend Target:** `src/components/Leadership.tsx`
- **Field-by-Field Contract:**
  - `badge` *(string)*: Team badge.
  - `title` *(string)*: Leadership heading (e.g., `"Meet the Minds Behind the Work"`).
  - `subtitle` *(string)*: Introduction to team credentials.
  - `members` *(Array<{ name: string; role: string; bio: string; image: string; socialLinks?: { linkedin?: string; twitter?: string; github?: string; email?: string } }>)*: Executive profiles.

### 2.7. Quantitative Impact Metrics & Certifications
- **Admin Editor State Path:** `data.stats` / `data.achievements`
- **Frontend Target:** Stats Bar Component
- **Field-by-Field Contract:**
  - `stats` *(Array<{ value: string; label: string; suffix?: string; description?: string }>)*.
  - `certifications` *(Array<{ name: string; issuer: string; badgeImage: string; link?: string }>)*.

---

## 3. Step-by-Step Audit Execution Protocol

### Step 1: Editor State Extraction & Bindings Verification
1. Inspect `src/components/admin/editors/NewAboutEditor.tsx` and `AboutEditor.tsx`.
2. Map all form controls for text inputs, textareas, rich-text editors, array appenders (`addMilestone`, `addValue`, `addLeader`), and image pickers.
3. Verify that `onChange` callbacks immutably update the target object properties under `data`.

### Step 2: Template Mapping & Legacy Compatibility Audit
1. Inspect `src/components/templates/TemplateRegistry.tsx`.
2. Note that `'about'`, `'new-about'`, and `'newabout'` all map to `NewAboutTemplate`.
3. Verify that `NewAboutTemplate.tsx` handles both old schema shapes (`data.aboutOwner`, `data.mission`) and new schema shapes (`data.story`, `data.missionVision`) seamlessly through fallback resolution.

### Step 3: Social Links & Image Asset Fallbacks
1. Verify that `member.socialLinks` does not cause null dereferencing if an admin does not provide a LinkedIn or Twitter URL.
2. Confirm that missing member avatar images display a stylish fallback initial avatar or placeholder graphic without broken image icons.
