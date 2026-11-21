# BE brief: Super Admin list of Tenant Admin users

## Goal

Super Admin tenant section (**Created Users** column + tenant detail **Created users** tab) must show the **same user roster** Tenant Admin sees at `/admin/users` (ERP `GET /users` for that tenant).

## Why FE cannot do this alone

| Call | Result today |
|------|----------------|
| Super Admin `GET /users` (ERP) | **403** — `Platform admin tokens cannot access tenant ERP APIs. Use /tenants…` |
| Super Admin `GET /tenants/{id}/users` | **404** — route missing from live OpenAPI / deploy |
| Super Admin `GET /tenants/{id}` | Usually **owner / admin_user only** (not full staff list) |

FE is already wired to **never** call ERP `/users` with a platform token. It only reads platform `/tenants` responses.

## Required API

```http
GET /tenants/{id}/users
Authorization: Bearer <super_admin_platform_jwt>
```

### Behavior

- Auth: **Super Admin / platform** only (same guard as other `/tenants/{id}/*` routes).
- Scope: all **non-deleted** users for tenant `{id}` — same population as Tenant Admin `GET /users` for that tenant (TENANT_ADMIN + Sales / CS / Ops / Finance / Branch Manager / other staff).
- Do **not** require tenant JWT or `X-Tenant-Id` from the caller; resolve tenant from path `{id}`.

### Query (align with ERP list)

| Param | Notes |
|-------|--------|
| `page` | default `1` |
| `limit` | default `20`, allow up to `100` |
| `search` | optional email / name |
| `status` / lifecycle | optional; omit = active+inactive (exclude soft-deleted) |
| `role` | optional |

### Response shape (match ERP `GET /users` envelope)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "email": "user@example.com",
      "first_name": "Ada",
      "last_name": "Lovelace",
      "full_name": "Ada Lovelace",
      "role": "SALES",
      "status": "ACTIVE",
      "phone": null,
      "last_login_at": null,
      "created_at": "2026-01-01T00:00:00.000Z",
      "must_change_password": false
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

Optional Super Admin-only: `password_plain` on rows (same rule as other platform user payloads).

### Also useful (either is enough for the list count)

- `GET /tenants` / `GET /tenants/{id}` include `total_users` (or `users_count`) = same count as above `meta.total`, **or**
- embed full `users: [...]` on `GET /tenants/{id}` (can be heavy; nested list route preferred).

## FE consumption (already implemented)

1. `GET /tenants/{id}/users` (paginated until all rows loaded)
2. Fallback: users embedded on `GET /tenants/{id}`
3. Never: ERP `GET /users` with platform token

## Acceptance

1. Tenant Admin creates users under `/admin/users`.
2. Super Admin opens that tenant → **Created users** lists **every** non-deleted user (same emails/roles/status as Tenant Admin list).
3. Tenant list **Created Users** column shows that count (not `—` / not owner-only `1` when more staff exist).
4. Platform token still cannot call ERP `/users` (403 remains OK).
