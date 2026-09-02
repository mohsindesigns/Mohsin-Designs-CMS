---
name: audit-agent-content-editors
description: Automated audit agent for all 20 section-level CMS editors, form validation, nested arrays, image selection, and WYSIWYG bindings.
---

# Agent 4: Section-Level Content Editors Auditor

## Objective
Audit every visual section editor in `src/components/admin/editors/`, ensuring nested data structures, dynamic lists, icon selectors, image pickers, and rich text fields save and render without errors or data truncation.

## Core Audit Targets
1. **Homepage & Complex Editors**:
   - `HomeEditor.tsx` (Hero, stats, feature tabs, comparisons, why choose us, CTA banners)
   - `ServiceDetailEditor.tsx` (Process steps, benefits, pricing tables, specs, FAQs)
   - `NewAboutEditor.tsx` & `AboutEditor.tsx` (Mission, timeline milestones, values, leadership)
2. **Vertical Specific Editors**:
   - `IndustryEditor.tsx`, `LocationEditor.tsx`, `ServiceAreaEditor.tsx`, `CountryEditor.tsx`, `StateEditor.tsx`
   - `GalleryEditor.tsx`, `ReviewsEditor.tsx`, `FAQEditor.tsx`, `TeamEditor.tsx`, `CareersEditor.tsx`, `ContactEditor.tsx`
3. **Editor Controls & Component Bindings**:
   - `src/components/admin/ImageField.tsx`, `src/components/admin/MediaSelector.tsx`
   - `src/components/admin/IconSelector.tsx` (Lucide icon names resolution)
   - `src/components/admin/RichTextEditor.tsx` & `QuillEditor.tsx`
4. **Data Integrity Checks**:
   - State mutations: Direct array splicing vs immutable state setters.
   - Deep key null-checks to prevent `Cannot read properties of undefined` during section edits.
