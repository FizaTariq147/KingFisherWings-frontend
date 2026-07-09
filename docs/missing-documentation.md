# Missing Documentation & Known Gaps

This document records documentation that does not yet exist, inconsistencies in the codebase, and recommended follow-up work. It complements the other files in `docs/`.

---

## 1. Documentation that does not exist yet

### Repository-level

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| No `CONTRIBUTING.md` | New developers lack PR/branch conventions beyond README | Add coding standards, PR checklist, commit format |
| No API reference in this repo | Frontend devs cannot discover endpoints without backend access | Link to backend Swagger or generate OpenAPI client |
| No deployment guide | Unclear how production builds are hosted | Document CI/CD, env vars per environment, CDN/hosting |
| No testing guide | Vitest/Storybook tests exist but are undocumented | Add `docs/testing.md` with how to run and write tests |
| Root README is outdated | Lists React 18, Router v6; project uses React 19, Router 7 | Update README tech stack table |
| No changelog | Release history not tracked in repo | Add `CHANGELOG.md` or use GitHub releases |

### Backend (external repo)

| Gap | Recommendation |
|-----|----------------|
| Database schema | ERD or migration docs in backend repo |
| NestJS module map | Which modules own jobs, finance, EDI, etc. |
| Webhook / EDI integrations | Bayan EDI, agent EDI payload formats |
| Environment variables | Full list for API server, DB, Redis, email |
| Multi-tenant data isolation | How `tenantId` is enforced in queries |

### Frontend modules

| Gap | Recommendation |
|-----|----------------|
| Per-module API contracts | Document expected request/response for each `*Service.ts` |
| Widget data shapes | OpenAPI or TypeScript types for dashboard endpoints |
| Form validation rules | Zod schemas for job/quotation forms when implemented |
| Storybook coverage map | Which components have stories vs which need them |

---

## 2. Code inconsistencies (undocumented behavior)

### Duplicate router definition

- **Active:** `src/router/index.tsx` (used by `main.tsx`)
- **Stale:** `src/App.tsx` exports an alternate `router` with fewer routes and more placeholders

`App.tsx` is not imported anywhere in the bootstrap path. Risk: developers edit the wrong file.

**Action:** Delete `App.tsx` router or merge and single-source routes.

### Environment variable naming

| Client | Env var used | Notes |
|--------|--------------|-------|
| `axiosInstance` | `VITE_API_URL` | Documented in `.env.example` |
| `superAdminApiClient` | `VITE_API_BASE_URL` | Falls back to `/api`; **not** in `.env.example` |

Super-admin may silently hit the wrong host in dev.

**Action:** Unify on `VITE_API_URL` or document both in `.env.example`.

### Duplicate `AuthUser` types

| Location | `role` shape | `permissions` |
|----------|--------------|---------------|
| `src/store/authStore.ts` | `string` | Not present |
| `src/types/auth.types.ts` | `{ id, name, slug }` | `PermissionKey[]` |

`AuthContext` uses the rich type; `authStore` uses a minimal login response type. Sidebar falls back to `authStore.user` when context is loading.

**Action:** Single `AuthUser` type; login response type alias if needed.

### Duplicate theme systems

| Store | Theme values | Applied by |
|-------|--------------|------------|
| `uiStore` | `default`, `theme-blue`, `theme-red` | `setTheme` mutates DOM |
| `themeStore` | `default`, `green`, `blue`, `red` | `useApplyTheme` in `AppShell` |

README documents `theme-blue` / `theme-red`; `themeStore` also has `theme-green`.

**Action:** Consolidate to one store and one naming scheme.

### Permission type drift

`Sidebar.tsx` casts `menu_management` and `menu_sales` with `as PermissionKey`, but these keys are **not** in `auth.types.ts`.

**Action:** Sync permission enum with backend JWT payload.

### API path prefix ambiguity

Some calls use `/api/auth/login` while `VITE_API_URL` in `.env.example` is `https://kingfisherwings.onrender.com` (no `/api` suffix). Whether paths are `/api/...` or root-relative depends on how `VITE_API_URL` is configured.

**Action:** Document the expected `VITE_API_URL` format (with or without `/api`).

---

## 3. Incomplete features (need module docs when built)

| Area | Current state |
|------|---------------|
| Jobs (air/sea export/import) | Router placeholders only; legacy pages unrouted |
| Finance / invoices | Permission gate + placeholders |
| Masters / reports | Placeholders |
| Settings hub | `/settings` is placeholder; sub-pages exist but not all routed |
| Audit log | Page + hook exist; route not in active router |
| Super-admin / tenants | Full UI; routes commented out |
| Module services | `employeeService`, `clientService`, `userService` return `[]` |

---

## 4. Assumptions marked in source code

These inline comments indicate uncertainty — should be verified with backend team:

| File | Assumption |
|------|------------|
| `superAdminAuth.service.ts` | Endpoint path `/auth/superadmin/login` |
| `superAdminApiClient.ts` | `ApiEnvelope` shape; file rebuilt from usage |
| `ListPageTemplate.tsx` | Template pasted without verifying `Table` component API |
| `tenant.service.ts` | Matches backend Swagger "Tenants (Super Admin)" |

---

## 5. Dev-only features not in `.env.example`

| Variable | Purpose |
|----------|---------|
| `VITE_BYPASS_AUTH` | Skip auth, use mock admin |
| `VITE_MOCK_API` | Fixture data when backend unreachable |

Add to `.env.example` with comments that they are dev-only.

---

## 6. Recommended documentation roadmap

### Phase 1 — Quick wins (this repo)

- [x] Architecture docs under `docs/` (this effort)
- [ ] Update root `README.md` (versions, link to `docs/`)
- [ ] Extend `.env.example` with all `VITE_*` vars
- [ ] Remove or reconcile `App.tsx` duplicate router

### Phase 2 — Developer experience

- [ ] `docs/testing.md` — Vitest, Storybook, E2E strategy
- [ ] `docs/deployment.md` — build artifacts, hosting, env matrix
- [ ] `CONTRIBUTING.md` — branch strategy (already in README), lint, PR process

### Phase 3 — API alignment

- [ ] OpenAPI spec link or generated `src/api/types.ts` from backend
- [ ] Per-module `docs/modules/<name>.md` as APIs go live
- [ ] Permission key registry synced with backend

### Phase 4 — Backend repo

- [ ] NestJS architecture doc
- [ ] Database ERD
- [ ] Auth & tenant isolation deep dive
- [ ] EDI integration guides

---

## 7. Files safe to treat as templates / WIP

These contain "PASTE THIS" or "REPLACE THIS ENTIRE FILE" comments — implementation may be provisional:

- `src/components/templates/ListPageTemplate.tsx`
- `src/lib/superAdminApiClient.ts`
- `src/router/ProtectedRoutes.tsx` (alternate protected routes file; check if used)

---

## 8. Storybook & component docs

Storybook is configured (`.storybook/`, `npm run storybook`) but there is no index of which components are documented. The README mentions "shadcn/ui" but the project uses a minimal custom `components/ui/` set (Table, Badge, etc.) rather than a full shadcn install.

**Recommendation:** Add Storybook link to `docs/README.md` once stories are cataloged, or add `docs/components.md`.

---

## Summary

The frontend has substantial UI surface area across freight ERP modules, but **API integration is uneven**: auth, sessions, audit, homepage config, and super-admin tenants are wired; many business modules still use stubs or mock data. The highest-impact documentation gaps are **backend API reference**, **env var consistency**, and **consolidating duplicate auth/theme/router code** so new contributors have a single source of truth.
