# Job types — wrong / negative test cases + E2E department flow (dummy data)

Source of truth: live OpenAPI  
`GET https://kingfisherwings-backend.onrender.com/docs-json`

**Purpose**

- Exercise **every** `job_type` from **customer portal quote request → sales → CS/ops → docs → accounts**, including **intentional wrong inputs** that the API/UI should reject or keep blocked.
- Happy-path values for forms live in the sibling demo docs (see § Index). This file focuses on **wrong cases**, **department handoffs**, and compact **valid dummy** payloads so you can still drive the flow.

Replace `*(UUID…)*` with real tenant masters / parties.

---

## 0) Job types covered (do not skip)

| # | `job_type` | Primary surfaces | Happy-path dummy doc |
|---|------------|------------------|----------------------|
| 1 | `AIR_EXPORT` | Portal quote → Air compliance → Staff air ops | [nvocc-air-portal-api-dummy-data.md](./nvocc-air-portal-api-dummy-data.md), [job-types-demo-test-data.md](./job-types-demo-test-data.md) §6 |
| 2 | `AIR_IMPORT` | same | same |
| 3 | `SEA_FCL_EXPORT` | Portal/staff quote → sea-fcl booking form → convert → ops | [job-types-demo-test-data.md](./job-types-demo-test-data.md) §1 |
| 4 | `SEA_FCL_IMPORT` | same | same |
| 5 | `SEA_LCL_EXPORT` | Portal/staff quote → sea-lcl booking form → convert → ops | [job-types-demo-test-data.md](./job-types-demo-test-data.md) §2 |
| 6 | `SEA_LCL_IMPORT` | same | same |
| 7 | `LAND` | Quote → land booking form → convert → road/land ops | [job-types-demo-test-data.md](./job-types-demo-test-data.md) §4 |
| 8 | `ROAD_FREIGHT` | Quote → road-freight booking form → convert → ops | [job-types-demo-test-data.md](./job-types-demo-test-data.md) §3 |
| 9 | `COURIER` | Quote → courier booking form → convert → ops | [job-types-demo-test-data.md](./job-types-demo-test-data.md) §5 |
| 10 | `CUSTOMS_CLEARANCE` | Quote → CC booking form → CC stage rail | [customs-clearance-demo-test-data.md](./customs-clearance-demo-test-data.md) |
| 11 | `NVOCC_EXPORT` | Portal quote → NVOCC compliance → booking → CRO → job | [nvocc-air-portal-api-dummy-data.md](./nvocc-air-portal-api-dummy-data.md) |
| 12 | `NVOCC_IMPORT` | same | same |
| 13 | `SERVICE_JOB` | Staff quote / job create → service ops | §6 below |
| 14 | `WAREHOUSE` | Quote → WH booking form → WMS | [warehouse-video-demo-test-data.md](./warehouse-video-demo-test-data.md) |

---

## 1) Shared cast (valid dummy parties)

| Role | Dummy value |
|------|-------------|
| Portal customer | **Gulf Horizon Logistics LLC** · rania.suwaidi@gulfhorizon-demo.example · +971 50 441 8890 |
| Wrong / unknown email | `not-a-customer@nowhere.invalid` |
| Shipper CN | Shenzhen Apex Electronics Co. Ltd · export@apex-sz-demo.example |
| Consignee AE | Gulf Horizon Logistics LLC · Al Quoz 3, Dubai |
| Billing | ap@gulfhorizon-demo.example |
| Salesperson | *(active salesperson UUID)* |
| Branch / company | *(tenant branch + company UUID)* |
| Sea origin / dest | `*(CNSHA place UUID)*` / `*(AEJEA place UUID)*` |
| Air origin / dest | `*(DXB airport UUID)*` / `*(FRA airport UUID)*` |
| Container type | `*(40HC container-type UUID)*` |
| Currency | `USD` (or tenant base) |
| HS | `8517.12` |

**Wrong masters (reuse in negative cases)**

