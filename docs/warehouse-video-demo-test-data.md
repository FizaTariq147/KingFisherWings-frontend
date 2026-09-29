# Warehouse — complete dummy data (every live OpenAPI field)

Source: `GET https://kingfisherwings-backend.onrender.com/docs-json`  
Schemas: `CreateQuotationDto`, `CreateQuotationLineDto`, `CargoPackageDto`, `PortalQuotationRequestDto`, `PortalQuotationEstimateDto`, `PortalCustomerLineDto`, `PortalEstimateSnapshotDto`, `UpsertWarehouseBookingFormDto`, `WhStockLineInputDto`, `BookingFormPartyDto`.

Enter values yourself in the UI. Replace UUID placeholders with real IDs from your tenant masters.

---

## Cast / masters (create first)

| Role | Value |
|------|--------|
| Customer party | Al Maha Trading LLC · Fatima Al Hashimi · fatima.hashimi@almaha-demo.example · +971 50 123 4567 · Office 210, Jebel Ali Free Zone, Dubai, UAE |
| Driver | Hassan Al Mazrouei · +971 55 987 6543 · EID 784-1990-1234567-1 · plate D-48291 · trailer T-109 |
| Gatekeeper | Omar Gate Lead · JAFZA Gate 3 — inbound dock B |
| Warehouse master | Code `JAFZA-WH-01` · Name `KingFisher Jebel Ali Bonded Warehouse` · Plot WH-12, Jebel Ali Free Zone, Dubai |
| WMS item | Code `SKU-ELEC-CARTON` · Name `Electronics Carton Mix` · UOM `CTN` |

---

## A) Staff quotation — `CreateQuotationDto` (every field)

Required: `job_type`, `customer_id`, `currency_code`.

| Field | Dummy value | Notes |
|-------|-------------|--------|
| `job_type` | `WAREHOUSE` | |
| `customer_id` | *(UUID of Al Maha Trading LLC)* | required |
| `currency_code` | `AED` | required |
| `company_id` | *(tenant company UUID)* | |
| `salesperson_id` | *(salesperson UUID or blank)* | |
| `branch_id` | *(branch UUID or blank)* | |
| `department_id` | *(department UUID or blank)* | |
| `carrier_id` | *(optional trucker/warehouse operator party UUID)* | OpenAPI: AIRLINE/SHIPPING_LINE/TRUCKER |
| `origin_port_id` | *(optional pickup place UUID — or blank)* | FE label: Pickup / origin location |
| `dest_port_id` | *(optional warehouse place UUID — or blank)* | FE label: Warehouse location |
| `incoterm` | `DAP` | enum EXW…DDP |
| `commodity` | `Consumer electronics — carton storage` | |
| `hs_code` | `847130` | |
| `gross_weight` | `4200` | |
| `chargeable_weight` | `4200` | |
| `volume_cbm` | `18.5` | ignored if packages/dims sent |
| `length_m` | `1.2` | optional auto-CBM |
| `width_m` | `0.8` | |
| `height_m` | `1.0` | |
| `packages[]` | see CargoPackageDto below | |
| `pieces` | `48` | |
| `container_type_id` | *(leave blank for warehouse)* | |
| `container_count` | *(leave blank)* | |
| `is_dg` | `false` | |
| `dg_class` | *(blank unless is_dg)* | e.g. `9` if DG |
| `special_requirements` | `Pickup: Factory JAFZA · Warehouse: JAFZA-WH-01 · Bonded · 14 storage days · Gate 3 dock B · Driver presents sticker` | API has no warehouse_id on quote |
| `carrier_preference` | `KingFisher bonded CFS preferred` | |
| `transit_time_days` | `14` | storage window proxy |
| `routing_notes` | `Inbound Gate 3 dock B · outbound collection same gate` | |
| `remarks` | `Hold 7 free days then storage accrual. Driver presents sticker at Gate 3.` | |
| `internal_notes` | `Demo WH quote — Al Maha · SKU-ELEC-CARTON × 48` | |
| `valid_until` | `2026-10-31` | YYYY-MM-DD |
| `exchange_rate` | `1` | |
| `discount_percent` | `0` | |
| `discount_amount` | `0` | |
| `source` | `STAFF` | STAFF / CUSTOMER_PORTAL / ONLINE_WIDGET |

