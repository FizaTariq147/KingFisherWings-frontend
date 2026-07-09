# ERP Module Blueprint

Reusable template for new KingFisher Tech Gold modules, based on the **Tenant module** (`src/features/tenants/`). Copy this structure, replace placeholders, and wire routes in `src/router/index.tsx`.

**Placeholders used below:**

| Placeholder | Replace with | Example |
|-------------|--------------|---------|
| `<module>` | lowercase feature folder | `quotations`, `employees` |
| `<Entity>` | PascalCase entity name | `Quotation`, `Employee` |
| `<entity>` | camelCase | `quotation`, `employee` |
| `<entities>` | plural camelCase | `quotations`, `employees` |
| `menu_<module>` | `PermissionKey` for sidebar | `menu_quotations` |

---

## 1. Recommended folder structure

```
src/features/<module>/
├── components/
│   ├── <Entity>Table/
│   │   ├── <Entity>Table.tsx
│   │   └── index.ts
│   ├── <Entity>Form/
│   │   ├── <Entity>Form.tsx
│   │   └── index.ts
│   ├── <Entity>Filters/
│   │   ├── <Entity>Filters.tsx
│   │   └── index.ts
│   ├── <Entity>StatusBadge/          # optional
│   │   ├── <Entity>StatusBadge.tsx
│   │   └── index.ts
│   └── <Entity>ActionMenu/           # optional — row kebab menu
│       ├── <Entity>ActionMenu.tsx
│       └── index.ts
├── config/
│   └── <module>Menu.ts               # optional — hub tile menu
├── hooks/
│   ├── use<Entities>.ts              # query keys + list/detail queries
│   ├── use<Entity>Mutations.ts         # create/update/delete mutations
│   └── use<Entity>Statistics.ts      # optional — dashboard KPIs
├── pages/
│   ├── <Entity>ListPage.tsx
│   ├── <Entity>CreatePage.tsx
│   ├── <Entity>EditPage.tsx
│   ├── <Entity>DetailPage.tsx        # optional
│   └── <Module>MenuPage.tsx          # optional — tile hub
├── schemas/
│   └── <entity>.schema.ts
├── services/
│   └── <entity>.service.ts
└── types/
    └── <entity>.types.ts
```

### Optional shared assets (outside the feature folder)

```
src/components/templates/     # ListPageTemplate, DetailPageTemplate
src/components/ui/            # Table, Button, Badge, Input
src/router/index.tsx          # route registration
```

### Reference: Tenant module mapping

| Blueprint slot | Tenant implementation |
|----------------|----------------------|
| `<Entity>Table` | `TenantTable` |
| `<Entity>Form` | `TenantForm` |
| `<Entity>Filters` | `TenantFilters` |
| `use<Entities>.ts` | `useTenants.ts` |
| `use<Entity>Mutations.ts` | `useTenantMutations.ts` |
| `<entity>.service.ts` | `tenant.service.ts` |
| `<entity>.schema.ts` | `tenant.schema.ts` |

---

## 2. Required files

Minimum set for a standard CRUD module:

| # | File | Purpose |
|---|------|---------|
| 1 | `types/<entity>.types.ts` | Entity interface, list params, DTO aliases |
| 2 | `schemas/<entity>.schema.ts` | Zod create/update schemas |
| 3 | `services/<entity>.service.ts` | HTTP calls (no React) |
| 4 | `hooks/use<Entities>.ts` | Query key factory + `useQuery` hooks |
| 5 | `hooks/use<Entity>Mutations.ts` | `useMutation` hooks + cache invalidation |
| 6 | `components/<Entity>Form/<Entity>Form.tsx` | Shared create/edit form |
| 7 | `components/<Entity>Table/<Entity>Table.tsx` | List table (or use `ListPageTemplate`) |
| 8 | `pages/<Entity>ListPage.tsx` | Orchestrates list + filters + mutations |
| 9 | `pages/<Entity>CreatePage.tsx` | Create flow |
| 10 | `pages/<Entity>EditPage.tsx` | Edit flow |
| 11 | Router entries in `src/router/index.tsx` | Paths + permission guards |

