# NVOCC / Air Freight / Portal / Masters — dummy test data

Test payloads and example IDs for every endpoint in the sea-NVOCC and air-freight
workflow set, plus the two ULD/container master catalogs they depend on.

Backend Swagger: <https://kingfisherwings-backend.onrender.com/docs#/>

Coverage of these endpoints across the API-path / service / UI layers is verified by
`node scripts/audit-nvocc-air-portal-coverage.mjs` (exit code 0 = every endpoint wired).

---

## 0. Quote API split (preserve other modes)

| Mode | Quote / commercial APIs | Notes |
|---|---|---|
| **NVOCC** export/import | After customer approve: **no auto convert / no job**. Portal compliance form → Ops `booking-form` / `send-invoice` → booking `convert-to-job` / CRO | Matches sea-export flowchart + live OpenAPI |
| **Air** export/import | After customer approve: **no auto convert**. Portal `/portal/shipments/:id/accept` + compliance-form → staff `INVOICE_SENT` → export/import ops | Matches air flowchart + live OpenAPI |
| **All other** job types (FCL, LCL, land, courier, …) | Existing `/quotations/*` lifecycle (approve → auto `convert-to-job` + draft invoice) | **Unchanged** |

> Shared commercial (customer portal compliance form — same `UpsertNvoccBookingFormDto`):
>
> - NVOCC: `POST /portal/bookings/{id}/accept` + `GET/PUT …/compliance-form` + `POST …/submit`
> - Air: `POST /portal/shipments/{id}/accept` + `GET/PUT …/compliance-form` + `POST …/submit`
>   (+ `POST …/documents/{kind}`)
>
> Exact staff gates (no auto convert-to-job; do not skip stages):
>
> `QUOTE_REQUESTED` → `CS_TRIAGED` → `QUOTE_SENT` → `CUSTOMER_ACCEPTED` →
> `BOOKING_FORM_COMPLETE` → `INVOICE_SENT`
>
> 1. Customer portal completes compliance form (above) → `BOOKING_FORM_COMPLETE`
> 2. Air invoice: draft via `POST /invoices/from-job/{id}` then `POST /jobs/{id}/air/send-invoice`
> 3. NVOCC: Ops may mirror via `PUT /nvocc/bookings/{id}/booking-form` then `POST …/send-invoice`

Frontend panels enforce the NVOCC/Air button order; backend should reject out-of-order gates.

---

## 1. Conventions

All IDs below are **placeholders** — swap in real UUIDs from your tenant. They follow a
stable prefix scheme so you can find-and-replace per fixture:

| Placeholder | Meaning | Example value |
|---|---|---|
| `{BOOKING_ID}` | NVOCC booking UUID | `6f1b7c1e-1111-4a01-9f00-0000000b0001` |
| `{SEA_JOB_ID}` | Job UUID, `job_type` = `NVOCC_EXPORT` / `NVOCC_IMPORT` | `6f1b7c1e-2222-4a01-9f00-0000000j0001` |
| `{AIR_JOB_ID}` | Job UUID, `job_type` = `AIR_EXPORT` / `AIR_IMPORT` | `6f1b7c1e-3333-4a01-9f00-0000000j0002` |
| `{CONTAINER_REQUEST_ID}` | NVOCC container request UUID | `6f1b7c1e-4444-4a01-9f00-0000000c0001` |
| `{ULD_REQUEST_ID}` | Air ULD request UUID | `6f1b7c1e-5555-4a01-9f00-0000000u0001` |
| `{SHIPMENT_ID}` | Portal shipment UUID (same as the staff job UUID) | `6f1b7c1e-2222-4a01-9f00-0000000j0001` |
| `{LINE_ID}` | Portal container / ULD line UUID | `6f1b7c1e-6666-4a01-9f00-0000000l0001` |
| `{CONTAINER_TYPE_ID}` | `/masters/container-types` row UUID | `6f1b7c1e-7777-4a01-9f00-0000000m0001` |
| `{AIR_PALLET_TYPE_ID}` | `/masters/air-pallet-types` row UUID | `6f1b7c1e-8888-4a01-9f00-0000000m0002` |
| `{AIRLINE_ID}`, `{ORIGIN_AIRPORT_ID}`, `{DEST_AIRPORT_ID}` | Master UUIDs | from `/masters/airlines`, `/masters/airports` |

**Auth headers**