### A.1) Quotation line — `CreateQuotationLineDto`

| Field | Dummy value |
|-------|-------------|
| `charge_code_id` | *(UUID of STORAGE or WHARFAGE charge code)* |
| `description` | `Bonded warehouse storage — 14 days (demo)` |
| `unit` | `Per CBM / day` |
| `quantity` | `14` |
| `unit_price` | `85` |
| `currency_code` | `AED` |
| `exchange_rate` | `1` |
| `tax_rate_id` | *(VAT UUID or blank)* |
| `is_cost` | `false` |
| `supplier_id` | *(blank for revenue)* |
| `sort_order` | `1` |

Optional second line (handling): description `Inbound handling / gate-in`, qty `1`, unit_price `350`, unit `Per shipment`.

### A.2) Package — `CargoPackageDto` (on quote / portal estimate)

| Field | Dummy value |
|-------|-------------|
| `length_cm` | `120` |
| `width_cm` | `80` |
| `height_cm` | `100` |
| `gross_weight_kg` | `87.5` |
| `pieces` | `48` |

(Or metres: `length_m` 1.2 · `width_m` 0.8 · `height_m` 1.0)

---

## B) Portal quotation request — `PortalQuotationRequestDto` / estimate

Required: `job_type`, `currency_code`.

| Field | Dummy value |
|-------|-------------|
| `job_type` | `WAREHOUSE` |
| `currency_code` | `AED` |
| `origin_port_id` | *(optional — FE: Pickup / origin location)* |
| `dest_port_id` | *(optional — FE: Warehouse location)* |
| `commodity` | `Consumer electronics — carton storage` |
| `gross_weight` | `4200` |
| `chargeable_weight` | `4200` |
| `volume_cbm` | `18.5` |
| `pieces` | `48` |
| `container_type_id` | *(blank)* |
| `container_count` | *(blank)* |
| `special_requirements` | `Pickup: Factory JAFZA · Warehouse: CFS A · Bonded · Temp-controlled no · ~14 storage days · Gate 3 dock B` |
| `valid_until` | `2026-10-31` |
| `packages` | same CargoPackageDto as above |
| `service_codes` | e.g. `["STORAGE","HANDLING"]` *(from portal service catalog for WAREHOUSE)* |
| `customer_lines` | see PortalCustomerLineDto |
| `estimate_snapshot` | see below |

### B.1) `PortalCustomerLineDto`

| Field | Dummy value |
|-------|-------------|
| `code` | `STORAGE` |
| `charge_code_id` | *(optional UUID)* |
| `description` | `Customer proposed storage rate` |
| `quantity` | `14` |
| `unit_price` | `85` |
| `unit` | `Per day` |
| `source` | `CUSTOMER_PROPOSED` |

### B.2) `PortalEstimateSnapshotDto`

| Field | Dummy value |
|-------|-------------|
| `currency_code` | `AED` |
| `estimated_total` | `1540` |
| `captured_at` | `2026-09-29T10:00:00.000Z` |

---

## C) Warehouse booking form — `UpsertWarehouseBookingFormDto` (every field)

Staff: `PUT /jobs/{id}/warehouse/booking-form`  
Portal: draft + `/portal/messages` (no portal warehouse booking-form path in live OpenAPI).

