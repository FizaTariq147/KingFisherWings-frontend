# Project Patterns

Conventions observed across the **KingFisher Tech Gold** frontend, derived primarily from the **Tenant module** (`src/features/tenants/`) — the most structurally complete feature — compared against older modules (HR, Management, Customer Service) still in migration.

Use the Tenant module as the **reference implementation** for new work. Legacy patterns are documented so you can recognize and gradually align them.

---

## Pattern maturity at a glance

| Area | Tenant module (target) | Legacy modules (common today) |
|------|------------------------|-------------------------------|
| Location | `src/features/<module>/` | `src/pages/<module>/` with thin `features/` config/services |
| Data fetching | TanStack Query + service layer | `useEffect` + `useState` + stub services |
| State | Zustand (auth only) + React Query cache | Local state in pages |
| Forms | react-hook-form + Zod schema file | Inline inputs, no schema |
| Tables | Dedicated component + callbacks | Inline `<table>` in page file |
| Styling | `rounded-2xl`, `text-navy`, `brandOrange` tokens | `gray-*`, `#0A2942`, `#FF751F` literals |
| Permissions | Route guard (`SuperAdminProtectedRoute`) | `ProtectedRoute` + `PermissionKey` (main app) |

---

## Folder naming conventions

### Feature-first layout (Tenant pattern)

```
src/features/<module>/
├── components/<ComponentName>/   # PascalCase folder, one component per folder
│   ├── <ComponentName>.tsx
│   └── index.ts                  # re-export barrel
├── hooks/                        # camelCase files: useTenants.ts, useTenantMutations.ts
├── pages/                        # PascalCase + Page suffix: TenantListPage.tsx
├── services/                     # camelCase: tenant.service.ts
├── schemas/                      # Zod only (when forms exist): tenant.schema.ts
├── types/                        # module.types.ts or <entity>.types.ts
└── config/                       # optional: *Menu.ts for hub tiles
```

**Naming rules:**

| Artifact | Convention | Example |
|----------|------------|---------|
| Feature folder | lowercase, plural or domain noun | `tenants`, `customers`, `superadmin` |
| Component folder | PascalCase, matches component name | `TenantTable/` |
| Page files | `<Entity><Action>Page.tsx` or `<Entity>ListPage.tsx` | `TenantCreatePage.tsx` |
| Service files | `<entity>.service.ts` | `tenant.service.ts` |
| Hook files | `use<Entity>.ts`, `use<Entity>Mutations.ts` | `useTenantStatistics.ts` |
| Type files | `<entity>.types.ts` | `tenant.types.ts` |
| Config files | `<module>Menu.ts` | `customerServiceMenu.ts` |
| Path alias | `@/` maps to `src/` | `@/components/templates/DetailPageTemplate` |

### Parallel `pages/` directory (legacy)

Most ERP screens still live under `src/pages/<module>/` (e.g. `pages/hr/EmployeesListPage.tsx`). The README describes a target where **route-level pages move into `features/`**; Tenant is ahead of this curve.

**Router convention:** routes are declared in `src/router/index.tsx` and import page components by path. Super-admin routes are nested under `/superadmin/*` when enabled.

### Shared vs module-local

| Shared (cross-module) | Module-local |
|-----------------------|--------------|
| `src/components/ui/` | `src/features/<module>/components/` |
| `src/components/templates/` | — |
| `src/components/layout/` | — |
| `src/components/widgets/` | — |
| `src/hooks/` (auth, audit, sessions) | `src/features/<module>/hooks/` |
| `src/types/` (auth, session) | `src/features/<module>/types/` |

---

## Component structure

### Tenant pattern (preferred)

1. **One component per folder** with a barrel `index.ts`.
2. **Presentational by default** — data and mutations stay in the page or hooks; action menus receive callbacks (`onActivate`, `onDelete`).
3. **Controlled props** — parent owns filter state (`TenantFilters` receives `search` + `onSearchChange`).
4. **No data fetching inside leaf components** — except dashboard widgets (older pattern).

```tsx
// TenantTable — receives data + callbacks, navigates via useNavigate
interface TenantTableProps {
  tenants: Tenant[];
  isLoading?: boolean;
  onActivate: (t: Tenant) => void;
  onDeactivate: (t: Tenant) => void;
  onDelete: (t: Tenant) => void;
  onRestore: (t: Tenant) => void;
}
```

### Internal helpers

Large forms may define **private sub-components in the same file** (`Section`, `Grid`, `Field` in `TenantForm.tsx`). Extract to `components/` only when reused.

### Legacy pattern

Pages like `UserAccessPage.tsx` and `EmployeesListPage.tsx` embed:

- Column definitions as `const columns = [...]`
- Inline `Pagination` function components
- Filter grids and `<table>` markup directly in the page

