# Warehouse module — updated workflow & complete API map

Source of truth for paths: live OpenAPI  
`https://kingfisherwings-backend.onrender.com/docs` → `GET /docs-json`  
(checked against current backend — do **not** invent a different state machine)

This document describes the **updated** warehouse flow from the product diagrams **as-is** (ASN yard → auto GRN → GDO/GDN → customer email/portal docs → storage invoices later). It does **not** redesign the flow.

---

## 1. Target workflow (exact diagram behaviour)

### 1.1 Inbound ASN yard

```
DRAFT → CONFIRMED → PICKED → UNLOADING → UNLOADED
              ↘ CANCELLED ↙     (cancel from CONFIRMED or PICKED)
```

| Status | Meaning |
|--------|---------|
| `DRAFT` | ASN created |
| `CONFIRMED` | ASN confirmed |
| `PICKED` | Cargo collected / en route to warehouse |
| `UNLOADING` | Arrived; unload in progress |
| `UNLOADED` | Unload complete → **triggers automations** |
| `CANCELLED` | Cancelled from `CONFIRMED` or `PICKED` |

### 1.2 On `UNLOADED` (automated — do not skip / reorder)

1. Auto-create GRN from ASN lines  
2. Auto-post GRN → lots + `GRN_IN`  
3. Render GRN PDF  
4. In parallel:  
   - Email party + portal users (PDF)  
   - Create **JobDocument GRN** on the linked job (portal shipment documents)

Manual fallback (if send failed): `POST /wms/asns/{id}/resend-grn`

### 1.3 Outbound GDO

```
GDO DRAFT → GDO POSTED (= DISPATCHED)
```

### 1.4 On GDO `POST` (automated)

1. Render GDN PDF (same outbound document as GDO PDF)  
2. In parallel:  
   - Email party + portal users (PDF)  
   - Create **JobDocument GDN** on the linked job  

Manual fallback: `POST /wms/gdos/{id}/resend-gdn`

### 1.5 Customer delivery (diagram)

| Warehouse event | Email with PDF | Portal shipment documents |
|-----------------|----------------|---------------------------|
| GRN after unload | Yes | Yes |
| GDN after dispatch | Yes | Yes |
| Storage invoices later | Via finance send (optional) | Yes (after invoice is posted / attached) |

Customer never uses `/portal/wms` — only shipment documents, invoices, notifications.

### 1.6 Storage labels on `StockLot` (ops board)

| Label | Rule (diagram) |
|-------|----------------|
| **OVERDUE** | `NOT_COLLECTED` + overdue/extra |
| **OVER_BILL** | Included overage / open overdue |

Exposed on staff **ops board** + lot-aging stock views (not a portal WMS API).

### 1.7 Storage → invoice (staff → finance → portal)

```
POST /wms/storage/calculate  → OPEN charges
POST /wms/storage/invoice    → DRAFT customer invoice
POST /invoices/{id}/post     → POSTED (Finance posts)
→ Customer: /portal/invoices* + portal documents
```

---

## 2. Complete WMS API inventory (live Swagger — miss none)

All paths below exist on backend today (`/docs-json`).

### 2.1 WMS Settings

| Method | Path | Behaviour |
|--------|------|-----------|
| `GET` | `/wms/settings` | Read settings |
| `PUT` | `/wms/settings` | Upsert (`valuation_method`, `default_free_days`, `default_storage_rate`, `default_overdue_rate_per_day`, `default_currency`) |

### 2.2 WMS Items

| Method | Path | Behaviour |
|--------|------|-----------|
| `GET` | `/wms/items` | List |
| `POST` | `/wms/items` | Create |
| `GET` | `/wms/items/{id}` | Get |
| `PATCH` | `/wms/items/{id}` | Update |
| `DELETE` | `/wms/items/{id}` | Delete |

### 2.3 WMS ASN (yard flow)

| Method | Path | Behaviour |
|--------|------|-----------|
| `GET` | `/wms/asns` | List |
| `POST` | `/wms/asns` | Create draft (`CreateAsnDto`: `warehouse_id`*, `lines`*, optional `party_id`, `job_id`, `expected_at`, `remarks`) |
| `GET` | `/wms/asns/{id}` | Get |
| `POST` | `/wms/asns/{id}/confirm` | `DRAFT` → `CONFIRMED` |
| `POST` | `/wms/asns/{id}/mark-picked` | → `PICKED` (cargo collected / en route) |
| `POST` | `/wms/asns/{id}/mark-unloading` | → `UNLOADING` |
| `POST` | `/wms/asns/{id}/mark-unloaded` | → `UNLOADED` **and** auto GRN create/post + email + portal JobDocument |
| `POST` | `/wms/asns/{id}/cancel` | → `CANCELLED` (from allowed statuses) |
| `POST` | `/wms/asns/{id}/resend-grn` | Resend GRN email + republish portal document |

