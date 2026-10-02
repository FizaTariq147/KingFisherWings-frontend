# Job types — complete demo test data (manual)

Source of truth: live OpenAPI  
`GET https://kingfisherwings-backend.onrender.com/docs-json`

Enter values in the UI. Replace `*(UUID…)*` with real IDs from your tenant masters.

**Already covered in dedicated docs**

| Job type | Doc |
|----------|-----|
| `WAREHOUSE` | [warehouse-video-demo-test-data.md](./warehouse-video-demo-test-data.md) |
| `CUSTOMS_CLEARANCE` | [customs-clearance-demo-test-data.md](./customs-clearance-demo-test-data.md) |
| `NVOCC_*` / `AIR_*` deep ops (CRO, ULD, portal compliance gates) | [nvocc-air-portal-api-dummy-data.md](./nvocc-air-portal-api-dummy-data.md) |

This file covers **quotation → booking form → complete → convert** (and light ops) for every other staff job type, plus compact quote/booking samples for Air and NVOCC.

---

## Shared cast / masters (create once)

| Role | Value |
|------|--------|
| Customer (freight) | **Gulf Horizon Logistics LLC** · Rania Al Suwaidi · rania.suwaidi@gulfhorizon-demo.example · +971 50 441 8890 · Office 802, Al Quoz 3, Dubai, UAE |
| Customer (courier) | **QuickParcel ME** · Omar Farid · omar.farid@quickparcel-demo.example · +971 55 220 1144 |
| Shipper (CN) | Shenzhen Apex Electronics Co. Ltd · Bonded WH Zone A · Shenzhen · CN · export@apex-sz-demo.example |
| Consignee (AE) | Gulf Horizon Logistics LLC · Al Quoz 3 · Dubai · AE |
| Notify | Same as consignee · +971 50 441 8890 |
| Billing | Gulf Horizon — Accounts · ap@gulfhorizon-demo.example |
| Agent | KingFisher Wings — Ops desk · Sara Ops |
| Carrier / line (sea) | *(shipping line party UUID — e.g. demo MSC / Maersk)* |
| Airline | *(airline master UUID)* |
| Origin sea place | *(Shanghai / CNSHA place UUID)* |
| Dest sea place | *(Jebel Ali / AEJEA place UUID)* |
| Origin airport | `DXB` / `*(DXB airport UUID)*` |
| Dest airport | `FRA` / `*(FRA airport UUID)*` |
| Container type | `*(20GP / 40HC container-type UUID)*` |
| HS | `8517.12` — Telephones for cellular networks |

---

## Shared flow (mode booking-form modes)

```
Quotation (job_type) → Approve
  → Staff / customer booking form → Complete
  → Convert to job (mode booking-form convert where enabled)
  → Job detail → mode ops panels
```

**Staff booking-form API modes** (panel on job):

| Job type(s) | Staff mode | PUT path |
|-------------|------------|----------|
| `SEA_FCL_EXPORT` / `SEA_FCL_IMPORT` | `SEA_FCL` | `/jobs/{id}/sea-fcl/booking-form` (+ `/complete`) |
| `SEA_LCL_EXPORT` / `SEA_LCL_IMPORT` | `SEA_LCL` | `/jobs/{id}/sea-lcl/booking-form` (+ `/complete`) |
| `LAND` | `LAND` | `/jobs/{id}/land/booking-form` (+ `/complete`) |
| `ROAD_FREIGHT` | `ROAD_FREIGHT` | `/jobs/{id}/road-freight/booking-form` (+ `/complete`) |
| `COURIER` | `COURIER` | `/jobs/{id}/courier/booking-form` (+ `/complete`) |
| `WAREHOUSE` | `WAREHOUSE` | see warehouse doc |
| `CUSTOMS_CLEARANCE` | `CUSTOMS_CLEARANCE` | see CC doc |

Air / NVOCC use **compliance / NVOCC booking-form** paths (see §6–7 and nvocc-air doc) — not the shared ModeBookingFormPanel rail above.

**Shared party kinds** (`BookingFormPartyDto`): `SHIPPER`, `CONSIGNEE`, `NOTIFY`, `BILLING`, `AGENT`.