### Optional files

| File | When to add |
|------|-------------|
| `config/<module>Menu.ts` | Module has a tile hub (`/quotations`, `/hr`) |
| `pages/<Entity>DetailPage.tsx` | Read-only detail with tabs/actions |
| `components/<Entity>ActionMenu/` | Row-level actions beyond View/Edit |
| `hooks/use<Entity>Statistics.ts` | KPI cards on list or dashboard |

### Barrel exports

Every component folder includes `index.ts`:

```typescript
// components/<Entity>Table/index.ts
export * from './<Entity>Table';
```

---

## 3. State management setup

> **This project does not use Redux.** Use **TanStack Query** for server state and **Zustand** only when the module needs client state beyond React Query (most modules do not).

### TanStack Query — query keys (`hooks/use<Entities>.ts`)

```typescript
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { <entity>Service } from '../services/<entity>.service';
import type { <Entity>ListParams } from '../types/<entity>.types';

export const <entity>Keys = {
  all: ['<module>', '<entities>'] as const,
  list: (params: <Entity>ListParams) => [...<entity>Keys.all, 'list', params] as const,
  detail: (id: string) => [...<entity>Keys.all, 'detail', id] as const,
  statistics: () => [...<entity>Keys.all, 'statistics'] as const,
};

export function use<Entities>(params: <Entity>ListParams) {
  return useQuery({
    queryKey: <entity>Keys.list(params),
    queryFn: () => <entity>Service.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function use<Entity>(id: string) {
  return useQuery({
    queryKey: <entity>Keys.detail(id),
    queryFn: () => <entity>Service.getById(id),
    enabled: !!id,
  });
}
```

### TanStack Query — mutations (`hooks/use<Entity>Mutations.ts`)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { <entity>Service } from '../services/<entity>.service';
import type { Create<Entity>Dto, Update<Entity>Dto } from '../types/<entity>.types';
import { <entity>Keys } from './use<Entities>';

export function use<Entity>Mutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: <entity>Keys.all });

  const create<Entity> = useMutation({
    mutationFn: (dto: Create<Entity>Dto) => <entity>Service.create(dto),
    onSuccess: invalidateAll,
  });

  const update<Entity> = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Update<Entity>Dto }) =>
      <entity>Service.update(id, dto),
    onSuccess: invalidateAll,
  });

  const delete<Entity> = useMutation({
    mutationFn: (id: string) => <entity>Service.delete(id),
    onSuccess: invalidateAll,
  });

  return { create<Entity>, update<Entity>, delete<Entity> };
}
```

### Zustand (only if needed)

Most ERP modules **do not** need a module-specific Zustand store. Use Zustand only for:

- Cross-page UI state that must persist (already covered by `uiStore`, `themeStore`)
- Module-specific wizard state that cannot live in URL or form state

If required:

```typescript
// src/features/<module>/store/<module>UiStore.ts
import { create } from 'zustand';

interface <Module>UiState {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}

export const use<Module>UiStore = create<<Module>UiState>()((set) => ({
  selectedIds: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),
}));
```

### Redux → this project (mental model)

| If you need… | Use… |
|--------------|------|
| Fetch list/detail | `useQuery` + `<entity>Keys` |
| Create/update/delete | `useMutation` + `invalidateQueries` |
| Auth / permissions | `useAuth()` (Context) — not per module |
| Sidebar collapse | `useUIStore()` — global |

---

## 4. API service setup

### Main ERP modules — use `axiosInstance`

```typescript
// services/<entity>.service.ts
import { axiosInstance } from '@/lib/axios';
import type {
  <Entity>,
  <Entity>ListParams,
  Create<Entity>Dto,
  Update<Entity>Dto,
} from '../types/<entity>.types';

export interface <Entity>ListResult {
  items: <Entity>[];
  total: number;
  page: number;
  pageSize: number;
}