| Field | Wrong value | Expected |
|-------|-------------|----------|
| `customer_id` | `00000000-0000-0000-0000-000000000000` | 400/404 party not found |
| `currency_code` | `XXXX` / `usd` (if API enforces ISO upper) | 400 validation |
| `job_type` | `SEA_EXPORT` / `AIR` / `FCL` | 400 unknown enum |
| Port UUID | Airport UUID on sea shipment (or vice versa) | 400 / empty lookup |
| Dates | `to` before `from`, `etd` after `eta` | 400 or soft warning |
| Weight | `-10`, `0` when required, `abc` | 400 |
| Email | `rania@`, `@@`, blank required | 400 |
| File upload | `.json`, `.exe`, empty file | 400 (PDF/JPEG/PNG only on portal proofs / forms) |

---

## 2) Department handoff map (all job types)

Use this order unless a mode-specific gate says otherwise (Air / NVOCC do **not** auto-convert).

```
1. CUSTOMER PORTAL     → request quote / accept / booking or compliance form
2. SALES / CS          → triage enquiry, build quotation, send to customer
3. CUSTOMER            → accept / reject quote
4. DOCUMENTATION / OPS → booking form complete, convert / open job, docs
5. OPERATIONS          → mode workflow (sea/air/road/CC/NVOCC/WH)
6. CUSTOMS (if needed) → CC stages or job customs status
7. ACCOUNTS / FINANCE  → draft invoice, send, payment proof / Stripe / AR
8. CLOSE               → complete / close job
```

| Dept | Typical UI | What to verify |
|------|------------|----------------|
| Portal | `/portal/book`, `/portal/quotes`, `/portal/invoices` | Request appears; status advances |
| Sales | `/sales/enquiries`, `/sales/lead`, `/quotations` | Enquiry/quote linked to customer |
| CS / Quotation | `/quotations/:id` | Approve / send / reject |
| Ops jobs | `/jobs/...` list + detail | Correct `job_type`, panels visible |
| Docs | Job documents / documentation module | Required docs block progress when missing |
| Accounts | `/invoices`, `/finance/online-payments` | Invoice from job; pay / proof |
| CC desk | `/customs-clearance` | Queue shows **job name**, not raw UUID |

---

## 3) Global wrong cases (run once, apply to every job type)

### 3.A Portal — request quote (`PortalQuotationRequestDto` / book flow)

| ID | Case | Dummy / action | Expected |
|----|------|----------------|----------|
| G-P01 | Missing `job_type` | Omit job type | Block submit / 400 |
| G-P02 | Invalid `job_type` | `SEA_EXPORT` | 400 |
| G-P03 | Empty commodity | `commodity` = `""` | 400 / field error |
| G-P04 | Negative weight | `gross_weight` = `-5` | 400 |
| G-P05 | Origin = destination | Same port/airport twice | 400 or warning |
| G-P06 | Sea job + airport IDs | FCL with airport UUIDs | Reject or wrong catalog |
| G-P07 | Air job + sea port IDs | AIR_EXPORT with sea ports | Reject or wrong catalog |
| G-P08 | Unauthenticated submit | Clear portal session | Redirect login / 401 |
| G-P09 | Wrong file on form | Attach `.json` booking payload file | 400 Only PDF/JPEG/PNG |
| G-P10 | Double submit | Spam submit twice | One quote / idempotent |

### 3.B Staff quotation (`CreateQuotationDto`)

| ID | Case | Dummy / action | Expected |
|----|------|----------------|----------|
| G-Q01 | Missing `customer_id` | Blank customer | 400 |
| G-Q02 | Fake `customer_id` | Nil UUID | 404/400 |
| G-Q03 | Missing `currency_code` | Blank | 400 |
| G-Q04 | Line without price | `unit_price` blank / `-1` | 400 |
| G-Q05 | Approve without lines | Empty lines then approve | Blocked |
| G-Q06 | Convert before customer accept (Air/NVOCC) | Force convert-to-job early | Blocked / wrong stage |
| G-Q07 | Convert cancelled quote | Status CANCELLED then convert | 400 |
| G-Q08 | Send quote to bad email | `to` = `bad@` | 400 |

### 3.C Booking / compliance form