**Shared attach flags** (set as below per scenario):  
`attach_commercial_invoice`, `attach_packing_list`, `attach_bl_awb_copy`, `attach_carnet`, `attach_vehicle_title`, `attach_msds`, `attach_dangerous_goods_declaration`, `attach_health_veterinary`, `attach_fda_moh`.

Default for non-DG freight demos:

| Flag | Value |
|------|--------|
| `attach_commercial_invoice` | `true` |
| `attach_packing_list` | `true` |
| `attach_bl_awb_copy` | `true` |
| others | `false` |

On complete: `mark_complete` = `true`, `consent_accepted` = `true`.

---

## 1) SEA FCL — `SEA_FCL_EXPORT` / `SEA_FCL_IMPORT`

Schema: `UpsertSeaFclBookingFormDto`

### 1.A Quotation — `CreateQuotationDto`

| Field | EXPORT dummy | IMPORT dummy |
|-------|--------------|--------------|
| `job_type` | `SEA_FCL_EXPORT` | `SEA_FCL_IMPORT` |
| `customer_id` | *(Gulf Horizon UUID)* | same |
| `currency_code` | `USD` | `USD` |
| `incoterm` | `FOB` | `CIF` |
| `commodity` | `Consumer electronics — FCL` | `Consumer electronics — FCL import` |
| `hs_code` | `8517.12` | `8517.12` |
| `gross_weight` | `12500` | `12500` |
| `chargeable_weight` | `12500` | `12500` |
| `volume_cbm` | `55` | `55` |
| `pieces` | `420` | `420` |
| `container_type_id` | *(40HC UUID)* | *(40HC UUID)* |
| `container_count` | `1` | `1` |
| `origin_port_id` | *(Jebel Ali UUID)* | *(Shanghai UUID)* |
| `dest_port_id` | *(Shanghai UUID)* | *(Jebel Ali UUID)* |
| `carrier_id` | *(shipping line UUID)* | same |
| `is_dg` / `dg_class` | `false` / blank | same |
| `special_requirements` | `1×40HC · FOB · SOC false · POL AEJEA POD CNSHA` | `1×40HC · CIF · POL CNSHA POD AEJEA` |
| `carrier_preference` | `MSC preferred` | `Maersk preferred` |
| `transit_time_days` | `18` | `18` |
| `routing_notes` | `Jebel Ali → Shanghai direct` | `Shanghai → Jebel Ali · CY/CY` |
| `remarks` | `Demo SEA FCL EXPORT #1` | `Demo SEA FCL IMPORT #1` |
| `internal_notes` | `FCL-EXP-DEMO-001` | `FCL-IMP-DEMO-001` |
| `valid_until` | `2026-11-30` | `2026-11-30` |
| `exchange_rate` | `1` | `1` |
| `discount_percent` / `discount_amount` | `0` / `0` | same |
| `source` | `STAFF` | `STAFF` |

### 1.A.1 Quotation lines

| Line | description | unit | qty | unit_price | currency |
|------|-------------|------|-----|------------|----------|
| 1 | Ocean freight FCL 40HC | Per container | 1 | 1850 | USD |
| 2 | THC origin | Per container | 1 | 220 | USD |
| 3 | Documentation fee | Per shipment | 1 | 85 | USD |

Use real `charge_code_id` UUIDs.

### 1.B Booking form — every `UpsertSeaFclBookingFormDto` field

| Field | Dummy value |
|-------|-------------|
| `date_of_request` | `2026-09-29` |
| `client_booking_no` | `GH-FCL-2026-0042` |
| `voyage_ref` | `MSC-UAE-CN-0926` |
| `service_scope` | `PORT_TO_PORT` |
| `origin_door_address` | `Gulf Horizon CFS — Al Quoz 3, Dubai` |
| `dest_door_address` | `Shenzhen Apex — bonded export warehouse, Shenzhen` |
| `commodity` | `Consumer electronics — smartphones & accessories` |
| `hs_code` | `8517.12` |
| `cargo_category` | `GENERAL` |
| `is_dg` / `dg_class` | `false` / blank |
| `gross_weight_kg` / `net_weight_kg` | `12500` / `11800` |
| `volume_cbm` / `pieces` | `55` / `420` |
| `insurance_details` | `CIF/FOB cargo policy GH-MAR-441 · USD 125000` |
| `request_details` | `CY/CY · 1×40HC · seal check at gate` |
| `pol` | `AEJEA` (export) or `CNSHA` (import) |
| `pod` | `CNSHA` (export) or `AEJEA` (import) |
| `shipper_owned_container` | `false` |
| `teu_count` | `2` |
| `containers[]` | `container_type_id` = *(40HC UUID)* · `iso_size` = `40HC` · `count` = `1` |
| `etd` | `2026-10-05T18:00` |
| `eta` | `2026-10-23T08:00` |
| `incoterms` | `FOB` (export) / `CIF` (import) |
| `freight_terms` | `PREPAID` |
| attach flags | see shared defaults |
| `mark_complete` / `consent_accepted` | `true` / `true` |