| Surface | Header |
|---|---|
| Staff (`/jobs`, `/nvocc`, `/masters`) | `Authorization: Bearer <staff access token>` |
| Customer portal (`/portal/**`) | `Authorization: Bearer <portal access token>` |

All workflow action endpoints accept an **empty JSON body** (`{}`); the fields shown below
are optional enrichment that the backend stores on the milestone/audit record. The frontend
sends `{}` by default from every workflow button.

---

## 2. Staff NVOCC — bookings

Module: `src/features/nvocc`. UI: **NVOCC → Bookings → open a booking**
(`/nvocc/bookings/{BOOKING_ID}`, `NvoccBookingDetailPage`).

### POST `/nvocc/bookings/{BOOKING_ID}/cs-triage`

Grants the customer portal access for this booking. Button: **CS triage**.

```json
{
  "assigned_to_user_id": "6f1b7c1e-9999-4a01-9f00-0000000u0100",
  "priority": "HIGH",
  "notes": "Dummy triage — shipper confirmed on call, portal access granted."
}
```

### POST `/nvocc/bookings/{BOOKING_ID}/mark-quote-sent`

Button: **Mark quote sent**.

OpenAPI body is `WorkflowStageOverrideDto` only — do **not** send `quotation_id`
(forbidNonWhitelisted → HTTP 400 `property quotation_id should not exist`).

```json
{
  "admin_override": true,
  "stage_override_reason": "Staff mark quote sent after portal quote QT/NE/26/00051."
}
```

Optional empty body `{}` is also valid.

### GET `/nvocc/bookings/{BOOKING_ID}/booking-form`

Staff Ops. Returns the sea booking form; 404 until first save is expected.

### PUT `/nvocc/bookings/{BOOKING_ID}/booking-form`

Ops upsert (`UpsertNvoccBookingFormDto`). Save draft (`mark_complete: false`) then complete.
If stage is still `QUOTE_SENT` after customer already approved the quote, FE retries with
`admin_override: true`.

> Portal customer form uses `/portal/bookings/{id}/compliance-form` (NVOCC) or
> `/portal/shipments/{id}/compliance-form` (Air) — same DTO. Do not call
> `/portal/quotations/.../booking-form` or `.../air-booking-form`.

### POST `/nvocc/bookings/{BOOKING_ID}/send-invoice`

```json
{
  "pol": "Al Fujayrah",
  "pod": "Abu Musa",
  "commodity": "Electronics gadgets",
  "hs_code": "85171200",
  "gross_weight_kg": 86,
  "teu_count": 1,
  "date_of_request": "2026-09-17",
  "voyage_ref": "VYG-DUMMY-001",
  "booking_agent_line": "KINGFISHER",
  "agent_requester_name": "Ops Tester",
  "sq_bl_booking_reference": "QT/NE/26/00035",
  "is_dg": false,
  "shipper_owned_container": false,
  "mark_complete": false,
  "request_details": "From QT/NE/26/00035 — Al Noor Trading LLC.",
  "parties": [
    {
      "party_kind": "SHIPPER",
      "full_name": "Al Noor Trading LLC",
      "address": "Office 12, Al Noor Building, Abu Dhabi",
      "city": "Abu Dhabi",
      "country": "AE",
      "entity_kind": "COMPANY"
    },
    {
      "party_kind": "CONSIGNEE",
      "full_name": "Consignee TBD",
      "address": "Abu Musa Port Area",
      "city": "Abu Musa",
      "country": "AE",
      "entity_kind": "COMPANY"
    },
    {
      "party_kind": "NOTIFY",
      "full_name": "Same as consignee",
      "address": "Abu Musa Port Area",
      "entity_kind": "COMPANY"
    }
  ]
}
```

Backend requires **SHIPPER**, **CONSIGNEE**, and **NOTIFY** party blocks (with `full_name` + `address`).

**Stage gate:** after customer accepts the quote, the **customer** completes the booking form in
Customer Portal (`PUT /portal/quotations/{QUOTE_ID}/booking-form`). Staff waits on the booking page
and only sends invoice after `BOOKING_FORM_COMPLETE`. Staff `/nvocc/bookings/.../booking-form` is a
mirror / admin-assist path — not the happy path.

If API returns “intermediate stages… Current: QUOTE_SENT” when completing, FE may retry with
`admin_override` after the customer already submitted.

### PUT `/nvocc/bookings/{BOOKING_ID}/booking-form`

