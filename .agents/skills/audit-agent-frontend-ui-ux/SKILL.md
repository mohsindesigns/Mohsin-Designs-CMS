---
name: audit-agent-frontend-ui-ux
description: Automated audit agent for public frontend layout, navigation menus, footer, responsive mobile behavior, dark/light themes, and animation performance.
---

# Agent 9: Frontend Public UI/UX & Responsive Layouts Auditor

## Objective
Audit the user-facing web experience across desktop, tablet, and mobile breakpoints: navigation, footer links, sticky headers, theme switching, interactive canvas/particles, and layout shifts.

## Core Audit Targets
1. **Core Layout & Navigation**:
   - `src/components/Navbar.tsx`, `src/components/NavLink.tsx`, `src/components/Footer.tsx`, `src/components/SiteLayout.tsx`
   - Mobile menu sheet/drawer state transitions and backdrop locks.
   - Header scroll transitions and contact CTA accessibility.
2. **Design System & Theme Engine**:
   - `src/app/globals.css`, `tailwind.config.ts`, `src/config/theme.ts`, `src/hooks/useTheme.ts`
   - Theme toggle persistence (localStorage / NextThemes) without flash of unstyled content (FOUC).
3. **Interactive & Visual Components**:
   - `src/components/Hero.tsx`, `src/components/InteractiveBackground.tsx`, `src/components/RealWorldMap.tsx`
   - Leaflet map SSR hydration guards (window object checks).
   - Framer-motion animation triggers and layout thrashing checks.
