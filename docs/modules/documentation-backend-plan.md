# Documentation Module — Backend Implementation Plan

Backend plan for the **Documentation** module, derived from the current KingFisher Wings frontend screens and menu configuration.

**Sources:**

| Document | Location |
|----------|----------|
| Documentation menu (24 tiles + Reports hub) | `src/features/documents/config/documentationMenu.ts` |
| Routed pages (9 screens) | `src/pages/documentation/*` |
| Router entries | `src/router/index.tsx` |
| Integrated jobs hub | `src/features/jobs/pages/HubAllJobsPage.tsx` (`variant="documentation"`) |
| Existing jobs API | `src/features/jobs/api/job.api.ts` |
| Payment requests API | `src/features/paymentRequests/api/paymentRequest.api.ts` |

**Current state:**

| Area | Status |
|------|--------|
| Menu tiles | 24 tiles + Reports hub |
| Routed pages | 9 (menu + 8 feature pages + reports hub) |
| API-integrated | **All Jobs only** → `GET /jobs` via `HubAllJobsPage` |
| UI shells (no API) | BOE Dashboard, Bayan EDI (2), Bulk Cost Entry, CCN FWB/FHL, CGM EDI, Air Cargo Tracking |
| No frontend route yet | 16 tiles (charge templates, uploads, eQO, MPCI, job shortcuts, etc.) |
| Swagger today | No `/documentation/*`, `/boe/*`, `/bayan/*`, `/edi/*`, `/mpci/*` tags |

---

## Goals