### 1.B.1 Parties

| party_kind | full_name | city / country | entity | other_details |
|------------|-----------|----------------|--------|---------------|
| SHIPPER | Gulf Horizon Logistics LLC (export) **or** Shenzhen Apex (import) | Dubai / AE **or** Shenzhen / CN | COMPANY | ops email |
| CONSIGNEE | Shenzhen Apex (export) **or** Gulf Horizon (import) | inverse of shipper | COMPANY | + phone |
| NOTIFY | Same as consignee | same | COMPANY | +971 50 441 8890 |
| BILLING | Gulf Horizon — Accounts | Dubai / AE | COMPANY | ap@gulfhorizon-demo.example |
| AGENT | KingFisher Wings — Sea desk | Dubai / AE | COMPANY | Sara Ops |

### 1.C After convert (smoke)

- Job type matches quote.
- Booking form GET returns saved fields; list status **Completed**.
- Optional: job documents upload CI + PL + BL copy.

---

## 2) SEA LCL — `SEA_LCL_EXPORT` / `SEA_LCL_IMPORT`

Schema: `UpsertSeaLclBookingFormDto`

### 2.A Quotation

| Field | Dummy value |
|-------|-------------|
| `job_type` | `SEA_LCL_EXPORT` or `SEA_LCL_IMPORT` |
| `customer_id` | *(Gulf Horizon UUID)* |
| `currency_code` | `USD` |
| `incoterm` | `CIF` |
| `commodity` | `Mixed cartons — LCL electronics` |
| `hs_code` | `8517.12` |
| `gross_weight` | `1850` |
| `chargeable_weight` | `2100` |
| `volume_cbm` | `8.4` |
| `pieces` | `96` |
| `container_type_id` / `container_count` | blank |
| `origin_port_id` / `dest_port_id` | Jebel Ali ↔ Shanghai (swap for import) |
| `special_requirements` | `LCL · CFS Dubai → CFS Shanghai · no DG` |
| `transit_time_days` | `21` |
| `routing_notes` | `CFS–CFS · consol week 41` |
| `remarks` | `Demo SEA LCL #1` |
| `internal_notes` | `LCL-DEMO-001` |
| `valid_until` | `2026-11-30` |
| `source` | `STAFF` |

### 2.A.1 Lines

| description | unit | qty | unit_price | currency |
|-------------|------|-----|------------|----------|
| Ocean freight LCL | Per CBM | 8.4 | 95 | USD |
| CFS origin handling | Per CBM | 8.4 | 18 | USD |
| Documentation | Per shipment | 1 | 65 | USD |

### 2.B Booking form — `UpsertSeaLclBookingFormDto`

