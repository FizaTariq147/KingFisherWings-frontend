# Customs Clearance — complete demo data (manual test)

Source of truth: live OpenAPI  
`GET https://kingfisherwings-backend.onrender.com/docs-json`

Covers quotation → booking form → convert → full CC job stages (open → docs → classify → file → assess → duty → exam → clear → release → invoice → close) → portal CC.

Enter values yourself in the UI. Replace UUID placeholders with real IDs from your tenant.

---

## Flow (do not skip stage order)

```
CUSTOMS_CLEARANCE quotation → Approve
  → Customer / staff booking form (UpsertCustomsClearanceBookingFormDto) → Complete
  → Convert to job (mode booking-form convert flow)
  → Job → Open CC
  → Docs checklist (seed → receive/verify → docs-complete)
  → Cargo lines + classify HS → stage classify
  → Declaration + filing → stage file
  → Assess (+ optional query) → stage assess
  → Duty payment request → stage duty-paid
  → Optional customs examination
  → Stage clear → release → invoice-ready → close
  → Customer: /portal/cc-jobs*
```

---

## Cast / masters (create first)

| Role | Enter this |
|------|------------|
| Customer / importer | **Desert Pearl Trading LLC** |
| Contact | Layla Al Mansouri |
| Email | layla.mansouri@desertpearl-demo.example |
| Phone | +971 50 778 2211 |
| Address | Suite 1404, Business Bay Tower, Dubai, UAE |
| CHA / broker party | **KingFisher CHA Desk** (party type agent/broker if available) |
| Shipper (origin) | Shenzhen Apex Electronics Co. Ltd · Shenzhen, CN |
| Consignee | Desert Pearl Trading LLC · Dubai, AE |
| Notify | Same as consignee · +971 50 778 2211 |
| Billing | Desert Pearl Trading LLC — Accounts · ap@desertpearl-demo.example |
| Agent | KingFisher Wings — Customs desk · Sara CC Ops |
| Border / port | Jebel Ali Port / Terminal 1 |
| HS master (optional) | `8517.12` — Telephones for cellular networks |

**Suggested HS master** (`POST /masters/hs-codes` or Masters UI):

| Field | Value |
|-------|--------|
| `hs_code` | `8517.12` |
| `description` | `Telephones for cellular networks` |
| `import_duty_rate` | `5` |
| `export_duty_rate` | `0` |
| `dg_class` | *(blank)* |
| `un_number` | *(blank)* |
| `is_prohibited` | `false` |
| `is_restricted` | `false` |
| `notes` | `Demo CC HS — Desert Pearl import` |
| `is_active` | `true` |

Validate anytime: `/customs-clearance/hs-validate` → `8517.12`

---

## A) Staff quotation — `CreateQuotationDto`

Required: `job_type`, `customer_id`, `currency_code`.

| Field | Dummy value |
|-------|-------------|
| `job_type` | `CUSTOMS_CLEARANCE` |
| `customer_id` | *(UUID of Desert Pearl Trading LLC)* |
| `currency_code` | `AED` |
| `company_id` | *(tenant company UUID)* |
| `salesperson_id` | *(salesperson UUID or blank)* |
| `branch_id` | *(branch UUID or blank)* |
| `department_id` | *(customs / CS department UUID or blank)* |
| `carrier_id` | *(optional — leave blank or CHA trucker)* |
| `origin_port_id` | *(CN / Shenzhen or Shanghai place UUID — or blank)* |
| `dest_port_id` | *(Jebel Ali / Dubai place UUID — or blank)* |
| `incoterm` | `CIF` |
| `commodity` | `Mobile phones / cellular handsets — import clearance` |
| `hs_code` | `8517.12` |
| `gross_weight` | `850` |
| `chargeable_weight` | `850` |
| `volume_cbm` | `4.2` |
| `length_m` / `width_m` / `height_m` | `0.6` / `0.4` / `0.35` |
| `packages[]` | L 60 cm · W 40 · H 35 · gross_weight_kg `8.5` · pieces `100` |
| `pieces` | `100` |
| `container_type_id` / `container_count` | *(blank for pure CC)* |
| `is_dg` / `dg_class` | `false` / *(blank)* |
| `special_requirements` | `IMPORT clearance · Jebel Ali Port · BOE home consumption · CIF USD 48500 · CHA KingFisher · docs: CI+PL+BL+COO+POA` |
| `carrier_preference` | `KingFisher CHA preferred` |
| `transit_time_days` | `5` |
| `routing_notes` | `CN origin → Jebel Ali Port · entry BOE · release to Desert Pearl Dubai warehouse` |
| `remarks` | `Demo CC import. After booking form complete, open CC job and run full stage rail.` |
| `internal_notes` | `Demo CC#1 — Desert Pearl · HS 8517.12 · CIF USD 48500` |
| `valid_until` | `2026-11-30` |
| `exchange_rate` | `1` |
| `discount_percent` / `discount_amount` | `0` / `0` |
| `source` | `STAFF` |