| ID | Case | Dummy / action | Expected |
|----|------|----------------|----------|
| G-B01 | Complete without consent | `consent_accepted` = `false` | 400 |
| G-B02 | Complete with empty required parties | No SHIPPER / CONSIGNEE | 400 |
| G-B03 | DG true without class | `is_dg` = true, `dg_class` blank | 400 |
| G-B04 | Skip complete → convert | Convert while form draft | Blocked |
| G-B05 | Wrong party_kind | `party_kind` = `CLIENT` | 400 |

### 3.D Job / finance

| ID | Case | Dummy / action | Expected |
|----|------|----------------|----------|
| G-J01 | Open wrong mode panel | Open air ULD on sea FCL job | Hidden / 404 |
| G-J02 | Invoice before ops ready (Air/NVOCC) | Send invoice before `BOOKING_FORM_COMPLETE` | Blocked |
| G-J03 | Pay paid invoice | Pay Now on PAID invoice | Disabled / 400 |
| G-J04 | Partial pay when disabled | Amount less than balance | 400 if partial off |
| G-J05 | Refund never-paid | Refund pending checkout | 400 |

---

## 4) Per job-type — valid mini dummy + wrong cases

Use the **Valid mini payload** to create a quote, then run the **Wrong cases** against that type.

### 4.1 `AIR_EXPORT` / `AIR_IMPORT`

**Valid mini quote**

| Field | EXPORT | IMPORT |
|-------|--------|--------|
| `job_type` | `AIR_EXPORT` | `AIR_IMPORT` |
| `customer_id` | *(Gulf Horizon)* | same |
| `currency_code` | `USD` | `USD` |
| `incoterm` | `EXW` | `DAP` |
| `commodity` | `Pharma samples — air` | `Pharma samples — air import` |
| `hs_code` | `8517.12` | same |
| `gross_weight` / `chargeable_weight` | `320` / `350` | same |
| `pieces` | `12` | `12` |
| `origin_port_id` | *(DXB airport)* | *(FRA airport)* |
| `dest_port_id` | *(FRA airport)* | *(DXB airport)* |
| `special_requirements` | `Temp control 2–8°C` | same |

**Department path**

Portal request → Sales quote → Send → Portal accept → Portal air compliance form → Staff `INVOICE_SENT` → Air ops (ULD / docs) → Invoice / pay → Complete.

**Wrong cases**

| ID | Case | Dummy | Expected |
|----|------|-------|----------|
| AE01 | Sea port on air quote | `origin_port_id` = Jebel Ali sea UUID | Reject / wrong mode |
| AE02 | Accept before quote sent | Portal accept on DRAFT | 400 |
| AE03 | Compliance submit empty | Submit empty compliance form | 400 |
| AE04 | Auto convert-to-job | Expect job immediately after approve | Must **not** auto-convert |
| AE05 | ULD confirm wrong line | Fake `{LINE_ID}` | 404 |
| AE06 | DG without MSDS attach | `is_dg` true, no MSDS flag/file | Block complete |

---

### 4.2 `SEA_FCL_EXPORT` / `SEA_FCL_IMPORT`

**Valid mini quote**

| Field | EXPORT | IMPORT |
|-------|--------|--------|
| `job_type` | `SEA_FCL_EXPORT` | `SEA_FCL_IMPORT` |
| `customer_id` | *(Gulf Horizon)* | same |
| `currency_code` | `USD` | `USD` |
| `incoterm` | `FOB` | `CIF` |
| `commodity` | `Electronics FCL` | `Electronics FCL import` |
| `container_type_id` | *(40HC)* | *(40HC)* |
| `container_count` | `1` | `1` |
| `gross_weight` / `volume_cbm` | `12500` / `55` | same |
| `origin_port_id` / `dest_port_id` | AEJEA → CNSHA | CNSHA → AEJEA |

**Lines:** Ocean freight `1850`, THC `220`, Docs `85` (USD).

**Department path**

Portal/staff quote → Approve → Booking form complete → Convert job → Docs (CI/PL/BL) → Sea ops → Invoice → Pay → Close.

**Wrong cases**

