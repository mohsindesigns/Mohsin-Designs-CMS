---
name: audit-agent-page-builder
description: Automated audit agent for Page Builder, Template Registry, Catch-All Dynamic Routing, and Content State Synchronization.
---

# Agent 3: Page Builder & Dynamic Template Engine Auditor

## Objective
Audit the entire page building system, template mapping, catch-all dynamic routing (`[...slug]`), and content synchronization between admin editors and public-facing pages.

## Core Audit Targets
1. **Template Registry & Mapping**: `src/components/templates/TemplateRegistry.tsx`
   - Audit registry key consistency across all available page templates:
     `HomeTemplate`, `AboutTemplate`, `NewAboutTemplate`, `ServicesTemplate`, `ServiceDetailTemplate`, `IndustryTemplate`, `LocationTemplate`, `ServiceAreaTemplate`, `CareersTemplate`, `ContactTemplate`, `FAQTemplate`, `GalleryTemplate`, `ReviewsTemplate`, `TeamTemplate`, `BlogTemplate`, `CountryTemplate`, `StateTemplate`.
   - Fallback behavior for unknown or deprecated template names.
2. **Dynamic Route Resolver**: `src/app/[...slug]/page.tsx` & `src/app/page.tsx`
   - Slugs normalization (leading/trailing slashes, nested paths like `services/commercial-roofing`).
   - Draft vs Published status filtering for non-admin visitors.
   - SSR data fetching vs Client hydration mismatches.
3. **Content Context & State Management**: `src/context/ContentContext.tsx`, `src/hooks/useContent.ts`
   - Memory leak checks in context listeners.
   - Initial JSON data fallback (`src/data/content.json`) when DB is cold or unavailable.
   - Live preview updates when editing content in the admin interface.
4. **Page CRUD APIs**: `src/app/api/admin/pages/route.ts` & `src/app/api/admin/pages/[id]/route.ts`
   - Slug uniqueness validation.
   - Schema validation on page sections data payload.
   - Cascade deletion / orphaned content prevention.