### A.1) Quotation lines — `CreateQuotationLineDto`

| Line | description | unit | qty | unit_price | currency | is_cost | sort |
|------|-------------|------|-----|------------|----------|---------|------|
| 1 | Customs clearance agency fee — import BOE | Per shipment | 1 | 1200 | AED | false | 1 |
| 2 | Documentation & filing | Per shipment | 1 | 350 | AED | false | 2 |
| 3 | Examination attendance (if selected) | Per shipment | 1 | 250 | AED | false | 3 |

Use real `charge_code_id` UUIDs from your charge-code master (e.g. CUSTOMS_FEE / DOC_FEE).

---

## B) Portal quotation request — `PortalQuotationRequestDto`

| Field | Dummy value |
|-------|-------------|
| `job_type` | `CUSTOMS_CLEARANCE` |
| `currency_code` | `AED` |
| `origin_port_id` / `dest_port_id` | *(optional hubs)* |
| `commodity` | `Mobile phones / cellular handsets — import clearance` |
| `gross_weight` / `chargeable_weight` | `850` / `850` |
| `volume_cbm` / `pieces` | `4.2` / `100` |
| `special_requirements` | `IMPORT · Jebel Ali · BOE · CIF USD 48500 · need CHA clearance` |
| `valid_until` | `2026-11-30` |
| `service_codes` | e.g. `["CUSTOMS_CLEARANCE","DOCUMENTATION"]` |
| `customer_lines` | code `CUSTOMS_CLEARANCE` · qty 1 · unit_price 1200 · unit `Per shipment` · source `CUSTOMER_PROPOSED` |
| `estimate_snapshot` | currency `AED` · estimated_total `1800` · captured_at `2026-09-29T10:00:00.000Z` |

---

## C) Booking form — `UpsertCustomsClearanceBookingFormDto` (every field)

Staff: `PUT /jobs/{id}/customs-clearance/booking-form` (+ `/complete`)  
Portal: after accept (draft / messages if no dedicated portal CC booking-form path).

| Field | Dummy value |
|-------|-------------|
| `date_of_request` | `2026-09-29` |
| `client_booking_no` | `DP-CC-2026-0017` |
| `voyage_ref` | `CC-IMP-2026-0017` |
| `service_scope` | `PORT_TO_DOOR` |
| `origin_door_address` | `Shenzhen Apex Electronics — bonded export warehouse, Shenzhen` |
| `dest_door_address` | `Desert Pearl Trading LLC warehouse — Al Quoz Ind. 3, Dubai` |
| `commodity` | `Mobile phones / cellular handsets` |
| `hs_code` | `8517.12` |
| `cargo_category` | `GENERAL` |
| `is_dg` / `dg_class` | `false` / *(blank)* |
| `gross_weight_kg` / `net_weight_kg` | `850` / `780` |
| `volume_cbm` / `pieces` | `4.2` / `100` |
| `insurance_details` | `Cargo CIF insurance — policy DP-CIF-22091 · USD 48500` |
| `request_details` | `Import BOE home consumption · Jebel Ali · release after duty paid` |
| `etd` | `2026-09-20T08:00` |
| `eta` | `2026-09-28T14:00` |
| `direction` | `IMPORT` |
| `border_or_port` | `Jebel Ali Port / Terminal 1` |
| `entry_type` | `BOE` |
| `declaration_type` | `Home consumption` |
| `port_of_entry` | `Jebel Ali` |
| `port_of_exit` | `Shenzhen / Yantian` |
| `country_of_origin` | `CN` |
| `country_of_destination` | `AE` |
| `incoterms` | `CIF` |
| `invoice_value_amount` | `48500` |
| `invoice_currency` | `USD` |
| `freight_job_id` | *(optional linked sea/air job UUID — blank if none)* |
| `mark_complete` | `true` on final submit |
| `consent_accepted` | `true` |

