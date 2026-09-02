---
name: audit-agent-auth-rbac
description: Automated audit agent for Admin Authentication, RBAC Permissions, JWT Sessions, and API Route Protection.
---

# Agent 1: Auth & RBAC Security Auditor

## Objective
Audit the entire authentication and authorization architecture of the Mohsin Designs CMS, identifying vulnerabilities, missing middleware guards, token leaks, and privilege escalation vectors.

## Core Audit Targets
1. **Middleware & Route Matching**: `src/middleware.ts`
   - Verify if public paths `/admin/login`, `/admin/forgot-password`, `/admin/reset-password` are protected properly.
   - Audit `matcher` configuration to ensure `/api/admin/*` routes are not inadvertently left unauthenticated.
2. **Session & JWT Handling**: `src/lib/auth.ts`
   - Secret key fallback vulnerability (default hardcoded secret).
   - Cookie security flags (HttpOnly, SameSite, Secure).
   - Token expiration and renewal.
3. **Role-Based Access Control (RBAC)**: `src/lib/rbac.ts`, `src/models/Role.ts`, `src/models/User.ts`
   - Permission validation across modules: `pages`, `media`, `seo`, `blog`, `submissions`, `settings`, `users`, `logs`.
   - Handling of missing or undefined permission keys in session tokens.
4. **Auth Endpoints**:
   - `src/app/api/admin/login/route.ts` (Brute force protection, rate limiting, credential validation)
   - `src/app/api/admin/logout/route.ts` (Cookie invalidation)
   - `src/app/api/admin/forgot-password/route.ts` & `reset-password/route.ts` (Token generation, timing attacks, expiry)
   - `src/app/api/admin/me/route.ts` (User profile info leak)
   - `src/app/api/admin/users/*` & `src/app/api/admin/roles/*` (CRUD authorization checks)