| Field | Dummy value |
|-------|-------------|
| `date_of_request` | `2026-09-29` |
| `client_booking_no` | `GH-LCL-2026-0019` |
| `voyage_ref` | `LCL-CONS-W41-2026` |
| `service_scope` | `DOOR_TO_DOOR` |
| `origin_door_address` | `Gulf Horizon warehouse — Al Quoz 3, Dubai` |
| `dest_door_address` | `Buyer warehouse — Pudong, Shanghai` |
| `commodity` | `Mixed cartons — LCL electronics` |
| `hs_code` | `8517.12` |
| `cargo_category` | `GENERAL` |
| `is_dg` / `dg_class` | `false` / blank |
| `gross_weight_kg` / `net_weight_kg` | `1850` / `1720` |
| `volume_cbm` / `pieces` | `8.4` / `96` |
| `insurance_details` | `All-risk LCL · policy GH-LCL-882` |
| `request_details` | `CFS cut-off Tue 16:00 · stackable cartons` |
| `pol` / `pod` | `AEJEA` / `CNSHA` (swap import) |
| `cfs_warehouse` | `KingFisher Dubai CFS — JAFZA Plot CFS-04` |
| `etd` / `eta` | `2026-10-08T12:00` / `2026-10-29T09:00` |
| `incoterms` | `CIF` |
| `freight_terms` | `COLLECT` |
| attach + parties | same pattern as FCL (adjust shipper/consignee for direction) |
| `mark_complete` / `consent_accepted` | `true` / `true` |

### 2.C After convert

- Optional LCL consol attach/detach if your tenant uses house/master jobs.
- CFS storage calc only if backend job supports it.

---

## 3) ROAD FREIGHT — `ROAD_FREIGHT`

Schema: `UpsertRoadFreightBookingFormDto`

### 3.A Quotation

| Field | Dummy value |
|-------|-------------|
| `job_type` | `ROAD_FREIGHT` |
| `customer_id` | *(Gulf Horizon UUID)* |
| `currency_code` | `AED` |
| `incoterm` | `DAP` |
| `commodity` | `Palletized FMCG — road cross-border` |
| `hs_code` | `210690` |
| `gross_weight` | `9200` |
| `chargeable_weight` | `9200` |
| `volume_cbm` | `28` |
| `pieces` | `22` |
| `origin_port_id` | *(Dubai / AE place UUID)* |
| `dest_port_id` | *(Riyadh / SA place UUID)* |
| `carrier_id` | *(trucker party UUID)* |
| `special_requirements` | `FTL curtainsider · Ghuwaifat border · temp ambient` |
| `carrier_preference` | `KingFisher road preferred` |
| `transit_time_days` | `3` |
| `routing_notes` | `DXB → Ghuwaifat → Riyadh` |
| `remarks` | `Demo ROAD_FREIGHT #1` |
| `internal_notes` | `ROAD-DEMO-001` |
| `valid_until` | `2026-11-15` |
| `source` | `STAFF` |

### 3.A.1 Lines

| description | unit | qty | unit_price | currency |
|-------------|------|-----|------------|----------|
| Road freight FTL DXB–RUH | Per trip | 1 | 4800 | AED |
| Border handling | Per shipment | 1 | 350 | AED |

### 3.B Booking form — `UpsertRoadFreightBookingFormDto`

| Field | Dummy value |
|-------|-------------|
| `date_of_request` | `2026-09-29` |
| `client_booking_no` | `GH-RD-2026-0077` |
| `voyage_ref` | `RD-DXB-RUH-0926` |
| `service_scope` | `DOOR_TO_DOOR` |
| `origin_door_address` | `Gulf Horizon DC — Al Quoz 3, Dubai, AE` |
| `dest_door_address` | `Buyer DC — Industrial Area 2, Riyadh, SA` |
| `commodity` | `Palletized FMCG` |
| `hs_code` | `210690` |
| `cargo_category` | `FOOD_PERISHABLE` |
| `is_dg` / `dg_class` | `false` / blank |
| `gross_weight_kg` / `net_weight_kg` | `9200` / `8800` |
| `volume_cbm` / `pieces` | `28` / `22` |
| `insurance_details` | `Cargo CMR cover GH-RD-220` |
| `request_details` | `Driver rest 45 min at border · seals intact` |
| `origin_city_country` | `Dubai, AE` |
| `dest_city_country` | `Riyadh, SA` |
| `vehicle_type` | `CURTAINSIDER` (or your FE enum value) |
| `border_crossing` | `Ghuwaifat / Al Batha` |
| `etd` / `eta` | `2026-10-02T06:00` / `2026-10-04T18:00` |
| `incoterms` | `DAP` |
| attach | CI + PL + `attach_health_veterinary` = `true` if food docs needed; else defaults |
| parties | Shipper Gulf Horizon · Consignee Riyadh buyer · Agent KingFisher road |
| `mark_complete` / `consent_accepted` | `true` / `true` |

