# Backend — dynamic brand logo

**Goal:** Tenant/company logo chosen at registration (or later in settings) appears everywhere in the software. If unset, FE keeps `src/assets/logo.png`.

## Already supported (no change)

| API | Field |
|-----|--------|
| `PATCH /organization/profile` | `logo_url` (string URL) |
| `POST /tenants`, `PATCH /tenants/:id` | `logo_url` (string URL) |

FE can paste a CDN URL today. File picker needs the upload endpoints below.

## Required upload APIs

Multipart field name: **`file`** (do not require a custom Content-Type from the client).

### 1. Organization (tenant admin / staff settings)

`POST /organization/logo`  
Auth: staff JWT with org/settings permission  

**Response (200):**
```json
{ "logo_url": "https://cdn.example.com/tenants/…/logo.png" }
```

Also persist on the org profile so `GET /organization/profile` returns the same `logo_url`.

### 2. Tenant (platform / Super Admin)

`POST /tenants/:id/logo`  
Auth: super-admin (or tenant manager)  

**Response (200):** same `{ "logo_url": "…" }` and persist on the tenant row.

### Constraints

- MIME: `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`
- Max size: **2 MB** (FE validates the same)
- Prefer a stable **HTTPS** URL (CDN or public `/files/…` if images are publicly readable)

### Optional — login chrome without extra round-trips

Include on `GET /auth/me` (and portal/vendor me if useful):

```json
{ "logo_url": "https://…", "primary_color": "#0A2942" }
```

FE already falls back to `GET /organization/profile` when authenticated.

### Public Track

Keep returning `logo_url` / `logoUrl` from `GET /track/embed?tenant_slug=…` (already used for track branding). Same URL as org/tenant logo is ideal.

## FE behaviour

1. Default everywhere: `assets/logo.png`
2. Org Settings + Tenant form: **Choose logo** file picker → upload → set `logo_url`
3. Shells / login popup: `BrandLogo` resolves org/auth URL, falls back to asset on missing/broken URL
4. If upload API is missing (404), FE shows a warning and still allows pasting a URL so nothing else breaks

## Out of scope

- WordPress hosting the logo file
- Changing PDF pack engines (client samples may still use KF asset until packs inject `logo_url`)