### Shared UI library

`src/components/ui/` provides composable primitives:

- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `Button`, `Badge`, `Card`, `Input`, `Modal`

Tenant module uses **raw `<table>`** with Tailwind; `CustomerList.tsx` uses the **shared `Table` primitives** — both coexist. Prefer shared `Table` for main-app modules using design tokens (`var(--color-neutral-*)`).

### Templates

Cross-cutting page skeletons in `src/components/templates/`:

| Template | Use case |
|----------|----------|
| `ListPageTemplate` | Generic searchable list (not yet adopted by Tenant) |
| `DetailPageTemplate` | Tabbed detail + action bar — **used by `TenantDetailPage`** |
| `StepFormTemplate` | Multi-step wizards |
| `DocumentsTabTemplate` | Document tabs on entity detail |

---

## Page structure

### Tenant CRUD pages

| Concern | Pattern |
|---------|---------|
| Layout wrapper | `className="p-6 space-y-6"` or `p-6 max-w-3xl mx-auto` for forms |
| Header | Title + subtitle + primary CTA (e.g. “+ New Tenant”) |
| Data | Hooks at top of component (`useTenantsList`, `useTenantStatistics`) |
| Mutations | Destructure mutation hooks; pass `.mutate` / `.mutateAsync` to children |
| Navigation | `useNavigate()` — explicit paths (`/superadmin/tenants/new`) |
| Loading | Early return: `<div>Loading…</div>` or table `isLoading` row |
| Confirmations | `window.confirm()` in **page**, not in `TenantActionMenu` |

### Menu hub pages (main app)

```tsx
// CustomerServiceMenuPage pattern
export default function CustomerServiceMenuPage() {
  const navigate = useNavigate();
  return (
    <div>
      {/* breadcrumb header */}
      <div className="grid ...">
        {customerServiceMenu.map((tile) => (
          <MenuTileCard key={tile.id} tile={tile} onClick={navigate} />
        ))}
      </div>
    </div>
  );
}
```

Menu config lives in `features/<module>/config/*Menu.ts` as `MenuTile[]` (`id`, `title`, `description`, `icon`, `iconColor`, `path`).

### Legacy list pages

- White card: `bg-white border border-gray-200 rounded-md`
- Header row: title left, Back + Create buttons right
- Filter section, toolbar (search, rows-per-page), then `<table>`
- `navigate(-1)` for Back

### Super-admin shell

Tenant pages render inside `SuperAdminShell` → `SuperAdminSidebar` + `SuperAdminTopbar` + `<Outlet />`, not the main `AppShell`.

---

## Redux patterns

**This project does not use Redux.** There are no Redux Toolkit slices, reducers, or `react-redux` providers.

### Actual state patterns

| Layer | Library | Scope | Tenant example |
|-------|---------|-------|----------------|
| **Auth session** | Zustand + `persist` | Super-admin JWT | `superAdminAuthStore` |
| **Server cache** | TanStack Query | Lists, detail, stats | `useTenantsList`, `useTenant` |
| **Mutations** | TanStack Query `useMutation` | Create/update/lifecycle | `useCreateTenant`, `useActivateTenant` |
| **UI chrome** | Zustand + `persist` | Sidebar, theme | `uiStore`, `themeStore` (main app) |
| **RBAC user** | React Context | Permissions, role | `AuthContext` (main app only) |
| **Local UI** | `useState` | Filters, dropdowns | `search`, `status` in `TenantListPage` |

### Zustand store shape (convention)

```typescript
interface StoreState {
  // state fields
  // action methods inline in create()
}
export const useXStore = create<StoreState>()(
  persist(
    (set, get) => ({ /* ... */ }),
    { name: 'storage-key' }
  )
);
```

### TanStack Query key factory (Tenant convention)

```typescript
export const tenantKeys = {
  all: ['superadmin', 'tenants'] as const,
  list: (params) => [...tenantKeys.all, 'list', params] as const,
  detail: (id) => [...tenantKeys.all, 'detail', id] as const,
  statistics: () => [...tenantKeys.all, 'statistics'] as const,
};
```

Mutations call `queryClient.invalidateQueries({ queryKey: tenantKeys.all })` on success.

### Redux → project mapping (if migrating from Redux mental model)

| Redux concept | This project |
|---------------|--------------|
| Slice | Zustand store or Query key namespace |
| Actions / thunks | Zustand methods or `useMutation` / `queryFn` |
| Selectors | `useXStore((s) => s.field)` or `useQuery` result |
| Normalized entity cache | TanStack Query cache (not normalized globally) |

---

## API integration patterns

### Two HTTP clients

