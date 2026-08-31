# KingFisher Tech Gold — Documentation

Documentation for **fresa-gold-frontend**: a React SPA for a cloud-based freight management ERP. The backend (NestJS + PostgreSQL) is a separate repository.

---

## Codebase guide

Start here for the eight core areas of the application:

| # | Topic | Document |
|---|-------|----------|
| 1 | **Frontend architecture** | [frontend-architecture.md](./frontend-architecture.md) |
| 2 | **Routing structure** | [routing.md](./routing.md) |
| 3 | **Redux / state setup** | [state-management.md](./state-management.md) — *project uses Zustand + TanStack Query, not Redux* |
| 4 | **API service layer** | [api-service-layer.md](./api-service-layer.md) |
| 5 | **Authentication flow** | [authentication.md](./authentication.md) |
| 6 | **Reusable components** | [reusable-components.md](./reusable-components.md) |
| 7 | **Form handling** | [forms.md](./forms.md) |
| 8 | **Tables & pagination** | [tables-and-pagination.md](./tables-and-pagination.md) |

---

## Additional documentation

| Document | Description |
|----------|-------------|
| [Backend architecture](./backend-architecture.md) | Inferred NestJS API contracts (external repo) |
| [Modules](./modules.md) | ERP feature areas, routes, implementation status |
| [Missing documentation](./missing-documentation.md) | Gaps, inconsistencies, follow-up items |
| [Project patterns](./project-patterns.md) | Conventions from the Tenant reference module |
| [Module template](./module-template.md) | Blueprint for scaffolding new ERP modules |
| [Tenant module](./modules/tenant.md) | Super-admin tenant CRUD deep dive |
| [Tenant API](./modules/tenant-api.md) | Swagger-derived REST reference for `/tenants` |
| [Tenant implementation plan](./modules/tenant-implementation-plan.md) | Phased plan to ship the tenant module |
| [Documentation backend plan](./modules/documentation-backend-plan.md) | Backend API plan for Documentation module (from frontend screens) |

---

## Quick reference

### Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| Routing | React Router 7 |
| Server state | TanStack Query 5 |
| Client state | Zustand 5 + React Context |
| HTTP | Axios |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS 4 |

### Source layout

```
src/
├── assets/           # Images, logos
├── components/       # Shared UI — layout, templates, widgets, dashboard
├── config/           # Route labels and app config
├── context/          # AuthContext
├── features/         # Domain modules (auth, tenants, hr, sales, …)
├── hooks/            # Shared hooks
├── lib/              # axios, queryClient, utils, superAdminApiClient
├── pages/            # Route-level page components (legacy + active)
├── router/           # Active React Router config (entry: main.tsx)
├── store/            # Zustand stores (auth, ui, theme)
├── styles/           # Brand tokens, global CSS
└── types/            # Shared TypeScript interfaces
```

### Bootstrap

```
main.tsx
  QueryClientProvider
    AuthProvider
      AuthLoadingGate
        RouterProvider → src/router/index.tsx
```

### Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Base URL for the main tenant API |
| `VITE_API_BASE_URL` | Super-admin API base (optional) |
| `VITE_BYPASS_AUTH` | Dev only: mock admin user |
| `VITE_MOCK_API` | Dev only: fixture data when backend unreachable |

See [.env.example](../.env.example) for the committed template.

---

## Key facts

- **No Redux** — use TanStack Query for server data and Zustand for auth/UI persistence.
- **Two HTTP clients** — `axiosInstance` (main ERP) and `superAdminApiClient` (platform admin).
- **Two auth flows** — tenant users (`authStore` + `AuthContext`) vs super-admin (`superAdminAuthStore`).
- **Routing** — single active router in `src/router/index.tsx`; `src/App.tsx` router is unused.
- **Pagination** — only `AuditTable` has full server-side pagination; most lists use cosmetic or no pagination.