### C.1) Attach flags

| Flag | Value |
|------|--------|
| `attach_commercial_invoice` | `true` |
| `attach_packing_list` | `true` |
| `attach_bl_awb_copy` | `true` |
| `attach_carnet` | `false` |
| `attach_vehicle_title` | `false` |
| `attach_msds` | `false` |
| `attach_dangerous_goods_declaration` | `false` |
| `attach_health_veterinary` | `false` |
| `attach_fda_moh` | `false` |
| `attach_coo` | `true` |
| `attach_poa` | `true` |
| `attach_permit` | `false` |

### C.2) `cargo_lines` — `CcCargoLineInputDto`

| Field | Line 1 | Line 2 (optional) |
|-------|--------|-------------------|
| `description` | Smartphones — model XP-12 | Phone accessories — chargers |
| `hs_code` | `8517.12` | `8504.40` |
| `country_of_origin` | `CN` | `CN` |
| `quantity` | `80` | `20` |
| `unit` | `PCS` | `CTN` |
| `value_amount` | `42000` | `6500` |
| `currency_code` | `USD` | `USD` |

### C.3) `parties` — `BookingFormPartyDto` (all kinds)

| party_kind | full_name | address / city / country | entity | other_details |
|------------|-----------|--------------------------|--------|---------------|
| SHIPPER | Shenzhen Apex Electronics Co. Ltd | Bonded WH Zone A · Shenzhen · CN | COMPANY | export@apex-sz-demo.example |
| CONSIGNEE | Desert Pearl Trading LLC | Suite 1404, Business Bay · Dubai · AE | COMPANY | layla.mansouri@desertpearl-demo.example · +971 50 778 2211 |
| NOTIFY | Same as consignee | *(same)* · Dubai · AE | COMPANY | +971 50 778 2211 |
| BILLING | Desert Pearl Trading LLC — Accounts | Suite 1404 · Dubai · AE | COMPANY | ap@desertpearl-demo.example |
| AGENT | KingFisher Wings — Customs desk | Jebel Ali ops · Dubai · AE | COMPANY | Sara CC Ops · CHA |

---

## D) After convert — CC job workflow (UI + API payloads)

Job routes: `/jobs/customs-clearance/{id}` · hub `/customs-clearance`

### D.0) Open CC

`POST /jobs/{id}/cc/open` — no body (or empty).  
UI: workflow **Open CC**.

### D.1) CC details — `UpsertCcDetailsDto`

| Field | Value |
|-------|--------|
| `direction` | `IMPORT` |
| `cha_party_id` | *(UUID of KingFisher CHA Desk)* |
| `border_or_port` | `Jebel Ali Port / Terminal 1` |
| `remarks` | `Demo import BOE · CIF USD 48500 · HS 8517.12` |

### D.2) Docs checklist

1. `POST /jobs/{id}/cc/checklist/seed`  
2. For each item — `PATCH .../checklist/{itemId}`:

| Field | Value |
|-------|--------|
| `received` | `true` |
| `verified` | `true` |
| `job_document_id` | *(optional uploaded doc UUID)* |

Typical doc codes after seed (mark all required): commercial invoice, packing list, BL/AWB, COO, POA.

3. `POST /jobs/{id}/cc/stage/docs-complete`  
   Body (optional): `{ "admin_override": false }`

### D.3) Cargo lines — `CreateCcCargoLineDto` / classify

**Create line 1**

| Field | Value |
|-------|--------|
| `description` | `Smartphones — model XP-12` |
| `hs_code` | `8517.12` |
| `country_of_origin` | `CN` |
| `quantity` | `80` |
| `unit` | `PCS` |
| `value_amount` | `42000` |
| `currency_code` | `USD` |

**Create line 2**

| Field | Value |
|-------|--------|
| `description` | `Phone accessories — chargers` |
| `hs_code` | `8504.40` |
| `country_of_origin` | `CN` |
| `quantity` | `20` |
| `unit` | `CTN` |
| `value_amount` | `6500` |
| `currency_code` | `USD` |

**Classify** each line — `POST .../lines/{lineId}/classify` (`ClassifyCcLineDto`):

| Field | Line 1 | Line 2 |
|-------|--------|--------|
| `hs_code` | `8517.12` | `8504.40` |
| `permit_notes` | `No special permit — standard telecom import` | `Accessories — standard power supplies` |