| Field | Dummy value |
|-------|-------------|
| `date_of_request` | `2026-09-29` |
| `client_booking_no` | `AM-WH-2026-0048` |
| `voyage_ref` | `WH-BK-2026-0048` |
| `service_scope` | `DOOR_TO_DOOR` |
| `origin_door_address` | `Customer warehouse / factory — Plot F-18, Jebel Ali Free Zone, Dubai` |
| `dest_door_address` | `Collection dock B — same warehouse after storage` |
| `commodity` | `Consumer electronics — carton storage` |
| `hs_code` | `847130` |
| `cargo_category` | `GENERAL` |
| `is_dg` | `false` |
| `dg_class` | *(blank)* |
| `gross_weight_kg` | `4200` |
| `net_weight_kg` | `3900` |
| `volume_cbm` | `18.5` |
| `pieces` | `48` |
| `insurance_details` | `Customer cargo insurance — policy ALM-INS-77821 · UAE` |
| `request_details` | `Bonded inbound · 14 days · release on GDO · sticker to Gate 3 Omar` |
| `attach_commercial_invoice` | `true` |
| `attach_packing_list` | `true` |
| `attach_bl_awb_copy` | `false` |
| `attach_carnet` | `false` |
| `attach_vehicle_title` | `false` |
| `attach_msds` | `false` |
| `attach_dangerous_goods_declaration` | `false` |
| `attach_health_veterinary` | `false` |
| `attach_fda_moh` | `false` |
| `mark_complete` | `true` on final submit |
| `consent_accepted` | `true` |
| `warehouse_id` | *(UUID from GET /masters/warehouses — JAFZA-WH-01)* |
| `warehouse_name` | `KingFisher Jebel Ali Bonded Warehouse` |
| `expected_inbound_at` | `2026-09-29T06:00` |
| `expected_outbound_at` | `2026-10-13T14:00` |
| `storage_days_requested` | `14` |
| `bonded` | `true` |
| `temperature_controlled` | `false` |
| `handling_instructions` | `48 sealed cartons · Gate 3 dock B · do not stack above 2 high` |
| `freight_job_id` | *(optional linked freight job UUID — blank if none)* |
| `stock_lines` | see WhStockLineInputDto |
| `parties` | see BookingFormPartyDto (all 5 kinds) |

### C.1) `WhStockLineInputDto`

| Field | Dummy value |
|-------|-------------|
| `sku_code` | `SKU-ELEC-CARTON` |
| `description` | `Electronics Carton Mix` |
| `quantity` | `48` |
| `unit` | `CTN` |
| `cbm` | `18.5` |

### C.2) `BookingFormPartyDto` — all party kinds

**SHIPPER**

| Field | Value |
|-------|--------|
| `party_kind` | `SHIPPER` |
| `full_name` | `Al Maha Trading LLC` |
| `address` | `Office 210, Jebel Ali Free Zone` |
| `city` | `Dubai` |
| `country` | `AE` |
| `entity_kind` | `COMPANY` |
| `other_details` | `fatima.hashimi@almaha-demo.example · +971 50 123 4567` |

**CONSIGNEE** — same as shipper (storage for own account), or:

| Field | Value |
|-------|--------|
| `party_kind` | `CONSIGNEE` |
| `full_name` | `Al Maha Trading LLC — Warehouse release` |
| `address` | `Plot WH-12 collection desk` |
| `city` | `Dubai` |
| `country` | `AE` |
| `entity_kind` | `COMPANY` |
| `other_details` | `Release contact: Fatima` |

**NOTIFY**

| Field | Value |
|-------|--------|
| `party_kind` | `NOTIFY` |
| `full_name` | `Same as consignee` *(or Fatima Al Hashimi)* |
| `address` | *(same)* |
| `city` | `Dubai` |
| `country` | `AE` |
| `entity_kind` | `COMPANY` |
| `other_details` | `+971 50 123 4567` |

**BILLING**

| Field | Value |
|-------|--------|
| `party_kind` | `BILLING` |
| `full_name` | `Al Maha Trading LLC — Accounts` |
| `address` | `Office 210, Jebel Ali Free Zone` |
| `city` | `Dubai` |
| `country` | `AE` |
| `entity_kind` | `COMPANY` |
| `other_details` | `ap@almaha-demo.example` |

**AGENT**

| Field | Value |
|-------|--------|
| `party_kind` | `AGENT` |
| `full_name` | `KingFisher Wings — Warehouse desk` |
| `address` | `JAFZA bonded warehouse ops` |
| `city` | `Dubai` |
| `country` | `AE` |
| `entity_kind` | `COMPANY` |
| `other_details` | `Sara Warehouse Ops · buyer: Fatima` |

---

## D) After booking form — sticker / gate / invoice / GDO

### Driver handoff (print with sticker)

