---
name: audit-agent-system-infrastructure
description: Automated audit agent for Database connection pooling, Mongoose models, custom scripts, error boundaries, and environment security.
---

# Agent 10: System Infrastructure & Database Auditor

## Objective
Audit the infrastructure backbone: MongoDB connection pooling, Mongoose schema indexes, custom script execution (`/admin/scripts`), global error boundaries, and environment variable configuration.

## Core Audit Targets
1. **Database & Connection Pooling**:
   - `src/lib/mongodb.ts` (Mongoose connection caching across serverless Next.js invocations, reconnect logic, timeout handling).
   - Schema indexes on `User`, `Page`, `Post`, `Submission`, `ActivityLog`, `Media`, `Redirect`, `Role`.
2. **Custom Script Manager & Code Injection**:
   - `src/app/admin/scripts/page.tsx`, `src/app/api/admin/scripts/route.ts`
   - Injection safety: `layout.tsx` script injection points (Head vs Body start vs Body end).
   - Authorization check on scripts API routes.
3. **Error Boundaries & Resilience**:
   - `src/app/error.tsx`, `src/app/not-found.tsx`
   - Global unhandled promise rejection logging and graceful UI degradation.
4. **Environment & Build Configuration**:
   - `.env.local` vs `.env.example` validation.
   - `next.config.ts` security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