| ID | Case | Dummy | Expected |
|----|------|-------|----------|
| FCL01 | `container_count` = `0` | 0 | 400 |
| FCL02 | LCL fields on FCL | Send LCL package dims only | Ignore / 400 |
| FCL03 | Airport as POL | DXB airport UUID | 400 |
| FCL04 | Complete form `mark_complete` false | still call complete | 400 |
| FCL05 | Convert twice | Second convert | 400 / no duplicate job |
| FCL06 | Gate-in before stuffed (if staged) | Skip container status | Reject transition |

---

### 4.3 `SEA_LCL_EXPORT` / `SEA_LCL_IMPORT`

**Valid mini quote**

| Field | Value |
|-------|--------|
| `job_type` | `SEA_LCL_EXPORT` or `SEA_LCL_IMPORT` |
| `currency_code` | `USD` |
| `commodity` | `Garments — LCL` |
| `gross_weight` / `volume_cbm` / `pieces` | `2100` / `12.5` / `48` |
| Ports | EXPORT AEJEA→CNSHA · IMPORT reverse |

**Wrong cases**

| ID | Case | Dummy | Expected |
|----|------|-------|----------|
| LCL01 | FCL container_count required path | Force `container_count` without LCL pkgs | Inconsistent / 400 |
| LCL02 | `volume_cbm` = `0` | 0 | 400 |
| LCL03 | Negative pieces | `-2` | 400 |
| LCL04 | Co-load without master BL refs (ops) | Blank MBL when required | Block stage |

---

### 4.4 `ROAD_FREIGHT`

**Valid mini quote**

| Field | Value |
|-------|--------|
| `job_type` | `ROAD_FREIGHT` |
| `currency_code` | `AED` |
| `commodity` | `Palletized FMCG — road` |
| `gross_weight` / `pieces` | `4800` / `20` |
| `special_requirements` | `Dubai → Abu Dhabi · tautliner · 2 days` |

**Booking snippet:** `service_scope` = `DOOR_TO_DOOR`, origin/dest door addresses filled, `etd`/`eta` set.

**Wrong cases**

| ID | Case | Dummy | Expected |
|----|------|-------|----------|
| RD01 | Empty door addresses | Blank origin + dest door | 400 on complete |
| RD02 | ETA before ETD | eta < etd | 400 |
| RD03 | Use sea POL/POD only | No road scope | Incomplete form |
| RD04 | Courier AWB panel on road job | Open courier-only action | Not available |

---

### 4.5 `LAND`

**Valid mini quote**

| Field | Value |
|-------|--------|
| `job_type` | `LAND` |
| `currency_code` | `AED` |
| `commodity` | `Machinery parts — land` |
| `gross_weight` | `3500` |

**Wrong cases**

| ID | Case | Dummy | Expected |
|----|------|-------|----------|
| LN01 | Treat as ROAD_FREIGHT API only | Call `/road-freight/booking-form` on LAND job | 404 / wrong mode |
| LN02 | Missing land booking-form fields | Empty `UpsertLandBookingFormDto` complete | 400 |
| LN03 | Cross-border without docs flags | Border move, no CI/PL attach | Soft block / 400 |

---

### 4.6 `COURIER`

**Valid mini quote**

| Field | Value |
|-------|--------|
| `job_type` | `COURIER` |
| `customer_id` | *(QuickParcel ME or Gulf Horizon)* |
| `currency_code` | `AED` |
| `commodity` | `Documents + samples` |
| `gross_weight` / `pieces` | `8.5` / `2` |
| Airports | DXB → BAH (airports, not sea) |

**Wrong cases**

| ID | Case | Dummy | Expected |
|----|------|-------|----------|
| CR01 | Sea ports on courier | CNSHA/AEJEA | 400 |
| CR02 | Container type set | 40HC on courier | 400 / ignored |
| CR03 | Huge weight as courier | `gross_weight` = `12500` | Warning / still validate |
| CR04 | DG lithium without declaration | `is_dg` true, no DGD attach | 400 |

---

### 4.7 `CUSTOMS_CLEARANCE`

**Valid mini quote**

