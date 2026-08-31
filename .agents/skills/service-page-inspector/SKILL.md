---
name: service-page-inspector
description: "Inspects and analyzes Service Detail templates, props, dependencies, state management, and schema before any modifications."
---

# Service Page Inspector

## Objective
Analyze the current state of `ServiceDetailTemplate.tsx` and related components to understand layout, data structure, styling, and behavior before changes are made.

## Inspection Checklist
1. **Component Architecture**: Trace props, state, subcomponents (Hero, Content, Pricing, FAQs, CTA, Reviews, Related Services).
2. **Data & Schema**: Verify how service data, metadata, and dynamic fields are loaded and structured.
3. **Styling & Layout**: Inspect Tailwind/CSS class structure, responsive breakpoints (mobile, tablet, desktop), and theme variables.
4. **Dependencies & Imports**: Identify all internal and external dependencies to prevent broken references.
5. **Issue & Requirement Identification**: Map user-requested changes against existing code lines and components.
