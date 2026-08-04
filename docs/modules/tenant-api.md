# Tenant Module — API Reference

API documentation for the **Tenants (Super Admin)** module, derived from the live Swagger spec:

- **Swagger UI:** [https://kingfisherwings-backend.onrender.com/docs](https://kingfisherwings-backend.onrender.com/docs)
- **OpenAPI JSON:** [https://kingfisherwings-backend.onrender.com/docs-json](https://kingfisherwings-backend.onrender.com/docs-json)
- **API title:** KingFisher Wings ERP API v1.0 (OAS 3.0)
- **Base URL:** `https://kingfisherwings-backend.onrender.com` (configure via `VITE_API_BASE_URL` in the frontend)

---

## Overview

| Item | Detail |
|------|--------|
| **Swagger tag** | `Tenants (Super Admin)` |
| **Endpoints** | 9 operations under `/tenants` |
| **Auth for `/tenants/*`** | Bearer JWT (platform super admin) |
| **Side effect on create** | Provisions a `TENANT_ADMIN` owner user for the new workspace |

Related **Auth** endpoints used by the tenant lifecycle (login as tenant, change tenant password) are documented in [§ Related auth endpoints](#related-auth-endpoints).

---

## Authentication requirements

### Calling `/tenants/*` endpoints

| Requirement | Value |
|-------------|-------|
| **Scheme** | HTTP Bearer (`Authorization: Bearer <JWT>`) |
| **Principal** | Platform **super admin** (not a tenant staff user) |
| **Obtain token** | `POST /auth/super-admin/login` (see below) |

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

All nine tenant CRUD/lifecycle endpoints declare `"security": [{ "bearer": [] }]`.

### Prerequisite: Super admin login

Not part of the `Tenants (Super Admin)` tag, but required to call tenant APIs.

| | |
|---|---|
| **Endpoint name** | Super admin login |
| **Method** | `POST` |
| **Path** | `/auth/super-admin/login` |
| **Authentication** | None (public) |
| **Swagger tag** | `Auth` |

**Request body** (`SuperAdminLoginDto`):

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | `string` | Yes | Valid email format (per NestJS `@IsEmail`) |
| `password` | `string` | Yes | `minLength: 1` |

**Response (Swagger):** `200` — body schema **not defined** in OpenAPI.

**Frontend expectation** (`superAdminAuth.service.ts`):

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "firstName": "string",
      "lastName": "string"
    },
    "access_token": "jwt",
    "refresh_token": "jwt"
  }
}
```

> **Path note:** The frontend currently calls `/auth/superadmin/login` (no hyphen). Swagger documents `/auth/super-admin/login`. Confirm the canonical path with the backend team.

---

## Response envelope (frontend convention)

Swagger does **not** define response schemas for most tenant endpoints. The frontend `superAdminApiClient` expects an envelope:

```typescript
interface ApiEnvelope<T> {
  data: T;
  message?: string;
  success?: boolean;
  meta?: PaginationMetaResponse;  // list endpoints only
}
```

**Inferred tenant entity** (from frontend `Tenant` type — not in OpenAPI):

```typescript
interface Tenant {
  // All CreateTenantDto fields, plus:
  id: string;
  created_at: string;      // ISO date-time
  updated_at: string;
  deleted_at?: string | null;
}
```

**Inferred statistics** (from frontend `TenantStatistics`):

```typescript
interface TenantStatistics {
  total: number;
  active: number;
  inactive: number;
  trial: number;
  mrr: number;
}
```

**Pagination meta** (`PaginationMetaResponse` — defined in OpenAPI, used by list responses):

| Field | Type | Required |
|-------|------|----------|
| `page` | `number` | Yes |
| `limit` | `number` | Yes |
| `total` | `number` | Yes |
| `totalPages` | `number` | Yes |

---

## Shared schemas

### CreateTenantDto

Used by: `POST /tenants`

| Field | Type | Required (Swagger) | Validation rules |
|-------|------|---------------------|------------------|
| `code` | `string` | **Yes** | `minLength: 3`, `maxLength: 20` |
| `name` | `string` | **Yes** | `minLength: 3`, `maxLength: 200` |
| `display_name` | `string` | No | `minLength: 3`, `maxLength: 200` |
| `slug` | `string` | **Yes** | `minLength: 3`, `maxLength: 100`, `pattern: ^[a-z0-9-]+$` |
| `password` | `string` | **Yes** | Tenant's own login password (no min length in OpenAPI) |
| `admin_first_name` | `string` | No | `minLength: 2`, `maxLength: 100` |
| `admin_last_name` | `string` | No | `minLength: 2`, `maxLength: 100` |
| `domain` | `string` | No | — |
| `website` | `string` | No | — |
| `logo_url` | `string` | No | — |
| `primary_color` | `string` | No | — |
| `language` | `string` | No | — |
| `base_currency` | `string` | No | — |
| `timezone` | `string` | No | — |
| `country_code` | `string` | No | — |
| `financial_year_start` | `number` | No | `minimum: 1`, `maximum: 12` |
| `vat_number` | `string` | No | — |
| `cr_number` | `string` | No | — |
| `address` | `string` | No | — |
| `city` | `string` | No | — |
| `phone` | `string` | No | — |
| `email` | `string` | **Yes** | Admin / contact email |
| `subscription_plan` | `object` | No | **Undocumented** in OpenAPI (no enum/properties) |
| `status` | `object` | No | **Undocumented** in OpenAPI (no enum/properties) |
| `trial_ends` | `string` | No | `format: date-time` |
| `subscription_ends` | `string` | No | `format: date-time` |
| `max_users` | `number` | No | `minimum: 1` |
| `max_branches` | `number` | No | `minimum: 1` |
| `max_storage_gb` | `number` | No | `minimum: 1` |
| `is_active` | `boolean` | No | — |

**Frontend Zod schema** (`tenant.schema.ts`) is stricter — e.g. requires `display_name`, `admin_*`, `address`, enums for `subscription_plan` (`starter` \| `growth` \| `enterprise`) and `status` (`trial` \| `active`). Align frontend validation with backend once `subscription_plan` / `status` are properly typed in OpenAPI.

### UpdateTenantDto

Used by: `PATCH /tenants/{id}`

| Field | Type | Validation |
|-------|------|------------|
| *(empty)* | — | OpenAPI defines `"properties": {}` — **no fields documented** |

**Frontend expectation:** Same fields as create **except** immutable: `code`, `slug`, `password`, `admin_first_name`, `admin_last_name` (see `updateTenantSchema` in `tenant.schema.ts`).

---

## Endpoints

### 1. Create tenant

| | |
|---|---|
| **Endpoint name** | Create a new tenant (also provisions its TENANT_ADMIN owner user) |
| **Operation ID** | `TenantsController_create` |
| **Method** | `POST` |
| **Path** | `/tenants` |
| **Authentication** | Bearer JWT (super admin) |

**Request payload:** `CreateTenantDto` (JSON body) — see [CreateTenantDto](#createtenantdto).

**Query parameters:** None.

**Response:**

| Status | Description | Body schema (Swagger) |
|--------|-------------|----------------------|
| `201` | Tenant created successfully. | **Not defined** |

**Inferred response:** `ApiEnvelope<Tenant>` with the created tenant including `id`, timestamps, and all submitted fields.

**Validation rules:** Request body required. Server validates `CreateTenantDto` constraints. Duplicate `code` / `slug` likely returns `409` (not documented in Swagger).

---

### 2. List tenants

| | |
|---|---|
| **Endpoint name** | Get all tenants |
| **Operation ID** | `TenantsController_findAll` |
| **Method** | `GET` |
| **Path** | `/tenants` |
| **Authentication** | Bearer JWT (super admin) |

**Request payload:** None.

**Query parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | `string` | No | Free-text search (company name or code — per frontend usage) |

> **Frontend-only params:** The frontend also sends `page`, `limit`, and `status` (`active` \| `inactive` \| `deleted`), but these are **not listed in Swagger** for this endpoint. Confirm with backend before relying on them.

**Response:**

| Status | Description | Body schema (Swagger) |
|--------|-------------|----------------------|
| `200` | OK | **Not defined** |

**Inferred response:**

```json
{
  "data": [ /* Tenant[] */ ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

**Validation rules:** None on query beyond `search` type `string`.

---

### 3. Tenant statistics

| | |
|---|---|
| **Endpoint name** | Tenant statistics |
| **Operation ID** | `TenantsController_statistics` |
| **Method** | `GET` |
| **Path** | `/tenants/statistics` |
| **Authentication** | Bearer JWT (super admin) |

**Request payload:** None.

**Query parameters:** None.

**Response:**

| Status | Description | Body schema (Swagger) |
|--------|-------------|----------------------|
| `200` | OK | **Not defined** |

**Inferred response:** `ApiEnvelope<TenantStatistics>`:

```json
{
  "data": {
    "total": 0,
    "active": 0,
    "inactive": 0,
    "trial": 0,
    "mrr": 0
  }
}
```

**Validation rules:** None.

---

### 4. Get tenant by ID

| | |
|---|---|
| **Endpoint name** | Get tenant by ID |
| **Operation ID** | `TenantsController_findOne` |
| **Method** | `GET` |
| **Path** | `/tenants/{id}` |
| **Authentication** | Bearer JWT (super admin) |

**Request payload:** None.

**Path parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Tenant UUID or identifier |

**Query parameters:** None.

**Response:**

| Status | Description | Body schema (Swagger) |
|--------|-------------|----------------------|
| `200` | OK | **Not defined** |

**Inferred response:** `ApiEnvelope<Tenant>`.

**Validation rules:** `id` required in path. Invalid/missing tenant likely `404` (not documented).

---

### 5. Update tenant

| | |
|---|---|
| **Endpoint name** | Update tenant |
| **Operation ID** | `TenantsController_update` |
| **Method** | `PATCH` |
| **Path** | `/tenants/{id}` |
| **Authentication** | Bearer JWT (super admin) |

**Request payload:** `UpdateTenantDto` (JSON body) — currently **empty in OpenAPI**; see [UpdateTenantDto](#updatetenantdto).

**Path parameters:**

| Name | Type | Required |
|------|------|----------|
| `id` | `string` | Yes |

**Query parameters:** None.

**Response:**

| Status | Description | Body schema (Swagger) |
|--------|-------------|----------------------|
| `200` | OK | **Not defined** |

**Inferred response:** `ApiEnvelope<Tenant>` with updated record.

**Validation rules:** Request body required (may accept `{}` until `UpdateTenantDto` is populated in spec).

---

### 6. Soft delete tenant

| | |
|---|---|
| **Endpoint name** | Soft delete tenant |
| **Operation ID** | `TenantsController_remove` |
| **Method** | `DELETE` |
| **Path** | `/tenants/{id}` |
| **Authentication** | Bearer JWT (super admin) |

**Request payload:** None.

**Path parameters:**

| Name | Type | Required |
|------|------|----------|
| `id` | `string` | Yes |

**Query parameters:** None.

**Response:**

| Status | Description | Body schema (Swagger) |
|--------|-------------|----------------------|
| `200` | OK | **Not defined** |

**Inferred behavior:** Sets `deleted_at` timestamp; record recoverable via restore. Frontend expects empty data or `null` in envelope.

**Validation rules:** Cannot delete already-deleted tenant (assumed).

---

### 7. Restore tenant

| | |
|---|---|
| **Endpoint name** | Restore tenant |
| **Operation ID** | `TenantsController_restore` |
| **Method** | `PATCH` |
| **Path** | `/tenants/{id}/restore` |
| **Authentication** | Bearer JWT (super admin) |

**Request payload:** None.

**Path parameters:**

| Name | Type | Required |
|------|------|----------|
| `id` | `string` | Yes |

**Query parameters:** None.

**Response:**

| Status | Description | Body schema (Swagger) |
|--------|-------------|----------------------|
| `200` | OK | **Not defined** |

**Inferred response:** `ApiEnvelope<Tenant>` with `deleted_at` cleared.

**Validation rules:** Tenant must be soft-deleted.

---

### 8. Activate tenant

| | |
|---|---|
| **Endpoint name** | Activate tenant |
| **Operation ID** | `TenantsController_activate` |
| **Method** | `PATCH` |
| **Path** | `/tenants/{id}/activate` |
| **Authentication** | Bearer JWT (super admin) |

**Request payload:** None.

**Path parameters:**

| Name | Type | Required |
|------|------|----------|
| `id` | `string` | Yes |

**Query parameters:** None.

**Response:**

| Status | Description | Body schema (Swagger) |
|--------|-------------|----------------------|
| `200` | OK | **Not defined** |

**Inferred behavior:** Sets `is_active: true`. Users can log in again.

**Validation rules:** Tenant must not be soft-deleted.

---

### 9. Deactivate tenant

| | |
|---|---|
| **Endpoint name** | Deactivate tenant |
| **Operation ID** | `TenantsController_deactivate` |
| **Method** | `PATCH` |
| **Path** | `/tenants/{id}/deactivate` |
| **Authentication** | Bearer JWT (super admin) |

**Request payload:** None.

**Path parameters:**

| Name | Type | Required |
|------|------|----------|
| `id` | `string` | Yes |

**Query parameters:** None.

**Response:**

| Status | Description | Body schema (Swagger) |
|--------|-------------|----------------------|
| `200` | OK | **Not defined** |

**Inferred behavior:** Sets `is_active: false`. Frontend UI warns that users will be logged out.

**Validation rules:** Tenant must not be soft-deleted.

---

## Related auth endpoints

These endpoints are tagged **Auth** in Swagger but are part of the tenant login lifecycle.

### Tenant admin login

| | |
|---|---|
| **Endpoint name** | Tenant admin login: tenant slug + the tenant's own password |
| **Operation ID** | `AuthController_tenantLogin` |
| **Method** | `POST` |
| **Path** | `/auth/tenant-login` |
| **Authentication** | **None** (public) |

**Request payload** (`TenantLoginDto`):

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `tenant_slug` | `string` | **Yes** | Same slug set in `POST /tenants` |
| `password` | `string` | **Yes** | `minLength: 1` — tenant password from creation |
| `remember_me` | `boolean` | No | — |
| `device_name` | `string` | No | — |

**Query parameters:** None.

**Response:** `200` — body **not defined** in OpenAPI. Expected: JWT token pair for tenant admin session.

---

### Change tenant password

| | |
|---|---|
| **Endpoint name** | Change the tenant's own login password |
| **Operation ID** | `AuthController_changeTenantPassword` |
| **Method** | `POST` |
| **Path** | `/auth/tenant/change-password` |
| **Authentication** | Bearer JWT (tenant admin) |

**Request payload** (`TenantChangePasswordDto`):

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `current_password` | `string` | **Yes** | `minLength: 1` |
| `new_password` | `string` | **Yes** | Platform password strength policy |
| `confirm_password` | `string` | **Yes** | Must match `new_password` |

**Query parameters:** None.

**Response:** `200` — body **not defined**.

---

## Endpoint summary table

| # | Name | Method | Path | Auth | Body | Query |
|---|------|--------|------|------|------|-------|
| 1 | Create tenant | `POST` | `/tenants` | Bearer | `CreateTenantDto` | — |
| 2 | List tenants | `GET` | `/tenants` | Bearer | — | `search?` |
| 3 | Statistics | `GET` | `/tenants/statistics` | Bearer | — | — |
| 4 | Get by ID | `GET` | `/tenants/{id}` | Bearer | — | — |
| 5 | Update | `PATCH` | `/tenants/{id}` | Bearer | `UpdateTenantDto` | — |
| 6 | Soft delete | `DELETE` | `/tenants/{id}` | Bearer | — | — |
| 7 | Restore | `PATCH` | `/tenants/{id}/restore` | Bearer | — | — |
| 8 | Activate | `PATCH` | `/tenants/{id}/activate` | Bearer | — | — |
| 9 | Deactivate | `PATCH` | `/tenants/{id}/deactivate` | Bearer | — | — |
| — | Super admin login | `POST` | `/auth/super-admin/login` | None | `SuperAdminLoginDto` | — |
| — | Tenant login | `POST` | `/auth/tenant-login` | None | `TenantLoginDto` | — |
| — | Tenant change password | `POST` | `/auth/tenant/change-password` | Bearer | `TenantChangePasswordDto` | — |

---

## OpenAPI gaps (action items for backend)

| Gap | Impact |
|-----|--------|
| No response schemas on tenant endpoints | Frontend infers shapes; code generation not possible |
| `UpdateTenantDto` is empty | PATCH body undocumented |
| `subscription_plan` / `status` typed as `object` | No enum validation in spec |
| `GET /tenants` missing `page`, `limit`, `status` query params | Frontend sends params not in Swagger |
| Super-admin login path | Swagger: `/auth/super-admin/login` vs frontend: `/auth/superadmin/login` |
| Error responses (`400`, `401`, `403`, `404`, `409`) | Not documented per endpoint |

---

## Frontend mapping

| Service method | HTTP | File |
|----------------|------|------|
| `tenantService.create` | `POST /tenants` | `tenant.service.ts` |
| `tenantService.list` | `GET /tenants` | `tenant.service.ts` |
| `tenantService.getStatistics` | `GET /tenants/statistics` | `tenant.service.ts` |
| `tenantService.getById` | `GET /tenants/:id` | `tenant.service.ts` |
| `tenantService.update` | `PATCH /tenants/:id` | `tenant.service.ts` |
| `tenantService.softDelete` | `DELETE /tenants/:id` | `tenant.service.ts` |
| `tenantService.restore` | `PATCH /tenants/:id/restore` | `tenant.service.ts` |
| `tenantService.activate` | `PATCH /tenants/:id/activate` | `tenant.service.ts` |
| `tenantService.deactivate` | `PATCH /tenants/:id/deactivate` | `tenant.service.ts` |

---

## Related documentation

- [Tenant module (frontend)](./tenant.md)
- [API service layer](../api-service-layer.md)
- [Authentication](../authentication.md)
- [Backend architecture](../backend-architecture.md)