Admin-assist only (collapsed on booking detail). Same body as above.

### GET/PUT `/portal/quotations/{QUOTE_ID}/booking-form`

Customer Portal → open approved quote → **Submit booking form** (`PortalBookingFormPanel`).
Same body as staff UpsertNvoccBookingFormDto.

**Air:** do **not** use `/portal/quotations/.../air-booking-form` (that route does not exist).
FE tries, in order:

1. `PUT /portal/shipments/{JOB_ID}/air-booking-form` (when quote has `job_id`)
2. `PUT /portal/shipments/{JOB_ID}/booking-form`
3. `PUT /portal/quotations/{QUOTE_ID}/booking-form`

### POST `/nvocc/bookings/{BOOKING_ID}/send-invoice`

Button: **Send invoice**.

Requires backend stage **BOOKING_FORM_COMPLETE** (after quote accept + completed booking form). If still `QUOTE_SENT`, FE first completes booking-form with `admin_override`, then retries send-invoice; on remaining gate errors it posts:

```json
{
  "admin_override": true,
  "stage_override_reason": "Customer accepted quote; advancing gated stages to INVOICE_SENT."
}
```

Optional fields (when linking an existing invoice):

```json
{
  "invoice_id": "6f1b7c1e-cccc-4a01-9f00-0000000i0001",
  "to_email": "accounts.test@dummy-shipper.example",
  "cc": "ops.test@dummy-shipper.example",
  "message": "Dummy proforma invoice for booking KFW-BKG-0001."
}
```

---

## 3. Staff NVOCC — jobs (sea export ops)

UI: **Jobs → open an `NVOCC_*` job → Documents tab** → *Container requests* and
*Ops milestones* cards (`NvoccJobWorkflowPanel`), plus the gated HBL generators.

### GET `/nvocc/jobs/{SEA_JOB_ID}/container-requests`

No body. Expected item shape:

```json
[
  {
    "id": "{CONTAINER_REQUEST_ID}",
    "job_id": "{SEA_JOB_ID}",
    "container_type_id": "{CONTAINER_TYPE_ID}",
    "container_type_code": "40HC",
    "quantity": 2,
    "status": "REQUESTED",
    "cro_number": null,
    "container_number": null,
    "notes": "Dummy request"
  }
]
```

### POST `/nvocc/jobs/{SEA_JOB_ID}/container-requests`

Form: *Container type ID / Quantity / Notes* → **Create request**.

```json
{
  "container_type_id": "{CONTAINER_TYPE_ID}",
  "quantity": 2,
  "notes": "Dummy CRO request — 2 x 40HC for stuffing on 20 Sep."
}
```

### POST `/nvocc/jobs/{SEA_JOB_ID}/container-requests/{CONTAINER_REQUEST_ID}/issue`

Button: **Issue CRO**.

```json
{
  "cro_number": "CRO-DUMMY-0001",
  "depot_name": "Jebel Ali CFS Dummy Depot",
  "valid_until": "2026-09-25",
  "notes": "Dummy CRO issued to shipper."
}
```

### POST `/nvocc/jobs/{SEA_JOB_ID}/container-requests/{CONTAINER_REQUEST_ID}/allocate`

Button: **Allocate**.

```json
{
  "container_number": "KFWU1234567",
  "seal_number": "SEAL-DUMMY-001",
  "tare_weight": 3900,
  "notes": "Dummy allocation after gate-out."
}
```

### POST `/nvocc/jobs/{SEA_JOB_ID}/stage/loading`

Button: **Mark loading**.

```json
{
  "loaded_at": "2026-09-20T08:30:00.000Z",
  "terminal": "Jebel Ali Terminal 2 (dummy)",
  "notes": "Dummy loading confirmation."
}
```

### POST `/nvocc/jobs/{SEA_JOB_ID}/accounts/confirm-payment`

Button: **Confirm payment**. Unlocks the gated HBL original.

```json
{
  "amount": 4850.00,
  "currency_code": "USD",
  "payment_reference": "TT-DUMMY-2026-0001",
  "paid_at": "2026-09-21T10:00:00.000Z",
  "notes": "Dummy telegraphic transfer received."
}
```

### POST `/nvocc/jobs/{SEA_JOB_ID}/documents/hbl-draft-gated`

Generator button: **HBL draft (gated)**. Requires the portal draft-BL request first.

```json
{
  "layout_variant": "KFW_STANDARD",
  "number_of_originals": 0
}
```