export const <entity>Service = {
  async list(params: <Entity>ListParams): Promise<<Entity>ListResult> {
    const { data } = await axiosInstance.get<<Entity>ListResult>('/api/<entities>', { params });
    return data;
  },

  async getById(id: string): Promise<<Entity>> {
    const { data } = await axiosInstance.get<<Entity>>(`/api/<entities>/${id}`);
    return data;
  },

  async create(dto: Create<Entity>Dto): Promise<<Entity>> {
    const { data } = await axiosInstance.post<<Entity>>('/api/<entities>', dto);
    return data;
  },

  async update(id: string, dto: Update<Entity>Dto): Promise<<Entity>> {
    const { data } = await axiosInstance.patch<<Entity>>(`/api/<entities>/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/api/<entities>/${id}`);
  },
};
```

### Super-admin / envelope API — use `superAdminApiClient`

If the backend returns `{ data: T, meta?: … }` (Tenant pattern):

```typescript
import { superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';

async list(params) {
  const res = await superAdminApiClient.get<ApiEnvelope<<Entity>[]>>(`/<entities>`, { params });
  return { items: res.data.data, meta: res.data.meta };
}
```

### Service rules

1. **No React imports** in service files.
2. **One exported object** (`<entity>Service`) with async methods.
3. **Unwrap envelopes** in the service, not in components.
4. **Path prefix** — main app uses `/api/...`; confirm `VITE_API_URL` includes or excludes `/api`.
5. Pages and components call **hooks**, never services directly.

---

## 5. List page template

Two supported approaches. Prefer **A** for new modules (uses shared template). Use **B** when you need a custom table (Tenant style).

### A. `ListPageTemplate` + page orchestrator (recommended)

```tsx
// pages/<Entity>ListPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPageTemplate } from '@/components/templates/ListPageTemplate';
import { use<Entities> } from '../hooks/use<Entities>';
import { use<Entity>Mutations } from '../hooks/use<Entity>Mutations';
import { <Entity>StatusBadge } from '../components/<Entity>StatusBadge';
import type { <Entity> } from '../types/<entity>.types';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function <Entity>ListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const { data, isLoading, isError, error, refetch } = use<Entities>({
    search: search || undefined,
    status: status === 'all' ? undefined : status,
  });

  const { delete<Entity> } = use<Entity>Mutations();

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-sm text-rose-600">{(error as Error)?.message ?? 'Failed to load records.'}</p>
        <button onClick={() => refetch()} className="mt-2 text-sm text-brandOrange underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <ListPageTemplate<<Entity>>
      title="<Entities>"
      subtitle="Short module description"
      data={data?.items ?? []}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      onRowClick={(row) => navigate(`/<module>/<entities>/${row.id}`)}
      primaryAction={{ label: 'New <Entity>', onClick: () => navigate(`/<module>/<entities>/new`) }}
      statusTabs={STATUS_TABS}
      activeStatus={status}
      onStatusChange={setStatus}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search…"
      emptyLabel="No <entities> found"
      columns={[
        { key: 'code', label: 'Code', className: 'font-mono text-xs' },
        { key: 'name', label: 'Name' },
        {
          key: 'status',
          label: 'Status',
          render: (row) => <<Entity>StatusBadge entity={row} />,
        },
        {
          key: 'actions',
          label: '',
          render: (row) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Delete this record?')) delete<Entity>.mutate(row.id);
              }}
              className="text-xs text-rose-600 hover:underline"
            >
              Delete
            </button>
          ),
        },
      ]}
    />
  );
}
```

### B. Dedicated table component (Tenant pattern)

Split into:

- `<Entity>ListPage.tsx` — state, hooks, layout header
- `<Entity>Filters.tsx` — controlled search/status
- `<Entity>Table.tsx` — presentational table + `isLoading` / empty rows

See `src/features/tenants/pages/TenantListPage.tsx` for the full example.

### List page checklist

- [ ] Filter state (`search`, `status`) owned by page
- [ ] `placeholderData: keepPreviousData` on list query (no flicker on filter change)
- [ ] Primary CTA navigates to `/new`
- [ ] Destructive actions confirmed in **page**, not in action menu
- [ ] Error branch with retry before rendering table

---

## 6. Create / Edit form template

### Schema-driven single form (Tenant pattern)

One `<Entity>Form` component with `mode: 'create' | 'edit'`.

```tsx
// components/<Entity>Form/<Entity>Form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { create<Entity>Schema, update<Entity>Schema } from '../../schemas/<entity>.schema';
import type { Create<Entity>FormValues } from '../../types/<entity>.types';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandOrange/30 focus:border-brandOrange';