---

## 4) LAND — `LAND`

Schema: `UpsertLandBookingFormDto` (same as road **without** `border_crossing`)

### 4.A Quotation

| Field | Dummy value |
|-------|-------------|
| `job_type` | `LAND` |
| `customer_id` | *(Gulf Horizon UUID)* |
| `currency_code` | `AED` |
| `incoterm` | `DAP` |
| `commodity` | `Domestic pallet move — Dubai ↔ Abu Dhabi` |
| `hs_code` | `847130` |
| `gross_weight` | `2400` |
| `volume_cbm` | `9.5` |
| `pieces` | `12` |
| `special_requirements` | `Domestic · no border · 12 pallets` |
| `transit_time_days` | `1` |
| `routing_notes` | `Al Quoz → Mussafah` |
| `remarks` | `Demo LAND #1` |
| `internal_notes` | `LAND-DEMO-001` |
| `valid_until` | `2026-11-15` |
| `source` | `STAFF` |

### 4.B Booking form

| Field | Dummy value |
|-------|-------------|
| `date_of_request` | `2026-09-29` |
| `client_booking_no` | `GH-LAND-2026-0011` |
| `voyage_ref` | `LAND-AUH-0926` |
| `service_scope` | `DOOR_TO_DOOR` |
| `origin_door_address` | `Gulf Horizon DC — Al Quoz 3, Dubai` |
| `dest_door_address` | `Buyer site — Mussafah, Abu Dhabi` |
| `commodity` | `IT equipment pallets` |
| `hs_code` | `847130` |
| `cargo_category` | `GENERAL` |
| `gross_weight_kg` / `net_weight_kg` | `2400` / `2200` |
| `volume_cbm` / `pieces` | `9.5` / `12` |
| `origin_city_country` | `Dubai, AE` |
| `dest_city_country` | `Abu Dhabi, AE` |
| `vehicle_type` | `BOX_TRUCK` |
| `etd` / `eta` | `2026-10-01T08:00` / `2026-10-01T14:00` |
| `incoterms` | `DAP` |
| parties + attach | defaults |
| `mark_complete` / `consent_accepted` | `true` / `true` |

---

## 5) COURIER — `COURIER`

Schema: `UpsertCourierBookingFormDto`

### 5.A Quotation

| Field | Dummy value |
|-------|-------------|
| `job_type` | `COURIER` |
| `customer_id` | *(QuickParcel ME UUID)* |
| `currency_code` | `AED` |
| `incoterm` | `DAP` |
| `commodity` | `Documents + sample handsets` |
| `hs_code` | `8517.12` |
| `gross_weight` | `12.5` |
| `chargeable_weight` | `14` |
| `volume_cbm` | `0.08` |
| `pieces` | `2` |
| `special_requirements` | `Express · signature required · no DG` |
| `transit_time_days` | `2` |
| `routing_notes` | `DXB → AUH express` |
| `remarks` | `Demo COURIER #1` |
| `internal_notes` | `COURIER-DEMO-001` |
| `valid_until` | `2026-10-31` |
| `source` | `STAFF` |

### 5.A.1 Lines

| description | unit | qty | unit_price | currency |
|-------------|------|-----|------------|----------|
| Express courier | Per shipment | 1 | 180 | AED |
| Signature on delivery | Per shipment | 1 | 25 | AED |

### 5.B Booking form — `UpsertCourierBookingFormDto`

| Field | Dummy value |
|-------|-------------|
| `date_of_request` | `2026-09-29` |
| `client_booking_no` | `QP-CR-2026-3301` |
| `voyage_ref` | `CR-DXB-AUH-0929` |
| `service_scope` | `DOOR_TO_DOOR` |
| `origin_door_address` | `QuickParcel hub — Dubai Airport Free Zone` |
| `dest_door_address` | `Recipient — Khalifa City A, Abu Dhabi` |
| `commodity` | `Documents + sample handsets` |
| `hs_code` | `8517.12` |
| `cargo_category` | `GENERAL` |
| `gross_weight_kg` / `net_weight_kg` | `12.5` / `11` |
| `volume_cbm` / `pieces` | `0.08` / `2` |
| `insurance_details` | `Courier declared value AED 3500` |
| `request_details` | `Signature + photo POD` |
| `origin_city_country` | `Dubai, AE` |
| `dest_city_country` | `Abu Dhabi, AE` |
| `tracking_number` | `KFCR20260929003301` |
| `etd` / `eta` | `2026-09-29T10:00` / `2026-09-30T18:00` |
| attach | CI = `true`, PL = `true`, others `false` |
| parties | Shipper QuickParcel · Consignee recipient name · Billing QuickParcel |
| `mark_complete` / `consent_accepted` | `true` / `true` |