### POST `/nvocc/jobs/{SEA_JOB_ID}/documents/hbl-original-gated`

Generator button: **HBL original (gated)**. Requires confirmed payment.

```json
{
  "layout_variant": "KFW_STANDARD",
  "is_original": true,
  "number_of_originals": 3
}
```

### POST `/nvocc/jobs/{SEA_JOB_ID}/close-report`

Button: **Close report**.

```json
{
  "closed_at": "2026-09-30T12:00:00.000Z",
  "remarks": "Dummy job close — P&L reconciled, no open disputes."
}
```

---

## 4. Portal NVOCC (customer login)

UI: **Portal → Shipments → open a sea/NVOCC shipment**
(`/portal/shipments/{SHIPMENT_ID}`, `PortalShipmentDetailPage`).

### GET `/portal/shipments/{SHIPMENT_ID}/container-requests`

No body. `normalizePortalContainerRequests` reads these snake_case keys (it also accepts
`request_id` / `container_line_id` as the line identifier):

```json
[
  {
    "id": "{LINE_ID}",
    "line_id": "{LINE_ID}",
    "container_type_code": "40HC",
    "quantity": 2,
    "status": "CRO_ISSUED",
    "cro_number": "CRO-DUMMY-0001",
    "container_number": "KFWU1234567",
    "can_confirm_pick": true,
    "notes": "Dummy portal container line."
  }
]
```

> The **Confirm pick** button is disabled when `can_confirm_pick` is `false`, or when
> `status` already contains `PICK` / equals `PICKED` / `ALLOCATED`.

### POST `/portal/shipments/{SHIPMENT_ID}/containers/{LINE_ID}/confirm-pick`

Button: **Confirm pick** on a container line.

```json
{
  "picked_up_at": "2026-09-19T06:15:00.000Z",
  "driver_name": "Dummy Driver",
  "vehicle_number": "DXB-DUMMY-1234",
  "notes": "Dummy empty pick-up confirmed by shipper."
}
```

### POST `/portal/shipments/{SHIPMENT_ID}/port-token/confirm`

Button: **Confirm port token**.

```json
{
  "token_number": "PORT-TOKEN-DUMMY-0001",
  "gate_in_at": "2026-09-20T05:45:00.000Z",
  "notes": "Dummy gate-in token from terminal."
}
```

### POST `/portal/shipments/{SHIPMENT_ID}/request-draft-bl`

Button: **Request draft BL**. Gates the staff-side `hbl-draft-gated` generator.

```json
{
  "remarks": "Dummy draft BL request — please verify consignee address.",
  "requested_by_email": "ops.test@dummy-shipper.example"
}
```

---

## 5. Masters — container types & air pallet (ULD) types

UI: **Masters → Container Type** (`/masters/container-types`) and
**Masters → Air Pallet Types** (`/masters/air-pallet-types`). Both use the generic
`MasterResourceListPage` / `MasterResourceFormPage` CRUD screens and expose a
**Seed defaults** button (`supportsSeedDefaults: true`).

### POST `/masters/container-types/seed-defaults`

Body: `{}`. Response shape observed from the seed endpoints:

```json
{ "success": true, "type": "container-types", "catalog_size": 12, "inserted": 12 }
```

> Seeding no-ops when the tenant already has rows (including soft-deleted ones).

### GET `/masters/container-types`

Query: `?page=1&limit=50&search=40&is_active=true`

### POST `/masters/container-types`

`size` must be one of the Swagger enum values: `SIZE_20GP`, `SIZE_40GP`, `SIZE_40HC`,
`SIZE_45HC`, `SIZE_20REEFER`, `SIZE_40REEFER`, `SIZE_20OT`, `SIZE_40OT`, `SIZE_20FR`,
`SIZE_40FR`, `SIZE_20TANK`, `SIZE_40TANK`.

```json
{
  "code": "40HC",
  "name": "40ft High Cube",
  "size": "SIZE_40HC",
  "teu": 2,
  "max_payload": 26500,
  "volume_cbm": 76.3,
  "is_active": true
}
```

Second fixture (reefer):

```json
{
  "code": "20RF",
  "name": "20ft Reefer",
  "size": "SIZE_20REEFER",
  "teu": 1,
  "max_payload": 27700,
  "volume_cbm": 28.3,
  "is_active": true
}
```

### PATCH `/masters/container-types/{CONTAINER_TYPE_ID}`

