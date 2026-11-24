# BE brief: Super Admin Deleted tab (tenants / companies)

## Goal

Soft-deleted **tenants** (and their company profiles) must appear on the Super Admin **Deleted** tab on **every device**. FE no longer uses `sessionStorage` / local registries.

## Required

`GET /tenants` must support listing soft-deleted rows for platform Super Admin, e.g.:

```http
GET /tenants?status=deleted
Authorization: Bearer <super_admin_token>
```

**or**

```http
GET /tenants?include_deleted=true
```

(then FE filters `deleted_at != null`).

Restore remains `PATCH /tenants/{id}/restore`. Soft delete remains `DELETE /tenants/{id}`.

## Acceptance

1. Soft-delete a tenant on device A.
2. On device B, Super Admin → Tenants → **Deleted** shows that tenant.
3. Companies → **Deleted** shows that tenant’s company profile (derived from the same tenant list).
4. Restore removes it from Deleted and returns it to All.

## FE behavior (shipped)

- Deleted tenants: `GET /tenants` with `status=deleted`, fallback `include_deleted` / `with_deleted`.
- Deleted companies: same deleted tenants mapped to company profiles (platform cannot call ERP `/companies`).
- No browser storage for deleted rosters.