| Field | Value |
|-------|--------|
| `job_type` | `CUSTOMS_CLEARANCE` |
| `customer_id` | *(Desert Pearl Trading LLC)* |
| `currency_code` | `AED` |
| `commodity` | `Telecom handsets — import clearance` |
| `hs_code` | `8517.12` |

**Department path**

Quote → CC booking form → Convert → **Open CC** → docs → classify → file → assess → duty → clear → release → invoice → close · Queue title = **job name**.

**Wrong cases**

| ID | Case | Dummy | Expected |
|----|------|-------|----------|
| CC01 | Skip Open CC | Start classify first | 400 stage order |
| CC02 | Docs-complete with empty checklist | Seed skipped | 400 |
| CC03 | Classify invalid HS | `9999.99` | Validate fail |
| CC04 | Duty-paid before assess | Jump stage | 400 |
| CC05 | Close while QUERY open | Unclosed query | 400 |
| CC06 | Queue filter invalid status | `status=FOO` | 400 / empty |
| CC07 | Portal CC doc non-image/pdf | `.txt` | 400 |

---

### 4.8 `NVOCC_EXPORT` / `NVOCC_IMPORT`

**Valid mini quote**

| Field | EXPORT | IMPORT |
|-------|--------|--------|
| `job_type` | `NVOCC_EXPORT` | `NVOCC_IMPORT` |
| `currency_code` | `USD` | `USD` |
| `commodity` | `NVOCC consol electronics` | same import |
| Ports | AEJEA→CNSHA | reverse |
| `container_type_id` / count | 40HC / 1 | same |

**Department path**

Portal quote → CS triage → Quote sent → Customer accept → Portal **booking compliance** → Ops booking-form / send-invoice → CRO / containers → **convert-to-job** → Sea job ops → Accounts.

**Wrong cases**

| ID | Case | Dummy | Expected |
|----|------|-------|----------|
| NV01 | Auto job on approve | Expect job id immediately | Must stay booking, no auto job |
| NV02 | CRO before booking form complete | Early CRO | Blocked |
| NV03 | Convert before `INVOICE_SENT` / required gate | Force convert | 400 |
| NV04 | Wrong booking id on portal form | Fake booking UUID | 404 |
| NV05 | Confirm pick on wrong line | Bad `{LINE_ID}` | 404 |
| NV06 | Import export mismatch | NVOCC_EXPORT booking with import-only action | 400 |

---

### 4.9 `SERVICE_JOB`

**Valid mini quote / create**

| Field | Value |
|-------|--------|
| `job_type` | `SERVICE_JOB` |
| `customer_id` | *(Gulf Horizon)* |
| `currency_code` | `AED` |
| `commodity` | `Survey / inspection service` |
| `special_requirements` | `Warehouse survey · 1 day · Dubai` |
| `remarks` | `SERVICE-DEMO-001` |

**Department path**

Sales/CS create quote or job → Ops perform service → Docs (report) → Invoice → Pay → Complete.  
(No sea/air booking-form rail required.)

**Wrong cases**

| ID | Case | Dummy | Expected |
|----|------|-------|----------|
| SJ01 | Sea container panel | Add FCL containers | Not applicable / hidden |
| SJ02 | Portal NVOCC compliance URL | Open booking compliance for service quote | 404 |
| SJ03 | Convert mode booking-form | Call `/sea-fcl/booking-form/complete` | 404 |
| SJ04 | Empty commodity + blank remarks | Both empty | 400 |
| SJ05 | Negative service line amount | `-100` | 400 |

---

### 4.10 `WAREHOUSE`

**Valid mini quote**

| Field | Value |
|-------|--------|
| `job_type` | `WAREHOUSE` |
| `customer_id` | *(Gulf Horizon)* |
| `currency_code` | `AED` |
| `commodity` | `Bonded storage — electronics` |
| `special_requirements` | `Inbound GRN · rack A1 · 30 days` |

**Department path**

Quote → WH booking form → Convert / WMS job → GRN → storage → GDN → Invoice → Close.  
Detail: [warehouse-video-demo-test-data.md](./warehouse-video-demo-test-data.md).

**Wrong cases**

