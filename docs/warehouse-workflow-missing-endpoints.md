# Warehouse full workflow — existing vs missing API endpoints

Goal behaviour: stickers look correct → customer gives handoff pack to driver → customer sees invoices → warehouse gatekeeper scans and gate-in/out.

---

## Target workflow (by actor)

| Step | Actor | Intended behaviour |
|------|--------|-------------------|
| 1 | Staff / system | Warehouse job exists; barcode sticker generated |
| 2 | Customer (portal) | Download sticker + driver gate card; assign driver |
| 3 | Driver | Presents sticker at gate (physical; optional future mobile) |
| 4 | Gatekeeper | Scan barcode; record location, vehicle, time-in |
| 5 | Warehouse | GRN post (gate-in) ± gate-pass PDF |
| 6 | Finance / WMS | Storage charges → invoice |
| 7 | Customer (portal) | List + download warehouse invoices |
| 8 | Gatekeeper / warehouse | GDO post (gate-out) ± exit pass |

---

## What already exists (partial)

| Area | Endpoint | Notes |
|------|----------|--------|
| Staff barcode lookup | `GET /jobs/by-barcode/:code` | Gate lookup |
| Staff barcode scan | `POST /jobs/scan` | `{ barcode, location?, notes? }` |
| Staff sticker PDF (server) | `POST /jobs/:id/documents/barcode-label` | Label document |
| Staff sticker PDF (FE) | Client-generated from job | Not a dedicated portal API |
| WMS GRN | `GET/POST /wms/grns`, `POST /wms/grns/:id/post` | Gate-in stock |
| WMS GDO | `GET/POST /wms/gdos`, `POST /wms/gdos/:id/post` | Gate-out stock |
| WMS GRN/GDO PDF | `GET /wms/grns/:id/pdf`, `GET /wms/gdos/:id/pdf` | Gate-pass style |
| Storage → invoice | `POST /wms/storage/calculate`, `POST /wms/storage/invoice` | Charges |
| Staff invoices | `/invoices`, from-job helpers | Finance UI |
| Portal invoices | `GET /portal/invoices`, `GET /portal/invoices/:id`, `GET /portal/invoices/:id/pdf` | Customer can see invoices **if linked** |
| Portal documents | `GET /portal/documents`, job/invoice download helpers | Generic docs; **no warehouse label type** |

---

## Missing endpoints (required for full intended behaviour)

### A. Customer portal — stickers & driver handoff

| Missing endpoint | Purpose |
|------------------|---------|
| `GET /portal/shipments/:id/warehouse-label` **or** `GET /portal/jobs/:id/barcode-label` | Customer downloads the **same sticker PDF** staff prints (CODE128 + job/cargo fields). |
| `GET /portal/shipments/:id/driver-handoff-card` **or** `POST .../driver-handoff-card/pdf` | PDF/JSON for what customer gives the driver (job ref, barcode, gate, cargo summary). |
| `PUT /portal/shipments/:id/driver-assignment` | Customer registers driver for this warehouse job: `driver_name`, `mobile`, `vehicle_plate`, `trailer_plate`, `emirates_id`, `expected_arrival_at`. |
| `GET /portal/shipments/:id/warehouse-instructions` | Gate address, dock, free days, “present sticker to gatekeeper” copy. |
| `GET /portal/shipments?job_type=WAREHOUSE` (or filter) | Clear list of warehouse jobs/shipments ready for pickup/delivery (if not already filterable). |

**Without these:** sticker print stays staff-only; “give to driver” stays offline (email/WhatsApp/paper).

---

### B. Gatekeeper — scan station (first-class, not only generic job scan)

| Missing endpoint | Purpose |
|------------------|---------|
| `POST /wms/gate/scan` **or** `POST /warehouse/gate/check-in` | Dedicated gate check-in: barcode + `direction` (`IN`/`OUT`) + `location` + `driver_name` + `vehicle_plate` + `trailer_plate` + `notes` + optional `photo_url`. |
| `GET /wms/gate/scan/:barcode` | Gatekeeper preview before commit (job, party, pieces, open GRN/GDO status). |
| `GET /wms/gate/events` | Audit list of gate scans for the shift (who scanned what, when). |
| `POST /wms/gate/check-out` | Explicit exit scan linked to GDO / job (if OUT is not the same as check-in). |