---

## 6) AIR — `AIR_EXPORT` / `AIR_IMPORT`

Commercial / compliance: `UpsertAirComplianceBookingFormDto`  
Ops booking snapshot: `UpsertAirBookingFormDto`  
Deep stage payloads: [nvocc-air-portal-api-dummy-data.md](./nvocc-air-portal-api-dummy-data.md)

### 6.A Quotation

| Field | EXPORT | IMPORT |
|-------|--------|--------|
| `job_type` | `AIR_EXPORT` | `AIR_IMPORT` |
| `customer_id` | *(Gulf Horizon UUID)* | same |
| `currency_code` | `USD` | `USD` |
| `incoterm` | `CIP` | `CIP` |
| `commodity` | `Pharma samples — air` | `Pharma samples — air import` |
| `hs_code` | `300490` |
| `gross_weight` | `420` | `420` |
| `chargeable_weight` | `480` | `480` |
| `volume_cbm` | `2.1` | `2.1` |
| `pieces` | `8` | `8` |
| `origin_port_id` | *(DXB airport/place UUID)* | *(FRA UUID)* |
| `dest_port_id` | *(FRA UUID)* | *(DXB UUID)* |
| `carrier_id` | *(airline UUID)* | same |
| `is_dg` / `dg_class` | `false` / blank | same |
| `special_requirements` | `Cool chain preferred · MAWB + HAWB` | same |
| `transit_time_days` | `2` | `2` |
| `routing_notes` | `DXB → FRA` | `FRA → DXB` |
| `remarks` | `Demo AIR EXPORT #1` | `Demo AIR IMPORT #1` |
| `internal_notes` | `AIR-EXP-DEMO-001` | `AIR-IMP-DEMO-001` |
| `valid_until` | `2026-11-30` | `2026-11-30` |
| `source` | `STAFF` | `STAFF` |

### 6.A.1 Lines

| description | unit | qty | unit_price | currency |
|-------------|------|-----|------------|----------|
| Air freight chargeable | Per kg | 480 | 3.25 | USD |
| Fuel surcharge | Per kg | 480 | 0.45 | USD |
| AWB fee | Per shipment | 1 | 55 | USD |

### 6.B Compliance booking form — `UpsertAirComplianceBookingFormDto`

| Field | Dummy value |
|-------|-------------|
| `date_of_request` | `2026-09-29` |
| `voyage_ref` | `EK-DXB-FRA-0926` |
| `client_booking_no` | `GH-AIR-2026-0088` |
| `service_scope` | `DOOR_TO_AIRPORT` |
| `origin_door_address` | `Gulf Horizon pharma cage — Dubai` |
| `dest_door_address` | `Consignee bonded — Frankfurt` |
| `origin_airport_code` | `DXB` (swap for import) |
| `dest_airport_code` | `FRA` |
| `pieces` | `8` |
| `gross_weight_kg` / `net_weight_kg` | `420` / `390` |
| `chargeable_weight_kg` | `480` |
| `volume_cbm` | `2.1` |
| `pallet_count` | `2` |
| `pallets[]` | type `PMC` · count `2` · L/W/H cm `120/100/160` · weight_kg `210` |
| `is_dg` | `false` |
| `commodity` | `Pharma samples` |
| `hs_code` | `300490` |
| `final_use` | `Hospital distribution samples` |
| `activity_sector` | `CIVILIAN` |
| `insurance_details` | `CIP policy GH-AIR-991` |
| `lc_bank_details` | blank (or bank LC ref if testing) |
| `attach_commercial_invoice` | `true` |
| `attach_correspondence` | `true` |
| `attach_cod_form` | `false` |
| `attach_licence` | `true` |
| `booking_agent_line` | `KINGFISHER` |
| `agent_requester_name` | `Sara Ops` |
| `sq_bl_booking_reference` | `SQ-AIR-DEMO-0088` |
| `request_details` | `Temp +2–8°C preferred · no X-ray if sticker applied` |
| parties | SHIPPER / CONSIGNEE / NOTIFY / BILLING / AGENT as Gulf Horizon cast |
| `mark_complete` / `consent_accepted` | `true` / `true` |

