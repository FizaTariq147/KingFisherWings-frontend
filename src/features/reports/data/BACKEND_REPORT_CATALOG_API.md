# FRESA Report Catalog — Backend API Contract

Frontend catalog UI is live at `/reports/catalog`. It calls the endpoints below. Until they exist, the FE falls back to a local taxonomy on `404/501` and blocks generate.

**Do not change** existing document PDF APIs (`POST /quotations/:id/pdf`, `POST /invoices/:id/pdf`, portal/vendor PDF flows). Catalog templates are additive.

---

## Endpoints

### 1. `GET /reports/templates`

Paginated template list (tenant-scoped).

**Query params**

| Param     | Type   | Notes |
|-----------|--------|--------|
| `page`    | number | default `1` |
| `limit`   | number | default `50` |
| `search`  | string | name / code |
| `family`  | string | `ops_list` \| `sea_docs` \| `air_docs` \| `commercial` \| `finance` \| `wms` \| `quotation` \| `other` |
| `context` | string | `job` \| `quotation` \| `invoice` \| `gl` \| `wms` \| `list` \| `party` |

**Response (preferred)**

```json
{
  "data": [
    {
      "id": "uuid-or-stable-id",
      "code": "HBL_DRAFT_JASPER_01",
      "name": "HBL Draft Jasper 01",
      "family": "sea_docs",
      "contexts": ["job"],
      "formats": ["PDF", "XLSX"],
      "description": "…",
      "is_active": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 110,
    "totalPages": 3
  }
}
```

**Rules**

- Stable `code` values aligned to FRESA naming (e.g. `HBL_DRAFT_JASPER_138`).
- Incomplete templates: `is_active: false` or omit until Jasper + data pack is ready.
- Same auth / permission model as other tenant module data.

---

### 2. `GET /reports/templates/:idOrCode`

Template detail + parameter schema. Accept UUID **or** stable `code`.

**Response**

```json
{
  "id": "…",
  "code": "PENDING_DRAFT_BL",
  "name": "Pending Draft BL",
  "family": "ops_list",
  "contexts": ["list", "job"],
  "formats": ["PDF", "XLSX", "CSV"],
  "description": "…",
  "is_active": true,
  "parameters": [
    {
      "name": "date_from",
      "label": "From date",
      "type": "date",
      "required": true,
      "default": null
    },
    {
      "name": "branch_id",
      "label": "Branch",
      "type": "select",
      "required": false,
      "options": [{ "value": "…", "label": "…" }]
    }
  ]
}
```

**Parameter `type` values FE supports:** `string` | `number` | `date` | `boolean` | `uuid` | `select`

---

### 3. `POST /reports/generate`

Start a render job (async preferred; sync OK if response status is already `ready`).

**Body**

```json
{
  "template_id": "optional-uuid",
  "code": "PENDING_DRAFT_BL",
  "format": "PDF",
  "parameters": {
    "date_from": "2026-01-01",
    "date_to": "2026-01-31"
  },
  "context": {
    "job_id": "optional",
    "quotation_id": "optional",
    "invoice_id": "optional",
    "party_id": "optional"
  }
}
```

- Accept either `template_id` **or** `code`.
- `format`: `PDF` | `XLSX` | `CSV`

**Response (must include job id)**

```json
{
  "id": "report-job-uuid",
  "status": "queued",
  "format": "PDF",
  "template_code": "PENDING_DRAFT_BL"
}
```

**Job statuses:** `queued` | `running` | `ready` | `failed`

---

### 4. `GET /reports/jobs/:jobId`

Poll status. FE polls every **2 seconds** while `queued` or `running`.

```json
{
  "id": "report-job-uuid",
  "status": "ready",
  "download_url": "https://…/signed-url-optional",
  "expires_at": "2026-09-10T12:00:00Z",
  "format": "PDF",
  "template_code": "PENDING_DRAFT_BL",
  "error": null
}
```