| Goal | Success criteria |
|------|------------------|
| Wire all documentation screens | Every menu tile has a backing API or reuses an existing module |
| Customs & EDI compliance | Bayan, eQO, CCN, CGM, IAL, MPCI flows with audit trail |
| Bulk operations | Bulk cost entry, Excel uploads, voucher batch processing |
| Reuse jobs/finance | Minimize duplication; extend Jobs, Charges, Payment Requests, Vouchers |
| Tenant isolation | All endpoints scoped by `tenant_id` + branch permissions |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Documentation Module                      │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Job Views   │   Customs    │  EDI Gateway │  Bulk Ops      │
│  (read-most) │  & BOE/DO    │  (generate/  │  (costs,       │
│              │              │   submit)    │   uploads)     │
├──────────────┴──────────────┴──────────────┴────────────────┤
│           Shared: Jobs, Shipments, Charges, Files              │
└─────────────────────────────────────────────────────────────┘
```

**Base path:** `/documentation`

**Tenancy:** All endpoints scoped by `tenant_id` + branch permissions (same as Jobs).

**Pattern:** List screens = `GET` with filters + pagination; action screens = `POST` mutations; EDI = async job queue with status polling.

---

## Screen → API mapping (complete inventory)

### Phase A — Reuse existing APIs (minimal backend work)

| # | Frontend screen | Path | Backend approach |
|---|-----------------|------|------------------|
| 1 | **All Jobs** | `/documentation/all-jobs` | `GET /jobs` — extend filters if needed: `department_id`, `created_by`, `boe_number`, `has_boe` |
| 14 | **Export-Air** | `/documentation/export-air` | `GET /jobs?job_type=AIR_EXPORT` + `POST /jobs` (wizard) |
| 19 | **Sea Export-FCL** | `/documentation/sea-export-fcl` | `GET /jobs?job_type=SEA_FCL_EXPORT` |
| 20 | **Sea Export-LCL** | `/documentation/sea-export-lcl` | `GET /jobs?job_type=SEA_LCL_EXPORT` |
| 18 | **Payment Request Monitor** | `/documentation/payment-request-monitor` | `GET /payment-requests` — add doc-team filters: `status`, `job_id`, `branch_id`, `pending_voucher` |
| 24 | **Voucher Batch Processing** | `/documentation/voucher-batch-processing` | `PATCH /vouchers/batch-status` (new) on existing vouchers module |

### Phase B — New Documentation APIs (core customs & ops)

| # | Screen | New endpoints |
|---|--------|---------------|
| 2 | **BOE Dashboard** | `GET /documentation/boe/dashboard`, `GET /documentation/boe/claims/pending` |
| 5 | **Bulk Cost Entry** | `POST /documentation/bulk-costs`, `POST /documentation/bulk-costs/preview` |
| 9 | **Charge Template List** | CRUD `/documentation/charge-templates` |
| 23 | **Update DO - Closed Job** | `PATCH /documentation/jobs/{id}/delivery-order` |
| 16 | **Job Download** | `POST /documentation/jobs/export`, `POST /documentation/jobs/import` |
| 25 | **Reports - Docs** | `GET /documentation/reports/{reportId}` |

### Phase C — EDI & customs filing (integration-heavy)

| # | Screen | New endpoints |
|---|--------|---------------|
| 3 | **Bayan EDI Job List (Master)** | `GET /documentation/edi/bayan/jobs`, `POST .../generate`, `POST .../submit`, `POST .../amend` |
| 4 | **Bayan EDI Shipment (House)** | `GET /documentation/edi/bayan/shipments`, `POST .../download` |
| 6 | **CCN FWB/FHL EDI** | `GET /documentation/edi/ccn/jobs`, `POST .../fwb`, `POST .../fhl` |
| 7 | **CGM EDI Vessel List** | CRUD `/documentation/edi/cgm/vessels`, `POST .../download` |
| 13 | **Dubai eQO EDI** | `GET /documentation/edi/eqo/dubai/jobs`, `POST .../generate-bol` |
| 17 | **Oman eQO EDI** | `GET /documentation/edi/eqo/oman/jobs`, `POST .../generate-bol` |
| 15 | **IAL EDI Job List** | `GET /documentation/edi/ial/jobs`, `POST .../icegate-export` |
| 22 | **UAE MPCI Monitor** | CRUD `/documentation/mpci/filings`, `POST .../submit`, `GET .../status` |

### Phase D — File uploads & tracking

| # | Screen | New endpoints |
|---|--------|---------------|
| 8 | **Cargo Tracking - Air** | `GET /documentation/tracking/air?mawb=` (+ optional carrier adapter) |
| 10 | **Container No. Upload** | `POST /documentation/uploads/container-numbers` (Excel) |
| 11 | **Container Transport Upload** | `POST /documentation/uploads/container-transport` |
| 12 | **DPWORLD Tracking Upload** | `POST /documentation/uploads/dpworld-tracking` |
| 21 | **Truck Position Upload** | `POST /documentation/uploads/truck-positions` |

---

## Shared data models (new tables)

### `documentation_boe_records`

Bill of Entry linked to jobs/shipments.

```ts
{
  id, tenant_id, branch_id,
  job_id, shipment_id?,           // link to ops
  boe_number, boe_date, boe_type,   // IMPORT | EXPORT | TRANSIT | ...
  status,                        // DRAFT | FILED | CLEARED | CLAIM_PENDING
  customs_office?, port_id?,
  party_id?,                     // client
  salesperson_id?, department_id?,
  filed_by?, filed_at?,
  claim_status?,                 // for "Pending Claims" button
  metadata: jsonb,
  created_at, updated_at
}
```

### `documentation_delivery_orders`

For **Update DO - Closed Job**.

```ts
{
  id, tenant_id, job_id,
  do_number, do_date, do_status,   // ISSUED | DELIVERED | CANCELLED
  closed_job_only: boolean,        // enforce job.status = COMPLETED
  updated_by, updated_at
}
```

### `documentation_charge_templates` + `documentation_charge_template_lines`

```ts
// template
{ id, tenant_id, name, description, job_types[], is_active }

// line
{ id, template_id, charge_code_id, description, sale_or_cost, dr_cr,
  currency_code, default_amount?, tax_group_id?, sort_order }
```

### `documentation_bulk_cost_batches` + `documentation_bulk_cost_lines`

Matches **Bulk Cost Entry** UI fields.

```ts
// batch
{ id, tenant_id, organization_id, vessel_id?, voyage_number?,
  prorate_method, status, created_by, submitted_at }

// line
{ id, batch_id, job_id, shipment_id?, charge_code_id, description,
  currency_code, exchange_rate, fcy_amount, amount_aed,
  sale_or_cost, dr_cr, tax_group_id }