### 6.C Staff air ops snapshot — `UpsertAirBookingFormDto` (after job)

| Field | Dummy value |
|-------|-------------|
| `pieces` | `8` |
| `gross_weight_kg` | `420` |
| `chargeable_weight_kg` | `480` |
| `volume_cbm` | `2.1` |
| `pallet_count` | `2` |
| `commodity` | `Pharma samples` |
| `special_handling` | `COL` |
| `notes` | `Demo air ops snapshot` |
| `is_dg` | `false` |
| `flight_number` | `EK045` |
| `flight_date` | `2026-10-03` |
| `origin_airport_code` | `DXB` |
| `dest_airport_code` | `FRA` |
| `arrival_flight_number` | `EK044` (import) |
| `mawb_from_origin` | `176-12345675` |
| `agent_at_origin` | `KingFisher DXB GHA` |
| `delivery_address` | `Consignee bonded FRA` |
| `customs_value` | `18500` |
| `mark_complete` | `true` |

### 6.D Air stage order (do not skip)

Export-ish: triage/compliance → invoice gates → build-up → MAWB issued → … → POD  
Import-ish: … → MAWB received → … → POD  

Use exact payloads from [nvocc-air-portal-api-dummy-data.md](./nvocc-air-portal-api-dummy-data.md).

---

## 7) NVOCC — `NVOCC_EXPORT` / `NVOCC_IMPORT`

Schema: `UpsertNvoccBookingFormDto`  
Full CRO / container-request / portal gates: [nvocc-air-portal-api-dummy-data.md](./nvocc-air-portal-api-dummy-data.md)

### 7.A Quotation

| Field | EXPORT | IMPORT |
|-------|--------|--------|
| `job_type` | `NVOCC_EXPORT` | `NVOCC_IMPORT` |
| `customer_id` | *(Gulf Horizon UUID)* | same |
| `currency_code` | `USD` | `USD` |
| `incoterm` | `FOB` | `CIF` |
| `commodity` | `NVOCC FCL electronics` | same |
| `hs_code` | `8517.12` |
| `gross_weight` | `18000` | `18000` |
| `volume_cbm` | `65` | `65` |
| `pieces` | `500` | `500` |
| `container_type_id` / `container_count` | *(40HC)* / `2` | same |
| `origin_port_id` / `dest_port_id` | AEJEA ↔ CNSHA (swap import) | |
| `special_requirements` | `NVOCC · 2×40HC · CRO before gate-in` | same |
| `transit_time_days` | `20` | `20` |
| `remarks` | `Demo NVOCC EXPORT #1` | `Demo NVOCC IMPORT #1` |
| `internal_notes` | `NVOCC-EXP-DEMO-001` | `NVOCC-IMP-DEMO-001` |
| `valid_until` | `2026-11-30` | `2026-11-30` |
| `source` | `STAFF` | `STAFF` |

### 7.B NVOCC booking / compliance — `UpsertNvoccBookingFormDto`