interface <Entity>FormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Create<Entity>FormValues>;
  onSubmit: (values: Create<Entity>FormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
}

export function <Entity>Form({ mode, defaultValues, onSubmit, isSubmitting, error }: <Entity>FormProps) {
  const schema = mode === 'create' ? create<Entity>Schema : update<Entity>Schema;
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {error && (
        <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {error}
        </div>
      )}

      {/* Section example */}
      <section>
        <h3 className="text-sm font-semibold text-navy mb-3 pb-2 border-b border-slate-100">
          General
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <input {...register('name')} className={inputClass} />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
          </div>
          {/* create-only fields */}
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Code</label>
              <input {...register('code')} className={`${inputClass} font-mono uppercase`} />
              {errors.code && <p className="mt-1 text-xs text-rose-600">{errors.code.message}</p>}
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brandOrange hover:bg-brandOrange-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5"
        >
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
```

### Create page

```tsx
// pages/<Entity>CreatePage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { <Entity>Form } from '../components/<Entity>Form';
import { use<Entity>Mutations } from '../hooks/use<Entity>Mutations';

export default function <Entity>CreatePage() {
  const navigate = useNavigate();
  const { create<Entity> } = use<Entity>Mutations();
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-navy mb-6">New <entity></h1>
      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <<Entity>Form
          mode="create"
          isSubmitting={create<Entity>.isPending}
          error={formError}
          onSubmit={async (values) => {
            setFormError(null);
            try {
              const created = await create<Entity>.mutateAsync(values);
              navigate(`/<module>/<entities>/${created.id}`);
            } catch (e) {
              setFormError(e instanceof Error ? e.message : 'Failed to create record.');
            }
          }}
        />
      </div>
    </div>
  );
}
```

### Edit page

```tsx
// pages/<Entity>EditPage.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { <Entity>Form } from '../components/<Entity>Form';
import { use<Entity> } from '../hooks/use<Entities>';
import { use<Entity>Mutations } from '../hooks/use<Entity>Mutations';

export default function <Entity>EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = use<Entity>(id!);
  const { update<Entity> } = use<Entity>Mutations();
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) return <div className="p-6 text-sm text-slate-400">Loading…</div>;
  if (isError || !data) return <div className="p-6 text-sm text-rose-600">Record not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-navy mb-6">Edit {data.name}</h1>
      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <<Entity>Form
          mode="edit"
          defaultValues={data}
          isSubmitting={update<Entity>.isPending}
          error={formError}
          onSubmit={async (values) => {
            setFormError(null);
            try {
              await update<Entity>.mutateAsync({ id: id!, dto: values });
              navigate(`/<module>/<entities>/${id}`);
            } catch (e) {
              setFormError(e instanceof Error ? e.message : 'Failed to save changes.');
            }
          }}
        />
      </div>
    </div>
  );
}
```

### Detail page (optional)

Use `DetailPageTemplate` from `@/components/templates/DetailPageTemplate` — see `TenantDetailPage.tsx`.

---

## 7. Validation structure

### File layout

```
schemas/<entity>.schema.ts   ← Zod definitions (source of truth)
types/<entity>.types.ts      ← re-export inferred types + entity interface
```

### Schema file

```typescript
// schemas/<entity>.schema.ts
import { z } from 'zod';

export const create<Entity>Schema = z.object({
  code: z.string().regex(/^[A-Z0-9-]{3,20}$/, 'Uppercase letters, numbers, hyphens only'),
  name: z.string().min(1, 'Required'),
  email: z.string().email('Must be a valid email'),
  status: z.enum(['active', 'inactive']),
  // optional fields
  notes: z.string().optional().or(z.literal('')),
  amount: z.number().int().min(0),
});