```json
{ "max_payload": 26800, "volume_cbm": 76.0, "is_active": true }
```

### DELETE `/masters/container-types/{CONTAINER_TYPE_ID}`

No body. Soft-delete.

### POST `/masters/air-pallet-types/seed-defaults`

Body: `{}`. Same response shape as above with `"type": "air-pallet-types"`.

### GET `/masters/air-pallet-types`

Query: `?page=1&limit=50&search=PMC`

### POST `/masters/air-pallet-types`

```json
{
  "code": "PMC",
  "name": "PMC pallet (P6P)",
  "max_payload": 6800,
  "volume_cbm": 15,
  "length_cm": 318,
  "width_cm": 244,
  "height_cm": 163,
  "is_active": true
}
```

Second fixture (AKE container):

```json
{
  "code": "AKE",
  "name": "AKE LD3 container",
  "max_payload": 1588,
  "volume_cbm": 4.3,
  "length_cm": 156,
  "width_cm": 153,
  "height_cm": 163,
  "is_active": true
}
```

### PATCH `/masters/air-pallet-types/{AIR_PALLET_TYPE_ID}`

```json
{ "max_payload": 6900, "is_active": true }
```

### DELETE `/masters/air-pallet-types/{AIR_PALLET_TYPE_ID}`

No body. Soft-delete.

---

## 6. Staff air freight (base `/jobs`)

UI: **Jobs → open an `AIR_EXPORT` / `AIR_IMPORT` job → Ops / Mode tab**
(`AirJobWorkflowPanel` + *Air details* + *Air booking form* cards), and the
**Documents tab** for the gated generators.

### POST `/jobs/{AIR_JOB_ID}/air/cs-triage`

Button: **CS triage**.

```json
{
  "assigned_to_user_id": "6f1b7c1e-9999-4a01-9f00-0000000u0100",
  "priority": "NORMAL",
  "notes": "Dummy air triage — routing DXB→LHR confirmed."
}
```

### POST `/jobs/{AIR_JOB_ID}/air/mark-quote-sent`

Button: **Mark quote sent**.

```json
{
  "quotation_id": "6f1b7c1e-aaaa-4a01-9f00-0000000q0002",
  "sent_to_email": "ops.test@dummy-shipper.example",
  "notes": "Dummy air quote sent — USD 3.85/kg all-in."
}
```

### GET `/jobs/{AIR_JOB_ID}/air-booking-form`

No body. Button: **Reload form**. Body matches `UpsertAirBookingFormDto`:

```json
{
  "commodity": "Electronic spare parts",
  "pieces": 24,
  "gross_weight_kg": 1840.5,
  "chargeable_weight_kg": 2100,
  "flight_number": "EK007",
  "flight_date": "2026-09-22",
  "origin_airport_code": "DXB",
  "dest_airport_code": "LHR",
  "is_dg": false,
  "mark_complete": true,
  "parties": [
    {
      "party_kind": "SHIPPER",
      "full_name": "Al Noor Trading LLC",
      "city": "Dubai",
      "country": "AE",
      "entity_kind": "COMPANY"
    },
    {
      "party_kind": "CONSIGNEE",
      "full_name": "Consignee TBD",
      "city": "London",
      "country": "GB",
      "entity_kind": "COMPANY"
    },
    {
      "party_kind": "NOTIFY",
      "full_name": "Same as consignee",
      "entity_kind": "COMPANY"
    }
  ]
}
```

### PUT `/jobs/{AIR_JOB_ID}/air-booking-form`

Button: **Save booking form**. Same body as above (do not send legacy `airline_id` / `*_airport_id` / `hawb_number`).

### POST `/jobs/{AIR_JOB_ID}/air/send-invoice`

Button: **Send invoice** (also chained after booking-form mark_complete).

OpenAPI body is `MarkAirInvoiceSentDto`. Ensure a draft invoice exists, then pass its id:

1. Prefer `POST /invoices/from-job/{AIR_JOB_ID}` when the job has uninvoiced billable charges
2. Otherwise `POST /invoices` with `party_id` = job shipper, `job_id`, and charge lines (or a placeholder line)
3. `POST /jobs/{AIR_JOB_ID}/air/send-invoice` with `{ "invoice_id": "…" }`

```json
{
  "invoice_id": "6f1b7c1e-cccc-4a01-9f00-0000000i0002"
}
```