| Field | Dummy value |
|-------|-------------|
| `date_of_request` | `2026-09-29` |
| `voyage_ref` | `NVOCC-AE-CN-0926` |
| `client_booking_no` | `GH-NV-2026-0015` |
| `gross_weight_kg` / `net_weight_kg` | `18000` / `17200` |
| `pol` / `pod` | `AEJEA` / `CNSHA` (swap import) |
| `shipper_owned_container` | `false` |
| `is_dg` | `false` |
| `teu_count` | `4` |
| `containers[]` | type *(40HC UUID)* · `iso_size` `40HC` · `count` `2` |
| `service_scope` | `PORT_TO_PORT` |
| `origin_door_address` | `Gulf Horizon CFS Dubai` |
| `dest_door_address` | `Buyer CY Shanghai` |
| `commodity` | `NVOCC FCL electronics` |
| `hs_code` | `8517.12` |
| `final_use` | `Retail distribution` |
| `activity_sector` | `CIVILIAN` |
| `insurance_details` | `Marine policy GH-NV-440` |
| `lc_bank_details` | blank or `LC-GH-2026-7781` |
| `attach_commercial_invoice` | `true` |
| `attach_correspondence` | `true` |
| `attach_cod_form` | `false` |
| `attach_licence` | `false` |
| `booking_agent_line` | `KINGFISHER` |
| `agent_requester_name` | `Sara Ops` |
| `sq_bl_booking_reference` | `SQ-NV-DEMO-0015` |
| `request_details` | `CRO required before empty pickup` |
| parties | Gulf Horizon cast |
| `mark_complete` / `consent_accepted` | `true` / `true` |

### 7.C Staff gate order (no skip)

`QUOTE_REQUESTED` → `CS_TRIAGED` → `QUOTE_SENT` → `CUSTOMER_ACCEPTED` → `BOOKING_FORM_COMPLETE` → `INVOICE_SENT` → convert / CRO / job ops  

Use button payloads from the NVOCC/Air dummy-data doc.

---

## 8) Portal quotation request samples (`PortalQuotationRequestDto`)

Use for customer portal “request quote” per mode (same customer login as cast).

| job_type | commodity | weights / CBM / pieces | special_requirements |
|----------|-----------|------------------------|----------------------|
| `SEA_FCL_IMPORT` | FCL electronics import | 12500 / 55 / 420 | `1×40HC · CIF · AEJEA` |
| `SEA_LCL_EXPORT` | LCL mixed cartons | 1850 / 8.4 / 96 | `CFS Dubai · no DG` |
| `ROAD_FREIGHT` | FMCG pallets | 9200 / 28 / 22 | `DXB–RUH · Ghuwaifat` |
| `LAND` | Domestic IT pallets | 2400 / 9.5 / 12 | `DXB–AUH same day` |
| `COURIER` | Docs + samples | 12.5 / 0.08 / 2 | `Express POD signature` |
| `AIR_EXPORT` | Pharma samples | 420 / 2.1 / 8 | `DXB–FRA · CIP` |
| `NVOCC_EXPORT` | NVOCC 2×40HC | 18000 / 65 / 500 | `CRO before gate-in` |
| `WAREHOUSE` | see warehouse doc | — | — |
| `CUSTOMS_CLEARANCE` | see CC doc | — | — |

Shared portal fields: `currency_code` `AED` or `USD` as in staff quote · `valid_until` `2026-11-30` · optional `service_codes` / `customer_lines` / `estimate_snapshot` if your portal UI collects them.

---

## 9) Manual test checklist (per job type)

- [ ] Masters exist (customer, places/ports/airports, carrier, container type, charge codes)
- [ ] Staff quotation created + lines + approve
- [ ] Booking / compliance form filled with table values above
- [ ] Consent + mark complete → Complete succeeds (no “incomplete” / “not forward” errors)
- [ ] Convert to job (or NVOCC/Air invoice gate then convert — per mode rules)
- [ ] Job opens; booking GET matches what you entered
- [ ] Portal customer can see quote / booking where portal path exists

---

## 10) Index of demo docs

| Doc | Scope |
|-----|--------|
| [job-types-demo-test-data.md](./job-types-demo-test-data.md) | **This file** — FCL, LCL, Road, Land, Courier, Air & NVOCC quote/booking |
| [job-types-wrong-and-e2e-test-cases.md](./job-types-wrong-and-e2e-test-cases.md) | Wrong/negative cases + department E2E matrix for all 14 job types |
| [warehouse-video-demo-test-data.md](./warehouse-video-demo-test-data.md) | Warehouse quote + booking + WMS yard flow |
| [customs-clearance-demo-test-data.md](./customs-clearance-demo-test-data.md) | CC quote + booking + full stage rail |
| [nvocc-air-portal-api-dummy-data.md](./nvocc-air-portal-api-dummy-data.md) | NVOCC/Air API payloads, CRO, portal compliance gates |