```

### `documentation_edi_submissions` (generic EDI audit)

One table for Bayan, CCN, CGM, eQO, IAL, MPCI.

```ts
{
  id, tenant_id,
  edi_type,                      // BAYAN_MASTER | BAYAN_HOUSE | CCN_FWB | CCN_FHL |
                                 // CGM | EQO_DUBAI | EQO_OMAN | IAL | MPCI
  reference_type,                // JOB | SHIPMENT | VESSEL_VOYAGE
  reference_id,
  status,                        // DRAFT | GENERATED | SUBMITTED | ACCEPTED | REJECTED | AMENDED
  file_storage_key?,             // generated EDI file
  external_ref?,                 // customs ack number
  payload_hash, error_message?,
  submitted_by, submitted_at,
  amendment_of_id?
}
```

### `documentation_cgm_vessel_voyages`

For **CGM EDI Vessel List** Create button.

```ts
{
  id, tenant_id, vessel_id, voyage_number,
  origin_port_id, dest_port_id,
  etd?, eta?, atd?, ata?,
  status, created_at
}
```

### `documentation_mpci_filings`

```ts
{
  id, tenant_id, job_id?, shipment_id?,
  filing_number?, filing_type,
  status,                        // PREPARED | SUBMITTED | ACKNOWLEDGED | REJECTED
  uae_customs_ref?, submitted_at, response_payload: jsonb
}
```

### `documentation_upload_batches`

For all Excel/CSV uploads.

```ts
{
  id, tenant_id, upload_type,    // CONTAINER_NUMBERS | CONTAINER_TRANSPORT |
                                 // DPWORLD_TRACKING | TRUCK_POSITION
  file_name, file_storage_key,
  status,                        // PENDING | PROCESSING | COMPLETED | FAILED
  total_rows, success_rows, error_rows,
  errors: jsonb[],               // [{ row, field, message }]
  created_by, processed_at
}
```

### `documentation_air_tracking_events` (optional cache)

```ts
{ id, mawb_number, carrier_code?, events: jsonb[], fetched_at }
```

---

## API contracts per built frontend screen

### BOE Dashboard

**UI filters:** date range, branch, client, sales person, department, origin, destination, job no, created user, job status, BOE type.

```
GET /documentation/boe/dashboard
Query:
  from_date, to_date, branch_id, party_id, salesperson_id, department_id,
  origin_port_id, dest_port_id, job_number, created_by, job_status, boe_type,
  search, page, limit

Response:
{
  items: [{
    job_id, job_number, job_status,
    boe_number, boe_date, boe_type, boe_status,
    party_name, salesperson_name, branch_name,
    origin, destination, open_claims_count
  }],
  meta: { page, limit, total, totalPages }
}

GET /documentation/boe/claims/pending
  → rows for "Pending Claims" shortcut (enabled after filter submit on UI)
```

### Bayan EDI Job List (Master)

**UI filters:** date type (ATA/ETA | ATD/ETD), date range, branch, department, job/shipment type, origin, destination, MBL/MAWB, CAR no, vessel, job no.

```
GET /documentation/edi/bayan/jobs
Query: date_field, from_date, to_date, branch_id, department_id,
       job_type, origin_port_id, dest_port_id,
       mbl_mawb_number, car_number, vessel_name, job_number, search, page, limit

Response items:
{
  job_id, job_number, job_type, branch_name,
  mbl_number?, mawb_number?, car_number?, vessel_name, voyage_number?,
  origin, destination, ata?, eta?, atd?, etd?,
  edi_status,                    // from documentation_edi_submissions
  last_submission_id?
}

POST /documentation/edi/bayan/jobs/{jobId}/generate
POST /documentation/edi/bayan/jobs/{jobId}/submit
POST /documentation/edi/bayan/jobs/{jobId}/amend
GET  /documentation/edi/bayan/jobs/{jobId}/download   → file stream
```

### Bayan EDI Shipment (House)

**Extra filters:** HBL/HAWB, Shipment No.

```
GET /documentation/edi/bayan/shipments
Query: (same as master) + hbl_hawb_number, shipment_number

POST /documentation/edi/bayan/shipments/{shipmentId}/download
```

> **Note:** If backend uses job hierarchy only (no separate shipment entity), map `shipment` = house job (`parent_job_id` set).

### Bulk Cost Entry

```
POST /documentation/bulk-costs/preview
Body: { header fields + lines[] }
→ validates jobs/shipments/charges, computes proration, returns line totals

POST /documentation/bulk-costs
Body:
{
  organization_id, vessel_id?, voyage_number?,
  prorate_method: "CHARGEABLE_UNIT" | ...,
  lines: [{
    job_id, shipment_id?, charge_code_id, description,
    currency_code, exchange_rate, fcy_amount, amount_aed,
    sale_or_cost: "COST" | "SALE", dr_cr: "Dr" | "Cr", tax_group_id?
  }]
}
→ creates batch, posts charges via Jobs charges service