### 2.4 WMS GRN

| Method | Path | Behaviour |
|--------|------|-----------|
| `GET` | `/wms/grns` | List |
| `POST` | `/wms/grns` | Create draft (`CreateGrnDto`: `warehouse_id`*, `lines`*, optional `party_id`/`job_id`/`asn_id`/`received_at`/`remarks` per OpenAPI) — usually **auto** from unload. **FE requires `party_id`** so posted lots can be billed via storage calculate. |
| `GET` | `/wms/grns/{id}` | Get |
| `POST` | `/wms/grns/{id}/post` | Post → lots + `GRN_IN` (used by auto path; also manual) |
| `POST` | `/wms/grns/{id}/cancel` | Cancel draft |
| `GET` | `/wms/grns/{id}/pdf` | Download GRN PDF (draft/posted/cancelled watermark) |

### 2.5 WMS GDO / GDN

| Method | Path | Behaviour |
|--------|------|-----------|
| `GET` | `/wms/gdos` | List |
| `POST` | `/wms/gdos` | Create draft (`CreateGdoDto`: `warehouse_id`*, `lines`*, optional `party_id`, `job_id`, `delivered_at`, `remarks`) |
| `GET` | `/wms/gdos/{id}` | Get |
| `POST` | `/wms/gdos/{id}/post` | → `POSTED` / `DISPATCHED`; consume lots; **send GDN** to customer + JobDocument |
| `POST` | `/wms/gdos/{id}/cancel` | Cancel draft |
| `GET` | `/wms/gdos/{id}/pdf` | Download GDO/GDN PDF |
| `POST` | `/wms/gdos/{id}/resend-gdn` | Resend GDN email + republish portal document |

### 2.6 WMS Stock / lots / transfers

| Method | Path | Behaviour |
|--------|------|-----------|
| `GET` | `/wms/stock/on-hand` | On-hand by warehouse/item |
| `GET` | `/wms/stock/movements` | Movement ledger (`GRN_IN`, etc.) |
| `GET` | `/wms/stock/low-stock` | Low stock |
| `GET` | `/wms/stock/lot-aging` | Open lots + age (supports overdue views) |
| `POST` | `/wms/stock/adjust` | Signed adjust |
| `GET` | `/wms/transfers` | List transfers |
| `POST` | `/wms/transfers` | Create draft transfer |
| `GET` | `/wms/transfers/{id}` | Get |
| `POST` | `/wms/transfers/{id}/post` | Post → `TRANSFER_OUT` + `TRANSFER_IN` |

### 2.7 WMS Storage → DRAFT invoice

| Method | Path | Behaviour |
|--------|------|-----------|
| `POST` | `/wms/storage/calculate` | Calculate **OPEN** charges (`warehouse_id`, `party_id`, `period_from`, `period_to`, optional rates/currency/free_days) — **works** (returns charge rows) |
| `GET` | `/wms/storage/charges` | List charges (`party_id`*, `status`*, `charge_kind`*) — **live backend returns HTTP 500**; FE Storage page does **not** call this; invoice from calculate result instead |
| `POST` | `/wms/storage/invoice` | Create **DRAFT** customer invoice from `charge_ids` — **works** |

### 2.8 WMS Ops board (labels + yard board)

| Method | Path | Behaviour |
|--------|------|-----------|
| `GET` | `/wms/ops-board` | Admin board: inbound ASN yard statuses, outbound GDO/DISPATCHED, lot **OVERDUE** / **OVER_BILL** labels, customer send flags |

### 2.9 Related masters (not under `/wms` but required)

| Method | Path | Behaviour |
|--------|------|-----------|
| `GET/POST` | `/masters/warehouses` | Warehouse masters |
| `GET/PATCH/DELETE` | `/masters/warehouses/{id}` | |
| `GET/POST` | `/masters/storage-slabs` | Storage slab masters |
| `GET/PATCH/DELETE` | `/masters/storage-slabs/{id}` | |

> Note: There is **no** `GET /wms/warehouses` in live Swagger (404). FE warehouse dropdowns use **`GET /masters/warehouses`** only (+ auth-scoped warehouses on `/auth/me`).  
> Storage UI path: `POST /wms/storage/calculate` → select returned OPEN charges → `POST /wms/storage/invoice`. Do not rely on `GET /wms/storage/charges` until the backend 500 is fixed.

---

## 3. Finance + job + portal APIs that complete the diagram

### 3.1 Finance (DRAFT → customer)

| Method | Path | Behaviour |
|--------|------|-----------|
| `POST` | `/invoices/{id}/post` | `DRAFT` → `POSTED` (**Finance posts**) |
| `POST` | `/invoices/{id}/send` | Email invoice PDF to customer |
| `GET` | `/invoices/{id}/pdf` | Invoice PDF |