**Today:** only `POST /jobs/scan` + free-text `notes` — no structured driver/vehicle/gate direction.

---

### C. Warehouse documents — driver / vehicle on GRN & GDO

| Missing endpoint / fields | Purpose |
|---------------------------|---------|
| Extend `POST /wms/grns` body with `driver_name`, `vehicle_number`, `trailer_number`, `eid_no`, `time_in`, `gate_location` | Gate-pass PDF and ops forms show real driver data (FE create form does not send these today). |
| Extend `POST /wms/gdos` body with `driver_name`, `vehicle_number`, `time_out`, `pod_signed_by` | Exit pass + POD. |
| `GET /wms/grns/:id/gate-pass` / `GET /wms/gdos/:id/gate-pass` | Explicit gate-pass document (if generic `/pdf` is not enough). |
| `POST /wms/grns/:id/link-gate-scan` | Attach gate scan event id to GRN after Post. |

---

### D. Customer invoices — warehouse-specific clarity

| Missing endpoint | Purpose |
|------------------|---------|
| `GET /portal/invoices?job_id=` **or** `?shipment_id=` | Filter invoices for one warehouse job. |
| `GET /portal/shipments/:id/invoices` | Invoices for this warehouse shipment in one call. |
| `GET /portal/invoices/:id` already exists — ensure warehouse storage invoices are **always linked** to `job_id` / `party_id` and visible to the portal user. | Behaviour gap more than path gap. |
| Optional: `GET /portal/documents?type=WAREHOUSE_LABEL\|GATE_PASS\|STORAGE_INVOICE` | Typed document centre for warehouse pack. |

---

### E. Notifications / status (so customer knows when to give sticker to driver)

| Missing endpoint | Purpose |
|------------------|---------|
| `POST /portal/notifications` (system) / webhook events | Notify customer: `WAREHOUSE_LABEL_READY`, `GATE_IN`, `INVOICE_ISSUED`, `GATE_OUT`. |
| `GET /portal/shipments/:id/warehouse-status` | Single status rail: `LABEL_READY` → `DRIVER_ASSIGNED` → `GATE_IN` → `IN_STORAGE` → `INVOICED` → `GATE_OUT`. |

---

## Suggested minimal API pack (priority order)

Build these first for the filmed workflow to be **in-app** end-to-end:

1. `GET /portal/jobs/:id/barcode-label` (or shipment twin) — customer sticker PDF  
2. `PUT /portal/jobs/:id/driver-assignment` — driver + plate  
3. `GET /portal/jobs/:id/driver-handoff-card` — printable gate card  
4. `POST /wms/gate/check-in` — structured gatekeeper scan (IN)  
5. GRN/GDO create DTO fields for driver/vehicle/time  
6. `GET /portal/shipments/:id/invoices` — customer sees warehouse invoices for that job  
7. `POST /wms/gate/check-out` — structured gatekeeper scan (OUT)  
8. `GET /portal/shipments/:id/warehouse-status` — customer status timeline  

---

## Summary

| Actor | Works today? | Main gap |
|-------|----------------|----------|
| Sticker look (staff) | Yes (job barcode PDF + `/jobs/:id/documents/barcode-label`) | Portal download missing |
| Customer → driver | **No API** | Label + handoff card + driver assignment endpoints |
| Customer invoices | Partial (`/portal/invoices`) | Job-linked warehouse invoice list / guarantee |
| Gatekeeper | Partial (`/jobs/scan`) | Structured gate IN/OUT + driver/vehicle fields |
| GRN/GDO | Yes (create/post/pdf) | Driver/vehicle on create + gate-pass linkage |

Until the **missing portal + gate endpoints** above exist, the app can only demo: **staff sticker → offline handoff → staff scan → WMS GRN/GDO → portal invoice (if issued)**.