GET /documentation/bulk-costs/{batchId}
```

### CCN FWB/FHL EDI Job List

**UI filters:** ATD/ETD | ATA/ETA, dates, branch, flight name, job no, origin, destination, MAWB.

```
GET /documentation/edi/ccn/jobs
POST /documentation/edi/ccn/jobs/{jobId}/fwb/generate
POST /documentation/edi/ccn/jobs/{jobId}/fhl/generate
POST /documentation/edi/ccn/jobs/{jobId}/submit
GET  /documentation/edi/ccn/jobs/{jobId}/download
```

### CGM EDI Vessel List

```
GET  /documentation/edi/cgm/vessels
POST /documentation/edi/cgm/vessels
PATCH /documentation/edi/cgm/vessels/{id}

POST /documentation/edi/cgm/vessels/{id}/download-edi
  Body: { job_ids?: string[] }   // multi-job download per UI note
```

### Cargo Tracking - Air

```
GET /documentation/tracking/air?mawb_number=176-12345678

Response:
{
  mawb_number, carrier, origin, destination,
  events: [{ datetime, location, status, flight_number?, remark }]
}
```

Implement as adapter layer (cargo tracking provider or airline API); cache in `documentation_air_tracking_events`.

### Reports - Docs

Hub links to: all-jobs, boe-dashboard, bayan lists, bulk-cost-entry.

```
GET /documentation/reports
  → catalog of available report definitions

GET /documentation/reports/eta-followup
GET /documentation/reports/etd-followup
GET /documentation/reports/jobs-list
GET /documentation/reports/manifest-status
Query: standard date/branch filters
Response: tabular JSON or ?format=csv|xlsx
```

---

## APIs for screens not yet routed (frontend will follow)

### Charge Template List

```
GET    /documentation/charge-templates
POST   /documentation/charge-templates
GET    /documentation/charge-templates/{id}
PATCH  /documentation/charge-templates/{id}
DELETE /documentation/charge-templates/{id}
POST   /documentation/charge-templates/{id}/apply
  Body: { job_id | quotation_id | shipment_id }
```

### Container / transport / truck uploads

```
GET  /documentation/uploads/templates/{upload_type}   → sample Excel
POST /documentation/uploads/{upload_type}             → multipart file
GET  /documentation/uploads/batches
GET  /documentation/uploads/batches/{id}
GET  /documentation/uploads/batches/{id}/errors       → error report download
```

**Row mapping:**

| Upload type | Target update |
|-------------|---------------|
| `container-numbers` | `jobs/{id}/containers` |
| `container-transport` | transport charges + driver fields on container/job |
| `dpworld-tracking` | milestone/tracking events on job |
| `truck-positions` | land job checkpoint / GPS fields |

### Dubai / Oman eQO EDI

```
GET  /documentation/edi/eqo/{region}/jobs     // region = dubai | oman
POST /documentation/edi/eqo/{region}/jobs/{jobId}/generate-bol
POST /documentation/edi/eqo/{region}/jobs/{jobId}/submit
```

### IAL EDI (India ICEGATE)

```
GET  /documentation/edi/ial/jobs
POST /documentation/edi/ial/jobs/{jobId}/generate
POST /documentation/edi/ial/jobs/{jobId}/submit
```

### UAE MPCI Monitor

```
GET    /documentation/mpci/filings
POST   /documentation/mpci/filings
GET    /documentation/mpci/filings/{id}
PATCH  /documentation/mpci/filings/{id}
POST   /documentation/mpci/filings/{id}/prepare
POST   /documentation/mpci/filings/{id}/submit
GET    /documentation/mpci/filings/{id}/status
```

### Update DO - Closed Job

```
GET   /documentation/delivery-orders/closed-jobs
  Query: job_number, do_status, from_date, to_date, export_only=true

PATCH /documentation/jobs/{jobId}/delivery-order
Body: { do_number, do_date, do_status }
Validation: job.status in (COMPLETED, DELIVERED) && job_type ends with EXPORT
```

### Job Download (branch-to-branch)

```
POST /documentation/jobs/export
Body: { job_ids[], target_branch_id?, include_charges, include_documents }