### 3.2 Job barcode / labels (gate + stickers)

| Method | Path | Behaviour |
|--------|------|-----------|
| `GET` | `/jobs/by-barcode/{code}` | Lookup full job by barcode |
| `POST` | `/jobs/scan` | Record scan + return job |
| `POST` | `/jobs/{id}/documents/barcode-label` | Queue barcode label PDF |

### 3.3 Related job storage helpers (non-WMS warehouse jobs / LCL CFS)

| Method | Path |
|--------|------|
| `GET` | `/jobs/{id}/storage-calculation` |
| `POST` | `/jobs/{id}/storage-invoice` |
| `POST` | `/jobs/{id}/cfs-storage/calculate` |
| `POST` | `/jobs/{id}/lcl/cfs-storage/calculate` |
| `POST` | `/jobs/{id}/lcl/cfs-storage-invoice` |
| `POST` | `/jobs/{id}/lcl/wms-storage-link` |

Use these when storage is job/CFS-linked rather than pure `/wms/storage/*`.

### 3.4 Customer portal (no `/portal/wms`)

| Area | Paths |
|------|--------|
| Shipments | `GET /portal/shipments`, `GET /portal/shipments/{id}`, `GET .../milestones`, `GET .../documents`, `GET .../documents/{docId}/download`, summary/lookup/export |
| Documents hub | `GET /portal/documents`, `.../summary`, `.../permissions`, invoice/job download helpers |
| Invoices + pay | `GET /portal/invoices*`, `GET .../pdf`, payment-proofs, open-items, export |
| Notifications | `GET /portal/notifications*`, stream, read |
| Messages / disputes | `/portal/messages*`, `/portal/disputes*` |
| Quotations (onboarding) | `/portal/quotations*` accept → warehouse job/shipment |

**By design:** there is **no** `/portal/wms/*` in Swagger. GRN/GDN reach the customer only as **emails + JobDocuments** on the shipment.

---

## 4. Gap analysis — diagram vs backend vs frontend

### 4.1 Backend vs updated diagrams

| Diagram piece | Backend status |
|---------------|----------------|
| ASN `DRAFT → CONFIRMED → PICKED → UNLOADING → UNLOADED` | **Present** (`confirm`, `mark-picked`, `mark-unloading`, `mark-unloaded`) |
| Cancel from confirmed/picked | **Present** (`cancel`) — enforce allowed transitions server-side |
| On UNLOADED auto GRN + post + PDF + email + JobDocument | **Present** (`mark-unloaded` summary) |
| Resend GRN | **Present** (`resend-grn`) |
| GDO draft → posted/dispatched | **Present** (`post`) |
| On GDO post → GDN PDF + email + JobDocument | **Present** (`post` + `resend-gdn`) |
| Customer email + portal shipment docs for GRN/GDN | **Present** (side effects of unload/post) |
| Storage invoices later → portal | **Present** via `storage/invoice` (DRAFT) + `invoices/{id}/post` (+ optional send) |
| OVERDUE / OVER_BILL lot labels | **Present** on `GET /wms/ops-board` (+ lot-aging) |
| Ops board | **Present** |

**Conclusion:** the updated warehouse workflow is largely **already implemented in the API**. Remaining work is mostly **FE wiring**, contract hardening, and a few **optional** clarity endpoints.

### 4.2 Frontend gaps (API exists — FE not calling yet)

These live in Swagger but are **missing from** `src/features/wms/api/wms.api.ts` / ASN detail actions today:

| Missing in FE | Path |
|---------------|------|
| Mark picked | `POST /wms/asns/{id}/mark-picked` |
| Mark unloading | `POST /wms/asns/{id}/mark-unloading` |
| Mark unloaded (auto GRN) | `POST /wms/asns/{id}/mark-unloaded` |
| Resend GRN | `POST /wms/asns/{id}/resend-grn` |
| Resend GDN | `POST /wms/gdos/{id}/resend-gdn` |
| Ops board page | `GET /wms/ops-board` |

ASN detail UI currently exposes only **Confirm** + **Cancel** — not the full yard path.

### 4.3 Still “missing” / incomplete for product polish (optional — do not change the flow)

Only add these if product needs them; they are **not** required to invent a new state machine:

| Gap | Suggested endpoint / behaviour | Why |
|-----|--------------------------------|-----|
| Portal list of warehouse docs by type | Ensure `GET /portal/shipments/{id}/documents` returns JobDocuments typed `GRN` / `GDN` / storage invoice | Customer diagram “portal shipment documents” |
| Notify on storage invoice post | Notification event when finance posts storage invoice | Diagram “storage invoices later” |
| Require `job_id` on ASN/GRN/GDO | Validation when warehouse job exists | Guarantee email/portal JobDocument attach |
| Explicit warehouse status on portal | `GET /portal/shipments/{id}/warehouse-status` | Customer-safe yard projection without `/portal/wms` |
| Gate structured check-in | Optional `POST /wms/gate/check-in` | Diagram gate scan is covered today by `/jobs/scan` |