On failure: `status: "failed"` and a human-readable `error`.

---

### 5. `GET /reports/jobs/:jobId/download`

Binary file download. FE uses `responseType: blob`.

If `download_url` is set on the job, FE may open that URL instead — both patterns are supported.

---

## Do not change (preserve)

| Keep unchanged | Why |
|----------------|-----|
| `POST` / `GET` `/quotations/:id/pdf` (+ status) | Default quotation document PDF |
| `POST` / `GET` `/invoices/:id/pdf` (+ status) | Default tax invoice PDF |
| Portal / vendor PDF endpoints | Existing client fallbacks |
| Module analytics (`/quotations/reports`, `/gl/...`, MIS, HR, NVOCC) | On-screen KPI reports |

Catalog “Invoice Format-N” (and similar) templates are **additional** formats selected via the catalog — not a breaking replace of the default invoice/quotation PDF.

---

## Engine & platform requirements

1. **JasperReports** (or equivalent) with `.jrxml` / compiled `.jasper` per template.
2. Branding from tenant/company settings (logo, letterhead, legal entity, tax IDs).
3. Multi-currency; multi-language where FRESA lists Arabic invoice formats.
4. Exports: **PDF required**; **XLSX/CSV** for list-style reports.
5. Object storage for generated files + TTL (`expires_at`).
6. Auth: tenant-scoped (and branch where applicable); user may only generate for entities in scope.
7. Audit log: who generated which template, params, timestamp.
8. Rate limits / max concurrent jobs per tenant.
9. Ship **family packs** with `is_active`; do not wait for all ~600 templates.

---

## Data query layers (per family)

| Family | Typical datasets |
|--------|------------------|
| Job / shipment | Parties, ports, containers, cargo, milestones, charges, BL/AWB numbers |
| Quotation | Header, lines, validity, customer |
| Invoice / CN / DN / PI | Lines, tax, party, bank details |
| GL | TB, P&L, aging, SOA, vouchers (reuse existing `/gl/...` queries where possible) |
| WMS | ASN, locations, stock |
| List reports | Date range, branch, status, salesperson → tabular PDF/XLSX |

---

## Suggested delivery order

| Phase | Family | ~FE registry count | Notes |
|------:|--------|-------------------:|-------|
| **1** | Ops lists (`ops_list`) | ~110 | **Pilot first** — start with ~10 list reports |
| 2 | Sea docs (`sea_docs`) | ~134 | HBL drafts, arrival notice SEA, manifests, stuffing, sailing confirmation |
| 3 | Air docs + quotation formats | ~75 + ~18 | HAWB/MAWB, air arrival, air manifests |
| 4 | Commercial (`commercial`) | ~99 | Invoice format variants — **parallel** to default invoice PDF |
| 5 | Finance (`finance`) | ~91 | P&L, trial balance, outstanding letters, AR/AP aging, SOA |
| 6 | WMS (`wms`) | ~58 | ASN and remaining niche templates |

FE registry source: `src/features/reports/data/fresaReportRegistry.json` (~607 named templates). Gap notes: `REPORT_GAP_MATRIX.md`.

---

## Minimal acceptance (FE go-live)

1. `GET /reports/templates` returns active Phase-1 ops-list templates.
2. `GET /reports/templates/:code` returns `parameters[]`.
3. `POST /reports/generate` returns a job `id`.
4. Poll `GET /reports/jobs/:id` until `ready`, then download via `download_url` or `/download`.
5. Existing quotation/invoice PDF endpoints unchanged (regression check).

---

## FE client reference

| Item | Path |
|------|------|
| Route constants | `src/features/reports/api/reportCatalog.api.ts` |
| Types / request shapes | `src/features/reports/types/reportCatalog.types.ts` |
| Service (normalize + fallback) | `src/features/reports/services/reportCatalog.service.ts` |
| Rollout phases | `src/features/reports/constants/reportRollout.constants.ts` |