```
Job: {job_number}
Barcode: {job_number}
Customer: Al Maha Trading LLC
Driver: Hassan Al Mazrouei
Emirates ID: 784-1990-1234567-1
Plate: D-48291 · Trailer: T-109
Gate: JAFZA Gate 3 — inbound dock B
Cargo: 48 CTN electronics · 18.5 CBM · 4200 kg
Present barcode sticker to gatekeeper Omar
```

### Gatekeeper scan (`/jobs/barcode-scan`)

| Field | Value |
|-------|--------|
| Barcode | `{job_number}` |
| Location | `JAFZA Gate 3 — inbound dock B` |
| Notes | `Driver Hassan Al Mazrouei · plate D-48291 · trailer T-109 · gate-in` |

### ASN → yard → auto GRN

| Field | Value |
|-------|--------|
| Warehouse | JAFZA-WH-01 |
| Party | Al Maha Trading LLC (**required** for storage calc) |
| Job | warehouse job |
| Expected | `2026-09-29T06:00` |
| Remarks | `Hassan · D-48291 / T-109 · Gate 3 dock B` |
| Line | SKU-ELEC-CARTON · qty 48 · CBM 18.5 |

Yard: Confirm → Mark picked → Mark unloading → Mark unloaded.

### Storage invoice (`/warehouse/storage`)

| Field | Value |
|-------|--------|
| Party | Al Maha Trading LLC |
| Period | `2026-09-29` → `2026-10-13` |
| Free days | `7` |
| Rate / day | `85` AED |
| Overdue / day | `120` AED |

Calculate → select OPEN charges → Invoice → Finance **Post** → customer `/portal/invoices`.

### GDO / GDN

| Field | Value |
|-------|--------|
| Warehouse / party / job | same |
| Delivered at | `2026-10-13T14:00` |
| Remarks | `Gate-out · POD Hassan · D-48291 · full release` |
| Line | SKU-ELEC-CARTON · qty 48 |

Post → customer portal shipment documents (not `/portal/wms`).

---

## E) Field coverage checklist (OpenAPI)

### CreateQuotationDto
- [x] job_type, customer_id, currency_code  
- [x] company_id, salesperson_id, branch_id, department_id, carrier_id  
- [x] origin_port_id, dest_port_id, incoterm  
- [x] commodity, hs_code, gross_weight, chargeable_weight, volume_cbm  
- [x] length_m, width_m, height_m, packages, pieces  
- [x] container_type_id, container_count  
- [x] is_dg, dg_class  
- [x] special_requirements, carrier_preference, transit_time_days, routing_notes  
- [x] remarks, internal_notes, valid_until  
- [x] exchange_rate, discount_percent, discount_amount, source  
- [x] CreateQuotationLineDto (all fields)  
- [x] CargoPackageDto (all fields)

### PortalQuotationRequestDto / Estimate
- [x] All request fields + service_codes + customer_lines + estimate_snapshot  
- [x] PortalCustomerLineDto + PortalEstimateSnapshotDto + CargoPackageDto

### UpsertWarehouseBookingFormDto
- [x] date_of_request … pieces / insurance / request_details  
- [x] All attach_* flags  
- [x] parties (SHIPPER, CONSIGNEE, NOTIFY, BILLING, AGENT)  
- [x] mark_complete, consent_accepted  
- [x] warehouse_id, warehouse_name, expected_inbound/outbound, storage_days_requested  
- [x] bonded, temperature_controlled, handling_instructions, freight_job_id  
- [x] service_scope, voyage_ref, cargo_category, dg_class  
- [x] stock_lines (WhStockLineInputDto all fields)

---

## Routes

| Screen | Path |
|--------|------|
| Staff quote | `/quotations/new` |
| Portal request | `/portal/book` (or portal quotes request) |
| Portal booking form | quote detail after accept |
| Staff warehouse booking form | job → booking form (WAREHOUSE) |
| Scan / sticker | job barcode · `/jobs/barcode-scan` |
| WMS | `/warehouse/asns` · `/warehouse/storage` · `/warehouse/gdos` |
| Customer invoices | `/portal/invoices` |

---

## F) Second dataset — save for later (pharma / temp-controlled / DG)

Different cast from Al Maha above so you can run a second full pass without colliding masters. Use when you are ready; same OpenAPI fields as §A–§D.

### Cast / masters