POST /documentation/jobs/import
Body: multipart package or JSON bundle from export
```

### Payment Request Monitor

Extend existing:

```
GET /payment-requests
  + filters: branch_id, job_number, voucher_pending=true, assigned_team=DOCUMENTATION
```

### Voucher Batch Processing

```
GET  /vouchers?status=...&batch_eligible=true
POST /vouchers/batch-status
Body: { voucher_ids[], from_status, to_status, reason? }
```

---

## Permissions

| Permission | Scope |
|------------|-------|
| `documentation.read` | All list/report GET |
| `documentation.manage` | BOE, DO updates, bulk cost, templates |
| `documentation.edi.read` | EDI list/download |
| `documentation.edi.submit` | EDI submit/amend |
| `documentation.upload` | Excel/CSV uploads |
| `documentation.mpci` | UAE MPCI filings |
| `menu_documentation` | Frontend menu access |

Map to roles: **Documentation User**, **Operations User** (read-only), **Tenant Admin** (full).

---

## Integration with existing modules

| Existing module | Documentation usage |
|-----------------|---------------------|
| **Jobs** (`/jobs`) | Primary entity for all list screens; house/master via `parent_job_id`, `masters_only` |
| **Job charges** (`/jobs/{id}/charges`) | Bulk cost entry writes here |
| **Job containers** | Container upload target |
| **Job documents** | Manifest upload; EDI may attach as `document_type=OTHER` |
| **Payment requests** | Monitor screen |
| **Vouchers** | Batch processing |
| **Masters** | branches, departments, ports, vessels, charge codes, tax groups |
| **Parties** | client filter on BOE/EDI lists |
| **Files service** | Store generated EDI + upload batches |

---

## Implementation phases

### Sprint 1 — Foundation (unblocks most UI)

1. `documentation_boe_records` + BOE dashboard API
2. Bulk cost batch API (wraps job charges)
3. Charge templates CRUD
4. Extend `GET /jobs` filters for documentation lists
5. Payment request monitor filters (no new module)

**Frontend:** Wire BOE, Bulk Cost, Payment Request Monitor, Export-Air / Sea FCL / LCL shortcuts.

### Sprint 2 — Uploads & DO

1. Upload batch framework + 4 upload types
2. Delivery order update API
3. Job export/import
4. Documentation reports (ETA/ETD follow-up)

### Sprint 3 — EDI core

1. `documentation_edi_submissions` + file generation service
2. Bayan master/house
3. CGM vessel voyages
4. CCN FWB/FHL

### Sprint 4 — Customs integrations

1. Dubai/Oman eQO
2. IAL ICEGATE
3. UAE MPCI
4. Air cargo tracking adapter

### Sprint 5 — Finance ops

1. Voucher batch status API
2. EDI amendment workflows + audit trail

---

## Open decisions for backend team

1. **Shipment entity** — Is house shipment a separate table or a house job? (Frontend Bayan House screen implies shipment-level; jobs module uses house jobs.)
2. **BOE storage** — New `documentation_boe_records` vs extend `job.sea_*_details.customs_entry_number`.
3. **EDI generation** — In-app templates vs external customs broker microservice.
4. **Air tracking** — Which provider (IATA, airline direct, third-party)?
5. **List pagination** — Frontend list pages don't show page controls yet; backend should still return `meta` for future use.
6. **Date field on EDI lists** — Support `date_field=ata|eta|atd|etd` query param.

---

## Recommended Swagger tag structure

```
Documentation - BOE
Documentation - Bulk Costs
Documentation - Charge Templates
Documentation - Delivery Orders
Documentation - EDI Bayan
Documentation - EDI CCN
Documentation - EDI CGM
Documentation - EDI eQO
Documentation - EDI IAL
Documentation - MPCI
Documentation - Uploads
Documentation - Tracking
Documentation - Reports
Documentation - Job Transfer
```

---

## Frontend integration checklist (post-backend)

When each sprint lands, wire frontend under `src/features/documents/`:

| Sprint | Frontend work |
|--------|---------------|
| 1 | `documentation.api.ts`, services, hooks; wire BOE, bulk cost, charge templates |
| 2 | Upload components + DO update page; add missing routes from menu |
| 3 | EDI list pages with generate/submit/download actions |
| 4 | eQO, IAL, MPCI, air tracking pages |
| 5 | Voucher batch UI + payment request monitor filters |

---

*Last updated: 2026-08-31 — aligned with frontend menu and page filters in `src/pages/documentation/`.*