| ID | Case | Dummy | Expected |
|----|------|-------|----------|
| WH01 | GDN before GRN | Issue stock out first | 400 |
| WH02 | Over-pick qty | GDN qty > on-hand | 400 |
| WH03 | Sea POL on WH quote only | Only ports, no WH scope | Incomplete |
| WH04 | Portal air compliance on WH | Open shipment compliance | 404 |
| WH05 | Negative storage days | `-7` | 400 |

---

## 5) Cross-department wrong sequences (all types)

| ID | Sequence | Expected |
|----|----------|----------|
| X01 | Accounts invoice → Ops never opened job | Invoice may exist as draft only; ops panels empty |
| X02 | Customer portal pay → staff never sent invoice | No Pay Now / 404 |
| X03 | Docs upload after job CANCELLED | 400 |
| X04 | Sales edits quote after customer accepted (locked) | 400 or read-only |
| X05 | Two departments complete same stage twice | Second call idempotent or 400 |
| X06 | Switch `job_type` after convert | Not allowed |
| X07 | Portal user accesses another party’s quote id | 403/404 |
| X08 | Staff uses portal-only endpoint without portal token | 401 |
| X09 | Super-admin platform invoice APIs on tenant job | 403 |
| X10 | CC queue shows only UUID | **Fail test** — must show job name / number / customer |

---

## 6) Suggested test run sheet (copy per job type)

For each of the **14** types:

1. **Happy path** — use sibling demo doc dummy data → quote → departments → invoice.
2. **Wrong portal request** — G-P01…G-P07 for that type’s ports/airports rules.
3. **Wrong quote** — G-Q01…G-Q05.
4. **Wrong booking/compliance** — G-B01…G-B04 + type-specific table.
5. **Wrong stage skip** — X01…X06 + type-specific stage cases (esp. Air/NVOCC/CC/WH).
6. **Record** — request id, quote id, job/booking id, HTTP status, UI message.

| Job type | Happy OK | Wrong portal | Wrong quote | Wrong form | Wrong stage | Notes |
|----------|----------|--------------|-------------|------------|-------------|-------|
| AIR_EXPORT | ☐ | ☐ | ☐ | ☐ | ☐ | |
| AIR_IMPORT | ☐ | ☐ | ☐ | ☐ | ☐ | |
| SEA_FCL_EXPORT | ☐ | ☐ | ☐ | ☐ | ☐ | |
| SEA_FCL_IMPORT | ☐ | ☐ | ☐ | ☐ | ☐ | |
| SEA_LCL_EXPORT | ☐ | ☐ | ☐ | ☐ | ☐ | |
| SEA_LCL_IMPORT | ☐ | ☐ | ☐ | ☐ | ☐ | |
| LAND | ☐ | ☐ | ☐ | ☐ | ☐ | |
| ROAD_FREIGHT | ☐ | ☐ | ☐ | ☐ | ☐ | |
| COURIER | ☐ | ☐ | ☐ | ☐ | ☐ | |
| CUSTOMS_CLEARANCE | ☐ | ☐ | ☐ | ☐ | ☐ | |
| NVOCC_EXPORT | ☐ | ☐ | ☐ | ☐ | ☐ | |
| NVOCC_IMPORT | ☐ | ☐ | ☐ | ☐ | ☐ | |
| SERVICE_JOB | ☐ | ☐ | ☐ | ☐ | ☐ | |
| WAREHOUSE | ☐ | ☐ | ☐ | ☐ | ☐ | |

---

## 7) Index of related demo docs

| Doc | Use for |
|-----|---------|
| [job-types-demo-test-data.md](./job-types-demo-test-data.md) | Valid UI field values (FCL/LCL/Road/Land/Courier/Air/NVOCC) |
| [nvocc-air-portal-api-dummy-data.md](./nvocc-air-portal-api-dummy-data.md) | NVOCC/Air portal + ops API payloads |
| [customs-clearance-demo-test-data.md](./customs-clearance-demo-test-data.md) | Full CC stage rail |
| [warehouse-video-demo-test-data.md](./warehouse-video-demo-test-data.md) | Warehouse / WMS |
| This file | **Wrong cases + department E2E matrix for all 14 job types** |