| Role | Value |
|------|--------|
| Customer party | Gulf Med Supplies FZE · Dr. Noura Al Ketbi · noura.alketbi@gulfmed-demo.example · +971 52 444 8890 · Warehouse Bay 4, Dubai Science Park, Dubai, UAE |
| Driver | Yusuf Rahman · +971 56 220 1188 · EID 784-1988-7654321-3 · plate DXB-77341 · trailer RF-22 (reefer) |
| Gatekeeper | Layla Gate Ops · DIP Gate 1 — cold dock C |
| Warehouse master | Code `DIP-WH-COLD-02` · Name `KingFisher DIP Pharma Cold Store` · Plot CS-07, Dubai Investment Park, Dubai |
| WMS item | Code `SKU-PHARMA-VIAL` · Name `Refrigerated Pharma Vials (2–8°C)` · UOM `CTN` |

### Staff / portal quotation snapshot

| Field | Value |
|-------|--------|
| `job_type` | `WAREHOUSE` |
| `currency_code` | `AED` |
| `incoterm` | `CIP` |
| `commodity` | `Pharmaceutical vials — refrigerated bonded storage` |
| `hs_code` | `300490` |
| `gross_weight` / `chargeable_weight` | `960` / `960` |
| `volume_cbm` | `6.2` |
| `pieces` | `120` |
| `length_m` / `width_m` / `height_m` | `0.6` / `0.4` / `0.35` |
| Package (cm) | L `60` · W `40` · H `35` · gross_weight_kg `8` · pieces `120` |
| `is_dg` / `dg_class` | `true` / `9` |
| `special_requirements` | `Pickup DSP Bay 4 · Warehouse DIP-WH-COLD-02 · Bonded · Temp 2–8°C · 21 storage days · DG class 9 · Gate 1 cold dock C · reefer trailer RF-22` |
| `carrier_preference` | `Reefer truck only · continuous cold-chain` |
| `transit_time_days` | `21` |
| `routing_notes` | `Inbound DIP Gate 1 cold dock C · outbound same dock · no ambient dwell` |
| `remarks` | `Hold 3 free days then cold storage accrual. Driver presents sticker + DG pack to Layla.` |
| `internal_notes` | `Demo WH#2 — Gulf Med · SKU-PHARMA-VIAL × 120 · temp-controlled` |
| `valid_until` | `2026-11-15` |
| `exchange_rate` / discounts | `1` / `0` / `0` |
| `source` | `STAFF` (or `CUSTOMER_PORTAL` if portal-requested) |
| Quote line 1 | charge STORAGE · `Cold bonded storage — 21 days` · unit `Per CBM / day` · qty `21` · unit_price `140` · AED · is_cost `false` · sort_order `1` |
| Quote line 2 | `Cold-chain inbound handling + DG acceptance` · qty `1` · unit_price `550` · unit `Per shipment` · sort_order `2` |
| Portal `service_codes` | e.g. `["STORAGE","HANDLING","DG_SURCHARGE"]` |
| Portal customer_line | code `STORAGE` · qty `21` · unit_price `140` · unit `Per day` · source `CUSTOMER_PROPOSED` |
| Estimate snapshot | currency `AED` · estimated_total `3490` · captured_at `2026-10-05T09:30:00.000Z` |

### Booking form — `UpsertWarehouseBookingFormDto`

