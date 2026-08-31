---
name: service-page-validator
description: "Verifies code validity, TypeScript types, build integrity, and static analysis without relying on browser subagents."
---

# Service Page Validator (Verification & Build Check)

## Objective
Ensure that all changes to `ServiceDetailTemplate.tsx` compile cleanly without TypeScript errors, syntax errors, broken imports, or build failures.

## Verification Checklist
1. **TypeScript Compilation**: Run TypeScript checks (e.g. `npx tsc --noEmit`) to verify zero type mismatches or missing properties.
2. **Import & Export Integrity**: Verify that all imported assets, components, and helper utilities exist and are correctly resolved.
3. **JSX & React Rule Validation**: Check JSX syntax, tag closure, key props on list renders, and hook ordering.
4. **Hydration & SSR Safety**: Ensure client-side only variables (`window`, `localStorage`) are guarded properly for Next.js/SSR environments.