export type Create<Entity>FormValues = z.infer<typeof create<Entity>Schema>;

// Omit immutable fields for edit
export const update<Entity>Schema = create<Entity>Schema.omit({
  code: true, // set once at creation
});

export type Update<Entity>FormValues = z.infer<typeof update<Entity>Schema>;
```

### Types file

```typescript
// types/<entity>.types.ts
export type { Create<Entity>FormValues, Update<Entity>FormValues } from '../schemas/<entity>.schema';
import type { Create<Entity>FormValues } from '../schemas/<entity>.schema';

export interface <Entity> extends Create<Entity>FormValues {
  id: string;
  created_at: string;
  updated_at: string;
}

export type Create<Entity>Dto = Create<Entity>FormValues;
export type Update<Entity>Dto = Update<Entity>FormValues;

export interface <Entity>ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
```

### Validation rules (conventions)

| Rule | Pattern |
|------|---------|
| Required strings | `.min(1, 'Required')` |
| Optional empty | `.optional().or(z.literal(''))` |
| Enums | `z.enum([...])` matching backend |
| Codes | Uppercase regex at create; omitted on update |
| Numbers in forms | `register('field', { valueAsNumber: true })` |
| URLs | `.url().optional().or(z.literal(''))` |
| Backend sync | Enum values must match API/Swagger exactly |

---

## 8. Permission handling

### Main ERP modules (tenant users)

**1. Add `PermissionKey` in `src/types/auth.types.ts`** (must match backend JWT):

```typescript
export type PermissionKey =
  | 'menu_<module>'
  // ...existing keys
```

**2. Register sidebar item in `src/components/layout/Sidebar.tsx`:**

```typescript
{ label: '<Module>', path: '/<module>', Icon: SomeIcon, permission: 'menu_<module>' },
```

**3. Wrap routes in `src/router/index.tsx`:**

```tsx
// Module hub + all child routes
{
  element: <ProtectedRoute requirePermissions={['menu_<module>']} />,
  children: [
    { path: '/<module>', element: <<Module>MenuPage /> },
    { path: '/<module>/<entities>', element: <<Entity>ListPage /> },
    { path: '/<module>/<entities>/new', element: <<Entity>CreatePage /> },
    { path: '/<module>/<entities>/:id', element: <<Entity>DetailPage /> },
    { path: '/<module>/<entities>/:id/edit', element: <<Entity>EditPage /> },
  ],
},
```

**4. Optional admin-only sub-routes:**

```tsx
{
  element: <ProtectedRoute requireRole="admin" />,
  children: [
    { path: '/<module>/settings', element: <<Module>SettingsPage /> },
  ],
},
```

**5. In-component checks (rare — prefer route guards):**

```tsx
const { hasPermission } = useAuth();
if (!hasPermission('menu_<module>')) return null;
```

### Super-admin modules (Tenant-style)

Use a **separate auth boundary** — not `useAuth()`:

```tsx
{
  path: '/superadmin',
  element: <SuperAdminProtectedRoute />,
  children: [
    { element: <SuperAdminShell />, children: [ /* module routes */ ] },
  ],
}
```

### Permission checklist

- [ ] `PermissionKey` added and synced with backend
- [ ] Sidebar entry with matching permission
- [ ] Routes wrapped in `ProtectedRoute` (or `SuperAdminProtectedRoute`)
- [ ] 403 route (`/403`) reachable when denied
- [ ] No hard-coded role checks scattered in components

---

## 9. Loading and error states

### Standard states per surface

| Surface | Loading | Empty | Error | Success feedback |
|---------|---------|-------|-------|------------------|
| **List page** | `isLoading` → template loading row or skeleton | `data.length === 0` → “No records found” | `isError` → message + Retry | N/A |
| **Edit page** | Early return “Loading…” | N/A | “Record not found” if missing | Navigate to detail |
| **Create page** | Button `isSubmitting` → “Saving…” | N/A | `formError` banner | Navigate to detail |
| **Mutations** | `mutation.isPending` on button | N/A | `try/catch` or `onError` → `formError` | Redirect or invalidate query |
| **Detail page** | Early return “Loading…” | N/A | Not found message | Action confirms via `window.confirm` |

### List loading (Query)

```tsx
const { data, isLoading, isError, error, refetch, isFetching } = use<Entities>(params);