Optional override fields when the job stage lags: `admin_override`, `stage_override_reason`.
### GET `/jobs/{AIR_JOB_ID}/air/uld-requests`

No body (export jobs). Expected item shape:

```json
[
  {
    "id": "{ULD_REQUEST_ID}",
    "job_id": "{AIR_JOB_ID}",
    "air_pallet_type_id": "{AIR_PALLET_TYPE_ID}",
    "air_pallet_type_code": "PMC",
    "quantity": 2,
    "status": "REQUESTED",
    "uld_number": null,
    "notes": "Dummy ULD request"
  }
]
```

### POST `/jobs/{AIR_JOB_ID}/air/uld-requests`

Form: *Air pallet type ID / Quantity / Notes* → **Create ULD request**.

```json
{
  "air_pallet_type_id": "{AIR_PALLET_TYPE_ID}",
  "quantity": 2,
  "notes": "Dummy ULD request — 2 x PMC for build-up on 21 Sep."
}
```

### POST `/jobs/{AIR_JOB_ID}/air/uld-requests/{ULD_REQUEST_ID}/issue`

Button: **Issue ULD**.

```json
{
  "issued_at": "2026-09-21T07:00:00.000Z",
  "handler": "Dnata Cargo Dummy Terminal",
  "notes": "Dummy ULD release note issued."
}
```

### POST `/jobs/{AIR_JOB_ID}/air/uld-requests/{ULD_REQUEST_ID}/allocate`

Button: **Allocate**.

```json
{
  "uld_number": "PMC12345EK",
  "allocated_at": "2026-09-21T09:30:00.000Z",
  "notes": "Dummy ULD allocated at build-up."
}
```

### POST `/jobs/{AIR_JOB_ID}/air/stage/build-up` — export only

Button: **Mark build-up**.

```json
{
  "built_up_at": "2026-09-21T11:00:00.000Z",
  "pieces": 24,
  "gross_weight": 1840.5,
  "notes": "Dummy build-up complete, 2 ULDs tendered."
}
```

### POST `/jobs/{AIR_JOB_ID}/air/stage/mawb-issued` — export only

Button: **MAWB issued**.

```json
{
  "mawb_number": "176-12345675",
  "issued_at": "2026-09-21T13:00:00.000Z",
  "notes": "Dummy MAWB issued by airline."
}
```

### POST `/jobs/{AIR_JOB_ID}/air/stage/mawb-received` — import only

Button: **MAWB received**.

```json
{
  "mawb_number": "176-98765430",
  "received_at": "2026-09-23T04:20:00.000Z",
  "notes": "Dummy MAWB received from origin agent."
}
```

### POST `/jobs/{AIR_JOB_ID}/air/stage/pod` — import only

Button: **POD received**.

```json
{
  "delivered_at": "2026-09-25T14:05:00.000Z",
  "received_by": "Dummy Consignee Warehouse",
  "notes": "Dummy POD signed, 24 pieces intact."
}
```

### POST `/jobs/{AIR_JOB_ID}/air/accounts/confirm-payment`

Button: **Confirm payment**. Unlocks the gated CAN / delivery-order generators.

```json
{
  "amount": 7350.00,
  "currency_code": "USD",
  "payment_reference": "TT-DUMMY-2026-0002",
  "paid_at": "2026-09-24T10:00:00.000Z",
  "notes": "Dummy payment received against air invoice."
}
```

### POST `/jobs/{AIR_JOB_ID}/air/close-report`

Button: **Close report**.

```json
{
  "closed_at": "2026-09-30T12:00:00.000Z",
  "remarks": "Dummy air job close — POD on file, charges reconciled."
}
```

### Gated air document generators

All five live on the **Documents tab → Generate PDF** card and accept a
`GenerateJobDocumentDto`. Empty `{}` is valid; the fields below exercise the optional ones.

| Endpoint | Button | Dummy body |
|---|---|---|
| `POST /jobs/{AIR_JOB_ID}/documents/hawb-draft-gated` | HAWB draft (gated) | `{ "layout_variant": "KFW_STANDARD", "is_original": false }` |
| `POST /jobs/{AIR_JOB_ID}/documents/hawb-final-gated` | HAWB final (gated) | `{ "layout_variant": "KFW_STANDARD", "is_original": true, "number_of_originals": 3 }` |
| `POST /jobs/{AIR_JOB_ID}/documents/pre-can-gated` | Pre-CAN (gated) | `{ "layout_variant": "KFW_STANDARD" }` |
| `POST /jobs/{AIR_JOB_ID}/documents/can-gated` | CAN (gated) | `{ "layout_variant": "KFW_STANDARD" }` |
| `POST /jobs/{AIR_JOB_ID}/documents/delivery-order-gated` | Delivery order (gated) | `{ "layout_variant": "KFW_STANDARD" }` |

