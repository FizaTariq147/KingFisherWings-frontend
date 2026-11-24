# BE brief: Super Admin Deleted trash (tenants / companies)

## Status

Live OpenAPI now exposes:

- `GET /tenants/deleted`
- `DELETE /tenants/{id}/permanent`
- Tenant ERP: `GET /companies/deleted`, `POST /companies/{id}/restore`, `DELETE /companies/{id}/permanent`

FE Super Admin uses `/tenants/deleted` + restore + permanent for tenants and for platform company profiles (mapped from tenants). Active `GET /tenants` stays `deleted_at: null` only.

## Acceptance

1. Soft-delete a tenant → appears on Tenants → **Deleted** on every device.
2. Restore returns it to All.
3. Permanent delete removes it; `409` when related data remains.
4. Companies → **Deleted** shows soft-deleted tenant company profiles; Restore / Permanent map to the linked tenant trash APIs.