Then: `POST /jobs/{id}/cc/stage/classify`

### D.4) Declaration + file

**Declaration** — `PUT /jobs/{id}/cc/declaration` (`UpsertCcDeclarationDto`):

```json
{
  "declaration": {
    "entry_type": "BOE",
    "declaration_type": "Home consumption",
    "importer": "Desert Pearl Trading LLC",
    "exporter_or_port": "Jebel Ali Port / Terminal 1",
    "country_of_origin": "CN",
    "country_of_destination": "AE",
    "incoterms": "CIF",
    "invoice_value_amount": 48500,
    "invoice_currency": "USD",
    "gross_weight_kg": 850,
    "pieces": 100,
    "hs_codes": ["8517.12", "8504.40"],
    "remarks": "Demo local declaration workspace"
  }
}
```

Then: `POST .../declaration/validate` → `POST .../declaration/submit-local`

**File entry** — `POST /jobs/{id}/cc/stage/file` (`FileCcEntryDto`):

| Field | Value |
|-------|--------|
| `entry_type` | `BOE` |
| `entry_number` | `BOE-AE-2026-908812` |
| `shipping_bill_number` | *(blank for IMPORT)* |
| `filing_date` | `2026-09-29` |
| `admin_override` | `false` |

Optional patch filing — `PATCH /jobs/{id}/cc/filing`:

| Field | Value |
|-------|--------|
| `entry_type` | `BOE` |
| `entry_number` | `BOE-AE-2026-908812` |
| `filing_date` | `2026-09-29` |
| `assessed_duty` | `2425` |
| `assessed_tax` | `242.5` |
| `duty_currency` | `AED` |

### D.5) Assess + query

`POST /jobs/{id}/cc/stage/assess` (`AssessCcDto`):

| Field | Value |
|-------|--------|
| `assessed_duty` | `2425` |
| `assessed_tax` | `242.5` |
| `duty_currency` | `AED` |
| `admin_override` | `false` |

**Optional query** — `POST /jobs/{id}/cc/queries`:

| Field | Value |
|-------|--------|
| `query_text` | `Please confirm HS 8517.12 vs 8517.18 for XP-12 model and attach product brochure.` |

Respond — `PATCH .../queries/{queryId}`:

| Field | Value |
|-------|--------|
| `response_text` | `Confirmed 8517.12 per manufacturer datasheet. Brochure attached to job documents.` |

Close — `POST .../queries/{queryId}/close`

### D.6) Duty

1. `POST /jobs/{id}/cc/duty-payment-request`  
2. `POST /jobs/{id}/cc/stage/duty-paid`:

| Field | Value |
|-------|--------|
| `paid_by_client` | `true` |
| `notes` | `Client paid duty BOE-AE-2026-908812 · ref DP-PAY-44102` |
| `admin_override` | `false` |

### D.7) Optional examination — `CreateCustomsExaminationDto`

`POST /jobs/{id}/customs-examinations`:

| Field | Value |
|-------|--------|
| `examination_date` | `2026-09-30` |
| `examining_officer` | `Officer R. Al Kaabi` |
| `items_examined` | `Cartons 1–10 smartphones XP-12` |
| `result` | `RELEASED` |
| `remarks` | `Physical check OK · seals intact` |

Also sync job customs status if UI uses it — `PATCH /jobs/{id}/customs-status`:

| Field | Value |
|-------|--------|
| `customs_status` | `CLEARED` |
| `customs_clearance_date` | `2026-09-30` |

### D.8) Clear → release → invoice → close

All accept optional `CcWorkflowOverrideDto`:

| Step | Path | Body |
|------|------|------|
| Clear | `POST .../cc/stage/clear` | `{ }` |
| Release | `POST .../cc/stage/release` | `{ }` |
| Entry pack PDF | `POST .../cc/documents/entry-pack` | `{ }` |
| Invoice ready | `POST .../cc/stage/invoice-ready` | `{ }` |
| Close | `POST .../cc/stage/close` | `{ }` |

Optional link freight anytime — `POST .../cc/link-freight`:

| Field | Value |
|-------|--------|
| `freight_job_id` | *(UUID of related SEA/AIR job if any)* |

Check finance: `GET .../cc/financial-summary` — expect duty/tax/fees in AED.

---

## E) Portal customer view