---

## 7. Portal air (customer login)

UI: **Portal → Shipments → open an `AIR_*` shipment** (`PortalShipmentDetailPage`).

### GET `/portal/shipments/{SHIPMENT_ID}/uld-requests`

No body. `normalizePortalUldRequests` reads these snake_case keys (it also accepts
`request_id` / `uld_line_id` as the line identifier):

```json
[
  {
    "id": "{LINE_ID}",
    "line_id": "{LINE_ID}",
    "air_pallet_type_code": "PMC",
    "quantity": 2,
    "status": "ISSUED",
    "uld_number": "PMC12345EK",
    "can_confirm_dropoff": true,
    "notes": "Dummy portal ULD line."
  }
]
```

> The **Confirm drop-off** button is disabled when `can_confirm_dropoff` is `false`, or when
> `status` already contains `DROP` / equals `DROPPED` / `CARGO_DROPPED_OFF`.

### POST `/portal/shipments/{SHIPMENT_ID}/uld-lines/{LINE_ID}/confirm-dropoff`

Button: **Confirm drop-off** on a ULD line.

```json
{
  "dropped_off_at": "2026-09-21T06:40:00.000Z",
  "driver_name": "Dummy Driver",
  "vehicle_number": "DXB-DUMMY-5678",
  "notes": "Dummy cargo delivered to build-up area."
}
```

### POST `/portal/shipments/{SHIPMENT_ID}/request-draft-hawb`

Button: **Request draft HAWB**. Gates the staff-side `hawb-draft-gated` generator.

```json
{
  "remarks": "Dummy draft HAWB request — confirm notify party.",
  "requested_by_email": "ops.test@dummy-shipper.example"
}
```

### POST `/portal/shipments/{SHIPMENT_ID}/request-delivery-order`

Button: **Request delivery order**. Gates the staff-side `delivery-order-gated` generator.

```json
{
  "remarks": "Dummy DO request — collection on 26 Sep.",
  "delivery_address": "Plot 42, Dummy Industrial Area, Dubai",
  "requested_by_email": "ops.test@dummy-shipper.example"
}
```

---

## 8. Related endpoints (unchanged, still wired)

### PATCH `/jobs/{AIR_JOB_ID}/air-details`

UI: **Ops / Mode tab → Air details → Save air details**.

```json
{
  "airline_id": "{AIRLINE_ID}",
  "origin_airport_id": "{ORIGIN_AIRPORT_ID}",
  "dest_airport_id": "{DEST_AIRPORT_ID}",
  "hawb_number": "KFW-HAWB-000123",
  "mawb_number": "176-12345675",
  "flight_number": "EK007",
  "flight_date": "2026-09-22",
  "screened": true,
  "screening_ref": "RA3-DUMMY-0001",
  "awb_type": "Direct",
  "freight_type": "Prepaid",
  "conversion_factor": 6000
}
```

### Ungated document generators

All on the **Documents tab → Generate PDF** card; `{}` is a valid body.

| Endpoint | Button | Dummy body |
|---|---|---|
| `POST /jobs/{AIR_JOB_ID}/documents/hawb` | HAWB | `{ "layout_variant": "KFW_STANDARD", "number_of_originals": 3 }` |
| `POST /jobs/{AIR_JOB_ID}/documents/mawb` | MAWB | `{ "layout_variant": "IATA_NEUTRAL" }` |
| `POST /jobs/{AIR_JOB_ID}/documents/pre-can` | Pre-CAN | `{ "layout_variant": "KFW_STANDARD" }` |
| `POST /jobs/{AIR_JOB_ID}/documents/can` | CAN | `{ "layout_variant": "KFW_STANDARD" }` |
| `POST /jobs/{AIR_JOB_ID}/documents/delivery-order` | Delivery order | `{ "layout_variant": "KFW_STANDARD" }` |

Generation is asynchronous — poll `GET /jobs/{id}/documents/generation-status`
(sea NVOCC jobs use `GET /nvocc/jobs/{id}/documents/generation-status`). The Documents
panel starts polling automatically after a generate click.