| Client | File | Auth | Used by |
|--------|------|------|---------|
| **Main tenant API** | `src/lib/axios.ts` (`axiosInstance`) | `authStore.accessToken` + cookie refresh | Main ERP, auth, audit, widgets |
| **Super-admin API** | `src/lib/superAdminApiClient.ts` | `superAdminAuthStore.accessToken` | Tenant module, super-admin auth |

Env vars: `VITE_API_URL` (main) vs `VITE_API_BASE_URL` (super-admin, fallback `/api`).

### Service layer (Tenant pattern)

```typescript
// tenant.service.ts — thin wrapper, unwraps ApiEnvelope
export const tenantService = {
  async list(params: TenantListParams): Promise<TenantListResult> {
    const res = await superAdminApiClient.get<ApiEnvelope<Tenant[], PaginationMeta>>('/tenants', { params });
    return { tenants: res.data.data, meta: res.data.meta };
  },
  // ...
};
```

**Conventions:**

- One `*.service.ts` object with async methods per resource
- HTTP details hidden from components
- Response unwrapping: `res.data.data` for envelope APIs
- No axios calls inside React components (except legacy hooks/widgets)

### Hook layer

Pages import hooks, not services directly:

```
Page → useTenantsList() → tenantService.list() → superAdminApiClient
```

### Stub service pattern (legacy)

```typescript
// employeeService.ts — placeholder until API exists
export const employeeService = {
  getEmployees: async (): Promise<EmployeeRow[]> => {
    // await fetch('/api/employees') ...
    return [];
  },
};
```

Pages call stubs via `useEffect` — replace with Query + real service when endpoints are ready.

### Alternate / duplicate files (avoid)

Tenant module currently has **two parallel stacks**:

| Active (preferred) | Alternate (stale) |
|--------------------|-------------------|
| `tenant.service.ts` | `tenants.api.ts` (imports missing `@/services/apiClient`) |
| `useTenants.ts` + `useTenantMutations.ts` | `useTenant.ts` (different query keys) |

New work should use **one service + one hook file set** with `tenantKeys` factory.

### Interceptors

- **Main client:** silent refresh on 401, request queue, dev `VITE_MOCK_API` fixtures
- **Super-admin client:** 401 on authenticated session → `logout()` + redirect `/superadmin/login`; wraps errors in `ApiError`

---

## Form handling approach

### Standard stack

| Piece | Library |
|-------|---------|
| Form state | `react-hook-form` |
| Validation | `zod` schemas in `schemas/<entity>.schema.ts` |
| Resolver | `@hookform/resolvers/zod` → `zodResolver(schema)` |
| Types | `z.infer<typeof schema>` exported from schema or re-exported in `types/` |

### Tenant form conventions

1. **Schema split by mode** — `createTenantSchema` vs `updateTenantSchema` (`.omit()` immutable fields).
2. **Single `TenantForm` component** with `mode: 'create' | 'edit'` prop — not a multi-step wizard.
3. **Register inputs** via `{...register('field')}`; number fields use `{ valueAsNumber: true }`.
4. **Errors** — per-field `errors.field?.message` under inputs; schema messages from Zod.
5. **Submit** — parent passes `onSubmit`; page wires `mutateAsync` and navigation.
6. **Loading** — `isSubmitting` disables submit button; label switches to “Saving…”.

```tsx
const schema = mode === 'create' ? createTenantSchema : updateTenantSchema;
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  defaultValues,
});
```

### Super-admin login (same stack)

`SuperAdminLoginPage` uses inline `loginSchema` + `useMutation` + `setError('root', …)` for API errors.

### Main app login

`LoginPage` uses Zod + `useAuthStore().login()` with store-level `error` string (not react-hook-form root error).

### Legacy forms

Many list pages have **no form library** — raw `<input>` / `<select>` with local state or uncontrolled defaults.

---

## Table implementation approach

### Three patterns in the codebase

#### 1. Dedicated table component (Tenant — preferred for complex lists)

- `TenantTable.tsx` owns markup, loading/empty rows, row click navigation
- Parent supplies data + mutation callbacks
- Status rendered via `TenantStatusBadge`
- Actions via `TenantActionMenu` (kebab / dropdown)