| Screen / API | What to check |
|--------------|----------------|
| `GET /portal/cc-jobs` | Desert Pearl CC job listed |
| `GET /portal/cc-jobs/{id}` | Direction IMPORT · border Jebel Ali · status progressing |
| `GET /portal/cc-jobs/{id}/checklist` | Docs received/verified |
| `POST /portal/cc-jobs/{id}/documents` | Upload with `PortalCcDocumentDto`: `doc_code` e.g. `COMMERCIAL_INVOICE` + `job_document_id` |
| Portal invoices | CC agency invoice after staff invoice-ready / finance post |

---

## F) Second dataset — save for later (EXPORT / Shipping Bill)

Different cast so it does not collide with Desert Pearl import.

| Role | Value |
|------|--------|
| Customer / exporter | **Oasis Textiles ME FZE** · Omar Haddad · omar.haddad@oasistextiles-demo.example · +971 55 301 6677 · RAKEZ, Ras Al Khaimah |
| Direction | `EXPORT` |
| Commodity | `Cotton apparel — men’s trousers` |
| HS | `6203.42` |
| Border | `Jebel Ali Port / Terminal 2` |
| Entry type | `SB` (Shipping Bill) |
| Declaration type | `Export general` |
| Origin / dest countries | `AE` → `PK` |
| Incoterms | `FOB` |
| Invoice value | `18200` `USD` |
| Pieces / kg / CBM | `240` / `620` / `3.1` |
| Booking refs | client `OT-CC-2026-0044` · voyage_ref `CC-EXP-2026-0044` |
| Cargo line | Cotton apparel trousers · HS `6203.42` · qty 240 · PCS · value 18200 USD · origin AE |
| Filing | entry_type `SB` · shipping_bill_number `SB-AE-2026-551203` · filing_date `2026-10-06` |
| Assess | duty `0` · tax `0` · currency `AED` (typical export) |
| Exam | result `RELEASED` · officer `Officer S. Farooq` |

Quote job_type still `CUSTOMS_CLEARANCE`; special_requirements: `EXPORT · SB · FOB USD 18200 · Jebel Ali T2`.

---

## G) Field coverage checklist

### Quotation
- [x] CreateQuotationDto (all fields usable for CUSTOMS_CLEARANCE)
- [x] CreateQuotationLineDto + CargoPackageDto
- [x] PortalQuotationRequestDto / estimate extras

### Booking form
- [x] UpsertCustomsClearanceBookingFormDto shared freight fields
- [x] CC-specific: direction, border_or_port, entry_type, declaration_type, ports, countries, incoterms, invoice value/currency, freight_job_id, etd/eta
- [x] All attach_* including attach_coo / attach_poa / attach_permit
- [x] parties (5 kinds) + cargo_lines (CcCargoLineInputDto)

### CC job ops
- [x] UpsertCcDetailsDto
- [x] Create/Update/Classify cargo lines
- [x] PatchCcChecklistItemDto + stage docs-complete
- [x] UpsertCcDeclarationDto + FileCcEntryDto + PatchCcFilingDto
- [x] AssessCcDto + CreateCcQueryDto + PatchCcQueryDto
- [x] Duty paid + CreateCustomsExaminationDto + UpdateCustomsStatusDto
- [x] Stage clear / release / invoice-ready / close + link-freight
- [x] PortalCcDocumentDto + portal cc-jobs

---

## Routes

| Screen | Path |
|--------|------|
| Staff quote | `/quotations/new` → job type Customs Clearance |
| CC hub / queue | `/customs-clearance` |
| HS validate | `/customs-clearance/hs-validate` |
| CC jobs list | `/jobs/customs-clearance` |
| CC job detail | `/jobs/customs-clearance/{id}` |
| Portal CC | `/portal/cc-jobs` (customer portal) |
| Staff invoices | `/invoices` |

---

## Quick paste card (ops desk)

```
Customer: Desert Pearl Trading LLC
Job type: CUSTOMS_CLEARANCE · IMPORT · BOE · Home consumption
Port: Jebel Ali Port / Terminal 1
HS: 8517.12 (+ 8504.40 accessories)
CIF: USD 48,500 · 100 pcs · 850 kg · 4.2 CBM
Booking: DP-CC-2026-0017 / CC-IMP-2026-0017
Entry: BOE-AE-2026-908812 · filed 2026-09-29
Duty/Tax: AED 2,425 / 242.5 · paid by client DP-PAY-44102
Exam: RELEASED · Officer R. Al Kaabi · 2026-09-30
```