---

## 9. End-to-end happy paths

### Sea / NVOCC export

1. `POST /masters/container-types/seed-defaults` — catalog available.
2. `POST /nvocc/bookings/{BOOKING_ID}/cs-triage` — portal opens for the customer.
3. `POST /nvocc/bookings/{BOOKING_ID}/mark-quote-sent`.
4. Ops: `GET` then `PUT /nvocc/bookings/{BOOKING_ID}/booking-form` (`mark_complete: true`).
5. `POST /nvocc/bookings/{BOOKING_ID}/send-invoice`.
6. `POST /nvocc/bookings/{BOOKING_ID}/convert-to-job` → container requests / CRO.
7. `…/container-requests/{CONTAINER_REQUEST_ID}/issue` → `…/allocate`.
8. Portal: `POST /portal/shipments/{SHIPMENT_ID}/containers/{LINE_ID}/confirm-pick`.
9. Portal: `POST /portal/shipments/{SHIPMENT_ID}/port-token/confirm`.
10. Staff: `POST /nvocc/jobs/{SEA_JOB_ID}/stage/loading`.
11. Portal: `POST /portal/shipments/{SHIPMENT_ID}/request-draft-bl`.
12. Staff: `POST /nvocc/jobs/{SEA_JOB_ID}/documents/hbl-draft-gated`.
13. Staff: `POST /nvocc/jobs/{SEA_JOB_ID}/accounts/confirm-payment`.
14. Staff: `POST /nvocc/jobs/{SEA_JOB_ID}/documents/hbl-original-gated`.
15. Staff: `POST /nvocc/jobs/{SEA_JOB_ID}/close-report`.

### Air export

1. Approve quotation only (no convert). Manual Start air ops job shell.
2. `POST /jobs/{AIR_JOB_ID}/air/cs-triage` → `…/air/mark-quote-sent`.
3. Customer accept (portal / Mark approved) — still no convert.
4. `GET` then `PUT /jobs/{AIR_JOB_ID}/air-booking-form` (`mark_complete: true`).
5. `POST /jobs/{AIR_JOB_ID}/air/send-invoice`.
6. `POST …/air/uld-requests` → `…/issue` (ULD_REQUEST_ISSUED) ∥ `…/allocate` (ULD_ALLOCATED).
7. Portal: `POST …/uld-lines/{LINE_ID}/confirm-dropoff` (CARGO_DROPPED_OFF).
8. `POST …/air/stage/build-up`.
9. `POST …/documents/hawb-draft-gated` ∥ `POST …/air/stage/mawb-issued`.
10. `POST …/air/accounts/confirm-payment`.
11. `POST …/documents/hawb-final-gated`.
12. `POST …/air/close-report`.

### Air import

1. Same shared commercial through `INVOICE_SENT` (steps 1–5 above).
2. `POST …/air/stage/mawb-received`.
3. `POST …/documents/pre-can-gated`.
4. `POST …/documents/can-gated`.
5. `POST …/air/accounts/confirm-payment`.
6. Portal request-delivery-order → `POST …/documents/delivery-order-gated`.
7. `POST …/air/stage/pod`.
8. `POST …/air/close-report`.

---

## 10. Where each endpoint lives in the frontend

| Layer | Sea / NVOCC | Air freight | Portal | Masters |
|---|---|---|---|---|
| Paths | `src/features/nvocc/api/nvocc.api.ts` | `src/features/jobs/api/job.api.ts` | `src/features/portal-shipments/api/portalShipments.api.ts` | `src/features/masters/api/masterPaths.ts` |
| Service | `nvocc/services/nvocc.service.ts` | `jobs/services/job.service.ts` | `portal-shipments/services/portalShipments.service.ts` | `masters/services/master.service.ts` |
| Hooks | `nvocc/hooks/useNvoccJobs.ts`, `useNvocc.ts` | `jobs/hooks/useAirJobWorkflow.ts`, `useJobs.ts` | `portal-shipments/hooks/usePortalShipments.ts` | `masters/hooks` + `config/masterResources.ts` |
| UI | `NvoccJobWorkflowPanel`, `NvoccJobDocumentsPanel`, `NvoccBookingDetailPage` | `AirJobWorkflowPanel`, `JobOpsPanel`, `JobDocumentsPanel` | `PortalShipmentDetailPage` | `MasterResourceListPage`, `MasterResourceFormPage` |