| Field | Value |
|-------|--------|
| `date_of_request` | `2026-10-05` |
| `client_booking_no` | `GM-WH-2026-0091` |
| `voyage_ref` | `WH-COLD-2026-0091` |
| `service_scope` | `DOOR_TO_DOOR` |
| `origin_door_address` | `Gulf Med Supplies FZE — Warehouse Bay 4, Dubai Science Park` |
| `dest_door_address` | `Cold dock C collection — DIP Pharma Cold Store` |
| `commodity` | `Pharmaceutical vials — refrigerated bonded storage` |
| `hs_code` | `300490` |
| `cargo_category` | `PHARMA` |
| `is_dg` / `dg_class` | `true` / `9` |
| `gross_weight_kg` / `net_weight_kg` | `960` / `880` |
| `volume_cbm` / `pieces` | `6.2` / `120` |
| `insurance_details` | `Pharma cold-chain cover — policy GMS-CC-44102 · UAE` |
| `request_details` | `Bonded cold inbound · 21 days · 2–8°C continuous · DG9 pack with sticker to Layla Gate 1` |
| Attach flags | commercial_invoice `true` · packing_list `true` · bl_awb_copy `false` · carnet `false` · vehicle_title `false` · msds `true` · dangerous_goods_declaration `true` · health_veterinary `false` · fda_moh `true` |
| `mark_complete` / `consent_accepted` | `true` / `true` |
| `warehouse_id` | *(UUID of DIP-WH-COLD-02)* |
| `warehouse_name` | `KingFisher DIP Pharma Cold Store` |
| `expected_inbound_at` | `2026-10-06T05:30` |
| `expected_outbound_at` | `2026-10-27T11:00` |
| `storage_days_requested` | `21` |
| `bonded` / `temperature_controlled` | `true` / `true` |
| `handling_instructions` | `120 sealed pharma cartons · keep 2–8°C · do not break cold chain · Gate 1 cold dock C` |
| `freight_job_id` | *(blank unless linked air/sea job exists)* |
| Stock line | sku `SKU-PHARMA-VIAL` · description `Refrigerated Pharma Vials (2–8°C)` · qty `120` · unit `CTN` · cbm `6.2` |

**Parties**

| Kind | full_name | address / city / country | entity | other_details |
|------|-----------|--------------------------|--------|---------------|
| SHIPPER | Gulf Med Supplies FZE | Warehouse Bay 4, Dubai Science Park · Dubai · AE | COMPANY | noura.alketbi@gulfmed-demo.example · +971 52 444 8890 |
| CONSIGNEE | Gulf Med Supplies FZE — Cold release desk | Plot CS-07 collection · Dubai · AE | COMPANY | Release: Dr. Noura |
| NOTIFY | Same as consignee | *(same)* · Dubai · AE | COMPANY | +971 52 444 8890 |
| BILLING | Gulf Med Supplies FZE — Finance | Bay 4 Science Park · Dubai · AE | COMPANY | finance@gulfmed-demo.example |
| AGENT | KingFisher Wings — Pharma cold desk | DIP cold store ops · Dubai · AE | COMPANY | Sara Warehouse Ops · buyer: Dr. Noura |

### Driver handoff / gate / yard / invoice / GDO

```
Job: {job_number}
Barcode: {job_number}
Customer: Gulf Med Supplies FZE
Driver: Yusuf Rahman
Emirates ID: 784-1988-7654321-3
Plate: DXB-77341 · Trailer: RF-22 (reefer)
Gate: DIP Gate 1 — cold dock C
Cargo: 120 CTN pharma vials · 6.2 CBM · 960 kg · DG9 · 2–8°C
Present barcode sticker + DG pack + MSDS to gatekeeper Layla
```

| Step | Values |
|------|--------|
| Scan (`/jobs/barcode-scan`) | barcode `{job_number}` · location `DIP Gate 1 — cold dock C` · notes `Driver Yusuf Rahman · plate DXB-77341 · trailer RF-22 · cold gate-in · DG9` |
| ASN | warehouse `DIP-WH-COLD-02` · party Gulf Med · job linked · expected `2026-10-06T05:30` · remarks `Yusuf · DXB-77341 / RF-22 · Gate 1 cold dock C` · line SKU-PHARMA-VIAL qty 120 / CBM 6.2 |
| Yard | Confirm → Mark picked → Mark unloading → Mark unloaded (party_id required) |
| Storage | party Gulf Med · period `2026-10-06` → `2026-10-27` · free days `3` · rate `140` AED/day · overdue `210` AED/day → Calculate → Invoice → Finance Post → `/portal/invoices` |
| GDO | delivered `2026-10-27T11:00` · remarks `Gate-out cold · POD Yusuf · DXB-77341 · full release` · line SKU-PHARMA-VIAL qty 120 → Post (GDN) |

**Why this second set:** covers `PHARMA` cargo_category, `is_dg` + `dg_class`, temp-controlled + bonded, MSDS/DG/FDA attach flags, reefer driver/gate story, and a different warehouse/item so it does not overwrite Al Maha demo stock.