Do **not** add `/portal/wms/*`.

### 4.4 Portal warehouse quotation + booking form (live OpenAPI gap)

Source: `GET https://kingfisherwings-backend.onrender.com/docs-json` (checked against this FE work).

#### Quotation request (`PortalQuotationRequestDto` / estimate)

| Field / behaviour | Live API | Portal FE |
|-------------------|----------|-----------|
| `job_type: WAREHOUSE` | **Present** in enum | Supported on Request a quote |
| `warehouse_id` / bonded / storage days | **Missing** on portal quote DTOs | Captured in **special_requirements** + full fields on booking form after accept |
| `origin_port_id` / `dest_port_id` | Optional freight hubs | Warehouse treats as optional **pickup → warehouse location** (like road) |
| Packages / weight / CBM / pieces / services | Present | Used for estimate/costing |

#### Booking form after accept

| Endpoint | Live API | Notes |
|----------|----------|-------|
| `GET/PUT /jobs/{id}/warehouse/booking-form` | **Present** (staff, needs job) | `UpsertWarehouseBookingFormDto` |
| `POST /jobs/{id}/warehouse/booking-form/complete` | **Present** | Staff complete |
| `GET/PUT /portal/quotations/{id}/warehouse/booking-form` | **MISSING** | — |
| `GET/PUT /portal/shipments/{id}/warehouse/booking-form` | **MISSING** | — |
| `GET/PUT /portal/.../booking-form` (generic) | **MISSING** | Only NVOCC bookings + Air shipments **compliance-form** |
| `POST /portal/quotations/{id}/convert-to-job` | **MISSING** | Staff `POST /quotations/{id}/convert-to-job` exists; portal FE soft-tries portal then staff path |
| Portal masters warehouses list | **No** `/portal/lookups/warehouses` | Staff uses `GET /masters/warehouses`; portal collects `warehouse_name` free-text |

**FE workaround (current):** Warehouse customer form maps to `UpsertWarehouseBookingFormDto` fields (pickup, warehouse name, stock lines, cargo_category, DG, storage flags, warehouse attach_*). Saves via **local draft + `/portal/messages`** (never NVOCC/Air compliance PUT, which would strip warehouse fields). Staff loads message/draft into `/jobs/{id}/warehouse/booking-form` after convert.

#### Backend asks (to close the gap)

1. `GET/PUT /portal/quotations/{id}/warehouse/booking-form` (+ optional submit) accepting `UpsertWarehouseBookingFormDto` while quote is accepted but pre-job.  
2. `POST /portal/quotations/{id}/convert-to-job` (or convert-on-booking-form-complete).  
3. Optional: `warehouse_id` / storage hints on `PortalQuotationRequestDto`, and `GET /portal/lookups/warehouses`.

---

## 5. Staff vs customer split (unchanged product rule)

```
Staff-only (/wms/*, /invoices post, /jobs/scan)
  ASN yard · GRN · lots · GDO · storage calculate · DRAFT invoice · ops board
        │ job linked behind the scenes
        ▼
Customer portal (no /portal/wms)
  Quotations → accept warehouse service → Shipments / job status
  Email PDFs (GRN/GDN) + Portal shipment documents
  Invoices + pay (posted only) · Documents · Messages / disputes
```

---

## 6. Recommended FE implementation order (match API, don’t invent flow)

1. Wire ASN detail buttons: **Confirm → Mark picked → Mark unloading → Mark unloaded** (+ Cancel / Resend GRN).  
2. Wire GDO detail: **Post** + **Resend GDN**.  
3. Add **Ops board** page on `GET /wms/ops-board` (OVERDUE / OVER_BILL).  
4. Keep storage: calculate → invoice DRAFT → finance **Post** → portal invoices.  
5. Verify portal shipment documents show GRN/GDN JobDocuments after unload/dispatch.  
6. Keep barcode scan station issuing full job details on any device (`/jobs/barcode-scan`).

---

## 7. Quick checklist vs Swagger

- [x] All `/wms/*` paths listed in §2 (settings, items, ASN yard, GRN, GDO, stock, transfers, storage, ops-board)  
- [x] Masters warehouses + storage slabs  
- [x] Invoice post/send  
- [x] Job barcode lookup/scan/label  
- [x] Portal shipments documents / invoices / notifications (no portal WMS)  
- [ ] FE calls for `mark-picked` / `mark-unloading` / `mark-unloaded` / `resend-grn` / `resend-gdn` / `ops-board`

Re-pull anytime:

```text
GET https://kingfisherwings-backend.onrender.com/docs-json
```