#### 2. Shared `Table` primitives (design-system — preferred for main app)

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
```

Used in `CustomerList.tsx`, `DashboardPage.tsx`. Supports `mono` cells, hover rows, CSS variables.

#### 3. Inline table in page (legacy)

- `const columns = ['', 'Name', ...]` at top of page file
- Full `<table className="w-full text-sm">` in JSX
- Custom pagination div at bottom
- Row actions as icon buttons in last column

### Common table UX (legacy lists)

- Rows-per-page `<select>` (local state `'10'`, `'5'`)
- Search input + Search button in toolbar
- `ChevronLeft` Back in header
- Empty state: often just zero rows, no dedicated component

### Tenant table UX

- Loading: single row `colSpan={7}` “Loading…”
- Empty: “No tenants found”
- Row hover: `hover:bg-surface`
- Primary navigation: click company cell → detail route

### `ListPageTemplate`

Generic template with `ListColumn<T>`, status tabs, search slot — available but **not used by Tenant**. Consider adopting for new list pages instead of inline tables.

---

## Error handling approach

### By layer

| Layer | Pattern | Example |
|-------|---------|---------|
| **HTTP client** | Axios interceptor; super-admin wraps `ApiError` | `superAdminApiClient` response interceptor |
| **Auth store** | `extractErrorMessage(err)` maps NestJS status/body to user strings | `authStore.login` catch |
| **React Query mutation** | `onError` callback; form `setError('root')` | `SuperAdminLoginPage` |
| **Custom hooks** | `error: string \| null` state; generic message on catch | `useAuditLogs`, `useSessions`, `useLoginSecurity` |
| **Optimistic updates** | Revert on failure + set error message | `useHomepageConfig.saveConfig` |
| **UI display** | Inline alert / field error / `role="alert"` | Red banner on login; `text-rose-600` under fields |
| **Confirm destructive actions** | `window.confirm()` in page before `mutate` | Tenant deactivate/delete |
| **Dev fallback** | `VITE_MOCK_API` returns fixtures when network fails | `axios.ts` dev interceptor |

### What is **not** used globally

- No React Error Boundaries in module code
- No toast/notification library (sonner, etc.)
- No centralized error reporting (Sentry) visible in frontend
- Tenant list mutations do not surface API error messages to the user (fire-and-forget `mutate`)

### Recommended pattern (from best examples)

```typescript
// Mutation + user-visible error
onError: (error: unknown) => {
  const message = error instanceof ApiError ? error.message : 'Operation failed.';
  setError('root', { message });
}

// Query hook
.catch(() => setError('Failed to load sessions.'))
```

---

## Permission handling approach

### Main ERP app (tenant users)

| Mechanism | File | Behavior |
|-----------|------|----------|
| **Route guard** | `ProtectedRoute.tsx` | `isAuthenticated` → else `/login`; optional `requirePermissions`, `requireAnyPermission`, `requireRole` |
| **User + permissions** | `AuthContext.tsx` | `GET /api/auth/me` → `user.permissions[]`, `user.role.slug` |
| **Nav filtering** | `Sidebar.tsx` | Each item has `permission: PermissionKey`; hidden if `!hasPermission` |
| **403 page** | `/403` | Shown when route guard denies access |
| **Dev bypass** | `VITE_BYPASS_AUTH` | All permissions return `true` in development |

```tsx
// Router — nested permission gate
<ProtectedRoute requirePermissions={['menu_finance']}>
  { /* finance routes */ }
</ProtectedRoute>

<ProtectedRoute requireRole="admin">
  { /* masters routes */ }
</ProtectedRoute>
```

Permission keys are defined in `src/types/auth.types.ts` and must match backend JWT payload.

### Super-admin / Tenant module

| Mechanism | Behavior |
|-----------|----------|
| **Separate auth** | `SuperAdminProtectedRoute` checks `superAdminAuthStore.isAuthenticated` only |
| **No PermissionKey** | No per-menu `menu_*` checks; binary logged-in vs not |
| **No role matrix** | All super-admin users can activate/delete tenants in UI |
| **API enforcement** | Backend expected to reject unauthorized super-admin calls (401) |

### Component-level permissions

Rare in codebase. Financial widgets use `financialVisibility` from homepage config (not RBAC). `RoleBadge` is display-only.

### Tenant module implication

When building under `/superadmin/*`, use **`SuperAdminProtectedRoute`** — do not reuse `useAuth()` or `ProtectedRoute` from the main app.

---

## Quick checklist for new modules

Follow the Tenant module when adding a feature:

- [ ] `src/features/<module>/` with `components/`, `hooks/`, `pages/`, `services/`, `types/`
- [ ] Add `schemas/` if the module has forms
- [ ] Service object + TanStack Query hooks with key factory
- [ ] Pages orchestrate hooks; components stay presentational
- [ ] Forms: react-hook-form + Zod
- [ ] Tables: dedicated component or `components/ui/Table`
- [ ] Errors: `ApiError` / hook `error` state / form root error
- [ ] Permissions: `ProtectedRoute` + `PermissionKey` (main app) or super-admin guard
- [ ] Register routes in `src/router/index.tsx`
- [ ] Menu hub: `config/<module>Menu.ts` + `MenuTileCard` if applicable

---

## Related documentation

- [Tenant module reference](./modules/tenant.md)
- [Frontend architecture](./frontend-architecture.md)
- [State management](./state-management.md)
- [Authentication](./authentication.md)
- [Missing documentation](./missing-documentation.md)