// isLoading  — first fetch, no cached data
// isFetching — background refetch (optional subtle indicator)
```

### Form loading

```tsx
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Saving…' : 'Save changes'}
</button>
```

### Error display patterns

```tsx
// Query-level (list)
if (isError) {
  return (
    <div className="p-6" role="alert">
      <p className="text-sm text-rose-600">
        {(error as Error)?.message ?? 'Failed to load data.'}
      </p>
      <button type="button" onClick={() => refetch()} className="mt-2 text-sm text-brandOrange">
        Retry
      </button>
    </div>
  );
}

// Form-level (mutation)
{formError && (
  <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
    {formError}
  </div>
)}

// Field-level (Zod)
{errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
```

### Auth-gated loading (main app)

`ProtectedRoute` shows `AppShellSkeleton` while `useAuth().isLoading` is true — module pages do not need to duplicate this.

### Initial session gate

`AuthLoadingGate` in `main.tsx` handles “restoring session” before router renders — module code should not reimplement.

### Mutation error from API

```typescript
// Prefer typed errors when using superAdminApiClient
import { ApiError } from '@/lib/superAdminApiClient';

catch (e) {
  const message = e instanceof ApiError ? e.message : 'Operation failed.';
  setFormError(message);
}
```

### Destructive actions

Always confirm in the **page** before calling `mutate`:

```typescript
if (window.confirm('Delete this record? This can be restored later.')) {
  delete<Entity>.mutate(id);
}
```

---

## 10. Router registration (final step)

```tsx
// src/router/index.tsx
import <Entity>ListPage from '@/features/<module>/pages/<Entity>ListPage';
import <Entity>CreatePage from '@/features/<module>/pages/<Entity>CreatePage';
import <Entity>EditPage from '@/features/<module>/pages/<Entity>EditPage';
import <Entity>DetailPage from '@/features/<module>/pages/<Entity>DetailPage';

// Inside ProtectedRoute > AppShell children:
{
  element: <ProtectedRoute requirePermissions={['menu_<module>']} />,
  children: [
    { path: '/<module>/<entities>', element: <<Entity>ListPage /> },
    { path: '/<module>/<entities>/new', element: <<Entity>CreatePage /> },
    { path: '/<module>/<entities>/:id', element: <<Entity>DetailPage /> },
    { path: '/<module>/<entities>/:id/edit', element: <<Entity>EditPage /> },
  ],
},
```

---

## 11. New module checklist

Copy this checklist when scaffolding a module:

```
[ ] Create src/features/<module>/ folder tree
[ ] types/<entity>.types.ts
[ ] schemas/<entity>.schema.ts (create + update)
[ ] services/<entity>.service.ts
[ ] hooks/use<Entities>.ts (query keys)
[ ] hooks/use<Entity>Mutations.ts
[ ] components/<Entity>Form/
[ ] components/<Entity>Table/ OR use ListPageTemplate
[ ] pages/<Entity>ListPage.tsx
[ ] pages/<Entity>CreatePage.tsx
[ ] pages/<Entity>EditPage.tsx
[ ] PermissionKey in auth.types.ts + Sidebar entry
[ ] Routes in router/index.tsx with ProtectedRoute
[ ] Loading, empty, and error states on list + forms
[ ] Confirm dialogs on destructive actions
[ ] Manual test: list → create → edit → delete
```

---

## Related documentation

- [Project patterns](./project-patterns.md) — conventions vs legacy code
- [Tenant module](./modules/tenant.md) — full reference implementation
- [Authentication](./authentication.md) — RBAC and route guards
- [State management](./state-management.md) — Query + Zustand details
